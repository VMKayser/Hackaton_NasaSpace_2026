import type { Model } from '../data/model'
import type { Target } from '../data/schema'
import { useI18n } from '../i18n'
import { coverage } from '../lib/coverage'
import type { DataLevel } from '../lib/coverage'
import { formatNumber, formatPercent, formatValue } from '../lib/format'
import { SourceLinks } from './SourceLinks'

const LEVEL_MARK: Record<DataLevel, string> = { complete: '●', partial: '◐', insufficient: '○' }
const LEVEL_TONE: Record<DataLevel, string> = {
  complete: 'text-ink',
  partial: 'text-ink',
  insufficient: 'text-rust',
}

/** Qué parte del peso de las dimensiones tiene medición en el objetivo, con los pesos activos. */
export function DataLevelNote({ model, target, weights }: { model: Model; target: Target; weights: Record<string, number> }) {
  const { t, lang } = useI18n()
  const minCoverage = model.file.meta.minCoverage
  const c = coverage(model.dimensions, weights, target.values, minCoverage)
  const missing = c.missing.map((id) => model.dimensionById.get(id)?.label[lang] ?? id).join(', ')
  const text =
    c.level === 'complete'
      ? t('data.complete')
      : t(c.level === 'partial' ? 'data.partial' : 'data.insufficient', {
          pct: formatPercent(c.share, lang),
          min: minCoverage === undefined ? '' : formatPercent(minCoverage, lang),
          missing,
        })
  return (
    <p className={`mt-1.5 flex gap-1.5 text-xs leading-snug ${LEVEL_TONE[c.level]}`}>
      <span aria-hidden="true" className="text-earth">{LEVEL_MARK[c.level]}</span>
      <span>{text}</span>
    </p>
  )
}

export function TargetMeasurements({ model, target }: { model: Model; target: Target }) {
  const { t, lang } = useI18n()
  const measurements = model.dimensions.map((dimension) => ({
    dimension,
    value: formatValue(target.values[dimension.id], dimension, lang),
  }))
  const available = measurements.filter(({ value }) => value !== null)
  const context = target.context ?? []
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

      {context.length > 0 && (
        <section className="mt-3">
          <h3 className="text-xs font-semibold text-ink">{t('target.context')}</h3>
          <p className="mt-0.5 text-xs leading-snug text-muted">{t('target.contextLead')}</p>
          <table className="mt-1 w-full border-collapse text-[13px] wrap-anywhere">
            <thead className="sr-only">
              <tr><th scope="col">{t('table.dimension')}</th><th scope="col">{t('table.measurement')}</th></tr>
            </thead>
            {context.map((item) => {
              const value =
                item.value === null
                  ? null
                  : typeof item.value === 'number'
                    ? `${formatNumber(item.value, lang)}${item.unit ? (item.unit.startsWith('°') ? item.unit : ` ${item.unit}`) : ''}`
                    : item.value
              return (
                <tbody key={item.id} className="border-t border-line/70">
                  <tr className="align-top">
                    <th scope="row" className="pb-0.5 pr-2 pt-2 text-left font-medium">{item.label[lang]}</th>
                    <td className="pb-0.5 pt-2 text-right font-mono tabular-nums">
                      {value ?? <span className="font-sans text-xs italic text-muted">{t('value.noData')}</span>}
                    </td>
                  </tr>
                  <tr><td colSpan={2} className="pb-2">
                    {item.note && <p className="text-xs leading-snug text-muted">{item.note[lang]}</p>}
                    <SourceLinks sources={item.sources} />
                  </td></tr>
                </tbody>
              )
            })}
          </table>
        </section>
      )}
    </div>
  )
}
