# p5 createSelect()

- Source: https://p5js.org/reference/p5/createSelect/
- Original URL: https://p5js.org/reference/p5/createSelect/
- Kind: p5-reference
- Purpose: Preset selectors and interactive dropdown controls.
- Fetched: 2026-03-25T21:29:48.699Z

## Extracted text

createSelect Skip to main content Menu
Reference Tutorials Examples Contribute Community About
Start Coding
Donate
Reference
English
Accessibility
Reference createSelect()
createSelect()
Creates a dropdown menu <select></select>
element. The parameter is optional. If true
is passed, as in let mySelect = createSelect(true)
, then the dropdown will support multiple selections. If an existing <select></select>
element is passed, as in let mySelect = createSelect(otherSelect)
, the existing element will be wrapped in a new p5.Element object. Dropdowns extend the p5.Element class with a few helpful methods for managing options: mySelect.option(name, [value])
adds an option to the menu. The first paremeter, name
, is a string that sets the option's name and value. The second parameter, value
, is optional. If provided, it sets the value that corresponds to the key name
. If an option with name
already exists, its value is changed to value
. mySelect.value()
returns the currently-selected option's value. mySelect.selected()
returns the currently-selected option. mySelect.selected(option)
selects the given option by default. mySelect.disable()
marks the whole dropdown element as disabled. mySelect.disable(option)
marks a given option as disabled. mySelect.enable()
marks the whole dropdown element as enabled. mySelect.enable(option)
marks a given option as enabled.
Examples
Syntax
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
createSelect([multiple])
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
createSelect(existing)
Parameters
multiple Boolean: support multiple selections.
existing Object: select element to wrap, either as a p5.Element or a HTMLSelectElement .
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
