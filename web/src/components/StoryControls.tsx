import type { Text } from '../data/schema'
import { useI18n } from '../i18n'
import { Pending } from './ui'

export function StoryControls({ step, total, caption, onStep }: {
  step: number; total: number; caption: Text; onStep: (step: number | null) => void
}) {
  const { t, lang } = useI18n()
  const last = step === total - 1
  const buttonClass = 'rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold hover:border-ink/40 disabled:opacity-40'
  return (
    <section aria-label={t('story.start')} className="sticky top-0 z-10 border-b border-line bg-earth-soft px-5 py-3 sm:px-7">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-earth">{t('story.progress', { current: step + 1, total })}</p>
        <button className="rounded px-1 py-1 text-xs text-muted underline underline-offset-2" onClick={() => onStep(null)} type="button">
          {t('story.exit')}
        </button>
      </div>
      <p aria-live="polite" className="mt-1 text-sm leading-relaxed">{caption[lang].trim() || <Pending />}</p>
      <div className="mt-2 flex gap-2">
        <button type="button" className={buttonClass} disabled={step === 0} onClick={() => onStep(step - 1)}>{t('story.previous')}</button>
        <button type="button" className={buttonClass} onClick={() => onStep(last ? null : step + 1)}>{t(last ? 'story.finish' : 'story.next')}</button>
      </div>
    </section>
  )
}
