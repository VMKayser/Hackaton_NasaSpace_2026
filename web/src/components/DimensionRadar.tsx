import { useState } from 'react'
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, Tooltip } from 'recharts'
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
    <div className="flex min-w-0 items-start gap-2 rounded-lg border border-line bg-surface px-2.5 py-2">
      <svg className="mt-1 shrink-0" width="24" height="10" viewBox="0 0 24 10" fill="none" aria-hidden="true"
        style={{ color: BODIES[body].color }}>
        <path d="M1 5h22" stroke="currentColor" strokeWidth="2" strokeDasharray={body === 'earth' ? undefined : '4 3'} />
        {body === 'earth' ? <circle cx="12" cy="5" r="3" fill="currentColor" /> : (
          <path d="M12 2l3 3-3 3-3-3z" fill="white" stroke="currentColor" strokeWidth="1.5" />
        )}
      </svg>
      <span>
        <strong className="block text-[11px] leading-tight" style={{ color: BODIES[body].color }}>{t(`body.${body}`)}</strong>
        <span className="mt-0.5 block break-words text-xs font-medium leading-snug text-ink">{name}</span>
      </span>
    </div>
  )
}

export default function DimensionRadar({ model, site, target }: { model: Model; site: Site; target: Target }) {
  const { t, lang } = useI18n()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const data = radarMeasurements(
    model.dimensions, [...model.file.sites, ...model.file.targets], site.values, target.values,
  )
  const byId = new Map(data.map((item) => [item.id, item]))
  const selected = (selectedId && byId.get(selectedId)) || data[0]

  if (data.length < 3) return <p className="mt-2 text-xs text-muted">{t('radar.empty')}</p>

  const earthColor = BODIES.earth.color
  const targetColor = BODIES[target.body].color

  return (
    <figure aria-label={t('radar.title')} className="[&_.recharts-surface:focus]:outline-none">
      <div className="mt-3 grid grid-cols-2 gap-2">
        <SeriesLabel body="earth" name={site.name} />
        <SeriesLabel body={target.body} name={target.name} />
      </div>
      <RadarChart responsive width="100%" height={200} outerRadius="72%" data={data} accessibilityLayer={false}
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
      <div className="rounded-lg border border-line bg-surface px-2.5 py-2">
        <label className="block">
          <span className="text-[11px] font-medium text-muted">{t('table.dimension')}</span>
          <select value={selected.id} onChange={(event) => setSelectedId(event.target.value)}
            className="mt-0.5 block w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm font-medium text-ink">
            {data.map(({ id, dimension }) => <option key={id} value={id}>{dimension.label[lang]}</option>)}
          </select>
        </label>
        <dl aria-live="polite" className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div style={{ color: earthColor }}>
            <dt>{t('body.earth')}</dt>
            <dd className="font-mono text-sm font-semibold">{formatValue(selected.earth, selected.dimension, lang)}</dd>
          </div>
          <div style={{ color: targetColor }}>
            <dt>{t(`body.${target.body}`)}</dt>
            <dd className="font-mono text-sm font-semibold">{formatValue(selected.target, selected.dimension, lang)}</dd>
          </div>
        </dl>
      </div>
      <figcaption className="mt-2 text-[11px] leading-snug text-muted">{t('radar.scale')}</figcaption>
    </figure>
  )
}
