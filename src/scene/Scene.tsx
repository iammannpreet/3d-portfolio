import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import { rig, setModelReady, setSceneStatus } from '../scroll/store'
import { Rig } from './Rig'

/**
 * PLACEHOLDER SCENE. Stand-in boxes for the helmet and the bike so the scroll rig can be checked
 * end to end before the real scene exists. Replaced by the real scene.
 */
function Placeholders() {
  const helmet = useRef<Group>(null)
  const bike = useRef<Group>(null)

  useEffect(() => {
    setSceneStatus('ready')
    setModelReady('helmet')
    setModelReady('bike')
  }, [])

  useFrame(() => {
    const h = helmet.current
    const b = bike.current
    if (h) {
      h.visible = rig.helmetShow > 0.5
      h.position.set(...rig.helmetPos)
      h.rotation.set(...rig.helmetRot)
      h.scale.setScalar(rig.helmetScale)
    }
    if (b) {
      b.visible = rig.bikeShow > 0.5
      b.position.set(...rig.bikePos)
      b.rotation.set(rig.bikeLean, rig.bikeYaw, 0)
      b.scale.setScalar(rig.bikeScale)
    }
  })

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={2} />
      <gridHelper args={[40, 80, '#fe5e0e', '#2a2f3a']} />
      <group ref={helmet}>
        <mesh>
          <sphereGeometry args={[0.15, 32, 24]} />
          <meshStandardMaterial color="#20242c" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* visor marker: faces +Z */}
        <mesh position={[0, 0.02, 0.13]}>
          <boxGeometry args={[0.2, 0.07, 0.06]} />
          <meshStandardMaterial color="#38e1ff" emissive="#38e1ff" emissiveIntensity={0.6} />
        </mesh>
      </group>
      <group ref={bike}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[2.1, 0.6, 0.5]} />
          <meshStandardMaterial color="#3a4150" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* front marker: the bike faces +X */}
        <mesh position={[1.0, 0.6, 0]}>
          <boxGeometry args={[0.15, 0.2, 0.3]} />
          <meshStandardMaterial color="#fe5e0e" emissive="#fe5e0e" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.7, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.14, 24]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[-0.7, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.16, 24]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>
    </>
  )
}

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: 40, near: 0.03, far: 300, position: [0, 0.4, 1.2] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#07080c']} />
      <Rig />
      <Placeholders />
    </Canvas>
  )
}
