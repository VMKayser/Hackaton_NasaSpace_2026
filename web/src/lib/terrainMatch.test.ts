import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseAnalogs } from '../data/load'
import { terrainMatches } from './terrainMatch'

const file = (() => {
  const r = parseAnalogs(JSON.parse(readFileSync(new URL('../../public/data/analogs.json', import.meta.url), 'utf8')))
  if (!r.success) throw new Error('invalid analogs.json')
  return r.data
})()

describe('terrainMatches', () => {
  it('ranks every site and puts an identical site first with 100 %', () => {
    const site = file.sites.find((s) => s.id === 'uyuni')!
    const point = {
      slope_median_deg: site.values.slope.value as number,
      slope_p90_deg: site.values.steep.value as number,
      roughness_tri_m: site.values.roughness.value as number,
    }
    const list = terrainMatches(file, point)!
    expect(list).toHaveLength(file.sites.length)
    expect(list[0].similarity).toBeCloseTo(1, 9)
    expect(list.find((m) => m.siteId === 'uyuni')!.similarity).toBeCloseTo(1, 9)
    for (let i = 1; i < list.length; i++) expect(list[i - 1].similarity).toBeGreaterThanOrEqual(list[i].similarity)
  })

  it('matches the terrain-only purpose scores of the data file for a target', () => {
    // «Movilidad de rover» usa solo relieve con los mismos pesos: con los valores de Jezero, el navegador
    // debe dar los mismos puntajes que tools/build_analogs.py (redondeados a 3 decimales).
    const jezero = file.targets.find((t) => t.id === 'jezero')!
    const point = {
      slope_median_deg: jezero.values.slope.value as number,
      slope_p90_deg: jezero.values.steep.value as number,
      roughness_tri_m: jezero.values.roughness.value as number,
    }
    const list = terrainMatches(file, point)!
    for (const site of file.sites) {
      const expected = site.purposeScores?.['rover-mobility']
      if (expected == null) continue
      expect(list.find((m) => m.siteId === site.id)!.similarity).toBeCloseTo(expected, 2)
    }
  })

  it('returns null when the file has no terrain measures', () => {
    const bare = { ...file, meta: { ...file.meta, dimensions: file.meta.dimensions.map((d) => ({ ...d, measure: undefined })) } }
    expect(terrainMatches(bare, { slope_median_deg: 1, slope_p90_deg: 2, roughness_tri_m: 3 })).toBeNull()
  })
})
