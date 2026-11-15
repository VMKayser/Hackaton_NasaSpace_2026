# AGENTS.md

Guía para cualquier agente de IA (y persona) que trabaje en este repositorio.

## Qué es este proyecto

**Galaxy Match**, proyecto para el **NASA Space Apps Challenge 2026**, reto de **análogos terrestres**
de la Luna y Marte. Repositorio: `https://github.com/VMKayser/Hackaton_NasaSpace_2026` (público).

**Pregunta central:** ¿qué lugar de la Tierra sirve para estudiar un fenómeno o ensayar una tarea de
Marte o la Luna, y qué datos respaldan esa elección?

**Idea:** el usuario elige un propósito (un fenómeno a estudiar o una tarea a ensayar). La herramienta
muestra los sitios de Bolivia que mejor sirven, con un puntaje por dimensión, los valores medidos en
la Tierra y en el objetivo, las fuentes de esos datos y una explicación de dónde falla la analogía.

**Decisiones de enfoque ya tomadas:**

- Cuerpos objetivo: **Marte** (cinco sitios de aterrizaje, el de Viking 2 en Utopia Planitia y dos zonas
  de hielo: un glaciar cubierto en Deuteronilus Mensae y el hielo enterrado de Arcadia Planitia, más Mawrth
  Vallis) y **la Luna** (cuatro puntos del polo sur en regiones candidatas de Artemis III y los sitios de
  Apollo 11, 15 y 17). La app es neutral respecto al cuerpo: un objetivo es solo otra fila.
- Región piloto: **Bolivia** (Altiplano y Sur de Lípez), con un **catálogo fijo de sitios**
  (`docs/catalogo-sitios.csv`). El método es general; Bolivia es el caso de estudio. Seis análogos ya
  estudiados de otros países (Haughton, Badwater, MDRS, Askja, Kīlauea, Dallol) entran en el catálogo y en la
  escala para comparar, cada uno con su fuente.
- **Atacama** se incluye como referencia para comprobar una analogía documentada, y hay **controles
  negativos** que deben salir con puntaje bajo.
- Usuario principal: equipos de misión que prueban instrumentos, robots y operaciones.
  Secundarios: universidades y agencias pequeñas, educadores y público general.
- Estilo visual: tema claro, tipo informe científico.

## Equipo y alcance de este repositorio

El equipo tiene 6 roles. **Este repositorio cubre los roles 5 y 6.**

| Rol | Responsabilidad | Dónde vive |
|---|---|---|
| 1 | Líder y ciencia: propósitos, sitios objetivo, variables y catálogo | fuera de este repo |
| 2 | Datos de la Tierra | fuera de este repo |
| 3 | Datos de la Luna y Marte | fuera de este repo |
| 4 | Métrica de similitud y ranking | entrega `analogs.json` |
| **5** | **App web con mapa interactivo** | `web/` |
| **6** | **Narrativa, diseño, textos y demo** | `docs/` y `texts.json` |

El rol 4 calcula todos los puntajes: por dimensión, total y por propósito. **La web ordena y muestra
esos resultados; no los recalcula.** No hay pesos editables en el navegador.

## Stack del rol 5

Versiones comprobadas el 14 de noviembre de 2026. Usar las que instale la plantilla.

- **React 19 + Vite 8 + TypeScript 7**, gestor de paquetes **npm**. Node local 22.23 cumple.
  Crear con `npm create vite@latest web -- --template react-ts`.
- **MapLibre GL JS 6** (6.18): solo ESM, exige WebGL2 y ya no existe `map.transform` (usar la API
  pública). El mapa base es P0; el globo y el relieve se incorporan en P1.
  - Globo: proyección `globe`. Vista 2D: proyección `mercator` con terreno (`raster-dem`).
  - Un botón alterna entre ambas vistas sobre el mismo mapa.
