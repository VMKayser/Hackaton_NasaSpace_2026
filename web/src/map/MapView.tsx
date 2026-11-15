import type { FeatureCollection } from 'geojson'
import { LngLat, LngLatBounds, Map as MlMap, NavigationControl, Popup } from 'maplibre-gl'
import type { GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { RankedSite } from '../lib/ranking'
import type { Point, View } from '../lib/state'
import { circleRing, EARTH_RADIUS_KM } from '../lib/terrain'
import { PIN_SOURCE, pinData, pinLayers } from './pinLayers'
import { AREA_SOURCE, areaLayers, baseStyle, columnLayer, COLUMNS_SOURCE, DEM_SOURCE, siteLayers, SITES_HIT_LAYER, SITES_SOURCE } from './style'
import { hasWebgl2, prefersReducedMotion } from './runtime'

interface Props {
  rows: RankedSite[]
  /** Sin objetivo elegido: todos los sitios en blanco, sin puntaje. */
  neutral: boolean
  selectedId: string | null
  compareIds: string[] | null
  view: View
  /** Cambia cuando cambian el propósito o el objetivo: vuelve a encuadrar los sitios. */
  frameKey: string
  label: string
  noWebglText: string
  scoreLabel: (row: RankedSite) => string
  onSelect: (id: string) => void
  /** Pin libre en la Tierra y radio del círculo medido. */
  pin: Point | null
  pinRadiusKm: number
  /** Con el modo de pin activo, un clic pone el pin en lugar de elegir un sitio. */
  pinMode: boolean
  onPin: (point: Point) => void
  countryFilter?: string | null
}

function toGeoJson(rows: RankedSite[], selectedId: string | null, compareIds: string[] | null, neutral: boolean): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: rows.map((r) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [r.site.lon, r.site.lat] },
      properties: {
        id: r.site.id,
        score: r.score ?? 0,
        evaluated: neutral || r.score !== null,
        neutral,
        known: r.site.known,
        reference: r.site.reference,
        control: r.site.control,
        selected: compareIds ? compareIds.includes(r.site.id) : r.site.id === selectedId,
      },
    })),
  }
}

/** Columnas hexagonales de 10 km de radio, solo para los sitios con puntaje. */
function toColumns(rows: RankedSite[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: rows.filter((r) => r.score !== null).map((r) => ({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [circleRing(r.site.lon, r.site.lat, 10, EARTH_RADIUS_KM, 6)] },
      properties: { id: r.site.id, score: r.score },
    })),
  }
}

function toArea(row: RankedSite | undefined): FeatureCollection {
  if (!row?.site.radiusKm) return { type: 'FeatureCollection', features: [] }
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: circleRing(row.site.lon, row.site.lat, row.site.radiusKm, EARTH_RADIUS_KM) },
      properties: {},
    }],
  }
}

function boundsOf(rows: RankedSite[]): LngLatBounds | null {
  if (!rows.length) return null
  const b = new LngLatBounds()
  for (const r of rows) b.extend([r.site.lon, r.site.lat])
  return b
}

