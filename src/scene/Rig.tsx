import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { PerspectiveCamera } from 'three'
import { quality } from '../lib/quality'
import { clamp, damp } from '../scroll/math'
import { rig } from '../scroll/store'

/** How far the camera swings with the pointer, radians at the screen edge. */
const PARALLAX_AZIMUTH = 0.045
const PARALLAX_POLAR = 0.025

/**
 * Drives the camera from the scroll rig. This is the one place that turns the rig's orbit
 * channels into a camera transform; see the conventions at the top of `scroll/types.ts`.
 *
 * It runs before every other frame callback, so scene components always see this frame's camera.
 */
export function Rig() {
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const size = useThree((state) => state.size)
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const lastShift = useRef({ x: Number.NaN, y: Number.NaN, w: 0, h: 0 })

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const onMove = (event: PointerEvent) => {
      pointer.current.tx = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.ty = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const p = pointer.current
    const parallax = quality.reducedMotion ? 0 : 1
    p.x = damp(p.x, p.tx * parallax, 3.5, dt)
    p.y = damp(p.y, p.ty * parallax, 3.5, dt)

    const azimuth = rig.camAzimuth + p.x * PARALLAX_AZIMUTH
    const polar = clamp(rig.camPolar - p.y * PARALLAX_POLAR, 0.05, Math.PI - 0.05)
    const distance = Math.max(0.05, rig.camDistance)
    const [tx, ty, tz] = rig.camTarget
    const sinPolar = Math.sin(polar)

    camera.position.set(
      tx + distance * sinPolar * Math.sin(azimuth),
      ty + distance * Math.cos(polar),
      tz + distance * sinPolar * Math.cos(azimuth),
    )
    camera.up.set(0, 1, 0)
    camera.lookAt(tx, ty, tz)
    if (rig.camRoll !== 0) camera.rotateZ(rig.camRoll)

    let projectionDirty = false
    if (Math.abs(camera.fov - rig.camFov) > 0.005) {
      camera.fov = rig.camFov
      projectionDirty = true
    }

    // Lens shift: slide the subject across the screen without changing its perspective.
    const shiftX = Math.round(-rig.camShiftX * size.width)
    const shiftY = Math.round(rig.camShiftY * size.height)
    const last = lastShift.current
    if (shiftX !== last.x || shiftY !== last.y || size.width !== last.w || size.height !== last.h) {
      last.x = shiftX
      last.y = shiftY
      last.w = size.width
      last.h = size.height
      if (shiftX === 0 && shiftY === 0) camera.clearViewOffset()
      else camera.setViewOffset(size.width, size.height, shiftX, shiftY, size.width, size.height)
      projectionDirty = false // both calls above update the projection matrix
    }
    if (projectionDirty) camera.updateProjectionMatrix()
  }, -100)

  return null
}
