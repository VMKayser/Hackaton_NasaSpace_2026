// Mediciones del relieve real dentro de un círculo, sin dependencias del navegador.
// Sirven para el pin libre: los dos cuerpos se miden igual, con el mismo radio y el mismo paso.
// No es un puntaje de similitud: la web no calcula puntajes (los entrega el rol 4).

const RAD = Math.PI / 180

/** Límites de las clases de pendiente (grados) del histograma. La última clase no tiene tope. */
export const SLOPE_BINS = [0, 2, 5, 10, 20, 30]
/** Pendiente a partir de la cual se cuenta el área empinada (grados). */
export const STEEP_DEG = 20

export type Sampler = (lon: number, lat: number) => number | null

export interface PatchStats {
  /** Paso de la rejilla de muestreo, en metros reales. */
  stepM: number
  /** Celdas dentro del círculo con pendiente medida. */
  samples: number
  /** Fracción de las celdas del círculo que tienen dato. */
  coverage: number
  slopeMedian: number
  slopeP90: number
  /** Fracción del área con pendiente mayor que STEEP_DEG. */
  steepShare: number
  /** Diferencia entre los percentiles 95 y 5 de la elevación (m). */
  reliefM: number
  elevationMean: number
  /** Fracción de celdas con elevación igual o menor que 0 m. */
  belowZeroShare: number
  /** Fracción del área en cada clase de SLOPE_BINS. */
  histogram: number[]
  /** Rugosidad: mediana del TRI, la diferencia media de altura con las 8 celdas vecinas (m). */
  triMedian: number
}

/** Percentil de un arreglo ya ordenado, con interpolación lineal. */
export function percentile(sorted: ArrayLike<number>, p: number): number {
  const n = sorted.length
  if (n === 0) return NaN
  const k = (n - 1) * p
  const lo = Math.floor(k)
  const hi = Math.min(n - 1, lo + 1)
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (k - lo)
}

/**
 * Puntos de una rejilla regular de `stepM` metros alrededor del centro, sobre un cuerpo de radio
 * `bodyRadiusKm` (plano tangente local: válido para radios de pocas decenas de km).
 * Se añade un anillo de celdas fuera del círculo para calcular la pendiente en el borde.
 */
export function patchGrid(lon: number, lat: number, radiusKm: number, bodyRadiusKm: number, stepM: number) {
  const r = bodyRadiusKm * 1000
  const half = Math.ceil((radiusKm * 1000) / stepM) + 1
  const size = half * 2 + 1
  const dLat = stepM / r / RAD
  const dLon = stepM / (r * Math.cos(lat * RAD)) / RAD
  const point = (i: number, j: number): [number, number] => [lon + (i - half) * dLon, lat - (j - half) * dLat]
  return { half, size, point }
}

/** Mide pendiente y relieve dentro del círculo. null si no hay ningún dato. */
export function measurePatch(
  sample: Sampler,
  lon: number,
  lat: number,
  radiusKm: number,
  bodyRadiusKm: number,
  stepM: number,
): PatchStats | null {
  const { half, size, point } = patchGrid(lon, lat, radiusKm, bodyRadiusKm, stepM)
  const elev = new Float32Array(size * size)
  const valid = new Uint8Array(size * size)
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const [x, y] = point(i, j)
      const h = sample(x, y)
      if (h !== null && Number.isFinite(h)) {
        elev[j * size + i] = h
        valid[j * size + i] = 1
      }
    }
  }

  const r2 = ((radiusKm * 1000) / stepM) ** 2
  const slopes: number[] = []
  const heights: number[] = []
  const tris: number[] = []
  let inside = 0
  for (let j = 1; j < size - 1; j++) {
    for (let i = 1; i < size - 1; i++) {
      if ((i - half) ** 2 + (j - half) ** 2 > r2) continue
      inside++
      const c = j * size + i
      if (!valid[c]) continue
      heights.push(elev[c])
      if (!valid[c - 1] || !valid[c + 1] || !valid[c - size] || !valid[c + size]) continue
      const dzdx = (elev[c + 1] - elev[c - 1]) / (2 * stepM)
      const dzdy = (elev[c - size] - elev[c + size]) / (2 * stepM)
      slopes.push(Math.atan(Math.hypot(dzdx, dzdy)) / RAD)
      // TRI: con las 8 vecinas, como tools/measure_values.py.
      let sum = 0
      let all = true
      for (const k of [c - size - 1, c - size, c - size + 1, c - 1, c + 1, c + size - 1, c + size, c + size + 1]) {
        if (!valid[k]) {
          all = false
          break
        }
        sum += Math.abs(elev[k] - elev[c])
      }
      if (all) tris.push(sum / 8)
    }
  }
  if (!slopes.length || !heights.length) return null

  const s = Float64Array.from(slopes).sort()
  const h = Float64Array.from(heights).sort()
  const histogram = SLOPE_BINS.map(() => 0)
  let steep = 0
  for (const v of s) {
    if (v > STEEP_DEG) steep++
    let b = SLOPE_BINS.length - 1
    while (b > 0 && v < SLOPE_BINS[b]) b--
    histogram[b]++
  }
  let sum = 0
  let belowZero = 0
  for (const v of h) {
    sum += v
    if (v <= 0) belowZero++
  }
  return {
    stepM,
    samples: s.length,
    coverage: s.length / inside,
    slopeMedian: percentile(s, 0.5),
    slopeP90: percentile(s, 0.9),
    steepShare: steep / s.length,
    reliefM: percentile(h, 0.95) - percentile(h, 0.05),
    elevationMean: sum / h.length,
    belowZeroShare: belowZero / h.length,
    histogram: histogram.map((n) => n / s.length),
    triMedian: tris.length ? percentile(Float64Array.from(tris).sort(), 0.5) : NaN,
  }
}

/**
 * Paso común: la resolución más gruesa de las dos fuentes, redondeada hacia arriba a 5 m.
 * Así ningún lado se mide con más detalle del que tiene el otro.
 */
export function commonStep(...resolutionsM: number[]): number {
  return Math.ceil(Math.max(...resolutionsM) / 5) * 5
}
