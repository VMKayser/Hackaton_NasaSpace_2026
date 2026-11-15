import { addProtocol } from 'maplibre-gl'
import type * as GeoJSON from 'geojson'
import { z } from 'zod'
import { elevationAt, encodeTerrarium, decodeTerrarium, sampleGrid } from '../lib/terrain'
import type { ElevationGrid } from '../lib/terrain'
import { BODIES } from './bodies'
import { toLocal } from '../lib/polarFrame'
import type { PolarFrame } from '../lib/polarFrame'
import type { Planet } from './planetaryImagery'
import { boxAround, demCovers, GLOBAL_DEMS, readDemWindow } from './usgsDem'

// Relieve real de otros cuerpos. tools/mars_terrain.py guarda rejillas de elevación (terrarium, en una
// rejilla regular de latitud y longitud) a partir de DTM de USGS. Aquí se convierten en teselas de
// relieve de MapLibre con el protocolo planet-dem://{body}/{targetId}/{z}/{x}/{y}.

const Bounds = z.tuple([z.number(), z.number(), z.number(), z.number()])
const Grid = z.object({ file: z.string(), bounds: Bounds, resolutionM: z.number().positive() })
const Region = z.object({
  targetId: z.string(),
  body: z.enum(['mars', 'moon']),
  bounds: Bounds,
  grids: z.array(Grid).min(1),
  sources: z.array(z.object({ name: z.string(), agency: z.string(), url: z.string() })),
  elevationRangeM: z.tuple([z.number(), z.number()]),
  /** Marco local del polo sur (tools/moon_polar.py): los límites y las rejillas van en ese marco. */
  frame: z.object({
    type: z.literal('south-polar-stereographic'),
    lat: z.number(),
    lon: z.number(),
    x0: z.number(),
    y0: z.number(),
  }).optional(),
  tracks: z.array(z.object({
    id: z.string(),
    name: z.string(),
    file: z.string(),
    sols: z.tuple([z.number(), z.number()]),
    lengthKm: z.number(),
    maxTiltDeg: z.number().nullable(),
    medianTiltDeg: z.number().nullable(),
    source: z.object({ name: z.string(), agency: z.string(), url: z.string() }),
  })).optional(),
})
const Manifest = z.object({ encoding: z.literal('terrarium'), datum: z.string(), regions: z.array(Region) })

export type TerrainRegion = z.infer<typeof Region>
export type TerrainTrack = NonNullable<TerrainRegion['tracks']>[number]

export interface TrackData {
  line: [number, number][]
  stops: GeoJSON.FeatureCollection
}

/** Ruta real del rover (tools/mars_tracks.py): la línea y las paradas. */
export async function loadTrack(body: Planet, file: string): Promise<TrackData> {
  const res = await fetch(terrainUrl(body, file))
  if (!res.ok) throw new Error(`Track returned ${res.status}`)
  const fc = (await res.json()) as GeoJSON.FeatureCollection
  const lineFeature = fc.features.find((f) => f.geometry.type === 'LineString')
  if (!lineFeature || lineFeature.geometry.type !== 'LineString') throw new Error('Track without line')
  const line = lineFeature.geometry.coordinates.map((c) => [c[0], c[1]] as [number, number])
  const stops: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: fc.features.filter((f) => f.geometry.type === 'Point') }
  return { line, stops }
}

const manifests = new Map<Planet, Promise<TerrainRegion[]>>()
const decoded = new Map<string, Promise<ElevationGrid[]>>()
/** Regiones creadas en el navegador a partir del modelo global de USGS (pin libre). */
const dynamic = new Map<string, TerrainRegion>()

const terrainUrl = (body: Planet, file: string) => `${import.meta.env.BASE_URL}terrain/${body}/${file}`

/** Regiones con relieve real del cuerpo; lista vacía si no hay manifiesto. */
export function loadTerrainRegions(body: Planet): Promise<TerrainRegion[]> {
  let p = manifests.get(body)
  if (!p) {
    p = fetch(terrainUrl(body, 'manifest.json'))
      .then((r) => (r.ok ? r.json() : { encoding: 'terrarium', datum: '', regions: [] }))
      .then((json) => Manifest.parse(json).regions)
      .catch(() => [])
    manifests.set(body, p)
  }
  return p
}

