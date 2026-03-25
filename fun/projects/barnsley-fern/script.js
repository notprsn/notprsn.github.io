const X_MIN = -2.182;
const X_MAX = 2.6558;
const Y_MIN = 0;
const Y_MAX = 9.9983;

const PRESETS = {
    forest: {
        pointsPerFrame: 900,
        maxPoints: 120000,
        pointWeight: 1.1,
        scale: 0.96,
        margin: 0.12,
        autoCycle: true,
        cycleSeconds: 2.8,
        glow: 0.18,
        palette: [
            [126, 56, 95],
            [138, 42, 92],
            [44, 68, 96],
            [92, 36, 100],
        ],
        atmosphereHue: 136,
        accentHue: 92,
    },
    dusk: {
        pointsPerFrame: 820,
        maxPoints: 110000,
        pointWeight: 1,
        scale: 0.94,
        margin: 0.13,
        autoCycle: true,
        cycleSeconds: 2.2,
        glow: 0.22,
        palette: [
            [164, 48, 100],
            [186, 34, 96],
            [212, 38, 92],
            [44, 40, 100],
        ],
        atmosphereHue: 202,
        accentHue: 188,
    },
    ember: {
        pointsPerFrame: 1040,
        maxPoints: 140000,
        pointWeight: 1.2,
        scale: 0.98,
        margin: 0.11,
        autoCycle: true,
        cycleSeconds: 1.8,
        glow: 0.28,
        palette: [
            [18, 72, 100],
            [34, 70, 100],
            [50, 58, 100],
            [102, 36, 92],
        ],
        atmosphereHue: 24,
        accentHue: 48,
    },
    frost: {
        pointsPerFrame: 760,
        maxPoints: 100000,
        pointWeight: 0.9,
        scale: 0.92,
        margin: 0.14,
        autoCycle: true,
        cycleSeconds: 3.4,
        glow: 0.14,
        palette: [
            [176, 28, 100],
            [192, 30, 96],
            [146, 18, 100],
            [210, 14, 92],
        ],
        atmosphereHue: 188,
        accentHue: 170,
    },
};

const DEFAULT_STATE = {
    preset: "forest",
    ...PRESETS.forest,
};

const state = {
    params: { ...DEFAULT_STATE },
    controlsOpen: false,
    paused: false,
    complete: false,
    resetRequested: false,
    simulation: null,
    stats: {
        points: 0,
        stemShare: 0,
        frondShare: 0,
        status: "Growing",
    },
};

const elements = {
    stage: document.getElementById("fern-stage"),
    pointCount: document.getElementById("point-count"),
    stemShare: document.getElementById("stem-share"),
    frondShare: document.getElementById("frond-share"),
    statusReadout: document.getElementById("status-readout"),
    hudPreset: document.getElementById("hud-preset"),
    hudPoints: document.getElementById("hud-points"),
    controlsShell: document.querySelector("[data-controls-shell]"),
    controlsToggle: document.querySelector("[data-controls-toggle]"),
    runToggle: document.querySelector("[data-run-toggle]"),
    resetButton: document.querySelector("[data-reset-sim]"),
};

const outputNodes = new Map(
    Array.from(document.querySelectorAll("[data-output-for]")).map((node) => [node.dataset.outputFor, node])
);

const controlNodes = new Map(
    Array.from(document.querySelectorAll("input[name], select[name]")).map((node) => [node.name, node])
);

bindControls();
updateControlUI();
updateReadout();
createSketch();

window.addEventListener("pageshow", () => {
    if (!state.params.preset || !PRESETS[state.params.preset]) {
        state.params = { ...DEFAULT_STATE };
    }
    updateControlUI();
    updateReadout();
});

function bindControls() {
    controlNodes.forEach((node, name) => {
        const eventName = node.tagName === "SELECT" || node.type === "checkbox" ? "change" : "input";
        node.addEventListener(eventName, () => {
            const value = readControlValue(node);
            if (name === "preset") {
                applyPreset(value);
                return;
            }

            state.params[name] = value;
            updateControlOutput(name);
            requestReset();
        });
    });

    elements.controlsToggle?.addEventListener("click", () => {
        state.controlsOpen = !state.controlsOpen;
        elements.controlsShell?.classList.toggle("controls-open", state.controlsOpen);
        elements.controlsToggle.textContent = state.controlsOpen ? "Close controls" : "Open controls";
    });

    elements.runToggle?.addEventListener("click", () => {
        if (state.complete) {
            requestReset();
            return;
        }

        state.paused = !state.paused;
        updateReadout();
    });

    elements.resetButton?.addEventListener("click", () => {
        requestReset();
    });
}

