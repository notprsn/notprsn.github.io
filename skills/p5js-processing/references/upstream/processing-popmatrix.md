# Processing popMatrix()

- Source: https://processing.org/reference/popmatrix_
- Original URL: https://processing.org/reference/popmatrix_
- Kind: processing-reference
- Purpose: Transform stack semantics.
- Fetched: 2026-03-25T21:29:53.006Z

## Extracted text

popMatrix() / Reference / Processing.org
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
popMatrix()
Description
Pops the current transformation matrix off the matrix stack.
Understanding pushing and popping requires understanding the concept of
a matrix stack. The pushMatrix() function saves the current
coordinate system to the stack and popMatrix() restores the prior
coordinate system. pushMatrix() and popMatrix() are used
in conjunction with the other transformation functions and may be
embedded to control the scope of the transformations.
Examples
Copy size(400, 400);
fill(255);
rect(0, 0, 200, 200); // White rectangle
pushMatrix();
translate(120, 80);
fill(0);
rect(0, 0, 200, 200); // Black rectangle
popMatrix();
fill(100);
rect(60, 40, 200, 200); // Gray rectangle
Syntax
popMatrix()
Return
void
Related
pushMatrix()
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
