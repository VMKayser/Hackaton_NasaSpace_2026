# Planetary Similarity Index (PSI) & Terrestrial Analog Validation Report
**NASA Space Apps Challenge** | Generated: `2026-11-14T15:29:03.697602+00:00`

> **Objective**: Identifying high-fidelity planetary analogs beyond conventional sites, spotlighting the high-altitude Bolivian Altiplano as premier testbeds for Lunar and Martian missions.

## 1. Mathematical Formulation of the Planetary Similarity Index (PSI)
The PSI multi-criteria model computes a weighted composite similarity score across three orthogonal domains:

$$PSI = w_{topo} \cdot S_{topo} + w_{mineral} \cdot S_{mineral} + w_{env} \cdot S_{env}$$

- **Topography (weight = 0.35)**: Mean slope Gaussian decay, elevation standard deviation (surface roughness $\sigma_z$), relief difference, and vehicle rollover safety penalties.
- **Mineralogy (weight = 0.35)**: Vector Cosine Similarity $\cos(\vec{M}_E, \vec{M}_T)$ over 6-phase lithological compositions (basalt, sulfates/evaporites, phyllosilicates/clays, iron oxides, silica/anorthosite regolith, and carbonates) combined with Euclidean abundance matching.
- **Environment (weight = 0.3)**: Aridity index ($1 - \text{NDVI}$), extreme solar UV flux, diurnal temperature swings, and an Altiplano thin-atmosphere pressure gradient bonus.

---

## 2. Comparative Rankings for Target Planetary Missions

### Target: Jezero Crater (Mars 2020 Perseverance Site) (Mars)
- **Mission Context**: NASA Mars 2020 / Perseverance Rover - Astrobiology & Paleolake Exploration
- **Coordinates**: 18.38° N, 77.58° E | **Gravity**: 0.38 g | **Surface Pressure**: 0.61 kPa

| Rank | Terrestrial Analog | Country | Bolivian Gem? | Overall PSI | Topo Score | Mineral Score | Env Score | Classification Tier |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **#1** | **Sol de Mañana Geothermal Field** | Bolivia | 🇧🇴 **YES** | **91.4%** | 98.1% | 93.9% | 80.7% | Tier 1 |
| **#2** | **Atacama Desert (Yungay Core)** | Chile | No | **86.8%** | 92.8% | 86.0% | 80.6% | Tier 1 |
| **#3** | **McMurdo Dry Valleys (University Valley)** | Antarctica | No | **83.1%** | 85.3% | 80.9% | 82.9% | Tier 2 |
| **#4** | **Laguna Colorada (Eduardo Abaroa Reserve)** | Bolivia | 🇧🇴 **YES** | **82.2%** | 91.7% | 75.8% | 78.6% | Tier 2 |
| **#5** | **Haughton Impact Crater (Devon Island)** | Canada | No | **77.5%** | 91.9% | 77.2% | 61.2% | Tier 2 |
| **#6** | **Valle de la Luna (Valley of the Moon)** | Bolivia | 🇧🇴 **YES** | **74.9%** | 85.3% | 68.1% | 70.5% | Tier 2 |
| **#7** | **Salar de Uyuni** | Bolivia | 🇧🇴 **YES** | **74.0%** | 84.7% | 58.8% | 79.3% | Tier 2 |
| **#8** | **Río Tinto Acidic River** | Spain | No | **70.1%** | 90.8% | 71.4% | 44.4% | Tier 2 |
| **#9** | **Nevado Sajama & Volcanic Domes** | Bolivia | 🇧🇴 **YES** | **67.9%** | 40.6% | 78.1% | 87.9% | Tier 3 |
| **#10** | **Askja Caldera & Holuhraun Lava** | Iceland | No | **65.2%** | 80.3% | 73.1% | 38.4% | Tier 3 |


