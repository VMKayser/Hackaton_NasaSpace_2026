import { describe, expect, it } from 'vitest'
import {
  circleRing,
  decodeTerrarium,
  EARTH_RADIUS_KM,
  elevationAt,
  encodeTerrarium,
  proportionalExaggeration,
  sameScaleZoom,
  terrainMaxZoom,
} from './terrain'
import type { ElevationGrid } from './terrain'

function grid(bounds: ElevationGrid['bounds'], w: number, h: number, f: (x: number, y: number) => number | null, res = 100): ElevationGrid {
  const elevation = new Float32Array(w * h)
  const valid = new Uint8Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = f(x, y)
      elevation[y * w + x] = v ?? 0
      valid[y * w + x] = v === null ? 0 : 1
    }
  }
  return { bounds, width: w, height: h, elevation, valid, resolutionM: res }
}

describe('terrarium', () => {
  it('round-trips Mars elevations to 1/256 m', () => {
    for (const h of [-8200, -2560.25, 0, 21229.5]) {
      expect(decodeTerrarium(...encodeTerrarium(h))).toBeCloseTo(h, 2)
    }
  })
})

describe('elevationAt', () => {
  const coarse = grid([0, 0, 10, 10], 10, 10, () => -1000, 200)
  const fine = grid([4, 4, 6, 6], 20, 20, (x) => (x < 2 ? null : 500), 20)

  it('uses the finest grid with data, then the coarse one', () => {
    expect(elevationAt([fine, coarse], 5, 5)).toBeCloseTo(500)
    expect(elevationAt([fine, coarse], 4.05, 5)).toBeCloseTo(-1000) // sin dato en la fina
    expect(elevationAt([fine, coarse], 8, 8)).toBeCloseTo(-1000)
  })

  it('extends the coarse edge outside every grid, so there are no walls', () => {
    expect(elevationAt([fine, coarse], 30, -20)).toBeCloseTo(-1000)
  })

  it('interpolates bilinearly', () => {
    const ramp = grid([0, 0, 4, 1], 4, 1, (x) => x * 100)
    const g = { ...ramp, height: 2, elevation: new Float32Array([0, 100, 200, 300, 0, 100, 200, 300]), valid: new Uint8Array(8).fill(1) }
    expect(elevationAt([g], 2, 0.5)).toBeCloseTo(150)
  })
})

describe('scale', () => {
  it('keeps the same metres per pixel on both bodies', () => {
    const mars = 3389.5
    const zMars = sameScaleZoom(12, -22.2, 18.44, mars)
    const earthMpp = (EARTH_RADIUS_KM * Math.cos((-22.2 * Math.PI) / 180)) / 2 ** 12
    const marsMpp = (mars * Math.cos((18.44 * Math.PI) / 180)) / 2 ** zMars
    expect(marsMpp).toBeCloseTo(earthMpp, 9)
    expect(zMars).toBeLessThan(12)
  })

  it('scales the vertical exaggeration by the radius ratio', () => {
    expect(proportionalExaggeration(3389.5, 1.5)).toBeCloseTo(1.5 * 1.8796, 3)
    expect(proportionalExaggeration(EARTH_RADIUS_KM, 1.5)).toBe(1.5)
  })

  it('stops zooming where the finest grid has no more detail', () => {
    expect(terrainMaxZoom([200, 20], 3389.5)).toBe(12)
    expect(terrainMaxZoom([200], 3389.5)).toBe(9)
  })
})

describe('circleRing', () => {
  it('stays at the requested distance', () => {
    const ring = circleRing(-67.78, -22.2, 2, EARTH_RADIUS_KM)
    const [lon, lat] = ring[24]
    const dLat = ((lat + 22.2) * Math.PI) / 180
    const dLon = ((lon + 67.78) * Math.PI) / 180 * Math.cos((-22.2 * Math.PI) / 180)
    expect(Math.hypot(dLat, dLon) * EARTH_RADIUS_KM).toBeCloseTo(2, 2)
    expect(ring[0]).toEqual(ring[ring.length - 1])
  })
})
