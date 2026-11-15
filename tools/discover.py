"""Descubrimiento de lugares nuevos: mide una malla de puntos del Altiplano boliviano con el mismo método
que los sitios del catálogo y busca los más parecidos a cada objetivo que no están en el catálogo.

Para cada punto de la malla (cada STEP_DEG grados, unos 11 km):
- relieve en un círculo de RADIUS_KM con paso de 200 m (Terrain Tiles), como tools/measure_values.py;
- clima de la celda de NASA POWER que lo contiene (climatología 2001-2025, consulta por región);
- entorno geológico a partir de la unidad del mapa geológico de Sudamérica 1:5 000 000 (CGMW, vía
  Macrostrat), con la regla de SETTING_RULES. Ese mapa no distingue campos geotérmicos: la malla no puede
  proponer sitios hidrotermales.

Puntajes: los de tools/build_analogs.py (misma escala, mismas fórmulas y mismos pesos), leídos de
web/public/data/analogs.json. Un candidato es «nuevo» si está a más de NEAR_CATALOG_KM de todo sitio del
catálogo y no cae dentro de un lugar con el nombre de un sitio del catálogo (OpenStreetMap). Entre
candidatos se exige MIN_SEPARATION_KM para que sean lugares distintos.

Solo se proponen lugares en COUNTRY (según OpenStreetMap). No se proponen lugares para un objetivo o
propósito cuando la malla no puede distinguirlos (ver `skip_reason`): si su entorno geológico no se puede
leer en el mapa, o si demasiados puntos empatan arriba.

Escribe web/public/data/discoveries.json, docs/valores/descubrimiento.csv (candidatos),
docs/valores/malla_puntos.csv (todos los puntos medidos) y docs/valores/malla_lugares.json (nombres de
OpenStreetMap ya consultados). Si malla_puntos.csv existe con la misma malla, no se vuelve a medir.
Uso:  python tools/discover.py [--remeasure]
"""
import csv
import json
import math
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import measure_values as mv  # noqa: E402
from build_analogs import dim_score, weighted  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
ANALOGS = ROOT / "web/public/data/analogs.json"
OUT = ROOT / "web/public/data/discoveries.json"
CSV_OUT = ROOT / "docs/valores/descubrimiento.csv"
POINTS_CSV = ROOT / "docs/valores/malla_puntos.csv"
PLACES_JSON = ROOT / "docs/valores/malla_lugares.json"
GEOLOGY_JSON = ROOT / "docs/valores/malla_geologia.json"


def point_id(lat: float, lon: float) -> str:
    """Identificador estable para un punto de la malla."""
    return f"grid_{round(lat, 4):g}_{round(lon, 4):g}"


def _load_geology_cache() -> dict:
    if GEOLOGY_JSON.exists():
        return json.loads(GEOLOGY_JSON.read_text(encoding="utf-8"))
    return {}


def macrostrat_detail(lat: float, lon: float, map_unit: str | None, cache: dict) -> dict | None:
    """Obtiene litología, edad y descripción desde Macrostrat (cacheado por coordenada)."""
    key = f"{round(lat, 4):g},{round(lon, 4):g}"
    if key not in cache:
        info = None
        try:
            url = f"https://macrostrat.org/api/v2/geologic_units/map?lat={lat:.4f}&lng={lon:.4f}"
            req = urllib.request.Request(url, headers={"User-Agent": "GalaxyMatch/2.2"})
            with urllib.request.urlopen(req, timeout=20) as resp:
                units = json.loads(resp.read().decode("utf-8")).get("success", {}).get("data") or []
            if units:
                u = next((x for x in units if x.get("name") == map_unit), units[0])
                info = {
                    "name": u.get("name") or map_unit or "",
                    "lith": (u.get("lith") or "").strip() or None,
                    "age": (u.get("best_int_name") or u.get("t_int_name") or "").strip() or None,
                    "descrip": (u.get("descrip") or "").strip() or None,
                    "url": f"https://macrostrat.org/map/#/z=8/lat={lat:.4f}/lng={lon:.4f}",
                }
        except Exception:
            info = None
        if info is not None:
            cache[key] = info
    return cache.get(key)
