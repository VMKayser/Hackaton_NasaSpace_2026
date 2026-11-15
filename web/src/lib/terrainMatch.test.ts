import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseAnalogs, parseGrid } from '../data/load'
import { distanceKm, gridMatches, targetMatches, terrainMatches, valuesPoint } from './terrainMatch'

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

describe('targetMatches', () => {
  it('ranks every target with terrain data and puts an identical target first', () => {
    const gale = file.targets.find((t) => t.id === 'gale')!
    const point = {
      slope_median_deg: gale.values.slope.value as number,
      slope_p90_deg: gale.values.steep.value as number,
      roughness_tri_m: gale.values.roughness.value as number,
    }
    const list = targetMatches(file, point)!
    expect(list).toHaveLength(file.targets.length)
    expect(list[0].targetId).toBe('gale')
    expect(list[0].similarity).toBeCloseTo(1, 9)
  })

  it('is symmetric with terrainMatches for a catalog site', () => {
    // Un sitio frente a un objetivo da el mismo parecido de relieve en los dos sentidos.
    const site = file.sites.find((s) => s.id === 'siloli')!
    const target = file.targets.find((t) => t.id === 'jezero')!
    const p = (v: typeof site.values) => ({
      slope_median_deg: v.slope.value as number,
      slope_p90_deg: v.steep.value as number,
      roughness_tri_m: v.roughness.value as number,
    })
    const a = targetMatches(file, p(site.values))!.find((m) => m.targetId === 'jezero')!.similarity
    const b = terrainMatches(file, p(target.values))!.find((m) => m.siteId === 'siloli')!.similarity
    expect(a).toBeCloseTo(b, 2)
  })
})

describe('match detail', () => {
  it('gives one entry per terrain dimension whose similarities average to the total', () => {
    const jezero = file.targets.find((t) => t.id === 'jezero')!
    const point = {
      slope_median_deg: jezero.values.slope.value as number,
      slope_p90_deg: jezero.values.steep.value as number,
      roughness_tri_m: jezero.values.roughness.value as number,
    }
    for (const m of terrainMatches(file, point)!.slice(0, 5)) {
      const scored = m.dimensions.filter((d) => d.similarity !== null)
      expect(m.dimensions.map((d) => d.measure).sort()).toEqual(['roughness_tri_m', 'slope_median_deg', 'slope_p90_deg'])
      const total = scored.reduce((s, d) => s + d.weight * d.similarity!, 0) / scored.reduce((s, d) => s + d.weight, 0)
      expect(total).toBeCloseTo(m.similarity, 9)
      for (const d of m.dimensions) {
        expect(d.lo).not.toBeNull()
        expect(d.point).toBeGreaterThanOrEqual(d.lo!)
        expect(d.point).toBeLessThanOrEqual(d.hi!)
      }
    }
  })
})

const grid = (() => {
  const r = parseGrid(JSON.parse(readFileSync(new URL('../../public/data/grid.json', import.meta.url), 'utf8')))
  if (!r.success) throw new Error('invalid grid.json')
  return r.data
})()

describe('gridMatches', () => {
  const far = grid.points.filter((p) => p.nearestSite.km >= 10)
  const pick = far[Math.floor(far.length / 2)]
  const point = {
    slope_median_deg: pick.values.slope_median_deg,
    slope_p90_deg: pick.values.slope_p90_deg,
    roughness_tri_m: pick.values.roughness_tri_m,
  }

  it('puts a grid point identical to the pin first with 100 %', () => {
    const list = gridMatches(file, grid.points, point)!
    expect(list[0].similarity).toBeCloseTo(1, 9)
    expect(list[0].point.values).toEqual(pick.values)
    for (let i = 1; i < list.length; i++) expect(list[i - 1].similarity).toBeGreaterThanOrEqual(list[i].similarity)
  })

  it('leaves out points near the catalog and keeps proposals apart', () => {
    const list = gridMatches(file, grid.points, point, { limit: 20 })!
    expect(list.length).toBeGreaterThan(5)
    for (const m of list) expect(m.point.nearestSite.km).toBeGreaterThanOrEqual(10)
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        expect(distanceKm(list[i].point.lat, list[i].point.lon, list[j].point.lat, list[j].point.lon)).toBeGreaterThanOrEqual(15)
      }
    }
  })

  it('scores a grid point like a catalog site with the same values', () => {
    // Misma escala y pesos que los sitios: el parecido de un punto debe ser el de un sitio con sus valores.
    const site = file.sites.find((s) => s.id === 'uyuni')!
    const asSite = terrainMatches(file, point)!.find((m) => m.siteId === site.id)!
    const asGrid = gridMatches(file, [{
      lat: 0, lon: 0, nearestSite: { id: site.id, km: 99 },
      values: { slope_median_deg: site.values.slope.value as number, slope_p90_deg: site.values.steep.value as number, roughness_tri_m: site.values.roughness.value as number },
    }], point)!
    expect(asGrid[0].similarity).toBeCloseTo(asSite.similarity, 9)
  })
})

describe('valuesPoint', () => {
  it('reads the three terrain measures of a target, including the lunar south pole', () => {
    const t = file.targets.find((x) => x.id === 'shackleton-rim')!
    const p = valuesPoint(file, t.values)!
    expect(p.slope_median_deg).toBe(t.values.slope.value)
    expect(p.slope_p90_deg).toBe(t.values.steep.value)
    expect(p.roughness_tri_m).toBe(t.values.roughness.value)
  })

  it('returns null when a measure is missing', () => {
    const t = file.targets.find((x) => x.id === 'jezero')!
    expect(valuesPoint(file, { ...t.values, slope: { value: null } })).toBeNull()
  })
})
