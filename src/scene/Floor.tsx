import { MeshReflectorMaterial } from '@react-three/drei'
import { useTier } from '../lib/quality'

const SIZE = 340

/**
 * The studio floor. On the high tier it is a blurred mirror (the 2024 site's reflective floor);
 * on the low tier a dark glossy surface that reflects only the environment.
 * It is large enough that the fog hides its edge.
 */
export function Floor() {
  const tier = useTier()
  return (
    <mesh rotation-x={-Math.PI / 2} renderOrder={-5}>
      <planeGeometry args={[SIZE, SIZE]} />
      {tier === 'high' ? (
        <MeshReflectorMaterial
          resolution={768}
          blur={[420, 120]}
          mixBlur={0.85}
          mixStrength={3.2}
          mixContrast={1.05}
          mirror={0.72}
          depthScale={1.2}
          minDepthThreshold={0.35}
          maxDepthThreshold={1.4}
          color="#12151c"
          metalness={0.5}
          roughness={0.82}
        />
      ) : (
        <meshStandardMaterial color="#0b0d12" metalness={0.55} roughness={0.42} />
      )}
    </mesh>
  )
}
