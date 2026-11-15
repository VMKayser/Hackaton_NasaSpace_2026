import { useState } from 'react'
import type { Model } from '../data/model'
import { purposeLabel, purposeQuestion, targetSummary } from '../data/model'
import type { Purpose, Target } from '../data/schema'
import { useI18n } from '../i18n'
import { BodyChip, KindIcon, MatchSnippet, SectionTitle, SiteBadges } from './ui'
import { formatNumber, formatPercent } from '../lib/format'
import { purposeFields, searchFields, siteFields, targetFields } from '../lib/search'
import { VoiceControl } from './VoiceControl'
import type { VoiceHandler } from './VoiceControl'

interface Props {
  model: Model
  onPurpose: (purpose: Purpose) => void
  onTarget: (target: Target) => void
  onVoice?: VoiceHandler
  /** Abre un sitio frente a un objetivo. */
  onSite?: (siteId: string, targetId: string) => void
}

export function PurposePicker({ model, onPurpose, onTarget, onVoice, onSite }: Props) {
  const { t, lang } = useI18n()
  const [query, setQuery] = useState('')
  const [allSites, setAllSites] = useState(false)
  const q = query.trim()
  const bodyName = (body: Target['body'] | undefined) => (body ? t(`body.${body}`) : null)
  const groups = (['phenomenon', 'task'] as const)
    .map((kind) => ({
      kind,
      items: model.purposes.filter(
        (p) => p.kind === kind && (!q || searchFields(q, purposeFields(model, p, lang, bodyName(model.targetById.get(p.targetId)?.body)))),
      ),
    }))
    .filter((g) => g.items.length)
  // Objetivos: por nombre, cuerpo, geología, propósitos, resumen y mediciones de contexto; los más relevantes primero.
  const targets = model.file.targets
    .map((tg) => ({ target: tg, hit: q ? searchFields(q, targetFields(model, tg, lang, t(`body.${tg.body}`))) : null }))
    .filter((x) => !q || x.hit)
    .sort((a, b) => (b.hit?.score ?? 0) - (a.hit?.score ?? 0))
  const bodyCounts = new Map<Target['body'], number>()
  for (const { target: tg } of targets) bodyCounts.set(tg.body, (bodyCounts.get(tg.body) ?? 0) + 1)
  const bodies = [...bodyCounts.entries()].map(([body, n]) => `${formatNumber(n, lang)} ${t(`body.${body}`)}`).join(' · ')
  // Sitios que coinciden con la búsqueda (nombre, lugar, tipo, geología o textos de la ficha), cada uno con el
  // objetivo al que más se parece (puntaje del archivo).
  const siteHits = q
    ? model.file.sites
        .flatMap((s) => {
          const hit = searchFields(q, siteFields(model, s, lang))
          return hit ? [{ site: s, hit, best: [...s.scores].sort((a, b) => b.similarity - a.similarity)[0] ?? null }] : []
        })
        .sort((a, b) => b.hit.score - a.hit.score || (b.best?.similarity ?? 0) - (a.best?.similarity ?? 0))
    : []
  const SITES_SHOWN = 6
  const sites = allSites ? siteHits : siteHits.slice(0, SITES_SHOWN)

  return (
    <div className="px-5 py-6 sm:px-7">
      <h1 className="font-serif text-[1.6rem] font-semibold leading-tight tracking-tight text-ink">
        {groups.length ? t('picker.title') : t('picker.noPurposes')}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t('picker.lead')}</p>
      <label htmlFor="picker-search" className="mt-4 block text-[11px] font-medium text-muted">{t('picker.search')}</label>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
        <input
          id="picker-search"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setAllSites(false)
          }}
          placeholder={t('picker.searchHint')}
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
      {sites.length > 0 && (
        <section className="mt-4">
          <SectionTitle lead={t('search.count', { n: siteHits.length })}>{t('picker.sites')}</SectionTitle>
          <ul className="-mx-2 mt-1">
            {sites.map(({ site, hit, best }) => {
              const tg = best ? model.targetById.get(best.targetId) : undefined
              return (
                <li key={site.id}>
                  <button
                    type="button"
                    disabled={!tg || !onSite}
                    onClick={() => tg && onSite?.(site.id, tg.id)}
                    className="flex w-full flex-col gap-0.5 rounded-lg px-2 py-2 text-left hover:bg-paper disabled:opacity-60"
                  >
                    <span className="text-sm font-semibold text-ink">{site.name}</span>
                    {site.type && <span className="text-xs text-muted">{site.type[lang]}</span>}
                    <span className="flex flex-wrap items-center gap-1"><SiteBadges site={site} evaluated /></span>
                    <MatchSnippet hit={hit} className="mt-0.5" />
                    {tg && best && (
                      <span className="text-xs text-muted">{t('picker.siteBest', { target: tg.name, score: formatPercent(best.similarity, lang) })}</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
          {siteHits.length > SITES_SHOWN && (
            <button type="button" onClick={() => setAllSites(!allSites)} className="mt-1 min-h-9 text-xs font-semibold text-earth underline underline-offset-2">
              {allSites ? t('search.less') : t('search.more', { n: siteHits.length })}
            </button>
          )}
        </section>
      )}
      {q && !siteHits.length && !groups.length && !targets.length && <p className="mt-3 text-sm text-muted">{t('ranking.searchNone', { q: query.trim() })}</p>}
      <p className="mt-2 font-mono text-[11px] text-faint">
        {t('picker.stats', {
          sites: model.file.sites.length,
          targets: targets.length,
          bodies: bodies || formatNumber(0, lang),
          dims: model.dimensions.length,
        })}
      </p>

      {groups.map((g) => (
        <section key={g.kind} className="mt-6">
          <SectionTitle>{t(`picker.${g.kind}`)}</SectionTitle>
          <ul className="-mx-2 mt-1">
            {g.items.map((p) => {
              const target = model.targetById.get(p.targetId)
              const question = purposeQuestion(model, p, lang)
              return (
                <li key={p.id} className="border-b border-line/70 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => onPurpose(p)}
                    className="group w-full rounded-md px-2 py-3 text-left transition hover:bg-paper"
                  >
                    <span className="flex items-start gap-3">
                      <KindIcon kind={p.kind} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold leading-snug text-ink">{purposeLabel(model, p, lang)}</span>
                        {question && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{question}</span>}
                        {target && (
                          <span className="mt-1.5 flex items-center gap-2 text-xs text-muted">
                            <BodyChip body={target.body} />
                            <span className="truncate">{target.name}</span>
                          </span>
                        )}
                      </span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="mt-2 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-rust"
                        aria-hidden="true"
                      >
                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      <section className="mt-6">
        <SectionTitle>{groups.length ? t('picker.targets') : t('target.label')}</SectionTitle>
        <ul className="-mx-2 mt-1">
          {targets.map(({ target: tg, hit }) => {
            const summary = targetSummary(model, tg, lang)
            const quoted = !!(hit?.field && hit.snippet)
            return (
              <li key={tg.id}>
                <button
                  type="button"
                  onClick={() => onTarget(tg)}
                  className="w-full rounded-md px-2 py-2 text-left transition hover:bg-paper"
                >
                  <span className="flex items-center gap-2">
                    <BodyChip body={tg.body} />
                    <span className="text-sm font-medium text-ink">{tg.name}</span>
                  </span>
                  {quoted ? <MatchSnippet hit={hit} className="mt-0.5" /> : summary && <span className="mt-0.5 line-clamp-1 block text-xs leading-snug text-muted">{summary}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
