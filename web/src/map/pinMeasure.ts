import { commonStep, measurePatch, patchGrid } from '../lib/patch'
import type { PatchStats, Sampler } from '../lib/patch'
import { EARTH_RADIUS_KM, metresPerPixel, sampleGrid } from '../lib/terrain'
import type { ElevationGrid } from '../lib/terrain'
import { BODIES } from './bodies'
import type { Planet } from './planetaryImagery'
import { loadTerrainRegions, regionGrids } from './planetTerrain'
import { EARTH_LENS_MAX_ZOOM, earthTileElevations } from './reliefLens'
import { MATCH_RADIUS_KM, MATCH_STEP_M } from '../lib/terrainMatch'
import { boxAround, demCovers, GLOBAL_DEMS, readDemWindow } from './usgsDem'

// Pin libre: mide el relieve real alrededor de un punto de la Tierra y de un punto del objetivo con
// el mismo radio y el mismo paso. Tierra: Terrain Tiles. Objetivo: las rejillas de USGS de la región.

const RAD = Math.PI / 180
const TILE = 256
/** Cobertura mínima para aceptar una rejilla del objetivo; si no llega, se prueba la siguiente. */
const MIN_COVERAGE = 0.95

export interface PinPoint {
  lon: number
  lat: number
}

export interface PinMeasurement {
  stepM: number
  radiusKm: number
  earth: PatchStats | null
  /** Tamaño del píxel de la tesela de la Tierra usada (m). */
  earthPixelM: number
  planet: PatchStats | null
  /** Resolución del modelo del otro cuerpo usado (m); null si ninguno cubre el área. */
  planetGridM: number | null
  /** Fuente del modelo del otro cuerpo usado. */
  planetSources: { name: string; agency: string; url: string }[]
  /** El modelo global no cubre esa latitud (la Luna, más allá de 60°). */
  outside: boolean
}

function covers(g: ElevationGrid, point: PinPoint, radiusKm: number, bodyRadiusKm: number, stepM: number): boolean {
  const { size, point: at } = patchGrid(point.lon, point.lat, radiusKm, bodyRadiusKm, stepM)
  const [west, north] = at(0, 0)
  const [east, south] = at(size - 1, size - 1)
  const [w, s, e, n] = g.bounds
  return west >= w && east <= e && south >= s && north <= n
}

