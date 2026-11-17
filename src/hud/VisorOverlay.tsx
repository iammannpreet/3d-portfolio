import { useRef } from 'react'
import { site } from '../content/site'
import { VISOR_BEATS } from '../scroll/choreography'
import { useRigVars, useTick } from '../scroll/hooks'
import { scroll, useModelProgress, useModelReady, useSceneStatus } from '../scroll/store'

/**
 * The visor: between the scene and the page. While the helmet comes down it fades the screen to
 * black; while it is shut, the HUD boot log types out; then the black shield lifts like a
 * raised visor. It also stays shut whenever the bike is still downloading.
 */
export function VisorOverlay() {
  const status = useSceneStatus()
  const bikeReady = useModelReady('bike')
  const bikeProgress = useModelProgress('bike')
  const root = useRigVars<HTMLDivElement>()
  const lines = useRef<(HTMLLIElement | null)[]>([])
  const state = useRef({ phase: '', shown: -1 })

  useTick(() => {
    const el = root.current
    if (!el) return
    const p = scroll.local['visor-down']
    const [start, end] = VISOR_BEATS.boot
    const s = state.current
    const phase = p < start ? 'closing' : 'opening'
    if (phase !== s.phase) {
      s.phase = phase
      el.setAttribute('data-phase', phase)
    }
    const count = site.bootLog.length
    const shown = p <= start ? 0 : p >= end ? count : Math.floor(((p - start) / (end - start)) * (count + 1))
    if (shown === s.shown) return
    s.shown = shown
    lines.current.forEach((line, i) => line?.toggleAttribute('data-on', i < shown))
  })

  if (status === 'failed' || status === 'unsupported') return null

  return (
    <div ref={root} className="visor" aria-hidden="true">
      <div className="visor__frame" />
      <div className="visor__shield">
        <ol className="visor__log">
          {site.bootLog.map((line, i) => (
            <li key={line} ref={(el) => { lines.current[i] = el }}>
              {line}
            </li>
          ))}
          {!bikeReady && (
            <li data-on className="visor__loading">
              LOADING MACHINE {String(Math.round(bikeProgress * 100)).padStart(3, '0')}%
            </li>
          )}
        </ol>
      </div>
    </div>
  )
}
