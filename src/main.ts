import './style.css'
import { GridshellScene } from './scene'
import { computeGridshell, computeBOM } from './gridshell'
import { downloadSVG } from './svgExport'
import type { GridshellParams } from './types'

const params: GridshellParams = {
  width: 60,
  depth: 60,
  rise: 20,
  pitch: 10,
  surface: 'paraboloid'
}

// DOM refs
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const scene = new GridshellScene(canvas)

function getEl(id: string) { return document.getElementById(id) as HTMLElement }
function getInput(id: string) { return document.getElementById(id) as HTMLInputElement }
function getSelect(id: string) { return document.getElementById(id) as HTMLSelectElement }

function render() {
  const geo = computeGridshell(params)
  scene.update(geo)
  const bom = computeBOM(geo)
  updateBOM(bom, geo.nodes.length)
}

function updateBOM(bom: ReturnType<typeof computeBOM>, nodeCount: number) {
  const el = getEl('bom')
  el.innerHTML = `
    <div class="bom-col">
      <h3>Parts</h3>
      <p>Nodes: <span class="accent-a">${nodeCount}</span></p>
      <p>Family A: <span class="accent-a">${bom.familyACount}</span> sticks</p>
      <p>Family B: <span class="accent-b">${bom.familyBCount}</span> sticks</p>
      <p class="dim">Total: ${bom.familyACount + bom.familyBCount} sticks</p>
      <p class="dim">Length: ${(bom.totalLength / 100).toFixed(1)} m</p>
    </div>
    <div class="bom-col">
      <h3>Length Distribution</h3>
      <div class="bom-bins">
        ${bom.lengthBins.map(b => `<div class="bom-bin">${b.label} <span>×${b.count}</span></div>`).join('')}
      </div>
    </div>
  `
}

function bind(id: string, key: keyof GridshellParams, isNum = true) {
  const el = getInput(id)
  const valEl = document.getElementById(id + '-val')
  el.addEventListener('input', () => {
    const v = isNum ? Number(el.value) : el.value
    ;(params as unknown as Record<string, unknown>)[key] = v
    if (valEl) valEl.textContent = el.value + (isNum ? 'cm' : '')
    render()
  })
}

bind('width', 'width')
bind('depth', 'depth')
bind('rise', 'rise')
bind('pitch', 'pitch')

getSelect('surface').addEventListener('change', (e) => {
  params.surface = (e.target as HTMLSelectElement).value as GridshellParams['surface']
  render()
})

document.getElementById('export-btn')!.addEventListener('click', () => {
  const geo = computeGridshell(params)
  downloadSVG(geo, params)
})

// Initial render
render()
