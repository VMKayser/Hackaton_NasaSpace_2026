import { useState } from 'react'
import type { Target } from '../data/schema'
import { useI18n } from '../i18n'
import { IMAGERY, LUNAR_SOUTH_POLE } from './planetaryImagery'
import type { Planet } from './planetaryImagery'

interface Props {
  body: Planet
  polar?: boolean
  target?: Target | null
  targets?: Target[]
  onTarget?: (id: string) => void
}

/**
 * Convierte latitud/longitud polar lunar (-90° a -80° S) a coordenadas X, Y porcentuales
 * sobre el mapa circular estereográfico de iluminación LROC (1214 x 1214 px).
 */
function polarCoordsToPercent(lat: number, lon: number): { x: number; y: number } {
  const distFrac = Math.max(0, Math.min(1, (90 + lat) / 10))
  // El disco lunar iluminado abarca aprox el 92% del marco cuadrado (radio ~46%)
  const r = distFrac * 46
  // Proyección estereográfica LROC: longitud 0° (meridiano hacia la Tierra) apunta hacia arriba (-Y)
  const rad = (lon * Math.PI) / 180
  const x = 50 + r * Math.sin(rad)
  const y = 50 - r * Math.cos(rad)
  return { x, y }
}

export function PlanetFallback({ body, polar = false, target, targets = [], onTarget }: Props) {
  const { t, lang } = useI18n()
  const [zoomed, setZoomed] = useState(false)
  const image = polar ? LUNAR_SOUTH_POLE : IMAGERY[body].fallback

  const polarTargets = polar ? targets.filter((tg) => tg.body === 'moon' && tg.lat < -80) : []
  const activePos = target && polar ? polarCoordsToPercent(target.lat, target.lon) : { x: 50, y: 50 }

  return (
    <figure className="relative flex h-full w-full flex-col overflow-hidden bg-black select-none">
      <div className="relative flex min-h-0 flex-1 w-full items-center justify-center overflow-hidden">
        <div
          className="relative max-h-full max-w-full aspect-square transition-transform duration-500 ease-out"
          style={{
            transform: zoomed ? 'scale(2.5)' : 'scale(1)',
            transformOrigin: `${activePos.x}% ${activePos.y}%`,
          }}
        >
          <img
            src={`${import.meta.env.BASE_URL}imagery/${image.file}`}
            alt={polar ? t('map.lunarPole') : t(`body.${body}`)}
            className="h-full w-full object-contain pointer-events-none"
            draggable={false}
          />

          {polar && polarTargets.map((tg) => {
            const isSelected = target?.id === tg.id
            const pos = polarCoordsToPercent(tg.lat, tg.lon)
            return (
              <div
                key={tg.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => onTarget && onTarget(tg.id)}
                title={`${tg.name} (${tg.lat.toFixed(2)}°, ${tg.lon.toFixed(2)}°)`}
              >
                {isSelected ? (
                  <div className="flex flex-col items-center">
                    <span className="relative flex h-5 w-5 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rust opacity-75" />
                      <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-rust shadow-md" />
                    </span>
                    <span className="mt-1 whitespace-nowrap rounded bg-space/95 px-2 py-0.5 text-[11px] font-semibold text-white shadow-lg border border-white/20">
                      {tg.name} ({tg.lat.toFixed(1)}°, {tg.lon.toFixed(1)}°)
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center opacity-75 hover:opacity-100">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full border border-white bg-slate-300 shadow" />
                    <span className="hidden group-hover:block mt-0.5 whitespace-nowrap rounded bg-space/90 px-1.5 py-0.5 text-[9px] text-white">
                      {tg.name}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {polar && (
          <div className="absolute right-3 bottom-3 z-30 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setZoomed((z) => !z)}
              className="rounded-md border border-white/20 bg-space/90 px-2.5 py-1 text-xs font-semibold text-white shadow backdrop-blur transition hover:bg-white/20"
            >
              {zoomed
                ? (lang === 'es' ? '🔍 Vista completa del polo' : '🔍 Full polar view')
                : (lang === 'es' ? '🔍 Acercar al objetivo' : '🔍 Zoom in')}
            </button>
          </div>
        )}
      </div>

      <figcaption className="flex w-full flex-wrap items-center justify-between gap-x-2 border-t border-white/15 bg-space px-2.5 py-1 text-[10px] text-white/85">
        <span>
          {polar
            ? (lang === 'es'
                ? 'Polo Sur Lunar (80°S a 90°S) · Mosaico ortográfico de iluminación LROC'
                : "Moon's South Pole (80°S to 90°S) · LROC Illumination Orthomap")
            : t('map.static')}
        </span>
        <a className="underline underline-offset-2 text-white/70 hover:text-white" href={image.url} target="_blank" rel="noopener noreferrer">
          {image.credit}
        </a>
      </figcaption>
    </figure>
  )
}
