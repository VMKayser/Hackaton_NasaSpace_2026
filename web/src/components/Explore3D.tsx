import type { FeatureCollection } from 'geojson'
import { AttributionControl, Map as MlMap } from 'maplibre-gl'
import type { GeoJSONSource, MapLibreEvent, RasterTileSource, SkySpecification, StyleSpecification } from 'maplibre-gl'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Model } from '../data/model'
import { siteText } from '../data/model'
import type { Dimension, Purpose, Target } from '../data/schema'
import { LANGS, useI18n } from '../i18n'
import type { Lang } from '../i18n'
import { formatCoords, formatNumber, formatValue, score100 } from '../lib/format'
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
import { loadTerrainRegions } from '../map/planetTerrain'
import type { TerrainRegion } from '../map/planetTerrain'
import { EARTH_LENS_MAX_ZOOM, elevationAtPoint } from '../map/reliefLens'
import { prefersReducedMotion } from '../map/runtime'
import { baseStyle, DEM_SOURCE } from '../map/style'
import '../map/planetTiles'
import { BodyChip, Pending, ScoreBar } from './ui'

// Vista inmersiva: el sitio de la Tierra y el objetivo, con relieve real, a la misma escala horizontal
// y con la misma exageración vertical. Las cámaras giran juntas. Las capas de comparación (pendiente y
// relieve relativo) se calculan del relieve mostrado, con la misma rampa de color en los dos mapas.

