import type { Source } from '../data/schema'
import { useI18n } from '../i18n'

export function SourceLinks({ sources }: { sources: Source[] }) {
  const { t } = useI18n()
  if (!sources.length) return null
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-0.5">
      {sources.map((s) => (
        <a
          key={`${s.name}-${s.url}`}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="gm-tap text-[11px] leading-snug text-muted underline decoration-line underline-offset-2 transition hover:text-earth hover:decoration-earth"
        >
          {s.name}
          <span className="text-faint"> · {s.agency}</span>
          {s.body && <span className="sr-only"> ({t(`body.${s.body}`)})</span>}
        </a>
      ))}
    </span>
  )
}
