# Processing 3D Basics

Use this when the source material is a Processing sketch that relies on `P3D`, transforms, or point-cloud geometry.

## Core rules

- Processing enables 3D rendering by passing `P3D` to `size(width, height, P3D)`.
- Transform calls such as `translate()`, `rotateX()`, `rotateY()`, and `rotateZ()` are cumulative for the current frame.
- `pushMatrix()` and `popMatrix()` scope transform changes and should be preserved during ports.
- `beginShape(POINTS)` plus `vertex(x, y, z)` is the closest Processing-side match for a point-cloud renderer.
- `beginShape()` blocks do not allow transform calls inside them; apply transforms before entering the block.

## Porting implications

- Treat the Processing sketch's world coordinates as scene coordinates, not screen pixels.
- Keep point-cloud generation separate from rendering if the source sketch does expensive computation per point.
- Preserve the original transform order before optimizing anything.

## Relevant upstream snapshots

- Processing reference index: https://processing.org/reference/, fetched 2026-03-25T21:04:35.589Z
- Processing size(): https://processing.org/reference/size_.html, fetched 2026-03-25T21:04:36.377Z
- Processing translate(): https://processing.org/reference/translate_.html, fetched 2026-03-25T21:04:36.529Z
- Processing pushMatrix(): https://processing.org/reference/pushmatrix_, fetched 2026-03-25T21:04:35.485Z
- Processing popMatrix(): https://processing.org/reference/popmatrix_, fetched 2026-03-25T21:04:35.331Z
- Processing rotateX(): https://processing.org/reference/rotatex_, fetched 2026-03-25T21:04:35.770Z
- Processing rotateY(): https://processing.org/reference/rotatey_, fetched 2026-03-25T21:04:35.846Z
- Processing rotateZ(): https://processing.org/reference/rotatez_, fetched 2026-03-25T21:04:36.001Z
- Processing beginShape(): https://processing.org/reference/beginshape_, fetched 2026-03-25T21:04:34.958Z
- Processing vertex(): https://processing.org/reference/vertex_.html, fetched 2026-03-25T21:04:36.605Z
- Processing point(): https://processing.org/reference/point_.html, fetched 2026-03-25T21:04:35.255Z
