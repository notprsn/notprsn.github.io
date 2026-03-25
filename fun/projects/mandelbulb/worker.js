self.onmessage = (event) => {
    const { data } = event;
    if (!data || data.type !== "generate") {
        return;
    }

    const { jobId, params, quality } = data;
    const stats = buildGeometry(jobId, params, quality);
    self.postMessage(
        {
            type: "complete",
            jobId,
            geometry: {
                positions: stats.positions.buffer,
                values: stats.values.buffer,
            },
            stats: {
                resolution: stats.resolution,
                qualityLabel: quality.label,
                stage: quality.stage,
                insideCount: stats.insideCount,
                keptCount: stats.keptCount,
            },
        },
        [stats.positions.buffer, stats.values.buffer]
    );
};

function buildGeometry(jobId, params, quality) {
    const resolution = quality.resolution;
    const bounds = params.bounds;
    const escapeRadius = params.escapeRadius;
    const step = (bounds * 2) / (resolution - 1);
    const planeSize = resolution * resolution;
    const occupancy = new Uint8Array(resolution * planeSize);
    const xs = new Float32Array(resolution);
    const ys = new Float32Array(resolution);
    const zs = new Float32Array(resolution);

    for (let index = 0; index < resolution; index += 1) {
        const value = -bounds + step * index;
        xs[index] = value;
        ys[index] = value;
        zs[index] = value;
    }

    let insideCount = 0;

    for (let xi = 0; xi < resolution; xi += 1) {
        const x = xs[xi];
        for (let yi = 0; yi < resolution; yi += 1) {
            const y = ys[yi];
            for (let zi = 0; zi < resolution; zi += 1) {
                const z = zs[zi];
                const index = xi * planeSize + yi * resolution + zi;
                const inside = isInsideMandelbulb(x, y, z, params.power, params.maxIterations, escapeRadius);
                if (inside) {
                    occupancy[index] = 1;
                    insideCount += 1;
                }
            }
        }

        self.postMessage({
            type: "progress",
            jobId,
            percent: Math.round(((xi + 1) / resolution) * 58),
            label: "Sampling volume",
        });
    }

    const points = [];
    const values = [];

    for (let xi = 0; xi < resolution; xi += 1) {
        const x = xs[xi];
        for (let yi = 0; yi < resolution; yi += 1) {
            const y = ys[yi];
            for (let zi = 0; zi < resolution; zi += 1) {
                const index = xi * planeSize + yi * resolution + zi;
                if (!occupancy[index]) {
                    continue;
                }

                if (params.surfaceOnly && !isSurfaceVoxel(occupancy, resolution, xi, yi, zi)) {
                    continue;
                }

                const z = zs[zi];
                const radial = Math.sqrt(x * x + y * y + z * z) / (Math.max(bounds, 0.001) * 1.7320508075688772);
                const zBias = (z + bounds) / (2 * bounds);
                const accent = clamp(0.58 * zBias + 0.42 * (1 - radial), 0, 1);
                points.push(x, y, z);
                values.push(accent);
            }
        }

        self.postMessage({
            type: "progress",
            jobId,
            percent: 58 + Math.round(((xi + 1) / resolution) * 38),
            label: params.surfaceOnly ? "Extracting surface" : "Collecting cloud",
        });
    }

    return {
        resolution,
        insideCount,
        keptCount: values.length,
        positions: Float32Array.from(points),
        values: Float32Array.from(values),
    };
}

function isInsideMandelbulb(cx, cy, cz, power, maxIterations, escapeRadius) {
    let x = 0;
    let y = 0;
    let z = 0;

    for (let iteration = 0; iteration < maxIterations; iteration += 1) {
        const radius = Math.sqrt(x * x + y * y + z * z);
        if (radius > escapeRadius) {
            return false;
        }

        const safeRadius = radius === 0 ? 1e-9 : radius;
        const theta = Math.acos(clamp(z / safeRadius, -1, 1));
        const phi = Math.atan2(y, x);
        const zr = Math.pow(safeRadius, power);
        const nextTheta = theta * power;
        const nextPhi = phi * power;
        const sinTheta = Math.sin(nextTheta);

        x = zr * sinTheta * Math.cos(nextPhi) + cx;
        y = zr * sinTheta * Math.sin(nextPhi) + cy;
        z = zr * Math.cos(nextTheta) + cz;
    }

    return true;
}

function isSurfaceVoxel(occupancy, resolution, xi, yi, zi) {
    if (xi === 0 || yi === 0 || zi === 0 || xi === resolution - 1 || yi === resolution - 1 || zi === resolution - 1) {
        return true;
    }

    const planeSize = resolution * resolution;
    const index = xi * planeSize + yi * resolution + zi;
    const offsets = [
        -planeSize,
        planeSize,
        -resolution,
        resolution,
        -1,
        1,
    ];

    for (const offset of offsets) {
        if (!occupancy[index + offset]) {
            return true;
        }
    }

    return false;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
