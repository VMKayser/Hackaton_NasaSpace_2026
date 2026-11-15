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

export function RankingPanel({ model, purpose, target, rows, mode, selectedId, onSelect, onBack, onCompare }: Props) {
  const { t, lang } = useI18n()
  const evaluated = rows.filter((r) => r.score !== null).length
  const dimLabel = (id: string) => model.dimensionById.get(id)?.label[lang] ?? id
  const question = purpose ? purposeQuestion(model, purpose, lang) : null
  const rankingLabel = t(mode === 'purpose' ? 'ranking.byPurpose' : 'ranking.bySimilarity')

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

      <ScoreMethod model={model} purpose={mode === 'purpose' ? purpose : null} />

      <ol className="mt-2 divide-y divide-line border-y border-line">
        {rows.map((r) => {
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
                        {dimLabel(id)} <span className="whitespace-nowrap font-bold tabular-nums text-ink">{formatPercent(score, lang)}</span>
                      </span>
                    )
                  })}
                </span>
                <span className="w-[5.25rem] text-right">
                  {r.similarity !== null ? (
                    <>
                      <span className="block text-xl font-bold leading-none tracking-tight tabular-nums text-rust">
                        <span className="sr-only">{t('detail.similarity')} </span>{formatPercent(r.similarity, lang)}
                      </span>
                      <ScoreBar score={r.similarity} className="mt-1.5 h-1.5" />
                    </>
                  ) : (
                    <span className="font-mono text-sm text-faint">–</span>
                  )}
                  {mode === 'purpose' && (
                    <>
                      {r.similarity !== null && <span aria-hidden="true" className="mt-1 block text-[10px] leading-tight text-muted">{t('detail.similarity')}</span>}
                      <span className="mt-2 block text-[10px] leading-tight text-muted">
                        {t('ranking.purposeOrder')}
                        <span className="mt-0.5 block text-xs font-bold tabular-nums text-ink">
                          {r.score === null ? t('badge.notEvaluated') : formatPercent(r.score, lang)}
                        </span>
                      </span>
                    </>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
