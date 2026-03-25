# p5 rotate()

- Source: https://p5js.org/reference/p5/rotate/
- Original URL: https://p5js.org/reference/p5/rotate/
- Kind: p5-reference
- Purpose: 2D rotation around the current origin.
- Fetched: 2026-03-25T21:29:49.785Z

## Extracted text

rotate Skip to main content Menu
Reference Tutorials Examples Contribute Community About
Start Coding
Donate
Reference
English
Accessibility
Reference rotate()
rotate()
Rotates the coordinate system. By default, the positive x-axis points to the right and the positive y-axis points downward. The rotate()
function changes this orientation by rotating the coordinate system about the origin. Everything drawn after rotate()
is called will appear to be rotated. The first parameter, angle
, is the amount to rotate. For example, calling rotate(1)
rotates the coordinate system clockwise 1 radian which is nearly 57˚. rotate()
interprets angle values using the current angleMode() . The second parameter, axis
, is optional. It's used to orient 3D rotations in WebGL mode. If a p5.Vector is passed, as in rotate(QUARTER_PI, myVector)
, then the coordinate system will rotate QUARTER_PI
radians about myVector
. If an array of vector components is passed, as in rotate(QUARTER_PI, [1, 0, 0])
, then the coordinate system will rotate QUARTER_PI
radians about a vector with the components [1, 0, 0]
. By default, transformations accumulate. For example, calling rotate(1)
twice has the same effect as calling rotate(2)
once. The push() and pop() functions can be used to isolate transformations within distinct drawing groups. Note: Transformations are reset at the beginning of the draw loop. Calling rotate(1)
inside the draw() function won't cause shapes to spin.
Examples
Syntax
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
rotate(angle, [axis])
Parameters
angle Number: angle of rotation in the current angleMode() .
axis p5.Vector|Number[]: axis to rotate about in 3D.
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