async function decodeGrid(body: Planet, grid: z.infer<typeof Grid>): Promise<ElevationGrid> {
  const res = await fetch(terrainUrl(body, grid.file))
  if (!res.ok) throw new Error(`Terrain grid returned ${res.status}`)
  const bitmap = await createImageBitmap(await res.blob(), { premultiplyAlpha: 'none', colorSpaceConversion: 'none' })
  const { width, height } = bitmap
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Cannot decode terrain')
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()
  const px = ctx.getImageData(0, 0, width, height).data
  const elevation = new Float32Array(width * height)
  const valid = new Uint8Array(width * height)
  for (let i = 0; i < width * height; i++) {
    elevation[i] = decodeTerrarium(px[i * 4], px[i * 4 + 1], px[i * 4 + 2])
    valid[i] = px[i * 4 + 3] > 0 ? 1 : 0
  }
  return { bounds: grid.bounds, width, height, elevation, valid, resolutionM: grid.resolutionM }
}

/** Rejillas de la región, de la más fina a la más gruesa. */
export function regionGrids(body: Planet, region: TerrainRegion): Promise<ElevationGrid[]> {
  const key = `${body}/${region.targetId}`
  let p = decoded.get(key)
  if (!p) {
    const sorted = [...region.grids].sort((a, b) => a.resolutionM - b.resolutionM)
    p = Promise.all(sorted.map((g) => decodeGrid(body, g)))
    decoded.set(key, p)
  }
  return p
}

/** Posición de un punto real dentro del marco de la región: el mismo punto si la región no tiene marco. */
export function regionPoint(region: TerrainRegion, lon: number, lat: number): { lon: number; lat: number } {
  return region.frame ? toLocal(region.frame as PolarFrame, lat, lon) : { lon, lat }
}

/** ¿El punto real cae dentro de la región, con un margen en grados del marco? */
export function regionContains(region: TerrainRegion, lon: number, lat: number, margin = 0): boolean {
  if (region.frame && lat > -80) return false
  const p = regionPoint(region, lon, lat)
  const [w, s, e, n] = region.bounds
  return p.lon >= w + margin && p.lon <= e - margin && p.lat >= s + margin && p.lat <= n - margin
}

/** Región por id: las del manifiesto o las creadas a partir del modelo global. */
async function findRegion(body: Planet, id: string): Promise<TerrainRegion | null> {
  return dynamic.get(`${body}/${id}`) ?? (await loadTerrainRegions(body)).find((r) => r.targetId === id) ?? null
}

/** Píxeles del borde del detalle que se funden con el contexto, para que no haya escalones. */
const FEATHER_PX = 20

/** Copia del detalle con su borde fundido hacia el contexto (el mismo criterio que tools/mars_terrain.py). */
function feather(detail: ElevationGrid, context: ElevationGrid): ElevationGrid {
  const { width: w, height: h, bounds: [west, south, east, north] } = detail
  const f = Math.max(1, Math.min(FEATHER_PX, Math.floor(Math.min(w, h) / 6)))
  const elevation = Float32Array.from(detail.elevation)
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const d = Math.min(i, j, w - 1 - i, h - 1 - j)
      if (d >= f || !detail.valid[j * w + i]) continue
      const lon = west + ((i + 0.5) / w) * (east - west)
      const lat = north - ((j + 0.5) / h) * (north - south)
      const c = sampleGrid(context, lon, lat, true)
      if (c === null) continue
      elevation[j * w + i] = c + (elevation[j * w + i] - c) * (d / f)
    }
  }
  return { ...detail, elevation }
}

/**
 * Relieve alrededor de un punto: la región del manifiesto que lo contiene (con margen), si la hay; si
 * no, una región nueva con dos ventanas del modelo global de USGS: detalle hasta `detailKm` (como
 * mucho 160 filas) y contexto hasta 80 km (120 filas), con el borde del detalle fundido en el contexto.
 * null si el modelo global no cubre el punto.
 */
