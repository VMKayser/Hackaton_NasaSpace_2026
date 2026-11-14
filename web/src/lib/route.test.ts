import { describe, expect, it } from 'vitest'
import { boundsOf, distanceM, profileStats, resample, transplant } from './route'
import type { LonLat } from './route'
import { EARTH_RADIUS_KM } from './terrain'

const MARS = 3389.5

describe('transplant', () => {
  it('keeps real distances and bearings when moving a route to another body', () => {
    const start: LonLat = [77.4509, 18.4446]
    const route: LonLat[] = [start, [77.4609, 18.4446], [77.4609, 18.4546]]
    const site: LonLat = [-67.78, -22.2]
    const moved = transplant(route, start, MARS, site, EARTH_RADIUS_KM)
    expect(moved[0]).toEqual(site)
    expect(distanceM(moved[0], moved[1], EARTH_RADIUS_KM)).toBeCloseTo(distanceM(route[0], route[1], MARS), 0)
    expect(distanceM(moved[1], moved[2], EARTH_RADIUS_KM)).toBeCloseTo(distanceM(route[1], route[2], MARS), 0)
    expect(moved[1][1]).toBeCloseTo(site[1], 9) // hacia el este sigue siendo hacia el este
    expect(moved[2][0]).toBeCloseTo(moved[1][0], 9) // hacia el norte sigue siendo hacia el norte
  })
})

describe('resample', () => {
  it('places points every step along the line', () => {
    const line: LonLat[] = [[0, 0], [0.01, 0], [0.01, 0.01]]
    const total = distanceM(line[0], line[1], EARTH_RADIUS_KM) + distanceM(line[1], line[2], EARTH_RADIUS_KM)
    const { points, dist } = resample(line, 100, EARTH_RADIUS_KM)
    expect(dist[1] - dist[0]).toBeCloseTo(100, 6)
    expect(dist[dist.length - 1]).toBeLessThanOrEqual(total)
    expect(points.length).toBe(Math.floor(total / 100) + 1)
  })
})

describe('profileStats', () => {
  it('measures ascent, descent and the share of steep ground', () => {
    const dist = [0, 100, 200, 300]
    const elev = [0, 100 * Math.tan((30 * Math.PI) / 180), 100 * Math.tan((30 * Math.PI) / 180), 0]
    const s = profileStats(dist, elev, [10, 40])
    expect(s.maxSlopeDeg).toBeCloseTo(30, 6)
    expect(s.ascentM).toBeCloseTo(57.735, 2)
    expect(s.descentM).toBeCloseTo(57.735, 2)
    expect(s.steeperThan[10]).toBeCloseTo(2 / 3, 6)
    expect(s.steeperThan[40]).toBe(0)
    expect(s.lengthKm).toBeCloseTo(0.3, 6)
  })

  it('skips missing elevations', () => {
    const s = profileStats([0, 100, 200], [0, null, 10], [5])
    expect(s.maxSlopeDeg).toBe(0)
    expect(s.steeperThan[5]).toBe(0)
  })
})

describe('boundsOf', () => {
  it('returns west, south, east, north', () => {
    expect(boundsOf([[1, 2], [-3, 5], [4, -1]])).toEqual([-3, -1, 4, 5])
  })
})
