import { Component, lazy, Suspense, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Target } from '../data/schema'
import { useI18n } from '../i18n'
import type { RankedSite } from '../lib/ranking'
import type { PlanetPoint, Point, View, World } from '../lib/state'
import { PlanetFallback } from '../map/PlanetFallback'
import { IMAGERY, MERCATOR_LIMIT, PLANETS } from '../map/planetaryImagery'
import { AdaptationModal } from './AdaptationModal'
import { Legend, ViewToggle } from './MapOverlays'

const EarthMap = lazy(() => import('../map/MapView').then(({ MapView }) => ({ default: MapView })))
const PlanetMap = lazy(() => import('../map/PlanetMap').then(({ PlanetMap }) => ({ default: PlanetMap })))

class MapBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function MapMessage({ children }: { children: ReactNode }) {
  return <div className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-white/85" role="status">{children}</div>
}

interface Props {
  rows: RankedSite[]
  targets: Target[]
  target: Target | null
  selectedId: string | null
  compareIds: string[] | null
  view: View
  world: World
  purposeScore: boolean
  frameKey: string
  onWorld: (world: World) => void
  onView: (view: View) => void
  onSelect: (site: string) => void
  onTarget: (target: string) => void
  scoreLabel: (row: RankedSite) => string
  /** Pin libre: en la Tierra y en Marte o la Luna. */
  pin: Point | null
  tpin: PlanetPoint | null
  pinRadiusKm: number
  pinMode: boolean
  onPinMode: (on: boolean) => void
  onPin: (point: Point) => void
  onTargetPin: (point: PlanetPoint) => void
  /** Abre la vista 3D del sitio elegido o de los pines; null si no hay nada que mostrar. */
  onExplore: (() => void) | null
}

