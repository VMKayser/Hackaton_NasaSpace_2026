"""Relieve real de Marte para la vista 3D de Galaxy Match.

Lee los objetivos de Marte de web/public/data/analogs.json y, para cada uno, guarda rejillas de
elevación alrededor del sitio, de la más gruesa a la más fina:

1. HRSC-MOLA Blended DEM Global 200 m v2 (USGS Astrogeology, ESA Mars Express HRSC + NASA MGS MOLA),
   en una zona de 3° x 3°. Solo se descarga esa ventana, con lecturas por rangos.
2. Donde existe, el DTM de CTX de Mars 2020 (20 m) de USGS.
3. Donde existe, el DTM de HiRISE de Mars 2020 (1 m) de USGS, en una ventana alrededor del objetivo y
   tomando una muestra cada `step` metros para que el archivo sea manejable.

Cada rejilla fina se funde con la anterior en sus últimos píxeles (`FEATHER_PX`) para que no haya
escalones. Fuera de ese borde, los valores son los del DTM sin cambios.

Salida en web/public/terrain/mars/: un PNG por rejilla en codificación terrarium
(elevación = R*256 + G + B/256 - 32768, en metros sobre el areoide de MOLA), en una rejilla regular
de latitud y longitud planetocéntricas, y manifest.json con los límites y las fuentes.
La web convierte esas rejillas en teselas de relieve en el navegador (web/src/map/planetTerrain.ts).

Uso:  pip install -r tools/requirements.txt && python tools/mars_terrain.py
"""
import json
import math
import os
import sys
import urllib.request
from pathlib import Path

import numpy as np
import rasterio
from PIL import Image
from rasterio.enums import Resampling
from rasterio.windows import Window, from_bounds

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "web/public/terrain/mars"
HALF_SPAN = 1.5  # grados alrededor del objetivo
MARS_R = 3396190.0
FEATHER_PX = 25
S3 = "https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic"

HRSC = {
    "url": f"{S3}/Mars/HRSC_MOLA_Blend/Mars_HRSC_MOLA_BlendDEM_Global_200mp_v2.tif",
    "source": {
        "name": "Mars MGS MOLA - MEX HRSC Blended DEM Global 200m v2",
        "agency": "USGS Astrogeology / ESA / NASA",
        "url": "https://astrogeology.usgs.gov/search/map/mars_mgs_mola_mex_hrsc_blended_dem_global_200m",
    },
}
# De más gruesa a más fina.
HIGH_RES = [
    {
        "id": "ctx",
        "url": f"{S3}/mars2020_trn/CTX/JEZ_ctx_B_soc_008_DTM_MOLAtopography_DeltaGeoid_20m_Eqc_latTs0_lon0.tif",
        "download": True,  # 10 MB: se descarga entero
        "step_m": 20,
        "source": {
            "name": "Mars 2020 Terrain Relative Navigation CTX DTM mosaic (20 m)",
            "agency": "USGS Astrogeology / NASA JPL",
            "url": "https://astrogeology.usgs.gov/search/map/mars_2020_terrain_relative_navigation_context_camera_digital_terrain_model",
        },
    },
    {
        "id": "hirise",
        "url": f"{S3}/mars2020_trn/HiRISE/JEZ_hirise_soc_006_DTM_MOLAtopography_DeltaGeoid_1m_Eqc_latTs0_lon0_blend40.tif",
        "download": False,  # 1,8 GB: solo una ventana; media de bloques de step_m x step_m
        "window_km": 5,
        "step_m": 3,
        "source": {
            "name": "Mars 2020 Terrain Relative Navigation HiRISE DTM mosaic (1 m, averaged to 3 m)",
            "agency": "USGS Astrogeology / NASA JPL / University of Arizona",
            "url": "https://astrogeology.usgs.gov/search/map/mars_2020_terrain_relative_navigation_hirise_dtm_mosaic",
        },
    },
]

ENV = {"GDAL_DISABLE_READDIR_ON_OPEN": "EMPTY_DIR", "VSI_CACHE": "TRUE"}


def encode_terrarium(elev: np.ndarray, valid: np.ndarray, fractional: bool) -> Image.Image:
    """Con `fractional`, precisión de 1/256 m (canal B). Sin él, 1 m: comprime mejor, y basta a 200 m.
    En rejillas finas el redondeo a 1 m crearía terrazas falsas (1 m de salto en 3 m son 18°)."""
    v = np.nan_to_num(elev, nan=0.0) + 32768.0
    v = np.clip(v if fractional else np.round(v), 0, 65535.996)
    r = np.floor(v / 256)
    g = np.floor(v - r * 256)
    b = np.floor((v - np.floor(v)) * 256) if fractional else np.zeros_like(r)
    rgba = np.stack([r, g, b, np.where(valid, 255, 0)], axis=-1).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def read_hrsc(bounds):
    with rasterio.Env(**ENV), rasterio.open(f"/vsicurl/{HRSC['url']}") as d:
        w = from_bounds(*bounds, d.transform).round_offsets().round_lengths()
        a = d.read(1, window=w).astype(np.float32)
        a[a == d.nodata] = np.nan
        t = d.window_transform(w)
    return a, (t.c, t.f + t.e * a.shape[0], t.c + t.a * a.shape[1], t.f)


