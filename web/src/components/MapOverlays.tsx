import { useState } from 'react'
import { useI18n } from '../i18n'
import type { View } from '../lib/state'
import { SCORE_GRADIENT } from '../map/colors'
import { SiteGlyph } from './ui'

export function ViewToggle({ view, onView }: { view: View; onView: (v: View) => void }) {
  const { t } = useI18n()
  const options: { id: View; label: string }[] = [
    { id: 'globe', label: t('map.globe') },
    { id: '2d', label: t('map.relief') },
  ]
  return (
    <div role="group" aria-label={t('map.view')} className="flex rounded-lg bg-space/80 p-1 shadow-lg ring-1 ring-white/10 backdrop-blur">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={view === o.id}
          onClick={() => onView(o.id)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            view === o.id ? 'bg-white text-ink' : 'text-white/80 hover:text-white'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Legend() {
  const { t } = useI18n()
  const [open, setOpen] = useState(() => window.innerWidth >= 1024)
  const items = [
    { label: t('badge.candidate'), glyph: { score: 0.8, known: false, reference: false, control: false } },
    { label: t('badge.known'), glyph: { score: 0.8, known: true, reference: false, control: false } },
    { label: t('badge.reference'), glyph: { score: 0.8, known: true, reference: true, control: false } },
    { label: t('badge.control'), glyph: { score: 0.2, known: false, reference: false, control: true } },
    { label: t('badge.notEvaluated'), glyph: { score: null, known: false, reference: false, control: false } },
  ]
  return (
    <div className={`${open ? 'w-44 max-w-[43vw] sm:w-52' : 'w-28'} rounded-xl bg-surface/95 text-xs shadow-lg backdrop-blur`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-2 font-semibold text-ink"
      >
        {t('legend.title')}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition ${open ? 'rotate-180' : ''}`} aria-hidden="true">
          <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-line px-3 pb-3 pt-2">
          <p className="text-muted">{t('legend.score')}</p>
          <div className="mt-1.5 h-2 rounded-full" style={{ background: SCORE_GRADIENT }} />
          <div className="mt-1 flex justify-between font-mono text-[10px] text-faint">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
          <ul className="mt-2.5 space-y-1">
            {items.map((i) => (
              <li key={i.label} className="flex items-center gap-2 text-ink">
                <SiteGlyph {...i.glyph} size={20} />
                {i.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
