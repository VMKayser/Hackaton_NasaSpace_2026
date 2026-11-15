import type { Model } from '../data/model'
import { siteText } from '../data/model'
import type { Purpose, Target } from '../data/schema'
import { useI18n } from '../i18n'
import { discoveredSummary, discoveredToSite, resolveRankedSite } from '../lib/discovered'
import { formatPercent, formatValue } from '../lib/format'
import { rankSite } from '../lib/ranking'
import type { RankedSite, ScoreMode } from '../lib/ranking'
import { MAX_COMPARE } from '../lib/state'
import { SourceLinks } from './SourceLinks'
import { BackButton, BodyChip, Pending, ScoreBar, SiteBadges } from './ui'
import { ScoreMethod } from './ScoreMethod'

const ROW_HEADER = 'sticky left-0 z-10 w-28 border-r border-line p-2'

export function ComparisonPanel({ model, target, rows, ids, mode, purpose, onChange, onBack }: {
  model: Model
  target: Target
  rows: RankedSite[]
  ids: string[]
  mode: ScoreMode
  purpose: Purpose | null
  onChange: (ids: string[]) => void
  onBack: () => void
}) {
  const { t, lang } = useI18n()
  const nearPlace = (place: string) => t('discover.near', { place })
  const selected = ids.flatMap((id) => {
    const row = resolveRankedSite(model, rows, id, target.id, purpose, nearPlace)
    return row ? [row] : []
  })
  const foundRows = [...model.foundById.values()]
    .map((point) => rankSite(model.file, discoveredToSite(point, nearPlace), target.id, purpose))
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
  const noData = <span className="text-xs italic text-muted">{t('value.noData')}</span>
  const totals = [
    { label: 'detail.similarity', key: 'similarity' },
    ...(mode === 'purpose' ? [{ label: 'detail.purposeScore', key: 'score' } as const] : []),
  ] as const

  return (
    <article className="@container px-5 pb-8 pt-3 sm:px-7">
      <BackButton onClick={onBack}>{t('nav.backToRanking')}</BackButton>
      <h1 className="mt-2 font-serif text-[1.55rem] font-semibold leading-tight">{t('compare.title')}</h1>
      <p className="mt-1 text-[13px] text-muted">{t('compare.hint')}</p>

      <div className="mt-4 grid gap-2">
        {Array.from({ length: Math.min(MAX_COMPARE, selected.length + 1) }, (_, index) => {
          const current = selected[index]?.site.id ?? ''
          return (
            <label key={index} className="grid grid-cols-[3.5rem_1fr] items-center gap-2 text-xs font-medium text-muted">
              <span>{t('compare.site', { n: index + 1 })}</span>
              <select
                className="min-h-11 min-w-0 rounded-md border border-line bg-surface px-2 py-2 text-base text-ink sm:text-sm"
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
                {foundRows.some(({ site }) => site.id === current || !ids.includes(site.id)) && (
                  <optgroup label={t('discover.title')}>
                    {foundRows.filter(({ site }) => site.id === current || !ids.includes(site.id)).map(({ site }) => (
                      <option key={site.id} value={site.id}>{site.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </label>
          )
        })}
      </div>

      {selected.length >= 2 && (
        <div className="mt-5">
          <p className={`mb-2 text-xs text-muted ${selected.length === 2 ? '@min-[29rem]:hidden' : '@min-[36rem]:hidden'}`}>{t('compare.scroll')}</p>
          <div className="relative isolate max-h-[max(14rem,58dvh)] overflow-auto overscroll-x-contain rounded-md border border-line" tabIndex={0} role="region" aria-label={t('detail.evidence')}>
            <table className={`gm-comparison-table w-full table-fixed border-separate border-spacing-0 text-left text-sm wrap-anywhere ${selected.length === 2 ? 'min-w-[29rem]' : 'min-w-[36rem]'}`}>
              <caption className="sr-only">{t('detail.evidence')}</caption>
              <thead className="sticky top-0 z-20 bg-paper text-xs">
                <tr className="align-top">
                  <th scope="col" className={`${ROW_HEADER} border-b bg-paper font-semibold text-muted`}>{t('table.dimension')}</th>
                  <th scope="col" className="border-b border-line p-2">
                    {target.name} <BodyChip body={target.body} />
                  </th>
                  {selected.map(({ site, score }) => (
                    <th key={site.id} scope="col" className="border-b border-line p-2">
                      <span className="block">{site.name}</span>
                      <SiteBadges site={site} evaluated={score !== null} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {totals.map(({ label, key }) => (
                  <tr key={key} className="bg-paper align-middle">
                    <th scope="row" className={`${ROW_HEADER} bg-paper text-xs`}>{t(label)}</th>
                    <td />
                    {selected.map((row) => {
                      const score = row[key]
                      return (
                        <td key={row.site.id} className="p-2">
                          {score === null ? <span className="text-xs text-muted">{t('badge.notEvaluated')}</span> : (
                            <>
                              <span className={`text-2xl font-bold tracking-tight tabular-nums ${key === 'similarity' ? 'text-rust' : 'text-ink'}`}>
                                {formatPercent(score, lang)}
                              </span>
                              <ScoreBar score={score} className="mt-1" />
                            </>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
              {model.dimensions.map((dimension) => (
                <tbody key={dimension.id}>
                  <tr className="align-top">
                    <th scope="row" rowSpan={2} className={`${ROW_HEADER} bg-surface font-medium`}>{dimension.label[lang]}</th>
                    <td className="p-2 text-muted">{formatValue(target.values[dimension.id], dimension, lang) ?? noData}</td>
                    {selected.map(({ site, dimensions }) => {
                      const score = dimensions[dimension.id] ?? null
                      return (
                        <td key={site.id} className="p-2">
                          <span className="block">{formatValue(site.values[dimension.id], dimension, lang) ?? noData}</span>
                          <span className="mt-1 block text-[11px] leading-snug text-muted">{t('detail.dimensionScore')}</span>
                          {score === null ? noData : (
                            <>
                              <strong className="text-base tabular-nums text-rust">{formatPercent(score, lang)}</strong>
                              <ScoreBar score={score} className="mt-1" />
                            </>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                  <tr><td colSpan={selected.length + 1} className="px-2 pb-2"><SourceLinks sources={dimension.sources} /></td></tr>
                </tbody>
              ))}
              <tbody>
                <tr className="bg-caution-soft align-top">
                  <th scope="row" className={`${ROW_HEADER} bg-caution-soft text-caution`}>{t('detail.limits')}</th>
                  <td className="p-2 text-xs text-caution">{t(`limits.general.${target.body}`)}</td>
                  {selected.map((row) => (
                    <td key={row.site.id} className="p-2 text-xs">
                      {siteText(model, row.site, 'limits', lang) ?? (row.site.found ? discoveredSummary(model, row, t, lang).limits : <Pending />)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <ScoreMethod model={model} purpose={mode === 'purpose' ? purpose : null} />
        </div>
      )}
    </article>
  )
}