function applyPreset(presetName) {
    const preset = PRESETS[presetName] || PRESETS.forest;
    state.params = {
        ...state.params,
        ...preset,
        preset: presetName,
    };
    updateControlUI();
    requestReset();
}

function requestReset() {
    state.resetRequested = true;
    state.paused = false;
    state.complete = false;
    updateReadout();
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
        case "pointWeight":
            output.textContent = Number(value).toFixed(1);
            break;
        case "scale":
        case "margin":
        case "glow":
            output.textContent = Number(value).toFixed(2);
            break;
        case "cycleSeconds":
            output.textContent = `${Number(value).toFixed(1)}s`;
            break;
        default:
            output.textContent = `${value}`;
            break;
    }
}

function updateReadout() {
    elements.pointCount.textContent = `${state.stats.points}`;
    elements.stemShare.textContent = `${state.stats.stemShare.toFixed(1)}%`;
    elements.frondShare.textContent = `${state.stats.frondShare.toFixed(1)}%`;
    elements.statusReadout.textContent = state.stats.status;
    elements.hudPreset.textContent = state.params.preset;
    elements.hudPoints.textContent = `${state.stats.points.toLocaleString()} points`;
    elements.runToggle.textContent = state.complete ? "Regrow fern" : state.paused ? "Resume growth" : "Pause growth";
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
            createLayer(p);
            resetSimulation(p);
        };

        p.draw = () => {
            if (state.resetRequested) {
                resetSimulation(p);
            }

            drawBackdrop(p);

            if (!state.paused && !state.complete) {
                advanceSimulation(p, state.params.pointsPerFrame);
            } else if (state.params.autoCycle && !state.complete) {
                syncPaletteCycle(p);
            }

            if (state.simulation?.layer) {
                p.image(state.simulation.layer, 0, 0, p.width, p.height);
            }

            updateStats();
            updateReadout();
        };

        p.windowResized = () => {
            if (!host) {
                return;
            }
            const { width, height } = getStageSize(host);
            p.resizeCanvas(width, height);
            createLayer(p);
            resetSimulation(p);
        };
    };

    new p5(sketch);
}

function createLayer(p) {
    const layer = p.createGraphics(p.width, p.height);
    layer.pixelDensity(1);
    layer.colorMode(p.HSB, 360, 100, 100, 1);
    layer.clear();

    state.simulation = {
        x: 0,
        y: 0,
        plotted: 0,
        counts: [0, 0, 0, 0],
        paletteIndex: 0,
        lastCycleMillis: p.millis(),
        layer,
    };
}

function resetSimulation(p) {
    if (!state.simulation) {
        createLayer(p);
    }

    state.simulation.x = 0;
    state.simulation.y = 0;
    state.simulation.plotted = 0;
    state.simulation.counts = [0, 0, 0, 0];
    state.simulation.paletteIndex = 0;
    state.simulation.lastCycleMillis = p.millis();
    state.simulation.layer.clear();

    state.paused = false;
    state.complete = false;
    state.resetRequested = false;
    setLayerStyle(p);
}

function drawBackdrop(p) {
    p.background(state.params.atmosphereHue, 28, 8);

    for (let index = 0; index < 9; index += 1) {
        const glowY = p.map(index, 0, 8, p.height * 0.1, p.height * 0.9);
        const glowAlpha = p.map(index, 0, 8, 0.07, 0.015);
        p.noStroke();
        p.fill((state.params.accentHue + index * 3) % 360, 32, 24 + index * 5, glowAlpha);
        p.ellipse(p.width * 0.5, glowY, p.width * 1.12, p.height * 0.16);
    }

    p.fill((state.params.accentHue + 24) % 360, 18, 94, 0.05);
    p.circle(p.width * 0.18, p.height * 0.18, Math.min(p.width, p.height) * 0.16);

    p.fill((state.params.atmosphereHue + 12) % 360, 26, 100, 0.04);
    p.circle(p.width * 0.82, p.height * 0.22, Math.min(p.width, p.height) * 0.18);
}

