import { lazy, Suspense, useEffect, useState } from 'react'
import type { Model } from '../data/model'
import { siteText } from '../data/model'
import type { Dimension, Purpose, Target } from '../data/schema'
import { useI18n } from '../i18n'
import { formatCoords, formatNumber, formatValue, score100 } from '../lib/format'
import type { RankedSite, ScoreMode } from '../lib/ranking'
import { activeWeights, scoredCount } from '../lib/ranking'
import { BODIES } from '../map/bodies'
import { BackButton, BodyChip, Pending, ScoreBar, SiteBadges, SiteGlyph } from './ui'
import { siteGlyphProps } from '../lib/glyph'
import { SourceLinks } from './SourceLinks'

const DimensionRadar = lazy(() => import('./DimensionRadar'))

interface Props {
  model: Model
  row: RankedSite
  total: number
  target: Target
  purpose: Purpose | null
  mode: ScoreMode
  onBack: () => void
  onCompare: () => void
}

function DimensionRows({
  dim,
  row,
  target,
  share,
}: {
  dim: Dimension
  row: RankedSite
  target: Target
  /** Peso relativo dentro del puntaje (0 a 1); null si la dimensión no cuenta. */
  share: number | null
}) {
  const { t, lang } = useI18n()
  const score = row.dimensions[dim.id] ?? null
  const earth = formatValue(row.site.values[dim.id], dim, lang)
  const other = formatValue(target.values[dim.id], dim, lang)
  const noData = <span className="font-sans text-[11px] italic text-faint">{t('value.noData')}</span>

  return (
    <tbody className={`border-t border-line ${share === null ? 'bg-paper/40' : ''}`}>
      <tr className="align-top">
        <th scope="row" className="pb-1 pl-4 pr-2 pt-3 text-left font-normal">
          <span className="block text-sm font-medium leading-snug text-ink">{dim.label[lang]}</span>
          {share !== null && (
            <span className="font-mono text-[10px] uppercase tracking-wide text-faint">
              {t('table.weight', { pct: Math.round(share * 100) })}
            </span>
          )}
        </th>
        <td className="whitespace-nowrap px-2 pb-1 pt-3 text-right font-mono text-[13px] tabular-nums text-earth">
          {earth ?? noData}
        </td>
        <td
          className="whitespace-nowrap px-2 pb-1 pt-3 text-right font-mono text-[13px] tabular-nums"
          style={{ color: BODIES[target.body].color }}
        >
          {other ?? noData}
        </td>
        <td className="w-16 pb-1 pl-2 pr-4 pt-3">
          {score !== null ? (
            <>
              <span className="block text-right font-mono text-[13px] font-semibold tabular-nums">{score100(score)}</span>
              <ScoreBar score={score} className="mt-1" />
            </>
          ) : (
            <span className="block text-right text-[11px] italic text-faint">{t('value.noData')}</span>
          )}
        </td>
      </tr>
      <tr>
        <td colSpan={4} className="px-4 pb-3">
          <SourceLinks sources={dim.sources} />
        </td>
      </tr>
    </tbody>
  )
}

function GroupHeading({ children }: { children: string }) {
  return (
    <tbody>
      <tr className="border-t border-line bg-paper/70">
        <th colSpan={4} scope="colgroup" className="px-4 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
          {children}
        </th>
      </tr>
    </tbody>
  )
}

function ShareButton() {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(id)
  }, [copied])
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
    } catch {
      window.prompt(t('detail.share'), window.location.href)
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink transition hover:border-ink/30"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" strokeLinecap="round" />
      </svg>
      <span aria-live="polite">{copied ? t('detail.copied') : t('detail.share')}</span>
    </button>
  )
}

