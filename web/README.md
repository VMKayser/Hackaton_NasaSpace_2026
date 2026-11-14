# Galaxy Match: web app

Static React app that ranks places on Earth as analogs of sites on Mars or the Moon. It only
displays the scores computed by the metrics team; it never computes or recalculates them.

## Commands

```
npm install
npm run dev        local server (http://localhost:5173)
npm run typecheck
npm run lint       oxlint
npm run test       vitest
npm run build      production build in dist/
```

## Data

| File | Owner | Content |
|---|---|---|
| `public/data/analogs.json` | Role 4 | Targets, sites, values, scores, dimensions and sources (contract v2.1, see `../AGENTS.md`) |
| `public/data/texts.json` | Role 6 | Site descriptions, limits and exploration texts, purpose labels, story steps |

The current `analogs.json` is demo data (`meta.mock: true`): the app shows a "Demo data" banner.
Replace it with the real file and set `meta.mock` to `false`. Both files are validated on load;
format problems are listed on screen.

## Structure

```
src/
  data/        Zod schemas, loading, text merging (texts.json wins over analogs.json)
  lib/         ranking order, formatting, URL state
  map/         MapLibre map, base layers, site layers and colors
  components/  purpose picker, ranking, site detail, map overlays
  i18n/        en.ts (default) and es.ts; TypeScript fails if keys differ
```

The app state lives in the URL (`?purpose=&target=&site=&compare=&view=&world=&lang=&step=`), so every view can be shared.

## Deployment

For a persistent Vercel deployment, import the GitHub repository and set the project Root Directory to
`web`. The Vite preset builds with `npm run build` on Node.js 22 and serves `dist`. No environment
variables are required. A linked Vercel CLI can deploy the same directory with `vercel deploy --prod`.
See [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite).

## Planetary imagery

- Mars uses NASA Trek's [Viking MDIM 2.1 color mosaic](https://astrogeology.usgs.gov/search/map/mars_viking_colorized_global_mosaic_232m) from NASA Ames and USGS. Close views load the [global CTX mosaic](https://murray-lab.caltech.edu/CTX/V01/TilePages/) in grayscale from NASA/JPL/MSSS/Caltech Murray Lab, served by Esri.
- The Moon uses the [LRO LROC WAC global mosaic](https://trek.nasa.gov/moon/) from NASA/GSFC/Arizona State University, served by NASA Trek.
- The browser reprojects the source imagery into Web Mercator for MapLibre. The imagery provides visual context for the independently supplied scores and measurements.
- The locally bundled WebP images come from [Mars Planet Globe](https://science.nasa.gov/resource/mars-planet-globe/) (NASA/JPL-Caltech), [Nearside Spectacular](https://science.nasa.gov/photojournal/nearside-spectacular/) (NASA/GSFC/Arizona State University) and the [Illumination Map of the Moon’s South Pole](https://science.nasa.gov/resource/illumination-map-of-the-moons-south-pole/) (NASA/GSFC/Arizona State University). See the [NASA media usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/).
- Earth's detailed Sentinel-2 cloudless 2016 imagery is [CC BY 4.0](https://cloudless.eox.at/documentation/faq). See the [Terrain Tiles attribution](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) for the sources used in the Earth relief layer.
