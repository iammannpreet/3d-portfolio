// Splits the bike's wheels out of its single merged mesh, so they can spin.
//
// The model is one object, but its parts are still separate pieces of geometry. A wheel part
// (tyre, rim, hub) is round and centred on an axle, so its bounding box seen from the side is
// a square centred there. Parts like the forks and swingarm are not, and stay where they are.
// Each wheel becomes a node ("wheel_front", "wheel_rear") placed at its axle, with geometry
// centred on it: rotating the node about its local Z axis turns the wheel in place.
//
// It must run before quantisation and compression.

import { findIslands } from './islands.mjs'

/** How far a part's centre may sit from the axle, and how far from square it may be (model units). */
const CENTRE_TOLERANCE = 0.02
const SQUARE_TOLERANCE = 0.02

/** Copies the listed triangles of `prim` into a new primitive, keeping only the vertices they use. */
function subsetPrimitive(document, prim, triangles, offset = [0, 0, 0]) {
  const indices = prim.getIndices()
  const source = indices ? indices.getArray() : null
  const remap = new Map()
  const order = []
  const newIndex = new Uint32Array(triangles.length * 3)
  triangles.forEach((t, n) => {
    for (let k = 0; k < 3; k++) {
      const v = source ? source[t * 3 + k] : t * 3 + k
      let mapped = remap.get(v)
      if (mapped === undefined) {
        mapped = order.length
        remap.set(v, mapped)
        order.push(v)
      }
      newIndex[n * 3 + k] = mapped
    }
  })

  const out = document.createPrimitive().setMode(prim.getMode()).setMaterial(prim.getMaterial())
  for (const semantic of prim.listSemantics()) {
    const accessor = prim.getAttribute(semantic)
    const size = accessor.getElementSize()
    const array = accessor.getArray()
    const copy = new array.constructor(order.length * size)
    order.forEach((v, i) => {
      for (let c = 0; c < size; c++) copy[i * size + c] = array[v * size + c]
    })
    if (semantic === 'POSITION') {
      for (let i = 0; i < order.length; i++) {
        copy[i * 3] -= offset[0]
        copy[i * 3 + 1] -= offset[1]
        copy[i * 3 + 2] -= offset[2]
      }
    }
    out.setAttribute(
      semantic,
      document
        .createAccessor()
        .setType(accessor.getType())
        .setArray(copy)
        .setNormalized(accessor.getNormalized())
        .setBuffer(accessor.getBuffer()),
    )
  }
  const indexArray = order.length < 65536 ? Uint16Array.from(newIndex) : newIndex
  out.setIndices(document.createAccessor().setType('SCALAR').setArray(indexArray).setBuffer(indices?.getBuffer() ?? null))
  return out
}

/**
 * @param {{ log?: (message: string) => void }} [options]
 * @returns {(document: import('@gltf-transform/core').Document) => void}
 */
export function splitWheels(options = {}) {
  const log = options.log ?? (() => {})
  return (document) => {
    const islands = findIslands(document)
    const centre = (i) => [(i.min[0] + i.max[0]) / 2, (i.min[1] + i.max[1]) / 2, (i.min[2] + i.max[2]) / 2]
    const isRound = (i) => Math.abs(i.max[0] - i.min[0] - (i.max[1] - i.min[1])) < SQUARE_TOLERANCE

    // The two largest round parts that sit low in the model are the tyres.
    const minY = Math.min(...islands.map((i) => i.min[1]))
    const tyres = islands
      .filter((i) => isRound(i) && Math.abs(i.min[1] - minY) < 0.01)
      .sort((a, b) => b.max[0] - b.min[0] - (a.max[0] - a.min[0]))
      .slice(0, 2)
    if (tyres.length !== 2) throw new Error(`split-wheels: expected 2 tyres, found ${tyres.length}`)

    const wheels = tyres
      .map((tyre) => {
        const axle = centre(tyre)
        const radius = (tyre.max[0] - tyre.min[0]) / 2
        const parts = islands.filter((i) => {
          const c = centre(i)
          return (
            isRound(i) &&
            Math.hypot(c[0] - axle[0], c[1] - axle[1]) < CENTRE_TOLERANCE &&
            (i.max[0] - i.min[0]) / 2 <= radius + 1e-4
          )
        })
        return { name: axle[0] > 0 ? 'wheel_front' : 'wheel_rear', axle, radius, parts }
      })
      .sort((a, b) => a.name.localeCompare(b.name))

    // Every mesh node in this model shares one parent; the wheels join it.
    const root = document.getRoot()
    const meshNodes = root.listNodes().filter((n) => n.getMesh())
    const parent = root.listNodes().find((n) => n.listChildren().includes(meshNodes[0]))
    if (!parent) throw new Error('split-wheels: could not find the parent of the mesh nodes')
    for (const node of meshNodes) {
      const t = node.getTranslation()
      const r = node.getRotation()
      const s = node.getScale()
      if (t.some((v) => v !== 0) || r[3] !== 1 || s.some((v) => v !== 1)) {
        throw new Error('split-wheels: mesh nodes are expected to have no transform of their own')
      }
    }

    const removed = new Map() // primitive -> Set of triangle indices moved to a wheel
    for (const wheel of wheels) {
      // The mesh gets its own name so the loader keeps the node's name exactly as written.
      const mesh = document.createMesh(`${wheel.name}_mesh`)
      for (const island of wheel.parts) {
        for (const part of island.parts.values()) {
          mesh.addPrimitive(subsetPrimitive(document, part.prim, part.triangles, wheel.axle))
          const set = removed.get(part.prim) ?? new Set()
          for (const t of part.triangles) set.add(t)
          removed.set(part.prim, set)
        }
      }
      const node = document.createNode(wheel.name).setMesh(mesh).setTranslation(wheel.axle)
      parent.addChild(node)
      const tris = wheel.parts.reduce((sum, i) => sum + i.triangles, 0)
      log(
        `${wheel.name}: axle (${wheel.axle.map((v) => v.toFixed(4)).join(', ')}), radius ${wheel.radius.toFixed(4)}, ` +
          `${wheel.parts.length} parts, ${tris} triangles`,
      )
    }

    // Take the wheel triangles out of the body.
    for (const [prim, gone] of removed) {
      const total = (prim.getIndices()?.getCount() ?? prim.getAttribute('POSITION').getCount()) / 3
      const keep = []
      for (let t = 0; t < total; t++) if (!gone.has(t)) keep.push(t)
      const body = subsetPrimitive(document, prim, keep)
      for (const mesh of root.listMeshes()) {
        if (mesh.listPrimitives().includes(prim)) {
          mesh.removePrimitive(prim)
          mesh.addPrimitive(body)
        }
      }
      prim.dispose()
    }
  }
}
