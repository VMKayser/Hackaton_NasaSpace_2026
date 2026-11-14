import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Target } from '../data/schema'
import { useI18n } from '../i18n'
import { formatNumber } from '../lib/format'
import { STEEP_THRESHOLDS } from '../lib/route'
import type { ProfileStats } from '../lib/route'

export interface RouteProfileData {
  /** km desde el inicio */
  dist: number[]
  /** metros respecto del inicio; null sin dato */
  earth: (number | null)[]
  planet: (number | null)[]
  earthStats: ProfileStats
  planetStats: ProfileStats
}

export interface TrackInfo {
  name: string
  sols: [number, number]
  lengthKm: number
  maxTiltDeg: number | null
  medianTiltDeg: number | null
  source: { name: string; agency: string; url: string }
}

const EARTH = '#9cc7ec'
const PLANET = '#f2b48c'

export function RouteProfile({ track, target, data }: { track: TrackInfo; target: Target; data: RouteProfileData | null }) {
  const { t, lang } = useI18n()
  const body = t(`body.${target.body}`)
  const n = (v: number, d = 0) => formatNumber(Number(v.toFixed(d)), lang)
  const pct = (v: number) => `${formatNumber(Math.round(v * 100), lang)} %`
  const rows = data
    ? data.dist.map((d, i) => ({ d: Number(d.toFixed(2)), earth: data.earth[i], planet: data.planet[i] }))
    : []
  const stat = (label: string, e: string, p: string) => (
    <div className="grid grid-cols-[1fr_auto_auto] items-baseline gap-x-3 py-0.5 text-[11px]">
      <span className="text-white/65">{label}</span>
      <span className="font-mono tabular-nums" style={{ color: EARTH }}>{e}</span>
      <span className="font-mono tabular-nums" style={{ color: PLANET }}>{p}</span>
    </div>
  )

  return (
    <div className="pointer-events-auto w-full max-w-4xl overflow-hidden rounded-xl bg-space/90 shadow-2xl ring-1 ring-white/10 backdrop-blur">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 border-b border-white/10 px-3 py-2">
        <p className="text-xs font-semibold">{t('explore.route.title', { name: track.name, body })}</p>
        <p className="text-[10px] text-white/55">
          <a href={track.source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
            {track.source.name}
          </a>{' '}
          · {track.source.agency}
        </p>
      </div>
      <div className="grid gap-3 p-3 md:grid-cols-[1fr_15rem]">
        <figure className="min-w-0">
          <figcaption className="mb-1 text-[10px] text-white/55">{t('explore.route.profile')}</figcaption>
          <div className="h-28 sm:h-32">
            {data ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
                  <CartesianGrid stroke="rgb(255 255 255 / 0.08)" vertical={false} />
                  <XAxis dataKey="d" type="number" domain={[0, 'dataMax']} tick={{ fill: 'rgb(255 255 255 / 0.55)', fontSize: 10 }} tickFormatter={(v: number) => `${formatNumber(v, lang)} km`} stroke="rgb(255 255 255 / 0.2)" />
                  <YAxis tick={{ fill: 'rgb(255 255 255 / 0.55)', fontSize: 10 }} tickFormatter={(v: number) => formatNumber(v, lang)} stroke="rgb(255 255 255 / 0.2)" width={44} />
                  <Tooltip
                    contentStyle={{ background: '#0b1726', border: '1px solid rgb(255 255 255 / 0.15)', borderRadius: 8, fontSize: 11 }}
                    labelFormatter={(v) => `${formatNumber(Number(v), lang)} km`}
                    formatter={(v, name) => [`${formatNumber(Math.round(Number(v)), lang)} m`, name === 'earth' ? t('explore.route.earth') : t('explore.route.planet', { body })]}
                  />
                  <Line type="monotone" dataKey="earth" stroke={EARTH} dot={false} strokeWidth={1.6} isAnimationActive={false} connectNulls />
                  <Line type="monotone" dataKey="planet" stroke={PLANET} dot={false} strokeWidth={1.6} isAnimationActive={false} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="grid h-full place-items-center text-xs text-white/60" role="status">{t('explore.route.loading')}</p>
            )}
          </div>
        </figure>
        <div className="min-w-0">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 pb-1 text-[10px] font-semibold uppercase tracking-wide">
            <span />
            <span style={{ color: EARTH }}>{t('explore.route.earth')}</span>
            <span style={{ color: PLANET }}>{t('explore.route.planet', { body })}</span>
          </div>
          {data && (
            <>
              {stat(t('explore.route.length'), `${n(data.earthStats.lengthKm, 1)} km`, `${n(data.planetStats.lengthKm, 1)} km`)}
              {stat(t('explore.route.ascent'), `${n(data.earthStats.ascentM)} m`, `${n(data.planetStats.ascentM)} m`)}
              {stat(t('explore.route.maxSlope'), `${n(data.earthStats.maxSlopeDeg, 1)}°`, `${n(data.planetStats.maxSlopeDeg, 1)}°`)}
              {STEEP_THRESHOLDS.map((deg) => (
                <div key={deg}>{stat(t('explore.route.steeper', { deg }), pct(data.earthStats.steeperThan[deg]), pct(data.planetStats.steeperThan[deg]))}</div>
              ))}
            </>
          )}
          {track.maxTiltDeg !== null && track.medianTiltDeg !== null && (
            <p className="mt-1.5 text-[10px] leading-snug text-white/65">
              {t('explore.route.tilt', { max: n(track.maxTiltDeg, 1), median: n(track.medianTiltDeg, 1) })}
            </p>
          )}
        </div>
      </div>
      <p className="border-t border-white/10 px-3 py-1.5 text-[10px] leading-snug text-white/55">
        {t('explore.route.legend', { body, from: track.sols[0], to: track.sols[1] })} {t('explore.route.what')} {t('explore.route.method', { body })}
      </p>
    </div>
  )
}
