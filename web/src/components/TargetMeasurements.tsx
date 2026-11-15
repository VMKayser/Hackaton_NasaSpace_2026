import type { Model } from '../data/model'
import type { Target } from '../data/schema'
import { useI18n } from '../i18n'
import { formatValue } from '../lib/format'
import { SourceLinks } from './SourceLinks'

export function TargetMeasurements({ model, target }: { model: Model; target: Target }) {
  const { t, lang } = useI18n()
  const measurements = model.dimensions.map((dimension) => ({
    dimension,
    value: formatValue(target.values[dimension.id], dimension, lang),
  }))
  const available = measurements.filter(({ value }) => value !== null)
  return (
    <div className="mt-2">
      <p className="text-xs text-muted">{t('target.measurementCount', { n: available.length, total: measurements.length })}</p>
      <table className="mt-1 w-full border-collapse text-[13px] wrap-anywhere">
        <thead className="sr-only">
          <tr><th scope="col">{t('table.dimension')}</th><th scope="col">{t('table.measurement')}</th></tr>
        </thead>
        {measurements.map(({ dimension, value }) => (
          <tbody key={dimension.id} className="border-t border-line/70">
            <tr className="align-top">
              <th scope="row" className="pb-0.5 pr-2 pt-2 text-left font-medium">{dimension.label[lang]}</th>
              <td className="pb-0.5 pt-2 text-right font-mono tabular-nums">
                {value ?? <span className="font-sans text-xs italic text-muted">{t('value.noData')}</span>}
              </td>
            </tr>
            <tr><td colSpan={2} className="pb-2">
              <SourceLinks sources={dimension.sources.filter((source) => !source.body || source.body === target.body)} />
            </td></tr>
          </tbody>
        ))}
      </table>
    </div>
  )
}
