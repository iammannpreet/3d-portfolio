import { useSyncExternalStore } from 'react'
import { createEmitter } from './emitter'

/**
 * high: 2k textures, floor reflections, bloom, live environment.
 * low:  1k textures, no reflector, no bloom, capped pixel ratio.
 */
export type Tier = 'high' | 'low'

const MOTION_KEY = 'ride:reduced-motion'
const emitter = createEmitter<'tier' | 'motion'>()

function param(name: string): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get(name)
}

function detectTier(): Tier {
  if (typeof window === 'undefined') return 'high'
  const forced = param('tier')
  if (forced === 'low' || forced === 'high') return forced
  const nav = navigator as Navigator & { deviceMemory?: number }
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const smallScreen = Math.min(window.screen.width, window.screen.height) < 820
  const weak = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4
  return (coarse && smallScreen) || weak ? 'low' : 'high'
}

function detectReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  const forced = param('motion')
  if (forced === 'reduced') return true
  if (forced === 'full') return false
  try {
    const saved = window.localStorage.getItem(MOTION_KEY)
    if (saved === '1') return true
    if (saved === '0') return false
  } catch {
    // Storage can be unavailable (private mode, blocked site data). Fall through to the OS setting.
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Read every frame by the scene and the scroll engine. Change it only through the setters. */
export const quality = {
  tier: detectTier(),
  reducedMotion: detectReducedMotion(),
}

function reflect(): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.dataset.tier = quality.tier
  root.dataset.motion = quality.reducedMotion ? 'reduced' : 'full'
}
reflect()

export function setTier(tier: Tier): void {
  if (quality.tier === tier) return
  quality.tier = tier
  reflect()
  emitter.emit('tier')
}

/** Sets the motion preference. `persist` remembers it for this browser. */
export function setReducedMotion(reduced: boolean, persist = true): void {
  if (quality.reducedMotion === reduced) return
  quality.reducedMotion = reduced
  if (persist) {
    try {
      window.localStorage.setItem(MOTION_KEY, reduced ? '1' : '0')
    } catch {
      // Not being able to remember the choice is fine.
    }
  }
  reflect()
  emitter.emit('motion')
}

export const onQualityChange = emitter.on

export function useTier(): Tier {
  return useSyncExternalStore(
    (cb) => emitter.on('tier', cb),
    () => quality.tier,
    () => 'high' as Tier,
  )
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => emitter.on('motion', cb),
    () => quality.reducedMotion,
    () => false,
  )
}

export function supportsWebGL(): boolean {
  if (typeof document === 'undefined') return false
  if (param('webgl') === 'off') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2'))
  } catch {
    return false
  }
}
