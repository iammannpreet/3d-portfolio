# The Ride

The portfolio of Manpreet Singh, backend software engineer, built as one continuous motorcycle ride. Scrolling drives a 3D scene behind ordinary, readable HTML:

| Gear | Chapter | What happens |
|---|---|---|
| N | Gear up | A helmet turns on a mirror floor at dusk, skill names orbiting it |
| 1 | Visor down | The helmet comes down over the camera, the HUD boots, the visor lifts on the bike |
| 2 | The machine | The camera stops at six parts of the bike, each standing for part of the stack |
| 3 | The road so far | The bike rides at night; a neon gate passes for each milestone |
| 4 | In the garage | The bike parks under the lights; the projects slide past |
| 5 | Pit crew | What colleagues say |
| 6 | Kickstand down | The helmet goes back on the seat; how to get in touch |

Scrolling back rewinds everything exactly: the road, the gates and the wheels are driven by scroll position, not by time.

## Running it

Needs Node 22.12 or later.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # typecheck, then production build in dist/
npm run preview      # serve the build
```

Checks:

```bash
npm run typecheck
npm run lint
npm run test         # unit tests for the scroll choreography
npm run test:e2e     # Playwright smoke tests against the production build (uses Google Chrome)
npm run shots -- --sheet   # screenshots of every chapter into shots/, with a contact sheet
```

Useful URL switches: `?debug` exposes `window.__ride` in the console, `?tier=low` forces the lighter graphics tier, `?motion=reduced` turns motion off, `?webgl=off` shows the fallback without a 3D scene.

## Editing the content

Everything the site says is in [`src/content/site.ts`](src/content/site.ts): profile, the stack grouped by bike part, experience, projects, testimonials, links and credits. Nothing else needs to change when the content does.

- Projects show only when `featured: true`.
- The **My ride** chapter (your bike, photos and favourite routes) stays hidden until you set `ride.enabled: true` and fill in the `ride` block.
- Project images live in `src/assets/projects/` as WebP.

## How it works

- **Chapters** (`src/chapters.ts`, `src/sections/`): each chapter is a tall section with a sticky, full-screen stage. Its progress (0 to 1) is exposed as the CSS variable `--p`, and `<Reveal from to>` shows content inside a progress window.
- **Choreography** (`src/scroll/choreography/`): one keyframe script per chapter sets the camera orbit, the helmet and bike poses, lighting mood, road speed and so on. `src/scroll/sampler.ts` interpolates them for any scroll position; unit tests cover it.
- **Engine** (`src/scroll/engine.ts`): Lenis smooths the scroll; one loop measures the chapters, samples the choreography and drives the reveals. It runs with or without WebGL.
- **Scene** (`src/scene/`): React Three Fiber. Lighting is procedural (no HDRI downloads), with a sky, stars, fog, a mirror floor, the road, bloom and ACES tone mapping. A performance monitor drops to a lighter tier when frames are slow.
- **HUD** (`src/hud/`): gear-indicator navigation, speedo, leader lines from bike parts to their panels, the loader and the visor overlay.

Accessibility: content hidden between scroll windows stays readable by screen readers, and keyboard focus scrolls hidden content into view. Reduced motion (system setting or the HUD toggle) turns off smoothing and camera travel. Without WebGL the page shows a static backdrop and every section still reads.

## 3D models

The originals are in `models-src/` and are not shipped. `npm run optimize:models` rebuilds `src/assets/models/`:

- textures resized and re-encoded as WebP, geometry compressed with meshopt
- the bike's wheels are split out of its merged mesh (`scripts/lib/split-wheels.mjs`) so they can turn
- bike 43.5 MB to 2.7 MB (1.9 MB for the low tier); helmet 11.2 MB to 0.66 MB

Both models are licensed CC BY 4.0 and credited in the site footer:

- [Cyberpunk Bike Concept Design](https://sketchfab.com/3d-models/cyberpunk-bike-concept-design-99290272e69d4cd8a56af2d2e1274e0d) by [Berk Gedik](https://sketchfab.com/berkgedik)
- [Black helmet](https://sketchfab.com/3d-models/black-helmet-fb2230b152824463a75e903d38d035a8) by [3DWorkbench](https://sketchfab.com/3DWorkbench)

## Deploying

`netlify.toml` builds with `npm run build` and publishes `dist/`, with long-lived caching for the hashed assets.
