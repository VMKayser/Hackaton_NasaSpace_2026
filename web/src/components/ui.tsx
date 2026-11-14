import type { ReactNode } from 'react'
import type { Body, Site } from '../data/schema'
import { useI18n } from '../i18n'
import { INK, NOT_EVALUATED, scoreColor } from '../map/colors'
import { BODIES } from '../map/bodies'

/** Misma forma que en el mapa: disco, anillo (conocido), punto (referencia), aro (control), aro gris (no evaluado). */
export function SiteGlyph({
  score,
  known,
  reference,
  control,
  size = 22,
}: {
  score: number | null
  known: boolean
  reference: boolean
  control: boolean
  size?: number
}) {
  const evaluated = score !== null
  const color = scoreColor(score)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      {known && (
        <>
          <circle cx="12" cy="12" r="10" fill="none" stroke="#fff" strokeWidth="3.5" />
          <circle cx="12" cy="12" r="10" fill="none" stroke={INK} strokeWidth="1.4" />
        </>
      )}
      {!evaluated ? (
        <circle cx="12" cy="12" r="4.5" fill="none" stroke={NOT_EVALUATED} strokeWidth="2.2" strokeDasharray="2.4 1.6" />
      ) : control ? (
        <circle cx="12" cy="12" r="5.6" fill="none" stroke={color} strokeWidth="3" />
      ) : (
        <circle cx="12" cy="12" r="6.4" fill={color} stroke={INK} strokeOpacity="0.55" strokeWidth="1.2" />
      )}
      {reference && <circle cx="12" cy="12" r="2.3" fill="#fff" stroke={INK} strokeWidth="0.9" />}
    </svg>
  )
}

export function ScoreBar({ score, className = '' }: { score: number | null; className?: string }) {
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-line ${className}`} aria-hidden="true">
      {score !== null && (
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${Math.max(3, score * 100)}%`, background: scoreColor(score) }}
        />
      )}
    </div>
  )
}

export function BodyChip({ body }: { body: Body }) {
  const { t } = useI18n()
  const info = BODIES[body]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: info.soft, color: info.color }}
    >
      <span className="size-2 rounded-full" style={{ background: info.color }} />
      {t(`body.${body}`)}
    </span>
  )
}

export function SiteBadges({ site, evaluated }: { site: Site; evaluated: boolean }) {
  const { t } = useI18n()
  const items: string[] = []
  if (site.reference) items.push(t('badge.reference'))
  else if (site.known) items.push(t('badge.known'))
  if (site.control) items.push(t('badge.control'))
  if (!evaluated) items.push(t('badge.notEvaluated'))
  if (!items.length) return null
  return (
    <span className="inline-flex flex-wrap gap-1">
      {items.map((label) => (
        <span
          key={label}
          className="rounded border border-line bg-paper px-1.5 py-px text-[11px] font-medium uppercase tracking-wide text-muted"
        >
          {label}
        </span>
      ))}
    </span>
  )
}

export function Pending() {
  const { t } = useI18n()
  return <span className="italic text-faint">{t('text.pending')}</span>
}

export function BackButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-sm font-medium text-muted transition hover:text-ink"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </button>
  )
}

export function KindIcon({ kind }: { kind: 'phenomenon' | 'task' }) {
  return (
    <span
      className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
        kind === 'phenomenon' ? 'bg-earth-soft text-earth' : 'bg-rust-soft text-rust'
      }`}
      aria-hidden="true"
    >
      {kind === 'phenomenon' ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 3h6M10 3v6.5L5.2 18a2 2 0 0 0 1.8 3h10a2 2 0 0 0 1.8-3L14 9.5V3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.5 15h9" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="8" width="16" height="8" rx="2" />
          <circle cx="7.5" cy="18.5" r="2" />
          <circle cx="16.5" cy="18.5" r="2" />
          <path d="M12 8V4.5M9.5 4.5h5" strokeLinecap="round" />
        </svg>
      )}
    </span>
  )
}

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="12" cy="16" r="9" fill="#1f5b8a" />
      <circle cx="20" cy="16" r="9" fill="#b8461b" fillOpacity="0.9" />
      <path d="M16 8.2a9 9 0 0 1 0 15.6a9 9 0 0 1 0-15.6z" fill="#f5f2ec" />
    </svg>
  )
}
