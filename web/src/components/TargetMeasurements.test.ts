import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { parseAnalogs, parseTexts } from '../data/load'
import { buildModel } from '../data/model'
import { I18nContext, translate } from '../i18n'
import type { Lang } from '../i18n'
import { activeWeights } from '../lib/ranking'
import { DataLevelNote, TargetMeasurements } from './TargetMeasurements'

const read = (path: string) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const analogs = parseAnalogs(read('../../public/data/analogs.json'))
const texts = parseTexts(read('../../public/data/texts.json'))
if (!analogs.success || !texts.success) throw new Error('data files do not parse')
const model = buildModel(analogs.data, texts.data)

function render(lang: Lang, targetId: string, purposeId: string | null = null) {
  const target = model.targetById.get(targetId)!
  const purpose = analogs.data!.meta.purposes?.find((p) => p.id === purposeId) ?? null
  const i18n = { lang, t: (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) => translate(lang, key, vars) }
  return renderToStaticMarkup(
    createElement(I18nContext.Provider, { value: i18n },
      createElement(DataLevelNote, { model, target, weights: activeWeights(model.file, purpose) }),
      createElement(TargetMeasurements, { model, target })),
  )
}

describe('target data level and context', () => {
  it('a lunar target is partial in general and complete for the terrain-only purpose', () => {
    expect(render('es', 'connecting-ridge')).toContain('Datos parciales: 50')
    expect(render('en', 'connecting-ridge', 'lunar-base')).toContain('Complete data')
  })

  it('shows lunar and Martian context with sources in both languages', () => {
    const moon = render('es', 'malapert-massif')
    expect(moon).toContain('Medido en el objetivo, sin equivalente medido en la Tierra')
    expect(moon).toContain('Mejor iluminación a menos de 5 km')
    expect(moon).toContain('pgda.gsfc.nasa.gov')
    const mars = render('en', 'deuteronilus')
    expect(mars).toContain('SHARAD basal reflectors')
    expect(mars).toContain('Thermal inertia (TES, night)')
    expect(mars).toContain('zenodo')
  })
})
