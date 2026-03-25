# p5 loadShader()

- Source: https://p5js.org/reference/p5/loadShader/
- Original URL: https://p5js.org/reference/p5/loadShader/
- Kind: p5-reference
- Purpose: Loading vertex and fragment shaders for full-screen WEBGL sketches.
- Fetched: 2026-03-25T21:29:49.172Z

## Extracted text

loadShader Skip to main content Menu
Reference Tutorials Examples Contribute Community About
Start Coding
Donate
Reference
English
Accessibility
Reference loadShader()
loadShader()
Loads vertex and fragment shaders to create a p5.Shader object. Shaders are programs that run on the graphics processing unit (GPU). They can process many pixels at the same time, making them fast for many graphics tasks. They’re written in a language called GLSL and run along with the rest of the code in a sketch. Once the p5.Shader object is created, it can be used with the shader() function, as in shader(myShader)
. A shader program consists of two files, a vertex shader and a fragment shader. The vertex shader affects where 3D geometry is drawn on the screen and the fragment shader affects color. loadShader()
loads the vertex and fragment shaders from their .vert
and .frag
files. For example, calling loadShader('/assets/shader.vert', '/assets/shader.frag')
loads both required shaders and returns a p5.Shader object. The third parameter, successCallback
, is optional. If a function is passed, it will be called once the shader has loaded. The callback function can use the new p5.Shader object as its parameter. The fourth parameter, failureCallback
, is also optional. If a function is passed, it will be called if the shader fails to load. The callback function can use the event error as its parameter. Shaders can take time to load. Calling loadShader()
in preload() ensures shaders load before they're used in setup() or draw() . Note: Shaders can only be used in WebGL mode.
Examples
Syntax
pre]:text-wrap bg-bg-gray-40 break-all code-box inline-block my-md p-sm relative rounded-[1.25rem] text-body-mono undefined w-full">
loadShader(vertFilename, fragFilename, [successCallback], [failureCallback])
Parameters
vertFilename String: path of the vertex shader to be loaded.
fragFilename String: path of the fragment shader to be loaded.
successCallback Function: function to call once the shader is loaded. Can be passed the p5.Shader object.
failureCallback Function: function to call if the shader fails to load. Can be passed an Error
event object.
Returns
p5.Shader: new shader created from the vertex and fragment shader files.
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
