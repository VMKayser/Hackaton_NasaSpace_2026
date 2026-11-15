import os
import shutil

SRC = r"C:\Users\antra\Desktop\Hacka_nsa_2026\Hacka_Nasa_2026"
DEST = r"C:\Users\antra\Desktop\Hacka_nsa_2026\Hackaton_NasaSpace_2026\modelo"

# 1. Clean up old Hacka_Nasa_2026 subfolder in DEST
nested = os.path.join(DEST, "Hacka_Nasa_2026")
if os.path.exists(nested):
    print("Removing old nested folder:", nested)
    shutil.rmtree(nested, ignore_errors=True)

# 2. Files to copy directly to DEST root
files_to_copy = [
    ("scripts/clean_and_curate_planetary_dataset.py", "clean_and_curate_planetary_dataset.py"),
    ("analogs_ml_pipeline.ipynb", "analogs_ml_pipeline.ipynb"),
    ("predict_planetary_analog.py", "predict_planetary_analog.py"),
    ("README.md", "README.md"),
    ("ensayo.html", "ensayo.html"),
    ("ensayo_marte_luna.html", "ensayo_marte_luna.html"),
    ("METODO_IA_SIMILITUD_ANALYSIS.md", "METODO_IA_SIMILITUD_ANALYSIS.md")
]

for src_rel, dest_rel in files_to_copy:
    src_file = os.path.join(SRC, src_rel)
    dest_file = os.path.join(DEST, dest_rel)
    if os.path.exists(src_file):
        shutil.copy2(src_file, dest_file)
        print(f"Copied: {dest_rel}")
    else:
        print(f"WARNING: Not found {src_file}")

# 3. Copy data folder (excluding large raw files)
dest_data = os.path.join(DEST, "data")
os.makedirs(dest_data, exist_ok=True)
data_files = [
    "stations.json",
    "cleaned_planetary_dataset.csv",
    "centralized_planetary_dataset.csv",
    "analogs.json"
]
for df in data_files:
    sf = os.path.join(SRC, "data", df)
    if os.path.exists(sf):
        shutil.copy2(sf, os.path.join(dest_data, df))
        print(f"Copied data file: {df}")

# 4. Copy models folder
dest_models = os.path.join(DEST, "modelos")
os.makedirs(dest_models, exist_ok=True)
model_files = ["calibrated_pca_model.json"]
for mf in model_files:
    sf = os.path.join(SRC, "modelos", mf)
    if os.path.exists(sf):
        shutil.copy2(sf, os.path.join(dest_models, mf))
        print(f"Copied model file: {mf}")

# 5. Copy scripts folder
dest_scripts = os.path.join(DEST, "scripts")
os.makedirs(dest_scripts, exist_ok=True)
script_files = [
    "clean_and_curate_planetary_dataset.py",
    "build_ensayo_marte_luna.py",
    "generate_official_analogs_json.py"
]
for sf_name in script_files:
    sf = os.path.join(SRC, "scripts", sf_name)
    if os.path.exists(sf):
        shutil.copy2(sf, os.path.join(dest_scripts, sf_name))
        print(f"Copied script file: {sf_name}")

print("\n[✓] modelo/ structure successfully set up and cleaned!")
