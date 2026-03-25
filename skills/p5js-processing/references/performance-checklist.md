# Creative Coding Performance Checklist

Use this when a p5 or Processing-style sketch risks becoming computation-bound in the browser.

## Checklist

- Separate geometry generation from rendering.
- Use a worker for heavy point-cloud or voxel generation.
- Cancel stale rebuilds instead of queueing multiple expensive jobs.
- Keep `draw()` deterministic and lean.
- Lower default resolution on small screens.
- Avoid mutating the current visible geometry until the new dataset is complete.
- Prefer native HTML controls or a small control surface over rebuilding large p5 DOM hierarchies.
- Use `pixelDensity(1)` unless a specific visual requirement needs more.

## Realtime interaction model

- First render a coarse preview.
- After the last input event settles, compute the refined geometry.
- Render-only settings should update immediately without forcing a rebuild.

## Relevant upstream snapshots

- p5 createCanvas(): https://p5js.org/reference/p5/createCanvas/, fetched 2026-03-25T21:04:27.941Z
- p5 resizeCanvas(): https://p5js.org/reference/p5/resizeCanvas/, fetched 2026-03-25T21:04:32.620Z
- p5 orbitControl(): https://p5js.org/reference/p5/orbitControl/, fetched 2026-03-25T21:04:31.437Z
- Coding Train Mandelbulb challenge: https://codingtrain.github.io/website-archive/CodingChallenges/168-mandelbulb.html, fetched 2026-03-25T21:04:26.247Z
