# Bamboo Gridshell Designer

A small browser sketch tool for laying out a two-way diagonal grid of bamboo sticks over a simple dome-like surface, with a parts list and an SVG export.

竹のグリッドシェルを簡易的に検討するための、1日で作った小さなブラウザツール（v1.0、2026年3月）。

## Status

**Prototype (one-day sketch, not maintained).** It draws a grid on an analytic surface and counts parts; it does not do structural form-finding or check whether bamboo can actually bend into the shape.

- ✅ **Works**
  - Parameters: width, depth, rise, grid pitch (cm); surface type: elliptic paraboloid, barrel vault, or hemisphere-like dome
  - 3D view (Three.js, orbit controls) of the two stick families
  - Parts list: node count, stick count per family, total length, and a length distribution in 5 cm bins
  - SVG export (1 SVG unit = 1 mm) with both families, node marks, scale bar and dimensions, intended for a Silhouette Cameo cutter
  - `npm run build` succeeds
- 🚧 **Partial**
  - The grid is a regular 45° diamond grid **in plan**, lifted vertically onto the surface. It is not a true Chebyshev net (stick segments on the surface have different lengths), and there is no elastic / bending simulation
  - "Sticks" in the parts list are the short segments between neighboring nodes, not continuous laths
  - The SVG is a plan projection of the grid, not unrolled stick lengths
- 📝 **Not implemented**
  - Form-finding or structural analysis
  - Boundary / edge beams, supports, joints
  - Saving or loading designs
- ⚠️ **Known issues**
  - The exported SVG has a filled dark background rectangle, which may need to be deleted before sending it to a cutter
  - Node marks are omitted from the SVG when there are 500 or more nodes
  - The built `dist/` folder is committed to the repository

## Background

Made in a single day (2026-03-22) as a quick exploration of small bamboo gridshells and how many sticks of what length they would need.

## Usage

Move the sliders and pick a surface; the 3D view and the parts list update immediately. Click **⬇ Export SVG (Cameo5)** to download the plan as SVG.

## Development

```bash
npm install
npm run dev       # Vite dev server
npm run build     # tsc + vite build to dist/
npm run preview   # serve the build
```

Tech: TypeScript, Vite, Three.js.

```
src/gridshell.ts   # surface functions, diamond grid, parts list
src/scene.ts       # Three.js view
src/svgExport.ts   # SVG export
src/main.ts        # UI wiring
```

## Related repos

- [smocking-cad](https://github.com/bob-takuya/smocking-cad) — smocking pattern editor and 3D preview
- [tpms-kagome-designer](https://github.com/bob-takuya/tpms-kagome-designer) — kagome weaving patterns on TPMS surfaces
- [rhinotools](https://github.com/bob-takuya/rhinotools) — RhinoPython scripts for CNC / laser part prep
