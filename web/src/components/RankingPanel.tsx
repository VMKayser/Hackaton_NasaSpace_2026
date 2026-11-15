import { useMemo } from 'react'
import type { Model } from '../data/model'
import { purposeLabel, purposeQuestion, targetSummary, targetTextSources } from '../data/model'
import type { Purpose, Target } from '../data/schema'
import { useI18n } from '../i18n'
import { formatCoords, formatPercent } from '../lib/format'
import type { RankedSite, ScoreMode } from '../lib/ranking'
import { BackButton, BodyChip, KindIcon, Pending, ScoreBar, SiteBadges, SiteGlyph } from './ui'
import { siteGlyphProps } from '../lib/glyph'
import { TargetMeasurements } from './TargetMeasurements'
import { ScoreMethod } from './ScoreMethod'
import { SourceLinks } from './SourceLinks'

interface Props {
  model: Model
  purpose: Purpose | null
  target: Target
  rows: RankedSite[]
  mode: ScoreMode
  selectedId: string | null
  onSelect: (id: string) => void
  onBack: () => void
  onCompare: () => void
  dimSort?: string | null
  onResetDimSort?: () => void
  countryFilter?: string | null
  onCountryFilter?: (country: string | null) => void
}

function TargetCard({ model, target, question }: { model: Model; target: Target; question: string | null }) {
  const { t, lang } = useI18n()
  const summary = targetSummary(model, target, lang)
  const summarySources = targetTextSources(model, target)
  return (
    <div className="rounded-lg bg-paper px-3 py-2.5">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="text-muted">{t('target.comparing')}</span>
        <strong className="font-semibold text-ink">{target.name}</strong>
        <BodyChip body={target.body} />
      </p>
      <details key={target.id} className="mt-1">
        <summary className="cursor-pointer rounded py-1 text-xs font-semibold text-earth">{t('target.measurements')}</summary>
        {question && <p className="mt-1 text-[13px] leading-snug text-ink">{question}</p>}
        <p className="mt-1 text-[13px] leading-snug text-muted">{summary ?? <Pending />}</p>
        {summarySources.length > 0 && <div className="mt-1 wrap-anywhere"><SourceLinks sources={summarySources} /></div>}
        <p className="mt-1 font-mono text-[11px] text-muted">{formatCoords(target.lat, target.lon, lang)}</p>
        <TargetMeasurements model={model} target={target} />
      </details>
    </div>
  )
}

