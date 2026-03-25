# p5 shader()

- Source: https://p5js.org/reference/p5/shader/
- Original URL: https://p5js.org/reference/p5/shader/
- Kind: p5-reference
- Purpose: Applying custom shaders to WEBGL geometry in p5.
- Fetched: 2026-03-25T21:29:50.428Z

## Extracted text

shader Skip to main content Menu
Reference Tutorials Examples Contribute Community About
Start Coding
Donate
Reference
English
Accessibility
Reference shader()
shader()
Sets the p5.Shader object to apply while drawing. Shaders are programs that run on the graphics processing unit (GPU). They can process many pixels or vertices at the same time, making them fast for many graphics tasks. They’re written in a language called GLSL and run along with the rest of the code in a sketch. p5.Shader objects can be created using the createShader() and loadShader() functions. The parameter, s
, is the p5.Shader object to apply. For example, calling shader(myShader)
applies myShader
to process each pixel on the canvas. The shader will be used for: Fills when a texture is enabled if it includes a uniform sampler2D
. Fills when lights are enabled if it includes the attribute aNormal
, or if it has any of the following uniforms: uUseLighting
, uAmbientLightCount
, uDirectionalLightCount
, uPointLightCount
, uAmbientColor
, uDirectionalDiffuseColors
, uDirectionalSpecularColors
, uPointLightLocation
, uPointLightDiffuseColors
, uPointLightSpecularColors
, uLightingDirection
, or uSpecular
. Fills whenever there are no lights or textures. Strokes if it includes the uniform uStrokeWeight
.
The source code from a p5.Shader object's fragment and vertex shaders will be compiled the first time it's passed to shader()
. See MDN for more information about compiling shaders. Calling resetShader() restores a sketch’s default shaders. Note: Shaders can only be used in WebGL mode.
Examples
Syntax
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
shader(s)
Parameters
s p5.Shader: p5.Shader object to apply.
This page is generated from the comments in src/webgl/material.js . Please feel free to edit it and submit a pull request!
Related References
copyToContext Copies the shader from one drawing context to another.
inspectHooks Logs the hooks available in this shader, and their current implementation.
modify Returns a new shader, based on the original, but with custom snippets of shader code replacing default behaviour.
setUniform Sets the shader’s uniform (global) variables.
p5.js
Resources
Reference Tutorials Examples Contribute Community About Start Coding Donate
Information
Download Contact Copyright Privacy Policy Terms of Use
Socials
GitHub ↗ Instagram ↗ X ↗ YouTube ↗ Discord ↗ Forum ↗
Looking for the new version? Find p5.js 2.0 here!
