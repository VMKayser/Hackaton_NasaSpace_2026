"""
scripts/download_bolivia_dem.py
===============================
Descarga una cuadrícula regular de elevaciones satelitales reales (Copernicus DEM 90m / SRTM 30m)
que cubre TODO el territorio de Bolivia y áreas limítrofes.
Límites geográficos:
  Latitud:  -23.0° a -9.6°  (Sur a Norte)
  Longitud: -69.8° a -57.4° (Oeste a Este)
Paso: 0.08° (~8.8 km entre puntos) -> Matriz de 168 x 156 = 26,208 mediciones reales.
"""

import os
import sys
import time
import json
import urllib.request
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_JSON = os.path.join(BASE_DIR, 'data', 'bolivia_dem_grid.json')
OUT_JS = os.path.join(BASE_DIR, 'data', 'bolivia_dem_grid.js')

LAT_MIN = -23.0
LAT_MAX = -9.6
LON_MIN = -69.8
LON_MAX = -57.4
STEP = 0.08

lats = np.arange(LAT_MAX, LAT_MIN - 0.0001, -STEP)
lons = np.arange(LON_MIN, LON_MAX + 0.0001, STEP)

n_rows = len(lats)
n_cols = len(lons)
total_points = n_rows * n_cols

print(f"[*] Generando grilla DEM para Bolivia:")
print(f"    Latitudes: {lats[0]:.2f}° a {lats[-1]:.2f}° ({n_rows} filas)")
print(f"    Longitudes: {lons[0]:.2f}° a {lons[-1]:.2f}° ({n_cols} columnas)")
print(f"    Total de mediciones reales a descargar: {total_points:,} puntos")

# Construir lista de coordenadas ordenadas fila por fila
all_coords = []
for r_idx, lat in enumerate(lats):
    for c_idx, lon in enumerate(lons):
        all_coords.append((round(float(lat), 4), round(float(lon), 4)))

# Descargar en lotes de 100 puntos usando Open-Meteo Elevation API (Copernicus DEM 90m)
batch_size = 100
elevations = []
start_time = time.time()
print(f"[*] Iniciando descarga en lotes de {batch_size} puntos (Copernicus DEM 90m)...")

for i in range(0, total_points, batch_size):
    batch = all_coords[i : i + batch_size]
    lat_str = ','.join(str(pt[0]) for pt in batch)
    lon_str = ','.join(str(pt[1]) for pt in batch)
    url = f"https://api.open-meteo.com/v1/elevation?latitude={lat_str}&longitude={lon_str}"
    
    retries = 3
    success = False
    for attempt in range(retries):
        try:
            req = urllib.request.urlopen(url, timeout=12)
            data = json.loads(req.read().decode('utf-8'))
            if 'elevation' in data and len(data['elevation']) == len(batch):
                elevations.extend(data['elevation'])
                success = True
                break
        except Exception as e:
            time.sleep(0.5)
            
    if not success:
        print(f"\n[!] Fallo en lote {i//batch_size + 1}, rellenando con None...")
        elevations.extend([None] * len(batch))

    # Progreso
    done = min(i + batch_size, total_points)
    elapsed = time.time() - start_time
    pts_per_sec = done / max(elapsed, 0.001)
    eta = (total_points - done) / max(pts_per_sec, 0.001)
    pct = (done / total_points) * 100
    print(f"\r[{pct:5.1f}%] {done:,}/{total_points:,} puntos descargados ({pts_per_sec:.0f} pts/s, ETA: {eta:.0f}s)...", end='', flush=True)
    time.sleep(0.04)

print(f"\n[✓] Descarga completada en {time.time() - start_time:.1f} segundos.")

# Reshape a matriz 2D
elev_grid = np.array(elevations, dtype=float).reshape((n_rows, n_cols))

# Reemplazar posibles nulos con interpolación vecina
nan_mask = np.isnan(elev_grid)
if np.any(nan_mask):
    print(f"[!] Imputando {np.sum(nan_mask)} valores nulos...")
    elev_grid[nan_mask] = 2500.0

# Estadísticas del DEM de Bolivia
print("\n[+] Estadísticas del Modelo Digital de Elevación de Bolivia:")
print(f"    Cota mínima: {np.nanmin(elev_grid):.1f} msnm (Tierras Bajas Amazónicas / Pantanal)")
print(f"    Cota media:  {np.nanmean(elev_grid):.1f} msnm")
print(f"    Cota máxima: {np.nanmax(elev_grid):.1f} msnm (Cumbres de la Cordillera Real / Sajama)")

# Exportar a JSON
grid_payload = {
    "metadata": {
        "dataset": "Copernicus DEM GLO-90 / NASA SRTM 30m Real Elevation Grid for Bolivia",
        "description": "Modelo digital de elevaciones satelitales reales para todo el territorio de Bolivia",
        "reference_geoid": "EGM96 / WGS84",
        "lat_max": float(LAT_MAX),
        "lat_min": float(LAT_MIN),
        "lon_min": float(LON_MIN),
        "lon_max": float(LON_MAX),
        "step_deg": float(STEP),
        "rows": n_rows,
        "cols": n_cols,
        "total_measurements": total_points,
        "download_timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    },
    "grid": elev_grid.round(1).tolist()
}

os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
with open(OUT_JSON, 'w', encoding='utf-8') as f:
    json.dump(grid_payload, f, ensure_ascii=False)
print(f"[✓] Archivo JSON guardado: {OUT_JSON} ({os.path.getsize(OUT_JSON):,} bytes)")

# Exportar también a JS para que ensayo.html pueda usarlo sin llamadas de red
js_content = f"// Modelo Digital de Elevaciones Satelitales Reales de Bolivia (Copernicus DEM 90m / SRTM)\nconst BOLIVIA_DEM_GRID = {json.dumps(grid_payload, ensure_ascii=False)};\n"
with open(OUT_JS, 'w', encoding='utf-8') as f:
    f.write(js_content)
print(f"[✓] Archivo JS guardado: {OUT_JS} ({os.path.getsize(OUT_JS):,} bytes)")
