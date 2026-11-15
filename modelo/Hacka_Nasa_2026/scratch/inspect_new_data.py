import pandas as pd
import numpy as np

print("=== DEUTERONILUS MENSAE ===")
df_m = pd.read_csv(r'datos\Deuteronilus_Mensae_CSV_y_fuentes\Deuteronilus_Multivariable\Deuteronilus_modelo.csv')
print('Lat media:', round(df_m['latitude_deg'].mean(), 2))
print('Lon media:', round(df_m['longitude_east_deg'].mean(), 2))
print('Elevacion media (m):', round(df_m['elevation_m'].mean(), 1), 'min:', round(df_m['elevation_m'].min(), 1), 'max:', round(df_m['elevation_m'].max(), 1))
print('Relieve medio local (max-min en celdas):', round(df_m['elevation_m'].max() - df_m['elevation_m'].min(), 1))
print('Pendiente media (°):', round(df_m['slope_deg'].mean(), 2), '5x5 media:', round(df_m['slope_mean_5x5_deg'].mean(), 2))
print('Rugosidad RMS media (m):', round(df_m['detrended_roughness_rms_5x5_m'].mean(), 2))
print('Temp media (°C):', round(df_m['surface_temperature_C_mean_sampled'].mean(), 1))
print('Oscilacion termica (°C):', round((df_m['surface_temperature_C_max_sampled'] - df_m['surface_temperature_C_min_sampled']).mean(), 1))
print('Presion media (Pa):', round(df_m['surface_pressure_Pa_mean_sampled'].mean(), 1), '-> kPa:', round(df_m['surface_pressure_Pa_mean_sampled'].mean() / 1000.0, 3))

min_cols = [c for c in df_m.columns if c.startswith('mineral_') and 'fraction' in c]
print('\nMinerales TES promedios:')
for c in min_cols:
    val = df_m[c].mean()
    if val > 0.01:
        name = c.replace('mineral_', '').replace('_source_fraction', '')
        print(f'  {name}: {round(val*100, 1)}%')

print("\n=== UTOPIA PLANITIA (VIKING 2) ===")
df_terr = pd.read_csv(r'datos\Utopia_Viking2_datasets\Utopia_Viking2\resumen_terreno_MOLA.csv')
print('Elevacion:', df_terr['elevation_mean_m'].values[0])
print('Pendiente regional media (°):', round(df_terr['regional_slope_mean_deg'].values[0], 2))
print('Relieve residual RMS (m):', round(df_terr['detrended_relief_rms_5km_m'].values[0], 2))

df_press = pd.read_csv(r'datos\Utopia_Viking2_datasets\Utopia_Viking2\presion_diaria_VL2_SI.csv')
p_mean_pa = df_press['pressure_mean_Pa'].dropna().mean()
print('Presion media:', round(p_mean_pa, 1), 'Pa ->', round(p_mean_pa / 1000.0, 3), 'kPa')

df_sol = pd.read_csv(r'datos\Utopia_Viking2_datasets\Utopia_Viking2\resumen_por_sol_VL2.csv')
t_mean = df_sol['air_temperature_C_mean'].dropna().mean()
t_swing = (df_sol['air_temperature_C_max'] - df_sol['air_temperature_C_min']).dropna().mean()
print('Temp media (°C):', round(t_mean, 1))
print('Oscilacion media (°C):', round(t_swing, 1))
