#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/add_dimension_ranking_to_cli.py
Agrega ranking por dimensión (--dim {global, topo, clim, min}) en predict_planetary_analog.py.
"""

with open('predict_planetary_analog.py', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Modificar firma de run_prediction_pipeline
old_sig = "def run_prediction_pipeline(lat: float, lon: float, area_km2: float = 25.0, geology_hint: str = None, json_out: str = None):"
new_sig = "def run_prediction_pipeline(lat: float, lon: float, area_km2: float = 25.0, geology_hint: str = None, json_out: str = None, dimension: str = 'global'):"
assert old_sig in text, "old_sig not found"
text = text.replace(old_sig, new_sig, 1)

# 2. Reemplazar la selección de best_match
old_sort = """    # Ordenar por Índice de Similitud Global (PSI) descendente
    evaluated_targets.sort(key=lambda x: x['psi_global'], reverse=True)
    best_match = evaluated_targets[0]
    top_target = best_match['target']"""

new_sort = """    # Ordenar y seleccionar según la dimensión científica solicitada
    best_global = sorted(evaluated_targets, key=lambda x: x['psi_global'], reverse=True)[0]
    best_topo   = sorted(evaluated_targets, key=lambda x: x['s_topo_pct'], reverse=True)[0]
    best_clim   = sorted(evaluated_targets, key=lambda x: x['s_clim_pct'], reverse=True)[0]
    best_min    = sorted(evaluated_targets, key=lambda x: x['s_min_pct'], reverse=True)[0]

    dim_choice = str(dimension).lower().strip() if dimension else 'global'
    if dim_choice in ['topo', 'topografia', 'relief']:
        best_match = best_topo
        crit_label = "TOPOLOGÍA Y RELIEVES (S_topo)"
    elif dim_choice in ['clim', 'clima', 'climatologia']:
        best_match = best_clim
        crit_label = "CLIMATOLOGÍA Y RADIACIÓN (S_clim)"
    elif dim_choice in ['min', 'mineral', 'mineralogia', 'regolito']:
        best_match = best_min
        crit_label = "MINERALOGÍA Y REGOLITO (S_min)"
    else:
        best_match = best_global
        crit_label = "SIMILITUD GLOBAL INTEGRADA (PSI Ponderado)"

    top_target = best_match['target']"""

assert old_sort in text, "old_sort not found"
text = text.replace(old_sort, new_sort, 1)

# 3. Imprimir el resumen multi-criterio antes de [3]
old_p3 = """    print(f"\\n[2] GRUPO Y CENTROIDE GEOMORFOLÓGICO ASIGNADO:")
    print(f"  * {cluster_info['nombre']}")
    print(f"  * Centroide Representativo: {cluster_info['centroide_representativo']}")
    print(f"  * Características:          {cluster_info['descripcion']}")
    print(f"  * Analogía Planetaria:      {cluster_info['analogia_primaria']}")

    print("\\n" + "-" * 80)
    print(f"[3] ANÁLOGO EXTRATERRESTRE MÁS SIMILAR DETECTADO: >>> {top_target['name'].upper()} ({top_target['body'].upper()}) <<<")
    print("-" * 80)"""

new_p3 = """    print(f"\\n[2] GRUPO Y CENTROIDE GEOMORFOLÓGICO ASIGNADO:")
    print(f"  * {cluster_info['nombre']}")
    print(f"  * Centroide Representativo: {cluster_info['centroide_representativo']}")
    print(f"  * Características:          {cluster_info['descripcion']}")
    print(f"  * Analogía Planetaria:      {cluster_info['analogia_primaria']}")

    print("\\n" + "=" * 80)
    print("   EXPLORADOR MULTI-CRITERIO: MEJORES ANÁLOGOS POR CARACTERÍSTICA CIENTÍFICA")
    print("=" * 80)
    print(f"  🌐 GLOBAL (PSI Ponderado) : {best_global['target']['name']} ({best_global['target']['body']}) -> {best_global['psi_global']}% PSI")
    print(f"  🏔️ TOPOLOGÍA Y RELIEVES   : {best_topo['target']['name']} ({best_topo['target']['body']}) -> {best_topo['s_topo_pct']}% S_topo")
    print(f"  🌡️ CLIMA Y RADIACIÓN      : {best_clim['target']['name']} ({best_clim['target']['body']}) -> {best_clim['s_clim_pct']}% S_clim")
    print(f"  🧪 MINERALOGÍA Y REGOLITO : {best_min['target']['name']} ({best_min['target']['body']}) -> {best_min['s_min_pct']}% S_min")
    print("=" * 80)
    print(f"[*] Criterio Activo Seleccionado: >>> {crit_label} <<<")

    print("\\n" + "-" * 80)
    print(f"[3] ANÁLOGO EXTRATERRESTRE DESTACADO: >>> {top_target['name'].upper()} ({top_target['body'].upper()}) <<<")
    print("-" * 80)"""

assert old_p3 in text, "old_p3 not found"
text = text.replace(old_p3, new_p3, 1)

# 4. Incluir best_by_dimension en el json output
old_json = """            'top_3_targets': [
                {
                    'name': it['target']['name'],
                    'body': it['target']['body'],
                    'psi': it['psi_global']
                } for it in evaluated_targets[:3]
            ],"""

new_json = """            'dimension_evaluated': dim_choice,
            'best_by_dimension': {
                'global': {'name': best_global['target']['name'], 'body': best_global['target']['body'], 'score': best_global['psi_global']},
                'topography': {'name': best_topo['target']['name'], 'body': best_topo['target']['body'], 'score': best_topo['s_topo_pct']},
                'climate': {'name': best_clim['target']['name'], 'body': best_clim['target']['body'], 'score': best_clim['s_clim_pct']},
                'mineralogy': {'name': best_min['target']['name'], 'body': best_min['target']['body'], 'score': best_min['s_min_pct']}
            },
            'top_3_targets': [
                {
                    'name': it['target']['name'],
                    'body': it['target']['body'],
                    'psi': it['psi_global'],
                    's_topo': it['s_topo_pct'],
                    's_clim': it['s_clim_pct'],
                    's_min': it['s_min_pct']
                } for it in evaluated_targets[:3]
            ],"""

assert old_json in text, "old_json not found"
text = text.replace(old_json, new_json, 1)

# 5. Agregar argumento en CLI parser
old_parser = """    parser.add_argument("--geology", "--geo", "--surface_type", dest="geology", type=str, default=None, help="Tipo geológico o de suelo opcional (ej. 'basalto volcanico', 'salar')")
    parser.add_argument("--json", type=str, help="Ruta de archivo JSON opcional para exportar resultados")"""

new_parser = """    parser.add_argument("--geology", "--geo", "--surface_type", dest="geology", type=str, default=None, help="Tipo geológico o de suelo opcional (ej. 'basalto volcanico', 'salar')")
    parser.add_argument("--dimension", "--dim", choices=['global', 'topo', 'clim', 'min'], default='global', help="Criterio específico a priorizar: 'global' (PSI), 'topo' (S_topo), 'clim' (S_clim), 'min' (S_min)")
    parser.add_argument("--json", type=str, help="Ruta de archivo JSON opcional para exportar resultados")"""

assert old_parser in text, "old_parser not found"
text = text.replace(old_parser, new_parser, 1)

# 6. Pasar dimension al pipeline
old_call = """        run_prediction_pipeline(args.lat, args.lon, area_km2=area_val, geology_hint=geology_hint, json_out=args.json)"""
new_call = """        run_prediction_pipeline(args.lat, args.lon, area_km2=area_val, geology_hint=geology_hint, json_out=args.json, dimension=args.dimension)"""

assert old_call in text, "old_call not found"
text = text.replace(old_call, new_call, 1)

with open('predict_planetary_analog.py', 'w', encoding='utf-8') as f:
    f.write(text)

print("[✓] predict_planetary_analog.py actualizado con éxito con soporte multi-criterio (--dim).")
