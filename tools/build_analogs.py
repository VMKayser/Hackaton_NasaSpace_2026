"""Genera web/public/data/analogs.json (contrato v2.1) con valores medidos y el método acordado.

Entradas:
- docs/catalogo-sitios.csv: sitios, coordenadas, radio, tipo y marcas.
- docs/valores/sitios_valores.csv y objetivos_valores.csv: valores medidos (tools/measure_values.py).
- docs/valores/fuentes.json: unidad y fuentes de cada columna medida.
- docs/valores/objetivos.csv: objetivos, coordenadas y entorno geológico, cada uno con su fuente.
- docs/valores/geologia.csv: entorno geológico de cada sitio con su fuente y la unidad del mapa
  geológico de Sudamérica 1:5 000 000 (CGMW, 2019) en su punto.
- docs/valores/puntaje.json: dimensiones, pesos y propósitos (justificados en docs/valores/pesos.md).

Método (docs/metodo-similitud.md):
- Escala de cada dimensión numérica: rango entre los percentiles 5 y 95 de los sitios del catálogo,
  ampliado para incluir los valores de los objetivos.
- Similitud por dimensión: 1 − min(1, |Tierra − objetivo| / escala); en categorías, 1 si comparten alguna
  categoría (un sitio puede tener varias, separadas por «+») y 0 si no.
  Si falta un dato, la dimensión queda sin puntaje (null), nunca en 0.
- Total: media ponderada de las dimensiones con puntaje y peso positivo. Por propósito, con sus pesos.

La web solo muestra y ordena estos puntajes; no los recalcula.

Uso:  python tools/build_analogs.py
"""
import csv
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
VAL = ROOT / "docs/valores"
OUT = ROOT / "web/public/data/analogs.json"


def read_csv(path: Path) -> dict:
    with open(path, newline="", encoding="utf-8") as f:
        return {r["id"]: r for r in csv.DictReader(f)}


def num(v):
    return None if v is None or v == "" else float(v)


def dim_score(earth, target, kind, scale):
    if earth is None or target is None:
        return None
    if kind == "category":
        return 1.0 if set(earth.split("+")) & set(target.split("+")) else 0.0
    if scale is None or scale <= 0:
        return None
    return 1 - min(1.0, abs(earth - target) / scale)


def weighted(scores: dict, weights: dict):
    num_, den = 0.0, 0.0
    for d, w in weights.items():
        s = scores.get(d)
        if w > 0 and s is not None:
            num_ += w * s
            den += w
    return num_ / den if den > 0 else None


def r3(x):
    return None if x is None else round(x, 3)


