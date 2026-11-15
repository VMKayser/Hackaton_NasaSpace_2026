import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { parseAnalogs } from '../data/load'
import { buildModel } from '../data/model'
import { isNavigation, parseSearch, reducer, resolveStory, toSearch } from './state'

it('restores comparisons from a shared URL and enforces the three distinct sites', () => {
  const state = parseSearch('?target=example&compare=one,one,two,three,four&world=moon&lang=es')
  expect(state.compare).toEqual(['one', 'two', 'three'])
  expect(parseSearch(toSearch(state))).toEqual(state)

  const emptyComparison = reducer(state, { type: 'setCompare', sites: [] })
  expect(parseSearch(toSearch(emptyComparison)).compare).toEqual([])
  expect(isNavigation(emptyComparison, reducer(emptyComparison, { type: 'setCompare', sites: null }))).toBe(true)
})

it('uses the shared story step as the source of its purpose, target, site and view', () => {
  const file = parseAnalogs(JSON.parse(readFileSync(new URL('../../../docs/analogs.example.json', import.meta.url), 'utf8')))
  if (!file.success) throw file.error
  const purpose = file.data.meta.purposes![0]
  const model = buildModel(file.data, {
    story: [{
      purposeId: purpose.id,
      siteId: file.data.sites[0].id,
      compare: ['missing-site', file.data.sites[1].id],
      view: '2d',
      caption: { en: 'Example', es: 'Ejemplo' },
    }, { caption: { en: 'Second step', es: 'Segundo paso' } }],
  })
  const initial = parseSearch('?step=0&target=stale&world=moon&lang=es')
  const first = resolveStory(initial, model)
  expect(first).toMatchObject({
    purpose: purpose.id,
    target: purpose.targetId,
    site: file.data.sites[0].id,
    compare: [file.data.sites[1].id],
    world: 'auto',
    view: '2d',
    lang: 'es',
  })
  const second = resolveStory(reducer(first, { type: 'setStep', step: 1 }), model)
  expect(second).toMatchObject({ target: null, purpose: null, site: null, compare: null, view: 'globe', lang: 'es' })
  expect(resolveStory(parseSearch('?step=9'), model).step).toBeNull()
})

it('switches the planetary target while keeping the terrestrial comparison', () => {
  const initial = parseSearch('?purpose=field-task&target=one&compare=alpha,beta&world=mars&step=1')
  expect(reducer(initial, { type: 'selectPlanetTarget', target: 'one' })).toBe(initial)
  const switched = reducer(initial, { type: 'selectPlanetTarget', target: 'two' })
  expect(switched).toMatchObject({ purpose: null, target: 'two', compare: ['alpha', 'beta'], world: 'mars', step: null })
  expect(isNavigation(initial, switched)).toBe(true)
})

it('keeps free pins in the URL and clears them when the comparison changes', () => {
  const state = parseSearch('?target=one&pin=-20.13,-67.49&tpin=mars:18.44,77.45&lang=es')
  expect(state.pin).toEqual({ lat: -20.13, lon: -67.49 })
  expect(state.tpin).toEqual({ lat: 18.44, lon: 77.45, body: 'mars' })
  expect(parseSearch(toSearch(state))).toEqual(state)
  expect(parseSearch('?pin=95,10&tpin=a,b').pin).toBeNull()
  expect(parseSearch('?tpin=10').tpin).toBeNull()
  expect(parseSearch('?tpin=18.44,77.45').tpin).toBeNull()
  expect(parseSearch('?tpin=moon:26.13,3.63').tpin).toEqual({ lat: 26.13, lon: 3.63, body: 'moon' })

  const pinned = reducer(parseSearch('?target=one&site=alpha'), { type: 'setPin', pin: { lon: -67.5, lat: -20.1 } })
  expect(pinned).toMatchObject({ site: null, pin: { lon: -67.5, lat: -20.1 } })
  expect(isNavigation(parseSearch('?target=one'), pinned)).toBe(true)
  expect(reducer(pinned, { type: 'selectSite', site: 'alpha' })).toMatchObject({ site: 'alpha', pin: null, tpin: null })
  expect(reducer(state, { type: 'selectPlanetTarget', target: 'two' })).toMatchObject({ pin: state.pin, tpin: state.tpin })
  expect(reducer(state, { type: 'setPin', pin: null })).toMatchObject({ pin: null, tpin: null })
})
