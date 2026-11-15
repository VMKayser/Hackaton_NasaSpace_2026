"""Mediciones de contexto de los objetivos: datos de Marte y la Luna sin equivalente medido en la Tierra.

No puntúan. tools/build_analogs.py las copia a `targets[].context` de analogs.json y la web las muestra en
«Mediciones del objetivo». Cada una se mide en el mismo círculo de 5 km que los valores de los objetivos.

Marte:
- Inercia térmica nocturna de TES (Putzig y Mellon, 2007), 20 píxeles por grado: media de los píxeles cuyo
  centro cae en el círculo. Se lee por rangos de bytes del archivo de PDS.
- Reflectores basales de radar SHARAD en depósitos lobulados (Baker y Carter, conjunto ds03 en Zenodo):
  cuántos caen en el círculo. Solo donde llega el conjunto (Deuteronilus Mensae); fuera, no se informa.
Luna (polo sur, desde 85° S):
- Iluminación solar (la mejor y la media del círculo) y sombra permanente de LOLA (Mazarico et al., 2011),
  60 m por píxel.
- Diviner, producto polar de recursos (PRP): temperatura media anual a 2 cm, máxima anual en superficie
  y parte del área donde el hielo de agua sería estable a menos de 2,9 m.

Los archivos se guardan en .cache/target_context/ (fuera de git). El de Diviner pesa 605 MB.

Uso:  pip install -r tools/requirements.txt && python tools/target_context.py
Escribe docs/valores/objetivos_contexto.json.
"""
import io
import json
import math
import struct
import sys
import urllib.request
import zipfile
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
from measure_values import TARGET_RADIUS_KM, UA, load_targets  # noqa: E402

CACHE = ROOT / ".cache/target_context"
OUT = ROOT / "docs/valores/objetivos_contexto.json"
R_KM = {"mars": 3389.5, "moon": 1737.4}

TES_URL = "https://pds-geosciences.wustl.edu/mgs/mgs-m-tes-5-timap-v1/mgst_9001/data/global_ti_night_2007.img"
TES_W, TES_H, TES_PPD = 7200, 3600, 20  # etiqueta global_ti_night_2007.lbl: MSB_INTEGER de 16 bits, −180° a 180°
DS03_URL = "https://zenodo.org/records/7753745/files/ds03.zip?download=1"
DS03_MD5 = "d3ef8cbc8bb96c1e47c27c81cba786bc"  # publicado por Zenodo
LOLA_URL = "https://pgda.gsfc.nasa.gov/data/MoonIllumination/{}.TIF"
PRP_URL = "https://pds-geosciences.wustl.edu/lro/urn-nasa-pds-lro_diviner_derived1/data_derived_prp/dlre_prp_south.tab"
PRP_BYTES = 604800210

SRC = {
    "tes": {"name": "MGS TES nighttime thermal inertia map (Putzig and Mellon, 2007)",
            "agency": "NASA PDS Geosciences Node", "url": "https://pds-geosciences.wustl.edu/missions/mgs/tes-timap.html"},
    "tes_paper": {"name": "Putzig and Mellon (2007), Apparent thermal inertia and the surface heterogeneity of Mars",
                  "agency": "Icarus", "url": "https://doi.org/10.1016/j.icarus.2007.05.013"},
    "sharad": {"name": "Baker and Carter, SHARAD reflector datasets for Deuteronilus Mensae (ds03, lobate debris aprons)",
               "agency": "NASA GSFC / University of Arizona (Zenodo)", "url": "https://doi.org/10.5281/zenodo.7753745"},
    "plaut": {"name": "Plaut et al. (2009), Radar evidence for ice in lobate debris aprons",
              "agency": "Geophysical Research Letters", "url": "https://doi.org/10.1029/2008GL036379"},
    "lola": {"name": "LOLA polar illumination maps, 85°S, 60 m (Mazarico et al., 2011)",
             "agency": "NASA GSFC PGDA", "url": "https://pgda.gsfc.nasa.gov/products/69"},
    "mazarico": {"name": "Mazarico et al. (2011), Illumination conditions of the lunar polar regions using LOLA topography",
                 "agency": "Icarus", "url": "https://doi.org/10.1016/j.icarus.2010.10.030"},
    "diviner": {"name": "LRO Diviner polar resource product, south (LRO-L-DLRE-5-PRP-V2.0)",
                "agency": "NASA PDS Geosciences Node / UCLA", "url": PRP_URL.rsplit("/", 1)[0] + "/"},
}


