const RATIO_OPTIONS = [
    { label: "1/3", value: 1 / 3 },
    { label: "3/8", value: 3 / 8 },
    { label: "2/5", value: 2 / 5 },
    { label: "3/7", value: 3 / 7 },
    { label: "1/2", value: 1 / 2 },
    { label: "4/7", value: 4 / 7 },
    { label: "3/5", value: 3 / 5 },
    { label: "5/8", value: 5 / 8 },
    { label: "2/3", value: 2 / 3 },
];

const PALETTE_FAMILIES = [
    {
        saturation: 78,
        brightness: 100,
        alpha: 0.16,
        glowAlpha: 0.045,
        guideFillAlpha: 0.94,
    },
    {
        saturation: 42,
        brightness: 100,
        alpha: 0.18,
        glowAlpha: 0.055,
        guideFillAlpha: 0.96,
    },
    {
        saturation: 92,
        brightness: 100,
        alpha: 0.14,
        glowAlpha: 0.04,
        guideFillAlpha: 0.98,
    },
];

const defaultRatio = RATIO_OPTIONS.find((option) => option.label === "1/2");
const DEFAULT_STATE = {
    vertices: 3,
    ratioIndex: defaultRatio ? RATIO_OPTIONS.indexOf(defaultRatio) : 4,
};

const state = {
    params: { ...DEFAULT_STATE },
    plottedPoints: 0,
    maxPoints: getPointBudget(DEFAULT_STATE.vertices),
    targetDurationMs: getTargetDurationMs(),
    complete: false,
    vertices: [],
    currentPoint: null,
    graphics: null,
    palette: [],
    startedAt: 0,
    displaySize: { width: 0, height: 0 },
    sketch: null,
};

const elements = {
    stage: document.getElementById("chaos-stage"),
};

const controlNodes = new Map(
    Array.from(document.querySelectorAll("input[name]")).map((node) => [node.name, node])
);

const outputNodes = new Map(
    Array.from(document.querySelectorAll("[data-output-for]")).map((node) => [node.dataset.outputFor, node])
);

bindControls();
updateControlUI();
createSketch();

window.addEventListener("pageshow", () => {
    updateControlUI();
});

function bindControls() {
    controlNodes.forEach((node, name) => {
        node.addEventListener("input", () => {
            state.params[name] = readControlValue(node);
            updateControlOutput(name);
            resetSimulation();
        });
    });
}

function readControlValue(node) {
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

    if (name === "ratioIndex") {
        output.textContent = getSelectedRatioLabel();
        return;
    }

    output.textContent = `${state.params[name]}`;
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
            p.frameRate(isCompactViewport() ? 44 : 50);
            state.sketch = p;
            state.displaySize = { width, height };
            initializeGraphics(p, width, height);
            resetSimulation();
        };

        p.draw = () => {
            advanceSimulation(p);
            drawBackdrop(p);
            p.image(state.graphics, 0, 0, p.width, p.height);
            drawGuides(p);
            drawCurrentPoint(p);
        };

        p.windowResized = () => {
            if (!host) {
                return;
            }

            updateControlUI();
            const { width, height } = getStageSize(host);
            p.resizeCanvas(width, height);
            state.displaySize = { width, height };
            initializeGraphics(p, width, height);
            resetSimulation();
        };
    };

    new p5(sketch);
}

function initializeGraphics(p, width, height) {
    const renderScale = getChaosRenderScale();
    const renderWidth = Math.max(240, Math.round(width * renderScale));
    const renderHeight = Math.max(240, Math.round(height * renderScale));
    state.graphics = p.createGraphics(renderWidth, renderHeight);
    state.graphics.pixelDensity(1);
    state.graphics.colorMode(p.HSB, 360, 100, 100, 1);
    state.graphics.clear();
}

