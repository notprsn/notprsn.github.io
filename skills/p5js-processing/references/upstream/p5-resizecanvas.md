# p5 resizeCanvas()

- Source: https://p5js.org/reference/p5/resizeCanvas/
- Original URL: https://p5js.org/reference/p5/resizeCanvas/
- Kind: p5-reference
- Purpose: Responsive canvas resizing for sketch containers.
- Fetched: 2026-03-25T21:29:49.705Z

## Extracted text

resizeCanvas Skip to main content Menu
Reference Tutorials Examples Contribute Community About
Start Coding
Donate
Reference
English
Accessibility
Reference resizeCanvas()
resizeCanvas()
Resizes the canvas to a given width and height. resizeCanvas()
immediately clears the canvas and calls redraw() . It's common to call resizeCanvas()
within the body of windowResized() like so: function windowResized() {
resizeCanvas(windowWidth, windowHeight);
}
The first two parameters, width
and height
, set the dimensions of the canvas. They also the values of the width and height system variables. For example, calling resizeCanvas(300, 500)
resizes the canvas to 300×500 pixels, then sets width to 300 and height 500. The third parameter, noRedraw
, is optional. If true
is passed, as in resizeCanvas(300, 500, true)
, then the canvas will be canvas to 300×500 pixels but the redraw() function won't be called immediately. By default, redraw() is called immediately when resizeCanvas()
finishes executing.
Examples
Syntax
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
resizeCanvas(width, height, [noRedraw])
Parameters
width Number: width of the canvas.
height Number: height of the canvas.
noRedraw Boolean: whether to delay calling redraw() . Defaults to false
.
This page is generated from the comments in src/core/rendering.js . Please feel free to edit it and submit a pull request!
Related References
createFramebuffer Creates a new p5.Framebuffer object with the same WebGL context as the graphics buffer.
remove Removes the graphics buffer from the web page.
reset Resets the graphics buffer's transformations and lighting.
blendMode Sets the way colors blend when added to the canvas.
p5.js
Resources
Reference Tutorials Examples Contribute Community About Start Coding Donate
Information
Download Contact Copyright Privacy Policy Terms of Use
Socials
GitHub ↗ Instagram ↗ X ↗ YouTube ↗ Discord ↗ Forum ↗
Looking for the new version? Find p5.js 2.0 here!
