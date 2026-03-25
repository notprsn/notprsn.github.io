# p5 translate()

- Source: https://p5js.org/reference/p5/translate/
- Original URL: https://p5js.org/reference/p5/translate/
- Kind: p5-reference
- Purpose: Coordinate system shifts in 2D and 3D sketches.
- Fetched: 2026-03-25T21:29:50.704Z

## Extracted text

translate Skip to main content Menu
Reference Tutorials Examples Contribute Community About
Start Coding
Donate
Reference
English
Accessibility
Reference translate()
translate()
Translates the coordinate system. By default, the origin (0, 0)
is at the sketch's top-left corner in 2D mode and center in WebGL mode. The translate()
function shifts the origin to a different position. Everything drawn after translate()
is called will appear to be shifted. There are two ways to call translate()
with parameters that set the origin's position. The first way to call translate()
uses numbers to set the amount of translation. The first two parameters, x
and y
, set the amount to translate along the positive x- and y-axes. For example, calling translate(20, 30)
translates the origin 20 pixels along the x-axis and 30 pixels along the y-axis. The third parameter, z
, is optional. It sets the amount to translate along the positive z-axis. For example, calling translate(20, 30, 40)
translates the origin 20 pixels along the x-axis, 30 pixels along the y-axis, and 40 pixels along the z-axis. The second way to call translate()
uses a p5.Vector object to set the amount of translation. For example, calling translate(myVector)
uses the x-, y-, and z-components of myVector
to set the amount to translate along the x-, y-, and z-axes. Doing so is the same as calling translate(myVector.x, myVector.y, myVector.z)
. By default, transformations accumulate. For example, calling translate(10, 0)
twice has the same effect as calling translate(20, 0)
once. The push() and pop() functions can be used to isolate transformations within distinct drawing groups. Note: Transformations are reset at the beginning of the draw loop. Calling translate(10, 0)
inside the draw() function won't cause shapes to move continuously.
Examples
Syntax
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
translate(x, y, [z])
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
translate(vector)
Parameters
x Number: amount to translate along the positive x-axis.
y Number: amount to translate along the positive y-axis.
z Number: amount to translate along the positive z-axis.
vector p5.Vector: vector by which to translate.
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
