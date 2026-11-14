import { useEffect, useRef, useState } from 'react'
import { Map as MlMap, Marker } from 'maplibre-gl'
import type { StyleSpecification } from 'maplibre-gl'
import type { Target } from '../data/schema'
import { useI18n } from '../i18n'
import { PlanetFallback } from './PlanetFallback'
import { IMAGERY, MARS_DETAIL, MERCATOR_LIMIT } from './planetaryImagery'
import type { Planet } from './planetaryImagery'
import { hasWebgl2, prefersReducedMotion } from './runtime'
import './planetTiles'

const IMAGERY_SOURCE = 'planetary-imagery'
const DETAIL_SOURCE = 'mars-ctx'
type Coordinates = [number, number]

function focusPlanetTarget(map: MlMap, center: Coordinates) {
  map.flyTo({ center, zoom: 4.5, duration: prefersReducedMotion() ? 0 : 1400 })
}

function overviewZoom(container: HTMLElement) {
  const size = Math.min(container.clientWidth, container.clientHeight)
  return Math.max(0, Math.min(2, Math.log2(Math.max(1, size) / 200)))
}

function overviewCenter(body: Planet, targets: Target[]): Coordinates {
  if (!targets.length) return IMAGERY[body].center
  const radians = Math.PI / 180
  let x = 0
  let y = 0
  let z = 0
  for (const { lon, lat } of targets) {
    x += Math.cos(lat * radians) * Math.cos(lon * radians)
    y += Math.cos(lat * radians) * Math.sin(lon * radians)
    z += Math.sin(lat * radians)
  }
  const horizontal = Math.hypot(x, y)
  if (Math.hypot(horizontal, z) < 1e-8) return IMAGERY[body].center
  const latitude = Math.atan2(z, horizontal) / radians
  return [Math.atan2(y, x) / radians, Math.max(-MERCATOR_LIMIT, Math.min(MERCATOR_LIMIT, latitude))]
}

function planetStyle(body: Planet): StyleSpecification {
  const info = IMAGERY[body]
  const style: StyleSpecification = {
    version: 8,
    projection: { type: 'globe' },
    sources: {
      [IMAGERY_SOURCE]: {
        type: 'raster',
        tiles: [`planet-trek://${body}/{z}/{x}/{y}`],
        maxzoom: info.maxLevel + 1,
        tileSize: 256,
      },
    },
    layers: [{
      id: 'surface',
      type: 'raster',
      source: IMAGERY_SOURCE,
      paint: {
        'raster-fade-duration': 0,
        'raster-contrast': body === 'mars' ? 0.12 : 0.08,
        'raster-saturation': body === 'mars' ? 0.08 : 0,
      },
    }],
  }
  if (body === 'mars') {
    style.sources[DETAIL_SOURCE] = {
      type: 'raster',
      tiles: ['planet-trek://mars-ctx/{z}/{x}/{y}'],
      tileSize: 512,
      maxzoom: MARS_DETAIL.maxZoom,
    }
    style.layers.push({
      id: DETAIL_SOURCE,
      source: DETAIL_SOURCE,
      type: 'raster',
      minzoom: MARS_DETAIL.startZoom,
      paint: {
        'raster-opacity': ['interpolate', ['linear'], ['zoom'], MARS_DETAIL.startZoom, 0, MARS_DETAIL.startZoom + 0.7, 1],
      },
    })
  }
  return style
}

