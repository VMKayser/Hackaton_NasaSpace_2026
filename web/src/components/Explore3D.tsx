import type { FeatureCollection } from 'geojson'
import { AttributionControl, LngLat, Map as MlMap } from 'maplibre-gl'
import type {
  ControlPosition,
  GeoJSONSource,
  JumpToOptions,
  MapLibreEvent,
  RasterTileSource,
  SkySpecification,
  StyleSpecification,
} from 'maplibre-gl'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react'
import type { Model } from '../data/model'
import { siteText } from '../data/model'
import type { Dimension, Purpose, Target } from '../data/schema'
import { LANGS, useI18n } from '../i18n'
import type { Lang } from '../i18n'
import { discoveredSummary } from '../lib/discovered'
import { formatCoords, formatNumber, formatPercent, formatValue } from '../lib/format'
import type { RankedSite, ScoreMode } from '../lib/ranking'
import { activeWeights, scoredCount } from '../lib/ranking'
import {
  circleRing,
  EARTH_RADIUS_KM,
  likeness,
  proportionalExaggeration,
  RELATIVE_RAMP,
  sameScaleZoom,
  SLOPE_RAMP,
  terrainMaxZoom,
} from '../lib/terrain'
import type { Lens, Likeness, RampStop } from '../lib/terrain'
import { BODIES } from '../map/bodies'
import { scoreColor } from '../map/colors'
import { IMAGERY, MARS_DETAIL } from '../map/planetaryImagery'
import type { Planet } from '../map/planetaryImagery'
import { loadTrack, planetElevationAt, regionPoint, terrainAt } from '../map/planetTerrain'
import { measurePins } from '../map/pinMeasure'
import type { PinMeasurement } from '../map/pinMeasure'
import { STEEP_DEG } from '../lib/patch'
import type { PatchStats } from '../lib/patch'
import type { TerrainRegion, TrackData } from '../map/planetTerrain'
import { EARTH_LENS_MAX_ZOOM, elevationAtPoint } from '../map/reliefLens'
import { hasWebgl2, prefersReducedMotion } from '../map/runtime'
import { baseStyle, DEM_SOURCE } from '../map/style'
import '../map/planetTiles'
import { boundsOf, profileStats, resample, transplant } from '../lib/route'
import type { LonLat } from '../lib/route'
import { STEEP_THRESHOLDS } from '../lib/route'
import { RouteProfile } from './RouteProfile'
import type { RouteProfileData } from './RouteProfile'
import { BodyChip, Pending, ScoreBar, ScoreSummary } from './ui'

// Vista inmersiva: el sitio de la Tierra y el objetivo, con relieve real, a la misma escala horizontal
// y con la misma exageración vertical. Las cámaras giran juntas. Las capas de comparación (pendiente y
// relieve relativo) se calculan del relieve mostrado, con la misma rampa de color en los dos mapas.

const VISUAL_EXAGGERATION = 1.5
const PITCH = 72
const ORBIT_DEG_PER_S = 5
const LENSES: Lens[] = ['imagery', 'slope', 'relative']
const LENS_LAYERS = { slope: 'lens-slope', relative: 'lens-relative' } as const
const GROUPS: Likeness[] = ['similar', 'partial', 'different', 'noData']
const TRACK_LAYERS = ['track-glow', 'track-line', 'track-stops']

// Disposición de los dos mapas: lado a lado, o uno sobre otro con una cortina o con transparencia.
// Apilados, los dos mapas tienen el mismo tamaño y se mueven juntos, también al desplazarse.
type Layout = 'side' | 'swipe' | 'blend'
const LAYOUTS: Layout[] = ['side', 'swipe', 'blend']
const attributionCorner = (layout: Layout, i: number): ControlPosition =>
  layout === 'side' ? 'top-right' : i === 0 ? 'bottom-left' : 'bottom-right'
const clamp100 = (v: number) => Math.min(100, Math.max(0, v))
// Color de cada lado en toda la vista (fichas, cortina, mediciones y tono por cuerpo).
const EARTH_TINT = '#9cc7ec'
const OTHER_TINT = '#f2b48c'
// Tono por cuerpo: colores saturados que suman blanco (0, 0,55, 1) + (1, 0,45, 0), para que en la
// superposición lo que es claro en los dos lados se vea blanco y no de un color.
const TONES = ['#008cff', '#ff7300'] as const
// Vaivén automático: amplitud (en %) y periodo de la cortina y de la superposición.
const SWING = { split: { amp: 42, ms: 8000 }, mix: { amp: 50, ms: 6000 } } as const
type Motion = keyof typeof SWING
const ease = (k: number) => (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2)

// Recorrido guiado: qué se muestra en cada paso y cuánto dura. En los pasos apilados (cortina y
// superposición) la división o la mezcla se mueven solas mientras dura el paso.
type TourStep = 'overview' | 'close' | 'swipe' | 'blend' | 'slope' | 'relative' | 'route' | 'conditions'
const TOUR_ORDER: TourStep[] = ['overview', 'close', 'swipe', 'blend', 'slope', 'relative', 'route', 'conditions']
interface TourConfig { lens: Lens; layout: Layout; tone: boolean; route: boolean; panel: boolean; orbit: boolean; ms: number }
const SIDE = { layout: 'side', tone: false } as const
const TOUR: Record<TourStep, TourConfig> = {
  overview: { ...SIDE, lens: 'imagery', route: false, panel: false, orbit: true, ms: 7000 },
  close: { ...SIDE, lens: 'imagery', route: false, panel: false, orbit: true, ms: 8000 },
  swipe: { lens: 'imagery', layout: 'swipe', tone: false, route: false, panel: false, orbit: true, ms: 10000 },
  blend: { lens: 'imagery', layout: 'blend', tone: true, route: false, panel: false, orbit: true, ms: 10000 },
  slope: { ...SIDE, lens: 'slope', route: false, panel: false, orbit: true, ms: 7000 },
  relative: { ...SIDE, lens: 'relative', route: false, panel: false, orbit: true, ms: 7000 },
  route: { ...SIDE, lens: 'imagery', route: true, panel: false, orbit: false, ms: 11000 },
  conditions: { ...SIDE, lens: 'imagery', route: false, panel: true, orbit: true, ms: 8000 },
}
const PROFILE_STEP_M = 100

/** Ruta del rover: real (degradado por sol) o trasladada a la Tierra (discontinua). */
function trackLayers(simulated: boolean): StyleSpecification['layers'] {
  const layout = { 'line-join': 'round' as const, 'line-cap': 'round' as const, visibility: 'none' as const }
  return [
    { id: 'track-glow', type: 'line', source: 'track', layout, paint: { 'line-color': simulated ? '#7dd3fc' : '#fde68a', 'line-width': 9, 'line-blur': 6, 'line-opacity': 0.45 } },
    {
      id: 'track-line',
      type: 'line',
      source: 'track',
      layout,
      paint: simulated
        ? { 'line-color': '#e0f2fe', 'line-width': 2.4, 'line-dasharray': [2, 1.4] }
        : { 'line-width': 2.6, 'line-gradient': ['interpolate', ['linear'], ['line-progress'], 0, '#fde68a', 1, '#38bdf8'] },
    },
  ]
}

const SKIES: Record<'earth' | Planet, SkySpecification> = {
  earth: {
    'sky-color': '#2f6cb3',
    'horizon-color': '#cfe0ee',
    'fog-color': '#dfe9f1',
    'sky-horizon-blend': 0.6,
    'horizon-fog-blend': 0.7,
    'fog-ground-blend': 0.75,
  },
  mars: {
    'sky-color': '#b98a63',
    'horizon-color': '#e6c7a2',
    'fog-color': '#d8b58f',
    'sky-horizon-blend': 0.7,
    'horizon-fog-blend': 0.75,
    'fog-ground-blend': 0.7,
  },
  moon: {
    'sky-color': '#03060c',
    'horizon-color': '#1a1f29',
    'fog-color': '#0b0f16',
    'sky-horizon-blend': 0.3,
    'horizon-fog-blend': 0.3,
    'fog-ground-blend': 0.9,
  },
}

type Fc = FeatureCollection
const ring = (lon: number, lat: number, km: number, r: number): Fc => ({
  type: 'FeatureCollection',
  features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: circleRing(lon, lat, km, r) } }],
})
const dot = (lon: number, lat: number): Fc => ({
  type: 'FeatureCollection',
  features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [lon, lat] } }],
})
const lensUrl = (body: 'earth' | Planet, targetId: string, lens: keyof typeof LENS_LAYERS, lon: number, lat: number) =>
  `relief-lens://${body}/${targetId}/${lens}/${lon}/${lat}/{z}/{x}/{y}`

function areaLayers(color: string, dashed: boolean): StyleSpecification['layers'] {
  return [
    { id: 'area-glow', type: 'line', source: 'area', paint: { 'line-color': color, 'line-width': 12, 'line-blur': 8, 'line-opacity': dashed ? 0.35 : 0.55 } },
    { id: 'area-line', type: 'line', source: 'area', paint: { 'line-color': '#fff7ee', 'line-width': 2.2, ...(dashed ? { 'line-dasharray': [3, 2] } : {}) } },
    {
      id: 'site-dot',
      type: 'circle',
      source: 'site',
      paint: { 'circle-radius': 7, 'circle-color': color, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2.5, 'circle-pitch-alignment': 'viewport' },
    },
  ]
}