export function MapView({ rows, neutral, selectedId, compareIds, view, frameKey, label, noWebglText, scoreLabel, onSelect, pin, pinRadiusKm, pinMode, onPin, countryFilter }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MlMap | null>(null)
  const [ready, setReady] = useState(false)
  const [webgl] = useState(hasWebgl2)

  // Valores actuales para los manejadores de eventos del mapa, que se registran una sola vez.
  const latest = useRef({ rows, onSelect, scoreLabel, pin, pinMode, onPin })
  useEffect(() => {
    latest.current = { rows, onSelect, scoreLabel, pin, pinMode, onPin }
  })

  const data = useMemo(() => toGeoJson(rows, selectedId, compareIds, neutral), [rows, selectedId, compareIds, neutral])

  // Crear el mapa una sola vez.
  useEffect(() => {
    if (!webgl || !containerRef.current) return
    const initialBounds = boundsOf(latest.current.rows)
    const center = initialBounds?.getCenter() ?? new LngLat(-60, -15)
    const map = new MlMap({
      container: containerRef.current,
      style: baseStyle,
      center: [center.lng - 25, center.lat + 5],
      zoom: 1.4,
      attributionControl: { compact: true },
      maxPitch: 75,
    })
    mapRef.current = map
    map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right')

    const popup = new Popup({ closeButton: false, closeOnClick: false, offset: 14, className: 'gm-popup' })

    map.on('load', () => {
      map.setProjection({ type: 'globe' })
      map.addSource(SITES_SOURCE, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addSource(COLUMNS_SOURCE, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addSource(AREA_SOURCE, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addLayer(columnLayer)
      for (const layer of areaLayers) map.addLayer(layer)
      for (const layer of siteLayers) map.addLayer(layer)
      map.addSource(PIN_SOURCE, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      for (const layer of pinLayers) map.addLayer(layer)

      map.on('click', SITES_HIT_LAYER, (e: MapLayerMouseEvent) => {
        if (latest.current.pinMode) return
        const id = e.features?.[0]?.properties?.id
        if (typeof id === 'string') latest.current.onSelect(id)
      })
      map.on('click', (e) => {
        if (latest.current.pinMode) latest.current.onPin({ lon: e.lngLat.wrap().lng, lat: e.lngLat.lat })
      })
      map.on('mousemove', SITES_HIT_LAYER, (e: MapLayerMouseEvent) => {
        const id = e.features?.[0]?.properties?.id
        const row = latest.current.rows.find((r) => r.site.id === id)
        if (!row) return
        map.getCanvas().style.cursor = latest.current.pinMode ? 'crosshair' : 'pointer'
        const el = document.createElement('div')
        const name = document.createElement('strong')
        name.textContent = row.site.name
        const score = document.createElement('div')
        score.style.color = 'var(--color-muted)'
        score.textContent = latest.current.scoreLabel(row)
        el.append(name, score)
        popup.setLngLat([row.site.lon, row.site.lat]).setDOMContent(el).addTo(map)
      })
      map.on('mouseleave', SITES_HIT_LAYER, () => {
        map.getCanvas().style.cursor = latest.current.pinMode ? 'crosshair' : ''
        popup.remove()
      })
      setReady(true)
      // Pin que llega en la URL (enlace compartido): se encuadra al abrir.
      const first = latest.current.pin
      if (first) map.jumpTo({ center: [first.lon, first.lat], zoom: 9 })
    })

    return () => {
      popup.remove()
      map.remove()
      mapRef.current = null
      setReady(false)
    }
  }, [webgl])

  // Datos de los sitios.
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map) return
    ;(map.getSource(SITES_SOURCE) as GeoJSONSource | undefined)?.setData(data)
    ;(map.getSource(COLUMNS_SOURCE) as GeoJSONSource | undefined)?.setData(neutral ? toColumns([]) : toColumns(rows))
  }, [ready, data, rows, neutral])

  // Anillo del área analizada del sitio elegido.
  const selectedRow = rows.find((r) => r.site.id === selectedId)
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map) return
    ;(map.getSource(AREA_SOURCE) as GeoJSONSource | undefined)?.setData(toArea(selectedRow))
  }, [ready, selectedRow])

  // Pin libre: el punto, su círculo y el cursor de colocación.
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map) return
    ;(map.getSource(PIN_SOURCE) as GeoJSONSource | undefined)?.setData(pinData(pin, pinRadiusKm, EARTH_RADIUS_KM))
  }, [ready, pin, pinRadiusKm])
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map) return
    map.getCanvas().style.cursor = pinMode ? 'crosshair' : ''
  }, [ready, pinMode])

  // Vista: globo o 2D con relieve.
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map) return
    const duration = prefersReducedMotion() ? 0 : 1200
    if (view === '2d') {
      map.setProjection({ type: 'mercator' })
      map.setTerrain({ source: DEM_SOURCE, exaggeration: 1.5 })
      map.setLayoutProperty('hillshade', 'visibility', 'visible')
      map.setLayoutProperty(columnLayer.id, 'visibility', 'visible')
      map.easeTo({ pitch: 60, duration })
    } else {
      map.setTerrain(null)
      map.setLayoutProperty('hillshade', 'visibility', 'none')
      map.setLayoutProperty(columnLayer.id, 'visibility', 'none')
      map.easeTo({ pitch: 0, duration })
      map.setProjection({ type: 'globe' })
    }
  }, [ready, view])

  // Encuadre: al elegir un sitio, volar hacia él; si no, mostrar todos los sitios.
  const selected = rows.find((r) => r.site.id === selectedId)
  const selectedLngLat = selected ? `${selected.site.lon},${selected.site.lat}` : null
  const comparedKey = compareIds?.join(',') ?? ''
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map) return
    const reduced = prefersReducedMotion()
    if (selectedLngLat) {
      const [lon, lat] = selectedLngLat.split(',').map(Number)
      map.flyTo({
        center: [lon, lat],
        zoom: view === '2d' ? 11.5 : 9.5,
        pitch: view === '2d' ? 62 : 0,
        duration: reduced ? 0 : 2200,
        essential: true,
      })
      return
    }
    // Con un pin libre no se vuelve a encuadrar: el usuario está mirando la zona donde lo puso.
    if (latest.current.pin) return

    let targetRows = latest.current.rows
    if (comparedKey) {
      const compared = comparedKey.split(',')
      targetRows = targetRows.filter((row) => compared.includes(row.site.id))
    } else if (countryFilter && countryFilter.trim()) {
      const q = countryFilter.trim().toLowerCase()
      const matching = targetRows.filter((r) =>
        (r.site.country || '').toLowerCase().includes(q) ||
        r.site.name.toLowerCase().includes(q)
      )
      if (matching.length > 0) {
        targetRows = matching
      }
    }

    if (targetRows.length === 1) {
      map.flyTo({
        center: [targetRows[0].site.lon, targetRows[0].site.lat],
        zoom: view === '2d' ? 9.5 : 8,
        pitch: view === '2d' ? 50 : 0,
        duration: reduced ? 0 : 2200,
        essential: true,
      })
      return
    }

    const bounds = boundsOf(targetRows)
    if (!bounds) return
    const { clientWidth, clientHeight } = map.getContainer()
    const isSmall = clientWidth < 420 || clientHeight < 300
    map.fitBounds(bounds, {
      padding: isSmall ? 28 : { top: 70, bottom: 50, left: 48, right: 48 },
      maxZoom: countryFilter ? 8.5 : 7,
      pitch: view === '2d' ? 50 : 0,
      duration: reduced ? 0 : 2600,
      essential: true,
    })
    // view no entra en las dependencias: cambiar de vista no debe volver a encuadrar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, selectedLngLat, frameKey, comparedKey, countryFilter])

  if (!webgl) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-space p-8 text-center text-sm text-white/80">
        <p className="max-w-sm">{noWebglText}</p>
      </div>
    )
  }

  // maplibre-gl.css pone position: relative en el contenedor: el posicionamiento va en un div exterior.
  return (
    <div className="absolute inset-0" role="region" aria-label={label}>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}
