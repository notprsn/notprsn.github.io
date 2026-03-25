# p5 orbitControl()

- Source: https://p5js.org/reference/p5/orbitControl/
- Original URL: https://p5js.org/reference/p5/orbitControl/
- Kind: p5-reference
- Purpose: Camera orbiting, pan, and zoom in WEBGL sketches.
- Fetched: 2026-03-25T21:29:49.307Z

## Extracted text

orbitControl Skip to main content Menu
Reference Tutorials Examples Contribute Community About
Start Coding
Donate
Reference
English
Accessibility
Reference orbitControl()
orbitControl()
Allows the user to orbit around a 3D sketch using a mouse, trackpad, or touchscreen. 3D sketches are viewed through an imaginary camera. Calling orbitControl()
within the draw() function allows the user to change the camera’s position: function draw() {
background(200);
// Enable orbiting with the mouse.
orbitControl();
// Rest of sketch.
}
Left-clicking and dragging or swipe motion will rotate the camera position about the center of the sketch. Right-clicking and dragging or multi-swipe will pan the camera position without rotation. Using the mouse wheel (scrolling) or pinch in/out will move the camera further or closer from the center of the sketch. The first three parameters, sensitivityX
, sensitivityY
, and sensitivityZ
, are optional. They’re numbers that set the sketch’s sensitivity to movement along each axis. For example, calling orbitControl(1, 2, -1)
keeps movement along the x-axis at its default value, makes the sketch twice as sensitive to movement along the y-axis, and reverses motion along the z-axis. By default, all sensitivity values are 1. The fourth parameter, options
, is also optional. It’s an object that changes the behavior of orbiting. For example, calling orbitControl(1, 1, 1, options)
keeps the default sensitivity values while changing the behaviors set with options
. The object can have the following properties: let options = {
// Setting this to false makes mobile interactions smoother by
// preventing accidental interactions with the page while orbiting.
// By default, it's true.
disableTouchActions: true,
// Setting this to true makes the camera always rotate in the
// direction the mouse/touch is moving.
// By default, it's false.
freeRotation: false
};
orbitControl(1, 1, 1, options);
Examples
Syntax
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
orbitControl([sensitivityX], [sensitivityY], [sensitivityZ], [options])
Parameters
sensitivityX Number: sensitivity to movement along the x-axis. Defaults to 1.
sensitivityY Number: sensitivity to movement along the y-axis. Defaults to 1.
sensitivityZ Number: sensitivity to movement along the z-axis. Defaults to 1.
options Object: object with two optional properties, disableTouchActions
and freeRotation
. Both are Boolean
s. disableTouchActions
defaults to true
and freeRotation
defaults to false
.
This page is generated from the comments in src/webgl/interaction.js . Please feel free to edit it and submit a pull request!
Related References
debugMode Adds a grid and an axes icon to clarify orientation in 3D sketches.
noDebugMode Turns off debugMode() in a 3D sketch.
orbitControl Allows the user to orbit around a 3D sketch using a mouse, trackpad, or touchscreen.
p5.js
Resources
Reference Tutorials Examples Contribute Community About Start Coding Donate
Information
Download Contact Copyright Privacy Policy Terms of Use
Socials
GitHub ↗ Instagram ↗ X ↗ YouTube ↗ Discord ↗ Forum ↗
Looking for the new version? Find p5.js 2.0 here!
