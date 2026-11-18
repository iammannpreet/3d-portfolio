import { Environment, Lightformer } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { Color, type DirectionalLight, type Group, type Mesh, type MeshBasicMaterial, type SpotLight } from 'three'
import { useTier } from '../lib/quality'
import { rig } from '../scroll/store'
import { world } from './world'

const STRIP_SPACING = 7
const STRIP_COUNT = 6

/** Sets a Lightformer's brightness without re-rendering React. */
function setGlow(mesh: Mesh | null, base: Color, intensity: number) {
  if (!mesh) return
  ;(mesh.material as MeshBasicMaterial).color.copy(base).multiplyScalar(intensity)
}

const WHITE = new Color('#e8eeff')
const COOL = new Color('#8fdcff')
const WARM = new Color('#ff7b3d')
const OVERHEAD = new Color('#f4f7ff')

/**
 * Lighting is almost all image-based: an environment map rendered from a handful of glowing
 * panels (no HDRI download). Metal parts of the bike and helmet reflect these panels.
 * - key: a soft panel overhead
 * - two rim strips, cool on the left and ember on the right-rear
 * - while riding, strips slide past overhead so reflections stream over the bike
 * - in the garage, rows of overhead tubes come on
 * On the high tier the environment re-renders every frame; on the low tier it renders once.
 */
export function Lighting() {
  const tier = useTier()
  const scene = useThree((state) => state.scene)
  const key = useRef<DirectionalLight>(null)
  const keyPanel = useRef<Mesh>(null)
  const coolRim = useRef<Mesh>(null)
  const warmRim = useRef<Mesh>(null)
  const streams = useRef<Group>(null)
  const tubes = useRef<Group>(null)
  const garageSpot = useRef<SpotLight>(null)

  useFrame(() => {
    const exposure = rig.exposure
    const night = rig.mood
    const garage = rig.garage
    const riding = rig.road * rig.speed

    // Overall image-based light: a little lower at night, back up under the garage lights.
    scene.environmentIntensity = exposure * (1.35 - 0.3 * night + 0.3 * garage)

    setGlow(keyPanel.current, WHITE, 2.6 * (1 - 0.35 * night) + 1.2 * garage)
    setGlow(coolRim.current, COOL, 3.0)
    setGlow(warmRim.current, WARM, 3.2 * (1 - 0.35 * night))

    const s = streams.current
    if (s) {
      s.visible = riding > 0.02
      const shift = (((world.distance % STRIP_SPACING) + STRIP_SPACING) % STRIP_SPACING)
      s.children.forEach((child, i) => {
        child.position.x = ((i - STRIP_COUNT / 2) * STRIP_SPACING - shift)
        setGlow(child as Mesh, i % 2 ? COOL : WARM, 3.2 * riding)
      })
    }
    const g = tubes.current
    if (g) {
      g.visible = garage > 0.02
      for (const child of g.children) setGlow(child as Mesh, OVERHEAD, 4 * garage)
    }

    if (key.current) key.current.intensity = 1.6 * exposure * (1 - 0.25 * night) + 0.8 * garage
    if (garageSpot.current) garageSpot.current.intensity = 420 * garage * exposure
  }, -40)

  return (
    <>
      <Environment frames={tier === 'high' ? Infinity : 1} resolution={tier === 'high' ? 256 : 128}>
        <Lightformer ref={keyPanel} form="rect" scale={[9, 4]} position={[0, 7, 1.5]} rotation-x={Math.PI / 2} />
        <Lightformer ref={coolRim} form="rect" scale={[14, 0.7]} position={[-3, 1.8, -6]} target={[0, 0.6, 0]} />
        <Lightformer ref={warmRim} form="rect" scale={[14, 0.55]} position={[5, 1.0, -5]} target={[0, 0.5, 0]} />
        <Lightformer form="rect" intensity={1.1} color="#ffffff" scale={[10, 3.5]} position={[2, 2.4, 7]} target={[0, 0.6, 0]} />
        {/* A wide, dim ceiling so upward-facing surfaces never go fully black. */}
        <Lightformer form="rect" intensity={0.32} color="#c8d4ff" scale={[24, 24]} position={[0, 10, 0]} rotation-x={Math.PI / 2} />
        <group ref={streams}>
          {Array.from({ length: STRIP_COUNT }, (_, i) => (
            <Lightformer key={i} form="rect" scale={[2.6, 0.35]} position={[0, 3.2, i % 2 ? 3.5 : -3.5]} rotation-x={Math.PI / 2} />
          ))}
        </group>
        <group ref={tubes}>
          {[-2.4, 0, 2.4].map((x) => (
            <Lightformer key={x} form="rect" scale={[0.35, 7]} position={[x, 4.2, 0]} rotation-x={Math.PI / 2} />
          ))}
        </group>
      </Environment>
      <directionalLight ref={key} position={[3, 6, 4]} color="#f2f5ff" />
      <spotLight
        ref={garageSpot}
        position={[0.2, 6.5, 0.6]}
        angle={0.5}
        penumbra={0.9}
        distance={20}
        decay={1.4}
        color="#eef3ff"
        intensity={0}
      />
      <hemisphereLight args={['#4c5878', '#07080c', 0.35]} />
    </>
  )
}
