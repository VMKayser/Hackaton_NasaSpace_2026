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
  const overview = available.slice(0, 3)

  return (
    <section className="mt-4 border-t border-line pt-3">
      {overview.length > 0 && (
        <dl className="grid auto-cols-fr grid-flow-col divide-x divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {overview.map(({ dimension, value }) => (
            <div key={dimension.id} className="flex min-w-0 flex-col-reverse justify-end px-2 py-2.5 sm:px-3">
              <dt className="mt-1 break-words text-[11px] leading-snug text-muted">{dimension.label[lang]}</dt>
              <dd className="break-words font-mono text-sm font-semibold tabular-nums text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <details className="mt-2">
        <summary className="cursor-pointer rounded py-1.5 text-sm font-semibold text-earth">
          {t('target.measurements')}
          <span className="ml-2 text-[11px] font-normal text-muted">
            {t('target.measurementCount', { n: available.length, total: measurements.length })}
          </span>
        </summary>
        <table className="mt-1 w-full border-collapse text-sm">
          <thead className="sr-only">
            <tr><th scope="col">{t('table.dimension')}</th><th scope="col">{t('table.measurement')}</th></tr>
          </thead>
          {measurements.map(({ dimension, value }) => (
            <tbody key={dimension.id} className="border-t border-line">
              <tr className="align-top">
                <th scope="row" className="py-2 pr-2 text-left font-medium">{dimension.label[lang]}</th>
                <td className="py-2 text-right font-mono tabular-nums">
                  {value ?? <span className="font-sans text-xs italic text-muted">{t('value.noData')}</span>}
                </td>
              </tr>
              <tr><td colSpan={2} className="pb-2">
                <SourceLinks sources={dimension.sources.filter((source) => !source.body || source.body === target.body)} />
              </td></tr>
            </tbody>
          ))}
        </table>
      </details>
    </section>
  )
}
