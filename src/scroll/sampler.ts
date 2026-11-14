import { EASES, clamp01 } from './math'
import {
  NUM_FIELDS,
  VEC_FIELDS,
  type ChapterRange,
  type ChapterScript,
  type ResolvedFrame,
  type RigPatch,
  type RigState,
} from './types'

/**
 * On portrait viewports the horizontal field of view is much narrower, so a camera distance
 * authored for landscape is multiplied by this unless the keyframe gives a `portrait.camDistance`.
 */
export const PORTRAIT_DISTANCE_SCALE = 1.55

/** Channels that act as on/off switches (drawn when > 0.5). They are never faded or damped. */
export const FLAG_FIELDS = ['helmetShow', 'bikeShow'] as const

export function createRigState(): RigState {
  const state = {} as RigState
  for (const f of NUM_FIELDS) state[f] = 0
  for (const f of VEC_FIELDS) state[f] = [0, 0, 0]
  return state
}

export function copyRig(src: RigState, dst: RigState): RigState {
  for (const f of NUM_FIELDS) dst[f] = src[f]
  for (const f of VEC_FIELDS) {
    const s = src[f]
    const d = dst[f]
    d[0] = s[0]
    d[1] = s[1]
    d[2] = s[2]
  }
  return dst
}

export function cloneRig(src: RigState): RigState {
  return copyRig(src, createRigState())
}

export function applyPatch(dst: RigState, patch: RigPatch | undefined): RigState {
  if (!patch) return dst
  for (const f of NUM_FIELDS) {
    const v = patch[f]
    if (v !== undefined) dst[f] = v
  }
  for (const f of VEC_FIELDS) {
    const v = patch[f]
    if (v !== undefined) {
      const d = dst[f]
      d[0] = v[0]
      d[1] = v[1]
      d[2] = v[2]
    }
  }
  return dst
}

/** out = a + (b - a) * t for every channel. `out` may be `a` or `b`. */
export function mixRig(a: RigState, b: RigState, t: number, out: RigState): RigState {
  for (const f of NUM_FIELDS) out[f] = a[f] + (b[f] - a[f]) * t
  for (const f of VEC_FIELDS) {
    const va = a[f]
    const vb = b[f]
    const vo = out[f]
    vo[0] = va[0] + (vb[0] - va[0]) * t
    vo[1] = va[1] + (vb[1] - va[1]) * t
    vo[2] = va[2] + (vb[2] - va[2]) * t
  }
  return out
}

/**
 * Turns the authored chapter scripts into a flat list of keyframes at absolute scroll positions.
 *
 * Rules:
 * - Chapters with no measured range (not on the page) are skipped.
 * - Every chapter starts from `base`. Channels a keyframe leaves out keep the value from the
 *   previous keyframe OF THE SAME CHAPTER, so each chapter script stands on its own.
 * - Two tracks run in parallel, landscape and portrait. `state` writes both. `portrait` writes
 *   only the portrait track and its values persist until `state` or `portrait` sets that channel
 *   again. Two portrait defaults are derived from `state`: `camDistance` is multiplied by
 *   PORTRAIT_DISTANCE_SCALE and `camShiftX` becomes 0.
 * - `portraitMix` (0 = landscape, 1 = portrait) blends the two tracks.
 */
export function resolveFrames(
  scripts: readonly ChapterScript[],
  ranges: readonly ChapterRange[],
  portraitMix: number,
  base: RigState,
): ResolvedFrame[] {
  const byId = new Map(ranges.map((r) => [r.id, r]))
  const mix = clamp01(portraitMix)
  const frames: ResolvedFrame[] = []
  const land = createRigState()
  const port = createRigState()
  let lastY = -Infinity

  for (const script of scripts) {
    const range = byId.get(script.chapter)
    if (!range) continue
    copyRig(base, land)
    copyRig(base, port)

    for (const kf of script.frames) {
      applyPatch(land, kf.state)
      applyPatch(port, kf.state)
      if (kf.state?.camDistance !== undefined) {
        port.camDistance = kf.state.camDistance * PORTRAIT_DISTANCE_SCALE
      }
      if (kf.state?.camShiftX !== undefined) port.camShiftX = 0
      applyPatch(port, kf.portrait)

      const y = Math.max(lastY, range.top + clamp01(kf.at) * Math.max(0, range.travel))
      lastY = y
      frames.push({
        y,
        ease: kf.ease ?? 'inOut',
        state: mixRig(land, port, mix, createRigState()),
        chapter: script.chapter,
      })
    }
  }
  return frames
}

