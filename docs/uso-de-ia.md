# Registro de uso de IA

## 14 de noviembre de 2026

- Codex ayudó a implementar la app, sus esquemas de datos, el ranking y la ficha de sitios.
- Codex programó los globos planetarios, la carga diferida de los mapas, el radar y la comparación de sitios. También redactó el recorrido bilingüe de demostración y preparó la configuración de Vercel.
- Codex ejecutó pruebas automáticas y revisó el flujo de la app en el navegador. Los mosaicos y las imágenes planetarias proceden de NASA y USGS. La app muestra los créditos y enlaza las fuentes.
- Codex añadió selección de objetivos en el globo y un panel con sus mediciones. También integró el mosaico CTX para acercamientos en Marte y revisó la carga de datos y mapas en el navegador.
- Codex adaptó el radar para comparar las mediciones del sitio terrestre y el objetivo sobre los mismos ejes, con las unidades en el detalle.
- El prototipo usa mediciones y puntajes de demostración. El archivo de resultados científicos lo entrega el rol 4.

El formulario de envío es la referencia para el campo exacto de declaración. La [guía publicada por el evento local de Islamabad 2026](https://www.spaceappschallenge.org/2026/local-events/islamabad/) indica que el envío global incluye una declaración de uso de IA.

### Claude Code (Anthropic), 14 de noviembre

- Revisó el plan frente al reto y propuso el contrato v2, el plan de 36 horas y la primera versión de la web (esquemas, ranking, ficha, mapa con globo y relieve, idiomas).
- Escribió `tools/mars_terrain.py`, que descarga ventanas del DEM HRSC-MOLA de 200 m y el DTM CTX de Jezero de 20 m de USGS, y las guarda como rejillas de elevación con sus fuentes. Los datos de elevación son reales; la IA no los genera ni los modifica, salvo el fundido de 25 píxeles en el borde del DTM de Jezero.
- Programó la vista «Explorar en 3D» (Tierra y objetivo a la misma escala, con relieve real), las columnas 3D de puntaje y sus pruebas, y la revisó en el navegador.
- Añadió el DTM de HiRISE de Jezero, las capas de comparación (pendiente y relieve relativo calculados del relieve real), el panel de condiciones con los límites de la analogía y la navegación entre sitios dentro de la vista 3D.
