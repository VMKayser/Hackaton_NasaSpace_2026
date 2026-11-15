"""
Database of Terrestrial Planetary Analogs.
Highlights Bolivian high-altitude extremophile, volcanic, and evaporitic sites as 
world-class 'hidden gems', alongside international benchmark analogs.
"""
from dataclasses import dataclass, field
from typing import Dict, List, Optional

@dataclass
class TerrestrialAnalog:
    id: str
    name: str
    country: str
    region: str
    lat: float
    lng: float
    elevation_m: float
    is_bolivian_gem: bool
    
    scientific_summary: str
    geological_context: str
    
    # Geomorphology & Topography (measured / derived)
    mean_slope_deg: float
    roughness_std_m: float
    peak_valley_relief_m: float
    crater_or_structure_density: float  # 0 to 1
    
    # Mineralogy & Lithology (normalized 0 to 1)
    basalt_fraction: float
    sulfates_evaporites: float
    clays_phyllosilicates: float
    iron_oxides: float
    silica_regolith: float
    carbonates: float
    predominant_minerals: List[str]
    
    # Climate & Environment
    aridity_index: float        # 0 (humid) to 1.0 (hyper-arid)
    uv_flux_index: float        # 0 to 1.0 (extreme solar radiation)
    thermal_amplitude_c: float  # Daily temperature swing (deg C)
    min_temp_c: float
    max_temp_c: float
    annual_precip_mm: float
    atm_pressure_kpa: float     # Ambient surface atmospheric pressure
    
    # Primary Planetary Target Fit
    primary_target_id: str      # e.g., "jezero_crater_mars" or "shackleton_crater_moon"
    
    # Operational testing advantages
    operational_testing_roles: List[str]
    key_advantages: List[str]
    unreplicable_gaps: List[str]

