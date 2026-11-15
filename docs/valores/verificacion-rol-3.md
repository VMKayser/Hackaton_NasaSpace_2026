# Comprobación de los datos de Marte del rol 3

15 de noviembre de 2026. El rol 3 entregó tres paquetes de Marte (archivo `datos`, fuera del repositorio
por su tamaño): Utopia Planitia en el sitio de Viking 2, Deuteronilus Mensae y Arcadia Planitia. Cada uno
trae CSV preparados a partir de archivos públicos de NASA PDS, LMD, ASU y Zenodo, con sus fuentes.

Cada dato se comprobó contra una fuente independiente, sin usar los números del paquete como referencia.

| Comprobación | Resultado |
|---|---|
| Integridad de Deuteronilus (`SHA256SUMS.txt`) | 133 de 133 archivos iguales |
| Integridad de Utopia (`manifest.json`, originales de Viking) | 9 de 9 archivos iguales |
| Radar SHARAD (ds02 y ds03) frente a la suma MD5 publicada en Zenodo | Iguales |
| Elevación MOLA de Deuteronilus frente a HRSC-MOLA 200 m (USGS), 40 puntos al azar con medición láser | Diferencia mediana −4 m; máxima 46 m |
| Elevación MOLA de Arcadia, igual | Diferencia mediana 0 m; máxima 61 m |
| Elevación media en 5 km alrededor de Viking 2 | −4503 m (rol 3, MOLA) y −4511 m (HRSC-MOLA) |
| Inercia térmica TES en Viking 2, releída del archivo de PDS | 12 de 12 píxeles iguales |
| Orientación del mapa de minerales TES, que el rol 3 reconstruyó | Con esa orientación, la hematita máxima cae en Meridiani (0,172; solo 10 celdas la superan en todo el planeta), donde la descubrió TES. Las 480 celdas de Deuteronilus coinciden con el mapa global |
| Presión medida por Viking 2 frente a la MCD v6.2 con el método de `measure_values.py` | 874 Pa (un año marciano, soles 0 a 668) frente a 871 Pa: −0,3 % |
| Clima MCD de un punto de Deuteronilus (45,13° N, 24,0° E): muestreo del rol 3 frente al nuestro | Temperatura −73,6 °C y −71,4 °C; presión 779 Pa y 751 Pa |

La diferencia de presión en Deuteronilus se explica por el método. El rol 3 pidió a la MCD 32 muestras sin
ponderar y sin topografía de alta resolución (`hrkey=0`). `measure_values.py` usa 24 estaciones por 24
horas, ponderadas por su duración, con topografía de alta resolución.

## Qué se usa y qué no

- **Los puntajes no usan los números del rol 3.** Su relieve tiene otra escala (MOLA de 463 a 926 m y
  ventanas de unos 4 km) y su clima otro muestreo. Los tres objetivos nuevos se midieron con
  `tools/measure_values.py`, como los otros nueve. Los datos del rol 3 sirvieron para comprobar el método y
  para elegir el punto de Deuteronilus.
- **Viking 2 mide la temperatura del aire**, no la de la superficie. No se compara con `surface_temp_c`.
- **Inercia térmica, minerales, polvo, radar e hidrógeno no tienen equivalente medido en los sitios de
  Bolivia.** No pueden puntuar hasta que el rol 2 tenga esa medida para la Tierra.

## Objetivos nuevos

| Objetivo | Punto | Por qué |
|---|---|---|
| Utopia Planitia (Viking 2) | 47,64° N, 134,29° E, planetocéntrico ([NASA](https://science.nasa.gov/mission/viking/)) | El único sitio con meteorología medida de los paquetes. Sin categoría geológica asignada |
| Deuteronilus Mensae | 44,9474° N, 25,8523° E | El reflector basal de radar (conjunto ds03 de [Baker y Carter](https://doi.org/10.5281/zenodo.7753745)) con más detecciones a menos de 5 km: 179. [Plaut et al. (2009)](https://doi.org/10.1029/2008GL036379) muestran que estos depósitos son sobre todo hielo |
| Arcadia Planitia (Badger) | 46,581° N, 194,85° E (−165,15°) | Cráter en terrazas con coordenadas publicadas por [Bramson et al. (2015)](https://doi.org/10.1002/2015GL064844), que muestran una capa de hielo enterrado en la región |

El método sirve para cualquier punto de Marte: el relieve sale del modelo global HRSC-MOLA y el clima de la
MCD, que cubren todo el planeta. Solo el entorno geológico necesita una fuente para cada punto.
