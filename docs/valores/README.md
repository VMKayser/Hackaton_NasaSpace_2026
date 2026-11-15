# Valores medidos de sitios y objetivos

Todo lo que necesita `web/public/data/analogs.json`, con su fuente: los valores medidos, los objetivos, la
geología y los pesos. Medido el 15 de noviembre de 2026.

```
pip install -r tools/requirements.txt
python tools/measure_values.py   # mide sitios y objetivos (unos 2 minutos)
python tools/build_analogs.py    # calcula los puntajes y escribe web/public/data/analogs.json
```

| Archivo | Quién lo escribe | Contenido |
|---|---|---|
| `../catalogo-sitios.csv` | a mano (rol 1) | Los 31 sitios: coordenadas, radio, tipo y marcas |
| `objetivos.csv` | a mano (roles 1 y 3) | Los 12 objetivos: coordenadas y entorno geológico, cada uno con su fuente |
| `geologia.csv` | a mano (rol 1) | Entorno geológico de cada sitio con su fuente, y la unidad del mapa geológico en su punto |
| `puntaje.json` | a mano (rol 4) | Dimensiones, pesos y propósitos |
| `pesos.md` | a mano (rol 4) | Las reglas y las fuentes de cada peso, y la prueba de estabilidad |
| `sitios_valores.csv` | `measure_values.py` | Valores medidos de cada sitio |
| `objetivos_valores.csv` | `measure_values.py` | Valores medidos de cada objetivo |
| `fuentes.json` | `measure_values.py` | Unidad y fuentes de cada columna medida |

Una celda vacía es «sin dato» (`null`), nunca cero.

## Objetivos

| Objetivo | Cuerpo | Punto | Entorno geológico |
|---|---|---|---|
| Jezero | Marte | Aterrizaje de Perseverance | Lago antiguo (Mangold et al., 2021) |
| Columbia Hills, Gusev | Marte | Home Plate | Hidrotermal (Squyres et al., 2008) |
| Gale (Bradbury Landing) | Marte | Aterrizaje de Curiosity | Lago antiguo (Grotzinger et al., 2014) |
| Meridiani Planum (Eagle) | Marte | Aterrizaje de Opportunity | Agua poco profunda, evaporación y secado (Squyres et al., 2004) |
| Elysium Planitia (InSight) | Marte | Aterrizaje de InSight | Coladas de basalto (Golombek et al., 2020) |
| Utopia Planitia (Viking 2) | Marte | Aterrizaje de Viking 2 (NASA) | Sin categoría asignada |
| Deuteronilus Mensae | Marte | Reflector basal de radar SHARAD con más detecciones en 5 km (Baker y Carter, ds03) | Glaciar cubierto de detritos (Plaut et al., 2009) |
| Arcadia Planitia (Badger) | Marte | Cráter Badger (Bramson et al., 2015) | Hielo enterrado (Bramson et al., 2015) |
| Shackleton Rim | Luna | Punto A de Bussey et al. (2010) | Sin categoría comparable en la Tierra |
| Connecting Ridge | Luna | Punto B de Bussey et al. (2010) | Igual |
| de Gerlache Rim | Luna | Punto C de Bussey et al. (2010) | Igual |
| Malapert Massif | Luna | Punto M1 de Bussey et al. (2010) | Igual |

Los cuatro puntos lunares están en zonas que la NASA eligió como regiones candidatas de Artemis III (2022).
Las coordenadas y la fuente de cada una están en `objetivos.csv`.

Comprobación: la elevación media medida alrededor de InSight es −2618 m, y Golombek et al. (2020) dan
−2613 m en el punto de aterrizaje. En Viking 2, la MCD con este método da una presión media de 871 Pa;
Viking 2 midió 874 Pa de media en un año marciano (soles 0 a 668, PDS), un 0,3 % más.

Ningún sitio del catálogo tiene hielo enterrado, así que en Arcadia la geología vale 0 para todos. En
Deuteronilus comparten entorno Sajama y Huayna Potosí, pero quedan en los puestos 15 y 24: el punto de
Marte es la superficie casi plana del depósito (pendiente mediana 1,4°) y los glaciares de Bolivia son
de montaña. La analogía falla en el relieve, no en la geología.

Los datos de Marte del rol 3 (Utopia/Viking 2, Deuteronilus y Arcadia) se comprobaron contra fuentes
independientes: [verificacion-rol-3.md](verificacion-rol-3.md).

## Columnas medidas

