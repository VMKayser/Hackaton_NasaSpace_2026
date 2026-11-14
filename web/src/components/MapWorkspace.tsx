import { Component, lazy, Suspense, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { Target } from '../data/schema'
import { useI18n } from '../i18n'
import type { RankedSite } from '../lib/ranking'
import type { View, World } from '../lib/state'
import { PlanetFallback } from '../map/PlanetFallback'
import { IMAGERY, MERCATOR_LIMIT, PLANETS } from '../map/planetaryImagery'
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
  frameKey: string
  onWorld: (world: World) => void
  onView: (view: View) => void
  onSelect: (site: string) => void
  onTarget: (target: string) => void
  scoreLabel: (row: RankedSite) => string
}

export function MapWorkspace({ rows, targets, target, selectedId, compareIds, view, world, frameKey, onWorld, onView, onSelect, onTarget, scoreLabel }: Props) {
  const { t } = useI18n()
  const body = world === 'auto' ? target?.body : world === 'earth' ? undefined : world
  const planetTarget = target?.body === body ? target : null
  const planetTargets = useMemo(() => targets.filter((item) => item.body === body), [targets, body])
  const polar = !!planetTarget && Math.abs(planetTarget.lat) > MERCATOR_LIMIT
  const southPole = body === 'moon' && !!planetTarget && planetTarget.lat < -MERCATOR_LIMIT
  const sideBySide = world === 'auto' && !!body
  const showEarth = !body || sideBySide
  const worlds: World[] = ['earth', ...PLANETS]
  if (target) worlds.push('auto')

  return (
    <section className="flex h-[43dvh] min-h-0 shrink-0 flex-col overflow-hidden bg-space lg:order-2 lg:h-auto">
      <div className="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-x-2 border-b border-white/15 bg-space px-2 sm:px-3">
        <div className="flex min-w-0 items-center gap-0.5 py-1" role="group" aria-label={t('map.worlds')}>
          {worlds.map((id) => {
            const active = world === id || (!target && world === 'auto' && id === 'earth')
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => onWorld(id)}
                className={`whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-semibold outline-offset-[-2px] sm:px-3 ${active ? 'bg-white text-ink' : 'text-white/85 hover:bg-white/10'}`}
              >
                {id === 'auto' ? t('map.sideBySide') : t(`body.${id}`)}
              </button>
            )
          })}
        </div>
        {showEarth && <ViewToggle view={view} onView={onView} />}
      </div>
      <div className={`grid min-h-0 flex-1 ${sideBySide ? 'grid-cols-2' : 'grid-cols-1'}`}>
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
                />
              </Suspense>
            </MapBoundary>
            {sideBySide && <strong className="pointer-events-none absolute left-2 top-2 rounded-md bg-space/95 px-2 py-1 text-xs text-white">{t('body.earth')}</strong>}
            {target && <div className="absolute bottom-3 left-3"><Legend /></div>}
          </div>
        )}
        {body && (
          <div className={`relative min-w-0 overflow-hidden bg-space ${sideBySide ? 'border-l border-white/25' : ''}`}>
            <MapBoundary key={body} fallback={<PlanetFallback body={body} polar={southPole} />}>
              {polar ? <PlanetFallback body={body} polar={southPole} /> : (
                <Suspense fallback={<MapMessage>{t('map.loading')}</MapMessage>}>
                  <PlanetMap body={body} target={planetTarget} targets={planetTargets} onTarget={onTarget} />
                </Suspense>
              )}
            </MapBoundary>
            <div className="pointer-events-none absolute inset-x-2 top-2 z-10 flex flex-wrap items-center justify-between gap-1">
              {planetTargets.length > 0 ? (
                <select
                  aria-label={t('map.targets', { body: t(`body.${body}`) })}
                  className="pointer-events-auto max-w-full rounded-md border border-white/20 bg-space/95 px-2 py-1.5 text-xs font-semibold text-white"
                  value={planetTarget?.id ?? ''}
                  onChange={(event) => onTarget(event.target.value)}
                >
                  <option value="" disabled>{t('map.chooseTarget')}</option>
                  {planetTargets.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              ) : (
                <span className="rounded-md border border-white/15 bg-space/95 px-2 py-1 text-xs text-white">{t('map.noTargets')}</span>
              )}
              <a href={IMAGERY[body].explorer} target="_blank" rel="noopener noreferrer"
                className="pointer-events-auto rounded-md bg-space/90 px-2 py-1.5 text-xs text-white underline underline-offset-2">
                {t('map.explorer')}
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
