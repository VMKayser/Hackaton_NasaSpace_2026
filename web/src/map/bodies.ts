import type { Body } from '../data/schema'

// Radios medios y colores por cuerpo.
export interface BodyInfo {
  radiusKm: number
  color: string
  soft: string
}

export const BODIES: Record<Body, BodyInfo> = {
  earth: { radiusKm: 6371, color: 'var(--color-earth)', soft: 'var(--color-earth-soft)' },
  mars: {
    radiusKm: 3389.5,
    color: 'var(--color-rust)',
    soft: 'var(--color-rust-soft)',
  },
  moon: {
    radiusKm: 1737.4,
    color: 'var(--color-moon)',
    soft: 'var(--color-moon-soft)',
  },
}
