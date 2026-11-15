import { useEffect, useMemo, useRef, useState } from 'react'
import type { Model } from '../data/model'
import { purposeLabel } from '../data/model'
import type { Purpose, Site, Target } from '../data/schema'
import { useI18n } from '../i18n'
import { formatPercent, formatValue } from '../lib/format'
import { SourceLinks } from './SourceLinks'
import { BodyChip } from './ui'

// Cómo adaptar un ensayo en un sitio de la Tierra para un objetivo: qué ya se parece y qué hay que
// compensar (puntajes del archivo) y recomendaciones con fuente (texts.json → adaptations).

const ALIKE = 0.66
const PARTLY = 0.33

/** Texto sin mayúsculas ni tildes, para buscar. */
const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

interface Props {
  model: Model
  site: Site
  target: Target
  /** Propósito activo; si es de otro cuerpo, se muestran todas las recomendaciones. */
  purpose: Purpose | null
  onClose: () => void
}

export function AdaptationDialog({ model, site, target, purpose, onClose }: Props) {
  const { t, lang } = useI18n()
  const closeRef = useRef<HTMLButtonElement>(null)
  const bodyName = t(`body.${target.body}`)
  const purposes = useMemo(
    () => model.purposes.filter((p) => model.targetById.get(p.targetId)?.body === target.body),
    [model, target.body],
  )
  const [purposeId, setPurposeId] = useState<string | null>(purpose && purposes.some((p) => p.id === purpose.id) ? purpose.id : null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    // En fase de captura, para que Escape cierre solo esta ventana y no también la ficha de abajo.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      onClose()
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      previous?.focus()
    }
  }, [onClose])

  // Qué ya se parece y qué hay que compensar: puntajes por dimensión del archivo para esta pareja.
  const scores = site.scores.find((s) => s.targetId === target.id)?.dimensions ?? {}
  const groups = [
    { key: 'alike', title: t('adaptation.alike'), test: (v: number) => v >= ALIKE, tone: 'border-ok/50 bg-ok-soft/50' },
    { key: 'partly', title: t('adaptation.partly'), test: (v: number) => v >= PARTLY && v < ALIKE, tone: 'border-line bg-paper' },
    { key: 'compensate', title: t('adaptation.compensate'), test: (v: number) => v < PARTLY, tone: 'border-caution/60 bg-caution-soft/50' },
  ].map((g) => ({
    ...g,
    dims: model.dimensions.filter((d) => {
      const v = scores[d.id]
      return typeof v === 'number' && g.test(v)
    }),
  }))

  // Recomendaciones del cuerpo y del propósito elegido, filtradas por la búsqueda.
  const cards = (model.texts.adaptations ?? [])
    .filter((a) => {
      if (a.purposeId) return purposeId ? a.purposeId === purposeId : purposes.some((p) => p.id === a.purposeId)
      return a.body === target.body
    })
    .filter((a) => !query.trim() || fold(`${a.title[lang]} ${a.text[lang]}`).includes(fold(query.trim())))

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-space/60 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="adaptation-title"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-xs text-muted"><BodyChip body={target.body} /> {target.name}</p>
            <h2 id="adaptation-title" className="mt-1 font-serif text-xl font-semibold leading-tight">
              {t('adaptation.title', { site: site.name, target: target.name })}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">{t('adaptation.lead')}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="min-h-10 shrink-0 rounded-md border border-line px-3 text-xs font-semibold text-ink transition hover:border-ink/30">
            {t('adaptation.close')}
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <section aria-labelledby="adaptation-compare">
            <h3 id="adaptation-compare" className="text-sm font-semibold text-ink">{t('adaptation.compare', { target: target.name })}</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {groups.map((g) => (
                <div key={g.key} className={`rounded-lg border-l-2 px-3 py-2.5 ${g.tone}`}>
                  <p className="text-xs font-semibold text-ink">{g.title}</p>
                  {g.dims.length === 0 ? (
                    <p className="mt-1 text-xs italic text-muted">{t('adaptation.none')}</p>
                  ) : (
                    <ul className="mt-1 space-y-1.5">
                      {g.dims.map((d) => (
                        <li key={d.id} className="text-xs leading-snug">
                          <span className="font-medium text-ink">{d.label[lang]}</span>
                          <span className="ml-1 tabular-nums text-muted">{formatPercent(scores[d.id] as number, lang)}</span>
                          <span className="block font-mono text-[11px] text-muted">
                            {formatValue(site.values[d.id], d, lang) ?? '–'} · {formatValue(target.values[d.id], d, lang) ?? '–'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] leading-snug text-muted">{t('adaptation.thresholds')}</p>
          </section>

          <section className="mt-5" aria-labelledby="adaptation-cards">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h3 id="adaptation-cards" className="text-sm font-semibold text-ink">{t('adaptation.cards')}</h3>
              <label className="flex min-w-0 flex-1 basis-56 flex-col gap-1 text-[11px] font-medium text-muted sm:max-w-xs">
                {t('adaptation.search')}
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-10 rounded-md border border-line px-2.5 text-sm text-ink focus:border-earth focus:outline-none"
                />
              </label>
            </div>
            {purposes.length > 0 && (
              <div role="group" aria-label={t('adaptation.purpose')} className="mt-2 flex flex-wrap gap-1.5">
                {[{ id: null, label: t('adaptation.all') }, ...purposes.map((p) => ({ id: p.id as string | null, label: purposeLabel(model, p, lang) }))].map((chip) => (
                  <button
                    key={chip.id ?? 'all'}
                    type="button"
                    aria-pressed={purposeId === chip.id}
                    onClick={() => setPurposeId(chip.id)}
                    className={`min-h-9 rounded-full border px-3 text-xs font-semibold transition ${purposeId === chip.id ? 'border-ink bg-ink text-white' : 'border-line text-ink hover:border-ink/30'}`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}
            {cards.length === 0 ? (
              <p className="mt-3 text-sm text-muted">{t('adaptation.noResults', { q: query.trim() })}</p>
            ) : (
              <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {cards.map((a) => {
                  const p = a.purposeId ? model.purposeById.get(a.purposeId) : undefined
                  return (
                    <li key={a.id} className="flex flex-col rounded-xl border border-line bg-white px-3.5 py-3 shadow-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">
                        {p ? purposeLabel(model, p, lang) : t('adaptation.general', { body: bodyName })}
                      </p>
                      <h4 className="mt-1 text-sm font-semibold leading-snug text-ink">{a.title[lang]}</h4>
                      <p className="mt-1 flex-1 text-[13px] leading-relaxed text-ink">{a.text[lang]}</p>
                      <div className="mt-2 border-t border-line pt-1.5">
                        <p className="text-[11px] font-semibold text-muted">{t('adaptation.sources')}</p>
                        <SourceLinks sources={a.sources} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
