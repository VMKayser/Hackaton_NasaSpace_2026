import { z } from 'zod'

// Esquemas del contrato v2.1 (AGENTS.md y docs/contrato-rol-4.md).

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

const Target = z.object({
  id: Id,
  name: z.string(),
  body: z.enum(['mars', 'moon']),
  lat: Lat,
  lon: Lon,
  summary: Text.optional(),
  values: z.record(z.string(), Value),
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
  country: z.string().optional(),
  known: z.boolean(),
  reference: z.boolean(),
  control: z.boolean().default(false),
  radiusKm: z.number().positive().optional(),
  type: Text.optional(),
  description: Text.optional(),
  limits: Text.optional(),
  exploration: Text.optional(),
  values: z.record(z.string(), Value),
  scores: z.array(ScoreEntry),
  purposeScores: z.record(z.string(), Score.nullable()).optional(),
})

export const AnalogsSchema = z
  .object({
    meta: z.object({
      mock: z.boolean(),
      version: z.string(),
      generated: z.string(),
      scoring: Text.optional(),
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

export const TextsSchema = z.object({
  targets: z.record(z.string(), z.object({ summary: Text.optional(), sources: z.array(Source).optional() })).optional(),
  sites: z.record(z.string(), SiteTexts).optional(),
  purposes: z.record(z.string(), z.object({ label: Text.optional(), question: Text.optional() })).optional(),
  story: z.array(StoryStep).optional(),
})

export type Text = z.infer<typeof Text>
export type Value = z.infer<typeof Value>
export type Source = z.infer<typeof Source>
export type Dimension = z.infer<typeof Dimension>
export type Purpose = z.infer<typeof Purpose>
export type Target = z.output<typeof Target>
export type Site = z.output<typeof Site>
export type AnalogsFile = z.output<typeof AnalogsSchema>
export type TextsFile = z.output<typeof TextsSchema>
export type Body = Target['body'] | 'earth'
