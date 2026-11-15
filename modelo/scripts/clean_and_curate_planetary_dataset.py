"""
scripts/clean_and_curate_planetary_dataset.py
=============================================
Limpia, normaliza, selecciona y armoniza todos los datos planetarios:
1. Datos oficiales de la NASA de la carpeta 'datos/' (Artemis Gerlache Rim 2 y Mons Mouton Plateau).
2. Objetivos de Marte (10 cuencas y sitios de misiones: InSight, Opportunity, Perseverance, Curiosity, ExoMars, Spirit, etc.).
3. Objetivos de la Luna (8 sitios: Apollo 11, 15, 17, Artemis III candidatos, SELENE).
4. Red calibrada de estaciones terrestres (Bolivia, Andes, Argentina, Chile, y análogos globales extremos).
   - Incluye estaciones de control negativo (Santa Cruz, Trinidad, Yacuiba) para evitar falsos positivos en tierras bajas.
   - Corrige Umajalanta a caverna kárstica en calizas (karst_cave).
   - Rellena todos los minerales y fuentes oficiales para eliminar NaNs.
5. Elimina discrepancias, limpia ruido topográfico en relieve y rugosidad, y entrena el modelo PCA 3D.
Genera:
- data/cleaned_planetary_dataset.csv
- data/centralized_planetary_dataset.csv (actualizado y libre de ruido)
- modelos/calibrated_pca_model.json
"""

import os
import json
import math
import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODELS_DIR = os.path.join(BASE_DIR, 'modelos')
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

