import type { ElevationGrid } from '../lib/terrain'
import type { Planet } from './planetaryImagery'

// Modelos de elevación globales de USGS Astrogeology, leídos en el navegador por rangos de bytes.
// Los dos archivos son GeoTIFF sin compresión, Int16, con una fila por tira y las filas seguidas: la
// posición de cualquier píxel se calcula y se descargan solo las filas de la zona. El cubo de S3
// permite CORS con la cabecera Range. Valores comprobados en la cabecera y en la etiqueta ISIS
// de cada archivo el 14 de noviembre de 2026.

const RAD = Math.PI / 180
const NODATA = -32768
// El mismo cubo responde con cuatro nombres; así el navegador abre más conexiones a la vez.
const HOSTS = [
  'https://asc-pds-services.s3.us-west-2.amazonaws.com',
  'https://s3.us-west-2.amazonaws.com/asc-pds-services',
  'https://asc-pds-services.s3.dualstack.us-west-2.amazonaws.com',
  'https://s3.dualstack.us-west-2.amazonaws.com/asc-pds-services',
]
const PER_HOST = 6

export interface GlobalDem {
  body: Planet
  path: string
  width: number
  height: number
  /** Byte donde empieza la primera fila y bytes por fila. */
  firstRow: number
  rowBytes: number
  /** Grados por píxel; la rejilla empieza en (west, north). */
  degPerPx: number
  west: number
  north: number
  south: number
  /** Metros por unidad del archivo. */
  scale: number
  resolutionM: number
  /** Superficie de referencia de las elevaciones. */
  datum: string
  source: { name: string; agency: string; url: string }
}

export const GLOBAL_DEMS: Record<Planet, GlobalDem> = {
  mars: {
    body: 'mars',
    path: '/mosaic/Mars/HRSC_MOLA_Blend/Mars_HRSC_MOLA_BlendDEM_Global_200mp_v2.tif',
    width: 106694,
    height: 53347,
    firstRow: 854272,
    rowBytes: 213388,
    degPerPx: 0.003374120830641,
    west: -180,
    north: 90,
    south: 90 - 53347 * 0.003374120830641,
    scale: 1,
    resolutionM: 200,
    datum: 'MOLA areoid',
    source: {
      name: 'Mars MGS MOLA - MEX HRSC Blended DEM Global 200m v2',
      agency: 'USGS Astrogeology / ESA / NASA',
      url: 'https://astrogeology.usgs.gov/search/map/mars_mgs_mola_mex_hrsc_blended_dem_global_200m',
    },
  },
  moon: {
    body: 'moon',
    path: '/mosaic/LolaKaguya_Topo/Lunar_LRO_LOLAKaguya_DEMmerge_60N60S_512ppd.tif',
    width: 184320,
    height: 61440,
    firstRow: 984003,
    rowBytes: 368640,
    degPerPx: 1 / 512,
    west: -180,
    north: 60,
    south: -60,
    scale: 0.5,
    resolutionM: 59,
    datum: 'sphere of 1737.4 km',
    source: {
      name: 'Moon LRO LOLA - SELENE Kaguya TC DEM Merge 60N60S 59m v1',
      agency: 'USGS Astrogeology / NASA LRO / JAXA SELENE',
      url: 'https://astrogeology.usgs.gov/search/map/moon_lro_lola_selene_kaguya_tc_dem_merge_60n60s_59m',
    },
  },
}

/** ¿El modelo global cubre esta latitud? */
export function demCovers(dem: GlobalDem, lat: number): boolean {
  return lat <= dem.north && lat >= dem.south
}

/**
 * Filas y columnas del archivo que cubren la caja, tomando una de cada `stride` para no pasar de
 * `maxRows` filas. Devuelve también los límites de la rejilla resultante (bordes de sus píxeles).
 */
