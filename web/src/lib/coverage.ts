import type { Dimension, Value } from '../data/schema'

// Nivel de datos de un objetivo: qué parte del peso de las dimensiones tiene dato. No es un puntaje:
// solo cuenta qué mediciones existen (regla 10 de AGENTS.md).

export type DataLevel = 'complete' | 'partial' | 'insufficient'

export interface Coverage {
  level: DataLevel
  /** Parte del peso con dato, de 0 a 1. */
  share: number
  /** Dimensiones con peso que no tienen dato, en el orden del archivo. */
  missing: string[]
}

const hasValue = (v: Value | undefined) => v !== undefined && v.value !== null && v.value !== ''

/**
 * Cobertura de los valores de un objetivo con los pesos activos (por defecto o del propósito).
 * Sin `minCoverage`, nunca se declara «insuficiente»: el archivo no fija el mínimo.
 */
export function coverage(
  dimensions: Dimension[],
  weights: Record<string, number>,
  values: Record<string, Value | undefined>,
  minCoverage?: number,
): Coverage {
  let total = 0
  let covered = 0
  const missing: string[] = []
  for (const d of dimensions) {
    const w = weights[d.id] ?? 0
    if (w <= 0) continue
    total += w
    if (hasValue(values[d.id])) covered += w
    else missing.push(d.id)
  }
  // Redondeo a 3 decimales, igual que tools/build_analogs.py: los pesos tienen 4 (0,3333).
  const share = total > 0 ? Math.round((covered / total) * 1000) / 1000 : 0
  const level: DataLevel =
    total > 0 && missing.length === 0
      ? 'complete'
      : minCoverage !== undefined && share < minCoverage
        ? 'insufficient'
        : 'partial'
  return { level, share, missing }
}
