import { z } from 'zod'

// Esquemas del contrato v2.2 (AGENTS.md y docs/contrato-rol-4.md): v2.1 más `meta.minCoverage` y
// `targets[].context`, los dos opcionales.

const Text = z.object({ en: z.string(), es: z.string() })
const Id = z.string().min(1)
const Lat = z.number().min(-90).max(90)
// Longitud este positiva. Una longitud entre 180 y 360 se convierte restando 360.
const Lon = z
  .number()
  .min(-180)
  .max(360)
  .transform((lon) => (lon > 180 ? lon - 360 : lon))
const Score = z.number().min(0).max(1)

const Value = z.object({
  value: z.union([z.number(), z.string(), z.null()]),
  unit: z.string().nullable(),
})

const Source = z.object({
  name: z.string(),
  agency: z.string(),
  url: z.string(),
  body: z.enum(['earth', 'mars', 'moon']).optional(),
})

const Dimension = z.object({
  id: Id,
  label: Text,
  weight: z.number().min(0),
  sources: z.array(Source),
  categories: z.record(z.string(), Text).optional(),
  /** Medición que guarda la dimensión (columna de docs/valores), p. ej. "slope_median_deg". */
  measure: z.string().optional(),
})

const Purpose = z.object({
  id: Id,
  kind: z.enum(['phenomenon', 'task']),
  targetId: Id,
  weights: z.record(z.string(), z.number().min(0)),
  label: Text.optional(),
  question: Text.optional(),
})

const Overlay = z.object({
  targetId: Id,
  purposeId: z.string().optional(),
  url: z.string(),
  bounds: z.tuple([z.number(), z.number(), z.number(), z.number()]),
})

/** Medición del objetivo sin equivalente medido en la Tierra: se muestra, no puntúa. */
const ContextValue = z.object({
  id: Id,
  label: Text,
  value: z.union([z.number(), z.string(), z.null()]),
  unit: z.string().nullable(),
  /** Cómo se midió: área, profundidad, resolución. */
  note: Text.optional(),
  sources: z.array(Source).min(1),
})

const Target = z.object({
  id: Id,
  name: z.string(),
  body: z.enum(['mars', 'moon']),
  lat: Lat,
  lon: Lon,
  summary: Text.optional(),
  values: z.record(z.string(), Value),
  context: z.array(ContextValue).optional(),
})

const ScoreEntry = z.object({
  targetId: Id,
  similarity: Score,
  dimensions: z.record(z.string(), Score.nullable()),
})

const Site = z.object({
  id: Id,
  name: z.string(),
  lat: Lat,
  lon: Lon,
  known: z.boolean(),
  reference: z.boolean(),
  control: z.boolean().default(false),
  radiusKm: z.number().positive().optional(),
  /** País y división administrativa (OpenStreetMap), para etiquetas y filtros; no puntúa. */
  place: z.record(z.string(), z.string()).optional(),
  type: Text.optional(),
  description: Text.optional(),
  limits: Text.optional(),
  exploration: Text.optional(),
  values: z.record(z.string(), Value),
  scores: z.array(ScoreEntry),
  purposeScores: z.record(z.string(), Score.nullable()).optional(),
  found: z.boolean().optional(),
})

export const AnalogsSchema = z
  .object({
    meta: z.object({
      mock: z.boolean(),
      version: z.string(),
      generated: z.string(),
      scoring: Text.optional(),
      /** Parte mínima del peso con dato para dar un puntaje; por debajo, «datos insuficientes». */
      minCoverage: z.number().min(0).max(1).optional(),
      dimensions: z.array(Dimension).min(1),
      purposes: z.array(Purpose).optional(),
      overlays: z.array(Overlay).optional(),
    }),
    targets: z.array(Target).min(1),
    sites: z.array(Site),
  })
  .superRefine((file, ctx) => {
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: 'custom', path, message })

    const unique = (ids: string[], path: string) => {
      const seen = new Set<string>()
      ids.forEach((id, i) => {
        if (seen.has(id)) issue([path, i, 'id'], `duplicate id "${id}"`)
        seen.add(id)
      })
      return seen
    }

    const dims = unique(
      file.meta.dimensions.map((d) => d.id),
      'meta.dimensions',
    )
    const targets = unique(
      file.targets.map((t) => t.id),
      'targets',
    )
    unique(
      file.sites.map((s) => s.id),
      'sites',
    )
    const purposes = unique(
      (file.meta.purposes ?? []).map((p) => p.id),
      'meta.purposes',
    )

    const knownDims = (record: Record<string, unknown>, path: (string | number)[]) => {
      for (const key of Object.keys(record)) {
        if (!dims.has(key)) issue(path, `unknown dimension "${key}"`)
      }
    }

    file.meta.purposes?.forEach((p, i) => {
      if (!targets.has(p.targetId)) issue(['meta.purposes', i, 'targetId'], `unknown target "${p.targetId}"`)
      knownDims(p.weights, ['meta.purposes', i, 'weights'])
    })
    file.meta.overlays?.forEach((o, i) => {
      if (!targets.has(o.targetId)) issue(['meta.overlays', i, 'targetId'], `unknown target "${o.targetId}"`)
    })
    file.targets.forEach((t, i) => knownDims(t.values, ['targets', i, 'values']))
    file.sites.forEach((s, i) => {
      knownDims(s.values, ['sites', i, 'values'])
      const seen = new Set<string>()
      s.scores.forEach((sc, j) => {
        if (!targets.has(sc.targetId)) issue(['sites', i, 'scores', j, 'targetId'], `unknown target "${sc.targetId}"`)
        if (seen.has(sc.targetId)) issue(['sites', i, 'scores', j, 'targetId'], `target "${sc.targetId}" appears twice`)
        seen.add(sc.targetId)
        knownDims(sc.dimensions, ['sites', i, 'scores', j, 'dimensions'])
      })
      for (const key of Object.keys(s.purposeScores ?? {})) {
        if (!purposes.has(key)) issue(['sites', i, 'purposeScores'], `unknown purpose "${key}"`)
      }
    })
  })