### Target: Gale Crater & Mount Sharp (MSL Curiosity Site) (Mars)
- **Mission Context**: NASA Mars Science Laboratory / Curiosity Rover - Habitability & Stratigraphy
- **Coordinates**: 5.40° S, 137.80° E | **Gravity**: 0.38 g | **Surface Pressure**: 0.65 kPa

| Rank | Terrestrial Analog | Country | Bolivian Gem? | Overall PSI | Topo Score | Mineral Score | Env Score | Classification Tier |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **#1** | **Sol de Mañana Geothermal Field** | Bolivia | 🇧🇴 **YES** | **89.7%** | 91.9% | 94.8% | 81.3% | Tier 1 |
| **#2** | **McMurdo Dry Valleys (University Valley)** | Antarctica | No | **87.0%** | 92.5% | 80.8% | 88.0% | Tier 1 |
| **#3** | **Atacama Desert (Yungay Core)** | Chile | No | **81.0%** | 73.1% | 88.4% | 81.6% | Tier 2 |
| **#4** | **Haughton Impact Crater (Devon Island)** | Canada | No | **77.5%** | 92.0% | 72.5% | 66.6% | Tier 2 |
| **#5** | **Laguna Colorada (Eduardo Abaroa Reserve)** | Bolivia | 🇧🇴 **YES** | **75.4%** | 70.1% | 77.7% | 78.9% | Tier 2 |
| **#6** | **Nevado Sajama & Volcanic Domes** | Bolivia | 🇧🇴 **YES** | **75.1%** | 60.3% | 78.7% | 88.0% | Tier 2 |
| **#7** | **Valle de la Luna (Valley of the Moon)** | Bolivia | 🇧🇴 **YES** | **72.0%** | 85.1% | 59.5% | 71.4% | Tier 2 |
| **#8** | **Askja Caldera & Holuhraun Lava** | Iceland | No | **71.0%** | 90.5% | 75.7% | 42.8% | Tier 2 |
| **#9** | **Salar de Uyuni** | Bolivia | 🇧🇴 **YES** | **66.7%** | 60.7% | 61.6% | 79.7% | Tier 3 |
| **#10** | **Río Tinto Acidic River** | Spain | No | **64.9%** | 72.8% | 71.6% | 47.8% | Tier 3 |


### Target: Shackleton Crater (Lunar South Pole - Artemis III Target) (Moon)
- **Mission Context**: NASA Artemis Program - South Pole Permanently Shadowed Regions (PSR) & Water Ice
- **Coordinates**: 89.90° S, 0.00° E | **Gravity**: 0.166 g | **Surface Pressure**: 0.0 kPa

| Rank | Terrestrial Analog | Country | Bolivian Gem? | Overall PSI | Topo Score | Mineral Score | Env Score | Classification Tier |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **#1** | **Nevado Sajama & Volcanic Domes** | Bolivia | 🇧🇴 **YES** | **77.5%** | 88.5% | 60.9% | 84.1% | Tier 2 |
| **#2** | **McMurdo Dry Valleys (University Valley)** | Antarctica | No | **68.5%** | 67.2% | 74.2% | 63.4% | Tier 3 |
| **#3** | **Haughton Impact Crater (Devon Island)** | Canada | No | **62.6%** | 71.3% | 68.1% | 45.9% | Tier 3 |
| **#4** | **Sol de Mañana Geothermal Field** | Bolivia | 🇧🇴 **YES** | **57.4%** | 59.3% | 41.1% | 74.1% | Tier 3 |
| **#5** | **Valle de la Luna (Valley of the Moon)** | Bolivia | 🇧🇴 **YES** | **53.6%** | 69.7% | 27.5% | 65.3% | Tier 4 |
| **#6** | **Askja Caldera & Holuhraun Lava** | Iceland | No | **52.5%** | 79.9% | 45.5% | 28.8% | Tier 4 |
| **#7** | **Atacama Desert (Yungay Core)** | Chile | No | **47.2%** | 34.3% | 36.5% | 74.8% | Tier 4 |
| **#8** | **Laguna Colorada (Eduardo Abaroa Reserve)** | Bolivia | 🇧🇴 **YES** | **42.9%** | 30.8% | 28.3% | 74.3% | Tier 4 |
| **#9** | **Salar de Uyuni** | Bolivia | 🇧🇴 **YES** | **37.5%** | 23.6% | 19.2% | 75.1% | Tier 4 |
| **#10** | **Río Tinto Acidic River** | Spain | No | **32.4%** | 35.5% | 27.6% | 34.5% | Tier 4 |


