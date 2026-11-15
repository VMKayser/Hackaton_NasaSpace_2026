import { LANGS, useI18n } from '../i18n'
import type { Lang } from '../i18n'
import { Logo } from './ui'

export function Header({ onHome, onLang, onStory }: { onHome: () => void; onLang: (lang: Lang) => void; onStory?: () => void }) {
  const { t, lang } = useI18n()
  return (
    <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-line bg-surface px-3 py-1 sm:gap-x-4 sm:px-6">
      <button type="button" onClick={onHome} className="flex min-h-11 items-center gap-1.5 rounded-md text-left sm:gap-3" aria-label={t('home.label')}>
        <Logo size={26} />
        <span>
          <span className="block whitespace-nowrap font-serif text-base font-semibold leading-tight tracking-tight sm:text-lg">Galaxy Match</span>
          <span className="hidden text-xs text-muted sm:block">{t('app.tagline')}</span>
        </span>
      </button>
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        {onStory && (
          <button type="button" onClick={onStory} className="min-h-10 max-w-[4.75rem] rounded-lg bg-earth-soft px-2 py-1 text-xs font-semibold leading-tight text-earth hover:bg-earth/15 sm:max-w-none sm:px-3">
            {t('story.start')}
          </button>
        )}
        <div role="group" aria-label={t('lang.label')} className="flex rounded-lg border border-line bg-paper p-0.5">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={l === lang}
              onClick={() => onLang(l)}
              className={`min-h-9 min-w-8 rounded-md px-1.5 text-xs font-semibold uppercase tracking-wide transition sm:min-w-10 ${
                l === lang ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}

export function DemoBanner() {
  const { t } = useI18n()
  return (
    <div role="status" className="flex shrink-0 items-center gap-2 border-b border-caution/20 bg-caution-soft px-3 py-1.5 text-xs text-caution sm:px-6">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0" aria-hidden="true">
        <path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>
        <strong className="font-semibold">{t('demo.title')}.</strong> {t('demo.body')}
      </span>
    </div>
  )
}
