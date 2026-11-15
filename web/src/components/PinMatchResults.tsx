import type { ReactNode } from 'react'
import type { Model } from '../data/model'
import type { Body } from '../data/schema'
import { useI18n } from '../i18n'
import { formatNumber, formatPercent } from '../lib/format'
import type { DimensionMatch } from '../lib/terrainMatch'
import { BODIES } from '../map/bodies'
import { scoreColor } from '../map/colors'
import { ScoreBar } from './ui'

// Resultado del parecido de relieve de un pin: primero el detalle de lo medido en el punto (cada dimensión
// con su peso), luego el más parecido con su desglose y al final los demás, cada uno con su detalle.

export interface MatchItem {
  id: string
  name: string
  /** Chip del cuerpo, forma del sitio u otra marca. */
  mark: ReactNode
  /** Línea secundaria: tipo y lugar del sitio, resumen del objetivo. */
  sub?: string | null
  similarity: number
  dimensions: DimensionMatch[]
  action: ReactNode
}

interface Props {
  model: Model
  /** Cuerpo del punto medido y de los resultados, para los colores de las marcas. */
  pointBody: Body
  itemBody: (item: MatchItem) => Body
  items: MatchItem[]
  othersTitle: string
}

function useValueFormat() {
  const { lang } = useI18n()
  return (v: number, unit: string | null) => {
    const n = formatNumber(Math.abs(v) >= 10 ? Math.round(v * 10) / 10 : v, lang)
    return unit === '°' ? `${n}°` : unit ? `${n} ${unit}` : n
  }
}

function ScoreRing({ score, size = 88 }: { score: number; size?: number }) {
  const { lang } = useI18n()
  const r = 30
  const c = 2 * Math.PI * r
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden="true" className="absolute inset-0">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--color-line)" strokeWidth="7" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={scoreColor(score)}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${c * Math.max(0.002, Math.min(1, score))} ${c}`}
          transform="rotate(-90 36 36)"
          className="transition-[stroke-dasharray] duration-700"
        />
      </svg>
      <span className="relative text-[14px] font-bold leading-none tracking-tight tabular-nums text-ink">{formatPercent(score, lang)}</span>
    </span>
  )
}

