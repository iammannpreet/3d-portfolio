// Turns the original Sketchfab models in models-src/ into the small files the site ships.
//
//   node scripts/optimize-models.mjs        (or: npm run optimize:models)
//
// What it does to each model:
//   - resizes the textures and re-encodes them as WebP (the originals are 4096px PNG/JPEG)
//   - quantises and compresses the geometry with meshopt
// Nothing about how the model looks or is named changes. three.js needs MeshoptDecoder set on its
// GLTFLoader to read the result (drei's useGLTF does that by default).
//
// The outputs are committed, so the site builds without running this.

import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, meshopt, prune, textureCompress } from '@gltf-transform/functions'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'
import sharp from 'sharp'
import { splitWheels } from './lib/split-wheels.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(root, 'models-src')
const OUT = path.join(root, 'src/assets/models')

/**
 * @typedef {object} Job
 * @property {string} source   file in models-src/
 * @property {string} output   file in src/assets/models/
 * @property {number} size     longest texture edge, pixels
 * @property {number} quality  WebP quality for colour, roughness/metal and emissive maps
 * @property {number} normalQuality  WebP quality for normal maps, which show artefacts first
 */

/** @type {Job[]} */
const JOBS = [
  { source: 'bike.glb', output: 'bike.glb', size: 2048, quality: 82, normalQuality: 90 },
  { source: 'bike.glb', output: 'bike-1k.glb', size: 1024, quality: 80, normalQuality: 88 },
  { source: 'helmet.glb', output: 'helmet.glb', size: 1024, quality: 82, normalQuality: 90 },
]

/** Transforms that must see the original, uncompressed geometry go here, keyed by source file. */
const EXTRA_TRANSFORMS = {
  'bike.glb': [splitWheels({ log: (message) => console.log(`  split-wheels: ${message}`) })],
}

function describe(document) {
  const gltf = document.getRoot()
  let triangles = 0
  for (const mesh of gltf.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const indices = prim.getIndices()
      const position = prim.getAttribute('POSITION')
      triangles += Math.floor((indices ? indices.getCount() : position.getCount()) / 3)
    }
  }
  const textures = gltf.listTextures().map((texture) => {
    const size = texture.getSize()
    return `${size ? size.join('x') : '?'} ${texture.getMimeType().replace('image/', '')}`
  })
  return {
    triangles,
    textures,
    nodes: gltf.listNodes().map((n) => n.getName()),
    materials: gltf.listMaterials().map((m) => m.getName()),
    extensions: gltf.listExtensionsUsed().map((e) => e.extensionName),
  }
}

const megabytes = (bytes) => `${(bytes / 1e6).toFixed(2)} MB`

async function run() {
  await MeshoptEncoder.ready
  await MeshoptDecoder.ready
  await mkdir(OUT, { recursive: true })

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    'meshopt.encoder': MeshoptEncoder,
    'meshopt.decoder': MeshoptDecoder,
  })

  const rows = []
  for (const job of JOBS) {
    const sourcePath = path.join(SRC, job.source)
    const outputPath = path.join(OUT, job.output)
    const document = await io.read(sourcePath)
    const before = describe(document)

    await document.transform(
      dedup(),
      prune(),
      ...(EXTRA_TRANSFORMS[job.source] ?? []),
      // Normal maps first, at higher quality; then every other slot.
      textureCompress({
        encoder: sharp,
        targetFormat: 'webp',
        resize: [job.size, job.size],
        slots: /^normalTexture$/,
        quality: job.normalQuality,
        effort: 90,
      }),
      textureCompress({
        encoder: sharp,
        targetFormat: 'webp',
        resize: [job.size, job.size],
        slots: /^(?!normalTexture$).*/,
        quality: job.quality,
        effort: 90,
      }),
      meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
    )

    await io.write(outputPath, document)

    // Read the file back: this is what the site will load.
    const after = describe(await io.read(outputPath))
    if (after.triangles !== before.triangles) {
      throw new Error(`${job.output}: triangle count changed ${before.triangles} -> ${after.triangles}`)
    }
    for (const name of before.materials) {
      if (!after.materials.includes(name)) throw new Error(`${job.output}: lost material "${name}"`)
    }
    if (before.extensions.includes('KHR_materials_emissive_strength') &&
        !after.extensions.includes('KHR_materials_emissive_strength')) {
      throw new Error(`${job.output}: lost KHR_materials_emissive_strength`)
    }

    const [sourceSize, outputSize] = await Promise.all([stat(sourcePath), stat(outputPath)])
    rows.push({
      output: job.output,
      before: megabytes(sourceSize.size),
      after: megabytes(outputSize.size),
      triangles: after.triangles,
      textures: `${after.textures.length} x ${[...new Set(after.textures)].join(', ')}`,
      extensions: after.extensions.join(', '),
    })
  }

  console.table(rows)
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
