import { ON_BIKE } from '../presets'
import type { ChapterScript } from '../types'

/**
 * Timing shared with the DOM overlay. All values are chapter progress, 0..1.
 * - blackoutAt: the visor is fully closed from here.
 * - boot: the HUD boot log types out across this window.
 * - openAt: the visor is fully open again; the rider profile panel may appear.
 */
export const VISOR_BEATS = {
  blackoutAt: 0.44,
  boot: [0.5, 0.64] as [number, number],
  openAt: 0.82,
}

/**
 * 1: the helmet turns, tips and grows over the camera (the 2024 "transform", now scrubbed),
 * the screen blacks out, the HUD boots, and the visor opens on the bike.
 */
export const visorDown: ChapterScript = {
  chapter: 'visor-down',
  length: { desktop: 300, mobile: 280 },
  frames: [
    {
      at: 0,
      label: 'centre the helmet',
      state: {
        camAzimuth: 0.2,
        camDistance: 1.05,
        camPolar: 1.4,
        camShiftX: 0,
        ringOpacity: 0.4,
      },
      portrait: { camDistance: 1.25, camShiftY: 0.08 },
    },
    {
      at: 0.36,
      ease: 'in',
      label: 'helmet swings over the camera',
      state: {
        helmetRot: [-1.4, Math.PI, 0],
        helmetScale: 5.6,
        helmetPos: [0, 0.3, 0.55],
        helmetSpin: 0,
        ringOpacity: 0,
        camAzimuth: 0,
        camPolar: 1.5,
      },
    },
    {
      at: VISOR_BEATS.blackoutAt,
      ease: 'in',
      label: 'blackout',
      state: { visor: 1, exposure: 0.2 },
    },
    {
      at: VISOR_BEATS.boot[0],
      ease: 'hold',
      label: 'cut to the bike while the screen is black',
      state: {
        ...ON_BIKE,
        engine: 0,
        bloom: 0.6,
        exposure: 0.55,
        visor: 1,
        helmetScale: 1,
        helmetRot: [0, 0, 0],
        helmetPos: [0, 0.27, 0],
        camAzimuth: 0.95,
        camPolar: 1.36,
        camDistance: 4.6,
        camShiftX: 0,
      },
    },
    {
      at: VISOR_BEATS.boot[1],
      ease: 'linear',
      label: 'boot log finishes',
      state: { visor: 1 },
    },
    {
      at: VISOR_BEATS.openAt,
      ease: 'out',
      label: 'visor opens, lights ignite',
      state: { visor: 0, engine: 1, exposure: 1, bloom: 1 },
    },
    {
      at: 1,
      label: 'push in for the rider profile',
      state: { camAzimuth: 0.7, camDistance: 4.1, camShiftX: -0.17 },
      portrait: { camShiftY: 0.17 },
    },
  ],
}
