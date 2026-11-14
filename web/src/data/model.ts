import type { Lang } from '../i18n'
import type { AnalogsFile, Dimension, Purpose, Site, Target, Text, TextsFile } from './schema'

/** Datos ya validados, con índices por id. */
export interface Model {
  file: AnalogsFile
  texts: TextsFile
  dimensions: Dimension[]
  purposes: Purpose[]
  targetById: Map<string, Target>
  siteById: Map<string, Site>
  purposeById: Map<string, Purpose>
  dimensionById: Map<string, Dimension>
}

export function buildModel(file: AnalogsFile, texts: TextsFile): Model {
  return {
    file,
    texts,
    dimensions: file.meta.dimensions,
    purposes: file.meta.purposes ?? [],
    targetById: new Map(file.targets.map((t) => [t.id, t])),
    siteById: new Map(file.sites.map((s) => [s.id, s])),
    purposeById: new Map((file.meta.purposes ?? []).map((p) => [p.id, p])),
    dimensionById: new Map(file.meta.dimensions.map((d) => [d.id, d])),
  }
}

/**
 * Primer texto no vacío en el idioma pedido. El orden de los candidatos decide quién gana:
 * texts.json va primero. Devuelve null si no hay texto ("texto pendiente").
 */
export function pickText(lang: Lang, ...candidates: (Text | undefined)[]): string | null {
  for (const c of candidates) {
    const s = c?.[lang]?.trim()
    if (s) return s
  }
  return null
}

export type SiteTextField = 'description' | 'limits' | 'exploration'

export function siteText(model: Model, site: Site, field: SiteTextField, lang: Lang): string | null {
  return pickText(lang, model.texts.sites?.[site.id]?.[field], site[field])
}

export function targetSummary(model: Model, target: Target, lang: Lang): string | null {
  return pickText(lang, model.texts.targets?.[target.id]?.summary, target.summary)
}

export function purposeLabel(model: Model, purpose: Purpose, lang: Lang): string {
  return pickText(lang, model.texts.purposes?.[purpose.id]?.label, purpose.label) ?? purpose.id
}

export function purposeQuestion(model: Model, purpose: Purpose, lang: Lang): string | null {
  return pickText(lang, model.texts.purposes?.[purpose.id]?.question, purpose.question)
}
