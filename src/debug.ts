import { quality, setReducedMotion, setTier } from './lib/quality'
import { chapterScrollY, measure, scrollToChapter } from './scroll/engine'
import { bridge, rig, rigTarget, scroll } from './scroll/store'

/**
 * A handle for the screenshot tool, the end-to-end tests and the browser console.
 * Loaded in development, or on any build when the URL has `?debug`.
 */
const handle = {
  scroll,
  rig,
  rigTarget,
  bridge,
  quality,
  chapterScrollY,
  scrollToChapter,
  measure,
  setTier,
  setReducedMotion,
}

export type RideDebug = typeof handle

declare global {
  interface Window {
    __ride?: RideDebug
  }
}

window.__ride = handle
