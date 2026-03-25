#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aPosition;
varying vec2 vUv;

void main() {
    vUv = (aPosition.xy + 1.0) * 0.5;
    gl_Position = vec4(aPosition, 1.0);
}