## 3. Bolivian Hidden Gems: Scientific Highlights & Mission Suitability

### 🇧🇴 Salar de Uyuni (Potosí / Daniel Campos) - Elevation: 3656.0m
*The world's largest salt flat (10,582 km²). Hyper-flat polygonal halite crust overlying dense brine. Pristine planetary analog for ancient closed-basin evaporite deposits on Mars (such as Jezero Crater and Meridiani Planum) and the premier Earth target for satellite laser and radar altimeter calibration (ICESat, MOLA).*

- **Geological Context**: Pleistocene paleolake basin (Lake Minchin / Tauca) transformed into pure evaporite sequences.
- **Key Mineral Phases**: Halite (NaCl), Gypsum (CaSO4·2H2O), Lithium Chloride, Ulexite/Borates, Calcite
- **Ambient Atmospheric Pressure**: `65.2 kPa` (Natural low-density testbed)
- **Recommended Operational Tests**:
  - Surface LiDAR and radar altimetry calibration
  - High-speed autonomous rover long-range transit
  - Evaporite crust drill bit penetration and salt-clogging mitigation
  - UV reflectance spectrometer calibration
- **Unreplicable Terrestrial Gaps (Ficha de Brechas)**:
  - ⚠️ Higher atmospheric pressure (65 kPa vs Mars 0.6 kPa)
  - ⚠️ Earth gravity (1.0g vs Mars 0.38g)
  - ⚠️ Seasonal shallow water film during rainy season (Dec-Feb)


### 🇧🇴 Laguna Colorada (Eduardo Abaroa Reserve) (Potosí / Sud Lípez) - Elevation: 4278.0m
*Shallow hypersaline high-altitude volcanic lake characterized by blood-red pigmentation caused by extremophilic microalgae and Archaea surviving under lethal UV radiation, sub-zero temperatures, and toxic borax/arsenic brines. Foremost astrobiological analog for ancient Martian warm-spring lacustrine environments and biosignature preservation.*

- **Geological Context**: Volcanically fed closed-basin saline lake enriched in borates, sulfates, and volcanic ashes.
- **Key Mineral Phases**: Borax, Gypsum, Halite, Sodium Sulfate, Volcanic Ash (Andesite)
- **Ambient Atmospheric Pressure**: `60.5 kPa` (Natural low-density testbed)
- **Recommended Operational Tests**:
  - Astrobiological biosignature detection (Raman and fluorescence spectrometers)
  - Brine sampling and micro-fluidic life detection instruments
  - Corrosion-resistant amphibious chassis seals
  - Extreme UV radiation sensor calibration
- **Unreplicable Terrestrial Gaps (Ficha de Brechas)**:
  - ⚠️ Terrestrial oxygenated atmosphere
  - ⚠️ Higher thermal floor than modern Mars (-20°C vs -90°C)
  - ⚠️ Avian biosphere presence (flamingos) which must be excluded during testing


### 🇧🇴 Sol de Mañana Geothermal Field (Potosí / Sud Lípez) - Elevation: 4850.0m
*High-energy geothermal field situated at nearly 5,000 meters elevation. Features boiling mud pools, pressurized steam fumaroles emitting sulfurous vapors, and acidic hydrothermal alteration minerals. Direct analog for early Mars hydrothermal systems, Gusev Crater 'Home Plate' silica sinter deposits, and Io's sulfur volcanism.*

