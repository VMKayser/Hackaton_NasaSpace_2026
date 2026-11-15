# Entrega de datos para la web (v2.1)

El rol 4 entrega un archivo `analogs.json` con puntajes precalculados. La web lo carga desde `web/public/data/analogs.json` para mostrar el ranking y las fichas de comparación que también usa el modo historia.

La v2.1 mantiene todo el formato v2 y añade campos opcionales. Un archivo v2 sigue siendo válido.

## Formato del archivo

| Campo | Contenido |
|---|---|
| `meta` | `mock` (booleano), `version` (texto, p. ej. `"2.1.0"`), `generated` (fecha ISO 8601) y `dimensions`. |
| `meta.dimensions[]` | `id`, `label`, `weight` (número finito mayor o igual que cero) y `sources` (lista de objetos con `name`, `agency` y `url`). |
| `targets[]` | `id`, `name`, `body` (`mars` o `moon`), `lat`, `lon` y `values`. `summary` es opcional. |
| `sites[]` | `id`, `name`, `lat`, `lon`, `known`, `reference`, `control`, `values` y `scores`. `description`, `limits` y `exploration` son opcionales. |
| `sites[].scores[]` | Un registro por sitio y objetivo evaluado, con `targetId`, `similarity` (puntaje total) y `dimensions` (puntajes por dimensión). |
| `values.<dimensionId>` | Objeto con `value` (número, código de categoría o `null`) y `unit` (texto o `null` si no aplica). |

- Usa IDs únicos y estables. Los IDs de los sitios salen del [catálogo CSV](catalogo-sitios.csv) y coinciden con los del JSON de ejemplo. La columna `radius_km` corresponde al campo opcional `radiusKm`. Cada `targetId` debe existir en `targets` y puede aparecer una vez por sitio. Incluye todas las claves de `meta.dimensions` en cada objeto `values` y `scores[].dimensions`.
- Los puntajes van de 0 a 1. En `values` y en los puntajes por dimensión, `null` significa «sin dato» y `0` es un valor válido. Omite la entrada de `scores` para una pareja que quedó sin puntaje total: la web la muestra como «no evaluado».
- Usa grados decimales y longitudes entre −180° y 180°, positivas al este. Si la fuente de Marte usa de 0 a 360 °E, resta 360 a los valores mayores que 180 (354,5 pasa a −5,5). Para Tierra usa WGS84. Para Marte indica la convención de latitud en la nota del método.
- `label` lleva `{ "en": "...", "es": "..." }`. Mantén los nombres propios como texto simple.
- Usa `known: true` para sitios ya estudiados, `reference: true` para la referencia de Atacama y `control: true` para un sitio de contraste. Explica qué resultado esperas de cada referencia o control y para qué dimensión u objetivo.
- Usa `meta.mock: true` para la plantilla de demostración. En la entrega real usa `meta.mock: false` y deja los valores faltantes en `null`.

## Textos: los escribe el rol 6

Los textos `summary`, `description`, `limits` y `exploration` los escribe el rol 6 en un archivo aparte, `texts.json`, con los mismos IDs, y los revisa el rol 1. El rol 4 puede omitirlos y entregar solo números. Si vienen en los dos archivos, la web usa los de `texts.json`.

## Campos opcionales nuevos

| Campo | Contenido | Para qué sirve |
|---|---|---|
| `meta.scoring` | Texto bilingüe: cómo se obtiene el total, cómo se tratan los faltantes y qué área se analizó. | Página de método. |
| `meta.dimensions[].sources[].body` | `earth`, `mars` o `moon`. | Mostrar qué dato corresponde a cada cuerpo. |
| `meta.dimensions[].categories` | Objeto de código de categoría a texto bilingüe. | Traducir valores de categoría. |
| `sites[].radiusKm` | Radio del área analizada alrededor del punto. | Dibujar el área en el mapa. |
| `sites[].type` | Texto bilingüe con el tipo de sitio (salar, volcánico, hidrotermal). | Filtro y ficha. |
| `meta.purposes[]` | `id`, `kind` (`phenomenon` o `task`), `targetId` y `weights` (peso por dimensión). `label` y `question` son opcionales y bilingües. | Entrada por propósito: qué se quiere estudiar o ensayar. |
| `sites[].purposeScores` | Objeto de ID de propósito a puntaje de 0 a 1, o `null`. | Ordenar el ranking de cada propósito. |
| `meta.overlays[]` | `targetId`, `purposeId` (opcional), `url` y `bounds` (`[oeste, sur, este, norte]`). | Capa continua de similitud sobre Bolivia. |

- **Propósitos.** Sin `purposes`, la web muestra un selector de objetivo y ordena por `similarity`. Con `purposes` pero sin `purposeScores`, el propósito elige el objetivo y el orden sigue por `similarity`.
- **Capa continua.** Es un PNG con color y transparencia, exportado en Web Mercator (EPSG:3857). En latitud y longitud simples queda desplazado varios kilómetros respecto a los sitios. Acompáñalo con su cobertura, resolución y método.
- **Controles.** El catálogo propone dos controles negativos: una llanura húmeda y una montaña húmeda con bosque. Sirven para comprobar que el puntaje baja donde debe.

## Método y comparación

La web muestra los puntajes exportados y no los recalcula. Los pesos de `weight` se muestran en la página de método. La fórmula propuesta para `similarity` usa los puntajes numéricos con peso positivo y divide su suma ponderada entre la suma de esos pesos. Si la suma de pesos es cero, la pareja queda sin puntaje.

En la nota del método, o en `meta.scoring`, indica qué mide cada dimensión, la unidad común, el área analizada y, cuando aplique, la resolución de comparación. Distingue qué fuente de `sources` corresponde a cada cuerpo.

## Para confirmar el sábado a las 15:00

1. ¿Puedes entregar el formato v2.1? El formato v2 también es compatible si todavía faltan los campos opcionales.
2. ¿Puedes llenar `sources` con nombre, agencia y enlace de cada dato?
3. ¿Puedes entregar `purposeScores` si el rol 1 define los propósitos y sus pesos?
4. ¿Puedes entregar la capa continua de similitud como PNG en Web Mercator?

## Primera entrega

Para probar la integración, basta un objetivo marciano con tres sitios si están disponibles. Incluye la fórmula del total y el tratamiento de faltantes. Puedes partir de [analogs.example.json](analogs.example.json), que incluye dos candidatos bolivianos, Atacama, un control y un propósito. Todos sus valores y puntajes son ilustrativos.
