"""
Generates terrain heightmaps, slope hazard maps, and high-fidelity orbital textures
for all Mars and Moon landing sites and bases.
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from pipeline.config import HEIGHTMAPS_DIR, SLOPEMAPS_DIR, TEXTURES_DIR, TERRAIN_GRID_RESOLUTION

RES = 512  # Higher 512x512 resolution for crisp map inspection!

def generate_fractal_noise(octaves=6, persistence=0.5, seed=42):
    noise = np.zeros((RES, RES))
    freq = 1
    amplitude = 1.0
    total_amp = 0.0
    for i in range(octaves):
        grid_size = min(freq * 4, RES)
        raw = np.random.RandomState(seed + i * 17).rand(grid_size, grid_size)
        img = Image.fromarray(raw).resize((RES, RES), resample=Image.Resampling.BICUBIC)
        noise += np.array(img) * amplitude
        total_amp += amplitude
        amplitude *= persistence
        freq *= 2
    return noise / total_amp

def compute_slope(elevation, cell_size_m=10.0):
    dy, dx = np.gradient(elevation, cell_size_m, cell_size_m)
    slope_rad = np.arctan(np.sqrt(dx**2 + dy**2))
    return np.degrees(slope_rad)

def make_slope_img(slope_deg):
    rgb = np.zeros((RES, RES, 3), dtype=np.uint8)
    safe = slope_deg < 15.0
    caution = (slope_deg >= 15.0) & (slope_deg <= 25.0)
    danger = slope_deg > 25.0
    
    # Safe Green [34, 197, 94]
    rgb[safe] = [34, 197, 94]
    # Caution Yellow [234, 179, 8]
    rgb[caution] = [234, 179, 8]
    # Danger Red [239, 68, 68]
    rgb[danger] = [239, 68, 68]
    
    img = Image.fromarray(rgb).filter(ImageFilter.GaussianBlur(radius=1.5))
    return img

def create_mars_site_assets(site_id):
    x = np.linspace(-1, 1, RES)
    y = np.linspace(-1, 1, RES)
    xx, yy = np.meshgrid(x, y)
    r = np.sqrt(xx**2 + yy**2)
    noise = generate_fractal_noise(seed=hash(site_id) % 10000)
    
    rgb = np.zeros((RES, RES, 3), dtype=np.uint8)
    
    if site_id == "jezero_crater":
        # Impact crater with ancient river delta at west (-x)
        crater_rim = np.exp(-((r - 0.75) ** 2) / 0.035) * 450.0
        crater_floor = np.where(r < 0.75, -200.0 * (1.0 - (r/0.75)**2), 0.0)
        # Delta fan emerging from western breach (xx ~ -0.6 to 0.0, yy ~ -0.2 to 0.2)
        delta_fan = np.exp(-((xx + 0.3)**2 / 0.08 + (yy)**2 / 0.04)) * 80.0 * (r < 0.75)
        # Meandering river channel cutting through rim
        channel = np.exp(-((yy - np.sin(xx * 8) * 0.1)**2) / 0.003) * (xx < -0.3) * -50.0
        elev = crater_rim + crater_floor + delta_fan + channel + (noise - 0.5) * 40.0
        
        # Martian rust ochre base
        ochre = np.array([184, 82, 45])
        clay_greenish = np.array([125, 110, 80])  # Smectite clays in delta
        rim_dark = np.array([120, 50, 30])
        
        norm_e = (elev - np.min(elev)) / (np.max(elev) - np.min(elev))
        for c in range(3):
            rgb[:, :, c] = np.clip(ochre[c] * 0.7 + rim_dark[c] * norm_e * 0.4, 0, 255)
        # Highlight delta fan with clay tones
        delta_mask = delta_fan > 15.0
        for c in range(3):
            rgb[delta_mask, c] = np.clip(clay_greenish[c] * 0.85 + (noise[delta_mask] - 0.5) * 20, 0, 255)
            
    elif site_id == "gale_crater":
        # Vast crater with giant central mound (Aeolis Mons / Mt Sharp)
        crater_rim = np.exp(-((r - 0.85) ** 2) / 0.04) * 800.0
        central_peak = np.exp(-(r**2) / 0.12) * 2200.0
        moat = np.where((r >= 0.25) & (r < 0.85), -400.0, 0.0)
        elev = crater_rim + central_peak + moat + (noise - 0.5) * 80.0
        
        norm_e = (elev - np.min(elev)) / (np.max(elev) - np.min(elev))
        sand_dunes = np.array([85, 45, 30])
        mound_sulfate = np.array([215, 135, 75])
        for c in range(3):
            rgb[:, :, c] = np.clip(sand_dunes[c] * (1.0 - norm_e) + mound_sulfate[c] * norm_e, 0, 255)
            
    elif site_id == "meridiani_planum":
        # Ultra flat hematite plain with small circular impact craters (Victoria / Endurance)
        elev = noise * 25.0
        # Add 3 distinct small craters
        for cx, cy, rad, dep in [(-0.2, 0.1, 0.15, -45.0), (0.4, -0.3, 0.09, -30.0), (-0.5, -0.4, 0.06, -20.0)]:
            cr_dist = np.sqrt((xx - cx)**2 + (yy - cy)**2)
            c_rim = np.exp(-((cr_dist - rad)**2) / 0.003) * (abs(dep) * 0.4)
            c_floor = np.where(cr_dist < rad, dep, 0.0)
            elev += c_rim + c_floor
            
        dark_hematite = np.array([95, 70, 65])
        red_dust = np.array([205, 95, 45])
        norm_e = (elev - np.min(elev)) / (np.max(elev) - np.min(elev))
        for c in range(3):
            rgb[:, :, c] = np.clip(dark_hematite[c] * 0.75 + red_dust[c] * norm_e * 0.35, 0, 255)
            
    elif site_id == "gusev_crater":
        # Flat basaltic crater with Columbia Hills at east (xx > 0.3)
        hills = np.exp(-((xx - 0.45)**2 / 0.05 + (yy + 0.1)**2 / 0.12)) * 320.0
        elev = hills + noise * 40.0
        basalt_grey = np.array([110, 85, 75])
        hills_ochre = np.array([175, 90, 50])
        norm_e = (elev - np.min(elev)) / (np.max(elev) - np.min(elev))
        for c in range(3):
            rgb[:, :, c] = np.clip(basalt_grey[c] * (1.0 - norm_e*0.6) + hills_ochre[c] * norm_e * 0.8, 0, 255)
            
    elif site_id == "valles_marineris":
        # Giant canyon rift slicing east-west with stepped scarp walls and floor landslides
        trench = np.exp(-(yy**2) / 0.08) * -2500.0
        landslides = np.sin(xx * 15) * np.exp(-((yy + 0.1)**2) / 0.02) * 400.0
        elev = trench + landslides + noise * 120.0
        
        deep_chasma = np.array([70, 35, 25])
        plateau_top = np.array([195, 100, 55])
        norm_e = (elev - np.min(elev)) / (np.max(elev) - np.min(elev))
        for c in range(3):
            rgb[:, :, c] = np.clip(deep_chasma[c] * (1.0 - norm_e) + plateau_top[c] * norm_e, 0, 255)
            
    elif site_id == "arcadia_planitia":
        # Periglacial polygons and shallow ice sheet
        polygon_mesh = (np.abs(np.sin(xx * 25.0) * np.sin(yy * 25.0)) ** 0.3) * 12.0
        elev = polygon_mesh + noise * 20.0
        ice_tint = np.array([210, 185, 175])
        soil_tint = np.array([160, 95, 60])
        norm_e = (elev - np.min(elev)) / (np.max(elev) - np.min(elev))
        for c in range(3):
            rgb[:, :, c] = np.clip(soil_tint[c] * (1.0 - norm_e) + ice_tint[c] * norm_e, 0, 255)
    else:
        elev = noise * 100.0
        for c in range(3):
            rgb[:, :, c] = np.clip(160 + (noise - 0.5) * 50, 0, 255)

    elev = elev - np.min(elev)
    norm_elev = elev / (np.max(elev) + 1e-6)
    height_img = Image.fromarray((norm_elev * 255.0).astype(np.uint8))
    
    slope_deg = compute_slope(elev)
    slope_img = make_slope_img(slope_deg)
    
    tex_img = Image.fromarray(rgb).filter(ImageFilter.GaussianBlur(radius=0.8))
    
    # Save files
    height_img.save(HEIGHTMAPS_DIR / f"heightmap_{site_id}.png")
    slope_img.save(SLOPEMAPS_DIR / f"slopemap_{site_id}.png")
    tex_img.save(TEXTURES_DIR / f"texture_{site_id}.png")
    print(f"Generated Mars assets for: {site_id}")

def create_moon_site_assets(site_id):
    x = np.linspace(-1, 1, RES)
    y = np.linspace(-1, 1, RES)
    xx, yy = np.meshgrid(x, y)
    r = np.sqrt(xx**2 + yy**2)
    noise = generate_fractal_noise(seed=hash(site_id) % 10000 + 50)
    
    rgb = np.zeros((RES, RES, 3), dtype=np.uint8)
    
    if site_id == "shackleton_crater":
        # Deep polar crater, permanent shadow in floor, sunlit rim peaks
        rim = np.exp(-((r - 0.7)**2) / 0.02) * 1800.0
        floor = np.where(r < 0.7, -2200.0 * (1.0 - (r/0.7)**1.5), 0.0)
        elev = rim + floor + noise * 60.0
        
        # Highlands silver-grey with pitch-black shadow inside crater and bright sun on rim
        highlands = np.array([170, 175, 182])
        sunlit_rim = np.array([245, 248, 255])
        deep_psr = np.array([15, 18, 25])  # Permanently Shadowed Region
        
        norm_e = (elev - np.min(elev)) / (np.max(elev) - np.min(elev))
        for c in range(3):
            rgb[:, :, c] = np.clip(deep_psr[c] * (1.0 - norm_e**1.5) + highlands[c] * norm_e, 0, 255)
        # Peaks of eternal light
        rim_mask = norm_e > 0.85
        for c in range(3):
            rgb[rim_mask, c] = sunlit_rim[c]
            
    elif site_id == "tranquility_base":
        # Flat lunar mare basalt with small impact craters and Apollo 11 lander location
        elev = noise * 25.0
        # Add craters
        for cx, cy, rad, dep in [(-0.3, -0.2, 0.12, -35.0), (0.35, 0.35, 0.08, -25.0), (-0.1, 0.4, 0.05, -15.0)]:
            cr_dist = np.sqrt((xx - cx)**2 + (yy - cy)**2)
            c_rim = np.exp(-((cr_dist - rad)**2) / 0.003) * 15.0
            c_floor = np.where(cr_dist < rad, dep, 0.0)
            elev += c_rim + c_floor
            
        dark_mare = np.array([90, 93, 100])
        norm_e = (elev - np.min(elev)) / (np.max(elev) - np.min(elev))
        for c in range(3):
            rgb[:, :, c] = np.clip(dark_mare[c] * 0.8 + norm_e * 40.0 + (noise - 0.5) * 20.0, 0, 255)
            
    elif site_id == "marius_hills":
        # Volcanic lunar domes and collapsed lava tube pit
        domes = np.exp(-((xx + 0.3)**2 / 0.06 + (yy - 0.2)**2 / 0.06)) * 280.0
        domes += np.exp(-((xx - 0.3)**2 / 0.08 + (yy + 0.3)**2 / 0.08)) * 220.0
        # Pit skylight collapse hole in center
        pit_r = np.sqrt(xx**2 + yy**2)
        pit = np.where(pit_r < 0.08, -350.0, 0.0)
        # Sinuous rille (meandering collapsed channel)
        rille = np.exp(-((yy - np.sin(xx * 6) * 0.15)**2) / 0.002) * -70.0
        elev = domes + pit + rille + noise * 35.0
        
        mare_tone = np.array([105, 110, 118])
        dome_tone = np.array([155, 160, 168])
        norm_e = (elev - np.min(elev)) / (np.max(elev) - np.min(elev))
        for c in range(3):
            rgb[:, :, c] = np.clip(mare_tone[c] * (1.0 - norm_e) + dome_tone[c] * norm_e, 0, 255)
        # Dark pit
        rgb[pit_r < 0.08] = [10, 12, 16]
        
    elif site_id == "taurus_littrow":
        # Deep valley bordered by gigantic North and South Massifs
        massif_north = np.exp(-((yy - 0.6)**2) / 0.08) * 1400.0
        massif_south = np.exp(-((yy + 0.6)**2) / 0.08) * 1600.0
        elev = massif_north + massif_south + noise * 50.0
        
        valley_dark = np.array([85, 88, 95])
        massif_bright = np.array([180, 185, 195])
        norm_e = (elev - np.min(elev)) / (np.max(elev) - np.min(elev))
        for c in range(3):
            rgb[:, :, c] = np.clip(valley_dark[c] * (1.0 - norm_e) + massif_bright[c] * norm_e, 0, 255)

    elev = elev - np.min(elev)
    norm_elev = elev / (np.max(elev) + 1e-6)
    height_img = Image.fromarray((norm_elev * 255.0).astype(np.uint8))
    
    slope_deg = compute_slope(elev)
    slope_img = make_slope_img(slope_deg)
    
    tex_img = Image.fromarray(rgb).filter(ImageFilter.GaussianBlur(radius=0.8))
    
    # Save files
    height_img.save(HEIGHTMAPS_DIR / f"heightmap_{site_id}.png")
    slope_img.save(SLOPEMAPS_DIR / f"slopemap_{site_id}.png")
    tex_img.save(TEXTURES_DIR / f"texture_{site_id}.png")
    print(f"Generated Moon assets for: {site_id}")

def main():
    mars_sites = ["jezero_crater", "gale_crater", "meridiani_planum", "gusev_crater", "valles_marineris", "arcadia_planitia"]
    moon_sites = ["shackleton_crater", "tranquility_base", "marius_hills", "taurus_littrow"]
    
    print("Generating Mars terrain and orbital assets...")
    for ms in mars_sites:
        create_mars_site_assets(ms)
        
    print("\nGenerating Moon terrain and surface assets...")
    for ms in moon_sites:
        create_moon_site_assets(ms)
        
    print("\n✅ All Mars and Moon assets successfully generated!")

if __name__ == "__main__":
    main()
