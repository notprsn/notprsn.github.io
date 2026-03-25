# p5 2D Recursion

Use this when the target sketch is a recursive 2D drawing, a constrained particle-growth system, or an iterative segment-replacement curve such as a fractal tree, branching plant, Koch-style line system, or Brownian snowflake.

## Core rules

- Treat each recursive branch as a transform scope: draw the segment, translate to its end, then recurse inside `push()` / `pop()` blocks.
- Keep the branch function visually pure. It should receive the current segment length and depth, then draw from the local origin.
- `translate()` should move the origin to the branch tip before child branches are drawn.
- `rotate()` should only affect the current branch scope.
- Use `strokeWeight()` decay rather than a fixed line width so the tree reads as a hierarchy instead of a symbol.
- For Koch-like systems, keep subdivision logic separate from drawing logic. First generate the ordered segment or point list, then render it.

## Interaction guidance

- Geometry is cheap enough to rebuild every frame for most tree sketches; a worker is unnecessary unless the branch count explodes.
- HTML controls are often clearer than p5 DOM controls when the page already has a site-specific layout shell.
- Use motion sparingly: a small sway or breathing effect is enough to keep the tree alive without obscuring the recursive structure.
- For segment-replacement fractals, rebuild only when structure parameters change. Color, pulse, and rotation can stay in the draw loop.
- For Brownian growth systems, keep the live walker in wedge-local coordinates and apply symmetry only during rendering.

## Relevant upstream snapshots

- Coding Train Fractal Tree challenge: https://codingtrain.github.io/website-archive/CodingChallenges/014-fractaltree.html, fetched 2026-03-25T21:04:22.531Z
- Coding Train Fractal Tree p5 source: https://raw.githubusercontent.com/CodingTrain/website-archive/main/CodingChallenges/CC_014_FractalTree/P5/sketch.js, fetched 2026-03-25T21:04:22.900Z
- Coding Train Fractal Tree Processing source: https://raw.githubusercontent.com/CodingTrain/website-archive/main/CodingChallenges/CC_014_FractalTree/Processing/CC_014_FractalTree/CC_014_FractalTree.pde, fetched 2026-03-25T21:04:23.191Z
- Coding Train Koch Snowflake p5 sketch: https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/129_Koch_Snowflake/P5/sketch.js, fetched 2026-03-25T21:04:24.834Z
- Coding Train Koch Snowflake p5 segment: https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/129_Koch_Snowflake/P5/segment.js, fetched 2026-03-25T21:04:23.455Z
- Coding Train Koch Snowflake Processing sketch: https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/129_Koch_Snowflake/Processing/CC_129_Koch_Snowflake/CC_129_Koch_Snowflake.pde, fetched 2026-03-25T21:04:25.688Z
- Coding Train Koch Snowflake Processing segment: https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/129_Koch_Snowflake/Processing/CC_129_Koch_Snowflake/Segment.pde, fetched 2026-03-25T21:04:25.302Z
- Coding Train Brownian snowflake challenge: https://codingtrain.github.io/website-archive/CodingChallenges/127-brownian-snowflake.html
- Coding Train Brownian snowflake p5 sketch: https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/127_Snowflake_Brownian/P5/sketch.js, fetched 2026-03-25T21:04:21.394Z
- Coding Train Brownian snowflake p5 particle: https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/127_Snowflake_Brownian/P5/particle.js, fetched 2026-03-25T21:04:21.071Z
- Coding Train Brownian snowflake Processing sketch: https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/127_Snowflake_Brownian/Processing/CC_127_Snowflake_Brownian/CC_127_Snowflake_Brownian.pde, fetched 2026-03-25T21:04:22.190Z
- Coding Train Brownian snowflake Processing particle: https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/127_Snowflake_Brownian/Processing/CC_127_Snowflake_Brownian/Particle.pde, fetched 2026-03-25T21:04:21.692Z
- p5 line(): https://p5js.org/reference/p5/line/, fetched 2026-03-25T21:04:30.914Z
- p5 beginShape(): https://p5js.org/reference/p5/beginShape/, fetched 2026-03-25T21:04:27.536Z
- p5 endShape(): https://p5js.org/reference/p5/endShape/, fetched 2026-03-25T21:04:30.815Z
- p5 translate(): https://p5js.org/reference/p5/translate/, fetched 2026-03-25T21:04:34.038Z
- p5 rotate(): https://p5js.org/reference/p5/rotate/, fetched 2026-03-25T21:04:32.944Z
- p5 scale(): https://p5js.org/reference/p5/scale/, fetched 2026-03-25T21:04:33.292Z
- p5 push(): https://p5js.org/reference/p5/push/, fetched 2026-03-25T21:04:32.229Z
- p5 pop(): https://p5js.org/reference/p5/pop/, fetched 2026-03-25T21:04:31.937Z
- p5 strokeWeight(): https://p5js.org/reference/p5/strokeWeight/, fetched 2026-03-25T21:04:33.699Z
- Processing line(): https://processing.org/reference/line_.html, fetched 2026-03-25T21:04:35.177Z
- Processing beginShape(): https://processing.org/reference/beginshape_, fetched 2026-03-25T21:04:34.958Z
- Processing endShape(): https://processing.org/reference/endshape_, fetched 2026-03-25T21:04:35.042Z
- Processing translate(): https://processing.org/reference/translate_.html, fetched 2026-03-25T21:04:36.529Z
- Processing rotate(): https://processing.org/reference/rotate_.html, fetched 2026-03-25T21:04:35.673Z
- Processing scale(): https://processing.org/reference/scale_.html, fetched 2026-03-25T21:04:36.299Z
- Processing pushMatrix(): https://processing.org/reference/pushmatrix_, fetched 2026-03-25T21:04:35.485Z
- Processing popMatrix(): https://processing.org/reference/popmatrix_, fetched 2026-03-25T21:04:35.331Z
