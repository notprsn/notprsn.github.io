# Coding Train Koch Snowflake p5 segment

- Source: https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/129_Koch_Snowflake/P5/segment.js
- Original URL: https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/129_Koch_Snowflake/P5/segment.js
- Kind: challenge-source
- Purpose: Segment subdivision logic for the Koch Snowflake p5 sketch.
- Fetched: 2026-03-25T21:29:46.689Z

## Extracted text

// Coding Challenge 129: Koch Snowflake
// Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/129-koch-snowflake.html
// https://youtu.be/X8bXDKqMsXE
// https://editor.p5js.org/codingtrain/sketches/SJHcVCAgN
class Segment {
constructor(a, b) {
this.a = a.copy();
this.b = b.copy();
}
generate() {
let children = [];
let v = p5.Vector.sub(this.b, this.a);
v.div(3);
// Segment 0
let b1 = p5.Vector.add(this.a, v);
children[0] = new Segment(this.a, b1);
// Segment 3
let a1 = p5.Vector.sub(this.b, v);
children[3] = new Segment(a1, this.b);
v.rotate(-PI / 3);
let c = p5.Vector.add(b1, v);
// Segment 2
children[1] = new Segment(b1, c);
// Segment 3
children[2] = new Segment(c, a1);
return children;
}
show() {
stroke(255);
line(this.a.x, this.a.y, this.b.x, this.b.y);
}
}
