import type { AnalogsFile } from '../data/schema'
import { percentile } from './patch'

// Parecido de relieve entre un punto libre de otro cuerpo y los sitios de la Tierra.
// Es la única comparación que calcula la web (excepción acordada en AGENTS.md): usa el mismo método que
// tools/build_analogs.py (escala entre los percentiles 5 y 95 de los sitios, ampliada con los objetivos;
// similitud 1 − min(1, |Tierra − punto| / escala); media ponderada con los pesos del archivo), pero solo
// con las dimensiones de relieve, que el navegador puede medir igual que las herramientas.

/** Mediciones que el navegador sabe hacer, con el nombre que les da `meta.dimensions[].measure`. */
export const TERRAIN_MEASURES = ['slope_median_deg', 'slope_p90_deg', 'roughness_tri_m'] as const
export type TerrainMeasure = (typeof TERRAIN_MEASURES)[number]
export type TerrainPoint = Record<TerrainMeasure, number>

/** Paso y radio con que las herramientas miden los objetivos (tools/measure_values.py). */
export const MATCH_STEP_M = 200
export const MATCH_RADIUS_KM = 5

/** Detalle de una dimensión de relieve: valor del sitio u objetivo, valor del punto y su parecido. */
export interface DimensionMatch {
  id: string
  measure: TerrainMeasure
  weight: number
  /** Valor del sitio u objetivo; null = sin dato (no cuenta en la media). */
  value: number | null
  unit: string | null
  point: number
  /** 1 − min(1, |valor − punto| / escala); null sin dato o sin escala. */
  similarity: number | null
  /** Extremos de la escala (percentiles 5 y 95 de los sitios, ampliados con los objetivos y el punto). */
  lo: number | null
  hi: number | null
}

export interface TerrainMatch {
  siteId: string
  similarity: number
  dimensions: DimensionMatch[]
}

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null)

interface TerrainDim {
  id: string
  measure: TerrainMeasure
  weight: number
}

/** Dimensiones de relieve con peso y su escala, como en tools/build_analogs.py, ampliada con el punto. */
function terrainScales(file: AnalogsFile, point: TerrainPoint): { dims: TerrainDim[]; scales: Map<string, [number, number]> } | null {
  const dims = file.meta.dimensions.flatMap((d) => {
    const measure = TERRAIN_MEASURES.find((m) => m === d.measure)
    return measure && d.weight > 0 ? [{ id: d.id, measure, weight: d.weight }] : []
  })
  if (!dims.length) return null
  const scales = new Map<string, [number, number]>()
  for (const d of dims) {
    const earth = file.sites.map((s) => num(s.values[d.id]?.value)).filter((v): v is number => v !== null)
    const others = [...file.targets.map((t) => num(t.values[d.id]?.value)), point[d.measure]].filter((v): v is number => v !== null)
    if (!earth.length) continue
    const sorted = Float64Array.from(earth).sort()
    const lo = Math.min(percentile(sorted, 0.05), ...others)
    const hi = Math.max(percentile(sorted, 0.95), ...others)
    if (hi > lo) scales.set(d.id, [lo, hi])
  }
  return { dims, scales }
}

/** Media ponderada de 1 − min(1, |valor − punto| / escala) en las dimensiones de relieve con dato. */
function similarity(
  values: Record<string, { value: unknown; unit?: string | null } | undefined>,
  point: TerrainPoint,
  dims: TerrainDim[],
  scales: Map<string, [number, number]>,
): { similarity: number; dimensions: DimensionMatch[] } | null {
  let sum = 0
  let den = 0
  const dimensions = dims.map((d): DimensionMatch => {
    const v = num(values[d.id]?.value)
    const range = scales.get(d.id)
    const base = { id: d.id, measure: d.measure, weight: d.weight, value: v, unit: values[d.id]?.unit ?? null, point: point[d.measure], lo: range?.[0] ?? null, hi: range?.[1] ?? null }
    if (v === null || range === undefined) return { ...base, similarity: null }
    const sim = 1 - Math.min(1, Math.abs(v - point[d.measure]) / (range[1] - range[0]))
    sum += d.weight * sim
    den += d.weight
    return { ...base, similarity: sim }
  })
  return den > 0 ? { similarity: sum / den, dimensions } : null
}