function resetSimulation() {
    if (!state.graphics) {
        return;
    }

    state.graphics.clear();
    state.plottedPoints = 0;
    state.complete = false;
    state.maxPoints = getPointBudget(state.params.vertices);
    state.targetDurationMs = getTargetDurationMs();
    state.vertices = buildPolygonVertices(state.graphics.width, state.graphics.height, state.params.vertices);
    state.palette = buildPalette(state.params.vertices);
    state.currentPoint = randomStartPoint(state.graphics.width, state.graphics.height);
    state.startedAt = performance.now();
    state.sketch?.loop();
}

function advanceSimulation(p) {
    if (state.complete || !state.graphics || !state.currentPoint) {
        return;
    }

    const elapsed = performance.now() - state.startedAt;
    const cappedElapsed = Math.min(elapsed, state.targetDurationMs);
    const desiredPoints = Math.ceil((cappedElapsed / state.targetDurationMs) * state.maxPoints);
    const remaining = state.maxPoints - state.plottedPoints;
    const jumpRatio = getSelectedRatioValue();
    const maxBatch = isCompactViewport() ? 700 : 1300;
    const minBatch = isCompactViewport() ? 90 : 180;
    const iterations = Math.min(remaining, Math.max(minBatch, desiredPoints - state.plottedPoints), maxBatch);

    if (iterations <= 0) {
        return;
    }

    const ctx = state.graphics.drawingContext;
    const pointSize = isCompactViewport() ? 1.15 : 1.25;

    for (let step = 0; step < iterations; step += 1) {
        const targetIndex = pickTargetIndex();
        const target = state.vertices[targetIndex];
        state.currentPoint.x += (target.x - state.currentPoint.x) * jumpRatio;
        state.currentPoint.y += (target.y - state.currentPoint.y) * jumpRatio;
        plotPoint(ctx, targetIndex, pointSize);
        state.plottedPoints += 1;
    }

    if (state.plottedPoints >= state.maxPoints) {
        state.complete = true;
        state.sketch?.noLoop();
    }
}

function plotPoint(ctx, targetIndex, pointSize) {
    const color = state.palette[targetIndex];
    ctx.fillStyle = color.fillStyle;
    ctx.fillRect(state.currentPoint.x | 0, state.currentPoint.y | 0, pointSize, pointSize);
}

function drawBackdrop(p) {
    p.background(0);
}

function drawGuides(p) {
    if (!state.vertices.length || !state.palette.length) {
        return;
    }

    p.push();
    p.noFill();
    p.stroke(0, 0, 100, 0.16);
    p.strokeWeight(1);
    p.beginShape();
    for (const vertex of state.vertices) {
        const displayPoint = toDisplayPoint(vertex);
        p.vertex(displayPoint.x, displayPoint.y);
    }
    p.endShape(p.CLOSE);

    for (let index = 0; index < state.vertices.length; index += 1) {
        const vertex = toDisplayPoint(state.vertices[index]);
        const color = state.palette[index];
        p.fill(color.hue, color.saturation, color.brightness, color.guideFillAlpha);
        p.noStroke();
        p.circle(vertex.x, vertex.y, isCompactViewport() ? 7 : 8.5);
    }
    p.pop();
}

function drawCurrentPoint(p) {
    if (!state.currentPoint || state.complete) {
        return;
    }

    p.push();
    const displayPoint = toDisplayPoint(state.currentPoint);
    p.noStroke();
    p.fill(0, 0, 100, 0.18);
    p.circle(displayPoint.x, displayPoint.y, isCompactViewport() ? 8 : 10);
    p.fill(0, 0, 100, 0.96);
    p.circle(displayPoint.x, displayPoint.y, isCompactViewport() ? 3 : 4);
    p.pop();
}

function buildPolygonVertices(width, height, count) {
    const centerX = width * 0.5;
    const centerY = height * 0.54;
    const radius = Math.min(width, height) * (window.innerWidth < 720 ? 0.34 : 0.39);
    const rotationOffset = -Math.PI / 2;
    const vertices = [];

    for (let index = 0; index < count; index += 1) {
        const angle = rotationOffset + (index / count) * Math.PI * 2;
        vertices.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
        });
    }

    return vertices;
}

