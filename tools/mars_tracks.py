"""Ruta real de rovers para la vista 3D de Galaxy Match.

Descarga la travesía y las paradas de Perseverance (Mars 2020) que publica NASA/JPL en MMGIS, la
simplifica para la web y la anota en web/public/terrain/mars/manifest.json, en la región del objetivo
que contiene el punto de partida. Ejecutar después de tools/mars_terrain.py.

- La línea se simplifica con Douglas-Peucker (tolerancia TOLERANCE_M en metros sobre Marte).
- Las paradas conservan el sol, la elevación y la actitud del rover (cabeceo y alabeo).

Uso:  python tools/mars_tracks.py
"""
import json
import math
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "web/public/terrain/mars"
MARS_R = 3396190.0
TOLERANCE_M = 2.0

TRACKS = [
    {
        "id": "perseverance",
        "name": "Perseverance (Mars 2020)",
        "traverse": "https://mars.nasa.gov/mmgis-maps/M20/Layers/json/M20_traverse.json",
        "waypoints": "https://mars.nasa.gov/mmgis-maps/M20/Layers/json/M20_waypoints.json",
        "source": {
            "name": "Mars 2020 rover traverse and waypoints (MMGIS)",
            "agency": "NASA / JPL-Caltech",
            "url": "https://science.nasa.gov/mission/mars-2020-perseverance/location-map/",
        },
    },
]


def fetch(url):
    with urllib.request.urlopen(url, timeout=120) as r:
        return json.load(r)


def to_xy(lon, lat, lat0):
    k = math.pi / 180 * MARS_R
    return lon * k * math.cos(math.radians(lat0)), lat * k


def simplify(points, tol, lat0):
    """Douglas-Peucker iterativo sobre coordenadas locales en metros."""
    xy = [to_xy(p[0], p[1], lat0) for p in points]
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        a, b = stack.pop()
        (ax, ay), (bx, by) = xy[a], xy[b]
        dx, dy = bx - ax, by - ay
        norm = math.hypot(dx, dy) or 1e-9
        best, idx = 0.0, -1
        for i in range(a + 1, b):
            px, py = xy[i]
            d = abs(dy * (px - ax) - dx * (py - ay)) / norm if norm > 1e-6 else math.hypot(px - ax, py - ay)
            if d > best:
                best, idx = d, i
        if best > tol and idx > 0:
            keep[idx] = True
            stack += [(a, idx), (idx, b)]
    return [p for p, k in zip(points, keep) if k]


def main():
    manifest = json.load(open(OUT / "manifest.json"))
    for spec in TRACKS:
        trav = fetch(spec["traverse"])
        ways = fetch(spec["waypoints"])
        drives = sorted(trav["features"], key=lambda f: (f["properties"]["sol"], f["properties"]["SCLK_START"]))
        points = []
        for f in drives:
            g = f["geometry"]
            lines = [g["coordinates"]] if g["type"] == "LineString" else g["coordinates"]
            for line in lines:
                for p in line:
                    if not points or (p[0], p[1]) != (points[-1][0], points[-1][1]):
                        points.append([p[0], p[1], p[2] if len(p) > 2 else None])
        start = points[0]
        region = next((r for r in manifest["regions"]
                       if r["bounds"][0] <= start[0] <= r["bounds"][2] and r["bounds"][1] <= start[1] <= r["bounds"][3]), None)
        if not region:
            print(f"{spec['id']}: ninguna región contiene el punto de partida")
            continue
        line = simplify(points, TOLERANCE_M, start[1])
        stops = []
        tilts = []
        for f in sorted(ways["features"], key=lambda f: f["properties"]["sol"]):
            p = f["properties"]
            pitch, roll = p.get("pitch"), p.get("roll")
            if pitch is not None and roll is not None:
                tilts.append(math.degrees(math.acos(math.cos(math.radians(pitch)) * math.cos(math.radians(roll)))))
            stops.append({
                "type": "Feature",
                "properties": {"sol": p["sol"], "pitch": pitch, "roll": roll},
                "geometry": {"type": "Point", "coordinates": [round(p["lon"], 7), round(p["lat"], 7), round(p["elev_geoid"], 2)]},
            })
        geo = {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "properties": {"kind": "traverse"},
                "geometry": {"type": "LineString", "coordinates": [[round(x, 7), round(y, 7), None if z is None else round(z, 2)] for x, y, z in line]},
            }] + stops,
        }
        name = f"{region['targetId']}-{spec['id']}.geojson"
        json.dump(geo, open(OUT / name, "w"), separators=(",", ":"))
        length_km = sum(f["properties"]["length"] for f in drives) / 1000
        region["tracks"] = [t for t in region.get("tracks", []) if t["id"] != spec["id"]] + [{
            "id": spec["id"],
            "name": spec["name"],
            "file": name,
            "sols": [drives[0]["properties"]["sol"], drives[-1]["properties"]["sol"]],
            "lengthKm": round(length_km, 2),
            "maxTiltDeg": round(max(tilts), 1) if tilts else None,
            "medianTiltDeg": round(sorted(tilts)[len(tilts) // 2], 1) if tilts else None,
            "source": spec["source"],
        }]
        print(f"{spec['id']}: {len(points)} -> {len(line)} puntos, {len(stops)} paradas, {length_km:.2f} km, región {region['targetId']}")
    json.dump(manifest, open(OUT / "manifest.json", "w"), indent=2, ensure_ascii=False)


if __name__ == "__main__":
    sys.exit(main())
