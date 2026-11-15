"""
Configuration and constants for NASA Space Apps Planetary Analog Pipeline.
"""
from pathlib import Path

# Directories
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
OUTPUT_DIR = BASE_DIR / "output"

HEIGHTMAPS_DIR = PROCESSED_DATA_DIR / "heightmaps"
SLOPEMAPS_DIR = PROCESSED_DATA_DIR / "slope_maps"
TEXTURES_DIR = PROCESSED_DATA_DIR / "satellite_textures"

# Create directories if they do not exist
for folder in [RAW_DATA_DIR, PROCESSED_DATA_DIR, OUTPUT_DIR, HEIGHTMAPS_DIR, SLOPEMAPS_DIR, TEXTURES_DIR]:
    folder.mkdir(parents=True, exist_ok=True)

# Weight presets for PSI calculation depending on mission focus
WEIGHT_PROFILES = {
    "balanced": {
        "topography": 0.35,
        "mineralogy": 0.35,
        "environment": 0.30
    },
    "rover_mobility": {
        "topography": 0.55,
        "mineralogy": 0.25,
        "environment": 0.20
    },
    "astrobiology_biosignatures": {
        "topography": 0.20,
        "mineralogy": 0.50,
        "environment": 0.30
    },
    "atmospheric_flight": { # E.g., Ingenuity/Dragonfly rotorcraft testing in high-altitude Bolivia
        "topography": 0.30,
        "mineralogy": 0.15,
        "environment": 0.55
    }
}

# Heightmap resolution for Three.js terrain rendering
TERRAIN_GRID_RESOLUTION = 256  # 256x256 grid vertices
TERRAIN_SCALE_M = 5000.0       # 5km x 5km terrain patch

