# Julia-set vertex shader

- Source: https://raw.githubusercontent.com/vharivinay/julia-set-with-shaders/main/assets/julia.vert
- Original URL: https://raw.githubusercontent.com/vharivinay/julia-set-with-shaders/main/assets/julia.vert
- Kind: challenge-source
- Purpose: Reference vertex shader for the Julia-set render.
- Fetched: 2026-03-25T21:29:57.604Z

## Extracted text

#ifdef GL_ES
precision highp float;
#endif
attribute vec3 aPosition;
varying vec2 vPos;
// Always include this to get the position of the pixel and map the shader correctly onto the shape
void main(){
// Send the vertex information on to the fragment shader
gl_Position=vec4(aPosition,1.);
vPos=gl_Position.xy;
}
