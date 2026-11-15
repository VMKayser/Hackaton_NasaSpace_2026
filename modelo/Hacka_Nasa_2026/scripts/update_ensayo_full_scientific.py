"""
scripts/update_ensayo_full_scientific.py
Sincroniza ensayo.html con:
1. 10 Objetivos de Marte (incluyendo Utopia Planitia VL2 y Deuteronilus Mensae) y 8 de la Luna (incluyendo Malapert Massif Artemis III Sitio 23).
2. Botones de toggle planetario: '🔴 MARTE (10 Misiones y Cuencas)' y '⚪ LUNA (8 Misiones Artemis)'.
3. Modelo PCA reentrenado con 73 muestras (55 terrestres + 18 planetarias).
4. Citas científicas específicas en la tabla comparativa lado a lado (VL2, SHARAD Zenodo, LOLA PGDA 78).
5. Repositorio Bibliográfico Maestro ampliado con todos los enlaces de enlacesUtopia.txt, fuentes.csv y referencias.docx.
"""

import json
import re
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_PATH = os.path.join(BASE_DIR, 'ensayo.html')

with open(HTML_PATH, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. ACTUALIZAR BOTONES DE TOGGLE PLANETARIO (10 Marte, 8 Luna)
html = html.replace('<span>🔴</span> MARTE (8 Misiones y Cuencas)', '<span>🔴</span> MARTE (10 Misiones y Cuencas)')
html = html.replace('<span>⚪</span> LUNA (7 Misiones Artemis)', '<span>⚪</span> LUNA (8 Misiones Artemis)')
html = html.replace('<span>⚪</span> LUNA (7 Misiones y Candidatos Artemis)', '<span>⚪</span> LUNA (8 Misiones Artemis)')

# 2. ACTUALIZAR PLANETARY_TARGETS_DATA
# Verificamos si utopia_planitia_vl2 ya está
if 'utopia_planitia_vl2' not in html:
    # Insertar utopia y deuteronilus después de arcadia_planitia
    arcadia_old = """      {
        id: 'arcadia_planitia',
        name: 'Arcadia Planitia',
        body: 'Marte',
        mission: 'NASA & SpaceX / Candidato Principal de Base Humana',
        lat: 39.30, lon: -171.00,
        elevation: -3000.0,
        terrain: 1.8, relief: 12.0, roughness: 1.5,
        temp: -72.0, temp_swing: 85.0, precip: 0.0, solar_flux: 7.8, atm_pressure: 0.72,
        geology: 'subsurface_ice',
        minerals: ['Hielo de agua masivo bajo regolito (1-2m)', 'Regolito basáltico', 'Polvo eólico'],
        summary: 'Planicies septentrionales con glaciares masivos enterrados accesibles para extracción de combustible e ISRU.'
      },"""

    arcadia_new = """      {
        id: 'arcadia_planitia',
        name: 'Arcadia Planitia (Llanuras de Hielo Subterráneo)',
        body: 'Marte',
        mission: 'NASA & SpaceX / MRO SHARAD / Mars Odyssey GRS',
        lat: 39.30, lon: -171.00,
        elevation: -3984.0,
        terrain: 0.56, relief: 18.0, roughness: 1.2,
        temp: -76.8, temp_swing: 114.3, precip: 0.0, solar_flux: 7.8, atm_pressure: 0.826,
        geology: 'subsurface_ice',
        minerals: ['Manto de hielo de agua masivo somero (1-2.5m profundidad, 4.7 wt% H2O eq GRS)', 'Regolito basáltico', 'Polvo eólico'],
        summary: 'Vastas llanuras hiperplanas con mantos masivos de hielo de agua pura a 1-2.5 metros bajo el regolito (confirmado por radar SHARAD y GRS), objetivo prioritario para ISRU.'
      },
      {
        id: 'utopia_planitia_vl2',
        name: 'Utopia Planitia (Viking Lander 2)',
        body: 'Marte',
        mission: 'NASA Viking Lander 2 / Primera Meteorología In-Situ de Marte',
        lat: 48.27, lon: 134.00,
        elevation: -4502.5,
        terrain: 0.41, relief: 5.14, roughness: 1.15,
        temp: -82.4, temp_swing: 65.0, precip: 0.0, solar_flux: 8.2, atm_pressure: 0.869,
        geology: 'volcanic_plains_permafrost',
        minerals: ['Basalto meteorizado con percloratos (ClO4-)', 'Capas de escarcha estacional H2O/CO2', 'Smectitas de Fe/Mg', 'Sulfatos hidratados'],
        summary: 'Llanura volcánica septentrional con escarcha criogénica estacional y percloratos, auditada por la estación meteorológica in-situ del Viking Lander 2 (PDS Atmospheres).'
      },
      {
        id: 'deuteronilus_mensae',
        name: 'Deuteronilus Mensae (Glaciares LDA & Mesetas)',
        body: 'Marte',
        mission: 'MRO SHARAD / Baker & Carter (2023) / LMD MCD 6.2',
        lat: 43.86, lon: 23.36,
        elevation: -3449.0,
        terrain: 2.52, relief: 450.0, roughness: 19.5,
        temp: -73.6, temp_swing: 115.4, precip: 0.0, solar_flux: 8.0, atm_pressure: 0.784,
        geology: 'glacial_debris_apron',
        minerals: ['Hielo glaciar masivo subsuperficial (>80% H2O pura en manto protector)', 'Filosilicatos laminares (5.2%)', 'Plagioclasa (3.9%)', 'Sulfatos (1.7%)', 'Carbonatos (1.6%)', 'Polvo regolítico (66.2%)'],
        summary: 'Mesetas y valles con glaciares de escombros lobulados (LDA) con núcleos masivos de hielo de agua pura protegidos por una capa de regolito (SHARAD Zenodo DOI:10.5281/zenodo.7753745).'
      },"""

    if arcadia_old in html:
        html = html.replace(arcadia_old, arcadia_new)
    else:
        # Reemplazo por regex si arcadia ya tenía modificaciones
        html = re.sub(
            r"\{\s*id:\s*'arcadia_planitia'.*?\n\s*\},",
            arcadia_new,
            html,
            count=1,
            flags=re.DOTALL
        )

# Insertar malapert_massif_site23 en la Luna
if 'malapert_massif_site23' not in html:
    taurus_old = """      {
        id: 'taurus_littrow',
        name: 'Valle Taurus-Littrow (Apollo 17)',
        body: 'Luna',
        mission: 'Misión Apollo 17 / Exploración Geológica Tripulada',
        lat: 20.19, lon: 30.77,
        elevation: -2800.0,
        terrain: 16.5, relief: 1600.0, roughness: 18.0,
        temp: -15.0, temp_swing: 285.0, precip: 0.0, solar_flux: 14.8, atm_pressure: 0.0,
        geology: 'pyroclastic_valley',
        minerals: ['Vidrio volcánico piroclástico naranja', 'Basalto titanífero', 'Anortosita de macizo'],
        summary: 'Valle profundo encajado entre macizos montañosos con depósitos de vidrio piroclástico naranja volcánico.'
      }"""

    taurus_and_malapert = """      {
        id: 'taurus_littrow',
        name: 'Valle Taurus-Littrow (Apollo 17)',
        body: 'Luna',
        mission: 'Misión Apollo 17 / Exploración Geológica Tripulada',
        lat: 20.19, lon: 30.77,
        elevation: -2800.0,
        terrain: 16.5, relief: 1600.0, roughness: 18.0,
        temp: -15.0, temp_swing: 285.0, precip: 0.0, solar_flux: 14.8, atm_pressure: 0.0,
        geology: 'pyroclastic_valley',
        minerals: ['Vidrio volcánico piroclástico naranja', 'Basalto titanífero', 'Anortosita de macizo'],
        summary: 'Valle profundo encajado entre macizos montañosos con depósitos de vidrio piroclástico naranja volcánico.'
      },
      {
        id: 'malapert_massif_site23',
        name: 'Malapert Massif (Luna - Artemis III Sitio 23)',
        body: 'Luna',
        mission: 'NASA Artemis III Candidato Oficial Sitio 23 / LOLA & Diviner',
        lat: -85.99, lon: 2.93,
        elevation: 3535.0,
        terrain: 17.39, relief: 1450.0, roughness: 4.20,
        temp: -178.0, temp_swing: 165.0, precip: 0.0, solar_flux: 8.5, atm_pressure: 0.0,
        geology: 'polar_massif',
        minerals: ['Anortosita pura de tierras altas (PAN >90% anortita cálcica)', 'Piroxeno bajo en Fe', 'Olivino relicto', 'Trampas frías criogénicas (H2O volátil en PSR)'],
        summary: 'Macizo polar elevado de anortosita prístina con picos de cuasi-eterna iluminación solar (~90%) y visibilidad continua de la Tierra para telecomunicaciones en Artemis III (LOLA PGDA 78 y Diviner).'
      }"""

    html = html.replace(taurus_old, taurus_and_malapert)

# 3. ACTUALIZAR PCA_MODEL CON VALORES RECIÉN RE-ENTRENADOS
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
      mean: [0.221790, 0.096824, 0.181499, 0.776511, 0.185452, 0.074752, 0.643653, 0.525004],
      components: [
        [-0.135939, -0.146585, -0.205148, 0.339712, -0.430277, 0.112487, 0.349647, 0.694622],
        [0.588836, 0.447054, 0.592323, 0.098261, -0.170513, 0.049482, 0.221300, 0.111427],
        [-0.102203, -0.051906, -0.050086, 0.254747, 0.108387, -0.330707, 0.777175, -0.440840]
      ],
      explained_variance: [52.7, 24.7, 9.0]
    };"""

html = re.sub(
    r'const PCA_MODEL = \{.*?\n\s*\};\n',
    new_pca_model + '\n',
    html,
    count=1,
    flags=re.DOTALL
)

# 4. ENRIQUECER CITAS ESPECÍFICAS EN LA TABLA COMPARATIVA LADO A LADO
# Buscamos la definición de tableRowsData
old_tbody_block = """      const tbody = document.getElementById('audit-table-body');
      tbody.innerHTML = '';

      const tableRowsData = ["""

new_tbody_block = """      const tbody = document.getElementById('audit-table-body');
      tbody.innerHTML = '';

      // Asignación de fuentes científicas oficiales contextualmente calibradas
      let pdsMissionSource = 'NASA Planetary Data System (PDS)';
      let pdsMissionUrl = 'https://pds-geosciences.wustl.edu/';
      let topoSourceText = (target.body === 'Luna') ? 'SRTM v3.0 Global 30m & LOLA GDR' : 'NASADEM 1-ArcSec & MOLA MEGDR';
      let topoSourceUrl = (target.body === 'Luna') ? 'https://lunar.gsfc.nasa.gov/' : 'https://pds-geosciences.wustl.edu/missions/mgs/megdr.html';
      let climSourceText = 'NASA POWER & Mars REMS/MEDA';
      let climSourceUrl = 'https://power.larc.nasa.gov/';
      let minSourceText = 'USGS Report 81-182 & Squyres et al. (Science)';
      let minSourceUrl = 'https://doi.org/10.1126/science.1104559';

      if (target.id === 'utopia_planitia_vl2') {
        pdsMissionSource = 'NASA Viking Lander 2 Surface Met (PDS Atmospheres)';
        pdsMissionUrl = 'https://atmos.nmsu.edu/data_and_services/atmospheres_data/MARS/viking/surface_met.html';
        climSourceText = 'VL2 Met Daily Pressure & Temp Sensor (NMSU/PDS)';
        climSourceUrl = 'https://atmos.nmsu.edu/data_and_services/atmospheres_data/MARS/viking/sol_avg_sur_press_data.html';
        minSourceText = 'MGS TES Thermal Inertia & VL2 Mineral Chemistry';
        minSourceUrl = 'https://pds-geosciences.wustl.edu/missions/mgs/tes-timap.html';
      } else if (target.id === 'deuteronilus_mensae') {
        pdsMissionSource = 'MRO SHARAD / Baker & Carter (2023) / LMD MCD 6.2';
        pdsMissionUrl = 'https://doi.org/10.5281/zenodo.7753745';
        climSourceText = 'Mars Climate Database MCD 6.2 Climatology (LMD/ESA)';
        climSourceUrl = 'https://www-mars.lmd.jussieu.fr/mcd_python/';
        minSourceText = 'MRO SHARAD Subsurface Ice & TES Minerals (Bandfield 2002)';
        minSourceUrl = 'https://doi.org/10.1029/2022JE007549';
      } else if (target.id === 'malapert_massif_site23') {
        pdsMissionSource = 'NASA Goddard LOLA Site 23 (PGDA 78) & Artemis III Candidate';
        pdsMissionUrl = 'https://pgda.gsfc.nasa.gov/products/78';
        topoSourceText = 'LOLA 5m/px Site23 DEM & Slopes (NASA GSFC)';
        topoSourceUrl = 'https://pgda.gsfc.nasa.gov/products/78';
        climSourceText = 'LRO Diviner PCP-PRP & Polar Illumination (PGDA 69)';
        climSourceUrl = 'https://pgda.gsfc.nasa.gov/products/69';
        minSourceText = 'Chandrayaan-1 M3 Level 2 (CH1M3_0004) & LRO LEND';
        minSourceUrl = 'https://planetarydata.jpl.nasa.gov/img/data/m3/CH1M3_0004/INDEX/';
      } else if (target.id === 'de_gerlache_rim_2') {
        pdsMissionSource = 'NASA ADC FY23 / LRO LOLA & Diviner PCP Summer';
        pdsMissionUrl = 'https://lunar.gsfc.nasa.gov/';
        climSourceText = 'LRO Diviner PCP Summer Tbol (68.3 K)';
        climSourceUrl = 'https://pds-geosciences.wustl.edu/missions/lro/diviner.htm';
      } else if (target.id === 'mons_mouton_plateau') {
        pdsMissionSource = 'LRO LOLA (LDEM/LDSM/LDRM) & Diviner PRP (DLRE_PRP)';
        pdsMissionUrl = 'https://lunar.gsfc.nasa.gov/';
        climSourceText = 'LRO Diviner PRP (85.2 K mean, volatile traps)';
        climSourceUrl = 'https://pds-geosciences.wustl.edu/missions/lro/diviner.htm';
      }

      const tableRowsData = ["""

if old_tbody_block in html:
    html = html.replace(old_tbody_block, new_tbody_block)

# Reemplazar las fuentes genéricas en los primeros rows de tableRowsData
html = html.replace(
    "sourceText: 'NASA Planetary Data System (PDS)',\n          sourceUrl: 'https://pds-geosciences.wustl.edu/'",
    "sourceText: pdsMissionSource,\n          sourceUrl: pdsMissionUrl"
)

# 5. ACTUALIZAR REPOSITORIO BIBLIOGRÁFICO MAESTRO
old_biblio = """        <!-- Repositorio Bibliográfico Maestro -->
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
        </div>"""

new_biblio = """        <!-- Repositorio Bibliográfico Maestro -->
        <div style="margin-top: 1.2rem; margin-bottom: 0.5rem; font-size: 0.82rem; font-weight: 800; color: #38bdf8; text-transform: uppercase;">
          📖 Repositorio Bibliográfico Maestro & Fuentes de Datos Oficiales (NASA, ESA, ISRO, PDS)
        </div>
        <div style="font-size: 0.75rem; line-height: 1.6; color: #cbd5e1; display: flex; flex-direction: column; gap: 0.5rem;">
          <div>• <strong>NASA PDS Atmospheres Node (Viking Lander 2):</strong> Surface Meteorology, Daily Pressure & Opacity Datasets (<a href="https://atmos.nmsu.edu/data_and_services/atmospheres_data/MARS/viking/surface_met.html" target="_blank" style="color: var(--accent);">atmos.nmsu.edu/vl2</a>). Coordenadas oficiales y telemetría in-situ de Marte.</div>
          <div>• <strong>MRO SHARAD / Baker & Carter (2023):</strong> "Ice Content of Mantling Materials in Deuteronilus Mensae, Mars", <em>JGR Planets</em>, DOI: <a href="https://doi.org/10.1029/2022JE007549" target="_blank" style="color: var(--accent);">10.1029/2022JE007549</a>. Dataset de reflectores basales de hielo en Zenodo: <a href="https://doi.org/10.5281/zenodo.7753745" target="_blank" style="color: var(--accent);">doi.org/10.5281/zenodo.7753745</a>.</div>
          <div>• <strong>Laboratoire de Météorologie Dynamique (LMD/ESA/CNES):</strong> Mars Climate Database (MCD 6.2) Climatology & NetCDF Dust Scenarios (<a href="https://www-mars.lmd.jussieu.fr/mcd_python/" target="_blank" style="color: var(--accent);">www-mars.lmd.jussieu.fr</a>).</div>
          <div>• <strong>NASA Goddard Planetary Geodesy Data Archive (PGDA):</strong> LRO LOLA Topography & Slopes for Artemis III Site 23 (Malapert Massif, 5 m/px). <a href="https://pgda.gsfc.nasa.gov/products/78" target="_blank" style="color: var(--accent);">pgda.gsfc.nasa.gov/products/78</a>.</div>
          <div>• <strong>NASA Goddard Lunar Polar Illumination Archive:</strong> Persistent Shadow, Solar Visibility & Earth Line-of-Sight (85°S-90°S, 60 m/px). <a href="https://pgda.gsfc.nasa.gov/products/69" target="_blank" style="color: var(--accent);">pgda.gsfc.nasa.gov/products/69</a>.</div>
          <div>• <strong>NASA Planetary Data System (PDS) LRO Diviner Node:</strong> Polar Cumulative (PCP) & Polar Resource (PRP) Bolometric Temperatures (<a href="https://pds-geosciences.wustl.edu/missions/lro/diviner.htm" target="_blank" style="color: var(--accent);">pds-geosciences.wustl.edu/diviner</a>).</div>
          <div>• <strong>ISRO / NASA PDS Moon Mineralogy Mapper (M³):</strong> Chandrayaan-1 Hyperspectral Level 2 Reflectance (<a href="https://planetarydata.jpl.nasa.gov/img/data/m3/CH1M3_0004/INDEX/" target="_blank" style="color: var(--accent);">planetarydata.jpl.nasa.gov/m3</a>).</div>
          <div>• <strong>NASA PDS LRO LEND Node:</strong> Lunar Exploration Neutron Detector RDR Epithermal Neutron Absorption for Subsurface Hydrogen (<a href="https://pds-geosciences.wustl.edu/missions/lro/lend.htm" target="_blank" style="color: var(--accent);">pds-geosciences.wustl.edu/lend</a>).</div>
          <div>• <strong>ASU / PDS TES Node (Bandfield 2002):</strong> Global Thermal Emission Spectrometer Mineral Maps & Thermal Inertia (<a href="https://tes.mars.asu.edu/products/" target="_blank" style="color: var(--accent);">tes.mars.asu.edu</a>).</div>
          <div>• <strong>NASA Jet Propulsion Laboratory (JPL) & USGS:</strong> NASADEM Merged DEM Global 1 arc-second (30m) & Shuttle Radar Topography Mission (SRTM v3.0). <a href="https://earthdata.nasa.gov/" target="_blank" style="color: var(--accent);">earthdata.nasa.gov</a></div>
          <div>• <strong>NASA Prediction of Worldwide Energy Resources (POWER):</strong> 30-Year Solar and Meteorological Datasets (CERES SYN1deg & MERRA-2 Barometric). <a href="https://power.larc.nasa.gov/" target="_blank" style="color: var(--accent);">power.larc.nasa.gov</a></div>
          <div>• <strong>Opportunity Rover Science Team (Squyres et al., 2004):</strong> "In Situ Evidence for an Ancient Aqueous Environment at Meridiani Planum, Mars". <em>Science</em>, 306(5702), 1698-1703. DOI: 10.1126/science.1104559.</div>
          <div>• <strong>Apollo 15 Preliminary Science Report (NASA SP-289):</strong> "Geologic Investigation of the Hadley-Apennine Region" (Swann et al., 1972).</div>
          <div>• <strong>USGS Open-File Report 81-182:</strong> "Lithium and Saline Deposits of the Salar de Uyuni, Bolivia" (Ericksen, Vine & Ballón).</div>
        </div>"""

if old_biblio in html:
    html = html.replace(old_biblio, new_biblio)

with open(HTML_PATH, 'w', encoding='utf-8') as f:
    f.write(html)

print("[✓] ensayo.html actualizado con éxito con los nuevos destinos, PCA, citas y repositorio bibliográfico.")
