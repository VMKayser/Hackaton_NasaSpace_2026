import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseAnalogs } from '../data/load'
import type { AnalogsFile } from '../data/schema'
import { explain, rankSites, scoreMode } from './ranking'

const example = JSON.parse(readFileSync(new URL('../../../docs/analogs.example.json', import.meta.url), 'utf8'))

function load(json: unknown): AnalogsFile {
  const r = parseAnalogs(json)
  if (!r.success) throw new Error(JSON.stringify(r.error.issues))
  return r.data
}

describe('rankSites', () => {
  it('orders by similarity without a purpose and puts unscored pairs last', () => {
    const file = load(structuredClone(example))
    file.sites[0].scores = [] // siloli sin puntaje para jezero
    const rows = rankSites(file, 'jezero', null)
    expect(rows.map((r) => r.site.id)).toEqual(['dali', 'yungay-atacama', 'trinidad-control', 'siloli'])
    expect(rows.map((r) => r.rank)).toEqual([1, 2, 3, null])
  })

  it('uses purposeScores when the file has them for the purpose', () => {
    const json = structuredClone(example)
    json.sites.find((s: { id: string }) => s.id === 'trinidad-control').purposeScores['rover-mobility'] = 0.99
    const file = load(json)
    const purpose = file.meta.purposes![0]
    expect(scoreMode(file, purpose)).toBe('purpose')
    expect(rankSites(file, 'jezero', purpose)[0].site.id).toBe('trinidad-control')
  })

  it('falls back to similarity when no site has purposeScores', () => {
    const json = structuredClone(example)
    for (const s of json.sites) delete s.purposeScores
    const file = load(json)
    expect(scoreMode(file, file.meta.purposes![0])).toBe('similarity')
    expect(rankSites(file, 'jezero', file.meta.purposes![0])[0].site.id).toBe('siloli')
  })
})

describe('explain', () => {
  it('returns the two highest and the lowest weighted dimensions, ignoring null and weight 0', () => {
    const r = explain({ a: 0.9, b: 0.2, c: 0.7, d: null, e: 1 }, { a: 1, b: 1, c: 1, d: 1, e: 0 })
    expect(r).toEqual({ top: ['a', 'c'], low: 'b' })
  })

  it('has no weakest dimension when there are two or fewer', () => {
    expect(explain({ a: 0.9, b: 0.2 }, { a: 1, b: 1 })).toEqual({ top: ['a', 'b'], low: null })
  })
})
