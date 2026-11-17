import { site } from '../content/site'
import type { RigPatch, RigState } from './types'

/** Where the bike stops after the road: just past the last milestone gate. */
export const PARKED_GATE = site.milestones.length

/**
 * The hero pose: the helmet alone on the mirror floor at dusk.
 * Every chapter script starts from this state, so a chapter only writes what it changes.
 */
export const BASE: RigState = {
  camTarget: [0, 0.27, 0],
  camAzimuth: 0,
  camPolar: 1.45,
  camDistance: 1.2,
  camFov: 40,
  camRoll: 0,
  camShiftX: 0,
  camShiftY: 0,

  helmetShow: 1,
  helmetPos: [0, 0.27, 0],
  helmetRot: [0, 0, 0],
  helmetScale: 1,
  helmetSpin: 1,
  ringOpacity: 1,

  bikeShow: 0,
  bikePos: [0, 0, 0],
  bikeYaw: 0,
  bikeLean: 0,
  bikeScale: 1,
  engine: 0,

  speed: 0,
  road: 0,
  gate: 0,
  mood: 0,
  garage: 0,
  stars: 0.35,
  bloom: 0.6,
  exposure: 1,
  fog: 0.3,

  visor: 0,
  hud: 0,
}

/**
 * Spread into the first keyframe of any chapter where the rider is on the bike:
 * helmet hidden, bike lit and running, HUD on, camera aimed at the middle of the bike.
 */
export const ON_BIKE: RigPatch = {
  helmetShow: 0,
  helmetSpin: 0,
  ringOpacity: 0,
  bikeShow: 1,
  engine: 1,
  hud: 1,
  camTarget: [0, 0.55, 0],
  camFov: 35,
  bloom: 0.9,
  stars: 0.6,
  mood: 0.3,
}
