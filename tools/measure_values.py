"""Valores medidos de los sitios de la Tierra y de los objetivos, para el cálculo de puntajes (rol 4).

Escribe en docs/valores/:
- sitios_valores.csv: una fila por sitio de docs/catalogo-sitios.csv.
- objetivos_valores.csv: una fila por objetivo (por defecto, los de web/public/data/analogs.json).
- fuentes.json: fuentes de cada columna, en el formato de `meta.dimensions[].sources` del contrato.

Este script no calcula puntajes: solo mide. Un valor que no se puede medir queda vacío (null).

Relieve, con el mismo paso en los dos cuerpos (STEP_M, la resolución del modelo global de Marte):
- Tierra: Terrain Tiles (Mapzen, AWS Open Data), en el zoom cuyo píxel no supera el paso.
- Marte: HRSC-MOLA Blended DEM 200 m v2 (USGS). Luna: LOLA-Kaguya 59 m (USGS), entre 60° N y 60° S.
  Se leen por rangos de bytes, sin descargar el archivo completo (mismo método que web/src/map/usgsDem.ts).
- Cada sitio se mide dentro de su radio del catálogo; cada objetivo, dentro de TARGET_RADIUS_KM.
  Pendiente mediana, percentil 90 de la pendiente y rugosidad (TRI) no dependen del radio, solo del paso.

Clima:
- Tierra: NASA POWER, climatología 2001–2025 (MERRA-2, celdas de 0,5° x 0,625°).
- Marte: Mars Climate Database v6.2 (LMD/OU/IAA/ESA/CNES), escenario de clima medio, con topografía de
  alta resolución. Las medias anuales pesan cada estación por su duración real (órbita excéntrica).
- Luna: sin fuente de clima en este script; quedan vacíos.

Uso:  pip install -r tools/requirements.txt && python tools/measure_values.py [--targets objetivos.csv]
      objetivos.csv: columnas id,name,body,lat,lon (body = mars o moon).
"""
import argparse
import csv
import io
import json
import math
import re
import sys
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/valores"
CATALOG = ROOT / "docs/catalogo-sitios.csv"
ANALOGS = ROOT / "web/public/data/analogs.json"
UA = {"User-Agent": "galaxy-match-tools/1.0"}

STEP_M = 200
TARGET_RADIUS_KM = 5
RADIUS_KM = {"earth": 6371.0088, "mars": 3389.5, "moon": 1737.4}
RAD = math.pi / 180

# --- Fuentes ------------------------------------------------------------------------------------
SRC = {
    "terrain_tiles": {
        "name": "Terrain Tiles (SRTM and other sources)",
        "agency": "Mapzen / AWS Open Data",
        "url": "https://registry.opendata.aws/terrain-tiles/",
        "body": "earth",
    },
    "hrsc_mola": {
        "name": "Mars MGS MOLA - MEX HRSC Blended DEM Global 200m v2",
        "agency": "USGS Astrogeology / ESA / NASA",
        "url": "https://astrogeology.usgs.gov/search/map/mars_mgs_mola_mex_hrsc_blended_dem_global_200m",
        "body": "mars",
    },
    "lola_kaguya": {
        "name": "Moon LRO LOLA - SELENE Kaguya TC DEM Merge 60N60S 59m v1",
        "agency": "USGS Astrogeology / NASA LRO / JAXA SELENE",
        "url": "https://astrogeology.usgs.gov/search/map/moon_lro_lola_selene_kaguya_tc_dem_merge_60n60s_59m",
        "body": "moon",
    },
    "power": {
        "name": "NASA POWER Climatology 2001-2025 (MERRA-2)",
        "agency": "NASA Langley Research Center",
        "url": "https://power.larc.nasa.gov/",
        "body": "earth",
    },
    "mcd": {
        "name": "Mars Climate Database v6.2, climatology scenario",
        "agency": "LMD / OU / IAA / ESA / CNES",
        "url": "https://www-mars.lmd.jussieu.fr/",
        "body": "mars",
    },
}
COLUMNS = {
    # columna: (unidad, fuentes)
    "slope_median_deg": ("°", ["terrain_tiles", "hrsc_mola", "lola_kaguya"]),
    "slope_p90_deg": ("°", ["terrain_tiles", "hrsc_mola", "lola_kaguya"]),
    "roughness_tri_m": ("m", ["terrain_tiles", "hrsc_mola", "lola_kaguya"]),
    "surface_temp_c": ("°C", ["power", "mcd"]),
    "diurnal_range_c": ("°C", ["power", "mcd"]),
    "precip_mm_yr": ("mm/yr", ["power"]),
    "pressure_hpa": ("hPa", ["power", "mcd"]),
}
META = ["step_m", "radius_km", "coverage"]
# Contexto, no para puntuar: elevación media medida en el círculo (Tierra: sobre el nivel del mar;
# Marte: sobre el areoide de MOLA) y elevación media de la celda de NASA POWER.
CONTEXT = ["elevation_m", "climate_cell_elevation_m"]