COUNTRY = "Bolivia"
# Empate: si más de TIE_MAX puntos quedan a menos de TIE_DELTA del mejor, la malla no distingue lugares.
TIE_DELTA = 0.01
TIE_MAX = 50

BBOX = (-69.0, -23.0, -65.5, -17.5)  # oeste, sur, este, norte: Altiplano y Lípez
STEP_DEG = 0.1
RADIUS_KM = 2.0  # el radio menor del catálogo
NEAR_CATALOG_KM = 10.0
MIN_SEPARATION_KM = 15.0
TOP = 10
VALIDATION_TOP = 20

# Unidad del mapa geológico → entorno. Solo litologías del propio mapa; lo demás queda sin dato.
SETTING_RULES = [
    (("evaporite",), "lacustrine"),
    (("andesite", "rhyolite", "basalt", "dacite", "volcanic"), "volcanic"),
    (("siliciclastic", "carbonate", "limestone", "sedimentary"), "sedimentary"),
]

UA = {"User-Agent": "galaxy-match-tools/1.0"}


def km(lat1, lon1, lat2, lon2):
    p1, p2 = math.radians(lat1), math.radians(lat2)
    a = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(math.radians(lon2 - lon1) / 2) ** 2
    return 2 * mv.RADIUS_KM["earth"] * math.asin(math.sqrt(a))


