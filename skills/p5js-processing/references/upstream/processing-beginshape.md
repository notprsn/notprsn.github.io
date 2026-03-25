# Processing beginShape()

- Source: https://processing.org/reference/beginshape_
- Original URL: https://processing.org/reference/beginshape_
- Kind: processing-reference
- Purpose: Processing-side point-cloud and custom geometry semantics.
- Fetched: 2026-03-25T21:29:51.622Z

## Extracted text

beginShape() / Reference / Processing.org
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
Documentation → Reference → Shape → Vertex
Name
beginShape()
Description
Using the beginShape() and endShape() functions allow creating
more complex forms. beginShape() begins recording vertices for a shape
and endShape() stops recording. The value of the kind parameter
tells it which types of shapes to create from the provided vertices. With no
mode specified, the shape can be any irregular polygon. The parameters
available for beginShape() are POINTS, LINES, TRIANGLES, TRIANGLE_FAN,
TRIANGLE_STRIP, QUADS, and QUAD_STRIP. After calling the beginShape()
function, a series of vertex() commands must follow. To stop drawing
the shape, call endShape() . The vertex() function with two
parameters specifies a position in 2D and the vertex() function with
three parameters specifies a position in 3D. Each shape will be outlined with
the current stroke color and filled with the fill color.
Transformations such as translate() , rotate() , and
scale() do not work within beginShape() . It is also not
possible to use other shapes, such as ellipse() or rect()
within beginShape() .
The P2D and P3D renderers allow stroke() and fill() to be
altered on a per-vertex basis, but the default renderer does not. Settings
such as strokeWeight() , strokeCap() , and strokeJoin()
cannot be changed while inside a beginShape() / endShape() block
with any renderer.
Examples
Copy beginShape();
vertex(120, 80);
vertex(340, 80);
vertex(340, 300);
vertex(120, 300);
endShape(CLOSE);
Copy beginShape(POINTS);
vertex(120, 80);
vertex(340, 80);
vertex(340, 300);
vertex(120, 300);
endShape();
Copy beginShape();
vertex(120, 80);
vertex(230, 80);
vertex(230, 190);
vertex(340, 190);
vertex(340, 300);
vertex(120, 300);
endShape(CLOSE);
Copy beginShape(LINES);
vertex(120, 80);
vertex(340, 80);
vertex(340, 300);
vertex(120, 300);
endShape();
Copy noFill();
beginShape();
vertex(120, 80);
vertex(340, 80);
vertex(340, 300);
vertex(120, 300);
endShape();
Copy noFill();
beginShape();
vertex(120, 80);
vertex(340, 80);
vertex(340, 300);
vertex(120, 300);
endShape(CLOSE);
Copy beginShape(TRIANGLES);
vertex(120, 300);
vertex(160, 120);
vertex(200, 300);
vertex(270, 80);
vertex(280, 300);
vertex(320, 80);
endShape();
Copy beginShape(TRIANGLE_STRIP);
vertex(120, 300);
vertex(160, 80);
vertex(200, 300);
vertex(240, 80);
vertex(280, 300);
vertex(320, 80);
vertex(360, 300);
endShape();
Copy beginShape(TRIANGLE_FAN);
vertex(230, 200);
vertex(230, 60);
vertex(368, 200);
vertex(230, 340);
vertex(88, 200);
vertex(230, 60);
endShape();
Copy beginShape(QUADS);
vertex(120, 80);
vertex(120, 300);
vertex(200, 300);
vertex(200, 80);
vertex(260, 80);
vertex(260, 300);
vertex(340, 300);
vertex(340, 80);
endShape();
Copy beginShape(QUAD_STRIP);
vertex(120, 80);
vertex(120, 300);
vertex(200, 80);
vertex(200, 300);
vertex(260, 80);
vertex(260, 300);
vertex(340, 80);
vertex(340, 300);
endShape();
Syntax
beginShape()
beginShape(kind)
Parameters
kind
( int )
Either POINTS, LINES, TRIANGLES, TRIANGLE_FAN, TRIANGLE_STRIP,
QUADS, or QUAD_STRIP
Return
void
Related
PShape
endShape()
vertex()
curveVertex()
bezierVertex()
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
