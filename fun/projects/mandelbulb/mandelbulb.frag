#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_cameraPos;
uniform vec3 u_cameraTarget;
uniform vec3 u_paletteA;
uniform vec3 u_paletteB;
uniform vec3 u_paletteC;
uniform vec3 u_glowColor;
uniform vec3 u_bgTop;
uniform vec3 u_bgBottom;
uniform vec3 u_lightDir;
uniform int u_maxSteps;
uniform int u_aoSamples;
uniform float u_surfaceEpsilon;

const float PI = 3.14159265359;
const float MAX_DIST = 10.0;
const int MAX_RAY_STEPS = 140;
const int MAX_BULB_ITER = 15;
const int MAX_AO_STEPS = 4;
const float POWER = 8.0;

mat2 rot(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

vec3 spherical(vec3 pos) {
    float r = length(pos);
    float theta = atan(length(pos.xy), pos.z);
    float phi = atan(pos.y, pos.x);
    return vec3(r, theta, phi);
}

vec4 mapBulb(vec3 pos) {
    vec3 z = pos;
    float dr = 1.0;
    float radius = 0.0;
    float iter = 0.0;
    float trap = 1e6;

    for (int i = 0; i < MAX_BULB_ITER; i += 1) {
        radius = length(z);
        trap = min(trap, abs(radius - 0.92));
        if (radius > 4.0) {
            break;
        }

        vec3 polar = spherical(z);
        float safeRadius = max(polar.x, 1e-6);
        dr = POWER * pow(safeRadius, POWER - 1.0) * dr + 1.0;

        float zr = pow(safeRadius, POWER);
        float theta = polar.y * POWER;
        float phi = polar.z * POWER;
        float sinTheta = sin(theta);

        z = zr * vec3(
            sinTheta * cos(phi),
            sinTheta * sin(phi),
            cos(theta)
        ) + pos;

        iter += 1.0;
    }

    float distanceEstimate = 0.25 * log(max(radius, 1.0)) * radius / max(dr, 1.0);
    float iterationSignal = iter / float(MAX_BULB_ITER);
    float trapSignal = clamp(1.0 - trap * 0.85, 0.0, 1.0);
    float shellSignal = clamp(radius * 0.18, 0.0, 1.0);

    return vec4(distanceEstimate, iterationSignal, trapSignal, shellSignal);
}

float mapDist(vec3 pos) {
    return mapBulb(pos).x;
}

vec3 calcNormal(vec3 pos) {
    const float h = 0.0012;
    const vec2 k = vec2(1.0, -1.0);
    return normalize(
        k.xyy * mapDist(pos + k.xyy * h)
        + k.yyx * mapDist(pos + k.yyx * h)
        + k.yxy * mapDist(pos + k.yxy * h)
        + k.xxx * mapDist(pos + k.xxx * h)
    );
}

float ambientOcclusion(vec3 pos, vec3 normal, int samples) {
    float occlusion = 0.0;
    float weight = 1.0;

    for (int i = 0; i < MAX_AO_STEPS; i += 1) {
        if (i >= samples) {
            break;
        }

        float travel = 0.05 + float(i) * 0.085;
        float sampleDist = mapDist(pos + normal * travel);
        occlusion += max(0.0, travel - sampleDist) * weight;
        weight *= 0.6;
    }

    return clamp(1.0 - occlusion, 0.32, 1.0);
}

vec4 rayMarch(vec3 ro, vec3 rd) {
    float total = 0.0;
    vec4 bulb = vec4(0.0);

    for (int i = 0; i < MAX_RAY_STEPS; i += 1) {
        if (i >= u_maxSteps) {
            break;
        }

        vec3 pos = ro + rd * total;
        bulb = mapBulb(pos);

        if (bulb.x < u_surfaceEpsilon) {
            return vec4(total, bulb.y, bulb.z, bulb.w);
        }

        total += bulb.x;
        if (total > MAX_DIST) {
            break;
        }
    }

    return vec4(-1.0, bulb.y, bulb.z, bulb.w);
}

vec3 getRayDir(vec2 fragCoord, vec2 resolution, vec3 ro, vec3 target, float lens) {
    vec2 uv = (fragCoord - 0.5 * resolution) / resolution.y;
    vec3 f = normalize(target - ro);
    vec3 r = normalize(cross(vec3(0.0, 1.0, 0.0), f));
    vec3 u = cross(f, r);
    vec3 c = f * lens;
    return normalize(c + uv.x * r + uv.y * u);
}

vec3 paletteColor(float signal) {
    float t = clamp(signal, 0.0, 1.0);
    vec3 ab = mix(u_paletteA, u_paletteB, smoothstep(0.02, 0.56, t));
    vec3 mixColor = mix(ab, u_paletteC, smoothstep(0.36, 0.96, t));
    vec3 pulse = 0.065 * sin(vec3(0.0, 1.4, 2.8) + t * 11.0);
    return clamp(mixColor + pulse, 0.0, 1.0);
}

vec3 backgroundColor(vec3 rd, vec2 fragCoord) {
    float vertical = smoothstep(-0.15, 0.85, rd.y * 0.5 + 0.5);
    vec3 bg = mix(u_bgBottom, u_bgTop, vertical);
    vec2 centered = (fragCoord - 0.5 * u_resolution) / u_resolution.y;
    float halo = exp(-4.2 * dot(centered, centered));
    bg += u_glowColor * halo * 0.13;
    return bg;
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec3 ro = u_cameraPos;
    vec3 rd = getRayDir(fragCoord, u_resolution, ro, u_cameraTarget, 1.65);
    vec3 color = backgroundColor(rd, fragCoord);

    vec4 hit = rayMarch(ro, rd);
    if (hit.x > 0.0) {
        vec3 pos = ro + rd * hit.x;
        vec3 normal = calcNormal(pos);
        float ao = ambientOcclusion(pos, normal, u_aoSamples);

        float heightSignal = clamp(0.5 + 0.5 * normal.y, 0.0, 1.0);
        float band = 0.5 + 0.5 * sin(hit.y * 14.0 + hit.z * 8.0 + pos.y * 2.4);
        float contour = 0.5 + 0.5 * sin((pos.x + pos.z) * 3.4 + hit.z * 6.0);
        float signal = clamp(hit.y * 0.5 + hit.z * 0.24 + heightSignal * 0.18 + band * 0.08 + contour * 0.05, 0.0, 1.0);

        vec3 base = paletteColor(signal);
        float diffuse = max(dot(normal, u_lightDir), 0.0);
        float fill = 0.5 + 0.5 * normal.y;
        float rim = pow(clamp(1.0 - max(dot(normal, -rd), 0.0), 0.0, 1.0), 2.8);
        float specular = pow(max(dot(reflect(-u_lightDir, normal), -rd), 0.0), 26.0);
        float fresnel = pow(1.0 - max(dot(normal, -rd), 0.0), 2.2);

        color = base * (0.18 + 0.72 * diffuse + 0.16 * fill) * ao;
        color += u_glowColor * (0.08 * rim + 0.06 * fresnel);
        color += vec3(1.0) * specular * 0.17;
        color = mix(color, base * 0.92, 0.08 * fresnel);
        color = pow(clamp(color, 0.0, 1.0), vec3(0.84));
    }

    gl_FragColor = vec4(color, 1.0);
}
