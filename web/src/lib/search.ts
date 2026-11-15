import type { Model } from '../data/model'
import { pickText, purposeLabel, purposeQuestion, siteText, targetSummary } from '../data/model'
import type { Purpose, Site, Target, Value } from '../data/schema'
import type { Lang } from '../i18n'
import { fold, matchesQuery } from './voice'

// Búsqueda por características: el texto se busca en el nombre, el lugar, el tipo, la geología (códigos y
// sus etiquetas en los dos idiomas) y los textos de la ficha. Con varias palabras, cada una debe aparecer
// en algún campo («salar hielo», «volcán Potosí»). Todo sale de los archivos de datos (regla 11).

export type SearchField =
  | 'name'
  | 'place'
  | 'type'
  | 'geology'
  | 'purpose'
  | 'summary'
  | 'description'
  | 'exploration'
  | 'limits'
  | 'context'

/** Peso de cada campo para ordenar: el nombre pesa más que una palabra perdida en una descripción. */
const FIELD_WEIGHT: Record<SearchField, number> = {
  name: 10,
  type: 6,
  geology: 6,
  place: 5,
  purpose: 4,
  summary: 3,
  description: 2,
  exploration: 2,
  context: 2,
  limits: 1,
}

/** Campos que ya se ven en una fila de resultados: no hace falta citar el texto que coincide. */
const VISIBLE: ReadonlySet<SearchField> = new Set(['name', 'place', 'type'])

/** Palabras vacías de los dos idiomas: no restringen la búsqueda. Detalle técnico, no texto de interfaz. */
const STOPWORDS = new Set(
  'de del la las el los lo y e o u en con sin por para un una unos unas al que se su sus the of and or in on at to for with an a is are from by'.split(' '),
)

export interface FieldTexts {
  field: SearchField
  texts: (string | null | undefined)[]
}

export interface SnippetPart {
  text: string
  hit: boolean
}

export interface SearchHit {
  /** Relevancia: suma, por palabra buscada, del peso del mejor campo donde aparece. */
  score: number
  /** Campo de la cita; null si la coincidencia ya se ve en la fila (nombre, lugar, tipo). */
  field: SearchField | null
  snippet: SnippetPart[] | null
}

/** Palabras de la búsqueda, sin tildes ni palabras vacías. */
export function queryTokens(query: string): string[] {
  const tokens = fold(query).split(' ').filter(Boolean)
  const kept = tokens.filter((tok) => !STOPWORDS.has(tok))
  return kept.length ? kept : tokens
}

/** Variantes de una palabra: «salares» también busca «salar»; «volcanes», «volcan». */
function variants(token: string): string[] {
  const out = [token]
  if (token.length > 4 && token.endsWith('es')) out.push(token.slice(0, -2))
  if (token.length > 3 && token.endsWith('s')) out.push(token.slice(0, -1))
  return out
}

const tokenIn = (token: string, texts: (string | null | undefined)[]) => variants(token).some((v) => matchesQuery(v, ...texts))

/** Cita corta del texto alrededor de la primera palabra que coincide, con las coincidencias marcadas. */
export function snippet(text: string, tokens: string[], before = 6, after = 10): SnippetPart[] | null {
  const words = text.split(/\s+/).filter(Boolean)
  const hits = words.map((w) => {
    const f = fold(w)
    return f.length > 0 && tokens.some((tok) => variants(tok).some((v) => f.includes(v)))
  })
  const first = hits.indexOf(true)
  if (first < 0) return null
  const from = Math.max(0, first - before)
  const to = Math.min(words.length, first + after + 1)
  const parts: SnippetPart[] = []
  if (from > 0) parts.push({ text: '… ', hit: false })
  for (let i = from; i < to; i++) {
    const sep = i < to - 1 ? ' ' : ''
    const last = parts[parts.length - 1]
    if (!hits[i] && last && !last.hit) last.text += words[i] + sep
    else {
      parts.push({ text: words[i], hit: hits[i] })
      if (sep) parts.push({ text: sep, hit: false })
    }
  }
  if (to < words.length) parts.push({ text: ' …', hit: false })
  return parts
}

