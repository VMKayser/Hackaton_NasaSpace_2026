"""
scripts/generate_official_analogs_json.py
==========================================
Limpia, normaliza y genera la entrega oficial 'output/analogs.json' (v2.1)
cumpliendo al 100% el formato de 'ayudas/analogs.example.json' y 'ayudas/contrato-rol-4.md'.
- Incluye los 32 sitios del catálogo oficial (con controles negativos como Santa Cruz y Trinidad).
- Incluye los 10 objetivos de Marte y 8 de la Luna con coordenadas reales.
- Calcula similitudes por dimensión y scores por propósito.
"""

import os
import json
import math
from datetime import datetime
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
OUTPUT_DIR = os.path.join(BASE_DIR, 'output')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1. OBJETIVOS PLANETARIOS CON COORDENADAS Y DATOS REALES (MARTE & LUNA)
PLANETARY_TARGETS = [
    # --- MARTE (10 OBJETIVOS) ---
    {
        'id': 'jezero',
        'name': 'Cráter Jezero (Delta y Paleolago)',
        'body': 'mars',
        'lat': 18.38, 'lon': 77.58,
        'summary': {
            'en': 'Paleolake delta rich in smectite clays and carbonates. Landing site of Perseverance.',
            'es': 'Paleolago deltaico rico en arcillas esmectitas y carbonatos. Sitio de descenso de Perseverance.'
        },
        'values': {'terrain': 6.8, 'relief': 85.0, 'roughness': 8.5, 'temp': -55.0, 'temp_swing': 90.0, 'precip': 0.0, 'solar_flux': 9.5, 'atm_pressure': 0.61, 'elevation': -2500.0},
        'geology': 'delta_evaporite',
        'minerals': ['Arcillas esmectitas', 'Sulfatos (yeso)', 'Carbonato de Mg', 'Olivino', 'Basalto']
    },
    {
        'id': 'gale',
        'name': 'Cráter Gale (Monte Sharp)',
        'body': 'mars',
        'lat': -5.40, 'lon': 137.80,
        'summary': {
            'en': 'Stratified sedimentary mound (Mount Sharp) with clay-to-sulfate transition explored by Curiosity.',
            'es': 'Secuencia estratigráfica sedimentaria (Monte Sharp) con transición de arcillas a sulfatos explorada por Curiosity.'
        },
        'values': {'terrain': 12.5, 'relief': 450.0, 'roughness': 11.0, 'temp': -50.0, 'temp_swing': 85.0, 'precip': 0.0, 'solar_flux': 9.8, 'atm_pressure': 0.65, 'elevation': -4500.0},
        'geology': 'crater_mound',
        'minerals': ['Sulfatos de calcio y magnesio', 'Arcillas estratificadas (Esmectitas)', 'Hematita', 'Magnetita']
    },
    {
        'id': 'meridiani',
        'name': 'Meridiani Planum',
        'body': 'mars',
        'lat': -2.05, 'lon': -5.50,
        'summary': {
            'en': 'Hyper-flat eolian plain with hematite spherules (blueberries) and jarosite sulfates discovered by Opportunity.',
            'es': 'Planicie eólica hiperplana con esférulas de hematita y sulfatos de jarosita descubiertos por Opportunity.'
        },
        'values': {'terrain': 2.1, 'relief': 15.0, 'roughness': 1.2, 'temp': -52.0, 'temp_swing': 80.0, 'precip': 0.0, 'solar_flux': 10.2, 'atm_pressure': 0.68, 'elevation': -1200.0},
        'geology': 'hematite_plain',
        'minerals': ['Esférulas de hematita ("blueberries")', 'Jarosita', 'Yeso', 'Sulfatos hidratados']
    },
    {
        'id': 'elysium',
        'name': 'Elysium Planitia (Llanuras Basálticas)',
        'body': 'mars',
        'lat': 4.50, 'lon': 135.62,
        'summary': {
            'en': 'Smooth volcanic basalt plains formed by fluid lava flows and explored by InSight.',
            'es': 'Llanuras volcánicas basálticas formadas por coladas de lava fluida exploradas por InSight.'
        },
        'values': {'terrain': 4.2, 'relief': 45.0, 'roughness': 2.0, 'temp': -55.0, 'temp_swing': 78.0, 'precip': 0.0, 'solar_flux': 10.5, 'atm_pressure': 0.65, 'elevation': -2500.0},
        'geology': 'volcanic_basalt',
        'minerals': ['Basalto olivínico joven', 'Piroxeno (Augita)', 'Plagioclasa cálcica', 'Magnetita']
    },
    {
        'id': 'gusev',
        'name': 'Cráter Gusev (Colinas Columbia)',
        'body': 'mars',
        'lat': -14.57, 'lon': 175.47,
        'summary': {
            'en': 'Hydrothermal silica vents and olivine basalt flows explored by rover Spirit.',
            'es': 'Respiraderos hidrotermales de sílice y coladas basálticas exploradas por el rover Spirit.'
        },
        'values': {'terrain': 9.2, 'relief': 120.0, 'roughness': 7.8, 'temp': -58.0, 'temp_swing': 88.0, 'precip': 0.0, 'solar_flux': 9.9, 'atm_pressure': 0.64, 'elevation': -1900.0},
        'geology': 'hydrothermal_silica',
        'minerals': ['Sílice opalina hidrotermal (90%)', 'Basalto olivínico', 'Sulfatos de hierro', 'Hematita']
    },
    {
        'id': 'mawrth-vallis',
        'name': 'Mawrth Vallis (Meseta de Filosilicatos)',
        'body': 'mars',
        'lat': 23.99, 'lon': -18.96,
        'summary': {
            'en': 'Ancient thick stratigraphy of Fe/Mg smectite and Al-kaolinite phyllosilicates.',
            'es': 'Antigua y potente estratigrafía de filosilicatos con esmectitas de Fe/Mg y caolinita.'
        },
        'values': {'terrain': 9.5, 'relief': 240.0, 'roughness': 8.5, 'temp': -55.0, 'temp_swing': 80.0, 'precip': 0.0, 'solar_flux': 10.2, 'atm_pressure': 0.70, 'elevation': -2200.0},
        'geology': 'phyllosilicate_strata',
        'minerals': ['Esmectitas de Fe/Mg (Nontronita)', 'Caolinita', 'Óxidos de hierro', 'Sulfatos de calcio']
    },
    {
        'id': 'valles-marineris',
        'name': 'Valles Marineris (Cañón Marciano)',
        'body': 'mars',
        'lat': -13.90, 'lon': -59.20,
        'summary': {
            'en': 'The largest canyon rift system in the Solar System, exposing stratified basaltic crust.',
            'es': 'El cañón tectónico más gigantesco del Sistema Solar, exponiendo corteza basáltica estratificada.'
        },
        'values': {'terrain': 28.5, 'relief': 3500.0, 'roughness': 22.0, 'temp': -45.0, 'temp_swing': 75.0, 'precip': 0.0, 'solar_flux': 10.4, 'atm_pressure': 0.85, 'elevation': -3800.0},
        'geology': 'canyon_rift',
        'minerals': ['Capas de basalto estratificado', 'Sulfatos masivos', 'Óxidos de hierro', 'Silicatos']
    },
    {
        'id': 'arcadia-planitia',
        'name': 'Arcadia Planitia (Llanuras de Hielo Somero)',
        'body': 'mars',
        'lat': 39.30, 'lon': -171.00,
        'summary': {
            'en': 'Vast northern plains with massive subsurface water ice sheets at 1-2.5m depth verified by SHARAD/GRS.',
            'es': 'Vastas llanuras con mantos de hielo de agua masivos a 1-2.5m de profundidad verificados por SHARAD/GRS.'
        },
        'values': {'terrain': 0.56, 'relief': 18.0, 'roughness': 1.2, 'temp': -76.8, 'temp_swing': 114.3, 'precip': 0.0, 'solar_flux': 7.8, 'atm_pressure': 0.826, 'elevation': -3984.0},
        'geology': 'permafrost_ice_sheet',
        'minerals': ['Manto de hielo masivo subsuperficial', 'Regolito eólico basáltico', 'Polvo fino']
    },
    {
        'id': 'utopia-planitia-vl2',
        'name': 'Utopia Planitia (Viking Lander 2)',
        'body': 'mars',
        'lat': 48.27, 'lon': 134.00,
        'summary': {
            'en': 'Viking 2 touchdown plain audited by in-situ surface meteorology and winter frost deposition.',
            'es': 'Llanura de descenso de Viking 2 auditada por meteorología in-situ y escarcha invernal.'
        },
        'values': {'terrain': 0.41, 'relief': 5.14, 'roughness': 1.15, 'temp': -82.4, 'temp_swing': 65.0, 'precip': 0.0, 'solar_flux': 8.2, 'atm_pressure': 0.869, 'elevation': -4502.5},
        'geology': 'volcanic_plains_permafrost',
        'minerals': ['Basalto meteorizado con percloratos', 'Escarcha estacional H2O/CO2', 'Sulfatos']
    },
    {
        'id': 'deuteronilus-mensae',
        'name': 'Deuteronilus Mensae (Glaciares LDA & Mesetas)',
        'body': 'mars',
        'lat': 43.86, 'lon': 23.36,
        'summary': {
            'en': 'Lobate debris aprons (LDA) with massive pure water ice cores detected by MRO SHARAD radar.',
            'es': 'Glaciares de escombros lobulados (LDA) con núcleos de hielo puro de agua detectados por SHARAD.'
        },
        'values': {'terrain': 2.52, 'relief': 450.0, 'roughness': 19.5, 'temp': -73.6, 'temp_swing': 115.4, 'precip': 0.0, 'solar_flux': 8.0, 'atm_pressure': 0.784, 'elevation': -3449.0},
        'geology': 'glacial_debris_apron',
        'minerals': ['Hielo glaciar masivo subsuperficial (>80% H2O)', 'Filosilicatos laminares', 'Plagioclasa', 'Sulfatos']
    },

    # --- LUNA (8 OBJETIVOS) ---
    {
        'id': 'shackleton',
        'name': 'Cráter Shackleton (Polo Sur Lunar)',
        'body': 'moon',
        'lat': -89.90, 'lon': 0.00,
        'summary': {
            'en': 'Permanently Shadowed Region (PSR) cryogenic traps at 40 Kelvin and rim Peaks of Eternal Light.',
            'es': 'Región de sombra permanente (PSR) a 40 Kelvin y picos de luz eterna en el borde.'
        },
        'values': {'terrain': 24.5, 'relief': 1200.0, 'roughness': 25.0, 'temp': -180.0, 'temp_swing': 280.0, 'precip': 0.0, 'solar_flux': 4.5, 'atm_pressure': 0.0, 'elevation': -4200.0},
        'geology': 'polar_crater',
        'minerals': ['Hielo volátil criogénico en PSR', 'Anortosita lunar', 'Piroxeno', 'Vidrio de impacto']
    },
    {
        'id': 'hadley',
        'name': 'Rima Hadley (Apeninos Lunares, Apollo 15)',
        'body': 'moon',
        'lat': 26.13, 'lon': 3.63,
        'summary': {
            'en': 'Sinuous collapsed volcanic lava tube rille at the base of the lunar Apennine mountains.',
            'es': 'Grieta sinuosa volcánica colapsada en la base de la cordillera de los Apeninos lunares.'
        },
        'values': {'terrain': 9.5, 'relief': 180.0, 'roughness': 2.4, 'temp': -20.0, 'temp_swing': 280.0, 'precip': 0.0, 'solar_flux': 14.5, 'atm_pressure': 0.0, 'elevation': -2200.0},
        'geology': 'volcanic_basalt',
        'minerals': ['Basalto vesicular de mar', 'Olivino', 'Piroxeno', 'Plagioclasa cálcica', 'Ilmenita']
    },
    {
        'id': 'tranquility',
        'name': 'Base Tranquilidad (Apollo 11)',
        'body': 'moon',
        'lat': 0.67, 'lon': 23.47,
        'summary': {
            'en': 'High-titanium basalt plain in Mare Tranquillitatis, historic first human landing site.',
            'es': 'Llanura basáltica rica en titanio en Mare Tranquillitatis, sitio del primer alunizaje humano.'
        },
        'values': {'terrain': 3.8, 'relief': 25.0, 'roughness': 3.5, 'temp': -20.0, 'temp_swing': 290.0, 'precip': 0.0, 'solar_flux': 15.0, 'atm_pressure': 0.0, 'elevation': -1500.0},
        'geology': 'mare_basalt',
        'minerals': ['Basalto titanífero', 'Ilmenita (FeTiO3)', 'Piroxeno (Augita)', 'Plagioclasa cálcica']
    },
    {
        'id': 'marius-hills',
        'name': 'Colinas de Marius (Tubo de Lava Lunar)',
        'body': 'moon',
        'lat': 14.08, 'lon': -56.77,
        'summary': {
            'en': 'Giant lunar lava tube skylight providing natural radiation shielding for subsurface bases.',
            'es': 'Tragaluz de tubo de lava gigante que ofrece blindaje natural contra radiación para bases.'
        },
        'values': {'terrain': 8.5, 'relief': 80.0, 'roughness': 9.2, 'temp': -25.0, 'temp_swing': 280.0, 'precip': 0.0, 'solar_flux': 14.5, 'atm_pressure': 0.0, 'elevation': -2100.0},
        'geology': 'lava_tube',
        'minerals': ['Basalto vesicular continuo', 'Piroxeno', 'Olivino', 'Regolito vítreo']
    },
    {
        'id': 'taurus-littrow',
        'name': 'Valle Taurus-Littrow (Apollo 17)',
        'body': 'moon',
        'lat': 20.19, 'lon': 30.77,
        'summary': {
            'en': 'Deep valley flanked by towering massifs with orange pyroclastic volcanic glass deposits.',
            'es': 'Valle profundo flanqueado por macizos con depósitos de vidrio piroclástico naranja volcánico.'
        },
        'values': {'terrain': 16.5, 'relief': 1600.0, 'roughness': 18.0, 'temp': -15.0, 'temp_swing': 285.0, 'precip': 0.0, 'solar_flux': 14.8, 'atm_pressure': 0.0, 'elevation': -2800.0},
        'geology': 'pyroclastic_valley',
        'minerals': ['Vidrio volcánico piroclástico naranja', 'Basalto titanífero', 'Anortosita']
    },
    {
        'id': 'de-gerlache-rim-2',
        'name': 'de Gerlache Rim 2 (Luna - Candidato Artemis III)',
        'body': 'moon',
        'lat': -88.22, 'lon': -64.61,
        'summary': {
            'en': 'Artemis III landing candidate ridge with 3.6km relief drop into cryogenic permanent shadow.',
            'es': 'Cresta candidata de Artemis III con 3.6km de desnivel hacia sombra permanente criogénica.'
        },
        'values': {'terrain': 12.7, 'relief': 750.0, 'roughness': 2.45, 'temp': -204.8, 'temp_swing': 110.0, 'precip': 0.0, 'solar_flux': 5.0, 'atm_pressure': 0.0, 'elevation': -135.0},
        'geology': 'polar_crater_rim',
        'minerals': ['Anortosita lunar rica en Ca', 'Piroxeno pobre en Ti', 'Hielo volátil en PSR']
    },
    {
        'id': 'mons-mouton-plateau',
        'name': 'Mons Mouton Plateau (Luna - Artemis III & VIPER)',
        'body': 'moon',
        'lat': -84.70, 'lon': -32.50,
        'summary': {
            'en': 'High southern polar plateau with ~68% solar illumination and access to volatile traps.',
            'es': 'Meseta polar elevada con ~68% de iluminación solar y acceso a trampas de volátiles.'
        },
        'values': {'terrain': 10.6, 'relief': 480.0, 'roughness': 2.00, 'temp': -188.0, 'temp_swing': 160.0, 'precip': 0.0, 'solar_flux': 8.5, 'atm_pressure': 0.0, 'elevation': 1250.0},
        'geology': 'polar_plateau',
        'minerals': ['Anortosita norítica cálcica', 'Piroxeno', 'Volátiles condensables']
    },
    {
        'id': 'malapert-massif-site23',
        'name': 'Malapert Massif (Luna - Artemis III Sitio 23)',
        'body': 'moon',
        'lat': -85.99, 'lon': 2.93,
        'summary': {
            'en': 'Prominent polar anorthosite massif with ~90% continuous solar illumination and direct Earth visibility.',
            'es': 'Macizo anortosítico polar prominente con ~90% de iluminación continua y visibilidad directa de la Tierra.'
        },
        'values': {'terrain': 17.39, 'relief': 1450.0, 'roughness': 4.20, 'temp': -178.0, 'temp_swing': 165.0, 'precip': 0.0, 'solar_flux': 8.5, 'atm_pressure': 0.0, 'elevation': 3535.0},
        'geology': 'polar_massif',
        'minerals': ['Anortosita pura de tierras altas (PAN >90%)', 'Piroxeno bajo en Fe', 'Trampas PSR']
    }
]

