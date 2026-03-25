# p5 colorMode()

- Source: https://p5js.org/reference/p5/colorMode/
- Original URL: https://p5js.org/reference/p5/colorMode/
- Kind: p5-reference
- Purpose: Color-space handling for point-cloud palettes.
- Fetched: 2026-03-25T21:29:48.584Z

## Extracted text

colorMode Skip to main content Menu
Reference Tutorials Examples Contribute Community About
Start Coding
Donate
Reference
English
Accessibility
Reference colorMode()
colorMode()
Changes the way color values are interpreted. By default, the Number
parameters for fill() , stroke() , background() , and color() are defined by values between 0 and 255 using the RGB color model. This is equivalent to calling colorMode(RGB, 255)
. Pure red is color(255, 0, 0)
in this model. Calling colorMode(RGB, 100)
sets colors to use RGB color values between 0 and 100. Pure red is color(100, 0, 0)
in this model. Calling colorMode(HSB)
or colorMode(HSL)
changes to HSB or HSL system instead of RGB. Pure red is color(0, 100, 100)
in HSB and color(0, 100, 50)
in HSL. p5.Color objects remember the mode that they were created in. Changing modes doesn't affect their appearance.
Examples
Syntax
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
colorMode(mode, [max])
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
colorMode(mode, max1, max2, max3, [maxA])
Parameters
mode Constant: either RGB, HSB or HSL, corresponding to Red/Green/Blue and Hue/Saturation/Brightness (or Lightness).
max Number: range for all values.
max1 Number: range for the red or hue depending on the current color mode.
max2 Number: range for the green or saturation depending on the current color mode.
max3 Number: range for the blue or brightness/lightness depending on the current color mode.
maxA Number: range for the alpha.
This page is generated from the comments in src/color/setting.js . Please feel free to edit it and submit a pull request!
Related References
background Sets the color used for the background of the canvas.
beginClip Starts defining a shape that will mask any shapes drawn afterward.
clear Clears the pixels on the canvas.
clip Defines a shape that will mask any shapes drawn afterward.
p5.js
Resources
Reference Tutorials Examples Contribute Community About Start Coding Donate
Information
Download Contact Copyright Privacy Policy Terms of Use
Socials
GitHub ↗ Instagram ↗ X ↗ YouTube ↗ Discord ↗ Forum ↗
Looking for the new version? Find p5.js 2.0 here!
