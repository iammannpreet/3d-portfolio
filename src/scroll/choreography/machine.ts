import { HOTSPOT_IDS, type HotspotId } from '../../chapters'
import { ON_BIKE } from '../presets'
import type { ChapterScript, Keyframe, Vec3 } from '../types'

const FIRST_STOP = 0.07
const STOP_STEP = 0.15
const STOP_HOLD = 0.105

export interface MachineStop {
  id: HotspotId
  /** Chapter progress at which the camera has settled on this part. */
  from: number
  /** Chapter progress at which the camera starts to leave. */
  to: number
}

/** When the camera is parked on each part. The DOM panels use the same windows. */
export const MACHINE_STOPS: readonly MachineStop[] = HOTSPOT_IDS.map((id, i) => ({
  id,
  from: FIRST_STOP + i * STOP_STEP,
  to: FIRST_STOP + i * STOP_STEP + STOP_HOLD,
}))

interface Pose {
  azimuth: number
  polar: number
  distance: number
  target: Vec3
}

/**
 * One camera pose per part. Together they make a single clockwise orbit of the bike, starting and
 * ending at the front-right three-quarter view. Starting values; tuned against renders.
 */
const POSES: Record<HotspotId, Pose> = {
  engine: { azimuth: 0.15, polar: 1.5, distance: 2.5, target: [0.05, 0.45, 0] },
  drivetrain: { azimuth: -0.75, polar: 1.48, distance: 2.4, target: [-0.55, 0.35, 0] },
  frame: { azimuth: -2.35, polar: 1.3, distance: 3.0, target: [0, 0.55, 0] },
  tank: { azimuth: -3.5, polar: 1.05, distance: 2.3, target: [0.25, 0.8, 0] },
  cockpit: { azimuth: -4.55, polar: 1.0, distance: 2.0, target: [0.55, 0.9, 0] },
  brakes: { azimuth: -5.6, polar: 1.52, distance: 2.2, target: [0.75, 0.32, 0] },
}

/** How far the camera keeps drifting while parked, so a stop never looks frozen. */
const DRIFT = 0.07

const stopFrames: Keyframe[] = MACHINE_STOPS.flatMap((stop) => {
  const pose = POSES[stop.id]
  return [
    {
      at: stop.from,
      label: `arrive: ${stop.id}`,
      state: {
        camAzimuth: pose.azimuth + DRIFT / 2,
        camPolar: pose.polar,
        camDistance: pose.distance,
        camTarget: pose.target,
      },
    },
    {
      at: stop.to,
      ease: 'linear',
      label: `leave: ${stop.id}`,
      state: { camAzimuth: pose.azimuth - DRIFT / 2 },
    },
  ]
})

/** 2: the camera orbits the parked bike and stops at six parts. Panels sit on the right. */
export const machine: ChapterScript = {
  chapter: 'the-machine',
  length: { desktop: 620, mobile: 660 },
  frames: [
    {
      at: 0,
      label: 'establishing three-quarter view',
      state: {
        ...ON_BIKE,
        camAzimuth: 0.7,
        camPolar: 1.38,
        camDistance: 4.1,
        camShiftX: -0.17,
      },
      portrait: { camShiftY: 0.17 },
    },
    ...stopFrames,
    {
      at: 1,
      label: 'pull back out',
      state: {
        camAzimuth: -5.9,
        camPolar: 1.4,
        camDistance: 3.8,
        camTarget: [0, 0.55, 0],
      },
    },
  ],
}
