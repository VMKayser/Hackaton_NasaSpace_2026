import type { Model } from '../data/model'
import type { Candidate, Purpose, Target } from '../data/schema'
import { useI18n } from '../i18n'
import { formatCoords, formatNumber, formatPercent } from '../lib/format'
import type { Point } from '../lib/state'
import { SourceLinks } from './SourceLinks'
import { ScoreBar } from './ui'

// Lugares nuevos: puntos de una malla del Altiplano, fuera del catálogo, que tools/discover.py midió y
// puntuó con el mismo método y los mismos pesos. La web solo los muestra.

interface Props {
  model: Model
  target: Target
  /** Propósito activo cuando el orden es por propósito; null para la similitud general. */
  purpose: Purpose | null
  onPin: (point: Point) => void
}

export function DiscoveriesSection({ model, target, purpose, onPin }: Props) {
  const { t, lang } = useI18n()
  const file = model.discoveries
  if (!file) return null
  const matches = (c: { targetId: string; purposeId?: string }) =>
    purpose ? c.purposeId === purpose.id : !c.purposeId && c.targetId === target.id
  const list = file.candidates.filter(matches).sort((a, b) => a.rank - b.rank)
  const skipped = file.meta.skipped?.find(matches)
  if (!list.length && !skipped) return null
  const check = file.meta.validation.find(matches)
  const stepKm = Math.round(file.meta.grid.stepDeg * 111)

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
        {list.map((c) => {
          const { main, area } = label(c)
          const nearest = model.siteById.get(c.nearestSite.id)
          return (
            <li key={`${c.lat},${c.lon}`} className="flex items-start gap-3 py-2.5">
              <span className="mt-0.5 w-5 shrink-0 text-right font-mono text-xs text-muted">{c.rank}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug wrap-anywhere">{main}</p>
                {area && <p className="text-xs text-muted">{area}</p>}
                <p className="mt-0.5 font-mono text-[11px] text-faint">{formatCoords(c.lat, c.lon, lang)}</p>
                {nearest && (
                  <p className="text-[11px] text-muted">{t('discover.nearest', { km: formatNumber(c.nearestSite.km, lang), site: nearest.name })}</p>
                )}
                <button
                  type="button"
                  onClick={() => onPin({ lat: c.lat, lon: c.lon })}
                  className="mt-1 min-h-9 text-xs font-semibold text-earth underline underline-offset-2"
                >
                  {t('discover.pin')}
                </button>
              </div>
              <div className="w-20 shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums">{formatPercent(c.similarity, lang)}</p>
                <ScoreBar score={c.similarity} className="mt-1" />
              </div>
            </li>
          )
        })}
      </ol>}
      {check && list.length > 0 && <p className="mt-2 text-xs leading-relaxed text-muted">{t('discover.validation', { n: check.nearCatalog, top: check.top, km: formatNumber(file.meta.grid.nearCatalogKm, lang) })}</p>}
      <p className="mt-1.5 text-xs leading-relaxed text-muted">{t('discover.note')}</p>
      <div className="mt-1.5 wrap-anywhere">
        <p className="text-[11px] font-semibold text-muted">{t('discover.sources')}</p>
        <SourceLinks sources={file.meta.sources} />
      </div>
    </section>
  )
}