export function MapWorkspace({
  rows, targets, target, selectedId, compareIds, view, world, purposeScore, frameKey, onWorld, onView, onSelect, onTarget, scoreLabel,
  pin, tpin, pinRadiusKm, pinMode, onPinMode, onPin, onTargetPin, onExplore,
}: Props) {
  const { t } = useI18n()
  const [adaptationOpen, setAdaptationOpen] = useState(false)
  const selectedSite = useMemo(() => rows.find((r) => r.site.id === selectedId)?.site ?? null, [rows, selectedId])
  const body = world === 'auto' ? target?.body : world === 'earth' ? undefined : world
  const planetTarget = target?.body === body ? target : null
  const planetTargets = useMemo(() => targets.filter((item) => item.body === body), [targets, body])
  const southPole = body === 'moon' && !!planetTarget && planetTarget.lat < -80
  const polar = !!planetTarget && (Math.abs(planetTarget.lat) > MERCATOR_LIMIT || southPole)
  const sideBySide = world === 'auto' && !!body
  const showEarth = !body || sideBySide
  const worlds: World[] = ['earth', ...PLANETS]
  if (target) worlds.push('auto')

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-space" aria-label={t('workspace.map')}>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-white/15 bg-space px-2 py-1 sm:px-3">
        <div className="flex min-w-0 flex-wrap items-center gap-0.5" role="group" aria-label={t('map.worlds')}>
          {worlds.map((id) => {
            const active = world === id || (!target && world === 'auto' && id === 'earth')
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => onWorld(id)}
                className={`min-h-10 rounded-md px-2 text-xs font-semibold outline-offset-[-2px] sm:px-3 ${active ? 'bg-white text-ink' : 'text-white/85 hover:bg-white/10'}`}
              >
                {id === 'auto' ? t('map.sideBySide') : t(`body.${id}`)}
              </button>
            )
          })}
          {selectedSite && target && (
            <button
              type="button"
              onClick={() => setAdaptationOpen(true)}
              title={t('adaptation.buttonHint')}
              className="ml-1 inline-flex min-h-10 items-center gap-1.5 rounded-md border border-amber-400/50 bg-amber-500/20 px-2.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/30 sm:px-3 shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              <span>{t('adaptation.button')}</span>
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {onExplore && (
            <button
              type="button"
              onClick={onExplore}
              title={t('explore.openHint')}
              className="inline-flex min-h-9 items-center gap-1 rounded-md bg-white px-2 text-xs font-semibold text-ink hover:bg-white/90 sm:px-2.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M3 18l5-8 4 5 3-4 6 7z" strokeLinejoin="round" />
              </svg>
              {t('explore.open')}
            </button>
          )}
          {target && (
            <button
              type="button"
              aria-pressed={pinMode}
              onClick={() => onPinMode(!pinMode)}
              title={t('pin.toolHint')}
              className={`inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-xs font-semibold sm:px-2.5 ${pinMode ? 'bg-[#facc15] text-ink' : 'text-white/85 hover:bg-white/10'}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="2.2" />
              </svg>
              {t('pin.tool')}
            </button>
          )}
          {showEarth && <ViewToggle view={view} onView={onView} />}
        </div>
      </div>
      {pinMode && target && (
        <p role="status" className="shrink-0 border-b border-[#facc15]/30 bg-[#facc15]/10 px-3 py-1.5 text-xs leading-snug text-[#fde68a]">
          {body ? t(body === 'moon' ? 'pin.mapHintMoon' : 'pin.mapHint', { body: t(`body.${body}`) }) : t('pin.mapHintEarth')}
        </p>
      )}
      <div className={`grid min-h-0 flex-1 ${sideBySide ? 'gm-map-panes' : 'grid-cols-1'}`}>
        {showEarth && (
          <div className="relative min-w-0 overflow-hidden">
            <MapBoundary fallback={<MapMessage>{t('map.unavailable')}</MapMessage>}>
              <Suspense fallback={<MapMessage>{t('map.loading')}</MapMessage>}>
                <EarthMap
                  rows={rows}
                  neutral={!target}
                  selectedId={selectedId}
                  compareIds={compareIds}
                  view={view}
                  frameKey={frameKey}
                  label={t('map.label')}
                  noWebglText={t('map.noWebgl')}
                  scoreLabel={scoreLabel}
                  onSelect={onSelect}
                  pin={pin}
                  pinRadiusKm={pinRadiusKm}
                  pinMode={pinMode}
                  onPin={onPin}
                />
              </Suspense>
            </MapBoundary>
            {sideBySide && <strong className="pointer-events-none absolute left-2 top-2 rounded-md bg-space/95 px-2 py-1 text-xs text-white">{t('body.earth')}</strong>}
            {target && (
              <div className="pointer-events-none absolute left-2 right-2 top-10 bottom-12 z-10 flex items-start sm:bottom-14">
                <Legend purposeScore={purposeScore} />
              </div>
            )}
          </div>
        )}
        {body && (
          <div className={`relative min-w-0 overflow-hidden bg-space ${sideBySide ? 'gm-map-divider border-white/25' : ''}`}>
            <MapBoundary key={body} fallback={<PlanetFallback body={body} polar={southPole} target={planetTarget} targets={planetTargets} onTarget={onTarget} />}>
              {polar ? (
                <PlanetFallback
                  body={body}
                  polar={southPole}
                  target={planetTarget}
                  targets={planetTargets}
                  onTarget={onTarget}
                />
              ) : (
                <Suspense fallback={<MapMessage>{t('map.loading')}</MapMessage>}>
                  <PlanetMap
                    body={body}
                    target={planetTarget}
                    targets={planetTargets}
                    onTarget={onTarget}
                    pin={tpin?.body === body ? tpin : null}
                    pinRadiusKm={pinRadiusKm}
                    pinMode={pinMode}
                    onPin={(point) => onTargetPin({ ...point, body })}
                  />
                </Suspense>
              )}
            </MapBoundary>
            <div className="pointer-events-none absolute inset-x-2 top-2 z-10 flex flex-wrap items-center justify-between gap-1">
              <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
                <div className="inline-flex rounded-md border border-white/20 bg-space/95 p-0.5 shadow" role="group" aria-label={t('map.worlds')}>
                  <button
                    type="button"
                    aria-pressed={body === 'mars'}
                    onClick={() => {
                      const marsTarget = targets.find((item) => item.body === 'mars')
                      if (world === 'moon') onWorld('mars')
                      if (marsTarget) onTarget(marsTarget.id)
                    }}
                    className={`min-h-8 rounded px-2.5 text-xs font-semibold transition ${
                      body === 'mars' ? 'bg-rust text-white shadow-sm' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {t('body.mars')}
                  </button>
                  <button
                    type="button"
                    aria-pressed={body === 'moon'}
                    onClick={() => {
                      const moonTarget = targets.find((item) => item.body === 'moon')
                      if (world === 'mars') onWorld('moon')
                      if (moonTarget) onTarget(moonTarget.id)
                    }}
                    className={`min-h-8 rounded px-2.5 text-xs font-semibold transition ${
                      body === 'moon' ? 'bg-slate-300 text-ink shadow-sm' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {t('body.moon')}
                  </button>
                </div>
                {planetTargets.length > 0 ? (
                  <select
                    aria-label={t('map.targets', { body: t(`body.${body}`) })}
                    className="pointer-events-auto min-h-8 max-w-[240px] truncate rounded-md border border-white/20 bg-space/95 px-2 text-xs font-semibold text-white"
                    value={planetTarget?.id ?? ''}
                    onChange={(event) => onTarget(event.target.value)}
                  >
                    <option value="" disabled>{t('map.chooseTarget')}</option>
                    {planetTargets.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                ) : (
                  <span className="rounded-md border border-white/15 bg-space/95 px-2 py-1 text-xs text-white">{t('map.noTargets')}</span>
                )}
              </div>
              <a href={IMAGERY[body].explorer} target="_blank" rel="noopener noreferrer"
                className="pointer-events-auto inline-flex min-h-8 items-center rounded-md bg-space/90 px-2 text-xs text-white underline underline-offset-2">
                {t('map.explorer')}
              </a>
            </div>
          </div>
        )}
      </div>
      {adaptationOpen && selectedSite && target && (
        <AdaptationModal
          site={selectedSite}
          target={target}
          onClose={() => setAdaptationOpen(false)}
        />
      )}
    </section>
  )
}
