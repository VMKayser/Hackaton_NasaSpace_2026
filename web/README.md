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

The app state lives in the URL (`?purpose=&target=&site=&view=&lang=`), so every view can be shared.
