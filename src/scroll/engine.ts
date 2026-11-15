import gsap from 'gsap'
import Lenis from 'lenis'
import type { ChapterId, HotspotId } from '../chapters'
import { onQualityChange, quality } from '../lib/quality'
import { SCRIPTS } from './choreography'
import { clamp, clamp01, damp, smoothstep } from './math'
import { BASE } from './presets'
import { copyRig, crossesCut, dampRig, resolveFrames, sampleFrames } from './sampler'
import {
  bridge,
  emit,
  rig,
  rigTarget,
  scroll,
  setActiveHotspot,
  type MeasuredChapter,
} from './store'
import type { ResolvedFrame } from './types'

/**
 * The scroll engine: one loop that, every frame,
 *   1. advances Lenis (smooth scrolling),
 *   2. works out how far through each chapter the page is,
 *   3. samples the camera choreography into `rig`,
 *   4. switches reveal windows on and off, and
 *   5. calls anyone who asked to be ticked.
 *
 * It runs whether or not WebGL is available, so the page behaves the same with the scene off.
 */

/** How quickly the live rig chases its target. Higher is tighter. */
const RIG_LAMBDA = 9
const VELOCITY_LAMBDA = 12

type TickListener = (dt: number) => void

interface RevealEntry {
  el: HTMLElement
  chapter: ChapterId
  from: number
  to: number
  hotspot?: HotspotId
  on: boolean | null
}

let lenis: Lenis | null = null
let frames: ResolvedFrame[] = []
let lastSegment = Number.NaN
let lastY = 0
let started = false
let measureQueued = false

const tickListeners = new Set<TickListener>()
const reveals = new Set<RevealEntry>()
const varTargets = new Set<HTMLElement>()
const lastVars = new Map<string, string>()

/** Calls `cb` once per frame, after scroll state and the rig are up to date. */
export function onTick(cb: TickListener): () => void {
  tickListeners.add(cb)
  return () => {
    tickListeners.delete(cb)
  }
}

/**
 * Shows `el` while its chapter's progress is inside from..to. Shown elements get `data-on`;
 * hidden ones are `inert`. If `hotspot` is given, showing the element also makes that hotspot the
 * active one.
 */
export function registerReveal(
  el: HTMLElement,
  chapter: ChapterId,
  from: number,
  to: number,
  hotspot?: HotspotId,
): () => void {
  const entry: RevealEntry = { el, chapter, from, to, hotspot, on: null }
  reveals.add(entry)
  updateReveal(entry)
  return () => {
    reveals.delete(entry)
    if (entry.hotspot && bridge.activeHotspot === entry.hotspot) setActiveHotspot(null)
  }
}

/**
 * Keeps these CSS variables up to date on `el`, for overlays that follow the rig:
 * --gp (page progress), --visor, --hud, --mood, --speed, --engine, --garage. All are 0..1.
 */
export function bindRigVars(el: HTMLElement): () => void {
  varTargets.add(el)
  for (const [name, value] of lastVars) el.style.setProperty(name, value)
  return () => {
    varTargets.delete(el)
  }
}

function updateReveal(entry: RevealEntry): void {
  const p = scroll.local[entry.chapter]
  const on = p >= entry.from && p <= entry.to
  if (on === entry.on) return
  entry.on = on
  entry.el.toggleAttribute('data-on', on)
  entry.el.inert = !on
  if (entry.hotspot) {
    if (on) setActiveHotspot(entry.hotspot)
    else if (bridge.activeHotspot === entry.hotspot) setActiveHotspot(null)
  }
}

function writeVar(name: string, value: number): void {
  const text = value.toFixed(3)
  if (lastVars.get(name) === text) return
  lastVars.set(name, text)
  for (const el of varTargets) el.style.setProperty(name, text)
}

/** Re-reads where every chapter sits in the document and rebuilds the keyframe list. */
export function measure(): void {
  measureQueued = false
  const scrollY = window.scrollY
  const vw = window.innerWidth
  const vh = window.innerHeight
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'))

  scroll.chapters = els.map((el, index): MeasuredChapter => {
    const rect = el.getBoundingClientRect()
    const stage = el.querySelector<HTMLElement>('[data-stage]')
    const stageHeight = stage ? stage.getBoundingClientRect().height : vh
    return {
      id: el.dataset.chapter as ChapterId,
      index,
      el,
      top: rect.top + scrollY,
      height: rect.height,
      travel: Math.max(0, rect.height - stageHeight),
    }
  })
  scroll.viewport.w = vw
  scroll.viewport.h = vh
  scroll.max = Math.max(1, document.documentElement.scrollHeight - vh)
  scroll.portraitMix = 1 - smoothstep(0.8, 1.25, vw / vh)

  frames = resolveFrames(SCRIPTS, scroll.chapters, scroll.portraitMix, BASE)
  lastSegment = Number.NaN // snap the rig on the next tick instead of easing across a relayout
  emit('measure')
}

