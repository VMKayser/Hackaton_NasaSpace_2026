import { describe, expect, it } from 'vitest'
import { fold, matchesQuery, parseVoice } from './voice'
import type { VoiceVocabulary } from './voice'

const vocab: VoiceVocabulary = {
  sites: [
    { id: 'uyuni', name: 'Salar de Uyuni' },
    { id: 'coipasa', name: 'Salar de Coipasa' },
    { id: 'valle-luna', name: 'Valle de la Luna, La Paz' },
    { id: 'sol', name: 'Sol de Mañana' },
  ],
  targets: [
    { id: 'jezero', name: 'Jezero' },
    { id: 'gale', name: 'Gale (Bradbury Landing)' },
    { id: 'utopia', name: 'Utopia Planitia (Viking 2)' },
    { id: 'arcadia', name: 'Arcadia Planitia (Badger)' },
  ],
  bodies: { mars: 'Marte', moon: 'Luna' },
  home: ['inicio', 'volver'],
  filler: ['buscar', 'muestrame', 'compara', 'con', 'los', 'las', 'de', 'la', 'el', 'en', 'sitios', 'lugares'],
}

describe('parseVoice', () => {
  it('folds accents and punctuation', () => {
    expect(fold('¡Sol de Mañana!')).toBe('sol de manana')
  })

  it('finds a target by a word of its own, not by a shared one', () => {
    expect(parseVoice('compara con Gale', vocab)).toEqual({ kind: 'target', id: 'gale', site: null })
    expect(parseVoice('Viking', vocab)).toEqual({ kind: 'target', id: 'utopia', site: null })
    // «planitia» está en dos objetivos: no elige ninguno.
    expect(parseVoice('planitia', vocab).kind).toBe('search')
  })

  it('finds a site by its full name or a distinctive word, with accents', () => {
    expect(parseVoice('Sol de Manana', vocab)).toEqual({ kind: 'site', id: 'sol' })
    expect(parseVoice('muéstrame Uyuni', vocab)).toEqual({ kind: 'site', id: 'uyuni' })
  })

  it('can name a target and a site in one sentence', () => {
    expect(parseVoice('Jezero y Coipasa', vocab)).toEqual({ kind: 'target', id: 'jezero', site: 'coipasa' })
  })

  it('a body word chooses the body, not the site that contains it', () => {
    expect(parseVoice('la Luna', vocab)).toEqual({ kind: 'body', body: 'moon' })
  })

  it('goes home, or falls back to a search without filler words', () => {
    expect(parseVoice('volver al inicio', vocab)).toEqual({ kind: 'home' })
    expect(parseVoice('buscar los salares', vocab)).toEqual({ kind: 'search', query: 'salares' })
  })
})

describe('matchesQuery', () => {
  it('matches dotted US abbreviations, usa, and bilingual country names', () => {
    const args = ['Badwater Basin (EE. UU.)', 'Estados Unidos de América', 'United States', 'California', 'Evaporite basin']
    expect(matchesQuery('eeuu', ...args)).toBe(true)
    expect(matchesQuery('ee.uu.', ...args)).toBe(true)
    expect(matchesQuery('EE. UU.', ...args)).toBe(true)
    expect(matchesQuery('usa', ...args)).toBe(true)
    expect(matchesQuery('united states', ...args)).toBe(true)
    expect(matchesQuery('estados unidos', ...args)).toBe(true)
    expect(matchesQuery('california', ...args)).toBe(true)
  })

  it('does not falsely match "usa" inside unrelated words in other countries', () => {
    expect(matchesQuery('usa', 'Salar de Uyuni', 'Bolivia', 'Potosí', 'Causa salina')).toBe(false)
    expect(matchesQuery('eeuu', 'Dallol', 'Etiopía', 'Ethiopia', 'Afar')).toBe(false)
  })
})