export async function terrainAt(body: Planet, lon: number, lat: number, preferredId?: string, detailKm = 12): Promise<TerrainRegion | null> {
  const margin = 0.3
  const inside = (r: TerrainRegion) => regionContains(r, lon, lat, margin)
  const regions = await loadTerrainRegions(body)
  // Las regiones con marco local (polo sur) se eligen por su objetivo o por la posición real del punto.
  const known = regions.find((r) => r.targetId === preferredId && inside(r)) ?? regions.find(inside)
  if (known) return known

  const dem = GLOBAL_DEMS[body]
  if (!demCovers(dem, lat)) return null
  const id = `usgs_${lat.toFixed(4)}_${lon.toFixed(4)}_${detailKm}`
  const cached = dynamic.get(`${body}/${id}`)
  if (cached) return cached
  const radius = BODIES[body].radiusKm
  const [raw, context] = await Promise.all([
    readDemWindow(dem, ...boxAround(lon, lat, detailKm, radius), 160),
    readDemWindow(dem, ...boxAround(lon, lat, 80, radius), 120),
  ])
  const detail = feather(raw, context)
  let min = Infinity
  let max = -Infinity
  for (let i = 0; i < detail.elevation.length; i++) {
    if (!detail.valid[i]) continue
    min = Math.min(min, detail.elevation[i])
    max = Math.max(max, detail.elevation[i])
  }
  if (min > max) return null
  const region: TerrainRegion = {
    targetId: id,
    body,
    bounds: context.bounds,
    grids: [detail, context].map((g) => ({ file: dem.path, bounds: g.bounds, resolutionM: g.resolutionM })),
    sources: [dem.source],
    elevationRangeM: [Math.round(min), Math.round(max)],
  }
  dynamic.set(`${body}/${id}`, region)
  decoded.set(`${body}/${id}`, Promise.resolve([detail, context]))
  return region
}

export const TILE = 256

/** Elevaciones reales (m) de los 256 x 256 píxeles de la tesela z/x/y del objetivo. */
export async function planetTileElevations(body: Planet, targetId: string, zoom: number, x: number, y: number): Promise<Float32Array> {
  const region = await findRegion(body, targetId)
  if (!region) throw new Error('No terrain for this target')
  const grids = await regionGrids(body, region)
  const out = new Float32Array(TILE * TILE)
  const n = 2 ** zoom
  for (let row = 0; row < TILE; row++) {
    const my = (y + (row + 0.5) / TILE) / n
    const lat = (Math.atan(Math.sinh(Math.PI * (1 - 2 * my))) * 180) / Math.PI
    for (let col = 0; col < TILE; col++) {
      out[row * TILE + col] = elevationAt(grids, ((x + (col + 0.5) / TILE) / n) * 360 - 180, lat)
    }
  }
  return out
}

/** Elevación real (m) del objetivo en un punto. */
export async function planetElevationAt(body: Planet, targetId: string, lon: number, lat: number): Promise<number | null> {
  const region = await findRegion(body, targetId)
  if (!region) return null
  return elevationAt(await regionGrids(body, region), lon, lat)
}

addProtocol('planet-dem', async ({ url }) => {
  const { hostname, pathname } = new URL(url)
  const [targetId, zs, xs, ys] = pathname.slice(1).split('/')
  const elev = await planetTileElevations(hostname as Planet, targetId, Number(zs), Number(xs), Number(ys))
  const image = new ImageData(TILE, TILE)
  const d = image.data
  for (let i = 0; i < elev.length; i++) {
    const [r, g, b] = encodeTerrarium(elev[i])
    d[i * 4] = r
    d[i * 4 + 1] = g
    d[i * 4 + 2] = b
    d[i * 4 + 3] = 255
  }
  const canvas = new OffscreenCanvas(TILE, TILE)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Cannot prepare terrain tiles')
  ctx.putImageData(image, 0, 0)
  return { data: canvas.transferToImageBitmap() }
})
