import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { formatIssues, parseAnalogs, parseDiscoveries, parseTexts } from './load'
import { buildModel, siteText } from './model'

const read = (path: string) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const example = read('../../../docs/analogs.example.json')

describe('analogs.json', () => {
  it('accepts the example and the demo file', () => {
    expect(parseAnalogs(example).success).toBe(true)
    expect(parseAnalogs(read('../../public/data/analogs.json')).success).toBe(true)
  })

  it('reports unknown targets, duplicate ids and unknown dimensions', () => {
    const json = structuredClone(example)
    json.sites[1].id = json.sites[0].id
    json.sites[0].scores[0].targetId = 'gale'
    json.sites[0].values.albedo = { value: 0.2, unit: null }
    const r = parseAnalogs(json)
    expect(r.success).toBe(false)
    const text = formatIssues(r.error!).join('\n')
    expect(text).toContain('duplicate id "siloli"')
    expect(text).toContain('unknown target "gale"')
    expect(text).toContain('unknown dimension "albedo"')
  })

  it('rejects scores outside 0–1', () => {
    const json = structuredClone(example)
    json.sites[0].scores[0].similarity = 1.2
    expect(parseAnalogs(json).success).toBe(false)
  })

  it('converts longitudes between 180 and 360 and defaults control to false', () => {
    const json = structuredClone(example)
    json.targets[0].lon = 354.5
    delete json.sites[0].control
    const r = parseAnalogs(json)
    expect(r.success && r.data.targets[0].lon).toBe(-5.5)
    expect(r.success && r.data.sites[0].control).toBe(false)
  })
})

describe('texts', () => {
  it('prefers texts.json and treats empty strings as missing', () => {
    const analogs = parseAnalogs(example)
    const texts = parseTexts({
      sites: {
        siloli: { description: { en: 'From texts.json', es: '' } },
        dali: { limits: { en: '   ', es: '' } },
      },
    })
    if (!analogs.success || !texts.success) throw new Error('invalid fixture')
    const model = buildModel(analogs.data, texts.data)
    const siloli = model.siteById.get('siloli')!
    const dali = model.siteById.get('dali')!
    expect(siteText(model, siloli, 'description', 'en')).toBe('From texts.json')
    expect(siteText(model, siloli, 'description', 'es')).toBe('Candidato ilustrativo para la demostración.')
    expect(siteText(model, dali, 'limits', 'en')).toBe('Only the slope comparison is available.')
  })

  it('accepts the texts.json skeleton', () => {
    expect(parseTexts(read('../../public/data/texts.json')).success).toBe(true)
  })

  it('every site text in texts.json has at least one source with a link', () => {
    const texts = parseTexts(read('../../public/data/texts.json'))
    if (!texts.success) throw new Error('invalid texts.json')
    for (const [id, site] of Object.entries(texts.data.sites ?? {})) {
      const hasText = [site.description, site.limits, site.exploration].some((x) => x?.en.trim() || x?.es.trim())
      if (!hasText) continue
      expect(site.sources?.length ?? 0, id).toBeGreaterThan(0)
      for (const s of site.sources ?? []) expect(s.url, id).toMatch(/^https:\/\//)
    }
  })

  it('rejects a text source without a link', () => {
    expect(parseTexts({ sites: { uyuni: { sources: [{ name: 'X', agency: 'Y' }] } } }).success).toBe(false)
  })

  it('every adaptation points to an existing purpose or body and has linked sources', () => {
    const texts = parseTexts(read('../../public/data/texts.json'))
    const analogs = parseAnalogs(read('../../public/data/analogs.json'))
    if (!texts.success || !analogs.success) throw new Error('invalid data')
    const purposes = new Set((analogs.data.meta.purposes ?? []).map((p) => p.id))
    for (const a of texts.data.adaptations ?? []) {
      expect(a.purposeId === undefined ? a.body !== undefined : purposes.has(a.purposeId), a.id).toBe(true)
      for (const s of a.sources) expect(s.url, a.id).toMatch(/^https:\/\//)
    }
  })
})

describe('discoveries.json', () => {
  it('is valid, refers to existing targets, purposes and sites, and only lists places outside the catalogue', () => {
    const d = parseDiscoveries(read('../../public/data/discoveries.json'))
    const analogs = parseAnalogs(read('../../public/data/analogs.json'))
    if (!d.success || !analogs.success) throw new Error('invalid data')
    const targets = new Set(analogs.data.targets.map((t) => t.id))
    const purposes = new Set((analogs.data.meta.purposes ?? []).map((p) => p.id))
    const sites = new Set(analogs.data.sites.map((s) => s.id))
    expect(d.data.candidates.length).toBeGreaterThan(0)
    for (const c of d.data.candidates) {
      expect(targets.has(c.targetId)).toBe(true)
      if (c.purposeId) expect(purposes.has(c.purposeId)).toBe(true)
      expect(sites.has(c.nearestSite.id)).toBe(true)
      expect(c.nearestSite.km).toBeGreaterThanOrEqual(d.data.meta.grid.nearCatalogKm)
    }
  })
})
