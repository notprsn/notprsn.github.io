# Mandelbulb Notes

Use this when implementing or tuning a Mandelbulb point cloud in p5.

## Baseline approach

- Stay close to the Coding Train challenge: sample 3D space, run the Mandelbulb escape test in spherical coordinates, and render the retained points as a cloud.
- Default to a surface-shell extraction so the form reads well before a shader or volume renderer exists.
- Keep interaction playful: preview quickly at lower resolution, then refine after input settles.

## Good default parameters

- `power`: 8
- `maxIterations`: around 10 to 14
- `bounds`: around 1.1 to 1.3
- `escapeRadius`: 2 to 4 for reference-faithful builds; allow broader experimentation separately
- `gridResolution`: start around 28 to 44 and refine upward only when interaction remains smooth

## Rendering guidance

- Keep geometry generation off the main thread.
- Retain the last completed geometry until the replacement dataset is ready.
- Support manual orbiting at all times even if autorotation is enabled.

## Relevant upstream snapshots

- Coding Train Mandelbulb challenge: https://codingtrain.github.io/website-archive/CodingChallenges/168-mandelbulb.html, fetched 2026-03-25T21:04:26.247Z
- Processing beginShape(): https://processing.org/reference/beginshape_, fetched 2026-03-25T21:04:34.958Z
- Processing vertex(): https://processing.org/reference/vertex_.html, fetched 2026-03-25T21:04:36.605Z
- p5 beginShape(): https://p5js.org/reference/p5/beginShape/, fetched 2026-03-25T21:04:27.536Z
- p5 vertex(): https://p5js.org/reference/p5/vertex/, fetched 2026-03-25T21:04:34.501Z
- p5 orbitControl(): https://p5js.org/reference/p5/orbitControl/, fetched 2026-03-25T21:04:31.437Z
