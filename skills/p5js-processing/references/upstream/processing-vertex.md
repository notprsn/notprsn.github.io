# Processing vertex()

- Source: https://processing.org/reference/vertex_.html
- Original URL: https://processing.org/reference/vertex_.html
- Kind: processing-reference
- Purpose: Vertex semantics inside beginShape()/endShape().
- Fetched: 2026-03-25T21:29:56.003Z

## Extracted text

vertex() / Reference / Processing.org
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
vertex()
Description
All shapes are constructed by connecting a series of vertices.
vertex() is used to specify the vertex coordinates for points, lines,
triangles, quads, and polygons. It is used exclusively within the
beginShape() and endShape() functions.
Drawing a vertex in 3D using the z parameter requires the P3D
parameter in combination with size, as shown in the above example.
This function is also used to map a texture onto geometry. The
texture() function declares the texture to apply to the geometry and
the u and v coordinates set define the mapping of this texture
to the form. By default, the coordinates used for u and v are
specified in relation to the image's size in pixels, but this relation can be
changed with  textureMode() .
Examples
Copy size(400, 400);
beginShape(POINTS);
vertex(120, 80);
vertex(340, 80);
vertex(340, 300);
vertex(120, 300);
endShape();
Copy // Drawing vertices in 3D requires P3D
// as a parameter to size()
size(400, 400, P3D);
beginShape(POINTS);
vertex(120, 80, -200);
vertex(340, 80, -200);
vertex(340, 300, -200);
vertex(120, 300, -200);
endShape();
Copy size(400, 400, P3D);
PImage img = loadImage("laDefense.jpg");
noStroke();
beginShape();
texture(img);
// "laDefense.jpg" is 100x100 pixels in size so
// the values 0 and 400 are used for the
// parameters "u" and "v" to map it directly
// to the vertex points
vertex(40, 80, 0, 0);
vertex(320, 20, 100, 0);
vertex(380, 360, 100, 100);
vertex(160, 380, 0, 100);
endShape();
Syntax
vertex(x, y)
vertex(x, y, z)
vertex(v)
vertex(x, y, u, v)
vertex(x, y, z, u, v)
Parameters
v
( float[], float )
vertex parameters, as a float array of length VERTEX_FIELD_COUNT
x
( float )
x-coordinate of the vertex
y
( float )
y-coordinate of the vertex
z
( float )
z-coordinate of the vertex
u
( float )
horizontal coordinate for the texture mapping
v
( float, float[] )
vertical coordinate for the texture mapping
Return
void
Related
beginShape()
endShape()
bezierVertex()
quadraticVertex()
curveVertex()
texture()
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
