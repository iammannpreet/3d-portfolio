import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  FogExp2,
  ShaderMaterial,
  Vector3,
  type Points,
} from 'three'
import { quality } from '../lib/quality'
import { rig } from '../scroll/store'
import { SKY_BELOW, SKY_GLOW, SKY_HORIZON, SKY_TOP } from './palette'

const SKY_RADIUS = 160
const STAR_RADIUS = 150
const STAR_COUNT = 1400
const TRAIL = 26

/** Seeded random numbers, so the star field is the same on every visit. */
function random(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 p = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * p;
    gl_Position.z = gl_Position.w; // always on the far plane
  }
`

const skyFragment = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uGlow;
  uniform vec3 uBelow;
  uniform float uDim;
  varying vec3 vDir;
  void main() {
    float y = vDir.y;
    vec3 colour = y >= 0.0
      ? mix(uHorizon, uTop, smoothstep(0.0, 0.42, y)) + uGlow * exp(-y * 11.0)
      : mix(uHorizon + uGlow, uBelow, smoothstep(0.0, 0.08, -y));
    gl_FragColor = vec4(colour * uDim, 1.0);
    #include <colorspace_fragment>
  }
`

const starVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vTwinkle;
  void main() {
    vTwinkle = 0.62 + 0.38 * sin(uTime * (0.6 + fract(aPhase * 7.13) * 1.6) + aPhase * 6.2831);
    vec4 p = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * p;
    gl_PointSize = aSize * uPixelRatio;
  }
`

const starFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vec3(0.85, 0.9, 1.0) * vTwinkle * 1.15, a * uOpacity);
  }
`

const trailFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d) * vFade;
    gl_FragColor = vec4(vec3(1.4, 1.5, 1.7), a * uOpacity);
  }
`

const trailVertex = /* glsl */ `
  attribute float aFade;
  uniform float uPixelRatio;
  varying float vFade;
  void main() {
    vFade = aFade;
    vec4 p = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * p;
    gl_PointSize = (1.2 + 2.6 * aFade) * uPixelRatio;
  }
