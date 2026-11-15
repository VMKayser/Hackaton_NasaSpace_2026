import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { EXPLORE_MAX_LAT } from './map/planetaryImagery'
import { DemoBanner, Header } from './components/Header'
import { ComparisonPanel } from './components/ComparisonPanel'
import { MapWorkspace } from './components/MapWorkspace'
import { PinPanel } from './components/PinPanel'
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
import { formatCoords, formatDate, formatPercent } from './lib/format'
import { rankSites, scoreMode } from './lib/ranking'
import type { RankedSite } from './lib/ranking'
import { isNavigation, MAX_COMPARE, parseSearch, reducer, resolveStory, toSearch } from './lib/state'
import type { Action, PlanetPoint, Point } from './lib/state'
import type { Site, Target } from './data/schema'

const Explore3D = lazy(() => import('./components/Explore3D').then(({ Explore3D }) => ({ default: Explore3D })))

const REPO_URL = 'https://github.com/VMKayser/Hackaton_NasaSpace_2026'

export default function App() {
  const [requested, update] = useState(() => parseSearch(window.location.search))
  const [result, setResult] = useState<LoadResult | null>(null)
  const panelRef = useRef<HTMLElement>(null)
  const mobileMapButton = useRef<HTMLButtonElement>(null)
  const rankingScroll = useRef<{ key: string; top: number } | null>(null)
  const [exploring, setExploring] = useState(false)
  const [mobileMap, setMobileMap] = useState(false)
  const [mapFocus, setMapFocus] = useState(0)
  // Pin libre: modo de colocación en los mapas y radio del círculo medido.
  const [pinMode, setPinMode] = useState(false)
  const [pinRadius, setPinRadius] = useState(5)
  const closeExplore = useCallback(() => setExploring(false), [])

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
      setExploring(false)
      setMobileMap(false)
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
      return model.file.sites.map((site) => ({ site, score: null, similarity: null, dimensions: {}, rank: null, top: [], low: null }))
    }
    return rankSites(model.file, target.id, purpose)
  }, [model, target, purpose])
  const mode = model ? scoreMode(model.file, purpose) : 'similarity'
  const compareIds = target && state.compare ? state.compare.filter((id) => model?.siteById.has(id)) : null
  const pinActive = !!target && compareIds === null && state.step === null && (state.pin !== null || state.tpin !== null)
  const selected = (!compareIds && !pinActive && target && rows.find((r) => r.site.id === state.site)) || null
  // Pin libre en 3D: el pin de la Tierra hace de sitio y el del otro cuerpo (o el centro del objetivo)
  // de objetivo. Son puntos sin puntaje; la vista 3D solo mide su relieve.
  const pinExplore = useMemo(() => {
    if (!pinActive || !state.pin || !target) return null
    const name = (p: Point) => translate(lang, 'pin.name', { coords: formatCoords(p.lat, p.lon, lang) })
    const site: Site = {
      id: 'free-pin', name: name(state.pin), lat: state.pin.lat, lon: state.pin.lon,
      known: false, reference: false, control: false, radiusKm: pinRadius, values: {}, scores: [],
    }
    const row: RankedSite = { site, score: null, similarity: null, dimensions: {}, rank: null, top: [], low: null }
    const tpin = state.tpin
    const planet: Target = tpin
      ? { id: `free-pin-${tpin.body}`, name: name(tpin), body: tpin.body, lat: tpin.lat, lon: tpin.lon, values: {} }
      : target
    return { row, target: planet }
  }, [pinActive, state.pin, state.tpin, target, pinRadius, lang])
  const canExplore = !!target && (pinExplore ? true : !!selected && Math.abs(target.lat) <= EXPLORE_MAX_LAT)
  const openExplore = canExplore ? () => setExploring(true) : null
  const showExplore = !!(exploring && model && target && (pinExplore || selected))
  const story = model?.texts.story ?? []
  const step = state.step === null ? null : story[state.step]
  const evaluatedCount = rows.filter((r) => r.score !== null).length
  const rankingKey = JSON.stringify([purpose?.id, target?.id])
  const showRanking = !!target && !selected && !pinActive && compareIds === null && state.step === null

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
        setMobileMap(false)
      }
    },
    [target, compareIds, dispatch, selectSite],
  )
  const scoreLabel = useCallback(
    (row: RankedSite) => {
      if (!target) return row.site.type?.[lang] ?? ''
      const score = row.score === null ? t('badge.notEvaluated') : formatPercent(row.score, lang)
      return `${t(mode === 'purpose' ? 'detail.purposeScore' : 'detail.similarity')} · ${score}`
    },
    [target, lang, mode, t],
  )

  // Escape cierra la vista activa.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (state.step !== null) dispatch({ type: 'setStep', step: null })
      else if (compareIds) dispatch({ type: 'setCompare', sites: null })
      else if (state.pin || state.tpin) {
        dispatch({ type: 'setPin', pin: null })
        setPinMode(false)
      }
      else if (state.site) selectSite(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state.site, state.step, state.pin, state.tpin, compareIds, dispatch, selectSite])

  const screenKey = JSON.stringify([rankingKey, selected ? selected.site.id : null, compareIds !== null, state.step, pinActive])
  useLayoutEffect(() => {
    const saved = rankingScroll.current
    const top = showRanking && saved?.key === rankingKey ? saved.top : 0
    panelRef.current?.scrollTo({ top })
  }, [rankingKey, screenKey, showRanking])

  useEffect(() => {
    if (mapFocus === 0) return
    mobileMapButton.current?.focus({ preventScroll: true })
  }, [mapFocus])

  const setLang = (l: Lang) => dispatch({ type: 'setLang', lang: l })
  const setStep = (step: number | null) => {
    dispatch({ type: 'setStep', step })
    setMobileMap(false)
  }
  const goHome = () => {
    rankingScroll.current = null
    dispatch({ type: 'home' })
    setMobileMap(false)
    setPinMode(false)
  }
  const placeEarthPin = (pin: Point) => {
    dispatch({ type: 'setPin', pin })
    setMobileMap(false)
  }
  const placePlanetPin = (pin: PlanetPoint) => {
    dispatch({ type: 'setTargetPin', pin })
    setMobileMap(false)
  }
  const closePins = () => {
    dispatch({ type: 'setPin', pin: null })
    setPinMode(false)
  }
  const backToRanking = () => {
    selectSite(null)
    setMobileMap(false)
  }
  const showSiteOnMap = () => {
    if (state.step === null && state.world !== 'earth') dispatch({ type: 'setWorld', world: 'earth' })
    setMobileMap(true)
    setMapFocus((previous) => previous + 1)
  }
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
          purpose={purpose}
          mode={mode}
          onChange={(sites) => dispatch({ type: 'setCompare', sites })}
          onBack={backToRanking}
        />
      )
    } else if (pinActive) {
      panel = (
        <PinPanel
          model={model}
          target={target}
          pin={state.pin}
          tpin={state.tpin}
          radiusKm={pinRadius}
          onRadius={setPinRadius}
          pinMode={pinMode}
          onPinMode={setPinMode}
          onResetTargetPin={() => dispatch({ type: 'setTargetPin', pin: null })}
          onClose={closePins}
          onShowMap={() => {
            setPinMode(true)
            setMobileMap(true)
            setMapFocus((previous) => previous + 1)
          }}
          onExplore={pinExplore ? openExplore : null}
          onSite={(id) => {
            // La ficha se ve cuando no hay pines: se quitan los dos y se abre el sitio.
            closePins()
            dispatch({ type: 'setTargetPin', pin: null })
            selectSite(id)
          }}
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
          onBack={backToRanking}
          onCompare={() => openComparison([selected.site.id])}
          onShowMap={showSiteOnMap}
          onExplore={openExplore}
          targets={model.file.targets}
          onTarget={selectPlanetTarget}
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
          onBack={goHome}
          onCompare={() => openComparison([])}
        />
      )
    }
  }

  return (
    <I18nContext.Provider value={i18n}>
      <div className="flex h-dvh min-w-0 flex-col overflow-hidden" inert={showExplore}>
        <Header onHome={goHome} onLang={setLang} onStory={story.length && !step ? () => setStep(0) : undefined} />
        {model?.file.meta.mock && <DemoBanner />}

        {!result ? (
          <LoadingScreen />
        ) : !result.ok ? (
          <ErrorScreen file={result.file} problems={result.problems} />
        ) : (
          <>
            <div className="grid shrink-0 grid-cols-2 border-b border-line bg-surface px-3 lg:hidden" role="group" aria-label={t('workspace.label')}>
              {([false, true] as const).map((showMap) => (
                <button
                  key={String(showMap)}
                  ref={showMap ? mobileMapButton : undefined}
                  type="button"
                  aria-pressed={mobileMap === showMap}
                  aria-controls={showMap ? 'map-workspace' : 'results-workspace'}
                  onClick={() => setMobileMap(showMap)}
                  className={`min-h-11 border-b-2 px-2 text-sm font-semibold ${mobileMap === showMap
                    ? 'border-earth text-earth'
                    : 'border-transparent text-muted hover:text-ink'}`}
                >
                  {t(showMap ? 'workspace.map' : target ? 'workspace.results' : 'workspace.purposes')}
                </button>
              ))}
            </div>
            <main className={`grid min-h-0 min-w-0 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] ${compareIds !== null
              ? 'lg:grid-cols-[minmax(430px,45%)_minmax(0,1fr)]'
              : 'lg:grid-cols-[minmax(380px,460px)_minmax(0,1fr)]'}`}>
              <section
                id="results-workspace"
                ref={panelRef}
                onScroll={showRanking ? (event) => {
                  rankingScroll.current = { key: rankingKey, top: event.currentTarget.scrollTop }
                } : undefined}
                aria-label={t(target ? 'workspace.results' : 'workspace.purposes')}
                className={`col-start-1 row-start-1 min-w-0 overflow-y-auto overscroll-contain bg-surface lg:visible lg:border-r lg:border-line ${mobileMap ? 'invisible' : ''}`}
              >
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
              </section>
              <div id="map-workspace" className={`col-start-1 row-start-1 min-h-0 min-w-0 lg:col-start-2 ${mobileMap ? '' : 'gm-map-hidden'}`}>
                <MapWorkspace
                  rows={rows}
                  targets={model?.file.targets ?? []}
                  target={target}
                  selectedId={selected?.site.id ?? null}
                  compareIds={compareIds}
                  view={state.view}
                  world={state.world}
                  purposeScore={mode === 'purpose'}
                  frameKey={`${rankingKey}|${state.step ?? ''}|${mapFocus}`}
                  onWorld={(world) => dispatch({ type: 'setWorld', world })}
                  onView={(view) => dispatch({ type: 'setView', view })}
                  scoreLabel={scoreLabel}
                  onSelect={onMapSelect}
                  onTarget={selectPlanetTarget}
                  pin={pinActive ? state.pin : null}
                  tpin={pinActive ? state.tpin : null}
                  pinRadiusKm={pinRadius}
                  pinMode={pinMode && !!target && compareIds === null && state.step === null}
                  onPinMode={setPinMode}
                  onPin={placeEarthPin}
                  onTargetPin={placePlanetPin}
                  onExplore={openExplore}
                />
              </div>
            </main>
          </>
        )}
      </div>
      {showExplore && model && target && (
        <Suspense fallback={<div className="fixed inset-0 z-50 grid place-items-center bg-space text-sm text-white/85">{t('explore.loading')}</div>}>
          {pinExplore ? (
            <Explore3D
              key="free-pin"
              model={model}
              rows={[pinExplore.row]}
              row={pinExplore.row}
              target={pinExplore.target}
              purpose={null}
              mode="similarity"
              onSite={() => undefined}
              onLang={setLang}
              onClose={closeExplore}
              free
            />
          ) : selected && (
            <Explore3D model={model} rows={rows} row={selected} target={target} purpose={purpose} mode={mode} onSite={selectSite} onLang={setLang} onClose={closeExplore} />
          )}
        </Suspense>
      )}
    </I18nContext.Provider>
  )
}
