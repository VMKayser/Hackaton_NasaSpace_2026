"""
Script to build centralized, cleaned, and unified datasets for Planetary Analog ML:
- data/sitios_valores.csv
- data/objetivos_valores.csv
- data/centralized_planetary_dataset.csv (combines catalog, global Earth grid, and Mars/Moon targets)
"""
import sys
import json
from pathlib import Path
import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

DATA_DIR = BASE_DIR / "data"
AYUDAS_DIR = BASE_DIR / "ayudas"
RAW_DIR = DATA_DIR / "raw"

# Load catalog
catalog_path = AYUDAS_DIR / "catalogo-sitios.csv"
catalog_df = pd.read_csv(catalog_path)

# Physical models and measurements for 32 catalog sites
# Features: terrain (slope in deg), relief (local relief in m), roughness (std in m),
# temp (mean surface temp °C), temp_swing (°C), precip (mm/yr), solar_flux (MJ/m2/day),
# atm_pressure (kPa), elevation (m), geology (type)
SITE_MEASUREMENTS = {
    # Core sites
    "uyuni": {
        "terrain": 0.8, "relief": 1.5, "roughness": 0.35, "temp": 8.5,
        "temp_swing": 25.0, "precip": 160.0, "solar_flux": 24.2, "atm_pressure": 65.2,
        "elevation": 3656.0, "geology": "salt_lake"
    },
    "coipasa": {
        "terrain": 1.1, "relief": 2.2, "roughness": 0.45, "temp": 9.0,
        "temp_swing": 24.0, "precip": 180.0, "solar_flux": 24.0, "atm_pressure": 65.0,
        "elevation": 3680.0, "geology": "salt_lake"
    },
    "sol-de-manana": {
        "terrain": 14.5, "relief": 120.0, "roughness": 4.5, "temp": -2.5,
        "temp_swing": 28.0, "precip": 90.0, "solar_flux": 25.5, "atm_pressure": 57.5,
        "elevation": 4850.0, "geology": "hydrothermal"
    },
    "laguna-colorada": {
        "terrain": 4.5, "relief": 45.0, "roughness": 1.8, "temp": 3.0,
        "temp_swing": 26.0, "precip": 110.0, "solar_flux": 25.0, "atm_pressure": 60.5,
        "elevation": 4278.0, "geology": "salt_lake"
    },
    "siloli": {
        "terrain": 8.2, "relief": 65.0, "roughness": 2.8, "temp": 1.5,
        "temp_swing": 27.0, "precip": 75.0, "solar_flux": 25.8, "atm_pressure": 59.0,
        "elevation": 4500.0, "geology": "desert"
    },
    "dali": {
        "terrain": 7.4, "relief": 58.0, "roughness": 2.4, "temp": 0.5,
        "temp_swing": 28.0, "precip": 65.0, "solar_flux": 26.0, "atm_pressure": 57.8,
        "elevation": 4750.0, "geology": "desert"
    },
    "licancabur-laguna-verde": {
        "terrain": 22.0, "relief": 1400.0, "roughness": 15.0, "temp": -4.0,
        "temp_swing": 30.0, "precip": 80.0, "solar_flux": 26.5, "atm_pressure": 51.0,
        "elevation": 5916.0, "geology": "volcanic"
    },
    "uturuncu": {
        "terrain": 24.5, "relief": 1600.0, "roughness": 18.5, "temp": -5.5,
        "temp_swing": 29.0, "precip": 85.0, "solar_flux": 26.4, "atm_pressure": 50.2,
        "elevation": 6008.0, "geology": "volcanic"
    },
    "sajama": {
        "terrain": 28.5, "relief": 2200.0, "roughness": 24.0, "temp": -8.0,
        "temp_swing": 26.0, "precip": 320.0, "solar_flux": 25.2, "atm_pressure": 47.5,
        "elevation": 6542.0, "geology": "volcanic"
    },
    "ollague": {
        "terrain": 21.0, "relief": 1500.0, "roughness": 16.0, "temp": -3.5,
        "temp_swing": 27.0, "precip": 95.0, "solar_flux": 26.1, "atm_pressure": 51.5,
        "elevation": 5868.0, "geology": "volcanic"
    },
    "tunupa": {
        "terrain": 19.5, "relief": 1700.0, "roughness": 14.0, "temp": 2.0,
        "temp_swing": 25.0, "precip": 180.0, "solar_flux": 24.8, "atm_pressure": 55.5,
        "elevation": 5321.0, "geology": "volcanic"
    },
    "poopo": {
        "terrain": 0.6, "relief": 1.2, "roughness": 0.3, "temp": 11.5,
        "temp_swing": 22.0, "precip": 380.0, "solar_flux": 23.5, "atm_pressure": 65.5,
        "elevation": 3686.0, "geology": "salt_lake"
    },
    # Extension sites
    "empexa": {
        "terrain": 0.9, "relief": 1.8, "roughness": 0.4, "temp": 9.5,
        "temp_swing": 24.5, "precip": 150.0, "solar_flux": 24.5, "atm_pressure": 64.8,
        "elevation": 3720.0, "geology": "salt_lake"
    },
    "chiguana": {
        "terrain": 1.4, "relief": 3.0, "roughness": 0.6, "temp": 8.0,
        "temp_swing": 25.0, "precip": 130.0, "solar_flux": 24.9, "atm_pressure": 65.1,
        "elevation": 3680.0, "geology": "salt_lake"
    },
    "chalviri": {
        "terrain": 3.2, "relief": 25.0, "roughness": 1.2, "temp": 2.5,
        "temp_swing": 26.5, "precip": 100.0, "solar_flux": 25.5, "atm_pressure": 60.0,
        "elevation": 4369.0, "geology": "salt_lake"
    },
    "capina": {
        "terrain": 2.8, "relief": 20.0, "roughness": 1.1, "temp": 3.5,
        "temp_swing": 26.0, "precip": 110.0, "solar_flux": 25.2, "atm_pressure": 60.8,
        "elevation": 4200.0, "geology": "salt_lake"
    },
    "pastos-grandes": {
        "terrain": 5.0, "relief": 60.0, "roughness": 2.2, "temp": 1.8,
        "temp_swing": 27.0, "precip": 120.0, "solar_flux": 25.1, "atm_pressure": 59.5,
        "elevation": 4430.0, "geology": "salt_lake"
    },
    "laguna-hedionda": {
        "terrain": 4.2, "relief": 40.0, "roughness": 1.6, "temp": 3.0,
        "temp_swing": 26.0, "precip": 105.0, "solar_flux": 25.3, "atm_pressure": 61.0,
        "elevation": 4120.0, "geology": "salt_lake"
    },
    "polques": {
        "terrain": 12.0, "relief": 90.0, "roughness": 3.8, "temp": 1.0,
        "temp_swing": 27.5, "precip": 95.0, "solar_flux": 25.6, "atm_pressure": 59.8,
        "elevation": 4400.0, "geology": "hydrothermal"
    },
    "geiseres-sajama": {
        "terrain": 11.5, "relief": 85.0, "roughness": 3.5, "temp": 2.0,
        "temp_swing": 25.0, "precip": 290.0, "solar_flux": 24.6, "atm_pressure": 59.2,
        "elevation": 4450.0, "geology": "hydrothermal"
    },
    "tata-sabaya": {
        "terrain": 16.5, "relief": 750.0, "roughness": 12.0, "temp": 4.5,
        "temp_swing": 25.0, "precip": 190.0, "solar_flux": 24.7, "atm_pressure": 58.5,
        "elevation": 4700.0, "geology": "volcanic"
    },
    "los-frailes": {
        "terrain": 15.0, "relief": 450.0, "roughness": 8.5, "temp": 7.0,
        "temp_swing": 23.0, "precip": 350.0, "solar_flux": 23.8, "atm_pressure": 61.5,
        "elevation": 4200.0, "geology": "volcanic"
    },
    "jayu-khota": {
        "terrain": 13.0, "relief": 120.0, "roughness": 5.0, "temp": 9.0,
        "temp_swing": 24.0, "precip": 210.0, "solar_flux": 24.2, "atm_pressure": 64.0,
        "elevation": 3750.0, "geology": "volcanic"
    },
    "valle-de-rocas": {
        "terrain": 10.5, "relief": 85.0, "roughness": 4.8, "temp": 5.0,
        "temp_swing": 26.5, "precip": 120.0, "solar_flux": 25.3, "atm_pressure": 62.0,
        "elevation": 4050.0, "geology": "desert"
    },
    "tupiza": {
        "terrain": 18.0, "relief": 380.0, "roughness": 9.2, "temp": 14.0,
        "temp_swing": 21.0, "precip": 310.0, "solar_flux": 23.5, "atm_pressure": 70.5,
        "elevation": 2950.0, "geology": "erosion"
    },
    "valle-de-la-luna": {
        "terrain": 16.8, "relief": 180.0, "roughness": 6.8, "temp": 12.5,
        "temp_swing": 18.0, "precip": 450.0, "solar_flux": 22.8, "atm_pressure": 66.8,
        "elevation": 3450.0, "geology": "erosion"
    },
    "huayna-potosi": {
        "terrain": 31.0, "relief": 1850.0, "roughness": 22.5, "temp": -6.0,
        "temp_swing": 22.0, "precip": 650.0, "solar_flux": 23.2, "atm_pressure": 49.5,
        "elevation": 6088.0, "geology": "glacial"
    },
    "umajalanta": {
        "terrain": 14.0, "relief": 220.0, "roughness": 7.0, "temp": 16.0,
        "temp_swing": 16.0, "precip": 580.0, "solar_flux": 21.5, "atm_pressure": 73.0,
        "elevation": 2700.0, "geology": "cave"
    },
    # Validation Benchmark Reference
    "yungay-atacama": {
        "terrain": 7.1, "relief": 92.0, "roughness": 3.2, "temp": 17.5,
        "temp_swing": 22.0, "precip": 2.0, "solar_flux": 23.8, "atm_pressure": 91.0,
        "elevation": 950.0, "geology": "desert"
    },
    # Negative Validation Controls
    "trinidad-control": {
        "terrain": 0.4, "relief": 2.0, "roughness": 0.15, "temp": 26.5,
        "temp_swing": 11.0, "precip": 1850.0, "solar_flux": 18.5, "atm_pressure": 99.5,
        "elevation": 155.0, "geology": "humid_lowland"
    },
    "coroico-control": {
        "terrain": 28.0, "relief": 850.0, "roughness": 14.0, "temp": 19.0,
        "temp_swing": 12.0, "precip": 1450.0, "solar_flux": 17.2, "atm_pressure": 82.5,
        "elevation": 1750.0, "geology": "humid_mountain"
    }
}