- **Recharts 3** para el gráfico de radar de dimensiones (P1).
- **Tailwind CSS 4** con el plugin `@tailwindcss/vite`; sin `tailwind.config.js`.
- **Zod 4** para validar los archivos de datos al cargar. **Vitest 5** para la lógica pura.
- Sin router, sin librería de estado y sin `react-map-gl`: `useReducer` y estado en la URL
  (`?purpose=&target=&site=&compare=&view=&lang=&step=&pin=&tpin=`). `pin` es «lat,lon» del pin
  libre en la Tierra y `tpin` es «mars:lat,lon» o «moon:lat,lon».
- Sitio **estático**, sin servidor propio. Publicación en **Vercel**, directorio raíz `web`.

### Fuentes de mapa

Probadas el 14 de noviembre: responden 200 y permiten CORS. Confirmar licencia y texto de atribución
antes de publicar.

| Uso | Plantilla | Notas |
|---|---|---|
| Vista global (NASA) | `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg` | `maxzoom: 8`; orden `{z}/{y}/{x}` |
| Detalle | `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Sentinel-2 cloudless 2016 (ESA, EOX); orden `{z}/{y}/{x}`; ver s2maps.eu |
| Relieve | `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | `raster-dem`, `encoding: "terrarium"`, `tileSize: 256` |
| Marte | `https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-2/all/{z}/{x}/{y}.png` | OpenPlanetaryMap, servicio comunitario |
| Luna | `https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-moon-basemap-v0-1/all/{z}/{x}/{y}.png` | Igual. No cubre más allá de 85° de latitud |
| Relieve global de Marte (USGS) | `https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/Mars/HRSC_MOLA_Blend/Mars_HRSC_MOLA_BlendDEM_Global_200mp_v2.tif` | GeoTIFF Int16 sin compresión, una fila por tira; se lee por rangos (CORS con `Range`). 200 m, metros sobre el areoide |
| Relieve de la Luna (USGS) | `https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/LolaKaguya_Topo/Lunar_LRO_LOLAKaguya_DEMmerge_60N60S_512ppd.tif` | Igual; 59 m, entre 60° N y 60° S, 0,5 m por unidad. Ver `web/src/map/usgsDem.ts` |
| Relieve del polo sur de la Luna (LOLA) | `https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr/polar/img/ldem_85s_40m.img` | 40 m, 85° S al polo, estereográfica polar. Lo lee `tools/moon_polar.py` (no el navegador) |

Un objetivo en el polo sur lunar no cabe en Web Mercator: el mapa 2D usa una imagen fija con atribución.
Para la vista 3D, `tools/moon_polar.py` guarda su relieve en un **marco local** (el plano estereográfico
reubicado en torno a 0°, 0° a escala real; región con `frame` en `terrain/moon/manifest.json`, conversión en
`web/src/lib/polarFrame.ts`). Ahí no hay imagen orbital: se muestra el sombreado del mismo relieve. Si el
servicio de Marte falla, también imagen fija. Las teselas de NASA Trek son equirectangulares y no sirven como
fuente directa en MapLibre.

### Detalles del mapa

- Crear el mapa una vez en un `useEffect`, guardarlo en un `ref` y limpiar con `map.remove()`.
- Vista 2D con relieve: `setProjection({ type: "mercator" })`, `setTerrain({ source, exaggeration: 1.5 })`
  y `easeTo({ pitch: 60 })`. De vuelta al globo: `setTerrain(null)` y `pitch: 0`.
- Dos fuentes `raster-dem` con la misma URL: una para el terreno y otra para el sombreado.
- Sitios: fuente GeoJSON y capas `circle`. Sin capas de texto, para no depender de un servidor de
  tipografías: los nombres van en ventanas emergentes HTML.
- Capa continua: fuente `image` con las cuatro esquinas de `bounds`, debajo de los círculos.
- En el mapa del objetivo no usar el control de escala de MapLibre, que asume el radio de la Tierra.
  Radios: Marte 3389,5 km; Luna 1737,4 km.
