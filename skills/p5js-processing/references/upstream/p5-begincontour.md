# p5 beginContour()

- Source: https://p5js.org/reference/p5/beginContour/
- Original URL: https://p5js.org/reference/p5/beginContour/
- Kind: p5-reference
- Purpose: Contour handling when building more advanced polygonal fractal fills.
- Fetched: 2026-03-25T21:29:48.006Z

## Extracted text

beginContour Skip to main content Menu
Reference Tutorials Examples Contribute Community About
Start Coding
Donate
Reference
English
Accessibility
Reference beginContour()
beginContour()
Begins creating a hole within a flat shape. The beginContour()
and endContour() functions allow for creating negative space within custom shapes that are flat. beginContour()
begins adding vertices to a negative space and endContour() stops adding them. beginContour()
and endContour() must be called between beginShape() and endShape() . Transformations such as translate() , rotate() , and scale() don't work between beginContour()
and endContour() . It's also not possible to use other shapes, such as ellipse() or rect() , between beginContour()
and endContour() . Note: The vertices that define a negative space must "wind" in the opposite direction from the outer shape. First, draw vertices for the outer shape clockwise order. Then, draw vertices for the negative space in counter-clockwise order.
Examples
This page is generated from the comments in src/core/shape/vertex.js . Please feel free to edit it and submit a pull request!
Related References
beginContour Begins creating a hole within a flat shape.
beginShape Begins adding vertices to a custom shape.
bezierVertex Adds a Bézier curve segment to a custom shape.
curveVertex Adds a spline curve segment to a custom shape.
p5.js
Resources
Reference Tutorials Examples Contribute Community About Start Coding Donate
Information
Download Contact Copyright Privacy Policy Terms of Use
Socials
GitHub ↗ Instagram ↗ X ↗ YouTube ↗ Discord ↗ Forum ↗
Looking for the new version? Find p5.js 2.0 here!
