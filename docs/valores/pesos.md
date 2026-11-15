# Pesos y propósitos

De dónde sale cada peso de `analogs.json`. No hay números elegidos a mano: los pesos salen de tres reglas
publicadas y de las fuentes de cada propósito. Los valores están en `puntaje.json`; el cálculo, en
`docs/metodo-similitud.md`. 15 de noviembre de 2026.

## Las tres reglas

1. **Pesos iguales.** Es el criterio por defecto del *Handbook on Constructing Composite Indicators* de la
   OCDE y el JRC (2008, p. 31): «la mayoría de los indicadores compuestos usan pesos iguales» cuando no hay
   una base empírica para otros.
2. **No contar dos veces lo mismo.** El mismo manual (p. 32) advierte que, con pesos iguales, dos indicadores
   muy correlacionados cuentan doble, y recomienda dar menos peso a los correlacionados. También pide fijar
   un umbral y juzgar además por lo que mide cada indicador, no solo por la estadística. Aquí: las medidas
   de **una misma propiedad** con correlación de Spearman de 0,9 o más **comparten un peso**.
3. **Cada propósito usa solo las dimensiones que nombra su fuente**, con pesos iguales entre ellas. Es la
   idea de «análogo funcional» (Foucher et al., 2021): un lugar es análogo para una función concreta, no en
   general.

## Similitud general

Correlación de Spearman entre los 31 sitios del catálogo (`sitios_valores.csv`):

| | Pendiente | Percentil 90 | Rugosidad | Temperatura | Amplitud | Lluvia | Presión |
|---|---:|---:|---:|---:|---:|---:|---:|
| Pendiente mediana | 1,00 | 0,97 | 1,00 | −0,08 | −0,18 | 0,23 | −0,14 |
| Percentil 90 de la pendiente | | 1,00 | 0,97 | −0,05 | −0,16 | 0,16 | −0,10 |
| Rugosidad (TRI) | | | 1,00 | −0,10 | −0,18 | 0,22 | −0,15 |
| Temperatura de superficie | | | | 1,00 | −0,26 | 0,46 | 0,91 |
| Amplitud térmica diaria | | | | | 1,00 | −0,72 | −0,25 |
| Precipitación | | | | | | 1,00 | 0,35 |

| Dimensión | Peso | Regla |
|---|---:|---|
| Pendiente mediana, percentil 90 y rugosidad | 1/3 cada una | Regla 2: las tres miden lo empinado del terreno con el mismo paso y se correlacionan entre 0,97 y 1,00. Juntas cuentan como una. |
| Temperatura de superficie | 1 | Regla 1. |
| Presión en superficie | 1 | Regla 1. Su correlación con la temperatura es 0,91, pero mide otra propiedad (la densidad del aire), así que no comparte peso (regla 2, juicio por significado). |
| Amplitud térmica diaria | 1 | Regla 1. Correlación con la lluvia de −0,72: por debajo del umbral. |
| Precipitación | 1 | Regla 1. |
| Entorno geológico | 1 | Regla 1. |
| Unidad de roca del mapa geológico | 0 | Se muestra como dato publicado, pero no puntúa: no hay un mapa equivalente para los objetivos. |

## Propósitos

