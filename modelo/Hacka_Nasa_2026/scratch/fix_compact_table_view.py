import re

with open('ensayo.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update presets CSS to be single-row horizontal scroll
old_presets_css = """    .presets-box {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .presets-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--text-muted);
    }

    .presets-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
    }

    .preset-chip {
      background: rgba(22, 34, 60, 0.75);
      border: 1px solid var(--card-border);
      color: #cbd5e1;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.73rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;
    }"""

new_presets_css = """    .presets-box {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      min-width: 0;
      max-width: 100%;
      overflow: hidden;
    }

    .presets-label {
      font-size: 0.70rem;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--text-muted);
    }

    .presets-container {
      display: flex;
      flex-wrap: nowrap;
      overflow-x: auto;
      overflow-y: hidden;
      gap: 0.40rem;
      padding-bottom: 5px;
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box;
      scrollbar-width: thin;
      scrollbar-color: var(--accent) rgba(14, 23, 46, 0.75);
    }
    .presets-container::-webkit-scrollbar {
      height: 4px;
    }
    .presets-container::-webkit-scrollbar-thumb {
      background: var(--accent);
      border-radius: 2px;
    }

    .preset-chip {
      background: rgba(22, 34, 60, 0.75);
      border: 1px solid var(--card-border);
      color: #cbd5e1;
      padding: 0.28rem 0.65rem;
      border-radius: 6px;
      font-size: 0.71rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      white-space: nowrap;
      flex-shrink: 0;
      transition: all 0.2s;
    }"""

if old_presets_css in content:
    content = content.replace(old_presets_css, new_presets_css)
else:
    print("WARNING: old_presets_css not found!")

# 2. Update button label to "ENVIAR COORDENADAS Y VER TABLA COMPARATIVA 👇"
content = content.replace("ENVIAR COORDENADAS Y EVALUAR ANÁLOGO", "ENVIAR COORDENADAS Y VER TABLA COMPARATIVA 👇")

# 3. Merge Card 2 (psi-summary-bar) directly into Table Section
old_cards_split = """    <!-- 2. RESUMEN DEL ÍNDICE DE SIMILITUD PLANETARIA (PSI) -->
    <section class="section-card psi-summary-bar">
      <div class="psi-summary-grid">
        <div class="psi-summary-score">
          <div class="psi-circle" id="psi-circle" onmouseenter="showMetricHover('psi', event)" onmousemove="moveMetricHover(event)" onmouseleave="hideMetricHover()">
            <div class="psi-inner">
              <span class="psi-number" id="psi-main-val">71.3%</span>
              <span class="psi-sub">SIMILITUD</span>
            </div>
          </div>
          <div id="psi-tier-badge" style="font-size: 0.72rem; font-weight: 800; color: #4ade80;">Tier 2: High-Fidelity Analog</div>
        </div>

        <div class="psi-summary-bars">
          <div class="formula-banner" style="margin-bottom: 0.35rem;" onmouseenter="showMetricHover('formula', event)" onmousemove="moveMetricHover(event)" onmouseleave="hideMetricHover()">
            <span>📐 <strong>Fórmula Ponderada:</strong> PSI = 0.35·S_topo + 0.35·S_clim + 0.30·S_min</span>
            <span style="font-size: 0.70rem; text-decoration: underline;">Ver desglose ℹ️</span>
          </div>

          <div class="subscore-item" onmouseenter="showMetricHover('slope', event)" onmousemove="moveMetricHover(event)" onmouseleave="hideMetricHover()">
            <div class="subscore-label-row">
              <span style="color: #cbd5e1; font-weight: 600;">🏔️ Similitud Topográfica & Relieve (S_topo) — Peso 35%</span>
              <span style="color: var(--accent); font-weight: 800;" id="bar-val-topo">89.3%</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" id="bar-fill-topo" style="width: 89.3%; background: var(--accent);"></div>
            </div>
          </div>

          <div class="subscore-item" onmouseenter="showMetricHover('temp', event)" onmousemove="moveMetricHover(event)" onmouseleave="hideMetricHover()">
            <div class="subscore-label-row">
              <span style="color: #cbd5e1; font-weight: 600;">🌡️ Similitud Climatológica & Radiación (S_clim) — Peso 35%</span>
              <span style="color: #38bdf8; font-weight: 800;" id="bar-val-clim">46.5%</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" id="bar-fill-clim" style="width: 46.5%; background: #38bdf8;"></div>
            </div>
          </div>

          <div class="subscore-item" onmouseenter="showMetricHover('family', event)" onmousemove="moveMetricHover(event)" onmouseleave="hideMetricHover()">
            <div class="subscore-label-row">
              <span style="color: #cbd5e1; font-weight: 600;">🧪 Similitud Mineralógica & Regolito (S_min) — Peso 30%</span>
              <span style="color: #a855f7; font-weight: 800;" id="bar-val-min">79.2%</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" id="bar-fill-min" style="width: 79.2%; background: #a855f7;"></div>
            </div>
          </div>
        </div>

        <div class="earth-summary-card" id="earth-quick-summary">
        </div>
      </div>
    </section>

    <!-- 3. TABLA COMPARATIVA LADO A LADO: TIERRA VS DESTINO PLANETARIO (CENTRAL) -->
    <section class="section-card">
      <div class="section-header">
        <div>
          <div class="section-title">⚖️ TABLA COMPARATIVA LADO A LADO: TIERRA VS DESTINO PLANETARIO</div>
          <div class="section-desc">Auditoría completa de los 16 parámetros geofísicos con normalización de escala planetaria y fuentes oficiales de datos al lado. Pasa el cursor sobre cualquier fila para auditar el cálculo.</div>
        </div>
      </div>

      <div class="table-responsive">"""

new_cards_merged = """    <!-- 2. TABLA COMPARATIVA LADO A LADO: TIERRA VS DESTINO PLANETARIO (CON RESUMEN PSI INTEGRADO) -->
    <section class="section-card" id="comparison-table-section">
      <div class="section-header">
        <div>
          <div class="section-title">⚖️ TABLA COMPARATIVA LADO A LADO: TIERRA VS DESTINO PLANETARIO</div>
          <div class="section-desc">Auditoría cuantitativa de los 16 parámetros geofísicos con normalización de escala planetaria y fuentes oficiales de datos al lado. Pasa el cursor sobre cualquier fila para auditar el cálculo.</div>
        </div>
      </div>

      <!-- RESUMEN EJECUTIVO DEL ÍNDICE DE SIMILITUD PLANETARIA (PSI) -->
      <div class="psi-summary-grid" style="margin-bottom: 1.15rem; padding: 0.9rem 1.1rem; background: rgba(8, 14, 28, 0.85); border: 1px solid rgba(0, 242, 254, 0.25); border-radius: 8px;">
        <div class="psi-summary-score">
          <div class="psi-circle" id="psi-circle" onmouseenter="showMetricHover('psi', event)" onmousemove="moveMetricHover(event)" onmouseleave="hideMetricHover()" style="width: 95px; height: 95px;">
            <div class="psi-inner" style="width: 78px; height: 78px;">
              <span class="psi-number" id="psi-main-val" style="font-size: 1.55rem;">71.3%</span>
              <span class="psi-sub" style="font-size: 0.58rem;">SIMILITUD</span>
            </div>
          </div>
          <div id="psi-tier-badge" style="font-size: 0.70rem; font-weight: 800; color: #4ade80; text-align: center;">Tier 2: High-Fidelity Analog</div>
        </div>

        <div class="psi-summary-bars">
          <div class="formula-banner" style="margin-bottom: 0.35rem; padding: 0.35rem 0.65rem;" onmouseenter="showMetricHover('formula', event)" onmousemove="moveMetricHover(event)" onmouseleave="hideMetricHover()">
            <span>📐 <strong>Fórmula Ponderada:</strong> PSI = 0.35·S_topo + 0.35·S_clim + 0.30·S_min</span>
            <span style="font-size: 0.68rem; text-decoration: underline;">Ver desglose ℹ️</span>
          </div>

          <div class="subscore-item" onmouseenter="showMetricHover('slope', event)" onmousemove="moveMetricHover(event)" onmouseleave="hideMetricHover()">
            <div class="subscore-label-row">
              <span style="color: #cbd5e1; font-weight: 600;">🏔️ Similitud Topográfica & Relieve (S_topo) — Peso 35%</span>
              <span style="color: var(--accent); font-weight: 800;" id="bar-val-topo">89.3%</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" id="bar-fill-topo" style="width: 89.3%; background: var(--accent);"></div>
            </div>
          </div>

          <div class="subscore-item" onmouseenter="showMetricHover('temp', event)" onmousemove="moveMetricHover(event)" onmouseleave="hideMetricHover()">
            <div class="subscore-label-row">
              <span style="color: #cbd5e1; font-weight: 600;">🌡️ Similitud Climatológica & Radiación (S_clim) — Peso 35%</span>
              <span style="color: #38bdf8; font-weight: 800;" id="bar-val-clim">46.5%</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" id="bar-fill-clim" style="width: 46.5%; background: #38bdf8;"></div>
            </div>
          </div>

          <div class="subscore-item" onmouseenter="showMetricHover('family', event)" onmousemove="moveMetricHover(event)" onmouseleave="hideMetricHover()">
            <div class="subscore-label-row">
              <span style="color: #cbd5e1; font-weight: 600;">🧪 Similitud Mineralógica & Regolito (S_min) — Peso 30%</span>
              <span style="color: #a855f7; font-weight: 800;" id="bar-val-min">79.2%</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" id="bar-fill-min" style="width: 79.2%; background: #a855f7;"></div>
            </div>
          </div>
        </div>

        <div class="earth-summary-card" id="earth-quick-summary">
        </div>
      </div>

      <!-- TABLA COMPARATIVA CON DATOS LADO A LADO Y FUENTES AL LADO -->
      <div class="table-responsive">"""

if old_cards_split in content:
    content = content.replace(old_cards_split, new_cards_merged)
else:
    print("WARNING: old_cards_split not found!")

# 4. Add scrollToComparisonTable() function in JS
js_scroll_fn = """
    function scrollToComparisonTable() {
      const tableSec = document.getElementById('comparison-table-section');
      if (tableSec) {
        tableSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
"""

if "function scrollToComparisonTable()" not in content:
    content = content.replace("async function runMLPredictionFromInputs() {", js_scroll_fn + "\n    async function runMLPredictionFromInputs() {")

# Update runMLPredictionFromInputs to call scrollToComparisonTable
content = content.replace("await executePrediction(latIn, lonIn, areaIn, geoIn);", "await executePrediction(latIn, lonIn, areaIn, geoIn);\n      scrollToComparisonTable();")

# Update loadPreset to call scrollToComparisonTable
content = content.replace("await executePrediction(lat, lon, areaKm2, geologyStr);", "await executePrediction(lat, lon, areaKm2, geologyStr);\n      scrollToComparisonTable();")

# Update selectTargetDestination to call scrollToComparisonTable
content = content.replace("executePrediction(currentEarthSample.lat, currentEarthSample.lon, currentEarthSample.area_km2, geoIn);", "executePrediction(currentEarthSample.lat, currentEarthSample.lon, currentEarthSample.area_km2, geoIn);\n        scrollToComparisonTable();")

with open('ensayo.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Compact table layout and auto-scroll applied successfully!")