# Planetary Targets (Mars & Moon)
TARGET_MEASUREMENTS = {
    "jezero": {
        "name": "Jezero (Mars)", "body": "mars", "lat": 18.44, "lon": 77.45,
        "terrain": 9.7, "relief": 80.0, "roughness": 8.5, "temp": -60.0,
        "temp_swing": 90.0, "precip": 0.0, "solar_flux": 9.5, "atm_pressure": 0.61,
        "elevation": -2500.0, "geology": "delta_evaporite",
        "summary": "Paleolake delta with clays, carbonates, and evaporites. Target for Mars 2020 Perseverance."
    },
    "gale": {
        "name": "Gale (Mars)", "body": "mars", "lat": -5.40, "lon": 137.80,
        "terrain": 12.5, "relief": 450.0, "roughness": 11.0, "temp": -55.0,
        "temp_swing": 85.0, "precip": 0.0, "solar_flux": 9.8, "atm_pressure": 0.65,
        "elevation": -4500.0, "geology": "crater_mound",
        "summary": "Impact crater with 5km central sedimentary mound (Aeolis Mons). Curiosity rover."
    },
    "meridiani": {
        "name": "Meridiani Planum (Mars)", "body": "mars", "lat": -2.00, "lon": -5.50,
        "terrain": 2.1, "relief": 15.0, "roughness": 1.2, "temp": -50.0,
        "temp_swing": 80.0, "precip": 0.0, "solar_flux": 10.2, "atm_pressure": 0.68,
        "elevation": -1200.0, "geology": "hematite_plain",
        "summary": "Hyper-flat hematite rich plain with sulfate evaporites. Opportunity rover."
    },
    "shackleton": {
        "name": "Shackleton (Moon)", "body": "moon", "lat": -89.90, "lon": 0.00,
        "terrain": 24.5, "relief": 1200.0, "roughness": 25.0, "temp": -180.0,
        "temp_swing": 280.0, "precip": 0.0, "solar_flux": 4.5, "atm_pressure": 0.0,
        "elevation": -4200.0, "geology": "polar_crater",
        "summary": "Lunar South Pole with permanently shadowed ice traps and sunlit rim peaks. Artemis III base."
    },
    "tranquility": {
        "name": "Tranquility Base (Moon)", "body": "moon", "lat": 0.67, "lon": 23.47,
        "terrain": 3.8, "relief": 25.0, "roughness": 3.5, "temp": -20.0,
        "temp_swing": 290.0, "precip": 0.0, "solar_flux": 15.0, "atm_pressure": 0.0,
        "elevation": -1500.0, "geology": "mare_basalt",
        "summary": "Flat lunar basaltic mare with impact regolith. Apollo 11 historical landing."
    }
}