const VISUAL_EXAGGERATION = 1.5
const PITCH = 72
const ORBIT_DEG_PER_S = 5
const LENSES: Lens[] = ['imagery', 'slope', 'relative']
const LENS_LAYERS = { slope: 'lens-slope', relative: 'lens-relative' } as const
const GROUPS: Likeness[] = ['similar', 'partial', 'different', 'noData']

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
  const style: StyleSpecification = {
    version: 8,
    projection: { type: 'mercator' },
    sky: SKIES[body],
    sources: {
      imagery: { type: 'raster', tiles: [`planet-trek://${body}/{z}/{x}/{y}`], tileSize: 256, maxzoom: info.maxLevel + 1, attribution: credit },
      area: { type: 'geojson', data: ring(target.lon, target.lat, radiusKm, BODIES[body].radiusKm) },
      site: { type: 'geojson', data: dot(target.lon, target.lat) },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': SKIES[body]['fog-color'] as string } },
      { id: 'imagery', type: 'raster', source: 'imagery', paint: { 'raster-contrast': 0.12, 'raster-fade-duration': 0 } },
    ],
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

/** Zoom para que el círculo del área ocupe cerca de un tercio del ancho y se vea el paisaje. */
function framingZoom(lat: number, radiusKm: number, widthPx: number): number {
  const kmPerPxAtZ0 = (2 * Math.PI * EARTH_RADIUS_KM * Math.cos((lat * Math.PI) / 180)) / 256
  const wantKmPerPx = (radiusKm * 6.5) / Math.max(320, widthPx)
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
        <span className="font-mono text-xs tabular-nums text-white">{s === null ? '–' : score100(s)}</span>
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
  const limits = siteText(model, row.site, 'limits', lang)
  const groupClass: Record<Likeness, string> = {
    similar: 'text-[#8fd6a8]',
    partial: 'text-[#f3d27a]',
    different: 'text-[#f29b8a]',
    noData: 'text-white/55',
  }
  return (
    <div className="space-y-5 p-4">
      <section className="rounded-xl bg-white/[0.06] p-3">
        {row.score !== null ? (
          <div className="flex items-end gap-3">
            <p className="font-mono text-4xl font-semibold leading-none tabular-nums">{score100(row.score)}<span className="text-sm text-white/50">/100</span></p>
            <div className="min-w-0 flex-1 pb-0.5">
              <p className="text-xs text-white/80">{mode === 'purpose' ? t('detail.purposeScore') : t('detail.similarity')}</p>
              <ScoreBar score={row.score} className="mt-1 !bg-white/10" />
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/80">{t('detail.notEvaluated')}</p>
        )}
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
}

export function Explore3D({ model, rows, row, target, purpose, mode, onSite, onLang, onClose }: Props) {
  const { t, lang } = useI18n()
  const { site } = row
  const body = target.body as Planet
  const earthRef = useRef<HTMLDivElement>(null)
  const planetRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const maps = useRef<{ earth: MlMap | null; planet: MlMap | null }>({ earth: null, planet: null })
  const [orbiting, setOrbiting] = useState(() => !prefersReducedMotion())
  const orbitRef = useRef(orbiting)
  const [ready, setReady] = useState(false)
  const [region, setRegion] = useState<TerrainRegion | null | undefined>(undefined)
  const [lens, setLens] = useState<Lens>('imagery')
  const lensRef = useRef(lens)
  const [panelOpen, setPanelOpen] = useState(() => window.innerWidth >= 1024)
  const [centres, setCentres] = useState<{ earth: number | null; planet: number | null } | null>(null)
  const offsetRef = useRef(0)
  const shownSite = useRef<string | null>(null)
  const latest = useRef(row)
  useEffect(() => {
    latest.current = row
  })
  const radiusKm = site.radiusKm ?? 3
  const color = scoreColor(row.score)
  const evaluated = useMemo(() => rows.filter((r) => r.score !== null), [rows])
  const index = evaluated.findIndex((r) => r.site.id === site.id)

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
    let alive = true
    loadTerrainRegions(body).then((regions) => alive && setRegion(regions.find((r) => r.targetId === target.id) ?? null))
    return () => {
      alive = false
    }
  }, [body, target.id])

  // Los dos mapas se crean una vez por objetivo. Cambiar de sitio solo mueve la cámara de la Tierra.
  useEffect(() => {
    if (region === undefined || !earthRef.current || !planetRef.current) return
    const first = latest.current.site
    const firstRadius = first.radiusKm ?? 3
    const reduced = prefersReducedMotion()
    const zEarth = framingZoom(first.lat, firstRadius, earthRef.current.clientWidth)
    const zPlanet = sameScaleZoom(zEarth, first.lat, target.lat, BODIES[body].radiusKm)
    offsetRef.current = zPlanet - zEarth
    shownSite.current = first.id

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
    // Atribución arriba a la derecha, plegada, para dejar libre la parte de abajo.
    for (const m of [earth, planet]) m.addControl(new AttributionControl({ compact: true }), 'top-right')

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
      earth.once('moveend', () => {
        last = performance.now()
        raf = requestAnimationFrame(spin)
      })
    }
    earth.once('load', onLoad)
    planet.once('load', onLoad)

    // Lo que hace el usuario en un mapa se copia en el otro: rumbo, inclinación y zoom a la misma escala.
    const stopOrbit = () => {
      orbitRef.current = false
      setOrbiting(false)
    }
    const mirror = (from: MlMap, to: MlMap, sign: 1 | -1) => (e: MapLibreEvent<unknown>) => {
      if (!e.originalEvent) return
      to.jumpTo({ bearing: from.getBearing(), pitch: from.getPitch(), zoom: from.getZoom() + sign * offsetRef.current })
    }
    earth.on('move', mirror(earth, planet, 1))
    planet.on('move', mirror(planet, earth, -1))
    for (const m of [earth, planet]) {
      m.on('dragstart', stopOrbit)
      m.on('rotatestart', stopOrbit)
      m.on('pitchstart', (e) => e.originalEvent && stopOrbit())
    }

    return () => {
      cancelAnimationFrame(raf)
      earth.remove()
      planet.remove()
      maps.current = { earth: null, planet: null }
      setReady(false)
    }
  }, [region, target, body])

  // Cambio de sitio de la Tierra sin salir de la vista.
  useEffect(() => {
    const { earth, planet } = maps.current
    if (!ready || !earth || !planet || shownSite.current === site.id) return
    shownSite.current = site.id
    const zEarth = framingZoom(site.lat, radiusKm, earth.getContainer().clientWidth)
    const zPlanet = sameScaleZoom(zEarth, site.lat, target.lat, BODIES[body].radiusKm)
    offsetRef.current = zPlanet - zEarth
    ;(earth.getSource('area') as GeoJSONSource).setData(ring(site.lon, site.lat, radiusKm, EARTH_RADIUS_KM))
    ;(earth.getSource('site') as GeoJSONSource).setData(dot(site.lon, site.lat))
    ;(earth.getSource(LENS_LAYERS.relative) as RasterTileSource).setTiles([lensUrl('earth', '-', 'relative', site.lon, site.lat)])
    earth.setPaintProperty('site-dot', 'circle-color', color)
    ;(planet.getSource('area') as GeoJSONSource).setData(ring(target.lon, target.lat, radiusKm, BODIES[body].radiusKm))
    const duration = prefersReducedMotion() ? 0 : 3200
    earth.flyTo({ center: [site.lon, site.lat], zoom: zEarth, duration, essential: true })
    planet.easeTo({ zoom: zPlanet, duration })
  }, [ready, site, radiusKm, color, target, body])

  // Capa de comparación visible en los dos mapas.
  useEffect(() => {
    lensRef.current = lens
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
      region ? elevationAtPoint(body, target.id, target.lon, target.lat) : Promise.resolve(null),
    ]).then(([earth, planet]) => alive && setCentres({ earth, planet }))
    return () => {
      alive = false
    }
  }, [lens, site.lon, site.lat, region, body, target])

  const toggleOrbit = () => {
    orbitRef.current = !orbitRef.current
    setOrbiting(orbitRef.current)
  }
  const go = (delta: number) => {
    const next = evaluated[(index + delta + evaluated.length) % evaluated.length]
    if (next) onSite(next.site.id)
  }

  const label = (text: string) => <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">{text}</span>
  const chip = 'rounded-lg px-3 py-2 text-xs font-semibold'
  const round = (v: number | null | undefined) => (v === null || v === undefined ? '–' : formatNumber(Math.round(v), lang))

  return (
    <div role="dialog" aria-modal="true" aria-label={t('explore.title')} className="gm-explore fixed inset-0 z-50 flex flex-col bg-space text-white">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-white/10 bg-space px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <button type="button" onClick={() => go(-1)} aria-label={t('explore.prev')} className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10 hover:bg-white/20">‹</button>
          <div className="min-w-0">
            {label(t('explore.title'))}
            <div className="flex min-w-0 items-baseline gap-2">
              <select
                aria-label={t('explore.site')}
                value={site.id}
                onChange={(e) => onSite(e.target.value)}
                className="min-w-0 max-w-[14rem] truncate rounded-md bg-transparent font-serif text-lg font-semibold leading-tight outline-offset-2 hover:bg-white/10 sm:max-w-xs"
              >
                {evaluated.map((r) => (
                  <option key={r.site.id} value={r.site.id} className="bg-space font-sans text-sm">
                    {t('explore.rankOption', { rank: r.rank ?? '–', name: r.site.name, score: r.score === null ? '–' : score100(r.score) })}
                  </option>
                ))}
              </select>
              <span className="shrink-0 font-serif text-lg font-semibold text-white/50">↔</span>
              <span className="truncate font-serif text-lg font-semibold">{target.name}</span>
            </div>
          </div>
          <button type="button" onClick={() => go(1)} aria-label={t('explore.next')} className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10 hover:bg-white/20">›</button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label={t('explore.lens')} className="flex rounded-lg bg-white/10 p-0.5">
            {LENSES.map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={lens === l}
                onClick={() => setLens(l)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${lens === l ? 'bg-white text-ink' : 'text-white/85 hover:text-white'}`}
              >
                {t(`explore.lens.${l}`)}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setPanelOpen((o) => !o)} aria-pressed={panelOpen} className={`${chip} ${panelOpen ? 'bg-white/25' : 'bg-white/10 hover:bg-white/20'}`}>
            {t('explore.conditions')}
          </button>
          <button type="button" onClick={toggleOrbit} aria-pressed={orbiting} className={`${chip} bg-white/10 hover:bg-white/20`}>
            {orbiting ? t('explore.pause') : t('explore.orbit')}
          </button>
          <div role="group" aria-label={t('lang.label')} className="flex rounded-lg bg-white/10 p-0.5">
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={l === lang}
                onClick={() => onLang(l)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide ${l === lang ? 'bg-white text-ink' : 'text-white/85 hover:text-white'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className={`${chip} bg-white text-ink hover:bg-white/90`}>
            {t('explore.close')}
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <div className="relative grid min-h-0 min-w-0 flex-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1">
          {[
            { ref: earthRef, b: 'earth' as const, name: site.name, lat: site.lat, lon: site.lon, note: null as string | null, centre: centres?.earth },
            {
              ref: planetRef,
              b: body,
              name: target.name,
              lat: target.lat,
              lon: target.lon,
              note: region === null
                ? t('explore.noTerrain')
                : region
                  ? t('explore.elevation', { min: formatNumber(region.elevationRangeM[0], lang), max: formatNumber(region.elevationRangeM[1], lang) })
                  : null,
              centre: centres?.planet,
            },
          ].map((pane, i) => (
            <div key={pane.b} className={`relative min-h-0 overflow-hidden ${i === 1 ? 'border-t border-white/15 md:border-l md:border-t-0' : ''}`}>
              {/* maplibre-gl.css pone position: relative en el contenedor: el posicionamiento va en un div exterior. */}
              <div className="absolute inset-0" role="region" aria-label={t('map.planet', { body: t(`body.${pane.b}`) })}>
                <div ref={pane.ref} className="h-full w-full" />
              </div>
              <div className="pointer-events-none absolute left-3 top-3 max-w-[85%] rounded-xl bg-space/80 px-3 py-2 shadow-lg backdrop-blur">
                <div className="flex items-center gap-2">
                  <BodyChip body={pane.b} />
                  <strong className="truncate text-sm">{pane.name}</strong>
                </div>
                <p className="mt-0.5 font-mono text-[10px] text-white/60">{formatCoords(pane.lat, pane.lon, lang)}</p>
                {pane.note && <p className="mt-1 text-[11px] text-white/80">{pane.note}</p>}
                {lens === 'relative' && pane.centre !== undefined && (
                  <p className="mt-1 font-mono text-[11px] text-white/85">{t('explore.lens.centre', { m: round(pane.centre) })}</p>
                )}
              </div>
            </div>
          ))}

          {lens !== 'imagery' && (
            <div className="pointer-events-none absolute left-1/2 top-3 z-10 w-[min(26rem,calc(100%-1.5rem))] -translate-x-1/2 rounded-xl bg-space/85 px-3 py-2 shadow-xl backdrop-blur md:top-auto md:bottom-40">
              <RampLegend ramp={lens === 'slope' ? SLOPE_RAMP : RELATIVE_RAMP} unit={lens === 'slope' ? '°' : ' m'} />
              <p className="mt-1.5 text-[11px] leading-snug text-white/80">{t(lens === 'slope' ? 'explore.lens.slopeNote' : 'explore.lens.relativeNote')}</p>
              {region === null && <p className="mt-1 text-[11px] text-[#f3d27a]">{t('explore.lens.noTerrain', { body: t(`body.${body}`) })}</p>}
            </div>
          )}

          {!panelOpen && keyDims.length > 0 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-14 z-10 flex justify-center px-3 sm:bottom-10">
              <div className="pointer-events-auto grid w-full max-w-3xl grid-cols-3 gap-px overflow-hidden rounded-xl bg-white/15 shadow-2xl backdrop-blur">
                {keyDims.map((d) => {
                  const s = row.dimensions[d.id] ?? null
                  return (
                    <div key={d.id} className="min-w-0 bg-space/85 px-2.5 py-2 sm:px-3">
                      <p className="truncate text-[10px] text-white/65 sm:text-[11px]">{d.label[lang]}</p>
                      <div className="mt-0.5 flex items-end justify-between gap-2">
                        <div className="min-w-0 font-mono text-xs leading-tight tabular-nums sm:text-sm">
                          <span className="block truncate" style={{ color: '#9cc7ec' }}>{formatValue(site.values[d.id], d, lang)}</span>
                          <span className="block truncate" style={{ color: '#f2b48c' }}>{formatValue(target.values[d.id], d, lang)}</span>
                        </div>
                        <span className="shrink-0 font-mono text-xs text-white">{s === null ? '–' : score100(s)}</span>
                      </div>
                      <ScoreBar score={s} className="mt-1 !bg-white/15" />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center px-3">
            <p className="rounded-full bg-space/85 px-3 py-1 text-center text-[11px] text-white/85 backdrop-blur">
              {t('explore.scaleNote', { x: formatNumber(VISUAL_EXAGGERATION, lang), km: formatNumber(radiusKm, lang) })}
            </p>
          </div>

          {!ready && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-space/90 text-sm text-white/85" role="status">
              {t('explore.loading')}
            </div>
          )}
        </div>

        {panelOpen && (
          <aside
            aria-label={t('explore.conditions')}
            className="absolute inset-x-0 bottom-0 z-30 max-h-[62%] overflow-y-auto rounded-t-2xl border-t border-white/15 bg-space/95 shadow-2xl backdrop-blur lg:static lg:max-h-none lg:w-[22rem] lg:shrink-0 lg:rounded-none lg:border-l lg:border-t-0"
          >
            <ConditionsPanel model={model} row={row} target={target} purpose={purpose} mode={mode} />
          </aside>
        )}
      </div>
    </div>
  )
}