/** Sitios ordenados de más a menos parecidos al punto. null si el archivo no tiene dimensiones de relieve. */
export function terrainMatches(file: AnalogsFile, point: TerrainPoint): TerrainMatch[] | null {
  const ctx = terrainScales(file, point)
  if (!ctx) return null
  const out: TerrainMatch[] = []
  for (const site of file.sites) {
    const sim = similarity(site.values, point, ctx.dims, ctx.scales)
    if (sim !== null) out.push({ siteId: site.id, ...sim })
  }
  return out.sort((a, b) => b.similarity - a.similarity)
}

export interface TargetMatch {
  targetId: string
  similarity: number
  dimensions: DimensionMatch[]
}

/**
 * Al revés: objetivos de Marte y de la Luna ordenados por su parecido de relieve con un punto de la
 * Tierra. Misma escala y mismos pesos que `terrainMatches`.
 */
export function targetMatches(file: AnalogsFile, point: TerrainPoint): TargetMatch[] | null {
  const ctx = terrainScales(file, point)
  if (!ctx) return null
  const out: TargetMatch[] = []
  for (const target of file.targets) {
    const sim = similarity(target.values, point, ctx.dims, ctx.scales)
    if (sim !== null) out.push({ targetId: target.id, ...sim })
  }
  return out.sort((a, b) => b.similarity - a.similarity)
}

/** Punto de la malla con su relieve medido (grid.json); `values` va por nombre de medición. */
export interface GridPointInput {
  lat: number
  lon: number
  values: Record<string, number>
  nearestSite: { id: string; km: number }
}

export interface GridMatch<P extends GridPointInput = GridPointInput> {
  point: P
  similarity: number
  dimensions: DimensionMatch[]
}

export interface GridSearchOptions {
  /** Puntos a menos de esta distancia de un sitio del catálogo no cuentan como lugar nuevo. */
  nearCatalogKm?: number
  /** Distancia mínima entre dos lugares propuestos, para no repetir el mismo lugar. */
  minSeparationKm?: number
  limit?: number
}

const EARTH_KM = 6371.0088
const RAD = Math.PI / 180
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const a = Math.sin(((lat2 - lat1) * RAD) / 2) ** 2 + Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(((lon2 - lon1) * RAD) / 2) ** 2
  return 2 * EARTH_KM * Math.asin(Math.sqrt(a))
}

/**
 * Lugares nuevos: puntos de la malla ordenados por su parecido de relieve con el punto, con la misma escala
 * y los mismos pesos que `terrainMatches` (la escala sale de los sitios del catálogo, como en
 * tools/discover.py). Deja fuera los puntos cerca del catálogo y los que están pegados a uno mejor.
 */
export function gridMatches<P extends GridPointInput>(file: AnalogsFile, points: P[], point: TerrainPoint, options: GridSearchOptions = {}): GridMatch<P>[] | null {
  const { nearCatalogKm = 10, minSeparationKm = 15, limit = 6 } = options
  const ctx = terrainScales(file, point)
  if (!ctx) return null
  const units = new Map(ctx.dims.map((d) => [d.id, file.sites.find((s) => s.values[d.id]?.unit)?.values[d.id]?.unit ?? null]))
  const ranked: GridMatch<P>[] = []
  for (const p of points) {
    if (p.nearestSite.km < nearCatalogKm) continue
    const values = Object.fromEntries(ctx.dims.map((d) => [d.id, { value: p.values[d.measure] ?? null, unit: units.get(d.id) ?? null }]))
    const sim = similarity(values, point, ctx.dims, ctx.scales)
    if (sim !== null) ranked.push({ point: p, ...sim })
  }
  ranked.sort((a, b) => b.similarity - a.similarity)
  const out: GridMatch<P>[] = []
  for (const m of ranked) {
    if (out.some((o) => distanceKm(o.point.lat, o.point.lon, m.point.lat, m.point.lon) < minSeparationKm)) continue
    out.push(m)
    if (out.length >= limit) break
  }
  return out
}

/** Las mediciones de relieve de un objetivo o sitio del archivo, si tiene las tres; si no, null. */
export function valuesPoint(file: AnalogsFile, values: Record<string, { value: unknown } | undefined>): TerrainPoint | null {
  const out: Partial<TerrainPoint> = {}
  for (const d of file.meta.dimensions) {
    const measure = TERRAIN_MEASURES.find((m) => m === d.measure)
    if (!measure) continue
    const v = num(values[d.id]?.value)
    if (v === null) return null
    out[measure] = v
  }
  return TERRAIN_MEASURES.every((m) => out[m] !== undefined) ? (out as TerrainPoint) : null
}