- **Geological Context**: Pleistocene to Holocene volcanic geothermal field with intense solfataric and sulfur mineral precipitation.
- **Key Mineral Phases**: Elemental Sulfur, Opaline Silica, Alunite, Pyrite, Jarosite
- **Ambient Atmospheric Pressure**: `56.0 kPa` (Natural low-density testbed)
- **Recommended Operational Tests**:
  - High-temperature hydrothermal vent sensor testing
  - Drill bit testing in boiling acid mud and sulfur encrustations
  - Gas chromatograph and mass spectrometer volcanic emission sniffing
  - Autonomous hazard avoidance in steaming, low-visibility conditions
- **Unreplicable Terrestrial Gaps (Ficha de Brechas)**:
  - ⚠️ Presence of liquid water and active steam vents (modern Mars has no active liquid surface geysers)
  - ⚠️ Earth atmospheric oxygen and 1.0g gravity


### 🇧🇴 Nevado Sajama & Volcanic Domes (Oruro / Sajama National Park) - Elevation: 6542.0m
*Bolivia's highest stratovolcano surrounded by volcanic lava domes, high-altitude permafrost, and blocky andesitic scree. At altitudes between 4,200m and 6,542m, atmospheric density drops to 45%-55% of sea level, making it the premier global testbed for Martian rotorcraft aerodynamics (Ingenuity drone successors) and cryogenic high-slope lunar/Martian rover climbing.*

- **Geological Context**: Extinct Pleistocene composite andesitic stratovolcano with parasitic rhyodacite lava domes and cryoturbation.
- **Key Mineral Phases**: Andesite, Pyroxene, Plagioclase Feldspar, Magnetite, Volcanic Glass
- **Ambient Atmospheric Pressure**: `46.5 kPa` (Natural low-density testbed)
- **Recommended Operational Tests**:
  - Thin-atmosphere aerodynamic rotorcraft flight validation (Mars helicopter/Ingenuity)
  - Steep-slope rover climbing, wheel slip, and tethered rappelling systems
  - Cryogenic permafrost ice-core drilling
  - LiDAR terrain relative navigation over sharp volcanic relief
- **Unreplicable Terrestrial Gaps (Ficha de Brechas)**:
  - ⚠️ Atmosphere is still ~70x denser than Mars surface (~0.6 kPa) despite being ultra-thin for Earth
  - ⚠️ Gravity is 1.0g (vs Moon 0.16g and Mars 0.38g)


### 🇧🇴 Valle de la Luna (Valley of the Moon) (La Paz / Pedro Domingo Murillo) - Elevation: 3400.0m
*A labyrinth of dramatic spires, hoodoos, deep erosion gullies, and clay badlands formed by intense water and wind erosion of clay-rich sedimentary deposits. Striking morphological match for Martian yardangs, weathered delta scarps, and fractured clay deposits in Mawrth Vallis and Jezero.*

- **Geological Context**: Intensely eroded clay, siltstone, and sandstone lacustrine sediments from ancestral glacial lake outflows.
- **Key Mineral Phases**: Smectite Clay, Illite, Quartz Silt, Iron Hydroxides, Calcite
- **Ambient Atmospheric Pressure**: `68.0 kPa` (Natural low-density testbed)
- **Recommended Operational Tests**:
  - Autonomous SLAM navigation and visual odometry in GPS-denied labyrinthine canyon corridors
  - Clay mechanical adhesion testing on rover chassis and wheels
  - Scarp stability and landslide hazard prediction
  - Robotic arm sampling of soft phyllosilicate stratigraphy
- **Unreplicable Terrestrial Gaps (Ficha de Brechas)**:
  - ⚠️ Formed by rainfall runoff rather than aeolian and paleolake processes alone
  - ⚠️ Vegetation presence in adjacent valleys

