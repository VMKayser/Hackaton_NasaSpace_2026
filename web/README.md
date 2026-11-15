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

`analogs.json` holds measured values (`meta.mock: false`), generated with `python tools/build_analogs.py`
from `docs/valores/` (values measured with `tools/measure_values.py`; see `docs/valores/README.md` for
sources and limits). With `meta.mock: true` the app shows a "Demo data" banner. Both files are validated
on load; format problems are listed on screen.

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

## 3D exploration with real terrain

From a site sheet, **Explore in 3D** opens the Earth site and its target side by side with real relief,
at the same horizontal scale and the same vertical exaggeration (×1.5). Both cameras orbit together, and
dragging, tilting or zooming one map moves the other.

- Earth relief: [Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen, AWS Open Data; SRTM in the Andes).
- Mars relief: [HRSC-MOLA Blended DEM 200 m v2](https://astrogeology.usgs.gov/search/map/mars_mgs_mola_mex_hrsc_blended_dem_global_200m)
  (USGS Astrogeology, ESA Mars Express, NASA MGS) around each target and, at Jezero, the
  [Mars 2020 TRN CTX DTM, 20 m](https://astrogeology.usgs.gov/search/map/mars_2020_terrain_relative_navigation_context_camera_digital_terrain_model)
  and a 5 km window of the [Mars 2020 TRN HiRISE DTM, 1 m](https://astrogeology.usgs.gov/search/map/mars_2020_terrain_relative_navigation_hirise_dtm_mosaic)
  averaged to 3 m (USGS, NASA JPL, University of Arizona). `tools/mars_terrain.py` reads the targets from `analogs.json`, downloads only the
  needed windows and writes the grids and `manifest.json` to `public/terrain/mars/`. The browser turns the grids into
  terrain tiles (`src/map/planetTerrain.ts`).
- MapLibre draws every body with Earth's radius. To keep real proportions, the target map zooms out by
  `log2(R_body·cos φ_body / R_earth·cos φ_earth)` and its relief is multiplied by `R_earth / R_body` (`src/lib/terrain.ts`).
- Anywhere else on Mars or the Moon (free pins, or a target outside the manifest), the browser reads the
  global USGS models directly from their public S3 bucket with HTTP range requests, row by row, without
  downloading the whole file (`src/map/usgsDem.ts`): the [HRSC-MOLA Blended DEM 200 m v2](https://astrogeology.usgs.gov/search/map/mars_mgs_mola_mex_hrsc_blended_dem_global_200m)
  for Mars and the [LRO LOLA – SELENE Kaguya TC DEM Merge 60N60S, 59 m](https://astrogeology.usgs.gov/search/map/moon_lro_lola_selene_kaguya_tc_dem_merge_60n60s_59m)
  for the Moon (between 60° N and 60° S). Both files are uncompressed Int16 GeoTIFFs with one row per strip;
  their layout and scale (1 m and 0.5 m per unit) were checked against the file headers and ISIS labels.
- The 3D view has three layouts: **side by side**, **swipe** (one map over the other with a draggable
  divider) and **overlay** (the target over Earth with adjustable opacity). Stacked, both maps also pan together
  by the same real metres. In every layout, **Color by body** paints each image's own brightness in blue (Earth)
  or orange (the target); in the overlay the two add up, so ground that is bright on both sides shows white.
  **Animate** sweeps the divider or the opacity back and forth. Only the display color changes, not the data.
- **Free pin (pilot)**: a pin anywhere on Earth and one on Mars or the Moon. Slope and relief are measured
  inside the same radius with the same sampling step (the coarser of the two models). Pins can also be opened
  in 3D. For any point on Mars, the panel also lists the Earth sites with the most similar **terrain**: the
  browser measures the point as the tools measure the targets (200 m step, 5 km circle) and applies the same
  scale and weights as `tools/build_analogs.py` to the terrain dimensions only (`src/lib/terrainMatch.ts`).
  It is the only comparison the app computes, and it is labelled as terrain-only.
- In relief view, each evaluated site also rises as a column whose height and color are its score.
- **Compare** layers, computed in the browser from the same real terrain shown and drawn with the same color
  ramp on both maps (`src/map/reliefLens.ts`): **Slope** (degrees) and **Relative relief** (metres above or below
  the centre of each site, so landforms can be compared even though absolute altitudes differ by kilometres).
- **Conditions** panel: every dimension grouped as alike (score ≥ 66), partly alike (33–65), not alike (< 33) or
  without data, with both measured values, plus the site's limits and the general limits of the analogy.
- The previous and next buttons, or the site menu, move through the ranking without leaving the 3D view.
- **Rover route**: the real Perseverance traverse and stops (NASA/JPL MMGIS, sols 14 to 2022, 46 km) draped on
  the Jezero terrain, and the same route moved to the Earth site at the same scale and bearing as a labelled
  simulation (`src/lib/route.ts`). A profile every 100 m compares elevation, total climb, steepest segment and
  share of steep ground, next to the rover's real tilt at its stops. `tools/mars_tracks.py` prepares the route
  (run it after `tools/mars_terrain.py`).
- **3D tour**: eight captioned steps (overview, close-up, swipe, overlay, slope, relative relief, rover route,
  conditions) for presenting or recording the demo.