def get(url: str, timeout: float = 120) -> bytes:
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
                return r.read()
        except Exception:
            if attempt == 2:
                raise
    raise RuntimeError("unreachable")


# --- Relieve ------------------------------------------------------------------------------------
def patch_grid(lon, lat, radius_km, body_radius_km, step_m):
    """Rejilla regular de step_m alrededor del centro (plano tangente local), con un anillo extra."""
    r = body_radius_km * 1000
    half = math.ceil(radius_km * 1000 / step_m) + 1
    idx = np.arange(-half, half + 1)
    d_lat = step_m / r / RAD
    d_lon = step_m / (r * math.cos(lat * RAD)) / RAD
    lons = lon + idx[None, :] * d_lon + 0 * idx[:, None]
    lats = lat - idx[:, None] * d_lat + 0 * idx[None, :]
    return half, lons, lats


def measure_patch(elev: np.ndarray, half: int, radius_km: float, step_m: float):
    """Pendiente mediana y p90, y TRI (media de |Δz| con los 8 vecinos), dentro del círculo."""
    size = elev.shape[0]
    j, i = np.mgrid[0:size, 0:size]
    inside = ((i - half) ** 2 + (j - half) ** 2 <= (radius_km * 1000 / step_m) ** 2)
    inside[0, :] = inside[-1, :] = inside[:, 0] = inside[:, -1] = False
    c = elev[1:-1, 1:-1]
    dzdx = (elev[1:-1, 2:] - elev[1:-1, :-2]) / (2 * step_m)
    dzdy = (elev[:-2, 1:-1] - elev[2:, 1:-1]) / (2 * step_m)
    slope = np.full(elev.shape, np.nan)
    slope[1:-1, 1:-1] = np.degrees(np.arctan(np.hypot(dzdx, dzdy)))
    diffs = [np.abs(elev[1 + dj:size - 1 + dj, 1 + di:size - 1 + di] - c)
             for dj in (-1, 0, 1) for di in (-1, 0, 1) if dj or di]
    tri = np.full(elev.shape, np.nan)
    tri[1:-1, 1:-1] = np.mean(diffs, axis=0)
    s = slope[inside]
    t = tri[inside]
    ok = np.isfinite(s) & np.isfinite(t)
    if not ok.any():
        return None
    return {
        "coverage": round(float(ok.mean()), 3),
        "slope_median_deg": round(float(np.median(s[ok])), 2),
        "slope_p90_deg": round(float(np.percentile(s[ok], 90)), 2),
        "roughness_tri_m": round(float(np.median(t[ok])), 2),
        "elevation_m": round(float(np.nanmean(elev[inside])), 0),
    }


