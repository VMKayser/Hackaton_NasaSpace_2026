with open('ensayo.html', 'r', encoding='utf-8') as f:
    html = f.read()

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

if 'function switchDimensionCriterion' not in html:
    ra_pos = html.find('function renderAllUI')
    assert ra_pos != -1, "renderAllUI not found"
    html = html[:ra_pos] + js_dim_code + "\n" + html[ra_pos:]
    with open('ensayo.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("[✓] Funciones switchDimensionCriterion, sortRankingListByDimension y renderThematicSpotlight agregadas.")
else:
    print("[*] Las funciones ya estaban presentes.")
