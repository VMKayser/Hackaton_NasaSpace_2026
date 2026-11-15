import type { FeatureCollection } from 'geojson'
import type { LayerSpecification } from 'maplibre-gl'
import { circleRing } from '../lib/terrain'
import type { Point } from '../lib/state'

// Pin libre en los mapas: el punto, el círculo medido y, en el objetivo, la zona con modelo de elevación.

export const PIN_SOURCE = 'free-pin'
export const COVERAGE_SOURCE = 'terrain-coverage'
export const PIN_COLOR = '#facc15'

const empty: FeatureCollection = { type: 'FeatureCollection', features: [] }

export function pinData(point: Point | null, radiusKm: number, bodyRadiusKm: number): FeatureCollection {
  if (!point) return empty
  return {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: circleRing(point.lon, point.lat, radiusKm, bodyRadiusKm) } },
      { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [point.lon, point.lat] } },
    ],
  }
}

export function coverageData(bounds: [number, number, number, number] | null): FeatureCollection {
  if (!bounds) return empty
  const [w, s, e, n] = bounds
  return {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[w, s], [e, s], [e, n], [w, n], [w, s]] } }],
  }
}

export const pinLayers: LayerSpecification[] = [
  {
    id: 'free-pin-glow',
    type: 'line',
    source: PIN_SOURCE,
    filter: ['==', ['geometry-type'], 'LineString'],
    paint: { 'line-color': PIN_COLOR, 'line-width': 10, 'line-blur': 7, 'line-opacity': 0.45 },
  },
  {
    id: 'free-pin-ring',
    type: 'line',
    source: PIN_SOURCE,
    filter: ['==', ['geometry-type'], 'LineString'],
    paint: { 'line-color': '#fffbeb', 'line-width': 2, 'line-dasharray': [2, 1.5] },
  },
  {
    id: 'free-pin-dot',
    type: 'circle',
    source: PIN_SOURCE,
    filter: ['==', ['geometry-type'], 'Point'],
    paint: {
      'circle-radius': 7,
      'circle-color': PIN_COLOR,
      'circle-stroke-color': '#0b1726',
      'circle-stroke-width': 2.5,
      'circle-pitch-alignment': 'viewport',
    },
  },
]

export const coverageLayers: LayerSpecification[] = [
  {
    id: 'terrain-coverage',
    type: 'line',
    source: COVERAGE_SOURCE,
    paint: { 'line-color': PIN_COLOR, 'line-width': 1.5, 'line-dasharray': [3, 2], 'line-opacity': 0.9 },
  },
]
