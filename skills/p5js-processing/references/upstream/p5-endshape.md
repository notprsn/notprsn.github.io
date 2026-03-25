# p5 endShape()

- Source: https://p5js.org/reference/p5/endShape/
- Original URL: https://p5js.org/reference/p5/endShape/
- Kind: p5-reference
- Purpose: Completing polyline and polygon shapes in p5.
- Fetched: 2026-03-25T21:29:48.851Z

## Extracted text

endShape Skip to main content Menu
Reference Tutorials Examples Contribute Community About
Start Coding
Donate
Reference
English
Accessibility
Reference endShape()
endShape()
Stops adding vertices to a custom shape. The beginShape() and endShape()
functions allow for creating custom shapes in 2D or 3D. beginShape() begins adding vertices to a custom shape and endShape()
stops adding them. The first parameter, mode
, is optional. By default, the first and last vertices of a shape aren't connected. If the constant CLOSE
is passed, as in endShape(CLOSE)
, then the first and last vertices will be connected. The second parameter, count
, is also optional. In WebGL mode, it’s more efficient to draw many copies of the same shape using a technique called instancing . The count
parameter tells WebGL mode how many copies to draw. For example, calling endShape(CLOSE, 400)
after drawing a custom shape will make it efficient to draw 400 copies. This feature requires writing a custom shader . After calling beginShape() , shapes can be built by calling vertex() , bezierVertex() , quadraticVertex() , and/or curveVertex() . Calling endShape()
will stop adding vertices to the shape. Each shape will be outlined with the current stroke color and filled with the current fill color. Transformations such as translate() , rotate() , and scale() don't work between beginShape() and endShape()
. It's also not possible to use other shapes, such as ellipse() or rect() , between beginShape() and endShape()
.
Examples
Syntax
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
endShape([mode], [count])
Parameters
mode Constant: use CLOSE to close the shape
count Integer: number of times you want to draw/instance the shape (for WebGL mode).
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
