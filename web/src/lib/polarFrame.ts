// Marco local para el polo sur de la Luna. MapLibre usa Web Mercator, que no llega más allá de 85°, y el
// modelo global de USGS solo cubre de 60° N a 60° S. tools/moon_polar.py guarda el relieve de LOLA en
// proyección polar estereográfica (la del producto LDEM de la NASA) y lo reubica alrededor de (0°, 0°):
// cada grado del marco equivale a la misma distancia en metros que en la superficie real, así que la vista
// 3D lo muestra a escala real. Arriba del marco es la dirección del meridiano 0°.

export const MOON_RADIUS_M = 1737400
const RAD = Math.PI / 180

export interface PolarFrame {
  type: 'south-polar-stereographic'
  /** Posición real del centro del marco. */
  lat: number
  lon: number
  /** Coordenadas estereográficas del centro (m): x hacia 90° E, y hacia el meridiano 0°. */
  x0: number
  y0: number
}

/** Estereográfica polar sur de la NASA (esfera de 1737,4 km): x hacia 90° E, y hacia 0°. */
export function southStereo(lat: number, lon: number): [number, number] {
  const r = 2 * MOON_RADIUS_M * Math.tan(((90 - Math.abs(lat)) * RAD) / 2)
  return [r * Math.sin(lon * RAD), r * Math.cos(lon * RAD)]
}

/** De la superficie real al marco local (grados alrededor de 0°, 0°). */
export function toLocal(frame: PolarFrame, lat: number, lon: number): { lon: number; lat: number } {
  const [x, y] = southStereo(lat, lon)
  return { lon: (x - frame.x0) / MOON_RADIUS_M / RAD, lat: (y - frame.y0) / MOON_RADIUS_M / RAD }
}

/** Del marco local a la superficie real. */
export function fromLocal(frame: PolarFrame, lat: number, lon: number): { lon: number; lat: number } {
  const x = frame.x0 + lon * RAD * MOON_RADIUS_M
  const y = frame.y0 + lat * RAD * MOON_RADIUS_M
  const r = Math.hypot(x, y)
  return { lon: Math.atan2(x, y) / RAD, lat: -90 + (2 * Math.atan(r / (2 * MOON_RADIUS_M))) / RAD }
}