function buildPalette(count) {
    const family = PALETTE_FAMILIES[Math.floor(Math.random() * PALETTE_FAMILIES.length)];
    const baseHue = Math.random() * 360;

    return Array.from({ length: count }, (_, index) => ({
        hue: (baseHue + (index / count) * 360) % 360,
        saturation: family.saturation,
        brightness: family.brightness,
        fillStyle: hsbToRgbaString(
            (baseHue + (index / count) * 360) % 360,
            family.saturation,
            family.brightness,
            family.alpha
        ),
        guideFillAlpha: family.guideFillAlpha,
    }));
}

function randomStartPoint(width, height) {
    return {
        x: width * (0.2 + Math.random() * 0.6),
        y: height * (0.18 + Math.random() * 0.64),
    };
}

function getSelectedRatio() {
    return RATIO_OPTIONS[state.params.ratioIndex] || defaultRatio || RATIO_OPTIONS[4];
}

function getSelectedRatioLabel() {
    return getSelectedRatio().label;
}

function getSelectedRatioValue() {
    return getSelectedRatio().value;
}

function pickTargetIndex() {
    return Math.floor(Math.random() * state.vertices.length);
}

function getPointBudget(vertices) {
    if (isCompactViewport()) {
        return 22000 + (vertices - 3) * 2400;
    }

    return 42000 + (vertices - 3) * 3800;
}

function getTargetDurationMs() {
    return isCompactViewport() ? 2600 : 2200;
}

function getStageSize(host) {
    const width = Math.max(320, Math.floor(host.clientWidth));
    const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height
        ?? (window.innerWidth < 720 ? 108 : 69);
    const footerHeight = document.querySelector(".site-footer")?.getBoundingClientRect().height
        ?? (window.innerWidth < 720 ? 124 : 76);
    const main = host.closest(".chaos-main");
    const mainStyles = main ? window.getComputedStyle(main) : null;
    const verticalPadding = mainStyles
        ? parseFloat(mainStyles.paddingTop || "0") + parseFloat(mainStyles.paddingBottom || "0")
        : 0;
    const availableHeight = Math.floor(window.innerHeight - headerHeight - footerHeight - verticalPadding - 6);
    const fallbackHeight = window.innerWidth < 960
        ? Math.max(430, Math.floor(width * 1.04))
        : Math.max(420, availableHeight);
    const height = Math.max(360, Math.floor(host.clientHeight || fallbackHeight));
    return { width, height };
}

function isCompactViewport() {
    return window.innerWidth < 960;
}

function getChaosRenderScale() {
    return isCompactViewport() ? 0.62 : 0.74;
}

function toDisplayPoint(point) {
    if (!state.graphics) {
        return point;
    }

    const scaleX = state.displaySize.width / state.graphics.width;
    const scaleY = state.displaySize.height / state.graphics.height;
    return {
        x: point.x * scaleX,
        y: point.y * scaleY,
    };
}

function hsbToRgbaString(hue, saturation, brightness, alpha) {
    const s = saturation / 100;
    const v = brightness / 100;
    const chroma = v * s;
    const hueSection = ((hue % 360) + 360) % 360 / 60;
    const x = chroma * (1 - Math.abs((hueSection % 2) - 1));
    let red = 0;
    let green = 0;
    let blue = 0;

    if (hueSection < 1) {
        red = chroma;
        green = x;
    } else if (hueSection < 2) {
        red = x;
        green = chroma;
    } else if (hueSection < 3) {
        green = chroma;
        blue = x;
    } else if (hueSection < 4) {
        green = x;
        blue = chroma;
    } else if (hueSection < 5) {
        red = x;
        blue = chroma;
    } else {
        red = chroma;
        blue = x;
    }

    const match = v - chroma;
    const r = Math.round((red + match) * 255);
    const g = Math.round((green + match) * 255);
    const b = Math.round((blue + match) * 255);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
