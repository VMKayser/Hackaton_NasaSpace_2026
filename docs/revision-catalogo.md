# Revisión del catálogo para el rol 1

Revisión de los puntos de `docs/catalogo-sitios.csv` con el modelo de elevación (Terrain Tiles, paso de
200 m, mismo cálculo que `tools/measure_values.py`), OpenStreetMap y Wikipedia. 15 de noviembre de 2026.
Hay dos correcciones aplicadas y dos decisiones pendientes.

## Aplicadas (revertir si el rol 1 no está de acuerdo)

| Sitio | Antes | Ahora | Motivo |
|---|---|---|---|
| `dali` | −22.60, −67.63 | −22.63, −67.66 | El punto anterior quedaba fuera del desierto, en una ladera a 4938 m (pendiente mediana 16,5°). El nuevo está en el polígono de OpenStreetMap del Desierto Salvador Dalí (centro −22.6344, −67.6553; Wikipedia: −22.615, −67.664, unos 4750 m): 4606 m, pendiente 3,5°. |
| `chiguana` | −21.08, −67.92 | −21.08, −68.00 | El punto anterior estaba en el borde este del salar: el círculo de 5 km tomaba laderas (3888 m, percentil 90 de la pendiente 19°). El nuevo es el centro del polígono del salar en OpenStreetMap (−21.0785, −68.0027): 3704 m, pendiente 0,4°. Las coordenadas de Wikipedia (−21.25, −68.13) caen fuera del salar (3930 m, 3,9°). |

## Pendientes de decisión

### Laguna Verde y Licancabur (`licancabur-laguna-verde`)

El punto (−22.79, −67.82) está sobre Laguna Verde (OpenStreetMap: −22.7948, −67.8352). La cumbre del
Licancabur está a unos 8 km, fuera del círculo de 2 km. El análogo estudiado por el High Lakes Project
(SETI/NASA) es el lago de la cumbre, a unos 5900 m.

| Opción | Punto | Elevación media | Pendiente mediana | TRI |
|---|---|---|---|---|
| A. Dejar Laguna Verde | −22.79, −67.82 | 4343 m | 1,7° | 4,7 m |
| B. Cumbre y lago de la cumbre | −22.8339, −67.8836 (Wikipedia) | 5171 m | 31,5° | 95 m |

Si se elige B, conviene renombrar el sitio («Volcán Licancabur») y revisar sus textos. En los dos casos
hay que volver a ejecutar `tools/measure_values.py` y `tools/build_analogs.py`.

### Tata Sabaya (`tata-sabaya`)

El nombre dice «avalancha de escombros», pero el punto (−19.13, −68.53) es la cumbre del volcán
(Wikipedia: −19.133, −68.533; 5430 m). El depósito de la avalancha está al sur, unos 20 km de largo por
7 km de ancho, y entra en el Salar de Coipasa (Wikipedia; Andean Geology 39(3), 2012). En el modelo de
elevación, el terreno con montículos aparece hacia −19.18, entre −68.48 y −68.55; más al sur ya es salar
plano.

| Opción | Punto | Elevación media | Pendiente mediana | TRI |
|---|---|---|---|---|
| A. Dejar la cumbre | −19.13, −68.53 | 4652 m | 22,8° | 66,9 m |
| B. Depósito de la avalancha (a confirmar con imagen) | −19.18, −68.50 | 3834 m | 4,8° | 15,4 m |

## Otros datos para confirmar

- **Geología de los objetivos** (`docs/valores/puntaje.json`): Jezero como cuenca de lago (Mangold et al.
  2021, Science, doi:10.1126/science.abl4051) y Columbia Hills como hidrotermal (Squyres et al. 2008,
  Science, doi:10.1126/science.1155429). En los sitios se usa el tipo del catálogo; los salares cuentan
  como cuenca de lago.
- **Pesos y propósitos** (`docs/valores/puntaje.json`): provisionales. Los tres propósitos conservan los
  nombres y preguntas de la demo, ahora con dimensiones medidas.
- `capina` (−21.90, −67.60) está a unos 4 km de Laguna Capina (Wikipedia: −21.933, −67.583). El círculo
  de 5 km la incluye; no se cambió.

Fuentes: [Licancabur](https://en.wikipedia.org/wiki/Licancabur),
[High Lakes Project](https://highlakes.seti.org/about.html),
[Tata Sabaya](https://en.wikipedia.org/wiki/Tata_Sabaya),
[depósito de Tata Sabaya, Andean Geology](https://andeangeology.cl/index.php/revista1/article/view/V39n3-a03),
[Desierto Salvador Dalí](https://en.wikipedia.org/wiki/Salvador_Dal%C3%AD_Desert),
[Salar de Chiguana](https://es.wikipedia.org/wiki/Salar_de_Chiguana),
[Laguna Capina](https://en.wikipedia.org/wiki/Laguna_Capina),
[OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/).
