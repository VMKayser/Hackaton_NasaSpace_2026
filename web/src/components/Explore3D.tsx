import { AttributionControl, Map as MlMap } from 'maplibre-gl'
import type { MapLibreEvent, SkySpecification, StyleSpecification } from 'maplibre-gl'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Model } from '../data/model'
import type { Purpose, Target } from '../data/schema'
import { useI18n } from '../i18n'
import { formatCoords, formatValue, score100 } from '../lib/format'
import type { RankedSite } from '../lib/ranking'
import { activeWeights } from '../lib/ranking'
import { circleRing, EARTH_RADIUS_KM, proportionalExaggeration, sameScaleZoom, terrainMaxZoom } from '../lib/terrain'
import { BODIES } from '../map/bodies'
import { scoreColor } from '../map/colors'
import { IMAGERY, MARS_DETAIL } from '../map/planetaryImagery'
import type { Planet } from '../map/planetaryImagery'
import { loadTerrainRegions } from '../map/planetTerrain'
import type { TerrainRegion } from '../map/planetTerrain'
import { prefersReducedMotion } from '../map/runtime'
import { baseStyle, DEM_SOURCE } from '../map/style'
import '../map/planetTiles'
import { BodyChip, ScoreBar } from './ui'

// Vista inmersiva: el sitio de la Tierra y el objetivo, con relieve real, a la misma escala horizontal
// y con la misma exageración vertical. Las dos cámaras giran juntas.

const VISUAL_EXAGGERATION = 1.5
const PITCH = 72
const ORBIT_DEG_PER_S = 5

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

function line(coords: [number, number][]) {
  return { type: 'Feature' as const, properties: {}, geometry: { type: 'LineString' as const, coordinates: coords } }
}
function point(lon: number, lat: number) {
  return { type: 'Feature' as const, properties: {}, geometry: { type: 'Point' as const, coordinates: [lon, lat] } }
}