def fold(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn").lower()


def power_cells():
    """Celdas de la climatología de NASA POWER que cubren la malla. La consulta por región admite un
    parámetro por vez."""
    w, s, e, n = BBOX
    per = {}
    fill = -999
    for param in ("TS", "TS_RANGE", "PRECTOTCORR", "PS"):
        q = urllib.parse.urlencode({"parameters": param, "community": "AG", "latitude-min": s, "latitude-max": n,
                                    "longitude-min": w, "longitude-max": e, "format": "JSON"})
        data = json.loads(mv.get(f"https://power.larc.nasa.gov/api/temporal/climatology/regional?{q}", timeout=300))
        fill = data.get("header", {}).get("fill_value", fill) if isinstance(data.get("header"), dict) else fill
        for f in data["features"]:
            lon, lat = f["geometry"]["coordinates"][:2]
            per.setdefault((round(lat, 4), round(lon, 4)), {})[param] = f["properties"]["parameter"][param]
    cells = []
    for (lat, lon), p in per.items():
        if len(p) < 4:
            continue
        ann = lambda k: None if p[k]["ANN"] == fill else p[k]["ANN"]  # noqa: E731
        precip = None
        if all(p["PRECTOTCORR"][m] != fill for m in mv.DAYS):
            precip = round(sum(p["PRECTOTCORR"][m] * d for m, d in mv.DAYS.items()), 0)
        ps = ann("PS")
        cells.append((lat, lon, {"surface_temp_c": ann("TS"), "diurnal_range_c": ann("TS_RANGE"),
                                 "precip_mm_yr": precip, "pressure_hpa": None if ps is None else round(ps * 10, 1)}))
    return cells


def macrostrat(lat, lon):
    order = {"large": 0, "medium": 1, "small": 2, "tiny": 3}
    for attempt in range(3):
        try:
            d = json.loads(mv.get(f"https://macrostrat.org/api/v2/geologic_units/map?lat={lat:.4f}&lng={lon:.4f}", timeout=60))
            units = sorted(d["success"]["data"], key=lambda u: order.get(u.get("scale"), 9))
            return (units[0]["name"], units[0].get("lith") or "") if units else (None, "")
        except Exception:
            time.sleep(2)
    return None, ""


def setting_from(lith: str):
    low = lith.lower()
    for keys, setting in SETTING_RULES:
        if any(k in low for k in keys):
            return setting
    return None


def place_of(lat, lon):
    """Nombre del lugar en OpenStreetMap: área natural con nombre que lo contiene, cumbre cercana o municipio."""
    q = f"""[out:json][timeout:25];
is_in({lat},{lon})->.a;
area.a[name]->.all;
.all out tags;
node(around:3000,{lat},{lon})[natural~"^(volcano|peak)$"][name];
out tags 1;"""
    for attempt in range(3):
        try:
            req = urllib.request.Request("https://overpass-api.de/api/interpreter",
                                         data=urllib.parse.urlencode({"data": q}).encode(), headers=UA)
            els = json.loads(urllib.request.urlopen(req, timeout=60).read())["elements"]
            break
        except Exception:
            time.sleep(5)
    else:
        return nominatim_place(lat, lon)
    out = {}
    for e in els:
        tg = e.get("tags", {})
        name = tg.get("name")
        if e["type"] == "node":
            out.setdefault("peak", name)
        elif tg.get("natural") in ("wetland", "water", "salt_flat", "desert", "sand", "bare_rock") or tg.get("water") or tg.get("landuse") == "salt_pond":
            out.setdefault("feature", name)
        elif tg.get("boundary") == "protected_area" or tg.get("leisure") == "nature_reserve":
            out.setdefault("protected", name)
        elif tg.get("admin_level") == "8":
            out.setdefault("municipality", name)
        elif tg.get("admin_level") == "6":
            out.setdefault("province", name)
        elif tg.get("admin_level") == "4":
            out.setdefault("department", name)
        elif tg.get("admin_level") == "2":
            out.setdefault("country", name)
    time.sleep(1.0)
    return out


POINT_COLS = ["lat", "lon", "coverage", "slope_median_deg", "slope_p90_deg", "roughness_tri_m", "elevation_m",
              "surface_temp_c", "diurnal_range_c", "precip_mm_yr", "pressure_hpa", "map_unit", "setting"]


def load_points(grid_meta):
    if not POINTS_CSV.exists():
        return None
    with open(POINTS_CSV, newline="", encoding="utf-8") as f:
        first = f.readline().strip()
        if first != "# " + json.dumps(grid_meta, sort_keys=True):
            return None
        rows = list(csv.DictReader(f))
    num = lambda v: None if v == "" else float(v)  # noqa: E731
    return [{k: (r[k] or None) if k in ("map_unit", "setting") else num(r[k]) for k in POINT_COLS} for r in rows]


def save_points(grid_meta, points):
    with open(POINTS_CSV, "w", newline="", encoding="utf-8") as f:
        f.write("# " + json.dumps(grid_meta, sort_keys=True) + "\n")
        w = csv.DictWriter(f, fieldnames=POINT_COLS, lineterminator="\n", extrasaction="ignore")
        w.writeheader()
        for p in points:
            w.writerow({k: "" if p.get(k) is None else p[k] for k in POINT_COLS})


def skip_reason(target, weights, ranked, geo, producible):
    """Motivo para no proponer lugares, o None. Texto bilingüe."""
    if geo and weights.get(geo["id"], 0) > 0:
        setting = target["values"].get(geo["id"], {}).get("value")
        if setting and not set(str(setting).split("+")) & producible:
            label = geo.get("categories", {}).get(setting, {"en": setting, "es": setting})
            return {"es": f"El entorno geológico de este objetivo ({label['es'].lower()}) no se puede leer en el mapa geológico 1:5 000 000 que usa la malla.",
                    "en": f"This target's geological setting ({label['en'].lower()}) cannot be read from the 1:5,000,000 geological map that the grid uses."}
    if len(ranked) > TIE_MAX:
        best = ranked[0][0]
        ties = sum(1 for r in ranked if r[0] >= best - TIE_DELTA)
        if ties > TIE_MAX:
            return {"es": f"{ties} puntos de la malla quedan a menos de un punto porcentual del mejor: con estas dimensiones la malla no distingue lugares.",
                    "en": f"{ties} grid points are within one percentage point of the best: with these dimensions the grid cannot tell places apart."}
    return None


def nominatim_place(lat, lon):
    """Respaldo cuando Overpass no responde: municipio, provincia, departamento y país (Nominatim)."""
    q = urllib.parse.urlencode({"format": "json", "lat": lat, "lon": lon, "zoom": 10, "accept-language": "es"})
    for attempt in range(3):
        try:
            a = json.loads(mv.get(f"https://nominatim.openstreetmap.org/reverse?{q}", timeout=60)).get("address", {})
            time.sleep(1.1)
            return {k: v for k, v in {"municipality": a.get("city") or a.get("town") or a.get("village") or a.get("municipality"),
                                       "province": a.get("county"), "department": a.get("state"),
                                       "country": a.get("country")}.items() if v}
        except Exception:
            time.sleep(3)
    return {}


def main():
    data = json.loads(ANALOGS.read_text(encoding="utf-8"))
    dims = data["meta"]["dimensions"]
    by_measure = {d["measure"]: d for d in dims if d.get("measure")}
    geo = next((d for d in dims if d["id"] == "geology"), None)
    sites, targets = data["sites"], data["targets"]
    min_cov = data["meta"].get("minCoverage")

    # Escalas: las mismas que tools/build_analogs.py.
    scales = {}
    for d in dims:
        if d.get("categories"):
            continue
        e = [s["values"][d["id"]]["value"] for s in sites if isinstance(s["values"][d["id"]]["value"], (int, float))]
        t = [x["values"][d["id"]]["value"] for x in targets if isinstance(x["values"][d["id"]]["value"], (int, float))]
        if e and t:
            lo, hi = np.percentile(e, [5, 95])
            lo, hi = min(lo, min(t)), max(hi, max(t))
            scales[d["id"]] = float(hi - lo) if hi > lo else None

    w, s, e, n = BBOX
    lats = np.round(np.arange(n, s - 1e-9, -STEP_DEG), 4)
    lons = np.round(np.arange(w, e + 1e-9, STEP_DEG), 4)
    grid = [(float(la), float(lo)) for la in lats for lo in lons]
    print(f"Malla: {len(grid)} puntos", file=sys.stderr)

    grid_meta = {"bbox": list(BBOX), "stepDeg": STEP_DEG, "radiusKm": RADIUS_KM}
    points = None if "--remeasure" in sys.argv else load_points(grid_meta)
    if points is None:
        cells = power_cells()
        print(f"NASA POWER: {len(cells)} celdas", file=sys.stderr)

    def measure(pt):
        la, lo = pt
        tr = mv.terrain("earth", lo, la, RADIUS_KM) or {}
        if tr.get("coverage", 0) < 0.95:
            return None
        cell = min(cells, key=lambda c: (c[0] - la) ** 2 + (c[1] - lo) ** 2)
        unit, lith = macrostrat(la, lo)
        return {"lat": la, "lon": lo, **tr, **cell[2], "map_unit": unit, "setting": setting_from(lith)}

    if points is None:
        with ThreadPoolExecutor(6) as pool:
            points = [p for p in pool.map(measure, grid) if p]
        save_points(grid_meta, points)
    print(f"Medidos: {len(points)} puntos con relieve completo", file=sys.stderr)

    def values_of(p):
        v = {}
        for col, d in by_measure.items():
            v[d["id"]] = p.get(col)
        if geo:
            v[geo["id"]] = p.get("setting")
        return v

    def score(p, target, weights):
        vals = values_of(p)
        ds = {}
        for d in dims:
            if d["id"] not in vals:
                continue
            kind = "category" if d.get("categories") else None
            ds[d["id"]] = dim_score(vals[d["id"]], target["values"][d["id"]]["value"], kind, scales.get(d["id"]))
        return weighted(ds, weights, min_cov), ds, vals

    # Un salar es un cuerpo continuo de la unidad evaporítica del mapa: los puntos de la malla conectados
    # (vecinos de 8) con el punto de un sitio del catálogo forman parte de ese sitio y no son nuevos.
    idx = {(round(p["lat"], 4), round(p["lon"], 4)): p for p in points}
    step = round(STEP_DEG, 4)
    member_of = {}
    for st in sites:
        seeds = [p for p in points if p.get("setting") == "lacustrine" and km(p["lat"], p["lon"], st["lat"], st["lon"]) < NEAR_CATALOG_KM]
        stack = list(seeds)
        while stack:
            p = stack.pop()
            key = (round(p["lat"], 4), round(p["lon"], 4))
            if key in member_of:
                continue
            member_of[key] = st["id"]
            for dla in (-step, 0, step):
                for dlo in (-step, 0, step):
                    q = idx.get((round(key[0] + dla, 4), round(key[1] + dlo, 4)))
                    if q and q.get("setting") == "lacustrine" and (round(q["lat"], 4), round(q["lon"], 4)) not in member_of:
                        stack.append(q)
    print(f"Puntos que forman parte de un salar del catálogo: {len(member_of)}", file=sys.stderr)

    near = []
    for p in points:
        dist, sid = min((km(p["lat"], p["lon"], st["lat"], st["lon"]), st["id"]) for st in sites)
        p["nearest_site"], p["nearest_km"] = sid, round(dist, 1)
    catalog_names = {fold(st["name"]) for st in sites}

    default_w = {d["id"]: d["weight"] for d in dims}
    jobs = [(t["id"], None, default_w) for t in targets] + [(pu["targetId"], pu["id"], pu["weights"]) for pu in data["meta"].get("purposes", [])]
    target_by_id = {t["id"]: t for t in targets}
    places = json.loads(PLACES_JSON.read_text(encoding="utf-8")) if PLACES_JSON.exists() else {}
    producible = {setting for _, setting in SETTING_RULES}
    skipped = []
    candidates, validation, rows = [], [], []
    points_raw = {}
    units_by_dim = {d["id"]: (None if d.get("categories") else next((x["values"][d["id"]]["unit"] for x in sites), None)) for d in dims}
    for tid, pid, weights in jobs:
        t = target_by_id[tid]
        ranked = []
        for p in points:
            sim, ds, vals = score(p, t, weights)
            if sim is not None:
                ranked.append((sim, p, ds, vals))
        ranked.sort(key=lambda r: -r[0])
        reason = skip_reason(t, weights, ranked, geo, producible)
        if reason:
            skipped.append({"targetId": tid, **({"purposeId": pid} if pid else {}), "reason": reason})
            print(f"  {tid}{' / ' + pid if pid else ''}: sin candidatos ({reason['es']})", file=sys.stderr)
            continue
        near_top = sum(1 for r in ranked[:VALIDATION_TOP]
                       if r[1]["nearest_km"] < NEAR_CATALOG_KM or (round(r[1]["lat"], 4), round(r[1]["lon"], 4)) in member_of)
        validation.append({"targetId": tid, **({"purposeId": pid} if pid else {}), "top": VALIDATION_TOP, "nearCatalog": near_top})
        chosen = []
        for sim, p, ds, vals in ranked:
            if len(chosen) == TOP:
                break
            if p["nearest_km"] < NEAR_CATALOG_KM or (round(p["lat"], 4), round(p["lon"], 4)) in member_of:
                continue
            if any(km(p["lat"], p["lon"], c[1]["lat"], c[1]["lon"]) < MIN_SEPARATION_KM for c in chosen):
                continue
            key = f"{p['lat']},{p['lon']}"
            if key not in places:
                places[key] = place_of(p["lat"], p["lon"])
                PLACES_JSON.write_text(json.dumps(places, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
            pl = places[key]
            if pl.get("country") != COUNTRY:
                continue
            # Dentro de un lugar que ya es sitio del catálogo (p. ej., otra parte del Salar de Uyuni): no es nuevo.
            if pl.get("feature") and fold(pl["feature"]) in catalog_names:
                continue
            chosen.append((sim, p, ds, vals, pl))
        for rank, (sim, p, ds, vals, pl) in enumerate(chosen, 1):
            pid_str = point_id(p["lat"], p["lon"])
            elev = None if p.get("elevation_m") is None or math.isnan(p["elevation_m"]) else round(p["elevation_m"])
            points_raw[pid_str] = (p, vals, pl, elev)
            candidates.append({
                "targetId": tid, **({"purposeId": pid} if pid else {}), "rank": rank,
                "pointId": pid_str,
                "lat": p["lat"], "lon": p["lon"], "similarity": round(sim, 3),
                **({"elevationM": elev} if elev is not None else {}),
                "values": {k: {"value": v, "unit": units_by_dim.get(k)} for k, v in vals.items()},
                "dimensions": {k: (None if v is None else round(v, 3)) for k, v in ds.items()},
                "mapUnit": p["map_unit"],
                "place": {k: v for k, v in pl.items() if v},
                "nearestSite": {"id": p["nearest_site"], "km": p["nearest_km"]},
            })
            rows.append([tid, pid or "", rank, p["lat"], p["lon"], round(sim, 3), pl.get("feature") or pl.get("peak") or "",
                         pl.get("municipality", ""), pl.get("province", ""), p["map_unit"] or "", p["nearest_site"], p["nearest_km"]])
        print(f"  {tid}{' / ' + pid if pid else ''}: {near_top}/{VALIDATION_TOP} de los mejores puntos están junto a un sitio del catálogo; "
              f"nuevos: {', '.join((c[4].get('feature') or c[4].get('peak') or c[4].get('municipality') or '?') + f' {c[0]:.2f}' for c in chosen)}",
              file=sys.stderr)

    geo_cache = _load_geology_cache()
    points_out = {}
    purposes_cfg = data["meta"].get("purposes", [])
    for pid_str, (p, vals, pl, elev) in points_raw.items():
        per_target = {t["id"]: score(p, t, default_w) for t in targets}
        detail = macrostrat_detail(p["lat"], p["lon"], p["map_unit"], geo_cache)
        geology = {k: v for k, v in detail.items() if v} if detail else None
        points_out[pid_str] = {
            "id": pid_str,
            "lat": p["lat"],
            "lon": p["lon"],
            "radiusKm": RADIUS_KM,
            **({"elevationM": elev} if elev is not None else {}),
            "coverage": round(p["coverage"], 3),
            "values": {k: {"value": v, "unit": units_by_dim.get(k)} for k, v in vals.items()},
            "mapUnit": p["map_unit"],
            **({"geology": geology} if geology else {}),
            "place": {k: v for k, v in pl.items() if v},
            "nearestSite": {"id": p["nearest_site"], "km": p["nearest_km"]},
            "scores": [
                {
                    "targetId": t["id"],
                    "similarity": None if per_target[t["id"]][0] is None else round(per_target[t["id"]][0], 3),
                    "dimensions": {k: (None if v is None else round(v, 3)) for k, v in per_target[t["id"]][1].items()},
                }
                for t in targets
            ],
            "purposeScores": {
                pu["id"]: (lambda x: None if x is None else round(x, 3))(
                    weighted(per_target[pu["targetId"]][1], pu["weights"], min_cov)
                )
                for pu in purposes_cfg
            },
        }
    GEOLOGY_JSON.write_text(json.dumps(geo_cache, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    out = {
        "meta": {
            "generated": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
            "grid": {"bbox": list(BBOX), "stepDeg": STEP_DEG, "radiusKm": RADIUS_KM, "points": len(grid), "measured": len(points), "country": COUNTRY,
                     "nearCatalogKm": NEAR_CATALOG_KM, "minSeparationKm": MIN_SEPARATION_KM},
            "validation": validation,
            "skipped": skipped,
            "sources": [
                {"name": "Terrain Tiles (SRTM and other sources)", "agency": "Mapzen / AWS Open Data", "url": "https://registry.opendata.aws/terrain-tiles/"},
                {"name": "NASA POWER Climatology 2001-2025 (regional)", "agency": "NASA Langley Research Center", "url": "https://power.larc.nasa.gov/"},
                {"name": "Geological Map of South America 2018, 1:5,000,000 (via Macrostrat)", "agency": "CGMW / Macrostrat", "url": "https://macrostrat.org/"},
                {"name": "OpenStreetMap (place names, Overpass API)", "agency": "OpenStreetMap contributors", "url": "https://www.openstreetmap.org/copyright"},
            ],
        },
        "points": points_out,
        "candidates": candidates,
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with open(CSV_OUT, "w", newline="", encoding="utf-8") as f:
        wr = csv.writer(f, lineterminator="\n")
        wr.writerow(["target_id", "purpose_id", "rank", "lat", "lon", "similarity", "feature", "municipality", "province",
                     "map_unit", "nearest_site", "nearest_site_km"])
        wr.writerows(rows)
    print(f"Escrito {OUT.relative_to(ROOT)} y {CSV_OUT.relative_to(ROOT)}", file=sys.stderr)


if __name__ == "__main__":
    main()
