import { setReducedMotion, useReducedMotion } from '../lib/quality'
import { Icon } from '../ui/Icon'

/** Turns the site's motion off and on. The choice is remembered in this browser. */
export function MotionToggle() {
  const reduced = useReducedMotion()
  return (
    <button
      type="button"
      className="hud-chip"
      aria-pressed={reduced}
      onClick={() => setReducedMotion(!reduced)}
    >
      <Icon name="motion" size={16} />
      <span className="hud-chip__label">Reduce motion</span>
    </button>
  )
}
