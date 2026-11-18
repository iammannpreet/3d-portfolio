import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { damp } from '../scroll/math'
import { rig } from '../scroll/store'
import { BIKE } from './anchors'

/** Metres of road between two milestone gates. */
export const GATE_SPACING = 26

/**
 * How far the bike has travelled. It is derived from the scroll-driven `gate` channel rather than
 * from time, so the road, the gates and the wheels stop when scrolling stops and rewind exactly
 * when scrolling back.
 */
export const world = {
  /** Metres along the road. */
  distance: 0,
  /** Smoothed metres per second; negative when rewinding. */
  speed: 0,
  /** Wheel rotation about the axle, radians. */
  wheelAngle: 0,
}

/** Updates `world` once per frame, after the camera rig and before anything that reads it. */
export function WorldClock() {
  const last = useRef<number | null>(null)
  useFrame((_, delta) => {
    const dt = Math.min(Math.max(delta, 1e-3), 0.1)
    const distance = rig.gate * GATE_SPACING
    const previous = last.current ?? distance
    last.current = distance
    world.speed = damp(world.speed, (distance - previous) / dt, 8, dt)
    world.distance = distance
    // Rolling toward +X turns the wheels clockwise seen from +Z: a negative angle about +Z.
    world.wheelAngle = -distance / BIKE.wheelRadius
  }, -60)
  return null
}