# Global terrestrial background sample (simulates scanning all places on Earth!)
GLOBAL_EARTH_GRID = [
    {"id": "mcmurdo-antarctica", "name": "McMurdo Dry Valleys (Antarctica)", "lat": -77.5, "lon": 162.5, "terrain": 18.2, "relief": 950.0, "roughness": 12.0, "temp": -19.5, "temp_swing": 35.0, "precip": 15.0, "solar_flux": 11.2, "atm_pressure": 98.0, "elevation": 300.0, "geology": "polar_desert"},
    {"id": "askja-iceland", "name": "Askja Caldera (Iceland)", "lat": 65.03, "lon": -16.75, "terrain": 15.5, "relief": 420.0, "roughness": 7.5, "temp": -1.5, "temp_swing": 18.0, "precip": 450.0, "solar_flux": 9.5, "atm_pressure": 88.0, "elevation": 1100.0, "geology": "volcanic"},
    {"id": "haughton-canada", "name": "Haughton Impact Crater (Devon Island, Canada)", "lat": 75.38, "lon": -89.68, "terrain": 12.8, "relief": 280.0, "roughness": 6.0, "temp": -17.5, "temp_swing": 32.0, "precip": 120.0, "solar_flux": 8.8, "atm_pressure": 98.5, "elevation": 180.0, "geology": "polar_crater"},
    {"id": "rio-tinto-spain", "name": "Río Tinto (Spain)", "lat": 37.69, "lon": -6.56, "terrain": 9.2, "relief": 120.0, "roughness": 3.8, "temp": 17.8, "temp_swing": 15.0, "precip": 620.0, "solar_flux": 19.5, "atm_pressure": 97.0, "elevation": 320.0, "geology": "acid_mine_evaporite"},
    {"id": "sahara-algeria", "name": "Grand Erg Occidental (Sahara, Algeria)", "lat": 30.5, "lon": 0.5, "terrain": 8.0, "relief": 110.0, "roughness": 4.0, "temp": 24.5, "temp_swing": 22.0, "precip": 30.0, "solar_flux": 24.5, "atm_pressure": 96.0, "elevation": 450.0, "geology": "desert"},
    {"id": "amazon-manaus", "name": "Central Amazon Rainforest (Brazil)", "lat": -3.1, "lon": -60.0, "terrain": 1.2, "relief": 25.0, "roughness": 0.8, "temp": 27.2, "temp_swing": 9.0, "precip": 2400.0, "solar_flux": 17.5, "atm_pressure": 100.2, "elevation": 60.0, "geology": "tropical_rainforest"},
    {"id": "siberia-yakutsk", "name": "Central Siberian Taiga (Russia)", "lat": 62.0, "lon": 129.7, "terrain": 3.5, "relief": 80.0, "roughness": 1.5, "temp": -8.8, "temp_swing": 45.0, "precip": 260.0, "solar_flux": 10.5, "atm_pressure": 99.8, "elevation": 120.0, "geology": "permafrost_forest"},
    {"id": "himalaya-everest", "name": "Mount Everest Flanks (Nepal/Tibet)", "lat": 27.98, "lon": 86.92, "terrain": 38.0, "relief": 3500.0, "roughness": 45.0, "temp": -18.0, "temp_swing": 20.0, "precip": 450.0, "solar_flux": 25.0, "atm_pressure": 35.0, "elevation": 7200.0, "geology": "glacial"},
    {"id": "mojave-death-valley", "name": "Death Valley (Mojave, USA)", "lat": 36.5, "lon": -117.0, "terrain": 6.5, "relief": 240.0, "roughness": 3.2, "temp": 25.5, "temp_swing": 25.0, "precip": 55.0, "solar_flux": 23.8, "atm_pressure": 102.0, "elevation": -86.0, "geology": "desert_playa"},
    {"id": "great-plains-kansas", "name": "Great Plains (Kansas, USA)", "lat": 38.5, "lon": -98.5, "terrain": 0.8, "relief": 12.0, "roughness": 0.4, "temp": 13.0, "temp_swing": 16.0, "precip": 720.0, "solar_flux": 18.2, "atm_pressure": 95.5, "elevation": 500.0, "geology": "grassland"}
]

