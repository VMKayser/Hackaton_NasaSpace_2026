import type { z } from 'zod'
import { AnalogsSchema, TextsSchema } from './schema'
import type { AnalogsFile, TextsFile } from './schema'

export type LoadResult =
  | { ok: true; analogs: AnalogsFile; texts: TextsFile }
  | { ok: false; file: string; problems: string[] }

const MAX_PROBLEMS = 6

export function formatIssues(error: z.ZodError): string[] {
  return error.issues.slice(0, MAX_PROBLEMS).map((issue) => {
    const path = issue.path.map(String).join('.')
    return path ? `${path}: ${issue.message}` : issue.message
  })
}

export function parseAnalogs(json: unknown) {
  return AnalogsSchema.safeParse(json)
}

export function parseTexts(json: unknown) {
  return TextsSchema.safeParse(json)
}

async function fetchJson(url: string, optional: boolean): Promise<unknown> {
  const res = await fetch(url, { cache: 'no-cache' })
  if (!res.ok) {
    if (optional && res.status === 404) return {}
    throw new Error(`HTTP ${res.status}`)
  }
  return res.json()
}

export async function loadData(base: string): Promise<LoadResult> {
  const analogsUrl = `${base}data/analogs.json`
  const textsUrl = `${base}data/texts.json`
  const [analogsResult, textsResult] = await Promise.allSettled([
    fetchJson(analogsUrl, false),
    fetchJson(textsUrl, true),
  ])
  if (analogsResult.status === 'rejected') {
    return { ok: false, file: 'analogs.json', problems: [String(analogsResult.reason)] }
  }
  if (textsResult.status === 'rejected') {
    return { ok: false, file: 'texts.json', problems: [String(textsResult.reason)] }
  }
  const analogs = parseAnalogs(analogsResult.value)
  if (!analogs.success) return { ok: false, file: 'analogs.json', problems: formatIssues(analogs.error) }
  const texts = parseTexts(textsResult.value)
  if (!texts.success) return { ok: false, file: 'texts.json', problems: formatIssues(texts.error) }

  return { ok: true, analogs: analogs.data, texts: texts.data }
}