def sample(grid, gb, lon, lat):
    """Bilineal; NaN fuera de la rejilla o donde falta dato."""
    west, south, east, north = gb
    h, w = grid.shape
    fx = (lon - west) / (east - west) * w - 0.5
    fy = (north - lat) / (north - south) * h - 0.5
    inside = (fx >= 0) & (fy >= 0) & (fx <= w - 1) & (fy <= h - 1)
    x0 = np.clip(np.floor(fx).astype(int), 0, w - 2)
    y0 = np.clip(np.floor(fy).astype(int), 0, h - 2)
    tx, ty = np.clip(fx - x0, 0, 1), np.clip(fy - y0, 0, 1)
    v = (grid[y0, x0] * (1 - tx) + grid[y0, x0 + 1] * tx) * (1 - ty) + (grid[y0 + 1, x0] * (1 - tx) + grid[y0 + 1, x0 + 1] * tx) * ty
    return np.where(inside, v, np.nan)


def sample_chain(grids, lon, lat):
    """La rejilla más fina con dato en cada punto (la lista va de gruesa a fina)."""
    out = np.full(np.shape(lon), np.nan, dtype=np.float32)
    for g, gb in grids:
        v = sample(g, gb, lon, lat)
        out = np.where(np.isnan(v), out, v)
    return out


def read_rows_direct(url, d, win, k):
    """Lee las filas de la ventana con una sola petición por rangos y promedia bloques de k x k.

    El TIFF tiene una fila por bloque y sin compresión: las filas son contiguas en el archivo. Pedirlas
    una a una por /vsicurl/ son miles de peticiones; así es una sola descarga continua.
    """
    row0, row1 = int(win.row_off), int(win.row_off + win.height)
    col0, ncols = int(win.col_off), int(win.width)
    rowbytes = d.width * 4
    off0 = int(d.get_tag_item(f"BLOCK_OFFSET_0_{row0}", "TIFF", bidx=1))
    offl = int(d.get_tag_item(f"BLOCK_OFFSET_0_{row1 - 1}", "TIFF", bidx=1))
    if offl - off0 != (row1 - 1 - row0) * rowbytes:
        raise RuntimeError("Las filas no son contiguas: usar la lectura por /vsicurl/")
    ref = d.read(1, window=Window(col0, row0, ncols, 1))[0]
    out_rows, out_cols = (row1 - row0) // k, ncols // k
    out = np.empty((out_rows, out_cols), np.float32)
    req = urllib.request.Request(url, headers={"Range": f"bytes={off0}-{offl + rowbytes - 1}"})
    dtype = None
    with urllib.request.urlopen(req) as r:
        for i in range(out_rows):
            buf = r.read(rowbytes * k)
            if dtype is None:  # orden de bytes: se compara con la lectura de rasterio
                for cand in ("<f4", ">f4"):
                    if np.allclose(np.frombuffer(buf[:rowbytes], cand)[col0:col0 + ncols], ref, equal_nan=True):
                        dtype = cand
                if dtype is None:
                    raise RuntimeError("No se pudo comprobar el formato de las filas")
            block = np.frombuffer(buf, dtype).reshape(k, d.width)[:, col0:col0 + out_cols * k].astype(np.float32)
            block[(block < -1e30) | (block == d.nodata)] = np.nan
            with np.errstate(all="ignore"):
                out[i] = np.nanmean(block.reshape(k, out_cols, k), axis=(0, 2))
            if i % 300 == 0:
                print(f"    filas {i * k}/{row1 - row0}", flush=True)
    return out


