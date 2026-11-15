import type { z } from 'zod'
import { AnalogsSchema, DiscoveriesSchema, GridSchema, TextsSchema } from './schema'
import type { AnalogsFile, DiscoveriesFile, GridFile, TextsFile } from './schema'

export type LoadResult =
  | { ok: true; analogs: AnalogsFile; texts: TextsFile; discoveries: DiscoveriesFile | null }
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

export function parseDiscoveries(json: unknown) {
  return DiscoveriesSchema.safeParse(json)
}

async function fetchJson(url: string, optional: boolean): Promise<unknown> {
  const res = await fetch(url, { cache: 'no-cache' })
  if (!res.ok) {
    if (optional && res.status === 404) return {}
    throw new Error(`HTTP ${res.status}`)
  }
  // Un servidor de páginas puede responder con el index.html (200) a un archivo que no existe.
  if (optional && !(res.headers.get('content-type') ?? '').includes('json')) return {}
  return res.json()
}

export async function loadData(base: string): Promise<LoadResult> {
  const analogsUrl = `${base}data/analogs.json`
  const textsUrl = `${base}data/texts.json`
  const discoveriesUrl = `${base}data/discoveries.json`
  const [analogsResult, textsResult, discoveriesResult] = await Promise.allSettled([
    fetchJson(analogsUrl, false),
    fetchJson(textsUrl, true),
    fetchJson(discoveriesUrl, true),
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

  // Archivo opcional: si falta, no hay lugares nuevos; si no es válido, se informa como los otros.
  let discoveries: DiscoveriesFile | null = null
  if (discoveriesResult.status === 'rejected') {
    return { ok: false, file: 'discoveries.json', problems: [String(discoveriesResult.reason)] }
  }
  const raw = discoveriesResult.value
  if (raw && typeof raw === 'object' && Object.keys(raw).length > 0) {
    const parsed = parseDiscoveries(raw)
    if (!parsed.success) return { ok: false, file: 'discoveries.json', problems: formatIssues(parsed.error) }
    discoveries = parsed.data
  }

  return { ok: true, analogs: analogs.data, texts: texts.data, discoveries }
}

export function parseGrid(json: unknown) {
  return GridSchema.safeParse(json)
}

let grid: Promise<GridFile | null> | null = null
/**
 * grid.json, cargado solo cuando se pide (búsqueda de lugares nuevos desde un pin). null si no existe;
 * un archivo no válido es un error.
 */
export function loadGrid(base: string): Promise<GridFile | null> {
  grid ??= fetchJson(`${base}data/grid.json`, true).then((raw) => {
    if (!raw || typeof raw !== 'object' || Object.keys(raw).length === 0) return null
    const parsed = parseGrid(raw)
    if (!parsed.success) throw new Error(formatIssues(parsed.error).join('; '))
    return parsed.data
  })
  grid.catch(() => {
    grid = null
  })
  return grid
}
