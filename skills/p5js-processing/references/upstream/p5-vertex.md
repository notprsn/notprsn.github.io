# p5 vertex()

- Source: https://p5js.org/reference/p5/vertex/
- Original URL: https://p5js.org/reference/p5/vertex/
- Kind: p5-reference
- Purpose: 3D vertex placement inside point-cloud shapes.
- Fetched: 2026-03-25T21:29:50.745Z

## Extracted text

vertex Skip to main content Menu
Reference Tutorials Examples Contribute Community About
Start Coding
Donate
Reference
English
Accessibility
Reference vertex()
vertex()
Adds a vertex to a custom shape. vertex()
sets the coordinates of vertices drawn between the beginShape() and endShape() functions. The first two parameters, x
and y
, set the x- and y-coordinates of the vertex. The third parameter, z
, is optional. It sets the z-coordinate of the vertex in WebGL mode. By default, z
is 0. The fourth and fifth parameters, u
and v
, are also optional. They set the u- and v-coordinates for the vertex’s texture when used with endShape() . By default, u
and v
are both 0.
Examples
Syntax
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
vertex(x, y)
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
vertex(x, y, [z])
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
vertex(x, y, [z], [u], [v])
Parameters
x Number: x-coordinate of the vertex.
y Number: y-coordinate of the vertex.
z Number: z-coordinate of the vertex. Defaults to 0.
u Number: u-coordinate of the vertex's texture. Defaults to 0.
v Number: v-coordinate of the vertex's texture. Defaults to 0.
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
