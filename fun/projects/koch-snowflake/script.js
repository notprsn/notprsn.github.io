const PRESETS = {
    classic: {
        iterations: 4,
        sides: 3,
        peakAngleDeg: 60,
        radius: 214,
        lineWidth: 2.6,
        hueShift: 196,
        fillAlpha: 0.08,
        rotationSpeed: 0.06,
        pulse: 0.02,
    },
    crystal: {
        iterations: 4,
        sides: 6,
        peakAngleDeg: 60,
        radius: 182,
        lineWidth: 1.8,
        hueShift: 210,
        fillAlpha: 0.11,
        rotationSpeed: 0.08,
        pulse: 0.04,
    },
    pinwheel: {
        iterations: 3,
        sides: 5,
        peakAngleDeg: 72,
        radius: 208,
        lineWidth: 2.2,
        hueShift: 328,
        fillAlpha: 0.09,
        rotationSpeed: 0.18,
        pulse: 0.075,
    },
    needle: {
        iterations: 5,
        sides: 3,
        peakAngleDeg: 52,
        radius: 198,
        lineWidth: 1.3,
        hueShift: 188,
        fillAlpha: 0.03,
        rotationSpeed: 0.04,
        pulse: 0.015,
    },
};

const isMobileViewport = window.matchMedia("(max-width: 720px)").matches;
const DEFAULT_STATE = {
    preset: "classic",
    ...PRESETS.classic,
    radius: isMobileViewport ? 162 : PRESETS.classic.radius,
};

const GEOMETRY_KEYS = new Set(["preset", "iterations", "sides", "peakAngleDeg", "radius"]);

const state = {
    params: { ...DEFAULT_STATE },
    controlsOpen: false,
    geometry: {
        segments: [],
        points: [],
        perimeter: 0,
    },
};

const elements = {
    stage: document.getElementById("snowflake-stage"),
    segmentCount: document.getElementById("segment-count"),
    vertexCount: document.getElementById("vertex-count"),
    perimeterCount: document.getElementById("perimeter-count"),
    presetReadout: document.getElementById("preset-readout"),
    hudPreset: document.getElementById("hud-preset"),
    hudIterations: document.getElementById("hud-iterations"),
    controlsShell: document.querySelector("[data-controls-shell]"),
    controlsToggle: document.querySelector("[data-controls-toggle]"),
    resetButton: document.querySelector("[data-reset-controls]"),
};

const outputNodes = new Map(
    Array.from(document.querySelectorAll("[data-output-for]")).map((node) => [node.dataset.outputFor, node])
);

const controlNodes = new Map(
    Array.from(document.querySelectorAll("input[name], select[name]")).map((node) => [node.name, node])
);

bindControls();
updateControlUI();
rebuildSnowflake();
updateReadout();
createSketch();
window.addEventListener("pageshow", () => {
    if (!state.params.preset || !PRESETS[state.params.preset]) {
        state.params = { ...DEFAULT_STATE };
        rebuildSnowflake();
    }
    updateControlUI();
    updateReadout();
});

function bindControls() {
    controlNodes.forEach((node, name) => {
        const eventName = node.tagName === "SELECT" ? "change" : "input";
        node.addEventListener(eventName, () => {
            const value = readControlValue(node);
            if (name === "preset") {
                applyPreset(value);
                return;
            }

            state.params[name] = value;
            updateControlOutput(name);

            if (GEOMETRY_KEYS.has(name)) {
                rebuildSnowflake();
            }

            updateReadout();
        });
    });

    elements.controlsToggle?.addEventListener("click", () => {
        state.controlsOpen = !state.controlsOpen;
        elements.controlsShell?.classList.toggle("controls-open", state.controlsOpen);
        elements.controlsToggle.textContent = state.controlsOpen ? "Close controls" : "Open controls";
    });

    elements.resetButton?.addEventListener("click", () => {
        state.params = { ...DEFAULT_STATE };
        updateControlUI();
        rebuildSnowflake();
        updateReadout();
    });
}

function applyPreset(presetName) {
    const preset = PRESETS[presetName] || PRESETS.classic;
    state.params = {
        ...state.params,
        ...preset,
        preset: presetName,
    };
    updateControlUI();
    rebuildSnowflake();
    updateReadout();
}

function readControlValue(node) {
    if (node.tagName === "SELECT") {
        return node.value;
    }
    return Number(node.value);
}

function updateControlUI() {
    controlNodes.forEach((node, name) => {
        node.value = `${state.params[name]}`;
        updateControlOutput(name);
    });
}

function updateControlOutput(name) {
    const output = outputNodes.get(name);
    if (!output) {
        return;
    }

    const value = state.params[name];
    switch (name) {
        case "peakAngleDeg":
            output.textContent = `${Number(value).toFixed(0)}°`;
            break;
        case "lineWidth":
        case "fillAlpha":
        case "rotationSpeed":
            output.textContent = Number(value).toFixed(2);
            break;
        case "pulse":
            output.textContent = Number(value).toFixed(3);
            break;
        default:
            output.textContent = `${value}`;
            break;
    }
}

function rebuildSnowflake() {
    const basePolygon = buildRegularPolygon(state.params.sides, state.params.radius);
    let segments = [];

    for (let index = 0; index < basePolygon.length; index += 1) {
        const nextIndex = (index + 1) % basePolygon.length;
        segments.push({
            a: basePolygon[index],
            b: basePolygon[nextIndex],
        });
    }

    for (let generation = 0; generation < state.params.iterations; generation += 1) {
        const nextGeneration = [];
        for (const segment of segments) {
            nextGeneration.push(...subdivideSegment(segment, radians(state.params.peakAngleDeg)));
        }
        segments = nextGeneration;
    }

    const points = segments.map((segment) => segment.a);
    if (segments.length) {
        points.push(segments[segments.length - 1].b);
    }

    const perimeter = segments.reduce((sum, segment) => sum + distance(segment.a, segment.b), 0);
    state.geometry = {
        segments,
        points,
        perimeter,
    };
}