function advanceSimulation(p, iterations) {
    if (!state.simulation?.layer) {
        return;
    }

    syncPaletteCycle(p);
    const layer = state.simulation.layer;

    for (let index = 0; index < iterations; index += 1) {
        if (state.simulation.plotted >= state.params.maxPoints) {
            state.complete = true;
            break;
        }

        const transformId = iterateFernStep(p);
        const { px, py } = projectPoint(p, state.simulation.x, state.simulation.y);
        layer.point(px, py);
        state.simulation.counts[transformId] += 1;
        state.simulation.plotted += 1;
    }
}

function iterateFernStep(p) {
    const r = p.random(1);
    let nextX;
    let nextY;
    let transformId;

    if (r < 0.01) {
        nextX = 0;
        nextY = 0.16 * state.simulation.y;
        transformId = 0;
    } else if (r < 0.86) {
        nextX = 0.85 * state.simulation.x + 0.04 * state.simulation.y;
        nextY = -0.04 * state.simulation.x + 0.85 * state.simulation.y + 1.6;
        transformId = 1;
    } else if (r < 0.93) {
        nextX = 0.2 * state.simulation.x - 0.26 * state.simulation.y;
        nextY = 0.23 * state.simulation.x + 0.22 * state.simulation.y + 1.6;
        transformId = 2;
    } else {
        nextX = -0.15 * state.simulation.x + 0.28 * state.simulation.y;
        nextY = 0.26 * state.simulation.x + 0.24 * state.simulation.y + 0.44;
        transformId = 3;
    }

    state.simulation.x = nextX;
    state.simulation.y = nextY;
    return transformId;
}

function projectPoint(p, x, y) {
    const xRange = X_MAX - X_MIN;
    const yRange = Y_MAX - Y_MIN;
    const usableWidth = p.width * (1 - state.params.margin * 2);
    const usableHeight = p.height * (1 - state.params.margin * 2);
    const fitScale = Math.min(usableWidth / xRange, usableHeight / yRange) * state.params.scale;
    const centerX = (X_MIN + X_MAX) / 2;
    const px = p.width / 2 + (x - centerX) * fitScale;
    const py = p.height * (1 - state.params.margin) - (y - Y_MIN) * fitScale;
    return { px, py };
}

function syncPaletteCycle(p) {
    if (!state.params.autoCycle || state.params.cycleSeconds <= 0 || !state.simulation) {
        return;
    }

    const cycleMs = state.params.cycleSeconds * 1000;
    const elapsed = p.millis() - state.simulation.lastCycleMillis;
    if (elapsed < cycleMs) {
        return;
    }

    const steps = Math.floor(elapsed / cycleMs);
    state.simulation.paletteIndex = (state.simulation.paletteIndex + steps) % state.params.palette.length;
    state.simulation.lastCycleMillis += steps * cycleMs;
    setLayerStyle(p);
}

function setLayerStyle(p) {
    if (!state.simulation?.layer) {
        return;
    }

    const layer = state.simulation.layer;
    const [hue, saturation, brightness] = state.params.palette[state.simulation.paletteIndex];
    const strokeColor = p.color(hue, saturation, brightness, 0.84);

    layer.stroke(strokeColor);
    layer.strokeWeight(state.params.pointWeight);
    layer.drawingContext.shadowBlur = state.params.glow * 34;
    layer.drawingContext.shadowColor = strokeColor.toString();
}

function updateStats() {
    const plotted = state.simulation?.plotted || 0;
    const counts = state.simulation?.counts || [0, 0, 0, 0];
    const stemShare = plotted ? (counts[0] / plotted) * 100 : 0;
    const frondShare = plotted ? (counts[1] / plotted) * 100 : 0;

    let status = "Growing";
    if (state.complete) {
        status = "Complete";
    } else if (state.paused) {
        status = "Paused";
    } else if (!state.params.autoCycle) {
        status = "Static color";
    }

    state.stats = {
        points: plotted,
        stemShare,
        frondShare,
        status,
    };
}

function getStageSize(host) {
    const width = Math.max(320, Math.floor(host.clientWidth));
    const height = window.innerWidth < 720 ? Math.max(430, Math.floor(width * 1.18)) : Math.max(620, Math.floor(width * 0.9));
    return { width, height };
}
