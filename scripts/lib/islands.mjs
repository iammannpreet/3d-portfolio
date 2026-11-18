// Finds the connected pieces ("islands") of a glTF document's triangle meshes.
// Vertices are joined by position only, so seams in UVs or normals do not split a piece.

/** @typedef {{ prim: import('@gltf-transform/core').Primitive, mesh: import('@gltf-transform/core').Mesh, triangles: number[] }} PrimPart */
/** @typedef {{ id: number, parts: Map<import('@gltf-transform/core').Primitive, PrimPart>, triangles: number, min: number[], max: number[] }} Island */

const WELD = 1e4 // positions closer than 0.1 mm (in model units) count as the same point

/**
 * @param {import('@gltf-transform/core').Document} document
 * @returns {Island[]}
 */
export function findIslands(document) {
  const ids = new Map()
  const parent = []
  const find = (a) => {
    while (parent[a] !== a) {
      parent[a] = parent[parent[a]]
      a = parent[a]
    }
    return a
  }
  const union = (a, b) => {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent[ra] = rb
  }
  const pointId = (x, y, z) => {
    const key = `${Math.round(x * WELD)},${Math.round(y * WELD)},${Math.round(z * WELD)}`
    let id = ids.get(key)
    if (id === undefined) {
      id = parent.length
      parent.push(id)
      ids.set(key, id)
    }
    return id
  }

  const prims = []
  for (const mesh of document.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const position = prim.getAttribute('POSITION')
      const indices = prim.getIndices()
      if (!position || prim.getMode() !== 4) continue
      const pos = position.getArray()
      const count = position.getCount()
      const vertexPoint = new Int32Array(count)
      for (let v = 0; v < count; v++) vertexPoint[v] = pointId(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2])
      const index = indices ? indices.getArray() : Uint32Array.from({ length: count }, (_, i) => i)
      for (let t = 0; t < index.length; t += 3) {
        union(vertexPoint[index[t]], vertexPoint[index[t + 1]])
        union(vertexPoint[index[t]], vertexPoint[index[t + 2]])
      }
      prims.push({ mesh, prim, pos, index, vertexPoint })
    }
  }

  const islands = new Map()
  for (const { mesh, prim, pos, index, vertexPoint } of prims) {
    for (let t = 0; t < index.length; t += 3) {
      const root = find(vertexPoint[index[t]])
      let island = islands.get(root)
      if (!island) {
        island = { id: root, parts: new Map(), triangles: 0, min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }
        islands.set(root, island)
      }
      let part = island.parts.get(prim)
      if (!part) {
        part = { prim, mesh, triangles: [] }
        island.parts.set(prim, part)
      }
      part.triangles.push(t / 3)
      island.triangles++
      for (let k = 0; k < 3; k++) {
        const v = index[t + k]
        for (let a = 0; a < 3; a++) {
          const value = pos[v * 3 + a]
          if (value < island.min[a]) island.min[a] = value
          if (value > island.max[a]) island.max[a] = value
        }
      }
    }
  }
  return [...islands.values()]
}
