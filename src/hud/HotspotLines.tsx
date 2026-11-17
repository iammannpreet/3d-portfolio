import { useEffect, useRef } from 'react'
import { useTick } from '../scroll/hooks'
import { bridge, useActiveHotspot, useSceneStatus } from '../scroll/store'

/** Room left between the line's end and the panel it points at, CSS pixels. */
const GAP = 10

/**
 * Leader lines from a part of the bike to the panel that explains it. The scene reports where
 * the part is on screen every frame; the panel is the element with the matching
 * `data-hotspot-panel` attribute.
 */
export function HotspotLines() {
  const active = useActiveHotspot()
  const status = useSceneStatus()
  const group = useRef<SVGGElement>(null)
  const line = useRef<SVGPolylineElement>(null)
  const ring = useRef<SVGCircleElement>(null)
  const dot = useRef<SVGCircleElement>(null)
  const end = useRef<SVGCircleElement>(null)
  const panel = useRef<DOMRect | null>(null)

  useEffect(() => {
    panel.current = null
    if (!active) return
    const measure = () => {
      const el = document.querySelector(`[data-hotspot-panel="${active}"]`)
      panel.current = el ? el.getBoundingClientRect() : null
    }
    measure()
    // The panel slides in over about half a second; measure again once it has settled.
    const timer = window.setTimeout(measure, 650)
    window.addEventListener('resize', measure)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', measure)
    }
  }, [active])

  useTick(() => {
    const g = group.current
    if (!g) return
    const id = bridge.activeHotspot
    const point = id ? bridge.hotspots[id] : null
    const rect = panel.current
    const show = status === 'ready' && point !== null && point.visible && rect !== null
    g.style.opacity = show ? '1' : '0'
    if (!show || !point || !rect) return

    const { x, y } = point
    let ex: number
    let ey: number
    let elbowX: number
    let elbowY: number
    if (rect.left - GAP > x + 24) {
      // Panel to the right: run diagonally, then level into the panel's left edge.
      ex = rect.left - GAP
      ey = Math.min(Math.max(y, rect.top + 28), rect.bottom - 28)
      const run = Math.min(Math.abs(ey - y), Math.max(0, ex - x - 24))
      elbowX = x + run
      elbowY = ey
    } else {
      // Panel below (phones): run diagonally, then straight down to its top edge.
      ex = Math.min(Math.max(x, rect.left + 28), rect.right - 28)
      ey = rect.top - GAP
      const run = Math.min(Math.abs(ex - x), Math.max(0, ey - y - 24))
      elbowX = ex
      elbowY = y + run
    }
    line.current?.setAttribute('points', `${x},${y} ${elbowX},${elbowY} ${ex},${ey}`)
    for (const circle of [ring.current, dot.current]) {
      circle?.setAttribute('cx', String(x))
      circle?.setAttribute('cy', String(y))
    }
    end.current?.setAttribute('cx', String(ex))
    end.current?.setAttribute('cy', String(ey))
  })

  return (
    <svg className="hotspot-lines" aria-hidden="true">
      <g ref={group} style={{ opacity: 0 }}>
        <polyline ref={line} className="hotspot-lines__line" />
        <circle ref={ring} r="9" className="hotspot-lines__ring" />
        <circle ref={dot} r="2.5" className="hotspot-lines__dot" />
        <circle ref={end} r="2.5" className="hotspot-lines__dot" />
      </g>
    </svg>
  )
}
