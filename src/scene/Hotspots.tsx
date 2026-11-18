import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { Vector3, type Group } from 'three'
import { HOTSPOT_IDS } from '../chapters'
import { bridge, rig } from '../scroll/store'
import { HOTSPOT_ANCHORS } from './anchors'

const point = new Vector3()

/**
 * Tells the DOM where each hotspot on the bike is on screen, every frame, so the HUD can land a
 * leader line on it. Render this inside the bike's group: the anchors are in bike space.
 */
export function Hotspots() {
  const group = useRef<Group>(null)
  const size = useThree((state) => state.size)

  // Runs after the bike has been posed for this frame (-50) and before the render.
  useFrame((state) => {
    const g = group.current
    if (!g) return
    const shown = rig.bikeShow > 0.5
    for (const id of HOTSPOT_IDS) {
      const out = bridge.hotspots[id]
      if (!shown) {
        out.visible = false
        continue
      }
      const anchor = HOTSPOT_ANCHORS[id]
      g.localToWorld(point.set(anchor[0], anchor[1], anchor[2])).project(state.camera)
      out.x = (point.x * 0.5 + 0.5) * size.width
      out.y = (-point.y * 0.5 + 0.5) * size.height
      out.visible = point.z > -1 && point.z < 1 && Math.abs(point.x) < 1.05 && Math.abs(point.y) < 1.05
    }
  }, -10)

  return <group ref={group} />
}
