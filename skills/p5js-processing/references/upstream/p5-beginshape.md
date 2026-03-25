# p5 beginShape()

- Source: https://p5js.org/reference/p5/beginShape/
- Original URL: https://p5js.org/reference/p5/beginShape
- Kind: p5-reference
- Purpose: Point-cloud and custom geometry rendering.
- Fetched: 2026-03-25T21:29:48.558Z

## Extracted text

beginShape Skip to main content Menu
Reference Tutorials Examples Contribute Community About
Start Coding
Donate
Reference
English
Accessibility
Reference beginShape()
beginShape()
Begins adding vertices to a custom shape. The beginShape()
and endShape() functions allow for creating custom shapes in 2D or 3D. beginShape()
begins adding vertices to a custom shape and endShape() stops adding them. The parameter, kind
, sets the kind of shape to make. By default, any irregular polygon can be drawn. The available modes for kind are: POINTS
to draw a series of points. LINES
to draw a series of unconnected line segments. TRIANGLES
to draw a series of separate triangles. TRIANGLE_FAN
to draw a series of connected triangles sharing the first vertex in a fan-like fashion. TRIANGLE_STRIP
to draw a series of connected triangles in strip fashion. QUADS
to draw a series of separate quadrilaterals (quads). QUAD_STRIP
to draw quad strip using adjacent edges to form the next quad. TESS
to create a filling curve by explicit tessellation (WebGL only).
After calling beginShape()
, shapes can be built by calling vertex() , bezierVertex() , quadraticVertex() , and/or curveVertex() . Calling endShape() will stop adding vertices to the shape. Each shape will be outlined with the current stroke color and filled with the current fill color. Transformations such as translate() , rotate() , and scale() don't work between beginShape()
and endShape() . It's also not possible to use other shapes, such as ellipse() or rect() , between beginShape()
and endShape() .
Examples
Syntax
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
beginShape([kind])
Parameters
kind Constant: either POINTS, LINES, TRIANGLES, TRIANGLE_FAN TRIANGLE_STRIP, QUADS, QUAD_STRIP or TESS.
This page is generated from the comments in src/core/shape/vertex.js . Please feel free to edit it and submit a pull request!
Related References
beginContour Begins creating a hole within a flat shape.
beginShape Begins adding vertices to a custom shape.
bezierVertex Adds a Bézier curve segment to a custom shape.
curveVertex Adds a spline curve segment to a custom shape.
p5.js
Resources
Reference Tutorials Examples Contribute Community About Start Coding Donate
Information
Download Contact Copyright Privacy Policy Terms of Use
Socials
GitHub ↗ Instagram ↗ X ↗ YouTube ↗ Discord ↗ Forum ↗
Looking for the new version? Find p5.js 2.0 here!
