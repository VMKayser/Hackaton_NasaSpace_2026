import type { ExpressionSpecification, LayerSpecification, StyleSpecification } from 'maplibre-gl'
import { INK, NOT_EVALUATED, SCORE_STOPS } from './colors'

// Fuentes probadas el 14-nov (AGENTS.md). Confirmar licencia y atribución antes de publicar.
const GIBS =
  'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg'
const S2 = 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg'
const TERRAIN = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'

export const DEM_SOURCE = 'dem'

export const baseStyle: StyleSpecification = {
  version: 8,
  sky: {
    'sky-color': '#0b1726',
    'horizon-color': '#3d6e9c',
    'fog-color': '#0b1726',
    'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0],
  },
  sources: {
    gibs: {
      type: 'raster',
      tiles: [GIBS],
      tileSize: 256,
      maxzoom: 8,
      attribution:
        'Imagery: <a href="https://earthdata.nasa.gov/gibs" target="_blank" rel="noopener">NASA GIBS</a> Blue Marble',
    },
    s2: {
      type: 'raster',
      tiles: [S2],
      tileSize: 256,
      maxzoom: 14,
      attribution:
        '<a href="https://s2maps.eu" target="_blank" rel="noopener">Sentinel-2 cloudless 2016</a> by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2016)',
    },
    [DEM_SOURCE]: {
      type: 'raster-dem',
      tiles: [TERRAIN],
      encoding: 'terrarium',
      tileSize: 256,
      maxzoom: 15,
      attribution:
        'Elevation: <a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noopener">Terrain Tiles</a> (Mapzen, AWS Open Data)',
    },
    hillshadeDem: {
      type: 'raster-dem',
      tiles: [TERRAIN],
      encoding: 'terrarium',
      tileSize: 256,
      maxzoom: 15,
    },
  },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#0b1726' } },
    { id: 'gibs', type: 'raster', source: 'gibs' },
    {
      id: 's2',
      type: 'raster',
      source: 's2',
      minzoom: 6,
      paint: { 'raster-opacity': ['interpolate', ['linear'], ['zoom'], 6, 0, 7.5, 1] },
    },
    {
      id: 'hillshade',
      type: 'hillshade',
      source: 'hillshadeDem',
      layout: { visibility: 'none' },
      paint: { 'hillshade-exaggeration': 0.3, 'hillshade-shadow-color': '#1b2735' },
    },
  ],
}

const scoreColor: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['get', 'score'],
  ...SCORE_STOPS.flatMap(([s, c]) => [s, c]),
] as ExpressionSpecification

const isTrue = (prop: string): ExpressionSpecification => ['==', ['get', prop], true]
const fillColor: ExpressionSpecification = [
  'case',
  isTrue('neutral'),
  '#ffffff',
  ['!', isTrue('evaluated')],
  'rgba(0,0,0,0)',
  isTrue('control'),
  'rgba(0,0,0,0)',
  scoreColor,
]
// La interpolación por zoom tiene que ir en el nivel superior de la expresión.
const ZOOM_STEPS: [number, number][] = [
  [2, 0.75],
  [8, 1.2],
  [12, 1.5],
]
const radius = (base: number): ExpressionSpecification =>
  ['interpolate', ['linear'], ['zoom'], ...ZOOM_STEPS.flatMap(([z, k]) => [z, base * k])] as ExpressionSpecification
const radiusIf = (cond: ExpressionSpecification, a: number, b: number): ExpressionSpecification =>
  [
    'interpolate',
    ['linear'],
    ['zoom'],
    ...ZOOM_STEPS.flatMap(([z, k]) => [z, ['case', cond, a * k, b * k]]),
  ] as ExpressionSpecification

export const SITES_SOURCE = 'sites'
export const SITES_HIT_LAYER = 'sites-main'

// Formas distintas, no solo color: disco (candidato), anillo exterior (conocido), punto central
// (referencia), aro hueco (control), aro gris pequeño (no evaluado).
export const siteLayers: LayerSpecification[] = [
  {
    id: 'sites-selected',
    type: 'circle',
    source: SITES_SOURCE,
    filter: isTrue('selected'),
    paint: {
      'circle-radius': radius(17),
      'circle-color': 'rgba(255,255,255,0.22)',
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2.5,
    },
  },
  {
    id: 'sites-known-halo',
    type: 'circle',
    source: SITES_SOURCE,
    filter: isTrue('known'),
    paint: {
      'circle-radius': radius(11.5),
      'circle-color': 'rgba(0,0,0,0)',
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 4,
    },
  },
  {
    id: 'sites-known',
    type: 'circle',
    source: SITES_SOURCE,
    filter: isTrue('known'),
    paint: {
      'circle-radius': radius(11.5),
      'circle-color': 'rgba(0,0,0,0)',
      'circle-stroke-color': INK,
      'circle-stroke-width': 1.5,
    },
  },
  {
    id: SITES_HIT_LAYER,
    type: 'circle',
    source: SITES_SOURCE,
    paint: {
      'circle-radius': radiusIf(['!', isTrue('evaluated')], 5.5, 8),
      'circle-color': fillColor,
      'circle-stroke-color': [
        'case',
        isTrue('neutral'),
        INK,
        ['!', isTrue('evaluated')],
        NOT_EVALUATED,
        isTrue('control'),
        scoreColor,
        '#ffffff',
      ],
      'circle-stroke-width': ['case', ['!', isTrue('evaluated')], 2.5, isTrue('control'), 3.5, 2],
    },
  },
  {
    id: 'sites-reference-dot',
    type: 'circle',
    source: SITES_SOURCE,
    filter: isTrue('reference'),
    paint: {
      'circle-radius': radius(2.8),
      'circle-color': '#ffffff',
      'circle-stroke-color': INK,
      'circle-stroke-width': 1,
    },
  },
]