export function RankingPanel({
  model,
  purpose,
  target,
  rows,
  mode,
  selectedId,
  onSelect,
  onBack,
  onCompare,
  dimSort,
  onResetDimSort,
  countryFilter,
  onCountryFilter,
}: Props) {
  const { t, lang } = useI18n()
  const evaluated = rows.filter((r) => r.score !== null).length
  const dimLabel = (id: string) => model.dimensionById.get(id)?.label[lang] ?? id
  const question = purpose ? purposeQuestion(model, purpose, lang) : null
  const rankingLabel = dimSort
    ? `${t('voice.sortedByDim')}: ${dimLabel(dimSort)}`
    : t(mode === 'purpose' ? 'ranking.byPurpose' : 'ranking.bySimilarity')

  // Calculate country distribution
  const countryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of rows) {
      const c = r.site.country || 'Otros'
      counts[c] = (counts[c] || 0) + 1
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  }, [rows])

  // Filter rows by country
  const filteredRows = useMemo(() => {
    if (!countryFilter || !countryFilter.trim()) return rows
    const q = countryFilter.trim().toLowerCase()
    return rows.filter((r) => {
      const c = (r.site.country || '').toLowerCase()
      const n = r.site.name.toLowerCase()
      return c.includes(q) || n.includes(q)
    })
  }, [rows, countryFilter])

  return (
    <div className="px-5 pb-8 pt-3 sm:px-7">
      <BackButton onClick={onBack}>{t('nav.changePurpose')}</BackButton>

      {purpose && (
        <div className="mt-2 flex items-start gap-3">
          <KindIcon kind={purpose.kind} />
          <div className="min-w-0">
            <p className="sr-only">{t(`kind.${purpose.kind}`)}</p>
            <h1 className="font-serif text-xl font-semibold leading-tight">{purposeLabel(model, purpose, lang)}</h1>
          </div>
        </div>
      )}

      <div className="mt-3">
        <TargetCard model={model} target={target} question={question} />
      </div>

      {dimSort && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs">
          <div className="flex items-center gap-1.5 text-amber-200">
            <span className="font-semibold">{t('voice.sortedByDim')}:</span>
            <span className="font-bold underline">{dimLabel(dimSort)}</span>
          </div>
          {onResetDimSort && (
            <button
              type="button"
              onClick={onResetDimSort}
              className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/30 transition"
            >
              {t('voice.resetSort')}
            </button>
          )}
        </div>
      )}

      <h2 className="mt-4 font-serif text-xl font-semibold leading-tight">{t('ranking.title')}</h2>
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="min-w-0 space-y-0.5 text-[11px] leading-snug text-muted">
          <p>{rankingLabel}</p>
          <p>{t('ranking.count', { n: evaluated, total: rows.length })}</p>
        </div>
        {rows.length >= 2 && (
          <button
            type="button"
            onClick={onCompare}
            className="min-h-9 shrink-0 rounded-md border border-line px-2.5 text-xs font-semibold text-earth transition hover:bg-earth-soft"
          >
            {t('compare.title')}
          </button>
        )}
      </div>

      {/* Country Search & Filter Box */}
      <div className="mt-3 space-y-2 rounded-lg border border-line/70 bg-paper/60 p-2.5">
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-2.5 text-muted">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            value={countryFilter ?? ''}
            onChange={(e) => onCountryFilter?.(e.target.value || null)}
            placeholder={t('ranking.searchCountryPlaceholder')}
            className="w-full rounded-md border border-line bg-surface py-1.5 pl-8 pr-8 text-xs text-ink placeholder-muted focus:border-earth focus:outline-none"
          />
          {countryFilter && (
            <button
              type="button"
              onClick={() => onCountryFilter?.(null)}
              title={t('ranking.clearCountry')}
              className="absolute right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-muted/20 text-[10px] font-bold text-muted hover:bg-muted/40 hover:text-ink transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Country Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-[10px] uppercase font-semibold text-muted">
            {t('ranking.countryFilter')}:
          </span>
          {countryCounts.slice(0, 4).map((c) => {
            const active = countryFilter?.toLowerCase() === c.name.toLowerCase()
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => onCountryFilter?.(active ? null : c.name)}
                className={`rounded px-2 py-0.5 font-medium transition ${
                  active
                    ? 'bg-earth text-white font-semibold shadow-xs'
                    : 'bg-surface text-muted hover:bg-line hover:text-ink border border-line/80'
                }`}
              >
                {c.name} <span className="opacity-70 text-[10px]">({c.count})</span>
              </button>
            )
          })}
          {countryFilter && (
            <button
              type="button"
              onClick={() => onCountryFilter?.(null)}
              className="text-earth hover:underline font-semibold text-[11px] ml-0.5"
            >
              {t('ranking.allCountries')} ({rows.length})
            </button>
          )}
        </div>

        {/* Active Filter Notice */}
        {countryFilter && (
          <div className="flex items-center justify-between rounded bg-earth-soft/70 px-2.5 py-1 text-xs text-earth font-medium">
            <span>{t('ranking.showingCountry', { count: filteredRows.length, country: countryFilter })}</span>
            <button
              type="button"
              onClick={() => onCountryFilter?.(null)}
              className="font-bold text-[11px] hover:underline"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <ScoreMethod model={model} purpose={mode === 'purpose' ? purpose : null} />

      {filteredRows.length === 0 ? (
        <p className="mt-6 text-center text-xs text-muted">
          {t('ranking.noSitesCountry')}
        </p>
      ) : (
        <ol className="mt-2 divide-y divide-line border-y border-line">
          {filteredRows.map((r) => {
            const selected = r.site.id === selectedId
            const highlights = [
              { id: r.top[0], label: 'ranking.highest' },
              { id: r.low, label: 'ranking.lowest' },
            ] as const
            return (
              <li key={r.site.id}>
                <button
                  type="button"
                  onClick={() => onSelect(r.site.id)}
                  aria-current={selected ? 'true' : undefined}
                  className={`grid w-full grid-cols-[1rem_1.25rem_minmax(0,1fr)_auto] items-start gap-1.5 rounded-md py-3 text-left transition ${
                    selected ? 'bg-rust-soft/60' : 'hover:bg-paper'
                  }`}
                >
                  <span className="pt-0.5 text-center font-mono text-xs tabular-nums text-muted">{r.rank ?? '–'}</span>
                  <SiteGlyph {...siteGlyphProps(r.site, r.score)} size={20} />
                  <span className="min-w-0">
                    <span className="block wrap-anywhere text-[14px] font-semibold leading-snug text-ink">{r.site.name}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
                      {r.site.country && <span className="font-medium text-earth">{r.site.country}</span>}
                      {r.site.country && r.site.type && <span className="text-faint" aria-hidden="true">·</span>}
                      {r.site.type && <span>{r.site.type[lang]}</span>}
                      {r.site.type && (r.site.reference || r.site.known || r.site.control || r.score === null) && (
                        <span className="text-faint" aria-hidden="true">·</span>
                      )}
                      <SiteBadges site={r.site} evaluated={r.score !== null} />
                    </span>
                    {r.rank !== null && highlights.map(({ id, label }) => {
                      if (!id) return null
                      const score = r.dimensions[id]
                      if (score === null || score === undefined) return null
                      return (
                        <span key={label} className="mt-1.5 block text-[11px] leading-snug text-muted">
                          <span className="block font-semibold">{t(label)}</span>
                          <span className="wrap-anywhere text-ink">{dimLabel(id)} · {formatPercent(score, lang)}</span>
                        </span>
                      )
                    })}
                  </span>
                  <span className="pt-0.5 text-right font-mono text-sm font-semibold tabular-nums text-ink">
                    {r.score === null ? (
                      <span className="text-xs font-normal text-muted">{t('badge.notEvaluated')}</span>
                    ) : (
                      <>
                        <span className="block">{formatPercent(r.score, lang)}</span>
                        <ScoreBar score={r.score} className="mt-1 w-14" />
                      </>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
