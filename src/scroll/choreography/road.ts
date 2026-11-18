import { ON_BIKE } from '../presets'
import type { ChapterScript, Keyframe } from '../types'

const FIRST_BEAT = 0.14
const LAST_BEAT = 0.88

export interface RoadBeat {
  /** Chapter progress at which this milestone's gate is level with the bike. */
  at: number
  /** The milestone card is shown across from..to. */
  from: number
  to: number
}

/** Spreads `count` milestones evenly along the road. The DOM cards use the same windows. */
export function roadBeats(count: number): RoadBeat[] {
  if (count <= 0) return []
  const step = count === 1 ? 0 : (LAST_BEAT - FIRST_BEAT) / (count - 1)
  const half = count === 1 ? 0.2 : step * 0.42
  return Array.from({ length: count }, (_, i) => {
    const at = count === 1 ? 0.5 : FIRST_BEAT + step * i
    return { at, from: at - half, to: at + half }
  })
}

/**
 * 3: the bike rides. The camera starts in a low chase from behind, swings out to a side tracking
 * shot and ends ahead of the bike looking back at the headlight. One gate passes per milestone.
 */
export function road(milestoneCount: number): ChapterScript {
  const beats = roadBeats(milestoneCount)
  const last = Math.max(1, beats.length - 1)

  const beatFrames: Keyframe[] = beats.map((beat, i) => {
    const t = i / last
    return {
      at: beat.at,
      ease: 'linear',
      label: `milestone ${i + 1}`,
      state: {
        gate: i,
        // Rear-right chase (-1.25) round to front-right (0.95).
        camAzimuth: -1.25 + 2.2 * t,
        camPolar: 1.47 - 0.05 * Math.sin(t * Math.PI),
        camDistance: 4.0 + 0.5 * Math.sin(t * Math.PI),
        bikeLean: 0.1 * Math.sin(t * Math.PI * 2),
        mood: 0.3 + 0.7 * t,
        stars: 0.6 + 0.4 * t,
      },
    }
  })

  return {
    chapter: 'the-road',
    length: { desktop: 560, mobile: 600 },
    frames: [
      {
        at: 0,
        label: 'pulling away',
        state: {
          ...ON_BIKE,
          speed: 0,
          road: 0.2,
          gate: -0.7,
          camAzimuth: -1.05,
          camPolar: 1.42,
          camDistance: 4.4,
          camShiftX: -0.12,
        },
        portrait: { camShiftY: 0.23 },
      },
      {
        at: 0.07,
        ease: 'in',
        label: 'up to speed',
        state: { speed: 1, road: 1, gate: -0.35, camAzimuth: -1.25, camPolar: 1.47, camDistance: 4.0 },
      },
      ...beatFrames,
      {
        at: 1,
        ease: 'linear',
        label: 'easing off',
        state: { speed: 0.7, gate: beats.length - 1 + 0.65, bikeLean: 0 },
      },
    ],
  }
}