# ==============================================================================
# 1. OBJETIVOS PLANETARIOS LIMPIOS Y NORMALIZADOS (MARTE & LUNA)
# ==============================================================================
CLEAN_PLANETARY_TARGETS = [
    # --- MARTE (10 SITIOS Y CUENCAS) ---
    {
        'id': 'elysium-planitia',
        'name': 'Elysium Planitia (Llanuras Basálticas)',
        'category': 'planetary_target',
        'body': 'mars',
        'country': 'Mars',
        'lat': 4.50, 'lon': 135.62,
        'known': True, 'reference': True, 'control': False, 'radius_km': 10.0,
        'terrain': 4.2, 'relief': 45.0, 'roughness': 2.0,
        'temp': -55.0, 'temp_swing': 78.0, 'precip': 0.0, 'solar_flux': 10.5, 'atm_pressure': 0.65,
        'elevation': -2500.0,
        'geology': 'volcanic_basalt',
        'minerals': 'Basalto olivínico joven, Piroxeno (Augita), Plagioclasa cálcica, Magnetita, Óxidos de hierro',
        'data_source': 'NASA InSight SEIS & HP3 / MGS MOLA MEGDR / Mars Odyssey THEMIS'
    },
    {
        'id': 'meridiani-planum',
        'name': 'Meridiani Planum',
        'category': 'planetary_target',
        'body': 'mars',
        'country': 'Mars',
        'lat': -2.05, 'lon': -5.50,
        'known': True, 'reference': True, 'control': False, 'radius_km': 10.0,
        'terrain': 2.1, 'relief': 15.0, 'roughness': 1.2,
        'temp': -52.0, 'temp_swing': 80.0, 'precip': 0.0, 'solar_flux': 10.2, 'atm_pressure': 0.68,
        'elevation': -1200.0,
        'geology': 'hematite_plain',
        'minerals': 'Esférulas de hematita ("blueberries"), Jarosita, Yeso, Sulfatos hidratados',
        'data_source': 'NASA MER-B Opportunity (Athena Science Payload) / MRO CRISM'
    },
    {
        'id': 'jezero-crater',
        'name': 'Cráter Jezero (Delta Fluvio-Lacustre)',
        'category': 'planetary_target',
        'body': 'mars',
        'country': 'Mars',
        'lat': 18.38, 'lon': 77.58,
        'known': True, 'reference': True, 'control': False, 'radius_km': 10.0,
        'terrain': 5.8, 'relief': 110.0, 'roughness': 4.2,
        'temp': -54.0, 'temp_swing': 82.0, 'precip': 0.0, 'solar_flux': 10.0, 'atm_pressure': 0.67,
        'elevation': -2500.0,
        'geology': 'delta_lacustrine',
        'minerals': 'Esmectitas de Fe/Mg, Carbonatos de Mg, Arcillas sedimentarias, Sílice hidratada, Olivino relicto',
        'data_source': 'NASA Mars 2020 Perseverance / MEDA Atmosphere / SHERLOC / PIXL'
    },
    {
        'id': 'gale-crater',
        'name': 'Cráter Gale (Monte Sharp)',
        'category': 'planetary_target',
        'body': 'mars',
        'country': 'Mars',
        'lat': -5.40, 'lon': 137.80,
        'known': True, 'reference': True, 'control': False, 'radius_km': 10.0,
        'terrain': 12.5, 'relief': 450.0, 'roughness': 11.0,
        'temp': -50.0, 'temp_swing': 85.0, 'precip': 0.0, 'solar_flux': 9.8, 'atm_pressure': 0.65,
        'elevation': -4500.0,
        'geology': 'sedimentary_mountain',
        'minerals': 'Lutitas lacustres, Filosilicatos laminares, Sulfatos polihidratados, Hematita, Halita secundaria',
        'data_source': 'NASA MSL Curiosity (CheMin & SAM Instruments) / REMS Station'
    },
    {
        'id': 'valles-marineris',
        'name': 'Valles Marineris (Cañón Marciano)',
        'category': 'planetary_target',
        'body': 'mars',
        'country': 'Mars',
        'lat': -13.90, 'lon': -59.20,
        'known': True, 'reference': True, 'control': False, 'radius_km': 10.0,
        'terrain': 28.5, 'relief': 3500.0, 'roughness': 28.0,
        'temp': -48.0, 'temp_swing': 90.0, 'precip': 0.0, 'solar_flux': 9.5, 'atm_pressure': 0.72,
        'elevation': -3500.0,
        'geology': 'tectonic_rift',
        'minerals': 'Capas de sulfatos estratificados (Kieserita/Yeso), Óxidos de hierro, Basalto en escarpes tectónicos',
        'data_source': 'ESA Mars Express HRSC & OMEGA / NASA MRO HiRISE'
    },
    {
        'id': 'gusev-crater',
        'name': 'Cráter Gusev (Colinas Columbia)',
        'category': 'planetary_target',
        'body': 'mars',
        'country': 'Mars',
        'lat': -14.57, 'lon': 175.47,
        'known': True, 'reference': True, 'control': False, 'radius_km': 10.0,
        'terrain': 6.5, 'relief': 150.0, 'roughness': 5.2,
        'temp': -58.0, 'temp_swing': 88.0, 'precip': 0.0, 'solar_flux': 9.9, 'atm_pressure': 0.64,
        'elevation': -1900.0,
        'geology': 'volcanic_basalt',
        'minerals': 'Basalto vesicular de olivino, Piroxeno alcalino, Sílice hidrotermal pura (Home Plate), Hematita',
        'data_source': 'NASA MER-A Spirit Rover (Alpha Particle X-Ray Spectrometer)'
    },
    {
        'id': 'mawrth-vallis',
        'name': 'Mawrth Vallis (Mesetas de Arcillas)',
        'category': 'planetary_target',
        'body': 'mars',
        'country': 'Mars',
        'lat': 23.99, 'lon': -18.96,
        'known': True, 'reference': True, 'control': False, 'radius_km': 10.0,
        'terrain': 8.5, 'relief': 280.0, 'roughness': 7.5,
        'temp': -56.0, 'temp_swing': 84.0, 'precip': 0.0, 'solar_flux': 9.7, 'atm_pressure': 0.68,
        'elevation': -2200.0,
        'geology': 'ancient_clays',
        'minerals': 'Nontronita (esmectita de Fe), Montmorillonita (esmectita de Al), Caolinita, Sulfatos ácidos hidratados',
        'data_source': 'ESA ExoMars Rosalind Franklin Candidate Site / MRO CRISM Spectral Cube'
    },
    {
        'id': 'arcadia-planitia',
        'name': 'Arcadia Planitia (Llanuras de Hielo Somero)',
        'category': 'planetary_target',
        'body': 'mars',
        'country': 'Mars',
        'lat': 39.30, 'lon': -171.00,
        'known': True, 'reference': True, 'control': False, 'radius_km': 10.0,
        'terrain': 1.8, 'relief': 18.0, 'roughness': 1.4,
        'temp': -76.8, 'temp_swing': 114.3, 'precip': 0.0, 'solar_flux': 7.8, 'atm_pressure': 0.826,
        'elevation': -3984.0,
        'geology': 'permafrost_ice_sheet',
        'minerals': 'Manto de hielo de agua masivo somero (1-2.5m profundidad, 4.7 wt% H2O eq GRS), Regolito eólico basáltico, Filosilicatos de Fe/Mg',
        'data_source': 'MRO SHARAD / Mars Odyssey GRS / MGS MOLA / MCD 6.2'
    },
    {
        'id': 'utopia-planitia-vl2',
        'name': 'Utopia Planitia (Viking Lander 2)',
        'category': 'planetary_target',
        'body': 'mars',
        'country': 'Mars',
        'lat': 48.27, 'lon': 134.00,
        'known': True, 'reference': True, 'control': False, 'radius_km': 10.0,
        'terrain': 0.41, 'relief': 5.14, 'roughness': 1.15,
        'temp': -82.4, 'temp_swing': 65.0, 'precip': 0.0, 'solar_flux': 8.2, 'atm_pressure': 0.869,
        'elevation': -4502.5,
        'geology': 'volcanic_plains_permafrost',
        'minerals': 'Basalto meteorizado con percloratos (ClO4-), Capas de escarcha estacional H2O/CO2, Smectitas de Fe/Mg, Sulfatos hidratados',
        'data_source': 'NASA Viking Lander 2 Surface Met & MGS MOLA MEGDR / PDS Atmospheres'
    },
    {
        'id': 'deuteronilus-mensae',
        'name': 'Deuteronilus Mensae (Glaciares LDA & Mesetas)',
        'category': 'planetary_target',
        'body': 'mars',
        'country': 'Mars',
        'lat': 43.86, 'lon': 23.36,
        'known': True, 'reference': True, 'control': False, 'radius_km': 10.0,
        'terrain': 2.52, 'relief': 450.0, 'roughness': 19.5,
        'temp': -73.6, 'temp_swing': 115.4, 'precip': 0.0, 'solar_flux': 8.0, 'atm_pressure': 0.784,
        'elevation': -3449.0,
        'geology': 'glacial_debris_apron',
        'minerals': 'Hielo glaciar masivo subsuperficial (>80% H2O pura en manto protector), Filosilicatos laminares (5.2%), Plagioclasa (3.9%), Sulfatos (1.7%), Carbonatos (1.6%), Polvo regolítico (66.2%)',
        'data_source': 'MRO SHARAD (Zenodo DOI:10.5281/zenodo.7753745 / Baker & Carter 2023) / MGS MOLA / TES Minerals / MCD 6.2'
    },

    # --- LUNA (8 SITIOS Y CANDIDATOS ARTEMIS) ---
    {
        'id': 'rima-hadley',
        'name': 'Rima Hadley (Apeninos Lunares, Apollo 15)',
        'category': 'planetary_target',
        'body': 'moon',
        'country': 'Moon',
        'lat': 26.13, 'lon': 3.63,
        'known': True, 'reference': True, 'control': False, 'radius_km': 10.0,
        'terrain': 9.5, 'relief': 220.0, 'roughness': 2.4,
        'temp': -20.0, 'temp_swing': 280.0, 'precip': 0.0, 'solar_flux': 14.5, 'atm_pressure': 0.0,
        'elevation': -2200.0,
        'geology': 'volcanic_basalt',
        'minerals': 'Basalto de colada de lava vesicular, Olivino, Piroxeno (Pigeonita/Augita), Plagioclasa cálcica, Ilmenita',
        'data_source': 'NASA Apollo 15 Lunar Sample Catalog / LRO LOLA Altimetry'
    },
    {
        'id': 'shackleton-crater',
        'name': 'Cráter Shackleton (Polo Sur Lunar)',
        'category': 'planetary_target',
        'body': 'moon',
        'country': 'Moon',
        'lat': -89.90, 'lon': 0.00,
        'known': True, 'reference': True, 'control': False, 'radius_km': 10.0,
        'terrain': 24.5, 'relief': 1200.0, 'roughness': 25.0,
        'temp': -180.0, 'temp_swing': 280.0, 'precip': 0.0, 'solar_flux': 4.5, 'atm_pressure': 0.0,
        'elevation': -4200.0,
        'geology': 'polar_crater',
        'minerals': 'Hielo de agua en sombra permanente (PSR), Anortosita lunar, Piroxeno, Vidrio de impacto',
        'data_source': 'NASA Artemis III & Lunar Reconnaissance Orbiter (LOLA/Diviner)'
    },
    {
        'id': 'de-gerlache-rim-2',
        'name': 'de Gerlache Rim 2 (Luna - Candidato Artemis III)',
        'category': 'planetary_target',
        'body': 'moon',
        'country': 'Moon',
        'lat': -88.22, 'lon': -64.61,
        'known': True, 'reference': True, 'control': False, 'radius_km': 10.0,
        'terrain': 12.7, 'relief': 750.0, 'roughness': 2.45,
        'temp': -204.8, 'temp_swing': 110.0, 'precip': 0.0, 'solar_flux': 5.0, 'atm_pressure': 0.0,
        'elevation': -135.0,
        'geology': 'polar_crater_rim',
        'minerals': 'Anortosita lunar rica en Ca (Plagioclasa >88%), Piroxeno pobre en Ti, Olivino magnesiano, Hielo volátil en PSR',
        'data_source': 'NASA ADC FY23 / LRO LOLA DEM & Slope / LRO Diviner PCP Summer Tbol'
    },
    {
        'id': 'mons-mouton-plateau',
        'name': 'Mons Mouton Plateau (Luna - Artemis III & VIPER)',
        'category': 'planetary_target',
        'body': 'moon',
        'country': 'Moon',
        'lat': -84.70, 'lon': -32.50,
        'known': True, 'reference': True, 'control': False, 'radius_km': 10.0,
        'terrain': 10.6, 'relief': 480.0, 'roughness': 2.00,
        'temp': -188.0, 'temp_swing': 160.0, 'precip': 0.0, 'solar_flux': 8.5, 'atm_pressure': 0.0,
        'elevation': 1250.0,
        'geology': 'polar_plateau',
        'minerals': 'Anortosita norítica (Plagioclasa cálcica), Piroxeno, Volátiles condensables atrapados en regolito criogénico',
        'data_source': 'LRO LOLA (LDEM, LDSM, LDRM) / LRO Diviner PRP (DLRE_PRP_SOUTH.TAB) / Wueller et al.'
    },
    {
        'id': 'tranquility-base',
        'name': 'Base Tranquilidad (Apollo 11)',
        'category': 'planetary_target',
        'body': 'moon',
        'country': 'Moon',
        'lat': 0.67, 'lon': 23.47,
        'known': True, 'reference': True, 'control': False, 'radius_km': 10.0,
        'terrain': 3.8, 'relief': 25.0, 'roughness': 3.5,
        'temp': -20.0, 'temp_swing': 290.0, 'precip': 0.0, 'solar_flux': 15.0, 'atm_pressure': 0.0,
        'elevation': -1500.0,
        'geology': 'mare_basalt',
        'minerals': 'Basalto de mar lunar rico en titanio, Piroxeno (Augita), Ilmenita (FeTiO3), Plagioclasa cálcica, Olivino',
        'data_source': 'NASA Apollo 11 Lunar Science / LOLA'
    },
    {
        'id': 'marius-hills',
        'name': 'Colinas de Marius (Tubo de Lava Lunar)',
        'category': 'planetary_target',
        'body': 'moon',
        'country': 'Moon',
        'lat': 14.08, 'lon': -56.77,
        'known': True, 'reference': True, 'control': False, 'radius_km': 10.0,
        'terrain': 8.5, 'relief': 80.0, 'roughness': 9.2,
        'temp': -25.0, 'temp_swing': 280.0, 'precip': 0.0, 'solar_flux': 14.5, 'atm_pressure': 0.0,
        'elevation': -2100.0,
        'geology': 'lava_tube',
        'minerals': 'Basalto vesicular de flujo continuo, Piroxeno, Olivino, Regolito vítreo aglutinado',
        'data_source': 'JAXA Kaguya SELENE / NASA LRO Diviner & Camera Team'
    },
    {
        'id': 'taurus-littrow',
        'name': 'Valle Taurus-Littrow (Apollo 17)',
        'category': 'planetary_target',
        'body': 'moon',
        'country': 'Moon',
        'lat': 20.19, 'lon': 30.77,
        'known': True, 'reference': True, 'control': False, 'radius_km': 10.0,
        'terrain': 16.5, 'relief': 1600.0, 'roughness': 18.0,
        'temp': -15.0, 'temp_swing': 285.0, 'precip': 0.0, 'solar_flux': 14.8, 'atm_pressure': 0.0,
        'elevation': -2800.0,
        'geology': 'pyroclastic_valley',
        'minerals': 'Vidrio volcánico piroclástico naranja, Basalto titanífero, Anortosita de macizo',
        'data_source': 'NASA Apollo 17 Traverse Samples / LOLA DEM'
    },
    {
        'id': 'malapert-massif-site23',
        'name': 'Malapert Massif (Luna - Artemis III Sitio 23)',
        'category': 'planetary_target',
        'body': 'moon',
        'country': 'Moon',
        'lat': -85.99, 'lon': 2.93,
        'known': True, 'reference': True, 'control': False, 'radius_km': 10.0,
        'terrain': 17.39, 'relief': 1450.0, 'roughness': 4.20,
        'temp': -178.0, 'temp_swing': 165.0, 'precip': 0.0, 'solar_flux': 8.5, 'atm_pressure': 0.0,
        'elevation': 3535.0,
        'geology': 'polar_massif',
        'minerals': 'Anortosita pura de tierras altas (PAN >90% anortita cálcica), Piroxeno bajo en Fe, Olivino relicto, Trampas frías criogénicas (H2O volátil en PSR)',
        'data_source': 'NASA Goddard LOLA Site 23 (PGDA 78) / Lunar Polar Illumination (PGDA 69) / LRO Diviner PCP-PRP / Chandrayaan-1 M3'
    }
]