/**
 * Busca `query` en los campos. Devuelve null si alguna palabra no aparece en ningún campo.
 * La consulta entera también vale (siglas con puntos, «EE. UU.»), como en `matchesQuery`.
 */
export function searchFields(query: string, fields: FieldTexts[]): SearchHit | null {
  const tokens = queryTokens(query)
  if (!tokens.length) return { score: 0, field: null, snippet: null }
  const whole = matchesQuery(query, ...fields.flatMap((f) => f.texts))
  let score = 0
  let quote: FieldTexts | null = null
  for (const tok of tokens) {
    const found = fields.filter((f) => tokenIn(tok, f.texts))
    if (!found.length) {
      if (whole) continue
      return null
    }
    const best = found.reduce((a, b) => (FIELD_WEIGHT[b.field] > FIELD_WEIGHT[a.field] ? b : a))
    score += FIELD_WEIGHT[best.field]
    // Se cita el texto solo si la palabra no se ve ya en la fila (nombre, lugar, tipo).
    if (!found.some((f) => VISIBLE.has(f.field)) && (!quote || FIELD_WEIGHT[best.field] > FIELD_WEIGHT[quote.field])) quote = best
  }
  if (score === 0) score = FIELD_WEIGHT.name
  if (!quote) return { score, field: null, snippet: null }
  const text = quote.texts.find((tx) => tx && tokens.some((tok) => tokenIn(tok, [tx])))
  return { score, field: quote.field, snippet: text ? snippet(text, tokens) : null }
}

/** Etiquetas de las categorías (geología, litología…) de unos valores, en los dos idiomas, y sus códigos. */
function categoryTexts(model: Model, values: Record<string, Value>): string[] {
  const out: string[] = []
  for (const dim of model.dimensions) {
    const code = values[dim.id]?.value
    if (typeof code !== 'string' || !code) continue
    const label = dim.categories?.[code]
    out.push(...(label ? [label.es, label.en] : []), code)
  }
  return out
}

export function siteFields(model: Model, site: Site, lang: Lang): FieldTexts[] {
  const p = site.place
  return [
    { field: 'name', texts: [site.name] },
    { field: 'place', texts: p ? Object.values(p) : [] },
    { field: 'type', texts: [site.type?.es, site.type?.en] },
    { field: 'geology', texts: categoryTexts(model, site.values) },
    { field: 'description', texts: [siteText(model, site, 'description', lang)] },
    { field: 'exploration', texts: [siteText(model, site, 'exploration', lang)] },
    { field: 'limits', texts: [siteText(model, site, 'limits', lang)] },
  ]
}

export function targetFields(model: Model, target: Target, lang: Lang, bodyName: string): FieldTexts[] {
  const purposes = model.purposes.filter((p) => p.targetId === target.id)
  return [
    { field: 'name', texts: [target.name] },
    { field: 'place', texts: [bodyName] },
    { field: 'geology', texts: categoryTexts(model, target.values) },
    { field: 'purpose', texts: purposes.flatMap((p) => [purposeLabel(model, p, lang), purposeQuestion(model, p, lang)]) },
    { field: 'summary', texts: [targetSummary(model, target, lang)] },
    { field: 'context', texts: (target.context ?? []).flatMap((c) => [pickText(lang, c.label), pickText(lang, c.note)]) },
  ]
}

export function purposeFields(model: Model, purpose: Purpose, lang: Lang, bodyName: string | null): FieldTexts[] {
  const target = model.targetById.get(purpose.targetId)
  return [
    { field: 'name', texts: [purposeLabel(model, purpose, lang)] },
    { field: 'summary', texts: [purposeQuestion(model, purpose, lang)] },
    { field: 'place', texts: [target?.name, bodyName] },
    { field: 'geology', texts: target ? categoryTexts(model, target.values) : [] },
  ]
}
