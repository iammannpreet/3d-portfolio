import { ON_BIKE } from '../presets'
import type { ChapterScript } from '../types'

/** 6: lights back up, the helmet returns above the seat. Contact copy sits on the left. */
export const kickstandDown: ChapterScript = {
  chapter: 'kickstand-down',
  length: { desktop: 190, mobile: 210 },
  frames: [
    {
      at: 0,
      label: 'helmet appears small',
      state: {
        ...ON_BIKE,
        mood: 1,
        stars: 1,
        garage: 0.7,
        gate: 9,
        helmetShow: 1,
        helmetSpin: 1,
        helmetScale: 0.01,
        helmetPos: [0.1, 1.15, 0],
        camTarget: [0, 0.62, 0],
        camAzimuth: 0.5,
        camPolar: 1.42,
        camDistance: 4.2,
        camShiftX: 0.18,
      },
      portrait: { camShiftY: 0.2 },
    },
    { at: 0.3, ease: 'out', label: 'helmet full size', state: { helmetScale: 1 } },
    { at: 1, ease: 'linear', label: 'drift', state: { camAzimuth: 0.3, camDistance: 3.9 } },
  ],
}
