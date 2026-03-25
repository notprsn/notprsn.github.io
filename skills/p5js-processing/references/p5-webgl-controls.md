# p5 WEBGL Controls

Use this when the target implementation is a browser-based p5 sketch with 3D interaction, full-screen shaders, or live controls.

## Core rules

- Create the renderer with `createCanvas(width, height, WEBGL)`.
- Use `orbitControl()` in `draw()` for mouse and touch orbiting instead of adding a third-party camera by default.
- Use `loadShader()` plus `shader()` when the heavy math belongs in the fragment shader, such as a Julia-set render.
- Resize the sketch with `resizeCanvas()` inside a resize handler tied to the actual stage container.
- Use `colorMode(HSB, ...)` when the sketch benefits from quick hue-based control over point-cloud color.
- Use sliders, checkboxes, or selects only for values that the user should actively explore.

## Control strategy

- Geometry-affecting inputs should trigger a rebuild path, not mutate state inside the hot draw loop.
- Pure render controls such as palette, point size, or autorotation may update immediately without recomputing geometry.
- On mobile, default to lower geometric detail and hide dense controls behind a drawer or sheet.

## Relevant upstream snapshots

- p5 createCanvas(): https://p5js.org/reference/p5/createCanvas/, fetched 2026-03-25T21:04:27.941Z
- p5-loadshader (missing from upstream manifest)
- p5-shader (missing from upstream manifest)
- p5 orbitControl(): https://p5js.org/reference/p5/orbitControl/, fetched 2026-03-25T21:04:31.437Z
- p5 beginShape(): https://p5js.org/reference/p5/beginShape/, fetched 2026-03-25T21:04:27.536Z
- p5 vertex(): https://p5js.org/reference/p5/vertex/, fetched 2026-03-25T21:04:34.501Z
- p5 createSlider(): https://p5js.org/reference/p5/createSlider/, fetched 2026-03-25T21:04:30.781Z
- p5 createCheckbox(): https://p5js.org/reference/p5/createCheckbox/, fetched 2026-03-25T21:04:28.302Z
- p5 createSelect(): https://p5js.org/reference/p5/createSelect/, fetched 2026-03-25T21:04:30.458Z
- p5 resizeCanvas(): https://p5js.org/reference/p5/resizeCanvas/, fetched 2026-03-25T21:04:32.620Z
- p5 colorMode(): https://p5js.org/reference/p5/colorMode/, fetched 2026-03-25T21:04:27.915Z