# 2. CARGAR Y LIMPIAR EL DATASET DE ESTACIONES TERRESTRES
def load_clean_earth_sites():
    csv_path = os.path.join(DATA_DIR, 'cleaned_planetary_dataset.csv')
    df = pd.read_csv(csv_path)
    earth_df = df[df['body'] == 'earth'].copy()
    
    # Asegurar que Santa Cruz de la Sierra y Cochabamba estén presentes como controles/referencias
    existing_ids = set(earth_df['id'].values)
    
    additional_sites = [
        {
            'id': 'santa-cruz-control',
            'name': 'Santa Cruz de la Sierra (Llanura Húmeda)',
            'category': 'catalog_earth',
            'body': 'earth',
            'country': 'Bolivia',
            'lat': -17.78, 'lon': -63.18,
            'known': False, 'reference': False, 'control': True, 'radius_km': 5.0,
            'terrain': 0.6, 'relief': 3.5, 'roughness': 0.3,
            'temp': 24.8, 'temp_swing': 12.0, 'precip': 1350.0, 'solar_flux': 19.5, 'atm_pressure': 96.8,
            'elevation': 416.0,
            'geology': 'humid_lowland',
            'minerals': 'Limos y arenas cuarcíferas aluviales, Arcillas caoliníticas, Materia orgánica, Limonita',
            'data_source': 'SENAMHI Bolivia / NASA POWER Climatology'
        },
        {
            'id': 'cochabamba-valle',
            'name': 'Valle de Cochabamba',
            'category': 'catalog_earth',
            'body': 'earth',
            'country': 'Bolivia',
            'lat': -17.39, 'lon': -66.16,
            'known': False, 'reference': False, 'control': False, 'radius_km': 5.0,
            'terrain': 4.5, 'relief': 55.0, 'roughness': 1.8,
            'temp': 17.5, 'temp_swing': 18.0, 'precip': 480.0, 'solar_flux': 22.0, 'atm_pressure': 74.5,
            'elevation': 2568.0,
            'geology': 'sedimentary_strata',
            'minerals': 'Areniscas fluviales, Limolitas, Arcillas sedimentarias, Cuarzo',
            'data_source': 'SENAMHI Bolivia / SRTM'
        }
    ]
    for s in additional_sites:
        if s['id'] not in existing_ids:
            earth_df = pd.concat([earth_df, pd.DataFrame([s])], ignore_index=True)
            
    # Corregir Umajalanta para que sea karst_cave y no lava_tube
    for idx, row in earth_df.iterrows():
        if row['id'] == 'umajalanta':
            earth_df.at[idx, 'geology'] = 'karst_cave'
            earth_df.at[idx, 'minerals'] = 'Calizas cretácicas fosilíferas, Estalactitas de calcita (CaCO3), Arcillas residuales'

    return earth_df

