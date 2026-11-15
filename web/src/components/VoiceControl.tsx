import { useEffect, useMemo, useRef, useState } from 'react'
import type { Model } from '../data/model'
import { useI18n } from '../i18n'
import { parseVoice } from '../lib/voice'
import type { VoiceCommand } from '../lib/voice'

// Botón de micrófono: reconoce una frase con la Web Speech API del navegador y la convierte en una
// acción. Si el navegador no la tiene (Firefox), el botón no aparece.

interface Recognition {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}
type RecognitionCtor = new () => Recognition

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/** Devuelve false si la app no pudo cumplir el comando (por ejemplo, un sitio sin objetivo elegido). */
export type VoiceHandler = (cmd: VoiceCommand) => boolean

/** Tiempo máximo de escucha de una sesión. */
const MAX_MS = 12000

const list = (s: string) => s.split(',').map((w) => w.trim()).filter(Boolean)

/** El contenedor usa `display: contents`: el botón y la línea de estado se colocan en el flex-wrap del padre. */
export function VoiceControl({ model, onCommand }: { model: Model; onCommand: VoiceHandler }) {
  const { t, lang } = useI18n()
  const Ctor = useMemo(() => recognitionCtor(), [])
  const rec = useRef<Recognition | null>(null)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const session = useRef<{ stopped: boolean; heard: boolean; started: number; error: string | null }>({ stopped: true, heard: false, started: 0, error: null })

  useEffect(
    () => () => {
      session.current.stopped = true
      rec.current?.abort()
    },
    [],
  )

  if (!Ctor) return null

  const vocab = {
    sites: model.file.sites,
    targets: model.file.targets,
    bodies: { mars: t('body.mars'), moon: t('body.moon') },
    home: list(t('voice.homeWords')),
    filler: list(t('voice.fillerWords')),
  }

  const describe = (cmd: VoiceCommand, done: boolean): string => {
    if (!done) return t('voice.needTarget')
    switch (cmd.kind) {
      case 'home':
        return t('voice.didHome')
      case 'target':
        return t('voice.didTarget', { name: model.targetById.get(cmd.id)?.name ?? cmd.id })
      case 'site':
        return t('voice.didSite', { name: model.file.sites.find((s) => s.id === cmd.id)?.name ?? cmd.id })
      case 'body':
        return t('voice.didBody', { body: t(`body.${cmd.body}` as 'body.mars') })
      case 'search':
        return cmd.query ? t('voice.didSearch', { q: cmd.query }) : t('voice.errorNoMatch')
    }
  }

  const toggle = () => {
    if (listening) {
      session.current.stopped = true
      rec.current?.stop()
      return
    }
    // Una sesión escucha hasta oír una frase completa, hasta que el usuario la detiene o hasta MAX_MS.
    // Chrome corta el reconocimiento tras un silencio corto; mientras no haya frase, se reinicia.
    const r = new Ctor()
    r.lang = lang === 'es' ? 'es-419' : 'en-US'
    r.interimResults = true
    r.continuous = true
    session.current = { stopped: false, heard: false, started: Date.now(), error: null }
    const timer = window.setTimeout(() => {
      session.current.stopped = true
      r.stop()
    }, MAX_MS)
    r.onresult = (e) => {
      let text = ''
      let final = false
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript
        final ||= e.results[i].isFinal
      }
      setInterim(text)
      if (final && text.trim() && !session.current.heard) {
        session.current.heard = true
        session.current.stopped = true
        r.stop()
        const cmd = parseVoice(text, vocab)
        const done = onCommand(cmd)
        setError(false)
        setStatus(`${t('voice.heard', { text: text.trim() })} ${describe(cmd, done)}`)
      }
    }
    r.onerror = (e) => {
      // «no-speech» y «aborted» no son fallos: se sigue escuchando o el usuario lo detuvo.
      if (e.error === 'no-speech' || e.error === 'aborted') return
      console.warn('Reconocimiento de voz:', e.error)
      session.current.error = e.error
      session.current.stopped = true
      setError(true)
      setStatus(
        e.error === 'not-allowed' || e.error === 'service-not-allowed'
          ? t('voice.errorPermission')
          : e.error === 'network'
            ? t('voice.errorNetwork')
            : e.error === 'audio-capture'
              ? t('voice.errorMic')
              : t('voice.errorNoMatch'),
      )
    }
    r.onend = () => {
      const s = session.current
      if (!s.stopped && !s.heard && Date.now() - s.started < MAX_MS) {
        try {
          r.start()
          return
        } catch {
          // si no se puede reiniciar, se cierra la sesión
        }
      }
      window.clearTimeout(timer)
      setListening(false)
      setInterim('')
      if (!s.heard && !s.error) setStatus(t('voice.errorNoMatch'))
    }
    rec.current = r
    setStatus(null)
    setError(false)
    setListening(true)
    try {
      r.start()
    } catch {
      window.clearTimeout(timer)
      setListening(false)
      setError(true)
      setStatus(t('voice.errorNoMatch'))
    }
  }

  return (
    <div className="contents">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={listening}
        aria-label={listening ? t('voice.stop') : t('voice.start')}
        title={t('voice.hint')}
        className={`flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition ${
          listening ? 'border-rust bg-rust text-white' : 'border-line text-earth hover:bg-earth-soft'
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8" />
        </svg>
        {listening && <span className="motion-safe:animate-pulse">{t('voice.listening')}</span>}
      </button>
      <p className="sr-only" aria-live="polite">{status ?? ''}</p>
      {(interim || status) && (
        <p className={`basis-full text-[11px] leading-snug ${error ? 'font-semibold text-rust' : 'text-muted'}`} aria-hidden="true">
          {listening && interim ? t('voice.interim', { text: interim }) : status}
        </p>
      )}
    </div>
  )
}
