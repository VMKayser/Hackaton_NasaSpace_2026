import type { Model } from '../data/model'
import type { Purpose } from '../data/schema'
import { useI18n } from '../i18n'
import { formatPercent } from '../lib/format'
import { activeWeights } from '../lib/ranking'

export function ScoreMethod({ model, purpose }: { model: Model; purpose: Purpose | null }) {
  const { t, lang } = useI18n()
  const generalWeights = activeWeights(model.file, null)
  const purposeWeights = purpose ? activeWeights(model.file, purpose) : null
  const generalTotal = Object.values(generalWeights).reduce((sum, weight) => sum + weight, 0)
  const purposeTotal = Object.values(purposeWeights ?? {}).reduce((sum, weight) => sum + weight, 0)
  const displayWeight = (weight: number, total: number) => total > 0 ? formatPercent(weight / total, lang) : t('value.noData')
  const method = model.file.meta.scoring?.[lang]?.trim()

  return (
    <details className="mt-2 text-xs">
      <summary className="cursor-pointer rounded py-1 font-semibold text-earth">{t('method.title')}</summary>
      <div className="mt-1 space-y-2 rounded-md border border-line bg-surface p-3 leading-relaxed text-muted">
        <p>{t('method.source')}</p>
        <p>{method || t('method.unavailable')}</p>
        <p>{t('method.missing')}</p>
        <table className="w-full table-fixed border-collapse text-left wrap-anywhere">
          <caption className="pb-1 text-left font-semibold text-ink">{t('method.weights')}</caption>
          <thead>
            <tr className="border-b border-line text-[11px]">
              <th scope="col" className="w-[46%] py-1 pr-2">{t('table.dimension')}</th>
              <th scope="col" className="px-1 py-1 text-right">{t('detail.similarity')}</th>
              {purposeWeights && <th scope="col" className="py-1 pl-1 text-right">{t('ranking.purposeShort')}</th>}
            </tr>
          </thead>
          <tbody>
            {model.dimensions.map((dim) => (
              <tr key={dim.id} className="border-b border-line/70 last:border-0">
                <th scope="row" className="py-1 pr-2 font-medium">{dim.label[lang]}</th>
                <td className="px-1 py-1 text-right tabular-nums">{displayWeight(generalWeights[dim.id] ?? 0, generalTotal)}</td>
                {purposeWeights && <td className="py-1 pl-1 text-right tabular-nums">{displayWeight(purposeWeights[dim.id] ?? 0, purposeTotal)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}