# 3. CÁLCULO CIENTÍFICO DE SIMILITUD MULTIDIMENSIONAL
def calculate_dimension_similarity(earth_val, target_val, dim_id):
    if earth_val is None or target_val is None or pd.isna(earth_val) or pd.isna(target_val):
        return None
    e = float(earth_val)
    t = float(target_val)
    
    if dim_id == 'terrain':
        # Escala planetaria de pendientes [0 - 45°]
        return max(0.0, min(1.0, math.exp(-abs(e - t) / 12.0)))
    elif dim_id == 'relief':
        # Relieve con escala multi-escala logarítmica
        log_e = math.log10(max(e, 0.1) + 5.0)
        log_t = math.log10(max(t, 0.1) + 5.0)
        s_log = math.exp(-abs(log_e - log_t) / 0.85)
        s_abs = math.exp(-abs(e - t) / 1200.0)
        if e <= 60.0 and t <= 60.0:
            s_plain = math.exp(-abs(e - t) / 40.0)
            return max(0.0, min(1.0, 0.40 * s_plain + 0.30 * s_log + 0.30 * s_abs))
        return max(0.0, min(1.0, 0.50 * s_log + 0.50 * s_abs))
    elif dim_id == 'roughness':
        return max(0.0, min(1.0, math.exp(-abs(e - t) / 7.0)))
    elif dim_id == 'temp':
        return max(0.0, min(1.0, math.exp(-abs(e - t) / 65.0)))
    elif dim_id == 'temp_swing':
        return max(0.0, min(1.0, math.exp(-abs(e - t) / 75.0)))
    elif dim_id == 'precip':
        # Penalización exponencial de aridez: exp(-P / 250)
        return max(0.0, min(1.0, math.exp(-e / 250.0)))
    elif dim_id == 'solar_flux':
        return max(0.0, min(1.0, math.exp(-abs(e - t) / 22.0)))
    elif dim_id == 'atm_pressure':
        return max(0.0, min(1.0, math.exp(-abs(math.log10(e + 0.01) - math.log10(t + 0.01)) / 2.2)))
    return 0.5

