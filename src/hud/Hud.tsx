import { useRigVars } from '../scroll/hooks'
import { GearNav } from './GearNav'
import { HotspotLines } from './HotspotLines'
import { MotionToggle } from './MotionToggle'
import { Speedo } from './Speedo'
import { TopBar } from './TopBar'
import { TripBar } from './TripBar'

/**
 * The fixed heads-up display. The root carries the rig's CSS variables (--hud, --speed, --gp ...)
 * so every HUD component can style itself from them.
 */
export function Hud() {
  const ref = useRigVars<HTMLDivElement>()
  return (
    <div ref={ref} className="hud">
      <TopBar />
      <TripBar />
      <GearNav />
      <Speedo />
      <MotionToggle />
      <HotspotLines />
    </div>
  )
}
