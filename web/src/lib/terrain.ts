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