| Propósito | Objetivo | Dimensiones (peso igual) | Fuente |
|---|---|---|---|
| Lagos antiguos y evaporitas | Jezero | entorno geológico, presión, amplitud térmica, precipitación | Los lagos de altura como análogos de los lagos de Marte se definen por su altitud (4200 a 6000 m), sus grandes variaciones diarias de temperatura y su precipitación baja y variable (Cabrol et al., 2009). Jezero fue un lago con delta (Mangold et al., 2021). |
| Sistemas hidrotermales y biofirmas | Columbia Hills | entorno geológico, presión, amplitud térmica, precipitación | El Tatio es mejor análogo de la sílice de Columbia Hills que otros campos geotérmicos por su altitud (unos 4300 m), su precipitación de menos de 100 mm al año y sus ciclos diarios de congelamiento y deshielo (Ruff y Farmer, 2016). El entorno hidrotermal de Columbia Hills está en Squyres et al. (2008). |
| Movilidad de rover | Jezero | pendiente, percentil 90, rugosidad (1/3 cada una) | Perseverance aguanta 45° de inclinación, pero sus conductores evitan las laderas de más de 30°, y supera obstáculos del tamaño de una rueda (NASA). |
| Alunizaje y operaciones en el polo sur | Connecting Ridge | pendiente, percentil 90, rugosidad (1/3 cada una) | La NASA eligió las regiones candidatas de Artemis III por la pendiente del terreno, las comunicaciones con la Tierra y la luz (NASA, 2022). |
| Hielo enterrado y glaciares cubiertos | Deuteronilus Mensae | entorno geológico, temperatura, precipitación | Los valles secos de la Antártida, que conservan hielo glaciar enterrado, se dividen en zonas de microclima según la temperatura y la humedad del verano (Marchant y Head, 2007, [doi](https://doi.org/10.1016/j.icarus.2007.06.018)). Los depósitos de Deuteronilus son glaciares cubiertos de detritos (Plaut et al., 2009). La humedad se aproxima con la precipitación. |
| Alunizaje en un mar lunar | Apollo 11 | pendiente, percentil 90, rugosidad (1/3 cada una) | Para Apollo, la NASA exigió pocos cráteres, ninguna colina grande ni acantilado en la aproximación y una pendiente general menor de 2° (NASA, criterios de febrero de 1968). |

Lo que las fuentes nombran pero no medimos: la radiación ultravioleta (Cabrol et al., 2009; Ruff y Farmer,
2016), y la luz y las comunicaciones (NASA, 2022). Quedan fuera del puntaje y se dicen en los límites.

## Estabilidad

Prueba de `docs/metodo-similitud.md`: cada peso se multiplica al azar por un valor entre 0,8 y 1,2, 500
veces (semilla 0), y se vuelve a ordenar.

| Orden | Los 3 primeros | Mismos 3 | Mejor puesto de un control | Atacama |
|---|---|---:|---|---|
| General, Jezero | Laguna Hedionda, Chiguana, Chalviri | 100 % | 29.º a 30.º | 19.º a 21.º |
| General, Columbia Hills | Sol de Mañana, Pastos Grandes, Polques | 100 % | 29.º a 30.º | 16.º a 20.º |
| General, Gale | Laguna Hedionda, Chiguana, Chalviri | 100 % | 29.º a 30.º | 19.º a 21.º |
| General, Meridiani | Chalviri, Chiguana, Laguna Colorada | 70 % | 29.º a 30.º | 19.º a 20.º |
| General, InSight | Tata Sabaya, Valle de Rocas, Jayu Khota | 100 % | 29.º a 30.º | 20.º a 25.º |
| General, Shackleton Rim | Polques, Uturuncu, Ollagüe | 100 % | 30.º | 14.º a 24.º |
| General, Connecting Ridge | Polques, Laguna Hedionda, Sol de Mañana | 81 % | 30.º | 9.º a 21.º |
| General, de Gerlache Rim | Polques, Uturuncu, Laguna Hedionda | 72 % | 30.º | 13.º a 23.º |
| General, Malapert Massif | Polques, Uturuncu, Laguna Hedionda | 99 % | 30.º | 14.º a 22.º |
| Lagos antiguos | Laguna Hedionda, Chiguana, Chalviri | 52 % | 30.º | 20.º a 23.º |
| Hidrotermal | Sol de Mañana, Polques, Pastos Grandes | 100 % | 30.º | 17.º a 20.º |
| Movilidad de rover | Siloli, Valle de Rocas, Laguna Verde | 100 % | 14.º | 15.º a 18.º |
| Alunizaje en el polo sur | Polques, Umajalanta, Valle de la Luna | 71 % | 14.º a 17.º | 13.º a 14.º |

Cuando los 3 primeros cambian, es porque están casi empatados: el orden general se mantiene.

- **Los controles** quedan entre los dos últimos en todo lo que incluye clima, lluvia o geología. En los dos
  propósitos que solo miran el relieve, la llanura de Trinidad sale 14.º: es un terreno fácil aunque su
  clima no se parezca, y así se espera.
- **Atacama** queda en la mitad. Es análogo de la sequedad, pero es más cálida y está más baja que el
  Altiplano, y su geología no es de lago ni hidrotermal.
- **La Luna** solo tiene relieve, precipitación y presión (estas dos son 0 por definición). Sin temperatura
  lunar todavía, sus órdenes premian el relieve parecido, la sequedad y la altura.

## Fuentes

- OECD y JRC (2008), *Handbook on Constructing Composite Indicators: Methodology and User Guide*, pp. 31–32.
  [doi:10.1787/9789264043466-en](https://doi.org/10.1787/9789264043466-en)
- Foucher et al. (2021), Definition and use of functional analogues in planetary exploration, *Planetary and
  Space Science*. [doi:10.1016/j.pss.2021.105162](https://doi.org/10.1016/j.pss.2021.105162)
- Cabrol et al. (2009), The High-Lakes Project, *Journal of Geophysical Research: Biogeosciences*.
  [doi:10.1029/2008JG000818](https://doi.org/10.1029/2008JG000818)
- Ruff y Farmer (2016), *Nature Communications*. [doi:10.1038/ncomms13554](https://doi.org/10.1038/ncomms13554)
- Mangold et al. (2021), *Science*. [doi:10.1126/science.abl4051](https://doi.org/10.1126/science.abl4051)
- Squyres et al. (2008), *Science*. [doi:10.1126/science.1155429](https://doi.org/10.1126/science.1155429)
- NASA, componentes del rover Perseverance.
  [science.nasa.gov](https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/)
- NASA (2022), NASA Identifies Candidate Regions for Landing Next Americans on Moon.
  [nasa.gov](https://www.nasa.gov/news-release/nasa-identifies-candidate-regions-for-landing-next-americans-on-moon/)