| Columna | Unidad | Qué es | Tierra | Marte | Luna |
|---|---|---|---|---|---|
| `slope_median_deg` | ° | Pendiente mediana en el círculo | Terrain Tiles | HRSC-MOLA 200 m | LOLA 118 m |
| `slope_p90_deg` | ° | Percentil 90 de la pendiente | Igual | Igual | Igual |
| `roughness_tri_m` | m | Rugosidad: mediana del TRI (diferencia media de altura con las 8 celdas vecinas) | Igual | Igual | Igual |
| `surface_temp_c` | °C | Temperatura media anual de la superficie | NASA POWER `TS` | MCD `tsurf` | sin dato |
| `diurnal_range_c` | °C | Diferencia media entre el máximo y el mínimo del día | NASA POWER `TS_RANGE` | MCD `tsurf` | sin dato |
| `precip_mm_yr` | mm/año | Precipitación anual | NASA POWER `PRECTOTCORR` | 0 por definición | 0 por definición |
| `pressure_hpa` | hPa | Presión media en superficie | NASA POWER `PS` | MCD `ps` | 0 por definición |
| `elevation_m` | m | Elevación media en el círculo (contexto) | Nivel del mar | Areoide de MOLA | Esfera de 1737,4 km |
| `climate_cell_elevation_m` | m | Elevación media de la celda de NASA POWER (contexto) | | | |

## Método

- **Relieve con el mismo paso en todos los cuerpos: 200 m**, la resolución del modelo global de Marte. Cada
  celda de la malla se ubica con la proyección azimutal equidistante, que funciona también junto al polo.
  En la Tierra se usa el zoom de Terrain Tiles cuyo píxel no pasa de 200 m; en Marte y la Luna, los
  modelos globales de USGS leídos por rangos de bytes. La pendiente y el TRI dependen del paso, no del
  radio: cada sitio usa el radio del catálogo (2 o 5 km) y cada objetivo un círculo de 5 km.
- **Clima de la Tierra:** climatología de NASA POWER 2001–2025 en el punto del sitio. La precipitación
  anual suma las medias mensuales por los días de cada mes.
- **Clima de Marte:** Mars Climate Database v6.2, escenario de clima medio, con topografía de alta
  resolución: 24 estaciones (cada 15° de Ls) por 24 horas locales. La media anual pesa cada estación por su
  duración real (excentricidad 0,0934, perihelio en Ls 251°).
- **Por definición, no medidos:** no hay precipitación líquida en Marte ni en la Luna, y la Luna no tiene
  atmósfera apreciable. Todavía no hay fuente de temperatura lunar en el script (Diviner).
- **Geología:** el entorno de cada sitio sale de su fuente (`geologia.csv`). Si ninguna fuente describe el
  sitio, se usa la unidad del mapa geológico de Sudamérica 1:5 000 000 (CGMW, 2019) en su punto, consultada
  en Macrostrat: es el caso de Valle de Rocas y Tupiza. La unidad del mapa se muestra en todos los sitios
  como dato de contexto. A esa escala, el mapa no distingue lagunas pequeñas ni campos geotérmicos, por eso
  no se usa para puntuar.

## Puntajes

`build_analogs.py` aplica `docs/metodo-similitud.md`:
- escala entre los percentiles 5 y 95 de los 31 sitios, ampliada con los objetivos;
- similitud por dimensión `1 − min(1, |Tierra − objetivo| / escala)`;
- en geología, 1 si el sitio y el objetivo comparten entorno y 0 si no;
- media ponderada de las dimensiones con dato y peso positivo.

Los pesos siguen tres reglas publicadas: [pesos.md](pesos.md). Si cambia una coordenada del catálogo, el
script pide volver a medir.

Puesto entre 31 por similitud general (15 de noviembre):

| Sitio | Jezero | Columbia Hills | Gale | Meridiani | InSight | Polo sur lunar (4 puntos) |
|---|---|---|---|---|---|---|
| Yungay, Atacama (referencia) | 20.º | 17.º | 20.º | 19.º | 23.º | 16.º a 18.º |
| Trinidad, Beni (control) | 29.º | 29.º | 29.º | 29.º | 29.º | 31.º |
| Coroico, Yungas (control) | 31.º | 31.º | 31.º | 31.º | 31.º | 30.º |

Los controles quedan abajo, como se esperaba. Atacama queda en la mitad: es análogo de la sequedad, pero es
más cálida y está más baja que el Altiplano, y su geología no es de lago ni hidrotermal.

## Descubrimiento de lugares nuevos

```
python tools/discover.py   # usa malla_puntos.csv si ya existe; --remeasure para medir de nuevo
```