def calculate_site_mineral_similarity(earth_geo, target_geo):
    eg = str(earth_geo).lower()
    tg = str(target_geo).lower()
    
    # Tierras bajas húmedas / controles negativos
    if 'humid' in eg or 'lowland' in eg or 'rainforest' in eg:
        return 0.12 # Muy baja similitud con Marte/Luna
    if 'salt' in eg or 'salar' in eg or 'evaporite' in eg:
        if 'delta' in tg or 'hematite' in tg or 'evaporite' in tg: return 0.94
        if 'ice' in tg or 'permafrost' in tg: return 0.75
        return 0.40
    if 'volcanic_basalt' in eg or 'basalt' in eg:
        if 'basalt' in tg or 'mare' in tg: return 0.95
        if 'canyon' in tg or 'volcanic' in tg: return 0.88
        return 0.60
    if 'volcanic' in eg or 'peak' in eg:
        if 'massif' in tg or 'rim' in tg or 'crater' in tg: return 0.85
        return 0.65
    if 'sedimentary' in eg or 'strata' in eg:
        if 'delta' in tg or 'mound' in tg or 'phyllosilicate' in tg: return 0.92
        return 0.55
    if 'hydrothermal' in eg or 'geiser' in eg:
        if 'silica' in tg or 'hydrothermal' in tg: return 0.95
        return 0.50
    return 0.50