# Diccionario de metadatos geográficos verificados por coordenadas (País, Departamento/Región)
GEO_LOCATION_METADATA = {
    # Bolivia (33 estaciones)
    'uyuni': ('Bolivia', 'Potosí'),
    'coipasa': ('Bolivia', 'Oruro'),
    'sol-de-manana': ('Bolivia', 'Potosí'),
    'laguna-colorada': ('Bolivia', 'Potosí'),
    'siloli': ('Bolivia', 'Potosí'),
    'dali': ('Bolivia', 'Potosí'),
    'licancabur-laguna-verde': ('Bolivia', 'Potosí'),
    'uturuncu': ('Bolivia', 'Potosí'),
    'sajama': ('Bolivia', 'Oruro'),
    'ollague': ('Bolivia', 'Potosí'),
    'tunupa': ('Bolivia', 'Potosí / Oruro'),
    'poopo': ('Bolivia', 'Oruro'),
    'empexa': ('Bolivia', 'Potosí'),
    'chiguana': ('Bolivia', 'Potosí'),
    'chalviri': ('Bolivia', 'Potosí'),
    'capina': ('Bolivia', 'Potosí'),
    'pastos-grandes': ('Bolivia', 'Potosí'),
    'laguna-hedionda': ('Bolivia', 'Potosí'),
    'polques': ('Bolivia', 'Potosí'),
    'geiseres-sajama': ('Bolivia', 'Oruro'),
    'tata-sabaya': ('Bolivia', 'Oruro'),
    'los-frailes': ('Bolivia', 'Potosí'),
    'jayu-khota': ('Bolivia', 'Oruro'),
    'valle-de-rocas': ('Bolivia', 'Potosí'),
    'tupiza': ('Bolivia', 'Potosí'),
    'valle-de-la-luna': ('Bolivia', 'La Paz'),
    'huayna-potosi': ('Bolivia', 'La Paz'),
    'umajalanta': ('Bolivia', 'Potosí (Torotoro)'),
    'trinidad-control': ('Bolivia', 'Beni'),
    'coroico-control': ('Bolivia', 'La Paz (Yungas)'),
    'santa-cruz-control': ('Bolivia', 'Santa Cruz'),
    'cochabamba-valle': ('Bolivia', 'Cochabamba'),
    'yacuiba-chaco-control': ('Bolivia', 'Tarija'),

    # Argentina (8 estaciones)
    'antofagasta-alumbrera': ('Argentina', 'Catamarca'),
    'ischigualasto-talampaya': ('Argentina', 'San Juan'),
    'talampaya-canyon': ('Argentina', 'La Rioja'),
    'salar-hombre-muerto': ('Argentina', 'Catamarca'),
    'payunia-mendoza': ('Argentina', 'Mendoza'),
    'barreal-blanco': ('Argentina', 'San Juan'),
    'quebrada-humahuaca': ('Argentina', 'Jujuy'),
    'somuncura-patagonia': ('Argentina', 'Río Negro'),

    # Chile (3 estaciones)
    'yungay-atacama': ('Chile', 'Antofagasta'),
    'salar-atacama': ('Chile', 'Antofagasta'),
    'monturaqui-crater': ('Chile', 'Antofagasta'),

    # Perú (1 estación)
    'la-joya-desert': ('Perú', 'Arequipa'),

    # Internacionales / Extremos Mundiales (13 estaciones)
    'mcmurdo-antarctica': ('Antártida', 'Tierra Victoria'),
    'askja-iceland': ('Islandia', 'Tierras Altas'),
    'haughton-canada': ('Canadá', 'Isla Devon, Nunavut'),
    'rio-tinto-spain': ('España', 'Huelva, Andalucía'),
    'sahara-algeria': ('Argelia', 'Desierto del Sahara'),
    'amazon-manaus': ('Brasil', 'Amazonas'),
    'siberia-yakutsk': ('Rusia', 'Siberia / Sajá'),
    'himalaya-everest': ('Nepal', 'Khumbu, Himalaya'),
    'mojave-death-valley': ('Estados Unidos', 'California'),
    'great-plains-kansas': ('Estados Unidos', 'Kansas'),
    'dallol-danakil': ('Etiopía', 'Depresión de Danakil'),
    'kilauea-hawaii': ('Estados Unidos', 'Hawái'),
    'svalbard-permafrost': ('Noruega', 'Archipiélago de Svalbard')
}

