"""País y división administrativa de cada sitio del catálogo, según OpenStreetMap (Nominatim, geocodificación
inversa). Sirven para las etiquetas y el filtro por país de la web; no puntúan.

Escribe docs/valores/sitios_lugares.json: { id: { country, country_en, department, province } }.
Solo consulta los sitios que faltan o cuyas coordenadas cambiaron (Nominatim pide una consulta por segundo).

Uso:  python tools/site_places.py
"""
import csv
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "docs/catalogo-sitios.csv"
OUT = ROOT / "docs/valores/sitios_lugares.json"
UA = {"User-Agent": "galaxy-match-tools/1.0"}


def reverse(lat: float, lon: float, lang: str) -> dict:
    q = urllib.parse.urlencode({"lat": lat, "lon": lon, "format": "jsonv2", "zoom": 10, "accept-language": lang})
    req = urllib.request.Request(f"https://nominatim.openstreetmap.org/reverse?{q}", headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.load(r)
    time.sleep(1.1)
    return data.get("address", {})


def main():
    with open(CATALOG, newline="", encoding="utf-8") as f:
        sites = list(csv.DictReader(f))
    places = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    for s in sites:
        lat, lon = float(s["lat"]), float(s["lon"])
        old = places.get(s["id"])
        if old and old.get("lat") == lat and old.get("lon") == lon:
            continue
        es, en = reverse(lat, lon, "es"), reverse(lat, lon, "en")
        place = {
            "lat": lat,
            "lon": lon,
            "country": es.get("country"),
            "country_en": en.get("country"),
            "department": es.get("state") or es.get("region") or es.get("state_district"),
            "province": es.get("county") or es.get("province"),
        }
        places[s["id"]] = {k: v for k, v in place.items() if v is not None}
        print(f"  {s['id']}: {place['country']}, {place['department']}", file=sys.stderr)
    places = {s["id"]: places[s["id"]] for s in sites if s["id"] in places}
    OUT.write_text(json.dumps(places, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Escrito {OUT.relative_to(ROOT)}", file=sys.stderr)


if __name__ == "__main__":
    main()
