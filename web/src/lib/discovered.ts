import type { Model } from '../data/model'
import type { DiscoveredPoint, Purpose, Site } from '../data/schema'
import type { Lang, TFn } from '../i18n'
import { formatNumber, formatPercent } from './format'
import { rankSite } from './ranking'
import type { RankedSite } from './ranking'

const ALIKE = 0.66
const PARTLY = 0.33

/**
 * Nombre legible de un punto hallado por la malla. Si solo tiene nombre administrativo
 * (municipio/provincia/área), añade coordenadas cortas para distinguir celdas vecinas.
 */
export function discoveredName(
  place: Record<string, string> | undefined,
  lat: number,
  lon: number,
  nearPlace: (province: string) => string,
): string {
  const p = place ?? {}
  if (p.feature) return p.feature
  if (p.peak) return p.peak
  if (p.water) return p.water
  const coords = `${lat.toFixed(1)}, ${lon.toFixed(1)}`
  if (p.protected) return `${p.protected} (${coords})`
  if (p.municipality) return `${p.municipality} (${coords})`
  if (p.province) return `${nearPlace(p.province)} (${coords})`
  return coords
}

/** Adapta un punto hallado por la malla a la forma de `Site` para inspeccionarlo y compararlo (sin mezclarlo con el catálogo). */
export function discoveredToSite(point: DiscoveredPoint, nearPlace: (province: string) => string): Site {
  return {
    id: point.id,
    name: discoveredName(point.place, point.lat, point.lon, nearPlace),
    lat: point.lat,
    lon: point.lon,
    known: false,
    reference: false,
    control: false,
    found: true,
    radiusKm: point.radiusKm,
    place: point.place,
    values: point.values,
    scores: point.scores,
    purposeScores: point.purposeScores,
  }
}

/** Busca un sitio por id en el catálogo o entre los lugares hallados por la malla. */
export function resolveRankedSite(
  model: Model,
  rows: RankedSite[],
  id: string,
  targetId: string,
  purpose: Purpose | null,
  nearPlace: (province: string) => string,
): RankedSite | null {
  const existing = rows.find((r) => r.site.id === id)
  if (existing) return existing
  const point = model.foundById.get(id)
  if (!point) return null
  return rankSite(model.file, discoveredToSite(point, nearPlace), targetId, purpose)
}

/** Resumen basado en datos reales (sin textos inventados) para los paneles de detalle, comparación y 3D. */
export function discoveredSummary(model: Model, row: RankedSite, t: TFn, lang: Lang): { exploration: string; limits: string } {
  const stepKm = Math.round((model.discoveries?.meta.grid.stepDeg ?? 0.1) * 111)
  const scored = model.dimensions.flatMap((dim) => {
    const score = row.dimensions[dim.id]
    return typeof score === 'number' ? [{ label: dim.label[lang], score }] : []
  })
  const strong = scored.filter((d) => d.score >= ALIKE).sort((a, b) => b.score - a.score)
  const weak = scored.filter((d) => d.score < PARTLY).sort((a, b) => a.score - b.score)
  const fmtList = (items: { label: string; score: number }[]) => items.map((d) => `${d.label} (${formatPercent(d.score, lang)})`).join(', ')
  const lead = t('discover.unvalidatedLead', { km: formatNumber(stepKm, lang) })
  const exploration = strong.length
    ? `${lead} ${t('discover.strongMatch', { n: strong.length })}: ${fmtList(strong)}.`
    : `${lead} ${t('discover.noStrongMatch')}`
  const limits = weak.length ? `${t('discover.note')} ${t('discover.weakMatch')}: ${fmtList(weak)}.` : t('discover.note')
  return { exploration, limits }
}
