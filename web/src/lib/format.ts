import type { Dimension, Value } from '../data/schema'
import type { Lang } from '../i18n'

const numberFormats = new Map<string, Intl.NumberFormat>()

function nf(lang: Lang, digits: number) {
  const key = `${lang}-${digits}`
  let f = numberFormats.get(key)
  if (!f) {
    f = new Intl.NumberFormat(lang, { maximumFractionDigits: digits })
    numberFormats.set(key, f)
  }
  return f
}

export function formatNumber(n: number, lang: Lang): string {
  const digits = Math.abs(n) >= 100 ? 0 : Math.abs(n) >= 10 ? 1 : 2
  return nf(lang, digits).format(n)
}

/** Texto de un valor medido; null si no hay dato. */
export function formatValue(v: Value | undefined, dim: Dimension, lang: Lang): string | null {
  if (!v || v.value === null) return null
  if (typeof v.value === 'string') return dim.categories?.[v.value]?.[lang] ?? v.value
  const n = formatNumber(v.value, lang)
  if (!v.unit) return n
  return v.unit.startsWith('°') ? `${n}${v.unit}` : `${n} ${v.unit}`
}

/** Puntaje de 0 a 1 mostrado de 0 a 100. */
export function score100(score: number): number {
  return Math.round(score * 100)
}

export function formatCoords(lat: number, lon: number, lang: Lang): string {
  const f = nf(lang, 2)
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lon >= 0 ? 'E' : 'W'
  return `${f.format(Math.abs(lat))}° ${ns}, ${f.format(Math.abs(lon))}° ${ew}`
}

export function formatDate(iso: string, lang: Lang): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat(lang, { dateStyle: 'medium', timeZone: 'UTC' }).format(d)
}
