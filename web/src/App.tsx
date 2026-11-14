import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { DemoBanner, Header } from './components/Header'
import { Legend, TargetBadge, ViewToggle } from './components/MapOverlays'
import { PurposePicker } from './components/PurposePicker'
import { RankingPanel } from './components/RankingPanel'
import { SiteDetail } from './components/SiteDetail'
import { ErrorScreen, LoadingScreen } from './components/StatusScreens'
import { loadData } from './data/load'
import type { LoadResult } from './data/load'
import { buildModel } from './data/model'
import { I18nContext, translate } from './i18n'
import type { I18n, Lang } from './i18n'
import { formatDate, score100 } from './lib/format'
import { rankSites, scoreMode } from './lib/ranking'
import type { RankedSite } from './lib/ranking'
import { isNavigation, parseSearch, reducer, toSearch } from './lib/state'
import type { View } from './lib/state'
import { MapView } from './map/MapView'

const REPO_URL = 'https://github.com/VMKayser/Hackaton_NasaSpace_2026'

export default function App() {
  const [state, dispatch] = useReducer(reducer, window.location.search, parseSearch)
  const [result, setResult] = useState<LoadResult | null>(null)
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let alive = true
    loadData(import.meta.env.BASE_URL).then((r) => alive && setResult(r))
    return () => {
      alive = false
    }
  }, [])

  const i18n = useMemo<I18n>(() => ({ lang: state.lang, t: (key, vars) => translate(state.lang, key, vars) }), [state.lang])
  const { t, lang } = i18n

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Estado en la URL, con historial para el botón atrás.
  const prevState = useRef(state)
  useEffect(() => {
    const qs = toSearch(state)
    if (qs !== window.location.search) {
      const url = `${window.location.pathname}${qs}${window.location.hash}`
      if (isNavigation(prevState.current, state)) window.history.pushState(null, '', url)
      else window.history.replaceState(null, '', url)
    }
    prevState.current = state
  }, [state])
  useEffect(() => {
    const onPop = () => dispatch({ type: 'hydrate', state: parseSearch(window.location.search) })
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const model = useMemo(() => (result?.ok ? buildModel(result.analogs, result.texts) : null), [result])

  // Lo que pide la URL, comprobado contra los datos. El propósito decide el objetivo.
  const purpose = (model && state.purpose && model.purposeById.get(state.purpose)) || null
  const targetId = purpose?.targetId ?? state.target
  const target = (model && targetId && model.targetById.get(targetId)) || null

  const rows = useMemo<RankedSite[]>(() => {
    if (!model) return []
    if (!target) {
      return model.file.sites.map((site) => ({ site, score: null, dimensions: {}, rank: null, top: [], low: null }))
    }
    return rankSites(model.file, target.id, purpose)
  }, [model, target, purpose])
  const mode = model ? scoreMode(model.file, purpose) : 'similarity'
  const selected = (target && rows.find((r) => r.site.id === state.site)) || null
  const evaluatedCount = rows.filter((r) => r.score !== null).length

  const selectSite = useCallback((id: string | null) => dispatch({ type: 'selectSite', site: id }), [])
  const onMapSelect = useCallback(
    (id: string) => {
      if (target) selectSite(id)
    },
    [target, selectSite],
  )
  const scoreLabel = useCallback(
    (row: RankedSite) => {
      if (!target) return row.site.type?.[lang] ?? ''
      return row.score !== null ? `${score100(row.score)} / 100` : t('badge.notEvaluated')
    },
    [target, lang, t],
  )

  // Escape cierra la ficha.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.site) selectSite(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state.site, selectSite])

  // Cada pantalla nueva del panel empieza arriba.
  const screenKey = `${purpose?.id ?? ''}|${target?.id ?? ''}|${selected?.site.id ?? ''}`
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 })
  }, [screenKey])

  const setLang = (l: Lang) => dispatch({ type: 'setLang', lang: l })
  const setView = (v: View) => dispatch({ type: 'setView', view: v })

  let panel: React.ReactNode = null
  if (model) {
    if (!target) {
      panel = (
        <PurposePicker
          model={model}
          onPurpose={(p) => dispatch({ type: 'choosePurpose', purpose: p.id, target: p.targetId })}
          onTarget={(tg) => dispatch({ type: 'chooseTarget', target: tg.id })}
        />
      )
    } else if (selected) {
      panel = (
        <SiteDetail
          model={model}
          row={selected}
          total={evaluatedCount}
          target={target}
          purpose={purpose}
          mode={mode}
          onBack={() => selectSite(null)}
        />
      )
    } else {
      panel = (
        <RankingPanel
          model={model}
          purpose={purpose}
          target={target}
          rows={rows}
          mode={mode}
          selectedId={state.site}
          onSelect={selectSite}
          onBack={() => dispatch({ type: 'home' })}
        />
      )
    }
  }

  return (
    <I18nContext.Provider value={i18n}>
      <div className="flex h-dvh flex-col">
        <Header onHome={() => dispatch({ type: 'home' })} onLang={setLang} />
        {model?.file.meta.mock && <DemoBanner />}

        {!result ? (
          <LoadingScreen />
        ) : !result.ok ? (
          <ErrorScreen file={result.file} problems={result.problems} />
        ) : (
          <main className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(380px,460px)_1fr]">
            <section className="relative h-[42vh] shrink-0 overflow-hidden bg-space lg:order-2 lg:h-auto">
              <MapView
                rows={rows}
                neutral={!target}
                selectedId={selected?.site.id ?? null}
                view={state.view}
                frameKey={`${purpose?.id ?? ''}|${target?.id ?? ''}`}
                label={t('map.label')}
                noWebglText={t('map.noWebgl')}
                scoreLabel={scoreLabel}
                onSelect={onMapSelect}
              />
              <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-3">
                <div className="pointer-events-auto">{target && <TargetBadge target={target} />}</div>
                <div className="pointer-events-auto">
                  <ViewToggle view={state.view} onView={setView} />
                </div>
              </div>
              {target && (
                <div className="absolute bottom-3 left-3">
                  <Legend />
                </div>
              )}
            </section>

            <aside ref={panelRef} className="min-h-0 flex-1 overflow-y-auto bg-surface lg:order-1 lg:border-r lg:border-line">
              {panel}
              {model && (
                <footer className="border-t border-line px-5 py-4 text-[11px] text-faint sm:px-7">
                  <p>
                    {t('footer.event')} ·{' '}
                    <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
                      {t('footer.code')}
                    </a>
                  </p>
                  <p className="mt-0.5 font-mono">
                    {t('footer.data', {
                      version: model.file.meta.version,
                      date: formatDate(model.file.meta.generated, lang),
                    })}
                  </p>
                </footer>
              )}
            </aside>
          </main>
        )}
      </div>
    </I18nContext.Provider>
  )
}
