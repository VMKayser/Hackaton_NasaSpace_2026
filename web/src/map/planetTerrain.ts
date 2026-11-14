import { addProtocol } from 'maplibre-gl'
import type * as GeoJSON from 'geojson'
import { z } from 'zod'
import { elevationAt, encodeTerrarium, decodeTerrarium } from '../lib/terrain'
import type { ElevationGrid } from '../lib/terrain'
import type { Planet } from './planetaryImagery'

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

function regionGrids(body: Planet, region: TerrainRegion): Promise<ElevationGrid[]> {
  const key = `${body}/${region.targetId}`
  let p = decoded.get(key)
  if (!p) {
    const sorted = [...region.grids].sort((a, b) => a.resolutionM - b.resolutionM)
    p = Promise.all(sorted.map((g) => decodeGrid(body, g)))
    decoded.set(key, p)
  }
  return p
}

export const TILE = 256

/** Elevaciones reales (m) de los 256 x 256 píxeles de la tesela z/x/y del objetivo. */
export async function planetTileElevations(body: Planet, targetId: string, zoom: number, x: number, y: number): Promise<Float32Array> {
  const region = (await loadTerrainRegions(body)).find((r) => r.targetId === targetId)
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
  const region = (await loadTerrainRegions(body)).find((r) => r.targetId === targetId)
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
