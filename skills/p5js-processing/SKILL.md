---
name: p5js-processing
description: Use when building or porting p5.js or Processing sketches, especially WEBGL experiments, Processing-to-p5 ports, interactive creative-coding controls, and self-contained fun projects under fun/projects/.
---

# p5js-processing

Use this skill for:
- new projects under `fun/projects/`
- ports from Processing to p5.js
- p5 `WEBGL` sketches with orbiting, transforms, and live controls
- shader-driven fractal sketches such as Julia sets and other full-screen `WEBGL` fields
- 2D recursive sketches such as fractal trees, branching systems, and transform-heavy drawings
- iterative segment-replacement curves such as Koch snowflakes and related fractal line systems
- constrained particle-growth sketches such as Brownian snowflakes and diffusion-limited aggregation variants
- iterative vertex-jump attractors such as chaos games and polygon-based point systems
- creative-coding work that benefits from a worker-based generation step

Keep the skill lean:
- read only the reference file needed for the current task
- keep project logic inside `fun/projects/<slug>/`
- do not push project-specific code into global site files beyond adding one card on `/fun/`

## Quick workflow

1. If the task is a new `fun` project, copy or adapt the starter in `assets/p5-fun-project-starter/`.
2. If the task is a Processing port, read `references/processing-to-p5-porting.md`.
3. If the task is 3D or `WEBGL`, read `references/p5-webgl-controls.md` and `references/processing-3d-basics.md`.
4. If the task is a shader-driven fractal or full-screen `WEBGL` field, read `references/p5-webgl-controls.md` and `references/julia-set-notes.md`.
5. If the task is a 2D recursive, particle-growth, curve-replacement, or attractor sketch, read `references/p5-2d-recursion.md` and then the specific notes file such as `references/fractal-tree-notes.md`, `references/koch-snowflake-notes.md`, `references/brownian-snowflake-notes.md`, or `references/chaos-game-notes.md`.
6. If the task is Mandelbulb-like or point-cloud heavy, read `references/mandelbulb-notes.md` and `references/performance-checklist.md`.
7. Keep geometry generation outside the render loop. For expensive builds, use a worker and keep `draw()` focused on display and interaction.

## Reference map

- `references/processing-3d-basics.md`
  - Processing `P3D`, transforms, `beginShape()`, `vertex()`, and matrix stack semantics.
- `references/p5-webgl-controls.md`
  - p5 `createCanvas(..., WEBGL)`, `orbitControl()`, resize rules, color mode, and DOM controls.
- `references/processing-to-p5-porting.md`
  - concrete translation rules for Processing-to-p5 ports in this repo.
- `references/p5-2d-recursion.md`
  - p5 2D transform, recursion, line drawing, and canvas-control patterns for branching sketches.
- `references/fractal-tree-notes.md`
  - challenge-specific notes for the Coding Train Fractal Tree sketch and safe ways to extend it.
- `references/koch-snowflake-notes.md`
  - challenge-specific notes for the Coding Train Koch Snowflake sketch and safe ways to extend it.
- `references/brownian-snowflake-notes.md`
  - challenge-specific notes for the Coding Train Brownian snowflake sketch and safe ways to extend it.
- `references/chaos-game-notes.md`
  - notes for regular-polygon chaos games, offscreen accumulation, and small control surfaces.
- `references/julia-set-notes.md`
  - shader-specific notes for the Julia-set reference repo and safe controls for browser play.
- `references/mandelbulb-notes.md`
  - challenge-specific notes, default parameter guidance, and rendering choices for point-cloud Mandelbulbs.
- `references/performance-checklist.md`
  - worker usage, coarse-then-refine updates, caching, and responsiveness guardrails.
- `references/upstream/`
  - normalized upstream snapshots from the official docs and the Coding Train challenge page.

## Repo rules for fun projects

- Keep each project self-contained in `fun/projects/<slug>/`.
- If the project uses p5.js, prefer a pinned local runtime inside that project unless the same runtime is reused by multiple `fun` projects.
- Preserve the existing site nav and back-link shell, but let the project define its own local visual language.
- If the sketch is computationally heavy, keep the current frame visible while a replacement dataset is computed.

## Porting rules

- Processing `size(width, height, P3D)` maps to p5 `createCanvas(width, height, WEBGL)`.
- Processing `pushMatrix()` / `popMatrix()` map to p5 `push()` / `pop()`.
- Processing camera helpers should map to p5 `orbitControl()` in this repo instead of third-party camera libraries by default.
- Processing point-cloud patterns should map to p5 `beginShape(POINTS)` and `vertex(...)` unless there is a concrete reason not to.
- Heavy generation should not happen inside `draw()` unless the geometry is trivial.

## Refreshing references

When the skill needs a refresh, run:

```bash
node skills/p5js-processing/scripts/crawl_refs.mjs
node skills/p5js-processing/scripts/build_refs.mjs
```

`crawl_refs.mjs` only fetches a small whitelist of official pages and keeps old snapshots if a fetch fails.
