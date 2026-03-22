export type SurfaceType = 'paraboloid' | 'barrel' | 'dome'

export interface GridshellParams {
  width: number    // cm
  depth: number    // cm
  rise: number     // cm
  pitch: number    // cm
  surface: SurfaceType
}

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface Stick {
  from: number  // node index
  to: number    // node index
  length: number // cm
}

export interface GridshellGeometryData {
  nodes: Vec3[]
  familyA: Stick[]  // one diagonal direction
  familyB: Stick[]  // other diagonal direction
}

export interface BOM {
  familyACount: number
  familyBCount: number
  totalLength: number  // cm
  lengthBins: { label: string; count: number }[]
}
