# p5 createSlider()

- Source: https://p5js.org/reference/p5/createSlider/
- Original URL: https://p5js.org/reference/p5/createSlider/
- Kind: p5-reference
- Purpose: Interactive numeric controls.
- Fetched: 2026-03-25T21:29:48.722Z

## Extracted text

createSlider Skip to main content Menu
Reference Tutorials Examples Contribute Community About
Start Coding
Donate
Reference
English
Accessibility
Reference createSlider()
createSlider()
Creates a slider <input>
element. Range sliders are useful for quickly selecting numbers from a given range. The first two parameters, min
and max
, are numbers that set the slider's minimum and maximum. The third parameter, value
, is optional. It's a number that sets the slider's default value. The fourth parameter, step
, is also optional. It's a number that sets the spacing between each value in the slider's range. Setting step
to 0 allows the slider to move smoothly from min
to max
.
Examples
Syntax
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
createSlider(min, max, [value], [step])
Parameters
min Number: minimum value of the slider.
max Number: maximum value of the slider.
value Number: default value of the slider.
step Number: size for each step in the slider's range.
Returns
p5.Element: new p5.Element object.
This page is generated from the comments in src/dom/dom.js . Please feel free to edit it and submit a pull request!
Related References
addClass Adds a class to the element.
attribute Adds an attribute to the element.
center Centers the element either vertically, horizontally, or both.
child Attaches the element as a child of another element.
p5.js
Resources
Reference Tutorials Examples Contribute Community About Start Coding Donate
Information
Download Contact Copyright Privacy Policy Terms of Use
Socials
GitHub ↗ Instagram ↗ X ↗ YouTube ↗ Discord ↗ Forum ↗
Looking for the new version? Find p5.js 2.0 here!