/**
 * Writes the interpolated rig state for scroll position `y` into `out`.
 *
 * Returns the index of the keyframe at or before `y` (-1 before the first keyframe), which lets
 * the caller notice when a `hold` keyframe (a cut) has been crossed.
 *
 * With `snap` the state jumps between keyframes at the midpoint instead of travelling, which is
 * how reduced-motion mode avoids camera movement.
 */
export function sampleFrames(
  frames: readonly ResolvedFrame[],
  y: number,
  out: RigState,
  snap = false,
): number {
  const n = frames.length
  if (n === 0) return -1
  const first = frames[0]!
  const last = frames[n - 1]!
  if (y < first.y) {
    copyRig(first.state, out)
    return -1
  }
  if (y >= last.y) {
    copyRig(last.state, out)
    return n - 1
  }

  // Largest lo with frames[lo].y <= y. Invariant: frames[lo].y <= y < frames[hi].y.
  let lo = 0
  let hi = n - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (frames[mid]!.y <= y) lo = mid
    else hi = mid
  }
  const a = frames[lo]!
  const b = frames[hi]!
  const linear = (y - a.y) / (b.y - a.y)
  const t = b.ease === 'hold' ? 0 : snap ? (linear < 0.5 ? 0 : 1) : EASES[b.ease](linear)
  mixRig(a.state, b.state, t, out)
  // Visibility flags do not fade: an object is drawn between two keyframes only if both show it.
  // That keeps a model from popping in halfway through a transition at a half-interpolated pose.
  for (const f of FLAG_FIELDS) out[f] = Math.min(a.state[f], b.state[f])
  return lo
}

/** True when moving from keyframe index `from` to `to` crosses a `hold` keyframe (a cut). */
export function crossesCut(frames: readonly ResolvedFrame[], from: number, to: number): boolean {
  if (from === to) return false
  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  for (let i = lo + 1; i <= hi; i++) {
    if (frames[i]?.ease === 'hold') return true
  }
  return false
}

/** Moves every channel of `live` toward `target` with frame-rate independent damping. */
export function dampRig(live: RigState, target: RigState, lambda: number, dt: number): void {
  const k = 1 - Math.exp(-lambda * dt)
  for (const f of NUM_FIELDS) live[f] += (target[f] - live[f]) * k
  for (const f of FLAG_FIELDS) live[f] = target[f]
  for (const f of VEC_FIELDS) {
    const l = live[f]
    const t = target[f]
    l[0] += (t[0] - l[0]) * k
    l[1] += (t[1] - l[1]) * k
    l[2] += (t[2] - l[2]) * k
  }
}

/** Throws if a script's keyframes are not in ascending order or fall outside 0..1. */
export function validateScript(script: ChapterScript): void {
  let prev = -Infinity
  if (script.frames.length === 0) throw new Error(`${script.chapter}: no keyframes`)
  for (const [i, kf] of script.frames.entries()) {
    if (!(kf.at >= 0 && kf.at <= 1)) {
      throw new Error(`${script.chapter}: keyframe ${i} has at=${kf.at}, expected 0..1`)
    }
    if (kf.at < prev) {
      throw new Error(`${script.chapter}: keyframe ${i} (at=${kf.at}) comes before at=${prev}`)
    }
    prev = kf.at
  }
}