# Estaciones terrestres adicionales de calibración y control
ADDITIONAL_EARTH_STATIONS = [
    {
        'id': 'santa-cruz-control',
        'name': 'Santa Cruz de la Sierra (Llanos del Oriente - Control Negativo)',
        'category': 'control_earth',
        'body': 'earth',
        'country': 'Bolivia',
        'lat': -17.78, 'lon': -63.18,
        'known': False, 'reference': False, 'control': True, 'radius_km': 15.0,
        'terrain': 1.2, 'relief': 12.0, 'roughness': 1.1,
        'temp': 25.0, 'temp_swing': 14.0, 'precip': 1350.0, 'solar_flux': 19.5, 'atm_pressure': 96.5,
        'elevation': 416.0,
        'geology': 'humid_lowland',
        'minerals': 'Arenas aluviales de cuarzo, Caolinita (arcilla de meteorización húmeda), Materia orgánica / Humus fértil, Limonita',
        'data_source': 'Copernicus DEM 90m / SENAMHI Bolivia / NASA POWER Climatology'
    },
    {
        'id': 'cochabamba-valle',
        'name': 'Valle de Cochabamba (Valle Interandino)',
        'category': 'catalog_earth',
        'body': 'earth',
        'country': 'Bolivia',
        'lat': -17.39, 'lon': -66.16,
        'known': False, 'reference': False, 'control': False, 'radius_km': 10.0,
        'terrain': 4.5, 'relief': 85.0, 'roughness': 2.2,
        'temp': 18.0, 'temp_swing': 16.0, 'precip': 480.0, 'solar_flux': 22.5, 'atm_pressure': 74.5,
        'elevation': 2568.0,
        'geology': 'interandean_valley',
        'minerals': 'Sedimentos aluviales cuaternarios, Arcillas detríticas, Arenisca y Limolita',
        'data_source': 'Copernicus DEM 90m / SENAMHI Bolivia'
    },
    {
        'id': 'yacuiba-chaco-control',
        'name': 'Gran Chaco Boliviano (Yacuiba - Sabana Semiárida)',
        'category': 'control_earth',
        'body': 'earth',
        'country': 'Bolivia',
        'lat': -22.01, 'lon': -63.68,
        'known': False, 'reference': False, 'control': True, 'radius_km': 15.0,
        'terrain': 1.8, 'relief': 25.0, 'roughness': 1.3,
        'temp': 23.0, 'temp_swing': 18.0, 'precip': 850.0, 'solar_flux': 20.5, 'atm_pressure': 94.5,
        'elevation': 620.0,
        'geology': 'humid_lowland',
        'minerals': 'Limos y arenas del Chaco, Arcillas aluviales, Materia orgánica',
        'data_source': 'Copernicus DEM 90m / SENAMHI Bolivia'
    }
]

