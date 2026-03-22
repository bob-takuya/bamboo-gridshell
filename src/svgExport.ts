import type { GridshellGeometryData, GridshellParams } from './types'

export function generateSVG(geo: GridshellGeometryData, params: GridshellParams): string {
  const MM_PER_CM = 10
  const MARGIN = 20
  const SCALE = MM_PER_CM  // 1cm = 10px (so SVG units ≈ mm)

  const svgW = params.width * SCALE + MARGIN * 2
  const svgH = params.depth * SCALE + MARGIN * 2

  const cx = (x: number) => x * SCALE + svgW / 2
  const cy = (y: number) => -y * SCALE + svgH / 2

  let lines = ''

  for (const s of geo.familyA) {
    const a = geo.nodes[s.from], b = geo.nodes[s.to]
    lines += `<line x1="${cx(a.x).toFixed(1)}" y1="${cy(a.y).toFixed(1)}" x2="${cx(b.x).toFixed(1)}" y2="${cy(b.y).toFixed(1)}" stroke="#4ade80" stroke-width="0.5"/>\n`
  }
  for (const s of geo.familyB) {
    const a = geo.nodes[s.from], b = geo.nodes[s.to]
    lines += `<line x1="${cx(a.x).toFixed(1)}" y1="${cy(a.y).toFixed(1)}" x2="${cx(b.x).toFixed(1)}" y2="${cy(b.y).toFixed(1)}" stroke="#60a5fa" stroke-width="0.5"/>\n`
  }

  let nodeDots = ''
  if (geo.nodes.length < 500) {
    for (const n of geo.nodes) {
      nodeDots += `<circle cx="${cx(n.x).toFixed(1)}" cy="${cy(n.y).toFixed(1)}" r="3" fill="none" stroke="#ffffff" stroke-width="0.5"/>\n`
    }
  }

  // Scale bar (10cm)
  const barX1 = MARGIN
  const barX2 = barX1 + 10 * SCALE
  const barY = svgH - MARGIN + 8

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}mm" height="${svgH}mm" viewBox="0 0 ${svgW} ${svgH}">
  <rect width="${svgW}" height="${svgH}" fill="#0a0a0a"/>
  
  <!-- Bounding box -->
  <rect x="${cx(-params.width/2)}" y="${cy(params.depth/2)}" 
        width="${params.width * SCALE}" height="${params.depth * SCALE}" 
        fill="none" stroke="#333" stroke-width="0.5" stroke-dasharray="3,3"/>
  
  <!-- Family A (green) -->
  ${lines.split('\n').filter(l => l.includes('#4ade80')).join('\n  ')}
  
  <!-- Family B (blue) -->
  ${lines.split('\n').filter(l => l.includes('#60a5fa')).join('\n  ')}
  
  <!-- Nodes (cut marks) -->
  ${nodeDots}
  
  <!-- Scale bar -->
  <line x1="${barX1}" y1="${barY}" x2="${barX2}" y2="${barY}" stroke="#aaa" stroke-width="1"/>
  <line x1="${barX1}" y1="${barY-3}" x2="${barX1}" y2="${barY+3}" stroke="#aaa" stroke-width="1"/>
  <line x1="${barX2}" y1="${barY-3}" x2="${barX2}" y2="${barY+3}" stroke="#aaa" stroke-width="1"/>
  <text x="${(barX1+barX2)/2}" y="${barY+10}" fill="#aaa" font-size="8" text-anchor="middle" font-family="monospace">10 cm</text>
  
  <!-- Dimensions -->
  <text x="${svgW/2}" y="12" fill="#666" font-size="8" text-anchor="middle" font-family="monospace">
    ${params.width}cm × ${params.depth}cm | rise: ${params.rise}cm | pitch: ${params.pitch}cm | ${params.surface}
  </text>
  
  <!-- Legend -->
  <line x1="${svgW-60}" y1="20" x2="${svgW-40}" y2="20" stroke="#4ade80" stroke-width="1.5"/>
  <text x="${svgW-38}" y="23" fill="#4ade80" font-size="7" font-family="monospace">Family A</text>
  <line x1="${svgW-60}" y1="30" x2="${svgW-40}" y2="30" stroke="#60a5fa" stroke-width="1.5"/>
  <text x="${svgW-38}" y="33" fill="#60a5fa" font-size="7" font-family="monospace">Family B</text>
</svg>`

  return svg
}

export function downloadSVG(geo: GridshellGeometryData, params: GridshellParams) {
  const svgStr = generateSVG(geo, params)
  const blob = new Blob([svgStr], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gridshell-${params.width}x${params.depth}-r${params.rise}.svg`
  a.click()
  URL.revokeObjectURL(url)
}
