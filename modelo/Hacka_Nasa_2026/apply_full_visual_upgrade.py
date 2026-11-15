# -*- coding: utf-8 -*-
import re

with open('demo_mission_control.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update the HUD header to include the Audit Button
old_hud_header = """    <div class="hud-header">
      <div class="hud-title">
        <span>🛰️</span> INTELLIGENCE HUD: ANÁLOGOS TERRESTRES & PREPARACIÓN DE MISIÓN
      </div>
      <div style="font-size: 0.72rem; color: var(--text-muted); display:flex; gap:1rem; align-items:center;">
        <span>NASA PDS & Peer-Reviewed Science Audit</span>
        <span style="color:#22c55e;">● TELEMETRÍA EN VIVO</span>
      </div>
    </div>"""

new_hud_header = """    <div class="hud-header">
      <div class="hud-title">
        <span>🛰️</span> INTELLIGENCE HUD: ANÁLOGOS TERRESTRES & PREPARACIÓN DE MISIÓN
      </div>
      <div style="font-size: 0.72rem; color: var(--text-muted); display:flex; gap:0.75rem; align-items:center;">
        <button class="audit-btn" onclick="openAuditModal()">📊 AUDITORÍA CIENTÍFICA & TABLA COMPARATIVA LADO A LADO</button>
        <span style="color:#22c55e;">● TELEMETRÍA EN VIVO</span>
      </div>
    </div>

    <!-- HORIZONTAL CANDIDATE TARGET RANKING RIBBON -->
    <div class="candidate-ranking-bar">
      <span class="ranking-label">🎯 ANÁLOGOS EXTRATERRESTRES (RANKING DE SIMILITUD GLOBAL):</span>
      <div class="ranking-chips-container" id="ranking-chips-container">
        <!-- Dynamically populated with all extraterrestrial targets sorted by PSI % -->
      </div>
    </div>"""

if old_hud_header in html:
    html = html.replace(old_hud_header, new_hud_header)
    print("[+] HUD Header and Ranking Ribbon injected successfully")
else:
    print("[!] Warning: old_hud_header not found")

# 2. Add interactive-hover classes and data-metric attributes to HUD columns
old_col1 = """        <div class="data-row">
          <div class="data-label">Ubicación y Elevación</div>
          <div class="data-value" id="earth-coords">Potosí, Bolivia • 3,656 msnm (-20.13°, -67.49°)</div>
        </div>
        <div class="data-row">
          <div class="data-label">Gases y Presión Atmosférica</div>
          <div class="data-value" id="earth-gases">Presión: 65.2 kPa (~45-65% nivel del mar)</div>
        </div>
        <div class="data-row">
          <div class="data-label">Mineralogía y Litología</div>
          <div class="data-value" id="earth-minerals">Halita (NaCl), Yeso, Cloruro de Litio, Ulexita</div>
        </div>
        <div class="data-row">
          <div class="data-label">Clima, UV y Topografía</div>
          <div class="data-value" id="earth-climate">T: -15°C a 20°C • UV: Extremo (96%) • Pendiente media: 0.8°</div>
        </div>"""

new_col1 = """        <div class="data-row interactive-hover" data-metric="elev">
          <div class="data-label">📍 Ubicación y Elevación (Pasa el cursor para ver cálculo)</div>
          <div class="data-value" id="earth-coords">Potosí, Bolivia • 3,656 msnm (-20.13°, -67.49°)</div>
        </div>
        <div class="data-row interactive-hover" data-metric="press">
          <div class="data-label">💨 Gases y Presión Atmosférica (Hover: cálculo log-ratio)</div>
          <div class="data-value" id="earth-gases">Presión: 65.2 kPa (~45-65% nivel del mar)</div>
        </div>
        <div class="data-row interactive-hover" data-metric="min">
          <div class="data-label">🧪 Mineralogía & Familia Geoquímica (Hover: afinidad)</div>
          <div class="data-value" id="earth-minerals">Halita (NaCl), Yeso, Cloruro de Litio, Ulexita</div>
        </div>
        <div class="data-row interactive-hover" data-metric="clim_topo">
          <div class="data-label">☀️ Clima, UV y Topografía (Hover: cálculo de aridez & pendientes)</div>
          <div class="data-value" id="earth-climate">T: -15°C a 20°C • UV: Extremo (96%) • Pendiente media: 0.8°</div>
        </div>"""

if old_col1 in html:
    html = html.replace(old_col1, new_col1)
    print("[+] Column 1 interactive hover attributes injected successfully")
else:
    print("[!] Warning: old_col1 not found")

old_col2 = """        <div class="data-row">
          <div class="data-label">Misión y Contexto</div>
          <div class="data-value" id="target-mission">NASA Mars 2020 / Rover Perseverance + Ingenuity</div>
        </div>
        <div class="data-row">
          <div class="data-label">Atmósfera y Presión Real</div>
          <div class="data-value" id="target-gases">Presión: 0.61 kPa • 95.3% CO2, 2.6% N2, 1.9% Ar</div>
        </div>
        <div class="data-row">
          <div class="data-label">Fases Minerales y Regolito</div>
          <div class="data-value" id="target-minerals">Arcillas esmectitas, Sulfatos de yeso, Carbonato de Mg</div>
        </div>
        <div class="data-row">
          <div class="data-label">Ambiente y Radiación</div>
          <div class="data-value" id="target-climate">T: -95°C a -5°C • Radiación: 250 mSv/año (GCR)</div>
        </div>"""

new_col2 = """        <div class="data-row interactive-hover" data-metric="elev">
          <div class="data-label">🚀 Misión y Contexto Operativo</div>
          <div class="data-value" id="target-mission">NASA Mars 2020 / Rover Perseverance + Ingenuity</div>
        </div>
        <div class="data-row interactive-hover" data-metric="press">
          <div class="data-label">💨 Atmósfera y Presión Real (Hover: ratio barométrico)</div>
          <div class="data-value" id="target-gases">Presión: 0.61 kPa • 95.3% CO2, 2.6% N2, 1.9% Ar</div>
        </div>
        <div class="data-row interactive-hover" data-metric="min">
          <div class="data-label">🧪 Fases Minerales y Regolito (Hover: sulfatos compartidos)</div>
          <div class="data-value" id="target-minerals">Arcillas esmectitas, Sulfatos de yeso, Carbonato de Mg</div>
        </div>
        <div class="data-row interactive-hover" data-metric="clim_topo">
          <div class="data-label">❄️ Ambiente y Radiación (Hover: frío extremo & UV)</div>
          <div class="data-value" id="target-climate">T: -95°C a -5°C • Radiación: 250 mSv/año (GCR)</div>
        </div>"""

if old_col2 in html:
    html = html.replace(old_col2, new_col2)
    print("[+] Column 2 interactive hover attributes injected successfully")
else:
    print("[!] Warning: old_col2 not found")

# 3. Add interactive-hover to Column 3 subscore bars and circle
old_col3_bars = """        <div class="subscore-bar">
          <div style="display:flex; justify-content:space-between;">
            <span>Topografía (S_topo):</span><strong id="sub-topo">89.3%</strong>
          </div>
          <div class="bar-track"><div class="bar-fill" id="bar-topo" style="width:89.3%;"></div></div>
        </div>
        <div class="subscore-bar">
          <div style="display:flex; justify-content:space-between;">
            <span>Clima y UV (S_clim):</span><strong id="sub-env">46.5%</strong>
          </div>
          <div class="bar-track"><div class="bar-fill" id="bar-env" style="width:46.5%;"></div></div>
        </div>
        <div class="subscore-bar">
          <div style="display:flex; justify-content:space-between;">
            <span>Mineralogía (S_min):</span><strong id="sub-min">79.2%</strong>
          </div>
          <div class="bar-track"><div class="bar-fill" id="bar-min" style="width:79.2%;"></div></div>
        </div>"""

new_col3_bars = """        <div class="subscore-bar interactive-hover" data-metric="topo">
          <div style="display:flex; justify-content:space-between;">
            <span>Topografía (S_topo):</span><strong id="sub-topo">89.3%</strong>
          </div>
          <div class="bar-track"><div class="bar-fill" id="bar-topo" style="width:89.3%;"></div></div>
        </div>
        <div class="subscore-bar interactive-hover" data-metric="clim">
          <div style="display:flex; justify-content:space-between;">
            <span>Clima y UV (S_clim):</span><strong id="sub-env">46.5%</strong>
          </div>
          <div class="bar-track"><div class="bar-fill" id="bar-env" style="width:46.5%;"></div></div>
        </div>
        <div class="subscore-bar interactive-hover" data-metric="min_score">
          <div style="display:flex; justify-content:space-between;">
            <span>Mineralogía (S_min):</span><strong id="sub-min">79.2%</strong>
          </div>
          <div class="bar-track"><div class="bar-fill" id="bar-min" style="width:79.2%;"></div></div>
        </div>"""

if old_col3_bars in html:
    html = html.replace(old_col3_bars, new_col3_bars)
    print("[+] Column 3 subscore bars interactive hover injected successfully")
else:
    print("[!] Warning: old_col3_bars not found")

# Add data-metric="formula" and data-metric="psi"
html = html.replace('<div class="psi-formula-badge" id="psi-formula-badge">', '<div class="psi-formula-badge" id="psi-formula-badge" data-metric="formula">')
html = html.replace('<div class="psi-circle" id="psi-circle">', '<div class="psi-circle interactive-hover" id="psi-circle" data-metric="psi" style="cursor:help;">')

# 4. Insert the HTML containers for #math-hover-tooltip and #audit-modal before <div id="globe-tooltip">
old_tooltip_anchor = """  <!-- FLOATING TOOLTIP -->
  <div id="globe-tooltip"></div>"""

new_modals_html = """  <!-- FLOATING MATHEMATICAL BREAKDOWN TOOLTIP (ON HOVER) -->
  <div id="math-hover-tooltip">
    <div class="tooltip-header">
      <div class="tooltip-title" id="tooltip-title">📐 DESGLOSE MATEMÁTICO</div>
      <div class="tooltip-score" id="tooltip-score">--%</div>
    </div>
    <div class="tooltip-formula-box" id="tooltip-formula">--</div>
    <div class="tooltip-values-grid" id="tooltip-values">
      <div><strong>Tierra:</strong> <span id="tooltip-val-earth">--</span></div>
      <div><strong>Destino:</strong> <span id="tooltip-val-target">--</span></div>
    </div>
    <div class="tooltip-justification" id="tooltip-justification">--</div>
  </div>

  <!-- SIDE-BY-SIDE SCIENTIFIC AUDIT & JUDGES DEFENSE MODAL -->
  <div id="audit-modal" onclick="onAuditBackdropClick(event)">
    <div class="audit-modal-box">
      <div class="modal-header">
        <div class="modal-title-group">
          <h3>📊 TABLA COMPARATIVA LADO A LADO & AUDITORÍA MATEMÁTICA</h3>
          <p>Normalización de Dominio Planetario, Desglose Sub-Métrico y Argumentación Científica para Jurados</p>
        </div>
        <button class="modal-close-btn" onclick="closeAuditModal()">✕</button>
      </div>

      <div class="audit-modal-body">
        <!-- 1. COMPARATIVE TABLE -->
        <table class="audit-table">
          <thead>
            <tr>
              <th style="width:25%;">Parámetro Analizado</th>
              <th style="width:25%;" id="th-earth-name">Tierra (Salar de Uyuni)</th>
              <th style="width:25%;" id="th-target-name">Marte (Meridiani Planum)</th>
              <th style="width:25%;">Similitud & Dominio Planetario</th>
            </tr>
          </thead>
          <tbody id="audit-table-body">
            <!-- Dynamic rows populated by updateAuditTable() -->
          </tbody>
        </table>

        <!-- 2. FOUR DEFENSE CARDS FOR JUDGES -->
        <div class="audit-cards-grid">
          <div class="audit-card">
            <div class="audit-card-title">⛰️ 1. ¿Por qué Topografía (S_topo) da 89.3% si 1.5m y 15.0m difieren 10x?</div>
            <p>La comparación <strong>no se hace por proporción directa</strong> ($1.5 / 15 = 10\%$), sino por la posición en el rango geomorfológico planetario:</p>
            <ul style="margin-left: 1.1rem; margin-top: 0.3rem;">
              <li><strong>Pendiente ($0°-45°$):</strong> $|0.8° - 2.1°| = 1.3° \implies 1 - 1.3/45 = \mathbf{97.1\%}$</li>
              <li><strong>Relieve ($0-150\text{ m}$):</strong> $|1.5\text{ m} - 15.0\text{ m}| = 13.5\text{ m} \implies 1 - 13.5/150 = \mathbf{91.0\%}$</li>
              <li><strong>Rugosidad ($0-5$):</strong> $|0.35 - 1.20| = 0.85 \implies 1 - 0.85/5 = \mathbf{83.0\%}$</li>
            </ul>
            <p style="margin-top:0.3rem; color:#38bdf8;">Ambos lugares pertenecen al <strong>percentil 90 de máxima planicie</strong> para descenso y tránsito de rover sin riesgo de vuelco.</p>
          </div>

          <div class="audit-card">
            <div class="audit-card-title">🧪 2. ¿Por qué Mineralogía (S_min) da 79.2% si dice 'Halita vs Hematita'?</div>
            <p>La tabla resumida mostraba solo el mineral principal [0], pero geoquímicamente pertenecen a la <strong>misma familia deposicional</strong>:</p>
            <ul style="margin-left: 1.1rem; margin-top: 0.3rem;">
              <li><strong>Familia Geoquímica:</strong> Evaporitas y cuencas salinas sedimentarias dejadas por desecación de salmueras primitivas.</li>
              <li><strong>Fases Compartidas:</strong> Ambos contienen <strong>Yeso ($\text{CaSO}_4\cdot 2\text{H}_2\text{O}$)</strong> y sulfatos hidratados.</li>
              <li>Uyuni contiene además sulfatos de magnesio y halita; Meridiani contiene jarosita (sulfato férrico) y hematita oxidada.</li>
            </ul>
          </div>

          <div class="audit-card">
            <div class="audit-card-title">🌡️ 3. ¿Por qué Clima (S_clim) da 46.5% con temperaturas y presiones tan distintas?</div>
            <p>El 46.5% es justamente una calificación baja (&lt;50%), resultado de promediar 5 sub-variables climáticas:</p>
            <ul style="margin-left: 1.1rem; margin-top: 0.3rem;">
              <li><strong>Presión ($\log_{10} P$):</strong> $\sim 30\%$ (Uyuni ya perdió 36.5% de aire por altitud extrema).</li>
              <li><strong>Temperatura ($8.5°\text{C}$ vs $-52°\text{C}$):</strong> $\sim 25\%$ (baja).</li>
              <li><strong>Oscilación Térmica ($25°\text{C}$ vs $80°\text{C}$):</strong> $\sim 31\%$.</li>
              <li><strong>Aridez / Precipitación ($130\text{ mm}$ vs $0\text{ mm}$):</strong> $\mathbf{\sim 75\%}$ de cercanía al cero hidrológico en escala terrestre ($0-3000\text{ mm}$).</li>
              <li><strong>Radiación UV (Índice 22):</strong> $\mathbf{\sim 85\%}$ (radiación extrema sin filtro de ozono denso).</li>
            </ul>
          </div>

          <div class="audit-card">
            <div class="audit-card-title">📐 4. Ponderación del PSI Global & Versión Conservadora</div>
            <p>Ponderación estándar orientada a misiones de superficie:</p>
            <div class="tooltip-formula-box" style="margin: 0.3rem 0;">
              PSI = (0.35 × S_topo) + (0.35 × S_clim) + (0.30 × S_min) = 71.3%
            </div>
            <p style="font-size:0.69rem; color:#94a3b8;">
              Promedio conservador incorporando PCA en espacio latente ($44.0\%$):<br>
              $\text{PSI}_{\text{conservador}} = (89.3 + 46.5 + 79.2 + 44.0) / 4 = \mathbf{64.8\%}$.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- FLOATING TOOLTIP -->
  <div id="globe-tooltip"></div>"""

if old_tooltip_anchor in html:
    html = html.replace(old_tooltip_anchor, new_modals_html)
    print("[+] Floating Hover Tooltip & Scientific Audit Modal HTML injected successfully")
else:
    print("[!] Warning: old_tooltip_anchor not found")

with open('demo_mission_control.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("[+] HTML structure update complete.")
