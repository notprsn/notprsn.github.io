const FERN_TYPES = [
    {
        label: "Classic",
        totalPointsDesktop: 140000,
        totalPointsMobile: 84000,
        durationDesktop: 4400,
        durationMobile: 5000,
        stroke: [120, 52, 96],
        transforms: [
            { role: "stem", weight: 0.01, a: 0, b: 0, c: 0, d: 0.16, e: 0, f: 0 },
            { role: "apex", weight: 0.85, a: 0.85, b: 0.04, c: -0.04, d: 0.85, e: 0, f: 1.6 },
            { role: "left", weight: 0.07, a: 0.2, b: -0.26, c: 0.23, d: 0.22, e: 0, f: 1.6 },
            { role: "right", weight: 0.07, a: -0.15, b: 0.28, c: 0.26, d: 0.24, e: 0, f: 0.44 },
        ],
    },
    {
        label: "Bushy",
        totalPointsDesktop: 148000,
        totalPointsMobile: 90000,
        durationDesktop: 4500,
        durationMobile: 5100,
        stroke: [118, 50, 96],
        transforms: [
            { role: "stem", weight: 0.02, a: 0, b: 0, c: 0, d: 0.18, e: 0, f: 0 },
            { role: "apex", weight: 0.8, a: 0.82, b: 0.02, c: -0.02, d: 0.87, e: 0, f: 1.62 },
            { role: "left", weight: 0.09, a: 0.28, b: -0.3, c: 0.24, d: 0.24, e: 0, f: 1.54 },
            { role: "right", weight: 0.09, a: -0.22, b: 0.31, c: 0.24, d: 0.24, e: 0, f: 0.58 },
        ],
    },
    {
        label: "Tall",
        totalPointsDesktop: 132000,
        totalPointsMobile: 80000,
        durationDesktop: 4300,
        durationMobile: 4900,
        stroke: [122, 48, 95],
        transforms: [
            { role: "stem", weight: 0.02, a: 0, b: 0, c: 0, d: 0.18, e: 0, f: 0 },
            { role: "apex", weight: 0.82, a: 0.88, b: 0.01, c: -0.01, d: 0.88, e: 0, f: 1.74 },
            { role: "left", weight: 0.08, a: 0.18, b: -0.22, c: 0.18, d: 0.19, e: 0, f: 1.54 },
            { role: "right", weight: 0.08, a: -0.14, b: 0.24, c: 0.18, d: 0.2, e: 0, f: 0.42 },
        ],
    },
    {
        label: "Wide",
        totalPointsDesktop: 144000,
        totalPointsMobile: 86000,
        durationDesktop: 4500,
        durationMobile: 5100,
        stroke: [124, 50, 96],
        transforms: [
            { role: "stem", weight: 0.01, a: 0, b: 0, c: 0, d: 0.16, e: 0, f: 0 },
            { role: "apex", weight: 0.83, a: 0.84, b: 0.06, c: -0.02, d: 0.84, e: 0, f: 1.56 },
            { role: "left", weight: 0.08, a: 0.24, b: -0.26, c: 0.26, d: 0.22, e: -0.18, f: 1.5 },
            { role: "right", weight: 0.08, a: -0.14, b: 0.3, c: 0.24, d: 0.22, e: 0.22, f: 0.5 },
        ],
    },
];

const DEFAULT_STATE = {
    fernTypeIndex: 0,
};
const GEOMETRY_CACHE = new Map();
const POINT_COUNT_SCALE = 0.38;
const DURATION_SCALE = 0.7;

const state = {
    params: { ...DEFAULT_STATE },
    resetRequested: false,
    simulation: null,
    sketch: null,
    displaySize: { width: 0, height: 0 },
};

const elements = {
    stage: document.getElementById("fern-stage"),
    resetButton: document.querySelector("[data-reset-sim]"),
};

const outputNodes = new Map(
    Array.from(document.querySelectorAll("[data-output-for]")).map((node) => [node.dataset.outputFor, node])
);

const controlNodes = new Map(
    Array.from(document.querySelectorAll("input[name]")).map((node) => [node.name, node])
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
            state.params[name] = Number(node.value);
            updateControlOutput(name);
            requestReset();
        });
    });

    elements.resetButton?.addEventListener("click", () => {
        requestReset();
    });
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

    if (name === "fernTypeIndex") {
        output.textContent = getCurrentFernType().label;
        return;
    }

    output.textContent = `${state.params[name]}`;
}

