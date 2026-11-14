import { LANGS, useI18n } from '../i18n'
import type { Lang } from '../i18n'
import { Logo } from './ui'

export function Header({ onHome, onLang }: { onHome: () => void; onLang: (lang: Lang) => void }) {
  const { t, lang } = useI18n()
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-4 sm:px-6">
      <button type="button" onClick={onHome} className="flex items-center gap-3 rounded-md text-left" aria-label={t('home.label')}>
        <Logo />
        <span>
          <span className="block font-serif text-lg font-semibold leading-tight tracking-tight">Galaxy Match</span>
          <span className="hidden text-xs text-muted sm:block">{t('app.tagline')}</span>
        </span>
      </button>
      <div role="group" aria-label={t('lang.label')} className="flex rounded-lg border border-line bg-paper p-0.5">
        {LANGS.map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={l === lang}
            onClick={() => onLang(l)}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition ${
              l === lang ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </header>
  )
}

export function DemoBanner() {
  const { t } = useI18n()
  return (
    <div role="status" className="flex shrink-0 items-center gap-2 border-b border-caution/20 bg-caution-soft px-4 py-1.5 text-xs text-caution sm:px-6">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
        <path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>
        <strong className="font-semibold">{t('demo.title')}.</strong> {t('demo.body')}
      </span>
    </div>
  )
}
