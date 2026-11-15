import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { parseAnalogs, parseDiscoveries, parseTexts } from '../data/load'
import { buildModel } from '../data/model'
import { I18nContext, translate } from '../i18n'
import type { Lang } from '../i18n'
import { resolveRankedSite } from '../lib/discovered'
import { rankSites } from '../lib/ranking'
import { matchesQuery } from '../lib/voice'
import { ComparisonPanel } from './ComparisonPanel'
import { DiscoveriesSection } from './DiscoveriesSection'
import { PurposePicker } from './PurposePicker'
import { SiteDetail } from './SiteDetail'

const read = (path: string) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const analogs = parseAnalogs(read('../../public/data/analogs.json'))
const texts = parseTexts(read('../../public/data/texts.json'))
const discoveries = parseDiscoveries(read('../../public/data/discoveries.json'))
if (!analogs.success || !texts.success || !discoveries.success) throw new Error('data files do not parse')

const model = buildModel(analogs.data, texts.data, discoveries.data)
const wrap = (lang: Lang, node: ReturnType<typeof createElement>) =>
  renderToStaticMarkup(
    createElement(
      I18nContext.Provider,
      { value: { lang, t: (k, v) => translate(lang, k, v) } },
      node,
    ),
  )

describe('UI rendering for discovered points and target counts', () => {
  const firstCandidate = discoveries.data.candidates.find((c) => c.pointId && !c.purposeId)!
  const pointId = firstCandidate.pointId!
  const target = model.targetById.get(firstCandidate.targetId)!
  const rows = rankSites(model.file, target.id, null)
  const foundRow = resolveRankedSite(model, rows, pointId, target.id, null, (place) => translate('en', 'discover.near', { place }))!
  const nearestSite = model.siteById.get(firstCandidate.nearestSite.id)!

  it('renders body counts dynamically in PurposePicker in both languages', () => {
    const enHtml = wrap('en', createElement(PurposePicker, { model, onPurpose: () => {}, onTarget: () => {} }))
    const esHtml = wrap('es', createElement(PurposePicker, { model, onPurpose: () => {}, onTarget: () => {} }))
    expect(enHtml).toContain('16 target sites (9 Mars · 7 Moon)')
    expect(esHtml).toContain('16 sitios objetivo (9 Marte · 7 Luna)')
  })

  it('renders direct compare & inspect controls in DiscoveriesSection', () => {
    const html = wrap(
      'es',
      createElement(DiscoveriesSection, { model, target, purpose: null, onSelect: () => {}, onPin: () => {} }),
    )
    expect(html).toContain(translate('es', 'discover.open'))
    expect(html).toContain('Macrostrat')
  })

  it('renders complete data-backed sections and direct comparison for discovered points without pending placeholders', () => {
    const detailEn = wrap(
      'en',
      createElement(SiteDetail, {
        model,
        row: foundRow,
        total: rows.length,
        target,
        purpose: null,
        mode: 'similarity',
        onBack: () => {},
        onCompare: () => {},
        onCompareWith: () => {},
        onShowMap: () => {},
        onExplore: () => {},
        targets: model.file.targets,
        onTarget: () => {},
      }),
    )
    expect(detailEn).not.toContain(translate('en', 'text.pending'))
    expect(detailEn).toContain(translate('en', 'origin.found'))
    expect(detailEn).toContain(translate('en', 'discover.compareNearest', { site: nearestSite.name }))
    expect(detailEn).toContain(translate('en', 'discover.allTargets', { n: model.file.targets.length }))

    const compareEs = wrap(
      'es',
      createElement(ComparisonPanel, {
        model,
        target,
        rows,
        ids: [pointId, nearestSite.id],
        mode: 'similarity',
        purpose: null,
        onChange: () => {},
        onBack: () => {},
      }),
    )
    expect(compareEs).not.toContain(translate('es', 'text.pending'))
    expect(compareEs).toContain(nearestSite.name)
    expect(compareEs).toContain(foundRow.site.name)
  })

  it('matches US catalog sites cleanly for eeuu/usa queries without false positives elsewhere', () => {
    const pickUS = (q: string) =>
      model.file.sites
        .filter((s) => matchesQuery(q, s.name, s.place?.country, s.place?.country_en, s.place?.department, s.place?.state, s.type?.es, s.type?.en))
        .map((s) => s.id)
        .sort()
    expect(pickUS('eeuu')).toEqual(['badwater', 'kilauea', 'mdrs-utah'])
    expect(pickUS('ee. uu.')).toEqual(['badwater', 'kilauea', 'mdrs-utah'])
    expect(pickUS('usa')).toEqual(['badwater', 'kilauea', 'mdrs-utah'])
    expect(pickUS('estados unidos')).toEqual(['badwater', 'kilauea', 'mdrs-utah'])
    expect(pickUS('united states')).toEqual(['badwater', 'kilauea', 'mdrs-utah'])
  })
})
