import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Vector3, type Group, type PerspectiveCamera } from 'three'
import fontUrl from '@fontsource/bruno-ace/files/bruno-ace-latin-400-normal.woff?url'
import { site } from '../content/site'
import { quality } from '../lib/quality'
import { clamp, damp, smoothstep } from '../scroll/math'
import { rig } from '../scroll/store'

/** troika's text mesh, as far as this file uses it. */
interface TroikaText {
  fillOpacity: number
  curveRadius: number
  sync: () => void
}

interface RingSpec {
  labels: readonly string[]
  /** Metres from the helmet's vertical axis. */
  radius: number
  /** Height relative to the helmet centre, metres. */
  y: number
  /** Tilt of the ring's plane, radians. */
  tilt: number
  /** Radians per second; the sign sets the direction. */
  speed: number
  /** Cap height of the lettering, metres. */
  size: number
}

const RINGS: RingSpec[] = [
  { labels: site.skillRings.inner, radius: 0.27, y: 0.03, tilt: 0.14, speed: 0.17, size: 0.02 },
  { labels: site.skillRings.outer, radius: 0.36, y: -0.05, tilt: -0.09, speed: -0.12, size: 0.022 },
]

/** Bruno Ace is a wide face: one character advances about this many ems. */
const ADVANCE = 0.86
/** Every glyph the labels can use, so the glyph atlas is built once. */
const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.+#/&- '
const OUTER_RADIUS = Math.max(...RINGS.map((ring) => ring.radius))

interface Placed {
  text: string
  angle: number
}

/** Spaces labels round the ring in proportion to their length, sharing the leftover gap. */
function place(ring: RingSpec): Placed[] {
  const texts = ring.labels.map((label) => label.toUpperCase())
  const widths = texts.map((text) => (text.length * ring.size * ADVANCE) / ring.radius)
  const gap = Math.max(0.04, (Math.PI * 2 - widths.reduce((a, b) => a + b, 0)) / texts.length)
  let cursor = 0
  return texts.map((text, i) => {
    const angle = cursor + widths[i]! / 2
    cursor += widths[i]! + gap
    return { text, angle }
  })
}

const centre = new Vector3()
const toCamera = new Vector3()

function Ring({ spec }: { spec: RingSpec }) {
  const group = useRef<Group>(null)
  const texts = useRef<(TroikaText | null)[]>([])
  const placed = useMemo(() => place(spec), [spec])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    if (!quality.reducedMotion) g.rotation.y += spec.speed * Math.min(delta, 0.1)

    // Labels facing the camera are bright; the ones round the back are faint.
    g.getWorldPosition(centre)
    toCamera.copy(state.camera.position).sub(centre)
    const cameraAngle = Math.atan2(toCamera.x, toCamera.z)
    for (let i = 0; i < placed.length; i++) {
      const text = texts.current[i]
      if (!text) continue
      const facing = Math.cos(placed[i]!.angle + g.rotation.y - cameraAngle)
      text.fillOpacity = rig.ringOpacity * (0.07 + 0.93 * smoothstep(-0.15, 0.75, facing))
    }
  })

  return (
    <group position-y={spec.y} rotation-x={spec.tilt}>
      <group ref={group}>
        {placed.map((label, i) => (
          <Text
            key={label.text}
            ref={(instance: TroikaText | null) => {
              texts.current[i] = instance
              // Bend each label round the ring instead of leaving it flat like a paddle.
              if (instance && instance.curveRadius !== -spec.radius) {
                instance.curveRadius = -spec.radius
                instance.sync()
              }
            }}
            font={fontUrl}
            characters={CHARACTERS}
            fontSize={spec.size}
            letterSpacing={0.06}
            anchorX="center"
            anchorY="middle"
            color="#e4eaf5"
            fillOpacity={0}
            position={[Math.sin(label.angle) * spec.radius, 0, Math.cos(label.angle) * spec.radius]}
            rotation-y={label.angle}
            material-toneMapped={false}
            material-depthWrite={false}
          >
            {label.text}
          </Text>
        ))}
      </group>
    </group>
  )
}

/**
 * Two rings of skill names orbiting the helmet: the 2024 site's text carousel, rebuilt in the
 * scene so the labels pass behind the helmet. On narrow screens the rings shrink to stay in view.
 */
export function SkillRing() {
  const root = useRef<Group>(null)
  const fit = useRef(1)

  useFrame((state, delta) => {
    const g = root.current
    if (!g) return
    g.visible = rig.ringOpacity > 0.01
    if (!g.visible) return
    const camera = state.camera as PerspectiveCamera
    const halfWidth =
      rig.camDistance * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect
    const target = clamp((halfWidth * 0.94) / (OUTER_RADIUS + 0.03), 0.5, 1)
    fit.current = damp(fit.current, target, 6, Math.min(delta, 0.1))
    g.scale.setScalar(fit.current)
  })

  return (
    <group ref={root}>
      {RINGS.map((spec) => (
        <Ring key={spec.radius} spec={spec} />
      ))}
    </group>
  )
}
