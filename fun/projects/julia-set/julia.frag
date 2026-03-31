#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform vec2 u_c;
uniform float u_zoom;
uniform float u_iterations;
varying vec2 vUv;

const int MAX_ITER = 320;

vec3 palette(float t) {
    vec3 a = vec3(0.06, 0.07, 0.10);
    vec3 b = vec3(0.64, 0.42, 0.28);
    vec3 c = vec3(1.0, 0.85, 0.68);
    vec3 d = vec3(0.12, 0.18, 0.24);
    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;

    vec2 z = u_center + uv / u_zoom;
    float iteration = 0.0;
    bool escaped = false;

    for (int i = 0; i < MAX_ITER; i++) {
        if (float(i) >= u_iterations) {
            break;
        }

        z = vec2(
            z.x * z.x - z.y * z.y + u_c.x,
            2.0 * z.x * z.y + u_c.y
        );

        if (dot(z, z) > 64.0) {
            iteration = float(i);
            escaped = true;
            break;
        }
    }

    if (!escaped) {
        gl_FragColor = vec4(vec3(0.03, 0.03, 0.05), 1.0);
        return;
    }

    float smoothIteration = iteration + 1.0 - log(log(length(z))) / log(2.0);
    float t = smoothIteration / u_iterations;
    vec3 color = palette(t);
    gl_FragColor = vec4(color, 1.0);
}