export function SiteDetail({ model, row, total, target, purpose, mode, onBack, onCompare }: Props) {
  const { t, lang } = useI18n()
  const { site } = row
  const description = siteText(model, site, 'description', lang)
  const limits = siteText(model, site, 'limits', lang)
  const exploration = siteText(model, site, 'exploration', lang)
  const { scored, total: dimTotal } = scoredCount(model.file, row.dimensions)

  // Dimensiones que cuentan en el puntaje mostrado (por peso, de mayor a menor) y las de contexto.
  const weights = activeWeights(model.file, mode === 'purpose' ? purpose : null)
  const withWeight = model.dimensions.map((dim) => ({ dim, w: weights[dim.id] ?? 0 }))
  const counted = withWeight.filter((d) => d.w > 0).sort((a, b) => b.w - a.w)
  const context = withWeight.filter((d) => d.w <= 0)
  const weightSum = counted.reduce((sum, d) => sum + d.w, 0) || 1

  return (
    <article className="px-5 pb-10 pt-4 sm:px-7">
      <BackButton onClick={onBack}>{t('nav.backToRanking')}</BackButton>

      <header className="mt-3">
        <div className="flex items-center gap-2">
          <SiteGlyph {...siteGlyphProps(site, row.score)} size={26} />
          <SiteBadges site={site} evaluated={row.score !== null} />
        </div>
        <h1 className="mt-2 font-serif text-[1.65rem] font-semibold leading-tight tracking-tight">{site.name}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted">
          {site.type && <span>{site.type[lang]}</span>}
          <span className="font-mono text-faint">{formatCoords(site.lat, site.lon, lang)}</span>
          {site.radiusKm !== undefined && (
            <span className="text-faint">· {t('detail.radius', { km: formatNumber(site.radiusKm, lang) })}</span>
          )}
        </p>
      </header>

      <section className="mt-5 rounded-xl border border-line bg-surface p-4">
        {row.score !== null ? (
          <div className="flex items-end gap-4">
            <p className="font-mono text-5xl font-semibold leading-none tracking-tight tabular-nums">
              {score100(row.score)}
              <span className="ml-1 text-base font-normal text-faint">/100</span>
            </p>
            <div className="min-w-0 flex-1 pb-1">
              <p className="text-sm font-medium text-ink">
                {mode === 'purpose' ? t('detail.purposeScore') : t('detail.similarity')}
              </p>
              <ScoreBar score={row.score} className="mt-1.5 h-2" />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">{t('detail.notEvaluated')}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-3 text-xs text-muted">
          {row.rank !== null && <span className="font-medium text-ink">{t('detail.rank', { rank: row.rank, total })}</span>}
          <span>{t('detail.dimsScored', { n: scored, total: dimTotal })}</span>
          <span className="flex items-center gap-1.5">
            {t('target.comparing')} <strong className="font-medium text-ink">{target.name}</strong>
            <BodyChip body={target.body} />
          </span>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t('detail.about')}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink">{description ?? <Pending />}</p>
      </section>

      <section className="mt-6 rounded-xl border border-line bg-paper/55 p-3">
        <h2 className="font-serif text-lg font-semibold">{t('radar.title')}</h2>
        <Suspense fallback={<div className="h-[200px]" />}>
          <DimensionRadar key={`${site.id}|${target.id}`} model={model} site={site} target={target} />
        </Suspense>
      </section>

      <section className="mt-7">
        <h2 className="font-serif text-lg font-semibold leading-tight">{t('detail.evidence')}</h2>
        <p className="mt-1 text-xs text-muted">{t('detail.evidenceLead')}</p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[22rem] border-collapse">
            <thead>
              <tr className="bg-paper/70 text-[11px] uppercase tracking-wide text-muted">
                <th scope="col" className="py-2 pl-4 pr-2 text-left font-semibold">
                  {t('table.dimension')}
                </th>
                <th scope="col" className="px-2 py-2 text-right font-semibold text-earth">
                  {t('table.earth')}
                </th>
                <th scope="col" className="max-w-[6rem] truncate px-2 py-2 text-right font-semibold" style={{ color: BODIES[target.body].color }}>
                  {target.name}
                </th>
                <th scope="col" className="py-2 pl-2 pr-4 text-right font-semibold">
                  {t('table.score')}
                </th>
              </tr>
            </thead>
            {counted.length > 0 && <GroupHeading>{t('table.counted')}</GroupHeading>}
            {counted.map(({ dim, w }) => (
              <DimensionRows key={dim.id} dim={dim} row={row} target={target} share={w / weightSum} />
            ))}
            {context.length > 0 && <GroupHeading>{t('table.context')}</GroupHeading>}
            {context.map(({ dim }) => (
              <DimensionRows key={dim.id} dim={dim} row={row} target={target} share={null} />
            ))}
          </table>
        </div>
      </section>

      <section className="mt-7 rounded-xl border border-caution/25 bg-caution-soft p-4">
        <h2 className="flex items-center gap-2 font-serif text-base font-semibold text-caution">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('detail.limits')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink">{limits ?? <Pending />}</p>
        <p className="mt-2 text-xs leading-relaxed text-caution">{t(`limits.general.${target.body}`)}</p>
      </section>

      <section className="mt-4 rounded-xl border border-ok/20 bg-ok-soft p-4">
        <h2 className="flex items-center gap-2 font-serif text-base font-semibold text-ok">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 3h6M10 3v6.5L5.2 18a2 2 0 0 0 1.8 3h10a2 2 0 0 0 1.8-3L14 9.5V3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('detail.exploration')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink">{exploration ?? <Pending />}</p>
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <ShareButton />
        <button type="button" onClick={onCompare} className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:border-ink/30">
          {t('compare.add')}
        </button>
      </div>
    </article>
  )
}
