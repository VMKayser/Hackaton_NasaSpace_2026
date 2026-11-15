import type { Site, Target } from '../data/schema'

export interface DimensionMeta {
  id: string
  label: { en: string; es: string }
}

export interface ParsedVoiceCommand {
  rawQuery: string
  targetId: string | null
  targetName: string | null
  body: 'mars' | 'moon' | null
  dimensionId: string | null
  dimensionName: string | null
  isGeneral: boolean
  siteId: string | null
  siteName: string | null
  country: string | null
  action: 'search' | 'explore3d' | 'adaptation' | 'view_change' | 'compare' | 'home' | null
  view?: 'globe' | '2d'
  world?: 'earth' | 'mars' | 'moon' | 'auto'
  explanation: string
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics (á->a, é->e, etc.)
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function parseNaturalLanguageQuery(
  rawQuery: string,
  targets: Target[],
  dimensions: DimensionMeta[],
  sites: Site[],
  lang: 'es' | 'en' = 'es'
): ParsedVoiceCommand {
  const norm = normalizeText(rawQuery)
  const isEs = lang === 'es'

  let targetId: string | null = null
  let targetName: string | null = null
  let body: 'mars' | 'moon' | null = null
  let dimensionId: string | null = null
  let dimensionName: string | null = null
  let isGeneral = false
  let siteId: string | null = null
  let siteName: string | null = null
  let country: string | null = null
  let action: ParsedVoiceCommand['action'] = null
  let view: 'globe' | '2d' | undefined = undefined
  let world: 'earth' | 'mars' | 'moon' | 'auto' | undefined = undefined

  // 1. Detect Action triggers
  if (norm.includes('adaptacion') || norm.includes('adaptar') || norm.includes('materiales') || norm.includes('equipamiento') || norm.includes('adaptation')) {
    action = 'adaptation'
  } else if (norm.includes('3d') || norm.includes('tres d') || norm.includes('explorar 3d') || norm.includes('relieve 3d') || norm.includes('explore 3d')) {
    action = 'explore3d'
  } else if (norm.includes('comparar') || norm.includes('comparacion') || norm.includes('compare')) {
    action = 'compare'
  } else if (norm.includes('inicio') || norm.includes('volver') || norm.includes('reiniciar') || norm.includes('home') || norm.includes('reset')) {
    action = 'home'
  } else if (norm.includes('globo') || norm.includes('globe')) {
    action = 'view_change'
    view = 'globe'
  } else if (norm.includes('2d') || norm.includes('dos d') || norm.includes('mercator')) {
    action = 'view_change'
    view = '2d'
  }

  // 2. Detect Planet Body
  if (norm.includes('luna') || norm.includes('lunar') || norm.includes('moon')) {
    body = 'moon'
  } else if (norm.includes('marte') || norm.includes('marciano') || norm.includes('mars') || norm.includes('martian')) {
    body = 'mars'
  }

  // 3. Detect Country
  if (norm.includes('bolivia') || norm.includes('bolivian')) {
    country = 'Bolivia'
  } else if (norm.includes('chile') || norm.includes('chilen')) {
    country = 'Chile'
  } else if (norm.includes('argentina') || norm.includes('argentin')) {
    country = 'Argentina'
  } else if (
    norm.includes('estados unidos') ||
    norm.includes('eeuu') ||
    norm.includes('ee uu') ||
    norm.includes('usa') ||
    norm.includes('united states')
  ) {
    country = 'Estados Unidos'
  } else if (norm.includes('peru') || norm.includes('peruan')) {
    country = 'Perú'
  } else if (norm.includes('canada') || norm.includes('canadien')) {
    country = 'Canadá'
  } else if (norm.includes('islandia') || norm.includes('iceland')) {
    country = 'Islandia'
  } else if (norm.includes('espana') || norm.includes('spain')) {
    country = 'España'
  } else if (norm.includes('noruega') || norm.includes('norway')) {
    country = 'Noruega'
  } else if (norm.includes('argelia') || norm.includes('algeria')) {
    country = 'Argelia'
  } else if (norm.includes('etiopia') || norm.includes('ethiopia')) {
    country = 'Etiopía'
  } else if (norm.includes('brasil') || norm.includes('brazil')) {
    country = 'Brasil'
  } else if (norm.includes('rusia') || norm.includes('russia')) {
    country = 'Rusia'
  } else if (norm.includes('antartida') || norm.includes('antarctica')) {
    country = 'Antártida'
  }

  // 4. Detect Target
  for (const t of targets) {
    const tNorm = normalizeText(t.name)
    const tIdNorm = normalizeText(t.id)

    // Check specific keywords or full name
    const keywords = [
      tNorm,
      tIdNorm,
      ...tNorm.split(' ').filter((w) => w.length > 3 && !['crater', 'planitia', 'massif', 'plateau', 'vallis', 'hills'].includes(w)),
    ]

    // Handle special target aliases
    if (t.id === 'gale' && (norm.includes('gale') || norm.includes('sharp'))) keywords.push('gale', 'sharp')
    if (t.id === 'jezero' && norm.includes('jezero')) keywords.push('jezero')
    if (t.id === 'hadley' && (norm.includes('hadley') || norm.includes('apollo 15'))) keywords.push('hadley')
    if (t.id === 'tranquility' && (norm.includes('tranquilidad') || norm.includes('tranquility') || norm.includes('apollo 11'))) keywords.push('tranquilidad', 'tranquility')
    if (t.id === 'marius-hills' && norm.includes('marius')) keywords.push('marius')
    if (t.id === 'shackleton-crater' && norm.includes('shackleton')) keywords.push('shackleton')
    if (t.id === 'malapert-massif-site23' && (norm.includes('malapert') || norm.includes('site 23') || norm.includes('site23'))) keywords.push('malapert', 'site 23')
    if (t.id === 'mons-mouton' && (norm.includes('mouton') || norm.includes('viper'))) keywords.push('mouton')
    if (t.id === 'elysium-planitia' && norm.includes('elysium')) keywords.push('elysium')
    if (t.id === 'olympus-mons' && (norm.includes('olympus') || norm.includes('olimpo'))) keywords.push('olympus', 'olimpo')
    if (t.id === 'valles-marineris' && norm.includes('marineris')) keywords.push('marineris')

    const matched = keywords.some((kw) => norm.includes(normalizeText(kw)))
    if (matched) {
      targetId = t.id
      targetName = t.name
      body = t.body
      break
    }
  }

  // 5. Detect Dimension or General Similarity
  if (
    norm.includes('en general') ||
    norm.includes('similitud general') ||
    norm.includes('general') ||
    norm.includes('overall') ||
    norm.includes('todos los campos')
  ) {
    isGeneral = true
  }

  // Dimension keywords mapping
  const dimKeywords: Record<string, string[]> = {
    terrain: ['pendiente', 'pendientes', 'inclinacion', 'slope', 'steepness', 'topografia'],
    relief: ['relieve', 'desnivel', 'elevacion local', 'local relief', 'relief'],
    roughness: ['rugosidad', 'aspereza', 'roughness', 'obstaculos'],
    temp: ['temperatura', 'clima', 'calor', 'frio', 'termico', 'temperature', 'thermal'],
    precip: ['precipitacion', 'aridez', 'lluvia', 'sequia', 'precipitation', 'rainfall'],
    pressure: ['presion', 'barometrica', 'atmosferica', 'pressure', 'barometric'],
    mineralogy: ['mineralogia', 'mineral', 'rocas', 'composicion', 'geologia', 'mineralogy', 'lithology'],
  }

  for (const [dimKey, kwList] of Object.entries(dimKeywords)) {
    if (kwList.some((kw) => norm.includes(kw))) {
      // Find matching dimension in meta
      const foundDim = dimensions.find((d) => d.id === dimKey || d.id.includes(dimKey))
      if (foundDim) {
        dimensionId = foundDim.id
        dimensionName = foundDim.label[lang]
        isGeneral = false
        break
      }
    }
  }

  // Check dimension labels directly
  if (!dimensionId) {
    for (const d of dimensions) {
      const labelNorm = normalizeText(d.label[lang])
      if (norm.includes(labelNorm)) {
        dimensionId = d.id
        dimensionName = d.label[lang]
        isGeneral = false
        break
      }
    }
  }

  // 6. Detect Terrestrial Site
  for (const s of sites) {
    const sNorm = normalizeText(s.name)
    const isMatch =
      norm.includes(sNorm) ||
      (s.id === 'uyuni' && norm.includes('uyuni')) ||
      (s.id === 'poopo' && norm.includes('poopo')) ||
      (s.id === 'coipasa' && norm.includes('coipasa')) ||
      (s.id === 'sol-de-manana' && (norm.includes('sol de manana') || norm.includes('geiseres'))) ||
      (s.id === 'laguna-colorada' && norm.includes('colorada')) ||
      (s.id === 'licancabur-laguna-verde' && (norm.includes('verde') || norm.includes('licancabur'))) ||
      (s.id === 'siloli' && (norm.includes('siloli') || norm.includes('arbol de piedra'))) ||
      (s.id === 'tunupa' && norm.includes('tunupa')) ||
      (s.id === 'umajalanta' && (norm.includes('umajalanta') || norm.includes('toro toro') || norm.includes('torotoro'))) ||
      (s.id === 'dali' && norm.includes('dali')) ||
      (s.id === 'sajama' && norm.includes('sajama')) ||
      (s.id === 'yungay-atacama' && norm.includes('atacama')) ||
      (s.id === 'mojave-death-valley' && (norm.includes('death valley') || norm.includes('valle de la muerte')))

    if (isMatch) {
      siteId = s.id
      siteName = s.name
      break
    }
  }

  // 7. World mode: when comparing against a target, always show BOTH maps side by side (world = 'auto')
  if (targetId || country) {
    world = 'auto'
  } else if (action === 'view_change' && body) {
    world = body
  }

  // Default action to 'search' if target, country, dimension, or site was found
  if (!action && (targetId || dimensionId || siteId || isGeneral || country)) {
    action = 'search'
  }

  // 8. Formulate clear explanation
  const placeContext = country ? `en ${country}` : 'terrestres'
  const placeContextEn = country ? `in ${country}` : 'terrestrial'
  let explanation = ''

  if (isEs) {
    if (action === 'adaptation') {
      explanation = siteName
        ? `Abriendo recomendaciones de adaptación técnica para ${siteName}.`
        : 'Abriendo recomendaciones de adaptación técnica para el análogo seleccionado.'
    } else if (action === 'explore3d') {
      explanation = 'Abriendo el explorador de terreno interactivo en 3D.'
    } else if (action === 'home') {
      explanation = 'Regresando a la pantalla principal de selección.'
    } else if (action === 'view_change' && view) {
      explanation = `Cambiando vista del mapa a modo ${view === '2d' ? '2D con relieve' : 'Globo 3D'}.`
    } else if (targetName && dimensionName) {
      explanation = `Buscando lugares ${placeContext} similares a ${targetName} (${body === 'moon' ? 'Luna' : 'Marte'}) según ${dimensionName}.`
    } else if (targetName && isGeneral) {
      explanation = `Buscando lugares ${placeContext} similares a ${targetName} (${body === 'moon' ? 'Luna' : 'Marte'}) por similitud general.`
    } else if (targetName) {
      explanation = `Mostrando los lugares ${placeContext} más similares a ${targetName} (${body === 'moon' ? 'Luna' : 'Marte'}).`
    } else if (country) {
      explanation = `Filtrando análogos terrestres en ${country}.`
    } else if (siteName) {
      explanation = `Seleccionando el análogo terrestre ${siteName}.`
    } else if (body) {
      explanation = `Cambiando al mapa de ${body === 'moon' ? 'la Luna' : 'Marte'}.`
    } else {
      explanation = `Comando interpretado: "${rawQuery}".`
    }
  } else {
    if (action === 'adaptation') {
      explanation = siteName
        ? `Opening technical adaptation guide for ${siteName}.`
        : 'Opening technical adaptation guide for the selected analog.'
    } else if (action === 'explore3d') {
      explanation = 'Opening the interactive 3D terrain explorer.'
    } else if (action === 'home') {
      explanation = 'Returning to the home selection screen.'
    } else if (action === 'view_change' && view) {
      explanation = `Switching map projection to ${view === '2d' ? '2D with terrain' : '3D Globe'}.`
    } else if (targetName && dimensionName) {
      explanation = `Searching ${placeContextEn} places similar to ${targetName} (${body === 'moon' ? 'Moon' : 'Mars'}) sorted by ${dimensionName}.`
    } else if (targetName && isGeneral) {
      explanation = `Searching ${placeContextEn} places similar to ${targetName} (${body === 'moon' ? 'Moon' : 'Mars'}) by general similarity.`
    } else if (targetName) {
      explanation = `Displaying ${placeContextEn} places most similar to ${targetName} (${body === 'moon' ? 'Moon' : 'Mars'}).`
    } else if (country) {
      explanation = `Filtering terrestrial analogs in ${country}.`
    } else if (siteName) {
      explanation = `Selecting terrestrial analog ${siteName}.`
    } else if (body) {
      explanation = `Switching to ${body === 'moon' ? 'Moon' : 'Mars'} map.`
    } else {
      explanation = `Parsed query: "${rawQuery}".`
    }
  }

  return {
    rawQuery,
    targetId,
    targetName,
    body,
    dimensionId,
    dimensionName,
    isGeneral,
    siteId,
    siteName,
    country,
    action,
    view,
    world,
    explanation,
  }
}
