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

export interface TerrainMatch {
  siteId: string
  similarity: number
}

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null)

/** Sitios ordenados de más a menos parecidos al punto. null si el archivo no tiene dimensiones de relieve. */
export function terrainMatches(file: AnalogsFile, point: TerrainPoint): TerrainMatch[] | null {
  const dims = file.meta.dimensions.flatMap((d) => {
    const measure = TERRAIN_MEASURES.find((m) => m === d.measure)
    return measure && d.weight > 0 ? [{ id: d.id, measure, weight: d.weight }] : []
  })
  if (!dims.length) return null

  const scales = new Map<string, number>()
  for (const d of dims) {
    const earth = file.sites.map((s) => num(s.values[d.id]?.value)).filter((v): v is number => v !== null)
    const others = [...file.targets.map((t) => num(t.values[d.id]?.value)), point[d.measure]].filter((v): v is number => v !== null)
    if (!earth.length) continue
    const sorted = Float64Array.from(earth).sort()
    const lo = Math.min(percentile(sorted, 0.05), ...others)
    const hi = Math.max(percentile(sorted, 0.95), ...others)
    if (hi > lo) scales.set(d.id, hi - lo)
  }

  const out: TerrainMatch[] = []
  for (const site of file.sites) {
    let sum = 0
    let den = 0
    for (const d of dims) {
      const e = num(site.values[d.id]?.value)
      const scale = scales.get(d.id)
      if (e === null || scale === undefined) continue
      sum += d.weight * (1 - Math.min(1, Math.abs(e - point[d.measure]) / scale))
      den += d.weight
    }
    if (den > 0) out.push({ siteId: site.id, similarity: sum / den })
  }
  return out.sort((a, b) => b.similarity - a.similarity)
}
