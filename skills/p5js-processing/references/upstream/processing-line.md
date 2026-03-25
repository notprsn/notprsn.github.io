# Processing line()

- Source: https://processing.org/reference/line_.html
- Original URL: https://processing.org/reference/line_.html
- Kind: processing-reference
- Purpose: 2D and 3D line drawing semantics in Processing.
- Fetched: 2026-03-25T21:29:52.116Z

## Extracted text

line() / Reference / Processing.org
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
line()
Description
Draws a line (a direct path between two points) to the screen. The
version of line() with four parameters draws the line in 2D. To
color a line, use the stroke() function. A line cannot be filled,
therefore the fill() function will not affect the color of a
line. 2D lines are drawn with a width of one pixel by default, but this
can be changed with the strokeWeight() function. The version with
six parameters allows the line to be placed anywhere within XYZ space.
Drawing this shape in 3D with the z parameter requires the P3D
parameter in combination with size() as shown in the above example.
Examples
Copy size(400, 400);
line(120, 80, 340, 300);
Copy size(400, 400);
line(120, 80, 340, 80);
stroke(126);
line(340, 80, 340, 300);
stroke(255);
line(340, 300, 120, 300);
Copy // Drawing lines in 3D requires P3D
// as a parameter to size()
size(400, 400, P3D);
line(120, 80, 0, 340, 80, 60);
stroke(126);
line(340, 80, 60, 340, 300, 0);
stroke(255);
line(340, 300, 0, 120, 300, -200);
Syntax
line(x1, y1, x2, y2)
line(x1, y1, z1, x2, y2, z2)
Parameters
x1
( float )
x-coordinate of the first point
y1
( float )
y-coordinate of the first point
x2
( float )
x-coordinate of the second point
y2
( float )
y-coordinate of the second point
z1
( float )
z-coordinate of the first point
z2
( float )
z-coordinate of the second point
Return
void
Related
strokeWeight()
strokeJoin()
strokeCap()
beginShape()
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
