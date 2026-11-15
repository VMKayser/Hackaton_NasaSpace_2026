# 🚀 NASA Space Apps Challenge 2026: Beyond Known Analogues
## Planetary Similarity Index (PSI) & 3D Terrain Data Processing Pipeline

Este repositorio implementa el **pipeline de procesamiento de datos científicos planetarios y síntesis de terrenos 3D** para el NASA Space Apps Challenge. 

El sistema evalúa y compara análogos terrestres (con especial enfoque en las **joyas ocultas del Altiplano boliviano** frente a análogos clásicos internacionales) contra sitios de aterrizaje y exploración de misiones de la NASA:
* 🔴 **Marte (10 Misiones y Cuencas)**: **Elysium Planitia** (InSight), **Meridiani Planum** (Opportunity), **Cráter Jezero** (Perseverance), **Cráter Gale** (Curiosity), **Cráter Gusev** (Spirit), **Mawrth Vallis** (ExoMars/CRISM), **Valles Marineris** (Gran Cañón), **Arcadia Planitia** (Hielo somero / Base Mars Alpha), **Utopia Planitia** (Viking Lander 2 telemetría in-situ) y **Deuteronilus Mensae** (Glaciares masivos subsuperficiales SHARAD / Baker & Carter 2023).
* ⚪ **Luna (8 Misiones y Candidatos Artemis)**: **Rima Hadley** (Apollo 15), **Base Tranquilidad** (Apollo 11), **Cráter Shackleton** (Polo Sur / Artemis PSR), **Colinas de Marius** (Tubo de lava SELENE), **Valle Taurus-Littrow** (Apollo 17), **de Gerlache Rim 2** (Artemis III NASA ADC FY23), **Mons Mouton Plateau** (Artemis III & VIPER / LOLA & Diviner) y **Malapert Massif** (Artemis III Candidato Oficial Sitio 23 / LOLA 5m/px PGDA 78).

---

## 🏗️ Arquitectura del Pipeline

```
[Datasets NASA/USGS/LRO/MRO]
       │
       ▼
[pipeline/fetcher.py] ────────► NASA POWER API (Temperatura, Radiación Solar, Aridez)
       │
       ▼
[pipeline/psi_engine.py] ─────► Cálculo Matemático del Índice de Similitud Planetaria (PSI)
       │                        ├── Topografía y Rugosidad (S_topo)
       │                        ├── Mineralogía y Litología (S_mineral)
       │                        └── Clima y Radiación UV (S_env)
       │
       ▼
[pipeline/terrain_generator.py]► Generador de Activos 3D para Three.js:
       │                        ├── Heightmaps DEM 256x256 (displacementMap)
       │                        ├── Mapas de Peligro de Pendiente (Verde <15°, Amarillo 15-25°, Rojo >25°)
       │                        └── Texturas Satelitales / Mineralógicas Sintetizadas
       │
       ▼
[pipeline/mission_recommender.py]► Ficha de Brechas (Gap Analysis) y Recomendación de Hardware
       │
       ▼
[output/analogs_dataset.json] ──► MASTER JSON listo para Frontend React (Globe.gl + Three.js)
[output/scientific_validation_report.md] ──► Reporte de Validación Científica
```

---

## 🧮 Fórmula del Planetary Similarity Index (PSI)

El motor calcula un índice multidimensional normalizado entre 0% y 100%:

$$\text{PSI} = w_{\text{topo}} \cdot S_{\text{topo}} + w_{\text{mineral}} \cdot S_{\text{mineral}} + w_{\text{env}} \\cdot S_{\text{env}}$$

### Perfiles de Peso Disponibles (`--profile`):
1. **`balanced`** (default): $w_{\text{topo}} = 0.35, w_{\text{mineral}} = 0.35, w_{\text{env}} = 0.30$
2. **`rover_mobility`**: $w_{\text{topo}} = 0.55, w_{\text{mineral}} = 0.25, w_{\text{env}} = 0.20$ (Foco en pendientes, tracción y rugosidad $\sigma_z$).
3. **`astrobiology_biosignatures`**: $w_{\text{topo}} = 0.20, w_{\text{mineral}} = 0.50, w_{\text{env}} = 0.30$ (Foco en evaporitas, sulfatos, arcillas y extremófilos UV).
4. **`atmospheric_flight`**: $w_{\text{topo}} = 0.30, w_{\text{mineral}} = 0.15, w_{\text{env}} = 0.55$ (Foco en altitud extrema y baja densidad atmosférica para helicópteros marcianos estilo *Ingenuity*).

---

## 🇧🇴 Joyas Ocultas de Bolivia Incluidas en el Dataset

1. **Salar de Uyuni (Potosí)**: 
   - *3,656 msnm*. El mayor salar continuo del mundo.
   - **Análogo**: Cráter Jezero (fase evaporítica tardía) y calibración de altímetros satelitales (ICESat/MOLA).
   - **PSI Jezero**: `74.0%` (Topografía hiperplana, halita/yeso, radiación UV extrema).
2. **Laguna Colorada (Reserva Eduardo Abaroa, Lípez)**:
   - *4,278 msnm*. Salmueras boratadas hipersalinas y extremófilos bajo radiación UV letal.
   - **Análogo**: Paleolagos salinos marcianos y preservación de biofirmas moleculares.
   - **PSI Jezero**: `82.2%` (Tier 1/2 en astrobiología).