function getCurrentFernType() {
    return FERN_TYPES[state.params.fernTypeIndex] || FERN_TYPES[0];
}

function requestReset() {
    state.resetRequested = true;
    state.sketch?.loop();
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
            createLayer(p);
            resetSimulation(p);
        };

        p.draw = () => {
            if (state.resetRequested) {
                resetSimulation(p);
            }

            drawBackdrop(p);
            drawGuides(p);
            advanceSimulation(p);

            if (state.simulation?.layer) {
                p.image(state.simulation.layer, 0, 0, p.width, p.height);
            }
        };

        p.windowResized = () => {
            if (!host) {
                return;
            }

            const { width, height } = getStageSize(host);
            p.resizeCanvas(width, height);
            state.displaySize = { width, height };
            createLayer(p);
            resetSimulation(p);
            updateControlUI();
        };
    };

    new p5(sketch);
}

function createLayer(p) {
    const renderScale = getFernRenderScale();
    const layer = p.createGraphics(
        Math.max(240, Math.round(p.width * renderScale)),
        Math.max(240, Math.round(p.height * renderScale))
    );
    layer.pixelDensity(1);
    layer.colorMode(p.HSB, 360, 100, 100, 1);
    layer.clear();
    state.simulation = { layer };
}

function resetSimulation(p) {
    if (!state.simulation?.layer) {
        createLayer(p);
    }

    const fernType = getCurrentFernType();
    const layer = state.simulation.layer;
    layer.clear();
    const geometry = getFernGeometry(state.params.fernTypeIndex, fernType);

    state.simulation = {
        layer,
        x: 0,
        y: 0,
        plotted: 0,
        startedAt: p.millis(),
        totalPoints: getTargetPointCount(fernType),
        targetDuration: getTargetDurationMs(fernType),
        bounds: geometry.bounds,
        guidePoints: geometry.guidePoints,
        cumulativeWeights: buildCumulativeWeights(fernType.transforms),
    };

    state.resetRequested = false;
    setLayerStyle(p);
    state.sketch?.loop();
}

function drawBackdrop(p) {
    p.background(0, 0, 0);
}

function drawGuides(p) {
    const simulation = state.simulation;
    if (!simulation) {
        return;
    }

    const [hue] = getCurrentFernType().stroke;
    const baseSize = Math.max(6, Math.min(p.width, p.height) * 0.008);

    p.noStroke();
    simulation.guidePoints.forEach((guidePoint) => {
        const { px, py } = projectPoint(p.width, p.height, guidePoint.x, guidePoint.y, simulation.bounds);
        const isStem = guidePoint.role === "stem";
        p.fill(hue, isStem ? 24 : 14, isStem ? 94 : 88, isStem ? 0.22 : 0.13);
        p.circle(px, py, isStem ? baseSize * 1.15 : baseSize);
    });
}

function advanceSimulation(p) {
    const simulation = state.simulation;
    if (!simulation?.layer || simulation.plotted >= simulation.totalPoints) {
        return;
    }

    const elapsed = p.millis() - simulation.startedAt;
    const progress = Math.min(1, elapsed / simulation.targetDuration);
    const targetPoints = Math.floor(simulation.totalPoints * progress);
    const remaining = simulation.totalPoints - simulation.plotted;
    const maxBatch = isCompactViewport() ? 800 : 1500;
    const minBatch = isCompactViewport() ? 110 : 220;
    let batch = Math.min(remaining, Math.max(minBatch, targetPoints - simulation.plotted), maxBatch);

    if (batch === 0 && progress < 1) {
        batch = 1;
    }

    const ctx = simulation.layer.drawingContext;
    const pointSize = isCompactViewport() ? 1.1 : 1.2;

    for (let index = 0; index < batch; index += 1) {
        const transform = pickTransform(simulation.cumulativeWeights, Math.random());
        const nextPoint = applyTransform(transform, simulation.x, simulation.y);
        simulation.x = nextPoint.x;
        simulation.y = nextPoint.y;

        const { px, py } = projectPoint(simulation.layer.width, simulation.layer.height, simulation.x, simulation.y, simulation.bounds);
        ctx.fillRect(px | 0, py | 0, pointSize, pointSize);
        simulation.plotted += 1;

        if (simulation.plotted >= simulation.totalPoints) {
            break;
        }
    }

    if (simulation.plotted >= simulation.totalPoints) {
        state.sketch?.noLoop();
    }
}

