import re

with open('ensayo.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CSS
css_to_add = """
    /* --- REDISEÑO: COMPARACIÓN LADO A LADO DIRECTA --- */
    .setup-grid {
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
    }

    .setup-box-title {
      font-size: 0.85rem;
      font-weight: 800;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 0.4rem;
    }

    .input-form-grid-compact {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.65rem;
    }
    @media (max-width: 600px) {
      .input-form-grid-compact { grid-template-columns: 1fr; }
    }

    .form-group-geo {
      grid-column: 1 / -1;
    }

    .target-selection-box {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .target-selection-label {
      font-size: 0.70rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    /* PSI SUMMARY BAR */
    .psi-summary-bar {
      padding: 1rem 1.35rem;
      background: rgba(11, 19, 38, 0.95);
      border: 1px solid rgba(0, 242, 254, 0.3);
      box-shadow: 0 4px 20px rgba(0, 242, 254, 0.1);
    }

    .psi-summary-grid {
      display: grid;
      grid-template-columns: 170px 1.4fr 1.15fr;
      gap: 1.25rem;
      align-items: center;
    }

    @media (max-width: 1050px) {
      .psi-summary-grid { grid-template-columns: 160px 1fr; }
      .earth-summary-card { grid-column: 1 / -1; }
    }
    @media (max-width: 700px) {
      .psi-summary-grid { grid-template-columns: 1fr; }
    }

    .psi-summary-score {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .psi-summary-bars {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .earth-summary-card {
      background: rgba(6, 12, 26, 0.85);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 0.75rem 0.95rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      line-height: 1.35;
    }

    /* ADVANCED DETAILS TOGGLE */
    .advanced-audit-details {
      background: rgba(8, 14, 28, 0.85);
      border: 1px dashed var(--card-border);
      padding: 0.9rem 1.2rem;
      border-radius: 10px;
      transition: all 0.3s;
    }

    .advanced-audit-details[open] {
      border-style: solid;
      border-color: rgba(0, 242, 254, 0.35);
      padding: 1.35rem;
    }

    .advanced-audit-summary {
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
      outline: none;
      list-style: none;
    }
    .advanced-audit-summary::-webkit-details-marker {
      display: none;
    }

    .advanced-audit-pill {
      background: rgba(0, 242, 254, 0.12);
      border: 1px solid var(--accent);
      color: var(--accent);
      padding: 0.25rem 0.65rem;
      border-radius: 12px;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.4px;
    }

    .advanced-audit-content {
      margin-top: 1.2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 0.8rem;
    }
"""

if "/* --- REDISEÑO: COMPARACIÓN LADO A LADO DIRECTA --- */" not in content:
    content = content.replace("</style>", css_to_add + "\n  </style>")

# 2. Update <main> block
new_main_content = """  <main>

    <!-- 1. SELECCIÓN DE LUGARES A COMPARAR (TIERRA VS DESTINO PLANETARIO) -->
    <section class="section-card">
      <div class="section-header">
        <div>
          <div class="section-title">📍 1. Selección de Lugares a Comparar: Tierra vs Destino Extraterrestre</div>
          <div class="section-desc">Ingresa coordenadas de la Tierra o selecciona un análogo de referencia, y elige el cuerpo celeste y región de destino para contrastar lado a lado.</div>
        </div>
      </div>

      <div class="setup-grid">
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
            <div class="presets-container" id="presets-container">
              <button class="preset-chip active" onclick="loadPreset(-20.13, -67.49, 50.0, 'salar', this)">🇧🇴 Salar de Uyuni (-20.13°, -67.49°, 3,656m, 50 km²)</button>
              <button class="preset-chip" onclick="loadPreset(-18.11, -68.88, 20.0, 'volcan andesita', this)">🇧🇴 Nevado Sajama (-18.11°, -68.88°, 6,542m, 20 km²)</button>
              <button class="preset-chip" onclick="loadPreset(-26.62, -67.50, 80.0, 'basalto volcanico', this)">🌋 Antofagasta de la Sierra (-26.62°, -67.50°, 80 km² [Basalto])</button>
              <button class="preset-chip" onclick="loadPreset(-30.01, -67.95, 120.0, 'arcillas rojas y oxidos de hierro', this)">🏺 Ischigualasto / Talampaya (-30.01°, -67.95°, 120 km² [Arcillas])</button>
              <button class="preset-chip" onclick="loadPreset(-22.20, -67.78, 60.0, 'salar', this)">🇧🇴 Laguna Colorada (-22.20°, -67.78°, 4,278m, 60 km²)</button>
              <button class="preset-chip" onclick="loadPreset(-22.43, -67.76, 15.0, 'campo hidrotermal', this)">🇧🇴 Sol de Mañana (-22.43°, -67.76°, 4,850m, 15 km²)</button>
              <button class="preset-chip" onclick="loadPreset(-16.57, -68.09, 5.0, 'erosion badlands', this)">🇧🇴 Valle de la Luna (-16.57°, -68.09°, 3,400m, 5 km²)</button>
              <button class="preset-chip" onclick="loadPreset(-24.08, -69.92, 100.0, 'desierto eolico', this)">🇨🇱 Desierto de Atacama (-24.08°, -69.92°, 100 km²)</button>
              <button class="preset-chip" onclick="loadPreset(-77.50, 162.50, 80.0, 'polar permafrost', this)">🇦🇶 Valles Secos McMurdo (-77.50°, 162.50°, 80 km²)</button>
              <button class="preset-chip" onclick="loadPreset(75.38, -89.68, 200.0, 'crater impacto', this)">🇨🇦 Cráter Haughton (75.38°, -89.68°, 200 km²)</button>
              <button class="preset-chip" onclick="loadPreset(-16.50, -68.15, 10.0, 'valle andino', this)">🇧🇴 La Paz Centro (-16.50°, -68.15°, 3,640m, 10 km²)</button>
              <button class="preset-chip" onclick="loadPreset(-16.51, -68.19, 25.0, 'altiplano', this)">🇧🇴 El Alto (-16.51°, -68.19°, 4,061m, 25 km²)</button>
              <button class="preset-chip" onclick="loadPreset(-17.39, -66.16, 30.0, 'valle interandino', this)">🇧🇴 Cochabamba (-17.39°, -66.16°, 2,558m, 30 km²)</button>
              <button class="preset-chip" onclick="loadPreset(-17.78, -63.18, 80.0, 'tierras bajas', this)">🇧🇴 Santa Cruz de la Sierra (-17.78°, -63.18°, 416m, 80 km²)</button>
              <button class="preset-chip" onclick="loadPreset(-19.58, -65.75, 15.0, 'cerro rico mineria', this)">🇧🇴 Potosí (-19.58°, -65.75°, 4,067m, 15 km²)</button>
            </div>
          </div>
        </div>

        <!-- COLUMNA B: PLANETA Y REGIÓN DE DESTINO -->
        <div class="setup-box">
          <div class="setup-box-title">
            <span>🚀</span> PLANETA Y REGIÓN DE DESTINO
          </div>
          <div class="planet-toggle-row">
            <button class="planet-btn mars-btn active" id="btn-mars" onclick="switchPlanetTarget('mars')">
              <span>🔴</span> MARTE (8 Misiones y Cuencas)
            </button>
            <button class="planet-btn moon-btn" id="btn-moon" onclick="switchPlanetTarget('moon')">
              <span>⚪</span> LUNA (7 Misiones Artemis)
            </button>
          </div>

          <div class="target-selection-box">
            <div class="target-selection-label">
              <span>🎖️</span> Regiones Extraterrestres Disponibles (Haz clic para comparar):
            </div>
            <div class="ranking-chips-scroll" id="target-ranking-scroll">
            </div>
          </div>

          <button class="btn-run-ml" onclick="runMLPredictionFromInputs()" style="width: 100%; margin-top: 0.8rem;">
            <span>⚡</span> ACTUALIZAR TABLA COMPARATIVA
          </button>
        </div>
      </div>
    </section>

    <!-- 2. RESUMEN DEL ÍNDICE DE SIMILITUD PLANETARIA (PSI) -->
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

      <div class="table-responsive">
        <table class="audit-table">
          <thead>
            <tr>
              <th style="width: 22%;">Parámetro Analizado</th>
              <th style="width: 20%;" id="th-earth-name">Ubicación Ingresada (Tierra)</th>
              <th style="width: 20%;" id="th-target-name">Destino Extraterrestre</th>
              <th style="width: 18%;">Similitud & Normalización</th>
              <th style="width: 20%;">📚 Fuente Oficial & Cita Científica</th>
            </tr>
          </thead>
          <tbody id="audit-table-body">
          </tbody>
        </table>
      </div>
    </section>

    <!-- 4. AUDITORÍA TÉCNICA AVANZADA: GEOFÍSICA DEDUCIDA, ESPACIO LATENTE PCA 3D Y CONSOLA ML (COLAPSABLE) -->
    <details class="section-card advanced-audit-details">
      <summary class="advanced-audit-summary">
        <span style="font-size: 0.88rem; font-weight: 800; color: var(--accent); display: flex; align-items: center; gap: 0.5rem;">
          <span>🔬</span> MOSTRAR AUDITORÍA TÉCNICA AVANZADA: GEOFÍSICA DEDUCIDA, ESPACIO LATENTE PCA 3D Y CONSOLA ML
        </span>
        <span class="advanced-audit-pill">Opcional / Clic para desplegar ▼</span>
      </summary>

      <div class="advanced-audit-content">
        <!-- Geología y Geofísica deducida -->
        <div style="margin-top: 0.8rem; margin-bottom: 0.5rem; font-size: 0.82rem; font-weight: 800; color: #38bdf8; text-transform: uppercase;">
          🔍 Geología y Geofísica Deducida por el Modelo (Tierra)
        </div>
        <div class="geophysics-grid" id="inferred-geophysics-grid">
        </div>

        <!-- Clasificación de cluster & PCA 3D -->
        <div style="margin-top: 1.2rem; margin-bottom: 0.5rem; font-size: 0.82rem; font-weight: 800; color: #38bdf8; text-transform: uppercase;">
          🧠 Clasificación de Cluster Geomorfológico & Espacio Latente PCA 3D
        </div>
        <div class="cluster-pca-grid">
          <div class="cluster-card" id="cluster-info-card">
          </div>

          <div class="pca-card">
            <div class="geo-card-header">
              <span>🧬</span> PROYECCIÓN EN ESPACIO LATENTE (PCA 3D)
            </div>
            <p style="font-size: 0.72rem; color: #94a3b8;">Coordenadas en los 3 componentes principales universales:</p>
            <div class="pca-coord-grid">
              <div class="pca-coord-box">
                <div class="pca-coord-label">PC1 (Eje 1)</div>
                <div class="pca-coord-val" id="pca-pc1">+0.000</div>
                <div class="pca-coord-var">42.7% Varianza</div>
              </div>
              <div class="pca-coord-box">
                <div class="pca-coord-label">PC2 (Eje 2)</div>
                <div class="pca-coord-val" id="pca-pc2">+0.000</div>
                <div class="pca-coord-var">29.4% Varianza</div>
              </div>
              <div class="pca-coord-box">
                <div class="pca-coord-label">PC3 (Eje 3)</div>
                <div class="pca-coord-val" id="pca-pc3">+0.000</div>
                <div class="pca-coord-var">12.4% Varianza</div>
              </div>
            </div>
            <div style="font-size: 0.72rem; color: #cbd5e1; line-height: 1.4; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.4rem;">
              <div>• Varianza total conservada: <strong style="color: var(--accent);">84.6%</strong></div>
              <div id="pca-cosine-text">• Similitud Coseno latente vs Destino: <strong>--</strong></div>
              <div id="pca-dist-text">• Distancia Euclidiana latente ($d_{pca}$): <strong>--</strong></div>
            </div>
          </div>
        </div>

        <!-- Consola de Terminal de IA -->
        <div style="margin-top: 1.2rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 0.82rem; font-weight: 800; color: #38bdf8; text-transform: uppercase;">
            💻 Consola de Terminal de IA (`python predict_planetary_analog.py`)
          </div>
          <button class="btn-copy-terminal" onclick="copyTerminalText()">📋 Copiar Log de Consola</button>
        </div>
        <div class="terminal-container">
          <div class="terminal-header">
            <div class="terminal-dots">
              <div class="dot dot-red"></div>
              <div class="dot dot-yellow"></div>
              <div class="dot dot-green"></div>
            </div>
            <div class="terminal-title">
              <span>bash - python predict_planetary_analog.py --lat <span id="term-lat">-20.13</span> --lon <span id="term-lon">-67.49</span> --area <span id="term-area">50.0</span></span>
            </div>
            <div style="font-size: 0.65rem; color: #4ade80;">● ML RUNTIME OK</div>
          </div>
          <pre class="terminal-body" id="terminal-output-text">
          </pre>
        </div>

        <!-- Recomendaciones de Misión y Límites -->
        <div class="cards-2col" style="margin-top: 1.2rem;">
          <div class="defense-card">
            <div class="defense-card-title">
              <span>🛠️</span> Recomendaciones Operativas para Ensayos de Misión (NASA / ESA)
            </div>
            <div class="defense-list" id="recommendations-container" style="font-size: 0.75rem;">
            </div>
          </div>

          <div class="limits-box">
            <div class="defense-card-title" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">
              <span>⚠️</span> Límites del Análogo Terrestre (Brecha de Fidelidad Física)
            </div>
            <div id="limits-container">
            </div>
          </div>
        </div>

        <!-- Tarjetas de Defensa Científica NASA -->
        <div style="margin-top: 1.2rem; margin-bottom: 0.5rem; font-size: 0.82rem; font-weight: 800; color: #38bdf8; text-transform: uppercase;">
          🛡️ Tarjetas de Defensa Científica para el Jurado de la NASA
        </div>
        <div class="cards-2col">
          <div class="defense-card">
            <div class="defense-card-title">
              <span>📐</span> 1. Topografía: ¿Por qué >80% si las alturas difieren por órdenes de magnitud?
            </div>
            <p>En geomorfología planetaria no se usa la proporción simple, sino la <strong>posición relativa en el rango planetario</strong>:</p>
            <ul class="defense-list">
              <li><strong>Pendiente:</strong> Normalizada frente al rango planetario de pendientes (0° a 45°).</li>
              <li><strong>Relieve Local:</strong> Evaluado dentro de la ventana de seguridad de aterrizaje rover (0 a 150m).</li>
              <li><strong>Rugosidad:</strong> Escala de aspereza decamétrica para evaluar rodadura y estabilidad sin volcamientos.</li>
            </ul>
          </div>

          <div class="defense-card">
            <div class="defense-card-title">
              <span>🧪</span> 2. Mineralogía: Familias Geoquímicas y Fases Compartidas
            </div>
            <p>El algoritmo evalúa el solapamiento de facies litológicas y paragénesis geoquímica:</p>
            <ul class="defense-list">
              <li><strong>Campos Basálticos:</strong> Coincidencia del 90-95% en silicatos máficos (Basalto, Olivino, Piroxenos, Plagioclasa e Ilmenita) frente a mares lunares y llanuras marcianas.</li>
              <li><strong>Salares Evaporíticos:</strong> Coincidencia en yeso, halita y sulfatos precipitados en cuencas de evaporación frente a Meridiani y Jezero.</li>
            </ul>
          </div>

          <div class="defense-card">
            <div class="defense-card-title">
              <span>🌡️</span> 3. Clima: Diferencia Luna vs Marte
            </div>
            <p>El subscore climático refleja fielmente la física de cada cuerpo:</p>
            <ul class="defense-list">
              <li><strong>Frente a Marte:</strong> S_clim ronda 45% - 55% gracias a la atmósfera enrarecida (aire a >3,400m), extrema aridez y flujo UV severo.</li>
              <li><strong>Frente a la Luna:</strong> S_clim se reduce físicamente a 25% - 35% debido a la brecha insalvable del vacío absoluto (0 kPa) y oscilaciones térmicas de casi 300°C.</li>
            </ul>
          </div>

          <div class="defense-card">
            <div class="defense-card-title">
              <span>⚖️</span> 4. Ponderación de la Ecuación PSI (NASA Space Apps)
            </div>
            <p>La fórmula oficial balancea los tres pilares geofísicos:</p>
            <div class="tooltip-formula-box" style="margin: 0.3rem 0;">
              PSI = (0.35 × S_topo) + (0.35 × S_clim) + (0.30 × S_min)
            </div>
            <ul class="defense-list">
              <li><strong>35% Topografía:</strong> Seguridad de descenso y tracción rover.</li>
              <li><strong>35% Climatología:</strong> Supervivencia térmica y aerodinámica.</li>
              <li><strong>30% Mineralogía:</strong> Espectroscopía, ISRU y búsqueda de biofirmas.</li>
            </ul>
          </div>
        </div>

        <!-- Repositorio Bibliográfico Maestro -->
        <div style="margin-top: 1.2rem; margin-bottom: 0.5rem; font-size: 0.82rem; font-weight: 800; color: #38bdf8; text-transform: uppercase;">
          📖 Repositorio Bibliográfico Maestro & Fuentes de Datos Oficiales
        </div>
        <div style="font-size: 0.75rem; line-height: 1.6; color: #cbd5e1; display: flex; flex-direction: column; gap: 0.5rem;">
          <div>• <strong>NASA Planetary Data System (PDS) Geosciences Node:</strong> MGS Mars Orbiter Laser Altimeter (MOLA) MEGDR Digital Elevation Models (128 pix/deg). <a href="https://pds-geosciences.wustl.edu/missions/mgs/mola.html" target="_blank" style="color: var(--accent);">pds-geosciences.wustl.edu</a></div>
          <div>• <strong>NASA Lunar Reconnaissance Orbiter (LRO):</strong> Lunar Orbiter Laser Altimeter (LOLA) Gridded Data Record (GDR). <a href="https://lunar.gsfc.nasa.gov/" target="_blank" style="color: var(--accent);">lunar.gsfc.nasa.gov</a></div>
          <div>• <strong>NASA Jet Propulsion Laboratory (JPL) & USGS:</strong> NASADEM Merged DEM Global 1 arc-second (30m) & Shuttle Radar Topography Mission (SRTM v3.0). <a href="https://earthdata.nasa.gov/" target="_blank" style="color: var(--accent);">earthdata.nasa.gov</a></div>
          <div>• <strong>NASA Prediction of Worldwide Energy Resources (POWER):</strong> 30-Year Solar and Meteorological Datasets (CERES SYN1deg & MERRA-2 Barometric). <a href="https://power.larc.nasa.gov/" target="_blank" style="color: var(--accent);">power.larc.nasa.gov</a></div>
          <div>• <strong>Opportunity Rover Science Team (Squyres et al., 2004):</strong> "In Situ Evidence for an Ancient Aqueous Environment at Meridiani Planum, Mars". <em>Science</em>, 306(5702), 1698-1703. DOI: 10.1126/science.1104559.</div>
          <div>• <strong>Apollo 15 Preliminary Science Report (NASA SP-289):</strong> "Geologic Investigation of the Hadley-Apennine Region" (Swann et al., 1972).</div>
          <div>• <strong>USGS Open-File Report 81-182:</strong> "Lithium and Saline Deposits of the Salar de Uyuni, Bolivia" (Ericksen, Vine & Ballón).</div>
        </div>
      </div>
    </details>

  </main>"""

# Replace <main>...</main>
content = re.sub(r'  <main>[\s\S]*?  </main>', new_main_content, content, count=1)

# 3. Update executePrediction logic in JS:
# In JS, add earth-quick-summary update and calibrated relief / slope / roughness metrics in tableRowsData
js_earth_quick = """      const eqSummary = document.getElementById('earth-quick-summary');
      if (eqSummary) {
        eqSummary.innerHTML = `
          <div style="font-size:0.72rem; color:var(--accent); font-weight:800; text-transform:uppercase; margin-bottom:4px; display:flex; align-items:center; gap:0.35rem;">
            <span>📍</span> PERFIL TERRESTRE IDENTIFICADO
          </div>
          <div style="font-weight:900; font-size:0.92rem; color:#ffffff; line-height:1.2;">${earth.geology_label.split('(')[0]}</div>
          <div style="font-size:0.72rem; color:#cbd5e1; margin-top:3px;">
            Cota satelital: <strong style="color:var(--accent);">${earth.elevation} msnm</strong> (${earth.atm_pressure} kPa barométrica)
          </div>
          <div style="font-size:0.71rem; color:#94a3b8; margin-top:2px;">
            Pendiente: <strong>${earth.terrain}°</strong> | Relieve local: <strong>${earth.relief}m</strong> (${earth.area_km2} km²)
          </div>
          <div style="font-size:0.69rem; color:#38bdf8; margin-top:4px; border-top:1px solid rgba(255,255,255,0.08); padding-top:3px;">
            🛰️ ${earth.elev_source || 'Copernicus DEM 90m / SRTM'}
          </div>
        `;
      }
"""

if "const eqSummary = document.getElementById('earth-quick-summary');" not in content:
    # Insert right after document.getElementById('inferred-geophysics-grid').innerHTML = `...`;
    content = content.replace("document.getElementById('inferred-geophysics-grid').innerHTML = `", js_earth_quick + "\n      document.getElementById('inferred-geophysics-grid').innerHTML = `")

# Update tableRowsData relief and slope calculation
old_relief_row = """        {
          param: `Relieve Local (Área ${earth.area_km2} km²)`,
          earth: `${earth.relief} m`,
          target: `${target.relief} m`,
          simPct: `${Math.round(Math.exp(-Math.abs(earth.relief - target.relief) / 120.0) * 1000) / 10}%`,
          norm: 'Ventana de aterrizaje rover [0-150m]',
          sourceText: 'SRTM v3.0 Global 30m & LOLA GDR',
          sourceUrl: 'https://lunar.gsfc.nasa.gov/'
        },"""

new_relief_row = """        {
          param: `Relieve Local (Área ${earth.area_km2} km²)`,
          earth: `${earth.relief} m`,
          target: `${target.relief} m`,
          simPct: `${(() => {
            const logE = Math.log10(Math.max(earth.relief, 0.1) + 5.0);
            const logT = Math.log10(Math.max(target.relief, 0.1) + 5.0);
            const dRelLog = Math.abs(logE - logT) / 0.85;
            const sRelLog = Math.exp(-dRelLog);
            const sRelAbs = Math.exp(-Math.abs(earth.relief - target.relief) / 1200.0);
            let sRel;
            if (earth.relief <= 60.0 && target.relief <= 60.0) {
              const sPlain = Math.exp(-Math.abs(earth.relief - target.relief) / 40.0);
              sRel = 0.40 * sPlain + 0.30 * sRelLog + 0.30 * sRelAbs;
            } else {
              sRel = 0.50 * sRelLog + 0.50 * sRelAbs;
            }
            return Math.round(sRel * 1000) / 10;
          })()}%`,
          norm: 'Escala logarítmica multi-dominio [1m - 4500m]',
          sourceText: 'SRTM v3.0 Global 30m & LOLA GDR',
          sourceUrl: 'https://lunar.gsfc.nasa.gov/'
        },"""

content = content.replace(old_relief_row, new_relief_row)

with open('ensayo.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated ensayo.html successfully!")
