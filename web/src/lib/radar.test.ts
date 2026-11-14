import { expect, it } from 'vitest'
import type { Dimension, Value } from '../data/schema'
import { radarMeasurements } from './radar'

const dimension = (id: string): Dimension => ({ id, label: { en: id, es: id }, weight: 1, sources: [] })
const measure = (value: Value['value'], unit: string | null): Value => ({ value, unit })

it('positions both measurements on the same catalog range and keeps their raw values', () => {
  const earth = { temperature: measure(0, '°C'), elevation: measure(2000, 'm') }
  const mars = { temperature: measure(-50, '°C'), elevation: measure(2000, 'm') }
  const catalog = [
    { values: { ...earth, temperature: measure(50, '°C') } },
    { values: { ...mars, temperature: measure(-100, '°C') } },
    { values: { ...mars, temperature: measure(1000, 'K'), elevation: measure(9999, 'ft') } },
  ]

  const values = radarMeasurements([dimension('temperature'), dimension('elevation')], catalog, earth, mars)
  expect(values[0].earthPosition).toBeCloseTo(100 * 2 / 3)
  expect(values[0].targetPosition).toBeCloseTo(100 / 3)
  expect(values[0].earth).toEqual(measure(0, '°C'))
  expect(values[0].target).toEqual(measure(-50, '°C'))
  expect(values[1]).toMatchObject({ earthPosition: 50, targetPosition: 50 })
})

it('omits missing values, categories and mismatched units instead of plotting zeros', () => {
  const values = radarMeasurements(
    [dimension('albedo'), dimension('geology'), dimension('elevation')],
    [],
    { albedo: measure(null, null), geology: measure('volcanic', null), elevation: measure(100, 'm') },
    { albedo: measure(0.2, null), geology: measure('lacustrine', null), elevation: measure(30, 'ft') },
  )
  expect(values).toEqual([])
})
