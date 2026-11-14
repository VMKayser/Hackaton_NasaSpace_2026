// Cálculos del relieve 3D, sin dependencias del navegador.

/** MapLibre dibuja cualquier cuerpo con el radio de la Tierra. */
export const EARTH_RADIUS_KM = 6371.0088

const RAD = Math.PI / 180

export interface ElevationGrid {
  /** oeste, sur, este, norte, en grados */
  bounds: [number, number, number, number]
  width: number
  height: number
  elevation: Float32Array
  valid: Uint8Array
  resolutionM: number
}

/** Elevación bilineal; null si el punto cae fuera de la rejilla o junto a un píxel sin dato. */
export function sampleGrid(g: ElevationGrid, lon: number, lat: number, clamp: boolean): number | null {
  const [west, south, east, north] = g.bounds
  let fx = ((lon - west) / (east - west)) * g.width - 0.5
  let fy = ((north - lat) / (north - south)) * g.height - 0.5
  if (!clamp && (fx < 0 || fy < 0 || fx > g.width - 1 || fy > g.height - 1)) return null
  fx = Math.min(Math.max(fx, 0), g.width - 1.001)
  fy = Math.min(Math.max(fy, 0), g.height - 1.001)
  const x0 = Math.floor(fx)
  const y0 = Math.floor(fy)
  const i = y0 * g.width + x0
  const v = g.valid
  if (!v[i] || !v[i + 1] || !v[i + g.width] || !v[i + g.width + 1]) return null
  const tx = fx - x0
  const ty = fy - y0
  const e = g.elevation
  const top = e[i] * (1 - tx) + e[i + 1] * tx
  const bottom = e[i + g.width] * (1 - tx) + e[i + g.width + 1] * tx
  return top * (1 - ty) + bottom * ty
}

/**
 * Elevación en un punto. `grids` va de la más fina a la más gruesa: se usa la primera con dato.
 * Fuera de todas, se prolonga el borde de la más gruesa para que no aparezcan paredes.
 */
export function elevationAt(grids: ElevationGrid[], lon: number, lat: number): number {
  for (const g of grids) {
    const h = sampleGrid(g, lon, lat, false)
    if (h !== null) return h
  }
  return sampleGrid(grids[grids.length - 1], lon, lat, true) ?? 0
}

/** Zoom a partir del cual la rejilla más fina ya no aporta detalle (teselas de 256 px). */
export function terrainMaxZoom(resolutionsM: number[], bodyRadiusKm: number): number {
  const finest = Math.min(...resolutionsM)
  const degPerPx = (finest / (bodyRadiusKm * 1000)) / RAD
  return Math.max(6, Math.min(14, Math.round(Math.log2(360 / 256 / degPerPx))))
}

/**
 * Zoom del mapa de otro cuerpo para que un píxel mida lo mismo, en metros reales, que en el mapa
 * de la Tierra. Tiene en cuenta el radio del cuerpo y la latitud de cada sitio (Web Mercator).
 */
export function sameScaleZoom(earthZoom: number, earthLat: number, bodyLat: number, bodyRadiusKm: number): number {
  const ratio = (bodyRadiusKm * Math.cos(bodyLat * RAD)) / (EARTH_RADIUS_KM * Math.cos(earthLat * RAD))
  return earthZoom + Math.log2(ratio)
}

/**
 * Exageración para que el relieve de otro cuerpo conserve sus proporciones reales: al dibujarlo con el
 * radio de la Tierra, las distancias horizontales se estiran por EARTH_RADIUS_KM / bodyRadiusKm.
 */
export function proportionalExaggeration(bodyRadiusKm: number, visual: number): number {
  return visual * (EARTH_RADIUS_KM / bodyRadiusKm)
}

/** Codificación terrarium de una elevación en metros. */
export function encodeTerrarium(elevationM: number): [number, number, number] {
  const v = Math.min(65535.99, Math.max(0, elevationM + 32768))
  const r = Math.floor(v / 256)
  const g = Math.floor(v) - r * 256
  const b = Math.floor((v - Math.floor(v)) * 256)
  return [r, g, b]
}

export function decodeTerrarium(r: number, g: number, b: number): number {
  return r * 256 + g + b / 256 - 32768
}

