// Comandos de voz: convierte una frase en una acción de la app. Los nombres salen de los datos y las
// palabras de control, de i18n (regla 11 y regla 2 de AGENTS.md). No hay ningún identificador fijo.

export type VoiceCommand =
  | { kind: 'target'; id: string; site: string | null }
  | { kind: 'site'; id: string }
  | { kind: 'body'; body: string }
  | { kind: 'home' }
  | { kind: 'search'; query: string }

export interface Named {
  id: string
  name: string
}

export interface VoiceVocabulary {
  sites: Named[]
  targets: Named[]
  /** Palabra de cada cuerpo en el idioma activo, p. ej. { mars: 'marte', moon: 'luna' }. */
  bodies: Record<string, string>
  /** Palabras que vuelven al inicio. */
  home: string[]
  /** Palabras de relleno que se quitan antes de buscar («buscar», «muéstrame»…). */
  filler: string[]
}

export function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

const words = (text: string) => fold(text).split(' ').filter(Boolean)
const hasPhrase = (haystack: string, phrase: string) => ` ${haystack} `.includes(` ${phrase} `)
const compactAcronyms = (text: string) => fold(text.replace(/(\p{L})\.\s*(?=\p{L})/gu, '$1'))
const US_NAMES = ['united states', 'estados unidos', 'ee uu', 'eeuu', 'u s a', 'usa']

/**
 * Busca `query` en los textos dados ignorando tildes, mayúsculas, puntuación y siglas con puntos
 * («EE. UU.» ↔ «eeuu», «usa»).
 */
export function matchesQuery(query: string, ...texts: (string | null | undefined)[]): boolean {
  const qPlain = fold(query)
  if (!qPlain) return true
  const raw = texts.filter(Boolean).join(' ')
  if (!raw) return false
  const plain = fold(raw)
  const qNorm = compactAcronyms(query)
  const norm = compactAcronyms(raw)
  const isUS = US_NAMES.some((name) => hasPhrase(plain, name) || hasPhrase(norm, name))
  if (qNorm === 'usa' || qNorm === 'us') {
    return isUS || norm.split(' ').some((w) => w.startsWith(qNorm))
  }
  if (plain.includes(qPlain) || norm.includes(qNorm)) return true
  if (isUS) {
    const tokens = qNorm.split(' ').filter(Boolean)
    return tokens.every((tok) => tok === 'usa' || tok === 'eeuu' || tok === 'us' || norm.includes(tok))
  }
  return false
}

/**
 * Palabras de un nombre que no aparecen en ningún otro nombre: «uyuni» señala un sitio; «salar», no.
 * Se ignoran las palabras cortas, las de relleno y las de los cuerpos («luna» en «Valle de la Luna»).
 */
function distinctive(items: Named[], ignore: Set<string>): Map<string, string> {
  const owners = new Map<string, Set<string>>()
  for (const item of items) {
    for (const w of new Set(words(item.name))) {
      if (w.length < 3 || ignore.has(w)) continue
      if (!owners.has(w)) owners.set(w, new Set())
      owners.get(w)!.add(item.id)
    }
  }
  const out = new Map<string, string>()
  for (const [w, ids] of owners) if (ids.size === 1) out.set(w, [...ids][0])
  return out
}

function find(text: string, items: Named[], tokens: Map<string, string>): string | null {
  // Primero el nombre completo, del más largo al más corto; luego una palabra propia del nombre.
  const full = [...items].sort((a, b) => b.name.length - a.name.length).find((i) => hasPhrase(text, fold(i.name)))
  if (full) return full.id
  for (const w of text.split(' ')) {
    const id = tokens.get(w)
    if (id) return id
  }
  return null
}

export function parseVoice(phrase: string, vocab: VoiceVocabulary): VoiceCommand {
  const text = fold(phrase)
  if (vocab.home.some((w) => hasPhrase(text, fold(w)))) return { kind: 'home' }

  const bodyWords = Object.values(vocab.bodies).map(fold)
  const ignore = new Set([...vocab.filler.map(fold), ...bodyWords])
  const all = [...vocab.sites, ...vocab.targets]
  const tokens = distinctive(all, ignore)
  const targetIds = new Set(vocab.targets.map((t) => t.id))
  const siteTokens = new Map([...tokens].filter(([, id]) => !targetIds.has(id)))
  const targetTokens = new Map([...tokens].filter(([, id]) => targetIds.has(id)))

  const target = find(text, vocab.targets, targetTokens)
  const site = find(text, vocab.sites, siteTokens)
  if (target) return { kind: 'target', id: target, site }
  if (site) return { kind: 'site', id: site }

  const body = Object.entries(vocab.bodies).find(([, w]) => hasPhrase(text, fold(w)))
  if (body) return { kind: 'body', body: body[0] }

  const query = text
    .split(' ')
    .filter((w) => !ignore.has(w))
    .join(' ')
  return { kind: 'search', query }
}
