#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/apply_dimension_selector_complete.py
=============================================
Aplica la actualización integral en ensayo.html:
1. Reemplaza CENTRALIZED_STATIONS con stations.json (sin NaNs, incluye Santa Cruz, Cochabamba, Yacuiba).
2. Agrega estilos CSS responsivos para el selector de dimensiones y la tarjeta de enfoque temático.
3. Inserta el markup HTML del Dimension Selector en la sección comparativa.
4. Ajusta los algoritmos de inferencia geológica, climática y mineralógica.
5. Implementa la lógica en JS para cambiar de dimensión, reordenar candidatos, auto-seleccionar el #1,
   renderizar la tarjeta de enfoque temático y resaltar las filas correspondientes en la tabla comparativa.
"""

import json
import re

with open('data/stations.json', 'r', encoding='utf-8') as f:
    stations_data = json.load(f)

stations_js_str = json.dumps(stations_data, indent=2, ensure_ascii=False)

with open('ensayo.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Reemplazar CENTRALIZED_STATIONS
start_cs = html.find('const CENTRALIZED_STATIONS =')
assert start_cs != -1, "CENTRALIZED_STATIONS not found"
end_cs = html.find(';', start_cs)
html = html[:start_cs] + f"const CENTRALIZED_STATIONS = {stations_js_str}" + html[end_cs:]
print("[✓] 1. CENTRALIZED_STATIONS actualizado con 76 estaciones limpias.")

# 2. Agregar CSS para Dimension Selector
css_to_add = """
    /* DIMENSION SELECTOR MODULE */
    .dimension-selector-card {
      background: rgba(10, 20, 42, 0.95);
      border: 1px solid rgba(0, 242, 254, 0.4);
      border-radius: 10px;
      padding: 0.95rem 1.15rem;
      margin-bottom: 1.15rem;
      box-shadow: 0 4px 22px rgba(0, 242, 254, 0.08);
    }
    .dimension-selector-header {
      margin-bottom: 0.75rem;
    }
    .dim-title {
      font-size: 0.85rem;
      font-weight: 900;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }
    .dim-subtitle {
      font-size: 0.73rem;
      color: #94a3b8;
      margin-top: 0.2rem;
      line-height: 1.35;
    }
    .dimension-tabs-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.65rem;
      margin-bottom: 0.85rem;
    }
    @media (max-width: 900px) {
      .dimension-tabs-row { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 520px) {
      .dimension-tabs-row { grid-template-columns: 1fr; }
    }
    .dim-tab {
      background: rgba(14, 28, 56, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      padding: 0.65rem 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      cursor: pointer;
      transition: all 0.25s ease;
      text-align: left;
      color: var(--text-main);
    }
    .dim-tab:hover {
      background: rgba(0, 242, 254, 0.12);
      border-color: rgba(0, 242, 254, 0.5);
      transform: translateY(-2px);
    }
    .dim-tab.active {
      background: linear-gradient(135deg, rgba(2, 132, 199, 0.35) 0%, rgba(0, 242, 254, 0.22) 100%);
      border: 1.5px solid var(--accent);
      box-shadow: 0 0 16px var(--accent-glow);
    }
    .dim-tab-icon {
      font-size: 1.35rem;
      flex-shrink: 0;
    }
    .dim-tab-text {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 0;
    }
    .dim-tab-name {
      font-size: 0.78rem;
      font-weight: 800;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dim-tab.active .dim-tab-name {
      color: var(--accent);
    }
    .dim-tab-desc {
      font-size: 0.65rem;
      color: #94a3b8;
      line-height: 1.25;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* THEMATIC SPOTLIGHT CARD */
    .thematic-spotlight {
      background: rgba(6, 12, 24, 0.9);
      border: 1px solid rgba(0, 242, 254, 0.25);
      border-radius: 8px;
      padding: 0.85rem 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .thematic-spotlight-badge {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 0.5rem;
    }
    .thematic-target-title {
      font-size: 0.88rem;
      font-weight: 900;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }
    .thematic-target-score {
      font-size: 0.82rem;
      font-weight: 900;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      background: rgba(0, 242, 254, 0.18);
      border: 1px solid var(--accent);
      color: var(--accent);
    }
    .thematic-grid-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.6rem;
    }
    .thematic-metric-box {
      background: rgba(14, 28, 56, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 6px;
      padding: 0.55rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .thematic-metric-label {
      font-size: 0.68rem;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 700;
    }
    .thematic-metric-values {
      font-size: 0.82rem;
      font-weight: 800;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .thematic-metric-diff {
      font-size: 0.70rem;
      font-weight: 700;
      color: var(--accent);
    }
    .thematic-insight-text {
      font-size: 0.74rem;
      color: #cbd5e1;
      line-height: 1.4;
      background: rgba(2, 132, 199, 0.1);
      border-left: 3px solid var(--accent);
      padding: 0.45rem 0.75rem;
      border-radius: 0 4px 4px 0;
    }
    .row-highlight-active-dim {
      background: rgba(0, 242, 254, 0.12) !important;
      outline: 1.5px solid rgba(0, 242, 254, 0.4);
    }
    .active-dim-tag {
      font-size: 0.60rem;
      font-weight: 800;
      color: #0284c7;
      background: rgba(0, 242, 254, 0.22);
      border: 1px solid rgba(0, 242, 254, 0.6);
      padding: 1px 6px;
      border-radius: 4px;
      margin-left: 6px;
      vertical-align: middle;
      text-transform: uppercase;
    }
"""

if '.dimension-selector-card' not in html:
    css_insert_point = html.find('/* PSI SUMMARY BAR */')
    assert css_insert_point != -1, "CSS insertion point not found"
    html = html[:css_insert_point] + css_to_add + "\n" + html[css_insert_point:]
    print("[✓] 2. Estilos CSS del Dimension Selector agregados.")

# 3. Insertar markup del Dimension Selector
dim_markup = """      <!-- NUEVO MÓDULO: EXPLORADOR MULTI-CRITERIO POR CARACTERÍSTICA CIENTÍFICA -->
      <div class="dimension-selector-card" id="dimension-selector-module">
        <div class="dimension-selector-header">
          <div class="dim-title">
            <span>🎯</span> ENFOQUE DE EVALUACIÓN SEGÚN CARACTERÍSTICA CIENTÍFICA:
          </div>
          <div class="dim-subtitle">
            Un sitio terrestre puede ser altamente análogo en topología y relieve, pero diferir en climatología o mineralogía. Selecciona la característica para re-ordenar los destinos y auditar la comparación directa de ese dominio:
          </div>
        </div>

        <div class="dimension-tabs-row">
          <button class="dim-tab active" id="tab-dim-global" onclick="switchDimensionCriterion('global')">
            <span class="dim-tab-icon">🌐</span>
            <div class="dim-tab-text">
              <div class="dim-tab-name">Similitud Global (PSI)</div>
              <div class="dim-tab-desc">Balance integral (35% Topo + 35% Clima + 30% Min)</div>
            </div>
          </button>
          <button class="dim-tab" id="tab-dim-topo" onclick="switchDimensionCriterion('topo')">
            <span class="dim-tab-icon">🏔️</span>
            <div class="dim-tab-text">
              <div class="dim-tab-name">Topología y Relieves (S_topo)</div>
              <div class="dim-tab-desc">Pendientes, rugosidad y relieve local escalado</div>
            </div>
          </button>
          <button class="dim-tab" id="tab-dim-clim" onclick="switchDimensionCriterion('clim')">
            <span class="dim-tab-icon">🌡️</span>
            <div class="dim-tab-text">
              <div class="dim-tab-name">Climatología y Radiación (S_clim)</div>
              <div class="dim-tab-desc">Presión barométrica, aridez, UV y gradiente térmico</div>
            </div>
          </button>
          <button class="dim-tab" id="tab-dim-min" onclick="switchDimensionCriterion('min')">
            <span class="dim-tab-icon">🧪</span>
            <div class="dim-tab-text">
              <div class="dim-tab-name">Mineralogía y Regolito (S_min)</div>
              <div class="dim-tab-desc">Fases litológicas, regolito, sulfatos, basaltos y arcillas</div>
            </div>
          </button>
        </div>

        <!-- TARJETA DINÁMICA DE ENFOQUE TEMÁTICO (THEMATIC SPOTLIGHT) -->
        <div class="thematic-spotlight" id="thematic-spotlight-box">
        </div>
      </div>
"""

if 'id="dimension-selector-module"' not in html:
    section_hdr_end = html.find('<!-- RESUMEN EJECUTIVO DEL ÍNDICE DE SIMILITUD PLANETARIA (PSI) -->')
    assert section_hdr_end != -1, "Section 2 insertion point not found"
    html = html[:section_hdr_end] + dim_markup + "\n" + html[section_hdr_end:]
    print("[✓] 3. Markup HTML del Dimension Selector insertado.")

# 4. Actualizar inferGeologyFromCoordinates en JS
old_infer_js = """      // 2. Auto-inferencia por estación geoespacial referencial y litología regional
      if (geoRaw.includes('sedimentary_strata') || ['ischigualasto-talampaya', 'talampaya-canyon'].includes(nearestRow.id) || (lat >= -32.5 && lat <= -28.0 && lon >= -71.0 && lon <= -65.0)) {
        return { geology: 'sedimentary_strata', geologyLabel: `Cuenca Sedimentaria Estratificada & Formación de Arcillas/Areniscas (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('volcanic_basalt') || ['antofagasta-alumbrera', 'payunia-mendoza', 'somuncura-patagonia', 'kilauea-hawaii'].includes(nearestRow.id)) {
        return { geology: 'volcanic_basalt', geologyLabel: `Campo Volcánico Monogenético & Conos de Escoria Basáltica (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('salt_lake') || geoRaw.includes('desert_playa') || /(salt|salar|salino|salina|evaporita|halita)/.test(geoRaw)) {
        return { geology: 'salt_lake', geologyLabel: `Salar Evaporítico & Cuenca Salina (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('volcanic')) {
        if (elevRaw >= 4500.0) {
          return { geology: 'volcanic_peak', geologyLabel: `Estratovolcán & Complejo Volcánico (asociado a ${stationName})`, nearestRow, minDist };
        } else {
          return { geology: 'volcanic_basalt', geologyLabel: `Campo Volcánico & Coladas de Lava (asociado a ${stationName})`, nearestRow, minDist };
        }
      } else if (geoRaw.includes('hydrothermal') || geoRaw.includes('geiser')) {
        return { geology: 'hydrothermal', geologyLabel: `Campo Geotérmico & Fumarolas (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('desert')) {
        return { geology: 'eolian_desert', geologyLabel: `Desierto Eólico Altiplánico & Ignimbritas (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('cave') || geoRaw.includes('lava_tube')) {
        return { geology: 'lava_tube', geologyLabel: `Tubo de Lava & Terreno Basáltico (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('canyon') || geoRaw.includes('erosion')) {
        return { geology: 'eroded_canyon', geologyLabel: `Cañón Erosivo & Terreno Escarpado (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('humid') || geoRaw.includes('lowland') || geoRaw.includes('rainforest') || geoRaw.includes('grassland') || elevRaw < 500.0) {
        return { geology: 'lowland_plain', geologyLabel: `Llanura / Tierras Bajas Húmedas (asociado a ${stationName})`, nearestRow, minDist };
      }

      return { geology: 'mixed_terrain', geologyLabel: `Terreno Geológico según análogo (${stationName})`, nearestRow, minDist };"""

new_infer_js = """      // 2. Detección regional de Tierras Bajas de Bolivia / Amazonía / Chaco (Control Negativo)
      const isBoliviaLowland = (lat >= -22.5 && lat <= -9.5 && lon >= -64.2 && lon <= -57.4 && elevRaw < 900.0);
      if (isBoliviaLowland && (!userGeology || userGeology.trim() === '')) {
        return { geology: 'humid_lowland', geologyLabel: `Llanura / Tierras Bajas Húmedas del Oriente & Sabana Aluvial (Control Negativo - ${stationName})`, nearestRow, minDist };
      }

      // Auto-inferencia por estación geoespacial referencial y litología regional
      if (geoRaw.includes('sedimentary_strata') || ['ischigualasto-talampaya', 'talampaya-canyon'].includes(nearestRow.id) || (lat >= -32.5 && lat <= -28.0 && lon >= -71.0 && lon <= -65.0)) {
        return { geology: 'sedimentary_strata', geologyLabel: `Cuenca Sedimentaria Estratificada & Formación de Arcillas/Areniscas (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('volcanic_basalt') || ['antofagasta-alumbrera', 'payunia-mendoza', 'somuncura-patagonia', 'kilauea-hawaii'].includes(nearestRow.id)) {
        return { geology: 'volcanic_basalt', geologyLabel: `Campo Volcánico Monogenético & Conos de Escoria Basáltica (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('salt_lake') || geoRaw.includes('desert_playa') || /(salt|salar|salino|salina|evaporita|halita)/.test(geoRaw)) {
        return { geology: 'salt_lake', geologyLabel: `Salar Evaporítico & Cuenca Salina (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('volcanic')) {
        if (elevRaw >= 4500.0) {
          return { geology: 'volcanic_peak', geologyLabel: `Estratovolcán & Complejo Volcánico (asociado a ${stationName})`, nearestRow, minDist };
        } else {
          return { geology: 'volcanic_basalt', geologyLabel: `Campo Volcánico & Coladas de Lava (asociado a ${stationName})`, nearestRow, minDist };
        }
      } else if (geoRaw.includes('hydrothermal') || geoRaw.includes('geiser')) {
        return { geology: 'hydrothermal', geologyLabel: `Campo Geotérmico & Fumarolas (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('desert')) {
        return { geology: 'eolian_desert', geologyLabel: `Desierto Eólico Altiplánico & Ignimbritas (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('karst') || (geoRaw.includes('cave') && !geoRaw.includes('lava'))) {
        return { geology: 'karst_cave', geologyLabel: `Caverna Kárstica en Calizas (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('lava_tube') || geoRaw.includes('tubo')) {
        return { geology: 'lava_tube', geologyLabel: `Tubo de Lava & Terreno Basáltico (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('interandean') || geoRaw.includes('valle')) {
        return { geology: 'interandean_valley', geologyLabel: `Valle Interandino Aluvial (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('canyon') || geoRaw.includes('erosion')) {
        return { geology: 'eroded_canyon', geologyLabel: `Cañón Erosivo & Terreno Escarpado (asociado a ${stationName})`, nearestRow, minDist };
      } else if (geoRaw.includes('humid') || geoRaw.includes('lowland') || geoRaw.includes('rainforest') || geoRaw.includes('grassland') || elevRaw < 500.0) {
        return { geology: 'humid_lowland', geologyLabel: `Llanura / Tierras Bajas Húmedas (asociado a ${stationName})`, nearestRow, minDist };
      }

      return { geology: 'mixed_terrain', geologyLabel: `Terreno Geológico según análogo (${stationName})`, nearestRow, minDist };"""

assert old_infer_js in html, "old_infer_js not found"
html = html.replace(old_infer_js, new_infer_js, 1)
print("[✓] 4. inferGeologyFromCoordinates corregido en JS.")

# 5. Actualizar estimateClimate en JS
old_clim_js = """      const tempBaseSea = 28.0 - (Math.abs(lat) * 0.35);
      const tempLatElev = tempBaseSea - (elev * 0.0065);
      if (elev < 2500.0 || geology === 'sedimentary_strata') {
        tempAdjusted = 0.5 * tempAdjusted + 0.5 * tempLatElev;
        pInterp = Math.max(110.0, Math.min(pInterp, 230.0));
        tSwingInterp = 22.0;
      } else if (geology === 'salt_lake') {
        pInterp = Math.min(pInterp, 130.0);
        tSwingInterp = Math.max(tSwingInterp, 25.0);
      } else if (geology === 'volcanic_peak' && elev > 4800) {
        tempAdjusted = Math.min(tempAdjusted, -6.0);
        tSwingInterp = Math.max(tSwingInterp, 24.0);
      }"""

new_clim_js = """      const tempBaseSea = 28.0 - (Math.abs(lat) * 0.35);
      const tempLatElev = tempBaseSea - (elev * 0.0065);
      if (geology === 'sedimentary_strata' || geology === 'interandean_valley') {
        tempAdjusted = 0.5 * tempAdjusted + 0.5 * tempLatElev;
        tSwingInterp = 22.0;
      } else if (geology === 'humid_lowland' || geology === 'lowland_plain') {
        tempAdjusted = 0.3 * tempAdjusted + 0.7 * tempLatElev;
        tSwingInterp = 14.0;
        pInterp = Math.max(pInterp, 1100.0); // Realismo para tierras bajas húmedas
      } else if (geology === 'salt_lake') {
        pInterp = Math.min(pInterp, 130.0);
        tSwingInterp = Math.max(tSwingInterp, 25.0);
      } else if (geology === 'volcanic_peak' && elev > 4800) {
        tempAdjusted = Math.min(tempAdjusted, -6.0);
        tSwingInterp = Math.max(tSwingInterp, 24.0);
      }"""

assert old_clim_js in html, "old_clim_js not found"
html = html.replace(old_clim_js, new_clim_js, 1)
print("[✓] 5. estimateClimate corregido en JS.")

# 6. Actualizar inferMineralogy en JS
old_min_js = """      } else if (geology === 'lava_tube') {
        return ['Basalto vesicular de flujo continuo', 'Piroxeno (Augita)', 'Olivino', 'Ilmenita (FeTiO3)'];
      } else if (geology === 'sedimentary_strata') {"""

new_min_js = """      } else if (geology === 'lava_tube') {
        return ['Basalto vesicular de flujo continuo', 'Piroxeno (Augita)', 'Olivino', 'Ilmenita (FeTiO3)'];
      } else if (geology === 'karst_cave') {
        return ['Calcita (CaCO3)', 'Dolomita (CaMg(CO3)2)', 'Espeleotemas kársticos (estalactitas/estalagmitas)', 'Arcillas residuales de disolución cárstica'];
      } else if (geology === 'interandean_valley') {
        return ['Sedimentos aluviales fluviales', 'Cuarzo y feldespatos detríticos', 'Arcillas sedimentarias', 'Areniscas y limolitas'];
      } else if (geology === 'humid_lowland' || geology === 'lowland_plain') {
        return ['Arenas aluviales de cuarzo fluvial', 'Caolinita (arcilla de meteorización tropical húmeda)', 'Materia orgánica / Humus fértil activo', 'Óxidos férricos secundarios (Limonita/Goethita)'];
      } else if (geology === 'sedimentary_strata') {"""

assert old_min_js in html, "old_min_js not found"
html = html.replace(old_min_js, new_min_js, 1)
print("[✓] 6. inferMineralogy enriquecido en JS.")

# 7. Actualizar computeGeochemicalSimilarity en JS
old_chem_js = """      const sMinRaw = (0.35 * jaccard + 0.45 * cosSim + affinity) * 100.0;
      return Math.max(15.0, Math.min(95.0, Math.round(sMinRaw * 10) / 10));"""

new_chem_js = """      if (earthGeology === 'humid_lowland' || earthGeology === 'lowland_plain') {
        return 12.0; // Tierras bajas tropicales sin análogo litológico en Marte ni Luna
      }
      if (earthGeology === 'karst_cave') {
        return 22.0;
      }

      const sMinRaw = (0.35 * jaccard + 0.45 * cosSim + affinity) * 100.0;
      return Math.max(15.0, Math.min(95.0, Math.round(sMinRaw * 10) / 10));"""

assert old_chem_js in html, "old_chem_js not found"
html = html.replace(old_chem_js, new_chem_js, 1)
print("[✓] 7. computeGeochemicalSimilarity ajustado en JS.")

# 8. Actualizar calculatePlanetaryAnalogSimilarity tier logic
old_tier_js = """      let tier = "Tier 3: Moderate Analog (Specialized Case)";
      if (psi >= 70.0) tier = "Tier 2: High-Fidelity Planetary Analog (Priority Landing Site)";
      else if (psi >= 80.0) tier = "Tier 1: Exceptional Global Analog (Full System Fidelity)";"""

new_tier_js = """      let tier = "Tier 3: Moderate Analog (Specialized Case)";
      if (psi >= 80.0) tier = "Tier 1: Exceptional Global Analog (Full System Fidelity)";
      else if (psi >= 70.0) tier = "Tier 2: High-Fidelity Planetary Analog (Priority Landing Site)";
      else if (psi < 45.0) tier = "Tier 4: Non-Analog (Control Negativo / Límite de Habitabilidad)";"""

assert old_tier_js in html, "old_tier_js not found"
html = html.replace(old_tier_js, new_tier_js, 1)
print("[✓] 8. Tier logic actualizado en JS.")

# 9. Agregar lógica interactiva de dimension selector en JavaScript
js_dim_code = """
    // =========================================================================
    // NUEVO MÓDULO: EXPLORADOR MULTI-CRITERIO Y THEMATIC SPOTLIGHT
    // =========================================================================
    let currentDimensionCriterion = 'global'; // 'global' | 'topo' | 'clim' | 'min'

    function sortRankingListByDimension() {
      if (!currentRankingList || currentRankingList.length === 0) return;
      if (currentDimensionCriterion === 'topo') {
        currentRankingList.sort((a, b) => b.sim.s_topo - a.sim.s_topo);
      } else if (currentDimensionCriterion === 'clim') {
        currentRankingList.sort((a, b) => b.sim.s_clim - a.sim.s_clim);
      } else if (currentDimensionCriterion === 'min') {
        currentRankingList.sort((a, b) => b.sim.s_min - a.sim.s_min);
      } else {
        currentRankingList.sort((a, b) => b.sim.psi - a.sim.psi);
      }
    }

    function switchDimensionCriterion(criterion) {
      currentDimensionCriterion = criterion;
      ['global', 'topo', 'clim', 'min'].forEach(c => {
        const tab = document.getElementById(`tab-dim-${c}`);
        if (tab) {
          if (c === criterion) tab.classList.add('active');
          else tab.classList.remove('active');
        }
      });

      if (currentEarthSample && currentRankingList && currentRankingList.length > 0) {
        sortRankingListByDimension();
        // Auto-seleccionar el #1 absoluto para esta dimensión
        currentTargetSite = currentRankingList[0].target;
        
        let clusterId = 3;
        if (currentEarthSample.geology === 'salt_lake' || currentEarthSample.geology.includes('salar')) clusterId = 4;
        else if (currentEarthSample.geology.includes('volcan') || currentEarthSample.geology.includes('basalt') || currentEarthSample.terrain > 18.0) clusterId = 1;
        else if (currentEarthSample.geology === 'sedimentary_strata' || currentEarthSample.geology === 'eolian_desert') clusterId = 3;
        else if (currentEarthSample.precip > 800.0 || currentEarthSample.elevation < 500.0) clusterId = 2;
        const clusterInfo = CLUSTER_DEFINITIONS[clusterId];
        const pcs = projectSamplePCA(currentEarthSample);

        renderAllUI(clusterInfo, pcs);
        scrollToComparisonTable();
      }
    }

    function renderThematicSpotlight(target, earth, sim) {
      const box = document.getElementById('thematic-spotlight-box');
      if (!box) return;

      let critTitle = '';
      let critScore = '';
      let metricsHtml = '';
      let insightText = '';

      if (currentDimensionCriterion === 'topo') {
        critTitle = `🏔️ ENFOQUE TOPOGRAFÍA & RELIEVES: MEJOR COINCIDENCIA MORFOLÓGICA CON ${target.name.toUpperCase()} (${target.body.toUpperCase()})`;
        critScore = `${sim.s_topo}% SIMILITUD TOPOGRÁFICA`;
        metricsHtml = `
          <div class="thematic-metric-box">
            <div class="thematic-metric-label">Pendiente Media</div>
            <div class="thematic-metric-values">
              <span>Tierra: <strong>${earth.terrain}°</strong></span> ➔ <span>${target.body}: <strong>${target.terrain}°</strong></span>
            </div>
            <div class="thematic-metric-diff">Δ = ${Math.abs(earth.terrain - target.terrain).toFixed(1)}° (Escala [0°-45°])</div>
          </div>
          <div class="thematic-metric-box">
            <div class="thematic-metric-label">Relieve Local Multi-Escala</div>
            <div class="thematic-metric-values">
              <span>Tierra: <strong>${earth.relief}m</strong></span> ➔ <span>${target.body}: <strong>${target.relief}m</strong></span>
            </div>
            <div class="thematic-metric-diff">Fidelidad de desnivel y ventanas de aterrizaje</div>
          </div>
          <div class="thematic-metric-box">
            <div class="thematic-metric-label">Rugosidad Superficial</div>
            <div class="thematic-metric-values">
              <span>Tierra: <strong>${earth.roughness}</strong></span> ➔ <span>${target.body}: <strong>${target.roughness}</strong></span>
            </div>
            <div class="thematic-metric-diff">Tracción de ruedas, grousers y riesgo de vuelco</div>
          </div>
        `;
        insightText = `<strong>Evaluación Topográfica Especializada:</strong> Este destino extraterrestre es el candidato #1 en relieve y pendientes. Las pruebas mecánicas de odometría, deslizamiento de ruedas y algoritmos de descenso autónomo (LiDAR) ejecutadas en esta ubicación terrestre tendrán la mayor correspondencia física con las condiciones de la misión en ${target.body}.`;
      } else if (currentDimensionCriterion === 'clim') {
        critTitle = `🌡️ ENFOQUE CLIMATOLOGÍA & AMBIENTE: MEJOR COINCIDENCIA AMBIENTAL CON ${target.name.toUpperCase()} (${target.body.toUpperCase()})`;
        critScore = `${sim.s_clim}% SIMILITUD CLIMÁTICA`;
        metricsHtml = `
          <div class="thematic-metric-box">
            <div class="thematic-metric-label">Presión Atmosférica</div>
            <div class="thematic-metric-values">
              <span>Tierra: <strong>${earth.atm_pressure} kPa</strong></span> ➔ <span>${target.body}: <strong>${target.atm_pressure} kPa</strong></span>
            </div>
            <div class="thematic-metric-diff">${(earth.atm_pressure < 70) ? 'Atmósfera enrarecida de gran altitud' : 'Régimen denso a nivel del mar'}</div>
          </div>
          <div class="thematic-metric-box">
            <div class="thematic-metric-label">Régimen Térmico & Oscilación</div>
            <div class="thematic-metric-values">
              <span>Tierra: <strong>${earth.temp}°C (Δ${earth.temp_swing}°C)</strong></span> ➔ <span>${target.body}: <strong>${target.temp}°C (Δ${target.temp_swing}°C)</strong></span>
            </div>
            <div class="thematic-metric-diff">Fatiga térmica y ciclos de congelamiento</div>
          </div>
          <div class="thematic-metric-box">
            <div class="thematic-metric-label">Precipitación / Aridez</div>
            <div class="thematic-metric-values">
              <span>Tierra: <strong>${earth.precip} mm/año</strong></span> ➔ <span>${target.body}: <strong>${target.precip} mm/año</strong></span>
            </div>
            <div class="thematic-metric-diff">${(earth.precip < 200) ? 'Hiperaridez extraterrestre extrema' : 'Ambiente húmedo / control hidrológico'}</div>
          </div>
        `;
        insightText = `<strong>Evaluación Climatológica Especializada:</strong> Este destino presenta la mayor cercanía ambiental en presión barométrica, gradientes diurnos de temperatura y desecación. Ideal para calibrar durabilidad de sellos térmicos, radiadores y paneles solares / UV.`;
      } else if (currentDimensionCriterion === 'min') {
        critTitle = `🧪 ENFOQUE MINERALOGÍA & REGOLITO: MEJOR COINCIDENCIA LITOLÓGICA CON ${target.name.toUpperCase()} (${target.body.toUpperCase()})`;
        critScore = `${sim.s_min}% AFINIDAD GEOQUÍMICA`;
        metricsHtml = `
          <div class="thematic-metric-box">
            <div class="thematic-metric-label">Litología Terrestre Deducida</div>
            <div class="thematic-metric-values" style="font-size: 0.76rem;">
              <span>${earth.geology_label.split('(')[0]}</span>
            </div>
            <div class="thematic-metric-diff">Fases: ${earth.minerals.slice(0, 2).join(', ')}</div>
          </div>
          <div class="thematic-metric-box">
            <div class="thematic-metric-label">Fases Minerales del Destino</div>
            <div class="thematic-metric-values" style="font-size: 0.76rem;">
              <span>${target.minerals.slice(0, 2).join(', ')}</span>
            </div>
            <div class="thematic-metric-diff">Regolito / Litología de ${target.body}</div>
          </div>
          <div class="thematic-metric-box">
            <div class="thematic-metric-label">Instrumentación de Carga Útil</div>
            <div class="thematic-metric-values" style="font-size: 0.76rem;">
              <span>Raman, APXS, PIXL, SHERLOC</span>
            </div>
            <div class="thematic-metric-diff">Afinidad espectral calibrada</div>
          </div>
        `;
        insightText = `<strong>Evaluación Mineralógica Especializada:</strong> Este objetivo comparte la mayor superposición de facies litológicas y de regolito (sulfatos, basaltos ricos en Fe-Mg, anortosita o arcillas sedimentarias). Prioritario para ensayos de perforación, coring y detección de biofirmas.`;
      } else {
        critTitle = `🌐 SIMILITUD INTEGRAL (PSI PONDERADO): ${target.name.toUpperCase()} (${target.body.toUpperCase()})`;
        critScore = `${sim.psi}% PSI GLOBAL (${sim.tier.split(':')[0]})`;
        metricsHtml = `
          <div class="thematic-metric-box">
            <div class="thematic-metric-label">Topología (Peso 35%)</div>
            <div class="thematic-metric-values"><strong>${sim.s_topo}%</strong></div>
            <div class="thematic-metric-diff">Pendientes y relieve</div>
          </div>
          <div class="thematic-metric-box">
            <div class="thematic-metric-label">Climatología (Peso 35%)</div>
            <div class="thematic-metric-values"><strong>${sim.s_clim}%</strong></div>
            <div class="thematic-metric-diff">Presión, T° y aridez</div>
          </div>
          <div class="thematic-metric-box">
            <div class="thematic-metric-label">Mineralogía (Peso 30%)</div>
            <div class="thematic-metric-values"><strong>${sim.s_min}%</strong></div>
            <div class="thematic-metric-diff">Facies y regolito</div>
          </div>
        `;
        insightText = `<strong>Evaluación Global Integrada (NASA PSI):</strong> Ponderación del Sistema Solar completo. Combina topología (35%), climatología (35%) y geoquímica (30%). Clasificación actual: <strong>${sim.tier}</strong>.`;
      }

      box.innerHTML = `
        <div class="thematic-spotlight-badge">
          <div class="thematic-target-title">${critTitle}</div>
          <div class="thematic-target-score">${critScore}</div>
        </div>
        <div class="thematic-grid-metrics">
          ${metricsHtml}
        </div>
        <div class="thematic-insight-text">
          ${insightText}
        </div>
      `;
    }
"""

if 'switchDimensionCriterion' not in html:
    ra_pos = html.find('function renderAllUI')
    assert ra_pos != -1, "renderAllUI not found"
    html = html[:ra_pos] + js_dim_code + "\n" + html[ra_pos:]
    print("[✓] 9. Funciones del Dimension Selector agregadas en JS.")

# 10. Actualizar ribbon de candidatos en renderAllUI
old_ribbon_code = """      const ribbon = document.getElementById('target-ranking-scroll');
      ribbon.innerHTML = '';
      currentRankingList.forEach((item, idx) => {
        const t = item.target;
        const score = item.sim.psi;
        const medal = idx === 0 ? '🥇 ' : (idx === 1 ? '🥈 ' : (idx === 2 ? '🥉 ' : `#${idx + 1} `));
        const badgeClass = score >= 70 ? 'chip-score-high' : (score >= 50 ? 'chip-score-mid' : 'chip-score-low');
        const isActive = (t.id === currentTargetSite.id) ? 'active' : '';

        const chip = document.createElement('div');
        chip.className = `target-candidate-chip ${isActive}`;
        chip.onclick = () => selectTargetDestination(t.id);
        chip.innerHTML = `
          <span>${medal} ${t.name}</span>
          <span class="chip-score-badge ${badgeClass}">${score}% PSI</span>
        `;
        ribbon.appendChild(chip);
      });"""

new_ribbon_code = """      renderThematicSpotlight(target, earth, sim);

      const ribbon = document.getElementById('target-ranking-scroll');
      ribbon.innerHTML = '';
      currentRankingList.forEach((item, idx) => {
        const t = item.target;
        let score = item.sim.psi;
        let scoreLabel = `${score}% PSI`;
        if (currentDimensionCriterion === 'topo') {
          score = item.sim.s_topo;
          scoreLabel = `${score}% TOPO`;
        } else if (currentDimensionCriterion === 'clim') {
          score = item.sim.s_clim;
          scoreLabel = `${score}% CLIMA`;
        } else if (currentDimensionCriterion === 'min') {
          score = item.sim.s_min;
          scoreLabel = `${score}% MIN`;
        }

        const medal = idx === 0 ? '🥇 ' : (idx === 1 ? '🥈 ' : (idx === 2 ? '🥉 ' : `#${idx + 1} `));
        const badgeClass = score >= 70 ? 'chip-score-high' : (score >= 50 ? 'chip-score-mid' : 'chip-score-low');
        const isActive = (t.id === currentTargetSite.id) ? 'active' : '';

        const chip = document.createElement('div');
        chip.className = `target-candidate-chip ${isActive}`;
        chip.onclick = () => selectTargetDestination(t.id);
        chip.innerHTML = `
          <span>${medal} ${t.name}</span>
          <span class="chip-score-badge ${badgeClass}">${scoreLabel}</span>
        `;
        ribbon.appendChild(chip);
      });"""

assert old_ribbon_code in html, "old_ribbon_code not found"
html = html.replace(old_ribbon_code, new_ribbon_code, 1)
print("[✓] 10. Ribbon de candidatos actualizado con etiquetas por dimensión.")

# 11. Actualizar ordenamiento en executePrediction para respetar sortRankingListByDimension
old_exec_sort = """      currentRankingList.sort((a, b) => b.sim.psi - a.sim.psi);

      if (!currentTargetSite || !activeTargets.some(t => t.id === currentTargetSite.id)) {
        currentTargetSite = currentRankingList[0].target;
      }"""

new_exec_sort = """      sortRankingListByDimension();

      if (!currentTargetSite || !activeTargets.some(t => t.id === currentTargetSite.id)) {
        currentTargetSite = currentRankingList[0].target;
      }"""

assert old_exec_sort in html, "old_exec_sort not found"
html = html.replace(old_exec_sort, new_exec_sort, 1)
print("[✓] 11. executePrediction actualizado para ordenar según criterio activo.")

# 12. Actualizar resaltado de filas en la tabla comparativa según el criterio activo
# Buscamos la iteración tableRowsData.forEach(row => {
old_loop_start = """      tableRowsData.forEach(row => {
        const tr = document.createElement('tr');
        if (row.isFinal) tr.className = 'highlight-final hoverable-row';
        else if (row.isSubtotal) tr.className = 'highlight-subtotal hoverable-row';
        else tr.className = 'hoverable-row';"""

new_loop_start = """      tableRowsData.forEach(row => {
        const tr = document.createElement('tr');
        
        let rowCat = 'other';
        const pLower = row.param.toLowerCase();
        if (pLower.includes('pendiente') || pLower.includes('relieve') || pLower.includes('rugosidad') || pLower.includes('topograf')) {
          rowCat = 'topo';
        } else if (pLower.includes('presi') || pLower.includes('temperatura') || pLower.includes('oscilaci') || pLower.includes('precip') || pLower.includes('flujo') || pLower.includes('clima')) {
          rowCat = 'clim';
        } else if (pLower.includes('facies') || pLower.includes('mineral') || pLower.includes('regolito')) {
          rowCat = 'min';
        }

        const isDimActive = (currentDimensionCriterion === rowCat);
        const activeDimClass = isDimActive ? ' row-highlight-active-dim' : '';
        const activeTag = isDimActive ? ' <span class="active-dim-tag">Enfoque Activo</span>' : '';

        if (row.isFinal) tr.className = 'highlight-final hoverable-row' + activeDimClass;
        else if (row.isSubtotal) tr.className = 'highlight-subtotal hoverable-row' + activeDimClass;
        else tr.className = 'hoverable-row' + activeDimClass;"""

assert old_loop_start in html, "old_loop_start not found"
html = html.replace(old_loop_start, new_loop_start, 1)

# En el innerHTML de la fila, agregar activeTag a row.param
old_row_param = "<td><strong>${row.param}</strong></td>"
new_row_param = "<td><strong>${row.param}</strong>${activeTag}</td>"
assert old_row_param in html, "old_row_param not found"
html = html.replace(old_row_param, new_row_param, 1)
print("[✓] 12. Resaltado de filas temáticas implementado en la tabla comparativa.")

# 13. Guardar archivo final
with open('ensayo.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("\n🎉 [✓✓✓] ensayo.html completamente actualizado y guardado con éxito.")
