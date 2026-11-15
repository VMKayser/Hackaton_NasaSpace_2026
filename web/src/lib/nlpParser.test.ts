import { describe, expect, it } from 'vitest'
import { parseNaturalLanguageQuery } from './nlpParser'
import type { Site, Target } from '../data/schema'

const mockTargets: Target[] = [
  {
    id: 'gale',
    name: 'Cráter Gale (Monte Sharp)',
    body: 'mars',
    lat: -5.4,
    lon: 137.8,
    values: {},
  },
  {
    id: 'jezero',
    name: 'Cráter Jezero (Delta y Paleolago)',
    body: 'mars',
    lat: 18.38,
    lon: 77.58,
    values: {},
  },
  {
    id: 'hadley',
    name: 'Rima Hadley (Apeninos Lunares, Apollo 15)',
    body: 'moon',
    lat: 26.13,
    lon: 3.63,
    values: {},
  },
  {
    id: 'malapert-massif-site23',
    name: 'Malapert Massif (Luna - Artemis III Sitio 23)',
    body: 'moon',
    lat: -85.99,
    lon: 2.94,
    values: {},
  },
]

const mockDimensions = [
  { id: 'terrain', label: { en: 'Median slope', es: 'Pendiente media' } },
  { id: 'relief', label: { en: 'Local relief', es: 'Relieve local escalado' } },
  { id: 'roughness', label: { en: 'Roughness', es: 'Rugosidad' } },
  { id: 'temp', label: { en: 'Temperature', es: 'Temperatura media anual' } },
  { id: 'mineralogy', label: { en: 'Mineralogy', es: 'Mineralogía' } },
]

const mockSites: Site[] = [
  {
    id: 'uyuni',
    name: 'Salar de Uyuni',
    lat: -20.3,
    lon: -67.6,
    known: true,
    reference: false,
    control: false,
    values: {},
    scores: [],
  },
  {
    id: 'poopo',
    name: 'Lago Poopó (lecho seco)',
    lat: -18.8,
    lon: -67.0,
    known: false,
    reference: false,
    control: false,
    values: {},
    scores: [],
  },
]

describe('parseNaturalLanguageQuery', () => {
  it('identifies Gale crater query in general (User Example 1)', () => {
    const query = 'quiero los lugares en bolivia similares al crater gale de marte en general'
    const result = parseNaturalLanguageQuery(query, mockTargets, mockDimensions, mockSites, 'es')

    expect(result.targetId).toBe('gale')
    expect(result.body).toBe('mars')
    expect(result.country).toBe('Bolivia')
    expect(result.world).toBe('auto')
    expect(result.isGeneral).toBe(true)
    expect(result.dimensionId).toBeNull()
    expect(result.explanation).toContain('Cráter Gale')
  })

  it('identifies country filter and keeps world as auto when searching Gale in Bolivia', () => {
    const query = 'dije que busque lugares en bolivia que sean similares al crater gale de marte'
    const result = parseNaturalLanguageQuery(query, mockTargets, mockDimensions, mockSites, 'es')

    expect(result.targetId).toBe('gale')
    expect(result.body).toBe('mars')
    expect(result.country).toBe('Bolivia')
    expect(result.world).toBe('auto')
  })

  it('identifies Jezero query specifically for slope (User Example 2)', () => {
    const query = 'ahora quiero ver que lugares de bolivia son similares al crater jezero en cuanto a pendiente'
    const result = parseNaturalLanguageQuery(query, mockTargets, mockDimensions, mockSites, 'es')

    expect(result.targetId).toBe('jezero')
    expect(result.body).toBe('mars')
    expect(result.dimensionId).toBe('terrain')
    expect(result.dimensionName).toBe('Pendiente media')
    expect(result.explanation).toContain('Pendiente media')
  })

  it('identifies lunar target Hadley with mineralogy', () => {
    const query = 'muestra los análogos lunares a rima hadley según mineralogía'
    const result = parseNaturalLanguageQuery(query, mockTargets, mockDimensions, mockSites, 'es')

    expect(result.targetId).toBe('hadley')
    expect(result.body).toBe('moon')
    expect(result.dimensionId).toBe('mineralogy')
  })

  it('detects action to view adaptation', () => {
    const query = 'ver adaptación técnica para salar de uyuni'
    const result = parseNaturalLanguageQuery(query, mockTargets, mockDimensions, mockSites, 'es')

    expect(result.action).toBe('adaptation')
    expect(result.siteId).toBe('uyuni')
  })

  it('detects 3D exploration command', () => {
    const query = 'quiero explorar en 3D'
    const result = parseNaturalLanguageQuery(query, mockTargets, mockDimensions, mockSites, 'es')

    expect(result.action).toBe('explore3d')
  })
})
