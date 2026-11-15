"""
Comprehensive Multi-Planetary Database: Mars, Moon, and Terrestrial Analogs.
Includes all historic, active, and proposed mission landing sites, bases, and global analogs.
"""
from typing import Dict, Any, List

# ==============================================================================
# MARS SITES (Misiones históricas, rovers activos y sitios propuestos de bases)
# ==============================================================================
MARS_SITES: Dict[str, Dict[str, Any]] = {
    "jezero_crater": {
        "id": "jezero_crater",
        "name": "Cráter Jezero",
        "body": "Mars",
        "type": "Rover & Astrobiología Activa",
        "mission": "NASA Mars 2020 / Rover Perseverance + Ingenuity",
        "coordinates": {"lat": 18.38, "lng": 77.58},
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
            "predominant": ["Arcillas esmectitas (nontronita)", "Sulfatos (yeso)", "Carbonato de magnesio", "Olivino", "Basalto piroxénico"],
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
        "best_earth_analogs": ["salar_de_uyuni", "laguna_colorada", "sol_de_manana", "valle_de_la_luna_bolivia"]
    },

    "gale_crater": {
        "id": "gale_crater",
        "name": "Cráter Gale (Monte Sharp / Aeolis Mons)",
        "body": "Mars",
        "type": "Rover & Estratigrafía Activa",
        "mission": "NASA Mars Science Laboratory / Rover Curiosity",
        "coordinates": {"lat": -5.40, "lng": 137.80},
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
            "predominant": ["Sulfatos de magnesio y calcio", "Hematita", "Filosilicatos", "Feldespato plagioclasa", "Magnetita"],
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
        "best_earth_analogs": ["sol_de_manana", "mcmurdo_dry_valleys", "valle_de_la_luna_bolivia", "rio_tinto"]
    },

    "meridiani_planum": {
        "id": "meridiani_planum",
        "name": "Meridiani Planum",
        "body": "Mars",
        "type": "Sitio Histórico de Aterrizaje",
        "mission": "NASA Mars Exploration Rover / Opportunity",
        "coordinates": {"lat": -0.20, "lng": 354.50},
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
            "predominant": ["Hematita cristalina", "Jarosita (sulfato hidratado de hierro)", "Yeso", "Basalto"],
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
        "best_earth_analogs": ["rio_tinto", "salar_de_uyuni", "atacama_yungay"]
    },

    "gusev_crater": {
        "id": "gusev_crater",
        "name": "Cráter Gusev (Home Plate)",
        "body": "Mars",
        "type": "Sitio Histórico de Hidrotermalismo",
        "mission": "NASA Mars Exploration Rover / Spirit",
        "coordinates": {"lat": -14.57, "lng": 175.47},
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
            "predominant": ["Sílice opalina pura (>90%)", "Basalto olivínico", "Sulfatos de hierro", "Piroxeno"],
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
        "best_earth_analogs": ["sol_de_manana", "laguna_colorada", "askja_iceland"]
    },

    "valles_marineris": {
        "id": "valles_marineris",
        "name": "Valles Marineris (Coprates Chasma)",
        "body": "Mars",
        "type": "Sitio Propuesto para Base Humana Primaria",
        "mission": "Futuras Misiones Tripuladas de la NASA & ESA",
        "coordinates": {"lat": -14.00, "lng": 298.00},
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
            "predominant": ["Sulfatos hidratados masivos", "Óxidos de hierro", "Arcillas estratificadas en las paredes", "Basalto"],
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
        "best_earth_analogs": ["valle_de_la_luna_bolivia", "nevado_sajama", "mcmurdo_dry_valleys"]
    },

    "arcadia_planitia": {
        "id": "arcadia_planitia",
        "name": "Arcadia Planitia (Sitio Base Mars Alpha)",
        "body": "Mars",
        "type": "Candidato Principal de Hábitat Humano & SpaceX",
        "mission": "Base Humana Permanente de Larga Duración",
        "coordinates": {"lat": 39.30, "lng": 189.70},
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
            "predominant": ["Hielo de agua masivo (pureza >85%) bajo manto protector", "Basalto vesicular", "Polvo eólico oxidado"],
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
        "best_earth_analogs": ["salar_de_uyuni", "mcmurdo_dry_valleys", "nevado_sajama"]
    }
}

# ==============================================================================
# MOON SITES (Misiones históricas Apollo, sondas y bases lunares Artemis)
# ==============================================================================
MOON_SITES: Dict[str, Dict[str, Any]] = {
    "shackleton_crater": {
        "id": "shackleton_crater",
        "name": "Cráter Shackleton (Polo Sur Lunar)",
        "body": "Moon",
        "type": "Objetivo Base Base Artemis III",
        "mission": "NASA Artemis Program / VIPER / Lunar Gateway",
        "coordinates": {"lat": -89.90, "lng": 0.00},
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
            "predominant": ["Anortosita rica en plagioclasa cálcica", "Regolito de grano ultrafino", "Hielo de agua criogénico mezclado con regolito", "Brechas de impacto"],
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
        "best_earth_analogs": ["nevado_sajama", "mcmurdo_dry_valleys", "haughton_crater", "askja_iceland"]
    },

    "tranquility_base": {
        "id": "tranquility_base",
        "name": "Base Tranquilidad (Mare Tranquillitatis)",
        "body": "Moon",
        "type": "Sitio Histórico del Primer Alunizaje Humano",
        "mission": "NASA Apollo 11 (Neil Armstrong & Buzz Aldrin - 20 Julio 1969)",
        "coordinates": {"lat": 0.67, "lng": 23.47},
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
            "predominant": ["Basalto rico en titanio (ilmenita FeTiO3)", "Piroxeno", "Plagioclasa", "Vidrio de impacto"],
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
        "best_earth_analogs": ["askja_iceland", "salar_de_uyuni", "atacama_yungay"]
    },

    "taurus_littrow": {
        "id": "taurus_littrow",
        "name": "Valle Taurus-Littrow",
        "body": "Moon",
        "type": "Sitio Histórico Apollo 17",
        "mission": "NASA Apollo 17 (Gene Cernan & Harrison Schmitt - Última misión Apolo tripulada)",
        "coordinates": {"lat": 20.19, "lng": 30.77},
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
            "predominant": ["Vidrio volcánico piroclástico naranja rico en titanio", "Basalto", "Brechas de impacto de tierras altas"],
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
        "best_earth_analogs": ["sol_de_manana", "nevado_sajama", "askja_iceland"]
    },

    "marius_hills": {
        "id": "marius_hills",
        "name": "Colinas de Marius (Tubo de Lava Lunar)",
        "body": "Moon",
        "type": "Sitio Estratégico de Base Subterránea Lunar",
        "mission": "Futuros Hábitats Subterráneos de la NASA / JAXA",
        "coordinates": {"lat": 14.00, "lng": -56.00},
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
            "predominant": ["Basalto de flujo de lava continuo", "Silicatos de piroxeno y plagioclasa", "Regolito exterior"],
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
        "best_earth_analogs": ["askja_iceland", "sol_de_manana", "nevado_sajama"]
    }
}