function earthStyle(lon: number, lat: number, radiusKm: number, color: string): StyleSpecification {
  const { gibs, s2 } = baseStyle.sources
  return {
    version: 8,
    projection: { type: 'mercator' },
    sky: SKIES.earth,
    sources: {
      gibs,
      s2: { ...(s2 as object), maxzoom: 14 } as typeof s2,
      // Hasta z12 (SRTM de 30 m): por encima solo se amplía, y así se evitan picos sueltos sobre el agua.
      [DEM_SOURCE]: { ...(baseStyle.sources[DEM_SOURCE] as object), maxzoom: 12 } as typeof baseStyle.sources[typeof DEM_SOURCE],
      area: { type: 'geojson', data: line(circleRing(lon, lat, radiusKm, EARTH_RADIUS_KM)) },
      site: { type: 'geojson', data: point(lon, lat) },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#dfe9f1' } },
      { id: 'gibs', type: 'raster', source: 'gibs', maxzoom: 9 },
      { id: 's2', type: 'raster', source: 's2', minzoom: 7, paint: { 'raster-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 8.5, 1] } },
      ...areaLayers(color, false),
    ],
  }
}

function planetStyle(body: Planet, region: TerrainRegion | null, target: Target, radiusKm: number): StyleSpecification {
  const info = IMAGERY[body]
  const credit = [
    `<a href="${info.mapUrl}" target="_blank" rel="noopener">${info.mapCredit}</a>`,
    ...(region?.sources ?? []).map((s) => `Elevation: <a href="${s.url}" target="_blank" rel="noopener">${s.name}</a> (${s.agency})`),
  ].join(' · ')
  const style: StyleSpecification = {
    version: 8,
    projection: { type: 'mercator' },
    sky: SKIES[body],
    sources: {
      imagery: { type: 'raster', tiles: [`planet-trek://${body}/{z}/{x}/{y}`], tileSize: 256, maxzoom: info.maxLevel + 1, attribution: credit },
      area: { type: 'geojson', data: line(circleRing(target.lon, target.lat, radiusKm, BODIES[body].radiusKm)) },
      site: { type: 'geojson', data: point(target.lon, target.lat) },
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
    style.sources[DEM_SOURCE] = {
      type: 'raster-dem',
      tiles: [`planet-dem://${body}/${region.targetId}/{z}/{x}/{y}`],
      encoding: 'terrarium',
      tileSize: 256,
      maxzoom: terrainMaxZoom(region.grids.map((g) => g.resolutionM), BODIES[body].radiusKm),
    }
  }
  style.layers.push(...areaLayers('#ffd1a3', true))
  return style
}

function areaLayers(color: string, dashed: boolean): StyleSpecification['layers'] {
  return [
    {
      id: 'area-glow',
      type: 'line',
      source: 'area',
      paint: { 'line-color': color, 'line-width': 12, 'line-blur': 8, 'line-opacity': dashed ? 0.35 : 0.55 },
    },
    {
      id: 'area-line',
      type: 'line',
      source: 'area',
      paint: { 'line-color': '#fff7ee', 'line-width': 2.2, ...(dashed ? { 'line-dasharray': [3, 2] } : {}) },
    },
    {
      id: 'site-dot',
      type: 'circle',
      source: 'site',
      paint: {
        'circle-radius': 7,
        'circle-color': color,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2.5,
        'circle-pitch-alignment': 'viewport',
      },
    },
  ]
}

/** Zoom para que el círculo del área quede bien encuadrado en la vista inclinada. */
function framingZoom(lat: number, radiusKm: number, widthPx: number): number {
  const kmPerPxAtZ0 = (2 * Math.PI * EARTH_RADIUS_KM * Math.cos((lat * Math.PI) / 180)) / 256
  // El círculo ocupa cerca de un tercio del ancho: se ve el paisaje alrededor.
  const wantKmPerPx = (radiusKm * 6.5) / Math.max(320, widthPx)
  return Math.min(13, Math.max(10, Math.log2(kmPerPxAtZ0 / wantKmPerPx)))
}

interface Props {
  model: Model
  row: RankedSite
  target: Target
  purpose: Purpose | null
  onClose: () => void
}

export function Explore3D({ model, row, target, purpose, onClose }: Props) {
  const { t, lang } = useI18n()
  const { site } = row
  const body = target.body as Planet
  const earthRef = useRef<HTMLDivElement>(null)
  const planetRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const maps = useRef<{ earth: MlMap | null; planet: MlMap | null }>({ earth: null, planet: null })
  const [orbiting, setOrbiting] = useState(() => !prefersReducedMotion())
  const orbitRef = useRef(orbiting)
  const [loading, setLoading] = useState(true)
  const [region, setRegion] = useState<TerrainRegion | null | undefined>(undefined)
  const radiusKm = site.radiusKm ?? 3
  const color = scoreColor(row.score)

  // Tres dimensiones con más peso que tengan valor en los dos lados.
  const keyDims = useMemo(() => {
    const weights = activeWeights(model.file, purpose)
    return model.dimensions
      .filter((d) => (weights[d.id] ?? 0) > 0)
      .sort((a, b) => (weights[b.id] ?? 0) - (weights[a.id] ?? 0))
      .filter((d) => formatValue(site.values[d.id], d, lang) !== null && formatValue(target.values[d.id], d, lang) !== null)
      .slice(0, 3)
  }, [model, purpose, site, target, lang])

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

  useEffect(() => {
    if (region === undefined || !earthRef.current || !planetRef.current) return
    const reduced = prefersReducedMotion()
    const zEarth = framingZoom(site.lat, radiusKm, earthRef.current.clientWidth)
    const zPlanet = sameScaleZoom(zEarth, site.lat, target.lat, BODIES[body].radiusKm)
    const offset = zPlanet - zEarth

    const common = { attributionControl: false, maxPitch: 85, fadeDuration: 0 } as const
    const earth = new MlMap({
      ...common,
      container: earthRef.current,
      style: earthStyle(site.lon, site.lat, radiusKm, color),
      center: [site.lon, site.lat],
      zoom: zEarth - 4,
    })
    const planet = new MlMap({
      ...common,
      container: planetRef.current,
      style: planetStyle(body, region, target, radiusKm),
      center: [target.lon, target.lat],
      zoom: zPlanet - 4,
    })
    maps.current = { earth, planet }
    // Atribución arriba a la derecha, plegada, para dejar libre el panel de datos de abajo.
    for (const m of [earth, planet]) m.addControl(new AttributionControl({ compact: true }), 'top-right')

    let loaded = 0
    let raf = 0
    let last = 0
    const onLoad = () => {
      loaded += 1
      if (loaded < 2) return
      earth.setTerrain({ source: DEM_SOURCE, exaggeration: VISUAL_EXAGGERATION })
      if (region) planet.setTerrain({ source: DEM_SOURCE, exaggeration: proportionalExaggeration(BODIES[body].radiusKm, VISUAL_EXAGGERATION) })
      setLoading(false)
      const flight = { pitch: PITCH, bearing: -20, duration: reduced ? 0 : 5000, essential: true, curve: 1.3 }
      earth.flyTo({ ...flight, center: [site.lon, site.lat], zoom: zEarth })
      planet.flyTo({ ...flight, center: [target.lon, target.lat], zoom: zPlanet })
      earth.once('moveend', () => {
        last = performance.now()
        raf = requestAnimationFrame(spin)
      })
    }
    earth.once('load', onLoad)
    planet.once('load', onLoad)

    // Giro lento de las dos cámaras alrededor de su sitio.
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

    // Lo que hace el usuario en un mapa se copia en el otro: rumbo, inclinación y zoom a la misma escala.
    const stopOrbit = () => {
      orbitRef.current = false
      setOrbiting(false)
    }
    const mirror = (from: MlMap, to: MlMap, dz: number) => (e: MapLibreEvent<unknown>) => {
      if (!e.originalEvent) return
      to.jumpTo({ bearing: from.getBearing(), pitch: from.getPitch(), zoom: from.getZoom() + dz })
    }
    earth.on('move', mirror(earth, planet, offset))
    planet.on('move', mirror(planet, earth, -offset))
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
    }
  }, [region, site.lat, site.lon, target, body, radiusKm, color])

  const toggleOrbit = () => {
    orbitRef.current = !orbitRef.current
    setOrbiting(orbitRef.current)
  }

  const label = (text: string) => <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">{text}</span>

  return (
    <div role="dialog" aria-modal="true" aria-label={t('explore.title')} className="gm-explore fixed inset-0 z-50 flex flex-col bg-space text-white">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-space px-4 py-2.5">
        <div className="min-w-0">
          {label(t('explore.title'))}
          <p className="truncate font-serif text-lg font-semibold leading-tight">
            {site.name} <span className="text-white/50">↔</span> {target.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {row.score !== null && (
            <span className="hidden items-baseline gap-1 rounded-lg bg-white/10 px-3 py-1.5 sm:flex">
              <span className="font-mono text-lg font-semibold tabular-nums">{score100(row.score)}</span>
              <span className="text-xs text-white/60">/100</span>
            </span>
          )}
          <button
            type="button"
            onClick={toggleOrbit}
            aria-pressed={orbiting}
            className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20"
          >
            {orbiting ? t('explore.pause') : t('explore.orbit')}
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-ink hover:bg-white/90"
          >
            {t('explore.close')}
          </button>
        </div>
      </header>

      <div className="relative grid min-h-0 flex-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1">
        {[
          { ref: earthRef, b: 'earth' as const, name: site.name, lat: site.lat, lon: site.lon, note: null },
          {
            ref: planetRef,
            b: body,
            name: target.name,
            lat: target.lat,
            lon: target.lon,
            note: region === null ? t('explore.noTerrain') : region ? t('explore.elevation', {
              min: region.elevationRangeM[0].toLocaleString(lang),
              max: region.elevationRangeM[1].toLocaleString(lang),
            }) : null,
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
            </div>
          </div>
        ))}

        {keyDims.length > 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-10 z-10 flex justify-center px-3">
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
            {t('explore.scaleNote', { x: VISUAL_EXAGGERATION.toLocaleString(lang), km: radiusKm.toLocaleString(lang) })}
          </p>
        </div>

        {loading && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-space/90 text-sm text-white/85" role="status">
            {t('explore.loading')}
          </div>
        )}
      </div>
    </div>
  )
}
