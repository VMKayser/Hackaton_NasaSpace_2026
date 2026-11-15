import { useState } from 'react'
import type { Model } from '../data/model'
import { purposeLabel, purposeQuestion, targetSummary, targetTextSources } from '../data/model'
import type { Purpose, Target } from '../data/schema'
import { useI18n } from '../i18n'
import { formatCoords, formatPercent } from '../lib/format'
import { activeWeights } from '../lib/ranking'
import type { RankedSite, ScoreMode } from '../lib/ranking'
import { searchFields, siteFields } from '../lib/search'
import { BackButton, BodyChip, KindIcon, MatchSnippet, Pending, ScoreBar, SiteBadges, SiteGlyph } from './ui'
import { siteGlyphProps } from '../lib/glyph'
import { DataLevelNote, TargetMeasurements } from './TargetMeasurements'
import { ScoreMethod } from './ScoreMethod'
import { SourceLinks } from './SourceLinks'
import { DiscoveriesSection } from './DiscoveriesSection'
import { VoiceControl } from './VoiceControl'
import type { VoiceHandler } from './VoiceControl'
import type { Point } from '../lib/state'

interface Props {
  model: Model
  purpose: Purpose | null
  target: Target
  rows: RankedSite[]
  mode: ScoreMode
  selectedId: string | null
  onSelect: (id: string) => void
  onBack: () => void
  onCompare: () => void
  /** Pone el pin libre de la Tierra en un lugar nuevo de la malla. */
  onPin: (point: Point) => void
  /** Comandos de voz que la app resuelve (objetivo, sitio, cuerpo, inicio); la búsqueda la resuelve el panel. */
  onVoice?: VoiceHandler
}

function TargetCard({ model, target, question, weights }: { model: Model; target: Target; question: string | null; weights: Record<string, number> }) {
  const { t, lang } = useI18n()
  const summary = targetSummary(model, target, lang)
  const summarySources = targetTextSources(model, target)
  return (
    <div className="rounded-lg bg-paper px-3 py-2.5">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="text-muted">{t('target.comparing')}</span>
        <strong className="font-semibold text-ink">{target.name}</strong>
        <BodyChip body={target.body} />
      </p>
      <DataLevelNote model={model} target={target} weights={weights} />
      <details key={target.id} className="mt-1">
        <summary className="cursor-pointer rounded py-1 text-xs font-semibold text-earth">{t('target.measurements')}</summary>
        {question && <p className="mt-1 text-[13px] leading-snug text-ink">{question}</p>}
        <p className="mt-1 text-[13px] leading-snug text-muted">{summary ?? <Pending />}</p>
        {summarySources.length > 0 && <div className="mt-1 wrap-anywhere"><SourceLinks sources={summarySources} /></div>}
        <p className="mt-1 font-mono text-[11px] text-muted">{formatCoords(target.lat, target.lon, lang)}</p>
        <TargetMeasurements model={model} target={target} />
      </details>
    </div>
  )
}

