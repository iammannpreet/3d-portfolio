import { useEffect, useState } from 'react'
import { useModelProgress, useModelReady, useSceneStatus } from '../scroll/store'

const MIN_MS = 600
const MAX_MS = 7000
const FADE_MS = 700

/** The tachometer arc, as an SVG path: a 240° sweep with the gap at the bottom. */
const ARC = 'M 30 104 A 76 76 0 1 1 170 104'

/**
 * Covers the page until the helmet is ready (or the scene cannot run, or seven seconds pass),
 * then fades out and removes itself.
 */
export function Loader() {
  const ready = useModelReady('helmet')
  const status = useSceneStatus()
  const progress = useModelProgress('helmet')
  const [minimumShown, setMinimumShown] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const min = window.setTimeout(() => setMinimumShown(true), MIN_MS)
    const max = window.setTimeout(() => setTimedOut(true), MAX_MS)
    return () => {
      window.clearTimeout(min)
      window.clearTimeout(max)
    }
  }, [])

  const done = minimumShown && (ready || timedOut || status === 'failed' || status === 'unsupported')

  useEffect(() => {
    if (!done) return
    const timer = window.setTimeout(() => setGone(true), FADE_MS)
    return () => window.clearTimeout(timer)
  }, [done])

  if (gone) return null
  const shown = status === 'unsupported' || status === 'failed' ? 1 : progress
  const percent = Math.round(shown * 100)

  return (
    <div className="loader" data-done={done ? '' : undefined} role="status">
      <svg className="loader__gauge" viewBox="0 0 200 140" aria-hidden="true">
        <path d={ARC} className="loader__track" pathLength={100} />
        <path d={ARC} className="loader__fill" pathLength={100} style={{ strokeDashoffset: 100 - percent }} />
        <g style={{ transform: `rotate(${-120 + shown * 240}deg)`, transformOrigin: '100px 80px' }} className="loader__needle">
          <line x1="100" y1="80" x2="100" y2="22" />
        </g>
        <circle cx="100" cy="80" r="5" className="loader__hub" />
      </svg>
      <p className="loader__value" aria-hidden="true">
        {String(percent).padStart(3, '0')}
      </p>
      <p className="loader__text">{done ? 'Ready to ride' : 'Warming up the engine'}</p>
    </div>
  )
}
