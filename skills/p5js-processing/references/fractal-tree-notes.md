# Fractal Tree Notes

Use this when implementing or extending the Coding Train Fractal Tree sketch.

## Reference structure

- The original challenge is a compact recursive binary tree: draw one trunk segment, translate upward, branch left and right with the same angle, and stop when the current length falls below a threshold.
- The p5 version uses a slider to control the angle in real time.
- The Processing port preserves the same recursive structure and adds mouse-wheel angle control.

## Safe extensions

- Add controls for angle, branch ratio, trunk length, and minimum twig length before adding more decorative parameters.
- Motion should perturb the branch angle slightly over time, not replace the underlying recursive structure.
- Leaves or blossoms should only appear near terminal twigs so the tree silhouette remains legible.
- Presets are a good extension point because they let the sketch stay reference-faithful while still being playful.

## Relevant upstream snapshots

- Coding Train Fractal Tree challenge: https://codingtrain.github.io/website-archive/CodingChallenges/014-fractaltree.html, fetched 2026-03-25T21:04:22.531Z
- Coding Train Fractal Tree p5 source: https://raw.githubusercontent.com/CodingTrain/website-archive/main/CodingChallenges/CC_014_FractalTree/P5/sketch.js, fetched 2026-03-25T21:04:22.900Z
- Coding Train Fractal Tree Processing source: https://raw.githubusercontent.com/CodingTrain/website-archive/main/CodingChallenges/CC_014_FractalTree/Processing/CC_014_FractalTree/CC_014_FractalTree.pde, fetched 2026-03-25T21:04:23.191Z
