import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Model } from '../data/model'
import type { Body, Target } from '../data/schema'
import { useI18n } from '../i18n'
import { formatCoords, formatNumber, formatPercent } from '../lib/format'
import { SLOPE_BINS, STEEP_DEG } from '../lib/patch'
import type { PatchStats } from '../lib/patch'
import type { PlanetPoint, Point } from '../lib/state'
import { BODIES } from '../map/bodies'
import { gridMatches, targetMatches, terrainMatches, valuesPoint } from '../lib/terrainMatch'
import type { GridMatch, TargetMatch, TerrainMatch, TerrainPoint } from '../lib/terrainMatch'
import { loadGrid } from '../data/load'
import type { GridFile, GridPoint } from '../data/schema'
import type { PinMeasurement } from '../map/pinMeasure'
import { SourceLinks } from './SourceLinks'
import { BackButton, BodyChip, OriginTag, SectionTitle, SiteGlyph } from './ui'
import { PinMatchResults } from './PinMatchResults'
import type { MatchItem } from './PinMatchResults'
import { siteGlyphProps } from '../lib/glyph'
import { targetSummary } from '../data/model'

// Pin libre (piloto): pendiente y relieve medidos del relieve real alrededor de un punto de la Tierra
// y de un punto del objetivo, con el mismo radio y el mismo paso. Solo mediciones, sin puntaje.

const PIN_RADII = [2, 5, 10]
const EARTH_DEM = { name: 'Terrain Tiles', agency: 'Mapzen · AWS Open Data', url: 'https://registry.opendata.aws/terrain-tiles/' }
const SECTION = 'mt-5 overflow-hidden rounded-xl border border-line bg-paper'
const ACTION = 'min-h-9 rounded-md border border-earth/30 bg-earth-soft px-2.5 text-xs font-semibold text-earth transition hover:border-earth'
const PRIMARY = 'inline-flex min-h-9 items-center gap-1.5 rounded-md bg-space px-2.5 text-xs font-semibold text-white transition hover:bg-[#1c2f46]'
const LINK = 'min-h-9 px-1 text-xs font-semibold text-earth underline underline-offset-2'
const BUTTON = 'inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-ink transition hover:border-ink/30'

interface Props {
  model: Model
  target: Target
  pin: Point | null
  tpin: PlanetPoint | null
  radiusKm: number
  onRadius: (km: number) => void
  pinMode: boolean
  onPinMode: (on: boolean) => void
  onResetTargetPin: () => void
  onClose: () => void
  onShowMap: () => void
  /** Abre los dos pines en la vista 3D; null mientras falte el pin de la Tierra. */
  onExplore: (() => void) | null
  /** Abre la ficha de un sitio de la Tierra. */
  onSite: (id: string) => void
  /** Cambia el objetivo comparado, sin quitar el pin de la Tierra. */
  onTarget: (id: string) => void
  /** Pone el pin de la Tierra en un lugar y, con `open`, abre los dos pines en 3D. Mantiene el pin del otro cuerpo. */
  onEarthPinAt: (point: Point, name: string, open: boolean) => void
}

type Search = 'catalog' | 'new'
type GridResult = { key: string; grid: GridFile | null; list: GridMatch<GridPoint>[] | null } | { key: string; failed: true }

type Result = { key: string; data: PinMeasurement } | { key: string; failed: true }

