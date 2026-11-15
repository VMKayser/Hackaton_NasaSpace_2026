import type { AnalogsFile, Purpose, Site } from '../data/schema'

// La web no calcula puntajes: solo ordena y explica los que entrega el rol 4.

export type ScoreMode = 'purpose' | 'similarity'

export interface RankedSite {
  site: Site
  /** Puntaje usado para ordenar; null = no evaluado. */
  score: number | null
  /** Similitud general para el objetivo, incluso cuando se ordena por propósito. */
  similarity: number | null
  dimensions: Record<string, number | null>
  rank: number | null
  /** Dimensiones más altas (hasta dos) y la más baja, entre las que tienen peso. */
  top: string[]
  low: string | null
}

/** Con propósito, se ordena por purposeScores solo si el archivo los trae para ese propósito. */
export function scoreMode(file: AnalogsFile, purpose: Purpose | null): ScoreMode {
  if (!purpose) return 'similarity'
  const hasPurposeScores = file.sites.some((s) => typeof s.purposeScores?.[purpose.id] === 'number')
  return hasPurposeScores ? 'purpose' : 'similarity'
}

export function activeWeights(file: AnalogsFile, purpose: Purpose | null): Record<string, number> {
  if (purpose) return purpose.weights
  return Object.fromEntries(file.meta.dimensions.map((d) => [d.id, d.weight]))
}

export function explain(
  dimensions: Record<string, number | null>,
  weights: Record<string, number>,
): { top: string[]; low: string | null } {
  const scored = Object.entries(dimensions)
    .filter((e): e is [string, number] => e[1] !== null && (weights[e[0]] ?? 0) > 0)
    .sort((a, b) => b[1] - a[1] || (weights[b[0]] ?? 0) - (weights[a[0]] ?? 0))
  const top = scored.slice(0, 2).map(([id]) => id)
  const weakest = scored.at(-1)
  const low = weakest && weakest[1] < scored[0][1] ? weakest[0] : null
  return { top, low }
}

/** Calcula la fila de un sitio para un objetivo y propósito usando los puntajes precomputados. */
export function rankSite(file: AnalogsFile, site: Site, targetId: string, purpose: Purpose | null): RankedSite {
  const mode = scoreMode(file, purpose)
  const weights = activeWeights(file, purpose)
  const entry = site.scores.find((s) => s.targetId === targetId)
  const similarity = entry?.similarity ?? null
  const dimensions = entry?.dimensions ?? {}
  let score: number | null = null
  if (entry) {
    score = mode === 'purpose' && purpose ? (site.purposeScores?.[purpose.id] ?? null) : similarity
  }
  return { site, score, similarity, dimensions, rank: null, ...explain(dimensions, weights) }
}

export function rankSites(file: AnalogsFile, targetId: string, purpose: Purpose | null): RankedSite[] {
  const rows: RankedSite[] = file.sites.map((site) => rankSite(file, site, targetId, purpose))

  const byName = (a: RankedSite, b: RankedSite) => a.site.name.localeCompare(b.site.name)
  const evaluated = rows
    .filter((r) => r.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || byName(a, b))
  evaluated.forEach((r, i) => {
    r.rank = i + 1
  })
  const notEvaluated = rows.filter((r) => r.score === null).sort(byName)
  return [...evaluated, ...notEvaluated]
}

/** Cuántas dimensiones con dato hay frente al total de dimensiones del archivo. */
export function scoredCount(file: AnalogsFile, dimensions: Record<string, number | null>) {
  const total = file.meta.dimensions.length
  const scored = file.meta.dimensions.filter((d) => typeof dimensions[d.id] === 'number').length
  return { scored, total }
}
