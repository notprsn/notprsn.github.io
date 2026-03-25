# Processing to p5 Porting Rules

Use this when porting a Processing sketch into `fun/projects/<slug>/`.

## Default mappings for this repo

- `size(..., P3D)` -> `createCanvas(..., WEBGL)`
- `pushMatrix()` / `popMatrix()` -> `push()` / `pop()`
- Processing `point()` clouds -> p5 `beginShape(POINTS)` and `vertex(...)` unless individual point styling demands another path
- Processing camera helpers -> p5 `orbitControl()`
- Heavy Processing loops that both compute and draw -> worker-based generation plus a lean `draw()` loop in p5

## Repo-specific conventions

- Keep the project local to its own folder under `fun/projects/`.
- Add at most one card to `/fun/`; do not move project-specific logic into global scripts.
- Pin the p5 runtime locally for the project unless the exact same runtime is intentionally shared across multiple fun projects.
- If the port needs long-form notes, put them in the skill references or `writings/`, not inline in the project code.

## Validation checklist

- The visual structure matches the source sketch's logic before visual polish starts.
- Orbiting and resize behavior work on both desktop and mobile.
- Expensive state changes do not freeze the UI or leave stale geometry onscreen.

## Relevant upstream snapshots

- Processing size(): https://processing.org/reference/size_.html, fetched 2026-03-25T21:04:36.377Z
- Processing translate(): https://processing.org/reference/translate_.html, fetched 2026-03-25T21:04:36.529Z
- Processing rotate(): https://processing.org/reference/rotate_.html, fetched 2026-03-25T21:04:35.673Z
- Processing pushMatrix(): https://processing.org/reference/pushmatrix_, fetched 2026-03-25T21:04:35.485Z
- Processing popMatrix(): https://processing.org/reference/popmatrix_, fetched 2026-03-25T21:04:35.331Z
- Processing line(): https://processing.org/reference/line_.html, fetched 2026-03-25T21:04:35.177Z
- Processing beginShape(): https://processing.org/reference/beginshape_, fetched 2026-03-25T21:04:34.958Z
- Processing vertex(): https://processing.org/reference/vertex_.html, fetched 2026-03-25T21:04:36.605Z
- p5 createCanvas(): https://p5js.org/reference/p5/createCanvas/, fetched 2026-03-25T21:04:27.941Z
- p5 translate(): https://p5js.org/reference/p5/translate/, fetched 2026-03-25T21:04:34.038Z
- p5 rotate(): https://p5js.org/reference/p5/rotate/, fetched 2026-03-25T21:04:32.944Z
- p5 push(): https://p5js.org/reference/p5/push/, fetched 2026-03-25T21:04:32.229Z
- p5 pop(): https://p5js.org/reference/p5/pop/, fetched 2026-03-25T21:04:31.937Z
- p5 orbitControl(): https://p5js.org/reference/p5/orbitControl/, fetched 2026-03-25T21:04:31.437Z
- p5 resizeCanvas(): https://p5js.org/reference/p5/resizeCanvas/, fetched 2026-03-25T21:04:32.620Z
