window.PLANETARY_MISSION_DATA = {
  "metadata": {
    "title": "NASA Space Apps 2026 - Comprehensive Planetary Mission & Analog Explorer",
    "version": "2.0.0",
    "total_earth_analogs": 10,
    "total_mars_sites": 6,
    "total_moon_sites": 4,
    "bolivian_gems_count": 5
  },
  "earth_analogs": [
    {
      "id": "salar_de_uyuni",
      "name": "Salar de Uyuni",
      "country": "Bolivia",
      "region": "Potosí / Daniel Campos",
      "is_bolivian_gem": true,
      "coordinates": {
        "lat": -20.1338,
        "lng": -67.4891,
        "elevation_m": 3656.0
      },
      "scientific_summary": "The world's largest salt flat (10,582 km²). Hyper-flat polygonal halite crust overlying dense brine. Pristine planetary analog for ancient closed-basin evaporite deposits on Mars (such as Jezero Crater and Meridiani Planum) and the premier Earth target for satellite laser and radar altimeter calibration (ICESat, MOLA).",
      "geological_context": "Pleistocene paleolake basin (Lake Minchin / Tauca) transformed into pure evaporite sequences.",
      "gases_atmosphere": {
        "pressure_kpa": 65.2,
        "composition": "78% N2, 21% O2, 0.9% Ar, 0.04% CO2",
        "density_comparison": "Presión de 65.2 kPa (~45-65% del nivel del mar)."
      },
      "mineralogy": {
        "predominant": [
          "Halite (NaCl)",
          "Gypsum (CaSO4·2H2O)",
          "Lithium Chloride",
          "Ulexite/Borates",
          "Calcite"
        ],
        "composition_vector": {
          "basalto": 5.0,
          "sulfatos_evaporitas": 75.0,
          "arcillas": 5.0,
          "oxidos_hierro": 2.0,
          "silice_regolito": 8.0
        }
      },
      "climate_radiation": {
        "temp_min_c": -15.0,
        "temp_max_c": 20.0,
        "thermal_amplitude_c": 25.0,
        "uv_index": "96% (Índice UV extremo en alta altitud)",
        "aridity": "92%"
      },
      "surface_roughness": {
        "mean_slope_deg": 0.8,
        "roughness_std_m": 0.35,
        "peak_valley_relief_m": 1.2
      },
      "mission_equipment_needed": [
        "Surface LiDAR and radar altimetry calibration",
        "High-speed autonomous rover long-range transit",
        "Evaporite crust drill bit penetration and salt-clogging mitigation",
        "UV reflectance spectrometer calibration"
      ],
      "habitat_conditioning": [
        "Exceptional planarity mimicking Martian lake plains",
        "Extremely high solar UV flux due to 3,656m elevation and thin air",
        "Direct mineralogical analog for Mars Jezero saline residual phase"
      ],
      "gap_analysis": [
        "Higher atmospheric pressure (65 kPa vs Mars 0.6 kPa)",
        "Earth gravity (1.0g vs Mars 0.38g)",
        "Seasonal shallow water film during rainy season (Dec-Feb)"
      ],
      "target_similarity_scores": {
        "jezero_crater": {
          "overall_psi": 75.0,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 85.6,
            "mineralogy": 61.1,
            "environment": 78.8
          }
        },
        "gale_crater": {
          "overall_psi": 69.9,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 70.7,
            "mineralogy": 61.0,
            "environment": 79.4
          }
        },
        "meridiani_planum": {
          "overall_psi": 78.8,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 92.9,
            "mineralogy": 64.8,
            "environment": 78.8
          }
        },
        "gusev_crater": {
          "overall_psi": 74.6,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 83.5,
            "mineralogy": 63.4,
            "environment": 77.3
          }
        },
        "valles_marineris": {
          "overall_psi": 58.9,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 39.8,
            "mineralogy": 61.0,
            "environment": 78.8
          }
        },
        "arcadia_planitia": {
          "overall_psi": 70.2,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 93.2,
            "mineralogy": 40.8,
            "environment": 77.7
          }
        },
        "shackleton_crater": {
          "overall_psi": 39.3,
          "match_tier": "Tier 4: Low Similarity",
          "subscores": {
            "topography": 29.6,
            "mineralogy": 18.4,
            "environment": 75.0
          }
        },
        "tranquility_base": {
          "overall_psi": 57.5,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 80.7,
            "mineralogy": 19.3,
            "environment": 75.0
          }
        },
        "taurus_littrow": {
          "overall_psi": 49.3,
          "match_tier": "Tier 4: Low Similarity",
          "subscores": {
            "topography": 51.4,
            "mineralogy": 25.1,
            "environment": 75.0
          }
        },
        "marius_hills": {
          "overall_psi": 55.9,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 59.4,
            "mineralogy": 19.3,
            "environment": 94.7
          }
        }
      },
      "top_matching_destinations": [
        {
          "target_id": "meridiani_planum",
          "overall_psi": 78.8
        },
        {
          "target_id": "jezero_crater",
          "overall_psi": 75.0
        },
        {
          "target_id": "gusev_crater",
          "overall_psi": 74.6
        },
        {
          "target_id": "arcadia_planitia",
          "overall_psi": 70.2
        }
      ]
    },
    {
      "id": "laguna_colorada",
      "name": "Laguna Colorada (Eduardo Abaroa Reserve)",
      "country": "Bolivia",
      "region": "Potosí / Sud Lípez",
      "is_bolivian_gem": true,
      "coordinates": {
        "lat": -22.2031,
        "lng": -67.7739,
        "elevation_m": 4278.0
      },
      "scientific_summary": "Shallow hypersaline high-altitude volcanic lake characterized by blood-red pigmentation caused by extremophilic microalgae and Archaea surviving under lethal UV radiation, sub-zero temperatures, and toxic borax/arsenic brines. Foremost astrobiological analog for ancient Martian warm-spring lacustrine environments and biosignature preservation.",
      "geological_context": "Volcanically fed closed-basin saline lake enriched in borates, sulfates, and volcanic ashes.",
      "gases_atmosphere": {
        "pressure_kpa": 60.5,
        "composition": "78% N2, 21% O2, 0.9% Ar, 0.04% CO2",
        "density_comparison": "Presión de 60.5 kPa (~45-65% del nivel del mar)."
      },
      "mineralogy": {
        "predominant": [
          "Borax",
          "Gypsum",
          "Halite",
          "Sodium Sulfate",
          "Volcanic Ash (Andesite)"
        ],
        "composition_vector": {
          "basalto": 15.0,
          "sulfatos_evaporitas": 55.0,
          "arcillas": 10.0,
          "oxidos_hierro": 8.0,
          "silice_regolito": 7.0
        }
      },
      "climate_radiation": {
        "temp_min_c": -20.0,
        "temp_max_c": 16.0,
        "thermal_amplitude_c": 30.0,
        "uv_index": "99% (Índice UV extremo en alta altitud)",
        "aridity": "88%"
      },
      "surface_roughness": {
        "mean_slope_deg": 3.2,
        "roughness_std_m": 2.1,
        "peak_valley_relief_m": 85.0
      },
      "mission_equipment_needed": [
        "Astrobiological biosignature detection (Raman and fluorescence spectrometers)",
        "Brine sampling and micro-fluidic life detection instruments",
        "Corrosion-resistant amphibious chassis seals",
        "Extreme UV radiation sensor calibration"
      ],
      "habitat_conditioning": [
        "Active polyextremophile community in Mars-analog chemical brines",
        "Lethal UV-B/UV-C flux matching Martian surface radiation proxies",
        "Borate and sulfate crystal structures known to stabilize prebiotic RNA molecules"
      ],
      "gap_analysis": [
        "Terrestrial oxygenated atmosphere",
        "Higher thermal floor than modern Mars (-20°C vs -90°C)",
        "Avian biosphere presence (flamingos) which must be excluded during testing"
      ],
      "target_similarity_scores": {
        "jezero_crater": {
          "overall_psi": 83.1,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 92.6,
            "mineralogy": 77.7,
            "environment": 78.4
          }
        },
        "gale_crater": {
          "overall_psi": 78.7,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 79.7,
            "mineralogy": 77.5,
            "environment": 78.9
          }
        },
        "meridiani_planum": {
          "overall_psi": 85.2,
          "match_tier": "Tier 1: Exceptional Analog (Direct Mission Qualification)",
          "subscores": {
            "topography": 96.5,
            "mineralogy": 79.9,
            "environment": 78.4
          }
        },
        "gusev_crater": {
          "overall_psi": 82.0,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 91.1,
            "mineralogy": 77.8,
            "environment": 76.5
          }
        },
        "valles_marineris": {
          "overall_psi": 67.2,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 47.4,
            "mineralogy": 77.5,
            "environment": 78.4
          }
        },
        "arcadia_planitia": {
          "overall_psi": 77.3,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 96.3,
            "mineralogy": 58.5,
            "environment": 77.0
          }
        },
        "shackleton_crater": {
          "overall_psi": 44.3,
          "match_tier": "Tier 4: Low Similarity",
          "subscores": {
            "topography": 37.4,
            "mineralogy": 25.2,
            "environment": 74.8
          }
        },
        "tranquility_base": {
          "overall_psi": 65.0,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 85.0,
            "mineralogy": 36.5,
            "environment": 74.8
          }
        },
        "taurus_littrow": {
          "overall_psi": 56.4,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 60.8,
            "mineralogy": 36.4,
            "environment": 74.8
          }
        },
        "marius_hills": {
          "overall_psi": 64.2,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 68.4,
            "mineralogy": 35.6,
            "environment": 92.4
          }
        }
      },
      "top_matching_destinations": [
        {
          "target_id": "meridiani_planum",
          "overall_psi": 85.2
        },
        {
          "target_id": "jezero_crater",
          "overall_psi": 83.1
        },
        {
          "target_id": "gusev_crater",
          "overall_psi": 82.0
        },
        {
          "target_id": "gale_crater",
          "overall_psi": 78.7
        }
      ]
    },
    {
      "id": "sol_de_manana",
      "name": "Sol de Mañana Geothermal Field",
      "country": "Bolivia",
      "region": "Potosí / Sud Lípez",
      "is_bolivian_gem": true,
      "coordinates": {
        "lat": -22.4358,
        "lng": -67.7917,
        "elevation_m": 4850.0
      },
      "scientific_summary": "High-energy geothermal field situated at nearly 5,000 meters elevation. Features boiling mud pools, pressurized steam fumaroles emitting sulfurous vapors, and acidic hydrothermal alteration minerals. Direct analog for early Mars hydrothermal systems, Gusev Crater 'Home Plate' silica sinter deposits, and Io's sulfur volcanism.",
      "geological_context": "Pleistocene to Holocene volcanic geothermal field with intense solfataric and sulfur mineral precipitation.",
      "gases_atmosphere": {
        "pressure_kpa": 56.0,
        "composition": "78% N2, 21% O2, 0.9% Ar, 0.04% CO2",
        "density_comparison": "Presión de 56.0 kPa (~45-65% del nivel del mar)."
      },
      "mineralogy": {
        "predominant": [
          "Elemental Sulfur",
          "Opaline Silica",
          "Alunite",
          "Pyrite",
          "Jarosite"
        ],
        "composition_vector": {
          "basalto": 30.0,
          "sulfatos_evaporitas": 35.0,
          "arcillas": 15.0,
          "oxidos_hierro": 12.0,
          "silice_regolito": 8.0
        }
      },
      "climate_radiation": {
        "temp_min_c": -25.0,
        "temp_max_c": 14.0,
        "thermal_amplitude_c": 35.0,
        "uv_index": "98% (Índice UV extremo en alta altitud)",
        "aridity": "85%"
      },
      "surface_roughness": {
        "mean_slope_deg": 9.5,
        "roughness_std_m": 12.4,
        "peak_valley_relief_m": 240.0
      },
      "mission_equipment_needed": [
        "High-temperature hydrothermal vent sensor testing",
        "Drill bit testing in boiling acid mud and sulfur encrustations",
        "Gas chromatograph and mass spectrometer volcanic emission sniffing",
        "Autonomous hazard avoidance in steaming, low-visibility conditions"
      ],
      "habitat_conditioning": [
        "Active sulfurous hydrothermal venting at extreme elevation",
        "Presence of Jarosite and opaline silica identical to Martian discoveries by Opportunity and Spirit",
        "Extremely low atmospheric pressure amplifying vapor plume dynamics"
      ],
      "gap_analysis": [
        "Presence of liquid water and active steam vents (modern Mars has no active liquid surface geysers)",
        "Earth atmospheric oxygen and 1.0g gravity"
      ],
      "target_similarity_scores": {
        "jezero_crater": {
          "overall_psi": 90.9,
          "match_tier": "Tier 1: Exceptional Analog (Direct Mission Qualification)",
          "subscores": {
            "topography": 98.2,
            "mineralogy": 92.8,
            "environment": 80.1
          }
        },
        "gale_crater": {
          "overall_psi": 91.9,
          "match_tier": "Tier 1: Exceptional Analog (Direct Mission Qualification)",
          "subscores": {
            "topography": 98.8,
            "mineralogy": 94.7,
            "environment": 80.7
          }
        },
        "meridiani_planum": {
          "overall_psi": 88.0,
          "match_tier": "Tier 1: Exceptional Analog (Direct Mission Qualification)",
          "subscores": {
            "topography": 88.5,
            "mineralogy": 94.3,
            "environment": 80.1
          }
        },
        "gusev_crater": {
          "overall_psi": 90.2,
          "match_tier": "Tier 1: Exceptional Analog (Direct Mission Qualification)",
          "subscores": {
            "topography": 99.0,
            "mineralogy": 91.7,
            "environment": 78.0
          }
        },
        "valles_marineris": {
          "overall_psi": 81.3,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 69.1,
            "mineralogy": 94.7,
            "environment": 80.1
          }
        },
        "arcadia_planitia": {
          "overall_psi": 82.5,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 86.5,
            "mineralogy": 81.9,
            "environment": 78.5
          }
        },
        "shackleton_crater": {
          "overall_psi": 57.7,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 66.8,
            "mineralogy": 34.3,
            "environment": 74.4
          }
        },
        "tranquility_base": {
          "overall_psi": 73.5,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 83.5,
            "mineralogy": 62.7,
            "environment": 74.4
          }
        },
        "taurus_littrow": {
          "overall_psi": 71.3,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 88.0,
            "mineralogy": 51.8,
            "environment": 74.4
          }
        },
        "marius_hills": {
          "overall_psi": 80.4,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 91.4,
            "mineralogy": 61.2,
            "environment": 90.0
          }
        }
      },
      "top_matching_destinations": [
        {
          "target_id": "gale_crater",
          "overall_psi": 91.9
        },
        {
          "target_id": "jezero_crater",
          "overall_psi": 90.9
        },
        {
          "target_id": "gusev_crater",
          "overall_psi": 90.2
        },
        {
          "target_id": "meridiani_planum",
          "overall_psi": 88.0
        }
      ]
    },
    {
      "id": "nevado_sajama",
      "name": "Nevado Sajama & Volcanic Domes",
      "country": "Bolivia",
      "region": "Oruro / Sajama National Park",
      "is_bolivian_gem": true,
      "coordinates": {
        "lat": -18.1083,
        "lng": -68.8833,
        "elevation_m": 6542.0
      },
      "scientific_summary": "Bolivia's highest stratovolcano surrounded by volcanic lava domes, high-altitude permafrost, and blocky andesitic scree. At altitudes between 4,200m and 6,542m, atmospheric density drops to 45%-55% of sea level, making it the premier global testbed for Martian rotorcraft aerodynamics (Ingenuity drone successors) and cryogenic high-slope lunar/Martian rover climbing.",
      "geological_context": "Extinct Pleistocene composite andesitic stratovolcano with parasitic rhyodacite lava domes and cryoturbation.",
      "gases_atmosphere": {
        "pressure_kpa": 46.5,
        "composition": "78% N2, 21% O2, 0.9% Ar, 0.04% CO2",
        "density_comparison": "Presión de 46.5 kPa (~45-65% del nivel del mar)."
      },
      "mineralogy": {
        "predominant": [
          "Andesite",
          "Pyroxene",
          "Plagioclase Feldspar",
          "Magnetite",
          "Volcanic Glass"
        ],
        "composition_vector": {
          "basalto": 55.0,
          "sulfatos_evaporitas": 5.0,
          "arcillas": 5.0,
          "oxidos_hierro": 15.0,
          "silice_regolito": 20.0
        }
      },
      "climate_radiation": {
        "temp_min_c": -30.0,
        "temp_max_c": 8.0,
        "thermal_amplitude_c": 28.0,
        "uv_index": "99% (Índice UV extremo en alta altitud)",
        "aridity": "89%"
      },
      "surface_roughness": {
        "mean_slope_deg": 24.5,
        "roughness_std_m": 28.0,
        "peak_valley_relief_m": 2300.0
      },
      "mission_equipment_needed": [
        "Thin-atmosphere aerodynamic rotorcraft flight validation (Mars helicopter/Ingenuity)",
        "Steep-slope rover climbing, wheel slip, and tethered rappelling systems",
        "Cryogenic permafrost ice-core drilling",
        "LiDAR terrain relative navigation over sharp volcanic relief"
      ],
      "habitat_conditioning": [
        "Critical atmospheric thinning (~46 kPa) testing rotor blade aerodynamics",
        "Steep blocky talus slopes matching Moon Shackleton Crater rim slopes (>25°)",
        "Cryogenic permafrost and permanent summit ice mimic polar volatile traps"
      ],
      "gap_analysis": [
        "Atmosphere is still ~70x denser than Mars surface (~0.6 kPa) despite being ultra-thin for Earth",
        "Gravity is 1.0g (vs Moon 0.16g and Mars 0.38g)"
      ],
      "target_similarity_scores": {
        "jezero_crater": {
          "overall_psi": 65.9,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 40.3,
            "mineralogy": 72.9,
            "environment": 87.6
          }
        },
        "gale_crater": {
          "overall_psi": 71.5,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 54.7,
            "mineralogy": 74.0,
            "environment": 88.2
          }
        },
        "meridiani_planum": {
          "overall_psi": 64.0,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 29.0,
            "mineralogy": 78.8,
            "environment": 87.6
          }
        },
        "gusev_crater": {
          "overall_psi": 69.4,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 42.6,
            "mineralogy": 82.0,
            "environment": 86.0
          }
        },
        "valles_marineris": {
          "overall_psi": 80.1,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 79.8,
            "mineralogy": 74.0,
            "environment": 87.6
          }
        },
        "arcadia_planitia": {
          "overall_psi": 66.9,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 27.6,
            "mineralogy": 89.6,
            "environment": 86.4
          }
        },
        "shackleton_crater": {
          "overall_psi": 74.2,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 88.8,
            "mineralogy": 50.7,
            "environment": 84.6
          }
        },
        "tranquility_base": {
          "overall_psi": 70.7,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 34.5,
            "mineralogy": 94.9,
            "environment": 84.6
          }
        },
        "taurus_littrow": {
          "overall_psi": 72.6,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 64.6,
            "mineralogy": 70.3,
            "environment": 84.6
          }
        },
        "marius_hills": {
          "overall_psi": 82.7,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 58.1,
            "mineralogy": 92.5,
            "environment": 100.0
          }
        }
      },
      "top_matching_destinations": [
        {
          "target_id": "marius_hills",
          "overall_psi": 82.7
        },
        {
          "target_id": "valles_marineris",
          "overall_psi": 80.1
        },
        {
          "target_id": "shackleton_crater",
          "overall_psi": 74.2
        },
        {
          "target_id": "taurus_littrow",
          "overall_psi": 72.6
        }
      ]
    },
    {
      "id": "valle_de_la_luna_bolivia",
      "name": "Valle de la Luna (Valley of the Moon)",
      "country": "Bolivia",
      "region": "La Paz / Pedro Domingo Murillo",
      "is_bolivian_gem": true,
      "coordinates": {
        "lat": -16.5683,
        "lng": -68.0967,
        "elevation_m": 3400.0
      },
      "scientific_summary": "A labyrinth of dramatic spires, hoodoos, deep erosion gullies, and clay badlands formed by intense water and wind erosion of clay-rich sedimentary deposits. Striking morphological match for Martian yardangs, weathered delta scarps, and fractured clay deposits in Mawrth Vallis and Jezero.",
      "geological_context": "Intensely eroded clay, siltstone, and sandstone lacustrine sediments from ancestral glacial lake outflows.",
      "gases_atmosphere": {
        "pressure_kpa": 68.0,
        "composition": "78% N2, 21% O2, 0.9% Ar, 0.04% CO2",
        "density_comparison": "Presión de 68.0 kPa (~45-65% del nivel del mar)."
      },
      "mineralogy": {
        "predominant": [
          "Smectite Clay",
          "Illite",
          "Quartz Silt",
          "Iron Hydroxides",
          "Calcite"
        ],
        "composition_vector": {
          "basalto": 10.0,
          "sulfatos_evaporitas": 15.0,
          "arcillas": 55.0,
          "oxidos_hierro": 12.0,
          "silice_regolito": 8.0
        }
      },
      "climate_radiation": {
        "temp_min_c": -4.0,
        "temp_max_c": 21.0,
        "thermal_amplitude_c": 22.0,
        "uv_index": "92% (Índice UV extremo en alta altitud)",
        "aridity": "82%"
      },
      "surface_roughness": {
        "mean_slope_deg": 18.5,
        "roughness_std_m": 14.0,
        "peak_valley_relief_m": 120.0
      },
      "mission_equipment_needed": [
        "Autonomous SLAM navigation and visual odometry in GPS-denied labyrinthine canyon corridors",
        "Clay mechanical adhesion testing on rover chassis and wheels",
        "Scarp stability and landslide hazard prediction",
        "Robotic arm sampling of soft phyllosilicate stratigraphy"
      ],
      "habitat_conditioning": [
        "High clay content simulating phyllosilicate-bearing layered Martian terrains",
        "Complex 3D vertical relief testing line-of-sight communications and antenna positioning",
        "Close logistical proximity to urban infrastructure for rapid hackathon / university field validation"
      ],
      "gap_analysis": [
        "Formed by rainfall runoff rather than aeolian and paleolake processes alone",
        "Vegetation presence in adjacent valleys"
      ],
      "target_similarity_scores": {
        "jezero_crater": {
          "overall_psi": 75.8,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 85.9,
            "mineralogy": 71.0,
            "environment": 69.7
          }
        },
        "gale_crater": {
          "overall_psi": 79.1,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 93.9,
            "mineralogy": 72.1,
            "environment": 70.2
          }
        },
        "meridiani_planum": {
          "overall_psi": 63.7,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 72.2,
            "mineralogy": 50.2,
            "environment": 69.7
          }
        },
        "gusev_crater": {
          "overall_psi": 69.0,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 88.2,
            "mineralogy": 50.3,
            "environment": 68.4
          }
        },
        "valles_marineris": {
          "overall_psi": 73.5,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 78.2,
            "mineralogy": 72.1,
            "environment": 69.7
          }
        },
        "arcadia_planitia": {
          "overall_psi": 61.7,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 69.9,
            "mineralogy": 47.5,
            "environment": 68.7
          }
        },
        "shackleton_crater": {
          "overall_psi": 55.2,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 77.5,
            "mineralogy": 25.1,
            "environment": 64.4
          }
        },
        "tranquility_base": {
          "overall_psi": 53.1,
          "match_tier": "Tier 4: Low Similarity",
          "subscores": {
            "topography": 64.7,
            "mineralogy": 31.9,
            "environment": 64.4
          }
        },
        "taurus_littrow": {
          "overall_psi": 61.5,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 85.8,
            "mineralogy": 34.8,
            "environment": 64.4
          }
        },
        "marius_hills": {
          "overall_psi": 65.8,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 84.5,
            "mineralogy": 30.4,
            "environment": 85.2
          }
        }
      },
      "top_matching_destinations": [
        {
          "target_id": "gale_crater",
          "overall_psi": 79.1
        },
        {
          "target_id": "jezero_crater",
          "overall_psi": 75.8
        },
        {
          "target_id": "valles_marineris",
          "overall_psi": 73.5
        },
        {
          "target_id": "gusev_crater",
          "overall_psi": 69.0
        }
      ]
    },
    {
      "id": "atacama_yungay",
      "name": "Atacama Desert (Yungay Core)",
      "country": "Chile",
      "region": "Antofagasta",
      "is_bolivian_gem": false,
      "coordinates": {
        "lat": -24.0833,
        "lng": -69.8667,
        "elevation_m": 960.0
      },
      "scientific_summary": "The oldest and driest non-polar desert on Earth. Recognized by NASA as the definitive Martian dry limit for soil biology. Pliocene nitrate and perchlorate salt deposits mirror the chemical signatures discovered by the Phoenix and Curiosity landers.",
      "geological_context": "Hyper-arid rain shadow desert basin between Coastal Cordillera and Andes with nitrate deposits.",
      "gases_atmosphere": {
        "pressure_kpa": 90.5,
        "composition": "78% N2, 21% O2, 0.9% Ar, 0.04% CO2",
        "density_comparison": "Presión de 90.5 kPa (nivel estándar)."
      },
      "mineralogy": {
        "predominant": [
          "Nitratine",
          "Halite",
          "Gypsum",
          "Perchlorates",
          "Anhydrite"
        ],
        "composition_vector": {
          "basalto": 25.0,
          "sulfatos_evaporitas": 45.0,
          "arcillas": 10.0,
          "oxidos_hierro": 12.0,
          "silice_regolito": 8.0
        }
      },
      "climate_radiation": {
        "temp_min_c": 2.0,
        "temp_max_c": 36.0,
        "thermal_amplitude_c": 26.0,
        "uv_index": "93% (Índice UV extremo en alta altitud)",
        "aridity": "99%"
      },
      "surface_roughness": {
        "mean_slope_deg": 4.5,
        "roughness_std_m": 4.2,
        "peak_valley_relief_m": 45.0
      },
      "mission_equipment_needed": [
        "Hyper-arid soil habitability assays",
        "Deep sub-surface life-detection drill testing (NASA IceBreaker)",
        "Perchlorate chemical neutralization sensors"
      ],
      "habitat_conditioning": [
        "Extreme dryness for millions of years creating accurate Mars soil chemistry",
        "Decades of NASA field mission heritage"
      ],
      "gap_analysis": [
        "Sea-level ambient pressure is high (~90 kPa)",
        "Warm daytime temperatures"
      ],
      "target_similarity_scores": {
        "jezero_crater": {
          "overall_psi": 86.9,
          "match_tier": "Tier 1: Exceptional Analog (Direct Mission Qualification)",
          "subscores": {
            "topography": 93.7,
            "mineralogy": 86.1,
            "environment": 79.8
          }
        },
        "gale_crater": {
          "overall_psi": 83.7,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 82.9,
            "mineralogy": 87.5,
            "environment": 80.3
          }
        },
        "meridiani_planum": {
          "overall_psi": 88.9,
          "match_tier": "Tier 1: Exceptional Analog (Direct Mission Qualification)",
          "subscores": {
            "topography": 94.7,
            "mineralogy": 90.8,
            "environment": 79.8
          }
        },
        "gusev_crater": {
          "overall_psi": 86.8,
          "match_tier": "Tier 1: Exceptional Analog (Direct Mission Qualification)",
          "subscores": {
            "topography": 92.6,
            "mineralogy": 88.4,
            "environment": 78.2
          }
        },
        "valles_marineris": {
          "overall_psi": 71.9,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 49.5,
            "mineralogy": 87.5,
            "environment": 79.8
          }
        },
        "arcadia_planitia": {
          "overall_psi": 82.0,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 94.0,
            "mineralogy": 72.9,
            "environment": 78.6
          }
        },
        "shackleton_crater": {
          "overall_psi": 47.2,
          "match_tier": "Tier 4: Low Similarity",
          "subscores": {
            "topography": 40.1,
            "mineralogy": 31.1,
            "environment": 74.1
          }
        },
        "tranquility_base": {
          "overall_psi": 70.0,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 83.6,
            "mineralogy": 52.7,
            "environment": 74.1
          }
        },
        "taurus_littrow": {
          "overall_psi": 60.8,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 64.3,
            "mineralogy": 46.0,
            "environment": 74.1
          }
        },
        "marius_hills": {
          "overall_psi": 71.0,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 71.5,
            "mineralogy": 51.3,
            "environment": 93.4
          }
        }
      },
      "top_matching_destinations": [
        {
          "target_id": "meridiani_planum",
          "overall_psi": 88.9
        },
        {
          "target_id": "jezero_crater",
          "overall_psi": 86.9
        },
        {
          "target_id": "gusev_crater",
          "overall_psi": 86.8
        },
        {
          "target_id": "gale_crater",
          "overall_psi": 83.7
        }
      ]
    },
    {
      "id": "mcmurdo_dry_valleys",
      "name": "McMurdo Dry Valleys (University Valley)",
      "country": "Antarctica",
      "region": "Victoria Land",
      "is_bolivian_gem": false,
      "coordinates": {
        "lat": -77.8667,
        "lng": 160.6667,
        "elevation_m": 1650.0
      },
      "scientific_summary": "Cold desert with hyper-arid permafrost, sub-zero mean annual temperatures (-20°C to -40°C), and katabatic gale winds. Prime analog for dry cryogenic ground ice and polygon terrain on the Martian high latitudes.",
      "geological_context": "Glacially carved valley devoid of snow cover due to katabatic winds and hyper-arid sublimation.",
      "gases_atmosphere": {
        "pressure_kpa": 81.0,
        "composition": "78% N2, 21% O2, 0.9% Ar, 0.04% CO2",
        "density_comparison": "Presión de 81.0 kPa (nivel estándar)."
      },
      "mineralogy": {
        "predominant": [
          "Dry Permafrost Ice",
          "Quartz Sand",
          "Dolerite",
          "Halite",
          "Gypsum"
        ],
        "composition_vector": {
          "basalto": 35.0,
          "sulfatos_evaporitas": 20.0,
          "arcillas": 5.0,
          "oxidos_hierro": 10.0,
          "silice_regolito": 30.0
        }
      },
      "climate_radiation": {
        "temp_min_c": -55.0,
        "temp_max_c": 5.0,
        "thermal_amplitude_c": 45.0,
        "uv_index": "75% (Índice UV extremo en alta altitud)",
        "aridity": "98%"
      },
      "surface_roughness": {
        "mean_slope_deg": 14.0,
        "roughness_std_m": 18.0,
        "peak_valley_relief_m": 650.0
      },
      "mission_equipment_needed": [
        "Cryogenic ground ice drilling and core sample curation",
        "Low-temperature battery and electronics survivability tests",
        "Polygonal permafrost thermal contraction cracking models"
      ],
      "habitat_conditioning": [
        "Sub-zero mean annual temperature combined with hyper-aridity",
        "Dry permafrost identical to Phoenix Mars landing site"
      ],
      "gap_analysis": [
        "Extreme logistics and Antarctic Treaty environmental restrictions",
        "Earth atmospheric pressure and gravity"
      ],
      "target_similarity_scores": {
        "jezero_crater": {
          "overall_psi": 81.0,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 86.3,
            "mineralogy": 77.1,
            "environment": 79.3
          }
        },
        "gale_crater": {
          "overall_psi": 84.9,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 95.7,
            "mineralogy": 78.3,
            "environment": 80.1
          }
        },
        "meridiani_planum": {
          "overall_psi": 78.1,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 71.7,
            "mineralogy": 83.4,
            "environment": 79.3
          }
        },
        "gusev_crater": {
          "overall_psi": 86.6,
          "match_tier": "Tier 1: Exceptional Analog (Direct Mission Qualification)",
          "subscores": {
            "topography": 88.4,
            "mineralogy": 93.3,
            "environment": 76.7
          }
        },
        "valles_marineris": {
          "overall_psi": 78.7,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 78.5,
            "mineralogy": 78.3,
            "environment": 79.3
          }
        },
        "arcadia_planitia": {
          "overall_psi": 76.8,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 69.4,
            "mineralogy": 83.7,
            "environment": 77.4
          }
        },
        "shackleton_crater": {
          "overall_psi": 69.2,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 78.6,
            "mineralogy": 67.3,
            "environment": 60.6
          }
        },
        "tranquility_base": {
          "overall_psi": 71.8,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 69.1,
            "mineralogy": 84.1,
            "environment": 60.6
          }
        },
        "taurus_littrow": {
          "overall_psi": 78.6,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 91.0,
            "mineralogy": 81.7,
            "environment": 60.6
          }
        },
        "marius_hills": {
          "overall_psi": 82.2,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 90.0,
            "mineralogy": 83.0,
            "environment": 72.0
          }
        }
      },
      "top_matching_destinations": [
        {
          "target_id": "gusev_crater",
          "overall_psi": 86.6
        },
        {
          "target_id": "gale_crater",
          "overall_psi": 84.9
        },
        {
          "target_id": "marius_hills",
          "overall_psi": 82.2
        },
        {
          "target_id": "jezero_crater",
          "overall_psi": 81.0
        }
      ]
    },
    {
      "id": "haughton_crater",
      "name": "Haughton Impact Crater (Devon Island)",
      "country": "Canada",
      "region": "Nunavut / Arctic",
      "is_bolivian_gem": false,
      "coordinates": {
        "lat": 75.3833,
        "lng": -89.6833,
        "elevation_m": 200.0
      },
      "scientific_summary": "A 23-km diameter meteorite impact crater in the polar desert of Devon Island. Site of NASA's Haughton-Mars Project (HMP). Features shatter cones, impact melt breccias, paleolake deposits, and gullies formed under cold climatic regimes.",
      "geological_context": "Eocene complex meteorite impact crater excavated into Paleozoic sedimentary rocks in permafrost terrain.",
      "gases_atmosphere": {
        "pressure_kpa": 100.2,
        "composition": "78% N2, 21% O2, 0.9% Ar, 0.04% CO2",
        "density_comparison": "Presión de 100.2 kPa (nivel estándar)."
      },
      "mineralogy": {
        "predominant": [
          "Impact Melt Breccia",
          "Dolomite",
          "Gypsum",
          "Quartz Shatter Cones"
        ],
        "composition_vector": {
          "basalto": 15.0,
          "sulfatos_evaporitas": 25.0,
          "arcillas": 20.0,
          "oxidos_hierro": 5.0,
          "silice_regolito": 30.0
        }
      },
      "climate_radiation": {
        "temp_min_c": -45.0,
        "temp_max_c": 12.0,
        "thermal_amplitude_c": 35.0,
        "uv_index": "60% (Índice UV extremo en alta altitud)",
        "aridity": "89%"
      },
      "surface_roughness": {
        "mean_slope_deg": 12.5,
        "roughness_std_m": 15.5,
        "peak_valley_relief_m": 220.0
      },
      "mission_equipment_needed": [
        "Impact crater rim navigation and traverse planning",
        "Pressurized rover field trials and extravehicular activity (EVA) suit ergonomics",
        "Subsurface sounding radar tests on impact structures"
      ],
      "habitat_conditioning": [
        "Real complex impact crater morphology with central uplift and ejecta blanket",
        "Arctic cold desert weathering processes"
      ],
      "gap_analysis": [
        "Sea-level atmospheric pressure and standard Earth gravity",
        "Short seasonal testing window (summer only)"
      ],
      "target_similarity_scores": {
        "jezero_crater": {
          "overall_psi": 76.2,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 91.0,
            "mineralogy": 77.3,
            "environment": 57.7
          }
        },
        "gale_crater": {
          "overall_psi": 78.4,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 97.1,
            "mineralogy": 76.9,
            "environment": 58.3
          }
        },
        "meridiani_planum": {
          "overall_psi": 69.5,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 77.9,
            "mineralogy": 71.2,
            "environment": 57.7
          }
        },
        "gusev_crater": {
          "overall_psi": 77.6,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 92.7,
            "mineralogy": 81.4,
            "environment": 55.6
          }
        },
        "valles_marineris": {
          "overall_psi": 70.2,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 74.2,
            "mineralogy": 76.9,
            "environment": 57.7
          }
        },
        "arcadia_planitia": {
          "overall_psi": 66.0,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 75.6,
            "mineralogy": 64.9,
            "environment": 56.1
          }
        },
        "shackleton_crater": {
          "overall_psi": 63.5,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 78.0,
            "mineralogy": 65.8,
            "environment": 43.9
          }
        },
        "tranquility_base": {
          "overall_psi": 61.5,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 78.9,
            "mineralogy": 59.1,
            "environment": 43.9
          }
        },
        "taurus_littrow": {
          "overall_psi": 72.1,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 94.5,
            "mineralogy": 74.0,
            "environment": 43.9
          }
        },
        "marius_hills": {
          "overall_psi": 71.8,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 95.2,
            "mineralogy": 58.8,
            "environment": 59.5
          }
        }
      },
      "top_matching_destinations": [
        {
          "target_id": "gale_crater",
          "overall_psi": 78.4
        },
        {
          "target_id": "gusev_crater",
          "overall_psi": 77.6
        },
        {
          "target_id": "jezero_crater",
          "overall_psi": 76.2
        },
        {
          "target_id": "taurus_littrow",
          "overall_psi": 72.1
        }
      ]
    },
    {
      "id": "rio_tinto",
      "name": "Río Tinto Acidic River",
      "country": "Spain",
      "region": "Andalusia / Huelva",
      "is_bolivian_gem": false,
      "coordinates": {
        "lat": 37.6975,
        "lng": -6.5647,
        "elevation_m": 320.0
      },
      "scientific_summary": "Hyper-acidic (pH ~1.7 to 2.5) river containing high concentrations of ferric iron and sulfates. Famous for vast deposits of jarosite and hematite ('blueberries'), mirroring Opportunity's discoveries at Meridiani Planum.",
      "geological_context": "Iberian Pyrite Belt massive sulfide deposits subjected to chemolithotrophic bio-oxidation.",
      "gases_atmosphere": {
        "pressure_kpa": 97.5,
        "composition": "78% N2, 21% O2, 0.9% Ar, 0.04% CO2",
        "density_comparison": "Presión de 97.5 kPa (nivel estándar)."
      },
      "mineralogy": {
        "predominant": [
          "Jarosite",
          "Goethite",
          "Hematite",
          "Copiapite",
          "Pyrite"
        ],
        "composition_vector": {
          "basalto": 10.0,
          "sulfatos_evaporitas": 40.0,
          "arcillas": 10.0,
          "oxidos_hierro": 35.0,
          "silice_regolito": 5.0
        }
      },
      "climate_radiation": {
        "temp_min_c": 4.0,
        "temp_max_c": 38.0,
        "thermal_amplitude_c": 18.0,
        "uv_index": "78% (Índice UV extremo en alta altitud)",
        "aridity": "60%"
      },
      "surface_roughness": {
        "mean_slope_deg": 6.0,
        "roughness_std_m": 5.0,
        "peak_valley_relief_m": 60.0
      },
      "mission_equipment_needed": [
        "Iron-sulfate spectroscopy signature identification",
        "Chemolithotrophic subsurface biosignature detection",
        "Acid-resistant robotic coating and seal tests"
      ],
      "habitat_conditioning": [
        "Exact mineralogical analog for Martian jarosite and hematite deposits",
        "Chemoautotrophic iron/sulfur metabolic ecosystem"
      ],
      "gap_analysis": [
        "Temperate Mediterranean climate with high rainfall",
        "Abundant surface liquid water"
      ],
      "target_similarity_scores": {
        "jezero_crater": {
          "overall_psi": 71.0,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 91.7,
            "mineralogy": 75.1,
            "environment": 42.0
          }
        },
        "gale_crater": {
          "overall_psi": 68.3,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 82.5,
            "mineralogy": 76.2,
            "environment": 42.4
          }
        },
        "meridiani_planum": {
          "overall_psi": 71.7,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 90.7,
            "mineralogy": 78.1,
            "environment": 42.0
          }
        },
        "gusev_crater": {
          "overall_psi": 70.5,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 91.0,
            "mineralogy": 75.4,
            "environment": 40.8
          }
        },
        "valles_marineris": {
          "overall_psi": 56.6,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 49.5,
            "mineralogy": 76.2,
            "environment": 42.0
          }
        },
        "arcadia_planitia": {
          "overall_psi": 63.0,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 89.7,
            "mineralogy": 55.0,
            "environment": 41.1
          }
        },
        "shackleton_crater": {
          "overall_psi": 32.2,
          "match_tier": "Tier 4: Low Similarity",
          "subscores": {
            "topography": 41.1,
            "mineralogy": 23.6,
            "environment": 31.8
          }
        },
        "tranquility_base": {
          "overall_psi": 50.7,
          "match_tier": "Tier 4: Low Similarity",
          "subscores": {
            "topography": 80.9,
            "mineralogy": 36.7,
            "environment": 31.8
          }
        },
        "taurus_littrow": {
          "overall_psi": 44.8,
          "match_tier": "Tier 4: Low Similarity",
          "subscores": {
            "topography": 65.4,
            "mineralogy": 35.4,
            "environment": 31.8
          }
        },
        "marius_hills": {
          "overall_psi": 52.4,
          "match_tier": "Tier 4: Low Similarity",
          "subscores": {
            "topography": 72.1,
            "mineralogy": 31.5,
            "environment": 53.9
          }
        }
      },
      "top_matching_destinations": [
        {
          "target_id": "meridiani_planum",
          "overall_psi": 71.7
        },
        {
          "target_id": "jezero_crater",
          "overall_psi": 71.0
        },
        {
          "target_id": "gusev_crater",
          "overall_psi": 70.5
        },
        {
          "target_id": "gale_crater",
          "overall_psi": 68.3
        }
      ]
    },
    {
      "id": "askja_iceland",
      "name": "Askja Caldera & Holuhraun Lava",
      "country": "Iceland",
      "region": "Highlands of Iceland",
      "is_bolivian_gem": false,
      "coordinates": {
        "lat": 65.03,
        "lng": -16.75,
        "elevation_m": 1100.0
      },
      "scientific_summary": "Pristine basaltic caldera and expansive rugged lava fields where Apollo astronauts Neil Armstrong and Buzz Aldrin trained in lunar geology in 1965 and 1967. Superb analog for Lunar maria and basaltic Martian volcanic provinces.",
      "geological_context": "Central volcanic caldera in the Northern Volcanic Zone of Iceland with fresh basaltic pahoehoe and aa lavas.",
      "gases_atmosphere": {
        "pressure_kpa": 87.5,
        "composition": "78% N2, 21% O2, 0.9% Ar, 0.04% CO2",
        "density_comparison": "Presión de 87.5 kPa (nivel estándar)."
      },
      "mineralogy": {
        "predominant": [
          "Tholeiitic Basalt",
          "Olivine",
          "Pyroxene",
          "Volcanic Ash",
          "Palagonite"
        ],
        "composition_vector": {
          "basalto": 75.0,
          "sulfatos_evaporitas": 5.0,
          "arcillas": 2.0,
          "oxidos_hierro": 8.0,
          "silice_regolito": 10.0
        }
      },
      "climate_radiation": {
        "temp_min_c": -25.0,
        "temp_max_c": 15.0,
        "thermal_amplitude_c": 20.0,
        "uv_index": "55% (Índice UV extremo en alta altitud)",
        "aridity": "75%"
      },
      "surface_roughness": {
        "mean_slope_deg": 16.8,
        "roughness_std_m": 22.0,
        "peak_valley_relief_m": 480.0
      },
      "mission_equipment_needed": [
        "Apollo astronaut geological field training heritage",
        "Rover wheel traction on rough, abrasive basaltic aa lava",
        "LiDAR surface mapping of volcanic caldera collapses"
      ],
      "habitat_conditioning": [
        "Fresh basaltic composition mimicking lunar mare and Martian volcanic plains",
        "Proven Apollo lunar field testing history"
      ],
      "gap_analysis": [
        "Maritime arctic climate with frequent wet snow/rain",
        "Substantially lower UV flux than Moon or Mars"
      ],
      "target_similarity_scores": {
        "jezero_crater": {
          "overall_psi": 62.2,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 80.0,
            "mineralogy": 67.0,
            "environment": 35.8
          }
        },
        "gale_crater": {
          "overall_psi": 67.5,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 93.8,
            "mineralogy": 68.0,
            "environment": 36.2
          }
        },
        "meridiani_planum": {
          "overall_psi": 59.2,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 64.5,
            "mineralogy": 73.9,
            "environment": 35.8
          }
        },
        "gusev_crater": {
          "overall_psi": 64.7,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 82.6,
            "mineralogy": 72.6,
            "environment": 34.6
          }
        },
        "valles_marineris": {
          "overall_psi": 65.5,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 88.4,
            "mineralogy": 68.0,
            "environment": 35.8
          }
        },
        "arcadia_planitia": {
          "overall_psi": 62.6,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 62.2,
            "mineralogy": 86.8,
            "environment": 34.9
          }
        },
        "shackleton_crater": {
          "overall_psi": 51.9,
          "match_tier": "Tier 4: Low Similarity",
          "subscores": {
            "topography": 90.7,
            "mineralogy": 34.3,
            "environment": 27.2
          }
        },
        "tranquility_base": {
          "overall_psi": 62.2,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 65.0,
            "mineralogy": 89.3,
            "environment": 27.2
          }
        },
        "taurus_littrow": {
          "overall_psi": 60.9,
          "match_tier": "Tier 3: Moderate Analog (Morphological / Specialized Case)",
          "subscores": {
            "topography": 94.9,
            "mineralogy": 55.7,
            "environment": 27.2
          }
        },
        "marius_hills": {
          "overall_psi": 77.6,
          "match_tier": "Tier 2: High-Fidelity Analog (Specific Subsystem Testing)",
          "subscores": {
            "topography": 91.1,
            "mineralogy": 89.0,
            "environment": 48.6
          }
        }
      },
      "top_matching_destinations": [
        {
          "target_id": "marius_hills",
          "overall_psi": 77.6
        },
        {
          "target_id": "gale_crater",
          "overall_psi": 67.5
        },
        {
          "target_id": "valles_marineris",
          "overall_psi": 65.5
        },
        {
          "target_id": "gusev_crater",
          "overall_psi": 64.7
        }
      ]
    }
  ],
  "mars_sites": {
    "jezero_crater": {
      "id": "jezero_crater",
      "name": "Cráter Jezero",
      "body": "Mars",
      "type": "Rover & Astrobiología Activa",
      "mission": "NASA Mars 2020 / Rover Perseverance + Ingenuity",
      "coordinates": {
        "lat": 18.38,
        "lng": 77.58
      },
      "diameter_km": 49.0,
      "elevation_m": -2500.0,
      "summary": "Antiguo paleolago con delta fluvial arcilloso rico en carbonatos y sulfatos evaporíticos. Principal objetivo de astrobiología para búsqueda de biofirmas fósiles.",
      "gases_atmosphere": {
        "pressure_kpa": 0.61,
        "composition": "95.3% CO2, 2.6% N2, 1.9% Ar, 0.16% O2, trazas de vapor de agua y CO",
        "density_kg_m3": 0.015,
        "hazards": "Atmósfera tenue no respirable, baja sustentación para vuelo aerodinámico, vientos globales con tormentas de polvo."
      },
      "mineralogy": {
        "predominant": [
          "Arcillas esmectitas (nontronita)",
          "Sulfatos (yeso)",
          "Carbonato de magnesio",
          "Olivino",
          "Basalto piroxénico"
        ],
        "regolith_type": "Arenas eólicas basálticas con costras salinas y polvo de óxido de hierro",
        "sample_targets": "Testigos de sedimentos lacustres deltaicos para la misión Mars Sample Return."
      },
      "climate_radiation": {
        "temp_min_c": -95.0,
        "temp_max_c": -5.0,
        "diurnal_swing_c": 90.0,
        "uv_index": "Extrema (sin capa de ozono, penetración UV-B y UV-C)",
        "radiation_dose_msv_yr": 250.0,
        "radiation_notes": "Radiación cósmica galáctica (GCR) y tormentas de partículas solares (SEP) sin protección magnetosférica."
      },
      "surface_roughness": {
        "mean_slope_deg": 6.8,
        "roughness_std_m": 8.5,
        "max_slope_deg": 28.0,
        "hazards": "Ondulaciones de arena eólica no compactada (trampas de ruedas), escarpes del delta y cantos rodados angulares."
      },
      "mission_equipment_needed": [
        "Traje presurizado EVA con sistema de enfriamiento sublimador",
        "Ruedas de tracción de nitinol con memoria de forma y grousers de titanio",
        "Taladro percutor rotatorio con sellado hermético contra abrasión de polvo",
        "Espectrómetros Raman, UV y LIBS (Laser-Induced Breakdown)",
        "Helicóptero coaxial de palas de carbono ultraligeras de 2,400 RPM (Ingenuity)"
      ],
      "habitat_conditioning": [
        "Esclusas dobles con sopladores de aire iónico para descontaminar percloratos de los trajes",
        "Módulo de hábitat enterrado bajo 2 metros de regolito para blindaje contra radiación GCR",
        "Planta de producción de oxígeno in-situ (MOXIE) extrayendo O2 del CO2 atmosférico",
        "Baterías con calefactores termoeléctricos de radioisótopos (RHU) contra el frío nocturno (-95°C)"
      ],
      "best_earth_analogs": [
        "salar_de_uyuni",
        "laguna_colorada",
        "sol_de_manana",
        "valle_de_la_luna_bolivia"
      ]
    },
    "gale_crater": {
      "id": "gale_crater",
      "name": "Cráter Gale (Monte Sharp / Aeolis Mons)",
      "body": "Mars",
      "type": "Rover & Estratigrafía Activa",
      "mission": "NASA Mars Science Laboratory / Rover Curiosity",
      "coordinates": {
        "lat": -5.4,
        "lng": 137.8
      },
      "diameter_km": 154.0,
      "elevation_m": -4500.0,
      "summary": "Estratigrafía sedimentaria de 5 km de espesor en el Monte Sharp que registra la transición del Marte húmedo ancestral al planeta desértico actual.",
      "gases_atmosphere": {
        "pressure_kpa": 0.65,
        "composition": "95.1% CO2, 2.6% N2, 1.9% Ar, trazas de gas metano estacional",
        "density_kg_m3": 0.016,
        "hazards": "Vientos catabáticos que descienden de las paredes del cráter y plumas de polvo estacionales."
      },
      "mineralogy": {
        "predominant": [
          "Sulfatos de magnesio y calcio",
          "Hematita",
          "Filosilicatos",
          "Feldespato plagioclasa",
          "Magnetita"
        ],
        "regolith_type": "Arenisca estratificada y regolito con nódulos de sulfatos",
        "sample_targets": "Moléculas orgánicas preservadas en lutitas arcillosas basales."
      },
      "climate_radiation": {
        "temp_min_c": -88.0,
        "temp_max_c": 0.0,
        "diurnal_swing_c": 88.0,
        "uv_index": "Extrema",
        "radiation_dose_msv_yr": 240.0,
        "radiation_notes": "Exposición constante a rayos cósmicos galácticos."
      },
      "surface_roughness": {
        "mean_slope_deg": 11.2,
        "roughness_std_m": 16.0,
        "max_slope_deg": 32.0,
        "hazards": "Rocas afiladas labradas por el viento (ventifacts) que desgastan severamente el aluminio de las ruedas."
      },
      "mission_equipment_needed": [
        "Ruedas reforzadas antidesgarro con bandas de rodadura amortiguadas",
        "Laboratorio químico analítico in-situ (cromatógrafo de gases y espectrómetro de masas)",
        "Chasis articulado Rocker-Bogie de gran despeje vertical",
        "Brazo robótico con torreta de 30 kg para posicionamiento de contacto"
      ],
      "habitat_conditioning": [
        "Aprovechamiento de sombras topográficas de cañones para atenuación térmica",
        "Sistema de sellado de juntas contra intrusión de finos de sílice abrasivos",
        "Reactores nucleares compactos de superficie (Kilopower de 10 kWe)"
      ],
      "best_earth_analogs": [
        "sol_de_manana",
        "mcmurdo_dry_valleys",
        "valle_de_la_luna_bolivia",
        "rio_tinto"
      ]
    },
    "meridiani_planum": {
      "id": "meridiani_planum",
      "name": "Meridiani Planum",
      "body": "Mars",
      "type": "Sitio Histórico de Aterrizaje",
      "mission": "NASA Mars Exploration Rover / Opportunity",
      "coordinates": {
        "lat": -0.2,
        "lng": 354.5
      },
      "diameter_km": 0.0,
      "elevation_m": -1400.0,
      "summary": "Llanura ecuatorial donde se descubrieron las 'blueberries' marcianas: concreciones esféricas de hematita gris formadas en aguas ácidas ancestrales.",
      "gases_atmosphere": {
        "pressure_kpa": 0.64,
        "composition": "95.3% CO2, 2.7% N2, 1.6% Ar",
        "density_kg_m3": 0.015,
        "hazards": "Grandes tormentas globales de polvo que bloquearon los paneles solares y finalizaron la misión."
      },
      "mineralogy": {
        "predominant": [
          "Hematita cristalina",
          "Jarosita (sulfato hidratado de hierro)",
          "Yeso",
          "Basalto"
        ],
        "regolith_type": "Pavimento de arenas finas cubierto de concreciones ricas en hierro",
        "sample_targets": "Capas sedimentarias de sulfatos con estratificación cruzada eólica."
      },
      "climate_radiation": {
        "temp_min_c": -80.0,
        "temp_max_c": 10.0,
        "diurnal_swing_c": 90.0,
        "uv_index": "Muy Alta",
        "radiation_dose_msv_yr": 235.0,
        "radiation_notes": "Radiación ionizante superficial continua."
      },
      "surface_roughness": {
        "mean_slope_deg": 2.5,
        "roughness_std_m": 1.8,
        "max_slope_deg": 15.0,
        "hazards": "Campos de ondulaciones arenosas profundas donde los rovers pueden quedar atascados."
      },
      "mission_equipment_needed": [
        "Limpiadores electrostáticos activos para paneles solares o generador RTG",
        "Espectrómetro Mössbauer para identificación de estados de oxidación del hierro",
        "Herramienta de abrasión de roca (RAT) con brocas de diamante sintético"
      ],
      "habitat_conditioning": [
        "Cimentación de anclaje para suelos de baja cohesión arenosa",
        "Filtración de polvo de hematita ultrafino en sistemas de soporte vital"
      ],
      "best_earth_analogs": [
        "rio_tinto",
        "salar_de_uyuni",
        "atacama_yungay"
      ]
    },
    "gusev_crater": {
      "id": "gusev_crater",
      "name": "Cráter Gusev (Home Plate)",
      "body": "Mars",
      "type": "Sitio Histórico de Hidrotermalismo",
      "mission": "NASA Mars Exploration Rover / Spirit",
      "coordinates": {
        "lat": -14.57,
        "lng": 175.47
      },
      "diameter_km": 166.0,
      "elevation_m": -1900.0,
      "summary": "Cráter de impacto modificado por vulcanismo. En 'Home Plate' el rover Spirit desenterró depósitos de sílice pura al 90%, evidencia directa de fumarolas hidrotermales y géiseres antiguos.",
      "gases_atmosphere": {
        "pressure_kpa": 0.63,
        "composition": "95.3% CO2, 2.6% N2, 1.9% Ar",
        "density_kg_m3": 0.015,
        "hazards": "Diablos de polvo (dust devils) frecuentes que limpian o sobrecargan equipos."
      },
      "mineralogy": {
        "predominant": [
          "Sílice opalina pura (>90%)",
          "Basalto olivínico",
          "Sulfatos de hierro",
          "Piroxeno"
        ],
        "regolith_type": "Cenizas volcánicas piroclásticas alteradas hidrotermalmente",
        "sample_targets": "Depósitos de sílice caliente como trampas de biofirmas microbianas."
      },
      "climate_radiation": {
        "temp_min_c": -85.0,
        "temp_max_c": 12.0,
        "diurnal_swing_c": 97.0,
        "uv_index": "Extrema",
        "radiation_dose_msv_yr": 245.0,
        "radiation_notes": "Flujo de neutrones secundarios generado en el regolito por rayos cósmicos."
      },
      "surface_roughness": {
        "mean_slope_deg": 8.0,
        "roughness_std_m": 9.2,
        "max_slope_deg": 25.0,
        "hazards": "Bancos de azufre y polvo blando donde las ruedas pierden tracción por hundimiento."
      },
      "mission_equipment_needed": [
        "Sensores infrarrojos de emisión térmica en miniatura (Mini-TES)",
        "Brocas de muestreo resistentes a la abrasión por sílice y corrosión ácida",
        "Algoritmos de detección autónoma de resbalamiento de ruedas"
      ],
      "habitat_conditioning": [
        "Aisladores de corrosión química para equipos metálicos en contacto con sales sulfatadas ácidas",
        "Aprovechamiento del lecho plano del cráter para pistas de aterrizaje de cohetes"
      ],
      "best_earth_analogs": [
        "sol_de_manana",
        "laguna_colorada",
        "askja_iceland"
      ]
    },
    "valles_marineris": {
      "id": "valles_marineris",
      "name": "Valles Marineris (Coprates Chasma)",
      "body": "Mars",
      "type": "Sitio Propuesto para Base Humana Primaria",
      "mission": "Futuras Misiones Tripuladas de la NASA & ESA",
      "coordinates": {
        "lat": -14.0,
        "lng": 298.0
      },
      "diameter_km": 4000.0,
      "elevation_m": -7000.0,
      "summary": "El cañón más gigantesco del Sistema Solar (4,000 km de largo y hasta 7-10 km de profundidad). En el fondo la presión atmosférica es la más alta de Marte (~1.1 kPa), ofreciendo mayor protección contra la radiación.",
      "gases_atmosphere": {
        "pressure_kpa": 1.15,
        "composition": "95.2% CO2, 2.7% N2, 1.6% Ar, presencia de nieblas matutinas de hielo de agua",
        "density_kg_m3": 0.026,
        "hazards": "Vientos de cañón de alta cizalladura y nieblas de cristales de hielo que reducen visibilidad."
      },
      "mineralogy": {
        "predominant": [
          "Sulfatos hidratados masivos",
          "Óxidos de hierro",
          "Arcillas estratificadas en las paredes",
          "Basalto"
        ],
        "regolith_type": "Depósitos coluviales de derrumbes gigantescos y dunas eólicas",
        "sample_targets": "Estratigrafía completa de la corteza marciana expuesta en acantilados verticales."
      },
      "climate_radiation": {
        "temp_min_c": -75.0,
        "temp_max_c": 15.0,
        "diurnal_swing_c": 90.0,
        "uv_index": "Moderada-Alta (atenuada por la columna atmosférica más densa de Marte)",
        "radiation_dose_msv_yr": 195.0,
        "radiation_notes": "La mayor presión y profundidad reduce la dosis de radiación en un 20-25% comparado con las llanuras."
      },
      "surface_roughness": {
        "mean_slope_deg": 19.5,
        "roughness_std_m": 35.0,
        "max_slope_deg": 45.0,
        "hazards": "Paredes verticales con desprendimientos masivos de rocas y pendientes empinadas inestables."
      },
      "mission_equipment_needed": [
        "Vehículos todoterreno presurizados con cabrestantes de tracción y anclajes",
        "Aeronaves no tripuladas de mayor sustentación aprovechando la densidad de 1.1 kPa",
        "Sistemas de telecomunicaciones por satélite relé orbital (línea de vista bloqueada por paredes de 7 km)"
      ],
      "habitat_conditioning": [
        "Construcción de hábitats bioclimáticos en cuevas y salientes de la pared del cañón",
        "Extracción de agua a partir de las capas masivas de sulfatos hidratados",
        "Condensadores atmosféricos nocturnos para capturar humedad de las nieblas del fondo"
      ],
      "best_earth_analogs": [
        "valle_de_la_luna_bolivia",
        "nevado_sajama",
        "mcmurdo_dry_valleys"
      ]
    },
    "arcadia_planitia": {
      "id": "arcadia_planitia",
      "name": "Arcadia Planitia (Sitio Base Mars Alpha)",
      "body": "Mars",
      "type": "Candidato Principal de Hábitat Humano & SpaceX",
      "mission": "Base Humana Permanente de Larga Duración",
      "coordinates": {
        "lat": 39.3,
        "lng": 189.7
      },
      "diameter_km": 0.0,
      "elevation_m": -4000.0,
      "summary": "Vasta llanura volcánica suave en las latitudes medias septentrionales con glaciares masivos de hielo de agua someros cubiertos por apenas 1 a 2 metros de regolito eólico protector.",
      "gases_atmosphere": {
        "pressure_kpa": 0.72,
        "composition": "95.3% CO2, 2.6% N2, 1.9% Ar",
        "density_kg_m3": 0.017,
        "hazards": "Noches polares frías y heladas estacionales de dióxido de carbono."
      },
      "mineralogy": {
        "predominant": [
          "Hielo de agua masivo (pureza >85%) bajo manto protector",
          "Basalto vesicular",
          "Polvo eólico oxidado"
        ],
        "regolith_type": "Suelo periglacial con crioturbación y patrones poligonales",
        "sample_targets": "Hielo fósil de la era de transición glacial marciana para combustible ISRU."
      },
      "climate_radiation": {
        "temp_min_c": -110.0,
        "temp_max_c": -15.0,
        "diurnal_swing_c": 95.0,
        "uv_index": "Moderada",
        "radiation_dose_msv_yr": 220.0,
        "radiation_notes": "Blindaje directo del hábitat utilizando el hielo circundante como moderador de radiación."
      },
      "surface_roughness": {
        "mean_slope_deg": 1.5,
        "roughness_std_m": 1.2,
        "max_slope_deg": 6.0,
        "hazards": "Superficie extraordinariamente plana y segura para aterrizaje simultáneo de múltiples Starships."
      },
      "mission_equipment_needed": [
        "Excavadoras autónomas de regolito y zanjadoras de permafrost",
        "Sistemas de pozos térmicos 'Rodwell' para fundir hielo subterráneo e inyectar bombas de succión",
        "Plantas Sabatier de metanación (producción de combustible criogénico CH4/LOX)",
        "Megavatios de energía eléctrica mediante reactores nucleares modulares"
      ],
      "habitat_conditioning": [
        "Cúpulas de hielo inflables impresas en 3D que proporcionan luz diurna y bloqueo total de radiación",
        "Granjas hidropónicas presurizadas en ambiente enriquecido en nitrógeno reciclado",
        "Pavimentación de plataformas de aterrizaje mediante sinterización solar o por microondas del regolito"
      ],
      "best_earth_analogs": [
        "salar_de_uyuni",
        "mcmurdo_dry_valleys",
        "nevado_sajama"
      ]
    }
  },
  "moon_sites": {
    "shackleton_crater": {
      "id": "shackleton_crater",
      "name": "Cráter Shackleton (Polo Sur Lunar)",
      "body": "Moon",
      "type": "Objetivo Base Base Artemis III",
      "mission": "NASA Artemis Program / VIPER / Lunar Gateway",
      "coordinates": {
        "lat": -89.9,
        "lng": 0.0
      },
      "diameter_km": 21.0,
      "elevation_m": -4200.0,
      "summary": "Polo Sur Lunar. Sus bordes reciben luz solar casi continua (Picos de Luz Eterna), mientras que el interior está en Oscuridad Permanente (PSR) a 40 Kelvin (-233°C), albergando gigatoneladas de hielo de agua.",
      "gases_atmosphere": {
        "pressure_kpa": 0.0,
        "composition": "Vacío extremo (10^-12 kPa / 10^-15 atm). Trazas de átomos de helio, argón y sodio atrapados por el viento solar.",
        "density_kg_m3": 0.0,
        "hazards": "Carga electrostática de polvo lunar en la línea del terminador; vacío total exige soporte de vida autónomo."
      },
      "mineralogy": {
        "predominant": [
          "Anortosita rica en plagioclasa cálcica",
          "Regolito de grano ultrafino",
          "Hielo de agua criogénico mezclado con regolito",
          "Brechas de impacto"
        ],
        "regolith_type": "Harina de roca abrasiva con partículas de filos afilados sin erosión de aire ni agua",
        "sample_targets": "Hielo volátil en trampas frías para combustible criogénico (LOX/LH2) y soporte vital."
      },
      "climate_radiation": {
        "temp_min_c": -233.0,
        "temp_max_c": 50.0,
        "diurnal_swing_c": 283.0,
        "uv_index": "Radiación solar directa sin filtro atmosférico",
        "radiation_dose_msv_yr": 380.0,
        "radiation_notes": "Exposición sin mitigación a rayos cósmicos y eventos de protones solares. Cero campo magnético global."
      },
      "surface_roughness": {
        "mean_slope_deg": 24.5,
        "roughness_std_m": 25.0,
        "max_slope_deg": 32.0,
        "hazards": "Paredes internas del cráter ultra-empinadas (hasta 32°) en sombra total con riesgo severo de deslizamiento."
      },
      "mission_equipment_needed": [
        "Traje espacial Artemis xEMU con protección criogénica extrema (40 K)",
        "Faros de alta potencia y sensores LiDAR 3D para navegación en tinieblas permanentes",
        "Rovers con ruedas flexibles de titanio y motores sellados magnéticamente contra polvo",
        "Taladro criogénico de percusión de 1 metro para muestreo de permafrost lunar",
        "Torres solares de 20 metros en los bordes elevados para capturar luz rasante perpetua"
      ],
      "habitat_conditioning": [
        "Hábitats construidos en el borde iluminado con conexión por cable umbilical al fondo helado",
        "Capas gruesas de regolito sinterizado por láser de 3 a 5 metros de espesor sobre el módulo para radiación",
        "Esclusas de paso con duchas electromagnéticas para desprender el polvo lunar electrostático",
        "Planta de electrólisis ISRU para transformar hielo extraído en oxígeno respirable y propulsor líquido"
      ],
      "best_earth_analogs": [
        "nevado_sajama",
        "mcmurdo_dry_valleys",
        "haughton_crater",
        "askja_iceland"
      ]
    },
    "tranquility_base": {
      "id": "tranquility_base",
      "name": "Base Tranquilidad (Mare Tranquillitatis)",
      "body": "Moon",
      "type": "Sitio Histórico del Primer Alunizaje Humano",
      "mission": "NASA Apollo 11 (Neil Armstrong & Buzz Aldrin - 20 Julio 1969)",
      "coordinates": {
        "lat": 0.67,
        "lng": 23.47
      },
      "diameter_km": 0.0,
      "elevation_m": -1500.0,
      "summary": "El primer lugar donde pisó la humanidad fuera de la Tierra. Mar basáltico rico en ilmenita y titanio, plano con cráteres de impacto dispersos y rocas eyectadas.",
      "gases_atmosphere": {
        "pressure_kpa": 0.0,
        "composition": "Vacío absoluto (exosfera ultratenue)",
        "density_kg_m3": 0.0,
        "hazards": "Cero presión, oscilación térmica violenta entre día y noche lunar de 14 días terrestres cada uno."
      },
      "mineralogy": {
        "predominant": [
          "Basalto rico en titanio (ilmenita FeTiO3)",
          "Piroxeno",
          "Plagioclasa",
          "Vidrio de impacto"
        ],
        "regolith_type": "Capa de regolito gris oscuro de 4 a 5 metros de espesor",
        "sample_targets": "Rocas de basalto que dataron el vulcanismo lunar hace 3,700 millones de años."
      },
      "climate_radiation": {
        "temp_min_c": -130.0,
        "temp_max_c": 120.0,
        "diurnal_swing_c": 250.0,
        "uv_index": "Pleno espectro solar sin atenuación",
        "radiation_dose_msv_yr": 370.0,
        "radiation_notes": "Ambiente radiativo extremo durante los 14 días continuos de sol."
      },
      "surface_roughness": {
        "mean_slope_deg": 3.5,
        "roughness_std_m": 3.0,
        "max_slope_deg": 12.0,
        "hazards": "Micrometeoritos hiperveloces y regolito abrasivo que desgastó las capas exteriores de los trajes A7L."
      },
      "mission_equipment_needed": [
        "Módulo de descenso LM con motores hipergólicos de aceleración regulable",
        "Cámara de televisión para transmisión en vivo y antena de alta ganancia de banda S",
        "Sismómetro pasivo y retrorreflector láser de alcance láser tierra-luna (LLR)"
      ],
      "habitat_conditioning": [
        "Sitio de preservación patrimonial de la humanidad (Acuerdos de Artemis)",
        "Ideal para extracción de titanio y oxígeno a partir de la fundición de ilmenita"
      ],
      "best_earth_analogs": [
        "askja_iceland",
        "salar_de_uyuni",
        "atacama_yungay"
      ]
    },
    "taurus_littrow": {
      "id": "taurus_littrow",
      "name": "Valle Taurus-Littrow",
      "body": "Moon",
      "type": "Sitio Histórico Apollo 17",
      "mission": "NASA Apollo 17 (Gene Cernan & Harrison Schmitt - Última misión Apolo tripulada)",
      "coordinates": {
        "lat": 20.19,
        "lng": 30.77
      },
      "diameter_km": 0.0,
      "elevation_m": -2200.0,
      "summary": "Valle montañoso profundo bordeado por los macizos Norte y Sur de 2,500 m de altura. Se descubrió suelo naranja compuesto por cuentas de vidrio volcánico piroclástico.",
      "gases_atmosphere": {
        "pressure_kpa": 0.0,
        "composition": "Vacío lunar absoluto",
        "density_kg_m3": 0.0,
        "hazards": "Sombras de alto contraste en el fondo del valle y polvo pegajoso electrostático."
      },
      "mineralogy": {
        "predominant": [
          "Vidrio volcánico piroclástico naranja rico en titanio",
          "Basalto",
          "Brechas de impacto de tierras altas"
        ],
        "regolith_type": "Mezcla de derrumbes de escarpes montañosos y regolito del mar basáltico",
        "sample_targets": "Testigos profundos de regolito y perlas de vidrio volcánico de erupciones de fuentes de fuego."
      },
      "climate_radiation": {
        "temp_min_c": -140.0,
        "temp_max_c": 115.0,
        "diurnal_swing_c": 255.0,
        "uv_index": "Extrema",
        "radiation_dose_msv_yr": 365.0,
        "radiation_notes": "Radiación solar no filtrada."
      },
      "surface_roughness": {
        "mean_slope_deg": 14.5,
        "roughness_std_m": 18.0,
        "max_slope_deg": 35.0,
        "hazards": "Grandes bloques de impacto (como la 'Roca Dividida') y taludes de desprendimiento en las laderas."
      },
      "mission_equipment_needed": [
        "Rover Lunar LRV con dirección en las 4 ruedas y tracción independiente",
        "Gravímetro de superficie y sonda térmica profunda",
        "Guantes de traje espacial reforzados contra corte por filos de vidrio volcánico"
      ],
      "habitat_conditioning": [
        "Ubicación protegida de vientos solares rasantes por los macizos montañosos circundantes",
        "Aprovechamiento del material piroclástico para fabricación de paneles solares y vidrio lunar"
      ],
      "best_earth_analogs": [
        "sol_de_manana",
        "nevado_sajama",
        "askja_iceland"
      ]
    },
    "marius_hills": {
      "id": "marius_hills",
      "name": "Colinas de Marius (Tubo de Lava Lunar)",
      "body": "Moon",
      "type": "Sitio Estratégico de Base Subterránea Lunar",
      "mission": "Futuros Hábitats Subterráneos de la NASA / JAXA",
      "coordinates": {
        "lat": 14.0,
        "lng": -56.0
      },
      "diameter_km": 0.0,
      "elevation_m": -1100.0,
      "summary": "Región volcánica que contiene una claraboya ('skylight') de 65 metros de ancho que desciende a un tubo de lava subterráneo intacto de cientos de metros de diámetro y kilómetros de longitud.",
      "gases_atmosphere": {
        "pressure_kpa": 0.0,
        "composition": "Vacío (posibilidad de presurización completa del tubo de lava mediante esclusas)",
        "density_kg_m3": 0.0,
        "hazards": "Oscuridad absoluta en el interior y riesgo de desprendimiento de rocas del techo antes de consolidar."
      },
      "mineralogy": {
        "predominant": [
          "Basalto de flujo de lava continuo",
          "Silicatos de piroxeno y plagioclasa",
          "Regolito exterior"
        ],
        "regolith_type": "Roca sólida masiva en las paredes interiores y escombros de colapso en el suelo",
        "sample_targets": "Lavas basálticas vírgenes no irradiadas por el viento solar durante miles de millones de años."
      },
      "climate_radiation": {
        "temp_min_c": -20.0,
        "temp_max_c": -20.0,
        "diurnal_swing_c": 0.0,
        "uv_index": "CERO en el interior (protección 100%)",
        "radiation_dose_msv_yr": 2.0,
        "radiation_notes": "¡EL AMBIENTE MÁS PROTEGIDO DE LA LUNA! Techo de roca de 50 metros elimina totalmente la radiación cósmica y micrometeoritos."
      },
      "surface_roughness": {
        "mean_slope_deg": 12.0,
        "roughness_std_m": 15.0,
        "max_slope_deg": 90.0,
        "hazards": "Descenso vertical por la claraboya de 60 metros que requiere grúas o ascensores mecánicos."
      },
      "mission_equipment_needed": [
        "Robots espeleólogos autónomos con sensores LiDAR y visión nocturna multiespectral",
        "Sistemas de rápel y descenso vertical para cargas pesadas y astronautas",
        "Arcos inflables de sellado hermético y membranas poliméricas para presurizar el tubo",
        "Reactores nucleares en superficie con tendido de potencia hacia el interior"
      ],
      "habitat_conditioning": [
        "Temperatura interior constante y benigna de aproximadamente -20°C día y noche sin oscilaciones",
        "Permite construir ciudades o campamentos enteros sin necesidad de pesados blindajes de regolito exterior",
        "Ahorro de hasta el 80% del peso estructural requerido para hábitats de superficie"
      ],
      "best_earth_analogs": [
        "askja_iceland",
        "sol_de_manana",
        "nevado_sajama"
      ]
    }
  },
  "cross_rankings_by_target": {
    "jezero_crater": [
      {
        "analog_id": "sol_de_manana",
        "analog_name": "Sol de Mañana Geothermal Field",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 90.9,
        "subscores": {
          "topography": 98.2,
          "mineralogy": 92.8,
          "environment": 80.1
        }
      },
      {
        "analog_id": "atacama_yungay",
        "analog_name": "Atacama Desert (Yungay Core)",
        "country": "Chile",
        "is_bolivian_gem": false,
        "overall_psi": 86.9,
        "subscores": {
          "topography": 93.7,
          "mineralogy": 86.1,
          "environment": 79.8
        }
      },
      {
        "analog_id": "laguna_colorada",
        "analog_name": "Laguna Colorada (Eduardo Abaroa Reserve)",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 83.1,
        "subscores": {
          "topography": 92.6,
          "mineralogy": 77.7,
          "environment": 78.4
        }
      },
      {
        "analog_id": "mcmurdo_dry_valleys",
        "analog_name": "McMurdo Dry Valleys (University Valley)",
        "country": "Antarctica",
        "is_bolivian_gem": false,
        "overall_psi": 81.0,
        "subscores": {
          "topography": 86.3,
          "mineralogy": 77.1,
          "environment": 79.3
        }
      },
      {
        "analog_id": "haughton_crater",
        "analog_name": "Haughton Impact Crater (Devon Island)",
        "country": "Canada",
        "is_bolivian_gem": false,
        "overall_psi": 76.2,
        "subscores": {
          "topography": 91.0,
          "mineralogy": 77.3,
          "environment": 57.7
        }
      },
      {
        "analog_id": "valle_de_la_luna_bolivia",
        "analog_name": "Valle de la Luna (Valley of the Moon)",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 75.8,
        "subscores": {
          "topography": 85.9,
          "mineralogy": 71.0,
          "environment": 69.7
        }
      },
      {
        "analog_id": "salar_de_uyuni",
        "analog_name": "Salar de Uyuni",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 75.0,
        "subscores": {
          "topography": 85.6,
          "mineralogy": 61.1,
          "environment": 78.8
        }
      },
      {
        "analog_id": "rio_tinto",
        "analog_name": "Río Tinto Acidic River",
        "country": "Spain",
        "is_bolivian_gem": false,
        "overall_psi": 71.0,
        "subscores": {
          "topography": 91.7,
          "mineralogy": 75.1,
          "environment": 42.0
        }
      },
      {
        "analog_id": "nevado_sajama",
        "analog_name": "Nevado Sajama & Volcanic Domes",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 65.9,
        "subscores": {
          "topography": 40.3,
          "mineralogy": 72.9,
          "environment": 87.6
        }
      },
      {
        "analog_id": "askja_iceland",
        "analog_name": "Askja Caldera & Holuhraun Lava",
        "country": "Iceland",
        "is_bolivian_gem": false,
        "overall_psi": 62.2,
        "subscores": {
          "topography": 80.0,
          "mineralogy": 67.0,
          "environment": 35.8
        }
      }
    ],
    "gale_crater": [
      {
        "analog_id": "sol_de_manana",
        "analog_name": "Sol de Mañana Geothermal Field",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 91.9,
        "subscores": {
          "topography": 98.8,
          "mineralogy": 94.7,
          "environment": 80.7
        }
      },
      {
        "analog_id": "mcmurdo_dry_valleys",
        "analog_name": "McMurdo Dry Valleys (University Valley)",
        "country": "Antarctica",
        "is_bolivian_gem": false,
        "overall_psi": 84.9,
        "subscores": {
          "topography": 95.7,
          "mineralogy": 78.3,
          "environment": 80.1
        }
      },
      {
        "analog_id": "atacama_yungay",
        "analog_name": "Atacama Desert (Yungay Core)",
        "country": "Chile",
        "is_bolivian_gem": false,
        "overall_psi": 83.7,
        "subscores": {
          "topography": 82.9,
          "mineralogy": 87.5,
          "environment": 80.3
        }
      },
      {
        "analog_id": "valle_de_la_luna_bolivia",
        "analog_name": "Valle de la Luna (Valley of the Moon)",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 79.1,
        "subscores": {
          "topography": 93.9,
          "mineralogy": 72.1,
          "environment": 70.2
        }
      },
      {
        "analog_id": "laguna_colorada",
        "analog_name": "Laguna Colorada (Eduardo Abaroa Reserve)",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 78.7,
        "subscores": {
          "topography": 79.7,
          "mineralogy": 77.5,
          "environment": 78.9
        }
      },
      {
        "analog_id": "haughton_crater",
        "analog_name": "Haughton Impact Crater (Devon Island)",
        "country": "Canada",
        "is_bolivian_gem": false,
        "overall_psi": 78.4,
        "subscores": {
          "topography": 97.1,
          "mineralogy": 76.9,
          "environment": 58.3
        }
      },
      {
        "analog_id": "nevado_sajama",
        "analog_name": "Nevado Sajama & Volcanic Domes",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 71.5,
        "subscores": {
          "topography": 54.7,
          "mineralogy": 74.0,
          "environment": 88.2
        }
      },
      {
        "analog_id": "salar_de_uyuni",
        "analog_name": "Salar de Uyuni",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 69.9,
        "subscores": {
          "topography": 70.7,
          "mineralogy": 61.0,
          "environment": 79.4
        }
      },
      {
        "analog_id": "rio_tinto",
        "analog_name": "Río Tinto Acidic River",
        "country": "Spain",
        "is_bolivian_gem": false,
        "overall_psi": 68.3,
        "subscores": {
          "topography": 82.5,
          "mineralogy": 76.2,
          "environment": 42.4
        }
      },
      {
        "analog_id": "askja_iceland",
        "analog_name": "Askja Caldera & Holuhraun Lava",
        "country": "Iceland",
        "is_bolivian_gem": false,
        "overall_psi": 67.5,
        "subscores": {
          "topography": 93.8,
          "mineralogy": 68.0,
          "environment": 36.2
        }
      }
    ],
    "meridiani_planum": [
      {
        "analog_id": "atacama_yungay",
        "analog_name": "Atacama Desert (Yungay Core)",
        "country": "Chile",
        "is_bolivian_gem": false,
        "overall_psi": 88.9,
        "subscores": {
          "topography": 94.7,
          "mineralogy": 90.8,
          "environment": 79.8
        }
      },
      {
        "analog_id": "sol_de_manana",
        "analog_name": "Sol de Mañana Geothermal Field",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 88.0,
        "subscores": {
          "topography": 88.5,
          "mineralogy": 94.3,
          "environment": 80.1
        }
      },
      {
        "analog_id": "laguna_colorada",
        "analog_name": "Laguna Colorada (Eduardo Abaroa Reserve)",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 85.2,
        "subscores": {
          "topography": 96.5,
          "mineralogy": 79.9,
          "environment": 78.4
        }
      },
      {
        "analog_id": "salar_de_uyuni",
        "analog_name": "Salar de Uyuni",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 78.8,
        "subscores": {
          "topography": 92.9,
          "mineralogy": 64.8,
          "environment": 78.8
        }
      },
      {
        "analog_id": "mcmurdo_dry_valleys",
        "analog_name": "McMurdo Dry Valleys (University Valley)",
        "country": "Antarctica",
        "is_bolivian_gem": false,
        "overall_psi": 78.1,
        "subscores": {
          "topography": 71.7,
          "mineralogy": 83.4,
          "environment": 79.3
        }
      },
      {
        "analog_id": "rio_tinto",
        "analog_name": "Río Tinto Acidic River",
        "country": "Spain",
        "is_bolivian_gem": false,
        "overall_psi": 71.7,
        "subscores": {
          "topography": 90.7,
          "mineralogy": 78.1,
          "environment": 42.0
        }
      },
      {
        "analog_id": "haughton_crater",
        "analog_name": "Haughton Impact Crater (Devon Island)",
        "country": "Canada",
        "is_bolivian_gem": false,
        "overall_psi": 69.5,
        "subscores": {
          "topography": 77.9,
          "mineralogy": 71.2,
          "environment": 57.7
        }
      },
      {
        "analog_id": "nevado_sajama",
        "analog_name": "Nevado Sajama & Volcanic Domes",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 64.0,
        "subscores": {
          "topography": 29.0,
          "mineralogy": 78.8,
          "environment": 87.6
        }
      },
      {
        "analog_id": "valle_de_la_luna_bolivia",
        "analog_name": "Valle de la Luna (Valley of the Moon)",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 63.7,
        "subscores": {
          "topography": 72.2,
          "mineralogy": 50.2,
          "environment": 69.7
        }
      },
      {
        "analog_id": "askja_iceland",
        "analog_name": "Askja Caldera & Holuhraun Lava",
        "country": "Iceland",
        "is_bolivian_gem": false,
        "overall_psi": 59.2,
        "subscores": {
          "topography": 64.5,
          "mineralogy": 73.9,
          "environment": 35.8
        }
      }
    ],
    "gusev_crater": [
      {
        "analog_id": "sol_de_manana",
        "analog_name": "Sol de Mañana Geothermal Field",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 90.2,
        "subscores": {
          "topography": 99.0,
          "mineralogy": 91.7,
          "environment": 78.0
        }
      },
      {
        "analog_id": "atacama_yungay",
        "analog_name": "Atacama Desert (Yungay Core)",
        "country": "Chile",
        "is_bolivian_gem": false,
        "overall_psi": 86.8,
        "subscores": {
          "topography": 92.6,
          "mineralogy": 88.4,
          "environment": 78.2
        }
      },
      {
        "analog_id": "mcmurdo_dry_valleys",
        "analog_name": "McMurdo Dry Valleys (University Valley)",
        "country": "Antarctica",
        "is_bolivian_gem": false,
        "overall_psi": 86.6,
        "subscores": {
          "topography": 88.4,
          "mineralogy": 93.3,
          "environment": 76.7
        }
      },
      {
        "analog_id": "laguna_colorada",
        "analog_name": "Laguna Colorada (Eduardo Abaroa Reserve)",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 82.0,
        "subscores": {
          "topography": 91.1,
          "mineralogy": 77.8,
          "environment": 76.5
        }
      },
      {
        "analog_id": "haughton_crater",
        "analog_name": "Haughton Impact Crater (Devon Island)",
        "country": "Canada",
        "is_bolivian_gem": false,
        "overall_psi": 77.6,
        "subscores": {
          "topography": 92.7,
          "mineralogy": 81.4,
          "environment": 55.6
        }
      },
      {
        "analog_id": "salar_de_uyuni",
        "analog_name": "Salar de Uyuni",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 74.6,
        "subscores": {
          "topography": 83.5,
          "mineralogy": 63.4,
          "environment": 77.3
        }
      },
      {
        "analog_id": "rio_tinto",
        "analog_name": "Río Tinto Acidic River",
        "country": "Spain",
        "is_bolivian_gem": false,
        "overall_psi": 70.5,
        "subscores": {
          "topography": 91.0,
          "mineralogy": 75.4,
          "environment": 40.8
        }
      },
      {
        "analog_id": "nevado_sajama",
        "analog_name": "Nevado Sajama & Volcanic Domes",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 69.4,
        "subscores": {
          "topography": 42.6,
          "mineralogy": 82.0,
          "environment": 86.0
        }
      },
      {
        "analog_id": "valle_de_la_luna_bolivia",
        "analog_name": "Valle de la Luna (Valley of the Moon)",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 69.0,
        "subscores": {
          "topography": 88.2,
          "mineralogy": 50.3,
          "environment": 68.4
        }
      },
      {
        "analog_id": "askja_iceland",
        "analog_name": "Askja Caldera & Holuhraun Lava",
        "country": "Iceland",
        "is_bolivian_gem": false,
        "overall_psi": 64.7,
        "subscores": {
          "topography": 82.6,
          "mineralogy": 72.6,
          "environment": 34.6
        }
      }
    ],
    "valles_marineris": [
      {
        "analog_id": "sol_de_manana",
        "analog_name": "Sol de Mañana Geothermal Field",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 81.3,
        "subscores": {
          "topography": 69.1,
          "mineralogy": 94.7,
          "environment": 80.1
        }
      },
      {
        "analog_id": "nevado_sajama",
        "analog_name": "Nevado Sajama & Volcanic Domes",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 80.1,
        "subscores": {
          "topography": 79.8,
          "mineralogy": 74.0,
          "environment": 87.6
        }
      },
      {
        "analog_id": "mcmurdo_dry_valleys",
        "analog_name": "McMurdo Dry Valleys (University Valley)",
        "country": "Antarctica",
        "is_bolivian_gem": false,
        "overall_psi": 78.7,
        "subscores": {
          "topography": 78.5,
          "mineralogy": 78.3,
          "environment": 79.3
        }
      },
      {
        "analog_id": "valle_de_la_luna_bolivia",
        "analog_name": "Valle de la Luna (Valley of the Moon)",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 73.5,
        "subscores": {
          "topography": 78.2,
          "mineralogy": 72.1,
          "environment": 69.7
        }
      },
      {
        "analog_id": "atacama_yungay",
        "analog_name": "Atacama Desert (Yungay Core)",
        "country": "Chile",
        "is_bolivian_gem": false,
        "overall_psi": 71.9,
        "subscores": {
          "topography": 49.5,
          "mineralogy": 87.5,
          "environment": 79.8
        }
      },
      {
        "analog_id": "haughton_crater",
        "analog_name": "Haughton Impact Crater (Devon Island)",
        "country": "Canada",
        "is_bolivian_gem": false,
        "overall_psi": 70.2,
        "subscores": {
          "topography": 74.2,
          "mineralogy": 76.9,
          "environment": 57.7
        }
      },
      {
        "analog_id": "laguna_colorada",
        "analog_name": "Laguna Colorada (Eduardo Abaroa Reserve)",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 67.2,
        "subscores": {
          "topography": 47.4,
          "mineralogy": 77.5,
          "environment": 78.4
        }
      },
      {
        "analog_id": "askja_iceland",
        "analog_name": "Askja Caldera & Holuhraun Lava",
        "country": "Iceland",
        "is_bolivian_gem": false,
        "overall_psi": 65.5,
        "subscores": {
          "topography": 88.4,
          "mineralogy": 68.0,
          "environment": 35.8
        }
      },
      {
        "analog_id": "salar_de_uyuni",
        "analog_name": "Salar de Uyuni",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 58.9,
        "subscores": {
          "topography": 39.8,
          "mineralogy": 61.0,
          "environment": 78.8
        }
      },
      {
        "analog_id": "rio_tinto",
        "analog_name": "Río Tinto Acidic River",
        "country": "Spain",
        "is_bolivian_gem": false,
        "overall_psi": 56.6,
        "subscores": {
          "topography": 49.5,
          "mineralogy": 76.2,
          "environment": 42.0
        }
      }
    ],
    "arcadia_planitia": [
      {
        "analog_id": "sol_de_manana",
        "analog_name": "Sol de Mañana Geothermal Field",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 82.5,
        "subscores": {
          "topography": 86.5,
          "mineralogy": 81.9,
          "environment": 78.5
        }
      },
      {
        "analog_id": "atacama_yungay",
        "analog_name": "Atacama Desert (Yungay Core)",
        "country": "Chile",
        "is_bolivian_gem": false,
        "overall_psi": 82.0,
        "subscores": {
          "topography": 94.0,
          "mineralogy": 72.9,
          "environment": 78.6
        }
      },
      {
        "analog_id": "laguna_colorada",
        "analog_name": "Laguna Colorada (Eduardo Abaroa Reserve)",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 77.3,
        "subscores": {
          "topography": 96.3,
          "mineralogy": 58.5,
          "environment": 77.0
        }
      },
      {
        "analog_id": "mcmurdo_dry_valleys",
        "analog_name": "McMurdo Dry Valleys (University Valley)",
        "country": "Antarctica",
        "is_bolivian_gem": false,
        "overall_psi": 76.8,
        "subscores": {
          "topography": 69.4,
          "mineralogy": 83.7,
          "environment": 77.4
        }
      },
      {
        "analog_id": "salar_de_uyuni",
        "analog_name": "Salar de Uyuni",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 70.2,
        "subscores": {
          "topography": 93.2,
          "mineralogy": 40.8,
          "environment": 77.7
        }
      },
      {
        "analog_id": "nevado_sajama",
        "analog_name": "Nevado Sajama & Volcanic Domes",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 66.9,
        "subscores": {
          "topography": 27.6,
          "mineralogy": 89.6,
          "environment": 86.4
        }
      },
      {
        "analog_id": "haughton_crater",
        "analog_name": "Haughton Impact Crater (Devon Island)",
        "country": "Canada",
        "is_bolivian_gem": false,
        "overall_psi": 66.0,
        "subscores": {
          "topography": 75.6,
          "mineralogy": 64.9,
          "environment": 56.1
        }
      },
      {
        "analog_id": "rio_tinto",
        "analog_name": "Río Tinto Acidic River",
        "country": "Spain",
        "is_bolivian_gem": false,
        "overall_psi": 63.0,
        "subscores": {
          "topography": 89.7,
          "mineralogy": 55.0,
          "environment": 41.1
        }
      },
      {
        "analog_id": "askja_iceland",
        "analog_name": "Askja Caldera & Holuhraun Lava",
        "country": "Iceland",
        "is_bolivian_gem": false,
        "overall_psi": 62.6,
        "subscores": {
          "topography": 62.2,
          "mineralogy": 86.8,
          "environment": 34.9
        }
      },
      {
        "analog_id": "valle_de_la_luna_bolivia",
        "analog_name": "Valle de la Luna (Valley of the Moon)",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 61.7,
        "subscores": {
          "topography": 69.9,
          "mineralogy": 47.5,
          "environment": 68.7
        }
      }
    ],
    "shackleton_crater": [
      {
        "analog_id": "nevado_sajama",
        "analog_name": "Nevado Sajama & Volcanic Domes",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 74.2,
        "subscores": {
          "topography": 88.8,
          "mineralogy": 50.7,
          "environment": 84.6
        }
      },
      {
        "analog_id": "mcmurdo_dry_valleys",
        "analog_name": "McMurdo Dry Valleys (University Valley)",
        "country": "Antarctica",
        "is_bolivian_gem": false,
        "overall_psi": 69.2,
        "subscores": {
          "topography": 78.6,
          "mineralogy": 67.3,
          "environment": 60.6
        }
      },
      {
        "analog_id": "haughton_crater",
        "analog_name": "Haughton Impact Crater (Devon Island)",
        "country": "Canada",
        "is_bolivian_gem": false,
        "overall_psi": 63.5,
        "subscores": {
          "topography": 78.0,
          "mineralogy": 65.8,
          "environment": 43.9
        }
      },
      {
        "analog_id": "sol_de_manana",
        "analog_name": "Sol de Mañana Geothermal Field",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 57.7,
        "subscores": {
          "topography": 66.8,
          "mineralogy": 34.3,
          "environment": 74.4
        }
      },
      {
        "analog_id": "valle_de_la_luna_bolivia",
        "analog_name": "Valle de la Luna (Valley of the Moon)",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 55.2,
        "subscores": {
          "topography": 77.5,
          "mineralogy": 25.1,
          "environment": 64.4
        }
      },
      {
        "analog_id": "askja_iceland",
        "analog_name": "Askja Caldera & Holuhraun Lava",
        "country": "Iceland",
        "is_bolivian_gem": false,
        "overall_psi": 51.9,
        "subscores": {
          "topography": 90.7,
          "mineralogy": 34.3,
          "environment": 27.2
        }
      },
      {
        "analog_id": "atacama_yungay",
        "analog_name": "Atacama Desert (Yungay Core)",
        "country": "Chile",
        "is_bolivian_gem": false,
        "overall_psi": 47.2,
        "subscores": {
          "topography": 40.1,
          "mineralogy": 31.1,
          "environment": 74.1
        }
      },
      {
        "analog_id": "laguna_colorada",
        "analog_name": "Laguna Colorada (Eduardo Abaroa Reserve)",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 44.3,
        "subscores": {
          "topography": 37.4,
          "mineralogy": 25.2,
          "environment": 74.8
        }
      },
      {
        "analog_id": "salar_de_uyuni",
        "analog_name": "Salar de Uyuni",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 39.3,
        "subscores": {
          "topography": 29.6,
          "mineralogy": 18.4,
          "environment": 75.0
        }
      },
      {
        "analog_id": "rio_tinto",
        "analog_name": "Río Tinto Acidic River",
        "country": "Spain",
        "is_bolivian_gem": false,
        "overall_psi": 32.2,
        "subscores": {
          "topography": 41.1,
          "mineralogy": 23.6,
          "environment": 31.8
        }
      }
    ],
    "tranquility_base": [
      {
        "analog_id": "sol_de_manana",
        "analog_name": "Sol de Mañana Geothermal Field",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 73.5,
        "subscores": {
          "topography": 83.5,
          "mineralogy": 62.7,
          "environment": 74.4
        }
      },
      {
        "analog_id": "mcmurdo_dry_valleys",
        "analog_name": "McMurdo Dry Valleys (University Valley)",
        "country": "Antarctica",
        "is_bolivian_gem": false,
        "overall_psi": 71.8,
        "subscores": {
          "topography": 69.1,
          "mineralogy": 84.1,
          "environment": 60.6
        }
      },
      {
        "analog_id": "nevado_sajama",
        "analog_name": "Nevado Sajama & Volcanic Domes",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 70.7,
        "subscores": {
          "topography": 34.5,
          "mineralogy": 94.9,
          "environment": 84.6
        }
      },
      {
        "analog_id": "atacama_yungay",
        "analog_name": "Atacama Desert (Yungay Core)",
        "country": "Chile",
        "is_bolivian_gem": false,
        "overall_psi": 70.0,
        "subscores": {
          "topography": 83.6,
          "mineralogy": 52.7,
          "environment": 74.1
        }
      },
      {
        "analog_id": "laguna_colorada",
        "analog_name": "Laguna Colorada (Eduardo Abaroa Reserve)",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 65.0,
        "subscores": {
          "topography": 85.0,
          "mineralogy": 36.5,
          "environment": 74.8
        }
      },
      {
        "analog_id": "askja_iceland",
        "analog_name": "Askja Caldera & Holuhraun Lava",
        "country": "Iceland",
        "is_bolivian_gem": false,
        "overall_psi": 62.2,
        "subscores": {
          "topography": 65.0,
          "mineralogy": 89.3,
          "environment": 27.2
        }
      },
      {
        "analog_id": "haughton_crater",
        "analog_name": "Haughton Impact Crater (Devon Island)",
        "country": "Canada",
        "is_bolivian_gem": false,
        "overall_psi": 61.5,
        "subscores": {
          "topography": 78.9,
          "mineralogy": 59.1,
          "environment": 43.9
        }
      },
      {
        "analog_id": "salar_de_uyuni",
        "analog_name": "Salar de Uyuni",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 57.5,
        "subscores": {
          "topography": 80.7,
          "mineralogy": 19.3,
          "environment": 75.0
        }
      },
      {
        "analog_id": "valle_de_la_luna_bolivia",
        "analog_name": "Valle de la Luna (Valley of the Moon)",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 53.1,
        "subscores": {
          "topography": 64.7,
          "mineralogy": 31.9,
          "environment": 64.4
        }
      },
      {
        "analog_id": "rio_tinto",
        "analog_name": "Río Tinto Acidic River",
        "country": "Spain",
        "is_bolivian_gem": false,
        "overall_psi": 50.7,
        "subscores": {
          "topography": 80.9,
          "mineralogy": 36.7,
          "environment": 31.8
        }
      }
    ],
    "taurus_littrow": [
      {
        "analog_id": "mcmurdo_dry_valleys",
        "analog_name": "McMurdo Dry Valleys (University Valley)",
        "country": "Antarctica",
        "is_bolivian_gem": false,
        "overall_psi": 78.6,
        "subscores": {
          "topography": 91.0,
          "mineralogy": 81.7,
          "environment": 60.6
        }
      },
      {
        "analog_id": "nevado_sajama",
        "analog_name": "Nevado Sajama & Volcanic Domes",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 72.6,
        "subscores": {
          "topography": 64.6,
          "mineralogy": 70.3,
          "environment": 84.6
        }
      },
      {
        "analog_id": "haughton_crater",
        "analog_name": "Haughton Impact Crater (Devon Island)",
        "country": "Canada",
        "is_bolivian_gem": false,
        "overall_psi": 72.1,
        "subscores": {
          "topography": 94.5,
          "mineralogy": 74.0,
          "environment": 43.9
        }
      },
      {
        "analog_id": "sol_de_manana",
        "analog_name": "Sol de Mañana Geothermal Field",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 71.3,
        "subscores": {
          "topography": 88.0,
          "mineralogy": 51.8,
          "environment": 74.4
        }
      },
      {
        "analog_id": "valle_de_la_luna_bolivia",
        "analog_name": "Valle de la Luna (Valley of the Moon)",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 61.5,
        "subscores": {
          "topography": 85.8,
          "mineralogy": 34.8,
          "environment": 64.4
        }
      },
      {
        "analog_id": "askja_iceland",
        "analog_name": "Askja Caldera & Holuhraun Lava",
        "country": "Iceland",
        "is_bolivian_gem": false,
        "overall_psi": 60.9,
        "subscores": {
          "topography": 94.9,
          "mineralogy": 55.7,
          "environment": 27.2
        }
      },
      {
        "analog_id": "atacama_yungay",
        "analog_name": "Atacama Desert (Yungay Core)",
        "country": "Chile",
        "is_bolivian_gem": false,
        "overall_psi": 60.8,
        "subscores": {
          "topography": 64.3,
          "mineralogy": 46.0,
          "environment": 74.1
        }
      },
      {
        "analog_id": "laguna_colorada",
        "analog_name": "Laguna Colorada (Eduardo Abaroa Reserve)",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 56.4,
        "subscores": {
          "topography": 60.8,
          "mineralogy": 36.4,
          "environment": 74.8
        }
      },
      {
        "analog_id": "salar_de_uyuni",
        "analog_name": "Salar de Uyuni",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 49.3,
        "subscores": {
          "topography": 51.4,
          "mineralogy": 25.1,
          "environment": 75.0
        }
      },
      {
        "analog_id": "rio_tinto",
        "analog_name": "Río Tinto Acidic River",
        "country": "Spain",
        "is_bolivian_gem": false,
        "overall_psi": 44.8,
        "subscores": {
          "topography": 65.4,
          "mineralogy": 35.4,
          "environment": 31.8
        }
      }
    ],
    "marius_hills": [
      {
        "analog_id": "nevado_sajama",
        "analog_name": "Nevado Sajama & Volcanic Domes",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 82.7,
        "subscores": {
          "topography": 58.1,
          "mineralogy": 92.5,
          "environment": 100.0
        }
      },
      {
        "analog_id": "mcmurdo_dry_valleys",
        "analog_name": "McMurdo Dry Valleys (University Valley)",
        "country": "Antarctica",
        "is_bolivian_gem": false,
        "overall_psi": 82.2,
        "subscores": {
          "topography": 90.0,
          "mineralogy": 83.0,
          "environment": 72.0
        }
      },
      {
        "analog_id": "sol_de_manana",
        "analog_name": "Sol de Mañana Geothermal Field",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 80.4,
        "subscores": {
          "topography": 91.4,
          "mineralogy": 61.2,
          "environment": 90.0
        }
      },
      {
        "analog_id": "askja_iceland",
        "analog_name": "Askja Caldera & Holuhraun Lava",
        "country": "Iceland",
        "is_bolivian_gem": false,
        "overall_psi": 77.6,
        "subscores": {
          "topography": 91.1,
          "mineralogy": 89.0,
          "environment": 48.6
        }
      },
      {
        "analog_id": "haughton_crater",
        "analog_name": "Haughton Impact Crater (Devon Island)",
        "country": "Canada",
        "is_bolivian_gem": false,
        "overall_psi": 71.8,
        "subscores": {
          "topography": 95.2,
          "mineralogy": 58.8,
          "environment": 59.5
        }
      },
      {
        "analog_id": "atacama_yungay",
        "analog_name": "Atacama Desert (Yungay Core)",
        "country": "Chile",
        "is_bolivian_gem": false,
        "overall_psi": 71.0,
        "subscores": {
          "topography": 71.5,
          "mineralogy": 51.3,
          "environment": 93.4
        }
      },
      {
        "analog_id": "valle_de_la_luna_bolivia",
        "analog_name": "Valle de la Luna (Valley of the Moon)",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 65.8,
        "subscores": {
          "topography": 84.5,
          "mineralogy": 30.4,
          "environment": 85.2
        }
      },
      {
        "analog_id": "laguna_colorada",
        "analog_name": "Laguna Colorada (Eduardo Abaroa Reserve)",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 64.2,
        "subscores": {
          "topography": 68.4,
          "mineralogy": 35.6,
          "environment": 92.4
        }
      },
      {
        "analog_id": "salar_de_uyuni",
        "analog_name": "Salar de Uyuni",
        "country": "Bolivia",
        "is_bolivian_gem": true,
        "overall_psi": 55.9,
        "subscores": {
          "topography": 59.4,
          "mineralogy": 19.3,
          "environment": 94.7
        }
      },
      {
        "analog_id": "rio_tinto",
        "analog_name": "Río Tinto Acidic River",
        "country": "Spain",
        "is_bolivian_gem": false,
        "overall_psi": 52.4,
        "subscores": {
          "topography": 72.1,
          "mineralogy": 31.5,
          "environment": 53.9
        }
      }
    ]
  }
};