TERRESTRIAL_ANALOGS: Dict[str, TerrestrialAnalog] = {
    # ==========================================
    # BOLIVIAN HIDDEN GEMS (Altiplano & Andes)
    # ==========================================
    "salar_de_uyuni": TerrestrialAnalog(
        id="salar_de_uyuni",
        name="Salar de Uyuni",
        country="Bolivia",
        region="Potosí / Daniel Campos",
        lat=-20.1338,
        lng=-67.4891,
        elevation_m=3656.0,
        is_bolivian_gem=True,
        scientific_summary=(
            "The world's largest salt flat (10,582 km²). Hyper-flat polygonal halite crust overlying dense brine. "
            "Pristine planetary analog for ancient closed-basin evaporite deposits on Mars (such as Jezero Crater and Meridiani Planum) "
            "and the premier Earth target for satellite laser and radar altimeter calibration (ICESat, MOLA)."
        ),
        geological_context="Pleistocene paleolake basin (Lake Minchin / Tauca) transformed into pure evaporite sequences.",
        mean_slope_deg=0.8,
        roughness_std_m=0.35,
        peak_valley_relief_m=1.2,
        crater_or_structure_density=0.15,
        basalt_fraction=0.05,
        sulfates_evaporites=0.75,
        clays_phyllosilicates=0.05,
        iron_oxides=0.02,
        silica_regolith=0.08,
        carbonates=0.05,
        predominant_minerals=["Halite (NaCl)", "Gypsum (CaSO4·2H2O)", "Lithium Chloride", "Ulexite/Borates", "Calcite"],
        aridity_index=0.92,
        uv_flux_index=0.96,
        thermal_amplitude_c=25.0,
        min_temp_c=-15.0,
        max_temp_c=20.0,
        annual_precip_mm=160.0,
        atm_pressure_kpa=65.2,  # ~35% less pressure than sea level
        primary_target_id="jezero_crater_mars",
        operational_testing_roles=[
            "Surface LiDAR and radar altimetry calibration",
            "High-speed autonomous rover long-range transit",
            "Evaporite crust drill bit penetration and salt-clogging mitigation",
            "UV reflectance spectrometer calibration"
        ],
        key_advantages=[
            "Exceptional planarity mimicking Martian lake plains",
            "Extremely high solar UV flux due to 3,656m elevation and thin air",
            "Direct mineralogical analog for Mars Jezero saline residual phase"
        ],
        unreplicable_gaps=[
            "Higher atmospheric pressure (65 kPa vs Mars 0.6 kPa)",
            "Earth gravity (1.0g vs Mars 0.38g)",
            "Seasonal shallow water film during rainy season (Dec-Feb)"
        ]
    ),
    
    "laguna_colorada": TerrestrialAnalog(
        id="laguna_colorada",
        name="Laguna Colorada (Eduardo Abaroa Reserve)",
        country="Bolivia",
        region="Potosí / Sud Lípez",
        lat=-22.2031,
        lng=-67.7739,
        elevation_m=4278.0,
        is_bolivian_gem=True,
        scientific_summary=(
            "Shallow hypersaline high-altitude volcanic lake characterized by blood-red pigmentation caused by "
            "extremophilic microalgae and Archaea surviving under lethal UV radiation, sub-zero temperatures, and toxic borax/arsenic brines. "
            "Foremost astrobiological analog for ancient Martian warm-spring lacustrine environments and biosignature preservation."
        ),
        geological_context="Volcanically fed closed-basin saline lake enriched in borates, sulfates, and volcanic ashes.",
        mean_slope_deg=3.2,
        roughness_std_m=2.1,
        peak_valley_relief_m=85.0,
        crater_or_structure_density=0.30,
        basalt_fraction=0.15,
        sulfates_evaporites=0.55,
        clays_phyllosilicates=0.10,
        iron_oxides=0.08,
        silica_regolith=0.07,
        carbonates=0.05,
        predominant_minerals=["Borax", "Gypsum", "Halite", "Sodium Sulfate", "Volcanic Ash (Andesite)"],
        aridity_index=0.88,
        uv_flux_index=0.99,  # Highest recorded terrestrial UV index
        thermal_amplitude_c=30.0,
        min_temp_c=-20.0,
        max_temp_c=16.0,
        annual_precip_mm=95.0,
        atm_pressure_kpa=60.5,
        primary_target_id="jezero_crater_mars",
        operational_testing_roles=[
            "Astrobiological biosignature detection (Raman and fluorescence spectrometers)",
            "Brine sampling and micro-fluidic life detection instruments",
            "Corrosion-resistant amphibious chassis seals",
            "Extreme UV radiation sensor calibration"
        ],
        key_advantages=[
            "Active polyextremophile community in Mars-analog chemical brines",
            "Lethal UV-B/UV-C flux matching Martian surface radiation proxies",
            "Borate and sulfate crystal structures known to stabilize prebiotic RNA molecules"
        ],
        unreplicable_gaps=[
            "Terrestrial oxygenated atmosphere",
            "Higher thermal floor than modern Mars (-20°C vs -90°C)",
            "Avian biosphere presence (flamingos) which must be excluded during testing"
        ]
    ),
    
    "sol_de_manana": TerrestrialAnalog(
        id="sol_de_manana",
        name="Sol de Mañana Geothermal Field",
        country="Bolivia",
        region="Potosí / Sud Lípez",
        lat=-22.4358,
        lng=-67.7917,
        elevation_m=4850.0,
        is_bolivian_gem=True,
        scientific_summary=(
            "High-energy geothermal field situated at nearly 5,000 meters elevation. Features boiling mud pools, "
            "pressurized steam fumaroles emitting sulfurous vapors, and acidic hydrothermal alteration minerals. "
            "Direct analog for early Mars hydrothermal systems, Gusev Crater 'Home Plate' silica sinter deposits, and Io's sulfur volcanism."
        ),
        geological_context="Pleistocene to Holocene volcanic geothermal field with intense solfataric and sulfur mineral precipitation.",
        mean_slope_deg=9.5,
        roughness_std_m=12.4,
        peak_valley_relief_m=240.0,
        crater_or_structure_density=0.60,
        basalt_fraction=0.30,
        sulfates_evaporites=0.35,
        clays_phyllosilicates=0.15,
        iron_oxides=0.12,
        silica_regolith=0.08,
        carbonates=0.00,
        predominant_minerals=["Elemental Sulfur", "Opaline Silica", "Alunite", "Pyrite", "Jarosite"],
        aridity_index=0.85,
        uv_flux_index=0.98,
        thermal_amplitude_c=35.0,
        min_temp_c=-25.0,
        max_temp_c=14.0,
        annual_precip_mm=75.0,
        atm_pressure_kpa=56.0,  # ~45% atmospheric reduction
        primary_target_id="jezero_crater_mars",
        operational_testing_roles=[
            "High-temperature hydrothermal vent sensor testing",
            "Drill bit testing in boiling acid mud and sulfur encrustations",
            "Gas chromatograph and mass spectrometer volcanic emission sniffing",
            "Autonomous hazard avoidance in steaming, low-visibility conditions"
        ],
        key_advantages=[
            "Active sulfurous hydrothermal venting at extreme elevation",
            "Presence of Jarosite and opaline silica identical to Martian discoveries by Opportunity and Spirit",
            "Extremely low atmospheric pressure amplifying vapor plume dynamics"
        ],
        unreplicable_gaps=[
            "Presence of liquid water and active steam vents (modern Mars has no active liquid surface geysers)",
            "Earth atmospheric oxygen and 1.0g gravity"
        ]
    ),
    
    "nevado_sajama": TerrestrialAnalog(
        id="nevado_sajama",
        name="Nevado Sajama & Volcanic Domes",
        country="Bolivia",
        region="Oruro / Sajama National Park",
        lat=-18.1083,
        lng=-68.8833,
        elevation_m=6542.0,
        is_bolivian_gem=True,
        scientific_summary=(
            "Bolivia's highest stratovolcano surrounded by volcanic lava domes, high-altitude permafrost, and blocky andesitic scree. "
            "At altitudes between 4,200m and 6,542m, atmospheric density drops to 45%-55% of sea level, making it the premier global testbed "
            "for Martian rotorcraft aerodynamics (Ingenuity drone successors) and cryogenic high-slope lunar/Martian rover climbing."
        ),
        geological_context="Extinct Pleistocene composite andesitic stratovolcano with parasitic rhyodacite lava domes and cryoturbation.",
        mean_slope_deg=24.5,
        roughness_std_m=28.0,
        peak_valley_relief_m=2300.0,
        crater_or_structure_density=0.75,
        basalt_fraction=0.55,
        sulfates_evaporites=0.05,
        clays_phyllosilicates=0.05,
        iron_oxides=0.15,
        silica_regolith=0.20,
        carbonates=0.00,
        predominant_minerals=["Andesite", "Pyroxene", "Plagioclase Feldspar", "Magnetite", "Volcanic Glass"],
        aridity_index=0.89,
        uv_flux_index=0.99,
        thermal_amplitude_c=28.0,
        min_temp_c=-30.0,
        max_temp_c=8.0,
        annual_precip_mm=280.0,
        atm_pressure_kpa=46.5,  # Extreme low density for flight testing
        primary_target_id="shackleton_crater_moon",
        operational_testing_roles=[
            "Thin-atmosphere aerodynamic rotorcraft flight validation (Mars helicopter/Ingenuity)",
            "Steep-slope rover climbing, wheel slip, and tethered rappelling systems",
            "Cryogenic permafrost ice-core drilling",
            "LiDAR terrain relative navigation over sharp volcanic relief"
        ],
        key_advantages=[
            "Critical atmospheric thinning (~46 kPa) testing rotor blade aerodynamics",
            "Steep blocky talus slopes matching Moon Shackleton Crater rim slopes (>25°)",
            "Cryogenic permafrost and permanent summit ice mimic polar volatile traps"
        ],
        unreplicable_gaps=[
            "Atmosphere is still ~70x denser than Mars surface (~0.6 kPa) despite being ultra-thin for Earth",
            "Gravity is 1.0g (vs Moon 0.16g and Mars 0.38g)"
        ]
    ),
    
    "valle_de_la_luna_bolivia": TerrestrialAnalog(
        id="valle_de_la_luna_bolivia",
        name="Valle de la Luna (Valley of the Moon)",
        country="Bolivia",
        region="La Paz / Pedro Domingo Murillo",
        lat=-16.5683,
        lng=-68.0967,
        elevation_m=3400.0,
        is_bolivian_gem=True,
        scientific_summary=(
            "A labyrinth of dramatic spires, hoodoos, deep erosion gullies, and clay badlands formed by intense water and wind erosion of clay-rich sedimentary deposits. "
            "Striking morphological match for Martian yardangs, weathered delta scarps, and fractured clay deposits in Mawrth Vallis and Jezero."
        ),
        geological_context="Intensely eroded clay, siltstone, and sandstone lacustrine sediments from ancestral glacial lake outflows.",
        mean_slope_deg=18.5,
        roughness_std_m=14.0,
        peak_valley_relief_m=120.0,
        crater_or_structure_density=0.45,
        basalt_fraction=0.10,
        sulfates_evaporites=0.15,
        clays_phyllosilicates=0.55,
        iron_oxides=0.12,
        silica_regolith=0.08,
        carbonates=0.00,
        predominant_minerals=["Smectite Clay", "Illite", "Quartz Silt", "Iron Hydroxides", "Calcite"],
        aridity_index=0.82,
        uv_flux_index=0.92,
        thermal_amplitude_c=22.0,
        min_temp_c=-4.0,
        max_temp_c=21.0,
        annual_precip_mm=420.0,
        atm_pressure_kpa=68.0,
        primary_target_id="jezero_crater_mars",
        operational_testing_roles=[
            "Autonomous SLAM navigation and visual odometry in GPS-denied labyrinthine canyon corridors",
            "Clay mechanical adhesion testing on rover chassis and wheels",
            "Scarp stability and landslide hazard prediction",
            "Robotic arm sampling of soft phyllosilicate stratigraphy"
        ],
        key_advantages=[
            "High clay content simulating phyllosilicate-bearing layered Martian terrains",
            "Complex 3D vertical relief testing line-of-sight communications and antenna positioning",
            "Close logistical proximity to urban infrastructure for rapid hackathon / university field validation"
        ],
        unreplicable_gaps=[
            "Formed by rainfall runoff rather than aeolian and paleolake processes alone",
            "Vegetation presence in adjacent valleys"
        ]
    ),

    # ==========================================
    # GLOBAL BENCHMARK PLANETARY ANALOGS
    # ==========================================
    "atacama_yungay": TerrestrialAnalog(
        id="atacama_yungay",
        name="Atacama Desert (Yungay Core)",
        country="Chile",
        region="Antofagasta",
        lat=-24.0833,
        lng=-69.8667,
        elevation_m=960.0,
        is_bolivian_gem=False,
        scientific_summary=(
            "The oldest and driest non-polar desert on Earth. Recognized by NASA as the definitive Martian dry limit for soil biology. "
            "Pliocene nitrate and perchlorate salt deposits mirror the chemical signatures discovered by the Phoenix and Curiosity landers."
        ),
        geological_context="Hyper-arid rain shadow desert basin between Coastal Cordillera and Andes with nitrate deposits.",
        mean_slope_deg=4.5,
        roughness_std_m=4.2,
        peak_valley_relief_m=45.0,
        crater_or_structure_density=0.25,
        basalt_fraction=0.25,
        sulfates_evaporites=0.45,
        clays_phyllosilicates=0.10,
        iron_oxides=0.12,
        silica_regolith=0.08,
        carbonates=0.00,
        predominant_minerals=["Nitratine", "Halite", "Gypsum", "Perchlorates", "Anhydrite"],
        aridity_index=0.99,
        uv_flux_index=0.93,
        thermal_amplitude_c=26.0,
        min_temp_c=2.0,
        max_temp_c=36.0,
        annual_precip_mm=2.0,
        atm_pressure_kpa=90.5,
        primary_target_id="jezero_crater_mars",
        operational_testing_roles=[
            "Hyper-arid soil habitability assays",
            "Deep sub-surface life-detection drill testing (NASA IceBreaker)",
            "Perchlorate chemical neutralization sensors"
        ],
        key_advantages=[
            "Extreme dryness for millions of years creating accurate Mars soil chemistry",
            "Decades of NASA field mission heritage"
        ],
        unreplicable_gaps=[
            "Sea-level ambient pressure is high (~90 kPa)",
            "Warm daytime temperatures"
        ]
    ),

    "mcmurdo_dry_valleys": TerrestrialAnalog(
        id="mcmurdo_dry_valleys",
        name="McMurdo Dry Valleys (University Valley)",
        country="Antarctica",
        region="Victoria Land",
        lat=-77.8667,
        lng=160.6667,
        elevation_m=1650.0,
        is_bolivian_gem=False,
        scientific_summary=(
            "Cold desert with hyper-arid permafrost, sub-zero mean annual temperatures (-20°C to -40°C), and katabatic gale winds. "
            "Prime analog for dry cryogenic ground ice and polygon terrain on the Martian high latitudes."
        ),
        geological_context="Glacially carved valley devoid of snow cover due to katabatic winds and hyper-arid sublimation.",
        mean_slope_deg=14.0,
        roughness_std_m=18.0,
        peak_valley_relief_m=650.0,
        crater_or_structure_density=0.35,
        basalt_fraction=0.35,
        sulfates_evaporites=0.20,
        clays_phyllosilicates=0.05,
        iron_oxides=0.10,
        silica_regolith=0.30,
        carbonates=0.00,
        predominant_minerals=["Dry Permafrost Ice", "Quartz Sand", "Dolerite", "Halite", "Gypsum"],
        aridity_index=0.98,
        uv_flux_index=0.75,
        thermal_amplitude_c=45.0,
        min_temp_c=-55.0,
        max_temp_c=5.0,
        annual_precip_mm=10.0,
        atm_pressure_kpa=81.0,
        primary_target_id="gale_crater_mars",
        operational_testing_roles=[
            "Cryogenic ground ice drilling and core sample curation",
            "Low-temperature battery and electronics survivability tests",
            "Polygonal permafrost thermal contraction cracking models"
        ],
        key_advantages=[
            "Sub-zero mean annual temperature combined with hyper-aridity",
            "Dry permafrost identical to Phoenix Mars landing site"
        ],
        unreplicable_gaps=[
            "Extreme logistics and Antarctic Treaty environmental restrictions",
            "Earth atmospheric pressure and gravity"
        ]
    ),

    "haughton_crater": TerrestrialAnalog(
        id="haughton_crater",
        name="Haughton Impact Crater (Devon Island)",
        country="Canada",
        region="Nunavut / Arctic",
        lat=75.3833,
        lng=-89.6833,
        elevation_m=200.0,
        is_bolivian_gem=False,
        scientific_summary=(
            "A 23-km diameter meteorite impact crater in the polar desert of Devon Island. Site of NASA's Haughton-Mars Project (HMP). "
            "Features shatter cones, impact melt breccias, paleolake deposits, and gullies formed under cold climatic regimes."
        ),
        geological_context="Eocene complex meteorite impact crater excavated into Paleozoic sedimentary rocks in permafrost terrain.",
        mean_slope_deg=12.5,
        roughness_std_m=15.5,
        peak_valley_relief_m=220.0,
        crater_or_structure_density=0.88,
        basalt_fraction=0.15,
        sulfates_evaporites=0.25,
        clays_phyllosilicates=0.20,
        iron_oxides=0.05,
        silica_regolith=0.30,
        carbonates=0.05,
        predominant_minerals=["Impact Melt Breccia", "Dolomite", "Gypsum", "Quartz Shatter Cones"],
        aridity_index=0.89,
        uv_flux_index=0.60,
        thermal_amplitude_c=35.0,
        min_temp_c=-45.0,
        max_temp_c=12.0,
        annual_precip_mm=130.0,
        atm_pressure_kpa=100.2,
        primary_target_id="shackleton_crater_moon",
        operational_testing_roles=[
            "Impact crater rim navigation and traverse planning",
            "Pressurized rover field trials and extravehicular activity (EVA) suit ergonomics",
            "Subsurface sounding radar tests on impact structures"
        ],
        key_advantages=[
            "Real complex impact crater morphology with central uplift and ejecta blanket",
            "Arctic cold desert weathering processes"
        ],
        unreplicable_gaps=[
            "Sea-level atmospheric pressure and standard Earth gravity",
            "Short seasonal testing window (summer only)"
        ]
    ),

    "rio_tinto": TerrestrialAnalog(
        id="rio_tinto",
        name="Río Tinto Acidic River",
        country="Spain",
        region="Andalusia / Huelva",
        lat=37.6975,
        lng=-6.5647,
        elevation_m=320.0,
        is_bolivian_gem=False,
        scientific_summary=(
            "Hyper-acidic (pH ~1.7 to 2.5) river containing high concentrations of ferric iron and sulfates. "
            "Famous for vast deposits of jarosite and hematite ('blueberries'), mirroring Opportunity's discoveries at Meridiani Planum."
        ),
        geological_context="Iberian Pyrite Belt massive sulfide deposits subjected to chemolithotrophic bio-oxidation.",
        mean_slope_deg=6.0,
        roughness_std_m=5.0,
        peak_valley_relief_m=60.0,
        crater_or_structure_density=0.10,
        basalt_fraction=0.10,
        sulfates_evaporites=0.40,
        clays_phyllosilicates=0.10,
        iron_oxides=0.35,
        silica_regolith=0.05,
        carbonates=0.00,
        predominant_minerals=["Jarosite", "Goethite", "Hematite", "Copiapite", "Pyrite"],
        aridity_index=0.60,
        uv_flux_index=0.78,
        thermal_amplitude_c=18.0,
        min_temp_c=4.0,
        max_temp_c=38.0,
        annual_precip_mm=650.0,
        atm_pressure_kpa=97.5,
        primary_target_id="gale_crater_mars",
        operational_testing_roles=[
            "Iron-sulfate spectroscopy signature identification",
            "Chemolithotrophic subsurface biosignature detection",
            "Acid-resistant robotic coating and seal tests"
        ],
        key_advantages=[
            "Exact mineralogical analog for Martian jarosite and hematite deposits",
            "Chemoautotrophic iron/sulfur metabolic ecosystem"
        ],
        unreplicable_gaps=[
            "Temperate Mediterranean climate with high rainfall",
            "Abundant surface liquid water"
        ]
    ),

    "askja_iceland": TerrestrialAnalog(
        id="askja_iceland",
        name="Askja Caldera & Holuhraun Lava",
        country="Iceland",
        region="Highlands of Iceland",
        lat=65.0300,
        lng=-16.7500,
        elevation_m=1100.0,
        is_bolivian_gem=False,
        scientific_summary=(
            "Pristine basaltic caldera and expansive rugged lava fields where Apollo astronauts Neil Armstrong and Buzz Aldrin "
            "trained in lunar geology in 1965 and 1967. Superb analog for Lunar maria and basaltic Martian volcanic provinces."
        ),
        geological_context="Central volcanic caldera in the Northern Volcanic Zone of Iceland with fresh basaltic pahoehoe and aa lavas.",
        mean_slope_deg=16.8,
        roughness_std_m=22.0,
        peak_valley_relief_m=480.0,
        crater_or_structure_density=0.72,
        basalt_fraction=0.75,
        sulfates_evaporites=0.05,
        clays_phyllosilicates=0.02,
        iron_oxides=0.08,
        silica_regolith=0.10,
        carbonates=0.00,
        predominant_minerals=["Tholeiitic Basalt", "Olivine", "Pyroxene", "Volcanic Ash", "Palagonite"],
        aridity_index=0.75,
        uv_flux_index=0.55,
        thermal_amplitude_c=20.0,
        min_temp_c=-25.0,
        max_temp_c=15.0,
        annual_precip_mm=450.0,
        atm_pressure_kpa=87.5,
        primary_target_id="shackleton_crater_moon",
        operational_testing_roles=[
            "Apollo astronaut geological field training heritage",
            "Rover wheel traction on rough, abrasive basaltic aa lava",
            "LiDAR surface mapping of volcanic caldera collapses"
        ],
        key_advantages=[
            "Fresh basaltic composition mimicking lunar mare and Martian volcanic plains",
            "Proven Apollo lunar field testing history"
        ],
        unreplicable_gaps=[
            "Maritime arctic climate with frequent wet snow/rain",
            "Substantially lower UV flux than Moon or Mars"
        ]
    )
}

