import { describe, expect, it } from 'vitest'
import { CHAPTER_IDS } from '../../src/chapters'
import { SCRIPTS } from '../../src/scroll/choreography/index'
import { BASE } from '../../src/scroll/presets'
import {
  PORTRAIT_DISTANCE_SCALE,
  cloneRig,
  createRigState,
  crossesCut,
  dampRig,
  resolveFrames,
  sampleFrames,
  validateScript,
} from '../../src/scroll/sampler'
import {
  NUM_FIELDS,
  VEC_FIELDS,
  type ChapterRange,
  type ChapterScript,
  type RigState,
} from '../../src/scroll/types'

const VH = 1000

/** Stacks chapters the way the page does: each section is `length` svh tall with a 100svh stage. */
function layout(scripts: readonly ChapterScript[], skip: string[] = []): ChapterRange[] {
  let top = 0
  const ranges: ChapterRange[] = []
  for (const script of scripts) {
    if (skip.includes(script.chapter)) continue
    const height = (script.length.desktop / 100) * VH
    ranges.push({ id: script.chapter, top, travel: height - VH })
    top += height
  }
  return ranges
}

const A: ChapterScript = {
  chapter: 'gear-up',
  length: { desktop: 200, mobile: 200 },
  frames: [
    { at: 0, state: { camDistance: 2, camShiftX: 0.2, mood: 0 } },
    { at: 0.5, ease: 'linear', state: { camDistance: 4 }, portrait: { camShiftY: 0.3 } },
    { at: 1, ease: 'linear', state: { mood: 1 } },
  ],
}
const B: ChapterScript = {
  chapter: 'visor-down',
  length: { desktop: 300, mobile: 300 },
  frames: [
    { at: 0, state: { camDistance: 10, helmetShow: 1 } },
    { at: 0.5, ease: 'hold', state: { camDistance: 20, helmetShow: 0, bikeShow: 1 } },
    { at: 1, ease: 'linear', state: { camDistance: 30 } },
  ],
}

describe('resolveFrames', () => {
  const ranges = layout([A, B])

  it('places keyframes at absolute scroll positions', () => {
    const frames = resolveFrames([A, B], ranges, 0, BASE)
    // A is 2000px tall with 1000px of travel; B starts at 2000 with 2000px of travel.
    expect(frames.map((f) => f.y)).toEqual([0, 500, 1000, 2000, 3000, 4000])
  })

  it('inherits unspecified channels from the previous keyframe of the same chapter', () => {
    const frames = resolveFrames([A, B], ranges, 0, BASE)
    expect(frames[1]!.state.camShiftX).toBe(0.2)
    expect(frames[2]!.state.camDistance).toBe(4)
  })

  it('starts every chapter from the base state, not from the previous chapter', () => {
    const frames = resolveFrames([A, B], ranges, 0, BASE)
    // A ended with mood 1 and camShiftX 0.2; B never sets them, so it is back at base.
    expect(frames[3]!.state.mood).toBe(BASE.mood)
    expect(frames[3]!.state.camShiftX).toBe(BASE.camShiftX)
  })

  it('skips chapters that are not on the page', () => {
    const frames = resolveFrames([A, B], layout([A, B], ['gear-up']), 0, BASE)
    expect(frames).toHaveLength(3)
    expect(frames.every((f) => f.chapter === 'visor-down')).toBe(true)
    expect(frames[0]!.y).toBe(0)
  })

  it('derives the portrait track: distance scaled, horizontal shift dropped, overrides kept', () => {
    const frames = resolveFrames([A, B], ranges, 1, BASE)
    expect(frames[0]!.state.camDistance).toBeCloseTo(2 * PORTRAIT_DISTANCE_SCALE)
    expect(frames[0]!.state.camShiftX).toBe(0)
    expect(frames[1]!.state.camShiftY).toBe(0.3)
    // The portrait override persists to the next keyframe.
    expect(frames[2]!.state.camShiftY).toBe(0.3)
  })

  it('blends the two tracks by portraitMix', () => {
    const frames = resolveFrames([A, B], ranges, 0.5, BASE)
    expect(frames[0]!.state.camDistance).toBeCloseTo((2 + 2 * PORTRAIT_DISTANCE_SCALE) / 2)
    expect(frames[0]!.state.camShiftX).toBeCloseTo(0.1)
  })

  it('never lets keyframe positions go backwards', () => {
    const squashed: ChapterRange[] = [
      { id: 'gear-up', top: 0, travel: 0 },
      { id: 'visor-down', top: 0, travel: 0 },
    ]
    const ys = resolveFrames([A, B], squashed, 0, BASE).map((f) => f.y)
    expect([...ys].sort((a, b) => a - b)).toEqual(ys)
  })
})

