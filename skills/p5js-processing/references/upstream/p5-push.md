# p5 push()

- Source: https://p5js.org/reference/p5/push/
- Original URL: https://p5js.org/reference/p5/push/
- Kind: p5-reference
- Purpose: Transform stack semantics in p5.
- Fetched: 2026-03-25T21:29:49.575Z

## Extracted text

push Skip to main content Menu
Reference Tutorials Examples Contribute Community About
Start Coding
Donate
Reference
English
Accessibility
Reference push()
push()
Begins a drawing group that contains its own styles and transformations. By default, styles such as fill() and transformations such as rotate() are applied to all drawing that follows. The push()
and pop() functions can limit the effect of styles and transformations to a specific group of shapes, images, and text. For example, a group of shapes could be translated to follow the mouse without affecting the rest of the sketch: // Begin the drawing group.
push();
// Translate the origin to the mouse's position.
translate(mouseX, mouseY);
// Style the face.
noStroke();
fill('green');
// Draw the face.
circle(0, 0, 60);
// Style the eyes.
fill('white');
// Draw the left eye.
ellipse(-20, -20, 30, 20);
// Draw the right eye.
ellipse(20, -20, 30, 20);
// End the drawing group.
pop();
// Draw a bug.
let x = random(0, 100);
let y = random(0, 100);
text('🦟', x, y);
In the code snippet above, the bug's position isn't affected by translate(mouseX, mouseY)
because that transformation is contained between push()
and pop() . The bug moves around the entire canvas as expected. Note: push()
and pop() are always called as a pair. Both functions are required to begin and end a drawing group. push()
and pop() can also be nested to create subgroups. For example, the code snippet above could be changed to give more detail to the frog’s eyes: // Begin the drawing group.
push();
// Translate the origin to the mouse's position.
translate(mouseX, mouseY);
// Style the face.
noStroke();
fill('green');
// Draw a face.
circle(0, 0, 60);
// Style the eyes.
fill('white');
// Draw the left eye.
push();
translate(-20, -20);
ellipse(0, 0, 30, 20);
fill('black');
circle(0, 0, 8);
pop();
// Draw the right eye.
push();
translate(20, -20);
ellipse(0, 0, 30, 20);
fill('black');
circle(0, 0, 8);
pop();
// End the drawing group.
pop();
// Draw a bug.
let x = random(0, 100);
let y = random(0, 100);
text('🦟', x, y);
In this version, the code to draw each eye is contained between its own push()
and pop() functions. Doing so makes it easier to add details in the correct part of a drawing. push()
and pop() contain the effects of the following functions: fill() noFill() noStroke() stroke() tint() noTint() strokeWeight() strokeCap() strokeJoin() imageMode() rectMode() ellipseMode() colorMode() textAlign() textFont() textSize() textLeading() applyMatrix() resetMatrix() rotate() scale() shearX() shearY() translate()
In WebGL mode, push()
and pop() contain the effects of a few additional styles: setCamera() ambientLight() directionalLight() pointLight() texture() specularMaterial() shininess() normalMaterial() shader()
Examples
This page is generated from the comments in src/core/structure.js . Please feel free to edit it and submit a pull request!
Related References
disableFriendlyErrors Turns off the parts of the Friendly Error System (FES) that impact performance.
draw A function that's called repeatedly while the sketch runs.
isLooping Returns true if the draw loop is running and false if not.
loop Resumes the draw loop after noLoop() has been called.
p5.js
Resources
Reference Tutorials Examples Contribute Community About Start Coding Donate
Information
Download Contact Copyright Privacy Policy Terms of Use
Socials
GitHub ↗ Instagram ↗ X ↗ YouTube ↗ Discord ↗ Forum ↗
Looking for the new version? Find p5.js 2.0 here!
