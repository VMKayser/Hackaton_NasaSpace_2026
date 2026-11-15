import { describe, expect, it } from 'vitest'
import { commonStep, measurePatch, percentile, SLOPE_BINS } from './patch'
import { EARTH_RADIUS_KM } from './terrain'

const RAD = Math.PI / 180
const LON = -67.5
const LAT = -20.1

/** Plano inclinado hacia el este con la pendiente dada, en metros reales. */
function plane(deg: number, radiusKm = EARTH_RADIUS_KM, lon0 = LON, lat0 = LAT) {
  const k = Math.tan(deg * RAD)
  return (lon: number) => (lon - lon0) * RAD * radiusKm * 1000 * Math.cos(lat0 * RAD) * k + 3700
}

describe('measurePatch', () => {
  it('measures the slope of a tilted plane on Earth and on Mars', () => {
    for (const body of [EARTH_RADIUS_KM, 3389.5]) {
      const stats = measurePatch(plane(10, body), LON, LAT, 2, body, 50)!
      expect(stats.slopeMedian).toBeCloseTo(10, 3)
      expect(stats.slopeP90).toBeCloseTo(10, 3)
      expect(stats.steepShare).toBe(0)
      expect(stats.coverage).toBe(1)
      // P95 − P5 de un disco de 2 km inclinado 10°: menos que el diámetro, más que la mitad.
      const full = 4000 * Math.tan(10 * RAD)
      expect(stats.reliefM).toBeGreaterThan(full * 0.5)
      expect(stats.reliefM).toBeLessThan(full)
      expect(stats.elevationMean).toBeCloseTo(3700, 0)
    }
  })

  it('splits the area into slope classes that add up to one', () => {
    const stats = measurePatch(plane(25), LON, LAT, 1, EARTH_RADIUS_KM, 40)!
    expect(stats.histogram).toHaveLength(SLOPE_BINS.length)
    expect(stats.histogram.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9)
    expect(stats.histogram[SLOPE_BINS.indexOf(20)]).toBe(1)
    expect(stats.steepShare).toBe(1)
  })

  it('reports missing data as lower coverage, never as zero elevation', () => {
    const west = plane(5)
    const stats = measurePatch((lon) => (lon < LON ? null : west(lon)), LON, LAT, 2, EARTH_RADIUS_KM, 50)!
    expect(stats.coverage).toBeGreaterThan(0.4)
    expect(stats.coverage).toBeLessThan(0.6)
    expect(stats.slopeMedian).toBeCloseTo(5, 3)
    expect(stats.belowZeroShare).toBe(0)
    expect(measurePatch(() => null, LON, LAT, 2, EARTH_RADIUS_KM, 50)).toBeNull()
  })
})

describe('helpers', () => {
  it('interpolates percentiles', () => {
    expect(percentile([0, 10], 0.5)).toBe(5)
    expect(percentile([1, 2, 3, 4, 5], 0.9)).toBeCloseTo(4.6)
  })

  it('uses the coarsest resolution as the common step', () => {
    expect(commonStep(35.8, 20)).toBe(40)
    expect(commonStep(35.8, 200)).toBe(200)
  })
})
