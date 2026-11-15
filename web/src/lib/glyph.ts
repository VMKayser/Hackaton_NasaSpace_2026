import type { Site } from '../data/schema'

/** Propiedades de SiteGlyph para un sitio y su puntaje. */
export function siteGlyphProps(site: Site, score: number | null) {
  return { score, known: site.known, reference: site.reference, control: site.control }
}

export type Origin = 'known' | 'reference' | 'candidate' | 'control' | 'found'

/** De dónde viene el lugar: ya estudiado (literatura), propuesto en el catálogo, control, o hallado por la malla. */
export function siteOrigin(site: Site): Origin {
  if (site.found) return 'found'
  if (site.reference) return 'reference'
  if (site.known) return 'known'
  if (site.control) return 'control'
  return 'candidate'
}
