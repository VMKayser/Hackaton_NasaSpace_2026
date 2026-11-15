import { useEffect, useRef, useState } from 'react'
import type { Site, Target } from '../data/schema'
import { useI18n } from '../i18n'
import { parseNaturalLanguageQuery } from '../lib/nlpParser'
import type { DimensionMeta, ParsedVoiceCommand } from '../lib/nlpParser'
import { BodyChip } from './ui'

interface Props {
  targets: Target[]
  dimensions: DimensionMeta[]
  sites: Site[]
  onExecute: (cmd: ParsedVoiceCommand) => void
  onClose: () => void
}

// Window typing for Web Speech API
interface IWindowSpeech extends Window {
  SpeechRecognition?: any
  webkitSpeechRecognition?: any
  AudioContext?: typeof AudioContext
  webkitAudioContext?: typeof AudioContext
}

export function VoiceAssistantModal({ targets, dimensions, sites, onExecute, onClose }: Props) {
  const { t, lang } = useI18n()
  const isEs = lang === 'es'

  const [isListening, setIsListening] = useState(false)
  const [inputText, setInputText] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [parsedCommand, setParsedCommand] = useState<ParsedVoiceCommand | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [audioLevel, setAudioLevel] = useState(0) // 0..100
  const [isBrave, setIsBrave] = useState(() => {
    if (typeof window === 'undefined') return false
    return Boolean(navigator.userAgent?.includes('Brave'))
  })
  const [copiedBraveLink, setCopiedBraveLink] = useState(false)

  const [speechSupported, setSpeechSupported] = useState(() => {
    if (typeof window === 'undefined') return false
    const win = window as unknown as IWindowSpeech
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition)
  })

  const recognitionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number | null>(null)

  // Detect Brave browser via its async API if userAgent didn't reveal it
  useEffect(() => {
    const nav = navigator as any
    if (nav.brave && typeof nav.brave.isBrave === 'function') {
      nav.brave.isBrave().then((val: boolean) => {
        if (val) setIsBrave(true)
      }).catch(() => {})
    }
  }, [])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const stopAudioMeter = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    setAudioLevel(0)
  }

  const startAudioMeter = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      const win = window as unknown as IWindowSpeech
      const AudioCtx = win.AudioContext || win.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      audioContextRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 128
      analyser.smoothingTimeConstant = 0.4
      source.connect(analyser)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]
        }
        const avg = sum / dataArray.length
        const level = Math.min(100, Math.round((avg / 64) * 100))
        setAudioLevel(level)
        animFrameRef.current = requestAnimationFrame(checkVolume)
      }

      checkVolume()
    } catch (err) {
      console.warn('Audio meter initialization skipped:', err)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {}
      }
      stopAudioMeter()
    }
  }, [])

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = isEs ? 'es-ES' : 'en-US'
      utterance.rate = 1.05
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleProcessQuery = (queryText: string) => {
    const trimmed = queryText.trim()
    if (!trimmed) return

    const parsed = parseNaturalLanguageQuery(trimmed, targets, dimensions, sites, lang)
    setParsedCommand(parsed)
    setErrorMessage(null)
    speakText(parsed.explanation)
  }

  const startListening = () => {
    setErrorMessage(null)
    const win = window as unknown as IWindowSpeech
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!SpeechRec) {
      setSpeechSupported(false)
      return
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {}
      }

      const rec = new SpeechRec()
      // Use standard Latin American Spanish ('es-419') or 'es-ES' which Google Speech API natively accepts
      rec.lang = isEs ? 'es-419' : 'en-US'
      rec.continuous = true
      rec.interimResults = true

      rec.onstart = () => {
        setIsListening(true)
        setInterimTranscript('')
        setParsedCommand(null)
        setErrorMessage(null)
        startAudioMeter()
      }

      rec.onresult = (event: any) => {
        let currentInterim = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i]
          if (item.isFinal) {
            finalTranscript += item[0].transcript
          } else {
            currentInterim += item[0].transcript
          }
        }

        const fullCurrent = (finalTranscript || currentInterim).trim()
        setInterimTranscript(currentInterim)
        if (fullCurrent) {
          setInputText(fullCurrent)
        }

        if (finalTranscript) {
          handleProcessQuery(finalTranscript)
        }
      }

      rec.onerror = (e: any) => {
        console.warn('Speech recognition error:', e.error, e)
        if (e.error === 'no-speech') {
          // Do not cancel listening immediately if it is just a brief pause
          return
        }
        setIsListening(false)
        stopAudioMeter()

        if (e.error === 'network') {
          setErrorMessage(t('voice.errorNetwork'))
        } else if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setErrorMessage(t('voice.errorNotAllowed'))
        } else if (e.error === 'audio-capture') {
          setErrorMessage(t('voice.errorAudioCapture'))
        } else if (e.error !== 'aborted') {
          setErrorMessage(t('voice.errorNoSpeech'))
        }
      }

      rec.onend = () => {
        setIsListening(false)
        stopAudioMeter()
      }

      recognitionRef.current = rec
      rec.start()
    } catch (err) {
      console.warn('Failed to start speech recognition:', err)
      setIsListening(false)
      stopAudioMeter()
      setErrorMessage(t('voice.errorNetwork'))
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {}
    }
    setIsListening(false)
    stopAudioMeter()
    if (inputText.trim() && !parsedCommand) {
      handleProcessQuery(inputText.trim())
    }
  }

  const handleApply = () => {
    if (parsedCommand) {
      onExecute(parsedCommand)
      onClose()
    }
  }

  const handleExampleClick = (query: string) => {
    setInputText(query)
    setErrorMessage(null)
    handleProcessQuery(query)
  }

  const copyBraveConfig = () => {
    navigator.clipboard.writeText('brave://settings/system').then(() => {
      setCopiedBraveLink(true)
      setTimeout(() => setCopiedBraveLink(false), 2500)
    }).catch(() => {})
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-white/20 bg-[#0c1424] text-white shadow-2xl">
        {/* Header */}
        <header className="flex shrink-0 items-start justify-between border-b border-white/15 bg-space/90 px-5 py-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs">
                🎙️
              </span>
              <h2 id="voice-modal-title" className="font-serif text-lg font-bold text-white">
                {t('voice.modalTitle')}
              </h2>
            </div>
            <p className="mt-1 text-xs text-white/70">
              {t('voice.modalSubtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isEs ? 'Cerrar' : 'Close'}
            className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Brave Browser Notice Card */}
          {isBrave && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              <div className="flex items-start gap-2">
                <span className="text-base leading-none">🦁</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-300">
                    {t('voice.braveNoticeTitle')}
                  </h4>
                  <p className="mt-1 text-amber-200/90 leading-relaxed">
                    {t('voice.braveNoticeText')}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copyBraveConfig}
                      className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-1 text-[11px] font-medium text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      <span>{copiedBraveLink ? t('voice.braveCopied') : t('voice.braveCopyLink')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Microphone Main Control Button with Real-time Equalizer */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] p-5 text-center">
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`relative flex h-20 w-20 items-center justify-center rounded-full transition shadow-lg ${
                isListening
                  ? 'bg-red-500 text-white shadow-red-500/50 animate-pulse ring-4 ring-red-400/30'
                  : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-cyan-600/30 hover:scale-105'
              }`}
              title={isListening ? t('voice.stopListening') : t('voice.clickToSpeak')}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              {isListening && (
                <span className="absolute -inset-2 rounded-full border-2 border-red-400 animate-ping opacity-60" />
              )}
            </button>

            {/* Live Audio Level Equalizer Bars */}
            {isListening && (
              <div className="mt-3 flex items-center justify-center gap-1.5 h-6">
                {[0.4, 0.7, 1.0, 0.7, 0.4].map((factor, idx) => {
                  const heightPx = Math.max(4, Math.round((audioLevel * factor * 22) / 100))
                  return (
                    <span
                      key={idx}
                      style={{ height: `${heightPx}px` }}
                      className="w-1.5 rounded-full bg-emerald-400 transition-all duration-75"
                    />
                  )
                })}
              </div>
            )}

            <p className="mt-2 text-xs font-medium text-white/90">
              {isListening ? (
                <span className="flex items-center gap-1.5 text-red-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  {audioLevel > 10 ? t('voice.micActive') : t('voice.listening')}
                </span>
              ) : (
                <span className="text-white/70">{t('voice.clickToSpeak')}</span>
              )}
            </p>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mt-3 w-full max-w-lg rounded-lg border border-red-500/40 bg-red-950/60 p-3 text-left text-xs text-red-200">
                <div className="flex items-start gap-2">
                  <span className="text-red-400 text-sm">⚠️</span>
                  <div className="flex-1 leading-relaxed">
                    <p className="font-semibold text-red-300">
                      {isEs ? 'Detalle del micrófono:' : 'Microphone status:'}
                    </p>
                    <p className="mt-0.5 text-red-200/90">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {!speechSupported && (
              <p className="mt-2 text-xs text-amber-300/90 bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20">
                {t('voice.notSupported')}
              </p>
            )}
          </div>

          {/* Text input with submit button */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleProcessQuery(inputText)
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value)
                setErrorMessage(null)
              }}
              placeholder={t('voice.placeholder')}
              className="flex-1 rounded-lg border border-white/20 bg-space/80 px-3.5 py-2 text-xs text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="inline-flex min-h-9 items-center justify-center rounded-lg bg-cyan-600 px-4 text-xs font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-40"
            >
              {t('voice.process')}
            </button>
          </form>

          {/* Live Transcript / Interim Display */}
          {interimTranscript && isListening && (
            <p className="text-xs italic text-cyan-300 bg-cyan-500/10 px-3 py-2 rounded-md border border-cyan-500/20">
              «{interimTranscript}»
            </p>
          )}

          {/* Interpreted Result Card */}
          {parsedCommand && (
            <div className="rounded-xl border border-cyan-400/40 bg-cyan-950/40 p-4 transition">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                  {t('voice.understood')}
                </span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {parsedCommand.targetName && (
                  <div className="rounded-md bg-white/[0.04] p-2 border border-white/5">
                    <span className="text-white/50 block text-[10px] uppercase">{t('voice.target')}</span>
                    <div className="mt-0.5 flex items-center gap-1.5 font-semibold text-white">
                      <span>{parsedCommand.targetName}</span>
                      {parsedCommand.body && <BodyChip body={parsedCommand.body} />}
                    </div>
                  </div>
                )}

                {parsedCommand.country && (
                  <div className="rounded-md bg-white/[0.04] p-2 border border-white/5">
                    <span className="text-white/50 block text-[10px] uppercase">{t('voice.country')}</span>
                    <span className="mt-0.5 block font-semibold text-emerald-300">
                      🌍 {parsedCommand.country}
                    </span>
                  </div>
                )}

                <div className="rounded-md bg-white/[0.04] p-2 border border-white/5">
                  <span className="text-white/50 block text-[10px] uppercase">{t('voice.aspect')}</span>
                  <span className="mt-0.5 block font-semibold text-amber-300">
                    {parsedCommand.dimensionName ?? (parsedCommand.isGeneral ? t('voice.general') : t('voice.general'))}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-xs text-white/90 leading-relaxed font-sans">
                {parsedCommand.explanation}
              </p>

              <div className="mt-3.5 flex justify-end">
                <button
                  type="button"
                  onClick={handleApply}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 shadow-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{t('voice.apply')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Example Query Pills */}
          <div>
            <h3 className="text-xs font-semibold text-white/60 mb-2">
              {t('voice.examples')}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                t('voice.ex1'),
                t('voice.ex2'),
                t('voice.ex3'),
                t('voice.ex4'),
                t('voice.ex5'),
              ].map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleExampleClick(ex)}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-white/80 transition hover:border-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-200"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex shrink-0 items-center justify-between border-t border-white/15 bg-space/90 px-5 py-2.5">
          <span className="text-[11px] text-white/50">
            {isEs ? 'Reconocimiento Web Speech + NLU en cliente' : 'Client-side Web Speech + NLU Parser'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition"
          >
            {isEs ? 'Cerrar' : 'Close'}
          </button>
        </footer>
      </div>
    </div>
  )
}
