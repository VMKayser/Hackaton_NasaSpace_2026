import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { EXPLORE_MAX_LAT } from '../map/planetaryImagery'
import type { Model } from '../data/model'
import { siteText, siteTextSources } from '../data/model'
import type { Dimension, Purpose, Target } from '../data/schema'
import { useI18n } from '../i18n'
import { formatCoords, formatNumber, formatPercent, formatValue } from '../lib/format'
import type { RankedSite, ScoreMode } from '../lib/ranking'
import { activeWeights, scoredCount } from '../lib/ranking'
import { BODIES } from '../map/bodies'
import { BackButton, BodyChip, Pending, ScoreBar, ScoreSummary, SectionTitle, SiteBadges, SiteGlyph } from './ui'
import { siteGlyphProps } from '../lib/glyph'
import { SourceLinks } from './SourceLinks'
import { ScoreMethod } from './ScoreMethod'

const DimensionRadar = lazy(() => import('./DimensionRadar'))

const ACTION = 'inline-flex min-h-10 items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-ink transition hover:border-ink/30'

interface Props {
  model: Model
  row: RankedSite
  total: number
  target: Target
  purpose: Purpose | null
  mode: ScoreMode
  onBack: () => void
  onCompare: () => void
  onShowMap: () => void
  /** Abre la vista 3D; null si el objetivo no se puede mostrar en 3D. */
  onExplore: (() => void) | null
  /** Todos los objetivos, para ver este sitio frente a cada uno. */
  targets: Target[]
  /** Cambia el objetivo y conserva este sitio. */
  onTarget: (id: string) => void
}

