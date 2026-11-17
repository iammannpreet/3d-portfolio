import { ON_BIKE, PARKED_GATE } from '../presets'
import type { ChapterScript } from '../types'

/** Optional chapter: a clean profile shot behind the real-bike content. */
export const myRide: ChapterScript = {
  chapter: 'my-ride',
  length: { desktop: 200, mobile: 220 },
  frames: [
    {
      at: 0,
      label: 'profile',
      state: {
        ...ON_BIKE,
        mood: 1,
        stars: 1,
        garage: 1,
        gate: PARKED_GATE,
        camAzimuth: 0.05,
        camPolar: 1.5,
        camDistance: 3.7,
        camShiftX: -0.16,
      },
      portrait: { camShiftY: 0.2 },
    },
    { at: 1, ease: 'linear', label: 'drift', state: { camAzimuth: -0.25 } },
  ],
}