export function PlanetMap({ body, targets, target, onTarget }: {
  body: Planet; targets: Target[]; target: Target | null; onTarget: (id: string) => void
}) {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MlMap | null>(null)
  const pins = useRef<Marker[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>(() =>
    typeof OffscreenCanvas !== 'undefined' && hasWebgl2() ? 'loading' : 'failed',
  )
  const failed = status === 'failed'
  const [showDetailCredit, setShowDetailCredit] = useState(false)
  const [overviewLon, overviewLat] = overviewCenter(body, targets)
  const lon = target?.lon
  const lat = target?.lat
  const activeId = target?.id

  useEffect(() => {
    if (failed || !ref.current) return

    const map = new MlMap({
      container: ref.current,
      style: planetStyle(body),
      center: [overviewLon, overviewLat],
      zoom: overviewZoom(ref.current),
      minZoom: 0,
      maxZoom: body === 'mars' ? MARS_DETAIL.maxZoom : IMAGERY[body].maxLevel + 1,
      maxPitch: 0,
      dragRotate: false,
      renderWorldCopies: false,
      attributionControl: false,
    })
    mapRef.current = map
    let hasImagery = false
    let settled = false
    const timeout = window.setTimeout(() => {
      if (!settled) setStatus(hasImagery ? 'ready' : 'failed')
    }, 8000)
    map.on('sourcedata', (event) => {
      if (event.sourceId === IMAGERY_SOURCE && event.tile?.hasData()) hasImagery = true
      if (event.sourceId !== IMAGERY_SOURCE || !hasImagery || !event.isSourceLoaded) return
      settled = true
      window.clearTimeout(timeout)
      setStatus('ready')
    })
    map.on('idle', () => {
      settled = true
      window.clearTimeout(timeout)
      setStatus(hasImagery ? 'ready' : 'failed')
    })
    if (body === 'mars') {
      map.on('zoomend', () => setShowDetailCredit(map.getZoom() >= MARS_DETAIL.startZoom))
    }
    map.on('webglcontextlost', () => setStatus('failed'))

    return () => {
      window.clearTimeout(timeout)
      map.remove()
      mapRef.current = null
    }
  }, [body, failed, overviewLon, overviewLat])

  useEffect(() => {
    const map = mapRef.current
    if (!map || status !== 'ready') return
    pins.current = targets.filter(({ lat }) => Math.abs(lat) <= MERCATOR_LIMIT).map((point) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'planet-pin'
      button.setAttribute('aria-label', point.name)
      button.dataset.target = point.id
      const dot = document.createElement('span')
      dot.className = 'planet-pin-dot'
      const label = document.createElement('span')
      label.className = 'planet-pin-label'
      label.textContent = point.name
      button.append(dot, label)
      button.addEventListener('click', () => {
        if (button.getAttribute('aria-pressed') === 'true') {
          focusPlanetTarget(map, [point.lon, point.lat])
        }
        onTarget(point.id)
      })
      return new Marker({ element: button, opacityWhenCovered: 0, subpixelPositioning: true })
        .setLngLat([point.lon, point.lat])
        .addTo(map)
    })
    return () => {
      for (const pin of pins.current) pin.remove()
      pins.current = []
    }
  }, [status, targets, onTarget, overviewLon, overviewLat])

  useEffect(() => {
    for (const pin of pins.current) {
      const button = pin.getElement()
      button.setAttribute('aria-pressed', String(button.dataset.target === activeId))
    }
  }, [status, targets, onTarget, activeId])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (lat === undefined || lon === undefined) {
      map.jumpTo({ center: [overviewLon, overviewLat], zoom: overviewZoom(map.getContainer()) })
      return
    }
    focusPlanetTarget(map, [lon, lat])
  }, [failed, lon, lat, overviewLon, overviewLat])

  const showOverview = () => {
    const map = mapRef.current
    if (!map) return
    map.easeTo({
      center: [overviewLon, overviewLat],
      zoom: overviewZoom(map.getContainer()),
      duration: prefersReducedMotion() ? 0 : 650,
    })
  }

  const info = IMAGERY[body]
  const tool = 'grid size-9 place-items-center rounded-md border border-white/20 bg-space/95 text-white hover:bg-ink'
  return (
    <div className="absolute inset-0" role="region" aria-label={t('map.planet', { body: t(`body.${body}`) })}>
      {!failed && <div ref={ref} className="h-full w-full" />}
      {status === 'loading' && (
        <div className="absolute inset-0 grid place-items-center bg-space text-sm text-white/85" role="status">
          {t('map.loading')}
        </div>
      )}
      {failed && <PlanetFallback body={body} />}
      {status === 'ready' && (
        <>
          <div className="absolute bottom-8 right-2 flex flex-col gap-1" role="group" aria-label={t('map.view')}>
            <button type="button" className={tool} aria-label={t('map.overview')} title={t('map.overview')} onClick={showOverview}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" />
              </svg>
            </button>
            <button type="button" className={tool} aria-label={t('map.zoomIn')} onClick={() => mapRef.current?.zoomIn({ duration: 180 })}>+</button>
            <button type="button" className={tool} aria-label={t('map.zoomOut')} onClick={() => mapRef.current?.zoomOut({ duration: 180 })}>−</button>
          </div>
          <div className="absolute bottom-0 left-0 flex max-w-full flex-wrap gap-x-2 bg-space/90 px-2 py-1 text-[10px] text-white [&_a]:underline [&_a]:underline-offset-2">
            <a href={info.mapUrl} target="_blank" rel="noopener noreferrer">{info.mapCredit}</a>
            {showDetailCredit && <a href={MARS_DETAIL.source} target="_blank" rel="noopener noreferrer">{MARS_DETAIL.credit}</a>}
          </div>
        </>
      )}
    </div>
  )
}
