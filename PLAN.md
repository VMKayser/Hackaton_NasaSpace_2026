# Plan de trabajo de los roles 5 y 6

**Proyecto:** Galaxy Match. Tema claro, tipo informe científico.
**Pregunta central:** ¿qué lugar de la Tierra sirve para estudiar un fenómeno o ensayar una tarea de
Marte o la Luna, y qué datos respaldan esa elección?

**Plazo:** hackatón del sábado 14 al domingo 15 de noviembre de 2026.
**Cierre en la plataforma:** domingo 15 a las 23:59, hora local, según el [calendario oficial de 2026](https://www.spaceappschallenge.org/2026/).
Confirmar el horario de la presentación y cualquier entrega adicional con el evento local.
**Meta interna:** enviar el domingo a las **21:00**. Las horas de este plan son de Bolivia (UTC-4).

## Cómo trabajamos

- Con IA, escribir código no es el cuello de botella. Lo que no se acelera: los datos del rol 4,
  verificar URL y licencias de las capas, la revisión científica y la grabación de la demo.
  El plan está ordenado alrededor de eso.
- **Sáb 15:00:** confirmar el contrato v2.1 con el rol 4. Mientras tanto, la web avanza con la
  plantilla de demostración.
- **La web no recalcula puntajes.** Todos los números llegan del rol 4.
- **El rol 4 entrega números y el rol 6 escribe los textos** en `texts.json`. Así los textos no
  dependen de la entrega del domingo.
- Ejecutar `typecheck`, `lint`, `test` y `build` antes de publicar los hitos de la tarde del sábado y la entrega final.
- **Prioridades:** **P0** entra en el envío sí o sí. **P1** si P0 está listo. **P2** solo si sobra tiempo.
- **En paralelo:** cuando terminen los tipos y los datos de prueba (Fase 1), el mapa (Fase 2) y
  la ficha (Fase 4) no dependen entre sí. Se pueden hacer en dos sesiones de IA, cada una en su rama.
- **Domingo 16:00: código congelado.** Después solo se arreglan errores.

## Los seis huecos frente al reto

Son lo que el jurado tiene que ver. Cada uno tiene su tarea en las fases de abajo.

| # | Hueco | Qué ve el jurado | Dato necesario | Prioridad |
|---|---|---|---|---|
| 1 | Valores reales con unidades | Tabla en la ficha: valor en la Tierra y en el objetivo, con unidad, por dimensión | `values` en `sites` y `targets` | P0 |
| 2 | Datos de agencias | Nombre y agencia de cada dato en la ficha, en Método y en la demo | `meta.dimensions[].sources` | P0 |
| 3 | Conexión con la exploración | Entrada por propósito y bloque «qué se puede probar aquí» | `meta.purposes`, `exploration` | P0 |
| 4 | Pesos que contradicen `similarity` | Un solo puntaje por comparación, siempre el del rol 4 | Ninguno: la web no recalcula | P0 |
| 5 | Búsqueda sistemática | Controles negativos, criterios del catálogo y capa continua de similitud | `control`; PNG en `meta.overlays` | Controles P0; capa P1 |
| 6 | La Luna | Un objetivo lunar aparece sin tocar código | `body: "moon"` | P0 (regla de `AGENTS.md`) |

## Hitos

| Cuándo | Hito |
|---|---|
| Sáb 12:30 | Contrato v2.1 y catálogo enviados al rol 4; pedidos enviados a los roles 1, 2 y 3 |
| Sáb 14:00 | Frase de una línea y paleta para aplicar a la web |
| Sáb 15:00 | Contrato confirmado por el rol 4; propósitos, dimensiones y catálogo confirmados por el rol 1 |
| Sáb 20:00 | **Flujo principal publicado con datos de prueba.** Llega una entrega parcial real del rol 4 |
| Dom 12:00 | `analogs.json` real completo |
| Dom 16:00 | Código congelado |
| Dom 19:00 | Video o diapositivas listos y subidos |
| Dom 21:00 | **Envío hecho** |
| Dom 23:59 | Cierre oficial |

## Rol 5: app web

### Bloque 0. Coordinación (sáb 12:00 a 12:30)
- [ ] Enviar al rol 4 la [guía v2.1](docs/contrato-rol-4.md), el [JSON de ejemplo](docs/analogs.example.json)
      y el [catálogo de sitios](docs/catalogo-sitios.csv). Pedir confirmación a las 15:00, entrega
      parcial real a las 20:00 y archivo completo el domingo a las 12:00.
- [ ] Preguntar al rol 4 las cuatro cosas del final de la guía: formato, `sources`, `purposeScores`
      y capa continua de similitud.
- [ ] Enviar al rol 1 las propuestas de propósitos, dimensiones y catálogo de este plan. Pedir para
      las 15:00 los objetivos (Marte y, si se decide, 1 lunar), la lista final y las coordenadas verificadas.
- [ ] Enviar el catálogo al rol 2 para que extraiga los valores en esos puntos.
- [ ] Pedir al rol 3 los valores y las imágenes de los objetivos con su fuente para las 20:00.

### Fase 0. Base, P0 (sáb 12:30 a 14:00)
- [ ] `git init -b main`, añadir como remoto el repositorio que ya existe (es público) y traer su `README.md`.
      `.gitignore` con `node_modules`, `dist`, `.env*` y `.vercel`.
- [ ] Crear `web/` con React, Vite, TypeScript y Tailwind.
- [ ] Configurar `typecheck`, `lint`, `test` y `build`.
- [ ] Idiomas desde el inicio: `i18n/en.ts`, `i18n/es.ts` y selector; TypeScript falla si falta una clave.
- [ ] Estado en la URL (propósito, objetivo, sitio, vista, idioma, paso).
- [ ] Preparar el despliegue inicial en Vercel.

### Fase 1. Datos de prueba, P0 (sáb 14:00 a 15:00)
- [ ] Esquemas Zod y tipos según el contrato v2.1, para `analogs.json` y `texts.json`.
- [ ] Partir del `analogs.json` de ejemplo (un objetivo, dos candidatos, Atacama, un control y un
      propósito). Ampliar la muestra con sitios del catálogo si hace falta para probar el ranking.
- [ ] Mover `docs/texts.json` a `web/public/data/`. Cargar los dos archivos y mezclar: gana `texts.json`;
      un texto ausente o vacío se muestra como «texto pendiente».
- [ ] Validación con mensaje claro si el formato no coincide. Convertir longitudes de 0 a 360.
- [ ] Aviso visible de "datos de demostración".

### Fase 2. Mapa (sáb 15:00 a 17:30)
- [ ] P0: mapa con MapLibre 6 (solo ESM, exige WebGL2) y capa base con atribución. Las URL probadas
      están en `AGENTS.md`; confirmar licencia y texto de atribución antes de usarlas.
- [ ] P0: mapa centrado en Bolivia y selección de sitios.
- [ ] P1: globo 3D, vista 2D con relieve (Terrain Tiles de AWS), botón para alternar y vuelo inicial.

### Fase 3. Propósitos, sitios y ranking, P0 (sáb 17:30 a 19:00)
- [ ] Inicio «¿Qué quieres estudiar o ensayar?» con los propósitos de `meta.purposes`. Si el archivo
      no trae propósitos, selector de sitio objetivo.
- [ ] Sitios candidatos en el mapa, coloreados por puntaje, con leyenda.
- [ ] Forma distinta (no solo color) para sitios conocidos, la referencia de Atacama, los controles
      y los no evaluados.
- [ ] Panel lateral con el ranking ordenado por `purposeScores`, o por `similarity` si faltan.
      Cada fila lleva una línea de por qué: las dos dimensiones más altas y la más baja.
- [ ] Los sitios sin puntaje para el objetivo van al final, como «no evaluado».
- [ ] Al elegir un sitio en la lista o en el mapa, el mapa vuela hacia él.

### Fase 4. Ficha y comparación básica (sáb 19:00 a 20:00)
- [ ] P0: ficha con nombre, descripción y puntaje total.
- [ ] P0: tabla Tierra–objetivo por dimensión con valores, unidades, puntaje y estado «sin dato».
      Mostrar cuántas dimensiones se pudieron puntuar junto al total.
- [ ] P0: fuentes de datos de cada dimensión (`sources`), con nombre, agencia y enlace, en la misma tabla.
- [ ] P0: límites de la analogía y bloque «qué se puede probar aquí» (`exploration`).
- [ ] P0: enlace directo a cada sitio (URL que se puede compartir).
- [ ] P1: gráfico de radar por dimensión.

**Sáb 20:00, punto de control:** publicar el flujo principal con la etiqueta de demostración. Cuando llegue
la entrega parcial del rol 4, probarla en la web y corregir cualquier diferencia de formato.

### Fase 5. Modo historia, P1 (sáb 20:30 a 23:00)
- [ ] Botones anterior y siguiente que recorren los pasos de `story` en `texts.json`. Cada paso fija
      propósito, sitio, vista y un texto. Ningún ID va en el código.
- [ ] Tres pasos de prueba que usen el mapa y la ficha existentes: objetivo, candidatos bolivianos
      y comparación de un candidato con el objetivo.
- [ ] Usar imágenes fijas del objetivo con atribución cuando estén disponibles.

### Fase 6. Comparaciones y capa continua, P1 (dom 08:00 a 10:00)
Sustituye a los pesos en el navegador, que quedan fuera del plan.
- [ ] Capa continua de similitud, si el rol 4 la entregó: imagen con sus cuatro esquinas, interruptor
      y opacidad. Comprobar que queda alineada con los sitios.
- [ ] Sitio frente a sitio: elegir dos o tres sitios y ver sus valores en columnas. Sirve para
      distinguir sitios de puntaje parecido.
- [ ] Mapa del objetivo junto al de la Tierra. Dedicar 30 minutos como máximo; si no funciona, queda
      la imagen fija.

### Pulido previo a la integración final (dom 10:00 a 12:00)
- [ ] P0: estados de carga y de error.
- [ ] P1: página "Método y datos": pregunta central, criterios del catálogo, cómo se calcula el
      puntaje (`meta.scoring` y pesos), datos usados por agencia, validación y límites generales.
- [ ] P1: diseño para móvil.
- [ ] P1: accesibilidad básica: contraste y uso con teclado.

### Fase 7. Datos reales, P0 (dom 12:00 a 14:00)
- [ ] Cargar el archivo real del rol 4 con `meta.mock: false` y comprobar que el ranking, la ficha y
      los enlaces de la historia funcionen para los sitios disponibles.
- [ ] Mostrar el resultado observado de Atacama y de los controles. Explicar qué se esperaba en
      cada comparación y qué pasó, incluso si el resultado difiere de lo esperado.
- [ ] Enviar los textos científicos al rol 1 para revisión (respuesta antes de las 15:00).

### Fase 8. Cierre (dom 14:00 a 16:00)
- [ ] P0: revisión completa en inglés. P1: revisión en español.
- [ ] P0: prueba en Chrome y Firefox, y rendimiento del mapa en un portátil modesto.
- [ ] P0: correcciones del rol 1.
- [ ] P0: enlace de Vercel funcionando y repositorio sin secretos.
- [ ] **16:00: código congelado.**

### Extras, P2
- [ ] Globo del objetivo y capas planetarias interactivas más allá del mapa lado a lado.
- [ ] Un objetivo lunar, si el rol 1 entrega sus datos. Para la web son solo datos. Si está en el polo
      sur lunar, usar una imagen fija: no cabe en el mapa.

## Propuestas para el rol 1

Las confirma el sábado a las 15:00. El catálogo de sitios está en [docs/catalogo-sitios.csv](docs/catalogo-sitios.csv):
12 sitios de núcleo, 16 de ampliación si el rol 2 llega, Atacama como referencia y 2 controles
negativos. Sus coordenadas son aproximadas y hay que verificarlas.

### Propósitos (3 o 4 bastan)

| Tipo | Propósito | Objetivo provisional | Dimensiones con más peso |
|---|---|---|---|
| Fenómeno | Depósitos de sal y lagos antiguos | Cráter Jezero | Origen geológico, aridez, albedo |
| Fenómeno | Sistemas hidrotermales y posibles biofirmas | Colinas Columbia, Gusev | Origen geológico, cobertura vegetal |
| Tarea | Movilidad de rover en terreno rocoso | Cráter Jezero | Pendiente, rugosidad |
| Tarea | Operaciones humanas en frío, sequedad y baja presión | A definir | Temperatura, amplitud térmica, aridez |

### Dimensiones

Más dimensiones permiten distinguir sitios que se parecen. Las fuentes son sugerencias para los roles 2 y 3.

| Dimensión | Indicador | Tierra | Marte | Dificultad en 36 h |
|---|---|---|---|---|
| Pendiente | Pendiente mediana, ° | NASADEM o SRTM | MOLA | Baja |
| Rugosidad | Desviación de la elevación, m | NASADEM o SRTM | MOLA | Baja |
| Temperatura | Media anual de superficie, °C | MODIS LST | TES o Mars Climate Database | Baja |
| Amplitud térmica | Diferencia día y noche, °C | MODIS LST | Mars Climate Database | Baja |
| Aridez | Precipitación anual, mm | GPM IMERG | 0 por definición | Baja |
| Albedo | Albedo de superficie | MODIS MCD43 | TES | Baja |
| Cobertura vegetal | NDVI medio (menos es mejor) | MODIS NDVI | 0 por definición | Baja |
| Origen geológico | Categoría: lecho de lago, volcánico, hidrotermal, eólico | Bibliografía, a mano | Mapa geológico del USGS | Baja, manual |
| Presión | Presión en superficie, hPa | MERRA-2 | Mars Climate Database | Media; siempre saldrá baja, y eso ilustra un límite |
| Mineralogía | Sales, óxidos de hierro, sílice | EMIT o ASTER | CRISM | Alta |
| Polvo y viento | Velocidad del viento, m/s | MERRA-2 | Mars Climate Database | Media |
| Hielo | Días bajo cero al año | MODIS LST | Mapas SWIM | Media |

## Rol 6: narrativa, diseño y demo

### Sábado
- [ ] Registrar en el plan la frase de una línea y la paleta de colores cuando estén definidas.
      Meta del sábado a las 14:00. El nombre (Galaxy Match) y el estilo (tema claro) ya están decididos.
- [ ] **`texts.json`:** escribir `description`, `limits` y `exploration` de los 12 sitios de núcleo,
      Atacama y los 2 controles, en inglés y español. El esqueleto está en `docs/texts.json`.
      No depende de los datos: se puede empezar ya.
- [ ] Texto del problema, usuario y propuesta de valor (base: el canvas ya acordado).
- [ ] Texto de los límites generales de la analogía (gravedad, vacío o atmósfera fina, radiación).
- [ ] Guion del video de 30 segundos (unas 75 palabras en inglés) y esqueleto de las
      7 diapositivas, con huecos marcados para resultados. La demo recorre los seis huecos:
      propósito, sitio ganador, valores con sus agencias, validación, límite principal y qué se puede probar ahí.
- [ ] Fotos e imágenes de los sitios bolivianos, anotando autor y licencia de cada una.
- [ ] `docs/uso-de-ia.md`: registro de lo hecho con IA (se va llenando durante todo el hackatón).
- [ ] Confirmar con el evento local la hora de cierre y si hay presentación oral además del envío.

### Domingo
- [ ] Mañana: borradores del README en inglés y del texto del envío. Escribir los pasos de `story`
      en `texts.json`: son el guion del video.
- [ ] Tabla «datos usados» por agencia para el formulario, sacada de `meta.dimensions[].sources`.
- [ ] 12:00 a 16:00, con datos reales: 2 o 3 sitios destacados con su historia y resultado de la validación.
- [ ] 16:00 a 19:00: capturas y grabación de la app con datos reales; subtítulos en inglés;
      subir el video o las diapositivas a un enlace público (YouTube, Drive o GitHub).
- [ ] 19:00 a 20:30: ensayo, revisión final y formulario completo.
- [ ] **21:00: Submit for Judging.**

## Requisitos del envío

Según la guía oficial de 2025; confirmar con la de 2026.

- Demo: video de **30 segundos como máximo con subtítulos en inglés**, o **7 diapositivas como
  máximo en inglés** (incluida la portada), en un enlace público. No se suben archivos a Space Apps.
- Enlace al proyecto: repositorio o sitio publicado, público.
- Descripción del proyecto, datos de NASA y de otras agencias usados, referencias y uso de IA.
- La demo debe mostrar cómo los datos abiertos de agencias espaciales hicieron posible el proyecto.
- Criterios del jurado: impacto, creatividad, validez, relevancia y presentación.

## Qué se necesita de los roles 1 a 4

| De quién | Qué | Para cuándo |
|---|---|---|
| Rol 1 | Propósitos con sus pesos, objetivos (Marte y, si se decide, 1 lunar), dimensiones y catálogo con coordenadas verificadas | sáb 15:00 |
| Rol 4 | Confirmación del contrato v2.1; si entrega `sources`, `purposeScores` y la capa continua | sáb 15:00 |
| Rol 2 | Valor de cada dimensión en cada sitio del catálogo, con su fuente | parcial sáb 20:00; completo dom 12:00 |
| Rol 3 | Valor de cada dimensión en cada objetivo; imágenes de los objetivos con su fuente | sáb 20:00 |
| Rol 4 | Entrega parcial real (3 sitios o más) | sáb 20:00 |
| Rol 4 | `analogs.json` real completo y nota de método | dom 12:00 |
| Rol 4 | Capa continua de similitud: PNG en Web Mercator con sus cuatro esquinas | dom 08:00 si es posible; dom 12:00 como tarde |
| Rol 1 | Revisión científica de `texts.json` | dom 15:00 |

**Plan B:** si el domingo a las 14:00 sigue pendiente el archivo completo, usar la entrega parcial
real y adaptar los pasos de la historia a los sitios disponibles. Si solo hay datos de prueba, presentar
la web como prototipo con datos de demostración.

## Preguntas abiertas

- Frase de una línea y paleta (rol 6, sáb 14:00).
- Hora exacta de cierre del evento local.
- Lista final de propósitos, dimensiones y objetivos; ¿se incluye un objetivo lunar? (rol 1, sáb 15:00).
- ¿Entrega el rol 4 `purposeScores` y la capa continua? (rol 4, sáb 15:00).
