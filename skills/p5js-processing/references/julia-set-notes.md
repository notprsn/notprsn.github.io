# Julia Set Shader Notes

Use this when implementing or extending the Julia-set shader reference repo.

## Reference structure

- The reference project is deliberately small: one p5 `WEBGL` canvas, one vertex shader, one fragment shader, and a single animated angle that moves the Julia constant `c` along a path.
- The fragment shader owns the escape-time loop. Each pixel maps into the complex plane, iterates `z = z^2 + c`, and colors by escape behavior.
- The original sketch keeps the view window fixed and only animates the parameter path, so the most meaningful browser controls are around parameter drift, zoom, and render detail.

## Safe extensions

- Keep the fragment shader responsible for the expensive iteration work. JavaScript should mostly manage uniforms, resize behavior, and interaction.
- A small control set is enough: parameter phase, zoom, iteration count, palette shift, and optional drift speed.
- Prefer pointer drag and wheel zoom for navigation instead of adding sliders for center coordinates.
- If auto-drift exists, let it update the same phase variable that the manual slider controls so the mental model stays simple.

## Relevant upstream snapshots

- vharivinay-julia-set-readme (missing from upstream manifest)
- vharivinay-julia-set-sketch (missing from upstream manifest)
- vharivinay-julia-set-frag (missing from upstream manifest)
- vharivinay-julia-set-vert (missing from upstream manifest)
- p5 createCanvas(): https://p5js.org/reference/p5/createCanvas/, fetched 2026-03-25T21:04:27.941Z
- p5-loadshader (missing from upstream manifest)
- p5-shader (missing from upstream manifest)
- p5 resizeCanvas(): https://p5js.org/reference/p5/resizeCanvas/, fetched 2026-03-25T21:04:32.620Z
