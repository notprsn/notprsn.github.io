# Processing size()

- Source: https://processing.org/reference/size_.html
- Original URL: https://processing.org/reference/size_.html
- Kind: processing-reference
- Purpose: Renderer setup and the role of P3D.
- Fetched: 2026-03-25T21:29:55.492Z

## Extracted text

size() / Reference / Processing.org
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
Documentation → Reference → Environment
Name
size()
Description
Defines the dimension of the display window width and height in units of
pixels. In a program that has the setup() function, the
size() function must be the first line of code inside
setup() , and the setup() function must appear in the code tab
with the same name as your sketch folder.
The built-in variables width and height are set by the
parameters passed to this function. For example, running size(640,
480) will assign 640 to the width variable and 480 to the height
variable . If size() is not used, the window will be given a
default size of 100 x 100 pixels.
The size() function can only be used once inside a sketch, and it
cannot be used for resizing. Use windowResize() instead.
To run a sketch that fills the screen, use the fullScreen() function,
rather than using size(displayWidth, displayHeight) .
The renderer parameter selects which rendering engine to use. For
example, if you will be drawing 3D shapes, use P3D . The default
renderer is slower for some situations (for instance large or
high-resolution displays) but generally has higher quality than the
other renderers for 2D drawing.
In addition to the default renderer, other renderers are:
P2D (Processing 2D): 2D graphics renderer that makes use of
OpenGL-compatible graphics hardware.
P3D (Processing 3D): 3D graphics renderer that makes use of
OpenGL-compatible graphics hardware.
FX2D (JavaFX 2D): A 2D renderer that uses JavaFX, which may be
faster for some applications, but has some compatibility quirks.
Use \u201cManage Libraries\u201d to download and install the JavaFX library.
PDF : The PDF renderer draws 2D graphics directly to an Acrobat PDF
file. This produces excellent results when you need vector shapes for
high-resolution output or printing. You must first use Import Library
&rarr; PDF to make use of the library. More information can be found in the
PDF library reference.
SVG : The SVG renderer draws 2D graphics directly to an SVG file.
This is great for importing into other vector programs or using for
digital fabrication. It is not as feature-complete as other renderers.
Like PDF, you must first use Import Library &rarr; SVG Export to
make use the SVG library.
As of Processing 3.0, to use variables as the parameters to size()
function, place the size() function within the settings()
function (instead of setup() ). There is more information about this
on the settings() reference page.
The maximum width and height is limited by your operating system, and is
usually the width and height of your actual screen. On some machines it may
simply be the number of pixels on your current screen, meaning that a
screen of 800 x 600 could support size(1600, 300) , since that is the
same number of pixels. This varies widely, so you'll have to try different
rendering modes and sizes until you get what you're looking for. If you
need something larger, use createGraphics to create a non-visible
drawing surface.
The minimum width and height is around 100 pixels in each direction. This
is the smallest that is supported across Windows, macOS, and Linux. We
enforce the minimum size so that sketches will run identically on different
machines.
Examples
Copy
size(200, 100);
background(153);
line(0, 0, width, height);
Copy void setup() {
size(320, 240);
}
void draw() {
background(153);
line(0, 0, width, height);
}
Copy
size(150, 200, P3D); // Specify P3D renderer
background(153);
// With P3D, we can use z (depth) values...
line(0, 0, 0, width, height, -100);
line(width, 0, 0, width, height, -100);
line(0, height, 0, width, height, -100);
//...and 3D-specific functions, like box()
translate(width/2, height/2);
rotateX(PI/6);
rotateY(PI/6);
box(35);
Syntax
size(width, height)
size(width, height, renderer)
Parameters
width
( int )
width of the display window in units of pixels
height
( int )
height of the display window in units of pixels
Return
void
Related
width
height
setup()
settings()
fullScreen()
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
