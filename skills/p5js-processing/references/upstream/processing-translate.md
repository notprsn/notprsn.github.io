# Processing translate()

- Source: https://processing.org/reference/translate_.html
- Original URL: https://processing.org/reference/translate_.html
- Kind: processing-reference
- Purpose: 3D translation semantics and cumulative transforms.
- Fetched: 2026-03-25T21:29:55.717Z

## Extracted text

translate() / Reference / Processing.org
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
translate()
Description
Specifies an amount to displace objects within the display window. The
x parameter specifies left/right translation, the y parameter
specifies up/down translation, and the z parameter specifies
translations toward/away from the screen. Using this function with the
z parameter requires using P3D as a parameter in combination with size
as shown in the above example.
Transformations are cumulative and apply to everything that happens after and
subsequent calls to the function accumulates the effect. For example, calling
translate(50, 0) and then translate(20, 0) is the same as
translate(70, 0) . If translate() is called within
draw() , the transformation is reset when the loop begins again. This
function can be further controlled by using pushMatrix() and  popMatrix() .
Examples
Copy size(400, 400);
translate(120, 80);
rect(0, 0, 220, 220);
Copy // Translating in 3D requires P3D
// as the parameter to size()
size(400, 400, P3D);
// Translate 30 across, 20 down, and
// 50 back, or "away" from the screen.
translate(120, 80, -200);
rect(0, 0, 220, 220);
Copy size(400, 400);
rect(0, 0, 220, 220); // Draw rect at original 0,0
translate(120, 80);
rect(0, 0, 220, 220); // Draw rect at new 0,0
translate(56, 56);
rect(0, 0, 220, 220); // Draw rect at new 0,0
Syntax
translate(x, y)
translate(x, y, z)
Parameters
x
( float )
left/right translation
y
( float )
up/down translation
z
( float )
forward/backward translation
Return
void
Related
popMatrix()
pushMatrix()
rotate()
rotateX()
rotateY()
rotateZ()
scale()
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
