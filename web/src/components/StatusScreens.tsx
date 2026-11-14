import { useI18n } from '../i18n'
import { Logo } from './ui'

export function LoadingScreen() {
  const { t } = useI18n()
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted" role="status">
      <span className="animate-pulse">
        <Logo size={44} />
      </span>
      <p className="text-sm">{t('loading')}</p>
    </div>
  )
}

export function ErrorScreen({ file, problems }: { file: string; problems: string[] }) {
  const { t } = useI18n()
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div role="alert" className="w-full max-w-xl rounded-xl border border-rust/30 bg-surface p-6 shadow-sm">
        <h1 className="font-serif text-xl font-semibold text-rust">{t('error.title')}</h1>
        <p className="mt-3 text-sm text-muted">{t('error.file', { file })}</p>
        <ul className="mt-2 space-y-1 rounded-lg bg-paper p-3 font-mono text-xs text-ink">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
