# Modelo exploratorio (rol 4)

Primera entrega del rol 4 (PR #1). Es un análisis exploratorio: **la app no usa estos archivos**.

Los datos de la app están medidos con fuentes abiertas en [`docs/valores/`](../docs/valores/README.md)
(`tools/measure_values.py`), y `web/public/data/analogs.json` se genera con `tools/build_analogs.py`
según [`docs/metodo-similitud.md`](../docs/metodo-similitud.md). La revisión de esta entrega está en el
[PR #1](https://github.com/VMKayser/Hackaton_NasaSpace_2026/pull/1).

## Qué hay

| Archivo | Qué es |
|---|---|
| `analogs_ml_pipeline.ipynb` | Notebook con PCA, agrupamiento, `LabelSpreading`, Random Forest y prueba de estabilidad. Sin celdas ejecutadas. |
| `clean_and_curate_planetary_dataset.py` y `scripts/` | Scripts que arman el CSV, el modelo PCA y un `analogs.json` propio. `clean_and_curate_planetary_dataset.py` está repetido en la raíz y en `scripts/`. |
| `predict_planetary_analog.py` | Estima valores para un punto cualquiera a partir del tipo de terreno y de una interpolación entre estaciones. |
| `data/centralized_planetary_dataset.csv` | 76 filas: 58 lugares de la Tierra y 18 objetivos de Marte y la Luna. `cleaned_planetary_dataset.csv` es el mismo archivo. |
| `data/analogs.json`, `data/stations.json` | Salidas de los scripts. |
| `modelos/calibrated_pca_model.json` | Modelo PCA. |
| `ensayo.html`, `ensayo_marte_luna.html` | Páginas sueltas con los resultados. |
| `METODO_IA_SIMILITUD_ANALYSIS.md` | Descripción del método y de los resultados. |

## Límites conocidos

- **Los valores no son mediciones.** Pendiente, relieve, rugosidad, clima y presión de sitios y objetivos
  están escritos a mano en los scripts; en `predict_planetary_analog.py`, el relieve se asigna por tipo de
  terreno (todo salar recibe 0,8°, 1,5 m y 0,35 m) y el clima se interpola entre esas mismas estaciones.
  Las fuentes que se citan no se consultan desde el código.
- El Random Forest aprende a predecir la similitud coseno con Jezero calculada con las mismas variables:
  su importancia de variables repite la fórmula. `LabelSpreading` usa Uyuni, un análogo ya conocido, como
  ejemplo positivo.
- El notebook rellena los datos que faltan con `KNNImputer`; el contrato pide dejarlos en `null`.
- No se puede reproducir tal como está:
  - el notebook lee `data/sitios_valores.csv`, `data/objetivos_valores.csv` y `ayudas/catalogo-sitios.csv`,
    que no están (los equivalentes medidos son `docs/valores/*.csv` y `docs/catalogo-sitios.csv`, con
    otras columnas);
  - `predict_planetary_analog.py` importa `data.bolivia_dem`, que no está;
  - `ensayo_marte_luna.html` carga `data/dem/bolivia_dem_embedded.js`, que no está;
  - los scripts escriben en `output/`, que no está en el repositorio.

## Segunda entrega (15 de noviembre, commits «otro» y «junto»)

- `Hacka_Nasa_2026/` es una copia completa de la carpeta de trabajo del rol 4 dentro de `modelo/`: repite
  los archivos de arriba y suma `data/bolivia_dem.py`, modelos de elevación de Bolivia, texturas,
  `scripts/enrich_all_site_texts.py` y copias antiguas de los documentos del equipo (`ayudas/`).
- Esa entrega también cambiaba la app. **No se incorporó**:
  - `web/public/data/analogs.json` volvía a los valores escritos a mano con `mock: false`;
  - `web/public/data/texts.json` cita 48 artículos con DOI y 29 de ellos no existen o apuntan a otro
    artículo (lista abajo);
  - la ventana «Adaptación» tenía textos fuera de `i18n`, «Marte» fijo, IDs de sitios en el código y
    recomendaciones sin fuente (por ejemplo, 5 a 20 minutos de ida y vuelta para la señal a Marte, cuando
    solo la ida tarda de 3 a 22);
  - los marcadores sobre el mapa del polo sur suponían que la imagen cubre de 80° a 90° S, pero la imagen
    de la NASA está centrada en el cráter Shackleton, de 19 km, con el polo en su borde.
- Sí se incorporó la idea de avisar por qué no hay vista 3D en el polo, con texto en `i18n`.

### DOI de `texts.json` que no se pueden usar

Comprobados en doi.org el 15 de noviembre de 2026.

| Problema | DOI | Cita en el archivo | Lo que hay en ese DOI |
|---|---|---|---|
| No existe | `10.1016/0016-7037(91)90163-P` | Risacher & Fritz (1991), Geochemistry of Bolivian salars, Geochim | — |
| No existe | `10.1089/ast.2014.1258` | Bapst et al. (2015), Salar de Uyuni as a planetary analog, Astrob | — |
| Es otro artículo | `10.1029/2008JE003197` | Cabrol et al. (2009), Biogeochemical environments of Andean lakes | Pommerol 2008 Strength of the H2O near‐infrared absorption bands in hydrated minerals: Effect |
| No existe | `10.1089/ast.2006.0100` | Cabrol et al. (2007), The Licancabur Expedition: Exploring the Li | — |
| Es otro artículo | `10.1038/nature02888` | Pritchard & Simons (2004), An InSAR survey of volcanic deformatio | Tice 2004 Photosynthetic microbial mats in the 3,416-Myr-old ocean |
| No existe | `10.1093/petrology/35.3.617` | Feeley & Davidson (1994), Petrology of Ollagüe volcano, Journal o | — |
| No existe | `10.1038/35054015` | Baker et al. (2001), The history of South American tropical preci | — |
| No existe | `10.1016/S0009-2541(03)00020-0` | Risacher et al. (2003), Geochemical evolution of high-altitude sa | — |
| No existe | `10.1016/S0895-9811(99)00018-0` | Alonso (1999), Los yacimientos de boratos de la Puna y Altiplano, | — |
| Es otro artículo | `10.1016/j.chemgeo.2016.03.018` | Salvi et al. (2016), Hydrogeochemical evolution of Pastos Grandes | Wang 2016 Consumption of atmospheric CO2 via chemical weathering in the Yellow River basin: The Qing |
| Es otro artículo | `10.1089/ast.2008.0285` | Ordoñez et al. (2009), Extreme environments in the high Andes as  | von Bloh 2009 Habitability of Super-Earth Planets Around Other Suns: Models Including Red Giant Branch E |
| Es otro artículo | `10.3389/fmicb.2018.01234` | Costabal et al. (2018), Extremophilic microbial ecology of Andean | Wu 2018 Microbial Interactions With Dissolved Organic Matter Drive Carbon Dynamics and Community S |
| Es otro artículo | `10.1007/BF00301131` | de Silva et al. (1993), Debris avalanches of the Tata Sabaya volc | Koopman 1996 Stratification and age-related differences in blubber fatty acids of the male harbour porp |
| Es otro artículo | `10.1016/0377-0273(87)90014-X` | Schneider (1987), The Los Frailes ignimbrite plateau, Bolivia, Jo | Foden 1987 Reply to comments by S.Self and J.A. Wolff on “The petrology of Tambora volcano. Indonesia |
| No existe | `10.1016/S0040-1951(97)00078-2` | Kley et al. (1997), Tectonics of the Argentine and Bolivian Andes | — |
| No existe | `10.1029/2002JD002953` | Francou et al. (2003), Glacier retreat in the tropical Andes, JGR | — |
| No existe | `10.1016/0273-1177(93)90412-4` | McKay (1993), The search for life on Mars: The Antarctic analog,  | — |
| Es otro artículo | `10.1016/j.pss.2010.12.003` | Mangold et al. (2011), The Askja caldera as an analog for planeta | Glenar 2011 A reanalysis of the Apollo light scattering observations, and implications for lunar exosp |
| No existe | `10.1089/ast.2005.5.449` | Fernández-Remolar et al. (2005), The Río Tinto: A geochemical and | — |
| No existe | `10.1016/S0895-9811(99)00027-1` | Kraemer et al. (1999), Quaternary basaltic volcanism in the south | — |
| Es otro artículo | `10.5962/p.241285` | Currie et al. (2009), Stratigraphy and sedimentology of the Ischi | Saul 1988 New Late Cretaceous and Early Tertiary Perissiiyidae (Gastropoda) from the Pacific Slope o |
| Es otro artículo | `10.1016/j.apgeochem.2013.08.006` | Godfrey et al. (2013), The genesis of the lithium brine deposit a | Soto-Varela 2014 Identifying environmental and geochemical variables governing metal concentrations in a st |
| No existe | `10.1016/0895-9811(91)90029-J` | Alonso et al. (1991), Evaporites of the Atacama Basin, Journal of | — |
| No existe | `10.1038/209252a0` | Sánchez & Cassidy (1966), Monturaqui Crater, Chile, Nature | — |
| Es otro artículo | `10.1111/j.1945-5100.2007.tb01072.x` | Ugalde et al. (2007), Monturaqui meteorite impact crater, Atacama | SCHMITT 2007 In situ seismic measurements in borehole LB‐08A in the Bosumtwi impact structure, Ghana: P |
| Es otro artículo | `10.1016/j.pss.2012.03.011` | Valdivia-Silva et al. (2012), The La Joya Desert: A new Mars anal | Tozzi 2012 Observability of comets with Gaia |
| No existe | `10.1089/ast.2010.0543` | Steele et al. (2011), The Arctic Mars Analog Svalbard Expedition  | — |
| Es otro artículo | `10.1002/2015GL065912` | Bramson et al. (2015), Widespread subsurface water ice in Arcadia | Polashenski 2015 Neither dust nor black carbon causing apparent albedo decline in Greenland's dry snow zone |
| Es otro artículo | `10.1016/j.pss.2021.105252` | Barker et al. (2021), Illumination conditions at the lunar south  | Baul 2021 An appraisal of crustal deformation of the East Coprates Planum, Mars |

## Requisitos

Python 3.10+ con `numpy`, `pandas`, `scipy`, `scikit-learn` y `matplotlib`.
