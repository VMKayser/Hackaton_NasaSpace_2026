"""Relieve de la malla del Altiplano para buscar lugares nuevos desde un pin de Marte o la Luna.

Lee los puntos ya medidos por tools/discover.py (docs/valores/malla_puntos.csv: pendiente mediana,
percentil 90 de la pendiente y rugosidad en un círculo de 2 km con paso de 200 m, Terrain Tiles) y escribe
web/public/data/grid.json con solo esas mediciones de relieve, el país y el sitio del catálogo más cercano.

- País: polígonos de Natural Earth 1:50m (dominio público). Solo se guardan los puntos de COUNTRY, como en
  discover.py. Un punto a pocos kilómetros de la frontera puede quedar del lado equivocado.
- Nombres: los de OpenStreetMap que discover.py ya guardó en docs/valores/malla_lugares.json, si los hay.

La web compara el pin con estos puntos con la misma escala y los mismos pesos de relieve que los sitios
(web/src/lib/terrainMatch.ts). No puntúa nada aquí.

Uso:  python tools/grid_relief.py
"""
import csv
import json
import math
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from matplotlib.path import Path as Polygon

ROOT = Path(__file__).resolve().parents[1]
POINTS_CSV = ROOT / "docs/valores/malla_puntos.csv"
PLACES = ROOT / "docs/valores/malla_lugares.json"
ANALOGS = ROOT / "web/public/data/analogs.json"
OUT = ROOT / "web/public/data/grid.json"
CACHE = ROOT / "tools/.cache/ne_50m_admin_0_countries.geojson"
NE_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_admin_0_countries.geojson"
COUNTRY = "Bolivia"
MEASURES = ["slope_median_deg", "slope_p90_deg", "roughness_tri_m"]
EARTH_KM = 6371.0088


def country_polygons(name: str) -> list[Polygon]:
    if not CACHE.exists():
        CACHE.parent.mkdir(parents=True, exist_ok=True)
        req = urllib.request.Request(NE_URL, headers={"User-Agent": "galaxy-match-tools/1.0"})
        with urllib.request.urlopen(req, timeout=120) as r:
            CACHE.write_bytes(r.read())
    data = json.loads(CACHE.read_text(encoding="utf-8"))
    feature = next(f for f in data["features"] if f["properties"].get("NAME") == name)
    geom = feature["geometry"]
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    # Solo el anillo exterior: Bolivia no tiene huecos en esta escala.
    return [Polygon(np.array(p[0])) for p in polys]


def km(lat1, lon1, lat2, lon2):
    p1, p2 = math.radians(lat1), math.radians(lat2)
    a = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(math.radians(lon2 - lon1) / 2) ** 2
    return 2 * EARTH_KM * math.asin(math.sqrt(a))


def main():
    with open(POINTS_CSV, newline="", encoding="utf-8") as f:
        grid_meta = json.loads(f.readline()[2:])
        rows = list(csv.DictReader(f))
    places = json.loads(PLACES.read_text(encoding="utf-8")) if PLACES.exists() else {}
    sites = json.loads(ANALOGS.read_text(encoding="utf-8"))["sites"]
    polys = country_polygons(COUNTRY)

    points = []
    for r in rows:
        lat, lon = float(r["lat"]), float(r["lon"])
        if not any(p.contains_point((lon, lat)) for p in polys):
            continue
        if any(r[m] == "" for m in MEASURES) or float(r["coverage"] or 0) < 0.95:
            continue
        near = min(sites, key=lambda s: km(lat, lon, s["lat"], s["lon"]))
        key = f"{lat:g},{lon:g}"
        pl = {k: v for k, v in places.get(key, {}).items() if k in ("feature", "municipality", "province", "department") and v}
        points.append({
            "lat": lat,
            "lon": lon,
            "values": {m: round(float(r[m]), 2) for m in MEASURES},
            "elevationM": None if r["elevation_m"] == "" else round(float(r["elevation_m"])),
            "nearestSite": {"id": near["id"], "km": round(km(lat, lon, near["lat"], near["lon"]), 1)},
            **({"place": pl} if pl else {}),
        })

    out = {
        "meta": {
            "generated": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
            "country": COUNTRY,
            "bbox": grid_meta["bbox"],
            "stepDeg": grid_meta["stepDeg"],
            "radiusKm": grid_meta["radiusKm"],
            "stepM": 200,
            "measures": MEASURES,
            "sources": [
                {"name": "Terrain Tiles (SRTM and other sources)", "agency": "Mapzen / AWS Open Data", "url": "https://registry.opendata.aws/terrain-tiles/"},
                {"name": "Natural Earth 1:50m Admin 0 – Countries", "agency": "Natural Earth", "url": "https://www.naturalearthdata.com/"},
                {"name": "OpenStreetMap (place names, Overpass API)", "agency": "OpenStreetMap contributors", "url": "https://www.openstreetmap.org/copyright"},
            ],
        },
        "points": points,
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Escrito {OUT.relative_to(ROOT)}: {len(points)} de {len(rows)} puntos en {COUNTRY}", file=sys.stderr)


if __name__ == "__main__":
    main()
