import type { Model } from '../data/model'
import { isLang } from '../i18n'
import type { Lang } from '../i18n'

export type View = 'globe' | '2d'
export type World = 'auto' | 'earth' | 'mars' | 'moon'
export const MAX_COMPARE = 3

export interface AppState {
  purpose: string | null
  target: string | null
  site: string | null
  compare: string[] | null
  view: View
  world: World
  lang: Lang
  step: number | null
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
  }
}

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
  const qs = p.toString()
  return qs ? `?${qs}` : ''
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'choosePurpose':
      return { ...state, purpose: action.purpose, target: action.target, site: null, compare: null, step: null, world: 'auto' }
    case 'chooseTarget':
      return { ...state, purpose: null, target: action.target, site: null, compare: null, step: null, world: 'auto' }
    case 'selectPlanetTarget':
      if (state.target === action.target) return state
      return { ...state, purpose: null, target: action.target, step: null }
    case 'selectSite':
      return { ...state, site: action.site, compare: null, step: null }
    case 'setCompare':
      return { ...state, compare: action.sites === null ? null : uniqueSites(action.sites), step: null }
    case 'setStep':
      return { ...state, step: action.step }
    case 'setView':
      return { ...state, view: action.view, step: null }
    case 'setWorld':
      return { ...state, world: action.world, step: null }
    case 'setLang':
      return { ...state, lang: action.lang }
    case 'home':
      return { ...state, purpose: null, target: null, site: null, compare: null, step: null, world: 'auto' }
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
  }
}

/** Cambios que merecen una entrada nueva en el historial (botón atrás del navegador). */
export function isNavigation(prev: AppState, next: AppState): boolean {
  return prev.purpose !== next.purpose || prev.target !== next.target || prev.site !== next.site ||
    prev.step !== next.step || (prev.compare === null) !== (next.compare === null)
}
