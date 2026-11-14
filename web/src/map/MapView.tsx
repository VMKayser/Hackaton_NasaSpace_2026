import type { FeatureCollection } from 'geojson'
import { LngLat, LngLatBounds, Map as MlMap, NavigationControl, Popup } from 'maplibre-gl'
import type { GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { RankedSite } from '../lib/ranking'
import type { View } from '../lib/state'
import { baseStyle, DEM_SOURCE, siteLayers, SITES_HIT_LAYER, SITES_SOURCE } from './style'
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

function boundsOf(rows: RankedSite[]): LngLatBounds | null {
  if (!rows.length) return null
  const b = new LngLatBounds()
  for (const r of rows) b.extend([r.site.lon, r.site.lat])
  return b
}

export function MapView({ rows, neutral, selectedId, compareIds, view, frameKey, label, noWebglText, scoreLabel, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MlMap | null>(null)
  const [ready, setReady] = useState(false)
  const [webgl] = useState(hasWebgl2)

  // Valores actuales para los manejadores de eventos del mapa, que se registran una sola vez.
  const latest = useRef({ rows, onSelect, scoreLabel })
  useEffect(() => {
    latest.current = { rows, onSelect, scoreLabel }
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
    map.addControl(new NavigationControl({ visualizePitch: true }), 'bottom-right')

    const popup = new Popup({ closeButton: false, closeOnClick: false, offset: 14, className: 'gm-popup' })

    map.on('load', () => {
      map.setProjection({ type: 'globe' })
      map.addSource(SITES_SOURCE, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      for (const layer of siteLayers) map.addLayer(layer)

      map.on('click', SITES_HIT_LAYER, (e: MapLayerMouseEvent) => {
        const id = e.features?.[0]?.properties?.id
        if (typeof id === 'string') latest.current.onSelect(id)
      })
      map.on('mousemove', SITES_HIT_LAYER, (e: MapLayerMouseEvent) => {
        const id = e.features?.[0]?.properties?.id
        const row = latest.current.rows.find((r) => r.site.id === id)
        if (!row) return
        map.getCanvas().style.cursor = 'pointer'
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
        map.getCanvas().style.cursor = ''
        popup.remove()
      })
      setReady(true)
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
  }, [ready, data])

  // Vista: globo o 2D con relieve.
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map) return
    const duration = prefersReducedMotion() ? 0 : 1200
    if (view === '2d') {
      map.setProjection({ type: 'mercator' })
      map.setTerrain({ source: DEM_SOURCE, exaggeration: 1.5 })
      map.setLayoutProperty('hillshade', 'visibility', 'visible')
      map.easeTo({ pitch: 60, duration })
    } else {
      map.setTerrain(null)
      map.setLayoutProperty('hillshade', 'visibility', 'none')
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
    const compared = comparedKey.split(',')
    const bounds = boundsOf(comparedKey
      ? latest.current.rows.filter((row) => compared.includes(row.site.id))
      : latest.current.rows)
    if (!bounds) return
    const isSmall = map.getContainer().clientWidth < 420
    map.fitBounds(bounds, {
      padding: isSmall ? 28 : { top: 70, bottom: 50, left: 48, right: 48 },
      maxZoom: 7,
      pitch: view === '2d' ? 50 : 0,
      duration: reduced ? 0 : 2600,
      essential: true,
    })
    // view no entra en las dependencias: cambiar de vista no debe volver a encuadrar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, selectedLngLat, frameKey, comparedKey])

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
