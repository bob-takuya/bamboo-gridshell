import type { GridshellParams, GridshellGeometryData, Vec3, Stick, BOM } from './types'

function surfaceZ(x: number, y: number, params: GridshellParams): number {
  const { width, depth, rise, surface } = params
  const nx = 2 * x / width  // normalized [-1, 1]
  const ny = 2 * y / depth

  switch (surface) {
    case 'paraboloid':
      return Math.max(0, rise * (1 - nx * nx - ny * ny))
    case 'barrel':
      return Math.max(0, rise * (1 - nx * nx))
    case 'dome': {
      const r2 = nx * nx + ny * ny
      return r2 <= 1 ? rise * Math.sqrt(1 - r2) : 0
    }
  }
}

export function computeGridshell(params: GridshellParams): GridshellGeometryData {
  const { width, depth, pitch } = params

  // Diamond (Chebyshev) grid: 45-degree rotated
  // In rotated coordinates u, v, step = pitch
  // u = (x + y) / sqrt(2), v = (-x + y) / sqrt(2)
  // Grid in u,v space, then back to x,y

  const step = pitch
  const halfW = width / 2
  const halfD = depth / 2

  // Generate node grid in diagonal space
  // u ranges: from -(halfW+halfD)/sqrt2 to +(halfW+halfD)/sqrt2
  const diagRange = (halfW + halfD) * Math.SQRT2
  const uMin = -diagRange
  const uMax = diagRange
  const vMin = -diagRange
  const vMax = diagRange

  const nodes: Vec3[] = []
  const nodeMap = new Map<string, number>()

  function key(ui: number, vi: number) { return `${ui},${vi}` }

  const iMin = Math.ceil(uMin / step)
  const iMax = Math.floor(uMax / step)
  const jMin = Math.ceil(vMin / step)
  const jMax = Math.floor(vMax / step)

  for (let i = iMin; i <= iMax; i++) {
    for (let j = jMin; j <= jMax; j++) {
      const u = i * step
      const v = j * step
      // Back to world: x = (u - v)/sqrt2, y = (u + v)/sqrt2
      const x = (u - v) / Math.SQRT2
      const y = (u + v) / Math.SQRT2
      // Only keep nodes inside bounding box
      if (x < -halfW || x > halfW || y < -halfD || y > halfD) continue
      const z = surfaceZ(x, y, params)
      const idx = nodes.length
      nodes.push({ x, y, z })
      nodeMap.set(key(i, j), idx)
    }
  }

  const familyA: Stick[] = []
  const familyB: Stick[] = []

  // Family A: connect (i,j) -> (i+1,j)  [along u direction]
  // Family B: connect (i,j) -> (i,j+1)  [along v direction]
  for (let i = iMin; i <= iMax; i++) {
    for (let j = jMin; j <= jMax; j++) {
      const fromIdx = nodeMap.get(key(i, j))
      if (fromIdx === undefined) continue

      const aIdx = nodeMap.get(key(i + 1, j))
      if (aIdx !== undefined) {
        const n1 = nodes[fromIdx], n2 = nodes[aIdx]
        const len = Math.sqrt((n2.x-n1.x)**2 + (n2.y-n1.y)**2 + (n2.z-n1.z)**2)
        familyA.push({ from: fromIdx, to: aIdx, length: len })
      }

      const bIdx = nodeMap.get(key(i, j + 1))
      if (bIdx !== undefined) {
        const n1 = nodes[fromIdx], n2 = nodes[bIdx]
        const len = Math.sqrt((n2.x-n1.x)**2 + (n2.y-n1.y)**2 + (n2.z-n1.z)**2)
        familyB.push({ from: fromIdx, to: bIdx, length: len })
      }
    }
  }

  return { nodes, familyA, familyB }
}

export function computeBOM(geo: GridshellGeometryData): BOM {
  const allSticks = [...geo.familyA, ...geo.familyB]
  const totalLength = allSticks.reduce((s, st) => s + st.length, 0)

  // Bin by 5cm
  const binSize = 5
  const bins = new Map<number, number>()
  for (const st of allSticks) {
    const bin = Math.round(st.length / binSize) * binSize
    bins.set(bin, (bins.get(bin) ?? 0) + 1)
  }

  const lengthBins = Array.from(bins.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([len, count]) => ({ label: `${len}cm`, count }))

  return {
    familyACount: geo.familyA.length,
    familyBCount: geo.familyB.length,
    totalLength,
    lengthBins
  }
}
