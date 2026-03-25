# Processing rotateY()

- Source: https://processing.org/reference/rotatey_
- Original URL: https://processing.org/reference/rotatey_
- Kind: processing-reference
- Purpose: 3D transform semantics along the y-axis.
- Fetched: 2026-03-25T21:29:54.666Z

## Extracted text

rotateY() / Reference / Processing.org
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
rotateY()
Description
Rotates a shape around the y-axis the amount specified by the
angle parameter. Angles should be specified in radians (values
from 0 to PI*2) or converted to radians with the radians()
function. Objects are always rotated around their relative position to
the origin and positive numbers rotate objects in a counterclockwise
direction. Transformations apply to everything that happens after and
subsequent calls to the function accumulates the effect. For example,
calling rotateY(PI/2) and then rotateY(PI/2) is the same
as rotateY(PI) . If rotateY() is called within the
draw() , the transformation is reset when the loop begins again.
This function requires using P3D as a third parameter to size()
as shown in the examples above.
Examples
Copy size(400, 400, P3D);
translate(width/2, height/2);
rotateY(PI/3.0);
rect(-104, -104, 208, 208);
Copy size(400, 400, P3D);
translate(width/2, height/2);
rotateY(radians(60));
rect(-104, -104, 208, 208);
Syntax
rotateY(angle)
Parameters
angle
( float )
angle of rotation specified in radians
Return
void
Related
popMatrix()
pushMatrix()
rotate()
rotateX()
rotateZ()
scale()
translate()
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
