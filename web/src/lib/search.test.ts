import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseAnalogs, parseTexts } from '../data/load'
import { buildModel, siteText } from '../data/model'
import { queryTokens, searchFields, siteFields, snippet, targetFields } from './search'

const read = (path: string) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const model = (() => {
  const a = parseAnalogs(read('../../public/data/analogs.json'))
  const t = parseTexts(read('../../public/data/texts.json'))
  if (!a.success || !t.success) throw new Error('invalid data files')
  return buildModel(a.data, t.data)
})()

const findSites = (q: string, lang: 'en' | 'es' = 'es') =>
  model.file.sites.filter((s) => searchFields(q, siteFields(model, s, lang))).map((s) => s.id)

describe('queryTokens', () => {
  it('drops accents and stopwords but keeps a lone stopword', () => {
    expect(queryTokens('Salar de  Potosí')).toEqual(['salar', 'potosi'])
    expect(queryTokens('de')).toEqual(['de'])
  })
})

describe('site search', () => {
  it('matches every word in any field, not the whole phrase', () => {
    expect(findSites('salar potosí')).toContain('uyuni')
    expect(findSites('potosí salar')).toContain('uyuni')
  })

  it('finds a site by a word of its description and quotes it', () => {
    const uyuni = model.siteById.get('uyuni')!
    const word = siteText(model, uyuni, 'description', 'es')!.split(/\s+/).find((w) => w.length > 6 && !uyuni.name.includes(w))!
    const hit = searchFields(word, siteFields(model, uyuni, 'es'))
    expect(hit).not.toBeNull()
    expect(hit!.snippet!.some((p) => p.hit)).toBe(true)
  })

  it('finds sites by the label of a geology category in either language', () => {
    const dim = model.dimensions.find((d) => d.categories && Object.keys(d.categories).length)!
    const [code, label] = Object.entries(dim.categories!)[0]
    const expected = model.file.sites.filter((s) => s.values[dim.id]?.value === code).map((s) => s.id)
    expect(expected.length).toBeGreaterThan(0)
    for (const q of [label.es, label.en]) for (const id of expected) expect(findSites(q)).toContain(id)
  })

  it('accepts plurals', () => {
    expect(findSites('salares')).toEqual(findSites('salar'))
  })

  it('keeps the dotted US abbreviations working', () => {
    expect(findSites('EE. UU.')).toContain('badwater')
    expect(findSites('usa')).toContain('badwater')
  })

  it('returns nothing for a word that appears nowhere', () => {
    expect(findSites('xyzzyq')).toEqual([])
  })

  it('does not quote text when the match is already visible in the row', () => {
    const hit = searchFields('Uyuni', siteFields(model, model.siteById.get('uyuni')!, 'es'))
    expect(hit?.field).toBeNull()
  })

  it('ranks a name match above a description match', () => {
    const uyuni = model.siteById.get('uyuni')!
    const byName = searchFields('uyuni', siteFields(model, uyuni, 'es'))!
    const other = model.file.sites.find((s) => s.id !== 'uyuni' && searchFields('uyuni', siteFields(model, s, 'es')))
    if (other) expect(byName.score).toBeGreaterThan(searchFields('uyuni', siteFields(model, other, 'es'))!.score)
  })
})

describe('target search', () => {
  it('finds a target through the label of one of its purposes', () => {
    const purpose = model.purposes[0]
    const target = model.targetById.get(purpose.targetId)!
    const label = model.texts.purposes?.[purpose.id]?.label?.es ?? purpose.label?.es
    if (!label) return
    expect(searchFields(label, targetFields(model, target, 'es', 'Marte'))).not.toBeNull()
  })
})

describe('snippet', () => {
  it('marks the matching words and trims around the first one', () => {
    const parts = snippet('uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince dieciséis diecisiete', ['ocho'], 2, 2)!
    expect(parts.map((p) => p.text).join('')).toBe('… seis siete ocho nueve diez …')
    expect(parts.filter((p) => p.hit).map((p) => p.text)).toEqual(['ocho'])
  })

  it('returns null when no word matches', () => {
    expect(snippet('nada que ver', ['salar'])).toBeNull()
  })
})
