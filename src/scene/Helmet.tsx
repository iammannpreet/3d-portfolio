import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import helmetUrl from '../assets/models/helmet.glb?url'
import { quality } from '../lib/quality'
import { smoothstep } from '../scroll/math'
import { rig } from '../scroll/store'
import { normaliseHelmet } from './models'
import { SkillRing } from './SkillRing'
import { useLoadedModel } from './useLoadedModel'

/** Idle spin, radians per second. One turn takes about half a minute, as on the 2024 site. */
const SPIN_SPEED = 0.2

const wrapAngle = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle))

/**
 * The helmet. The rig places, turns and scales the outer group; the inner group adds the slow
 * idle spin. When the rig turns the spin down, the helmet unwinds to exactly the choreographed
 * orientation instead of stopping wherever it happened to be.
 */
export function Helmet() {
  const model = useLoadedModel('helmet', helmetUrl, normaliseHelmet)
  const outer = useRef<Group>(null)
  const inner = useRef<Group>(null)
  const rings = useRef<Group>(null)
  const spin = useRef(0)

  useFrame((state, delta) => {
    const o = outer.current
    const i = inner.current
    if (!o || !i) return
    const shown = rig.helmetShow > 0.5 && rig.helmetScale > 0.02
    o.visible = shown
    if (rings.current) {
      rings.current.visible = shown
      rings.current.position.set(rig.helmetPos[0], rig.helmetPos[1], rig.helmetPos[2])
    }
    if (!shown) return

    const still = quality.reducedMotion
    if (rig.helmetSpin > 0.999 && !still) spin.current -= SPIN_SPEED * Math.min(delta, 0.1)
    const weight = smoothstep(0, 1, rig.helmetSpin)

    o.position.set(rig.helmetPos[0], rig.helmetPos[1], rig.helmetPos[2])
    o.rotation.set(rig.helmetRot[0], rig.helmetRot[1], rig.helmetRot[2])
    o.scale.setScalar(rig.helmetScale)
    i.rotation.y = wrapAngle(spin.current) * weight
    i.position.y = still ? 0 : Math.sin(state.clock.elapsedTime * 0.9) * 0.006 * weight
  }, -50)

  return (
    <>
      <group ref={outer} visible={false}>
        <group ref={inner}>{model && <primitive object={model} />}</group>
      </group>
      {/* The rings sit outside the helmet's group so they never turn or grow with it. */}
      <group ref={rings} visible={false}>
        <SkillRing />
      </group>
    </>
  )
}
