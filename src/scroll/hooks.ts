import { createContext, useContext, useEffect, useRef } from 'react'
import type { ChapterId } from '../chapters'
import { bindRigVars, onTick } from './engine'

export const ChapterContext = createContext<ChapterId | null>(null)

/** The id of the chapter this component is rendered inside. */
export function useChapterId(): ChapterId {
  const id = useContext(ChapterContext)
  if (!id) throw new Error('This component must be rendered inside a <Chapter>')
  return id
}

/**
 * Binds the rig's CSS variables (--gp, --visor, --hud, --mood, --speed, --engine, --garage, all
 * 0..1) to the element the returned ref is attached to.
 */
export function useRigVars<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    return bindRigVars(el)
  }, [])
  return ref
}

/**
 * Runs `callback` once per frame after scroll state and the rig are up to date. Use it to write
 * straight to the DOM (textContent, style) without re-rendering React.
 */
export function useTick(callback: (dt: number) => void): void {
  const latest = useRef(callback)
  useEffect(() => {
    latest.current = callback
  })
  useEffect(() => onTick((dt) => latest.current(dt)), [])
}