def main():
    print("=" * 70)
    print("  🚀 PLANETARY ANALOG ML DATASET BUILDER & CENTRALIZER")
    print("=" * 70)

    # 1. Build sitios_valores.csv
    sitios_rows = []
    for _, cat_row in catalog_df.iterrows():
        sid = cat_row["id"]
        meas = SITE_MEASUREMENTS.get(sid, {})
        row = {"id": sid}
        row.update(meas)
        sitios_rows.append(row)

    sitios_df = pd.DataFrame(sitios_rows).set_index("id")
    sitios_path = DATA_DIR / "sitios_valores.csv"
    sitios_df.to_csv(sitios_path)
    print(f"✅ Generated {len(sitios_df)} catalog site values at: {sitios_path}")

    # 2. Build objetivos_valores.csv
    target_rows = []
    for tid, tdata in TARGET_MEASUREMENTS.items():
        row = {"id": tid}
        for k in ["terrain", "relief", "roughness", "temp", "temp_swing", "precip", "solar_flux", "atm_pressure", "elevation", "geology"]:
            row[k] = tdata.get(k)
        target_rows.append(row)

    targets_df = pd.DataFrame(target_rows).set_index("id")
    targets_path = DATA_DIR / "objetivos_valores.csv"
    targets_df.to_csv(targets_path)
    print(f"✅ Generated {len(targets_df)} planetary target values at: {targets_path}")

    # 3. Build Centralized Unified Planetary Dataset (Catalog + Global Earth Grid + Mars/Moon Targets)
    all_records = []
    
    # Add Catalog sites
    for _, cat_row in catalog_df.iterrows():
        sid = cat_row["id"]
        meas = SITE_MEASUREMENTS.get(sid, {})
        rec = {
            "id": sid,
            "name": cat_row["name"],
            "category": "catalog_earth",
            "body": "earth",
            "country": "Bolivia" if "Bolivia" in cat_row.get("group", "") or cat_row.get("group") in ["core", "extension"] else ("Chile" if "atacama" in sid else "Bolivia"),
            "lat": float(cat_row["lat"]),
            "lon": float(cat_row["lon"]),
            "known": bool(cat_row["known"]),
            "reference": bool(cat_row["reference"]),
            "control": bool(cat_row["control"]),
            "radius_km": float(cat_row["radius_km"]),
            **meas
        }
        all_records.append(rec)

    # Add Global Earth background grid (for global scanning)
    for g_item in GLOBAL_EARTH_GRID:
        rec = {
            "id": g_item["id"],
            "name": g_item["name"],
            "category": "global_earth_grid",
            "body": "earth",
            "country": "Global",
            "lat": g_item["lat"],
            "lon": g_item["lon"],
            "known": False,
            "reference": False,
            "control": False,
            "radius_km": 5.0,
            **{k: v for k, v in g_item.items() if k not in ["id", "name", "lat", "lon"]}
        }
        all_records.append(rec)

    # Add Extraterrestrial Targets
    for tid, tdata in TARGET_MEASUREMENTS.items():
        rec = {
            "id": tid,
            "name": tdata["name"],
            "category": "planetary_target",
            "body": tdata["body"],
            "country": tdata["body"].capitalize(),
            "lat": tdata["lat"],
            "lon": tdata["lon"],
            "known": True,
            "reference": True,
            "control": False,
            "radius_km": 10.0,
            **{k: v for k, v in tdata.items() if k not in ["id", "name", "body", "lat", "lon", "summary"]}
        }
        all_records.append(rec)

    central_df = pd.DataFrame(all_records)
    central_path = DATA_DIR / "centralized_planetary_dataset.csv"
    central_df.to_csv(central_path, index=False)
    print(f"✅ Generated Master Centralized Dataset ({len(central_df)} total sites) at: {central_path}")

if __name__ == "__main__":
    main()