def item(id_, en, es, value, unit, note_en, note_es, sources):
    return {"id": id_, "label": {"en": en, "es": es}, "value": value, "unit": unit,
            "note": {"en": note_en, "es": note_es}, "sources": [SRC[s] for s in sources]}


def fetch(url, path: Path, size=None):
    """Descarga a la caché si falta o si su tamaño no coincide."""
    if path.exists() and (size is None or path.stat().st_size == size):
        return path
    CACHE.mkdir(parents=True, exist_ok=True)
    print(f"  descargando {url}", file=sys.stderr)
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=600) as r, open(path, "wb") as f:
        while chunk := r.read(1 << 20):
            f.write(chunk)
    if size is not None and path.stat().st_size != size:
        sys.exit(f"{path.name}: tamaño {path.stat().st_size}, se esperaba {size}")
    return path


def great_circle_km(lat0, lon0, lat, lon, radius_km):
    p0, p = math.radians(lat0), np.radians(lat)
    dl = np.radians(lon - lon0)
    c = np.sin(p0) * np.sin(p) + np.cos(p0) * np.cos(p) * np.cos(dl)
    return radius_km * np.arccos(np.clip(c, -1, 1))


# --- Marte ---------------------------------------------------------------------------------------
def tes_thermal_inertia(lat, lon):
    rows_needed = math.ceil(TARGET_RADIUS_KM / (R_KM["mars"] * math.pi / 180 / TES_PPD)) + 1
    r_c = int((90 - lat) * TES_PPD)
    r0, r1 = max(0, r_c - rows_needed), min(TES_H - 1, r_c + rows_needed)
    req = urllib.request.Request(TES_URL, headers={**UA, "Range": f"bytes={r0 * TES_W * 2}-{(r1 + 1) * TES_W * 2 - 1}"})
    with urllib.request.urlopen(req, timeout=120) as res:
        if res.status != 206:
            raise RuntimeError(f"PDS devolvió {res.status}")
        block = np.frombuffer(res.read(), dtype=">i2").reshape(-1, TES_W).astype(float)
    lats = 90 - (np.arange(r0, r1 + 1) + 0.5) / TES_PPD
    lons = -180 + (np.arange(TES_W) + 0.5) / TES_PPD
    la, lo = np.meshgrid(lats, lons, indexing="ij")
    d = great_circle_km(lat, lon, la, lo, R_KM["mars"])
    inside = (d <= TARGET_RADIUS_KM) & (block > 0)
    if not inside.any():  # círculo más chico que un píxel: el píxel que lo contiene
        inside = d == d.min()
    vals = block[inside]
    return round(float(vals.mean())), int(inside.sum())


def ds03_points():
    path = fetch(DS03_URL, CACHE / "ds03.zip")
    import hashlib
    if hashlib.md5(path.read_bytes()).hexdigest() != DS03_MD5:
        sys.exit("ds03.zip no coincide con la suma MD5 de Zenodo")
    with zipfile.ZipFile(path) as z:
        dbf = z.read("ds03/ds03.dbf")
    # DBF (dBase III): cabecera, descriptores de campo de 32 bytes, registros de ancho fijo.
    n, hlen, rlen = struct.unpack("<IHH", dbf[4:12])
    fields, pos = [], 32
    while dbf[pos] != 0x0D:
        name = dbf[pos:pos + 11].split(b"\0")[0].decode()
        fields.append((name, dbf[pos + 16]))
        pos += 32
    offsets, off = {}, 1
    for name, length in fields:
        offsets[name] = (off, length)
        off += length
    out = []
    for i in range(n):
        rec = dbf[hlen + i * rlen: hlen + (i + 1) * rlen]
        if rec[:1] == b"*":
            continue
        get = lambda k: float(rec[offsets[k][0]: offsets[k][0] + offsets[k][1]])
        out.append((get("LATITUDE"), get("LONGITUDE")))
    return np.array(out)


# --- Luna ----------------------------------------------------------------------------------------
def lola_maps():
    import rasterio
    maps = {}
    for name, size in (("AVGVISIB_85S_060M_201608", 33994464), ("LPSR_85S_060M_201608", 656183)):
        path = fetch(LOLA_URL.format(name), CACHE / f"{name}.TIF", size)
        ds = rasterio.open(path)
        band = ds.read(1).astype(float)
        nodata = band == ds.nodata
        band = band * ds.scales[0] + ds.offsets[0]  # escala y desplazamiento de la etiqueta del GeoTIFF
        band[nodata] = np.nan
        maps[name] = (ds, band)
    return maps


