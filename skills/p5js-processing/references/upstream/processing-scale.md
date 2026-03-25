# Processing scale()

- Source: https://processing.org/reference/scale_.html
- Original URL: https://processing.org/reference/scale_.html
- Kind: processing-reference
- Purpose: Mirroring and symmetric render duplication in 2D sketches.
- Fetched: 2026-03-25T21:29:55.252Z

## Extracted text

scale() / Reference / Processing.org
Processing
Foundation
Processing
p5.js
Processing
Android
Processing
Python
Processing
Home
Download
Documentation Reference
Environment
Libraries
Tools
Wiki
Learn Tutorials
Examples
Books
Forum
About Overview
People
Privacy
Donate
Reference +
Documentation → Reference → Transform
Name
scale()
Description
Increases or decreases the size of a shape by expanding and contracting
vertices. Objects always scale from their relative origin to the coordinate
system. Scale values are specified as decimal percentages. For example, the
function call scale(2.0) increases the dimension of a shape by
200%.
Transformations apply to everything that happens after and subsequent calls
to the function multiply the effect. For example, calling scale(2.0)
and then scale(1.5) is the same as scale(3.0) . If
scale() is called within draw() , the transformation is reset
when the loop begins again. Using this function with the z parameter
requires using P3D as a parameter for size() , as shown in the third
example above. This function can be further controlled with
pushMatrix() and  popMatrix() .
Examples
Copy size(400, 400);
rect(120, 80, 200, 200);
scale(0.5);
rect(120, 80, 200, 200);
Copy size(400, 400);
rect(120, 80, 200, 200);
scale(0.5, 1.3);
rect(120, 80, 200, 200);
Copy // Scaling in 3D requires P3D
// as a parameter to size()
size(400, 400, P3D);
noFill();
translate(width/2+48, height/2);
box(80, 80, 80);
scale(2.5, 2.5, 2.5);
box(80, 80, 80);
Syntax
scale(s)
scale(x, y)
scale(x, y, z)
Parameters
s
( float )
percentage to scale the object
x
( float )
percentage to scale the object in the x‑axis
y
( float )
percentage to scale the object in the y‑axis
z
( float )
percentage to scale the object in the z‑axis
Return
void
Related
pushMatrix()
popMatrix()
translate()
rotate()
rotateX()
rotateY()
rotateZ()
This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License .
Contact Us
Feel free to write us!
hello@processing.org
GitHub
Discord
Bluesky
Mastodon
Instagram
Facebook
Medium
Processing is an open project initiated by Ben Fry and Casey Reas . It is developed by a team of contributors around the world.
