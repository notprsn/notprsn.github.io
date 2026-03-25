const RULE_LABELS = {
    free: "Free choice",
    "no-repeat": "Never same twice",
    "no-adjacent": "Skip neighbors",
};

const STRUCTURE_KEYS = new Set(["vertices", "ratio", "rule"]);
const isMobileViewport = window.matchMedia("(max-width: 720px)").matches;
const DEFAULT_STATE = withResponsiveLimits({
    vertices: 3,
    ratio: 0.5,
    rule: "free",
    stepsPerFrame: 2200,
    hueShift: 204,
    showGuides: true,
});

const state = {
    params: { ...DEFAULT_STATE },
    controlsOpen: false,
    plottedPoints: 0,
    maxPoints: isMobileViewport ? 120000 : 240000,
    complete: false,
    vertices: [],
    currentPoint: null,
    previousVertex: null,
    graphics: null,
};

const elements = {
    stage: document.getElementById("chaos-stage"),
    plotCount: document.getElementById("plot-count"),
    progressCount: document.getElementById("progress-count"),
    ruleReadout: document.getElementById("rule-readout"),
    statusReadout: document.getElementById("status-readout"),
    hudVertices: document.getElementById("hud-vertices"),
    hudRatio: document.getElementById("hud-ratio"),
    controlsShell: document.querySelector("[data-controls-shell]"),
    controlsToggle: document.querySelector("[data-controls-toggle]"),
    resetButton: document.querySelector("[data-reset-sim]"),
};

const outputNodes = new Map(
    Array.from(document.querySelectorAll("[data-output-for]")).map((node) => [node.dataset.outputFor, node])
);

const controlNodes = new Map(
    Array.from(document.querySelectorAll("input[name], select[name]")).map((node) => [node.name, node])
);

if (isMobileViewport) {
    const stepsNode = controlNodes.get("stepsPerFrame");
    if (stepsNode) {
        stepsNode.max = "2600";
    }
}

bindControls();
updateControlUI();
updateReadout();
createSketch();
window.addEventListener("pageshow", () => {
    state.params = withResponsiveLimits(state.params);
    if (!RULE_LABELS[state.params.rule]) {
        state.params = { ...DEFAULT_STATE };
        resetSimulation();
    }
    updateControlUI();
    updateReadout();
});