export function PinPanel({ model, target, pin, tpin, radiusKm, onRadius, pinMode, onPinMode, onResetTargetPin, onClose, onShowMap, onExplore, onSite, onTarget, onEarthPinAt }: Props) {
  const { t, lang } = useI18n()
  // El pin del otro cuerpo puede estar en Marte o en la Luna; sin pin se mide el centro del objetivo.
  const body = tpin?.body ?? target.body
  const bodyName = t(`body.${body}`)
  const planet = tpin ?? { lon: target.lon, lat: target.lat }
  const key = JSON.stringify([pin, planet, target.id, radiusKm])
  const [result, setResult] = useState<Result | null>(null)
  const current = result?.key === key ? result : null

  useEffect(() => {
    if (pin === null) return
    let alive = true
    // Carga diferida: el cálculo usa los módulos de mapas, que no van en el paquete inicial.
    import('../map/pinMeasure')
      .then(({ measurePins }) => measurePins(pin, { lon: planet.lon, lat: planet.lat }, body, radiusKm))
      .then((data) => alive && setResult({ key, data }))
      .catch(() => alive && setResult({ key, failed: true }))
    return () => {
      alive = false
    }
    // `key` resume el pin, el punto del objetivo, el objetivo y el radio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Parecido de relieve del punto de Marte o la Luna con los sitios de la Tierra (no hace falta el pin de la
  // Tierra). Sin pin en el otro cuerpo se usan las mediciones del objetivo en el archivo, tomadas con el mismo
  // método: así funciona igual en la Luna y en Marte, también en el polo sur, que el modelo global no cubre.
  const matchKey = JSON.stringify([planet.lon, planet.lat, body, tpin ? null : target.id])
  const [match, setMatch] = useState<{ key: string; point: TerrainPoint | null; list: TerrainMatch[] | null } | { key: string; failed: true } | null>(null)
  const matchCurrent = match?.key === matchKey ? match : null
  useEffect(() => {
    let alive = true
    const fromFile = tpin ? null : valuesPoint(model.file, target.values)
    const measured: Promise<TerrainPoint | null> = fromFile
      ? Promise.resolve(fromFile)
      : import('../map/pinMeasure')
        .then(({ measurePlanetPoint }) => measurePlanetPoint({ lon: planet.lon, lat: planet.lat }, body))
        .then((stats) => (stats && Number.isFinite(stats.triMedian)
          ? { slope_median_deg: stats.slopeMedian, slope_p90_deg: stats.slopeP90, roughness_tri_m: stats.triMedian }
          : null))
    measured
      .then((point) => alive && setMatch({ key: matchKey, point, list: point ? terrainMatches(model.file, point) : null }))
      .catch(() => alive && setMatch({ key: matchKey, failed: true }))
    return () => {
      alive = false
    }
    // `matchKey` resume el punto y el cuerpo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchKey])

  // Lugares nuevos: el mismo parecido de relieve, contra los puntos de la malla del Altiplano (grid.json).
  const [search, setSearch] = useState<Search>('catalog')
  const point: TerrainPoint | null = matchCurrent && !('failed' in matchCurrent) ? matchCurrent.point : null
  const gridKey = search === 'new' && point ? JSON.stringify(point) : null
  const [gridResult, setGridResult] = useState<GridResult | null>(null)
  const gridCurrent = gridKey && gridResult?.key === gridKey ? gridResult : null
  useEffect(() => {
    if (!gridKey || !point) return
    let alive = true
    loadGrid(import.meta.env.BASE_URL)
      .then((grid) => alive && setGridResult({ key: gridKey, grid, list: grid ? gridMatches(model.file, grid.points, point) : null }))
      .catch(() => alive && setGridResult({ key: gridKey, failed: true }))
    return () => {
      alive = false
    }
    // `gridKey` resume las mediciones del punto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridKey])

  /** Botón principal de cada resultado: lado a lado en 3D con el pin del otro cuerpo; y uno secundario. */
  const compareActions = (at: Point, name: string, secondary: ReactNode) => (
    <span className="flex flex-wrap items-center gap-1.5">
      <button type="button" onClick={() => onEarthPinAt(at, name, true)} title={t('pin.compare3dHint', { body: bodyName })} className={PRIMARY}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M3 18l5-8 4 5 3-4 6 7z" strokeLinejoin="round" />
        </svg>
        {t('pin.compare3d')}
      </button>
      {secondary}
    </span>
  )

  // Al revés: a qué objetivo de Marte o la Luna se parece el punto de la Tierra (no hace falta otro pin).
  const earthKey = pin ? JSON.stringify([pin.lon, pin.lat]) : null
  const [earthMatch, setEarthMatch] = useState<{ key: string; stats: PatchStats | null; list: TargetMatch[] | null } | { key: string; failed: true } | null>(null)
  const earthCurrent = earthKey && earthMatch?.key === earthKey ? earthMatch : null
  useEffect(() => {
    if (!pin || !earthKey) return
    let alive = true
    import('../map/pinMeasure')
      .then(({ measureEarthPoint }) => measureEarthPoint(pin))
      .then((stats) => {
        if (!alive) return
        const list = stats && Number.isFinite(stats.triMedian)
          ? targetMatches(model.file, { slope_median_deg: stats.slopeMedian, slope_p90_deg: stats.slopeP90, roughness_tri_m: stats.triMedian })
          : null
        setEarthMatch({ key: earthKey, stats, list })
      })
      .catch(() => alive && setEarthMatch({ key: earthKey, failed: true }))
    return () => {
      alive = false
    }
    // `earthKey` resume el punto de la Tierra.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [earthKey])

  const data = current && 'data' in current ? current.data : null
  const deg = (v: number) => `${formatNumber(v, lang)}°`
  const metres = (v: number) => `${formatNumber(Math.round(v), lang)} m`
  const metrics: { label: string; value: (s: PatchStats) => string; context?: boolean }[] = [
    { label: t('pin.metric.slopeMedian'), value: (s) => deg(s.slopeMedian) },
    { label: t('pin.metric.slopeP90'), value: (s) => deg(s.slopeP90) },
    { label: t('pin.metric.steep', { deg: STEEP_DEG }), value: (s) => formatPercent(s.steepShare, lang) },
    { label: t('pin.metric.relief'), value: (s) => metres(s.reliefM) },
    { label: t('pin.metric.elevation'), value: (s) => metres(s.elevationMean), context: true },
    { label: t('pin.metric.coverage'), value: (s) => formatPercent(s.coverage, lang), context: true },
  ]
  const none = <span className="font-sans text-xs italic text-muted">{t('value.noData')}</span>
  const sides = [
    { id: 'earth', name: t('body.earth'), color: BODIES.earth.color, stats: data?.earth ?? null },
    { id: body, name: tpin ? t('pin.planetPoint', { body: bodyName }) : target.name, color: BODIES[body].color, stats: data?.planet ?? null },
  ]

  return (
    <article className="px-5 pb-10 pt-3 sm:px-7">
      <BackButton onClick={onClose}>{t('nav.backToRanking')}</BackButton>

      <header className="mt-2">
        <p className="flex items-center gap-2">
          <span className="rounded-full bg-[#facc15]/25 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-caution">{t('pin.pilot')}</span>
        </p>
        <h1 className="mt-1.5 font-serif text-[1.55rem] font-semibold leading-tight tracking-tight">{t('pin.title')}</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{t('pin.lead', { body: bodyName })}</p>
      </header>

      <section className="mt-4 grid grid-cols-2 gap-2" aria-label={t('pin.points')}>
        <div className="min-w-0 rounded-lg border border-line bg-paper px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold"><BodyChip body="earth" /></p>
          <p className="mt-1 text-xs text-muted">{t('pin.earthPoint')}</p>
          <p className="mt-0.5 font-mono text-[12px] text-ink">{pin ? formatCoords(pin.lat, pin.lon, lang) : <span className="font-sans italic text-muted">{t('pin.none')}</span>}</p>
        </div>
        <div className="min-w-0 rounded-lg border border-line bg-paper px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold"><BodyChip body={body} /></p>
          <p className="mt-1 text-xs text-muted">{tpin ? t('pin.planetPoint', { body: bodyName }) : t('pin.targetCentre', { target: target.name })}</p>
          <p className="mt-0.5 font-mono text-[12px] text-ink">{formatCoords(planet.lat, planet.lon, lang)}</p>
          {tpin && (
            <button type="button" onClick={onResetTargetPin} className="gm-tap mt-1 text-left text-[11px] font-semibold text-earth underline underline-offset-2">
              {t('pin.useCentre', { target: target.name })}
            </button>
          )}
        </div>
      </section>

      {onExplore && (
        <button
          type="button"
          onClick={onExplore}
          title={t('explore.openHint')}
          className="mt-3 flex min-h-11 w-full flex-col items-center justify-center rounded-md bg-space px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#1c2f46]"
        >
          <span className="inline-flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M3 18l5-8 4 5 3-4 6 7z" strokeLinejoin="round" />
              <circle cx="17" cy="6" r="2" />
            </svg>
            {t('explore.open')}
          </span>
          <span className="text-xs font-normal text-white/70">{t('explore.openModes')}</span>
        </button>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div role="group" aria-label={t('pin.radius')} className="flex items-center gap-1 rounded-md border border-line p-0.5">
          <span className="px-1.5 text-xs text-muted">{t('pin.radius')}</span>
          {PIN_RADII.map((km) => (
            <button
              key={km}
              type="button"
              aria-pressed={radiusKm === km}
              onClick={() => onRadius(km)}
              className={`min-h-9 rounded px-2 text-xs font-semibold tabular-nums ${radiusKm === km ? 'bg-ink text-white' : 'text-ink hover:bg-paper'}`}
            >
              {formatNumber(km, lang)} km
            </button>
          ))}
        </div>
        <button type="button" aria-pressed={pinMode} onClick={() => onPinMode(!pinMode)} className={`${BUTTON} ${pinMode ? '!border-[#d4a906] bg-[#facc15]/30' : ''}`}>
          {t('pin.place')}
        </button>
        <button type="button" onClick={onShowMap} className={`${BUTTON} lg:hidden`}>
          {t('nav.showSiteOnMap')}
        </button>
      </div>
      <p className="mt-2 text-xs leading-snug text-muted">{t(body === 'moon' ? 'pin.mapHintMoon' : 'pin.mapHint', { body: bodyName })}</p>

      {!pin ? null : !current ? (
        <p className="mt-5 text-sm text-muted" role="status">{t('pin.loading')}</p>
      ) : 'failed' in current ? (
        <p className="mt-5 rounded-lg bg-caution-soft px-3 py-2.5 text-sm text-caution" role="alert">{t('pin.error')}</p>
      ) : data && (
        <>
          <section className="mt-5" aria-live="polite">
            <SectionTitle lead={t('pin.measuredLead', { km: formatNumber(radiusKm, lang), step: formatNumber(data.stepM, lang) })}>
              {t('pin.measured')}
            </SectionTitle>
            <table className="mt-2 w-full table-fixed border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="w-[42%] py-1.5 pr-2 font-medium">{t('pin.metric')}</th>
                  {sides.map((s) => (
                    <th key={s.id} scope="col" className="py-1.5 pr-1 font-semibold" style={{ color: s.color }}>
                      <span className="block truncate">{s.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {metrics.map((m) => (
                  <tr key={m.label}>
                    <th scope="row" className={`py-2 pr-2 text-left align-top text-[13px] font-medium ${m.context ? 'text-muted' : 'text-ink'}`}>{m.label}</th>
                    {sides.map((s) => (
                      <td key={s.id} className="py-2 pr-1 align-top font-mono text-[13px] tabular-nums" style={{ color: s.color }}>
                        {s.stats ? m.value(s.stats) : none}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-1.5 text-[11px] leading-snug text-muted">{t('pin.elevationNote', { body: bodyName })}</p>
          </section>

          {data.earth && data.planet && (
            <section className="mt-5">
              <SectionTitle lead={t('pin.histogramLead')}>{t('pin.histogram')}</SectionTitle>
              <ul className="mt-2 space-y-1.5">
                {SLOPE_BINS.map((from, i) => {
                  const to = SLOPE_BINS[i + 1]
                  const label = to === undefined ? `> ${from}°` : `${from}–${to}°`
                  return (
                    <li key={from} className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-2">
                      <span className="font-mono text-[11px] text-muted">{label}</span>
                      <div className="space-y-0.5">
                        {sides.map((s) => {
                          const share = s.stats?.histogram[i] ?? 0
                          return (
                            <div key={s.id} className="flex items-center gap-1.5" title={`${s.name}: ${formatPercent(share, lang)}`}>
                              <div className="h-2 min-w-px rounded-sm" style={{ width: `${Math.max(0.5, share * 100)}%`, background: s.color }} />
                              <span className="font-mono text-[10px] tabular-nums text-muted">{formatPercent(share, lang)}</span>
                            </div>
                          )
                        })}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          <div className="mt-4 space-y-2">
            {data.outside && <Note>{t('pin.outside', { body: bodyName })}</Note>}
            {!data.outside && data.planetGridM === null && <Note>{t('pin.noTerrain', { body: bodyName })}</Note>}
            {data.planet && data.planet.coverage < 0.95 && <Note>{t('pin.partial', { pct: formatPercent(data.planet.coverage, lang) })}</Note>}
            {data.earth && data.earth.belowZeroShare > 0.2 && <Note>{t('pin.sea')}</Note>}
          </div>

        </>
      )}

      <section className={SECTION} aria-live="polite">
        <SectionHead body="earth" title={t('pin.earthMatch')} lead={t('pin.earthMatchLead')} />
        <div className="px-3.5 pb-3.5">
          {!pin ? (
            <p className="mt-3 rounded-lg border border-dashed border-line bg-surface px-3 py-2.5 text-sm text-ink">{t('pin.earthMatchPrompt')}</p>
          ) : !earthCurrent ? (
            <Loading>{t('pin.matchLoading')}</Loading>
          ) : 'failed' in earthCurrent || !earthCurrent.stats || !earthCurrent.list ? (
            <p className="mt-3 text-sm text-caution" role="alert">{t('pin.error')}</p>
          ) : (
            <>
              <PinMatchResults
                model={model}
                pointBody="earth"
                itemBody={(item) => model.targetById.get(item.id)?.body ?? body}
                othersTitle={t('pin.othersTargets')}
                items={earthCurrent.list.slice(0, 6).flatMap((m): MatchItem[] => {
                  const tg = model.targetById.get(m.targetId)
                  if (!tg) return []
                  const shown = tg.id === target.id && !tpin
                  return [{
                    id: tg.id,
                    name: tg.name,
                    mark: <BodyChip body={tg.body} />,
                    sub: targetSummary(model, tg, lang),
                    similarity: m.similarity,
                    dimensions: m.dimensions,
                    action: shown ? (
                      <span className="text-[11px] text-muted">{t('pin.earthMatchCurrent')}</span>
                    ) : (
                      <button type="button" onClick={() => onTarget(tg.id)} className={ACTION}>{t('pin.earthMatchUse')}</button>
                    ),
                  }]
                })}
              />
              <p className="mt-2 text-[11px] leading-snug text-muted">{t('pin.matchNote')}</p>
            </>
          )}
        </div>
      </section>

      <section className={SECTION} aria-live="polite">
        <SectionHead body={body} title={t('pin.match', { body: bodyName })} lead={t('pin.matchLead')} />
        <div className="px-3.5 pb-3.5">
          <div role="group" aria-label={t('pin.searchTabs')} className="mt-3 grid grid-cols-2 gap-1 rounded-md border border-line p-0.5">
            {(['catalog', 'new'] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={search === s}
                onClick={() => setSearch(s)}
                className={`min-h-9 rounded px-2 text-xs font-semibold ${search === s ? 'bg-ink text-white' : 'text-ink hover:bg-paper'}`}
              >
                {t(s === 'catalog' ? 'pin.searchCatalog' : 'pin.searchNew')}
              </button>
            ))}
          </div>
          {search === 'new' && matchCurrent && point ? (
            !gridCurrent ? (
              <Loading>{t('pin.searchNewLoading')}</Loading>
            ) : 'failed' in gridCurrent || !gridCurrent.grid || !gridCurrent.list ? (
              <p className="mt-3 text-sm text-caution" role="alert">{t('pin.searchNewNone')}</p>
            ) : (
              <>
                <p className="mt-3 text-xs leading-relaxed text-muted">
                  {t('pin.searchNewLead', {
                    country: gridCurrent.grid.meta.country ?? '',
                    step: formatNumber(gridCurrent.grid.meta.stepDeg, lang),
                    km: formatNumber(gridCurrent.grid.meta.radiusKm, lang),
                    near: formatNumber(10, lang),
                  })}
                </p>
                <PinMatchResults
                  model={model}
                  pointBody={body}
                  itemBody={() => 'earth'}
                  othersTitle={t('pin.othersNew')}
                  items={gridCurrent.list.map((m): MatchItem => {
                    const p = m.point
                    const coords = formatCoords(p.lat, p.lon, lang)
                    const name = p.place?.feature ?? p.place?.municipality ?? t('pin.gridName', { coords })
                    const near = model.siteById.get(p.nearestSite.id)?.name ?? p.nearestSite.id
                    return {
                      id: `${p.lat},${p.lon}`,
                      name,
                      mark: <OriginTag origin="found" />,
                      sub: [
                        name === t('pin.gridName', { coords }) ? null : coords,
                        p.place?.department,
                        p.elevationM == null ? null : t('pin.gridElevation', { m: formatNumber(p.elevationM, lang) }),
                        t('pin.gridNear', { km: formatNumber(p.nearestSite.km, lang), site: near }),
                      ].filter(Boolean).join(' · '),
                      similarity: m.similarity,
                      dimensions: m.dimensions,
                      action: compareActions({ lat: p.lat, lon: p.lon }, name, (
                        <button type="button" onClick={() => onEarthPinAt({ lat: p.lat, lon: p.lon }, name, false)} className={LINK}>{t('pin.putPin')}</button>
                      )),
                    }
                  })}
                />
                <p className="mt-2 text-[11px] leading-snug text-muted">{t('pin.matchNote')}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-[11px] font-semibold text-muted">{t('pin.sources')}</p>
                  <SourceLinks sources={gridCurrent.grid.meta.sources.map((s) => ({ ...s, body: 'earth' as const }))} />
                </div>
              </>
            )
          ) : !matchCurrent ? (
            <Loading>{t('pin.matchLoading')}</Loading>
          ) : 'failed' in matchCurrent ? (
            <p className="mt-3 text-sm text-caution" role="alert">{t('pin.error')}</p>
          ) : !matchCurrent.point || !matchCurrent.list ? (
            <p className="mt-3 text-sm text-muted">{t(body === 'moon' ? 'pin.outside' : 'pin.matchNone', { body: bodyName })}</p>
          ) : (
            <>
              <PinMatchResults
                model={model}
                pointBody={body}
                itemBody={() => 'earth'}
                othersTitle={t('pin.others')}
                items={matchCurrent.list.slice(0, 6).flatMap((m): MatchItem[] => {
                  const site = model.siteById.get(m.siteId)
                  if (!site) return []
                  const place = (lang === 'en' && site.place?.country_en) || site.place?.country
                  return [{
                    id: site.id,
                    name: site.name,
                    mark: <SiteGlyph {...siteGlyphProps(site, m.similarity)} size={18} />,
                    sub: [site.type?.[lang], site.place?.department, place].filter(Boolean).join(' · '),
                    similarity: m.similarity,
                    dimensions: m.dimensions,
                    action: compareActions({ lat: site.lat, lon: site.lon }, site.name, (
                      <button type="button" onClick={() => onSite(m.siteId)} className={LINK}>{t('pin.matchOpen')}</button>
                    )),
                  }]
                })}
              />
              <p className="mt-2 text-[11px] leading-snug text-muted">{t('pin.matchNote')}</p>
            </>
          )}
        </div>
      </section>

      {data && (
          <section className="mt-5 rounded-lg bg-paper px-3 py-2.5">
          <h2 className="text-xs font-semibold text-ink">{t('pin.method')}</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {t('pin.methodText', {
              step: formatNumber(data.stepM, lang),
              km: formatNumber(radiusKm, lang),
              earthPx: formatNumber(Math.round(data.earthPixelM), lang),
              grid: data.planetGridM === null ? '–' : formatNumber(data.planetGridM, lang),
              body: bodyName,
            })}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">{t('pin.notScore')}</p>
          <div className="mt-2 space-y-1">
            <p className="text-[11px] font-semibold text-muted">{t('pin.sources')}</p>
            <SourceLinks sources={[{ ...EARTH_DEM, body: 'earth' }, ...data.planetSources.map((s) => ({ ...s, body }))]} />
          </div>
        </section>
      )}
    </article>
  )
}

function Note({ children }: { children: ReactNode }) {
  return <p className="rounded-r-lg border-l-2 border-caution/60 bg-caution-soft/55 px-3 py-2 text-xs leading-relaxed text-ink">{children}</p>
}

function SectionHead({ body, title, lead }: { body: Body; title: string; lead: string }) {
  return (
    <header className="border-b border-line bg-surface px-3.5 py-3" style={{ borderLeft: `4px solid ${BODIES[body].color}` }}>
      <p><BodyChip body={body} /></p>
      <h2 className="mt-1.5 font-serif text-lg font-semibold leading-tight">{title}</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted">{lead}</p>
    </header>
  )
}

function Loading({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 flex items-center gap-2 text-sm text-muted" role="status">
      <span className="size-3.5 animate-spin rounded-full border-2 border-line border-t-earth" aria-hidden="true" />
      {children}
    </p>
  )
}
