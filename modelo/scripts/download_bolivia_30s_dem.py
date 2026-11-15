"""
scripts/download_bolivia_30s_dem.py
===================================
Descarga el DEM global oficial de WorldClim 2.1 (NASA SRTM + Viewfinder Panoramas)
a resolución de 30 segundos de arco (~900 metros por píxel).
Extrae exactamente la ventana territorial de Bolivia:
  Latitud:  -23.5° a -9.0°  (1,740 píxeles de resolución vertical)
  Longitud: -70.0° a -57.0° (1,560 píxeles de resolución horizontal)
Total: 2,714,400 MEDICIONES REALES DE ELEVACIÓN SATELITAL.
Guarda el resultado comprimido en 'data/dem/bolivia_dem_30s.npz' (~3-5 MB)
y borra el ZIP original de 323 MB para no ocupar espacio innecesario.
"""

import os
import sys
import time
import zipfile
import urllib.request
import numpy as np
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEM_DIR = os.path.join(BASE_DIR, 'data', 'dem')
os.makedirs(DEM_DIR, exist_ok=True)

OUT_NPZ = os.path.join(DEM_DIR, 'bolivia_dem_30s.npz')
ZIP_FILE = os.path.join(DEM_DIR, 'wc2.1_30s_elev.zip')
URL = 'https://geodata.ucdavis.edu/climate/worldclim/2_1/base/wc2.1_30s_elev.zip'

if os.path.exists(OUT_NPZ):
    print(f"[✓] El DEM de 30 segundos de arco ({OUT_NPZ}) ya existe.")
    sys.exit(0)

# 1. Descargar ZIP si no existe
if not os.path.exists(ZIP_FILE):
    print(f"[*] Descargando WorldClim 30s DEM (~323 MB) desde {URL}...")
    t0 = time.time()
    req = urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=300) as resp, open(ZIP_FILE, 'wb') as out_f:
        downloaded = 0
        total_size = int(resp.headers.get('content-length', 323 * 1024 * 1024))
        chunk_size = 1024 * 1024
        while True:
            chunk = resp.read(chunk_size)
            if not chunk:
                break
            out_f.write(chunk)
            downloaded += len(chunk)
            pct = (downloaded / total_size) * 100
            el = time.time() - t0
            spd = (downloaded / 1024 / 1024) / max(el, 0.001)
            print(f"\r[{pct:5.1f}%] {downloaded/1024/1024:.1f}/{total_size/1024/1024:.1f} MB ({spd:.2f} MB/s)...", end='', flush=True)
    print(f"\n[✓] Descarga completada en {time.time() - t0:.1f}s.")

# 2. Extraer y recortar Bolivia
print(f"[*] Procesando y extrayendo cuadrícula de Bolivia a 30 segundos (~900m)...")
with zipfile.ZipFile(ZIP_FILE) as z:
    for filename in z.namelist():
        if filename.endswith('.tif'):
            print(f"[*] Abriendo GeoTIFF {filename}...")
            with z.open(filename) as f:
                img = Image.open(f)
                print(f"[+] Raster global abierto: {img.size} ({img.mode})")
                
                # 30 segundos = 120 píxeles por grado
                # Latitud: +90° (fila 0) a -90° (fila 21600)
                # Longitud: -180° (col 0) a +180° (col 43200)
                # Recorte Bolivia: Lat -9.0 a -23.5, Lon -70.0 a -57.0
                row_min = int(round((90.0 - (-9.0)) * 120.0))   # 99.0 * 120 = 11,880
                row_max = int(round((90.0 - (-23.5)) * 120.0))  # 113.5 * 120 = 13,620
                col_min = int(round((-70.0 + 180.0) * 120.0))   # 110.0 * 120 = 13,200
                col_max = int(round((-57.0 + 180.0) * 120.0))   # 123.0 * 120 = 14,760
                
                print(f"[*] Recortando ventana de Bolivia (cols {col_min}-{col_max}, rows {row_min}-{row_max})...")
                crop_img = img.crop((col_min, row_min, col_max, row_max))
                bolivia_crop = np.array(crop_img).astype(np.int16)
                print(f"[+] Recorte de Bolivia: {bolivia_crop.shape} = {bolivia_crop.size:,} mediciones de elevación!")
                
                # Guardar en archivo comprimido npz
                np.savez_compressed(
                    OUT_NPZ,
                    elevation=bolivia_crop,
                    lat_max=-9.0,
                    lat_min=-23.5,
                    lon_min=-70.0,
                    lon_max=-57.0,
                    pixels_per_degree=120.0,
                    rows=bolivia_crop.shape[0],
                    cols=bolivia_crop.shape[1]
                )
                print(f"[✓] Guardado en {OUT_NPZ} ({os.path.getsize(OUT_NPZ)/1024/1024:.2f} MB)")
                break

# 3. Eliminar ZIP grande temporal para liberar espacio
if os.path.exists(ZIP_FILE):
    os.remove(ZIP_FILE)
    print(f"[✓] Archivo temporal {ZIP_FILE} eliminado para ahorrar espacio en disco.")

print("[✓] Proceso DEM 30s completado exitosamente.")