`tools/discover.py` mide una malla del Altiplano y Lípez (de 17,5° S a 23° S y de 65,5° O a 69° O, un punto
cada 0,1°, unos 11 km: 2016 puntos) con el mismo método que los sitios: relieve en un círculo de 2 km con
paso de 200 m, clima de la celda de NASA POWER (consulta por región, con los mismos valores que la consulta
por punto) y entorno geológico leído de la unidad del mapa 1:5 000 000 (evaporitas → cuenca de lago;
andesitas, riolitas y basaltos → volcánico; rocas siliciclásticas y carbonatadas → sedimentario). Puntúa
cada punto frente a cada objetivo con la escala y los pesos de `analogs.json`.

Un punto es nuevo si está a más de 10 km de todo sitio del catálogo, no forma parte del mismo salar que un
sitio (puntos evaporíticos conectados con él) y está en Bolivia según OpenStreetMap. Entre candidatos se
exigen 15 km. La herramienta no propone lugares cuando no puede distinguirlos: si el entorno del objetivo no
se lee en el mapa (hidrotermal, glaciar, hielo enterrado) o si más de 50 puntos empatan a menos de un punto
porcentual del mejor (movilidad de rover, que solo mira el relieve plano).

| Archivo | Contenido |
|---|---|
| `malla_puntos.csv` | Los 2016 puntos medidos |
| `malla_lugares.json` | Nombres de OpenStreetMap ya consultados |
| `descubrimiento.csv` | Los candidatos de cada objetivo y propósito |
| `../../web/public/data/discoveries.json` | Lo mismo para la web, con la comprobación y las fuentes |

Resultado (15 de noviembre):
- **Lagos (Jezero, Gale, Meridiani y el propósito de lagos antiguos):** 15 o 16 de los 20 puntos más
  parecidos de la malla están junto a un sitio del catálogo o en el mismo salar. El catálogo ya tiene los
  mejores lugares de lago; los candidatos nuevos son de roca volcánica de Sur Lípez y puntúan menos (cerca
  del 50 %, frente al 66 % de Laguna Hedionda, la primera del catálogo).
- **InSight (llanuras volcánicas), la Luna y Utopia:** solo 1 a 3 de los 20 mejores puntos están junto al
  catálogo, así que la malla aporta lugares nuevos, sobre todo cerros y llanuras volcánicas de Sur Lípez
  (por ejemplo, el Salar Laguani para InSight y los cerros Cachi Laguna y Soniquera para Shackleton). En
  InSight, los mejores puntos nuevos (65 %) superan al primero del catálogo, Tata Sabaya (62,5 %).
- **Sin candidatos:** Columbia Hills e hidrotermal (el mapa no distingue campos geotérmicos), Deuteronilus
  y Arcadia (glaciar y hielo enterrado), y movilidad de rover (61 puntos empatan).

## Límites

1. **Las celdas de NASA POWER miden 0,5° x 0,625° (unos 55 km).** Varios sitios cercanos comparten valores
   (Sol de Mañana, Dalí, Chalviri y Polques). En la cordillera, la temperatura y la presión son las de la
   altura media de la celda. Donde `elevation_m` y `climate_cell_elevation_m` difieren mucho, el clima
   corresponde a otra altura: Laguna Verde (+1462 m), Sajama (+1449 m), Huayna Potosí (+1401 m), Ollagüe
   (+1054 m), Tunupa (+987 m), Uturuncu (+921 m), Valle de la Luna (−542 m). Corregirlo con un gradiente
   térmico sería un modelo, no una medición.
2. **La precipitación de NASA POWER (MERRA-2) sale más alta que la de las estaciones en el Altiplano**
   (Uyuni: 331 mm/año). El orden entre sitios se mantiene: Yungay 8 mm, Trinidad 1878 mm.
3. **Coipasa y Poopó dan pendiente y TRI 0.** El modelo de la Tierra viene sobre todo de SRTM (febrero de
   2000), que registró esas superficies como agua plana.
4. **Puntos del catálogo:** se corrigieron Dalí, Chiguana y Tata Sabaya, y Laguna Verde pasó a ser una
   laguna salina. Detalle en [revision-catalogo.md](../revision-catalogo.md).
5. **Sin medir:** albedo (la fuente abierta de NASA POWER tiene celdas de 1°, demasiado grandes para un
   sitio de 2 a 5 km), cobertura vegetal (MODIS exige cuenta de Earthdata), radiación ultravioleta, y luz y
   comunicaciones en los sitios lunares.
6. **Luna:** sin temperatura, sus órdenes premian el relieve parecido, la sequedad y la altura.