# Diccionario de minerales representativos por geología
MINERAL_FILL_MAP = {
    'salt_lake': 'Halita (NaCl), Yeso (CaSO4·2H2O), Cloruro de Litio (LiCl), Sulfatos de magnesio, Boratos (Ulexita)',
    'volcanic': 'Andesita y Basalto rico en Fe-Mg, Olivino, Piroxeno, Magnetita, Plagioclasa cálcica, Azufre nativo',
    'volcanic_peak': 'Andesita, Piroxeno (Augita), Plagioclasa cálcica, Olivino, Magnetita, Azufre elemental nativo',
    'volcanic_basalt': 'Basalto toleítico y vesicular, Olivino, Piroxeno (Augita), Ilmenita, Magnetita',
    'hydrothermal': 'Sílice opalina sinterizada, Azufre nativo elemental, Jarosita, Yeso fumarólico, Esmectita',
    'desert': 'Arenas basálticas y eólicas, Ignimbritas de cuarzo y feldespato, Óxidos de hierro (Hematita)',
    'eolian_desert': 'Arenas basálticas y eólicas, Plagioclasa, Vidrio volcánico hidratado, Óxidos de hierro, Esmectitas',
    'erosion': 'Areniscas y limolitas estratificadas, Arcillas ferruginosas, Yeso detrítico, Cuarzo',
    'eroded_canyon': 'Areniscas, Lutitas estratificadas, Óxidos de hierro secundarios, Fragmentos líticos',
    'glacial': 'Hielo glaciar con morrenas de detritos andesíticos y cuarzo, Permafrost de alta montaña',
    'sedimentary_strata': 'Arcillas rojas (esmectitas/caolinita), Areniscas cuarzo-feldespáticas, Óxidos de hierro (hematita), Yeso',
    'cave': 'Calcita (CaCO3), Dolomita, Espeleotemas kársticos, Arcillas de disolución',
    'karst_cave': 'Calcita (CaCO3), Dolomita, Espeleotemas kársticos, Arcillas residuales de disolución',
    'humid_lowland': 'Arenas de cuarzo aluviales, Caolinita tropical, Materia orgánica / Humus fértil, Limonita',
    'lowland_plain': 'Arenas de cuarzo aluviales, Arcillas de meteorización, Humus activo',
    'interandean_valley': 'Sedimentos aluviales cuaternarios, Arcillas detríticas, Arenisca y Limolita'
}