function lensLayers(): StyleSpecification['layers'] {
  return (Object.values(LENS_LAYERS) as string[]).map((id) => ({
    id,
    type: 'raster' as const,
    source: id,
    layout: { visibility: 'none' as const },
    paint: { 'raster-opacity': 0.82, 'raster-fade-duration': 0 },
  }))
}

function earthStyle(lon: number, lat: number, radiusKm: number, color: string): StyleSpecification {
  const { gibs, s2 } = baseStyle.sources
  const lens = (l: keyof typeof LENS_LAYERS) => ({ type: 'raster' as const, tiles: [lensUrl('earth', '-', l, lon, lat)], tileSize: 256, maxzoom: EARTH_LENS_MAX_ZOOM })
  return {
    version: 8,
    projection: { type: 'mercator' },
    sky: SKIES.earth,
    sources: {
      gibs,
      s2: { ...(s2 as object), maxzoom: 14 } as typeof s2,
      // Hasta z12 (SRTM de 30 m): por encima solo se amplía, y así se evitan picos sueltos sobre el agua.
      [DEM_SOURCE]: { ...(baseStyle.sources[DEM_SOURCE] as object), maxzoom: 12 } as typeof baseStyle.sources[typeof DEM_SOURCE],
      [LENS_LAYERS.slope]: lens('slope'),
      [LENS_LAYERS.relative]: lens('relative'),
      area: { type: 'geojson', data: ring(lon, lat, radiusKm, EARTH_RADIUS_KM) },
      site: { type: 'geojson', data: dot(lon, lat) },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#dfe9f1' } },
      { id: 'gibs', type: 'raster', source: 'gibs', maxzoom: 9 },
      { id: 's2', type: 'raster', source: 's2', minzoom: 7, paint: { 'raster-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 8.5, 1] } },
      ...lensLayers(),
      ...areaLayers(color, false),
    ],
  }
}

function planetStyle(body: Planet, region: TerrainRegion | null, target: Target, radiusKm: number): StyleSpecification {
  const info = IMAGERY[body]
  const credit = [
    `<a href="${info.mapUrl}" target="_blank" rel="noopener">${info.mapCredit}</a>`,
    ...(region?.sources ?? []).map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a> (${s.agency})`),
  ].join(' · ')
  // Marco local del polo sur: las teselas orbitales no corresponden a esas coordenadas; la «imagen» es el
  // sombreado del mismo relieve de LOLA.
  const local = !!region?.frame
  const style: StyleSpecification = {
    version: 8,
    projection: { type: 'mercator' },
    sky: SKIES[body],
    sources: {
      ...(local ? {} : { imagery: { type: 'raster' as const, tiles: [`planet-trek://${body}/{z}/{x}/{y}`], tileSize: 256, maxzoom: info.maxLevel + 1, attribution: credit } }),
      area: { type: 'geojson', data: ring(target.lon, target.lat, radiusKm, BODIES[body].radiusKm) },
      site: { type: 'geojson', data: dot(target.lon, target.lat) },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': local ? '#8d8d8d' : SKIES[body]['fog-color'] as string } },
      ...(local ? [] : [{ id: 'imagery', type: 'raster' as const, source: 'imagery', paint: { 'raster-contrast': 0.12, 'raster-fade-duration': 0 } }]),
    ],
  }
  if (local && region) {
    const maxzoom = terrainMaxZoom(region.grids.map((g) => g.resolutionM), BODIES[body].radiusKm)
    style.sources.shade = {
      type: 'raster-dem',
      tiles: [`planet-dem://${body}/${region.targetId}/{z}/{x}/{y}`],
      encoding: 'terrarium',
      tileSize: 256,
      maxzoom,
      attribution: (region.sources ?? []).map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a> (${s.agency})`).join(' · '),
    }
    style.layers.push({
      id: 'shade',
      type: 'hillshade',
      source: 'shade',
      paint: { 'hillshade-exaggeration': 1, 'hillshade-shadow-color': '#0b0b0c', 'hillshade-highlight-color': '#ffffff', 'hillshade-accent-color': '#3f3f42' },
    })
  }
  if (body === 'mars') {
    style.sources.detail = {
      type: 'raster',
      tiles: ['planet-trek://mars-ctx/{z}/{x}/{y}'],
      tileSize: 512,
      maxzoom: MARS_DETAIL.maxZoom,
      attribution: `<a href="${MARS_DETAIL.source}" target="_blank" rel="noopener">${MARS_DETAIL.credit}</a>`,
    }
    style.layers.push({
      id: 'detail',
      type: 'raster',
      source: 'detail',
      minzoom: MARS_DETAIL.startZoom,
      paint: {
        'raster-opacity': ['interpolate', ['linear'], ['zoom'], MARS_DETAIL.startZoom, 0, MARS_DETAIL.startZoom + 0.7, 0.82],
        'raster-fade-duration': 0,
      },
    })
  }
  if (region) {
    const maxzoom = terrainMaxZoom(region.grids.map((g) => g.resolutionM), BODIES[body].radiusKm)
    style.sources[DEM_SOURCE] = { type: 'raster-dem', tiles: [`planet-dem://${body}/${region.targetId}/{z}/{x}/{y}`], encoding: 'terrarium', tileSize: 256, maxzoom }
    for (const l of ['slope', 'relative'] as const) {
      style.sources[LENS_LAYERS[l]] = { type: 'raster', tiles: [lensUrl(body, region.targetId, l, target.lon, target.lat)], tileSize: 256, maxzoom }
    }
    style.layers.push(...lensLayers())
  }
  style.layers.push(...areaLayers('#ffd1a3', true))
  return style
}

/** Zoom para que el círculo del área quepa en la dimensión más corta del mapa. */
function framingZoom(lat: number, radiusKm: number, container: HTMLElement): number {
  const kmPerPxAtZ0 = (2 * Math.PI * EARTH_RADIUS_KM * Math.cos((lat * Math.PI) / 180)) / 256
  const size = Math.min(container.clientWidth, container.clientHeight)
  const wantKmPerPx = (radiusKm * 6.5) / Math.max(160, size)
  return Math.min(13, Math.max(10, Math.log2(kmPerPxAtZ0 / wantKmPerPx)))
}

function RampLegend({ ramp, unit }: { ramp: RampStop[]; unit: string }) {
  const min = ramp[0][0]
  const max = ramp[ramp.length - 1][0]
  const gradient = `linear-gradient(90deg, ${ramp.map(([v, c]) => `${c} ${((v - min) / (max - min)) * 100}%`).join(', ')})`
  return (
    <div>
      <div className="h-2 rounded-full" style={{ background: gradient }} />
      <div className="mt-0.5 flex justify-between font-mono text-[10px] text-white/70">
        <span>{min > 0 ? '+' : ''}{min}{unit}</span>
        <span>{ramp[Math.floor(ramp.length / 2)][0]}{unit}</span>
        <span>{max > 0 ? '+' : ''}{max}{unit}+</span>
      </div>
    </div>
  )
}

/**
 * División de la cortina: se arrastra o se mueve con las flechas. A la izquierda, la Tierra. La posición
 * dibujada sale de la variable CSS `--split` del área (así se anima sin volver a pintar React).
 */
function SwipeDivider({ value, onChange, area, label, valueText, earthName, otherName }: {
  value: number
  onChange: (v: number) => void
  area: RefObject<HTMLDivElement | null>
  label: string
  valueText: string
  earthName: string
  otherName: string
}) {
  const fromPointer = (x: number) => {
    const rect = area.current?.getBoundingClientRect()
    if (rect && rect.width > 0) onChange(clamp100(((x - rect.left) / rect.width) * 100))
  }
  const onKeyDown = (e: ReactKeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2
    const next: Record<string, number> = {
      ArrowLeft: value - step,
      ArrowDown: value - step,
      ArrowRight: value + step,
      ArrowUp: value + step,
      PageDown: value - 10,
      PageUp: value + 10,
      Home: 0,
      End: 100,
    }
    if (!(e.key in next)) return
    e.preventDefault()
    onChange(clamp100(next[e.key]))
  }
  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      aria-valuetext={valueText}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        fromPointer(e.clientX)
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e.clientX)
      }}
      onKeyDown={onKeyDown}
      className="group absolute inset-y-0 z-10 w-8 -translate-x-1/2 cursor-ew-resize touch-none select-none"
      style={{ left: 'var(--split)', outline: 'none' }}
    >
      {/* Línea con el brillo de cada lado en el color de su cuerpo. */}
      <div
        className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white"
        style={{ boxShadow: `-3px 0 10px ${EARTH_TINT}cc, 3px 0 10px ${OTHER_TINT}cc, 0 0 2px #0b1726` }}
      />
      <div
        className="absolute left-1/2 top-1/2 flex h-10 w-12 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full text-ink shadow-[0_4px_14px_rgba(11,23,38,0.55)] ring-2 ring-white group-focus-visible:ring-4 group-focus-visible:ring-[#fde68a]"
        aria-hidden="true"
      >
        <span className="grid flex-1 place-items-center text-base font-bold" style={{ background: EARTH_TINT }}>‹</span>
        <span className="grid flex-1 place-items-center text-base font-bold" style={{ background: OTHER_TINT }}>›</span>
      </div>
      {/* Etiquetas que viajan con la cortina; en los extremos salen del área y se recortan. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-[calc(50%+1.9rem)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold text-ink shadow-lg"
        style={{ background: EARTH_TINT }}
      >
        {earthName}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[calc(50%+1.9rem)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold text-ink shadow-lg"
        style={{ background: OTHER_TINT }}
      >
        {otherName}
      </span>
    </div>
  )
}

function ConditionRow({ dim, row, target, counted }: { dim: Dimension; row: RankedSite; target: Target; counted: boolean }) {
  const { t, lang } = useI18n()
  const s = row.dimensions[dim.id] ?? null
  const earth = formatValue(row.site.values[dim.id], dim, lang)
  const other = formatValue(target.values[dim.id], dim, lang)
  const none = <span className="font-sans italic text-white/45">{t('value.noData')}</span>
  return (
    <li className="py-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] text-white">{dim.label[lang]}</span>
        <span className="shrink-0 text-xs tabular-nums text-white">{s === null ? t('value.noData') : formatPercent(s, lang)}</span>
      </div>
      <div className="mt-0.5 flex gap-3 font-mono text-xs tabular-nums">
        <span style={{ color: '#9cc7ec' }}>{earth ?? none}</span>
        <span style={{ color: '#f2b48c' }}>{other ?? none}</span>
        {!counted && <span className="ml-auto font-sans text-[10px] italic text-white/45">{t('explore.cond.context')}</span>}
      </div>
      <ScoreBar score={s} className="mt-1 !bg-white/10" />
    </li>
  )
}

function ConditionsPanel({ model, row, target, purpose, mode }: { model: Model; row: RankedSite; target: Target; purpose: Purpose | null; mode: ScoreMode }) {
  const { t, lang } = useI18n()
  const weights = activeWeights(model.file, mode === 'purpose' ? purpose : null)
  const dims = [...model.dimensions].sort((a, b) => (weights[b.id] ?? 0) - (weights[a.id] ?? 0))
  const { scored, total } = scoredCount(model.file, row.dimensions)
  const limits = siteText(model, row.site, 'limits', lang) ?? (row.site.found ? discoveredSummary(model, row, t, lang).limits : null)
  const groupClass: Record<Likeness, string> = {
    similar: 'text-[#8fd6a8]',
    partial: 'text-[#f3d27a]',
    different: 'text-[#f29b8a]',
    noData: 'text-white/55',
  }
  return (
    <div className="space-y-5 p-4">
      <section className="rounded-xl bg-white/[0.06] p-3">
        <ScoreSummary similarity={row.similarity} purposeScore={mode === 'purpose' ? row.score : undefined} dark />
        <p className="mt-2 text-[11px] text-white/55">{t('detail.dimsScored', { n: scored, total })}</p>
      </section>

      {GROUPS.map((g) => {
        const items = dims.filter((d) => likeness(row.dimensions[d.id] ?? null) === g)
        if (!items.length) return null
        return (
          <section key={g}>
            <h3 className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${groupClass[g]}`}>
              {t(`explore.cond.${g}`)} · {items.length}
            </h3>
            <ul className="mt-1 divide-y divide-white/10">
              {items.map((d) => (
                <ConditionRow key={d.id} dim={d} row={row} target={target} counted={(weights[d.id] ?? 0) > 0} />
              ))}
            </ul>
          </section>
        )
      })}
      <p className="text-[10px] leading-snug text-white/45">{t('explore.cond.thresholds')}</p>

      <section className="rounded-xl border border-[#f3d27a]/25 bg-[#f3d27a]/[0.07] p-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#f3d27a]">{t('detail.limits')}</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-white/90">{limits ?? <Pending />}</p>
        <p className="mt-2 text-xs leading-relaxed text-white/65">{t(`limits.general.${target.body}`)}</p>
      </section>
    </div>
  )
}

interface Props {
  model: Model
  /** Sitios con puntaje, en el orden del ranking, para navegar sin salir de la vista. */
  rows: RankedSite[]
  row: RankedSite
  target: Target
  purpose: Purpose | null
  mode: ScoreMode
  onSite: (id: string) => void
  onLang: (lang: Lang) => void
  onClose: () => void
  /**
   * Pin libre: el sitio y el objetivo son puntos elegidos en el mapa, sin puntajes. Se ocultan la
   * navegación del ranking y las condiciones, y se muestran la pendiente y el relieve medidos.
   */
  free?: boolean
}

