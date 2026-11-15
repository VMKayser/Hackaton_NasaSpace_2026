import type { ReactNode } from 'react'
import type { Body, Site } from '../data/schema'
import { useI18n } from '../i18n'
import { formatPercent } from '../lib/format'
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
    <div className={`h-1 overflow-hidden rounded-full bg-line/80 ${className}`} aria-hidden="true">
      {score !== null && (
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${score * 100}%`, background: scoreColor(score) }}
        />
      )}
    </div>
  )
}

export function ScoreSummary({ similarity, purposeScore, dark = false }: {
  similarity: number | null
  purposeScore: number | null | undefined
  dark?: boolean
}) {
  const { t, lang } = useI18n()
  const hasPurpose = purposeScore !== undefined
  const totals = [
    { label: 'detail.similarity', score: similarity },
    ...(hasPurpose ? [{ label: 'detail.purposeScore', score: purposeScore } as const] : []),
  ] as const

  return (
    <dl className={`grid gap-3 ${hasPurpose ? 'grid-cols-2' : ''}`}>
      {totals.map(({ label, score }, index) => (
        <div key={label} className={`flex min-w-0 flex-col ${index ? `border-l pl-3 ${dark ? 'border-white/15' : 'border-line'}` : ''}`}>
          <dt className={`flex-1 text-xs font-semibold ${dark ? 'text-white/80' : 'text-muted'}`}>{t(label)}</dt>
          <dd className="mt-1">
            {score === null ? <span className={`text-xs ${dark ? 'text-white/80' : 'text-muted'}`}>{t('badge.notEvaluated')}</span> : (
              <>
                <span className={`block font-bold leading-none tracking-tight tabular-nums ${dark
                  ? 'text-[1.6rem] text-white'
                  : `text-[2rem] sm:text-4xl ${index ? 'text-ink' : 'text-rust'}`}`}>
                  {formatPercent(score, lang)}
                </span>
                <ScoreBar score={score} className={dark ? 'mt-1 !bg-white/10' : 'mt-2 h-1.5'} />
              </>
            )}
          </dd>
        </div>
      ))}
    </dl>
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
  // Texto simple: la forma del glifo ya distingue cada tipo de sitio.
  return (
    <span className="inline-flex flex-wrap gap-x-1.5 text-[11px] font-medium text-ink/70">
      {items.map((label, i) => (
        <span key={label}>
          {i > 0 && <span className="mr-1.5 text-faint" aria-hidden="true">·</span>}
          {label}
        </span>
      ))}
    </span>
  )
}

/** Título de sección del panel: pequeño y sin caja. */
export function SectionTitle({ children, lead }: { children: ReactNode; lead?: ReactNode }) {
  return (
    <div>
      <h2 className="text-[13px] font-semibold text-ink">{children}</h2>
      {lead && <p className="mt-0.5 text-xs leading-snug text-muted">{lead}</p>}
    </div>
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
      className="inline-flex min-h-10 items-center gap-1.5 rounded-md px-1 py-1 text-sm font-medium text-muted transition hover:text-ink"
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
      className={`flex size-8 shrink-0 items-center justify-center rounded-md ${
        kind === 'phenomenon' ? 'bg-earth-soft text-earth' : 'bg-rust-soft text-rust'
      }`}
      aria-hidden="true"
    >
      {kind === 'phenomenon' ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 3h6M10 3v6.5L5.2 18a2 2 0 0 0 1.8 3h10a2 2 0 0 0 1.8-3L14 9.5V3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.5 15h9" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