function setLayerStyle(p) {
    if (!state.simulation?.layer) {
        return;
    }

    const [hue, saturation, brightness] = getCurrentFernType().stroke;
    state.simulation.layer.drawingContext.fillStyle = hsbToRgbaString(hue, saturation, brightness, 0.82);
}

function getTargetPointCount(fernType) {
    const baseCount = isCompactViewport() ? fernType.totalPointsMobile : fernType.totalPointsDesktop;
    return Math.round(baseCount * POINT_COUNT_SCALE);
}

function getTargetDurationMs(fernType) {
    const baseDuration = isCompactViewport() ? fernType.durationMobile : fernType.durationDesktop;
    return Math.round(baseDuration * DURATION_SCALE);
}

function estimateBounds(fernType) {
    let x = 0;
    let y = 0;
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    const cumulativeWeights = buildCumulativeWeights(fernType.transforms);

    for (let index = 0; index < 6000; index += 1) {
        const transform = pickTransform(cumulativeWeights, Math.random());
        const nextPoint = applyTransform(transform, x, y);
        x = nextPoint.x;
        y = nextPoint.y;

        if (index < 48) {
            continue;
        }

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }

    const xPad = (maxX - minX || 1) * 0.07;
    const yPad = (maxY - minY || 1) * 0.07;

    return {
        minX: minX - xPad,
        maxX: maxX + xPad,
        minY: Math.min(0, minY - yPad * 0.25),
        maxY: maxY + yPad,
    };
}

function getGuidePoints(fernType) {
    const guides = fernType.transforms
        .map((transform) => {
            const fixedPoint = solveFixedPoint(transform);
            if (!fixedPoint) {
                return null;
            }

            return {
                x: fixedPoint.x,
                y: fixedPoint.y,
                role: transform.role,
            };
        })
        .filter(Boolean);

    guides.sort((left, right) => {
        if (left.role === "stem") {
            return 1;
        }

        if (right.role === "stem") {
            return -1;
        }

        return right.y - left.y;
    });

    return guides;
}

function solveFixedPoint(transform) {
    const denominator = (1 - transform.a) * (1 - transform.d) - transform.b * transform.c;
    if (Math.abs(denominator) < 1e-8) {
        return null;
    }

    return {
        x: (transform.e * (1 - transform.d) + transform.b * transform.f) / denominator,
        y: ((1 - transform.a) * transform.f + transform.c * transform.e) / denominator,
    };
}

function projectPoint(width, height, x, y, bounds) {
    const margin = 0.11;
    const xRange = bounds.maxX - bounds.minX;
    const yRange = bounds.maxY - bounds.minY;
    const usableWidth = width * (1 - margin * 2);
    const usableHeight = height * (1 - margin * 2);
    const fitScale = Math.min(usableWidth / xRange, usableHeight / yRange);
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const px = width / 2 + (x - centerX) * fitScale;
    const py = height * (1 - margin) - (y - bounds.minY) * fitScale;
    return { px, py };
}

function buildCumulativeWeights(transforms) {
    let total = 0;
    return transforms.map((transform) => {
        total += transform.weight;
        return {
            limit: total,
            transform,
        };
    });
}

function pickTransform(cumulativeWeights, randomValue) {
    for (let index = 0; index < cumulativeWeights.length; index += 1) {
        if (randomValue < cumulativeWeights[index].limit) {
            return cumulativeWeights[index].transform;
        }
    }

    return cumulativeWeights[cumulativeWeights.length - 1].transform;
}

function applyTransform(transform, x, y) {
    return {
        x: transform.a * x + transform.b * y + transform.e,
        y: transform.c * x + transform.d * y + transform.f,
    };
}

function getStageSize(host) {
    const width = Math.max(320, Math.floor(host.clientWidth));
    const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height
        ?? (window.innerWidth < 720 ? 108 : 69);
    const footerHeight = document.querySelector(".site-footer")?.getBoundingClientRect().height
        ?? (window.innerWidth < 720 ? 124 : 76);
    const main = host.closest(".fern-main");
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

function getFernGeometry(key, fernType) {
    if (!GEOMETRY_CACHE.has(key)) {
        GEOMETRY_CACHE.set(key, {
            bounds: estimateBounds(fernType),
            guidePoints: getGuidePoints(fernType),
        });
    }

    return GEOMETRY_CACHE.get(key);
}

function isCompactViewport() {
    return window.innerWidth < 960;
}

function getFernRenderScale() {
    return isCompactViewport() ? 0.62 : 0.74;
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
