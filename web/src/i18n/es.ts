import type { en } from './en'

// TypeScript falla si falta o sobra alguna clave respecto a en.ts.
export const es: Record<keyof typeof en, string> = {
  'app.tagline': 'Análogos terrestres para la exploración planetaria',
  'lang.label': 'Idioma',
  'home.label': 'Volver al inicio',

  'demo.title': 'Datos de demostración',
  'demo.body': 'Los puntajes y las mediciones son ilustrativos, no resultados.',

  'picker.kicker': 'Encuentra un análogo',
  'picker.title': '¿Qué quieres estudiar o ensayar?',
  'picker.lead':
    'Elige un propósito. Galaxy Match ordena lugares de la Tierra según cuánto se parecen sus condiciones medidas a las de un sitio de otro mundo, y muestra dónde falla la analogía.',
  'picker.phenomenon': 'Estudiar un fenómeno',
  'picker.task': 'Ensayar una tarea',
  'picker.targets': 'O compara directamente con un sitio objetivo',
  'picker.noPurposes': 'Elige un sitio objetivo',
  'picker.stats': '{sites} lugares de la Tierra · {targets} sitios objetivo · {dims} dimensiones',

  'kind.phenomenon': 'Fenómeno',
  'kind.task': 'Tarea',

  'nav.changePurpose': 'Cambiar de propósito',
  'nav.backToRanking': 'Volver al ranking',

  'target.label': 'Sitio objetivo',
  'target.comparing': 'Comparado con',
  'target.measurements': 'Mediciones del objetivo',
  'target.measurementCount': '{n} de {total} disponibles',
  'table.measurement': 'Valor',

  'ranking.title': 'Los mejores lugares de la Tierra',
  'ranking.byPurpose': 'Ordenados según este propósito',
  'ranking.bySimilarity': 'Ordenados por similitud general',
  'ranking.count': '{n} de {total} sitios evaluados',
  'ranking.strongest': 'Más alto',
  'ranking.weakest': 'más bajo',

  'badge.candidate': 'Candidato',
  'badge.known': 'Análogo conocido',
  'badge.reference': 'Referencia',
  'badge.control': 'Control negativo',
  'badge.notEvaluated': 'No evaluado',

  'detail.rank': 'Puesto {rank} de {total}',
  'detail.purposeScore': 'Ajuste a este propósito',
  'detail.similarity': 'Similitud general',
  'detail.notEvaluated': 'Este sitio no tiene puntaje para este objetivo.',
  'detail.dimsScored': '{n} de {total} dimensiones con dato',
  'detail.about': 'Sobre este sitio',
  'detail.evidence': 'Medido lado a lado',
  'detail.evidenceLead': 'Cada puntaje compara el mismo indicador en la Tierra y en el objetivo, con sus fuentes.',
  'detail.limits': 'Dónde falla la analogía',
  'detail.exploration': 'Qué se puede probar aquí',
  'detail.radius': 'Área analizada: radio de {km} km',
  'detail.share': 'Copiar enlace',
  'detail.copied': 'Enlace copiado',

  'table.dimension': 'Dimensión',
  'table.earth': 'Tierra',
  'table.score': 'Puntaje',
  'table.counted': 'Cuentan en este puntaje',
  'table.context': 'Solo contexto: no cuentan en el total',
  'table.weight': 'peso {pct} %',

  'text.pending': 'Texto pendiente',
  'value.noData': 'Sin dato',

  'limits.general.mars':
    'Ningún lugar de la Tierra reproduce la gravedad de Marte (38 % de la terrestre), su atmósfera fina de dióxido de carbono (menos del 1 % de la presión en la superficie terrestre) ni su radiación en superficie.',
  'limits.general.moon':
    'Ningún lugar de la Tierra reproduce la gravedad de la Luna (17 % de la terrestre), su vacío, sus días y noches de dos semanas ni su radiación en superficie.',

  'body.mars': 'Marte',
  'body.moon': 'Luna',
  'body.earth': 'Tierra',

  'map.label': 'Mapa de sitios candidatos',
  'map.globe': 'Globo',
  'map.relief': 'Relieve',
  'map.view': 'Vista del mapa',
  'map.noWebgl': 'Este navegador no puede mostrar el mapa (requiere WebGL 2). El ranking y las fichas siguen funcionando.',

  'map.loading': 'Cargando mapa…',
  'map.unavailable': 'No se pudo cargar el mapa interactivo.',
  'map.worlds': 'Mapas',
  'map.sideBySide': 'Objetivo y Tierra',
  'map.planet': 'Mapa de {body}',
  'map.static': 'Imagen fija',
  'map.lunarPole': 'Mapa de iluminación del polo sur lunar',
  'map.explorer': 'Abrir en NASA Trek',
  'map.chooseTarget': 'Elige un objetivo',
  'map.targets': 'Objetivos en {body}',
  'map.noTargets': 'El catálogo aún no tiene objetivos en este cuerpo.',
  'map.zoomIn': 'Acercar',
  'map.zoomOut': 'Alejar',
  'map.overview': 'Ver globo completo',
  'radar.title': 'Mediciones por dimensión',
  'radar.scale': 'Cada eje va del mínimo al máximo del catálogo para esa unidad. Elige una dimensión para ver los dos valores.',
  'radar.empty': 'El radar requiere al menos tres dimensiones con valores numéricos en la misma unidad para ambos sitios. Consulta las mediciones abajo.',
  'story.start': 'Recorrido guiado',
  'story.progress': 'Paso {current} de {total}',
  'story.previous': 'Anterior',
  'story.next': 'Siguiente',
  'story.finish': 'Finalizar',
  'story.exit': 'Salir del recorrido',
  'compare.title': 'Comparar sitios',
  'compare.site': 'Sitio {n}',
  'compare.choose': 'Elige un sitio',
  'compare.hint': 'Elige dos o tres sitios para comparar sus mediciones frente al mismo objetivo.',
  'compare.add': 'Comparar este sitio',

  'legend.title': 'Leyenda',
  'legend.score': 'Puntaje de similitud',

  'loading': 'Cargando datos…',
  'error.title': 'No se pudieron cargar los datos',
  'error.file': 'Problema en {file}:',

  'footer.event': 'NASA Space Apps Challenge 2026',
  'footer.data': 'Datos v{version} · generados el {date}',
  'footer.code': 'Código fuente',
}
