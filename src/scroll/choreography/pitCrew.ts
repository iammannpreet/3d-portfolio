import { ON_BIKE } from '../presets'
import type { ChapterScript } from '../types'

/** 5: the bike dims and drops back so the testimonials carry the screen. */
export const pitCrew: ChapterScript = {
  chapter: 'pit-crew',
  length: { desktop: 160, mobile: 180 },
  frames: [
    {
      at: 0,
      label: 'dimmed, pulled back',
      state: {
        ...ON_BIKE,
        mood: 1,
        stars: 1,
        garage: 0.5,
        gate: 9,
        exposure: 0.4,
        bloom: 0.5,
        camAzimuth: -0.4,
        camPolar: 1.2,
        camDistance: 5.6,
      },
    },
    { at: 1, ease: 'linear', label: 'drift', state: { camAzimuth: -0.7 } },
  ],
}