def read_high_res(spec, target, region_bounds, cache: Path):
    deg_per_m = 180 / (math.pi * MARS_R)
    if spec["download"]:
        path = cache / Path(spec["url"]).name
        if not path.exists():
            urllib.request.urlretrieve(spec["url"], path)
        src = str(path)
    else:
        src = f"/vsicurl/{spec['url']}"
    with rasterio.Env(**ENV), rasterio.open(src) as d:
        r = d.crs.to_dict().get("R", MARS_R)
        deg = 180 / (math.pi * r)
        b = d.bounds
        full = (b.left * deg, b.bottom * deg, b.right * deg, b.top * deg)
        w, s, e, n = region_bounds
        if full[2] < w or full[0] > e or full[3] < s or full[1] > n:
            return None
        if spec.get("window_km"):
            half = spec["window_km"] * 1000 / 2 * deg_per_m
            box = (target["lon"] - half, target["lat"] - half, target["lon"] + half, target["lat"] + half)
            box = (max(box[0], full[0]), max(box[1], full[1]), min(box[2], full[2]), min(box[3], full[3]))
            win = from_bounds(*(x / deg for x in box), d.transform).round_offsets().round_lengths()
        else:
            win = Window(0, 0, d.width, d.height)
        k = max(1, round(spec["step_m"] / abs(d.res[0])))
        if spec["download"]:
            shape = (int(win.height // k), int(win.width // k))
            a = d.read(1, window=win, out_shape=shape, resampling=Resampling.average).astype(np.float32)
            a[(a < -1e30) | (a == d.nodata)] = np.nan
        else:
            # La ventana descargada se guarda en caché: son cientos de MB.
            cached = cache / f"{spec['id']}_{target['id']}_{spec['window_km']}km_{spec['step_m']}m.npy"
            if cached.exists():
                a = np.load(cached)
            else:
                a = read_rows_direct(spec["url"], d, win, k)
                np.save(cached, a)
        win = Window(win.col_off, win.row_off, a.shape[1] * k, a.shape[0] * k)
        t = d.window_transform(win)
    gb = (t.c * deg, (t.f + t.e * win.height) * deg, (t.c + t.a * win.width) * deg, t.f * deg)
    return a, gb


def feather(valid: np.ndarray, width: int) -> np.ndarray:
    """Peso 0..1 que crece desde los bordes sin dato hacia el interior, en `width` píxeles."""
    dist = np.where(valid, width, 0).astype(np.float32)
    dist[0, :] = dist[-1, :] = dist[:, 0] = dist[:, -1] = 0
    for _ in range(width):
        shrunk = np.minimum.reduce([dist, np.roll(dist, 1, 0), np.roll(dist, -1, 0), np.roll(dist, 1, 1), np.roll(dist, -1, 1)])
        dist = np.minimum(dist, shrunk + 1)
    return np.clip(dist / width, 0, 1)


def main():
    analogs = json.load(open(ROOT / "web/public/data/analogs.json"))
    targets = [t for t in analogs["targets"] if t["body"] == "mars"]
    cache = Path(os.environ.get("MARS_DEM_CACHE", "/tmp"))
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {"encoding": "terrarium", "datum": "MOLA areoid", "regions": []}

    for t in targets:
        bounds = (t["lon"] - HALF_SPAN, t["lat"] - HALF_SPAN, t["lon"] + HALF_SPAN, t["lat"] + HALF_SPAN)
        print(f"{t['id']}: HRSC-MOLA {bounds}", flush=True)
        hrsc, hb = read_hrsc(bounds)
        chain = [(np.where(np.isnan(hrsc), np.nanmedian(hrsc), hrsc), hb)]
        name = f"{t['id']}-hrsc-mola-200m.png"
        encode_terrarium(hrsc, ~np.isnan(hrsc), fractional=False).save(OUT / name, optimize=True)
        grids = [{"file": name, "bounds": [round(x, 6) for x in hb], "resolutionM": 200}]
        sources = [HRSC["source"]]

        for spec in HIGH_RES:
            got = read_high_res(spec, t, bounds, cache)
            if not got:
                continue
            a, gb = got
            valid = ~np.isnan(a)
            h, w = a.shape
            lons = gb[0] + (np.arange(w) + 0.5) / w * (gb[2] - gb[0])
            lats = gb[3] - (np.arange(h) + 0.5) / h * (gb[3] - gb[1])
            base = sample_chain(chain, *np.meshgrid(lons, lats))
            k = feather(valid, FEATHER_PX)
            inner = (k > 0.99) & ~np.isnan(base)
            offset = float(np.nanmedian(a[inner] - base[inner])) if inner.any() else 0.0
            blended = np.where(valid, k * np.nan_to_num(a) + (1 - k) * np.nan_to_num(base, nan=0), np.nan)
            print(f"  {spec['id']}: {a.shape}, desfase mediano con la rejilla anterior = {offset:.1f} m", flush=True)
            name = f"{t['id']}-{spec['id']}-{spec['step_m']}m.png"
            encode_terrarium(blended, valid, fractional=spec["step_m"] < 50).save(OUT / name, optimize=True)
            grids.append({"file": name, "bounds": [round(x, 6) for x in gb], "resolutionM": spec["step_m"]})
            sources.append(spec["source"])
            chain.append((blended, gb))

        manifest["regions"].append({
            "targetId": t["id"], "body": "mars", "bounds": [round(x, 6) for x in hb],
            "grids": grids, "sources": sources,
            "elevationRangeM": [int(np.nanmin(hrsc)), int(np.nanmax(hrsc))],
        })

    json.dump(manifest, open(OUT / "manifest.json", "w"), indent=2, ensure_ascii=False)
    print("listo:", OUT)


if __name__ == "__main__":
    sys.exit(main())
