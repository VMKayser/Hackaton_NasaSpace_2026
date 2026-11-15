import os
import shutil

SRC = r"C:\Users\antra\Desktop\Hacka_nsa_2026\Hacka_Nasa_2026"
DEST = r"C:\Users\antra\Desktop\Hacka_nsa_2026\Hackaton_NasaSpace_2026\modelo"

os.makedirs(DEST, exist_ok=True)

# Ignore patterns for copying
IGNORE_PATTERNS = shutil.ignore_patterns(
    ".git", "__pycache__", "*.pyc", "*.crdownload",
    "*.tif", "*.tiff", "*.tab", "*.TAB", "*.zip", "*.IMG", "*.rar"
)

# 1. Copy root files
root_files = [
    "apply_full_visual_upgrade.py",
    "build_ensayo_full.py",
    "create_ensayo_html.py",
    "demo_mission_control.html",
    "inspect_data.py",
    "package.json",
    "test_clean_inference.py",
    "train_planetary_model.py",
    "update_ensayo_html.py",
    "predict_planetary_analog.py",
    "analogs_ml_pipeline.ipynb",
    "METODO_IA_SIMILITUD_ANALYSIS.md",
    "README.md",
    "ensayo.html",
    "ensayo_marte_luna.html"
]

for rf in root_files:
    sf = os.path.join(SRC, rf)
    df = os.path.join(DEST, rf)
    if os.path.exists(sf):
        shutil.copy2(sf, df)
        print(f"Copied root file: {rf}")

# Copy clean_and_curate_planetary_dataset.py to root of modelo
curate_script = os.path.join(SRC, "scripts", "clean_and_curate_planetary_dataset.py")
if os.path.exists(curate_script):
    shutil.copy2(curate_script, os.path.join(DEST, "clean_and_curate_planetary_dataset.py"))
    print("Copied clean_and_curate_planetary_dataset.py to modelo root")

# 2. Copy directories
dirs_to_copy = [
    "pipeline",
    "ayudas",
    "scripts",
    "data",
    "modelos",
    "output"
]

for d in dirs_to_copy:
    sd = os.path.join(SRC, d)
    dd = os.path.join(DEST, d)
    if os.path.exists(sd):
        if os.path.exists(dd):
            shutil.rmtree(dd, ignore_errors=True)
        shutil.copytree(sd, dd, ignore=IGNORE_PATTERNS)
        print(f"Copied directory: {d}/")

# 3. Copy datos folder (excluding files >= 50MB)
sd_datos = os.path.join(SRC, "datos")
dd_datos = os.path.join(DEST, "datos")
if os.path.exists(sd_datos):
    if os.path.exists(dd_datos):
        shutil.rmtree(dd_datos, ignore_errors=True)
    shutil.copytree(sd_datos, dd_datos, ignore=IGNORE_PATTERNS)
    print("Copied directory: datos/ (all CSVs, tables, and metadata)")

# 4. Create FUENTES_Y_ENLACES_DATOS.md in datos explaining large raw files
sources_doc = """# Fuentes Oficiales de Datos Satelitales Crudos (NASA / ESA)

Los datasets crudos de gran tamaño (>100 MB cada uno) de NASA ADC, LRO Diviner y LOLA se procesaron y destilaron en `data/cleaned_planetary_dataset.csv` y `data/stations.json`. Por restricciones técnicas de tamaño de archivo de GitHub (límite de 100 MB por archivo), los binarios raster crudos originales se descargan directamente desde los repositorios oficiales de la misión:

## 1. Candidato de Aterrizaje Artemis III: de Gerlache Rim 2 (Luna)
- **Topografía y Pendientes (NASA ADC FY23 Matrices 4000x4000):**
  - Matriz de Longitud, Latitud, Pendiente y Cota: [NASA Planetary Data System (PDS) LOLA CDR](https://pds-geosciences.wustl.edu/missions/lro/lola.htm)
- **Temperatura y Ambiente Térmico LRO Diviner:**
  - `PCP_AVG_TBOL_POLS_SUM_LTIM01_240.TAB`: [LRO Diviner RDR Archive](https://pds-geosciences.wustl.edu/lro/lro-l-dlre-4-rdr-v1/lrodlr_1001/)

## 2. Mons Mouton Plateau (Luna - Artemis III & VIPER)
- **GeoTIFFs LOLA Topografía y Pendiente (80 m/px):**
  - `LDSM_80S_80MPP_ADJ.tiff` y `LDEM_80S`: [NASA Goddard LOLA Data Products](https://lunar.gsfc.nasa.gov/)
- **Rugosidad Decamétrica (LDRM):**
  - `LDRM_80S_1000MPP_ADJ_ROUGH_400M.tiff`: [PDS Geosciences LOLA Gridded Data](https://pds-geosciences.wustl.edu/)
- **Recursos Polares Diviner (DLRE PRP):**
  - `DLRE_PRP_SOUTH.TAB`: [LRO Diviner Polar Resource Products](https://pds-geosciences.wustl.edu/missions/lro/diviner.htm)
- **Iluminación Solar Polar (75°S a 85°S):**
  - `AVGVISIB_75S_120M_201608.tiff`

## 3. Malapert Massif (Sitio 23 Artemis III)
- **Modelos LOLA 5m/px y Mapas de Iluminación Quasicontinua:**
  - LOLA Site 23 High Resolution DEM & Slope Error Products: [NASA PDS LOLA Lunar South Pole Atlas](https://www.lpi.usra.edu/lunar/lunar-south-pole-atlas/)

## 4. Marte: Cráter Jezero, Meridiani Planum, Columbia Hills, Deuteronilus Mensae
- **MOLA MEGDR Topografía Global (128 px/deg):** [NASA PDS Geosciences MOLA](https://pds-geosciences.wustl.edu/missions/mgs/megdr.html)
- **HiRISE Jezero Fan DTM (1 m/px):** [University of Arizona HiRISE Jezero](https://www.uahirise.org/dtm/dtm.php?ID=PSP_002387_1985)
- **MRO SHARAD Radares de Permafrost y Glaciares LDA:** [Zenodo DOI:10.5281/zenodo.7753745 / Baker & Carter 2023](https://doi.org/10.5281/zenodo.7753745)
"""

with open(os.path.join(dd_datos, "FUENTES_Y_ENLACES_DATOS.md"), "w", encoding="utf-8") as f:
    f.write(sources_doc)
print("Created FUENTES_Y_ENLACES_DATOS.md")