`

const top = new Color()
const horizon = new Color()
const glow = new Color()
const fog = new Color()
const forward = new Vector3()

/**
 * The sky dome (dusk to night), the star field with an occasional shooting star, and the fog.
 * The fog colour always equals the sky's horizon colour, so the floor fades into the sky.
 */
export function Atmosphere() {
  const scene = useThree((state) => state.scene)
  const pixelRatio = useThree((state) => state.viewport.dpr)

  const skyMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
        side: BackSide,
        depthWrite: false,
        uniforms: {
          uTop: { value: new Color() },
          uHorizon: { value: new Color() },
          uGlow: { value: new Color() },
          uBelow: { value: SKY_BELOW.clone() },
          uDim: { value: 1 },
        },
      }),
    [],
  )

  const stars = useMemo(() => {
    const rand = random(7)
    const positions = new Float32Array(STAR_COUNT * 3)
    const sizes = new Float32Array(STAR_COUNT)
    const phases = new Float32Array(STAR_COUNT)
    for (let i = 0; i < STAR_COUNT; i++) {
      const azimuth = rand() * Math.PI * 2
      // More stars higher up, none right on the horizon where the glow is.
      const elevation = 0.06 + Math.asin(rand()) * 0.94
      positions[i * 3] = Math.cos(elevation) * Math.sin(azimuth) * STAR_RADIUS
      positions[i * 3 + 1] = Math.sin(elevation) * STAR_RADIUS
      positions[i * 3 + 2] = Math.cos(elevation) * Math.cos(azimuth) * STAR_RADIUS
      const r = rand()
      sizes[i] = r > 0.985 ? 3.4 : r > 0.9 ? 2.3 : 1.25 + rand() * 0.8
      phases[i] = rand()
    }
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    geometry.setAttribute('aSize', new BufferAttribute(sizes, 1))
    geometry.setAttribute('aPhase', new BufferAttribute(phases, 1))
    const material = new ShaderMaterial({
      vertexShader: starVertex,
      fragmentShader: starFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uPixelRatio: { value: 1 } },
    })
    return { geometry, material }
  }, [])

  const trail = useMemo(() => {
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(TRAIL * 3), 3))
    const fades = new Float32Array(TRAIL)
    for (let i = 0; i < TRAIL; i++) fades[i] = (1 - i / (TRAIL - 1)) ** 1.6
    geometry.setAttribute('aFade', new BufferAttribute(fades, 1))
    const material = new ShaderMaterial({
      vertexShader: trailVertex,
      fragmentShader: trailFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uOpacity: { value: 0 }, uPixelRatio: { value: 1 } },
    })
    return { geometry, material }
  }, [])

  const trailRef = useRef<Points>(null)
  const shooting = useRef({ next: 3, start: 0, from: new Vector3(), dir: new Vector3() })
  const rand = useMemo(() => random(42), [])
  const fogRef = useRef<FogExp2 | null>(null)
  if (!fogRef.current) {
    fogRef.current = new FogExp2('#000000', 0.02)
    scene.fog = fogRef.current
  }

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const mood = rig.mood
    const dim = (1 - 0.72 * rig.garage) * (0.25 + 0.75 * rig.exposure)

    top.copy(SKY_TOP.dusk).lerp(SKY_TOP.night, mood)
    horizon.copy(SKY_HORIZON.dusk).lerp(SKY_HORIZON.night, mood)
    glow.copy(SKY_GLOW.dusk).lerp(SKY_GLOW.night, mood)
    const u = skyMaterial.uniforms
    ;(u.uTop!.value as Color).copy(top)
    ;(u.uHorizon!.value as Color).copy(horizon)
    ;(u.uGlow!.value as Color).copy(glow)
    u.uDim!.value = dim

    const f = fogRef.current!
    f.color.copy(fog.copy(horizon).add(glow).multiplyScalar(dim))
    f.density = 0.004 + rig.fog * 0.05

    const starOpacity = rig.stars * (1 - 0.85 * rig.garage) * Math.min(1, rig.exposure * 1.4)
    stars.material.uniforms.uTime!.value = quality.reducedMotion ? 0 : t
    stars.material.uniforms.uOpacity!.value = starOpacity
    stars.material.uniforms.uPixelRatio!.value = pixelRatio

    // Shooting star: one every few seconds while the sky is dark enough to see it.
    const s = shooting.current
    const points = trailRef.current
    let trailOpacity = 0
    if (points) {
      if (t > s.next && starOpacity > 0.45 && !quality.reducedMotion) {
        state.camera.getWorldDirection(forward)
        const azimuth = Math.atan2(forward.x, forward.z) + (rand() - 0.5) * 1.3
        const elevation = 0.38 + rand() * 0.42
        s.from.set(
          Math.cos(elevation) * Math.sin(azimuth),
          Math.sin(elevation),
          Math.cos(elevation) * Math.cos(azimuth),
        ).multiplyScalar(STAR_RADIUS - 5)
        const side = rand() > 0.5 ? 1 : -1
        s.dir.set(Math.cos(azimuth) * side, -0.55 - rand() * 0.3, -Math.sin(azimuth) * side).normalize()
        s.start = t
        s.next = t + 5 + rand() * 7
      }
      const age = t - s.start
      const life = 0.85
      if (age >= 0 && age < life && s.start > 0) {
        const progress = age / life
        const head = progress * 34
        const position = points.geometry.getAttribute('position') as BufferAttribute
        for (let i = 0; i < TRAIL; i++) {
          const back = Math.max(0, head - i * 0.55)
          position.setXYZ(
            i,
            s.from.x + s.dir.x * back,
            s.from.y + s.dir.y * back,
            s.from.z + s.dir.z * back,
          )
        }
        position.needsUpdate = true
        trailOpacity = starOpacity * Math.sin(progress * Math.PI)
      }
    }
    trail.material.uniforms.uOpacity!.value = trailOpacity
    trail.material.uniforms.uPixelRatio!.value = pixelRatio
  }, -40)

  return (
    <group>
      <mesh material={skyMaterial} renderOrder={-10} frustumCulled={false}>
        <sphereGeometry args={[SKY_RADIUS, 48, 24]} />
      </mesh>
      <points geometry={stars.geometry} material={stars.material} frustumCulled={false} renderOrder={-9} />
      <points ref={trailRef} geometry={trail.geometry} material={trail.material} frustumCulled={false} renderOrder={-8} />
    </group>
  )
}