- Sin WebGL2: mensaje claro; el ranking y las fichas siguen funcionando sin mapa.

## Estructura de carpetas

```
AGENTS.md            esta guía
PLAN.md              plan de trabajo con casillas
web/                 app del rol 5
  public/data/analogs.json   números del rol 4 (de prueba o reales)
  public/data/texts.json     textos y pasos de la historia, del rol 6
  src/
    components/      interfaz (propósitos, ranking, ficha, tabla de valores, radar, comparación)
    map/             mapa, capas, cambio globo/2D, bodies.ts (mapa base y radio por cuerpo)
    i18n/            en.ts y es.ts
    data/            esquemas Zod, carga y mezcla de los dos archivos
tools/               mediciones (measure_values.py) y generación de analogs.json (build_analogs.py)
docs/                rol 6 y coordinación
  valores/                 objetivos, geología, valores medidos, pesos y sus fuentes (ver su README)
  contrato-rol-4.md        guía de entrega que se envía al rol 4
  analogs.example.json     ejemplo del formato
  catalogo-sitios.csv      catálogo fijo: 12 de núcleo, 16 de ampliación, 3 de validación y 6 análogos
                           ya estudiados de otros países (grupo `world`, `known: true`)
  texts.json               esqueleto de textos; en la Fase 1 se mueve a web/public/data/
```

## Contrato de datos

Dos archivos en `web/public/data/`. Las claves van en inglés. Los textos que ve el usuario van en
los dos idiomas.

Versión 2.2 (15 de noviembre): es la v2.1 más `meta.minCoverage` y `targets[].context`, los dos opcionales.
La 2.1 era la v2 más campos opcionales, marcados con `?`. Un archivo v2 sigue siendo válido. La [guía de entrega](docs/contrato-rol-4.md) es lo que se envía al rol 4 y manda sobre
este resumen; el [JSON de ejemplo](docs/analogs.example.json) usa este formato.

### `analogs.json`, del rol 4

```ts
type DimensionId = string;                 // "terrain", "temperature", "mineralogy", ...
type Text = { en: string; es: string };
type Value = {                             // medición, valor derivado o categoría
  value: number | string | null;           // códigos para categorías; null = sin dato
  unit: string | null;                     // "°C", "m", "°"; null si la unidad no aplica
};

interface AnalogsFile {
  meta: {
    mock: boolean;                         // true mientras sean datos de prueba
    version: string;                       // versión del formato, p. ej. "2.1.0"
    generated: string;                     // fecha ISO
    scoring?: Text;                        // cómo se obtiene el total, faltantes, área analizada
    minCoverage?: number;                  // parte mínima del peso con dato para dar un total (0 a 1)
    dimensions: {
      id: DimensionId;
      label: Text;
      weight: number;                      // peso por defecto; la web solo lo muestra
      sources: {                           // datos usados
        name: string; agency: string; url: string;
        body?: "earth" | "mars" | "moon";
      }[];
      categories?: Record<string, Text>;   // código de categoría a texto
      measure?: string;                    // medición que guarda (columna de docs/valores), p. ej. "slope_median_deg"
    }[];
    purposes?: {                           // qué se quiere estudiar o ensayar
      id: string;
      kind: "phenomenon" | "task";
      targetId: string;
      weights: Record<DimensionId, number>;
      label?: Text; question?: Text;
    }[];
    overlays?: {                           // capa continua de similitud
      targetId: string; purposeId?: string;
      url: string;                         // PNG en Web Mercator (EPSG:3857)
      bounds: [number, number, number, number];  // oeste, sur, este, norte
    }[];
  };
  targets: {                               // sitios objetivo en Marte (o la Luna)
    id: string;                            // "jezero"
    name: string;
    body: "mars" | "moon";
    lat: number; lon: number;              // grados decimales; longitud este positiva, −180 a 180
    summary?: Text;
    values: Record<DimensionId, Value>;
    context?: {                            // mediciones sin equivalente en la Tierra: se muestran, no puntúan
      id: string; label: Text; value: number | string | null; unit: string | null;
      note?: Text; sources: Source[];      // al menos una fuente
    }[];
  }[];
  sites: {                                 // candidatos en la Tierra
    id: string;                            // los de docs/catalogo-sitios.csv
    name: string;
    lat: number; lon: number;              // WGS84, grados decimales
    known: boolean;                        // true si ya está estudiado como análogo
    reference: boolean;                    // true para el sitio de referencia de Atacama
    control: boolean;                      // true para un sitio de contraste; si falta, false
    radiusKm?: number;                     // radio del área analizada
    place?: Record<string, string>;        // v2.2: país y departamento (OpenStreetMap), para etiquetas y filtros
    type?: Text;                           // salar, volcánico, hidrotermal...
    description?: Text;
    limits?: Text;                         // dónde falla la analogía
    exploration?: Text;                    // qué se puede probar aquí
    values: Record<DimensionId, Value>;
    scores: {
      targetId: string;
      similarity: number;                  // 0 a 1
      dimensions: Record<DimensionId, number | null>;  // 0 a 1; null = sin dato
    }[];
    purposeScores?: Record<string, number | null>;     // por id de propósito
  }[];
}
```

