# Processing point()

- Source: https://processing.org/reference/point_.html
- Original URL: https://processing.org/reference/point_.html
- Kind: processing-reference
- Purpose: 3D point rendering semantics in Processing.
- Fetched: 2026-03-25T21:29:52.467Z

## Extracted text

point() / Reference / Processing.org
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
Documentation → Reference → Shape → 2d Primitives
Name
point()
Description
Draws a point, a coordinate in space at the dimension of one pixel. The first
parameter is the horizontal value for the point, the second value is the
vertical value for the point, and the optional third value is the depth
value. Drawing this shape in 3D with the z parameter requires the P3D
parameter in combination with size() as shown in the above example.
Use stroke() to set the color of a point() .
Point appears round with the default strokeCap(ROUND) and square with
strokeCap(PROJECT) . Points are invisible with strokeCap(SQUARE)
(no cap).
Using point() with strokeWeight(1) or smaller may draw nothing to the screen,
depending on the graphics settings of the computer. Workarounds include
setting the pixel using set() or drawing the point using either
circle() or  square() .
Examples
Copy size(400, 400);
noSmooth();
point(120, 80);
point(340, 80);
point(340, 300);
point(120, 300);
Copy size(400, 400, P3D);
noSmooth();
point(120, 80, -200);
point(340, 80, -200);
point(340, 300, -200);
point(120, 300, -200);
Syntax
point(x, y)
point(x, y, z)
Parameters
x
( float )
x-coordinate of the point
y
( float )
y-coordinate of the point
z
( float )
z-coordinate of the point
Return
void
Related
stroke()
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