3. **Sol de Mañana (Lípez)**:
   - *4,850 msnm*. Fumarolas de azufre, calderas de lodo hirviente y alteración hidrotermal ácida.
   - **Análogo**: Sistemas hidrotermales del Marte primitivo y vulcanismo activo.
   - **PSI Jezero**: `91.4%` (**#1 Global Rank para Jezero Crater**).
4. **Nevado Sajama y Domos Volcánicos (Oruro)**:
   - *6,542 msnm*. Presión atmosférica reducida a `~46 kPa` (45-55% del nivel del mar), permafrost criogénico y pendientes basálticas/andesíticas $>25^\circ$.
   - **Análogo**: Cráter Shackleton (Luna) y banco de pruebas aerodinámico para helicópteros marcianos.
   - **PSI Shackleton (Luna)**: `77.5%` (**#1 Global Rank para el Polo Sur Lunar**).
5. **Valle de la Luna / Valle de las Ánimas (La Paz)**:
   - *3,400 msnm*. Laberinto de pináculos y cárcavas de arcilla/arenisca.
   - **Análogo**: Campos de yardangs, depósitos de filosilicatos y navegación SLAM / LiDAR autónoma en cañones sin GPS.

---

## 💻 Cómo Ejecutar e Inspeccionar los Datos

### Requisitos
Python 3.10+ con librerías estándar científicas:
```bash
pip install numpy scipy scikit-learn requests pillow matplotlib
```

### 1. Auditoría Interactiva y Verificación de Fuentes (Recomendado)
Ejecuta el inspector interactivo en terminal para consultar rankings, datos físicos y enlaces científicos oficiales:
```bash
# Menú interactivo en terminal
python inspect_data.py

# Ver rankings de misiones (Jezero, Gale, Shackleton)
python inspect_data.py --rankings

# Ver ficha técnica y fuentes de un sitio específico
python inspect_data.py --site uyuni
python inspect_data.py --site sajama

# Ver todas las fuentes científicas oficiales (NASA PDS, DOIs, Nature, Science)
python inspect_data.py --sources

# Generar y abrir el Dossier Web HTML Interactivo en el navegador
python inspect_data.py --html
```

### 2. Ejecución Completa del Pipeline de Datos y Terrenos 3D
Genera todos los heightmaps 3D, mapas de pendientes, texturas satelitales, calcula el PSI y exporta el JSON:
```bash
python pipeline/run_pipeline.py
```

### Opciones de Ejecución
```bash
# Cambiar perfil de pesos (ej. enfocado en movilidad de rovers)
python pipeline/run_pipeline.py --profile rover_mobility

# Perfil para astrobiología y detección de vida
python pipeline/run_pipeline.py --profile astrobiology_biosignatures

# Omitir regeneración de imágenes 3D para ejecución ultrarrápida
python pipeline/run_pipeline.py --skip-terrain
```

---

## 📦 Estructura de Salida (`output/` y `data/processed/`)

* **`output/analogs_dataset.json`**: Dataset maestro unificado consumible directamente por React:
  * Coordenadas geográficas (`lat`, `lng`, `elevation_m`).
  * Parámetros físicos reales (pendiente media, rugosidad, aridez, minerales).
  * Scores PSI desglosados para Jezero, Gale y Shackleton.
  * Ficha de Brechas (Gap Analysis) y Recomendación de Hardware.
  * Rutas a los assets 3D (`heightmap`, `slopemap`, `texture`).
* **`output/scientific_validation_report.md`**: Reporte científico detallado con tablas comparativas de ranking y fórmulas.
* **`data/processed/heightmaps/`**: Archivos PNG en escala de grises de 256x256 píxeles listos para `displacementMap` de Three.js.
* **`data/processed/slope_maps/`**: Texturas de pendiente analítica (Verde: seguro $<15^\circ$, Amarillo: precaución $15^\circ-25^\circ$, Rojo: peligro $>25^\circ$).
* **`data/processed/satellite_textures/`**: Texturas visuales/mineralógicas RGB correspondientes a cada análogo.

---

## 🔬 Calibración de Datos, Modelo PCA 3D y Ensayo Científico Web

### 1. Dataset Científico Unificado y Curado (`data/cleaned_planetary_dataset.csv`):
* **73 estaciones y análogos calibrados**: 55 estaciones terrestres representativas (Bolivia, Argentina, Chile, Antártida, Canadá, etc.) + 10 destinos de Marte + 8 destinos de la Luna.
* **Modelo Digital de Elevación Satelital (Copernicus DEM 90m & NASA SRTM 30s)**: Más de 2.7 millones de puntos topográficos para garantizar una precisión milimétrica sin interpolaciones erróneas.
* **Espacio Latente PCA 3D**: Reducción de dimensionalidad sobre 8 parámetros biofísicos (`terrain`, `relief`, `roughness`, `temp`, `temp_swing`, `precip`, `solar_flux`, `atm_pressure`) preservando el **84.7% de la varianza total acumulada**.

### 2. Aplicación Web Interactiva (`ensayo.html`):
* Interfaz con auditoría en tiempo real del Planetary Similarity Index (PSI).
* Tabla comparativa lado a lado con 16 parámetros geofísicos y enlaces oficiales a repositorios de la NASA (PDS, MOLA, LOLA, Diviner, SHARAD, Viking 2).
* Desglose matemático con tooltips interactivos on-hover explicando las normalizaciones geodésicas y planetarias.