/** Anillo geodésico aproximado de radio `km` alrededor de un punto, como lista de [lon, lat]. */
export function circleRing(lon: number, lat: number, km: number, bodyRadiusKm: number, steps = 96): [number, number][] {
  const d = km / bodyRadiusKm
  const lat1 = lat * RAD
  const lon1 = lon * RAD
  const out: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const brg = (i / steps) * 2 * Math.PI
    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brg))
    const lon2 = lon1 + Math.atan2(Math.sin(brg) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2))
    out.push([lon2 / RAD, lat2 / RAD])
  }
  return out
}

// Capas de comparación: pendiente y relieve relativo, calculadas del relieve mostrado.

export type Lens = 'imagery' | 'slope' | 'relative'
export type RampStop = [number, string]

/** Pendiente en grados, sin dato en los bordes de la tesela (se usan diferencias de un lado). */
export const SLOPE_RAMP: RampStop[] = [
  [0, '#0d0887'],
  [4, '#5c01a6'],
  [9, '#9c179e'],
  [15, '#cc4778'],
  [22, '#ed7953'],
  [30, '#fdb42f'],
  [40, '#f0f921'],
]

/** Metros por encima (+) o por debajo (−) del centro del sitio. */
export const RELATIVE_RAMP: RampStop[] = [
  [-400, '#2166ac'],
  [-150, '#67a9cf'],
  [-40, '#d1e5f0'],
  [0, '#f7f7f7'],
  [40, '#fddbc7'],
  [150, '#ef8a62'],
  [400, '#b2182b'],
]

const hexCache = new Map<string, [number, number, number]>()
function hex(c: string): [number, number, number] {
  let v = hexCache.get(c)
  if (!v) {
    const n = parseInt(c.slice(1), 16)
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    hexCache.set(c, v)
  }
  return v
}

export function rampColor(ramp: RampStop[], value: number): [number, number, number] {
  if (value <= ramp[0][0]) return hex(ramp[0][1])
  for (let i = 1; i < ramp.length; i++) {
    const [v1, c1] = ramp[i]
    if (value <= v1) {
      const [v0, c0] = ramp[i - 1]
      const k = (value - v0) / (v1 - v0)
      const a = hex(c0)
      const b = hex(c1)
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]
    }
  }
  return hex(ramp[ramp.length - 1][1])
}

/** Metros reales por píxel de una tesela Web Mercator de 256 px en la latitud dada. */
export function metresPerPixel(zoom: number, lat: number, bodyRadiusKm: number, tileSize = 256): number {
  return (2 * Math.PI * bodyRadiusKm * 1000 * Math.cos(lat * RAD)) / (tileSize * 2 ** zoom)
}

/** Pendiente en grados de una rejilla cuadrada de elevaciones, con píxeles de `mpp` metros. */
export function slopeDegrees(elev: Float32Array, size: number, mpp: number): Float32Array {
  const out = new Float32Array(size * size)
  for (let y = 0; y < size; y++) {
    const y0 = Math.max(0, y - 1)
    const y1 = Math.min(size - 1, y + 1)
    for (let x = 0; x < size; x++) {
      const x0 = Math.max(0, x - 1)
      const x1 = Math.min(size - 1, x + 1)
      const dzdx = (elev[y * size + x1] - elev[y * size + x0]) / ((x1 - x0) * mpp)
      const dzdy = (elev[y1 * size + x] - elev[y0 * size + x]) / ((y1 - y0) * mpp)
      out[y * size + x] = Math.atan(Math.hypot(dzdx, dzdy)) / RAD
    }
  }
  return out
}

/** Latitud del centro de la tesela z/x/y. */
export function tileCenterLat(zoom: number, y: number): number {
  const my = (y + 0.5) / 2 ** zoom
  return Math.atan(Math.sinh(Math.PI * (1 - 2 * my))) / RAD
}

/** Tesela que contiene un punto, y el píxel dentro de ella. */
export function tileOf(lon: number, lat: number, zoom: number, tileSize = 256) {
  const n = 2 ** zoom
  const x = ((lon + 180) / 360) * n
  const s = Math.sin(lat * RAD)
  const y = (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n
  const tx = Math.floor(x)
  const ty = Math.floor(y)
  return { x: tx, y: ty, px: Math.min(tileSize - 1, Math.floor((x - tx) * tileSize)), py: Math.min(tileSize - 1, Math.floor((y - ty) * tileSize)) }
}

/** Grupo de similitud de una dimensión para el panel de condiciones. */
export type Likeness = 'similar' | 'partial' | 'different' | 'noData'
export function likeness(score: number | null): Likeness {
  if (score === null) return 'noData'
  if (score >= 0.66) return 'similar'
  if (score >= 0.33) return 'partial'
  return 'different'
}