const StoryStep = z.object({
  purposeId: z.string().optional(),
  targetId: z.string().optional(),
  siteId: z.string().optional(),
  compare: z.array(z.string()).optional(),
  view: z.enum(['globe', '2d']).optional(),
  caption: Text,
})

const SiteTexts = z.object({
  description: Text.optional(),
  limits: Text.optional(),
  exploration: Text.optional(),
  /** Fuentes de los textos del sitio. */
  sources: z.array(Source).optional(),
})

/** Recomendación para adaptar un ensayo: general para un cuerpo o propia de un propósito. */
const Adaptation = z.object({
  id: Id,
  body: z.enum(['mars', 'moon']).optional(),
  purposeId: z.string().optional(),
  title: Text,
  text: Text,
  sources: z.array(Source).min(1),
})

export const TextsSchema = z.object({
  targets: z.record(z.string(), z.object({ summary: Text.optional(), sources: z.array(Source).optional() })).optional(),
  sites: z.record(z.string(), SiteTexts).optional(),
  purposes: z.record(z.string(), z.object({ label: Text.optional(), question: Text.optional() })).optional(),
  story: z.array(StoryStep).optional(),
  adaptations: z.array(Adaptation).optional(),
})

/** Lugares nuevos que encontró tools/discover.py en una malla, con el mismo método que el catálogo. */
const DiscoveredGeology = z.object({
  name: z.string(),
  lith: z.string().nullish(),
  age: z.string().nullish(),
  descrip: z.string().nullish(),
  url: z.string().url().optional(),
})

const DiscoveredPoint = z.object({
  id: Id,
  lat: Lat,
  lon: Lon,
  radiusKm: z.number().positive(),
  elevationM: z.number().nullish(),
  coverage: z.number().min(0).max(1),
  values: z.record(z.string(), Value),
  mapUnit: z.string().nullable(),
  geology: DiscoveredGeology.optional(),
  place: z.record(z.string(), z.string()),
  nearestSite: z.object({ id: Id, km: z.number().nonnegative() }),
  scores: z.array(ScoreEntry),
  purposeScores: z.record(z.string(), Score.nullable()).optional(),
})

const Candidate = z.object({
  targetId: Id,
  purposeId: z.string().optional(),
  rank: z.number().int().min(1),
  lat: Lat,
  lon: Lon,
  similarity: Score,
  pointId: Id.optional(),
  elevationM: z.number().optional(),
  values: z.record(z.string(), Value),
  dimensions: z.record(z.string(), Score.nullable()),
  mapUnit: z.string().nullable().optional(),
  place: z.record(z.string(), z.string()).optional(),
  nearestSite: z.object({ id: Id, km: z.number().min(0) }),
})

export const DiscoveriesSchema = z.object({
  meta: z.object({
    generated: z.string(),
    grid: z.object({
      bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
      stepDeg: z.number().positive(),
      radiusKm: z.number().positive(),
      points: z.number().int(),
      measured: z.number().int(),
      nearCatalogKm: z.number(),
      minSeparationKm: z.number(),
      country: z.string().optional(),
    }),
    validation: z.array(z.object({ targetId: Id, purposeId: z.string().optional(), top: z.number().int(), nearCatalog: z.number().int() })),
    /** Objetivos o propósitos para los que la malla no propone lugares, con el motivo. */
    skipped: z.array(z.object({ targetId: Id, purposeId: z.string().optional(), reason: Text })).optional(),
    sources: z.array(Source),
  }),
  points: z.record(z.string(), DiscoveredPoint).optional(),
  candidates: z.array(Candidate),
})

/** grid.json, de tools/grid_relief.py: relieve de cada punto de la malla, para buscar lugares nuevos desde un pin. */
const GridPoint = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  /** Mediciones por nombre (`meta.dimensions[].measure`), p. ej. slope_median_deg. */
  values: z.record(z.string(), z.number()),
  elevationM: z.number().nullable().optional(),
  nearestSite: z.object({ id: Id, km: z.number().min(0) }),
  place: z.record(z.string(), z.string()).optional(),
})

export const GridSchema = z.object({
  meta: z.object({
    generated: z.string(),
    country: z.string().optional(),
    bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    stepDeg: z.number().positive(),
    radiusKm: z.number().positive(),
    stepM: z.number().positive(),
    measures: z.array(z.string()),
    sources: z.array(Source).min(1),
  }),
  points: z.array(GridPoint),
})

export type Text = z.infer<typeof Text>
export type Value = z.infer<typeof Value>
export type ContextValue = z.infer<typeof ContextValue>
export type Source = z.infer<typeof Source>
export type Dimension = z.infer<typeof Dimension>
export type Purpose = z.infer<typeof Purpose>
export type Target = z.output<typeof Target>
export type Site = z.output<typeof Site>
export type AnalogsFile = z.output<typeof AnalogsSchema>
export type TextsFile = z.output<typeof TextsSchema>
export type Adaptation = z.infer<typeof Adaptation>
export type DiscoveriesFile = z.output<typeof DiscoveriesSchema>
export type Candidate = z.output<typeof Candidate>
export type DiscoveredPoint = z.output<typeof DiscoveredPoint>
export type GridFile = z.output<typeof GridSchema>
export type GridPoint = z.output<typeof GridPoint>
export type Body = Target['body'] | 'earth'
