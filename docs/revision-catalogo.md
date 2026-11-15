# Revisión del catálogo

Revisión de los puntos de `docs/catalogo-sitios.csv` con el modelo de elevación (Terrain Tiles, paso de
200 m, mismo cálculo que `tools/measure_values.py`), OpenStreetMap, Wikipedia, artículos científicos e
imágenes Sentinel-2 cloudless (EOX). 15 de noviembre de 2026. Los IDs no cambian.

## Cambios aplicados

| Sitio | Antes | Ahora | Motivo |
|---|---|---|---|
| `dali` | −22.60, −67.63 | −22.63, −67.66 | El punto anterior quedaba fuera del desierto, en una ladera a 4938 m (pendiente mediana 16,5°). El nuevo está en el polígono del Desierto Salvador Dalí de OpenStreetMap (centro −22.6344, −67.6553; Wikipedia: −22.615, −67.664, unos 4750 m): 4606 m, pendiente 3,5°. |
| `chiguana` | −21.08, −67.92 | −21.08, −68.00 | El punto anterior estaba en el borde este del salar: el círculo de 5 km tomaba laderas (3888 m; percentil 90 de la pendiente, 19°). El nuevo es el centro del polígono del salar en OpenStreetMap (−21.0785, −68.0027): 3704 m, pendiente 0,4°. Las coordenadas de Wikipedia (−21.25, −68.13) caen fuera del salar (3930 m, 3,9°). |
| `tata-sabaya` | −19.13, −68.53 | −19.23, −68.47 | El sitio es la avalancha de escombros, pero el punto era la cumbre del volcán (5430 m). El depósito está al sur del volcán, cubre al menos 230 km² y entra en el Salar de Coipasa (Godoy et al., 2012; Wikipedia). En la imagen Sentinel-2 es el campo gris moteado al sur del volcán; el nuevo punto está en su centro: 3680 m, pendiente 0,9°. Los montículos son más pequeños que el paso de 200 m. |
| `licancabur-laguna-verde` | «Laguna Verde y Licancabur», tipo `volcanic` | «Laguna Verde, al pie del Licancabur», tipo `salt_lake` | El punto (−22.79, −67.82) está sobre Laguna Verde (OpenStreetMap: −22.7948, −67.8352). La cumbre está a unos 8 km, fuera del círculo de 2 km, así que lo medido es la laguna. El High Lakes Project estudió Laguna Verde, Laguna Blanca y el lago de la cumbre como análogos de lagos antiguos de Marte. Se conservan el punto y la marca de análogo conocido. |

Otra opción para Licancabur era mover el punto a la cumbre (−22.8339, −67.8836; 5171 m de media en el
círculo, pendiente 31,5°) y llamarlo «Volcán Licancabur». Se descartó porque los textos del sitio y su
carácter de laguna salina describen Laguna Verde.

## Revisado sin cambios

- `capina` (−21.90, −67.60) está a unos 4 km de Laguna Capina (Wikipedia: −21.933, −67.583). El círculo de
  5 km la incluye.
- `valle-de-rocas` coincide con el punto «Valle de las Rocas» de OpenStreetMap (−21.5971, −67.6008).
- `pastos-grandes` coincide con Laguna Pastos Grandes en OpenStreetMap (−21.6453, −67.7931).
- `jayu-khota` coincide con Wikipedia (−19.463, −67.432).

## Geología

El entorno geológico de cada sitio está en `docs/valores/geologia.csv`, con la frase que lo respalda y su
fuente, junto con la unidad del mapa geológico de Sudamérica 1:5 000 000 (CGMW, 2019) en su punto. El de
cada objetivo está en `docs/valores/objetivos.csv`, también con su fuente.

## Fuentes

[Licancabur](https://en.wikipedia.org/wiki/Licancabur) ·
[High Lakes Project](https://highlakes.seti.org/about.html) ·
[Tata Sabaya](https://en.wikipedia.org/wiki/Tata_Sabaya) ·
[Godoy et al. (2012), Andean Geology](https://doi.org/10.5027/andgeoV39n3-a03) ·
[NASA Earth Observatory, Tata Sabaya](https://earthobservatory.nasa.gov/images/80945/tata-sabaya-volcano) ·
[Desierto Salvador Dalí](https://en.wikipedia.org/wiki/Salvador_Dal%C3%AD_Desert) ·
[Salar de Chiguana](https://es.wikipedia.org/wiki/Salar_de_Chiguana) ·
[Laguna Capina](https://en.wikipedia.org/wiki/Laguna_Capina) ·
[Jayu Quta](https://en.wikipedia.org/wiki/Jayu_Quta_(Ladislao_Cabrera)) ·
[OpenStreetMap](https://www.openstreetmap.org/) ·
[Sentinel-2 cloudless (EOX)](https://s2maps.eu/) ·
[Mangold et al. (2021)](https://doi.org/10.1126/science.abl4051) ·
[Squyres et al. (2008)](https://doi.org/10.1126/science.1155429)