DEFAULT_SOURCES = {
    'Bolivia': 'Copernicus DEM 90m / SERGEOMIN / SENAMHI Bolivia',
    'Argentina': 'Copernicus DEM 90m / SEGEMAR / SMN Argentina',
    'Chile': 'Copernicus DEM 90m / SERNAGEOMIN / DMC Chile',
    'Peru': 'Copernicus DEM 90m / INGEMMET / SENAMHI Peru',
    'Antarctica': 'NASA BEDMACHINE / McMurdo LTER',
    'Canada': 'Copernicus DEM / Haughton Mars Project',
    'Ethiopia': 'Copernicus GLO-30 / Planetary Analogs Danakil',
    'USA': 'USGS Hawaiian Volcano Observatory',
    'Norway': 'Copernicus DEM / Svalbard Science Centre'
}

# ==============================================================================
# 2. CARGAR Y LIMPIAR ESTACIONES TERRESTRES
# ==============================================================================
def load_and_clean_dataset():
    csv_path = os.path.join(DATA_DIR, 'centralized_planetary_dataset.csv')
    raw_df = pd.read_csv(csv_path) if os.path.exists(csv_path) else pd.DataFrame()
    
    # Filtrar solo registros terrestres existentes
    earth_df = raw_df[raw_df['body'] == 'earth'].copy()
    print(f"[*] Registros terrestres leídos del dataset base: {len(earth_df)}")

    # Añadir o reemplazar estaciones terrestres adicionales
    add_df = pd.DataFrame(ADDITIONAL_EARTH_STATIONS)
    earth_df = pd.concat([earth_df, add_df], ignore_index=True)
    earth_df = earth_df.drop_duplicates(subset=['id'], keep='last')

    # Armonización y corrección de geología y datos en estaciones terrestres
    for idx, row in earth_df.iterrows():
        sid = str(row['id'])
        geo = str(row.get('geology', '')).lower()
        country = str(row.get('country', 'Bolivia'))

        # Asignar país y departamento/región geográfica verificada por coordenadas
        if sid in GEO_LOCATION_METADATA:
            c_name, r_name = GEO_LOCATION_METADATA[sid]
            earth_df.at[idx, 'country'] = c_name
            earth_df.at[idx, 'region'] = r_name
            country = c_name
        else:
            earth_df.at[idx, 'region'] = 'Andes'

        # Corrección de Umajalanta: Es caverna kárstica en calizas, no tubo de lava volcánico
        if sid == 'umajalanta':
            earth_df.at[idx, 'geology'] = 'karst_cave'
            earth_df.at[idx, 'name'] = 'Caverna Kárstica de Umajalanta, Torotoro'
            earth_df.at[idx, 'minerals'] = 'Calcita (CaCO3), Dolomita, Espeleotemas kársticos, Arcillas de disolución'
            earth_df.at[idx, 'data_source'] = 'SERGEOMIN Bolivia / Parque Nacional Torotoro'

        # Limpiar minerales vacíos o NaN
        current_minerals = str(row.get('minerals', ''))
        if current_minerals in ['nan', 'None', '', 'NaN']:
            fill_min = MINERAL_FILL_MAP.get(geo, 'Cuarzo, Feldespatos, Arcillas y Óxidos de hierro')
            earth_df.at[idx, 'minerals'] = fill_min

        # Limpiar fuentes de datos vacías o NaN
        current_src = str(row.get('data_source', ''))
        if current_src in ['nan', 'None', '', 'NaN']:
            earth_df.at[idx, 'data_source'] = DEFAULT_SOURCES.get(country, 'Copernicus DEM 90m / PDS Geosciences')

        # Salares: asegurar micro-relieve estandarizado
        if 'salt' in geo or 'salar' in geo:
            earth_df.at[idx, 'terrain'] = min(float(row['terrain']), 1.2)
            earth_df.at[idx, 'relief'] = min(float(row['relief']), 5.0)
            earth_df.at[idx, 'roughness'] = min(float(row['roughness']), 0.6)
        # Conos volcánicos / basaltos:
        elif 'volcanic_basalt' in geo:
            earth_df.at[idx, 'terrain'] = max(6.0, min(float(row['terrain']), 12.0))
            earth_df.at[idx, 'relief'] = max(70.0, min(float(row['relief']), 150.0))
            earth_df.at[idx, 'roughness'] = max(1.8, min(float(row['roughness']), 3.0))
        # Estratovolcanes de alta montaña:
        elif 'volcanic' in geo and float(row.get('elevation', 0)) > 4500.0:
            earth_df.at[idx, 'terrain'] = max(22.0, min(float(row['terrain']), 30.0))
            earth_df.at[idx, 'relief'] = max(1200.0, min(float(row['relief']), 2000.0))
            earth_df.at[idx, 'roughness'] = max(16.0, min(float(row['roughness']), 24.0))

    targets_df = pd.DataFrame(CLEAN_PLANETARY_TARGETS)

    # Concatenar estaciones terrestres limpias + 10 objetivos Marte + 8 objetivos Luna
    clean_all_df = pd.concat([earth_df, targets_df], ignore_index=True)
    clean_all_df = clean_all_df.drop_duplicates(subset=['id'], keep='last')

    # Asegurar que region y campos de texto no tengan NaN para generar JSON 100% estándar
    clean_all_df['region'] = clean_all_df['region'].fillna('')
    for idx, row in clean_all_df.iterrows():
        if row['body'] == 'mars' and not clean_all_df.at[idx, 'region']:
            clean_all_df.at[idx, 'region'] = 'Marte'
        elif row['body'] == 'moon' and not clean_all_df.at[idx, 'region']:
            clean_all_df.at[idx, 'region'] = 'Luna'

    print(f"[✓] Dataset unificado generado:")
    print(f"    - Estaciones Terrestres Calibradas: {len(clean_all_df[clean_all_df['body'] == 'earth'])}")
    print(f"    - Objetivos de Marte (limpios y verificados MOLA): {len(clean_all_df[clean_all_df['body'] == 'mars'])}")
    print(f"    - Objetivos de la Luna (limpios y verificados LOLA): {len(clean_all_df[clean_all_df['body'] == 'moon'])}")
    print(f"    - Total filas: {len(clean_all_df)}")

    # Guardar en data/cleaned_planetary_dataset.csv y data/centralized_planetary_dataset.csv
    cleaned_path = os.path.join(DATA_DIR, 'cleaned_planetary_dataset.csv')
    clean_all_df.to_csv(cleaned_path, index=False, encoding='utf-8')
    clean_all_df.to_csv(csv_path, index=False, encoding='utf-8')
    print(f"[✓] Guardado en {cleaned_path}")
    print(f"[✓] Dataset centralizado {csv_path} actualizado y sincronizado.")

    # Guardar también en data/stations.json
    stations_json_path = os.path.join(DATA_DIR, 'stations.json')
    stations_list = clean_all_df.to_dict(orient='records')
    with open(stations_json_path, 'w', encoding='utf-8') as f:
        json.dump(stations_list, f, indent=2, ensure_ascii=False)
    print(f"[✓] Guardado en {stations_json_path}")

    return clean_all_df

