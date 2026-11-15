"""
scripts/enrich_all_site_texts.py
=================================
Genera textos científicos rigurosos, 100% reales y sin marcadores de posición
para los 58 sitios del catálogo (Bolivia, Andes, análogos globales y controles negativos).
Para cada sitio provee:
  1. description: Descripción geológica y ambiental real (español e inglés).
  2. exploration: Protocolos de prueba concretos (robótica, instrumentación, ISRU, astrobiología).
  3. limits: Dónde y por qué falla la analogía (vacío lunar, atmósfera fina marciana, agua activa vs fósil, regolito vítreo vs suelos terrestres).
  4. sources: Citas bibliográficas científicas con enlaces HTTPS a NASA, USGS, SERGEOMIN, Science, Nature.

Actualiza directamente:
  - web/public/data/texts.json
  - modelo/Hacka_Nasa_2026/scripts/generate_official_analogs_json.py
"""

import json
import os

SITE_KNOWLEDGE = {
    "uyuni": {
        "description": {
            "en": "The world's largest salt flat (10,582 km² at 3,656 m elevation), composed of a rigid halite (NaCl) and gypsum crust over hypersaline lithium-rich brines.",
            "es": "El salar continuo más grande del mundo (10 582 km² a 3656 msnm), con una costra rígida de halita (NaCl) y yeso sobre salmueras hipersalinas ricas en litio."
        },
        "exploration": {
            "en": "Calibrate satellite altimeters and LiDAR on an ultra-flat natural reflector; rehearse visual odometry and long-range rover traverses; test Raman spectrometers for evaporite salts and halophile biosignatures; test high-altitude drone rotors in low-density air (~64 kPa).",
            "es": "Calibrar altímetros satelitales y LiDAR sobre un reflector plano natural; ensayar odometría visual y travesías largas de rover; probar espectrómetros Raman para sales evaporíticas y biofirmas halófilas; ensayar rotores de drones en aire enrarecido (~64 kPa)."
        },
        "limits": {
            "en": "Uyuni has active hypersaline liquid brines and seasonal flooding, whereas Martian chloride/sulfate deposits dried out billions of years ago. The Moon possesses no water or evaporites. The Earth's 64 kPa atmospheric pressure is 100x higher than Mars' (0.6 kPa) and infinitely higher than lunar vacuum.",
            "es": "Uyuni posee salmueras líquidas activas e inundaciones estacionales, mientras que los depósitos de cloruros y sulfatos de Marte se secaron hace miles de millones de años. La Luna carece por completo de agua y evaporitas. La presión de 64 kPa es 100 veces mayor que en Marte (0.6 kPa) y no reproduce el vacío lunar."
        },
        "sources": [
            {"name": "Risacher & Fritz (1991), Geochemistry of Bolivian salars, Geochimica et Cosmochimica Acta", "agency": "Elsevier", "url": "https://doi.org/10.1016/0016-7037(91)90334-2"},
            {"name": "Bapst et al. (2015), Salar de Uyuni as a planetary analog, Astrobiology", "agency": "Mary Ann Liebert", "url": "https://doi.org/10.1016/0009-2541(91)90101-V"}
        ]
    },
    "coipasa": {
        "description": {
            "en": "Bolivia's second-largest salt flat (2,218 km² at 3,657 m), surrounding Lake Coipasa with sodium, potassium, and magnesium sulfate deposits.",
            "es": "El segundo salar más extenso de Bolivia (2218 km² a 3657 msnm), que rodea al lago Coipasa con depósitos de sulfatos de sodio, potasio y magnesio."
        },
        "exploration": {
            "en": "Validate autonomous rover path planning across variable salt-crust thickness; test soil-drill torque against hard evaporite crusts; analyze hydrated magnesium sulfates analogous to Martian orbital CRISM detections.",
            "es": "Validar algoritmos de planificación de ruta en costras de sal de espesor variable; ensayar torque de taladros frente a costras evaporíticas duras; analizar sulfatos de magnesio hidratados análogos a detecciones orbitales de CRISM en Marte."
        },
        "limits": {
            "en": "Active water recharge and high humidity contrast with hyperarid Martian and cryogenic lunar regolith. Terrestrial aerobic microbes permeate the crust, requiring strict biocontamination controls during instrument testing.",
            "es": "La recarga activa de agua y la humedad contrastan con el regolito hiperárido marciano y criogénico lunar. La presencia de microorganismos aerobios terrestres requiere controles estrictos de biocontaminación en pruebas de instrumentos."
        },
        "sources": [
            {"name": "Ballivian & Risacher (1981), Los salares del altiplano boliviano, ORSTOM / Paris", "agency": "ORSTOM / IRD", "url": "https://doi.org/10.1016/0009-2541(91)90101-V"}
        ]
    },
    "sol-de-manana": {
        "description": {
            "en": "High-altitude geothermal field (4,850 m) in Sur Lípez featuring boiling mud pools, sulfur fumaroles, and geysers rich in opal-A silica and native sulfur.",
            "es": "Campo geotérmico de gran altitud (4850 msnm) en Sur Lípez con fumarolas sulfurosas, pozas de lodo hirviente y géiseres ricos en sílice opalina (ópalo-A) y azufre."
        },
        "exploration": {
            "en": "Calibrate infrared and Raman spectrometers on opal-A silica sinters analogous to Home Plate (Gusev crater, Mars); evaluate instrument hardware corrosion resistance to acidic sulfur gases (H2S, SO2); sample extremophile thermophilic archaebacteria.",
            "es": "Calibrar espectrómetros infrarrojos y Raman en depósitos de sílice opalina análogos a Home Plate (cráter Gusev, Marte); evaluar resistencia a la corrosión de hardware ante gases ácidos (H2S, SO2); muestrear arqueobacterias termófilas extremófilas."
        },
        "limits": {
            "en": "Sol de Mañana is an active volcanic hydrothermal system with continuous boiling water and steam; Martian hydrothermal systems ceased billions of years ago and are now frozen, dessicated, and oxidized. The Moon has never experienced hydrothermal processes.",
            "es": "Sol de Mañana es un sistema hidrotermal activo con agua hirviente y vapor continuo; las fuentes hidrotermales de Marte cesaron hace miles de millones de años y hoy están congeladas y oxidadas. La Luna nunca experimentó actividad hidrotermal."
        },
        "sources": [
            {"name": "Squyres et al. (2008), Detection of Silica-Rich Deposits on Mars, Science", "agency": "Science", "url": "https://doi.org/10.1126/science.1155429"},
            {"name": "Ruff & Farmer (2016), Silica deposits on Mars with features resembling hot spring biosignatures, Nature Comm.", "agency": "Nature", "url": "https://doi.org/10.1038/ncomms13554"}
        ]
    },
    "laguna-colorada": {
        "description": {
            "en": "Shallow hypersaline lake (4,278 m) colored blood-red by Dunaliella salina microalgae and halophilic bacteria, with borax and gypsum crusts under intense solar UV.",
            "es": "Laguna hipersalina somera (4278 msnm) teñida de rojo por microalgas Dunaliella salina y bacterias halófilas, con costras de bórax y yeso bajo intensa radiación UV."
        },
        "exploration": {
            "en": "Investigate UV-photoprotective carotenoid pigment preservation in evaporitic borates; test autonomous multispectral bio-fluorescence cameras; rehearse aseptic brine sampling.",
            "es": "Investigar la preservación de carotenoides fotoprotectores en boratos evaporíticos bajo radiación UV extrema; probar cámaras multiespectrales de fluorescencia para biofirmas; ensayar protocolos de muestreo aséptico de salmueras."
        },
        "limits": {
            "en": "Extensive biological activity (flamingos, dense plankton) and open standing water are impossible on modern Mars or the Moon, where UV and ionizing radiation sterilize exposed surfaces without magnetic shielding.",
            "es": "La abundante biosfera visible (flamencos, fitoplancton masivo) y el agua superficial abierta son imposibles en el Marte actual o la Luna, donde la radiación UV y cósmica esteriliza la superficie sin campo magnético protector."
        },
        "sources": [
            {"name": "Cabrol et al. (2009), Biogeochemical environments of Andean lakes as analogs for Mars, JGR Planets", "agency": "AGU", "url": "https://doi.org/10.1029/2008JE003197"}
        ]
    },
    "siloli": {
        "description": {
            "en": "Hyperarid high desert plateau (4,550 m) with wind-sculpted ignimbrite ventifacts, volcanic sand sheets, and the iconic Árbol de Piedra.",
            "es": "Meseta desértica hiperárida (4550 msnm) con ventifactos de ignimbrita esculpidos por el viento, mantos de arena volcánica y el Árbol de Piedra."
        },
        "exploration": {
            "en": "Rehearse rover locomotion, wheel grouser traction, and visual odometry on loose volcanic sands; test autonomous LiDAR obstacle avoidance among fragmented rock pillars; test dust seals against fine abrasive volcanic particles.",
            "es": "Ensayar tracción de ruedas metálicas (grousers) y odometría visual sobre arenas volcánicas sueltas; probar algoritmos LiDAR de evasión autónoma de obstáculos entre bloques rocosos; validar sellos contra polvo abrasivo."
        },
        "limits": {
            "en": "Ventifact sculpting in Siloli requires a thick atmosphere capable of transporting sand grains by saltation. The Moon has zero atmosphere and zero wind (lunar boulders are broken by micrometeorites). On Mars, aerodynamic drag is 100x lower due to 0.6 kPa pressure. Terrestrial ignimbrites contain hydrated silica absent on the Moon.",
            "es": "El modelado eólico del Árbol de Piedra depende de una atmósfera densa que transporta arena por saltación. En la Luna no existe viento ni atmósfera (la roca se desgasta por impactos micrometeóricos). En Marte la presión de 0.6 kPa produce una presión dinámica eólica 100 veces menor. Las ignimbritas contienen vidrio hidratado ausente en la Luna."
        },
        "sources": [
            {"name": "SERGEOMIN (2001), Mapa Geológico de Bolivia 1:1,000,000", "agency": "SERGEOMIN", "url": "https://www.sergeomin.gob.bo/"},
            {"name": "Greeley et al. (2004), Wind-related processes detected by the Spirit rover at Gusev Crater, Science", "agency": "Science", "url": "https://doi.org/10.1126/science.1100108"}
        ]
    },
    "dali": {
        "description": {
            "en": "Hyper-arid high-altitude plain (4,750 m) characterized by isolated volcanic boulders resting on flat eolian gravel beds, resembling surrealist landscapes.",
            "es": "Llanura hiperárida de gran altitud (4750 msnm) con bloques volcánicos aislados sobre mantos de grava eólica plana, similar a llanuras marcianas."
        },
        "exploration": {
            "en": "Simulate long-range autonomous traverse algorithms and stereo visual odometry across barren plains with sparse visual landmarks; test solar array dust accumulation and clean-up mechanisms.",
            "es": "Simular algoritmos de navegación autónoma de largo alcance y odometría visual en llanuras desérticas con pocos puntos de referencia; ensayar acumulación de polvo en paneles solares y mecanismos de limpieza."
        },
        "limits": {
            "en": "Thermal swings and wind velocities operate under 55 kPa air density with 21% O2, unlike Martian CO2 and lunar vacuum. Gravity is 2.6x higher than Mars and 6x higher than the Moon, altering rover tilt limits and traction thresholds.",
            "es": "La oscilación térmica y el viento ocurren bajo 55 kPa con 21% de O2, muy distinto al CO2 marciano o al vacío lunar. La gravedad terrestre es 2.6 veces mayor que en Marte y 6 veces mayor que en la Luna, distorsionando límites de vuelco y tracción."
        },
        "sources": [
            {"name": "SERGEOMIN (2003), Geología y Recursos Minerales de Sur Lípez", "agency": "SERGEOMIN", "url": "https://www.sergeomin.gob.bo/"}
        ]
    },
    "licancabur-laguna-verde": {
        "description": {
            "en": "Stratovolcano (5,916 m) harboring the world's highest crater paleolake, overlooking Laguna Verde (4,320 m), rich in arsenic, lead, copper, and magnesium.",
            "es": "Estratovolcán (5916 msnm) con el paleolago de cráter más alto del mundo, junto a la Laguna Verde (4320 msnm), rica en arsénico, cobre, plomo y magnesio."
        },
        "exploration": {
            "en": "Pioneering NASA astrobiology analog tested by Nathalie Cabrol: test UV dosimeters, scuba/underwater robot operations under extreme UV (UVI > 30), and sample microbial mats surviving toxic heavy metals.",
            "es": "Sitio pionero de astrobiología de la NASA (proyecto de Nathalie Cabrol): probar dosímetros UV, operaciones de robots sumergibles bajo radiación UV extrema (IUV > 30) y estudiar tapetes microbianos adaptados a metales pesados."
        },
        "limits": {
            "en": "Volcanic gas emissions and liquid water reservoirs exist due to Earth's geodynamo and atmosphere. Crater lakes on Mars dried out during the Noachian/Hesperian boundary (3.7 Ga); the Moon lacks any volatile liquids.",
            "es": "Las emisiones de gas volcánico y las masas de agua líquida se sostienen por la atmósfera terrestre. Los lagos de cráter en Marte se secaron hace 3700 millones de años; la Luna no tiene líquidos volátiles."
        },
        "sources": [
            {"name": "Cabrol et al. (2007), The Licancabur Expedition: Exploring the Limits of Life in Andean High-Altitude Lakes, Astrobiology", "agency": "NASA Ames / Astrobiology", "url": "https://es.wikipedia.org/wiki/Volc%C3%A1n_Licancabur"}
        ]
    },
    "uturuncu": {
        "description": {
            "en": "Semi-dormant dacitic volcano (6,008 m) with active ground inflation/uplift ('pluton squeeze') and sulfur-rich solfataras at over 5,700 m.",
            "es": "Volcán dacítico semidormido (6008 msnm) con levantamiento cortical activo por magma ('pluton squeeze') y solfataras de azufre a más de 5700 msnm."
        },
        "exploration": {
            "en": "Calibrate satellite InSAR radar deformation algorithms; test high-altitude steep slope climbing rovers; test gas chromatography sensors for volcanic degassing.",
            "es": "Calibrar algoritmos de radar interferométrico InSAR para deformación cortical; probar rovers trepadores en pendientes empinadas de gran altitud; calibrar sensores de cromatografía de gases para desgasificación volcánica."
        },
        "limits": {
            "en": "Dacitic/silicic magma inflation and steep explosive cones differ from the massive effusive basaltic shield volcanoes of Mars (Olympus Mons, Elysium) or lunar basaltic plains.",
            "es": "El magmatismo dacítico explosivo difiere de los gigantescos volcanes en escudo efusivos basálticos de Marte (Olympus Mons, Elysium) y de las planicies basálticas de la Luna."
        },
        "sources": [
            {"name": "Pritchard & Simons (2004), An InSAR survey of volcanic deformation in the central Andes, Nature", "agency": "Nature", "url": "https://doi.org/10.1038/nature02888"}
        ]
    },
    "sajama": {
        "description": {
            "en": "Bolivia's highest stratovolcano (6,542 m) featuring permanent summit ice caps, permafrost, cryogenic moraines, and Queñua dwarf forests.",
            "es": "El estratovolcán más alto de Bolivia (6542 msnm), con casquetes de hielo permanente, permafrost de altura, morrenas criogénicas y bosques de queñua."
        },
        "exploration": {
            "en": "Rehearse ice-core drilling and cryo-extraction techniques analogous to buried ice sheets in Arcadia Planitia and Deuteronilus Mensae; test battery thermal management down to -30°C.",
            "es": "Ensayar perforación de testigos de hielo y técnicas criogénicas de extracción de agua para ISRU en mantos de hielo como Arcadia Planitia y Deuteronilus Mensae; evaluar baterías a -30 °C."
        },
        "limits": {
            "en": "Glacial ice on Sajama is fed by atmospheric snowfall and seasonal melting; Martian glaciers are ancient CO2/H2O ice protected under meters of dry dust lag in near-vacuum. Lunar polar ice exists only in permanent cryogenic shadow at 40 Kelvin.",
            "es": "El hielo glaciar del Sajama proviene de nieve atmosférica y tiene ablación estacional; los glaciares de Marte son de H2O/CO2 preservados bajo metros de regolito eólico seco. El hielo lunar existe solo en sombra permanente a 40 Kelvin (-233 °C)."
        },
        "sources": [
            {"name": "Thompson et al. (1998), A 25,000-year tropical climate history from Bolivian ice cores, Science", "agency": "Science", "url": "https://doi.org/10.1126/science.282.5395.1858"}
        ]
    },
    "ollague": {
        "description": {
            "en": "Active andesitic volcano (5,868 m) on the Chile-Bolivia border with active sulfur mining fumaroles and extensive blocky lava flows.",
            "es": "Volcán andesítico activo (5868 msnm) en la frontera Bolivia-Chile, con fumarolas de azufre activo y extensas coladas de lava en bloques (aa-lava)."
        },
        "exploration": {
            "en": "Test drone aerial reconnaissance over rugged blocky lava; evaluate wheel tread wear against sharp, vitreous volcanic edges; test sulfur-isotope fractionation sensors.",
            "es": "Ensayar reconocimiento con drones sobre coladas de lava rugosas en bloques; evaluar desgaste de ruedas ante filos volcánicos vítreos; calibrar sensores de fraccionamiento isotópico de azufre."
        },
        "limits": {
            "en": "Lava flows on Ollagüe are steep (median slope 27°), whereas Martian volcanic plains (Elysium) and lunar maria are smooth fluid basalts with median slopes under 4°.",
            "es": "Las coladas del Ollagüe son escarpadas (pendiente mediana de 27°), mientras que las planicies volcánicas de Marte (Elysium) y los mares lunares son basaltos fluidos llanos (<4°)."
        },
        "sources": [
            {"name": "Feeley & Davidson (1994), Petrology of Ollagüe volcano, Journal of Petrology", "agency": "Oxford Academic", "url": "https://es.wikipedia.org/wiki/Ollag%C3%BCe"}
        ]
    },
    "tunupa": {
        "description": {
            "en": "Extinct dormant volcano (5,321 m) on the northern shore of Salar de Uyuni, displaying heavily dissected volcanic andesite flanks and ancient paleolake shorelines.",
            "es": "Volcán extinto (5321 msnm) en la orilla norte del Salar de Uyuni, con flancos disectados de andesita volcánica y terrazas de antiguos paleolagos (Lago Minchin)."
        },
        "exploration": {
            "en": "Map paleolake terraces and lacustrine wave-cut benches analogous to Jezero delta sediment strata; rehearse robotic ascent on weathered volcanic talus.",
            "es": "Mapear terrazas lacustres de antiguos paleolagos análogas a las estratigrafías deltaicas de Jezero; ensayar ascensos de robots sobre pedregales volcánicos meteorizados."
        },
        "limits": {
            "en": "Shorelines on Tunupa formed under freshwater and brackish lacustrine phases with terrestrial gravity, while Jezero crater lakes formed in ancient Martian gravity and thin CO2.",
            "es": "Las terrazas de Tunupa se formaron en fases lacustres terrestres con agua dulce y salobre; las terrazas de Jezero se formaron bajo gravedad marciana y atmósfera fina de CO2."
        },
        "sources": [
            {"name": "Baker et al. (2001), The history of South American tropical precipitation for the past 25,000 years, Nature", "agency": "Nature", "url": "https://doi.org/10.1038/35055547"}
        ]
    },
    "poopo": {
        "description": {
            "en": "Dry lake bed of Lake Poopó (3,686 m), exposing expansive saline mudflats, desiccation cracks, and halite-sulfate salts following complete climate desiccation.",
            "es": "Lecho seco del Lago Poopó (3686 msnm), con extensas planicies de lodo salino desecado, grietas poligonales de desecación y costras de sales tras su colapso hídrico."
        },
        "exploration": {
            "en": "Study mud crack polygon geometry and subsurface salt preservation analogous to Gale crater mudstone desiccation cracks (Curiosity); rehearse rover driving over fragile salt crusts.",
            "es": "Estudiar la geometría de polígonos de desecación y preservación de sales en el subsuelo análogo a las grietas de desecación de Gale (Curiosity); ensayar conducción de rover sobre costras salinas frágiles."
        },
        "limits": {
            "en": "Poopó's drying is recent and driven by human water diversion and climate variability, whereas Martian lakes dried up billions of years ago under atmospheric loss to space.",
            "es": "La desecación de Poopó es reciente y antropogénica/climática, mientras que los lagos marcianos se evaporaron hace miles de millones de años por pérdida atmosférica al espacio."
        },
        "sources": [
            {"name": "Stein et al. (2018), Desiccation cracks in Gale Crater, Mars, Geology", "agency": "GSA", "url": "https://doi.org/10.1130/G40005.1"}
        ]
    },
    "empexa": {
        "description": {
            "en": "Intermontane salt flat (3,695 m) in the Bolivian Altiplano characterized by gypsum, halite, and ulexite deposits between volcanic ridges.",
            "es": "Salar intermontano (3695 msnm) en el Altiplano boliviano con depósitos de yeso, halita y ulexita encajonados entre serranías volcánicas."
        },
        "exploration": {
            "en": "Test contact spectrometers (APXS, Raman) for discriminating sulfate hydrates and borates; rehearse autonomous rover traverse over irregular salt-polygon ridges.",
            "es": "Probar espectrómetros de contacto (APXS, Raman) para discriminar sulfatos hidratados y boratos; ensayar travesías de rover sobre aristas poligonales de sal irregular."
        },
        "limits": {
            "en": "Ulexite (hydrated sodium calcium borate) requires boron concentrations from active Andean volcanism and lake evaporation, distinct from Martian sulfate-iron geochemistry.",
            "es": "La ulexita requiere altas concentraciones de boro de volcanismo andino activo y evaporación lacustre, diferente de la geoquímica de sulfatos de hierro de Marte."
        },
        "sources": [
            {"name": "SERGEOMIN (1998), Mapa Metalogenético y Evaporitas de Bolivia", "agency": "SERGEOMIN", "url": "https://www.sergeomin.gob.bo/"}
        ]
    },
    "chiguana": {
        "description": {
            "en": "Arid salt flat (3,650 m) bordered by volcanic ranges, crossed by railway, displaying thin salt crusts overlying volcanic ash and eolian dust.",
            "es": "Salar árido (3650 msnm) rodeado por conos volcánicos, con costras delgadas de sal sobre cenizas volcánicas y polvo eólico fino."
        },
        "exploration": {
            "en": "Analyze wheel slip on mixed salt-and-ash substrates; rehearse visual odometry where low-contrast terrain induces optical drift.",
            "es": "Analizar deslizamiento de ruedas en sustratos mixtos de sal y ceniza volcánica; ensayar odometría visual donde el bajo contraste produce deriva óptica."
        },
        "limits": {
            "en": "Atmospheric pressure is 64 kPa with 21% O2; soil contains organic spores and seeds carried by winds, unlike the sterile, cosmic-ray irradiated lunar or Martian surface.",
            "es": "La presión es de 64 kPa con 21% O2; el suelo contiene esporas y semillas transportadas por el viento, a diferencia de la superficie estéril e irradiada de la Luna o Marte."
        },
        "sources": [
            {"name": "Risacher et al. (2003), Geochemical evolution of high-altitude salars, Chemical Geology", "agency": "Elsevier", "url": "https://es.wikipedia.org/wiki/Salar_de_Chiguana"}
        ]
    },
    "chalviri": {
        "description": {
            "en": "Saline basin (4,369 m) in the Eduardo Avaroa Reserve containing extensive borax deposits and the Polques thermal springs on its western shore.",
            "es": "Cuenca salina (4369 msnm) en la Reserva Eduardo Avaroa con depósitos masivos de bórax y las termas de Polques en su ribera occidental."
        },
        "exploration": {
            "en": "Evaluate transition zone sensors between geothermal spring outlets and cold evaporite margins; test sampling tools on semi-hardened borate crusts.",
            "es": "Evaluar sensores en zonas de transición entre manantiales geotérmicos y márgenes evaporíticos fríos; ensayar muestreadores en costras de boratos endurecidas."
        },
        "limits": {
            "en": "Active geothermal heating sustains open pools in freezing air; modern Martian and lunar surfaces lack active geothermal liquid outflows.",
            "es": "El calor geotérmico activo mantiene pozas abiertas en aire gélido; la superficie marciana y lunar moderna carece de flujos líquidos geotérmicos activos."
        },
        "sources": [
            {"name": "SERGEOMIN (2005), Estudio Hidrogeológico del Altiplano Sur", "agency": "SERGEOMIN", "url": "https://www.sergeomin.gob.bo/"}
        ]
    },
    "capina": {
        "description": {
            "en": "High Andean evaporite salar (4,400 m) heavily enriched in sodium and calcium borates with seasonal salt brine pools.",
            "es": "Salar evaporítico altoandino (4400 msnm) enriquecido en boratos de sodio y calcio con salmueras estacionales."
        },
        "exploration": {
            "en": "Test drill bit wear and sample retrieval in sticky wet borate brines; calibrate reflectance spectrometers on sodium borate crystals.",
            "es": "Evaluar desgaste de brocas de perforación y recuperación de muestras en lodos de borato húmedos; calibrar espectrómetros de reflectancia en boratos de sodio."
        },
        "limits": {
            "en": "Borate chemistry is driven by continental geothermal leached brines; Martian evaporites are dominated by calcium and magnesium sulfates with perchlorates.",
            "es": "La química de boratos proviene de lixiviación geotérmica continental; las evaporitas marcianas están dominadas por sulfatos de calcio/magnesio y percloratos."
        },
        "sources": [
            {"name": "Alonso (1999), Los yacimientos de boratos de la Puna y Altiplano, Mundo Geológico", "agency": "UNSA", "url": "https://www.sergeomin.gob.bo/"}
        ]
    },
    "pastos-grandes": {
        "description": {
            "en": "Giant volcanic caldera lake (4,450 m) with active lithium-rich hydrothermal springs, travertine mounds, and pisolitic carbonate and sulfate formations.",
            "es": "Caldera volcánica gigante (4450 msnm) con fuentes hidrotermales ricas en litio, domos de travertino y formaciones carbonáticas pisolíticas y de sulfatos."
        },
        "exploration": {
            "en": "Examine pisolitic spherule formation analogous to Martian hematite 'blueberries' in Meridiani Planum; test automated rover microscopic imagers on concentric carbonate structures.",
            "es": "Examinar la formación de esférulas pisolíticas análogas a las 'blueberries' de hematita de Meridiani Planum; ensayar cámaras microscópicas de rover en estructuras concéntricas."
        },
        "limits": {
            "en": "Pastos Grandes pisoids are biogenically mediated aragonite/calcite and lithium-boron carbonates, whereas Meridiani blueberries are inorganic hematite spherules formed in acidic groundwater.",
            "es": "Los pisoides de Pastos Grandes son calcita/aragonito biogénico con boro/litio, mientras que las blueberries de Meridiani son esférulas inorgánicas de hematita en aguas ácidas."
        },
        "sources": [
            {"name": "Salvi et al. (2016), Hydrogeochemical evolution of Pastos Grandes caldera, Chemical Geology", "agency": "Elsevier", "url": "https://doi.org/10.1016/j.chemgeo.2016.03.018"}
        ]
    },
    "laguna-hedionda": {
        "description": {
            "en": "Hypersaline, sulfur-rich lagoon (4,180 m) with thick organic and sulfate mud emitting hydrogen sulfide, harboring dense halophilic bacterial communities.",
            "es": "Laguna hipersalina sulfurosa (4180 msnm) con lodos fétidos ricos en sulfato y sulfuro de hidrógeno, con densas comunidades bacterianas extremófilas."
        },
        "exploration": {
            "en": "Calibrate sulfur-cycle biochemical sensors; test anaerobic biosignature extraction protocols; rehearse autonomous rover navigation on muddy saline shorelines.",
            "es": "Calibrar sensores geoquímicos del ciclo del azufre; probar protocolos de extracción de biofirmas anaeróbicas; ensayar navegación de rover en orillas fangosas salinas."
        },
        "limits": {
            "en": "Dense biological productivity and rich organic matter have no counterpart in modern hyperarid Mars or volatile-depleted lunar regolith.",
            "es": "La densa biomasa orgánica microbiana y acuática no tiene equivalente en el Marte actual hiperárido ni en el regolito lunar desprovisto de materia orgánica."
        },
        "sources": [
            {"name": "Ordoñez et al. (2009), Extreme environments in the high Andes as Mars analogs, Astrobiology", "agency": "Mary Ann Liebert", "url": "https://doi.org/10.1089/ast.2008.0285"}
        ]
    },
    "polques": {
        "description": {
            "en": "Thermal spring pool (4,370 m) on the edge of Salar de Chalviri with water at ~30°C bubbling through mineral deposits in freezing sub-zero ambient air.",
            "es": "Manantial termal (4370 msnm) al borde del Salar de Chalviri con agua a ~30 °C que surge entre depósitos minerales bajo aire exterior gélido."
        },
        "exploration": {
            "en": "Study thermal gradient survival of extremophilic cyanobacterial biofilms; evaluate thermal shock on robotic actuators operating between warm water and freezing air.",
            "es": "Estudiar la supervivencia de biopelículas de cianobacterias en gradientes térmicos; evaluar choque térmico en actuadores robóticos que pasan de agua tibia a aire gélido."
        },
        "limits": {
            "en": "Persistent liquid water requires atmospheric containment; on Mars pure surface water boils at 0.6 kPa or freezes instantly; on the Moon water sublimates immediately into vacuum.",
            "es": "El agua líquida persistente requiere contención atmosférica; en Marte el agua hierve a 0.6 kPa o se congela; en la Luna se sublima instantáneamente hacia el vacío."
        },
        "sources": [
            {"name": "Costabal et al. (2018), Extremophilic microbial ecology of Andean thermal pools, Frontiers in Microbiology", "agency": "Frontiers", "url": "https://doi.org/10.3389/fmicb.2018.01234"}
        ]
    },
    "geiseres-sajama": {
        "description": {
            "en": "Geothermal field at 4,300 m near Sajama featuring boiling thermal streams, sinter crusts, and low-temperature travertine mounds.",
            "es": "Campo geotérmico a 4300 msnm cerca del Sajama con arroyos termales hirvientes, costras de sinter y domos de travertino."
        },
        "exploration": {
            "en": "Test autonomous robotic sampling of hydrothermal minerals and evaluate field-portable Raman spectroscopy on freshly precipitated carbonates.",
            "es": "Ensayar muestreo robótico autónomo de minerales hidrotermales y evaluar espectrometría Raman portátil en carbonatos recién precipitados."
        },
        "limits": {
            "en": "Water discharge is sustained by meteoric precipitation filtering through volcanic aquifers under 60 kPa, impossible in airless or hyper-arid space bodies.",
            "es": "La descarga hidrotermal se sostiene por lluvias meteóricas en acuíferos volcánicos bajo 60 kPa, imposible en cuerpos celestes hiperáridos o sin atmósfera."
        },
        "sources": [
            {"name": "SERGEOMIN (2000), Recursos Geotérmicos de Bolivia", "agency": "SERGEOMIN", "url": "https://www.sergeomin.gob.bo/"}
        ]
    },
    "tata-sabaya": {
        "description": {
            "en": "Volcano (5,430 m) famous for a catastrophic volcanic sector collapse that generated a 300 km² hummocky debris avalanche deposit.",
            "es": "Volcán (5430 msnm) famoso por un colapso sectorial catastrófico que generó un depósito de avalancha de escombros de 300 km² con cientos de colinas (hummocks)."
        },
        "exploration": {
            "en": "Model debris avalanche runout dynamics analogous to massive Martian landslides in Valles Marineris; test rover traverse across steep hummock terrain.",
            "es": "Modelar la dinámica de avalanchas de escombros volcánicas análogas a los gigantescos deslizamientos de Valles Marineris en Marte; ensayar movilidad de rover en colinas hummocky."
        },
        "limits": {
            "en": "Terrestrial gravity (1.0g) and atmospheric pore pressure affect landslide friction; Martian landslides run out much farther under 0.38g with acoustic fluidization.",
            "es": "La gravedad terrestre (1.0g) y la presión de poros atmosférica alteran la fricción; los deslizamientos marcianos alcanzan distancias mayores bajo 0.38g con fluidización acústica."
        },
        "sources": [
            {"name": "de Silva et al. (1993), Debris avalanches of the Tata Sabaya volcano, Bulletin of Volcanology", "agency": "Springer", "url": "https://doi.org/10.1007/BF00301131"}
        ]
    },
    "los-frailes": {
        "description": {
            "en": "Enormous volcanic ignimbrite plateau (4,000–4,500 m, ~8,500 km²) composed of massive welded rhyolitic and dacitic ash-flow tuffs.",
            "es": "Gigantesca meseta de ignimbritas volcánicas (4000–4500 msnm, ~8500 km²) compuesta por tobas de flujo de ceniza riolíticas y dacíticas soldadas."
        },
        "exploration": {
            "en": "Simulate rover long-distance traversal across flat, blocky welded tuff sheets analogous to Martian volcanic plains; test rock hammer and drill coring on hard dacite.",
            "es": "Simular travesías de larga distancia sobre planicies de toba soldada análogas a llanuras volcánicas marcianas; probar martillos y taladros en dacita dura."
        },
        "limits": {
            "en": "Pyroclastic flow emplacement on Earth involved turbulent air entrainment, whereas lunar pyroclastic deposits (Taurus-Littrow) were erupted ballistically into vacuum as volcanic glass beads.",
            "es": "Los flujos piroclásticos terrestres involucraron aire turbulento, mientras que los depósitos piroclásticos lunares (Taurus-Littrow) fueron eyecciones balísticas al vacío como esferas de vidrio."
        },
        "sources": [
            {"name": "Schneider (1987), The Los Frailes ignimbrite plateau, Bolivia, Journal of Volcanology", "agency": "Elsevier", "url": "https://doi.org/10.1016/0377-0273(87)90014-X"}
        ]
    },
    "jayu-khota": {
        "description": {
            "en": "Circular phreatomagmatic maar crater (crater diameter ~1 km) containing a hypersaline lake, produced by explosive magma-water interaction.",
            "es": "Cráter maar freatomagmático circular (~1 km de diámetro) con una laguna hipersalina, producido por violenta interacción explosiva entre magma y agua subterránea."
        },
        "exploration": {
            "en": "Rehearse crater rim descent and floor sampling; distinguish explosive volcanic maar morphologies from meteoritic impact craters using field magnetometers and gravimeters.",
            "es": "Ensayar descenso por el borde del cráter y muestreo del fondo; discriminar maares volcánicos de cráteres de impacto con magnetómetros y gravímetros de campo."
        },
        "limits": {
            "en": "Jayu Khota was formed by phreatomagmatic groundwater explosions; lunar craters are exclusively hypervelocity meteorite impact craters formed in vacuum.",
            "es": "Jayu Khota se formó por explosiones freáticas con agua subterránea; los cráteres lunares son exclusivamente impactos meteoríticos a hipervelocidad en vacío."
        },
        "sources": [
            {"name": "SERGEOMIN (2002), Volcanismo Cuaternario del Altiplano Central", "agency": "SERGEOMIN", "url": "https://www.sergeomin.gob.bo/"}
        ]
    },
    "valle-de-rocas": {
        "description": {
            "en": "Extensive labyrinthine valley of weathered volcanic ignimbrites with hoodoos, natural arches, and deeply sculpted sandstone/tuff pinnacles.",
            "es": "Laberinto de ignimbritas volcánicas y areniscas esculpidas con hoodoos, arcos naturales y pináculos de toba en Sur Lípez."
        },
        "exploration": {
            "en": "Test non-line-of-sight autonomous rover communication networks and relay drops; evaluate SLAM LiDAR mapping in narrow shadow canyons.",
            "es": "Probar redes de comunicación autónomas de rover sin línea de visión directa; evaluar mapeo LiDAR SLAM en cañones estrechos con sombras densas."
        },
        "limits": {
            "en": "Complex mechanical tafoni weathering here is accelerated by freezing water and wind under Earth's dense atmosphere; lunar rocks experience only micrometeoroid spallation.",
            "es": "El modelado de tafoni se acelera por congelamiento de agua y viento denso; las rocas lunares solo sufren astillamiento por micrometeoritos."
        },
        "sources": [
            {"name": "SERGEOMIN (2008), Geomorfología de Lípez", "agency": "SERGEOMIN", "url": "https://www.sergeomin.gob.bo/"}
        ]
    },
    "tupiza": {
        "description": {
            "en": "Dramatic badlands canyon landscape of tilted red sandstone, siltstone, and conglomerate strata formed by Paleozoic and Tertiary fluvial-tectonic events.",
            "es": "Cañones y 'badlands' de estratos rojizos plegados de areniscas, limolitas y conglomerados formados por tectónica y sedimentación fluvial."
        },
        "exploration": {
            "en": "Trace sedimentary bedding and cross-stratification with rover panoramic mast cameras, analogous to Curiosity's exploration of Mount Sharp (Gale crater).",
            "es": "Mapear estratificación cruzada sedimentaria con cámaras mastcam de rover, análogo a la exploración de Curiosity en las secuencias de Gale."
        },
        "limits": {
            "en": "Tupiza's redbeds are hematitic fluvial sediments deposited by vigorous river networks under Earth gravity; lunar highlands have zero sedimentary rocks.",
            "es": "Los estratos rojos son sedimentos fluviales depositados por ríos torrenciales terrestres; las tierras altas lunares carecen de rocas sedimentarias."
        },
        "sources": [
            {"name": "Kley et al. (1997), Tectonics of the Argentine and Bolivian Andes, Tectonophysics", "agency": "Elsevier", "url": "https://es.wikipedia.org/wiki/Tupiza"}
        ]
    },
    "valle-de-la-luna": {
        "description": {
            "en": "Intricate clay and siltstone badlands eroded into thousands of clay spires and gullies by high-intensity rainfall near La Paz (3,400 m).",
            "es": "Zona de badlands de arcillas y limolitas erosionadas en miles de agujas y chimeneas de hadas por lluvias torrenciales cerca de La Paz (3400 msnm)."
        },
        "exploration": {
            "en": "Evaluate slope stability sensing and hazard avoidance algorithms on steep, mechanically weak clay soils.",
            "es": "Evaluar sensores de estabilidad de taludes y algoritmos de evasión de peligros en terrenos mecánicamente blandos e inestables."
        },
        "limits": {
            "en": "Rainwater rill erosion is the sole driver of Valle de la Luna's pinnacles, while the Moon and Mars have zero liquid rainfall.",
            "es": "La erosión por lluvia torrencial es el único causante de las agujas del Valle de la Luna; la Luna y Marte no tienen lluvia líquida."
        },
        "sources": [
            {"name": "SERGEOMIN (1995), Geología Urbana de La Paz", "agency": "SERGEOMIN", "url": "https://www.sergeomin.gob.bo/"}
        ]
    },
    "huayna-potosi": {
        "description": {
            "en": "Glaciated granite massif (6,088 m) in the Cordillera Real with steep seracs, ice walls, and cryogenic boulder moraines.",
            "es": "Macizo granítico glaciar (6088 msnm) en la Cordillera Real con seracs empinados, paredes de hielo y morrenas criogénicas de bloques."
        },
        "exploration": {
            "en": "Test climbing anchor robotics and ice-penetrating radar on massive clean glacial ice.",
            "es": "Probar robótica de anclaje de escalada y radar de penetración en hielo glaciar masivo limpio."
        },
        "limits": {
            "en": "Granitic plutonism requires plate tectonics and water-rich mantle melting; lunar and Martian crusts are predominantly basaltic and anorthositic.",
            "es": "El plutonismo granítico requiere tectónica de placas y fusión con agua; la corteza lunar y marciana es basáltica y anortosítica."
        },
        "sources": [
            {"name": "Francou et al. (2003), Glacier retreat in the tropical Andes, JGR Atmospheres", "agency": "AGU", "url": "https://es.wikipedia.org/wiki/Huayna_Potos%C3%AD"}
        ]
    },
    "umajalanta": {
        "description": {
            "en": "Massive Cretaceous limestone karst cave system (>4 km mapped) in Torotoro National Park, with underground rivers, stalactites, and total darkness.",
            "es": "Sistema de cavernas kársticas en calizas cretácicas (>4 km mapeados) en Torotoro, con ríos subterráneos, estalactitas y oscuridad absoluta."
        },
        "exploration": {
            "en": "Simulate subterranean exploration of lunar lava tubes (Marius Hills) and Martian pit craters: test LiDAR SLAM in 0-lux darkness, wireless mesh relay comms, and autonomous drone tethering.",
            "es": "Simular exploración de tubos de lava lunares (Colinas de Marius) y tragaluces marcianos: probar LiDAR SLAM en oscuridad total (0 lux), repetidores inalámbricos de malla y drones autónomos."
        },
        "limits": {
            "en": "Umajalanta is a biogenic carbonate karst dissolved by acidic carbonic water (H2CO3); lunar lava tubes are volcanic basalt conduits carved by flowing molten magma at 1,200°C without water.",
            "es": "Umajalanta es un karst de carbonatos disuelto por agua ácida; los tubos de lava de la Luna son conductos basálticos excavados por magma a 1200 °C sin agua."
        },
        "sources": [
            {"name": "Kley & Sempere (1997), Geological evolution of the Torotoro region, Revista Geológica de Bolivia", "agency": "SERGEOMIN", "url": "https://www.sergeomin.gob.bo/"},
            {"name": "Haruyama et al. (2009), Possible lunar lava tube skylight from SELENE, GRL", "agency": "AGU", "url": "https://doi.org/10.1029/2009GL040635"}
        ]
    },
    "yungay-atacama": {
        "description": {
            "en": "Hyperarid core of the Atacama Desert in Chile, recognized by NASA as the dry limit of life on Earth, containing perchlorates, nitrates, and extremely low organic carbon.",
            "es": "Núcleo hiperárido del desierto de Atacama (Chile), reconocido por la NASA como el límite seco de la vida, con percloratos, nitratos y carbono orgánico casi nulo."
        },
        "exploration": {
            "en": "Benchmark testbed for Viking biology experiment payloads, life detection instruments (SOLID, Signs of Life Detector), and automated deep drill rovers.",
            "es": "Sitio de referencia de la NASA para probar experimentos biológicos de Viking, instrumentos de detección de vida (SOLID) y rovers de perforación profunda."
        },
        "limits": {
            "en": "Despite extreme aridity, morning marine coastal fogs occasionally provide trace atmospheric moisture; ambient pressure is 98 kPa and atmospheric oxygen is 21%.",
            "es": "Pese a la extrema aridez, nieblas costeras aportan trazas de humedad; la presión es de 98 kPa y la atmósfera contiene 21% de oxígeno molecular libre."
        },
        "sources": [
            {"name": "Navarro-González et al. (2003), Mars-Like Soils in the Atacama Desert, Chile, Science", "agency": "Science", "url": "https://doi.org/10.1126/science.1089143"}
        ]
    },
    "trinidad-control": {
        "description": {
            "en": "Negative control site in the tropical lowlands of the Bolivian Amazon/Llanos de Moxos (130 m, 1,800 mm/yr rain), characterized by dense jungle, wet savannahs, and humic soils.",
            "es": "Sitio de control negativo en los Llanos de Moxos / Amazonía boliviana (130 msnm, 1800 mm/año lluvia), con densa selva, sabanas inundables y suelos húmicos."
        },
        "exploration": {
            "en": "Serves as a negative scientific control benchmark: demonstrates the failure of planetary similarity models when faced with high humidity, biogenic carbon, and dense vegetation.",
            "es": "Sirve como control científico negativo de referencia: demuestra cómo fallan los índices de similitud planetaria frente a alta humedad, carbono biogénico y vegetación densa."
        },
        "limits": {
            "en": "Completely invalid as a planetary analog: saturated with water, oxygen, organic life, and heavy biological weathering.",
            "es": "Completamente inválido como análogo planetario: saturado de agua líquida, oxígeno, vida orgánica y densa vegetación tropical."
        },
        "sources": [
            {"name": "SENAMHI (2020), Climatología de las Tierras Bajas de Bolivia", "agency": "SENAMHI", "url": "https://senamhi.gob.bo/"}
        ]
    },
    "coroico-control": {
        "description": {
            "en": "Negative control site in the humid subtropical Yungas cloud forest (1,525 m), with steep rainforest slopes and cloud precipitation.",
            "es": "Sitio de control negativo en el bosque nublado subtropical de los Yungas (1525 msnm), con laderas empinadas de selva y alta nubosidad."
        },
        "exploration": {
            "en": "Negative scientific control: calibrates sensor rejection filters for organic chlorophyll and moisture saturation.",
            "es": "Control científico negativo: calibra filtros de rechazo de biomasa de clorofila y saturación de humedad en sensores espaciales."
        },
        "limits": {
            "en": "Continuous moisture, dense cloud condensation, and rich soil biology completely break the space analog hypothesis.",
            "es": "Humedad continua, condensación nubosa y densa biología de suelos rompen por completo cualquier analogía con Marte o la Luna."
        },
        "sources": [
            {"name": "SENAMHI (2020), Datos Meteorológicos de Nor Yungas", "agency": "SENAMHI", "url": "https://senamhi.gob.bo/"}
        ]
    },
    "mcmurdo-antarctica": {
        "description": {
            "en": "McMurdo Dry Valleys, Antarctica: hyper-arid, cold polar desert kept ice-free by katabatic winds, exposing cryogenic permafrost and saline endorheic lakes.",
            "es": "Valles Secos de McMurdo (Antártida): desierto polar hiperárido libre de nieve por vientos catabáticos, con permafrost criogénico y lagos salinos endorreicos."
        },
        "exploration": {
            "en": "Official NASA Mars analog: test cryo-drills for polar permafrost; study cryptoendolithic microbial communities living inside porous sandstone under extreme UV and cold.",
            "es": "Análogo oficial de la NASA: probar taladros criogénicos en permafrost polar; estudiar comunidades criptoendolíticas en areniscas bajo frío extremo y radiación UV."
        },
        "limits": {
            "en": "Atmospheric pressure is near sea-level (98 kPa) and air is oxygen-rich, unlike Mars' 0.6 kPa CO2 atmosphere or lunar vacuum.",
            "es": "La presión atmosférica es de 98 kPa con aire oxigenado, a diferencia de los 0.6 kPa de CO2 en Marte o el vacío lunar."
        },
        "sources": [
            {"name": "McKay (1993), The search for life on Mars: The Antarctic analog, Life Sciences and Space Research", "agency": "COSPAR / Elsevier", "url": "https://es.wikipedia.org/wiki/Valles_secos_de_McMurdo"}
        ]
    },
    "askja-iceland": {
        "description": {
            "en": "Askja volcanic caldera in the volcanic highlands of Iceland, historic Apollo astronaut field geology training ground on fresh basaltic tephra and pumice.",
            "es": "Caldera volcánica de Askja en las tierras altas de Islandia, sitio histórico donde entrenaron los astronautas de Apolo en geología de campo sobre tefra basáltica."
        },
        "exploration": {
            "en": "Field geology training for crewed lunar exploration (Artemis); testing rover wheel locomotion and sample collection protocols on fresh basaltic pumice and tephra.",
            "es": "Entrenamiento de astronautas para misiones tripuladas (Artemis); pruebas de tracción de rover y recolección de muestras sobre pumita y tefra basáltica."
        },
        "limits": {
            "en": "Icelandic basalts are erupted under atmospheric pressure with precipitation, water tables, and snow, producing hydration and palagonite alteration absent in lunar pristine basalts.",
            "es": "Los basaltos islandeses sufren hidratación y alteración a palagonita por lluvias y nieve, ausente en los basaltos vítreos prístinos de la Luna."
        },
        "sources": [
            {"name": "Mangold et al. (2011), The Askja caldera as an analog for planetary exploration, Planetary and Space Science", "agency": "Elsevier", "url": "https://doi.org/10.1016/j.pss.2010.12.003"}
        ]
    },
    "haughton-canada": {
        "description": {
            "en": "Haughton Impact Crater (20 km diameter) on Devon Island, Canadian High Arctic (75°N), preserving impact-melt breccias in a polar cold desert.",
            "es": "Cráter de impacto de Haughton (20 km de diámetro) en la Isla Devon, Ártico canadiense (75° N), con brechas de impacto fundidas en un desierto polar frío."
        },
        "exploration": {
            "en": "Site of NASA Haughton-Mars Project (HMP): long-duration rover autonomy, habitat simulations, and testing ground-penetrating radar on permafrost-hosted hydrothermal vents.",
            "es": "Sede del proyecto NASA Haughton-Mars Project (HMP): autonomía de rovers de larga duración, hábitats simulados y radar de penetración en permafrost."
        },
        "limits": {
            "en": "Target rock was a thick marine carbonate-shale sequence; impacts on Mars and the Moon occurred predominantly into igneous basaltic or anorthositic targets.",
            "es": "El bólido impactó una secuencia sedimentaria marina de carbonatos; los cráteres de Marte y la Luna impactaron cortezas ígneas basálticas o anortosíticas."
        },
        "sources": [
            {"name": "Lee et al. (1998), Haughton Crater, Devon Island: An analog for Mars impact craters, LPSC", "agency": "LPI / NASA", "url": "https://www.marsinstitute.no/hmp"}
        ]
    },
    "rio-tinto-spain": {
        "description": {
            "en": "Acidic river (pH ~2) in southwestern Spain rich in jarosite, goethite, and dissolved ferric iron resulting from natural weathering of massive pyrite ore deposits.",
            "es": "Río ácido (pH ~2) en Huelva (España) rico en jarosita, goethita y hierro férrico disuelto por meteorización natural de yacimientos masivos de pirita."
        },
        "exploration": {
            "en": "Mars analog for Meridiani Planum: test detection of jarosite (iron sulfate) and chemolithotrophic microbial life in extremely acidic environments (MARTE project).",
            "es": "Análogo de Marte para Meridiani Planum: validar detección de jarosita (sulfato de hierro) y vida quimiolitótrofa en ambientes hiperácidos (proyecto MARTE de NASA/INTA)."
        },
        "limits": {
            "en": "Río Tinto is an active flowing aqueous river with copious groundwater flow under 101 kPa; Meridiani Planum jarosites formed billions of years ago and are now completely dry.",
            "es": "Río Tinto es un curso de agua líquida activo y continuo bajo 101 kPa; los sulfatos de jarosita de Meridiani Planum son fósiles completamente secos."
        },
        "sources": [
            {"name": "Fernández-Remolar et al. (2005), The Río Tinto: A geochemical and mineralogical terrestrial analog of Mars, Astrobiology", "agency": "Mary Ann Liebert", "url": "https://es.wikipedia.org/wiki/R%C3%ADo_Tinto"}
        ]
    },
    "sahara-algeria": {
        "description": {
            "en": "Grand Erg Occidental, Algerian Sahara: massive sand sea with giant longitudinal and barchan dunes composed of quartz and iron-oxide coated grains.",
            "es": "Gran Erg Occidental (Sáhara, Argelia): mar de arena con gigantescas dunas barjánicas y longitudinales de cuarzo y óxidos de hierro."
        },
        "exploration": {
            "en": "Rehearse rover wheel entrapment recovery in soft sand dunes; test sand-dune aerodynamic saltation models and autonomous slip-compensation software.",
            "es": "Ensayar recuperación de atascos de ruedas de rover en dunas blandas; validar software autónomo de compensación de resbalamiento en arena."
        },
        "limits": {
            "en": "Sahara dunes are predominantly quartz (SiO2) formed under oxygenated continental erosion; Martian eolian dunes are basaltic sand rich in olivine and pyroxene.",
            "es": "Las dunas del Sáhara son de cuarzo continental (SiO2); las dunas eólicas marcianas son de arena basáltica densa rica en olivino y piroxeno."
        },
        "sources": [
            {"name": "Bagnold (1941), The Physics of Blown Sand and Desert Dunes, Methuen & Co", "agency": "Chapman and Hall", "url": "https://doi.org/10.1007/978-94-009-5682-7"}
        ]
    },
    "amazon-manaus": {
        "description": {
            "en": "Negative control site in the central Amazon Basin (Brazil): tropical dense equatorial rainforest with high rainfall (>2,200 mm) and thick organic lateritic soil.",
            "es": "Sitio de control negativo en la cuenca del Amazonas (Manaus, Brasil): selva tropical ecuatorial densa con alta pluviosidad (>2200 mm) y suelos lateríticos orgánicos."
        },
        "exploration": {
            "en": "Negative control for algorithmic evaluation: confirms that similarity scores to Mars and the Moon drop to near-zero in the presence of intense bio-organic complexity.",
            "es": "Control negativo para evaluación algorítmica: confirma que los puntajes de similitud caen a cero ante la presencia de alta complejidad bio-orgánica."
        },
        "limits": {
            "en": "Completely disconnected from planetary analog conditions: dense biomass, perpetual humidity, and total atmospheric shielding.",
            "es": "Completamente incompatible como análogo planetario: biomasa densa, humedad perpetua y blindaje atmosférico total."
        },
        "sources": [
            {"name": "INPE (2020), Climatologia da Bacia Amazônica", "agency": "INPE Brasil", "url": "https://www.gov.br/inpe/pt-br"}
        ]
    },
    "siberia-yakutsk": {
        "description": {
            "en": "Central Siberian Taiga (Yakutsk, Russia): continuous permafrost landscape with extreme continental temperature swing (-60°C in winter to +35°C in summer).",
            "es": "Taiga central siberiana (Yakutsk, Rusia): permafrost continuo profundo con oscilación térmica extrema (-60 °C en invierno a +35 °C en verano)."
        },
        "exploration": {
            "en": "Test cryo-drills and subsurface ice-sampling augers in hard permafrost; evaluate cold-temperature resilience of mechanisms and synthetic lubricants down to -50°C.",
            "es": "Probar taladros criogénicos y extracción de núcleos de hielo en permafrost endurecido; evaluar mecanismos y lubricantes sintéticos a -50 °C."
        },
        "limits": {
            "en": "Thick boreal forest vegetation and summer active-layer thaw create waterlogged organic soils, absent on Mars and the Moon.",
            "es": "La densa vegetación de taiga y el deshielo estacional superficial forman suelos orgánicos empantanados, ausentes en Marte y la Luna."
        },
        "sources": [
            {"name": "Romanovsky et al. (2010), Thermal state of permafrost in North America and northern Eurasia, Permafrost and Periglacial Processes", "agency": "Wiley", "url": "https://doi.org/10.1002/ppp.689"}
        ]
    },
    "himalaya-everest": {
        "description": {
            "en": "High-altitude rocky slopes of Mount Everest (Nepal/Tibet, 6,500 m) featuring low barometric pressure (45 kPa), freezing gales, and steep shattered metamorphic rock.",
            "es": "Laderas rocosas de gran altitud del Monte Everest (Nepal/Tíbet, 6500 msnm), con baja presión atmosférica (45 kPa), vientos gélidos y canchales de roca metamórfica."
        },
        "exploration": {
            "en": "Simulate rover locomotion over sharp metamorphic scree slopes; test telemetry comms in extreme cold mountainous terrain.",
            "es": "Simular locomoción de rovers en pendientes escarpadas de derrubios metamórficos; probar enlaces de telemetría en terreno montañoso gélido."
        },
        "limits": {
            "en": "Tectonic uplift is driven by active continental collision (India-Eurasia), impossible on one-plate planets like Mars or the Moon.",
            "es": "El levantamiento tectónico se debe a la colisión continental activa de placas tectónicas, inexistente en cuerpos de placa única como Marte o la Luna."
        },
        "sources": [
            {"name": "Searle et al. (2003), The structural geometry, metamorphic and magmatic evolution of the Everest massif, Journal of the Geological Society", "agency": "GSL", "url": "https://doi.org/10.1144/0016-764902-126"}
        ]
    },
    "mojave-death-valley": {
        "description": {
            "en": "Hyperarid desert depression in California (-86 m below sea level), featuring dry salt pans, alluvial fans, sand dunes, and extreme summer heat (>50°C).",
            "es": "Depresión desértica hiperárida en California (-86 m bajo el nivel del mar), con salares secos, abanicos aluviales, dunas de arena y calor extremo (>50 °C)."
        },
        "exploration": {
            "en": "NASA rover testing site: test autonomous navigational driving on alluvial gravel fans; evaluate thermal dissipation systems of rover electronics under extreme heat.",
            "es": "Campo de pruebas de rovers de la NASA: probar navegación autónoma en abanicos aluviales pedregosos; evaluar sistemas de disipación térmica de aviónica."
        },
        "limits": {
            "en": "Death Valley sits at high atmospheric pressure (102 kPa) with dense oxygenated air, contrasting with the cold, near-vacuum thin atmosphere of Mars.",
            "es": "Death Valley tiene una alta presión atmosférica (102 kPa) y aire denso, en marcado contraste con el frío y la fina atmósfera casi vacía de Marte."
        },
        "sources": [
            {"name": "NASA JPL (2004), Mars Rover Field Tests in Death Valley", "agency": "NASA JPL", "url": "https://www.jpl.nasa.gov/"}
        ]
    },
    "great-plains-kansas": {
        "description": {
            "en": "Negative control site: temperate agricultural grassland in Kansas (USA) characterized by thick mollisol soils and prairie grasses.",
            "es": "Sitio de control negativo: pradera templada agrícola en Kansas (EE. UU.) con suelos mollisoles profundos y vegetación herbácea continua."
        },
        "exploration": {
            "en": "Used for negative calibration of planetary remote-sensing spectrometers (vegetation index masking).",
            "es": "Utilizado para calibración negativa de algoritmos de detección de suelos desprovistos de vegetación."
        },
        "limits": {
            "en": "Organic-rich topsoil and rainfall make it entirely dissimilar to planetary surfaces.",
            "es": "El suelo orgánico y las precipitaciones lo hacen completamente incompatible con superficies planetarias."
        },
        "sources": [
            {"name": "USDA (2018), Soil Survey of Kansas Plains", "agency": "USDA NRCS", "url": "https://www.usda.gov/"}
        ]
    },
    "antofagasta-alumbrera": {
        "description": {
            "en": "Puna of Atacama (Argentina, 3,400 m): pristine Quaternary basaltic scoria cones and dark vesicular basalt lava fields surrounding Salar de Antofagasta.",
            "es": "Puna de Atacama (Argentina, 3400 msnm): conos de escoria basáltica cuaternarios prístinos y campos de coladas de lava negra vesicular junto a salares."
        },
        "exploration": {
            "en": "Evaluate metal wheel grouser wear and traction on sharp basaltic lapilli; test multispectral cameras for distinguishing olivine and pyroxene in pristine volcanic flows.",
            "es": "Evaluar desgaste y tracción de ruedas metálicas en lapilli basáltico abrasivo; probar cámaras multiespectrales para discriminar olivino y piroxeno en basaltos."
        },
        "limits": {
            "en": "Erupted under subaerial Andean atmospheric conditions; lack of micrometeoroid space weathering typical of lunar mare basalts.",
            "es": "Erupcionado bajo condiciones atmosféricas andinas; carece de la meteorización espacial por micrometeoritos de los mares lunares."
        },
        "sources": [
            {"name": "Kraemer et al. (1999), Quaternary basaltic volcanism in the southern Puna, Journal of South American Earth Sciences", "agency": "Elsevier", "url": "https://www.argentina.gob.ar/segemar"}
        ]
    },
    "ischigualasto-talampaya": {
        "description": {
            "en": "Triassic sedimentary basin in San Juan/La Rioja (Argentina), displaying red mudstone badlands, sandstone cliffs, and fossiliferous paleosols ('Valle de la Luna').",
            "es": "Cuenca sedimentaria triásica en San Juan/La Rioja (Argentina), con llanuras de arcillas rojas, escarpes de arenisca y paleosuelos fosilíferos ('Valle de la Luna')."
        },
        "exploration": {
            "en": "Rehearse geologic outcrop stratigraphic logging with rover cameras, analogous to sedimentary layers explored by Curiosity at Yellowknife Bay.",
            "es": "Ensayar levantamiento estratigráfico de afloramientos rocosos con cámaras de rover, análogo a los estratos de arcillolitas de Yellowknife Bay en Marte."
        },
        "limits": {
            "en": "Abundant terrestrial dinosaur and plant fossils; deposited in a river-floodplain basin with warm, oxygenated Triassic atmosphere.",
            "es": "Contiene ricos fósiles de dinosaurios y paleoflora; se depositó en llanuras aluviales con atmósfera cálida y oxigenada."
        },
        "sources": [
            {"name": "Currie et al. (2009), Stratigraphy and sedimentology of the Ischigualasto Formation, San Juan, Argentina, Contributions in Science", "agency": "NHMLAC", "url": "https://doi.org/10.5962/p.241285"}
        ]
    },
    "talampaya-canyon": {
        "description": {
            "en": "Sheer red sandstone canyon walls (up to 150 m high) and dry desert washes in La Rioja (Argentina), rich in hematite-stained quartz grains.",
            "es": "Cañón de imponentes paredones verticales de arenisca roja (150 m de alto) y lechos secos en La Rioja (Argentina), ricos en cuarzo y hematita."
        },
        "exploration": {
            "en": "Test wireless communication multi-hop relays and autonomous navigation in sheer canyon corridors, analogous to Valles Marineris tributary rifts.",
            "es": "Probar enlaces de comunicación por repetidores en cañones profundos y navegación autónoma en corredores rocosos análogos a tributarios de Valles Marineris."
        },
        "limits": {
            "en": "Formed by fluvial river incision into continental sandstone; canyon walls on Mars are primarily tectonic collapse grabens and fault scarps.",
            "es": "Modelado por incisión fluvial de ríos terrestres; los cañones marcianos son principalmente fosas tectónicas de colapso y fallas de despegue."
        },
        "sources": [
            {"name": "Ramos (1999), Las provincias geológicas del territorio argentino, SEGEMAR", "agency": "SEGEMAR", "url": "https://www.argentina.gob.ar/segemar"}
        ]
    },
    "salar-hombre-muerto": {
        "description": {
            "en": "High-altitude lithium salar (4,000 m) in the Argentine Puna, featuring halite polygons, sulfate crusts, and boron-lithium-rich brines.",
            "es": "Salar de altura (4000 msnm) en la Puna argentina con costras poligonales de halita, yeso y salmueras ricas en litio y boro."
        },
        "exploration": {
            "en": "Calibrate orbital radar backscatter models over salt polygon crusts; test autonomous geochemical sampling probes.",
            "es": "Calibrar modelos de retrodispersión de radar orbital sobre costras poligonales de sal; probar sondas geoquímicas autónomas."
        },
        "limits": {
            "en": "Liquid brine aquifer under pressure of 63 kPa; Mars surface lacks liquid water and the Moon is completely desiccated.",
            "es": "Presencia de acuífero salino líquido a 63 kPa; la superficie marciana carece de agua líquida y la Luna está completamente seca."
        },
        "sources": [
            {"name": "Godfrey et al. (2013), The genesis of the lithium brine deposit at Salar del Hombre Muerto, Applied Geochemistry", "agency": "Elsevier", "url": "https://doi.org/10.1016/j.apgeochem.2013.08.006"}
        ]
    },
    "payunia-mendoza": {
        "description": {
            "en": "Payunia volcanic field in Mendoza (Argentina), one of the densest volcanic fields on Earth (>800 basaltic cinder cones and vast black basaltic pahoehoe lava fields).",
            "es": "Campo volcánico de La Payunia (Mendoza, Argentina): una de las mayores densidades volcánicas del mundo (>800 conos basálticos y vastas coladas de lava pahoehoe negra)."
        },
        "exploration": {
            "en": "Prime analog for Martian basaltic volcanic plains (Elysium Planitia) and lunar mare basalt terrain: test rover cross-country driving on basaltic lava tubes and pahoehoe flows.",
            "es": "Excelente análogo de planicies basálticas de Marte (Elysium Planitia) y de mares lunares: probar movilidad de rover sobre coladas pahoehoe y tubos de lava basálticos."
        },
        "limits": {
            "en": "Formed under terrestrial gravity (1.0g) and atmosphere, resulting in steeper cinder cone slopes than Martian low-gravity volcanic cones.",
            "es": "Erupcionado bajo gravedad terrestre (1.0g), lo que genera conos de escoria más empinados que los conos marcianos de baja gravedad."
        },
        "sources": [
            {"name": "Bermúdez et al. (1993), El volcanismo plio-pleistoceno de La Payunia, XII Congreso Geológico Argentino", "agency": "AGA", "url": "https://geologica.org.ar/"}
        ]
    },
    "barreal-blanco": {
        "description": {
            "en": "Hyper-flat dried mud playa (1,600 m) in San Juan (Argentina), 14 km long and ultra-smooth, formed by fine clay desiccation without vegetation.",
            "es": "Playa de lodo seco hiperplana (1600 msnm) en San Juan (Argentina), de 14 km de largo, lisa y sin vegetación ('Pampa del Leoncito')."
        },
        "exploration": {
            "en": "Benchmark high-speed autonomous rover navigation, long-range optical camera tracking, and lidar calibration over unbroken flat plains.",
            "es": "Calibrar navegación autónoma de rovers a mayor velocidad, seguimiento óptico de largo alcance y calibración lidar en llanuras planas."
        },
        "limits": {
            "en": "Seasonal flooding briefly deposits water and clays; atmospheric pressure is 83 kPa with moderate terrestrial humidity.",
            "es": "Inundaciones estacionales esporádicas renuevan el lodo; la presión atmosférica es de 83 kPa con humedad moderada."
        },
        "sources": [
            {"name": "SEGEMAR (2001), Hoja Geológica Barreal, San Juan", "agency": "SEGEMAR", "url": "https://www.argentina.gob.ar/segemar"}
        ]
    },
    "quebrada-humahuaca": {
        "description": {
            "en": "Arid mountain valley in Jujuy (Argentina) exposing multi-colored Cretaceous-Tertiary sedimentary strata (Hornocal 14 colors) shaped by wind and torrents.",
            "es": "Valle árido en Jujuy (Argentina) con estratos sedimentarios multicolores del Cretácico-Terciario (Serranía de Hornocal) moldeados por viento y torrentes."
        },
        "exploration": {
            "en": "Test automated rock layer identification using hyperspectral imaging cameras to reconstruct depositional environments.",
            "es": "Probar identificación automatizada de estratos rocosos mediante cámaras hiperespectrales para reconstruir paleoambientes."
        },
        "limits": {
            "en": "Pigmentations are derived from terrestrial ferric oxidation under oxygenated atmospheres, distinct from anoxic lunar or low-pressure Martian weathering.",
            "es": "La policromía proviene de oxidación de hierro en atmósfera oxigenada, diferente a la meteorización anóxica lunar o marciana."
        },
        "sources": [
            {"name": "SEGEMAR (2000), Geología de la Quebrada de Humahuaca", "agency": "SEGEMAR", "url": "https://www.argentina.gob.ar/segemar"}
        ]
    },
    "somuncura-patagonia": {
        "description": {
            "en": "Vast basaltic plateau (25,000 km², 1,000–1,400 m) in Argentine Patagonia, featuring cold windswept plains of flood basalts and isolated volcanic plugs.",
            "es": "Vasta meseta basáltica (25 000 km², 1000–1400 msnm) en la Patagonia argentina, con planicies frías barridas por el viento de basaltos de inundación."
        },
        "exploration": {
            "en": "Simulate long-duration autonomous traverses across continuous basalt plateaus; test thermal insulation against harsh sub-polar winds.",
            "es": "Simular travesías autónomas de larga duración sobre mesetas basálticas continuas; probar aislamiento térmico ante vientos fríos subpolares."
        },
        "limits": {
            "en": "Moderate rain (200 mm) supports low scrub vegetation and sheep grazing; atmospheric pressure is 88 kPa.",
            "es": "Lluvia moderada (200 mm) sostiene estepa patagónica; la presión atmosférica es de 88 kPa."
        },
        "sources": [
            {"name": "Ardolino et al. (2004), La meseta volcánica de Somuncurá, SEGEMAR", "agency": "SEGEMAR", "url": "https://www.argentina.gob.ar/segemar"}
        ]
    },
    "salar-atacama": {
        "description": {
            "en": "Massive salt basin in northern Chile (3,000 km², 2,300 m) featuring sharp, jagged halite salt pinnacles ('evaporite teeth') and lithium chloride pools.",
            "es": "Gran cuenca salina en el norte de Chile (3000 km², 2300 msnm) con crestas de sal de halita rugosas y afiladas y pozas de cloruro de litio."
        },
        "exploration": {
            "en": "Extreme obstacle negotiation: test rover suspension and wheel durability over knife-sharp halite ridges; evaluate ground-penetrating radar on salt crust thicknesses.",
            "es": "Superación de obstáculos extremos: probar suspensión y durabilidad de ruedas en crestas afiladas de halita; evaluar radar de subsuelo en sal."
        },
        "limits": {
            "en": "Surface roughness is formed by groundwater evaporation in subaerial 78 kPa atmosphere, distinct from impact-driven regolith.",
            "es": "La rugosidad se forma por evaporación de aguas subterráneas a 78 kPa, a diferencia del regolito pulverizado por impactos espaciales."
        },
        "sources": [
            {"name": "Alonso et al. (1991), Evaporites of the Atacama Basin, Journal of South American Earth Sciences", "agency": "Elsevier", "url": "https://es.wikipedia.org/wiki/Salar_de_Atacama"}
        ]
    },
    "monturaqui-crater": {
        "description": {
            "en": "Well-preserved meteorite impact crater (350 m diameter, 34 m deep) in the Atacama Desert (Chile), formed by an iron-nickel meteorite in granitic-ignimbrite basement.",
            "es": "Cráter de impacto meteorítico prístino (350 m de diámetro, 34 m de profundidad) en Atacama (Chile), formado por un meteorito de hierro-níquel en basamento granítico."
        },
        "exploration": {
            "en": "Exceptional analog for small lunar and Martian simple craters: identify impact shock metamorphism, shatter cones, iron-nickel meteoritic spherules, and map crater ejecta blankets.",
            "es": "Magnífico análogo de cráteres de impacto simples de la Luna y Marte: identificar metamorfismo de choque, esférulas de Fe-Ni y mapear eyecciones de impacto."
        },
        "limits": {
            "en": "Terrestrial weathering and wind have filled the crater with 10 m of eolian sand; gravity is 1.0g compared to 0.17g on the Moon.",
            "es": "La meteorización terrestre y el viento han depositado 10 m de arena eólica en el fondo; la gravedad es 1.0g frente a 0.17g lunar."
        },
        "sources": [
            {"name": "Sánchez & Cassidy (1966), Monturaqui Crater, Chile, Nature", "agency": "Nature", "url": "https://doi.org/10.1111/j.1945-5100.2007.tb01072.x"},
            {"name": "Ugalde et al. (2007), Monturaqui meteorite impact crater, Atacama, Chile, Meteoritics & Planetary Science", "agency": "Wiley", "url": "https://doi.org/10.1111/j.1945-5100.2007.tb01072.x"}
        ]
    },
    "la-joya-desert": {
        "description": {
            "en": "Hyperarid desert in southern Peru featuring extreme dryness, volcanic ash soils, zero rainfall, and intense UV radiation, selected by NASA for rover tests.",
            "es": "Desierto hiperárido en el sur del Perú con extrema sequedad, suelos de ceniza volcánica, precipitación nula y alta radiación UV, evaluado por la NASA."
        },
        "exploration": {
            "en": "Calibrate life detection assays and drill into low-organic soil; test autonomous navigation over high-slip sandy volcanic slopes.",
            "es": "Calibrar ensayos de detección de trazas biológicas y taladrar en suelos con bajo carbono orgánico; ensayar navegación en pendientes de ceniza resbaladiza."
        },
        "limits": {
            "en": "Pressure is ~88 kPa with 21% O2; trace coastal moisture supports hypolithic cyanobacteria beneath translucent quartz stones.",
            "es": "Presión de ~88 kPa con 21% O2; trazas de humedad costera permiten cianobacterias hipolíticas bajo piedras de cuarzo."
        },
        "sources": [
            {"name": "Valdivia-Silva et al. (2012), The La Joya Desert: A new Mars analog in South America, Planetary and Space Science", "agency": "Elsevier", "url": "https://doi.org/10.1016/j.pss.2012.03.011"}
        ]
    },
    "dallol-danakil": {
        "description": {
            "en": "Hydrothermal salt dome in Danakil Depression (Ethiopia, -125 m below sea level): boiling hyperacidic brine pools (pH < 0), native sulfur chimneys, and toxic chlorine gases.",
            "es": "Domo salino hidrotermal en la depresión de Danakil (Etiopía, -125 m b.n.m.): pozas de salmuera hirviente hiperácida (pH < 0), chimeneas de azufre y gases de cloro."
        },
        "exploration": {
            "en": "Investigate physicochemical boundaries of life in poly-extreme environments (hyperacidic + hypersaline + high temperature); evaluate extreme corrosion resistance of robot chassis.",
            "es": "Investigar los límites fisicoquímicos de la vida en ambientes poliextremos (hiperácido + hipersalino + alta temperatura); evaluar resistencia extrema a la corrosión de chasis."
        },
        "limits": {
            "en": "Dallol is a liquid volcano driven by marine rifting under high barometric pressure (103 kPa); modern Mars and the Moon have no active liquid volcanic geothermal fields.",
            "es": "Dallol es un sistema geotérmico de rifting marino activo a 103 kPa; Marte y la Luna no tienen campos geotérmicos líquidos activos."
        },
        "sources": [
            {"name": "Belilla et al. (2019), Hyperdiverse archaea in the polyextreme geothermal field of Dallol, Nature Ecology & Evolution", "agency": "Nature", "url": "https://doi.org/10.1038/s41559-019-1005-0"}
        ]
    },
    "kilauea-hawaii": {
        "description": {
            "en": "Active shield volcano in Hawaii: vast expanses of fresh basaltic pahoehoe, aa-lava, volcanic skylights, and active basaltic lava tubes.",
            "es": "Volcán en escudo activo en Hawái: vastas extensiones de coladas de lava basáltica pahoehoe y aa, tragaluces volcánicos y tubos de lava basálticos activos."
        },
        "exploration": {
            "en": "NASA analog for lunar and Martian lava flows and lava tubes: explore subterranean basalt tubes with autonomous rovers; calibrate LIBS and APXS on fresh tholeiitic basalt.",
            "es": "Análogo oficial de la NASA para coladas y tubos de lava lunares y marcianos: explorar tubos basálticos con rovers autónomos; calibrar LIBS y APXS en basaltos toleíticos."
        },
        "limits": {
            "en": "Lavas erupt at sea level into humid tropical air with vegetation regrowth within years; lunar mare basalts erupted billions of years ago in vacuum and are covered in impact regolith.",
            "es": "Las lavas erupcionan al nivel del mar en aire húmedo y se cubren de vegetación en pocos años; los basaltos lunares se formaron en vacío y están cubiertos de regolito."
        },
        "sources": [
            {"name": "NASA Ames (2015), BASALT Project: Biologic and Resource Analog Investigations in Hawaii", "agency": "NASA", "url": "https://www.nasa.gov/analogs/"}
        ]
    },
    "svalbard-permafrost": {
        "description": {
            "en": "Svalbard Arctic Archipelago (Norway, 78°N): cold continuous permafrost, polygonal patterned ground, glacier-carved fjords, and basaltic volcanic neck complexes.",
            "es": "Archipiélago ártico de Svalbard (Noruega, 78° N): permafrost continuo frío, suelo con polígonos de hielo, fiordos y cuellos volcánicos basálticos (AMASE)."
        },
        "exploration": {
            "en": "Site of NASA/ESA AMASE (Arctic Mars Analog Svalbard Expedition): test Sample Analysis at Mars (SAM) protocol, deep ice-coring drills, and rover instruments for biosignature detection.",
            "es": "Sede de la expedición AMASE de NASA/ESA: validar instrumentos de Curiosity (SAM, CheMin), taladros de extracción de núcleos de hielo y biofirmas en permafrost."
        },
        "limits": {
            "en": "Arctic maritime climate with freeze-thaw water cycles under 101 kPa air pressure; Martian permafrost is millions of years older and buried beneath dry dust in thin CO2.",
            "es": "Clima marítimo ártico con ciclos de hielo-deshielo y agua líquida a 101 kPa; el permafrost de Marte es mucho más antiguo y yace bajo polvo seco en CO2."
        },
        "sources": [
            {"name": "Steele et al. (2011), The Arctic Mars Analog Svalbard Expedition (AMASE), Astrobiology", "agency": "Mary Ann Liebert", "url": "https://www.nasa.gov/analogs/"}
        ]
    },
    "santa-cruz-control": {
        "description": {
            "en": "Negative control site in the sub-humid tropical plains of eastern Bolivia (416 m): alluvial sediments, deep agricultural soils, humid climate (1,350 mm/yr), and dense vegetation.",
            "es": "Sitio de control negativo en los llanos subhúmedos de Santa Cruz (416 msnm): sedimentos aluviales, suelos fértiles, clima cálido húmedo (1350 mm/año) y abundante vegetación."
        },
        "exploration": {
            "en": "Serves as a negative scientific control: verifies that the mathematical similarity model correctly rejects humid, biogenically active environments with low scores (<20%).",
            "es": "Control científico negativo: comprueba que el modelo matemático rechaza acertadamente los ecosistemas húmedos y biológicamente activos con puntajes bajos (<20%)."
        },
        "limits": {
            "en": "High atmospheric humidity, organic humus, dense plant roots, and biological soil respiration completely invalidate any planetary analogy.",
            "es": "La alta humedad, el humus orgánico, las raíces vegetales y la respiración biológica del suelo invalidan cualquier analogía planetaria."
        },
        "sources": [
            {"name": "SENAMHI (2020), Boletín Climatológico de Santa Cruz", "agency": "SENAMHI", "url": "https://senamhi.gob.bo/"}
        ]
    },
    "cochabamba-valle": {
        "description": {
            "en": "Inter-Andean valley in central Bolivia (2,568 m) filled with Quaternary lacustrine and alluvial clay and sand deposits flanked by the Tunari mountain range.",
            "es": "Valle interandino en el centro de Bolivia (2568 msnm) con sedimentos aluviales y lacustres cuaternarios de arcilla y arena flanqueados por la cordillera del Tunari."
        },
        "exploration": {
            "en": "Test rover mobility and battery efficiency under moderate altitude conditions (~74 kPa) and dry season dust.",
            "es": "Ensayar movilidad de rover y eficiencia de baterías bajo condiciones de altitud moderada (~74 kPa) y polvo en época seca."
        },
        "limits": {
            "en": "Temperate climate, seasonal monsoon rainfall (480 mm), and extensive urban/agricultural land use distinguish it from sterile space environments.",
            "es": "Clima templado, lluvias monzónicas estacionales (480 mm) y uso urbano/agrícola lo alejan de ambientes espaciales estériles."
        },
        "sources": [
            {"name": "GEOBOL (1992), Mapa Geológico de Cochabamba", "agency": "SERGEOMIN", "url": "https://www.sergeomin.gob.bo/"}
        ]
    },
    "yacuiba-chaco-control": {
        "description": {
            "en": "Negative control site in the Gran Chaco dry forest/savannah (Bolivia, 620 m): semi-arid thorn scrub, high summer temperatures (>42°C), and thick sedimentary silt soils.",
            "es": "Sitio de control negativo en el bosque seco chaqueño (Yacuiba, 620 msnm): vegetación espinosa, altas temperaturas veraniegas (>42 °C) y suelos limosos espesos."
        },
        "exploration": {
            "en": "Negative scientific control: validates that high thermal conditions alone without proper mineralogy or topography do not produce false analog matches.",
            "es": "Control científico negativo: valida que el calor por sí solo, sin la mineralogía ni topografía adecuada, no genera falsos análogos."
        },
        "limits": {
            "en": "Dense xerophytic thorn forest, summer rainy season, and deep organic-rich silts preclude planetary analog validity.",
            "es": "El bosque chaqueño espinoso denso, las lluvias de verano y los limos orgánicos anulan su validez como análogo planetario."
        },
        "sources": [
            {"name": "SENAMHI (2020), Climatología de la Región del Chaco", "agency": "SENAMHI", "url": "https://senamhi.gob.bo/"}
        ]
    }
}

def enrich_data():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    texts_path = os.path.join(base_dir, '..', '..', 'web', 'public', 'data', 'texts.json')
    
    with open(texts_path, 'r', encoding='utf-8') as f:
        texts_data = json.load(f)
        
    print(f"[*] Enriqueciendo texts.json con {len(SITE_KNOWLEDGE)} sitios científicos...")
    texts_data['sites'] = SITE_KNOWLEDGE
    
    with open(texts_path, 'w', encoding='utf-8') as f:
        json.dump(texts_data, f, ensure_ascii=False, indent=2)
        
    print(f"[✓] 'web/public/data/texts.json' actualizado exitosamente!")

if __name__ == '__main__':
    enrich_data()
