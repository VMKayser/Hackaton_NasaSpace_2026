// Ruta real de un rover y su traslado a un sitio de la Tierra, sin dependencias del navegador.

const RAD = Math.PI / 180

export type LonLat = [number, number]

/** Umbrales de pendiente (grados) para el perfil de la ruta. */
export const STEEP_THRESHOLDS = [10, 20]

/**
 * Traslada una ruta a otro punto y otro cuerpo conservando distancias y rumbos reales: cada vértice
 * se expresa en metros al este y al norte del ancla, y se vuelve a situar alrededor del nuevo punto.
 * Es un traslado geométrico, no una ruta planificada para el nuevo terreno.
 */
export function transplant(coords: LonLat[], from: LonLat, fromRadiusKm: number, to: LonLat, toRadiusKm: number): LonLat[] {
  const rFrom = fromRadiusKm * 1000
  const rTo = toRadiusKm * 1000
  const cosFrom = Math.cos(from[1] * RAD)
  const cosTo = Math.cos(to[1] * RAD)
  return coords.map(([lon, lat]) => {
    const east = (lon - from[0]) * RAD * rFrom * cosFrom
    const north = (lat - from[1]) * RAD * rFrom
    return [to[0] + east / (rTo * cosTo) / RAD, to[1] + north / rTo / RAD]
  })
}

/** Distancia en metros entre dos puntos cercanos sobre un cuerpo de radio `radiusKm`. */
export function distanceM(a: LonLat, b: LonLat, radiusKm: number): number {
  const r = radiusKm * 1000
  const x = (b[0] - a[0]) * RAD * Math.cos(((a[1] + b[1]) / 2) * RAD)
  const y = (b[1] - a[1]) * RAD
  return Math.hypot(x, y) * r
}

/** Puntos cada `stepM` metros a lo largo de la línea, con su distancia acumulada. */
export function resample(coords: LonLat[], stepM: number, radiusKm: number): { points: LonLat[]; dist: number[] } {
  const points: LonLat[] = [coords[0]]
  const dist: number[] = [0]
  let carried = 0
  let total = 0
  for (let i = 1; i < coords.length; i++) {
    const a = coords[i - 1]
    const b = coords[i]
    const seg = distanceM(a, b, radiusKm)
    if (seg === 0) continue
    let along = stepM - carried
    while (along <= seg) {
      const k = along / seg
      points.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k])
      dist.push(total + along)
      along += stepM
    }
    carried = seg - (along - stepM)
    total += seg
  }
  return { points, dist }
}

export interface ProfileStats {
  lengthKm: number
  ascentM: number
  descentM: number
  maxSlopeDeg: number
  /** Fracción de la longitud con pendiente mayor que cada umbral (grados). */
  steeperThan: Record<number, number>
}

/** Estadísticas de un perfil muestreado a intervalos regulares. Los valores null se saltan. */
export function profileStats(dist: number[], elev: (number | null)[], thresholds: number[]): ProfileStats {
  let ascent = 0
  let descent = 0
  let maxSlope = 0
  let measured = 0
  const over: Record<number, number> = Object.fromEntries(thresholds.map((t) => [t, 0]))
  for (let i = 1; i < dist.length; i++) {
    const a = elev[i - 1]
    const b = elev[i]
    const run = dist[i] - dist[i - 1]
    if (a === null || b === null || run <= 0) continue
    const rise = b - a
    if (rise > 0) ascent += rise
    else descent -= rise
    const slope = Math.atan(Math.abs(rise) / run) / RAD
    maxSlope = Math.max(maxSlope, slope)
    measured += run
    for (const t of thresholds) if (slope > t) over[t] += run
  }
  const steeperThan = Object.fromEntries(thresholds.map((t) => [t, measured ? over[t] / measured : 0]))
  return { lengthKm: (dist[dist.length - 1] ?? 0) / 1000, ascentM: ascent, descentM: descent, maxSlopeDeg: maxSlope, steeperThan }
}

/** Límites [oeste, sur, este, norte] de una lista de puntos. */
export function boundsOf(coords: LonLat[]): [number, number, number, number] {
  let w = Infinity
  let s = Infinity
  let e = -Infinity
  let n = -Infinity
  for (const [lon, lat] of coords) {
    w = Math.min(w, lon)
    e = Math.max(e, lon)
    s = Math.min(s, lat)
    n = Math.max(n, lat)
  }
  return [w, s, e, n]
}
