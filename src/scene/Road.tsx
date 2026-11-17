import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  InstancedBufferAttribute,
  MeshBasicMaterial,
  ShaderMaterial,
  type InstancedMesh,
  type Fog,
  type FogExp2,
  type Group,
  type Mesh,
} from 'three'
import { site } from '../content/site'
import { rig } from '../scroll/store'
import { EMBER, ION } from './palette'
import { GATE_SPACING, world } from './world'

/*
 * Road layout across Z (the bike rides in the right-hand lane, centred on z = 0; its right side is +Z):
 *   z = +1.7   right edge line
 *   z = -1.7   dashed centre line
 *   z = -5.1   left edge line
 * The surface runs from z = -5.8 to +2.4 and is long enough that the fog hides both ends.
 */
const ROAD = { right: 1.7, centre: -1.7, left: -5.1, near: 2.4, far: -5.8, length: 320 }
const GATE = { left: -7.2, right: 6.6, height: 5.4, thickness: 0.14 }
const STREAKS = 44
const STREAK_SPAN = 140

const roadVertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`

const roadFragment = /* glsl */ `
  uniform float uOffset;
  uniform float uOpacity;
  uniform float uHeadlight;
  uniform vec3 uEmber;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  varying vec3 vWorld;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  // An antialiased stripe of width w centred on c.
  float stripe(float v, float c, float w) {
    float aa = fwidth(v) * 0.75;
    return 1.0 - smoothstep(w * 0.5 - aa, w * 0.5 + aa, abs(v - c));
  }

  void main() {
    float s = vWorld.x + uOffset;   // position along the road
    float z = vWorld.z;

    // Asphalt: very fine grain that fades out with distance so it never shimmers.
    float d = distance(vWorld, cameraPosition);
    float grain = (hash(floor(vec2(s, z) * 40.0)) - 0.5) * 0.008 * (1.0 - smoothstep(4.0, 14.0, d));
    vec3 colour = vec3(0.02, 0.022, 0.027) + grain;

    float edges = stripe(z, ${ROAD.right.toFixed(2)}, 0.12) + stripe(z, ${ROAD.left.toFixed(2)}, 0.12);
    float dashPhase = fract(s / 9.0);
    float aaS = fwidth(s / 9.0);
    float dash = smoothstep(0.0, aaS, dashPhase) * (1.0 - smoothstep(0.42, 0.42 + aaS, dashPhase));
    float centre = stripe(z, ${ROAD.centre.toFixed(2)}, 0.15) * dash;

    colour += vec3(0.32, 0.35, 0.4) * edges;
    colour += uEmber * 1.7 * centre;

    // The headlight's pool on the road ahead of the bike.
    float ahead = vWorld.x - 0.9;
    float pool = smoothstep(0.0, 1.5, ahead) * exp(-pow((ahead - 4.5) / 4.0, 2.0) - pow(z / 1.35, 2.0));
    colour += vec3(0.16, 0.19, 0.22) * pool * uHeadlight;

    float fogAmount = 1.0 - exp(-uFogDensity * uFogDensity * d * d);
    colour = mix(colour, uFogColor, fogAmount);

    // Soft sides, so the road reads as laid on the floor rather than as a slab.
    float side = smoothstep(${ROAD.far.toFixed(2)}, ${(ROAD.far + 0.6).toFixed(2)}, z) * (1.0 - smoothstep(${(ROAD.near - 0.6).toFixed(2)}, ${ROAD.near.toFixed(2)}, z));
    gl_FragColor = vec4(colour, uOpacity * side);
    #include <colorspace_fragment>
  }
`

const streakVertex = /* glsl */ `
  attribute vec4 aSeed;     // x, y, z, colour index
  uniform float uOffset;
  uniform float uStretch;
  varying float vU;
  varying float vColour;
  varying float vFade;
  void main() {
    float span = ${STREAK_SPAN.toFixed(1)};
    float x = mod(aSeed.x - uOffset + span * 0.5, span) - span * 0.5;
    vec3 p = position;
    vU = p.x + 0.5;                 // 0 at the tail, 1 at the head
    p.x *= uStretch;
    p += vec3(x, aSeed.y, aSeed.z);
    vColour = aSeed.w;
    vFade = 1.0 - smoothstep(span * 0.32, span * 0.5, abs(x));
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p, 1.0);
  }
`

const streakFragment = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uEmber;
  uniform vec3 uIon;
  varying float vU;
  varying float vColour;
  varying float vFade;
  void main() {
    vec3 c = vColour < 0.5 ? uEmber * 3.0 : vColour < 1.5 ? uIon * 2.4 : vec3(2.2);
    float a = smoothstep(0.0, 0.85, vU) * smoothstep(1.0, 0.92, vU) * vFade * uOpacity;
    gl_FragColor = vec4(c * a, a);
  }
`

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/**
 * The open road: asphalt with a glowing dashed centre line, light streaks flowing past on both
 * sides, and one neon gate per milestone. Everything is placed from `world.distance`, which is
 * driven by scrolling.
 */
