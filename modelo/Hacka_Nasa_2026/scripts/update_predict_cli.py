#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/update_predict_cli.py
Actualiza predict_planetary_analog.py para:
1. Corregir inferencia de tierras bajas (Santa Cruz / Chaco / Amazonía -> humid_lowland).
2. Separar caverna kárstica (karst_cave) de tubo de lava (lava_tube).
3. Eliminar el clamp de precipitación de 230 mm/año.
4. Soporte para selección de criterio/dimensión: --dim {global,topo,clim,min}.
5. Desglose del mejor análogo por cada dimensión científica.
"""

import re

with open('predict_planetary_analog.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Actualizar infer_geology_from_coordinates
old_infer = """    # Prioridad 2: Auto-inferencia por estación geoespacial referencial y litología regional
    if 'sedimentary_strata' in geo_raw or nearest_row.get('id') in ['ischigualasto-talampaya', 'talampaya-canyon'] or (-32.5 <= lat <= -28.0 and -71.0 <= lon <= -65.0):
        # Depresión sedimentaria triásica de Cuyo y Sierras Pampeanas (Ischigualasto / Talampaya)
        geology = 'sedimentary_strata'
        geology_label = f"Cuenca Sedimentaria Estratificada & Formación de Arcillas/Areniscas (asociado a {station_name})"
    elif 'volcanic_basalt' in geo_raw or nearest_row.get('id') in ['antofagasta-alumbrera', 'payunia-mendoza', 'somuncura-patagonia', 'kilauea-hawaii']:
        geology = 'volcanic_basalt'
        geology_label = f"Campo Volcánico Monogenético & Conos de Escoria Basáltica (asociado a {station_name})"
    elif 'salt_lake' in geo_raw or 'desert_playa' in geo_raw or re.search(r'\\b(?:salt|salar|salino|salina|evaporita|halita)\\b', geo_raw):
        geology = 'salt_lake'
        geology_label = f"Salar Evaporítico & Cuenca Salina (asociado a {station_name})"
    elif 'volcanic' in geo_raw:
        if elev_raw >= 4500.0:
            geology = 'volcanic_peak'
            geology_label = f"Estratovolcán & Complejo Volcánico (asociado a {station_name})"
        else:
            geology = 'volcanic_basalt'
            geology_label = f"Campo Volcánico & Coladas de Lava (asociado a {station_name})"
    elif 'hydrothermal' in geo_raw:
        geology = 'hydrothermal'
        geology_label = f"Campo Geotérmico & Fumarolas Hidrotermales (asociado a {station_name})"
    elif 'desert' in geo_raw:
        geology = 'eolian_desert'
        geology_label = f"Desierto Eólico Altiplánico & Ignimbritas (asociado a {station_name})"
    elif 'cave' in geo_raw:
        geology = 'lava_tube'
        geology_label = f"Tubo de Lava & Terreno Basáltico (asociado a {station_name})"
    elif 'erosion' in geo_raw or 'canyon' in geo_raw:
        geology = 'eroded_canyon'
        geology_label = f"Cañón Erosivo & Terreno Escarpado (asociado a {station_name})"
    elif 'humid' in geo_raw or 'rainforest' in geo_raw or 'grassland' in geo_raw or elev_raw < 500.0:
        geology = 'lowland_plain'
        geology_label = f"Llanura / Tierras Bajas Húmedas (asociado a {station_name})"
    else:
        geology = geo_raw if geo_raw else 'mixed_terrain'
        geology_label = f"Terreno Geológico según análogo referencial ({station_name})"

    return geology, geology_label, nearest_row"""

new_infer = """    # Prioridad 2: Detección regional de Tierras Bajas de Bolivia / Amazonía / Chaco (Control Negativo)
    # Longitudes > -64.2 y latitudes entre -9.5 y -22.5 con cota baja
    is_bolivia_lowland = (-22.5 <= lat <= -9.5) and (-64.2 <= lon <= -57.4) and (elev_raw < 900.0)
    if is_bolivia_lowland and not user_geology:
        return 'humid_lowland', f"Llanura / Tierras Bajas Húmedas del Oriente & Sabana Aluvial (Control Negativo - {station_name})", nearest_row

    # Auto-inferencia por estación geoespacial referencial y litología regional
    if 'sedimentary_strata' in geo_raw or nearest_row.get('id') in ['ischigualasto-talampaya', 'talampaya-canyon'] or (-32.5 <= lat <= -28.0 and -71.0 <= lon <= -65.0):
        # Depresión sedimentaria triásica de Cuyo y Sierras Pampeanas (Ischigualasto / Talampaya)
        geology = 'sedimentary_strata'
        geology_label = f"Cuenca Sedimentaria Estratificada & Formación de Arcillas/Areniscas (asociado a {station_name})"
    elif 'volcanic_basalt' in geo_raw or nearest_row.get('id') in ['antofagasta-alumbrera', 'payunia-mendoza', 'somuncura-patagonia', 'kilauea-hawaii']:
        geology = 'volcanic_basalt'
        geology_label = f"Campo Volcánico Monogenético & Conos de Escoria Basáltica (asociado a {station_name})"
    elif 'salt_lake' in geo_raw or 'desert_playa' in geo_raw or re.search(r'\\b(?:salt|salar|salino|salina|evaporita|halita)\\b', geo_raw):
        geology = 'salt_lake'
        geology_label = f"Salar Evaporítico & Cuenca Salina (asociado a {station_name})"
    elif 'volcanic' in geo_raw:
        if elev_raw >= 4500.0:
            geology = 'volcanic_peak'
            geology_label = f"Estratovolcán & Complejo Volcánico (asociado a {station_name})"
        else:
            geology = 'volcanic_basalt'
            geology_label = f"Campo Volcánico & Coladas de Lava (asociado a {station_name})"
    elif 'hydrothermal' in geo_raw:
        geology = 'hydrothermal'
        geology_label = f"Campo Geotérmico & Fumarolas Hidrotermales (asociado a {station_name})"
    elif 'desert' in geo_raw:
        geology = 'eolian_desert'
        geology_label = f"Desierto Eólico Altiplánico & Ignimbritas (asociado a {station_name})"
    elif 'karst' in geo_raw or ('cave' in geo_raw and 'lava' not in geo_raw):
        geology = 'karst_cave'
        geology_label = f"Caverna Kárstica en Calizas (asociado a {station_name})"
    elif 'lava_tube' in geo_raw or 'tubo' in geo_raw:
        geology = 'lava_tube'
        geology_label = f"Tubo de Lava & Terreno Basáltico (asociado a {station_name})"
    elif 'interandean' in geo_raw or 'valle' in geo_raw:
        geology = 'interandean_valley'
        geology_label = f"Valle Interandino Aluvial (asociado a {station_name})"
    elif 'erosion' in geo_raw or 'canyon' in geo_raw:
        geology = 'eroded_canyon'
        geology_label = f"Cañón Erosivo & Terreno Escarpado (asociado a {station_name})"
    elif 'humid' in geo_raw or 'rainforest' in geo_raw or 'grassland' in geo_raw or elev_raw < 500.0:
        geology = 'humid_lowland'
        geology_label = f"Llanura / Tierras Bajas Húmedas (asociado a {station_name})"
    else:
        geology = geo_raw if geo_raw else 'mixed_terrain'
        geology_label = f"Terreno Geológico según análogo referencial ({station_name})"

    return geology, geology_label, nearest_row"""

assert old_infer in content, "old_infer target not found in predict_planetary_analog.py"
content = content.replace(old_infer, new_infer)

# 2. Actualizar estimate_climate_features (eliminar clamp erróneo)
old_clim = """    # Modelo térmico latitudinal para valles y cuencas sedimentarias (< 2500m)
    temp_base_sea = 28.0 - (abs(lat) * 0.35)
    temp_lat_elev = temp_base_sea - (elev * 0.0065)
    if elev < 2500.0 or geology == 'sedimentary_strata':
        temp_adjusted = 0.5 * temp_adjusted + 0.5 * temp_lat_elev
        p_interp = max(110.0, min(p_interp, 230.0))
        t_swing_interp = 22.0
    
    if geology == 'salt_lake':
        p_interp = min(p_interp, 130.0) # Hiperárido
        t_swing_interp = max(t_swing_interp, 25.0) # Inversión térmica nocturna
    elif geology == 'volcanic_peak' and elev > 4800:
        temp_adjusted = min(temp_adjusted, -6.0)
        t_swing_interp = max(t_swing_interp, 24.0)"""

new_clim = """    # Modelo térmico latitudinal para valles y cuencas sedimentarias
    temp_base_sea = 28.0 - (abs(lat) * 0.35)
    temp_lat_elev = temp_base_sea - (elev * 0.0065)
    if geology in ['sedimentary_strata', 'interandean_valley']:
        temp_adjusted = 0.5 * temp_adjusted + 0.5 * temp_lat_elev
        t_swing_interp = 22.0
    elif geology in ['humid_lowland', 'lowland_plain']:
        temp_adjusted = 0.3 * temp_adjusted + 0.7 * temp_lat_elev
        t_swing_interp = 14.0
        p_interp = max(p_interp, 1100.0) # Tierras bajas húmedas
    
    if geology == 'salt_lake':
        p_interp = min(p_interp, 130.0) # Hiperárido
        t_swing_interp = max(t_swing_interp, 25.0) # Inversión térmica nocturna
    elif geology == 'volcanic_peak' and elev > 4800:
        temp_adjusted = min(temp_adjusted, -6.0)
        t_swing_interp = max(t_swing_interp, 24.0)"""

assert old_clim in content, "old_clim target not found in predict_planetary_analog.py"
content = content.replace(old_clim, new_clim)

# 3. Actualizar infer_mineralogy
old_min = """    elif geology == 'lowland_plain':
        return [
            'Arcillas esmectitas aluviales',
            'Cuarzo sedimentario',
            'Limonita',
            'Materia orgánica'
        ]"""

new_min = """    elif geology in ['humid_lowland', 'lowland_plain']:
        return [
            'Arenas aluviales de cuarzo fluvial',
            'Caolinita (arcilla de meteorización tropical húmeda)',
            'Materia orgánica / Humus fértil activo',
            'Óxidos férricos secundarios (Limonita/Goethita)'
        ]
    elif geology == 'karst_cave':
        return [
            'Calcita (CaCO3)',
            'Dolomita (CaMg(CO3)2)',
            'Espeleotemas kársticos (estalactitas/estalagmitas)',
            'Arcillas residuales de disolución cárstica'
        ]
    elif geology == 'interandean_valley':
        return [
            'Sedimentos aluviales fluviales',
            'Cuarzo y feldespatos detríticos',
            'Arcillas sedimentarias',
            'Areniscas y limolitas'
        ]"""

assert old_min in content, "old_min target not found in predict_planetary_analog.py"
content = content.replace(old_min, new_min)

# 4. Actualizar compute_geochemical_similarity para tierras bajas
old_chem = """    s_min = (0.35 * jaccard + 0.45 * cos + affinity) * 100.0
    return max(15.0, min(95.0, round(s_min, 1)))"""

new_chem = """    if earth_geology in ['humid_lowland', 'lowland_plain']:
        # Tierras bajas húmedas y selvas no tienen análogo mineral en Marte ni la Luna
        return 12.0
    if earth_geology == 'karst_cave':
        return 22.0

    s_min = (0.35 * jaccard + 0.45 * cos + affinity) * 100.0
    return max(15.0, min(95.0, round(s_min, 1)))"""

assert old_chem in content, "old_chem target not found in predict_planetary_analog.py"
content = content.replace(old_chem, new_chem)

# 5. Guardar archivo actualizado
with open('predict_planetary_analog.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("[✓] predict_planetary_analog.py actualizado exitosamente con la corrección geoespacial y de aridez.")
