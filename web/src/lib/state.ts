import type { Model } from '../data/model'
import { isLang } from '../i18n'
import type { Lang } from '../i18n'

export type View = 'globe' | '2d'
export type World = 'auto' | 'earth' | 'mars' | 'moon'
export const MAX_COMPARE = 3
/** Punto libre elegido en un mapa (pin libre). */
export interface Point {
  lon: number
  lat: number
}
export type PlanetBody = 'mars' | 'moon'
/** Pin libre en otro cuerpo: lleva su cuerpo, que puede no ser el del objetivo elegido. */
export interface PlanetPoint extends Point {
  body: PlanetBody
}

export interface AppState {
  purpose: string | null
  target: string | null
  site: string | null
  compare: string[] | null
  view: View
  world: World
  lang: Lang
  step: number | null
  /** Pin libre en la Tierra. */
  pin: Point | null
  /** Pin libre en Marte o la Luna; sin él se mide el centro del objetivo. */
  tpin: PlanetPoint | null
}

export type Action =
  | { type: 'choosePurpose'; purpose: string; target: string }
  | { type: 'chooseTarget'; target: string }
  | { type: 'selectPlanetTarget'; target: string }
  | { type: 'selectSite'; site: string | null }
  | { type: 'setCompare'; sites: string[] | null }
  | { type: 'setStep'; step: number | null }
  | { type: 'setView'; view: View }
  | { type: 'setWorld'; world: World }
  | { type: 'setLang'; lang: Lang }
  | { type: 'setPin'; pin: Point | null }
  | { type: 'setTargetPin'; pin: PlanetPoint | null }
  | { type: 'home' }

export function parseSearch(search: string): AppState {
  const p = new URLSearchParams(search)
  const lang = p.get('lang')
  const step = p.get('step')
  const compare = p.get('compare')
  const world = p.get('world')
  return {
    purpose: p.get('purpose') || null,
    target: p.get('target') || null,
    site: p.get('site') || null,
    compare: compare === null ? null : uniqueSites(compare.split(',').filter(Boolean)),
    view: p.get('view') === '2d' ? '2d' : 'globe',
    world: world === 'earth' || world === 'mars' || world === 'moon' ? world : 'auto',
    lang: isLang(lang) ? lang : 'en',
    step: step && /^\d+$/.test(step) && Number.isSafeInteger(Number(step)) ? Number(step) : null,
    pin: parsePoint(p.get('pin')),
    tpin: parsePlanetPoint(p.get('tpin')),
  }
}

/** «lat,lon» en grados decimales; null si falta o está fuera de rango. */
function parsePoint(value: string | null): Point | null {
  if (!value) return null
  const parts = value.split(',')
  if (parts.length !== 2) return null
  const [lat, lon] = parts.map(Number)
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 85 || Math.abs(lon) > 180) return null
  return { lon, lat }
}

/** «cuerpo:lat,lon», por ejemplo «mars:18.44,77.45». */
function parsePlanetPoint(value: string | null): PlanetPoint | null {
  const match = value?.match(/^(mars|moon):(.+)$/)
  const point = match ? parsePoint(match[2]) : null
  return match && point ? { ...point, body: match[1] as PlanetBody } : null
}

const formatPoint = (p: Point) => `${p.lat.toFixed(5)},${p.lon.toFixed(5)}`

export function toSearch(s: AppState): string {
  const p = new URLSearchParams()
  if (s.purpose) p.set('purpose', s.purpose)
  if (s.target) p.set('target', s.target)
  if (s.site) p.set('site', s.site)
  if (s.compare) p.set('compare', s.compare.join(','))
  if (s.view !== 'globe') p.set('view', s.view)
  if (s.world !== 'auto') p.set('world', s.world)
  if (s.lang !== 'en') p.set('lang', s.lang)
  if (s.step !== null) p.set('step', String(s.step))
  if (s.pin) p.set('pin', formatPoint(s.pin))
  if (s.tpin) p.set('tpin', `${s.tpin.body}:${formatPoint(s.tpin)}`)
  const qs = p.toString()
  return qs ? `?${qs}` : ''
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'choosePurpose':
      return { ...state, purpose: action.purpose, target: action.target, site: null, compare: null, step: null, world: 'auto', pin: null, tpin: null }
    case 'chooseTarget':
      return { ...state, purpose: null, target: action.target, site: null, compare: null, step: null, world: 'auto', pin: null, tpin: null }
    case 'selectPlanetTarget':
      if (state.target === action.target) return state
      return { ...state, purpose: null, target: action.target, step: null }
    case 'selectSite':
      return { ...state, site: action.site, compare: null, step: null, pin: null, tpin: null }
    case 'setCompare':
      return { ...state, compare: action.sites === null ? null : uniqueSites(action.sites), step: null, pin: null, tpin: null }
    case 'setPin':
      return { ...state, pin: action.pin, site: null, compare: null, step: null, ...(action.pin ? {} : { tpin: null }) }
    case 'setTargetPin':
      return { ...state, tpin: action.pin, site: null, compare: null, step: null }
    case 'setStep':
      return { ...state, step: action.step, pin: action.step === null ? state.pin : null, tpin: action.step === null ? state.tpin : null }
    case 'setView':
      return { ...state, view: action.view, step: null }
    case 'setWorld':
      return { ...state, world: action.world, step: null }
    case 'setLang':
      return { ...state, lang: action.lang }
    case 'home':
      return { ...state, purpose: null, target: null, site: null, compare: null, step: null, world: 'auto', pin: null, tpin: null }
  }
}

function uniqueSites(sites: string[]): string[] {
  return [...new Set(sites)].slice(0, MAX_COMPARE)
}

export function resolveStory(state: AppState, model: Model | null): AppState {
  if (!model || state.step === null) return state
  const entry = model.texts.story?.[state.step]
  if (!entry) return { ...state, step: null }
  const purpose = entry.purposeId ? model.purposeById.get(entry.purposeId) : undefined
  const target = purpose?.targetId ?? (entry.targetId && model.targetById.has(entry.targetId) ? entry.targetId : null)
  return {
    ...state,
    purpose: purpose?.id ?? null,
    target,
    site: target && entry.siteId && model.siteById.has(entry.siteId) ? entry.siteId : null,
    compare: target && entry.compare ? uniqueSites(entry.compare.filter((id) => model.siteById.has(id))) : null,
    view: entry.view ?? 'globe',
    world: 'auto',
    pin: null,
    tpin: null,
  }
}

/** Cambios que merecen una entrada nueva en el historial (botón atrás del navegador). */
export function isNavigation(prev: AppState, next: AppState): boolean {
  return prev.purpose !== next.purpose || prev.target !== next.target || prev.site !== next.site ||
    prev.step !== next.step || (prev.compare === null) !== (next.compare === null) ||
    (prev.pin === null && prev.tpin === null) !== (next.pin === null && next.tpin === null)
}
