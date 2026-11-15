import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseAnalogs } from '../data/load'
import { buildModel } from '../data/model'
import type { DiscoveriesFile } from '../data/schema'
import { translate } from '../i18n'
import { discoveredName, discoveredSummary, discoveredToSite, resolveRankedSite } from './discovered'
import { rankSites } from './ranking'

const example = JSON.parse(readFileSync(new URL('../../../docs/analogs.example.json', import.meta.url), 'utf8'))

describe('discovered helpers', () => {
  const parsed = parseAnalogs(example)
  if (!parsed.success) throw new Error('invalid example')
  const firstSite = parsed.data.sites[0]
  const firstTarget = parsed.data.targets[0]
  const discoveries: DiscoveriesFile = {
    meta: {
      generated: '2026-11-15T00:00:00Z',
      grid: {
        bbox: [-69, -23, -65.5, -17.5],
        stepDeg: 0.1,
        radiusKm: 2,
        points: 100,
        measured: 90,
        nearCatalogKm: 10,
        minSeparationKm: 15,
      },
      validation: [],
      sources: [{ name: 'Test Grid', agency: 'NASA', url: 'https://example.com' }],
    },
    points: {
      'grid_-21.8_-68': {
        id: 'grid_-21.8_-68',
        lat: -21.8,
        lon: -68.0,
        radiusKm: 2,
        elevationM: 4210,
        coverage: 1,
        values: firstSite.values,
        mapUnit: 'Neogene volcanic rocks',
        geology: { name: 'Neogene volcanic rocks', lith: 'Andesite', age: 'Miocene', url: 'https://macrostrat.org/' },
        place: { country: 'Bolivia', province: 'Provincia Nor Lípez', municipality: 'Municipio Colcha K' },
        nearestSite: { id: firstSite.id, km: 24.3 },
        scores: firstSite.scores,
      },
    },
    candidates: [],
  }
  const model = buildModel(parsed.data, {}, discoveries)
  const nearPlace = (place: string) => translate('en', 'discover.near', { place })

  it('builds readable names for named and administrative grid cells', () => {
    expect(discoveredName({ peak: 'Cerro Test' }, -21.8, -68, nearPlace)).toBe('Cerro Test')
    expect(discoveredName({ municipality: 'Municipio Colcha K' }, -21.8, -68, nearPlace)).toBe('Municipio Colcha K (-21.8, -68.0)')
    expect(discoveredName({ province: 'Provincia Nor Lípez' }, -21.8, -68, nearPlace)).toBe('Near Provincia Nor Lípez (-21.8, -68.0)')
  })

  it('resolves discovered points separately from the catalog ranking', () => {
    const rows = rankSites(model.file, firstTarget.id, null)
    const found = resolveRankedSite(model, rows, 'grid_-21.8_-68', firstTarget.id, null, nearPlace)
    expect(found).not.toBeNull()
    expect(found?.site.found).toBe(true)
    expect(found?.rank).toBeNull()
    expect(rows.some((r) => r.site.id === 'grid_-21.8_-68')).toBe(false)

    const adapted = discoveredToSite(model.foundById.get('grid_-21.8_-68')!, nearPlace)
    expect(adapted.found).toBe(true)

    const summary = discoveredSummary(model, found!, (k, vars) => translate('en', k, vars), 'en')
    expect(summary.exploration).toContain('11 km')
    expect(summary.limits).toContain('1:5,000,000')
  })
})
