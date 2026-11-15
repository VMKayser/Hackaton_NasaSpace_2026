"""Relieve real del polo sur de la Luna para la vista 3D de Galaxy Match.

MapLibre dibuja en Web Mercator, que no pasa de 85°, y el modelo global de USGS que lee la web solo cubre de
60° N a 60° S. Los objetivos del polo sur (regiones candidatas de Artemis III) quedan fuera de los dos.

Esta herramienta lee el modelo polar de LOLA (LDEM_85S_40M: 40 m por píxel, proyección polar
estereográfica, de 85° S al polo; NASA GSFC, PDS Geosciences Node) y, para cada objetivo lunar al sur de
85° S de web/public/data/analogs.json, guarda dos rejillas en un **marco local**: el plano estereográfico
alrededor del objetivo, reubicado en torno a (0°, 0°) con la misma distancia en metros por grado que la
superficie real. Así la vista 3D lo muestra a escala real. Arriba del marco es la dirección del meridiano 0°.

- Detalle: ±15 km a 40 m. Contexto: ±90 km a 200 m (media de bloques de 5 x 5 píxeles).
- Elevación en metros sobre la esfera de 1737,4 km, como el modelo global de la web.
- La conversión entre el marco y la superficie real está en web/src/lib/polarFrame.ts.

Salida en web/public/terrain/moon/: PNG en codificación terrarium y manifest.json con `frame` por región.

Uso:  python tools/moon_polar.py   (descarga 115 MB la primera vez, en tools/.cache/)
"""
import json
import math
import sys
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
ANALOGS = ROOT / "web/public/data/analogs.json"
OUT = ROOT / "web/public/terrain/moon"
CACHE = ROOT / "tools/.cache/ldem_85s_40m.img"
URL = "https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr/polar/img/ldem_85s_40m.img"
SOURCE = {
    "name": "LRO LOLA Polar DEM LDEM_85S_40M (40 m, south polar stereographic)",
    "agency": "NASA GSFC LOLA team / PDS Geosciences Node",
    "url": "https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr/polar/",
}
N = 7584           # líneas y muestras del producto
SCALE_M = 40.0     # metros por píxel, exacto en el polo
DN_M = 0.5         # metros por unidad
R_M = 1737400.0
MIN_LAT = -85.0    # cobertura del producto
GRIDS = [          # (nombre, media distancia en km, metros por píxel)
    ("detail", 15, 40),
    ("context", 90, 200),
]


def stereo(lat: float, lon: float) -> tuple[float, float]:
    """x hacia 90° E, y hacia el meridiano 0° (arriba en la imagen), en metros. Igual que polarFrame.ts."""
    r = 2 * R_M * math.tan(math.radians(90 - abs(lat)) / 2)
    return r * math.sin(math.radians(lon)), r * math.cos(math.radians(lon))


def encode_terrarium(elev: np.ndarray, valid: np.ndarray, fractional: bool) -> Image.Image:
    v = np.nan_to_num(elev, nan=0.0) + 32768.0
    v = np.clip(v if fractional else np.round(v), 0, 65535.996)
    r = np.floor(v / 256)
    g = np.floor(v - r * 256)
    b = np.floor((v - np.floor(v)) * 256) if fractional else np.zeros_like(r)
    rgba = np.stack([r, g, b, np.where(valid, 255, 0)], axis=-1).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def main():
    if not CACHE.exists():
        CACHE.parent.mkdir(parents=True, exist_ok=True)
        print("Descargando LDEM_85S_40M (115 MB)…", file=sys.stderr)
        urllib.request.urlretrieve(URL, CACHE)
    dem = np.fromfile(CACHE, dtype="<i2").reshape(N, N).astype(np.float32) * DN_M
    coarse = {40: dem, 200: dem.reshape(N // 5, 5, N // 5, 5).mean(axis=(1, 3)) if N % 5 == 0 else None}
    if coarse[200] is None:
        n5 = N // 5 * 5
        coarse[200] = dem[:n5, :n5].reshape(n5 // 5, 5, n5 // 5, 5).mean(axis=(1, 3))

    targets = [t for t in json.loads(ANALOGS.read_text(encoding="utf-8"))["targets"] if t["body"] == "moon" and t["lat"] <= MIN_LAT]
    OUT.mkdir(parents=True, exist_ok=True)
    deg_per_m = 180 / (math.pi * R_M)
    manifest = {"encoding": "terrarium", "datum": "sphere of 1737.4 km", "regions": []}
    for t in targets:
        x0, y0 = stereo(t["lat"], t["lon"])
        grids = []
        lo, hi = math.inf, -math.inf
        for name, half_km, res in GRIDS:
            src = coarse[res]
            k = res / SCALE_M                       # píxeles del producto por píxel de la fuente
            half = int(round(half_km * 1000 / res))
            size = 2 * half + 1
            offs = (np.arange(size) - half) * res   # metros desde el centro
            ex, ny = np.meshgrid(offs, -offs)       # filas de norte a sur
            x, y = x0 + ex, y0 + ny
            # Posición en la fuente: columna = x / escala + N/2 − 0,5 (en píxeles del producto), fila con y hacia arriba.
            col = (x / SCALE_M + N / 2 - 0.5 - (k - 1) / 2) / k
            row = (-y / SCALE_M + N / 2 - 0.5 - (k - 1) / 2) / k
            inside = (col >= 0) & (row >= 0) & (col <= src.shape[1] - 1) & (row <= src.shape[0] - 1)
            elev = ndimage.map_coordinates(src, [row, col], order=1, mode="nearest").astype(np.float64)
            elev[~inside] = np.nan
            lo, hi = min(lo, float(np.nanmin(elev))), max(hi, float(np.nanmax(elev)))
            edge = (half + 0.5) * res * deg_per_m
            bounds = [round(-edge, 8), round(-edge, 8), round(edge, 8), round(edge, 8)]
            file = f"{t['id']}-lola-{res}m.png"
            encode_terrarium(elev, inside, fractional=res < 50).save(OUT / file, optimize=True)
            grids.append({"file": file, "bounds": bounds, "resolutionM": res})
            print(f"{t['id']}: {name} {size}x{size} a {res} m, cobertura {inside.mean():.0%}", file=sys.stderr)
        manifest["regions"].append({
            "targetId": t["id"],
            "body": "moon",
            "bounds": grids[-1]["bounds"],
            "grids": grids,
            "sources": [SOURCE],
            "elevationRangeM": [int(math.floor(lo)), int(math.ceil(hi))],
            "frame": {"type": "south-polar-stereographic", "lat": t["lat"], "lon": t["lon"], "x0": round(x0, 3), "y0": round(y0, 3)},
        })
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Escrito {OUT.relative_to(ROOT)}/manifest.json con {len(targets)} regiones", file=sys.stderr)


if __name__ == "__main__":
    main()
