"""
Terrain Heightmap and Analytical Texture Generator for Three.js 3D Terrains.
Generates:
1. 256x256 Grayscale Heightmap (displacementMap)
2. Analytical Slope Risk Texture (Green <15° safe, Yellow 15-25° caution, Red >25° rollover hazard)
3. High-fidelity Satellite / False-Color Mineral Texture (map)
"""
import numpy as np
from PIL import Image, ImageFilter
from pathlib import Path
from typing import Dict, Tuple
from pipeline.config import HEIGHTMAPS_DIR, SLOPEMAPS_DIR, TEXTURES_DIR, TERRAIN_GRID_RESOLUTION

class TerrainGenerator:
    """
    Generates realistic 3D displacement maps and analytical texture overlays 
    based on each analog's quantitative geomorphological and mineralogical parameters.
    """

    def __init__(self, resolution: int = TERRAIN_GRID_RESOLUTION):
        self.res = resolution

    def _generate_fractal_noise(self, octaves: int = 5, persistence: float = 0.5) -> np.ndarray:
        """Generates 2D fractal Perlin-like noise using multi-frequency interpolation."""
        noise = np.zeros((self.res, self.res))
        freq = 1
        amplitude = 1.0
        total_amp = 0.0

        for _ in range(octaves):
            grid_size = min(freq * 4, self.res)
            raw = np.random.RandomState(42 + freq).rand(grid_size, grid_size)
            # Resize using PIL for smooth bicubic upsampling
            img = Image.fromarray(raw).resize((self.res, self.res), resample=Image.Resampling.BICUBIC)
            noise += np.array(img) * amplitude
            total_amp += amplitude
            amplitude *= persistence
            freq *= 2

        return noise / total_amp

    def generate_elevation_matrix(self, analog_id: str, relief_m: float, roughness: float) -> np.ndarray:
        """
        Synthesizes a realistic digital elevation model (DEM) matrix matching the specific 
        geomorphology of each site.
        """
        x = np.linspace(-1, 1, self.res)
        y = np.linspace(-1, 1, self.res)
        xx, yy = np.meshgrid(x, y)
        r = np.sqrt(xx**2 + yy**2)
        base_noise = self._generate_fractal_noise(octaves=6, persistence=0.52)

        if analog_id == "salar_de_uyuni":
            # Hyper-flat with delicate polygonal ridges (~0.5 - 1.5m relief)
            polygon_grid = np.sin(xx * 30.0) * np.sin(yy * 30.0)
            elevation = (base_noise * 0.2 + polygon_grid * 0.15) * 1.5
            elevation += np.linspace(0, 0.4, self.res)[:, None] # slight regional 0.4m tilt

        elif analog_id == "laguna_colorada":
            # Shallow volcanic depression surrounded by rim hills
            bowl = (1.0 - np.exp(-1.8 * (r**2))) * 80.0
            elevation = bowl + (base_noise - 0.5) * roughness * 0.4

        elif analog_id == "sol_de_manana":
            # Hydrothermal crater with boiling mud depressions and steaming mounds
            mounds = np.sin(xx * 8) * np.cos(yy * 8) * 45.0
            elevation = 100.0 + mounds + (base_noise - 0.5) * relief_m * 0.35

        elif analog_id == "nevado_sajama":
            # Conical stratovolcano with steep flank slopes (>25°) and radial gullies
            cone = np.maximum(0.0, 1.0 - r * 0.95) ** 1.6 * relief_m
            radial_ridges = np.sin(np.arctan2(yy, xx) * 12.0) * 80.0 * (1.0 - r)
            elevation = cone + radial_ridges + (base_noise - 0.5) * roughness * 2.5

        elif analog_id == "valle_de_la_luna_bolivia":
            # Badlands labyrinth: high-frequency pinnacles and deep narrow gullies
            pinnacles = (np.abs(np.sin(xx * 24.0) * np.cos(yy * 24.0)) ** 0.5) * 60.0
            elevation = pinnacles + base_noise * relief_m * 0.5

        elif "crater" in analog_id:
            # Impact crater: circular depression, elevated rim, and central uplift
            crater_rim = np.exp(-((r - 0.6) ** 2) / 0.03) * (relief_m * 0.6)
            central_peak = np.exp(-(r**2) / 0.02) * (relief_m * 0.4)
            crater_floor = np.where(r < 0.6, -relief_m * 0.4, 0.0)
            elevation = crater_rim + central_peak + crater_floor + (base_noise - 0.5) * roughness

        else:
            # General rugged terrain
            elevation = base_noise * relief_m

        # Ensure non-negative baseline
        elevation = elevation - np.min(elevation)
        return elevation

    def compute_slope_map(self, elevation: np.ndarray, cell_size_m: float = 19.5) -> np.ndarray:
        """
        Computes slope in degrees across each cell using finite differences:
        slope = arctan(sqrt( (dz/dx)^2 + (dz/dy)^2 ))
        """
        dy, dx = np.gradient(elevation, cell_size_m, cell_size_m)
        slope_rad = np.arctan(np.sqrt(dx**2 + dy**2))
        slope_deg = np.degrees(slope_rad)
        return slope_deg

    def generate_slope_hazard_texture(self, slope_deg: np.ndarray) -> Image.Image:
        """
        Generates RGB slope hazard texture:
        - Green (<15 deg): Safe for autonomous rover locomotion
        - Yellow (15 - 25 deg): Caution zone (moderate slip and high motor torque)
        - Red (>25 deg): Rollover hazard / impassable terrain for Mars rovers
        """
        rgb = np.zeros((self.res, self.res, 3), dtype=np.uint8)

        # Vectorized color assignment with soft transitions
        safe_mask = slope_deg < 15.0
        caution_mask = (slope_deg >= 15.0) & (slope_deg <= 25.0)
        danger_mask = slope_deg > 25.0

        # Safe Green [46, 204, 113]
        rgb[safe_mask] = [46, 204, 113]
        # Caution Yellow [241, 196, 15]
        rgb[caution_mask] = [241, 196, 15]
        # Danger Red [231, 76, 60]
        rgb[danger_mask] = [231, 76, 60]

        img = Image.fromarray(rgb)
        # Soft blur for smooth aesthetic rendering in Three.js
        img = img.filter(ImageFilter.GaussianBlur(radius=1.2))
        return img

    def generate_satellite_texture(self, analog_id: str, elevation: np.ndarray) -> Image.Image:
        """
        Synthesizes visual RGB satellite / false-color mineral texture tailored to each analog.
        """
        norm_elev = (elevation - np.min(elevation)) / (np.max(elevation) - np.min(elevation) + 1e-6)
        rgb = np.zeros((self.res, self.res, 3), dtype=np.uint8)

        if analog_id == "salar_de_uyuni":
            # Dazzling white polygonal salt crust with delicate bluish brine pools
            salt_white = np.array([242, 246, 248])
            brine_blue = np.array([170, 210, 225])
            crust_line = np.array([215, 220, 225])
            
            x = np.linspace(-1, 1, self.res)
            xx, yy = np.meshgrid(x, x)
            hex_lines = np.abs(np.sin(xx * 30.0) * np.sin(yy * 30.0))
            
            for i in range(3):
                rgb[:, :, i] = np.clip(
                    salt_white[i] * 0.85 + brine_blue[i] * (1.0 - norm_elev) * 0.15 - hex_lines * 15,
                    0, 255
                ).astype(np.uint8)

        elif analog_id == "laguna_colorada":
            # Crimson red pigmented water, bright white borax rims, ochre volcanic soil
            water_red = np.array([195, 45, 38])
            borax_white = np.array([238, 235, 230])
            volcanic_ochre = np.array([168, 122, 85])
            
            lake_mask = norm_elev < 0.25
            rim_mask = (norm_elev >= 0.25) & (norm_elev < 0.40)
            land_mask = norm_elev >= 0.40
            
            rgb[lake_mask] = water_red
            rgb[rim_mask] = borax_white
            rgb[land_mask] = volcanic_ochre

        elif analog_id == "sol_de_manana":
            # Sulfur yellow patches, grey bubbling mud, dark volcanic basalt
            sulfur_yellow = np.array([225, 205, 55])
            acid_grey = np.array([130, 130, 135])
            basalt_dark = np.array([75, 68, 65])
            
            for i in range(3):
                rgb[:, :, i] = (
                    sulfur_yellow[i] * 0.35 +
                    acid_grey[i] * (1.0 - norm_elev) * 0.35 +
                    basalt_dark[i] * norm_elev * 0.30
                ).astype(np.uint8)

        elif analog_id == "nevado_sajama":
            # Dark andesite rock scree transitioning to brilliant summit snow/glacier
            andesite = np.array([92, 88, 86])
            snow_white = np.array([245, 250, 255])
            snow_mask = norm_elev > 0.65
            
            for i in range(3):
                rgb[:, :, i] = andesite[i]
            rgb[snow_mask] = snow_white

        elif analog_id == "valle_de_la_luna_bolivia":
            # Ochre, clay-tan and sandstone strata
            clay_tan = np.array([198, 165, 128])
            sandstone_red = np.array([170, 118, 90])
            for i in range(3):
                layering = np.sin(norm_elev * 25.0) * 15
                rgb[:, :, i] = np.clip(clay_tan[i] * 0.6 + sandstone_red[i] * 0.4 + layering, 0, 255)

        else:
            # Default planetary analog surface: basaltic ochre
            base_col = np.array([175, 135, 100])
            for i in range(3):
                rgb[:, :, i] = np.clip(base_col[i] * (0.7 + 0.3 * norm_elev), 0, 255)

        img = Image.fromarray(rgb)
        img = img.filter(ImageFilter.GaussianBlur(radius=1.0))
        return img

    def generate_all_terrain_assets(self, analog_id: str, relief_m: float, roughness: float) -> Dict[str, str]:
        """
        Generates and saves the 3 visual/displacement assets for a given analog site:
        - heightmap_<id>.png
        - slopemap_<id>.png
        - texture_<id>.png
        Returns dictionary of saved file paths relative to project root.
        """
        elevation = self.generate_elevation_matrix(analog_id, relief_m, roughness)
        
        # 1. Grayscale Heightmap (0..255)
        norm_elev = (elevation - np.min(elevation)) / (np.max(elevation) - np.min(elevation) + 1e-6)
        height_8bit = (norm_elev * 255.0).astype(np.uint8)
        height_img = Image.fromarray(height_8bit)
        
        heightmap_path = HEIGHTMAPS_DIR / f"heightmap_{analog_id}.png"
        height_img.save(heightmap_path, format="PNG")

        # 2. Slope Map & Hazard Analysis Texture
        slope_deg = self.compute_slope_map(elevation)
        slope_img = self.generate_slope_hazard_texture(slope_deg)
        slopemap_path = SLOPEMAPS_DIR / f"slopemap_{analog_id}.png"
        slope_img.save(slopemap_path, format="PNG")

        # 3. Satellite / False-Color Mineral Texture
        texture_img = self.generate_satellite_texture(analog_id, elevation)
        texture_path = TEXTURES_DIR / f"texture_{analog_id}.png"
        texture_img.save(texture_path, format="PNG")

        return {
            "heightmap_path": str(heightmap_path.resolve()),
            "slopemap_path": str(slopemap_path.resolve()),
            "texture_path": str(texture_path.resolve()),
            "heightmap_relative": f"data/processed/heightmaps/heightmap_{analog_id}.png",
            "slopemap_relative": f"data/processed/slope_maps/slopemap_{analog_id}.png",
            "texture_relative": f"data/processed/satellite_textures/texture_{analog_id}.png",
            "max_elevation_relief_m": round(float(np.max(elevation) - np.min(elevation)), 1),
            "max_slope_deg": round(float(np.max(slope_deg)), 1),
            "mean_slope_deg": round(float(np.mean(slope_deg)), 1),
            "safe_terrain_percent": round(float(np.mean(slope_deg < 15.0) * 100), 1),
            "hazard_terrain_percent": round(float(np.mean(slope_deg > 25.0) * 100), 1)
        }