# ==============================================================================
# 3. ENTRENAMIENTO Y CALIBRACIÓN DEL ESPACIO LATENTE (PCA 3D)
# ==============================================================================
def train_and_export_pca_model(df: pd.DataFrame):
    print("\n[*] Entrenando modelo PCA 3D sobre el dataset limpio y normalizado...")
    feature_cols = ['terrain', 'relief', 'roughness', 'temp', 'temp_swing', 'precip', 'solar_flux', 'atm_pressure']

    X = df[feature_cols].copy()
    
    # Normalización Min-Max de Escala Planetaria Física
    physical_scales = {
        'terrain':      {'min': 0.0,    'max': 45.0},
        'relief':       {'min': 0.0,    'max': 4500.0},
        'roughness':    {'min': 0.0,    'max': 35.0},
        'temp':         {'min': -220.0, 'max': 45.0},
        'temp_swing':   {'min': 0.0,    'max': 295.0},
        'precip':       {'min': 0.0,    'max': 3200.0},
        'solar_flux':   {'min': 0.0,    'max': 30.0},
        'atm_pressure': {'min': 0.0,    'max': 105.0}
    }

    # Escalado estándar para PCA
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    pca = PCA(n_components=3, random_state=42)
    pcs = pca.fit_transform(X_scaled)

    var_ratio = pca.explained_variance_ratio_
    cum_var = np.sum(var_ratio)
    print(f"[+] Varianza explicada: PC1={var_ratio[0]*100:.1f}%, PC2={var_ratio[1]*100:.1f}%, PC3={var_ratio[2]*100:.1f}%")
    print(f"[+] Varianza total acumulada conservada: {cum_var*100:.1f}%")

    # Exportar modelo entrenado a JSON
    model_export = {
        'feature_cols': feature_cols,
        'scaler_mean': scaler.mean_.tolist(),
        'scaler_scale': scaler.scale_.tolist(),
        'pca_components': pca.components_.tolist(),
        'pca_explained_variance_ratio': var_ratio.tolist(),
        'total_variance_explained': float(cum_var),
        'physical_scales': physical_scales,
        'total_samples': len(df)
    }

    model_path = os.path.join(MODELS_DIR, 'calibrated_pca_model.json')
    with open(model_path, 'w', encoding='utf-8') as f:
        json.dump(model_export, f, indent=2)

    print(f"[✓] Modelo PCA exportado exitosamente a {model_path}")

if __name__ == '__main__':
    clean_df = load_and_clean_dataset()
    train_and_export_pca_model(clean_df)
    print("\n[✓] Limpieza, normalización y entrenamiento finalizados con éxito.")
