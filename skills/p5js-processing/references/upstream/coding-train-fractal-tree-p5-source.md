# Coding Train Fractal Tree p5 source

- Source: https://raw.githubusercontent.com/CodingTrain/website-archive/main/CodingChallenges/CC_014_FractalTree/P5/sketch.js
- Original URL: https://raw.githubusercontent.com/CodingTrain/website-archive/main/CodingChallenges/CC_014_FractalTree/P5/sketch.js
- Kind: challenge-source
- Purpose: Primary p5 reference implementation for the recursive fractal tree.
- Fetched: 2026-03-25T21:29:46.152Z

## Extracted text

// Coding Rainbow
// Daniel Shiffman
// http://patreon.com/codingtrain
// Code for: https://youtu.be/0jjeOYMjmDU
var angle = 0;
var slider;
function setup() {
createCanvas(400, 400);
slider = createSlider(0, TWO_PI, PI / 4, 0.01);
}
function draw() {
background(51);
angle = slider.value();
stroke(255);
translate(200, height);
branch(100);
}
function branch(len) {
line(0, 0, 0, -len);
translate(0, -len);
if (len > 4) {
push();
rotate(angle);
branch(len * 0.67);
pop();
push();
rotate(-angle);
branch(len * 0.67);
pop();
}
//line(0, 0, 0, -len * 0.67);
}
