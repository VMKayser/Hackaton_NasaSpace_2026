"""
Planetary Target Specifications & Ground-Truth Reference Vectors.
Data compiled from NASA LRO (LOLA/Diviner), Mars 2020 (SuperCam/Mastcam-Z), and MRO (CRISM/HiRISE).
"""
from dataclasses import dataclass
from typing import Dict, List

@dataclass
class PlanetaryTarget:
    id: str
    name: str
    body: str  # "Mars" or "Moon"
    mission_context: str
    coordinates: str
    diameter_km: float
    depth_m: float
    gravity_g: float
    atm_pressure_kpa: float
    
    # Physical metric reference vector for PSI comparison
    mean_slope_deg: float
    roughness_std_m: float
    peak_valley_relief_m: float
    crater_density_index: float  # 0 to 1
    
    # Mineral composition fraction vector (normalized 0 to 1)
    basalt_fraction: float
    sulfates_evaporites: float
    clays_phyllosilicates: float
    iron_oxides: float
    silica_regolith: float
    carbonates: float
    
    # Environmental metrics
    aridity_index: float        # 1.0 = absolute arid (no free water)
    uv_flux_index: float        # Relative UV intensity normalized
    thermal_amplitude_c: float  # Daily temperature swing (deg C)
    min_temp_c: float
    max_temp_c: float
    
    key_scientific_questions: List[str]
    critical_analog_requirements: List[str]

# Defined Targets
PLANETARY_TARGETS: Dict[str, PlanetaryTarget] = {
    "jezero_crater_mars": PlanetaryTarget(
        id="jezero_crater_mars",
        name="Jezero Crater (Mars 2020 Perseverance Site)",
        body="Mars",
        mission_context="NASA Mars 2020 / Perseverance Rover - Astrobiology & Paleolake Exploration",
        coordinates="18.38° N, 77.58° E",
        diameter_km=49.0,
        depth_m=500.0,
        gravity_g=0.38,
        atm_pressure_kpa=0.61,
        
        # Geomorphology (delta scarps, crater floor, moderate roughness with regolith and dunes)
        mean_slope_deg=6.8,
        roughness_std_m=8.5,
        peak_valley_relief_m=280.0,
        crater_density_index=0.65,
        
        # Mineralogy: ancient lakebed with clay delta, olivine/carbonate units, sulfate salts
        basalt_fraction=0.35,
        sulfates_evaporites=0.25,
        clays_phyllosilicates=0.20,
        iron_oxides=0.10,
        silica_regolith=0.05,
        carbonates=0.05,
        
        # Environment
        aridity_index=1.0,
        uv_flux_index=0.88,
        thermal_amplitude_c=85.0,
        min_temp_c=-95.0,
        max_temp_c=-5.0,
        
        key_scientific_questions=[
            "Preservation of biosignatures in ancient lacustrine sediments and deltaic clays.",
            "Evaporite precipitation cycles and saline paleolake chemical evolution.",
            "Autonomous rover traverse over mixed sand ripples and rocky bedrock."
        ],
        critical_analog_requirements=[
            "High concentration of evaporites, sulfates, and carbonates in a closed basin.",
            "Hyper-arid environment with extreme solar UV radiation.",
            "Flat basin surrounded by volcanic/crater rim morphology."
        ]
    ),
    
    "gale_crater_mars": PlanetaryTarget(
        id="gale_crater_mars",
        name="Gale Crater & Mount Sharp (MSL Curiosity Site)",
        body="Mars",
        mission_context="NASA Mars Science Laboratory / Curiosity Rover - Habitability & Stratigraphy",
        coordinates="5.40° S, 137.80° E",
        diameter_km=154.0,
        depth_m=4500.0,
        gravity_g=0.38,
        atm_pressure_kpa=0.65,
        
        mean_slope_deg=11.2,
        roughness_std_m=16.0,
        peak_valley_relief_m=1200.0,
        crater_density_index=0.70,
        
        basalt_fraction=0.40,
        sulfates_evaporites=0.30,
        clays_phyllosilicates=0.15,
        iron_oxides=0.10,
        silica_regolith=0.03,
        carbonates=0.02,
        
        aridity_index=1.0,
        uv_flux_index=0.85,
        thermal_amplitude_c=78.0,
        min_temp_c=-88.0,
        max_temp_c=0.0,
        
        key_scientific_questions=[
            "Transition from clay-rich habitable lake strata to hyper-arid sulfate-rich layers.",
            "Wheel traction degradation and tire abrasion on sharp ventifact-strewn bedrock.",
            "Organic compound preservation under prolonged cosmic ray bombardment."
        ],
        critical_analog_requirements=[
            "Layered sedimentary stratigraphy with transitioning sulfate-bearing beds.",
            "High wind erosion and ventifact rock pavements.",
            "Significant topographical elevation change (slopes 10° - 20°)."
        ]
    ),
    
    "shackleton_crater_moon": PlanetaryTarget(
        id="shackleton_crater_moon",
        name="Shackleton Crater (Lunar South Pole - Artemis III Target)",
        body="Moon",
        mission_context="NASA Artemis Program - South Pole Permanently Shadowed Regions (PSR) & Water Ice",
        coordinates="89.90° S, 0.00° E",
        diameter_km=21.0,
        depth_m=4200.0,
        gravity_g=0.166,
        atm_pressure_kpa=0.0,
        
        mean_slope_deg=22.4,  # Steep inner walls (~30°) and moderate rim
        roughness_std_m=24.5,
        peak_valley_relief_m=3500.0,
        crater_density_index=0.95,
        
        basalt_fraction=0.25,
        sulfates_evaporites=0.0,
        clays_phyllosilicates=0.0,
        iron_oxides=0.05,
        silica_regolith=0.70,  # Dominant anorthositic & impact melt regolith
        carbonates=0.0,
        
        aridity_index=1.0,
        uv_flux_index=0.95,
        thermal_amplitude_c=250.0,
        min_temp_c=-233.0,  # 40 Kelvin in PSR
        max_temp_c=50.0,    # Peaks of Eternal Light
        
        key_scientific_questions=[
            "In-Situ Resource Utilization (ISRU): volatile extraction from cryogenic regolith.",
            "Extreme slope mobility and anchoring systems on 25°+ crater rims.",
            "Autonomous navigation under low-angle grazing solar shadows and LiDAR guidance."
        ],
        critical_analog_requirements=[
            "Steep crater rim slopes and highly fractured blocky topography.",
            "Extreme cryogenic or low-temperature dry regolith conditions.",
            "Fine-grained abrasive dust simulating lunar highlands anorthosite."
        ]
    )
}

