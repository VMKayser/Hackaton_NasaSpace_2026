"""Relieve real de Marte para la vista 3D de Galaxy Match.

Lee los objetivos de Marte de web/public/data/analogs.json y, para cada uno, guarda una rejilla
de elevación alrededor del sitio:

- HRSC-MOLA Blended DEM Global 200 m v2 (USGS Astrogeology, ESA Mars Express HRSC + NASA MGS MOLA).
  Solo se descarga la ventana necesaria, con lecturas por rangos.
- Donde hay un DTM de mayor resolución (Mars 2020 TRN CTX DTM, 20 m, en Jezero), se usa ese,
  fundido con HRSC-MOLA en sus bordes para que no haya escalones.

Salida en web/public/terrain/mars/: un PNG por rejilla en codificación terrarium
(elevación = R*256 + G + B/256 - 32768, en metros sobre el areoide de MOLA), en una rejilla regular
de latitud y longitud planetocéntricas, y manifest.json con los límites y las fuentes.
La web convierte esas rejillas en teselas de relieve en el navegador (web/src/map/planetTerrain.ts).

Uso:  python tools/mars_terrain.py            (requiere rasterio, numpy y pillow)
"""
import json
import math
import os
import sys
from pathlib import Path

import numpy as np
import rasterio
from PIL import Image
from rasterio.windows import from_bounds

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "web/public/terrain/mars"
HALF_SPAN = 1.5  # grados alrededor del objetivo
MARS_R = 3396190.0

HRSC = {
    "url": "https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/Mars/HRSC_MOLA_Blend/Mars_HRSC_MOLA_BlendDEM_Global_200mp_v2.tif",
    "source": {
        "name": "Mars MGS MOLA - MEX HRSC Blended DEM Global 200m v2",
        "agency": "USGS Astrogeology / ESA / NASA",
        "url": "https://astrogeology.usgs.gov/search/map/mars_mgs_mola_mex_hrsc_blended_dem_global_200m",
    },
}
HIGH_RES = [
    {
        "id": "ctx-jezero",
        "url": "https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/mars2020_trn/CTX/JEZ_ctx_B_soc_008_DTM_MOLAtopography_DeltaGeoid_20m_Eqc_latTs0_lon0.tif",
        "source": {
            "name": "Mars 2020 Terrain Relative Navigation CTX DTM mosaic (20 m)",
            "agency": "USGS Astrogeology / NASA JPL",
            "url": "https://astrogeology.usgs.gov/search/map/mars_2020_terrain_relative_navigation_context_camera_digital_terrain_model",
        },
    },
]


def encode_terrarium(elev: np.ndarray, valid: np.ndarray) -> Image.Image:
    v = np.round(np.nan_to_num(elev, nan=0.0)) + 32768.0  # 1 m de precisión
    v = np.clip(v, 0, 65535)
    r = np.floor(v / 256)
    g = np.floor(v - r * 256)
    rgba = np.stack([r, g, np.zeros_like(r), np.where(valid, 255, 0)], axis=-1).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def read_hrsc(bounds):
    with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", VSI_CACHE="TRUE"):
        with rasterio.open(f"/vsicurl/{HRSC['url']}") as d:
            w = from_bounds(*bounds, d.transform).round_offsets().round_lengths()
            a = d.read(1, window=w).astype(np.float32)
            a[a == d.nodata] = np.nan
            t = d.window_transform(w)
    west, north = t.c, t.f
    east, south = west + t.a * a.shape[1], north + t.e * a.shape[0]
    return a, (west, south, east, north)


def sample_bilinear(grid, gbounds, lon, lat):
    west, south, east, north = gbounds
    h, w = grid.shape
    fx = (lon - west) / (east - west) * w - 0.5
    fy = (north - lat) / (north - south) * h - 0.5
    x0 = np.clip(np.floor(fx).astype(int), 0, w - 2)
    y0 = np.clip(np.floor(fy).astype(int), 0, h - 2)
    tx = np.clip(fx - x0, 0, 1)
    ty = np.clip(fy - y0, 0, 1)
    a, b = grid[y0, x0], grid[y0, x0 + 1]
    c, d = grid[y0 + 1, x0], grid[y0 + 1, x0 + 1]
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty


