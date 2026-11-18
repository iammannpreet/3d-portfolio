import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import type { Group, MeshStandardMaterial, Object3D, SpotLight } from 'three'
import bikeUrl from '../assets/models/bike.glb?url'
import bikeSmallUrl from '../assets/models/bike-1k.glb?url'
import { quality } from '../lib/quality'
import { clamp } from '../scroll/math'
import { rig, scroll, useModelReady } from '../scroll/store'
import { BIKE } from './anchors'
import { Hotspots } from './Hotspots'
import { materialsOf, normaliseBike } from './models'
import { useLoadedModel } from './useLoadedModel'
import { world } from './world'

/** How strongly the headlights glow when the engine is on, relative to the model's own value. */
const LAMP_BOOST = 2.6
/** Radians of pitch per (viewport height per second squared) of scroll acceleration. */
const PITCH_PER_ACCEL = 0.0032
const MAX_PITCH = 0.03

interface Parts {
  materials: MeshStandardMaterial[]
  baseEmissive: number[]
  wheels: Object3D[]
}

/**
 * The motorcycle. It starts downloading once the helmet is ready, so it arrives while the visitor
 * reads the hero. The outer group follows the rig; the inner groups add lean, pitch under
 * acceleration and braking, and a fine idle vibration while the engine runs.
 */
export function Bike() {
  const helmetReady = useModelReady('helmet')
  // The tier is read once: swapping to the other file mid-visit would make the bike vanish.
  const [url] = useState(() => (quality.tier === 'high' ? bikeUrl : bikeSmallUrl))
  const model = useLoadedModel('bike', helmetReady ? url : null, normaliseBike)

  const outer = useRef<Group>(null)
  const leanGroup = useRef<Group>(null)
  const pitchGroup = useRef<Group>(null)
  const headlight = useRef<SpotLight>(null)
  const beamTarget = useRef<Object3D>(null)
  const parts = useRef<Parts | null>(null)
  const motion = useRef({ pitch: 0, pitchVelocity: 0, lastVelocity: 0 })

  useEffect(() => {
    if (headlight.current && beamTarget.current) headlight.current.target = beamTarget.current
  }, [])

  useEffect(() => {
    if (!model) return
    const materials = materialsOf(model) as MeshStandardMaterial[]
    const wheels = ['wheel_front', 'wheel_rear']
      .map((name) => model.getObjectByName(name))
      .filter((wheel): wheel is Object3D => Boolean(wheel))
    if (import.meta.env.DEV && wheels.length !== 2) {
      console.warn(`Bike: expected 2 wheel nodes, found ${wheels.length}. Run npm run optimize:models.`)
    }
    parts.current = {
      materials,
      baseEmissive: materials.map((m) => m.emissiveIntensity),
      wheels,
    }
  }, [model])

  useFrame((state, delta) => {
    const o = outer.current
    const l = leanGroup.current
    const p = pitchGroup.current
    if (!o || !l || !p) return
    o.visible = rig.bikeShow > 0.5 && model !== null
    if (!o.visible) return

    const dt = Math.min(Math.max(delta, 1e-3), 0.1)
    const t = state.clock.elapsedTime
    const still = quality.reducedMotion
    const running = rig.engine

    o.position.set(rig.bikePos[0], rig.bikePos[1], rig.bikePos[2])
    o.rotation.set(0, rig.bikeYaw, 0)
    o.scale.setScalar(rig.bikeScale)

    // Squat when the visitor speeds up, dive when they brake.
    const m = motion.current
    const vh = Math.max(1, scroll.viewport.h)
    const accel = (scroll.velocity - m.lastVelocity) / dt / vh
    m.lastVelocity = scroll.velocity
    const target = still ? 0 : clamp(accel * PITCH_PER_ACCEL * running, -MAX_PITCH, MAX_PITCH)
    // A stiff, well-damped spring.
    m.pitchVelocity += ((target - m.pitch) * 60 - m.pitchVelocity * 13) * dt
    m.pitch += m.pitchVelocity * dt

    const shake = still ? 0 : running
    const rollJitter = shake * (Math.sin(t * 43) * 0.0011 + Math.sin(t * 71) * 0.0005)
    l.rotation.x = rig.bikeLean + rollJitter

    // Pitch about the wheel that stays planted: the rear when the nose lifts, the front when it dips.
    const pivotX = m.pitch > 0 ? BIKE.rearAxle[0] : BIKE.frontAxle[0]
    p.rotation.z = m.pitch
    p.position.set(
      pivotX - pivotX * Math.cos(m.pitch),
      -pivotX * Math.sin(m.pitch) + shake * (Math.sin(t * 58) * 0.0009 + Math.sin(t * 37) * 0.0006),
      0,
    )

    const lit = parts.current
    if (lit) {
      const glow = (0.12 + LAMP_BOOST * running) * Math.max(0.35, rig.exposure)
      lit.materials.forEach((material, i) => {
        material.emissiveIntensity = lit.baseEmissive[i]! * glow
      })
      for (const wheel of lit.wheels) wheel.rotation.z = world.wheelAngle
    }
    if (headlight.current) headlight.current.intensity = 70 * running * rig.exposure
  }, -50)

  return (
    <group ref={outer} visible={false}>
      <group ref={leanGroup}>
        <group ref={pitchGroup}>
          {model && <primitive object={model} />}
          <Hotspots />
          <spotLight
            ref={headlight}
            position={BIKE.headlight}
            angle={0.45}
            penumbra={0.7}
            distance={30}
            decay={1.5}
            color="#e3f1ff"
            intensity={0}
          />
          <object3D ref={beamTarget} position={[BIKE.headlight[0] + 6, 0, BIKE.headlight[2]]} />
        </group>
      </group>
    </group>
  )
}
