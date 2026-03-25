# Brownian Snowflake Notes

Use this when implementing or extending the Coding Train Brownian snowflake sketch.

## Reference structure

- The original challenge keeps exactly one active walker in a narrow wedge, lets it drift inward with random vertical motion, and sticks it to the cluster once it touches an existing particle or reaches the center.
- The full snowflake is rendered by rotating that wedge six times and mirroring each copy with `scale(1, -1)`.
- The p5 and Processing versions both clamp the walker's heading into the wedge after each step, which is the key reason the crystal grows with clean radial symmetry.

## Safe extensions

- Keep the walker simulation and the symmetry rendering as separate concerns. The particle list should stay in wedge-local coordinates.
- Controls for drift, jitter, particle radius, spawn radius, and steps per frame are safe extension points because they preserve the underlying DLA logic.
- Visual changes such as hue, glow, and slow whole-form rotation should stay render-only and must not mutate the stored particle positions.
- If a structural parameter changes, restart the growth. Reusing an old cluster under a different wedge or sticking radius produces misleading results.

## Relevant upstream snapshots

- Coding Train Brownian snowflake challenge: https://codingtrain.github.io/website-archive/CodingChallenges/127-brownian-snowflake.html
- Coding Train Brownian snowflake p5 sketch: https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/127_Snowflake_Brownian/P5/sketch.js, fetched 2026-03-25T21:04:21.394Z
- Coding Train Brownian snowflake p5 particle: https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/127_Snowflake_Brownian/P5/particle.js, fetched 2026-03-25T21:04:21.071Z
- Coding Train Brownian snowflake Processing sketch: https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/127_Snowflake_Brownian/Processing/CC_127_Snowflake_Brownian/CC_127_Snowflake_Brownian.pde, fetched 2026-03-25T21:04:22.190Z
- Coding Train Brownian snowflake Processing particle: https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/127_Snowflake_Brownian/Processing/CC_127_Snowflake_Brownian/Particle.pde, fetched 2026-03-25T21:04:21.692Z
- p5 rotate(): https://p5js.org/reference/p5/rotate/, fetched 2026-03-25T21:04:32.944Z
- p5 scale(): https://p5js.org/reference/p5/scale/, fetched 2026-03-25T21:04:33.292Z
- Processing rotate(): https://processing.org/reference/rotate_.html, fetched 2026-03-25T21:04:35.673Z
- Processing scale(): https://processing.org/reference/scale_.html, fetched 2026-03-25T21:04:36.299Z
