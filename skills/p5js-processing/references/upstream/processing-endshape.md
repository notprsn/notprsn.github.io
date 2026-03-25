# Processing endShape()

- Source: https://processing.org/reference/endshape_
- Original URL: https://processing.org/reference/endshape_
- Kind: processing-reference
- Purpose: Completing polyline and polygon shapes in Processing.
- Fetched: 2026-03-25T21:29:51.819Z

## Extracted text

endShape() / Reference / Processing.org
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
endShape()
Description
The endShape() function is the companion to beginShape()
and may only be called after beginShape() . When endshape()
is called, all the image data defined since the previous call to
beginShape() is written into the image buffer. The constant CLOSE
as the value for the MODE parameter to close the shape (to connect the
beginning and the end).
Examples
Copy size(400, 400);
noFill();
beginShape();
vertex(80, 80);
vertex(180, 80);
vertex(180, 320);
endShape(CLOSE);
beginShape();
vertex(200, 80);
vertex(300, 80);
vertex(300, 320);
endShape();
Syntax
endShape()
endShape(mode)
Parameters
mode
( int )
use CLOSE to close the shape
Return
void
Related
PShape
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
