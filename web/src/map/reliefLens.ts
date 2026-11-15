import { addProtocol } from 'maplibre-gl'
import { decodeTerrarium, EARTH_RADIUS_KM, metresPerPixel, rampColor, RELATIVE_RAMP, slopeDegrees, SLOPE_RAMP, tileCenterLat, tileOf } from '../lib/terrain'
import { BODIES } from './bodies'
import type { Planet } from './planetaryImagery'
import { planetElevationAt, planetTileElevations, TILE } from './planetTerrain'

// Capas de comparación calculadas en el navegador a partir del mismo relieve real que se muestra:
// relief-lens://{body}/{targetId|-}/{slope|relative}/{lon}/{lat}/{z}/{x}/{y}
// La misma rampa de color se usa en los dos mapas, para que se pueda comparar a simple vista.

const EARTH_DEM = (z: number, x: number, y: number) => `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`
export const EARTH_LENS_MAX_ZOOM = 12

async function decodePng(blob: Blob): Promise<Uint8ClampedArray> {
  const bitmap = await createImageBitmap(blob, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' })
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Cannot decode elevation')
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()
  return ctx.getImageData(0, 0, canvas.width, canvas.height).data
}

const earthTiles = new Map<string, Promise<Float32Array>>()
/** Elevaciones reales (m) de los 256 x 256 píxeles de una tesela de Terrain Tiles. */
export function earthTileElevations(z: number, x: number, y: number, signal?: AbortSignal): Promise<Float32Array> {
  const key = `${z}/${x}/${y}`
  let p = earthTiles.get(key)
  if (!p) {
    p = fetch(EARTH_DEM(z, x, y), { signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Elevation returned ${r.status}`)
        return r.blob()
      })
      .then(decodePng)
      .then((px) => {
        const out = new Float32Array(TILE * TILE)
        for (let i = 0; i < out.length; i++) out[i] = decodeTerrarium(px[i * 4], px[i * 4 + 1], px[i * 4 + 2])
        return out
      })
    p.catch(() => earthTiles.delete(key))
    earthTiles.set(key, p)
  }
  return p
}

/** Elevación real (m) en un punto, para centrar el relieve relativo. */
export async function elevationAtPoint(body: 'earth' | Planet, targetId: string, lon: number, lat: number): Promise<number | null> {
  if (body !== 'earth') return planetElevationAt(body, targetId, lon, lat)
  const t = tileOf(lon, lat, EARTH_LENS_MAX_ZOOM)
  const elev = await earthTileElevations(EARTH_LENS_MAX_ZOOM, t.x, t.y)
  return elev[t.py * TILE + t.px]
}

addProtocol('relief-lens', async ({ url }, { signal }) => {
  const { hostname, pathname } = new URL(url)
  const body = hostname as 'earth' | Planet
  const [targetId, lens, lonS, latS, zs, xs, ys] = pathname.slice(1).split('/')
  const [z, x, y] = [Number(zs), Number(xs), Number(ys)]
  const elev = body === 'earth'
    ? await earthTileElevations(z, x, y, signal)
    : await planetTileElevations(body, targetId, z, x, y)

  const image = new ImageData(TILE, TILE)
  const d = image.data
  if (lens === 'slope') {
    const radius = body === 'earth' ? EARTH_RADIUS_KM : BODIES[body].radiusKm
    const slope = slopeDegrees(elev, TILE, metresPerPixel(z, tileCenterLat(z, y), radius))
    for (let i = 0; i < slope.length; i++) {
      const [r, g, b] = rampColor(SLOPE_RAMP, slope[i])
      d.set([r, g, b, 255], i * 4)
    }
  } else {
    const ref = (await elevationAtPoint(body, targetId, Number(lonS), Number(latS))) ?? 0
    for (let i = 0; i < elev.length; i++) {
      const [r, g, b] = rampColor(RELATIVE_RAMP, elev[i] - ref)
      d.set([r, g, b, 255], i * 4)
    }
  }
  const canvas = new OffscreenCanvas(TILE, TILE)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Cannot prepare lens tiles')
  ctx.putImageData(image, 0, 0)
  return { data: canvas.transferToImageBitmap() }
})
