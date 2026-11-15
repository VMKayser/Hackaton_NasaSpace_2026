import { describe, expect, it } from 'vitest'
import { sampleGrid } from '../lib/terrain'
import type { ElevationGrid } from '../lib/terrain'
import { demWindow, GLOBAL_DEMS } from './usgsDem'

describe('demWindow', () => {
  const mars = GLOBAL_DEMS.mars

  it('finds the file rows and columns of a place', () => {
    // Centro de Jezero: fila y columna comprobadas con una lectura real del archivo (−2574 m).
    const w = demWindow(mars, 77.45, 18.44, 77.45, 18.44)
    expect(w.r0).toBe(21208)
    expect(w.c0).toBe(76301)
    expect(w.stride).toBe(1)
  })

  it('keeps pixel centres where the file has them, also when skipping rows', () => {
    for (const maxRows of [Infinity, 40]) {
      const w = demWindow(mars, 77, 18, 78, 19, maxRows)
      const d = mars.degPerPx
      // Rejilla sintética: cada píxel guarda su fila del archivo; al muestrear el centro de un píxel
      // del archivo debe salir esa fila.
      const g: ElevationGrid = {
        bounds: w.bounds,
        width: w.width,
        height: w.height,
        elevation: Float32Array.from({ length: w.width * w.height }, (_, k) => w.r0 + Math.floor(k / w.width) * w.stride),
        valid: new Uint8Array(w.width * w.height).fill(1),
        resolutionM: 200 * w.stride,
      }
      const row = w.r0 + 3 * w.stride
      const col = w.c0 + 5 * w.stride
      const lat = mars.north - (row + 0.5) * d
      const lon = mars.west + (col + 0.5) * d
      expect(sampleGrid(g, lon, lat, false)).toBeCloseTo(row, 6)
      expect(w.height).toBeLessThanOrEqual(maxRows)
    }
  })

  it('stays inside the file and the lunar band', () => {
    const moon = GLOBAL_DEMS.moon
    const w = demWindow(moon, -181, 59.9, -179.9, 61)
    expect(w.r0).toBe(0)
    expect(w.c0).toBe(0)
    expect(moon.south).toBe(-60)
  })
})