def main():
    catalog = read_csv(ROOT / "docs/catalogo-sitios.csv")
    sites = read_csv(VAL / "sitios_valores.csv")
    targets = read_csv(VAL / "objetivos_valores.csv")
    sources = json.loads((VAL / "fuentes.json").read_text(encoding="utf-8"))
    cfg = json.loads((VAL / "puntaje.json").read_text(encoding="utf-8"))
    geology = read_csv(VAL / "geologia.csv")
    target_info = read_csv(VAL / "objetivos.csv")
    if set(geology) != set(catalog):
        sys.exit("docs/valores/geologia.csv no tiene los mismos sitios que el catálogo")
    if set(target_info) != set(targets):
        sys.exit("Los objetivos medidos no coinciden con docs/valores/objetivos.csv. Ejecuta tools/measure_values.py")

    missing = set(catalog) ^ set(sites)
    if missing:
        sys.exit(f"Los sitios medidos no coinciden con el catálogo: {sorted(missing)}. Ejecuta tools/measure_values.py")
    for c, row in catalog.items():
        if (float(row["lat"]), float(row["lon"])) != (float(sites[c]["lat"]), float(sites[c]["lon"])):
            sys.exit(f"{c}: las coordenadas del catálogo cambiaron desde la medición. Ejecuta tools/measure_values.py")

    dims = cfg["dimensions"]
    # Valores por dimensión, para sitios y objetivos.
    site_vals, target_vals = {s: {} for s in catalog}, {t: {} for t in targets}
    for d in dims:
        if d.get("kind") == "category":
            # Entorno geológico: archivos con fuente. Litología: unidad del mapa en el punto del sitio.
            for s in catalog:
                site_vals[s][d["id"]] = geology[s][d["siteColumn"]] or None
            for t in targets:
                target_vals[t][d["id"]] = target_info[t].get(d.get("targetColumn", ""), "") or None
        else:
            for s in catalog:
                site_vals[s][d["id"]] = num(sites[s][d["column"]])
            for t, row in targets.items():
                target_vals[t][d["id"]] = num(row[d["column"]])

    # Escalas: percentiles 5 y 95 de los sitios, ampliados con los objetivos.
    scales = {}
    for d in dims:
        if d.get("kind") == "category":
            continue
        e = [v for v in (site_vals[s][d["id"]] for s in catalog) if v is not None]
        t = [v for v in (target_vals[x][d["id"]] for x in targets) if v is not None]
        if not e or not t:
            scales[d["id"]] = None
            continue
        lo, hi = np.percentile(e, [5, 95])
        lo, hi = min(lo, min(t)), max(hi, max(t))
        scales[d["id"]] = float(hi - lo) if hi > lo else None

    default_w = {d["id"]: d["weight"] for d in dims}
    out_sites = []
    for s, row in catalog.items():
        per_target, scores = {}, []
        for t in targets:
            ds = {d["id"]: dim_score(site_vals[s][d["id"]], target_vals[t][d["id"]], d.get("kind"), scales.get(d["id"]))
                  for d in dims}
            per_target[t] = ds
            total = weighted(ds, default_w)
            if total is not None:  # sin puntaje total, se omite la pareja
                scores.append({"targetId": t, "similarity": r3(total), "dimensions": {k: r3(v) for k, v in ds.items()}})
        unit = lambda d: None if d.get("kind") == "category" else sources[d["column"]]["unit"]
        out_sites.append({
            "id": s,
            "name": row["name"],
            "lat": float(row["lat"]),
            "lon": float(row["lon"]),
            "known": row["known"] == "true",
            "reference": row["reference"] == "true",
            "control": row["control"] == "true",
            "radiusKm": float(row["radius_km"]),
            **({"type": cfg["siteTypes"][row["type"]]} if row["type"] in cfg["siteTypes"] else {}),
            "values": {d["id"]: {"value": site_vals[s][d["id"]], "unit": unit(d)} for d in dims},
            "scores": scores,
            "purposeScores": {p["id"]: r3(weighted(per_target[p["targetId"]], p["weights"])) for p in cfg["purposes"]},
        })

    out_targets = [{
        "id": t,
        "name": row["name"],
        "body": row["body"],
        "lat": float(row["lat"]),
        "lon": float(row["lon"]),
        "values": {d["id"]: {"value": target_vals[t][d["id"]], "unit": None if d.get("kind") == "category" else sources[d["column"]]["unit"]}
                   for d in dims},
    } for t, row in targets.items()]

    # Solo las fuentes de los cuerpos que aparecen en el archivo.
    bodies = {"earth"} | {row["body"] for row in targets.values()}
    meta_dims = []
    for d in dims:
        srcs = d["sources"] if "sources" in d else sources[d["column"]]["sources"]
        entry = {"id": d["id"], "label": d["label"], "weight": d["weight"],
                 "sources": [x for x in srcs if x.get("body", "earth") in bodies]}
        if "column" in d:
            entry["measure"] = d["column"]  # la web reconoce las medidas de relieve que sabe medir
        if "categories" in d:
            cats = dict(d["categories"])
            # Etiqueta de las combinaciones («lacustrine+hydrothermal»).
            for v in {*(site_vals[x][d["id"]] for x in catalog), *(target_vals[x][d["id"]] for x in targets)}:
                if v and v not in cats and "+" in v:
                    parts = [cats[p] for p in v.split("+")]
                    cats[v] = {lang: " + ".join(p[lang] for p in parts) for lang in ("en", "es")}
            missing_labels = {v for v in (*(site_vals[x][d["id"]] for x in catalog), *(target_vals[x][d["id"]] for x in targets)) if v and v not in cats}
            if missing_labels:
                sys.exit(f"{d['id']}: faltan etiquetas para {sorted(missing_labels)} en puntaje.json")
            entry["categories"] = cats
        meta_dims.append(entry)

    out = {
        "meta": {
            "mock": False,
            "version": "2.1.0",
            "generated": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
            "scoring": cfg["scoring"],
            "dimensions": meta_dims,
            "purposes": [{k: p[k] for k in ("id", "kind", "targetId", "weights")} for p in cfg["purposes"]],
        },
        "targets": out_targets,
        "sites": out_sites,
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Resumen: orden por objetivo y lugar de la referencia y los controles.
    for t in targets:
        ranked = sorted(((x["scores"], x) for x in out_sites), key=lambda p: -next((s["similarity"] for s in p[0] if s["targetId"] == t), -1))
        print(f"\n{t}:", file=sys.stderr)
        for i, (sc, x) in enumerate(ranked, 1):
            sim = next((s["similarity"] for s in sc if s["targetId"] == t), None)
            mark = " (referencia)" if x["reference"] else " (control)" if x["control"] else " (conocido)" if x["known"] else ""
            if i <= 5 or mark in (" (referencia)", " (control)"):
                print(f"  {i:2}. {x['id']:24} {sim}{mark}", file=sys.stderr)
    for p in cfg["purposes"]:
        ranked = sorted(out_sites, key=lambda x: -(x["purposeScores"][p["id"]] or -1))
        print(f"\n{p['id']}: " + ", ".join(f"{x['id']} {x['purposeScores'][p['id']]}" for x in ranked[:5]), file=sys.stderr)
        for i, x in enumerate(ranked, 1):
            if x["reference"] or x["control"]:
                print(f"  {i:2}. {x['id']} {x['purposeScores'][p['id']]}", file=sys.stderr)
    print(f"\nEscrito {OUT.relative_to(ROOT)}", file=sys.stderr)


if __name__ == "__main__":
    main()
