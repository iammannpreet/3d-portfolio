import { useSyncExternalStore } from 'react'
import { CHAPTER_IDS, HOTSPOT_IDS, type ChapterId, type HotspotId } from '../chapters'
import { createEmitter } from '../lib/emitter'
import { BASE } from './presets'
import { cloneRig } from './sampler'
import type { ChapterRange, RigState } from './types'

/**
 * Shared mutable state.
 *
 * Everything here is written once per frame by the scroll engine (or by the scene, for `bridge`)
 * and read directly by whoever needs it. Nothing in here triggers a React render on its own; the
 * few discrete changes React cares about are announced through `subscribe` and the hooks below.
 */

export interface MeasuredChapter extends ChapterRange {
  index: number
  height: number
  el: HTMLElement
}

export const scroll = {
  /** Scroll position, CSS pixels. */
  y: 0,
  /** Largest possible scroll position. */
  max: 1,
  /** 0..1 through the whole page. */
  progress: 0,
  /** Smoothed scroll velocity, CSS pixels per second. Negative when scrolling up. */
  velocity: 0,
  viewport: { w: 1, h: 1 },
  /** 0 on landscape viewports, 1 on portrait, blended in between. */
  portraitMix: 0,
  /** The chapter currently on screen. */
  active: 'gear-up' as ChapterId,
  chapters: [] as MeasuredChapter[],
  /** 0..1 progress through each chapter's sticky travel. */
  local: Object.fromEntries(CHAPTER_IDS.map((id) => [id, 0])) as Record<ChapterId, number>,
}

/** The damped rig the scene renders from. */
export const rig: RigState = cloneRig(BASE)
/** The undamped rig the choreography asks for at the current scroll position. */
export const rigTarget: RigState = cloneRig(BASE)

export type SceneStatus = 'pending' | 'ready' | 'failed' | 'unsupported'
export type ModelName = 'helmet' | 'bike'

export interface ScreenPoint {
  /** CSS pixels from the left of the viewport. */
  x: number
  /** CSS pixels from the top of the viewport. */
  y: number
  /** False when the anchor is behind the camera or the bike is hidden. */
  visible: boolean
}

/** The hand-off between the WebGL scene and the DOM. */
export const bridge = {
  sceneStatus: 'pending' as SceneStatus,
  /** 0..1 download progress per model. */
  progress: { helmet: 0, bike: 0 } as Record<ModelName, number>,
  ready: { helmet: false, bike: false } as Record<ModelName, boolean>,
  /** Where each hotspot anchor is on screen right now. Written by the scene every frame. */
  hotspots: Object.fromEntries(
    HOTSPOT_IDS.map((id) => [id, { x: 0, y: 0, visible: false }]),
  ) as Record<HotspotId, ScreenPoint>,
  /** The hotspot whose panel is currently shown. Written by the DOM. */
  activeHotspot: null as HotspotId | null,
}

type StoreEvent = 'chapter' | 'scene' | 'models' | 'hotspot' | 'measure'
const emitter = createEmitter<StoreEvent>()

export const subscribe = emitter.on
export const emit = emitter.emit

export function setSceneStatus(status: SceneStatus): void {
  if (bridge.sceneStatus === status) return
  bridge.sceneStatus = status
  if (typeof document !== 'undefined') document.documentElement.dataset.scene = status
  emitter.emit('scene')
}

export function setModelProgress(model: ModelName, progress: number): void {
  const p = Math.min(1, Math.max(0, progress))
  if (Math.abs(bridge.progress[model] - p) < 0.01 && p !== 1) return
  bridge.progress[model] = p
  emitter.emit('models')
}

export function setModelReady(model: ModelName): void {
  if (bridge.ready[model]) return
  bridge.ready[model] = true
  bridge.progress[model] = 1
  emitter.emit('models')
}

export function setActiveHotspot(id: HotspotId | null): void {
  if (bridge.activeHotspot === id) return
  bridge.activeHotspot = id
  emitter.emit('hotspot')
}

export function useActiveChapter(): ChapterId {
  return useSyncExternalStore(
    (cb) => emitter.on('chapter', cb),
    () => scroll.active,
    () => 'gear-up' as ChapterId,
  )
}

export function useSceneStatus(): SceneStatus {
  return useSyncExternalStore(
    (cb) => emitter.on('scene', cb),
    () => bridge.sceneStatus,
    () => 'pending' as SceneStatus,
  )
}

export function useModelReady(model: ModelName): boolean {
  return useSyncExternalStore(
    (cb) => emitter.on('models', cb),
    () => bridge.ready[model],
    () => false,
  )
}

/** 0..1, rounded to whole percent so React only re-renders when the number shown changes. */
export function useModelProgress(model: ModelName): number {
  return useSyncExternalStore(
    (cb) => emitter.on('models', cb),
    () => Math.round(bridge.progress[model] * 100) / 100,
    () => 0,
  )
}

export function useActiveHotspot(): HotspotId | null {
  return useSyncExternalStore(
    (cb) => emitter.on('hotspot', cb),
    () => bridge.activeHotspot,
    () => null,
  )
}

/** The ids of the chapters that are actually on the page, in order. */
export function useChapterIds(): ChapterId[] {
  return useSyncExternalStore(
    (cb) => emitter.on('measure', cb),
    getChapterIds,
    () => EMPTY_IDS,
  )
}

const EMPTY_IDS: ChapterId[] = []
let cachedIds: ChapterId[] = EMPTY_IDS
function getChapterIds(): ChapterId[] {
  const next = scroll.chapters.map((c) => c.id)
  if (next.length !== cachedIds.length || next.some((id, i) => id !== cachedIds[i])) cachedIds = next
  return cachedIds
}
