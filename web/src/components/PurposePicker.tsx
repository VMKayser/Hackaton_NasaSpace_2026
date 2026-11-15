import type { Model } from '../data/model'
import { purposeLabel, purposeQuestion, targetSummary } from '../data/model'
import type { Purpose, Target } from '../data/schema'
import { useI18n } from '../i18n'
import { BodyChip, KindIcon, SectionTitle } from './ui'

interface Props {
  model: Model
  onPurpose: (purpose: Purpose) => void
  onTarget: (target: Target) => void
}

export function PurposePicker({ model, onPurpose, onTarget }: Props) {
  const { t, lang } = useI18n()
  const groups = (['phenomenon', 'task'] as const)
    .map((kind) => ({ kind, items: model.purposes.filter((p) => p.kind === kind) }))
    .filter((g) => g.items.length)
  const targets = model.file.targets

  return (
    <div className="px-5 py-6 sm:px-7">
      <h1 className="font-serif text-[1.6rem] font-semibold leading-tight tracking-tight text-ink">
        {groups.length ? t('picker.title') : t('picker.noPurposes')}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t('picker.lead')}</p>
      <p className="mt-2 font-mono text-[11px] text-faint">
        {t('picker.stats', {
          sites: model.file.sites.length,
          targets: targets.length,
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
          {targets.map((tg) => {
            const summary = targetSummary(model, tg, lang)
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
                  {summary && <span className="mt-0.5 line-clamp-1 block text-xs leading-snug text-muted">{summary}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