function DimensionResult({
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
  const noData = <span className="font-sans text-xs italic text-muted">{t('value.noData')}</span>

  return (
    <li className="py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="wrap-anywhere text-sm font-semibold leading-snug">{dim.label[lang]}</h4>
          {share !== null && (
            <p className="mt-0.5 text-[11px] text-muted">{t('table.weight', { pct: formatPercent(share, lang) })}</p>
          )}
        </div>
        <p className="shrink-0 text-right">
          <span className="block text-[11px] leading-snug text-muted">{t('detail.dimensionScore')}</span>
          {score === null ? noData : (
            <span className="block text-xl font-bold leading-tight tabular-nums text-rust">{formatPercent(score, lang)}</span>
          )}
        </p>
      </div>
      {score !== null && <ScoreBar score={score} className="mt-2" />}
      <dl className="mt-2.5 grid grid-cols-2 gap-2 rounded-md bg-paper px-2.5 py-2 wrap-anywhere">
        <div style={{ color: BODIES.earth.color }}>
          <dt className="text-xs font-medium">{t('body.earth')}</dt>
          <dd className="mt-0.5 font-mono text-[13px] tabular-nums">{earth ?? noData}</dd>
        </div>
        <div style={{ color: BODIES[target.body].color }}>
          <dt className="text-xs font-medium">{target.name}</dt>
          <dd className="mt-0.5 font-mono text-[13px] tabular-nums">{other ?? noData}</dd>
        </div>
      </dl>
      <div className="mt-2 wrap-anywhere"><SourceLinks sources={dim.sources} /></div>
    </li>
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
      className={ACTION}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" strokeLinecap="round" />
      </svg>
      <span aria-live="polite">{copied ? t('detail.copied') : t('detail.share')}</span>
    </button>
  )
}

export function SiteDetail({ model, row, total, target, purpose, mode, onBack, onCompare, onShowMap, onExplore, targets, onTarget }: Props) {
  const { t, lang } = useI18n()
  const { site } = row
  const measurementsRef = useRef<HTMLHeadingElement>(null)
  const [radarOpen, setRadarOpen] = useState(false)
  const description = siteText(model, site, 'description', lang)
  const limits = siteText(model, site, 'limits', lang)
  const exploration = siteText(model, site, 'exploration', lang)
  const textSources = siteTextSources(model, site)
  const textSourcesLine = textSources.length > 0 && (
    <p className="mt-1.5 text-[11px] leading-snug text-muted wrap-anywhere">
      <span className="font-semibold">{t('detail.textSources')}:</span> <SourceLinks sources={textSources} />
    </p>
  )
  const { scored, total: dimTotal } = scoredCount(model.file, row.dimensions)

  // Dimensiones que cuentan en el puntaje mostrado (por peso, de mayor a menor) y las de contexto.
  const weights = activeWeights(model.file, mode === 'purpose' ? purpose : null)
  const withWeight = model.dimensions.map((dim) => ({ dim, w: weights[dim.id] ?? 0 }))
  const counted = withWeight.filter((d) => d.w > 0).sort((a, b) => b.w - a.w)
  const context = withWeight.filter((d) => d.w <= 0)
  const weightSum = counted.reduce((sum, d) => sum + d.w, 0) || 1
  const groups = [
    { title: 'table.counted', dimensions: counted },
    { title: 'table.context', dimensions: context },
  ] as const

  // En el otro sentido: este sitio frente a cada objetivo, con la similitud que entrega el rol 4.
  // Solo se ordena; los que no tienen puntaje van al final como «no evaluado».
  const pairs = targets
    .map((tg) => ({ target: tg, similarity: site.scores.find((s) => s.targetId === tg.id)?.similarity ?? null }))
    .sort((a, b) => (b.similarity ?? -1) - (a.similarity ?? -1))

  return (
    <article className="px-5 pb-10 pt-3 sm:px-7">
      <BackButton onClick={onBack}>{t('nav.backToRanking')}</BackButton>

      <header className="mt-2">
        <div className="flex items-center gap-2">
          <SiteGlyph {...siteGlyphProps(site, row.score)} size={22} />
          <SiteBadges site={site} evaluated={row.score !== null} />
        </div>
        <h1 className="mt-1.5 font-serif text-[1.55rem] font-semibold leading-tight tracking-tight">{site.name}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted">
          {site.type && <span>{site.type[lang]}</span>}
          <span className="font-mono text-faint">{formatCoords(site.lat, site.lon, lang)}</span>
          {site.radiusKm !== undefined && (
            <span className="text-faint">· {t('detail.radius', { km: formatNumber(site.radiusKm, lang) })}</span>
          )}
        </p>
      </header>

      <section aria-label={t('detail.similarity')} className="mt-4 rounded-xl border border-line bg-paper px-3.5 py-3 sm:px-4">
        <ScoreSummary similarity={row.similarity} purposeScore={mode === 'purpose' ? row.score : undefined} />
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          {row.rank !== null && <span className="font-medium text-ink">{t('detail.rank', { rank: row.rank, total })}</span>}
          {row.rank !== null && <span className="text-faint" aria-hidden="true">·</span>}
          <span>{t('detail.dimsScored', { n: scored, total: dimTotal })}</span>
        </p>
        <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
          {t('target.comparing')} <strong className="font-medium text-ink">{target.name}</strong>
          <BodyChip body={target.body} />
        </p>
        <ScoreMethod model={model} purpose={mode === 'purpose' ? purpose : null} />
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
      {!onExplore && Math.abs(target.lat) > EXPLORE_MAX_LAT && (
        <p className="mt-3 rounded-lg border border-line bg-paper px-3 py-2.5 text-xs leading-relaxed text-muted">
          {t('explore.polarUnavailable', { target: target.name, lat: formatNumber(EXPLORE_MAX_LAT, lang) })}
        </p>
      )}

      <div role="group" aria-label={t('detail.actions')} className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => {
          const heading = measurementsRef.current
          if (!heading) return
          const panel = heading.closest('#results-workspace')
          if (!panel) return
          panel.scrollBy({ top: heading.getBoundingClientRect().top - panel.getBoundingClientRect().top - 16 })
          heading.focus({ preventScroll: true })
        }} className={ACTION}>
          {t('nav.measurements')}
        </button>
        <button type="button" onClick={onShowMap} className={ACTION}>
          {t('nav.showSiteOnMap')}
        </button>
        <button type="button" onClick={onCompare} className={ACTION}>
          {t('compare.add')}
        </button>
        <ShareButton />
      </div>

      <section className="mt-4 rounded-r-lg border-l-2 border-ok/50 bg-ok-soft/55 px-3 py-2.5">
        <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-ok">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 3h6M10 3v6.5L5.2 18a2 2 0 0 0 1.8 3h10a2 2 0 0 0 1.8-3L14 9.5V3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('detail.exploration')}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-ink">{exploration ?? <Pending />}</p>
      </section>

      <section className="mt-2 rounded-r-lg border-l-2 border-caution/60 bg-caution-soft/55 px-3 py-2.5">
        <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-caution">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('detail.limits')}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-ink">{limits ?? <Pending />}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted">{t(`limits.general.${target.body}`)}</p>
      </section>
      {textSourcesLine}

      {pairs.length > 1 && (
        <section className="mt-5">
          <SectionTitle lead={t('detail.otherTargetsLead')}>{t('detail.otherTargets')}</SectionTitle>
          <ul className="mt-1.5 divide-y divide-line">
            {pairs.map(({ target: tg, similarity }) => (
              <li key={tg.id} className="flex min-h-11 items-center gap-2 py-1.5">
                <BodyChip body={tg.body} />
                <span className="min-w-0 flex-1 text-sm font-medium leading-snug wrap-anywhere">{tg.name}</span>
                <span className="hidden w-16 shrink-0 sm:block"><ScoreBar score={similarity} /></span>
                <span className="w-16 shrink-0 text-right text-sm tabular-nums">
                  {similarity === null ? <span className="text-xs text-muted">{t('badge.notEvaluated')}</span> : formatPercent(similarity, lang)}
                </span>
                {tg.id === target.id ? (
                  <span className="w-20 shrink-0 text-right text-[11px] text-muted">{t('detail.currentTarget')}</span>
                ) : (
                  <button type="button" onClick={() => onTarget(tg.id)} className="min-h-9 w-20 shrink-0 text-right text-xs font-semibold text-earth underline underline-offset-2">
                    {t('detail.compareWith')}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6">
        <h2 ref={measurementsRef} tabIndex={-1} className="scroll-mt-4 font-serif text-xl font-semibold leading-tight">{t('detail.dimensionsTitle')}</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">{t('detail.evidenceLead')}</p>
        <details className="mt-2" onToggle={(event) => setRadarOpen(event.currentTarget.open)}>
          <summary className="cursor-pointer rounded py-1 text-xs font-semibold text-earth">{t('radar.title')}</summary>
          {radarOpen && (
            <Suspense fallback={<div className="h-[200px]" />}>
              <DimensionRadar key={`${site.id}|${target.id}`} model={model} site={site} target={target} />
            </Suspense>
          )}
        </details>
        {groups.map(({ title, dimensions }) => dimensions.length > 0 && (
          <section key={title} className="mt-4">
            <h3 className="border-b border-line pb-1.5 text-xs font-semibold text-muted">{t(title)}</h3>
            <ul className="divide-y divide-line">
              {dimensions.map(({ dim, w }) => (
                <DimensionResult key={dim.id} dim={dim} row={row} target={target} share={w > 0 ? w / weightSum : null} />
              ))}
            </ul>
          </section>
        ))}
      </section>

      <section className="mt-5">
        <SectionTitle>{t('detail.about')}</SectionTitle>
        <p className="mt-1.5 text-sm leading-relaxed text-ink">{description ?? <Pending />}</p>
        {textSourcesLine}
      </section>

    </article>
  )
}