export function demWindow(dem: GlobalDem, west: number, south: number, east: number, north: number, maxRows = Infinity) {
  const d = dem.degPerPx
  const r0 = Math.max(0, Math.floor((dem.north - north) / d))
  const r1 = Math.min(dem.height - 1, Math.ceil((dem.north - south) / d))
  const c0 = Math.max(0, Math.floor((west - dem.west) / d))
  const c1 = Math.min(dem.width - 1, Math.ceil((east - dem.west) / d))
  const stride = Math.max(1, Math.ceil((r1 - r0 + 1) / maxRows))
  const height = Math.floor((r1 - r0) / stride) + 1
  const width = Math.floor((c1 - c0) / stride) + 1
  const n = dem.north - (r0 + 0.5) * d + 0.5 * stride * d
  const w = dem.west + (c0 + 0.5) * d - 0.5 * stride * d
  const bounds: [number, number, number, number] = [w, n - height * stride * d, w + width * stride * d, n]
  return { r0, c0, c1, stride, width, height, bounds }
}

/** Resolución en metros de un paso de `stride` píxeles, en el ecuador del cuerpo. */
export function strideMetres(dem: GlobalDem, stride: number): number {
  return dem.resolutionM * stride
}

let next = 0
let active = 0
const queue: (() => void)[] = []
async function slot<T>(job: (host: string) => Promise<T>): Promise<T> {
  if (active >= HOSTS.length * PER_HOST) await new Promise<void>((resolve) => queue.push(resolve))
  active++
  const host = HOSTS[next++ % HOSTS.length]
  try {
    return await job(host)
  } finally {
    active--
    queue.shift()?.()
  }
}

/** Bytes [start, end] del archivo. Si el servidor ignora el rango, se corta: el archivo pesa gigas. */
async function range(path: string, start: number, end: number): Promise<ArrayBuffer> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await slot(async (host) => {
        const controller = new AbortController()
        // Sin caché HTTP: Chromium bloquea su entrada de caché por URL y las lecturas de rangos de un
        // mismo archivo saldrían de una en una (15 s en vez de 3 s para 200 filas). Las ventanas ya
        // leídas se guardan en memoria (`windows`).
        const res = await fetch(host + path, {
          cache: 'no-store',
          headers: { Range: `bytes=${start}-${end}` },
          signal: controller.signal,
        })
        if (res.status !== 206) {
          controller.abort()
          throw new Error(`USGS DEM returned ${res.status}`)
        }
        return res.arrayBuffer()
      })
    } catch (error) {
      if (attempt >= 1) throw error
    }
  }
}

const windows = new Map<string, Promise<ElevationGrid>>()

/** Rejilla de elevaciones reales (m) de la caja, con una de cada `stride` filas y columnas. */
export function readDemWindow(dem: GlobalDem, west: number, south: number, east: number, north: number, maxRows = Infinity): Promise<ElevationGrid> {
  const win = demWindow(dem, west, south, east, north, maxRows)
  const key = `${dem.body}|${win.r0}|${win.c0}|${win.c1}|${win.height}|${win.stride}`
  let p = windows.get(key)
  if (!p) {
    p = (async () => {
      const { r0, c0, c1, stride, width, height, bounds } = win
      const elevation = new Float32Array(width * height)
      const valid = new Uint8Array(width * height)
      await Promise.all(Array.from({ length: height }, async (_, j) => {
        const row = r0 + j * stride
        const start = dem.firstRow + row * dem.rowBytes + c0 * 2
        const view = new DataView(await range(dem.path, start, start + (c1 - c0 + 1) * 2 - 1))
        // Con salto, cada celda es la media de sus `stride` columnas de la fila leída (menos ruido que
        // tomar un solo píxel en terreno abrupto).
        const columns = c1 - c0 + 1
        for (let i = 0; i < width; i++) {
          let sum = 0
          let n = 0
          for (let k = i * stride; k < Math.min(columns, (i + 1) * stride); k++) {
            const v = view.getInt16(k * 2, true)
            if (v === NODATA) continue
            sum += v
            n++
          }
          if (!n) continue
          elevation[j * width + i] = (sum / n) * dem.scale
          valid[j * width + i] = 1
        }
      }))
      return { bounds, width, height, elevation, valid, resolutionM: strideMetres(dem, stride) }
    })()
    p.catch(() => windows.delete(key))
    windows.set(key, p)
  }
  return p
}

/** Caja de `km` alrededor de un punto en un cuerpo de radio `radiusKm`. */
export function boxAround(lon: number, lat: number, km: number, radiusKm: number): [number, number, number, number] {
  const dLat = km / radiusKm / RAD
  const dLon = dLat / Math.max(0.05, Math.cos(lat * RAD))
  return [lon - dLon, lat - dLat, lon + dLon, lat + dLat]
}
