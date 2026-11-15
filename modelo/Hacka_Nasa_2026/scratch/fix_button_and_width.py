with open('ensayo.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CSS
old_css_grid = """    .setup-grid {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: 1.25rem;
    }
    @media (max-width: 950px) {
      .setup-grid { grid-template-columns: 1fr; }
    }

    .setup-box {
      background: rgba(14, 23, 46, 0.75);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }"""

new_css_grid = """    .setup-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 390px);
      gap: 1.25rem;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      align-items: start;
    }
    @media (max-width: 1020px) {
      .setup-grid { grid-template-columns: 1fr; }
    }

    .setup-box {
      background: rgba(14, 23, 46, 0.75);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box;
      overflow: hidden;
    }

    .btn-submit-coords {
      width: 100%;
      height: 42px;
      font-size: 0.86rem;
      font-weight: 900;
      letter-spacing: 0.3px;
      background: linear-gradient(135deg, #0284c7 0%, #00f2fe 100%);
      box-shadow: 0 4px 18px var(--accent-glow);
      margin-top: 0.2rem;
      cursor: pointer;
    }

    .btn-recalc-target {
      width: 100%;
      height: 38px;
      font-size: 0.80rem;
      font-weight: 800;
      background: rgba(14, 28, 56, 0.9);
      border: 1px solid var(--accent);
      color: var(--accent);
      box-shadow: none;
      margin-top: 0.25rem;
      cursor: pointer;
    }
    .btn-recalc-target:hover {
      background: rgba(0, 242, 254, 0.18);
      color: #ffffff;
      box-shadow: 0 0 12px var(--accent-glow);
    }"""

if old_css_grid in content:
    content = content.replace(old_css_grid, new_css_grid)
else:
    print("WARNING: old_css_grid not found directly, checking partial match...")

# Also update target-selection-box and ranking-chips-scroll in CSS
old_target_box_css = """    .target-selection-box {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }"""

new_target_box_css = """    .target-selection-box {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      min-width: 0;
      max-width: 100%;
      width: 100%;
      box-sizing: border-box;
      overflow: hidden;
    }"""

if old_target_box_css in content:
    content = content.replace(old_target_box_css, new_target_box_css)

old_chips_scroll_css = """    .ranking-chips-scroll {
      display: flex;
      gap: 0.55rem;
      overflow-x: auto;
      padding-bottom: 4px;
    }"""

new_chips_scroll_css = """    .ranking-chips-scroll {
      display: flex;
      gap: 0.45rem;
      overflow-x: auto;
      overflow-y: hidden;
      padding-bottom: 6px;
      min-width: 0;
      max-width: 100%;
      width: 100%;
      box-sizing: border-box;
      scrollbar-width: thin;
      scrollbar-color: var(--accent) rgba(14, 23, 46, 0.75);
    }
    .ranking-chips-scroll::-webkit-scrollbar {
      height: 5px;
    }
    .ranking-chips-scroll::-webkit-scrollbar-track {
      background: rgba(6, 12, 26, 0.8);
      border-radius: 3px;
    }
    .ranking-chips-scroll::-webkit-scrollbar-thumb {
      background: var(--accent);
      border-radius: 3px;
    }"""

if old_chips_scroll_css in content:
    content = content.replace(old_chips_scroll_css, new_chips_scroll_css)

# Update HTML in Section 1
old_setup_html = """      <div class="setup-grid">
        <!-- COLUMNA A: UBICACIÓN EN LA TIERRA -->
        <div class="setup-box">
          <div class="setup-box-title">
            <span>🌐</span> UBICACIÓN TERRESTRE A EVALUAR
          </div>
          <div class="input-form-grid-compact">
            <div class="form-group">
              <label for="input-lat">🌐 Latitud (°)</label>
              <input type="number" id="input-lat" value="-20.13" step="0.0001" min="-90" max="90" placeholder="-20.1300">
            </div>
            <div class="form-group">
              <label for="input-lon">🌐 Longitud (°)</label>
              <input type="number" id="input-lon" value="-67.49" step="0.0001" min="-180" max="180" placeholder="-67.4900">
            </div>
            <div class="form-group">
              <label for="input-area">📐 Área (km²)</label>
              <input type="number" id="input-area" value="50.0" step="0.1" min="0.1" max="100000" placeholder="50.0">
            </div>
            <div class="form-group form-group-geo">
              <label for="input-geology">🪨 Tipo Geológico / Suelo (Opcional)</label>
              <input type="text" id="input-geology" placeholder="Ej. basalto volcánico, salar (o vacío para auto-inferir)">
            </div>
          </div>

          <div class="presets-box">
            <div class="presets-label">⚡ Coordenadas Rápidas de Prueba (Haz clic para cargar):</div>
            <div class="presets-container" id="presets-container">"""

new_setup_html = """      <div class="setup-grid">
        <!-- COLUMNA A: UBICACIÓN EN LA TIERRA -->
        <div class="setup-box">
          <div class="setup-box-title">
            <span>🌐</span> UBICACIÓN TERRESTRE A EVALUAR
          </div>
          <div class="input-form-grid-compact">
            <div class="form-group">
              <label for="input-lat">🌐 Latitud (°)</label>
              <input type="number" id="input-lat" value="-20.13" step="0.0001" min="-90" max="90" placeholder="-20.1300" onkeydown="if(event.key==='Enter') runMLPredictionFromInputs()">
            </div>
            <div class="form-group">
              <label for="input-lon">🌐 Longitud (°)</label>
              <input type="number" id="input-lon" value="-67.49" step="0.0001" min="-180" max="180" placeholder="-67.4900" onkeydown="if(event.key==='Enter') runMLPredictionFromInputs()">
            </div>
            <div class="form-group">
              <label for="input-area">📐 Área (km²)</label>
              <input type="number" id="input-area" value="50.0" step="0.1" min="0.1" max="100000" placeholder="50.0" onkeydown="if(event.key==='Enter') runMLPredictionFromInputs()">
            </div>
            <div class="form-group form-group-geo">
              <label for="input-geology">🪨 Tipo Geológico / Suelo (Opcional)</label>
              <input type="text" id="input-geology" placeholder="Ej. basalto volcánico, salar (o vacío para auto-inferir)" onkeydown="if(event.key==='Enter') runMLPredictionFromInputs()">
            </div>
          </div>

          <!-- BOTÓN DIRECTO PARA ENVIAR LATITUD Y LONGITUD -->
          <button class="btn-run-ml btn-submit-coords" onclick="runMLPredictionFromInputs()">
            <span>⚡</span> ENVIAR COORDENADAS Y EVALUAR ANÁLOGO
          </button>

          <div class="presets-box">
            <div class="presets-label">⚡ O Carga Rápida de Coordenadas de Referencia:</div>
            <div class="presets-container" id="presets-container">"""

if old_setup_html in content:
    content = content.replace(old_setup_html, new_setup_html)
else:
    print("WARNING: old_setup_html not found directly!")

# Also update the right button in Column B
old_target_btn = """          <button class="btn-run-ml" onclick="runMLPredictionFromInputs()" style="width: 100%; margin-top: 0.8rem;">
            <span>⚡</span> ACTUALIZAR TABLA COMPARATIVA
          </button>"""

new_target_btn = """          <button class="btn-run-ml btn-recalc-target" onclick="runMLPredictionFromInputs()">
            <span>🔄</span> ACTUALIZAR TABLA COMPARATIVA
          </button>"""

if old_target_btn in content:
    content = content.replace(old_target_btn, new_target_btn)
else:
    print("WARNING: old_target_btn not found directly!")

# In section-card ensure overflow is hidden
old_sec_card = """.section-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.35rem;
      box-shadow: 0 10px 32px rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(12px);
    }"""

new_sec_card = """.section-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.35rem;
      box-shadow: 0 10px 32px rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(12px);
      box-sizing: border-box;
      max-width: 100%;
      overflow: hidden;
    }"""

if old_sec_card in content:
    content = content.replace(old_sec_card, new_sec_card)

with open('ensayo.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied fix successfully!")