def bilinear(grid: np.ndarray, x: np.ndarray, y: np.ndarray) -> np.ndarray:
    """Muestreo bilineal en coordenadas de píxel (centro del píxel = entero). NaN fuera o sin dato."""
    h, w = grid.shape
    x0 = np.floor(x).astype(int)
    y0 = np.floor(y).astype(int)
    fx, fy = x - x0, y - y0
    ok = (x0 >= 0) & (y0 >= 0) & (x0 + 1 < w) & (y0 + 1 < h)
    x0c, y0c = np.clip(x0, 0, w - 2), np.clip(y0, 0, h - 2)
    a, b = grid[y0c, x0c], grid[y0c, x0c + 1]
    c, d = grid[y0c + 1, x0c], grid[y0c + 1, x0c + 1]
    v = (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy
    return np.where(ok, v, np.nan)


@lru_cache(maxsize=None)
def earth_tile(z: int, x: int, y: int) -> np.ndarray:
    img = np.asarray(Image.open(io.BytesIO(get(f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"))).convert("RGB"), dtype=np.float64)
    return img[..., 0] * 256 + img[..., 1] + img[..., 2] / 256 - 32768


def earth_elevations(lons: np.ndarray, lats: np.ndarray, lat0: float) -> np.ndarray:
    """Terrain Tiles en el zoom cuyo píxel no supera STEP_M (como máximo z12)."""
    px0 = 2 * math.pi * RADIUS_KM["earth"] * 1000 * math.cos(lat0 * RAD) / 256
    z = max(0, min(12, math.ceil(math.log2(px0 / STEP_M))))
    n = 2 ** z
    s = np.sin(np.radians(lats))
    gx = (lons + 180) / 360 * n * 256 - 0.5
    gy = (0.5 - np.log((1 + s) / (1 - s)) / (4 * math.pi)) * n * 256 - 0.5
    tx0, tx1 = int(np.floor(gx.min() / 256)), int(np.floor((gx.max() + 1) / 256))
    ty0, ty1 = int(np.floor(gy.min() / 256)), int(np.floor((gy.max() + 1) / 256))
    mosaic = np.vstack([np.hstack([earth_tile(z, tx % n, ty) for tx in range(tx0, tx1 + 1)])
                        for ty in range(ty0, ty1 + 1)])
    return bilinear(mosaic, gx - tx0 * 256, gy - ty0 * 256), z


GLOBAL_DEMS = {
    # Valores de la cabecera del GeoTIFF y de la etiqueta ISIS (ver web/src/map/usgsDem.ts).
    "mars": {"url": "https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/Mars/HRSC_MOLA_Blend/Mars_HRSC_MOLA_BlendDEM_Global_200mp_v2.tif",
             "width": 106694, "height": 53347, "first_row": 854272, "row_bytes": 213388,
             "deg_per_px": 0.003374120830641, "north": 90.0, "scale": 1.0, "source": "hrsc_mola"},
    "moon": {"url": "https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/LolaKaguya_Topo/Lunar_LRO_LOLAKaguya_DEMmerge_60N60S_512ppd.tif",
             "width": 184320, "height": 61440, "first_row": 984003, "row_bytes": 368640,
             "deg_per_px": 1 / 512, "north": 60.0, "scale": 0.5, "source": "lola_kaguya"},
}


def dem_elevations(body: str, lons: np.ndarray, lats: np.ndarray) -> np.ndarray:
    dem = GLOBAL_DEMS[body]
    d = dem["deg_per_px"]
    gx = (lons + 180) / d - 0.5
    gy = (dem["north"] - lats) / d - 0.5
    r0, r1 = max(0, int(np.floor(gy.min()))), min(dem["height"] - 1, int(np.floor(gy.max())) + 1)
    c0, c1 = max(0, int(np.floor(gx.min()))), min(dem["width"] - 1, int(np.floor(gx.max())) + 1)

    def row(r):
        start = dem["first_row"] + r * dem["row_bytes"] + c0 * 2
        req = urllib.request.Request(dem["url"], headers={**UA, "Range": f"bytes={start}-{start + (c1 - c0 + 1) * 2 - 1}"})
        with urllib.request.urlopen(req, timeout=60) as res:
            if res.status != 206:
                raise RuntimeError(f"USGS DEM returned {res.status}")
            return np.frombuffer(res.read(), dtype="<i2")

    with ThreadPoolExecutor(8) as pool:
        rows = list(pool.map(row, range(r0, r1 + 1)))
    grid = np.vstack(rows).astype(np.float64)
    grid[grid == -32768] = np.nan
    return bilinear(grid * dem["scale"], gx - c0, gy - r0)


def terrain(body: str, lon: float, lat: float, radius_km: float):
    half, lons, lats = patch_grid(lon, lat, radius_km, RADIUS_KM[body], STEP_M)
    if body == "earth":
        elev, _ = earth_elevations(lons, lats, lat)
    else:
        if lats.max() > GLOBAL_DEMS[body]["north"] or lats.min() < GLOBAL_DEMS[body]["north"] - GLOBAL_DEMS[body]["height"] * GLOBAL_DEMS[body]["deg_per_px"]:
            return None
        elev = dem_elevations(body, lons, lats)
    return measure_patch(elev, half, radius_km, STEP_M)


# --- Clima --------------------------------------------------------------------------------------
DAYS = {"JAN": 31, "FEB": 28.25, "MAR": 31, "APR": 30, "MAY": 31, "JUN": 30,
        "JUL": 31, "AUG": 31, "SEP": 30, "OCT": 31, "NOV": 30, "DEC": 31}


def earth_climate(lon: float, lat: float):
    q = urllib.parse.urlencode({"parameters": "TS,TS_RANGE,PRECTOTCORR,PS", "community": "AG",
                                "longitude": lon, "latitude": lat, "format": "JSON"})
    data = json.loads(get(f"https://power.larc.nasa.gov/api/temporal/climatology/point?{q}"))
    p = data["properties"]["parameter"]
    fill = data["header"]["fill_value"]

    def ann(k):
        v = p[k]["ANN"]
        return None if v == fill else v

    precip = None
    if all(p["PRECTOTCORR"][m] != fill for m in DAYS):
        precip = round(sum(p["PRECTOTCORR"][m] * n for m, n in DAYS.items()), 0)
    ps = ann("PS")
    return {
        "climate_cell_elevation_m": round(data["geometry"]["coordinates"][2], 0),
        "surface_temp_c": ann("TS"),
        "diurnal_range_c": ann("TS_RANGE"),
        "precip_mm_yr": precip,
        "pressure_hpa": None if ps is None else round(ps * 10, 1),
    }


MARS_E = 0.0934       # excentricidad de la órbita de Marte
MARS_LS_PERI = 251.0  # Ls del perihelio (°)


def mcd_grid(var: str, lon: float, lat: float):
    """Tabla Ls x hora local de una variable de la MCD en un punto. Devuelve (ls, horas, valores)."""
    q = urllib.parse.urlencode({
        "var1": var, "var2": "none", "var3": "none", "var4": "none", "datekeyhtml": 1, "ls": "all",
        "localtime": "all", "latitude": lat, "longitude": lon, "altitude": 10.0, "zkey": 3,
        "spacecraft": "none", "isfixedlt": "off", "dust": 1, "hrkey": 1, "averaging": "off",
        "zonmean": "off", "diumean": "off", "animation": "off", "dpi": 80, "islog": "off",
        "colorm": "jet", "proj": "cyl", "iswind": "off"})
    page = get(f"https://www-mars.lmd.jussieu.fr/mcd_python/cgi-bin/mcdcgi.py?{q}", timeout=300).decode()
    m = re.search(r"txt/[0-9a-f]+\.txt", page)
    if not m:
        raise RuntimeError("MCD: no data file in response")
    text = get(f"https://www-mars.lmd.jussieu.fr/mcd_python/{m.group(0)}").decode()
    if f"Latitude {lat:.2f}" not in text and f"Latitude {abs(lat):.2f}" not in text:
        raise RuntimeError("MCD: response is not for the requested point")
    hours, ls, rows = None, [], []
    for line in text.splitlines():
        if line.startswith("----") and "||" in line:
            hours = [float(v) for v in line.split("||")[1].split()]
        elif re.match(r"^[+-]?\d+\s*\|\|", line):
            a, b = line.split("||")
            ls.append(float(a))
            rows.append([float(v) for v in b.split()])
    vals = np.array(rows)
    hours = np.array(hours)
    keep_h = hours < 24  # la hora 24 repite la 0
    keep_ls = np.array(ls) < 360
    return np.array(ls)[keep_ls], hours[keep_h], vals[np.ix_(keep_ls, keep_h)]


def mars_climate(lon: float, lat: float):
    ls, _, tsurf = mcd_grid("tsurf", lon, lat)
    _, _, ps = mcd_grid("ps", lon, lat)
    # Duración de cada intervalo de Ls: dt/dLs ∝ 1 / (1 + e·cos(Ls − Ls_perihelio))²
    w = 1 / (1 + MARS_E * np.cos(np.radians(ls - MARS_LS_PERI))) ** 2
    w /= w.sum()
    return {
        "surface_temp_c": round(float(np.sum(w * tsurf.mean(axis=1))) - 273.15, 2),
        "diurnal_range_c": round(float(np.sum(w * (tsurf.max(axis=1) - tsurf.min(axis=1)))), 2),
        # Sin precipitación líquida en la superficie de Marte actual: no es una medición (ver README).
        "precip_mm_yr": 0,
        "pressure_hpa": round(float(np.sum(w * ps.mean(axis=1))) / 100, 2),
    }


# --- Programa -----------------------------------------------------------------------------------
def load_targets(path):
    if path:
        with open(path, newline="", encoding="utf-8") as f:
            return [{"id": r["id"], "name": r["name"], "body": r["body"], "lat": float(r["lat"]), "lon": float(r["lon"])}
                    for r in csv.DictReader(f)]
    data = json.loads(ANALOGS.read_text(encoding="utf-8"))
    return [{k: t[k] for k in ("id", "name", "body", "lat", "lon")} for t in data["targets"]]


def write_csv(path: Path, rows: list, head: list):
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=head, lineterminator="\n")
        w.writeheader()
        for r in rows:
            w.writerow({k: ("" if r.get(k) is None else r.get(k)) for k in head})


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--targets", help="CSV con id,name,body,lat,lon (por defecto, los objetivos de analogs.json)")
    args = ap.parse_args()

    with open(CATALOG, newline="", encoding="utf-8") as f:
        sites = list(csv.DictReader(f))
    targets = load_targets(args.targets)
    cols = list(COLUMNS)

    def do_site(s):
        lon, lat, r = float(s["lon"]), float(s["lat"]), float(s["radius_km"])
        row = {"id": s["id"], "name": s["name"], "lat": lat, "lon": lon, "radius_km": r, "step_m": STEP_M}
        row.update(terrain("earth", lon, lat, r) or {})
        row.update(earth_climate(lon, lat))
        print(f"  {s['id']}: pendiente {row.get('slope_median_deg')}°, {row.get('surface_temp_c')} °C", file=sys.stderr)
        return row

    print(f"Sitios ({len(sites)})", file=sys.stderr)
    with ThreadPoolExecutor(4) as pool:
        site_rows = list(pool.map(do_site, sites))

    print(f"Objetivos ({len(targets)})", file=sys.stderr)
    target_rows = []
    for t in targets:
        row = {**t, "radius_km": TARGET_RADIUS_KM, "step_m": STEP_M}
        row.update(terrain(t["body"], t["lon"], t["lat"], TARGET_RADIUS_KM) or {})
        if t["body"] == "mars":
            row.update(mars_climate(t["lon"], t["lat"]))
        print(f"  {t['id']}: pendiente {row.get('slope_median_deg')}°, {row.get('surface_temp_c')} °C", file=sys.stderr)
        target_rows.append(row)

    OUT.mkdir(parents=True, exist_ok=True)
    write_csv(OUT / "sitios_valores.csv", site_rows, ["id", "name", "lat", "lon", *META, *cols, *CONTEXT])
    write_csv(OUT / "objetivos_valores.csv", target_rows, ["id", "name", "body", "lat", "lon", *META, *cols, "elevation_m"])
    sources = {c: {"unit": u, "sources": [SRC[k] for k in keys]} for c, (u, keys) in COLUMNS.items()}
    (OUT / "fuentes.json").write_text(json.dumps(sources, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Escrito en {OUT.relative_to(ROOT)}/", file=sys.stderr)


if __name__ == "__main__":
    main()