export function Explore3D({ model, rows, row, target, purpose, mode, onSite, onLang, onClose, free = false }: Props) {
  const { t, lang } = useI18n()
  const { site } = row
  const body = target.body as Planet
  const earthRef = useRef<HTMLDivElement>(null)
  const planetRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const conditionsRef = useRef<HTMLElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)
  const maps = useRef<{ earth: MlMap | null; planet: MlMap | null }>({ earth: null, planet: null })
  const attributions = useRef<AttributionControl[]>([])
  // Vista y tono elegidos por el usuario; durante el recorrido guiado manda el paso actual.
  const [layoutChoice, setLayoutChoice] = useState<Layout>('side')
  const [split, setSplit] = useState(50)
  const [mix, setMix] = useState(50)
  // Tono por cuerpo: cada mapa en el color de su lado (solo con la capa de imagen; las capas de
  // pendiente y relieve ya usan su propia rampa de color).
  const [toneChoice, setToneChoice] = useState(false)
  const [looping, setLooping] = useState(false)
  // Valores dibujados de la cortina y de la mezcla. Las animaciones escriben las variables CSS del área
  // en cada cuadro y el estado de React recibe el valor final al terminar.
  const live = useRef<Record<Motion, number>>({ split: 50, mix: 50 })
  const motion = useRef<number | null>(null)
  const mixInput = useRef<HTMLInputElement>(null)
  const show = useCallback((key: Motion, v: number) => {
    live.current[key] = v
    areaRef.current?.style.setProperty(key === 'split' ? '--split' : '--mix', key === 'split' ? `${v}%` : String(v / 100))
    // El deslizador de la mezcla no lo controla React, para que siga la animación sin volver atrás.
    if (key === 'mix' && mixInput.current) mixInput.current.value = String(Math.round(v))
  }, [])
  const commitMotion = useCallback(() => {
    setSplit(Math.round(live.current.split))
    setMix(Math.round(live.current.mix))
  }, [])
  const halt = useCallback(() => {
    if (motion.current === null) return
    cancelAnimationFrame(motion.current)
    motion.current = null
    commitMotion()
  }, [commitMotion])
  /** Corre `frame` en cada cuadro hasta que devuelva false. */
  const run = useCallback((frame: (ms: number) => boolean) => {
    if (motion.current !== null) cancelAnimationFrame(motion.current)
    // El reloj empieza en el primer cuadro: al cambiar de vista los mapas se redimensionan y ese
    // cuadro puede tardar; contando desde el clic, la transición se saltaría.
    let start = -1
    const tick = (now: number) => {
      if (start < 0) start = now
      if (frame(now - start)) {
        motion.current = requestAnimationFrame(tick)
      } else {
        motion.current = null
        commitMotion()
      }
    }
    motion.current = requestAnimationFrame(tick)
  }, [commitMotion])
  /** Lleva la cortina o la mezcla a `to`, con una transición corta salvo con movimiento reducido. */
  const glide = useCallback((key: Motion, to: number, ms = 700, from = live.current[key]) => {
    setLooping(false)
    if (prefersReducedMotion()) {
      halt()
      show(key, to)
      commitMotion()
      return
    }
    show(key, from)
    run((t) => {
      const k = Math.min(1, t / ms)
      show(key, from + (to - from) * ease(k))
      return k < 1
    })
  }, [halt, show, commitMotion, run])
  /** Vaivén continuo desde la posición actual. */
  const swing = useCallback((key: Motion) => {
    const { amp, ms } = SWING[key]
    const phase = Math.asin(Math.min(1, Math.max(-1, (live.current[key] - 50) / amp)))
    run((t) => {
      show(key, 50 + amp * Math.sin(phase + (2 * Math.PI * t) / ms))
      return true
    })
  }, [run, show])
  useEffect(() => () => {
    if (motion.current !== null) cancelAnimationFrame(motion.current)
  }, [])
  const [orbiting, setOrbiting] = useState(() => !prefersReducedMotion())
  const [webgl] = useState(hasWebgl2)
  const orbitRef = useRef(orbiting)
  const [ready, setReady] = useState(false)
  // Relieve del objetivo, guardado con la clave del punto para el que se cargó: mientras llega el de un
  // punto nuevo, la región es undefined y los mapas esperan (no se usa el relieve de otro lugar).
  const [regionState, setRegionState] = useState<{ key: string; region: TerrainRegion | null } | null>(null)
  const radiusKm = site.radiusKm ?? 3
  // Detalle a resolución completa alrededor del círculo cuando el relieve sale del modelo global.
  const detailKm = Math.max(12, Math.ceil(radiusKm) + 4)
  const regionKey = `${body}|${target.id}|${target.lon}|${target.lat}|${detailKm}`
  const region = regionState?.key === regionKey ? regionState.region : undefined
  /** Posición del objetivo en el mapa: la real, o la del marco local del polo sur (tools/moon_polar.py). */
  const at = useMemo(() => (region?.frame ? regionPoint(region, target.lon, target.lat) : { lon: target.lon, lat: target.lat }), [region, target.lon, target.lat])
  // Elección del usuario; durante el recorrido guiado manda el paso actual.
  const [lensChoice, setLensChoice] = useState<Lens>('imagery')
  const [panelChoice, setPanelChoice] = useState(() => window.innerWidth >= 1024)
  const [routeChoice, setRouteChoice] = useState(false)
  const [tour, setTour] = useState<number | null>(null)
  const framedFor = useRef('')
  const track = region?.tracks?.[0] ?? null
  const trackKey = track ? `${body}|${track.file}` : ''
  const [trackState, setTrackState] = useState<{ key: string; data: TrackData } | null>(null)
  const trackData = trackState?.key === trackKey ? trackState.data : null
  // El perfil se guarda con la clave del sitio para el que se calculó; si no coincide, se está calculando.
  const [profileState, setProfileState] = useState<{ key: string; data: RouteProfileData } | null>(null)
  const profileKey = `${site.id}|${target.id}`
  const profile = profileState?.key === profileKey ? profileState.data : null
  const tourSteps = useMemo(
    () => TOUR_ORDER.filter((step) => (step !== 'route' || track) && (step !== 'conditions' || !free)),
    [track, free],
  )
  const tourStep = tour === null ? null : (tourSteps[tour] ?? null)
  const lens: Lens = tourStep ? TOUR[tourStep].lens : lensChoice
  const layout: Layout = tourStep ? TOUR[tourStep].layout : layoutChoice
  const layoutRef = useRef(layout)
  const stacked = layout !== 'side'
  const tone = tourStep ? TOUR[tourStep].tone : toneChoice
  const toned = tone && lens === 'imagery'
  // En los pasos apilados del recorrido la cortina o la mezcla se mueven solas (ver el efecto del recorrido).
  const swinging = tourStep ? stacked && !prefersReducedMotion() : looping
  const route = tourStep ? TOUR[tourStep].route && !!track : routeChoice
  const panelOpen = !free && (tourStep ? TOUR[tourStep].panel : panelChoice)
  /**
   * Un gesto del usuario durante el recorrido lo detiene y conserva lo que se ve (vista y tono): así,
   * al arrastrar la cortina en el paso de la cortina, la vista no salta a la que había antes.
   */
  const takeOver = () => {
    if (tour === null) return
    setLayoutChoice(layout)
    setToneChoice(tone)
    setTour(null)
  }
  const setLens = (l: Lens) => {
    takeOver()
    setLensChoice(l)
  }
  const setRoute = (next: (r: boolean) => boolean) => {
    takeOver()
    setRouteChoice(next(route))
  }
  const setPanelOpen = (next: (o: boolean) => boolean) => {
    takeOver()
    setPanelChoice(next(panelOpen))
  }
  const setTone = (on: boolean) => {
    takeOver()
    setToneChoice(on)
  }
  /** Cambio hecho por el usuario (arrastre, teclado o deslizador): detiene cualquier animación. */
  const userSet = (key: Motion, v: number) => {
    takeOver()
    halt()
    setLooping(false)
    show(key, v)
    if (key === 'split') setSplit(v)
    else setMix(v)
  }
  const toggleSwing = () => {
    takeOver()
    if (swinging) {
      halt()
      setLooping(false)
    } else if (stacked) {
      swing(layout === 'swipe' ? 'split' : 'mix')
      setLooping(true)
    }
  }
  // Al elegir una vista apilada, el otro cuerpo entra con una transición: la cortina se desliza desde
  // la derecha o la superposición aparece poco a poco hasta la mitad.
  const chooseLayout = (next: Layout) => {
    if (next === layout) return
    takeOver()
    halt()
    setLooping(false)
    if (next === 'swipe') glide('split', 50, 1100, 100)
    if (next === 'blend') glide('mix', 50, 900, 0)
    setLayoutChoice(next)
  }
  /** Mezcla hasta un extremo (botones «solo Tierra» y «solo {body}»). */
  const mixTo = (v: number) => {
    takeOver()
    glide('mix', v, 500)
  }
  const [centres, setCentres] = useState<{ earth: number | null; planet: number | null } | null>(null)
  const offsetRef = useRef(0)
  const shownSite = useRef<string | null>(null)
  const latest = useRef(row)
  // El objetivo de un pin se vuelve a crear al cambiar de idioma (su nombre cambia); los mapas solo
  // dependen de su id y sus coordenadas, para no recargarlos por eso.
  const latestTarget = useRef(target)
  const targetKey = `${target.id}|${target.lon}|${target.lat}`
  useEffect(() => {
    latest.current = row
    layoutRef.current = layout
    latestTarget.current = target
  })
  // Pin libre: pendiente y relieve medidos igual que en el panel del pin.
  const [pinStats, setPinStats] = useState<{ key: string; data: PinMeasurement } | null>(null)
  const statsKey = `${site.lon}|${site.lat}|${target.lon}|${target.lat}|${body}|${radiusKm}`
  const measured = free && pinStats?.key === statsKey ? pinStats.data : null
  const color = scoreColor(row.score)
  const evaluated = useMemo(() => rows.filter((r) => r.score !== null), [rows])
  const navRows = useMemo(
    () => (!free && row.site.found && !evaluated.some((r) => r.site.id === site.id) ? [row, ...evaluated] : evaluated),
    [free, evaluated, row, site.id],
  )
  const index = navRows.findIndex((r) => r.site.id === site.id)

  // Tres dimensiones con más peso que tengan valor en los dos lados, para la franja inferior.
  const keyDims = useMemo(() => {
    const weights = activeWeights(model.file, mode === 'purpose' ? purpose : null)
    return model.dimensions
      .filter((d) => (weights[d.id] ?? 0) > 0)
      .sort((a, b) => (weights[b.id] ?? 0) - (weights[a.id] ?? 0))
      .filter((d) => formatValue(site.values[d.id], d, lang) !== null && formatValue(target.values[d.id], d, lang) !== null)
      .slice(0, 3)
  }, [model, purpose, mode, site, target, lang])

  useEffect(() => {
    closeRef.current?.focus()
    // En fase de captura, para que Escape cierre solo esta vista y no también la ficha de abajo.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      onClose()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  useEffect(() => {
    if (panelOpen) conditionsRef.current?.scrollIntoView({ block: 'nearest' })
  }, [panelOpen])

  useEffect(() => {
    let alive = true
    // La región del manifiesto que contiene el punto o, si no hay, una ventana del modelo global de USGS.
    terrainAt(body, target.lon, target.lat, target.id, detailKm)
      .then((r) => alive && setRegionState({ key: regionKey, region: r }))
      .catch(() => alive && setRegionState({ key: regionKey, region: null }))
    return () => {
      alive = false
    }
  }, [body, target.id, target.lon, target.lat, detailKm, regionKey])

  useEffect(() => {
    if (!free) return
    let alive = true
    measurePins({ lon: site.lon, lat: site.lat }, { lon: target.lon, lat: target.lat }, body, radiusKm)
      .then((data) => alive && setPinStats({ key: statsKey, data }))
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [free, statsKey, site.lon, site.lat, target.lon, target.lat, body, radiusKm])

  // Los dos mapas se crean una vez por objetivo. Cambiar de sitio solo mueve la cámara de la Tierra.
  useEffect(() => {
    if (!webgl || region === undefined || !earthRef.current || !planetRef.current) return
    const first = latest.current.site
    const target = { ...latestTarget.current, ...(region ? regionPoint(region, latestTarget.current.lon, latestTarget.current.lat) : {}) }
    const firstRadius = first.radiusKm ?? 3
    const reduced = prefersReducedMotion()
    const zEarth = framingZoom(first.lat, firstRadius, earthRef.current)
    const zPlanet = sameScaleZoom(zEarth, first.lat, target.lat, BODIES[body].radiusKm)
    offsetRef.current = zPlanet - zEarth
    shownSite.current = first.id
    framedFor.current = `${first.id}|${layoutRef.current}`

    const common = { attributionControl: false, maxPitch: 85, fadeDuration: 0 } as const
    const earth = new MlMap({
      ...common,
      container: earthRef.current,
      style: earthStyle(first.lon, first.lat, firstRadius, scoreColor(latest.current.score)),
      center: [first.lon, first.lat],
      zoom: zEarth - 4,
    })
    const planet = new MlMap({
      ...common,
      container: planetRef.current,
      style: planetStyle(body, region, target, firstRadius),
      center: [target.lon, target.lat],
      zoom: zPlanet - 4,
    })
    maps.current = { earth, planet }
    // Atribución plegada. Lado a lado va arriba a la derecha, para dejar libre la parte de abajo;
    // apilados, cada mapa la pone en una esquina inferior para que se vean las dos.
    attributions.current = [earth, planet].map((m, i) => {
      const control = new AttributionControl({ compact: true })
      m.addControl(control, attributionCorner(layoutRef.current, i))
      return control
    })
    const planetRadius = BODIES[body].radiusKm

    let loaded = 0
    let raf = 0
    let last = 0
    const spin = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      if (orbitRef.current && !earth.isMoving() && !planet.isMoving()) {
        const bearing = earth.getBearing() + ORBIT_DEG_PER_S * dt
        earth.setBearing(bearing)
        planet.setBearing(bearing)
      }
      raf = requestAnimationFrame(spin)
    }
    const onLoad = () => {
      loaded += 1
      if (loaded < 2) return
      earth.setTerrain({ source: DEM_SOURCE, exaggeration: VISUAL_EXAGGERATION })
      if (region) planet.setTerrain({ source: DEM_SOURCE, exaggeration: proportionalExaggeration(BODIES[body].radiusKm, VISUAL_EXAGGERATION) })
      setReady(true)
      const flight = { pitch: PITCH, bearing: -20, duration: reduced ? 0 : 5000, essential: true, curve: 1.3 }
      earth.flyTo({ ...flight, center: [first.lon, first.lat], zoom: zEarth })
      planet.flyTo({ ...flight, center: [target.lon, target.lat], zoom: zPlanet })
      // El bucle corre desde ya y no gira mientras haya un vuelo; así no depende de que llegue un
      // `moveend` (con movimiento reducido el vuelo dura 0 ms y el evento podía perderse).
      last = performance.now()
      raf = requestAnimationFrame(spin)
    }
    earth.once('load', onLoad)
    planet.once('load', onLoad)

    // Lo que hace el usuario en un mapa se copia en el otro: rumbo, inclinación y zoom a la misma escala.
    // Con los mapas apilados también se copia el desplazamiento, en metros reales, para que sigan
    // superpuestos. Lado a lado cada mapa conserva su centro.
    const stopOrbit = () => {
      orbitRef.current = false
      setOrbiting(false)
    }
    const lastCentre = new Map<MlMap, LngLat>()
    const mirror = (from: MlMap, to: MlMap, sign: 1 | -1, fromRadius: number, toRadius: number) => (e: MapLibreEvent<unknown>) => {
      const before = lastCentre.get(from)
      const now = from.getCenter()
      lastCentre.set(from, now)
      if (!e.originalEvent) return
      const camera: JumpToOptions = { bearing: from.getBearing(), pitch: from.getPitch(), zoom: from.getZoom() + sign * offsetRef.current }
      if (layoutRef.current !== 'side' && before) {
        const c = to.getCenter()
        camera.center = transplant([[now.lng, now.lat]], [before.lng, before.lat], fromRadius, [c.lng, c.lat], toRadius)[0]
      }
      to.jumpTo(camera)
    }
    earth.on('move', mirror(earth, planet, 1, EARTH_RADIUS_KM, planetRadius))
    planet.on('move', mirror(planet, earth, -1, planetRadius, EARTH_RADIUS_KM))
    // Solo un gesto del usuario detiene el giro. `setBearing` (el propio giro) y `flyTo` también
    // disparan `rotatestart`, pero sin `originalEvent`: antes el giro se apagaba en su primer cuadro.
    const byUser = (e: MapLibreEvent<unknown>) => {
      if (e.originalEvent) stopOrbit()
    }
    for (const m of [earth, planet]) {
      m.on('dragstart', byUser)
      m.on('rotatestart', byUser)
      m.on('pitchstart', byUser)
    }

    return () => {
      cancelAnimationFrame(raf)
      earth.remove()
      planet.remove()
      maps.current = { earth: null, planet: null }
      attributions.current = []
      setReady(false)
    }
  }, [webgl, region, targetKey, body])

  // Datos del sitio de la Tierra al cambiar de sitio: anillo, punto y centro del relieve relativo.
  useEffect(() => {
    const { earth, planet } = maps.current
    if (!ready || !earth || !planet || shownSite.current === site.id) return
    shownSite.current = site.id
    ;(earth.getSource('area') as GeoJSONSource).setData(ring(site.lon, site.lat, radiusKm, EARTH_RADIUS_KM))
    ;(earth.getSource('site') as GeoJSONSource).setData(dot(site.lon, site.lat))
    ;(earth.getSource(LENS_LAYERS.relative) as RasterTileSource).setTiles([lensUrl('earth', '-', 'relative', site.lon, site.lat)])
    earth.setPaintProperty('site-dot', 'circle-color', color)
    ;(planet.getSource('area') as GeoJSONSource).setData(ring(at.lon, at.lat, radiusKm, BODIES[body].radiusKm))
  }, [ready, site, radiusKm, color, at, body])

  // Cámaras sobre el sitio y el objetivo, a la misma escala.
  const frameSite = useCallback((duration: number) => {
    const { earth, planet } = maps.current
    if (!earth || !planet) return
    const zEarth = framingZoom(site.lat, radiusKm, earth.getContainer())
    const zPlanet = sameScaleZoom(zEarth, site.lat, at.lat, BODIES[body].radiusKm)
    offsetRef.current = zPlanet - zEarth
    earth.flyTo({ center: [site.lon, site.lat], zoom: zEarth, pitch: PITCH, duration, essential: true })
    planet.flyTo({ center: [at.lon, at.lat], zoom: zPlanet, pitch: PITCH, duration, essential: true })
  }, [site, radiusKm, at, body])

  // Al cambiar la disposición: tamaño nuevo de los lienzos y atribución en su esquina.
  useEffect(() => {
    const { earth, planet } = maps.current
    if (!earth || !planet) return
    earth.resize()
    planet.resize()
    attributions.current = [earth, planet].map((m, i) => {
      const old = attributions.current[i]
      if (old && m.hasControl(old)) m.removeControl(old)
      const control = new AttributionControl({ compact: true })
      m.addControl(control, attributionCorner(layout, i))
      return control
    })
  }, [layout])

  // Se encuadra el sitio salvo cuando se muestra la ruta completa o la vista general del recorrido.
  // Un cambio de disposición vuelve a encuadrar: así los mapas apilados empiezan alineados.
  useEffect(() => {
    if (!ready) return
    if (route || tourStep === 'overview') {
      framedFor.current = ''
      return
    }
    const key = `${site.id}|${layout}`
    if (framedFor.current === key) return
    framedFor.current = key
    frameSite(prefersReducedMotion() ? 0 : 3200)
  }, [ready, route, tourStep, site.id, layout, frameSite])

  // Recorrido guiado: cámara de la vista general y avance automático de los pasos.
  useEffect(() => {
    if (tour === null || !ready || !tourStep) return
    const { earth, planet } = maps.current
    orbitRef.current = TOUR[tourStep].orbit && !prefersReducedMotion()
    if (tourStep === 'overview' && earth && planet) {
      const zEarth = framingZoom(site.lat, radiusKm, earth.getContainer()) - 2.6
      const zPlanet = sameScaleZoom(zEarth, site.lat, at.lat, BODIES[body].radiusKm)
      offsetRef.current = zPlanet - zEarth
      const duration = prefersReducedMotion() ? 0 : 3500
      earth.flyTo({ center: [site.lon, site.lat], zoom: zEarth, pitch: 45, duration, essential: true })
      planet.flyTo({ center: [at.lon, at.lat], zoom: zPlanet, pitch: 45, duration, essential: true })
    }
    const id = window.setTimeout(() => setTour((n) => (n === null || n + 1 >= tourSteps.length ? null : n + 1)), TOUR[tourStep].ms)
    return () => window.clearTimeout(id)
  }, [tour, tourStep, ready, tourSteps.length, site, radiusKm, at, body])

  // Pasos apilados del recorrido: la cortina va y viene entre los dos lugares (empieza casi toda en la
  // Tierra) y la superposición pasa de solo la Tierra a solo el otro cuerpo y vuelve. Antes de pintar,
  // para que el paso no se vea un cuadro con la posición anterior.
  useLayoutEffect(() => {
    if (!ready || !tourStep) return
    const step = TOUR[tourStep]
    if (step.layout === 'side') return
    const key: Motion = step.layout === 'swipe' ? 'split' : 'mix'
    if (prefersReducedMotion()) {
      halt()
      show(key, 50)
      commitMotion()
      return
    }
    show(key, key === 'split' ? 50 + SWING.split.amp : 0)
    swing(key)
    return () => halt()
  }, [ready, tourStep, halt, show, commitMotion, swing])

  // Al terminar el recorrido, el giro vuelve a lo que eligió el usuario.
  useEffect(() => {
    if (tour === null) orbitRef.current = orbiting
  }, [tour, orbiting])

  // Ruta real del rover, si la región la tiene.
  useEffect(() => {
    if (!track) return
    let alive = true
    loadTrack(body, track.file).then((d) => alive && setTrackState({ key: trackKey, data: d })).catch(() => undefined)
    return () => {
      alive = false
    }
  }, [body, track, trackKey])

  const earthTrack = useMemo<LonLat[] | null>(
    () => (trackData ? transplant(trackData.line, trackData.line[0], BODIES[body].radiusKm, [site.lon, site.lat], EARTH_RADIUS_KM) : null),
    [trackData, body, site.lon, site.lat],
  )

  // Capas de la ruta: se añaden cuando hay mapas y datos; en la Tierra se mueven con el sitio.
  useEffect(() => {
    const { earth, planet } = maps.current
    if (!ready || !earth || !planet || !trackData || !earthTrack) return
    const lineFc = (coords: LonLat[]): Fc => ({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }] })
    if (!planet.getSource('track')) {
      planet.addSource('track', { type: 'geojson', lineMetrics: true, data: lineFc(trackData.line) })
      planet.addSource('track-stops', { type: 'geojson', data: trackData.stops })
      for (const layer of trackLayers(false)) planet.addLayer(layer, 'site-dot')
      planet.addLayer({
        id: 'track-stops',
        type: 'circle',
        source: 'track-stops',
        minzoom: 11.5,
        layout: { visibility: 'none' },
        paint: { 'circle-radius': 2.6, 'circle-color': '#ffffff', 'circle-stroke-color': '#0b1726', 'circle-stroke-width': 1 },
      }, 'site-dot')
    } else {
      ;(planet.getSource('track') as GeoJSONSource).setData(lineFc(trackData.line))
      ;(planet.getSource('track-stops') as GeoJSONSource | undefined)?.setData(trackData.stops)
    }
    const source = earth.getSource('track') as GeoJSONSource | undefined
    if (source) source.setData(lineFc(earthTrack))
    else {
      earth.addSource('track', { type: 'geojson', data: lineFc(earthTrack) })
      for (const layer of trackLayers(true)) earth.addLayer(layer, 'site-dot')
    }
    for (const m of [earth, planet]) {
      for (const id of TRACK_LAYERS) if (m.getLayer(id)) m.setLayoutProperty(id, 'visibility', route ? 'visible' : 'none')
    }
  }, [ready, trackData, earthTrack, route])

  // Encuadre de la ruta completa en los dos mapas, a la misma escala.
  useEffect(() => {
    const { earth, planet } = maps.current
    if (!ready || !earth || !planet || !trackData || !earthTrack || !route) return
    const eb = boundsOf(earthTrack)
    const { clientWidth, clientHeight } = earth.getContainer()
    const padding = Math.min(50, Math.floor(Math.min(clientWidth, clientHeight) / 5))
    const cam = earth.cameraForBounds([[eb[0], eb[1]], [eb[2], eb[3]]], { padding })
    if (!cam?.center || cam.zoom === undefined) return
    const ec = LngLat.convert(cam.center)
    const pb = boundsOf(trackData.line)
    const pc: LonLat = [(pb[0] + pb[2]) / 2, (pb[1] + pb[3]) / 2]
    const zEarth = cam.zoom - 0.2
    const zPlanet = sameScaleZoom(zEarth, ec.lat, pc[1], BODIES[body].radiusKm)
    offsetRef.current = zPlanet - zEarth
    const duration = prefersReducedMotion() ? 0 : 3500
    earth.flyTo({ center: [ec.lng, ec.lat], zoom: zEarth, pitch: 55, bearing: 0, duration, essential: true })
    planet.flyTo({ center: pc, zoom: zPlanet, pitch: 55, bearing: 0, duration, essential: true })
  }, [ready, trackData, earthTrack, route, body, layout])

  // Perfil de elevación cada 100 m: la ruta real en el objetivo y la trasladada en la Tierra.
  useEffect(() => {
    if (!route || !trackData || !region) return
    let alive = true
    const key = `${site.id}|${target.id}`
    const radius = BODIES[body].radiusKm
    const { points, dist } = resample(trackData.line, PROFILE_STEP_M, radius)
    const earthPoints = transplant(points, trackData.line[0], radius, [site.lon, site.lat], EARTH_RADIUS_KM)
    Promise.all([
      Promise.all(points.map(([lon, lat]) => planetElevationAt(body, region.targetId, lon, lat).catch(() => null))),
      Promise.all(earthPoints.map(([lon, lat]) => elevationAtPoint('earth', '-', lon, lat).catch(() => null))),
    ]).then(([planetElev, earthElev]) => {
      if (!alive) return
      const relative = (v: (number | null)[]) => {
        const first = v.find((x) => x !== null) ?? 0
        return v.map((x) => (x === null ? null : x - first))
      }
      setProfileState({ key, data: {
        dist: dist.map((d) => d / 1000),
        earth: relative(earthElev),
        planet: relative(planetElev),
        earthStats: profileStats(dist, earthElev, STEEP_THRESHOLDS),
        planetStats: profileStats(dist, planetElev, STEEP_THRESHOLDS),
      } })
    })
    return () => {
      alive = false
    }
  }, [route, trackData, region, body, target.id, site.id, site.lon, site.lat])

  // Capa de comparación visible en los dos mapas.
  useEffect(() => {
    if (!ready) return
    for (const m of [maps.current.earth, maps.current.planet]) {
      if (!m) continue
      for (const [key, id] of Object.entries(LENS_LAYERS)) {
        if (m.getLayer(id)) m.setLayoutProperty(id, 'visibility', key === lens ? 'visible' : 'none')
      }
    }
  }, [lens, ready])

  // Altura del centro de cada sitio, para leer el relieve relativo.
  useEffect(() => {
    if (lens !== 'relative') return
    let alive = true
    Promise.all([
      elevationAtPoint('earth', '-', site.lon, site.lat).catch(() => null),
      region ? elevationAtPoint(body, region.targetId, at.lon, at.lat) : Promise.resolve(null),
    ]).then(([earth, planet]) => alive && setCentres({ earth, planet }))
    return () => {
      alive = false
    }
  }, [lens, site.lon, site.lat, region, body, at])

  const toggleOrbit = () => {
    orbitRef.current = !orbitRef.current
    setOrbiting(orbitRef.current)
  }
  const go = (delta: number) => {
    const next = navRows[(index + delta + navRows.length) % navRows.length]
    if (next) onSite(next.site.id)
  }

  const label = (text: string) => <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">{text}</span>
  const chip = 'min-h-9 shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold sm:px-3'
  const round = (v: number | null | undefined) => (v === null || v === undefined ? '–' : formatNumber(Math.round(v), lang))
  const bodyName = t(`body.${body}`)

  const panes = [
    { b: 'earth' as const, name: site.name, lat: site.lat, lon: site.lon, note: null as string | null, centre: centres?.earth },
    {
      b: body,
      name: target.name,
      lat: target.lat,
      lon: target.lon,
      note: region === null
        ? t('explore.noTerrain')
        : region
          ? [
              t('explore.elevation', { min: formatNumber(region.elevationRangeM[0], lang), max: formatNumber(region.elevationRangeM[1], lang) }),
              region.frame ? t('explore.polarFrame') : null,
            ].filter(Boolean).join(' · ')
          : null,
      centre: centres?.planet,
    },
  ]
  const infoBox = 'pointer-events-none absolute top-2 rounded-lg border-l-[3px] bg-space/80 px-2 py-1.5 shadow-lg backdrop-blur sm:top-3 sm:px-3 sm:py-2'
  const paneInfo = (pane: (typeof panes)[number]) => (
    <>
      <div className="flex items-center gap-2">
        <BodyChip body={pane.b} />
        <strong className="min-w-0 truncate text-sm">{pane.name}</strong>
      </div>
      <p className="mt-0.5 font-mono text-[10px] text-white/60">{formatCoords(pane.lat, pane.lon, lang)}</p>
      {pane.note && <p className="mt-1 hidden text-[11px] text-white/80 sm:block">{pane.note}</p>}
      {lens === 'relative' && pane.centre !== undefined && (
        <p className="mt-1 font-mono text-[11px] text-white/85">{t('explore.lens.centre', { m: round(pane.centre) })}</p>
      )}
    </>
  )

  return (
    <div role="dialog" aria-modal="true" aria-label={t('explore.title')} className="gm-explore fixed inset-0 z-50 flex flex-col bg-space text-white">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-2 border-b border-white/10 bg-space px-2 py-2 sm:gap-x-4 sm:px-4">
        {free ? (
          <div className="min-w-0 flex-1">
            {label(t('explore.title'))}
            <p className="truncate font-serif text-base font-semibold leading-tight sm:text-lg">
              {site.name} <span className="text-white/50">↔</span> {target.name}
            </p>
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
            <button type="button" onClick={() => go(-1)} aria-label={t('explore.prev')} className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 hover:bg-white/20">‹</button>
            <div className="min-w-0">
              {label(t('explore.title'))}
              <div className="flex min-w-0 items-baseline gap-2">
                <select
                  aria-label={t('explore.site')}
                  value={site.id}
                  onChange={(e) => onSite(e.target.value)}
                  className="min-w-0 max-w-full truncate rounded-md bg-transparent font-serif text-base font-semibold leading-tight outline-offset-2 hover:bg-white/10 sm:max-w-[14rem] sm:text-lg"
                >
                  {navRows.map((r) => (
                    <option key={r.site.id} value={r.site.id} className="bg-space font-sans text-sm">
                      {t('explore.rankOption', { rank: r.rank ?? '–', name: r.site.name, score: r.score === null ? t('badge.notEvaluated') : formatPercent(r.score, lang) })}
                    </option>
                  ))}
                </select>
                <span className="hidden shrink-0 font-serif text-lg font-semibold text-white/50 sm:inline">↔</span>
                <span className="hidden truncate font-serif text-lg font-semibold sm:inline">{target.name}</span>
              </div>
            </div>
            <button type="button" onClick={() => go(1)} aria-label={t('explore.next')} className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 hover:bg-white/20">›</button>
          </div>
        )}
        <button ref={closeRef} type="button" onClick={onClose} className={`shrink-0 ${chip} bg-white text-ink hover:bg-white/90`}>
          {t('explore.close')}
        </button>
        <div className="gm-scroll-row -mx-2 flex w-[calc(100%+1rem)] flex-nowrap items-center gap-x-3 gap-y-1.5 overflow-x-auto px-2 pb-0.5 sm:-mx-4 sm:w-[calc(100%+2rem)] sm:px-4 md:mx-0 md:w-full md:flex-wrap md:overflow-visible md:px-0 2xl:w-auto">
          {/* Primero cómo se ven los dos lugares (vista) y luego qué se pinta encima (capa). */}
          <div className="flex shrink-0 items-center gap-1.5">
            <span aria-hidden="true" className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-[#fde68a] sm:inline">{t('explore.layout')}</span>
            <select
              aria-label={t('explore.layout')}
              value={layout}
              onChange={(event) => chooseLayout(event.target.value as Layout)}
              className="min-h-9 rounded-lg bg-[#fde68a]/15 px-1 text-sm font-semibold md:hidden [&_option]:bg-space"
            >
              {LAYOUTS.map((l) => <option key={l} value={l}>{t(`explore.layout.${l}`)}</option>)}
            </select>
            <div role="group" aria-label={t('explore.layout')} className="hidden flex-wrap rounded-lg bg-white/10 p-0.5 md:flex">
              {LAYOUTS.map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={layout === l}
                  onClick={() => chooseLayout(l)}
                  className={`${chip} ${layout === l ? 'bg-[#fde68a] text-ink' : 'text-white/85 hover:text-white'}`}
                >
                  {t(`explore.layout.${l}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span aria-hidden="true" className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60 sm:inline">{t('explore.lens')}</span>
            <select
              aria-label={t('explore.lens')}
              value={lens}
              onChange={(event) => setLens(event.target.value as Lens)}
              className="min-h-9 rounded-lg bg-white/10 px-1 text-sm font-semibold md:hidden [&_option]:bg-space"
            >
              {LENSES.map((l) => <option key={l} value={l}>{t(`explore.lens.${l}`)}</option>)}
            </select>
            <div role="group" aria-label={t('explore.lens')} className="hidden flex-wrap rounded-lg bg-white/10 p-0.5 md:flex">
              {LENSES.map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={lens === l}
                  onClick={() => setLens(l)}
                  className={`${chip} ${lens === l ? 'bg-white text-ink' : 'text-white/85 hover:text-white'}`}
                >
                  {t(`explore.lens.${l}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 flex-nowrap items-center gap-1.5 md:flex-wrap">
          <button
            type="button"
            onClick={() => {
              // El vaivén propio se detiene: durante el recorrido, cada paso decide qué se mueve.
              halt()
              setLooping(false)
              setTour((n) => (n === null ? 0 : null))
            }}
            aria-pressed={tour !== null}
            className={`${chip} ${tour !== null ? 'bg-[#fde68a] text-ink' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {tour !== null ? t('explore.tour.stop') : t('explore.tour')}
          </button>
          {track && (
            <button type="button" onClick={() => {
                orbitRef.current = false
                setOrbiting(false)
                setRoute((r) => !r)
              }} aria-pressed={route} className={`${chip} ${route ? 'bg-[#38bdf8] text-ink' : 'bg-white/10 hover:bg-white/20'}`}>
              {t('explore.route.toggle')}
            </button>
          )}
          {!free && (
            <button type="button" onClick={() => setPanelOpen((o) => !o)} aria-pressed={panelOpen} className={`${chip} ${panelOpen ? 'bg-white/25' : 'bg-white/10 hover:bg-white/20'}`}>
              {t('explore.conditions')}
            </button>
          )}
          <button type="button" onClick={toggleOrbit} aria-pressed={orbiting} className={`${chip} bg-white/10 hover:bg-white/20`}>
            {orbiting ? t('explore.pause') : t('explore.orbit')}
          </button>
          <div role="group" aria-label={t('lang.label')} className="flex shrink-0 rounded-lg bg-white/10 p-0.5">
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={l === lang}
                onClick={() => onLang(l)}
                className={`${chip} uppercase tracking-wide ${l === lang ? 'bg-white text-ink' : 'text-white/85 hover:text-white'}`}
              >
                {l}
              </button>
            ))}
          </div>
          </div>
        </div>
      </header>

      {tourStep && tour !== null && (
        <div role="status" aria-live="polite" className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#13243a] px-4 py-2">
          <span className="shrink-0 font-mono text-[11px] text-[#fde68a]">{t('explore.tour.step', { n: tour + 1, total: tourSteps.length })}</span>
          <p className="min-w-0 flex-1 text-sm leading-snug">
            {t(`explore.tour.${tourStep}`, {
              site: site.name,
              target: target.name,
              body: t(`body.${body}`),
              km: formatNumber(radiusKm, lang),
              name: track?.name ?? '',
            })}
          </p>
          <div className="hidden shrink-0 gap-1 sm:flex" aria-hidden="true">
            {tourSteps.map((step, i) => (
              <span key={step} className={`h-1.5 w-5 rounded-full ${i <= tour ? 'bg-[#fde68a]' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain explore-wide:flex-row">
        <div className="flex min-w-0 flex-1 flex-col explore-wide:min-h-0">
          <div
            ref={areaRef}
            className={`gm-compare relative grid min-h-[max(16rem,58dvh)] flex-1 overflow-hidden explore-wide:min-h-40 ${stacked ? 'grid-cols-1 grid-rows-1' : 'gm-map-panes'}`}
            // Posición de la cortina y mezcla; las animaciones las cambian directamente (ver `show`).
            style={{ '--split': `${split}%`, '--mix': String(mix / 100) } as CSSProperties}
          >
            {panes.map((pane, i) => (
              <div
                key={pane.b}
                className={`relative min-h-0 min-w-0 overflow-hidden ${
                  stacked ? 'col-start-1 row-start-1' : i === 1 ? 'gm-map-divider border-white/15' : ''
                } ${stacked && i === 1 && layout === 'blend' ? 'pointer-events-none' : ''} ${toned ? 'gm-tone' : ''} ${
                  toned && i === 1 && layout === 'blend' ? 'gm-add' : ''
                }`}
                // Apilados, el mapa del objetivo va encima: recortado por la cortina o con transparencia
                // (la transparencia va en el lienzo, así la atribución sigue visible). En la superposición
                // no recibe gestos: los recibe la Tierra y se copian (la atribución sí responde).
                // Con el tono por cuerpo, la superposición suma la luz de los dos lienzos y el deslizador
                // apaga uno al acercarse al otro extremo.
                style={{
                  '--tint': TONES[i],
                  ...(layout === 'swipe' && i === 1 && { clipPath: 'inset(0 0 0 var(--split))' }),
                  ...(layout === 'blend' && {
                    '--alpha': i === 1
                      ? (toned ? 'min(1, calc(2 * var(--mix)))' : 'var(--mix)')
                      : (toned ? 'min(1, calc(2 - 2 * var(--mix)))' : '1'),
                  }),
                } as CSSProperties}
              >
                {/* maplibre-gl.css pone position: relative en el contenedor: el posicionamiento va en un div exterior. */}
                <div className="absolute inset-0" role="region" aria-label={t('map.planet', { body: t(`body.${pane.b}`) })}>
                  <div ref={i === 0 ? earthRef : planetRef} className="h-full w-full" />
                </div>
                {!stacked && (
                  <>
                    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-1" style={{ background: i === 0 ? EARTH_TINT : OTHER_TINT }} />
                    <div className={`${infoBox} left-2 max-w-[calc(100%-2.75rem)] sm:left-3`} style={{ borderColor: i === 0 ? EARTH_TINT : OTHER_TINT }}>{paneInfo(pane)}</div>
                  </>
                )}
              </div>
            ))}

            {/* Franja superior con el color de cada lado: en la cortina sigue a la división. */}
            {stacked && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1"
                style={{
                  background: layout === 'swipe'
                    ? `linear-gradient(90deg, ${EARTH_TINT} var(--split), ${OTHER_TINT} var(--split))`
                    : `linear-gradient(90deg, ${EARTH_TINT}, ${toned ? '#ffffff' : EARTH_TINT} 50%, ${OTHER_TINT})`,
                }}
              />
            )}

            {/* Apilados, las fichas van fuera de los mapas: la Tierra a la izquierda y el objetivo a la derecha. */}
            {stacked && panes.map((pane, i) => (
              <div
                key={`info-${pane.b}`}
                className={`${infoBox} z-10 max-w-[calc(50%-0.75rem)] ${i === 0 ? 'left-2 sm:left-3' : 'right-2 sm:right-3'}`}
                style={{ borderColor: i === 0 ? EARTH_TINT : OTHER_TINT }}
              >
                {paneInfo(pane)}
              </div>
            ))}

            {layout === 'swipe' && (
              <SwipeDivider
                value={split}
                onChange={(v) => userSet('split', v)}
                area={areaRef}
                label={t('explore.layout.split', { body: bodyName })}
                valueText={t('explore.layout.splitValue', { earth: Math.round(split), other: 100 - Math.round(split), body: bodyName })}
                earthName={t('body.earth')}
                otherName={bodyName}
              />
            )}

            {/* Barra de comparación, la misma en las tres vistas: mezcla (superposición), tono y vaivén. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-11">
              <div
                role="group"
                aria-label={t('explore.compare')}
                className={`pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-2xl bg-space/85 px-2 py-1 text-xs font-semibold shadow-lg ring-1 ring-white/10 backdrop-blur ${
                  layout === 'blend' ? 'w-full max-w-[32rem]' : ''
                }`}
              >
                {layout === 'blend' && (
                  <div className="flex min-w-[min(15rem,100%)] flex-1 items-center gap-1.5">
                    <button type="button" onClick={() => mixTo(0)} aria-label={t('explore.layout.only', { body: t('body.earth') })} className="shrink-0 rounded-full px-1.5 py-1 hover:bg-white/10" style={{ color: EARTH_TINT }}>
                      {t('body.earth')}
                    </button>
                    <input
                      ref={mixInput}
                      type="range"
                      min={0}
                      max={100}
                      defaultValue={mix}
                      onChange={(event) => userSet('mix', Number(event.target.value))}
                      aria-label={t('explore.layout.mix', { body: bodyName })}
                      aria-valuetext={`${mix} %`}
                      className="gm-mix h-9 min-w-0 flex-1 cursor-pointer"
                    />
                    <button type="button" onClick={() => mixTo(100)} aria-label={t('explore.layout.only', { body: bodyName })} className="shrink-0 rounded-full px-1.5 py-1 hover:bg-white/10" style={{ color: OTHER_TINT }}>
                      {bodyName}
                    </button>
                  </div>
                )}
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-pressed={toned}
                    disabled={lens !== 'imagery'}
                    title={lens !== 'imagery' ? t('explore.tone.imageryOnly') : undefined}
                    onClick={() => setTone(!tone)}
                    className={`flex min-h-8 items-center gap-1.5 rounded-full px-2.5 py-1 disabled:cursor-not-allowed disabled:opacity-45 ${toned ? 'bg-white text-ink' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    <span aria-hidden="true" className="flex">
                      <span className="size-2.5 rounded-full ring-1 ring-space/40" style={{ background: TONES[0] }} />
                      <span className="-ml-1 size-2.5 rounded-full ring-1 ring-space/40" style={{ background: TONES[1] }} />
                    </span>
                    {t('explore.tone')}
                  </button>
                  {stacked && (
                    <button
                      type="button"
                      aria-pressed={swinging}
                      onClick={toggleSwing}
                      className={`flex min-h-8 items-center gap-1.5 rounded-full px-2.5 py-1 ${swinging ? 'bg-[#fde68a] text-ink' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      <span aria-hidden="true" className="w-3 text-center">{swinging ? '❚❚' : '▶'}</span>
                      {swinging ? t('explore.animate.stop') : t('explore.animate')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {!ready && (
              <div className="absolute inset-0 z-20 grid place-items-center bg-space/90 px-4 text-center text-sm text-white/85" role="status">
                {t(webgl ? 'explore.loading' : 'map.noWebgl')}
              </div>
            )}
          </div>

          <div className="shrink-0 space-y-2 border-t border-white/15 px-2 py-2 sm:px-3 explore-wide:max-h-[36dvh] explore-wide:overflow-y-auto" tabIndex={0} role="region" aria-label={t('detail.evidence')}>
            {/* En pantallas angostas la nota del objetivo (elevación, marco del polo) va aquí y no sobre el mapa. */}
            {panes[1].note && <p className="mx-auto max-w-3xl text-center text-[11px] leading-snug text-white/80 sm:hidden">{panes[1].note}</p>}
            {route && track && (
              <div className="flex justify-center">
                <RouteProfile track={track} target={target} data={profile} />
              </div>
            )}

            {lens !== 'imagery' && (
              <div className="mx-auto max-w-3xl rounded-lg bg-white/[0.06] px-3 py-2">
                <RampLegend ramp={lens === 'slope' ? SLOPE_RAMP : RELATIVE_RAMP} unit={lens === 'slope' ? '°' : ' m'} />
                <p className="mt-1.5 text-[11px] leading-snug text-white/80">{t(lens === 'slope' ? 'explore.lens.slopeNote' : 'explore.lens.relativeNote')}</p>
                {region === null && <p className="mt-1 text-[11px] text-[#f3d27a]">{t('explore.lens.noTerrain', { body: t(`body.${body}`) })}</p>}
              </div>
            )}

            {!route && measured && (
              <div className="flex justify-center">
                <div className="grid w-full max-w-3xl grid-cols-3 gap-px overflow-hidden rounded-lg bg-white/15">
                  {[
                    { label: t('pin.metric.slopeMedian'), get: (s: PatchStats) => `${formatNumber(s.slopeMedian, lang)}°` },
                    { label: t('pin.metric.steep', { deg: STEEP_DEG }), get: (s: PatchStats) => formatPercent(s.steepShare, lang) },
                    { label: t('pin.metric.relief'), get: (s: PatchStats) => `${formatNumber(Math.round(s.reliefM), lang)} m` },
                  ].map((m) => (
                    <div key={m.label} className="min-w-0 bg-space/85 px-2.5 py-2 sm:px-3">
                      <p className="wrap-anywhere text-[10px] text-white/65 sm:text-[11px]">{m.label}</p>
                      <div className="mt-0.5 font-mono text-xs leading-tight tabular-nums sm:text-sm">
                        <span className="block" style={{ color: '#9cc7ec' }}>{measured.earth ? m.get(measured.earth) : t('value.noData')}</span>
                        <span className="block" style={{ color: '#f2b48c' }}>{measured.planet ? m.get(measured.planet) : t('value.noData')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {free && measured && (
              <p className="text-center text-[11px] text-white/70">
                {t('pin.measuredLead', { km: formatNumber(radiusKm, lang), step: formatNumber(measured.stepM, lang) })} {t('pin.pilot')}: {t('pin.noScoreShort')}
              </p>
            )}

            {!route && !panelOpen && keyDims.length > 0 && (
              <div className="flex justify-center">
                <div className="grid w-full max-w-3xl grid-cols-3 gap-px overflow-hidden rounded-lg bg-white/15">
                  {keyDims.map((d) => {
                    const s = row.dimensions[d.id] ?? null
                    return (
                      <div key={d.id} className="min-w-0 bg-space/85 px-2.5 py-2 sm:px-3">
                        <p className="wrap-anywhere text-[10px] text-white/65 sm:text-[11px]">{d.label[lang]}</p>
                        <div className="mt-0.5 flex flex-wrap items-end justify-between gap-1">
                          <div className="min-w-0 font-mono text-xs leading-tight tabular-nums sm:text-sm">
                            <span className="block wrap-anywhere" style={{ color: '#9cc7ec' }}>{formatValue(site.values[d.id], d, lang)}</span>
                            <span className="block wrap-anywhere" style={{ color: '#f2b48c' }}>{formatValue(target.values[d.id], d, lang)}</span>
                          </div>
                          <span className="shrink-0 text-xs tabular-nums text-white">{s === null ? t('value.noData') : formatPercent(s, lang)}</span>
                        </div>
                        <ScoreBar score={s} className="mt-1 !bg-white/15" />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {stacked && <p className="mx-auto max-w-3xl text-center text-[11px] leading-snug text-white/80">{t('explore.layout.note')}</p>}
            {toned && (
              <p className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[11px] leading-snug text-white/80">
                <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: TONES[0] }} />{t('body.earth')}</span>
                <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: TONES[1] }} />{bodyName}</span>
                {layout === 'blend' && <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="size-2.5 rounded-full bg-white" />{t('explore.tone.both')}</span>}
                <span>{t('explore.tone.note', { body: bodyName })}</span>
              </p>
            )}

            <p className="text-center text-[11px] text-white/85">
              {t('explore.scaleNote', { x: formatNumber(VISUAL_EXAGGERATION, lang), km: formatNumber(radiusKm, lang) })}
            </p>
          </div>
        </div>

        {panelOpen && (
          <aside
            ref={conditionsRef}
            aria-label={t('explore.conditions')}
            tabIndex={0}
            className="shrink-0 border-t border-white/15 explore-wide:w-[22rem] explore-wide:overflow-y-auto explore-wide:border-l explore-wide:border-t-0"
          >
            <ConditionsPanel model={model} row={row} target={target} purpose={purpose} mode={mode} />
          </aside>
        )}
      </div>
    </div>
  )
}
