import type { Model } from '../data/model'
import { siteText } from '../data/model'
import type { Target } from '../data/schema'
import { useI18n } from '../i18n'
import { formatValue, score100 } from '../lib/format'
import type { RankedSite, ScoreMode } from '../lib/ranking'
import { MAX_COMPARE } from '../lib/state'
import { SourceLinks } from './SourceLinks'
import { BackButton, BodyChip, Pending, SiteBadges } from './ui'

export function ComparisonPanel({ model, target, rows, ids, mode, onChange, onBack }: {
  model: Model
  target: Target
  rows: RankedSite[]
  ids: string[]
  mode: ScoreMode
  onChange: (ids: string[]) => void
  onBack: () => void
}) {
  const { t, lang } = useI18n()
  const selected = ids.flatMap((id) => {
    const row = rows.find(({ site }) => site.id === id)
    return row ? [row] : []
  })
  const noData = <span className="text-xs italic text-muted">{t('value.noData')}</span>

  return (
    <article className="px-5 pb-8 pt-4 sm:px-7">
      <BackButton onClick={onBack}>{t('nav.backToRanking')}</BackButton>
      <h1 className="mt-3 font-serif text-2xl font-semibold">{t('compare.title')}</h1>
      <p className="mt-1 text-sm text-muted">{t('compare.hint')}</p>

      <div className="mt-4 grid gap-2">
        {Array.from({ length: Math.min(MAX_COMPARE, selected.length + 1) }, (_, index) => {
          const current = selected[index]?.site.id ?? ''
          return (
            <label key={index} className="grid grid-cols-[3.5rem_1fr] items-center gap-2 text-xs font-medium text-muted">
              <span>{t('compare.site', { n: index + 1 })}</span>
              <select
                className="min-w-0 rounded-md border border-line bg-surface px-2 py-2 text-sm text-ink"
                value={current}
                onChange={(event) => {
                  const next = [...ids]
                  const id = event.target.value
                  if (id) next[index] = id
                  else next.splice(index, 1)
                  onChange(next)
                }}
              >
                <option value="">{t('compare.choose')}</option>
                {rows.filter(({ site }) => site.id === current || !ids.includes(site.id)).map(({ site }) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </label>
          )
        })}
      </div>

      {selected.length >= 2 && (
        <div className="mt-5 overflow-x-auto rounded-xl border border-line" tabIndex={0} role="region" aria-label={t('detail.evidence')}>
          <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
            <caption className="sr-only">{t('detail.evidence')}</caption>
            <thead className="bg-paper">
              <tr className="align-top">
                <th scope="col" className="p-2">{t('table.dimension')}</th>
                <th scope="col" className="min-w-24 p-2">
                  {target.name} <BodyChip body={target.body} />
                </th>
                {selected.map(({ site, score }) => (
                  <th key={site.id} scope="col" className="min-w-24 p-2">
                    <span className="block">{site.name}</span>
                    <SiteBadges site={site} evaluated={score !== null} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-line">
                <th scope="row" className="p-2">{t(mode === 'purpose' ? 'detail.purposeScore' : 'detail.similarity')}</th>
                <td className="p-2" />
                {selected.map(({ site, score }) => (
                  <td key={site.id} className="p-2 font-mono">{score === null ? t('badge.notEvaluated') : `${score100(score)} / 100`}</td>
                ))}
              </tr>
            </tbody>
            {model.dimensions.map((dimension) => (
              <tbody key={dimension.id} className="border-t border-line">
                <tr className="align-top">
                  <th scope="row" className="p-2 font-medium">{dimension.label[lang]}</th>
                  <td className="p-2 text-muted">{formatValue(target.values[dimension.id], dimension, lang) ?? noData}</td>
                  {selected.map(({ site }) => (
                    <td key={site.id} className="p-2">{formatValue(site.values[dimension.id], dimension, lang) ?? noData}</td>
                  ))}
                </tr>
                <tr><td colSpan={selected.length + 2} className="px-2 pb-2"><SourceLinks sources={dimension.sources} /></td></tr>
              </tbody>
            ))}
            <tbody>
              <tr className="border-t border-caution/20 bg-caution-soft align-top">
                <th scope="row" className="p-2 text-caution">{t('detail.limits')}</th>
                <td className="p-2 text-xs text-caution">{t(`limits.general.${target.body}`)}</td>
                {selected.map(({ site }) => (
                  <td key={site.id} className="p-2 text-xs">{siteText(model, site, 'limits', lang) ?? <Pending />}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </article>
  )
}
