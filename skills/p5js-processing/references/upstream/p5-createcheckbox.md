# p5 createCheckbox()

- Source: https://p5js.org/reference/p5/createCheckbox/
- Original URL: https://p5js.org/reference/p5/createCheckbox/
- Kind: p5-reference
- Purpose: Interactive toggle controls when using p5 DOM helpers.
- Fetched: 2026-03-25T21:29:48.670Z

## Extracted text

createCheckbox Skip to main content Menu
Reference Tutorials Examples Contribute Community About
Start Coding
Donate
Reference
English
Accessibility
Reference createCheckbox()
createCheckbox()
Creates a checkbox <input>
element. Checkboxes extend the p5.Element class with a checked()
method. Calling myBox.checked()
returns true
if it the box is checked and false
if not. The first parameter, label
, is optional. It's a string that sets the label to display next to the checkbox. The second parameter, value
, is also optional. It's a boolean that sets the checkbox's value.
Examples
Syntax
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
createCheckbox([label], [value])
Parameters
label String: label displayed after the checkbox.
value Boolean: value of the checkbox. Checked is true
and unchecked is false
.
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
