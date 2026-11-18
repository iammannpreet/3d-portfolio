import { Box3, Vector3, type Group, type Material, type Mesh, type Object3D, type Texture } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { setModelProgress, type ModelName } from '../scroll/store'
import { BIKE, HELMET } from './anchors'

/**
 * Model loading. The files are fetched by hand rather than through a loader manager so the
 * loader on screen can show real download progress. Geometry is meshopt-compressed and textures
 * are WebP (see scripts/optimize-models.mjs); nothing here touches the network beyond the model.
 */

const loader = new GLTFLoader()
loader.setMeshoptDecoder(MeshoptDecoder)

const cache = new Map<string, Promise<Group>>()

async function download(url: string, onProgress: (fraction: number) => void): Promise<ArrayBuffer> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Could not load ${url} (HTTP ${response.status})`)
  const total = Number(response.headers.get('content-length')) || 0
  if (!response.body || total === 0) return response.arrayBuffer()

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let received = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.length
    // Parsing still has to happen after the download, so the bar stops just short of full.
    onProgress(Math.min(0.96, received / total))
  }
  const bytes = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }
  return bytes.buffer
}

/** Loads a model once; later calls with the same URL share the result. */
export function loadModel(name: ModelName, url: string): Promise<Group> {
  let pending = cache.get(url)
  if (!pending) {
    pending = download(url, (fraction) => setModelProgress(name, fraction))
      .then((buffer) => loader.parseAsync(buffer, ''))
      .then((gltf) => gltf.scene)
    cache.set(url, pending)
  }
  return pending
}

const box = new Box3()
const size = new Vector3()
const centre = new Vector3()
const prepared = new WeakSet<Object3D>()

/** 2.1 m long, wheels on y = 0, centred in X and Z. The model already faces +X. */
export function normaliseBike(model: Group): void {
  if (prepared.has(model)) return
  prepared.add(model)
  box.setFromObject(model).getSize(size)
  model.scale.multiplyScalar(BIKE.length / size.x)
  model.updateMatrixWorld(true)
  box.setFromObject(model).getCenter(centre)
  model.position.x -= centre.x
  model.position.z -= centre.z
  model.position.y -= box.min.y
  model.updateMatrixWorld(true)
}

/** 0.30 m tall, centred on its own origin. The model's visor already faces +Z. */
export function normaliseHelmet(model: Group): void {
  if (prepared.has(model)) return
  prepared.add(model)
  box.setFromObject(model).getSize(size)
  model.scale.multiplyScalar(HELMET.height / size.y)
  model.updateMatrixWorld(true)
  box.setFromObject(model).getCenter(centre)
  model.position.sub(centre)
  model.updateMatrixWorld(true)
}

type TexturedMaterial = Material & Record<string, unknown>

const TEXTURE_SLOTS = [
  'map',
  'normalMap',
  'roughnessMap',
  'metalnessMap',
  'aoMap',
  'emissiveMap',
] as const

/** Every distinct material in a model. */
export function materialsOf(model: Object3D): Material[] {
  const found = new Set<Material>()
  model.traverse((object) => {
    const mesh = object as Mesh
    if (!mesh.isMesh) return
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      found.add(material)
    }
  })
  return [...found]
}

/** Every distinct texture a model's materials use. */
export function texturesOf(model: Object3D): Texture[] {
  const found = new Set<Texture>()
  for (const material of materialsOf(model)) {
    for (const slot of TEXTURE_SLOTS) {
      const texture = (material as TexturedMaterial)[slot] as Texture | null | undefined
      if (texture?.isTexture) found.add(texture)
    }
  }
  return [...found]
}
