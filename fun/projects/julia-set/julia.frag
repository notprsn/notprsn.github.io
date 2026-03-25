#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform vec2 u_c;
uniform float u_zoom;
uniform float u_iterations;
uniform float u_paletteShift;
uniform float u_time;
varying vec2 vUv;

const int MAX_ITER = 480;

vec3 palette(float t) {
    vec3 a = vec3(0.10, 0.11, 0.16);
    vec3 b = vec3(0.45, 0.32, 0.24);
    vec3 c = vec3(1.0, 0.82, 0.63);
    vec3 d = vec3(0.10, 0.18, 0.27) + vec3(u_paletteShift, u_paletteShift * 1.35, u_paletteShift * 1.7);
    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;

    vec2 z = u_center + uv / u_zoom;
    float iteration = 0.0;
    float trap = 10.0;
    bool escaped = false;

    for (int i = 0; i < MAX_ITER; i++) {
        if (float(i) >= u_iterations) {
            break;
        }

        z = vec2(
            z.x * z.x - z.y * z.y + u_c.x,
            2.0 * z.x * z.y + u_c.y
        );

        trap = min(trap, length(z));

        if (dot(z, z) > 64.0) {
            iteration = float(i);
            escaped = true;
            break;
        }
    }

    if (!escaped) {
        float inner = smoothstep(0.0, 1.2, trap);
        vec3 insideColor = mix(vec3(0.02, 0.02, 0.05), vec3(0.11, 0.09, 0.14), inner);
        gl_FragColor = vec4(insideColor, 1.0);
        return;
    }

    float smoothIteration = iteration + 1.0 - log(log(length(z))) / log(2.0);
    float t = smoothIteration / u_iterations;
    vec3 color = palette(t + 0.04 * sin(u_time * 0.15));
    color += 0.12 * exp(-9.0 * trap) * vec3(1.0, 0.75, 0.55);
    gl_FragColor = vec4(color, 1.0);
}
