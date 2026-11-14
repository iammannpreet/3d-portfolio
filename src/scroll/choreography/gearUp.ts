import type { ChapterScript } from '../types'

/** N: the helmet alone on the mirror floor, skill rings orbiting. Copy sits on the left. */
export const gearUp: ChapterScript = {
  chapter: 'gear-up',
  length: { desktop: 170, mobile: 160 },
  frames: [
    {
      at: 0,
      label: 'hero',
      state: { camShiftX: 0.2, camAzimuth: -0.15 },
      portrait: { camDistance: 1.35, camShiftY: 0.16 },
    },
    {
      at: 1,
      label: 'slow drift in',
      state: { camAzimuth: 0.2, camDistance: 1.05, camPolar: 1.4 },
      portrait: { camDistance: 1.25 },
    },
  ],
}
