import type { Model } from '../data/model'
import { purposeLabel, purposeQuestion, targetSummary } from '../data/model'
import type { Purpose, Target } from '../data/schema'
import { useI18n } from '../i18n'
import { formatCoords, score100 } from '../lib/format'
import type { RankedSite, ScoreMode } from '../lib/ranking'
import { BackButton, BodyChip, KindIcon, Pending, ScoreBar, SiteBadges, SiteGlyph } from './ui'
import { siteGlyphProps } from '../lib/glyph'

interface Props {
  model: Model
  purpose: Purpose | null
  target: Target
  rows: RankedSite[]
  mode: ScoreMode
  selectedId: string | null
  onSelect: (id: string) => void
  onBack: () => void
}

export function TargetCard({ model, target }: { model: Model; target: Target }) {
  const { t, lang } = useI18n()
  const summary = targetSummary(model, target, lang)
  return (
    <div className="rounded-xl border border-line bg-paper/70 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">{t('target.comparing')}</span>
        <BodyChip body={target.body} />
      </div>
      <p className="mt-1.5 font-serif text-lg font-semibold leading-tight">{target.name}</p>
      <p className="font-mono text-[11px] text-faint">{formatCoords(target.lat, target.lon, lang)}</p>
      <p className="mt-2 text-sm leading-snug text-muted">{summary ?? <Pending />}</p>
    </div>
  )
}

export function RankingPanel({ model, purpose, target, rows, mode, selectedId, onSelect, onBack }: Props) {
  const { t, lang } = useI18n()
  const evaluated = rows.filter((r) => r.score !== null).length
  const dimLabel = (id: string) => model.dimensionById.get(id)?.label[lang] ?? id
  const question = purpose ? purposeQuestion(model, purpose, lang) : null

  return (
    <div className="px-5 pb-8 pt-4 sm:px-7">
      <BackButton onClick={onBack}>{t('nav.changePurpose')}</BackButton>

      {purpose && (
        <div className="mt-3 flex items-start gap-3">
          <KindIcon kind={purpose.kind} />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">{t(`kind.${purpose.kind}`)}</p>
            <h1 className="font-serif text-xl font-semibold leading-tight">{purposeLabel(model, purpose, lang)}</h1>
            {question && <p className="mt-1 text-sm leading-snug text-muted">{question}</p>}
          </div>
        </div>
      )}

      <div className="mt-5">
        <TargetCard model={model} target={target} />
      </div>

      <div className="mt-7 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-semibold leading-tight">{t('ranking.title')}</h2>
          <p className="text-xs text-muted">{mode === 'purpose' ? t('ranking.byPurpose') : t('ranking.bySimilarity')}</p>
        </div>
        <p className="shrink-0 font-mono text-[11px] text-faint">{t('ranking.count', { n: evaluated, total: rows.length })}</p>
      </div>

      <ol className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {rows.map((r) => {
          const selected = r.site.id === selectedId
          const muted = r.score === null
          return (
            <li key={r.site.id}>
              <button
                type="button"
                onClick={() => onSelect(r.site.id)}
                aria-current={selected ? 'true' : undefined}
                className={`grid w-full grid-cols-[1.6rem_1.5rem_1fr_auto] items-center gap-3 px-3.5 py-3 text-left transition ${
                  selected ? 'bg-rust-soft/60' : 'hover:bg-paper'
                } ${muted ? 'opacity-70' : ''}`}
              >
                <span className="text-center font-mono text-sm tabular-nums text-faint">{r.rank ?? '–'}</span>
                <SiteGlyph {...siteGlyphProps(r.site, r.score)} />
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink">{r.site.name}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                    {r.site.type && <span>{r.site.type[lang]}</span>}
                    <SiteBadges site={r.site} evaluated={r.score !== null} />
                  </span>
                  {r.top.length > 0 && (
                    <span className="mt-1 block truncate text-[11px] text-faint">
                      ↑ {t('ranking.strongest')}: {r.top.map(dimLabel).join(', ')}
                      {r.low && (
                        <>
                          {' · ↓ '}
                          {t('ranking.weakest')}: {dimLabel(r.low)}
                        </>
                      )}
                    </span>
                  )}
                </span>
                <span className="w-12 text-right">
                  {r.score !== null ? (
                    <>
                      <span className="block font-mono text-lg font-semibold leading-none tabular-nums text-ink">
                        {score100(r.score)}
                      </span>
                      <ScoreBar score={r.score} className="mt-1.5" />
                    </>
                  ) : (
                    <span className="font-mono text-sm text-faint">–</span>
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
