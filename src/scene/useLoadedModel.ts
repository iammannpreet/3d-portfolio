import { useThree } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import type { Group } from 'three'
import { setModelReady, type ModelName } from '../scroll/store'
import { loadModel, texturesOf } from './models'

/**
 * Loads a model and returns it once it is ready to draw, or null until then.
 * Pass `url = null` to hold off loading. `prepare` must be a stable (module-level) function.
 * A failed load throws during render, which hands the page over to the static fallback.
 */
export function useLoadedModel(
  name: ModelName,
  url: string | null,
  prepare: (model: Group) => void,
): Group | null {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)
  const [model, setModel] = useState<Group | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!url) return
    let alive = true
    loadModel(name, url)
      .then(async (loaded) => {
        prepare(loaded)
        // Upload textures and compile shaders while the model is still hidden, so the frame it
        // first appears in does not stall.
        for (const texture of texturesOf(loaded)) gl.initTexture(texture)
        await gl.compileAsync(loaded, camera, scene)
        if (!alive) return
        setModel(loaded)
        setModelReady(name)
      })
      .catch((cause: unknown) => {
        if (alive) setError(cause instanceof Error ? cause : new Error(String(cause)))
      })
    return () => {
      alive = false
    }
  }, [name, url, prepare, gl, scene, camera])

  if (error) throw error
  return model
}