### `texts.json`, del rol 6

```ts
type Source = { name: string; agency: string; url: string };

interface TextsFile {
  targets?: Record<string, { summary?: Text; sources?: Source[] }>;
  sites?: Record<string, { description?: Text; limits?: Text; exploration?: Text; sources?: Source[] }>;
  purposes?: Record<string, { label?: Text; question?: Text }>;
  adaptations?: {                          // recomendaciones para adaptar un ensayo, con fuente
    id: string; body?: "mars" | "moon"; purposeId?: string;
    title: Text; text: Text; sources: Source[];   // al menos una fuente
  }[];
  story?: {                                // pasos del modo historia
    purposeId?: string; targetId?: string; siteId?: string; compare?: string[];
    view?: "globe" | "2d"; caption: Text;
  }[];
}
```

### `discoveries.json`, de `tools/discover.py` (opcional)

Lugares nuevos: puntos de una malla del Altiplano, fuera del catálogo, medidos y puntuados con el mismo
método y los mismos pesos que `analogs.json`. Cada candidato tiene `targetId`, `purposeId?`, `rank`,
`lat`, `lon`, `similarity`, `values`, `dimensions`, `place` (nombres de OpenStreetMap) y `nearestSite`.
`meta` describe la malla, la comprobación con el catálogo y las fuentes. La web solo los muestra.

### `grid.json`, de `tools/grid_relief.py` (opcional)

Relieve de cada punto de la malla del Altiplano que ya midió `tools/discover.py` (solo los de Bolivia, según
Natural Earth): `values` por nombre de medición (`slope_median_deg`, `slope_p90_deg`, `roughness_tri_m`),
`elevationM`, `nearestSite` y `place` si OpenStreetMap le dio nombre. La web lo carga solo al pulsar
«Lugares nuevos» en el pin libre (ver regla 10).

### Reglas del contrato

- Los IDs se mantienen entre entregas y son los mismos en los dos archivos. Cada `targetId` debe
  existir en `targets` y puede aparecer una vez por sitio.
- Cada `values` y `scores[].dimensions` incluye las claves de `meta.dimensions`. Si una pareja queda
  sin puntaje total, se omite su entrada de `scores`. La web la muestra como «no evaluado», al final
  del ranking y en gris en el mapa.
- Cada texto de `texts.json` lleva sus fuentes en `sources`; la ficha las muestra como «Fuentes de los
  textos». Una prueba falla si un sitio con texto no tiene fuente con enlace.
