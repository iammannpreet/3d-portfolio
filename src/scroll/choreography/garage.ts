import { ON_BIKE, PARKED_GATE } from '../presets'
import type { ChapterScript } from '../types'

/** Chapter progress by which the bike has stopped and the garage lights are on. */
export const GARAGE_PARKED_AT = 0.14

/** 4: the bike slows, parks and the overhead lights come on. Project cards run along the bottom. */
export const garage: ChapterScript = {
  chapter: 'the-garage',
  length: { desktop: 330, mobile: 440 },
  frames: [
    {
      at: 0,
      label: 'rolling in',
      state: {
        ...ON_BIKE,
        mood: 1,
        stars: 1,
        speed: 0.45,
        road: 0.8,
        gate: PARKED_GATE - 0.22,
        camAzimuth: 0.95,
        camPolar: 1.44,
        camDistance: 4.3,
      },
    },
    {
      at: GARAGE_PARKED_AT,
      ease: 'out',
      label: 'parked, lights on',
      state: {
        speed: 0,
        road: 0,
        gate: PARKED_GATE,
        garage: 1,
        camAzimuth: 0.62,
        camPolar: 1.4,
        camDistance: 5.2,
        camShiftY: 0.2,
      },
      portrait: { camShiftY: 0.24 },
    },
    {
      at: 1,
      ease: 'linear',
      label: 'slow drift while the cards scroll',
      state: { camAzimuth: 0.2 },
    },
  ],
}
