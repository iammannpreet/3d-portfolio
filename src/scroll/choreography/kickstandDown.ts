import { ON_BIKE, PARKED_GATE } from '../presets'
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
        gate: PARKED_GATE,
        helmetShow: 1,
        helmetSpin: 0,
        helmetScale: 1,
        helmetPos: [-0.34, 3.4, 0.02],
        helmetRot: [0.08, 0.55, -0.06],
        camTarget: [0, 0.62, 0],
        camAzimuth: 0.5,
        camPolar: 1.42,
        camDistance: 4.2,
        camShiftX: 0.18,
      },
      portrait: { camShiftY: 0.2 },
    },
    {
      at: 0.32,
      ease: 'out',
      label: 'helmet set down on the seat',
      state: { helmetPos: [-0.34, 1.035, 0.02] },
    },
    { at: 1, ease: 'linear', label: 'drift', state: { camAzimuth: 0.3, camDistance: 3.9 } },
  ],
}
