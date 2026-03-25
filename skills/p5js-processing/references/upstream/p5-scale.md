# p5 scale()

- Source: https://p5js.org/reference/p5/scale/
- Original URL: https://p5js.org/reference/p5/scale/
- Kind: p5-reference
- Purpose: Mirroring and symmetric render duplication in 2D sketches.
- Fetched: 2026-03-25T21:29:50.083Z

## Extracted text

scale Skip to main content Menu
Reference Tutorials Examples Contribute Community About
Start Coding
Donate
Reference
English
Accessibility
Reference scale()
scale()
Scales the coordinate system. By default, shapes are drawn at their original scale. A rectangle that's 50 pixels wide appears to take up half the width of a 100 pixel-wide canvas. The scale()
function can shrink or stretch the coordinate system so that shapes appear at different sizes. There are two ways to call scale()
with parameters that set the scale factor(s). The first way to call scale()
uses numbers to set the amount of scaling. The first parameter, s
, sets the amount to scale each axis. For example, calling scale(2)
stretches the x-, y-, and z-axes by a factor of 2. The next two parameters, y
and z
, are optional. They set the amount to scale the y- and z-axes. For example, calling scale(2, 0.5, 1)
stretches the x-axis by a factor of 2, shrinks the y-axis by a factor of 0.5, and leaves the z-axis unchanged. The second way to call scale()
uses a p5.Vector object to set the scale factors. For example, calling scale(myVector)
uses the x-, y-, and z-components of myVector
to set the amount of scaling along the x-, y-, and z-axes. Doing so is the same as calling scale(myVector.x, myVector.y, myVector.z)
. By default, transformations accumulate. For example, calling scale(1)
twice has the same effect as calling scale(2)
once. The push() and pop() functions can be used to isolate transformations within distinct drawing groups. Note: Transformations are reset at the beginning of the draw loop. Calling scale(2)
inside the draw() function won't cause shapes to grow continuously.
Examples
Syntax
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
scale(s, [y], [z])
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
scale(scales)
Parameters
s Number|p5.Vector|Number[]: amount to scale along the positive x-axis.
y Number: amount to scale along the positive y-axis. Defaults to s
.
z Number: amount to scale along the positive z-axis. Defaults to y
.
scales p5.Vector|Number[]: vector whose components should be used to scale.
This page is generated from the comments in src/core/transform.js . Please feel free to edit it and submit a pull request!
Related References
applyMatrix Applies a transformation matrix to the coordinate system.
resetMatrix Clears all transformations applied to the coordinate system.
rotate Rotates the coordinate system.
rotateX Rotates the coordinate system about the x-axis in WebGL mode.
p5.js
Resources
Reference Tutorials Examples Contribute Community About Start Coding Donate
Information
Download Contact Copyright Privacy Policy Terms of Use
Socials
GitHub ↗ Instagram ↗ X ↗ YouTube ↗ Discord ↗ Forum ↗
Looking for the new version? Find p5.js 2.0 here!
