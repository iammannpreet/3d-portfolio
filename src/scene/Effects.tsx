import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode, type BloomEffect } from 'postprocessing'
import { useRef } from 'react'
import { useTier } from '../lib/quality'
import { rig } from '../scroll/store'

/**
 * Post-processing: bloom on anything brighter than white (headlights, neon), a soft vignette, and
 * ACES tone mapping. The composer switches the renderer's own tone mapping off, so exposure is
 * passed through `toneMappingExposure`, which the tone-mapping pass reads.
 */
export function Effects() {
  const tier = useTier()
  const gl = useThree((state) => state.gl)
  const bloom = useRef<BloomEffect>(null)

  useFrame(() => {
    gl.toneMappingExposure = 0.08 + 0.92 * rig.exposure
    if (bloom.current) bloom.current.intensity = rig.bloom * 1.15
  }, -30)

  const high = tier === 'high'
  return (
    <EffectComposer multisampling={high ? 4 : 0} enableNormalPass={false}>
      <Bloom
        ref={bloom}
        mipmapBlur
        luminanceThreshold={0.85}
        luminanceSmoothing={0.3}
        levels={high ? 8 : 6}
        radius={0.72}
        resolutionScale={high ? 1 : 0.5}
      />
      <Vignette offset={0.32} darkness={0.62} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}