function queueMeasure(): void {
  if (measureQueued) return
  measureQueued = true
  requestAnimationFrame(measure)
}

function tick(time: number, deltaMs: number): void {
  lenis?.raf(time * 1000)

  const dt = clamp(deltaMs / 1000, 0.001, 0.1)
  const vh = scroll.viewport.h
  const y = window.scrollY
  const dy = y - lastY
  lastY = y

  scroll.y = y
  scroll.progress = clamp01(y / scroll.max)
  scroll.velocity = damp(scroll.velocity, dy / dt, VELOCITY_LAMBDA, dt)
  if (Math.abs(scroll.velocity) < 0.5) scroll.velocity = 0

  let active = scroll.active
  for (const chapter of scroll.chapters) {
    const p =
      chapter.travel > 0 ? clamp01((y - chapter.top) / chapter.travel) : y >= chapter.top ? 1 : 0
    if (p !== scroll.local[chapter.id]) {
      scroll.local[chapter.id] = p
      chapter.el.style.setProperty('--p', p.toFixed(4))
    }
    if (y >= chapter.top - vh * 0.5) active = chapter.id
  }
  if (active !== scroll.active) {
    scroll.active = active
    document.documentElement.dataset.activeChapter = active
    emit('chapter')
  }

  for (const entry of reveals) updateReveal(entry)

  const segment = sampleFrames(frames, y, rigTarget, quality.reducedMotion)
  // Keep the visor shut while the bike it would reveal is still downloading.
  const sceneLive = bridge.sceneStatus === 'pending' || bridge.sceneStatus === 'ready'
  if (sceneLive && !bridge.ready.bike && rigTarget.bikeShow > 0.5) rigTarget.visor = 1

  const jumped = Math.abs(dy) > vh * 1.5
  const cut = Number.isNaN(lastSegment) || crossesCut(frames, lastSegment, segment)
  if (quality.reducedMotion || jumped || cut) copyRig(rigTarget, rig)
  else dampRig(rig, rigTarget, RIG_LAMBDA, dt)
  lastSegment = segment

  writeVar('--gp', scroll.progress)
  writeVar('--visor', rig.visor)
  writeVar('--hud', rig.hud)
  writeVar('--mood', rig.mood)
  writeVar('--speed', rig.speed)
  writeVar('--engine', rig.engine)
  writeVar('--garage', rig.garage)

  for (const cb of tickListeners) cb(dt)
}

function applyMotionPreference(): void {
  lenis?.destroy()
  lenis = null
  if (quality.reducedMotion) return
  lenis = new Lenis({
    lerp: 0.11,
    smoothWheel: true,
    autoRaf: false,
    anchors: true,
  })
}

/** Starts the engine. Call once the chapter sections are in the DOM. Returns a stop function. */
export function initScroll(): () => void {
  if (started) return () => {}
  started = true

  document.documentElement.dataset.activeChapter = scroll.active
  applyMotionPreference()
  const offMotion = onQualityChange('motion', () => {
    applyMotionPreference()
    lastSegment = Number.NaN
  })

  const resizeObserver = new ResizeObserver(queueMeasure)
  resizeObserver.observe(document.body)
  window.addEventListener('resize', queueMeasure)
  void document.fonts?.ready.then(queueMeasure)

  lastY = window.scrollY
  measure()
  gsap.ticker.lagSmoothing(0)
  gsap.ticker.add(tick)

  return () => {
    gsap.ticker.remove(tick)
    resizeObserver.disconnect()
    window.removeEventListener('resize', queueMeasure)
    offMotion()
    lenis?.destroy()
    lenis = null
    started = false
  }
}

/**
 * Scrolls to a chapter. `at` is 0..1 through the chapter's sticky travel (default 0, the moment
 * its stage sticks). Long jumps play as a quick fast-forward unless motion is reduced.
 */
export function scrollToChapter(
  id: ChapterId,
  options: { at?: number; immediate?: boolean; duration?: number } = {},
): void {
  const chapter = scroll.chapters.find((c) => c.id === id)
  if (!chapter) return
  const y = Math.round(chapter.top + clamp01(options.at ?? 0) * chapter.travel)
  if (lenis && !options.immediate) {
    const distance = Math.abs(y - scroll.y)
    // `duration` (seconds) lets a caller play the scroll as a deliberate, slower move.
    lenis.scrollTo(y, { duration: options.duration ?? clamp(distance / 2600, 0.9, 2.8) })
  } else {
    window.scrollTo({ top: y, behavior: 'auto' })
  }
}

/** The absolute scroll position of a point inside a chapter. Used by tests and the screenshot tool. */
export function chapterScrollY(id: ChapterId, at = 0): number | null {
  const chapter = scroll.chapters.find((c) => c.id === id)
  return chapter ? Math.round(chapter.top + clamp01(at) * chapter.travel) : null
}
