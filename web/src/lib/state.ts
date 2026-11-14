import { isLang } from '../i18n'
import type { Lang } from '../i18n'

// Estado de la app, reflejado en la URL: ?purpose=&target=&site=&compare=&view=&lang=&step=

export type View = 'globe' | '2d'

export interface AppState {
  purpose: string | null
  target: string | null
  site: string | null
  compare: string[]
  view: View
  lang: Lang
  step: number | null
}

export type Action =
  | { type: 'choosePurpose'; purpose: string; target: string }
  | { type: 'chooseTarget'; target: string }
  | { type: 'selectSite'; site: string | null }
  | { type: 'setView'; view: View }
  | { type: 'setLang'; lang: Lang }
  | { type: 'home' }
  | { type: 'hydrate'; state: AppState }

export function parseSearch(search: string): AppState {
  const p = new URLSearchParams(search)
  const lang = p.get('lang')
  const step = Number(p.get('step'))
  return {
    purpose: p.get('purpose') || null,
    target: p.get('target') || null,
    site: p.get('site') || null,
    compare: (p.get('compare') ?? '').split(',').filter(Boolean),
    view: p.get('view') === '2d' ? '2d' : 'globe',
    lang: isLang(lang) ? lang : 'en',
    step: p.has('step') && Number.isInteger(step) && step >= 0 ? step : null,
  }
}

export function toSearch(s: AppState): string {
  const p = new URLSearchParams()
  if (s.purpose) p.set('purpose', s.purpose)
  if (s.target) p.set('target', s.target)
  if (s.site) p.set('site', s.site)
  if (s.compare.length) p.set('compare', s.compare.join(','))
  if (s.view !== 'globe') p.set('view', s.view)
  if (s.lang !== 'en') p.set('lang', s.lang)
  if (s.step !== null) p.set('step', String(s.step))
  const qs = p.toString()
  return qs ? `?${qs}` : ''
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'choosePurpose':
      return { ...state, purpose: action.purpose, target: action.target, site: null, compare: [], step: null }
    case 'chooseTarget':
      return { ...state, purpose: null, target: action.target, site: null, compare: [], step: null }
    case 'selectSite':
      return { ...state, site: action.site }
    case 'setView':
      return { ...state, view: action.view }
    case 'setLang':
      return { ...state, lang: action.lang }
    case 'home':
      return { ...state, purpose: null, target: null, site: null, compare: [], step: null }
    case 'hydrate':
      return action.state
  }
}

/** Cambios que merecen una entrada nueva en el historial (botón atrás del navegador). */
export function isNavigation(prev: AppState, next: AppState): boolean {
  return prev.purpose !== next.purpose || prev.target !== next.target || prev.site !== next.site
}
