import math
import re
import numpy as np
import pandas as pd
from pathlib import Path

BASE_DIR = Path('.')
dataset_df = pd.read_csv('data/centralized_planetary_dataset.csv')

def clean_idw_inference(lat, lon, area_km2=25.0, user_geology=None):
    coords = dataset_df[['lat', 'lon']].values
    dists = np.sqrt((coords[:, 0] - lat)**2 + (coords[:, 1] - lon)**2)
    min_idx = np.argmin(dists)
    nearest_row = dataset_df.iloc[min_idx]
    dist_min = dists[min_idx]

    # Pesos IDW p=2
    weights = 1.0 / (np.maximum(dists, 0.02) ** 2)
    w_sum = np.sum(weights)

    # 1. Elevación continua interpolada
    if dist_min < 0.05:
        elev = float(nearest_row['elevation'])
    else:
        elev = float(np.sum(weights * dataset_df['elevation'].values) / w_sum)
    elev = round(elev, 1)

    # 2. Presión atmosférica continua (Ecuación barométrica internacional)
    h_clamped = max(0.0, min(elev, 11000.0))
    pressure_kpa = round(101.325 * math.pow(1.0 - (0.0065 * h_clamped) / 288.15, 5.25588), 2)

    # 3. Topografía continua interpolada
    area_factor = max(0.8, min(1.8, math.pow(area_km2 / 25.0, 0.15)))
    terrain = round(float(np.sum(weights * dataset_df['terrain'].values) / w_sum), 1)
    base_relief = float(np.sum(weights * dataset_df['relief'].values) / w_sum)
    relief = round(base_relief * area_factor, 1)
    roughness = round(float(np.sum(weights * dataset_df['roughness'].values) / w_sum), 2)

    # 4. Clima y Radiación continuos con gradiente térmico adiabático
    ref_elev = float(np.sum(weights * dataset_df['elevation'].values) / w_sum)
    t_interp = float(np.sum(weights * dataset_df['temp'].values) / w_sum)
    temp_adjusted = round(t_interp - (0.0065 * (elev - ref_elev)), 1)
    temp_swing = round(float(np.sum(weights * dataset_df['temp_swing'].values) / w_sum), 1)
    precip = round(max(0.0, float(np.sum(weights * dataset_df['precip'].values) / w_sum)), 1)
    solar_flux = round(float(np.sum(weights * dataset_df['solar_flux'].values) / w_sum), 1)
    uv_index = round(min(22.0, (solar_flux / 1.1) * (1.0 + (elev / 4000.0) * 0.35)), 1)

    # 5. Geología autónoma (Reglas geofísicas generales sobre variables continuas)
    station_name = nearest_row.get('name', 'Estación Referencial')
    geo_raw = str(nearest_row.get('geology', '')).lower()

    if user_geology and str(user_geology).strip():
        u_str = str(user_geology).lower()
        if re.search(r'\b(?:basalt|basalto|basaltos|basaltico|basaltica|escoria|lava|malpais|cono)\b', u_str):
            geology = 'volcanic_basalt'
            geology_label = f"Campo Volcánico Monogenético & Conos de Escoria / Basalto Negro ({user_geology})"
        elif re.search(r'\b(?:volcan|estratovolcan|andesita|domo)\b', u_str):
            geology = 'volcanic_peak'
            geology_label = f"Estratovolcán & Complejo Volcánico ({user_geology})"
        elif re.search(r'\b(?:sal|salar|salino|salina|evaporita|halita|salmuera)\b', u_str):
            geology = 'salt_lake'
            geology_label = f"Salar Evaporítico & Cuenca Salina ({user_geology})"
        elif re.search(r'\b(?:hidrotermal|geiser|fumarola|sinter)\b', u_str):
            geology = 'hydrothermal'
            geology_label = f"Campo Geotérmico & Fumarolas ({user_geology})"
        elif re.search(r'\b(?:desierto|eolica|duna|ignimbrita|arena)\b', u_str):
            geology = 'eolian_desert'
            geology_label = f"Desierto Eólico Altiplánico & Arenas Basálticas ({user_geology})"
        else:
            geology = 'mixed_terrain'
            geology_label = f"Terreno Geológico ({user_geology})"
    else:
        # Deducción puramente física a partir de campos interpolados
        if (terrain < 1.8 and relief < 25.0 and precip < 220.0 and elev > 2500.0) or 'salt' in geo_raw:
            geology = 'salt_lake'
            geology_label = f"Salar Evaporítico & Cuenca Salina (asociado a {station_name})"
        elif terrain > 18.0 and elev > 4500.0:
            geology = 'volcanic_peak'
            geology_label = f"Estratovolcán & Complejo Volcánico Andino (asociado a {station_name})"
        elif 'volcanic_basalt' in geo_raw or (terrain >= 5.0 and roughness >= 1.5 and elev > 2500.0):
            geology = 'volcanic_basalt'
            geology_label = f"Campo Volcánico & Terreno Basáltico / Escoria (asociado a {station_name})"
        elif 'hydrothermal' in geo_raw:
            geology = 'hydrothermal'
            geology_label = f"Campo Geotérmico & Fumarolas (asociado a {station_name})"
        elif elev < 600.0 and precip > 1000.0:
            geology = 'lowland_plain'
            geology_label = f"Llanura / Tierras Bajas Húmedas (asociado a {station_name})"
        else:
            geology = geo_raw if geo_raw else 'eolian_desert'
            geology_label = f"Terreno Geológico Regional (asociado a {station_name})"

    return {
        'lat': lat, 'lon': lon, 'area_km2': area_km2,
        'elevation': elev, 'atm_pressure': pressure_kpa,
        'terrain': terrain, 'relief': relief, 'roughness': roughness,
        'temp': temp_adjusted, 'temp_swing': temp_swing, 'precip': precip,
        'solar_flux': solar_flux, 'uv_index': uv_index,
        'geology': geology, 'geology_label': geology_label,
        'nearest_station': station_name, 'dist_deg': round(dist_min, 3)
    }

print("=== TESTING CLEAN CONTINUOUS IDW INFERENCE (NO HARDCODED BOXES) ===")
test_coords = [
    (-26.62, -67.50, 80.0, "Antofagasta / Alumbrera"),
    (-20.13, -67.49, 50.0, "Salar de Uyuni"),
    (-18.11, -68.88, 20.0, "Nevado Sajama"),
    (-21.80, -67.90, 40.0, "Sud Lípez / Laguna Pastos Grandes"),
    (-30.01, -67.95, 100.0, "Ischigualasto / Triásico")
]

for lat, lon, area, name in test_coords:
    res = clean_idw_inference(lat, lon, area)
    print(f"\n[*] {name} ({lat}, {lon}) [Área: {area} km²]:")
    print(f"    Geología: {res['geology_label']}")
    print(f"    Elevación: {res['elevation']} msnm | Presión: {res['atm_pressure']} kPa")
    print(f"    Topografía: Pendiente {res['terrain']}° | Relieve {res['relief']} m | Rugosidad {res['roughness']}")
    print(f"    Clima: Temp {res['temp']}°C | Swing {res['temp_swing']}°C | Lluvia {res['precip']} mm | UV {res['uv_index']}")
    print(f"    Estación más cercana: {res['nearest_station']} (Dist: {res['dist_deg']}°)")
