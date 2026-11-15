import { describe, expect, it } from 'vitest'
import type { Dimension } from '../data/schema'
import { coverage } from './coverage'

const dim = (id: string, weight = 1): Dimension => ({ id, label: { en: id, es: id }, weight, sources: [] })
const dims = [dim('slope', 0.5), dim('rough', 0.5), dim('temp'), dim('geo'), dim('lith', 0)]
const weights = Object.fromEntries(dims.map((d) => [d.id, d.weight]))
const v = (value: number | string | null) => ({ value, unit: null })

describe('coverage', () => {
  it('is complete when every weighted dimension has data, ignoring zero weights', () => {
    const c = coverage(dims, weights, { slope: v(1), rough: v(2), temp: v(-50), geo: v('glacial'), lith: v(null) })
    expect(c).toEqual({ level: 'complete', share: 1, missing: [] })
  })

  it('weighs missing dimensions and lists them in file order', () => {
    const c = coverage(dims, weights, { slope: v(1), rough: v(2), temp: v(null) }, 0.3)
    expect(c.level).toBe('partial')
    expect(c.share).toBeCloseTo(1 / 3)
    expect(c.missing).toEqual(['temp', 'geo'])
  })

  it('is insufficient below the minimum, and only when the file sets one', () => {
    const values = { slope: v(1), temp: v(null), geo: v(null) }
    expect(coverage(dims, weights, values, 0.5).level).toBe('insufficient')
    expect(coverage(dims, weights, values).level).toBe('partial')
  })

  it('uses the purpose weights: a terrain-only purpose is complete without climate', () => {
    const c = coverage(dims, { slope: 0.5, rough: 0.5 }, { slope: v(1), rough: v(2), temp: v(null) }, 0.5)
    expect(c.level).toBe('complete')
  })

  it('counts zero as data, not as missing', () => {
    expect(coverage([dim('precip')], { precip: 1 }, { precip: v(0) }).level).toBe('complete')
  })
})