def stereo_south(lat, lon, radius_m=1737400.0):
    """Estereográfica polar sur, como el CRS de los GeoTIFF (+proj=stere +lat_0=-90 +lat_ts=-90 +lon_0=0)."""
    rho = 2 * radius_m * math.tan(math.pi / 4 + math.radians(lat) / 2)
    return rho * math.sin(math.radians(lon)), rho * math.cos(math.radians(lon))


def lola_context(maps, lat, lon):
    out = {}
    for name, (ds, band) in maps.items():
        x, y = stereo_south(lat, lon)
        row, col = ds.index(x, y)
        half = int(TARGET_RADIUS_KM * 1000 / ds.res[0]) + 1
        r0, c0 = max(0, row - half), max(0, col - half)
        win = band[r0: row + half + 1, c0: col + half + 1]
        rr, cc = np.mgrid[r0: r0 + win.shape[0], c0: c0 + win.shape[1]]
        xs, ys = ds.xy(rr.ravel(), cc.ravel())
        d = np.hypot(np.array(xs) - x, np.array(ys) - y).reshape(win.shape)
        vals = win[(d <= TARGET_RADIUS_KM * 1000) & ~np.isnan(win)]
        out[name] = (float(vals.mean()), float(vals.max()))
    return out


def diviner_prp(points):
    """Triángulos del PRP cuyo centro cae en el círculo de cada punto. Columnas según DLRE_PRP.FMT."""
    path = fetch(PRP_URL, CACHE / "dlre_prp_south.tab", PRP_BYTES)
    raw = np.frombuffer(path.read_bytes(), dtype=np.uint8).reshape(-1, 210)[1:]  # la primera fila es la cabecera

    def col(a, b):
        return np.array(raw[:, a:b].tobytes().split(), dtype=float)

    lat = col(143, 158)
    near = lat <= max(p[0] for p in points.values()) + 0.5
    raw = raw[near]
    lat, lon = lat[near], col(126, 141)
    tavg, tmax, ice = col(177, 185), col(187, 195), col(197, 208)
    out = {}
    for tid, (plat, plon) in points.items():
        inside = great_circle_km(plat, plon, lat, lon, R_KM["moon"]) <= TARGET_RADIUS_KM
        if not inside.any():
            continue
        out[tid] = {
            "n": int(inside.sum()),
            "tavg": float(tavg[inside].mean()) - 273.15,
            "tmax": float(tmax[inside].mean()) - 273.15,
            "ice": float((ice[inside] >= 0).mean()),
        }
    return out