/** Detalle de lo medido en el punto: una tarjeta por dimensión de relieve, con su peso. */
function PointDetail({ model, dims, color }: { model: Model; dims: DimensionMatch[]; color: string }) {
  const { t, lang } = useI18n()
  const fmt = useValueFormat()
  const total = dims.reduce((s, d) => s + d.weight, 0)
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">{t('pin.detail')}</h3>
      <p className="mt-0.5 text-[11px] leading-snug text-muted">{t('pin.detailLead')}</p>
      {/* En teléfonos angostos, una fila por dimensión (nombre a la izquierda, valor a la derecha); desde 400 px, tres tarjetas. */}
      <ul className="mt-2 grid grid-cols-1 gap-1.5 min-[400px]:grid-cols-3">
        {dims.map((d) => (
          <li key={d.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-2 rounded-lg border border-line bg-surface px-2 py-2 min-[400px]:block" style={{ borderTop: `3px solid ${color}` }}>
            <span className="block text-[11px] font-medium leading-tight text-muted">{model.dimensionById.get(d.id)?.label[lang] ?? d.id}</span>
            <span className="block text-right font-mono text-[15px] font-semibold tabular-nums text-ink min-[400px]:mt-1 min-[400px]:text-left">{fmt(d.point, d.unit)}</span>
            {total > 0 && <span className="col-span-2 mt-0.5 block text-[10px] text-faint">{t('pin.weight', { pct: formatPercent(d.weight / total, lang) })}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Una dimensión: barra de la escala con la marca del punto (círculo) y la del resultado (rombo). */
function DimensionRow({ model, d, name, pointColor, itemColor }: { model: Model; d: DimensionMatch; name: string; pointColor: string; itemColor: string }) {
  const { t, lang } = useI18n()
  const fmt = useValueFormat()
  const label = model.dimensionById.get(d.id)?.label[lang] ?? d.id
  const pos = (v: number) => (d.lo === null || d.hi === null || d.hi <= d.lo ? 0.5 : Math.min(1, Math.max(0, (v - d.lo) / (d.hi - d.lo))))
  const a = pos(d.point)
  const b = d.value === null ? null : pos(d.value)
  return (
    <li>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-ink">{label}</span>
        <span className="font-semibold tabular-nums text-ink">
          {d.similarity === null ? <span className="font-normal italic text-muted">{t('value.noData')}</span> : formatPercent(d.similarity, lang)}
        </span>
      </div>
      <div className="relative mx-1.5 mt-2 h-1.5 rounded-full bg-line/80" aria-hidden="true">
        {b !== null && (
          <div className="absolute inset-y-0 rounded-full bg-ink/25" style={{ left: `${Math.min(a, b) * 100}%`, width: `${Math.abs(a - b) * 100}%` }} />
        )}
        {/* Anillo para el punto y rombo sólido para el resultado: si coinciden, el rombo queda dentro del anillo. */}
        <span
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] bg-surface/40"
          style={{ left: `${a * 100}%`, borderColor: pointColor }}
        />
        {b !== null && (
          <span
            className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45"
            style={{ left: `${b * 100}%`, background: itemColor }}
          />
        )}
      </div>
      <div className="mt-1.5 flex flex-wrap justify-between gap-x-3 font-mono text-[11px] tabular-nums">
        <span style={{ color: pointColor }}>
          <span aria-hidden="true">○ </span>{fmt(d.point, d.unit)} · {t('pin.thisPoint')}
        </span>
        <span className="min-w-0 truncate" style={{ color: itemColor }}>
          <span aria-hidden="true">◆ </span>{d.value === null ? t('value.noData') : fmt(d.value, d.unit)} · {name}
        </span>
      </div>
    </li>
  )
}

function Breakdown({ model, item, pointColor, itemColor }: { model: Model; item: MatchItem; pointColor: string; itemColor: string }) {
  return (
    <ul className="space-y-3">
      {item.dimensions.map((d) => (
        <DimensionRow key={d.id} model={model} d={d} name={item.name} pointColor={pointColor} itemColor={itemColor} />
      ))}
    </ul>
  )
}

export function PinMatchResults({ model, pointBody, itemBody, items, othersTitle }: Props) {
  const { t, lang } = useI18n()
  const [best, ...others] = items
  if (!best) return null
  const pointColor = BODIES[pointBody].color
  const colorOf = (item: MatchItem) => BODIES[itemBody(item)].color

  return (
    <div className="mt-3 space-y-4">
      <PointDetail model={model} dims={best.dimensions} color={pointColor} />

      <div className="rounded-xl border border-line bg-surface p-3 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-rust">{t('pin.best')}</p>
        <div className="mt-2 flex items-center gap-3">
          <ScoreRing score={best.similarity} />
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-1.5">{best.mark}</p>
            <p className="mt-1 font-serif text-lg font-semibold leading-tight wrap-anywhere text-ink">{best.name}</p>
            {best.sub && <p className="mt-0.5 text-xs leading-snug text-muted">{best.sub}</p>}
            <div className="mt-1.5">{best.action}</div>
          </div>
        </div>
        <h3 className="mt-3 border-t border-line pt-2.5 text-xs font-semibold text-muted">{t('pin.breakdown')}</h3>
        <div className="mt-2">
          <Breakdown model={model} item={best} pointColor={pointColor} itemColor={colorOf(best)} />
        </div>
      </div>

      {others.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">{othersTitle}</h3>
          <ol className="mt-1.5 divide-y divide-line rounded-xl border border-line bg-surface">
            {others.map((item, i) => (
              <li key={item.id} className="px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 shrink-0 text-right font-mono text-xs text-muted">{i + 2}</span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5">
                      <span className="shrink-0">{item.mark}</span>
                      <span className="min-w-0 text-sm font-semibold leading-snug wrap-anywhere text-ink">{item.name}</span>
                    </p>
                    {item.sub && <p className="mt-0.5 truncate text-[11px] text-muted">{item.sub}</p>}
                    <ScoreBar score={item.similarity} className="mt-1.5 h-1.5" />
                  </div>
                  <span className="w-14 shrink-0 text-right text-base font-bold tabular-nums text-ink">
                    {formatPercent(item.similarity, lang)}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-start justify-between gap-x-3 pl-6">
                  <details className="group min-w-0 flex-1">
                    <summary className="cursor-pointer list-none py-1 text-[11px] font-semibold text-earth">
                      <span className="inline-block transition group-open:rotate-90" aria-hidden="true">›</span> {t('pin.breakdownShow')}
                    </summary>
                    <div className="mt-1.5 pb-1">
                      <Breakdown model={model} item={item} pointColor={pointColor} itemColor={colorOf(item)} />
                    </div>
                  </details>
                  <div className="shrink-0">{item.action}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
      <p className="text-[11px] leading-snug text-muted">{t('pin.scaleNote')}</p>
    </div>
  )
}
