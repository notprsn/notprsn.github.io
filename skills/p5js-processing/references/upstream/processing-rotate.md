# Processing rotate()

- Source: https://processing.org/reference/rotate_.html
- Original URL: https://processing.org/reference/rotate_.html
- Kind: processing-reference
- Purpose: 2D rotation around the current origin.
- Fetched: 2026-03-25T21:29:54.117Z

## Extracted text

rotate() / Reference / Processing.org
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
rotate()
Description
Rotates a shape the amount specified by the angle parameter.
Angles should be specified in radians (values from 0 to TWO_PI) or
converted to radians with the radians() function.
Objects are always rotated around their relative position to the origin
and positive numbers rotate objects in a clockwise direction.
Transformations apply to everything that happens after and subsequent
calls to the function accumulates the effect. For example, calling
rotate(HALF_PI) and then rotate(HALF_PI) is the same as
rotate(PI) . All transformations are reset when draw()
begins again.
Technically, rotate() multiplies the current transformation
matrix by a rotation matrix. This function can be further controlled by
the pushMatrix() and  popMatrix() .
Examples
Copy size(400, 400);
translate(width/2, height/2);
rotate(PI/3.0);
rect(-104, -104, 208, 208);
Syntax
rotate(angle)
Parameters
angle
( float )
angle of rotation specified in radians
Return
void
Related
popMatrix()
pushMatrix()
rotateX()
rotateY()
rotateZ()
scale()
radians()
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
