# Valores medidos de sitios y objetivos

Entrada para el cálculo de puntajes del rol 4 (`docs/metodo-similitud.md`). Aquí solo hay mediciones,
sin puntajes. Los genera `tools/measure_values.py` a partir de `docs/catalogo-sitios.csv` y de los
objetivos de `web/public/data/analogs.json`. Medidos el 15 de noviembre de 2026.

```
pip install -r tools/requirements.txt
python tools/measure_values.py                         # objetivos de analogs.json
python tools/measure_values.py --targets objetivos.csv # otros objetivos: id,name,body,lat,lon
```

| Archivo | Contenido |
|---|---|
| `sitios_valores.csv` | Una fila por sitio del catálogo (31) |
| `objetivos_valores.csv` | Una fila por objetivo |
| `fuentes.json` | Unidad y fuentes de cada columna, en el formato de `meta.dimensions[].sources` |
| `puntaje.json` | Dimensiones, pesos, propósitos y categorías de geología (provisionales, rol 1) |

Una celda vacía es «sin dato» (`null`), nunca cero.

## Generar `analogs.json`

```
python tools/build_analogs.py
```

Lee el catálogo, estos valores y `puntaje.json`, y escribe `web/public/data/analogs.json` con
`meta.mock: false`. Aplica el método de `docs/metodo-similitud.md`: escala entre los percentiles 5 y 95 de
los 31 sitios ampliada con los objetivos, similitud `1 − min(1, |Tierra − objetivo| / escala)` (en geología,
1 si la categoría coincide y 0 si no) y media ponderada de las dimensiones con dato y peso positivo. Si
cambia una coordenada del catálogo, el script pide volver a medir.

Resultado de la referencia y los controles (15 de noviembre), puesto entre 31 por similitud general:

| Sitio | Jezero | Columbia Hills | Qué se esperaba |
|---|---|---|---|
| Yungay, Atacama (referencia) | 16.º (57,9 %) | 11.º (53,8 %) | Alto en aridez (lo es: 8 mm/año), pero más cálido que el Altiplano y sin geología de lago ni hidrotermal |
| Trinidad, Beni (control) | 23.º (37,9 %) | 23.º (34,2 %) | Bajo |
| Coroico, Yungas (control) | 30.º (17,5 %) | 29.º (15,1 %) | Bajo |

En «Movilidad de rover», que solo mira el relieve, Trinidad sale 14.º: una llanura es un buen terreno
para conducir aunque su clima no se parezca. Atacama no queda arriba en general porque es análogo de la
sequedad, no de la temperatura ni de la geología de estos dos objetivos.

## Columnas

| Columna | Unidad | Qué es | Tierra | Marte |
|---|---|---|---|---|
| `slope_median_deg` | ° | Pendiente mediana dentro del círculo | Terrain Tiles | HRSC-MOLA 200 m |
| `slope_p90_deg` | ° | Percentil 90 de la pendiente | Igual | Igual |
| `roughness_tri_m` | m | Rugosidad: mediana del TRI (media de la diferencia de altura con las 8 celdas vecinas) | Igual | Igual |
| `surface_temp_c` | °C | Temperatura media anual de la superficie | NASA POWER `TS` | MCD `tsurf` |
| `diurnal_range_c` | °C | Diferencia media entre el máximo y el mínimo del día en la superficie | NASA POWER `TS_RANGE` | MCD `tsurf` |
| `precip_mm_yr` | mm/año | Precipitación anual | NASA POWER `PRECTOTCORR` | 0 (ver abajo) |
| `pressure_hpa` | hPa | Presión media en superficie | NASA POWER `PS` | MCD `ps` |
| `elevation_m` | m | Elevación media en el círculo (contexto, no para puntuar) | Nivel del mar | Areoide de MOLA |
| `climate_cell_elevation_m` | m | Elevación media de la celda de NASA POWER (contexto) | | |
| `step_m`, `radius_km`, `coverage` | | Paso de muestreo, radio del círculo y fracción del círculo con dato | | |

## Método

- **Relieve con el mismo paso en los dos cuerpos: 200 m**, la resolución del modelo global de Marte. En la
  Tierra se toma el zoom de Terrain Tiles cuyo píxel no pasa de 200 m. La pendiente y el TRI dependen del
  paso, no del radio: por eso sitios y objetivos se pueden comparar aunque cada sitio use el radio del
  catálogo (2 o 5 km) y cada objetivo un círculo de 5 km. Es el mismo cálculo que el pin libre de la web
  (`web/src/lib/patch.ts`).
- **Clima de la Tierra:** climatología de NASA POWER 2001–2025 en el punto del sitio. La precipitación
  anual suma las medias mensuales por los días de cada mes.
- **Clima de Marte:** Mars Climate Database v6.2, escenario de clima medio, con topografía de alta
  resolución. Se piden 24 estaciones (cada 15° de Ls) por 24 horas locales. La media anual pesa cada
  estación por su duración real (excentricidad 0,0934, perihelio en Ls 251°).
- **Precipitación en Marte = 0.** No es una medición: en Marte hoy no hay precipitación líquida. El rol 4
  decide si usar ese 0 o dejar la dimensión sin puntaje.

## Límites que conviene leer antes de puntuar

1. **Las celdas de NASA POWER miden 0,5° x 0,625° (unos 55 km).** Varios sitios cercanos comparten valores
   (Sol de Mañana, Dalí, Chalviri y Polques). En la cordillera, la temperatura y la presión son las de la
   altura media de la celda. Donde `elevation_m` y `climate_cell_elevation_m` difieren mucho, el clima
   corresponde a otra altura: Licancabur (+1462 m), Sajama (+1449 m), Huayna Potosí (+1401 m), Ollagüe
   (+1054 m), Tunupa (+987 m), Uturuncu (+921 m), Valle de la Luna (−542 m). Corregirlo con un gradiente
   térmico sería un modelo, no una medición; si se hace, hay que decirlo en `meta.scoring`.
2. **La precipitación de NASA POWER (MERRA-2) sale más alta que la de las estaciones en el Altiplano**
   (Uyuni: 331 mm/año). El orden entre sitios se mantiene: Yungay 8 mm, Trinidad 1878 mm.
3. **Coipasa y Poopó dan pendiente y TRI 0.** El modelo de la Tierra viene sobre todo de SRTM (febrero de
   2000), que registró esas superficies como agua plana.
4. **Puntos del catálogo:** Dalí y Chiguana se corrigieron; Laguna Verde y Licancabur, y Tata Sabaya,
   esperan decisión del rol 1. Detalle y mediciones de cada opción en [revision-catalogo.md](../revision-catalogo.md).
5. **Sin medir:** albedo (la fuente abierta de NASA POWER tiene celdas de 1°, demasiado grandes para un
   sitio de 2 a 5 km) y cobertura vegetal (MODIS exige cuenta de Earthdata). No son dimensiones de
   `analogs.json`. La geología no se mide: es la categoría del catálogo en los sitios y la de la
   literatura en los objetivos (`puntaje.json`).
6. **Luna:** el script mide su relieve con LOLA-Kaguya entre 60° N y 60° S. Fuera de esa franja, o para el
   clima lunar, quedan vacíos.
