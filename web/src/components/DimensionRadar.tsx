import { useState } from 'react'
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { Body, Site, Target } from '../data/schema'
import type { Model } from '../data/model'
import { useI18n } from '../i18n'
import { formatValue } from '../lib/format'
import { radarMeasurements } from '../lib/radar'
import { BODIES } from '../map/bodies'

function wrapAxis(label: string): string[] {
  const max = 16
  if (label.length <= max) return [label]
  const split = label.lastIndexOf(' ', max)
  const first = split > 0 ? label.slice(0, split) : label.slice(0, max)
  const rest = label.slice(first.length).trimStart()
  return [first, rest.length > max ? `${rest.slice(0, max - 1)}…` : rest]
}

function SeriesLabel({ body, name }: { body: Body; name: string }) {
  const { t } = useI18n()
  return (
    <span className="flex min-w-0 items-center gap-1.5 text-xs">
      <svg className="shrink-0" width="22" height="10" viewBox="0 0 24 10" fill="none" aria-hidden="true"
        style={{ color: BODIES[body].color }}>
        <path d="M1 5h22" stroke="currentColor" strokeWidth="2" strokeDasharray={body === 'earth' ? undefined : '4 3'} />
        {body === 'earth' ? <circle cx="12" cy="5" r="3" fill="currentColor" /> : (
          <path d="M12 2l3 3-3 3-3-3z" fill="white" stroke="currentColor" strokeWidth="1.5" />
        )}
      </svg>
      <span className="min-w-0 truncate">
        <strong className="font-semibold" style={{ color: BODIES[body].color }}>{t(`body.${body}`)}</strong>
        <span className="text-muted"> · {name}</span>
      </span>
    </span>
  )
}

export default function DimensionRadar({ model, site, target }: { model: Model; site: Site; target: Target }) {
  const { t, lang } = useI18n()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [chartWidth, setChartWidth] = useState(0)
  const data = radarMeasurements(
    model.dimensions, [...model.file.sites, ...model.file.targets], site.values, target.values,
  )
  const byId = new Map(data.map((item) => [item.id, item]))
  const selected = (selectedId && byId.get(selectedId)) || data[0]

  if (data.length < 3) return <p className="mt-2 text-xs text-muted">{t('radar.empty')}</p>

  const earthColor = BODIES.earth.color
  const targetColor = BODIES[target.body].color
  // Reserva hasta 96 px para las etiquetas a cada lado del gráfico.
  const radius = Math.max(32, Math.min(67, (chartWidth - 192) / 2))

  return (
    <figure aria-label={t('radar.title')} className="@container [&_.recharts-surface:focus]:outline-none">
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <SeriesLabel body="earth" name={site.name} />
        <SeriesLabel body={target.body} name={target.name} />
      </div>
      <ResponsiveContainer width="100%" height={200} onResize={setChartWidth}>
        <RadarChart outerRadius={radius} data={data} accessibilityLayer={false}
          onClick={({ activeLabel }) => {
            if (typeof activeLabel === 'string' && byId.has(activeLabel)) setSelectedId(activeLabel)
          }}
        >
          <Tooltip content={() => null} cursor={false} />
          <PolarGrid stroke="var(--color-line)" />
          <PolarAngleAxis dataKey="id" tick={({ x, y, textAnchor, payload }) => {
            const id = String(payload.value)
            const label = byId.get(id)?.dimension.label[lang] ?? id
            const lines = wrapAxis(label)
            const active = id === selected.id
            return (
              <text x={x} y={y} textAnchor={textAnchor} dominantBaseline="central"
                fill={active ? 'var(--color-ink)' : 'var(--color-muted)'} fontSize={10} fontWeight={active ? 700 : 500}
                className="cursor-pointer"
                onClick={(event) => { event.stopPropagation(); setSelectedId(id) }}
              >
                <title>{label}</title>
                {lines.map((line, index) => <tspan key={index} x={x} dy={index === 0 ? -(lines.length - 1) * 5.5 : 11}>{line}</tspan>)}
              </text>
            )
          }} />
          <PolarRadiusAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={false} axisLine={false} />
          <Radar name={site.name} dataKey="earthPosition" stroke={earthColor} strokeWidth={2} fill={earthColor} fillOpacity={0.14}
            isAnimationActive={false} dot={{ r: 3, fill: earthColor, stroke: 'white', strokeWidth: 1 }} />
          <Radar name={target.name} dataKey="targetPosition" stroke={targetColor} strokeWidth={2} strokeDasharray="5 3"
            fill={targetColor} fillOpacity={0.09} isAnimationActive={false}
            dot={({ cx, cy }) => (
              <rect x={-2.8} y={-2.8} width={5.6} height={5.6} transform={`translate(${cx} ${cy}) rotate(45)`}
                fill="white" stroke={targetColor} strokeWidth="1.5" />
            )} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="grid items-end gap-x-3 gap-y-2 @min-[22rem]:grid-cols-[minmax(0,1fr)_auto]">
        <label className="min-w-0">
          <span className="sr-only">{t('table.dimension')}</span>
          <select value={selected.id} onChange={(event) => setSelectedId(event.target.value)}
            className="block min-h-10 w-full min-w-0 rounded-md border border-line bg-surface px-2 py-1 text-base font-medium text-ink sm:text-[13px]">
            {data.map(({ id, dimension }) => <option key={id} value={id}>{dimension.label[lang]}</option>)}
          </select>
        </label>
        <dl aria-live="polite" className="grid grid-cols-2 gap-3 text-[11px]">
          <div style={{ color: earthColor }}>
            <dt>{t('body.earth')}</dt>
            <dd className="font-mono text-[13px] font-semibold">{formatValue(selected.earth, selected.dimension, lang)}</dd>
          </div>
          <div style={{ color: targetColor }}>
            <dt>{t(`body.${target.body}`)}</dt>
            <dd className="font-mono text-[13px] font-semibold">{formatValue(selected.target, selected.dimension, lang)}</dd>
          </div>
        </dl>
      </div>
      <figcaption className="mt-1.5 text-[11px] leading-snug text-faint">{t('radar.scale')}</figcaption>
    </figure>
  )
}