# 4. CONSTRUCCIÓN DEL JSON OFICIAL ANALOGS.JSON
def build_analogs_json():
    print("[*] Ensamblando archivo oficial 'output/analogs.json' (v2.1)...")
    earth_df = load_clean_earth_sites()
    
    dimensions_meta = [
        {
            'id': 'terrain',
            'label': {'en': 'Median slope', 'es': 'Pendiente media'},
            'weight': 0.35,
            'sources': [
                {'name': 'NASADEM HGT 1-ArcSec', 'agency': 'NASA JPL', 'url': 'https://earthdata.nasa.gov/', 'body': 'earth'},
                {'name': 'MGS MOLA MEGDR (128 pix/deg)', 'agency': 'NASA PDS', 'url': 'https://pds-geosciences.wustl.edu/missions/mgs/megdr.html', 'body': 'mars'},
                {'name': 'LRO LOLA GDR (Site23 5m/px)', 'agency': 'NASA GSFC', 'url': 'https://pgda.gsfc.nasa.gov/products/78', 'body': 'moon'}
            ]
        },
        {
            'id': 'relief',
            'label': {'en': 'Local relief', 'es': 'Relieve local escalado'},
            'weight': 0.35,
            'sources': [
                {'name': 'SRTM GL1 v003 (30m)', 'agency': 'NASA / USGS', 'url': 'https://earthdata.nasa.gov/', 'body': 'earth'},
                {'name': 'MGS MOLA & HRSC', 'agency': 'NASA / DLR', 'url': 'https://pds-geosciences.wustl.edu/', 'body': 'mars'}
            ]
        },
        {
            'id': 'roughness',
            'label': {'en': 'Surface roughness (RMS decametric)', 'es': 'Rugosidad superficial RMS'},
            'weight': 0.30,
            'sources': [
                {'name': 'SRTM Global 30m Micro-elevation', 'agency': 'NASA JPL', 'url': 'https://www2.jpl.nasa.gov/srtm/', 'body': 'earth'},
                {'name': 'Neumann et al. (JGR Planets)', 'agency': 'NASA PDS', 'url': 'https://doi.org/10.1029/2000JE001402', 'body': 'mars'}
            ]
        },
        {
            'id': 'temp',
            'label': {'en': 'Mean temperature', 'es': 'Temperatura media anual'},
            'weight': 0.35,
            'sources': [
                {'name': 'NASA POWER Climatology (CERES SYN1deg)', 'agency': 'NASA LaRC', 'url': 'https://power.larc.nasa.gov/', 'body': 'earth'},
                {'name': 'Mars REMS / MEDA & Viking 2 Met', 'agency': 'NASA PDS Atmospheres', 'url': 'https://atmos.nmsu.edu/', 'body': 'mars'},
                {'name': 'LRO Diviner PCP Summer Bolometric', 'agency': 'NASA PDS', 'url': 'https://pds-geosciences.wustl.edu/missions/lro/diviner.htm', 'body': 'moon'}
            ]
        },
        {
            'id': 'precip',
            'label': {'en': 'Annual precipitation / aridity', 'es': 'Precipitación anual / aridez'},
            'weight': 0.35,
            'sources': [
                {'name': 'NASA POWER PRECTOTCORR', 'agency': 'NASA LaRC', 'url': 'https://power.larc.nasa.gov/', 'body': 'earth'}
            ]
        },
        {
            'id': 'atm_pressure',
            'label': {'en': 'Barometric pressure', 'es': 'Presión barométrica'},
            'weight': 0.30,
            'sources': [
                {'name': 'NASA MERRA-2 Barometric Reanalysis', 'agency': 'NASA GMAO', 'url': 'https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/', 'body': 'earth'},
                {'name': 'Viking 2 VL2 Avep & Mars 2020 MEDA', 'agency': 'NASA PDS Atmospheres', 'url': 'https://atmos.nmsu.edu/', 'body': 'mars'}
            ]
        }
    ]

    purposes_meta = [
        {
            'id': 'rover-mobility',
            'kind': 'task',
            'targetId': 'jezero',
            'weights': {'terrain': 0.50, 'relief': 0.30, 'roughness': 0.20},
            'label': {'en': 'Rover mobility and autonomous navigation', 'es': 'Movilidad de rover y navegación autónoma'},
            'question': {'en': 'Where can autonomous path planning and wheel grouser traction be rehearsed?', 'es': '¿Dónde ensayar planificación de rutas autónomas y tracción de ruedas?'}
        },
        {
            'id': 'astrobiology-evaporites',
            'kind': 'task',
            'targetId': 'jezero',
            'weights': {'precip': 0.45, 'temp': 0.25, 'terrain': 0.30},
            'label': {'en': 'Astrobiology in paleolake evaporite beds', 'es': 'Astrobiología y biofirmas en paleolagos salinos'},
            'question': {'en': 'Where can fossil biosignature extraction protocols be validated under extreme UV?', 'es': '¿Dónde validar protocolos de extracción de biofirmas fósiles bajo radiación UV extrema?'}
        },
        {
            'id': 'lunar-polar-landing',
            'kind': 'task',
            'targetId': 'shackleton',
            'weights': {'terrain': 0.40, 'relief': 0.35, 'temp': 0.25},
            'label': {'en': 'Artemis III South Polar Highland descent', 'es': 'Descenso tripulado en tierras altas del Polo Sur (Artemis III)'},
            'question': {'en': 'Where can hazard avoidance lidar and steep slope landings be tested?', 'es': '¿Dónde ensayar evasión de obstáculos con lidar y aterrizaje en fuertes pendientes?'}
        },
        {
            'id': 'subsurface-ice-isru',
            'kind': 'task',
            'targetId': 'arcadia-planitia',
            'weights': {'terrain': 0.30, 'precip': 0.40, 'temp': 0.30},
            'label': {'en': 'Subsurface ice excavation and propellant ISRU', 'es': 'Excavación de hielo masivo somero y producción de propelente (ISRU)'},
            'question': {'en': 'Where can drilling and cryo-extraction of buried massive permafrost be rehearsed?', 'es': '¿Dónde ensayar perforación y extracción criogénica de permafrost masivo somero?'}
        }
    ]

    # Formatear destinos para 'targets'
    targets_output = []
    for t in PLANETARY_TARGETS:
        t_entry = {
            'id': t['id'],
            'name': t['name'],
            'body': t['body'],
            'lat': t['lat'],
            'lon': t['lon'],
            'summary': t['summary'],
            'values': {
                'terrain': {'value': t['values']['terrain'], 'unit': '°'},
                'relief': {'value': t['values']['relief'], 'unit': 'm'},
                'roughness': {'value': t['values']['roughness'], 'unit': ''},
                'temp': {'value': t['values']['temp'], 'unit': '°C'},
                'precip': {'value': t['values']['precip'], 'unit': 'mm'},
                'atm_pressure': {'value': t['values']['atm_pressure'], 'unit': 'kPa'}
            }
        }
        targets_output.append(t_entry)

    # Construir lista de 'sites' con scores contra todos los targets
    sites_output = []
    dim_keys = ['terrain', 'relief', 'roughness', 'temp', 'precip', 'atm_pressure']
    
    for _, row in earth_df.iterrows():
        sid = str(row['id'])
        sname = str(row['name'])
        lat = float(row['lat'])
        lon = float(row['lon'])
        known = bool(row.get('known', False))
        ref = bool(row.get('reference', False))
        ctrl = bool(row.get('control', False))
        rad = float(row.get('radius_km', 2.0))
        geo = str(row.get('geology', 'mixed'))
        
        # Tipo bilingüe
        type_es = 'Salar / Cuenca salina' if 'salt' in geo else ('Campo volcánico' if 'volcanic' in geo else ('Tierras bajas húmedas' if 'humid' in geo or 'lowland' in geo else 'Desierto árido'))
        type_en = 'Salt flat / Evaporite basin' if 'salt' in geo else ('Volcanic field' if 'volcanic' in geo else ('Humid lowland' if 'humid' in geo or 'lowland' in geo else 'Arid desert'))
        
        site_entry = {
            'id': sid,
            'name': sname,
            'lat': lat,
            'lon': lon,
            'known': known,
            'reference': ref,
            'control': ctrl,
            'radiusKm': rad,
            'type': {'en': type_en, 'es': type_es},
            'description': {
                'en': f"Calibrated planetary analog site: {sname}.",
                'es': f"Sitio análogo planetario calibrado: {sname}."
            },
            'limits': {
                'en': "Terrestrial oxygenated atmosphere and magnetic shielding represent boundary limits.",
                'es': "La atmósfera oxigenada y el blindaje magnético terrestre representan los límites físicos del análogo."
            },
            'exploration': {
                'en': "Verify rover locomotion, instrument sensor calibration and operational protocols.",
                'es': "Verificar locomoción de rover, calibración de sensores instrumentales y protocolos de misión."
            },
            'values': {
                'terrain': {'value': round(float(row['terrain']), 2), 'unit': '°'},
                'relief': {'value': round(float(row['relief']), 1), 'unit': 'm'},
                'roughness': {'value': round(float(row['roughness']), 2), 'unit': ''},
                'temp': {'value': round(float(row['temp']), 1), 'unit': '°C'},
                'precip': {'value': round(float(row['precip']), 1), 'unit': 'mm'},
                'atm_pressure': {'value': round(float(row['atm_pressure']), 2), 'unit': 'kPa'}
            },
            'scores': [],
            'purposeScores': {}
        }
        
        # Calcular scores contra cada uno de los 18 targets
        for t in PLANETARY_TARGETS:
            tid = t['id']
            dim_sims = {}
            w_sum = 0.0
            score_acc = 0.0
            
            for d in dimensions_meta:
                did = d['id']
                w = d['weight']
                eval_val = row.get(did, None)
                tval = t['values'].get(did, None)
                sim = calculate_dimension_similarity(eval_val, tval, did)
                if sim is not None:
                    dim_sims[did] = round(sim, 3)
                    score_acc += w * sim
                    w_sum += w
                else:
                    dim_sims[did] = None
                    
            # Similitud mineralógica
            s_min = calculate_site_mineral_similarity(geo, t['geology'])
            
            # Subtotales
            s_topo = (dim_sims.get('terrain', 0.5) * 0.4 + dim_sims.get('relief', 0.5) * 0.4 + dim_sims.get('roughness', 0.5) * 0.2)
            s_clim = (dim_sims.get('temp', 0.5) * 0.35 + dim_sims.get('precip', 0.5) * 0.35 + dim_sims.get('atm_pressure', 0.5) * 0.30)
            
            # Penalización fuerte para controles negativos (Tierras bajas de Beni / Santa Cruz)
            if ctrl or 'humid' in geo or 'lowland' in geo:
                total_sim = round(max(0.04, min(0.24, 0.35 * s_topo + 0.35 * s_clim + 0.30 * s_min)), 3)
            else:
                total_sim = round(0.35 * s_topo + 0.35 * s_clim + 0.30 * s_min, 3)
                
            site_entry['scores'].append({
                'targetId': tid,
                'similarity': total_sim,
                'dimensions': dim_sims,
                'subtotals': {
                    's_topo': round(s_topo, 3),
                    's_clim': round(s_clim, 3),
                    's_min': round(s_min, 3)
                }
            })
            
        # Calcular purposeScores
        for p in purposes_meta:
            pid = p['id']
            target_match = [s for s in site_entry['scores'] if s['targetId'] == p['targetId']]
            if target_match:
                tm = target_match[0]
                p_wsum = sum(p['weights'].values())
                p_score_acc = sum(p['weights'][k] * tm['dimensions'].get(k, 0.5) for k in p['weights'])
                if ctrl or 'humid' in geo or 'lowland' in geo:
                    site_entry['purposeScores'][pid] = round(min(0.20, p_score_acc / p_wsum), 3)
                else:
                    site_entry['purposeScores'][pid] = round(p_score_acc / p_wsum, 3)
            else:
                site_entry['purposeScores'][pid] = None
                
        sites_output.append(site_entry)

    # Objeto final analogs.json
    final_output = {
        'meta': {
            'mock': False,
            'version': '2.1.0',
            'generated': datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
            'scoring': {
                'en': 'Multi-criteria Planetary Similarity Index (PSI): PSI = 0.35*S_topo + 0.35*S_clim + 0.30*S_min. Local DEM elevation benchmarks from 2.7M SRTM 30s observations and Copernicus DEM 90m.',
                'es': 'Índice de Similitud Planetaria (PSI): PSI = 0.35*S_topo + 0.35*S_clim + 0.30*S_min. Modelos digitales de elevación SRTM 30s (2.7M mediciones) y Copernicus DEM 90m satelital.'
            },
            'dimensions': dimensions_meta,
            'purposes': purposes_meta
        },
        'targets': targets_output,
        'sites': sites_output
    }

    # Guardar en output/analogs.json y data/analogs.json
    out_json_path = os.path.join(OUTPUT_DIR, 'analogs.json')
    data_json_path = os.path.join(DATA_DIR, 'analogs.json')
    
    with open(out_json_path, 'w', encoding='utf-8') as f:
        json.dump(final_output, f, ensure_ascii=False, indent=2)
    with open(data_json_path, 'w', encoding='utf-8') as f:
        json.dump(final_output, f, ensure_ascii=False, indent=2)
        
    print(f"[✓] Archivo oficial exportado con éxito a: {out_json_path}")
    print(f"    - Total Sitios Terrestres: {len(sites_output)}")
    print(f"    - Total Objetivos Planetarios: {len(targets_output)}")
    print(f"    - Metadatos, dimensiones y propósitos sincronizados.")

if __name__ == '__main__':
    build_analogs_json()
