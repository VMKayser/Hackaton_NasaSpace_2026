import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DemoBanner, Header } from './components/Header'
import { ComparisonPanel } from './components/ComparisonPanel'
import { MapWorkspace } from './components/MapWorkspace'
import { PurposePicker } from './components/PurposePicker'
import { RankingPanel } from './components/RankingPanel'
import { SiteDetail } from './components/SiteDetail'
import { StoryControls } from './components/StoryControls'
import { ErrorScreen, LoadingScreen } from './components/StatusScreens'
import { loadData } from './data/load'
import type { LoadResult } from './data/load'
import { buildModel } from './data/model'
import { I18nContext, translate } from './i18n'
import type { I18n, Lang } from './i18n'
import { formatDate, score100 } from './lib/format'
import { rankSites, scoreMode } from './lib/ranking'
import type { RankedSite } from './lib/ranking'
import { isNavigation, MAX_COMPARE, parseSearch, reducer, resolveStory, toSearch } from './lib/state'
import type { Action } from './lib/state'

const Explore3D = lazy(() => import('./components/Explore3D').then(({ Explore3D }) => ({ default: Explore3D })))

const REPO_URL = 'https://github.com/VMKayser/Hackaton_NasaSpace_2026'

export default function App() {
  const [requested, update] = useState(() => parseSearch(window.location.search))
  const [result, setResult] = useState<LoadResult | null>(null)
  const panelRef = useRef<HTMLElement>(null)
  const [exploring, setExploring] = useState(false)

  useEffect(() => {
    let alive = true
    loadData(import.meta.env.BASE_URL).then((r) => alive && setResult(r))
    return () => {
      alive = false
    }
  }, [])

  const model = useMemo(() => (result?.ok ? buildModel(result.analogs, result.texts) : null), [result])
  const state = useMemo(() => resolveStory(requested, model), [requested, model])
  const dispatch = useCallback((action: Action) => {
    update((previous) => {
      const current = resolveStory(previous, model)
      if (action.type === 'selectPlanetTarget' && current.purpose &&
          model?.purposeById.get(current.purpose)?.targetId === action.target) return previous
      return reducer(current, action)
    })
  }, [model])

  const i18n = useMemo<I18n>(() => ({ lang: state.lang, t: (key, vars) => translate(state.lang, key, vars) }), [state.lang])
  const { t, lang } = i18n
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Estado en la URL, con historial para el botón atrás.
  const prevState = useRef(state)
  const fromHistory = useRef(false)
  useEffect(() => {
    const qs = toSearch(state)
    if (qs !== window.location.search) {
      const url = `${window.location.pathname}${qs}${window.location.hash}`
      if (!fromHistory.current && isNavigation(prevState.current, requested)) window.history.pushState(null, '', url)
      else window.history.replaceState(null, '', url)
    }
    prevState.current = requested
    fromHistory.current = false
  }, [state, requested])
  useEffect(() => {
    const onPop = () => {
      fromHistory.current = true
      update(parseSearch(window.location.search))
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

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
  const compareIds = target && state.compare ? state.compare.filter((id) => model?.siteById.has(id)) : null
  const selected = (!compareIds && target && rows.find((r) => r.site.id === state.site)) || null
  const story = model?.texts.story ?? []
  const step = state.step === null ? null : story[state.step]
  const evaluatedCount = rows.filter((r) => r.score !== null).length

  const selectSite = useCallback((id: string | null) => dispatch({ type: 'selectSite', site: id }), [dispatch])
  const selectPlanetTarget = useCallback((id: string) => dispatch({ type: 'selectPlanetTarget', target: id }), [dispatch])
  const onMapSelect = useCallback(
    (id: string) => {
      if (!target) return
      if (compareIds) {
        if (compareIds.includes(id)) dispatch({ type: 'setCompare', sites: compareIds.filter((site) => site !== id) })
        else if (compareIds.length < MAX_COMPARE) dispatch({ type: 'setCompare', sites: [...compareIds, id] })
      } else {
        selectSite(id)
      }
    },
    [target, compareIds, dispatch, selectSite],
  )
  const scoreLabel = useCallback(
    (row: RankedSite) => {
      if (!target) return row.site.type?.[lang] ?? ''
      return row.score !== null ? `${score100(row.score)} / 100` : t('badge.notEvaluated')
    },
    [target, lang, t],
  )

  // Escape cierra la vista activa.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (state.step !== null) dispatch({ type: 'setStep', step: null })
      else if (compareIds) dispatch({ type: 'setCompare', sites: null })
      else if (state.site) selectSite(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state.site, state.step, compareIds, dispatch, selectSite])

  // Cada pantalla nueva del panel empieza arriba.
  const screenKey = `${purpose?.id ?? ''}|${target?.id ?? ''}|${selected?.site.id ?? ''}|${compareIds !== null}|${state.step ?? ''}`
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 })
  }, [screenKey])

  const setLang = (l: Lang) => dispatch({ type: 'setLang', lang: l })
  const setStep = (step: number | null) => dispatch({ type: 'setStep', step })
  const openComparison = (sites: string[]) => {
    dispatch({ type: 'setCompare', sites })
    if (state.world !== 'earth') dispatch({ type: 'setWorld', world: 'auto' })
  }

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
    } else if (compareIds !== null) {
      panel = (
        <ComparisonPanel
          model={model}
          target={target}
          rows={rows}
          ids={compareIds}
          mode={mode}
          onChange={(sites) => dispatch({ type: 'setCompare', sites })}
          onBack={() => dispatch({ type: 'selectSite', site: null })}
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
          onCompare={() => openComparison([selected.site.id])}
          onExplore={Math.abs(target.lat) <= 80 ? () => setExploring(true) : null}
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
          onCompare={() => openComparison([])}
        />
      )
    }
  }

  return (
    <I18nContext.Provider value={i18n}>
      <div className="flex h-dvh flex-col">
        <Header onHome={() => dispatch({ type: 'home' })} onLang={setLang} onStory={story.length && !step ? () => setStep(0) : undefined} />
        {model?.file.meta.mock && <DemoBanner />}

        {!result ? (
          <LoadingScreen />
        ) : !result.ok ? (
          <ErrorScreen file={result.file} problems={result.problems} />
        ) : (
          <main className={`flex min-h-0 flex-1 flex-col lg:grid ${compareIds !== null
            ? 'lg:grid-cols-[minmax(430px,42%)_minmax(0,1fr)]'
            : 'lg:grid-cols-[minmax(380px,460px)_minmax(0,1fr)]'}`}>
            <MapWorkspace
              rows={rows}
              targets={model?.file.targets ?? []}
              target={target}
              selectedId={selected?.site.id ?? null}
              compareIds={compareIds}
              view={state.view}
              world={state.world}
              frameKey={`${purpose?.id ?? ''}|${target?.id ?? ''}|${state.step ?? ''}`}
              onWorld={(world) => dispatch({ type: 'setWorld', world })}
              onView={(view) => dispatch({ type: 'setView', view })}
              scoreLabel={scoreLabel}
              onSelect={onMapSelect}
              onTarget={selectPlanetTarget}
            />

            <aside ref={panelRef} className="min-h-0 flex-1 overflow-y-auto bg-surface lg:order-1 lg:border-r lg:border-line">
              {step && state.step !== null && (
                <StoryControls step={state.step} total={story.length} caption={step.caption} onStep={setStep} />
              )}
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
      {exploring && model && selected && target && (
        <Suspense fallback={<div className="fixed inset-0 z-50 grid place-items-center bg-space text-sm text-white/85">{t('explore.loading')}</div>}>
          <Explore3D model={model} row={selected} target={target} purpose={purpose} onClose={() => setExploring(false)} />
        </Suspense>
      )}
    </I18nContext.Provider>
  )
}
