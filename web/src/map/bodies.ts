import type { Body } from '../data/schema'

// Datos por cuerpo. El mapa del objetivo (Fase 6) usará baseTiles y radiusKm.
export interface BodyInfo {
  radiusKm: number
  color: string
  soft: string
  baseTiles?: string
}

export const BODIES: Record<Body, BodyInfo> = {
  earth: { radiusKm: 6371, color: 'var(--color-earth)', soft: 'var(--color-earth-soft)' },
  mars: {
    radiusKm: 3389.5,
    color: 'var(--color-rust)',
    soft: 'var(--color-rust-soft)',
    baseTiles:
      'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-2/all/{z}/{x}/{y}.png',
  },
  moon: {
    radiusKm: 1737.4,
    color: 'var(--color-moon)',
    soft: 'var(--color-moon-soft)',
    baseTiles:
      'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-moon-basemap-v0-1/all/{z}/{x}/{y}.png',
  },
}
