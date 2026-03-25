# Chaos Game Notes

Use this when implementing or extending a regular-polygon chaos game in p5.

## Reference structure

- Start from a fixed set of guide vertices, usually arranged as a regular polygon.
- Keep one active point in the plane.
- Repeatedly choose a target vertex, move the active point a fixed fraction of the way toward it, and plot the new position.
- The attractor depends on three things more than anything else: vertex count, jump ratio, and the rule that constrains which vertex can be chosen next.

## Safe extensions

- Keep the control surface small. Vertex count, jump ratio, a rule selector, and point density are enough for most useful exploration.
- Treat vertex count, ratio, and rule as structural parameters. When they change, reset the trail instead of trying to reuse the old accumulation.
- Use an offscreen `createGraphics()` buffer for the plotted trail so the sketch can accumulate hundreds of thousands of points without redrawing the full history every frame.
- Keep guides and HUD overlays in the main draw pass and the attractor trail in the persistent buffer.
- Color can depend on the chosen vertex index, plotted-point count, or distance from the center, but it should not complicate the core attractor logic.

## Practical defaults

- `vertices`: start with `3`
- `ratio`: start with `0.5`
- `rule`: start with unrestricted choice, then explore no-repeat and neighbor-skipping variants
- `steps per frame`: default to a value that reaches a dense image quickly without locking the browser

## Relevant upstream docs

- p5 `createGraphics()`: useful for persistent offscreen accumulation
- p5 `point()`: low-level point plotting for the attractor trail
- p5 `image()`: composite the offscreen buffer into the visible canvas