def main():
    targets = load_targets(None)
    result = {t["id"]: [] for t in targets}

    print("Marte: inercia térmica (TES) y radar (SHARAD ds03)", file=sys.stderr)
    ds03 = ds03_points()
    lo_lat, hi_lat = ds03[:, 0].min(), ds03[:, 0].max()
    lo_lon, hi_lon = ds03[:, 1].min(), ds03[:, 1].max()
    for t in (t for t in targets if t["body"] == "mars"):
        ti, n = tes_thermal_inertia(t["lat"], t["lon"])
        result[t["id"]].append(item(
            "thermal_inertia", "Thermal inertia (TES, night)", "Inercia térmica (TES, de noche)", ti, "J m⁻² K⁻¹ s⁻½",
            f"Mean of {n} pixels of about 3 km within 5 km; some are interpolated. High: rock or compact ground; low: fine dust.",
            f"Media de {n} píxeles de unos 3 km a menos de 5 km; algunos están interpolados. Alta: roca o suelo compacto; baja: polvo fino.",
            ["tes", "tes_paper"]))
        if lo_lat <= t["lat"] <= hi_lat and lo_lon <= t["lon"] <= hi_lon:
            k = int((great_circle_km(t["lat"], t["lon"], ds03[:, 0], ds03[:, 1], R_KM["mars"]) <= TARGET_RADIUS_KM).sum())
            result[t["id"]].append(item(
                "radar_ice_reflectors", "SHARAD basal reflectors of debris aprons", "Reflectores basales SHARAD en depósitos de detritos",
                k, None,
                "Radar detections within 5 km of the base of a lobate debris apron. They indicate a body of ice under a thin debris cover (Plaut et al., 2009). The dataset covers only Deuteronilus Mensae.",
                "Detecciones de radar a menos de 5 km de la base de un depósito lobulado de detritos. Indican un cuerpo de hielo bajo una capa delgada de detritos (Plaut et al., 2009). El conjunto solo cubre Deuteronilus Mensae.",
                ["sharad", "plaut"]))
        print(f"  {t['id']}: inercia {ti} ({n} píxeles)", file=sys.stderr)

    moon = {t["id"]: (t["lat"], t["lon"]) for t in targets if t["body"] == "moon" and t["lat"] <= -85}
    if moon:
        print("Luna: iluminación (LOLA) y Diviner PRP", file=sys.stderr)
        maps = lola_maps()
        prp = diviner_prp(moon)
        for tid, (lat, lon) in moon.items():
            lola = lola_context(maps, lat, lon)
            sun_mean, sun_max = lola["AVGVISIB_85S_060M_201608"]
            shadow_mean, _ = lola["LPSR_85S_060M_201608"]
            result[tid] += [
                item("sun_visibility_max", "Best sunlight within 5 km", "Mejor iluminación a menos de 5 km",
                     round(sun_max * 100, 1), "%",
                     "Share of time the Sun is visible from the best-lit 60 m pixel within 5 km (LOLA model). The point coordinates have about 300 m of precision, too coarse to pick a single 60 m pixel.",
                     "Parte del tiempo en que se ve el Sol desde el píxel de 60 m mejor iluminado a menos de 5 km (modelo LOLA). Las coordenadas del punto tienen unos 300 m de precisión, demasiado para elegir un solo píxel de 60 m.",
                     ["lola", "mazarico"]),
                item("sun_visibility_mean", "Sunlight within 5 km", "Iluminación solar a menos de 5 km",
                     round(sun_mean * 100, 1), "%",
                     "Mean of the 60 m pixels within 5 km of the point.",
                     "Media de los píxeles de 60 m a menos de 5 km del punto.",
                     ["lola", "mazarico"]),
                item("permanent_shadow", "Area in permanent shadow", "Área en sombra permanente",
                     round(shadow_mean * 100, 1), "%",
                     "Share of the 60 m pixels within 5 km that never receive sunlight.",
                     "Parte de los píxeles de 60 m a menos de 5 km que nunca reciben luz solar.",
                     ["lola", "mazarico"]),
            ]
            if tid in prp:
                p = prp[tid]
                result[tid] += [
                    item("diviner_temp_avg", "Mean annual temperature at 2 cm", "Temperatura media anual a 2 cm",
                         round(p["tavg"], 1), "°C",
                         f"Diviner thermal model, mean of {p['n']} mesh triangles within 5 km. It is 2 cm below the surface, so it is not the same quantity as the surface temperature of the scored dimension.",
                         f"Modelo térmico de Diviner, media de {p['n']} triángulos de la malla a menos de 5 km. Es a 2 cm bajo la superficie, así que no es la misma magnitud que la temperatura de superficie de la dimensión que puntúa.",
                         ["diviner"]),
                    item("diviner_temp_max", "Maximum annual surface temperature", "Temperatura máxima anual en superficie",
                         round(p["tmax"], 1), "°C",
                         "Diviner thermal model, mean of the triangles within 5 km.",
                         "Modelo térmico de Diviner, media de los triángulos a menos de 5 km.",
                         ["diviner"]),
                    item("ice_stable_area", "Area where water ice would be stable", "Área donde el hielo de agua sería estable",
                         round(p["ice"] * 100, 1), "%",
                         "Share of the triangles within 5 km where water ice would last within 2.9 m of the surface. It is a model prediction, not a detection of ice.",
                         "Parte de los triángulos a menos de 5 km donde el hielo de agua duraría a menos de 2,9 m de la superficie. Es una predicción del modelo, no una detección de hielo.",
                         ["diviner"]),
                ]
            print(f"  {tid}: sol {sun_max:.2f} máximo y {sun_mean:.2f} medio en 5 km; Diviner {prp.get(tid)}", file=sys.stderr)

    OUT.write_text(json.dumps({k: v for k, v in result.items() if v}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Escrito {OUT.relative_to(ROOT)}", file=sys.stderr)


if __name__ == "__main__":
    main()