describe('sampleFrames', () => {
  const frames = resolveFrames([A, B], layout([A, B]), 0, BASE)
  const out = createRigState()

  it('returns exact keyframe values at keyframe positions', () => {
    sampleFrames(frames, 500, out)
    expect(out.camDistance).toBe(4)
    sampleFrames(frames, 1000, out)
    expect(out.mood).toBe(1)
  })

  it('interpolates between keyframes', () => {
    sampleFrames(frames, 250, out)
    expect(out.camDistance).toBeCloseTo(3)
  })

  it('clamps before the first and after the last keyframe', () => {
    expect(sampleFrames(frames, -500, out)).toBe(-1)
    expect(out.camDistance).toBe(2)
    expect(sampleFrames(frames, 99999, out)).toBe(frames.length - 1)
    expect(out.camDistance).toBe(30)
  })

  it('interpolates across the gap between two chapters', () => {
    // A ends at y=1000 (camDistance 4), B starts at y=2000 (camDistance 10).
    sampleFrames(frames, 1500, out)
    expect(out.camDistance).toBeGreaterThan(4)
    expect(out.camDistance).toBeLessThan(10)
  })

  it('holds the previous values until a hold keyframe, then cuts', () => {
    sampleFrames(frames, 2999, out)
    expect(out.camDistance).toBe(10)
    sampleFrames(frames, 3000, out)
    expect(out.camDistance).toBe(20)
  })

  it('only shows a model between two keyframes that both show it', () => {
    // Between B[0] (helmet shown) and B[1] (helmet hidden): hidden. Bike likewise.
    sampleFrames(frames, 2500, out)
    expect(out.helmetShow).toBe(0)
    expect(out.bikeShow).toBe(0)
    // Between B[1] and B[2], both of which show the bike.
    sampleFrames(frames, 3500, out)
    expect(out.bikeShow).toBe(1)
    expect(out.helmetShow).toBe(0)
  })

  it('snaps at the midpoint instead of travelling when snap is on', () => {
    sampleFrames(frames, 200, out, true)
    expect(out.camDistance).toBe(2)
    sampleFrames(frames, 300, out, true)
    expect(out.camDistance).toBe(4)
  })

  it('reports crossing a cut', () => {
    const before = sampleFrames(frames, 2999, out)
    const after = sampleFrames(frames, 3001, out)
    expect(crossesCut(frames, before, after)).toBe(true)
    expect(crossesCut(frames, after, before)).toBe(true)
    const a = sampleFrames(frames, 100, out)
    const b = sampleFrames(frames, 600, out)
    expect(crossesCut(frames, a, b)).toBe(false)
  })

  it('handles an empty frame list', () => {
    const untouched = cloneRig(BASE)
    expect(sampleFrames([], 100, untouched)).toBe(-1)
    expect(untouched).toEqual(BASE)
  })
})