function buildRegularPolygon(sides, radius) {
    const points = [];
    for (let index = 0; index < sides; index += 1) {
        const angle = -Math.PI / 2 + (index / sides) * Math.PI * 2;
        points.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
        });
    }
    return points;
}

function subdivideSegment(segment, peakAngle) {
    const start = segment.a;
    const end = segment.b;
    const third = {
        x: (end.x - start.x) / 3,
        y: (end.y - start.y) / 3,
    };
    const b1 = {
        x: start.x + third.x,
        y: start.y + third.y,
    };
    const a1 = {
        x: end.x - third.x,
        y: end.y - third.y,
    };
    const peakVector = rotateVector(third, -peakAngle);
    const c = {
        x: b1.x + peakVector.x,
        y: b1.y + peakVector.y,
    };

    return [
        { a: start, b: b1 },
        { a: b1, b: c },
        { a: c, b: a1 },
        { a: a1, b: end },
    ];
}

function rotateVector(vector, angle) {
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);
    return {
        x: vector.x * cosAngle - vector.y * sinAngle,
        y: vector.x * sinAngle + vector.y * cosAngle,
    };
}

function distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

function radians(degrees) {
    return (degrees * Math.PI) / 180;
}

function updateReadout() {
    elements.segmentCount.textContent = `${state.geometry.segments.length || "-"}`;
    elements.vertexCount.textContent = `${Math.max(0, state.geometry.points.length - 1) || "-"}`;
    elements.perimeterCount.textContent = state.geometry.perimeter ? state.geometry.perimeter.toFixed(1) : "-";
    elements.presetReadout.textContent = capitalize(state.params.preset);
    elements.hudPreset.textContent = state.params.preset;
    elements.hudIterations.textContent = `${state.params.iterations} iteration${state.params.iterations === 1 ? "" : "s"}`;
}

function createSketch() {
    const sketch = (p) => {
        let host;

        p.setup = () => {
            host = elements.stage;
            const { width, height } = getStageSize(host);
            const canvas = p.createCanvas(width, height);
            canvas.parent(host);
            p.pixelDensity(1);
            p.colorMode(p.HSB, 360, 100, 100, 1);
            p.frameRate(36);
        };

        p.draw = () => {
            drawBackdrop(p);
            p.push();
            p.translate(p.width / 2, p.height / 2);
            const scale = 1 + Math.sin(p.frameCount * 0.022) * state.params.pulse;
            p.scale(scale);
            p.rotate(p.frameCount * state.params.rotationSpeed * 0.01);
            drawSnowflake(p);
            p.pop();
        };

        p.windowResized = () => {
            if (!host) {
                return;
            }
            const { width, height } = getStageSize(host);
            p.resizeCanvas(width, height);
        };
    };

    new p5(sketch);
}

function drawBackdrop(p) {
    p.background(215, 44, 9);

    for (let index = 0; index < 8; index += 1) {
        const glowY = p.map(index, 0, 7, p.height * 0.1, p.height * 0.9);
        const glowAlpha = p.map(index, 0, 7, 0.08, 0.015);
        p.noStroke();
        p.fill(206 + index * 2, 34, 18 + index * 6, glowAlpha);
        p.ellipse(p.width * 0.5, glowY, p.width * 1.2, p.height * 0.22);
    }

    for (let index = 0; index < 32; index += 1) {
        const x = (index * 193) % p.width;
        const y = (index * 137) % p.height;
        p.noStroke();
        p.fill(192, 16, 100, 0.14);
        p.circle(x, y, 1.8 + (index % 3));
    }
}

function drawSnowflake(p) {
    const segments = state.geometry.segments;
    const points = state.geometry.points;
    if (!segments.length || points.length < 2) {
        return;
    }

    const fillHue = (state.params.hueShift + 16) % 360;
    p.noStroke();
    p.fill(fillHue, 30, 86, state.params.fillAlpha);
    p.beginShape();
    for (let index = 0; index < points.length; index += 1) {
        p.vertex(points[index].x, points[index].y);
    }
    p.endShape(p.CLOSE);

    p.strokeJoin(p.ROUND);
    p.strokeCap(p.ROUND);

    p.stroke((state.params.hueShift + 10) % 360, 36, 96, 0.18);
    p.strokeWeight(state.params.lineWidth * 2.6);
    for (const segment of segments) {
        p.line(segment.a.x, segment.a.y, segment.b.x, segment.b.y);
    }

    p.stroke((state.params.hueShift + 196) % 360, 30, 98, 0.94);
    p.strokeWeight(state.params.lineWidth);
    for (let index = 0; index < segments.length; index += 1) {
        const segment = segments[index];
        const hue = (state.params.hueShift + index * 0.018) % 360;
        p.stroke(hue, 32, 98, 0.92);
        p.line(segment.a.x, segment.a.y, segment.b.x, segment.b.y);
    }
}

function getStageSize(host) {
    const width = Math.max(320, Math.floor(host.clientWidth));
    const height = window.innerWidth < 720 ? Math.max(430, Math.floor(width * 1.04)) : Math.max(620, Math.floor(width * 0.84));
    return { width, height };
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
