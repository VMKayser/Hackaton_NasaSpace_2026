"""
update_ensayo_html.py
Actualiza ensayo.html con los datasets oficiales de 'datos/', estaciones terrestres calibradas,
targets lunares de Artemis III (de Gerlache Rim 2 y Mons Mouton Plateau), nuevo modelo PCA y filtrado riguroso.
"""

import json
import re

with open('ensayo.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Cargar las 68 estaciones y análogos desde data/stations.json
with open('data/stations.json', 'r', encoding='utf-8') as f:
    stations = json.load(f)

stations_json_str = json.dumps(stations, ensure_ascii=False)

# Reemplazar CENTRALIZED_STATIONS
html = re.sub(
    r'const CENTRALIZED_STATIONS = \[.*?\];',
    lambda m: f'const CENTRALIZED_STATIONS = {stations_json_str};',
    html,
    count=1,
    flags=re.DOTALL
)

# 2. Agregar los dos nuevos destinos lunares a PLANETARY_TARGETS_DATA si no están presentes
if 'de_gerlache_rim_2' not in html:
    new_targets_js = """      {
        id: 'de_gerlache_rim_2',
        name: 'de Gerlache Rim 2 (Luna - Candidato Artemis III)',
        body: 'Luna',
        mission: 'NASA Artemis III Landing Candidate / Shackleton-de Gerlache Ridge',
        lat: -88.22, lon: -64.61,
        elevation: -135.0,
        terrain: 12.7, relief: 750.0, roughness: 2.45,
        temp: -204.8, temp_swing: 110.0, precip: 0.0, solar_flux: 5.0, atm_pressure: 0.0,
        geology: 'polar_crater_rim',
        minerals: ['Anortosita lunar rica en calcio (Plagioclasa >88%)', 'Piroxeno pobre en Ti', 'Olivino magnesiano', 'Hielo volátil en sombra permanente (PSR)'],
        summary: 'Borde elevado de cráter polar con micro-trampas de sombra permanente (PSR) y gradiente de elevación de 3.6 km para descenso tripulado Artemis III (datos oficiales NASA ADC FY23 y Diviner PCP).'
      },
      {
        id: 'mons_mouton_plateau',
        name: 'Mons Mouton Plateau (Luna - Artemis III & VIPER)',
        body: 'Luna',
        mission: 'NASA Artemis III & VIPER Landing Site / Nobile-Mouton Region',
        lat: -84.70, lon: -32.50,
        elevation: 1250.0,
        terrain: 10.6, relief: 480.0, roughness: 2.00,
        temp: -188.0, temp_swing: 160.0, precip: 0.0, solar_flux: 8.5, atm_pressure: 0.0,
        geology: 'polar_plateau',
        minerals: ['Anortosita norítica (Plagioclasa cálcica)', 'Piroxeno', 'Volátiles polares condensables en regolito criogénico'],
        summary: 'Meseta polar prominente con largos periodos de iluminación solar continua (~68%) y acceso directo a depósitos de volátiles en cráteres adyacentes (datos oficiales LOLA y Diviner PRP).'
      },
      {
        id: 'taurus_littrow'"""
    
    html = html.replace("      {\n        id: 'taurus_littrow'", new_targets_js)

# 3. Actualizar PCA_MODEL con las 8 variables físicas y nuevos componentes
new_pca_model = """    const PCA_MODEL = {
      features: ['terrain', 'relief', 'roughness', 'temp', 'temp_swing', 'precip', 'solar_flux', 'atm_pressure'],
      scales: {
        terrain:      { min: 0.0,    max: 45.0 },
        relief:       { min: 0.0,    max: 4500.0 },
        roughness:    { min: 0.0,    max: 35.0 },
        temp:         { min: -220.0, max: 45.0 },
        temp_swing:   { min: 0.0,    max: 295.0 },
        precip:       { min: 0.0,    max: 3200.0 },
        solar_flux:   { min: 0.0,    max: 30.0 },
        atm_pressure: { min: 0.0,    max: 105.0 }
      },
      mean: [0.228007, 0.086809, 0.176000, 0.797303, 0.171137, 0.080248, 0.669167, 0.563144],
      components: [
        [-0.128436, -0.121615, -0.205771, 0.321733, -0.474705, 0.116172, 0.314920, 0.696308],
        [0.551687, 0.416450, 0.648984, 0.076557, -0.166368, 0.061138, 0.230518, 0.103032],
        [-0.113655, -0.035946, -0.076548, 0.239143, 0.037164, -0.344887, 0.784550, -0.432313]
      ],
      explained_variance: [49.6, 26.4, 10.3]
    };"""

html = re.sub(
    r'const PCA_MODEL = \{.*?\n\s*\};\n',
    lambda m: new_pca_model + '\n',
    html,
    count=1,
    flags=re.DOTALL
)

# 4. Actualizar inferGeologyFromCoordinates con filtrado exclusivo de estaciones terrestres
new_infer_geology = """    function inferGeologyFromCoordinates(lat, lon, userGeology) {
      let minDist = Infinity;
      const earthStations = CENTRALIZED_STATIONS.filter(s => s.body === 'earth');
      let nearestRow = earthStations[0];

      for (const st of earthStations) {
        const d = Math.sqrt(Math.pow(st.lat - lat, 2) + Math.pow(st.lon - lon, 2));
        if (d < minDist) {
          minDist = d;
          nearestRow = st;
        }
      }

      const geoRaw = String(nearestRow.geology || '').toLowerCase();
      const stationName = nearestRow.name || 'Estación Cercana';
      const elevRaw = Number(nearestRow.elevation) || 3000.0;

      // 1. Prioridad: Pista de usuario si fue provista
      if (userGeology && userGeology.trim() !== '') {
        const uStr = userGeology.toLowerCase();
        // Ignorar si el usuario puso área (ej. "50 km2", "120 km2")
        if (!/^\\s*\\d+(?:\\.\\d+)?\\s*(?:km2|km\\^2|m2)?\\s*$/.test(uStr)) {
          if (/(basalt|basalto|basaltos|basaltico|basaltica|escoria|lava|malpais|cono)/.test(uStr)) {
            return { geology: 'volcanic_basalt', geologyLabel: `Campo Volcánico Monogenético & Conos de Escoria / Basalto Negro (${userGeology})`, nearestRow, minDist };
          } else if (/(volcan|estratovolcan|andesita|domo)/.test(uStr)) {
            return { geology: 'volcanic_peak', geologyLabel: `Estratovolcán & Complejo Volcánico (${userGeology})`, nearestRow, minDist };
          } else if (/(sal|salar|salino|salina|evaporita|halita|salmuera)/.test(uStr)) {
            return { geology: 'salt_lake', geologyLabel: `Salar Evaporítico & Cuenca Salina (${userGeology})`, nearestRow, minDist };
          } else if (/(hidrotermal|geiser|fumarola|sinter)/.test(uStr)) {
            return { geology: 'hydrothermal', geologyLabel: `Campo Geotérmico & Fumarolas (${userGeology})`, nearestRow, minDist };
          } else if (/(desierto|eolica|duna|ignimbrita|arena)/.test(uStr)) {
            return { geology: 'eolian_desert', geologyLabel: `Desierto Eólico Altiplánico & Arenas Basálticas (${userGeology})`, nearestRow, minDist };
          } else if (/(tubo|cueva|caverna)/.test(uStr)) {
            return { geology: 'lava_tube', geologyLabel: `Tubo de Lava & Terreno Basáltico (${userGeology})`, nearestRow, minDist };
          } else if (/(arcilla|arcillas|oxido|oxidos|hierro|sedimentario|sedimentaria|arenisca|areniscas|lutita|lutitas|estrato|estratos|estratificado|estratificada|filosilicato|filosilicatos|badlands|paleolago|ischigualasto|talampaya)/.test(uStr)) {
            return { geology: 'sedimentary_strata', geologyLabel: `Cuenca Sedimentaria Estratificada, Arcillas & Óxidos de Hierro (${userGeology})`, nearestRow, minDist };
          } else if (/(cañon|canyon|valle|quebrada|erosion)/.test(uStr)) {
            return { geology: 'eroded_canyon', geologyLabel: `Cañón Erosivo & Terreno Escarpado (${userGeology})`, nearestRow, minDist };
          }
        }
      }

      // 2. Auto-inferencia por estación geoespacial referencial y litología regional
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

      return { geology: 'mixed_terrain', geologyLabel: `Terreno Geológico según análogo (${stationName})`, nearestRow, minDist };
    }"""

html = re.sub(
    r'function inferGeologyFromCoordinates\(lat, lon, userGeology\) \{.*?\n\s*\}\n\n\s*async function estimateElevationAndPressure',
    lambda m: new_infer_geology + '\n\n    async function estimateElevationAndPressure',
    html,
    count=1,
    flags=re.DOTALL
)

# 5. Actualizar estimateElevationAndPressure
new_elevation = """    async function estimateElevationAndPressure(lat, lon, geology) {
      let num = 0, den = 0, minD = Infinity, minElev = 3000.0;
      const earthStations = CENTRALIZED_STATIONS.filter(s => s.body === 'earth');

      for (const st of earthStations) {
        const d = Math.sqrt(Math.pow(st.lat - lat, 2) + Math.pow(st.lon - lon, 2));
        if (d < minD) {
          minD = d;
          minElev = Number(st.elevation) || 3000.0;
        }
        const w = 1.0 / Math.pow(Math.max(d, 0.01), 2);
        num += w * (Number(st.elevation) || 3000.0);
        den += w;
      }

      let fallbackElev = (minD < 0.25) ? minElev : (num / den);

      if (geology === 'volcanic_peak' && fallbackElev < 4500.0) {
        fallbackElev = Math.max(fallbackElev, 5200.0);
      } else if (geology === 'lowland_plain') {
        fallbackElev = Math.min(fallbackElev, 300.0);
      } else if (geology === 'sedimentary_strata' && minD > 1.5) {
        fallbackElev = 1300.0;
      }

      let elev = fallbackElev;
      let isDemApi = false;

      // 1. Consulta satelital Copernicus DEM 90m en tiempo real (Open-Meteo Elevation API)
      try {
        const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
        const signal = controller ? controller.signal : undefined;
        let timeoutId;
        if (controller) timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`, { signal });
        if (timeoutId) clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.elevation && data.elevation.length > 0) {
            elev = Number(data.elevation[0]);
            isDemApi = true;
          }
        }
      } catch (err) {
        console.warn("Open-Meteo DEM offline/timeout, usando IDW calibrado:", err);
      }

      elev = Math.round(elev * 10) / 10;
      
      // Ecuación barométrica internacional para atmósfera estándar:
      // P = P0 * (1 - 2.25577e-5 * h) ^ 5.25588
      const hClamped = Math.max(0.0, Math.min(elev, 11000.0));
      const pressure = Math.round(101.325 * Math.pow(1.0 - 2.25577e-5 * hClamped, 5.25588) * 100) / 100;

      return { elevation: elev, pressure: pressure, isDemApi: isDemApi };
    }"""

html = re.sub(
    r'async function estimateElevationAndPressure\(lat, lon, geology\) \{.*?\n\s*\}\n\n\s*function estimateTopography',
    lambda m: new_elevation + '\n\n    function estimateTopography',
    html,
    count=1,
    flags=re.DOTALL
)

# 6. Actualizar estimateClimate
new_climate = """    function estimateClimate(lat, lon, elev, geology) {
      let wSum = 0, tSum = 0, swingSum = 0, pSum = 0, solSum = 0, elevSum = 0;
      const earthStations = CENTRALIZED_STATIONS.filter(s => s.body === 'earth');

      for (const st of earthStations) {
        const d = Math.sqrt(Math.pow(st.lat - lat, 2) + Math.pow(st.lon - lon, 2));
        const w = 1.0 / Math.pow(Math.max(d, 0.05), 2);
        wSum += w;
        tSum += w * (Number(st.temp) || 10.0);
        swingSum += w * (Number(st.temp_swing) || 20.0);
        pSum += w * (Number(st.precip) || 200.0);
        solSum += w * (Number(st.solar_flux) || 20.0);
        elevSum += w * (Number(st.elevation) || 3000.0);
      }

      let tInterp = tSum / wSum;
      let tSwingInterp = swingSum / wSum;
      let pInterp = Math.max(0.0, pSum / wSum);
      let solInterp = solSum / wSum;
      let refElev = elevSum / wSum;

      let tempAdjusted = tInterp - (0.0065 * (elev - refElev));

      const tempBaseSea = 28.0 - (Math.abs(lat) * 0.35);
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
      }

      return {
        temp: Math.round(tempAdjusted * 10) / 10,
        temp_swing: Math.round(tSwingInterp * 10) / 10,
        precip: Math.round(pInterp * 10) / 10,
        solar_flux: Math.round(solInterp * 10) / 10,
        uv_index: Math.round(Math.min(22.0, (solInterp / 1.1) * (1.0 + (elev / 4000.0) * 0.35)) * 10) / 10
      };
    }"""

html = re.sub(
    r'function estimateClimate\(lat, lon, elev, geology\) \{.*?\n\s*\}\n\n\s*function inferMineralogy',
    lambda m: new_climate + '\n\n    function inferMineralogy',
    html,
    count=1,
    flags=re.DOTALL
)

# 7. Actualizar parsing de inputs para soportar coma y punto
html = html.replace(
    "const latIn = parseFloat(document.getElementById('input-lat').value);",
    "const latIn = parseFloat(String(document.getElementById('input-lat').value).replace(',', '.'));"
)
html = html.replace(
    "const lonIn = parseFloat(document.getElementById('input-lon').value);",
    "const lonIn = parseFloat(String(document.getElementById('input-lon').value).replace(',', '.'));"
)
html = html.replace(
    "const areaIn = parseFloat(document.getElementById('input-area').value);",
    "const areaIn = parseFloat(String(document.getElementById('input-area').value).replace(',', '.'));"
)

# 8. Actualizar títulos de botones de planetas
html = html.replace(
    "MARTE (7 Misiones y Cuencas)",
    "MARTE (8 Misiones y Cuencas)"
)
html = html.replace(
    "LUNA (5 Misiones Históricas y Artemis)",
    "LUNA (7 Misiones y Candidatos Artemis)"
)

# 9. Actualizar texto de datasets y auditoría en Sección 5
datos_audit_html = """        <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.08); font-size: 0.72rem; color: #94a3b8;">
          <strong style="color: var(--accent);">🔬 DATASETS OFICIALES PROCESADOS DE LA CARPETA 'datos/':</strong>
          <div style="margin-top: 0.25rem;">• <strong>NASA ADC FY23 de Gerlache Rim 2:</strong> Matrices completas 4000×4000 de Altura, Pendiente, Latitud y Longitud (<span style="color:#38bdf8;">fy23_adc_height/slope/lat/lon</span>) integradas en el modelo.</div>
          <div>• <strong>LRO Diviner Lunar Radiometer Experiment (PDS):</strong> Tabla estacional <span style="color:#38bdf8;">PCP_AVG_TBOL_POLS_SUM_LTIM01_240.TAB</span> (temperatura bolométrica de verano de Gerlache Rim 2: 68.3 K / -204.8 °C) y recurso polar <span style="color:#38bdf8;">DLRE_PRP_SOUTH.TAB</span> (Mons Mouton Plateau: 85.2 K promedio, estabilidad criogénica).</div>
          <div>• <strong>LRO LOLA Mons Mouton Plateau:</strong> GeoTIFFs a 80m/píxel de Elevación (<span style="color:#38bdf8;">LDEM_80S_80MPP_ADJ</span>), Pendiente (<span style="color:#38bdf8;">LDSM_80S</span>) y Rugosidad a 400m (<span style="color:#38bdf8;">LDRM_80S_1000MPP_ROUGH_400M</span>).</div>
          <div>• <strong>Wueller et al. Polar Illumination:</strong> Mapas de visibilidad solar (<span style="color:#38bdf8;">AVGVISIB_75S_120M</span>) y regiones en sombra permanente (<span style="color:#38bdf8;">LPSR_75S_120M</span>).</div>
          <div>• <strong>Tierra (NASA/USGS/Copernicus):</strong> NASADEM HGT v001 (30m), SRTM GL1 v003, Copernicus GLO-30 DEM, MODIS MOD11A2 v061 (LST 1km día/noche), Landsat 8 térmico e identificación mineral EMIT L2B / ASTER L1T.</div>
        </div>"""

if "🔬 DATASETS OFICIALES PROCESADOS DE LA CARPETA 'datos/':" not in html:
    html = html.replace(
        "<!-- AUDIT SOURCE CITATIONS -->",
        datos_audit_html + "\n        <!-- AUDIT SOURCE CITATIONS -->"
    )

with open('ensayo.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("[✓] ensayo.html actualizado con éxito con los datasets de 'datos/', 68 estaciones y Targets Artemis III.")
