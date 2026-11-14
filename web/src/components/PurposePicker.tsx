import type { Model } from '../data/model'
import { purposeLabel, purposeQuestion, targetSummary } from '../data/model'
import type { Purpose, Target } from '../data/schema'
import { useI18n } from '../i18n'
import { BodyChip, KindIcon } from './ui'

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
    <div className="px-5 py-7 sm:px-7">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rust">{t('picker.kicker')}</p>
      <h1 className="mt-2 font-serif text-[1.75rem] font-semibold leading-tight tracking-tight text-ink">
        {groups.length ? t('picker.title') : t('picker.noPurposes')}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('picker.lead')}</p>
      <p className="mt-4 font-mono text-xs text-faint">
        {t('picker.stats', {
          sites: model.file.sites.length,
          targets: targets.length,
          dims: model.dimensions.length,
        })}
      </p>

      {groups.map((g) => (
        <section key={g.kind} className="mt-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t(`picker.${g.kind}`)}</h2>
          <ul className="space-y-3">
            {g.items.map((p) => {
              const target = model.targetById.get(p.targetId)
              const question = purposeQuestion(model, p, lang)
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onPurpose(p)}
                    className="group w-full rounded-xl border border-line bg-surface p-4 text-left shadow-[0_1px_0_rgb(0_0_0/0.03)] transition hover:-translate-y-px hover:border-rust/50 hover:shadow-lg hover:shadow-rust/5"
                  >
                    <span className="flex items-start gap-3.5">
                      <KindIcon kind={p.kind} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold leading-snug text-ink">{purposeLabel(model, p, lang)}</span>
                        {question && <span className="mt-1 block text-sm leading-snug text-muted">{question}</span>}
                        {target && (
                          <span className="mt-3 flex items-center gap-2 text-xs text-muted">
                            <BodyChip body={target.body} />
                            <span className="truncate font-medium">{target.name}</span>
                          </span>
                        )}
                      </span>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="mt-2.5 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-rust"
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

      <section className="mt-9">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          {groups.length ? t('picker.targets') : t('target.label')}
        </h2>
        <ul className="grid gap-2">
          {targets.map((tg) => {
            const summary = targetSummary(model, tg, lang)
            return (
              <li key={tg.id}>
                <button
                  type="button"
                  onClick={() => onTarget(tg)}
                  className="w-full rounded-lg border border-line bg-paper/60 px-3.5 py-2.5 text-left transition hover:border-ink/30 hover:bg-surface"
                >
                  <span className="flex items-center gap-2">
                    <BodyChip body={tg.body} />
                    <span className="font-medium text-ink">{tg.name}</span>
                  </span>
                  {summary && <span className="mt-1 line-clamp-2 block text-xs leading-snug text-muted">{summary}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