function bindControls() {
    controlNodes.forEach((node, name) => {
        const eventName = node.tagName === "SELECT" || node.type === "checkbox" ? "change" : "input";
        node.addEventListener(eventName, () => {
            state.params[name] = readControlValue(node);
            state.params = withResponsiveLimits(state.params);
            updateControlOutput(name);

            if (STRUCTURE_KEYS.has(name)) {
                resetSimulation();
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
        resetSimulation();
        updateReadout();
    });
}

function readControlValue(node) {
    if (node.type === "checkbox") {
        return node.checked;
    }

    if (node.tagName === "SELECT") {
        return node.value;
    }

    return Number(node.value);
}

function updateControlUI() {
    controlNodes.forEach((node, name) => {
        const value = state.params[name];
        if (node.type === "checkbox") {
            node.checked = Boolean(value);
        } else {
            node.value = `${value}`;
        }
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
        case "ratio":
            output.textContent = Number(value).toFixed(3);
            break;
        case "stepsPerFrame":
            output.textContent = Number(value).toLocaleString();
            break;
        default:
            output.textContent = `${value}`;
            break;
    }
}

function updateReadout() {
    const progress = Math.min(100, (state.plottedPoints / state.maxPoints) * 100);
    const status = state.complete ? "Settled" : "Growing";
    elements.plotCount.textContent = state.plottedPoints.toLocaleString();
    elements.progressCount.textContent = `${progress.toFixed(0)}%`;
    elements.ruleReadout.textContent = RULE_LABELS[state.params.rule] || RULE_LABELS.free;
    elements.statusReadout.textContent = status;
    elements.hudVertices.textContent = `${state.params.vertices} vertices`;
    elements.hudRatio.textContent = `ratio ${Number(state.params.ratio).toFixed(3)}`;
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
            p.frameRate(60);
            initializeGraphics(p, width, height);
            resetSimulation();
        };

        p.draw = () => {
            advanceSimulation(p);
            drawBackdrop(p);
            p.image(state.graphics, 0, 0);
            drawGuides(p);
            drawCurrentPoint(p);
            updateReadout();
        };

        p.windowResized = () => {
            if (!host) {
                return;
            }
            const { width, height } = getStageSize(host);
            p.resizeCanvas(width, height);
            initializeGraphics(p, width, height);
            resetSimulation();
            updateReadout();
        };
    };

    new p5(sketch);
}

function initializeGraphics(p, width, height) {
    state.graphics = p.createGraphics(width, height);
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
    state.previousVertex = null;
    state.vertices = buildPolygonVertices(state.graphics.width, state.graphics.height, state.params.vertices);
    state.currentPoint = randomStartPoint(state.graphics.width, state.graphics.height);
}

function advanceSimulation(p) {
    if (state.complete || !state.graphics || !state.currentPoint) {
        return;
    }

    const remaining = state.maxPoints - state.plottedPoints;
    const iterations = Math.min(state.params.stepsPerFrame, remaining);
    state.graphics.strokeWeight(isMobileViewport ? 1 : 1.15);

    for (let step = 0; step < iterations; step += 1) {
        const targetIndex = pickTargetIndex();
        const target = state.vertices[targetIndex];
        state.currentPoint.x = p.lerp(state.currentPoint.x, target.x, state.params.ratio);
        state.currentPoint.y = p.lerp(state.currentPoint.y, target.y, state.params.ratio);
        plotPoint(targetIndex);
        state.previousVertex = targetIndex;
        state.plottedPoints += 1;
    }

    if (state.plottedPoints >= state.maxPoints) {
        state.complete = true;
    }
}

function plotPoint(targetIndex) {
    const hueBase = state.params.hueShift + (targetIndex / Math.max(1, state.params.vertices)) * 220;
    const hue = (hueBase + state.plottedPoints * 0.0024) % 360;
    state.graphics.stroke(hue, 62, 100, 0.16);
    state.graphics.point(state.currentPoint.x, state.currentPoint.y);

    if (state.plottedPoints % 12 === 0) {
        state.graphics.stroke(hue, 42, 100, 0.03);
        state.graphics.strokeWeight(isMobileViewport ? 2 : 2.6);
        state.graphics.point(state.currentPoint.x, state.currentPoint.y);
        state.graphics.strokeWeight(isMobileViewport ? 1 : 1.15);
    }
}

function drawBackdrop(p) {
    p.background(196, 38, 6);

    for (let index = 0; index < 9; index += 1) {
        const glowY = p.map(index, 0, 8, p.height * 0.1, p.height * 0.9);
        const alpha = p.map(index, 0, 8, 0.08, 0.02);
        p.noStroke();
        p.fill(128 + index * 7, 20, 14 + index * 3, alpha);
        p.ellipse(p.width * 0.5, glowY, p.width * 1.18, p.height * 0.2);
    }

    p.fill((state.params.hueShift + 28) % 360, 24, 98, 0.08);
    p.circle(p.width * 0.18, p.height * 0.2, Math.min(p.width, p.height) * 0.17);
    p.fill((state.params.hueShift + 164) % 360, 18, 95, 0.08);
    p.circle(p.width * 0.82, p.height * 0.22, Math.min(p.width, p.height) * 0.15);
}

function drawGuides(p) {
    if (!state.params.showGuides || !state.vertices.length) {
        return;
    }

    p.push();
    p.noFill();
    p.stroke((state.params.hueShift + 26) % 360, 18, 84, 0.22);
    p.strokeWeight(1);
    p.beginShape();
    for (const vertex of state.vertices) {
        p.vertex(vertex.x, vertex.y);
    }
    p.endShape(p.CLOSE);

    for (let index = 0; index < state.vertices.length; index += 1) {
        const vertex = state.vertices[index];
        p.fill((state.params.hueShift + (index / state.vertices.length) * 220) % 360, 30, 96, 0.9);
        p.noStroke();
        p.circle(vertex.x, vertex.y, 10);
    }
    p.pop();
}

function drawCurrentPoint(p) {
    if (!state.currentPoint || state.complete) {
        return;
    }

    p.push();
    p.noStroke();
    p.fill((state.params.hueShift + 54) % 360, 30, 100, 0.16);
    p.circle(state.currentPoint.x, state.currentPoint.y, isMobileViewport ? 10 : 14);
    p.fill((state.params.hueShift + 54) % 360, 24, 100, 0.95);
    p.circle(state.currentPoint.x, state.currentPoint.y, isMobileViewport ? 4 : 5.2);
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

function randomStartPoint(width, height) {
    return {
        x: width * (0.2 + Math.random() * 0.6),
        y: height * (0.18 + Math.random() * 0.64),
    };
}

function pickTargetIndex() {
    const candidateIndices = [];

    for (let index = 0; index < state.vertices.length; index += 1) {
        if (!violatesRule(index)) {
            candidateIndices.push(index);
        }
    }

    if (!candidateIndices.length) {
        for (let index = 0; index < state.vertices.length; index += 1) {
            if (index !== state.previousVertex) {
                candidateIndices.push(index);
            }
        }
    }

    if (!candidateIndices.length) {
        return Math.floor(Math.random() * state.vertices.length);
    }

    const choice = Math.floor(Math.random() * candidateIndices.length);
    return candidateIndices[choice];
}

function violatesRule(index) {
    if (state.previousVertex === null || state.params.rule === "free") {
        return false;
    }

    if (state.params.rule === "no-repeat") {
        return index === state.previousVertex;
    }

    if (state.params.rule === "no-adjacent") {
        const count = state.vertices.length;
        const previous = state.previousVertex;
        const next = (previous + 1) % count;
        const prior = (previous - 1 + count) % count;
        return index === previous || index === next || index === prior;
    }

    return false;
}

function withResponsiveLimits(params) {
    const next = { ...params };
    if (isMobileViewport) {
        next.stepsPerFrame = Math.min(next.stepsPerFrame, 2600);
    }
    return next;
}

function getStageSize(host) {
    const width = Math.max(320, Math.floor(host.clientWidth));
    const height = window.innerWidth < 720 ? Math.max(430, Math.floor(width * 1.04)) : Math.max(620, Math.floor(width * 0.82));
    return { width, height };
}
