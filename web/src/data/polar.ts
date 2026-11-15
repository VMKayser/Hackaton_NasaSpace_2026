// Objetivos con relieve del polo sur en marco local (tools/moon_polar.py). Se lee solo el manifiesto,
// sin cargar los módulos de mapas, para saber si la vista 3D está disponible pasado el límite del mapa.

let ids: Promise<Set<string>> | null = null

export function polarTargetIds(base: string): Promise<Set<string>> {
  ids ??= fetch(`${base}terrain/moon/manifest.json`)
    .then((r) => (r.ok && (r.headers.get('content-type') ?? '').includes('json') ? r.json() : { regions: [] }))
    .then((m: { regions?: { targetId?: unknown; frame?: unknown }[] }) =>
      new Set((m.regions ?? []).filter((r) => r.frame && typeof r.targetId === 'string').map((r) => r.targetId as string)))
    .catch(() => new Set<string>())
  return ids
}
