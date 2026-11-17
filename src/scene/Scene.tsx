import { PerformanceMonitor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { setTier, useTier } from '../lib/quality'
import { setSceneStatus } from '../scroll/store'
import { Atmosphere } from './Atmosphere'
import { Bike } from './Bike'
import { Effects } from './Effects'
import { Floor } from './Floor'
import { Helmet } from './Helmet'
import { Lighting } from './Lighting'
import { Rig } from './Rig'
import { Road } from './Road'
import { WorldClock } from './world'

/**
 * The WebGL scene behind the page. Frame order (lower runs first):
 *   -100 Rig (camera)   -60 WorldClock   -50 helmet and bike poses
 *   -40 sky, lights, road   -30 effects   -10 hotspot projection   then render
 */
export default function Scene() {
  const tier = useTier()
  return (
    <Canvas
      dpr={tier === 'high' ? [1, 1.75] : [1, 1.25]}
      camera={{ fov: 40, near: 0.03, far: 340, position: [0, 0.4, 1.2] }}
      gl={{ antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        setSceneStatus('ready')
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault()
          setSceneStatus('failed')
        })
      }}
    >
      {/* If frame times stay poor, drop to the low tier for the rest of the visit. */}
      <PerformanceMonitor flipflops={2} onDecline={() => setTier('low')} onFallback={() => setTier('low')}>
        <Rig />
        <WorldClock />
        <Atmosphere />
        <Lighting />
        <Floor />
        <Road />
        <Helmet />
        <Bike />
        <Effects />
      </PerformanceMonitor>
    </Canvas>
  )
}
