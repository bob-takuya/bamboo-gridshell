import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { GridshellGeometryData } from './types'

export class GridshellScene {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private controls: OrbitControls
  private lineGroupA: THREE.Group
  private lineGroupB: THREE.Group
  private nodeGroup: THREE.Group
  private animId: number = 0

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setClearColor(0x0a0a0a)

    this.scene = new THREE.Scene()

    // Grid helper (subtle)
    const gridHelper = new THREE.GridHelper(200, 20, 0x1a1a1a, 0x1a1a1a)
    this.scene.add(gridHelper)

    // Ambient + directional light
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.4))
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(50, 100, 50)
    this.scene.add(dir)

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000)
    this.camera.position.set(80, 80, 80)
    this.camera.lookAt(0, 0, 0)

    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05

    this.lineGroupA = new THREE.Group()
    this.lineGroupB = new THREE.Group()
    this.nodeGroup = new THREE.Group()
    this.scene.add(this.lineGroupA, this.lineGroupB, this.nodeGroup)

    this.startLoop()
    this.onResize()
    window.addEventListener('resize', () => this.onResize())
  }

  private onResize() {
    const canvas = this.renderer.domElement
    const w = canvas.parentElement?.clientWidth ?? 800
    const h = canvas.parentElement?.clientHeight ?? 600
    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  private startLoop() {
    const loop = () => {
      this.animId = requestAnimationFrame(loop)
      this.controls.update()
      this.renderer.render(this.scene, this.camera)
    }
    loop()
  }

  update(geo: GridshellGeometryData) {
    // Clear old geometry
    this.lineGroupA.clear()
    this.lineGroupB.clear()
    this.nodeGroup.clear()

    const matA = new THREE.LineBasicMaterial({ color: 0x4ade80, linewidth: 1.5 })
    const matB = new THREE.LineBasicMaterial({ color: 0x60a5fa, linewidth: 1.5 })
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const nodeSphere = new THREE.SphereGeometry(0.4, 6, 6)

    // Family A lines
    for (const s of geo.familyA) {
      const a = geo.nodes[s.from], b = geo.nodes[s.to]
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(a.x, a.z, -a.y),
        new THREE.Vector3(b.x, b.z, -b.y)
      ])
      this.lineGroupA.add(new THREE.Line(geom, matA))
    }

    // Family B lines
    for (const s of geo.familyB) {
      const a = geo.nodes[s.from], b = geo.nodes[s.to]
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(a.x, a.z, -a.y),
        new THREE.Vector3(b.x, b.z, -b.y)
      ])
      this.lineGroupB.add(new THREE.Line(geom, matB))
    }

    // Nodes (only show if not too many)
    if (geo.nodes.length < 300) {
      for (const n of geo.nodes) {
        const mesh = new THREE.Mesh(nodeSphere, nodeMat)
        mesh.position.set(n.x, n.z, -n.y)
        this.nodeGroup.add(mesh)
      }
    }

    // Fit camera
    const { width, depth, rise } = this.getApproxSize(geo)
    const maxDim = Math.max(width, depth, rise)
    this.camera.position.set(maxDim, maxDim * 0.8, maxDim)
    this.camera.lookAt(0, rise / 2, 0)
    this.controls.target.set(0, rise / 2, 0)
    this.controls.update()
  }

  private getApproxSize(geo: GridshellGeometryData) {
    let maxX = 0, maxY = 0, maxZ = 0
    for (const n of geo.nodes) {
      maxX = Math.max(maxX, Math.abs(n.x))
      maxY = Math.max(maxY, Math.abs(n.y))
      maxZ = Math.max(maxZ, n.z)
    }
    return { width: maxX * 2, depth: maxY * 2, rise: maxZ }
  }

  dispose() {
    cancelAnimationFrame(this.animId)
    this.renderer.dispose()
  }
}