export function RankingPanel({ model, purpose, target, rows, mode, selectedId, onSelect, onBack, onCompare, onPin, onVoice }: Props) {
  const { t, lang } = useI18n()
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState<string | null>(null)
  const [department, setDepartment] = useState<string | null>(null)
  // País y departamento salen de los datos (sites[].place, de OpenStreetMap); el texto busca también en ambos idiomas y siglas.
  const countryOf = (r: RankedSite) => (lang === 'en' && r.site.place?.country_en) || r.site.place?.country || null
  const departmentOf = (r: RankedSite) => r.site.place?.department ?? null
  // La búsqueda mira también la geología y los textos de la ficha (descripción, qué probar, límites).
  const q = query.trim()
  const hits = new Map(q ? rows.map((r) => [r.site.id, searchFields(q, siteFields(model, r.site, lang))]) : [])
  const shown = rows.filter(
    (r) =>
      (!q || hits.get(r.site.id)) &&
      (!country || countryOf(r) === country) &&
      (!department || departmentOf(r) === department),
  )
  const count = (values: (string | null)[]) => {
    const m = new Map<string, number>()
    for (const v of values) if (v) m.set(v, (m.get(v) ?? 0) + 1)
    return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  }
  const countries = count(rows.map(countryOf))
  const departments = country ? count(rows.filter((r) => countryOf(r) === country).map(departmentOf)) : []
  const chip = (active: boolean) =>
    `min-h-8 rounded-full border px-2.5 text-[11px] font-semibold transition ${active ? 'border-earth bg-earth text-white' : 'border-line text-ink hover:bg-paper'}`
  const evaluated = rows.filter((r) => r.score !== null).length
  const dimLabel = (id: string) => model.dimensionById.get(id)?.label[lang] ?? id
  const question = purpose ? purposeQuestion(model, purpose, lang) : null
  const rankingLabel = t(mode === 'purpose' ? 'ranking.byPurpose' : 'ranking.bySimilarity')

  return (
    <div className="px-5 pb-8 pt-3 sm:px-7">
      <BackButton onClick={onBack}>{t('nav.changePurpose')}</BackButton>

      {purpose && (
        <div className="mt-2 flex items-start gap-3">
          <KindIcon kind={purpose.kind} />
          <div className="min-w-0">
            <p className="sr-only">{t(`kind.${purpose.kind}`)}</p>
            <h1 className="font-serif text-xl font-semibold leading-tight">{purposeLabel(model, purpose, lang)}</h1>
          </div>
        </div>
      )}

      <div className="mt-3">
        <TargetCard model={model} target={target} question={question} weights={activeWeights(model.file, mode === 'purpose' ? purpose : null)} />
      </div>

      <h2 className="mt-4 font-serif text-xl font-semibold leading-tight">{t('ranking.title')}</h2>
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="min-w-0 space-y-0.5 text-[11px] leading-snug text-muted">
          <p>{rankingLabel}</p>
          <p>{t('ranking.count', { n: evaluated, total: rows.length })}</p>
        </div>
        {rows.length >= 2 && (
          <button
            type="button"
            onClick={onCompare}
            className="min-h-9 shrink-0 rounded-md border border-line px-2.5 text-xs font-semibold text-earth transition hover:bg-earth-soft"
          >
            {t('compare.title')}
          </button>
        )}
      </div>

      <ScoreMethod model={model} purpose={mode === 'purpose' ? purpose : null} />

      <label htmlFor="ranking-search" className="mt-2 block text-[11px] font-medium text-muted">
        {t('ranking.search')}
      </label>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
        <input
          id="ranking-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('ranking.searchHint')}
          className="min-h-10 min-w-0 flex-1 rounded-md border border-line px-2.5 text-sm text-ink placeholder:text-faint focus:border-earth focus:outline-none"
        />
        {onVoice && (
          <VoiceControl
            model={model}
            onCommand={(cmd) => {
              if (cmd.kind === 'search') {
                setQuery(cmd.query)
                return true
              }
              return onVoice(cmd)
            }}
          />
        )}
      </div>
      {countries.length > 1 && (
        <div className="mt-2 gm-scroll-row -mx-5 flex gap-1.5 overflow-x-auto px-5 pb-0.5 [&>*]:shrink-0 [&>*]:whitespace-nowrap sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" aria-label={t('ranking.byCountry')}>
          <button type="button" aria-pressed={!country} onClick={() => { setCountry(null); setDepartment(null) }} className={chip(!country)}>
            {t('ranking.allPlaces', { n: rows.length })}
          </button>
          {countries.map(([name, n]) => (
            <button key={name} type="button" aria-pressed={country === name} onClick={() => { setCountry(country === name ? null : name); setDepartment(null) }} className={chip(country === name)}>
              {name} ({n})
            </button>
          ))}
        </div>
      )}
      {departments.length > 1 && (
        <div className="mt-1.5 gm-scroll-row -mx-5 flex gap-1.5 overflow-x-auto px-5 pb-0.5 [&>*]:shrink-0 [&>*]:whitespace-nowrap sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" aria-label={t('ranking.byDepartment')}>
          {departments.map(([name, n]) => (
            <button key={name} type="button" aria-pressed={department === name} onClick={() => setDepartment(department === name ? null : name)} className={chip(department === name)}>
              {name} ({n})
            </button>
          ))}
        </div>
      )}
      {shown.length === 0 && <p className="mt-2 text-sm text-muted">{t('ranking.searchNone', { q: query.trim() })}</p>}

      <ol className="mt-2 divide-y divide-line border-y border-line">
        {shown.map((r) => {
          const selected = r.site.id === selectedId
          const highlights = [
            { id: r.top[0], label: 'ranking.highest' },
            { id: r.low, label: 'ranking.lowest' },
          ] as const
          return (
            <li key={r.site.id}>
              <button
                type="button"
                onClick={() => onSelect(r.site.id)}
                aria-current={selected ? 'true' : undefined}
                className={`grid w-full grid-cols-[1rem_1.25rem_minmax(0,1fr)_auto] items-start gap-1.5 rounded-md py-3 text-left transition ${
                  selected ? 'bg-rust-soft/60' : 'hover:bg-paper'
                }`}
              >
                <span className="pt-0.5 text-center font-mono text-xs tabular-nums text-muted">{r.rank ?? '–'}</span>
                <SiteGlyph {...siteGlyphProps(r.site, r.score)} size={20} />
                <span className="min-w-0">
                  <span className="block wrap-anywhere text-[14px] font-semibold leading-snug text-ink">{r.site.name}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
                    {r.site.type && <span>{r.site.type[lang]}</span>}
                    {r.site.type && (r.site.reference || r.site.known || r.site.control || r.score === null) && (
                      <span className="text-faint" aria-hidden="true">·</span>
                    )}
                    <SiteBadges site={r.site} evaluated={r.score !== null} />
                  </span>
                  <MatchSnippet hit={hits.get(r.site.id)} className="mt-1" />
                  {r.rank !== null && highlights.map(({ id, label }) => {
                    if (!id) return null
                    const score = r.dimensions[id]
                    if (score === null || score === undefined) return null
                    return (
                      <span key={label} className="mt-1.5 block text-[11px] leading-snug text-muted">
                        <span className="block font-semibold">{t(label)}</span>
                        {dimLabel(id)} <span className="whitespace-nowrap font-bold tabular-nums text-ink">{formatPercent(score, lang)}</span>
                      </span>
                    )
                  })}
                </span>
                <span className="w-[5.25rem] text-right">
                  {r.similarity !== null ? (
                    <>
                      <span className="block text-xl font-bold leading-none tracking-tight tabular-nums text-rust">
                        <span className="sr-only">{t('detail.similarity')} </span>{formatPercent(r.similarity, lang)}
                      </span>
                      <ScoreBar score={r.similarity} className="mt-1.5 h-1.5" />
                    </>
                  ) : (
                    <span className="font-mono text-sm text-faint">–</span>
                  )}
                  {mode === 'purpose' && (
                    <>
                      {r.similarity !== null && <span aria-hidden="true" className="mt-1 block text-[10px] leading-tight text-muted">{t('detail.similarity')}</span>}
                      <span className="mt-2 block text-[10px] leading-tight text-muted">
                        {t('ranking.purposeOrder')}
                        <span className="mt-0.5 block text-xs font-bold tabular-nums text-ink">
                          {r.score === null ? t('badge.notEvaluated') : formatPercent(r.score, lang)}
                        </span>
                      </span>
                    </>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <DiscoveriesSection model={model} target={target} purpose={mode === 'purpose' ? purpose : null} onSelect={onSelect} onPin={onPin} />
    </div>
  )
}
