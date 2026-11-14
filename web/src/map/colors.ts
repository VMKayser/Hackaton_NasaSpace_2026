// Escala secuencial del puntaje, compartida por el mapa, la lista y la leyenda.
export const SCORE_STOPS: [number, string][] = [
  [0, '#dfe3e8'],
  [0.25, '#f3d3a9'],
  [0.5, '#eba154'],
  [0.75, '#d0621f'],
  [1, '#8a2805'],
]

export const NOT_EVALUATED = '#9aa3ad'
export const INK = '#16202b'

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function scoreColor(score: number | null): string {
  if (score === null) return NOT_EVALUATED
  const s = Math.min(1, Math.max(0, score))
  for (let i = 1; i < SCORE_STOPS.length; i++) {
    const [s1, c1] = SCORE_STOPS[i]
    if (s <= s1) {
      const [s0, c0] = SCORE_STOPS[i - 1]
      const k = (s - s0) / (s1 - s0)
      const a = hexToRgb(c0)
      const b = hexToRgb(c1)
      const mix = a.map((v, j) => Math.round(v + (b[j] - v) * k))
      return `rgb(${mix[0]} ${mix[1]} ${mix[2]})`
    }
  }
  return SCORE_STOPS[SCORE_STOPS.length - 1][1]
}

export const SCORE_GRADIENT = `linear-gradient(90deg, ${SCORE_STOPS.map(([s, c]) => `${c} ${s * 100}%`).join(', ')})`
