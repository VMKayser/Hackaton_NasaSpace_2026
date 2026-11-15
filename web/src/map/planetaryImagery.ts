import type { Target } from '../data/schema'

export type Planet = Target['body']

export const PLANETS: Planet[] = ['mars', 'moon']
export const MERCATOR_LIMIT = 85.05112878
/** Latitud máxima de un objetivo que se puede abrir en la vista 3D. */
export const EXPLORE_MAX_LAT = 80
export const MARS_DETAIL = {
  url: 'https://astro.arcgis.com/arcgis/rest/services/OnMars/CTX1/MapServer/tile',
  source: 'https://murray-lab.caltech.edu/CTX/V01/TilePages/',
  credit: 'CTX · NASA/JPL/MSSS/Caltech Murray Lab/Esri',
  startZoom: 7,
  maxZoom: 12,
} as const

export const IMAGERY = {
  mars: {
    trekLayer: 'Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m',
    maxLevel: 7,
    mapCredit: 'Viking MDIM 2.1 · NASA Ames / USGS / NASA Trek',
    mapUrl: 'https://astrogeology.usgs.gov/search/map/mars_viking_colorized_global_mosaic_232m',
    fallback: { file: 'mars.webp', credit: 'NASA/JPL-Caltech', url: 'https://science.nasa.gov/resource/mars-planet-globe/' },
    explorer: 'https://trek.nasa.gov/mars/',
    center: [77, 12] as [number, number],
  },
  moon: {
    trekLayer: 'Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02',
    maxLevel: 8,
    mapCredit: 'LRO LROC WAC · NASA/GSFC/ASU / NASA Trek',
    mapUrl: 'https://trek.nasa.gov/moon/',
    fallback: { file: 'moon.webp', credit: 'NASA/GSFC/Arizona State University', url: 'https://science.nasa.gov/photojournal/nearside-spectacular/' },
    explorer: 'https://trek.nasa.gov/moon/',
    center: [0, 0] as [number, number],
  },
} as const

export const LUNAR_SOUTH_POLE = {
  file: 'lunar-south-pole.webp',
  credit: 'NASA/GSFC/Arizona State University',
  url: 'https://science.nasa.gov/resource/illumination-map-of-the-moons-south-pole/',
}