describe('dampRig', () => {
  it('converges on the target and does not overshoot', () => {
    const live = cloneRig(BASE)
    const target = cloneRig(BASE)
    target.camDistance = 10
    target.camTarget = [1, 2, 3]
    let previous = live.camDistance
    for (let i = 0; i < 600; i++) {
      dampRig(live, target, 9, 1 / 60)
      expect(live.camDistance).toBeGreaterThanOrEqual(previous)
      expect(live.camDistance).toBeLessThanOrEqual(10)
      previous = live.camDistance
    }
    expect(live.camDistance).toBeCloseTo(10, 4)
    expect(live.camTarget[2]).toBeCloseTo(3, 4)
  })

  it('switches visibility flags immediately', () => {
    const live = cloneRig(BASE)
    const target = cloneRig(BASE)
    target.helmetShow = 0
    target.bikeShow = 1
    dampRig(live, target, 9, 1 / 60)
    expect(live.helmetShow).toBe(0)
    expect(live.bikeShow).toBe(1)
  })
})

describe('the real choreography', () => {
  const ranges = layout(SCRIPTS, ['my-ride'])

  it('has one valid script per chapter, in page order', () => {
    expect(SCRIPTS.map((s) => s.chapter)).toEqual([...CHAPTER_IDS])
    for (const script of SCRIPTS) expect(() => validateScript(script)).not.toThrow()
  })

  it('gives every chapter room to scroll', () => {
    for (const script of SCRIPTS) {
      expect(script.length.desktop).toBeGreaterThan(100)
      expect(script.length.mobile).toBeGreaterThan(100)
    }
  })

  for (const mix of [0, 1]) {
    it(`stays finite and in range along the whole page (portraitMix ${mix})`, () => {
      const frames = resolveFrames(SCRIPTS, ranges, mix, BASE)
      const end = frames[frames.length - 1]!.y
      const out: RigState = createRigState()
      for (let y = -VH; y <= end + VH; y += 37) {
        sampleFrames(frames, y, out)
        for (const f of NUM_FIELDS) expect(Number.isFinite(out[f]), `${f} at y=${y}`).toBe(true)
        for (const f of VEC_FIELDS) {
          expect(out[f].every(Number.isFinite), `${f} at y=${y}`).toBe(true)
        }
        expect(out.camDistance, `camDistance at y=${y}`).toBeGreaterThan(0.2)
        expect(out.camPolar).toBeGreaterThan(0.05)
        expect(out.camPolar).toBeLessThan(Math.PI - 0.05)
        expect(out.camFov).toBeGreaterThan(10)
        expect(out.camFov).toBeLessThan(90)
        for (const f of ['visor', 'hud', 'mood', 'speed', 'road', 'engine', 'garage'] as const) {
          expect(out[f], `${f} at y=${y}`).toBeGreaterThanOrEqual(-1e-9)
          expect(out[f], `${f} at y=${y}`).toBeLessThanOrEqual(1 + 1e-9)
        }
      }
    })
  }

  it('never shows the helmet and the bike swapping in plain sight', () => {
    // Wherever the helmet-to-bike swap happens, the visor must be fully closed.
    const frames = resolveFrames(SCRIPTS, ranges, 0, BASE)
    const out = createRigState()
    const visor = frames.filter((f) => f.chapter === 'visor-down')
    let wasBike = 0
    for (let y = visor[0]!.y; y <= visor[visor.length - 1]!.y; y += 5) {
      sampleFrames(frames, y, out)
      if (out.bikeShow !== wasBike) {
        expect(out.visor, `visor when the bike appears at y=${y}`).toBeCloseTo(1, 5)
        wasBike = out.bikeShow
      }
    }
    expect(wasBike).toBe(1)
  })

  it('skips My ride cleanly when that chapter is not on the page', () => {
    const frames = resolveFrames(SCRIPTS, ranges, 0, BASE)
    expect(frames.some((f) => f.chapter === 'my-ride')).toBe(false)
    const withRide = resolveFrames(SCRIPTS, layout(SCRIPTS), 0, BASE)
    expect(withRide.some((f) => f.chapter === 'my-ride')).toBe(true)
  })
})
