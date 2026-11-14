import type { Site } from '../data/schema'

/** Propiedades de SiteGlyph para un sitio y su puntaje. */
export function siteGlyphProps(site: Site, score: number | null) {
  return { score, known: site.known, reference: site.reference, control: site.control }
}
