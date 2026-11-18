import type { ChapterId } from '../chapters'

export type Vec3 = [number, number, number]

/**
 * World conventions the whole scene shares
 * ----------------------------------------
 * - Units are metres. +Y is up. The ground is the plane y = 0.
 * - The bike is normalised to 2.1 m long, standing on the ground, centred on the origin in X and Z,
 *   and FACING +X.
 * - The helmet is normalised to 0.30 m tall, centred on its own origin, visor FACING +Z.
 * - Camera azimuth 0 puts the camera on the +Z side looking toward -Z, so the bike is seen in right
 *   profile facing screen-right. Azimuth +PI/2 is a head-on front view, -PI/2 is from behind,
 *   +-PI is the left profile. Azimuth is never wrapped, so a full orbit is written as a 2*PI change.
 */

/** Numeric rig channels. Every channel is interpolated between keyframes. */
export interface RigNumbers {
  /** Camera orbit angle around +Y through `camTarget`, radians. See conventions above. */
  camAzimuth: number
  /** Camera angle down from +Y, radians. PI/2 is level with the target; smaller looks down on it. */
  camPolar: number
  /** Camera distance from `camTarget`, metres. */
  camDistance: number
  /** Vertical field of view, degrees. */
  camFov: number
  /** Camera roll around its view axis, radians. */
  camRoll: number
  /**
   * Lens shift: moves the subject on screen without changing perspective, as a fraction of the
   * viewport width. +0.2 puts the subject 20% of the viewport right of centre.
   */
  camShiftX: number
  /** Lens shift as a fraction of viewport height. Positive moves the subject up. */
  camShiftY: number

  /**
   * Helmet rendered when > 0.5. This is a switch, not a fade: between two keyframes the helmet is
   * drawn only if BOTH keyframes show it. To bring it in gracefully, show it at a keyframe with a
   * tiny `helmetScale` and grow it by the next keyframe.
   */
  helmetShow: number
  /** Multiplier on the helmet's real size (1 = 0.30 m tall). */
  helmetScale: number
  /** 0..1 amount of the slow idle spin around +Y. */
  helmetSpin: number
  /** 0..1 opacity of the orbiting skill-name rings. */
  ringOpacity: number

  /** Bike rendered when > 0.5. Same switch semantics as `helmetShow`. */
  bikeShow: number
  /** Bike heading around +Y, radians. 0 = facing +X. */
  bikeYaw: number
  /** Bike roll, radians. Positive leans toward the camera at azimuth 0 (+Z). */
  bikeLean: number
  /** Multiplier on the bike's real size (1 = 2.1 m long). */
  bikeScale: number
  /** 0..1 engine running: emissive lights, idle vibration, headlight. */
  engine: number

  /** 0..1 road speed: lane markings, light streaks, wheel spin. */
  speed: number
  /** 0 = studio mirror floor, 1 = open road. */
  road: number
  /**
   * Which milestone gate is level with the bike. An integer n means gate n is exactly at the bike;
   * n + 0.5 means the bike is halfway between gate n and gate n + 1.
   */
  gate: number
  /** 0 = dusk, 1 = night. */
  mood: number
  /** 0..1 garage overhead lights. */
  garage: number
  /** 0..1 star field visibility. */
  stars: number
  /** Bloom intensity. */
  bloom: number
  /** Exposure multiplier. 1 is normal; lower dims the whole scene. */
  exposure: number
  /** 0..1 fog amount. */
  fog: number

  /** 0 = visor open, 1 = closed (the DOM overlay blacks out the scene). */
  visor: number
  /** 0..1 opacity of the HUD chrome. */
  hud: number
}

export interface RigVectors {
  /** World-space point the camera looks at. */
  camTarget: Vec3
  /** Helmet centre in world space. */
  helmetPos: Vec3
  /** Helmet rotation, Euler XYZ in radians, applied on top of the idle spin. */
  helmetRot: Vec3
  /** Bike ground-contact centre in world space. */
  bikePos: Vec3
}

export type RigState = RigNumbers & RigVectors
export type RigPatch = Partial<RigNumbers> & Partial<RigVectors>

export const NUM_FIELDS = [
  'camAzimuth',
  'camPolar',
  'camDistance',
  'camFov',
  'camRoll',
  'camShiftX',
  'camShiftY',
  'helmetShow',
  'helmetScale',
  'helmetSpin',
  'ringOpacity',
  'bikeShow',
  'bikeYaw',
  'bikeLean',
  'bikeScale',
  'engine',
  'speed',
  'road',
  'gate',
  'mood',
  'garage',
  'stars',
  'bloom',
  'exposure',
  'fog',
  'visor',
  'hud',
] as const satisfies readonly (keyof RigNumbers)[]

export const VEC_FIELDS = [
  'camTarget',
  'helmetPos',
  'helmetRot',
  'bikePos',
] as const satisfies readonly (keyof RigVectors)[]

// Compile-time check that the two lists above cover every channel.
type MissingNum = Exclude<keyof RigNumbers, (typeof NUM_FIELDS)[number]>
type MissingVec = Exclude<keyof RigVectors, (typeof VEC_FIELDS)[number]>
export const ALL_FIELDS_LISTED: [MissingNum, MissingVec] extends [never, never] ? true : false = true

/**
 * Easing applied on the way INTO a keyframe from the one before it.
 * `hold` keeps the previous values until the keyframe is reached, then cuts.
 */
export type EaseName = 'linear' | 'in' | 'out' | 'inOut' | 'expoInOut' | 'hold'

export interface Keyframe {
  /**
   * Position inside the chapter, 0..1. 0 is the moment the chapter's stage sticks to the top of
   * the viewport, 1 is the moment it releases. The viewport-height of scrolling between one
   * chapter's 1 and the next chapter's 0 is interpolated automatically.
   */
  at: number
  /** Easing into this keyframe. Defaults to `inOut`. */
  ease?: EaseName
  /** Channels set at this keyframe. Channels left out keep the value of the previous keyframe. */
  state?: RigPatch
  /**
   * Overrides for portrait viewports (phones). See `resolveFrames` for how the portrait track
   * inherits from `state`.
   */
  portrait?: RigPatch
  /** Optional note for humans; not used at runtime. */
  label?: string
}

export interface ChapterScript {
  chapter: ChapterId
  /** Section height in `svh` units. The stage is 100svh, so sticky travel is length - 100. */
  length: { desktop: number; mobile: number }
  frames: Keyframe[]
}

/** Where a chapter sits in the document, in CSS pixels. */
export interface ChapterRange {
  id: ChapterId
  /** Document offset at which the chapter's stage sticks. */
  top: number
  /** Pixels of scrolling for which the stage stays stuck. */
  travel: number
}

export interface ResolvedFrame {
  /** Absolute scroll position of this keyframe, CSS pixels. */
  y: number
  ease: EaseName
  state: RigState
  chapter: ChapterId
}
