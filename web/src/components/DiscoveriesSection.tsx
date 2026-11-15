import { useState } from 'react'
import type { Model } from '../data/model'
import type { Candidate, Purpose, Target } from '../data/schema'
import { useI18n } from '../i18n'
import { formatCoords, formatNumber, formatPercent, formatValue } from '../lib/format'
import { activeWeights } from '../lib/ranking'
import type { Point } from '../lib/state'
import { SourceLinks } from './SourceLinks'
import { OriginTag, PlaceTags, ScoreBar } from './ui'

// Lugares nuevos: puntos de una malla del Altiplano, fuera del catálogo, que tools/discover.py midió y
// puntuó con el mismo método y los mismos pesos. La web solo los muestra.

interface Props {
  model: Model
  target: Target
  /** Propósito activo cuando el orden es por propósito; null para la similitud general. */
  purpose: Purpose | null
  onSelect: (id: string) => void
  onPin: (point: Point) => void
}

/** Lugares que se ven antes de «Ver todos». */
const FIRST = 5

export function DiscoveriesSection({ model, target, purpose, onSelect, onPin }: Props) {
  const { t, lang } = useI18n()
  const [showAll, setShowAll] = useState(false)
  const file = model.discoveries
  if (!file) return null
  const matches = (c: { targetId: string; purposeId?: string }) =>
    purpose ? c.purposeId === purpose.id : !c.purposeId && c.targetId === target.id
  const list = file.candidates.filter(matches).sort((a, b) => a.rank - b.rank)
  const skipped = file.meta.skipped?.find(matches)
  if (!list.length && !skipped) return null
  const check = file.meta.validation.find(matches)
  const stepKm = Math.round(file.meta.grid.stepDeg * 111)
  const shown = showAll ? list : list.slice(0, FIRST)
  const weights = activeWeights(model.file, purpose)
  const dims = model.dimensions.filter((d) => (weights[d.id] ?? 0) > 0)

  const label = (c: Candidate) => {
    const p = c.place ?? {}
    const main = p.feature ?? p.peak ?? p.protected
    const area = [p.municipality, p.province].filter(Boolean).join(', ')
    if (main) return { main, area }
    if (area) return { main: t('discover.near', { place: area }), area: '' }
    return { main: formatCoords(c.lat, c.lon, lang), area: '' }
  }

  return (
    <section className="mt-6" aria-labelledby="discover-title">
      <h2 id="discover-title" className="font-serif text-xl font-semibold leading-tight">{t('discover.title')}</h2>
      {list.length > 0 && <p className="mt-1 text-xs leading-relaxed text-muted">
        {t('discover.lead', { n: formatNumber(file.meta.grid.measured, lang), km: formatNumber(stepKm, lang), country: file.meta.grid.country ?? '' })}
      </p>}
      {!list.length && skipped && (
        <p className="mt-2 rounded-r-lg border-l-2 border-caution/60 bg-caution-soft/55 px-3 py-2 text-xs leading-relaxed text-ink">
          {t('discover.skipped')} {skipped.reason[lang]}
        </p>
      )}
      {list.length > 0 && <ol className="mt-2 divide-y divide-line border-y border-line">
        {shown.map((c) => {
          const { main, area } = label(c)
          const nearest = model.siteById.get(c.nearestSite.id)
          const point = c.pointId ? model.foundById.get(c.pointId) : undefined
          const elev = point?.elevationM ?? c.elevationM
          const geo = point?.geology
          return (
            <li key={`${c.lat},${c.lon}`} className="flex items-start gap-3 py-2.5">
              <span className="mt-0.5 w-5 shrink-0 text-right font-mono text-xs text-muted">{c.rank}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug wrap-anywhere">{main}</p>
                <span className="mt-0.5 flex flex-wrap items-center gap-1">
                  <OriginTag origin="found" />
                  <PlaceTags place={c.place} />
                </span>
                {area && <p className="text-xs text-muted">{area}</p>}
                <p className="mt-0.5 font-mono text-[11px] text-faint">
                  {formatCoords(c.lat, c.lon, lang)}
                  {elev != null && ` · ${formatNumber(Math.round(elev), lang)} m`}
                </p>
                {nearest && (
                  <p className="text-[11px] text-muted">{t('discover.nearest', { km: formatNumber(c.nearestSite.km, lang), site: nearest.name })}</p>
                )}
                <details className="mt-1">
                  <summary className="cursor-pointer py-1 text-xs font-semibold text-earth">{t('discover.data')}</summary>
                  <table className="mt-1 w-full border-collapse text-[12px]">
                    <thead>
                      <tr className="border-b border-line text-left text-[11px] text-muted">
                        <th scope="col" className="py-1 pr-2 font-medium">{t('table.dimension')}</th>
                        <th scope="col" className="py-1 pr-2 text-right font-medium">{t('discover.here')}</th>
                        <th scope="col" className="py-1 pr-2 text-right font-medium">{target.name}</th>
                        <th scope="col" className="py-1 text-right font-medium">{t('discover.sim')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dims.map((d) => {
                        const here = formatValue(c.values[d.id], d, lang)
                        const there = formatValue(target.values[d.id], d, lang)
                        const s = c.dimensions[d.id]
                        return (
                          <tr key={d.id} className="border-b border-line/60 align-top">
                            <th scope="row" className="py-1 pr-2 text-left font-normal">{d.label[lang]}</th>
                            <td className="py-1 pr-2 text-right font-mono tabular-nums">{here ?? <span className="font-sans italic text-muted">{t('value.noData')}</span>}</td>
                            <td className="py-1 pr-2 text-right font-mono tabular-nums">{there ?? <span className="font-sans italic text-muted">{t('value.noData')}</span>}</td>
                            <td className="py-1 text-right tabular-nums">{s == null ? '–' : formatPercent(s, lang)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {(geo?.name ?? c.mapUnit) && <p className="mt-1 text-[11px] text-muted">{t('discover.mapUnit', { unit: geo?.name ?? c.mapUnit ?? '' })}</p>}
                  {geo?.lith && <p className="mt-0.5 text-[11px] text-muted">{t('discover.lithology')}: {geo.lith}</p>}
                  {geo?.age && <p className="mt-0.5 text-[11px] text-muted">{t('discover.age')}: {geo.age}</p>}
                  {geo?.url && (
                    <p className="mt-0.5 text-[11px]">
                      <a href={geo.url} target="_blank" rel="noopener noreferrer" className="gm-tap font-medium text-earth underline underline-offset-2">
                        {t('discover.macrostratLink')}
                      </a>
                    </p>
                  )}
                </details>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  {point && (
                    <button
                      type="button"
                      onClick={() => onSelect(point.id)}
                      className="min-h-9 rounded-md border border-earth/30 bg-earth-soft px-2.5 text-xs font-semibold text-earth transition hover:bg-earth hover:text-white"
                    >
                      {t('discover.open')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onPin({ lat: c.lat, lon: c.lon })}
                    className="min-h-9 text-xs font-semibold text-earth underline underline-offset-2"
                  >
                    {t('discover.pin')}
                  </button>
                </div>
              </div>
              <div className="w-20 shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums">{formatPercent(c.similarity, lang)}</p>
                <ScoreBar score={c.similarity} className="mt-1" />
              </div>
            </li>
          )
        })}
      </ol>}
      {list.length > FIRST && (
        <button type="button" onClick={() => setShowAll(!showAll)} className="mt-2 min-h-9 text-xs font-semibold text-earth underline underline-offset-2">
          {showAll ? t('discover.fewer') : t('discover.all', { n: list.length })}
        </button>
      )}
      {check && list.length > 0 && <p className="mt-2 text-xs leading-relaxed text-muted">{t('discover.validation', { n: check.nearCatalog, top: check.top, km: formatNumber(file.meta.grid.nearCatalogKm, lang) })}</p>}
      <p className="mt-1.5 text-xs leading-relaxed text-muted">{t('discover.note')}</p>
      <div className="mt-1.5 wrap-anywhere">
        <p className="text-[11px] font-semibold text-muted">{t('discover.sources')}</p>
        <SourceLinks sources={file.meta.sources} />
      </div>
    </section>
  )
}
