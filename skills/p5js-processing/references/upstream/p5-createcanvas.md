# p5 createCanvas()

- Source: https://p5js.org/reference/p5/createCanvas/
- Original URL: https://p5js.org/reference/p5/createCanvas/
- Kind: p5-reference
- Purpose: Renderer setup and WEBGL mode.
- Fetched: 2026-03-25T21:29:48.643Z

## Extracted text

createCanvas Skip to main content Menu
Reference Tutorials Examples Contribute Community About
Start Coding
Donate
Reference
English
Accessibility
Reference createCanvas()
createCanvas()
Creates a canvas element on the web page. createCanvas()
creates the main drawing canvas for a sketch. It should only be called once at the beginning of setup() . Calling createCanvas()
more than once causes unpredictable behavior. The first two parameters, width
and height
, are optional. They set the dimensions of the canvas and the values of the width and height system variables. For example, calling createCanvas(900, 500)
creates a canvas that's 900×500 pixels. By default, width
and height
are both 100. The third parameter is also optional. If either of the constants P2D
or WEBGL
is passed, as in createCanvas(900, 500, WEBGL)
, then it will set the sketch's rendering mode. If an existing HTMLCanvasElement is passed, as in createCanvas(900, 500, myCanvas)
, then it will be used by the sketch. The fourth parameter is also optional. If an existing HTMLCanvasElement is passed, as in createCanvas(900, 500, WEBGL, myCanvas)
, then it will be used by the sketch. Note: In WebGL mode, the canvas will use a WebGL2 context if it's supported by the browser. Check the webglVersion system variable to check what version is being used, or call setAttributes({ version: 1 })
to create a WebGL1 context.
Examples
Syntax
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
createCanvas([width], [height], [renderer], [canvas])
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
createCanvas([width], [height], [canvas])
Parameters
width Number: width of the canvas. Defaults to 100.
height Number: height of the canvas. Defaults to 100.
renderer Constant: either P2D or WEBGL. Defaults to P2D
.
canvas HTMLCanvasElement: existing canvas element that should be used for the sketch.
Returns
p5.Renderer: new `p5.Renderer` that holds the canvas.
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