- La web carga los dos archivos. Donde hay texto en ambos, gana `texts.json`. Un texto ausente o
  vacío se muestra como «texto pendiente»; no es un error.
- Sin `purposes`: selector de objetivo y orden por `similarity`. Con `purposes` pero sin
  `purposeScores`: el propósito elige el objetivo y resalta sus dimensiones; el orden sigue por
  `similarity`.
- Una longitud entre 180 y 360 se convierte restando 360.
- Validar al cargar: IDs únicos, referencias cruzadas existentes, puntajes entre 0 y 1 o `null`,
  coordenadas en rango. Mostrar un error legible con los primeros fallos.

Regla propuesta para `similarity`: sumar cada puntaje por dimensión multiplicado por su peso y dividir
entre la suma de los pesos de las dimensiones evaluadas. La calcula el rol 4. La web la explica en la
página de método con `meta.scoring` y los pesos.

Si el contrato cambia, se actualiza en `docs/contrato-rol-4.md`, aquí y en `web/src/data/`, y se avisa al rol 4.

## Reglas

1. **Los datos de prueba nunca se presentan como resultados.** Si `meta.mock` es `true`, la app
   muestra un aviso visible de "datos de demostración".
2. **Todo texto de interfaz sale de `i18n/`**, en inglés y español. Inglés por defecto. Las dos
   listas deben tener las mismas claves; TypeScript debe fallar si falta alguna.
3. **Los límites de la analogía siempre se muestran** junto al puntaje (gravedad, presión,
   radiación, lo que diga `limits`). El reto lo pide de forma explícita.
4. **No presentar como descubrimiento** sitios ya estudiados (Uyuni, Licancabur, Atacama).
   Se marcan con `known: true`.
5. **Un valor `null` se muestra como "sin dato"**, nunca como cero.
6. **Atribución de fuentes** de datos e imágenes visible en la app. Solo datos e imágenes abiertos.
7. **Sin claves ni secretos** en el repositorio.
8. **Uso de IA:** anotar en `docs/uso-de-ia.md` qué se hizo con IA, para declararlo en el envío.
   Confirmar la regla exacta de Space Apps 2026.
9. No añadir dependencias ni funciones fuera de `PLAN.md` sin acordarlo.
10. **La app no calcula ni recalcula puntajes.** Única excepción (15 de noviembre): con el pin libre en
    Marte o la Luna, el navegador calcula el **parecido de relieve** del punto con los sitios de la Tierra, y
    con un pin en la Tierra, su parecido con cada objetivo, con la
    escala y los pesos de `tools/build_analogs.py` y solo con las dimensiones cuyo `measure` sabe medir
    (`web/src/lib/terrainMatch.ts`). Se rotula como cálculo del navegador y solo de relieve. El mismo
    cálculo compara el punto con los puntos de la malla (`grid.json`) para proponer lugares nuevos.
    Sin pin en el otro cuerpo se usan las mediciones del objetivo en `analogs.json`.
11. **Ningún identificador de datos en el código:** dimensiones, sitios, objetivos, propósitos y
    pasos de la historia salen de los archivos.
12. **Ningún texto fijo dice "Marte".** Se usa el `body` del objetivo.
13. **Todo puntaje se muestra con su respaldo:** valores con unidad en la Tierra y en el objetivo, y
    las fuentes de la dimensión con su agencia.
14. **Referencia y controles a la vista** en el ranking, con su marca. Forma distinta, no solo color,
    para conocido, referencia, control y no evaluado.

## Comandos (dentro de `web/`, cuando exista)

```
npm install
npm run dev        servidor local
npm run build      compilación de producción
npm run typecheck  revisión de tipos
npm run lint
npm run test       pruebas de la lógica pura
```

Para cambios en la web, ejecutar `typecheck`, `lint`, `test` y `build`, y probar la función en el
navegador en los dos idiomas y en las vistas afectadas que estén implementadas.
