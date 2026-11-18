import { useRef, type CSSProperties } from 'react'
import { quality } from '../lib/quality'
import { useTick } from '../scroll/hooks'
import { damp } from '../scroll/math'
import { scroll, useActiveChapter } from '../scroll/store'
import { gearGlyph } from './gears'

const SEGMENTS = 18
const TOP_SPEED = 299
/** km/h per (viewport height per second) of scrolling. */
const KMH_PER_VH = 60

/** Speed follows how fast the page is being scrolled; the gear follows the chapter. */
export function Speedo() {
  const active = useActiveChapter()
  const number = useRef<HTMLSpanElement>(null)
  const tach = useRef<HTMLDivElement>(null)
  const state = useRef({ value: 0, shown: -1 })

  useTick((dt) => {
    const target = Math.min(TOP_SPEED, (Math.abs(scroll.velocity) / Math.max(1, scroll.viewport.h)) * KMH_PER_VH)
    const s = state.current
    s.value = quality.reducedMotion ? target : damp(s.value, target, 6, dt)
    const shown = Math.round(s.value)
    if (shown === s.shown) return
    s.shown = shown
    if (number.current) number.current.textContent = String(shown).padStart(3, '0')
    tach.current?.style.setProperty('--rev', (s.value / TOP_SPEED).toFixed(3))
  })

  return (
    <div className="speedo" aria-hidden="true">
      <span className="speedo__gear">{gearGlyph(active)}</span>
      <div className="speedo__main">
        <div className="speedo__readout">
          <span ref={number} className="speedo__value">000</span>
          <span className="ui-label">km/h</span>
        </div>
        <div ref={tach} className="speedo__tach">
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <i key={i} style={{ '--i': i / SEGMENTS } as CSSProperties} />
          ))}
        </div>
      </div>
    </div>
  )
}
