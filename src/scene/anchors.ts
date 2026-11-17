import type { HotspotId } from '../chapters'
import type { Vec3 } from '../scroll/types'

/**
 * Landmarks on the bike, measured on the normalised model (metres; origin on the ground under the
 * middle of the bike; front faces +X; the bike's right side is +Z).
 */

/** Where each leader line lands in The machine. */
export const HOTSPOT_ANCHORS: Record<HotspotId, Vec3> = {
  // The finned cylinders, right side.
  engine: [0.13, 0.62, 0.11],
  // The yellow swingarm that carries drive to the rear hub, right side.
  drivetrain: [-0.48, 0.4, 0.18],
  // The steel spine everything bolts to, seen from the rear left.
  frame: [-0.08, 0.86, -0.12],
  // The filler cap on top of the slab.
  tank: [0.33, 0.965, 0],
  // Handlebar clamp, between the grips.
  cockpit: [0.47, 0.86, 0],
  // Front hub, right side.
  brakes: [0.68, 0.365, 0.12],
}

export const BIKE = {
  length: 2.1,
  /** Both wheels are the same size. */
  wheelRadius: 0.362,
  frontAxle: [0.681, 0.365, 0] as Vec3,
  rearAxle: [-0.685, 0.365, 0] as Vec3,
  /** Centre of the three round lamps in the nose; they point along +X. */
  headlight: [0.77, 0.87, 0.02] as Vec3,
  /** Rear end of the seat, where a tail light would sit. */
  tail: [-0.6, 0.83, 0] as Vec3,
  seatTop: [-0.36, 0.89, 0] as Vec3,
}

export const HELMET = {
  height: 0.3,
}