/** Zoom de Terrain Tiles cuyo píxel no supera el paso, como máximo z12 (SRTM de 30 m). */
function earthZoomFor(stepM: number, lat: number): number {
  const z0 = metresPerPixel(0, lat, EARTH_RADIUS_KM)
  return Math.max(0, Math.min(EARTH_LENS_MAX_ZOOM, Math.ceil(Math.log2(z0 / stepM))))
}
/** Muestreo bilineal de Terrain Tiles en un zoom, con las teselas del área ya descargadas. */
async function earthSampler(point: PinPoint, radiusKm: number, stepM: number, zoom: number): Promise<Sampler> {
  const n = 2 ** zoom
  const toPx = (lon: number, lat: number): [number, number] => {
    const s = Math.sin(lat * RAD)
    return [((lon + 180) / 360) * n * TILE - 0.5, (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n * TILE - 0.5]
  }
  const { size, point: at } = patchGrid(point.lon, point.lat, radiusKm, EARTH_RADIUS_KM, stepM)
  const [x0, y0] = toPx(...at(0, 0))
  const [x1, y1] = toPx(...at(size - 1, size - 1))
  const tiles = new Map<string, Float32Array>()
  const jobs: Promise<void>[] = []
  for (let ty = Math.floor((y0 - 1) / TILE); ty <= Math.floor((y1 + 1) / TILE); ty++) {
    for (let tx = Math.floor((x0 - 1) / TILE); tx <= Math.floor((x1 + 1) / TILE); tx++) {
      const x = ((tx % n) + n) % n
      if (ty < 0 || ty >= n) continue
      jobs.push(earthTileElevations(zoom, x, ty).then((elev) => void tiles.set(`${tx}/${ty}`, elev)))
    }
  }
  await Promise.all(jobs)
  const value = (px: number, py: number) => {
    const t = tiles.get(`${Math.floor(px / TILE)}/${Math.floor(py / TILE)}`)
    if (!t) return null
    return t[(((py % TILE) + TILE) % TILE) * TILE + (((px % TILE) + TILE) % TILE)]
  }
  return (lon, lat) => {
    const [x, y] = toPx(lon, lat)
    const px = Math.floor(x)
    const py = Math.floor(y)
    const a = value(px, py)
    const b = value(px + 1, py)
    const c = value(px, py + 1)
    const d = value(px + 1, py + 1)
    if (a === null || b === null || c === null || d === null) return null
    const fx = x - px
    const fy = y - py
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy
  }
}

/**
 * Mide un punto de Marte o de la Luna como las herramientas miden los objetivos: modelo global de USGS,
 * paso de MATCH_STEP_M y círculo de MATCH_RADIUS_KM. null si el modelo no cubre el punto.
 */
export async function measurePlanetPoint(point: PinPoint, body: Planet): Promise<PatchStats | null> {
  const dem = GLOBAL_DEMS[body]
  if (!demCovers(dem, point.lat)) return null
  const radius = BODIES[body].radiusKm
  const g = await readDemWindow(dem, ...boxAround(point.lon, point.lat, MATCH_RADIUS_KM + 1, radius))
  return measurePatch((lon, lat) => sampleGrid(g, lon, lat, false), point.lon, point.lat, MATCH_RADIUS_KM, radius, MATCH_STEP_M)
}

/**
 * Mide los dos lados. El paso común es la resolución más gruesa: la del píxel de la Tierra en z12 o la
 * del modelo más fino del otro cuerpo que cubre todo el círculo con datos. Primero se prueban los
 * modelos de detalle del manifiesto (CTX, HiRISE); si ninguno cubre el círculo, el modelo global de USGS.
 */
export async function measurePins(earth: PinPoint, planet: PinPoint, body: Planet, radiusKm: number): Promise<PinMeasurement> {
  const earthPixelZ12 = metresPerPixel(EARTH_LENS_MAX_ZOOM, earth.lat, EARTH_RADIUS_KM)
  const planetRadius = BODIES[body].radiusKm
  const dem = GLOBAL_DEMS[body]

  let stepM = commonStep(earthPixelZ12, dem.resolutionM)
  let planetStats: PatchStats | null = null
  let planetGridM: number | null = null
  let planetSources: PinMeasurement['planetSources'] = []
  const consider = (g: ElevationGrid, sources: PinMeasurement['planetSources']) => {
    const step = commonStep(earthPixelZ12, g.resolutionM)
    if (!covers(g, planet, radiusKm, planetRadius, step)) return false
    const stats = measurePatch((lon, lat) => sampleGrid(g, lon, lat, false), planet.lon, planet.lat, radiusKm, planetRadius, step)
    if (!stats) return false
    if (!planetStats || stats.coverage > planetStats.coverage) {
      planetStats = stats
      planetGridM = g.resolutionM
      planetSources = sources
      stepM = step
    }
    return stats.coverage >= MIN_COVERAGE
  }

  let done = false
  for (const region of await loadTerrainRegions(body)) {
    if (done) break
    const [w, s, e, n] = region.bounds
    if (planet.lon < w || planet.lon > e || planet.lat < s || planet.lat > n) continue
    for (const g of await regionGrids(body, region)) {
      if (consider(g, region.sources)) {
        done = true
        break
      }
    }
  }
  const outside = !demCovers(dem, planet.lat)
  if (!done && !outside) {
    const margin = radiusKm + 1
    const g = await readDemWindow(dem, ...boxAround(planet.lon, planet.lat, margin, planetRadius))
    consider(g, [dem.source])
  }

  const zoom = earthZoomFor(stepM, earth.lat)
  const sampler = await earthSampler(earth, radiusKm, stepM, zoom)
  return {
    stepM,
    radiusKm,
    earth: measurePatch(sampler, earth.lon, earth.lat, radiusKm, EARTH_RADIUS_KM, stepM),
    earthPixelM: metresPerPixel(zoom, earth.lat, EARTH_RADIUS_KM),
    planet: planetStats,
    planetGridM,
    planetSources,
    outside,
  }
}
