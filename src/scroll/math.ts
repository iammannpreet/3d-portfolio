import type { EaseName } from './types'

export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v)
export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

/** Remaps x from [inLo, inHi] to [outLo, outHi], clamped. */
export function remap(x: number, inLo: number, inHi: number, outLo: number, outHi: number): number {
  if (inLo === inHi) return x < inLo ? outLo : outHi
  return lerp(outLo, outHi, clamp01((x - inLo) / (inHi - inLo)))
}

/**
 * Frame-rate independent exponential approach. `lambda` is the rate: the remaining distance
 * shrinks by a factor of e every 1/lambda seconds.
 */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt))
}

export const EASES: Record<EaseName, (t: number) => number> = {
  linear: (t) => t,
  in: (t) => t * t * t,
  out: (t) => 1 - (1 - t) ** 3,
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  expoInOut: (t) =>
    t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2,
  hold: (t) => (t >= 1 ? 1 : 0),
}
