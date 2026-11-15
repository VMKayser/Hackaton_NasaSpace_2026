import { describe, expect, it } from 'vitest'
import { fromLocal, MOON_RADIUS_M, southStereo, toLocal } from './polarFrame'
import type { PolarFrame } from './polarFrame'

const frameAt = (lat: number, lon: number): PolarFrame => {
  const [x0, y0] = southStereo(lat, lon)
  return { type: 'south-polar-stereographic', lat, lon, x0, y0 }
}

describe('polar frame', () => {
  it('follows the NASA LDEM layout: 0° up, 90° E to the right', () => {
    const [x0, y0] = southStereo(-89, 0)
    expect(x0).toBeCloseTo(0, 6)
    expect(y0).toBeGreaterThan(0)
    const [x90, y90] = southStereo(-89, 90)
    expect(x90).toBeGreaterThan(0)
    expect(y90).toBeCloseTo(0, 6)
  })

  it('puts the frame centre at 0°, 0° and round-trips real points', () => {
    const f = frameAt(-89.68, -166)
    const c = toLocal(f, -89.68, -166)
    expect(c.lat).toBeCloseTo(0, 9)
    expect(c.lon).toBeCloseTo(0, 9)
    const p = fromLocal(f, ...([0.12, -0.3] as const))
    const back = toLocal(f, p.lat, p.lon)
    expect(back.lat).toBeCloseTo(0.12, 9)
    expect(back.lon).toBeCloseTo(-0.3, 9)
  })

  it('keeps distances: one degree of the frame is one degree of arc on the Moon', () => {
    const f = frameAt(-86.04, 2.7)
    // 10 km hacia el polo a lo largo del meridiano: en el marco, 10 km de arco en latitud (escala ≈ 1).
    const km10 = (10000 / MOON_RADIUS_M) * (180 / Math.PI)
    const p = toLocal(f, -86.04 - km10, 2.7)
    expect(Math.hypot(p.lat, p.lon)).toBeCloseTo(km10, 3)
  })
})
