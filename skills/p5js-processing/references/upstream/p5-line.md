# p5 line()

- Source: https://p5js.org/reference/p5/line/
- Original URL: https://p5js.org/reference/p5/line/
- Kind: p5-reference
- Purpose: Branch segment drawing in 2D sketches.
- Fetched: 2026-03-25T21:29:48.877Z

## Extracted text

line Skip to main content Menu
Reference Tutorials Examples Contribute Community About
Start Coding
Donate
Reference
English
Accessibility
Reference line()
line()
Draws a straight line between two points. A line's default width is one pixel. The version of line()
with four parameters draws the line in 2D. To color a line, use the stroke() function. To change its width, use the strokeWeight() function. A line can't be filled, so the fill() function won't affect the line's color. The version of line()
with six parameters allows the line to be drawn in 3D space. Doing so requires adding the WEBGL
argument to createCanvas() .
Examples
Syntax
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
line(x1, y1, x2, y2)
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
line(x1, y1, z1, x2, y2, z2)
Parameters
x1 Number: the x-coordinate of the first point.
y1 Number: the y-coordinate of the first point.
x2 Number: the x-coordinate of the second point.
y2 Number: the y-coordinate of the second point.
z1 Number: the z-coordinate of the first point.
z2 Number: the z-coordinate of the second point.
This page is generated from the comments in src/core/shape/2d_primitives.js . Please feel free to edit it and submit a pull request!
Related References
arc Draws an arc.
circle Draws a circle.
ellipse Draws an ellipse (oval).
line Draws a straight line between two points.
p5.js
Resources
Reference Tutorials Examples Contribute Community About Start Coding Donate
Information
Download Contact Copyright Privacy Policy Terms of Use
Socials
GitHub ↗ Instagram ↗ X ↗ YouTube ↗ Discord ↗ Forum ↗
Looking for the new version? Find p5.js 2.0 here!