def read_high_res(spec, region_bounds, cache_dir: Path):
    path = cache_dir / Path(spec["url"]).name
    if not path.exists():
        import urllib.request
        urllib.request.urlretrieve(spec["url"], path)
    with rasterio.open(path) as d:
        a = d.read(1).astype(np.float32)
        a[(a < -1e30) | (a == d.nodata)] = np.nan
        b = d.bounds
        r = d.crs.to_dict().get("R", MARS_R)
    # Equirectangular con lat_ts = 0: la rejilla ya es regular en latitud y longitud.
    deg = 180 / (math.pi * r)
    gb = (b.left * deg, b.bottom * deg, b.right * deg, b.top * deg)
    w, s, e, n = region_bounds
    if gb[2] < w or gb[0] > e or gb[3] < s or gb[1] > n:
        return None
    return a, gb


def feather(valid: np.ndarray, width: int) -> np.ndarray:
    """Peso 0..1 que crece desde los bordes sin dato hacia el interior, en `width` píxeles."""
    dist = np.where(valid, width, 0).astype(np.float32)
    for _ in range(width):  # erosión iterativa simple
        shrunk = np.minimum.reduce([
            dist, np.roll(dist, 1, 0), np.roll(dist, -1, 0), np.roll(dist, 1, 1), np.roll(dist, -1, 1),
        ])
        dist = np.minimum(dist, shrunk + 1)
    dist[0, :] = dist[-1, :] = dist[:, 0] = dist[:, -1] = 0
    return np.clip(dist / width, 0, 1)


def main():
    analogs = json.load(open(ROOT / "web/public/data/analogs.json"))
    targets = [t for t in analogs["targets"] if t["body"] == "mars"]
    cache = Path(os.environ.get("MARS_DEM_CACHE", "/tmp"))
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {"encoding": "terrarium", "datum": "MOLA areoid", "regions": []}

    for t in targets:
        lat, lon = t["lat"], t["lon"]
        bounds = (lon - HALF_SPAN, lat - HALF_SPAN, lon + HALF_SPAN, lat + HALF_SPAN)
        print(f"{t['id']}: HRSC-MOLA {bounds}", flush=True)
        hrsc, hb = read_hrsc(bounds)
        grids = []
        name = f"{t['id']}-hrsc-mola-200m.png"
        encode_terrarium(hrsc, ~np.isnan(hrsc)).save(OUT / name, optimize=True)
        grids.append({"file": name, "bounds": [round(x, 6) for x in hb], "resolutionM": 200})
        sources = [HRSC["source"]]

        for spec in HIGH_RES:
            got = read_high_res(spec, bounds, cache)
            if not got:
                continue
            a, gb = got
            valid = ~np.isnan(a)
            h, w = a.shape
            lons = gb[0] + (np.arange(w) + 0.5) / w * (gb[2] - gb[0])
            lats = gb[3] - (np.arange(h) + 0.5) / h * (gb[3] - gb[1])
            LON, LAT = np.meshgrid(lons, lats)
            base = sample_bilinear(np.nan_to_num(hrsc, nan=np.nanmedian(hrsc)), hb, LON, LAT)
            k = feather(valid, 25)
            blended = np.where(valid, k * np.nan_to_num(a) + (1 - k) * base, np.nan)
            offset = float(np.nanmedian(a[k > 0.99] - base[k > 0.99])) if (k > 0.99).any() else 0.0
            print(f"  {spec['id']}: {a.shape}, desfase medio CTX - HRSC = {offset:.1f} m", flush=True)
            name = f"{t['id']}-{spec['id']}-20m.png"
            encode_terrarium(blended, valid).save(OUT / name, optimize=True)
            grids.append({"file": name, "bounds": [round(x, 6) for x in gb], "resolutionM": 20})
            sources.append(spec["source"])

        manifest["regions"].append({
            "targetId": t["id"], "body": "mars", "bounds": [round(x, 6) for x in hb],
            "grids": grids, "sources": sources,
            "elevationRangeM": [int(np.nanmin(hrsc)), int(np.nanmax(hrsc))],
        })

    json.dump(manifest, open(OUT / "manifest.json", "w"), indent=2, ensure_ascii=False)
    print("listo:", OUT)


if __name__ == "__main__":
    sys.exit(main())
