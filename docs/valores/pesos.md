# Pesos y propósitos

Por qué cada dimensión pesa lo que pesa en `analogs.json`. Los valores están en `puntaje.json`; el
cálculo, en `docs/metodo-similitud.md`. 15 de noviembre de 2026.

## Pesos por defecto (similitud general)

Criterio: **cada evidencia independiente cuenta lo mismo**. Si varias medidas dicen casi lo mismo,
comparten un peso para no contar doble, como pide el método.

Correlación de Spearman entre los 31 sitios del catálogo (`sitios_valores.csv`):

| | Pendiente | Percentil 90 | Rugosidad | Temperatura | Amplitud | Lluvia | Presión |
|---|---:|---:|---:|---:|---:|---:|---:|
| Pendiente mediana | 1,00 | 0,97 | 1,00 | −0,08 | −0,18 | 0,23 | −0,14 |
| Percentil 90 de la pendiente | | 1,00 | 0,97 | −0,05 | −0,16 | 0,16 | −0,10 |
| Rugosidad (TRI) | | | 1,00 | −0,10 | −0,18 | 0,22 | −0,15 |
| Temperatura de superficie | | | | 1,00 | −0,26 | 0,46 | 0,91 |
| Amplitud térmica diaria | | | | | 1,00 | −0,72 | −0,25 |
| Precipitación | | | | | | 1,00 | 0,35 |

| Dimensión | Peso | Motivo |
|---|---:|---|
| Pendiente mediana | 0,5 | Las tres medidas de relieve ordenan los sitios casi igual (0,97 a 1,00): juntas suman 1. La mediana describe el terreno típico y lleva la mitad. |
| Percentil 90 de la pendiente | 0,25 | Parte del peso del relieve: describe las zonas más empinadas. |
| Rugosidad (TRI) | 0,25 | Parte del peso del relieve. Con un paso de 200 m no ve rocas ni montículos pequeños. |
| Temperatura de superficie | 1 | Independiente del relieve. Ningún sitio de la Tierra se acerca a Marte; mide qué sitio está menos lejos. |
| Amplitud térmica diaria | 1 | Su correlación con la lluvia es −0,72: relacionadas, pero miden procesos distintos (aire seco que se calienta y enfría rápido, frente a agua que cae). |
| Precipitación | 1 | La falta de agua líquida es la condición más citada de los análogos de Marte (Navarro-González et al., 2003). |
| Geología | 1 | La única dimensión que describe el tipo de ambiente. Es una categoría: 1 si coincide, 0 si no. |
| Presión | 0 | Se muestra, pero no discrimina: en la Tierra es de 80 a 150 veces la de Marte, y su correlación con la temperatura es 0,91. |

## Propósitos

| Propósito | Objetivo | Pesos | Motivo |
|---|---|---|---|
| Lagos antiguos y evaporitas | Jezero | geología 3, lluvia 2, temperatura 1, pendiente 0,5 | Jezero fue un lago con delta (Mangold et al., 2021): lo esencial es una cuenca de lago. Para estudiar cómo se seca y qué sales deja, importa que llueva poco. La pendiente pesa poco: el fondo de una cuenca es plano. |
| Sistemas hidrotermales y biofirmas | Columbia Hills | geología 3, lluvia 2, amplitud 1, temperatura 1 | La sílice de Columbia Hills se formó en un ambiente hidrotermal (Squyres et al., 2008). Sus estructuras se parecen a las de El Tatio (Chile), un campo geotérmico de altura, seco y con grandes cambios de temperatura (Ruff y Farmer, 2016). |
| Movilidad de rover | Jezero | pendiente 2, percentil 90 2, rugosidad 1 | Solo cuenta el terreno. Perseverance aguanta 45° de inclinación, pero sus conductores evitan las laderas de más de 30° (NASA): las zonas más empinadas pesan tanto como la pendiente típica. La rugosidad pesa menos porque con 200 m de paso no ve obstáculos del tamaño de una rueda (52,5 cm). |

## Qué cambia si se cambian los pesos

Prueba de estabilidad de `docs/metodo-similitud.md`: cada peso se multiplica al azar por un valor entre
0,8 y 1,2, 500 veces (semilla 0), y se vuelve a ordenar.

| Orden | Los 3 primeros | ¿Iguales en las 500? | Mejor puesto de un control | Atacama |
|---|---|---|---|---|
| General, Jezero | Laguna Hedionda, Laguna Verde, Chiguana | Sí (100 %) | 28.º a 29.º | 14.º a 17.º |
| General, Columbia Hills | Sol de Mañana, Polques, Géiseres de Sajama | Sí (100 %) | 28.º a 29.º | 8.º a 15.º |
| Lagos antiguos | Laguna Hedionda, Laguna Verde, Chiguana | Sí (100 %) | 30.º | 13.º a 15.º |
| Hidrotermal | Sol de Mañana, Polques, Géiseres de Sajama | Sí (100 %) | 30.º | 8.º a 12.º |
| Movilidad de rover | Valle de Rocas, Siloli, Laguna Verde | Sí (100 %) | 14.º | 17.º a 18.º |

Los controles quedan abajo en todo lo que incluye clima, lluvia o geología. En movilidad de rover, que
solo mira el relieve, la llanura de Trinidad sale 14.º: es un terreno fácil para conducir aunque su
clima no se parezca, y así se espera. Atacama queda en la mitad porque es análogo de la sequedad, pero
es más cálida que el Altiplano y su geología no es de lago ni hidrotermal.

## Fuentes

- Mangold et al. (2021), Science. [doi:10.1126/science.abl4051](https://doi.org/10.1126/science.abl4051)
- Squyres et al. (2008), Science. [doi:10.1126/science.1155429](https://doi.org/10.1126/science.1155429)
- Ruff y Farmer (2016), Nature Communications. [doi:10.1038/ncomms13554](https://doi.org/10.1038/ncomms13554)
- Navarro-González et al. (2003), Science. [doi:10.1126/science.1089143](https://doi.org/10.1126/science.1089143)
- NASA, componentes del rover Perseverance (inclinación y ruedas). [science.nasa.gov](https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/)