export function Road() {
  const surface = useRef<Mesh>(null)
  const streaks = useRef<InstancedMesh>(null)
  const gates = useRef<Group>(null)

  const roadMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: roadVertex,
        fragmentShader: roadFragment,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        uniforms: {
          uOffset: { value: 0 },
          uOpacity: { value: 0 },
          uHeadlight: { value: 0 },
          uEmber: { value: EMBER.clone() },
          uFogColor: { value: new Color() },
          uFogDensity: { value: 0.02 },
        },
      }),
    [],
  )

  const streak = useMemo(() => {
    const random = seeded(11)
    // Two crossed quads along X, one upright and one flat, so a streak shows from any angle.
    const h = 0.03
    const geometry = new BufferGeometry()
    geometry.setAttribute(
      'position',
      new BufferAttribute(
        new Float32Array([
          -0.5, -h, 0, 0.5, -h, 0, 0.5, h, 0, -0.5, h, 0,
          -0.5, 0, -h, 0.5, 0, -h, 0.5, 0, h, -0.5, 0, h,
        ]),
        3,
      ),
    )
    geometry.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7])

    const seeds = new Float32Array(STREAKS * 4)
    for (let i = 0; i < STREAKS; i++) {
      const left = i % 2 === 0
      seeds[i * 4] = random() * STREAK_SPAN
      seeds[i * 4 + 1] = 0.25 + random() * 2.6
      seeds[i * 4 + 2] = left ? -6.4 - random() * 3 : 3.0 + random() * 3.2
      seeds[i * 4 + 3] = random() < 0.45 ? 0 : random() < 0.75 ? 1 : 2
    }
    geometry.setAttribute('aSeed', new InstancedBufferAttribute(seeds, 4))
    const material = new ShaderMaterial({
      vertexShader: streakVertex,
      fragmentShader: streakFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide,
      uniforms: {
        uOffset: { value: 0 },
        uStretch: { value: 1 },
        uOpacity: { value: 0 },
        uEmber: { value: EMBER.clone() },
        uIon: { value: ION.clone() },
      },
    })
    return { geometry, material }
  }, [])

  const gateParts = useMemo(() => {
    const material = new MeshBasicMaterial({ color: EMBER.clone().multiplyScalar(2.6), toneMapped: false, transparent: true })
    const post = new BoxGeometry(GATE.thickness, GATE.height, GATE.thickness)
    const beam = new BoxGeometry(GATE.thickness, GATE.thickness, GATE.right - GATE.left)
    const line = new BoxGeometry(0.16, 0.01, ROAD.near - ROAD.far - 1.2)
    return { material, post, beam, line }
  }, [])

  useFrame((state) => {
    const road = rig.road
    const fog = state.scene.fog as Fog | FogExp2 | null

    const s = surface.current
    if (s) {
      s.visible = road > 0.01
      const u = roadMaterial.uniforms
      u.uOffset!.value = world.distance
      u.uOpacity!.value = road
      u.uHeadlight!.value = rig.engine * rig.exposure
      if (fog) {
        ;(u.uFogColor!.value as Color).copy(fog.color)
        u.uFogDensity!.value = 'density' in fog ? fog.density : 0.02
      }
    }

    const st = streaks.current
    if (st) {
      const opacity = road * rig.speed
      st.visible = opacity > 0.01
      const u = streak.material.uniforms
      u.uOffset!.value = world.distance
      u.uStretch!.value = 1.5 + Math.min(Math.abs(world.speed), 60) * 0.22
      u.uOpacity!.value = opacity
    }

    const g = gates.current
    if (g) {
      g.visible = road > 0.3
      gateParts.material.opacity = road
      g.children.forEach((gate, i) => {
        const x = i * GATE_SPACING - world.distance
        gate.position.x = x
        gate.visible = x > -80 && x < 140
      })
    }
  }, -40)

  return (
    <group>
      <mesh ref={surface} material={roadMaterial} rotation-x={-Math.PI / 2} position={[0, 0.002, (ROAD.near + ROAD.far) / 2]} renderOrder={-4} frustumCulled={false}>
        <planeGeometry args={[ROAD.length, ROAD.near - ROAD.far]} />
      </mesh>
      <instancedMesh ref={streaks} args={[streak.geometry, streak.material, STREAKS]} frustumCulled={false} />
      <group ref={gates}>
        {site.milestones.map((milestone) => (
          <group key={milestone.id}>
            <mesh geometry={gateParts.post} material={gateParts.material} position={[0, GATE.height / 2, GATE.left]} />
            <mesh geometry={gateParts.post} material={gateParts.material} position={[0, GATE.height / 2, GATE.right]} />
            <mesh geometry={gateParts.beam} material={gateParts.material} position={[0, GATE.height, (GATE.left + GATE.right) / 2]} />
            <mesh geometry={gateParts.line} material={gateParts.material} position={[0, 0.006, (ROAD.near + ROAD.far) / 2]} />
          </group>
        ))}
      </group>
    </group>
  )
}
