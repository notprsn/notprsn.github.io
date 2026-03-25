const PRESETS = {
    classic: {
        angleDeg: 25,
        branchRatio: 0.67,
        rootLength: 140,
        minLength: 9,
        wind: 0.18,
        asymmetry: 0,
        thicknessDecay: 0.74,
        showLeaves: true,
        leafSize: 5.8,
        hueShift: 112,
    },
    willow: {
        angleDeg: 18,
        branchRatio: 0.74,
        rootLength: 160,
        minLength: 8,
        wind: 0.28,
        asymmetry: -0.08,
        thicknessDecay: 0.78,
        showLeaves: true,
        leafSize: 4.8,
        hueShift: 128,
    },
    winter: {
        angleDeg: 31,
        branchRatio: 0.65,
        rootLength: 150,
        minLength: 8.5,
        wind: 0.12,
        asymmetry: 0.06,
        thicknessDecay: 0.72,
        showLeaves: false,
        leafSize: 0,
        hueShift: 196,
    },
    coral: {
        angleDeg: 38,
        branchRatio: 0.69,
        rootLength: 126,
        minLength: 7,
        wind: 0.08,
        asymmetry: 0,
        thicknessDecay: 0.76,
        showLeaves: true,
        leafSize: 7.8,
        hueShift: 338,
    },
};

const isMobileViewport = window.matchMedia("(max-width: 720px)").matches;
const DEFAULT_STATE = {
    preset: "classic",
    ...PRESETS.classic,
    rootLength: isMobileViewport ? 116 : PRESETS.classic.rootLength,
};

const state = {
    params: { ...DEFAULT_STATE },
    controlsOpen: false,
    stats: {
        branches: 0,
        leaves: 0,
        maxDepth: 0,
    },
};

const elements = {
    stage: document.getElementById("tree-stage"),
    branchCount: document.getElementById("branch-count"),
    leafCount: document.getElementById("leaf-count"),
    depthCount: document.getElementById("depth-count"),
    presetReadout: document.getElementById("preset-readout"),
    hudPreset: document.getElementById("hud-preset"),
    hudAngle: document.getElementById("hud-angle"),
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
        case "angleDeg":
            output.textContent = `${Number(value).toFixed(2)}°`;
            break;
        case "branchRatio":
        case "wind":
        case "asymmetry":
        case "thicknessDecay":
            output.textContent = Number(value).toFixed(2);
            break;
        case "minLength":
            output.textContent = Number(value).toFixed(1);
            break;
        case "leafSize":
            output.textContent = Number(value).toFixed(1);
            break;
        default:
            output.textContent = `${value}`;
            break;
    }
}

function updateReadout() {
    elements.branchCount.textContent = `${state.stats.branches || "-"}`;
    elements.leafCount.textContent = `${state.stats.leaves || "-"}`;
    elements.depthCount.textContent = `${state.stats.maxDepth || "-"}`;
    elements.presetReadout.textContent = capitalize(state.params.preset);
    elements.hudPreset.textContent = state.params.preset;
    elements.hudAngle.textContent = `${Number(state.params.angleDeg).toFixed(2)}°`;
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
            p.translate(p.width / 2, p.height * 0.94);
            state.stats = {
                branches: 0,
                leaves: 0,
                maxDepth: 0,
            };
            branch(p, state.params.rootLength, 0, Math.max(1.3, state.params.rootLength * 0.09), p.frameCount * 0.018);
            p.pop();
            updateReadout();
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
    p.background(219, 34, 12);

    for (let index = 0; index < 9; index += 1) {
        const glowY = p.map(index, 0, 8, p.height * 0.12, p.height * 0.84);
        const glowAlpha = p.map(index, 0, 8, 0.08, 0.02);
        p.noStroke();
        p.fill(24 + index * 2, 42, 20 + index * 5, glowAlpha);
        p.ellipse(p.width * 0.5, glowY, p.width * 1.24, p.height * 0.22);
    }

    p.noStroke();
    p.fill(44, 28, 92, 0.12);
    p.circle(p.width * 0.82, p.height * 0.18, Math.min(p.width, p.height) * 0.18);

    p.fill(28, 18, 14, 0.96);
    p.rect(0, p.height * 0.88, p.width, p.height * 0.16);
}

function branch(p, len, depth, thickness, time) {
    state.stats.branches += 1;
    state.stats.maxDepth = Math.max(state.stats.maxDepth, depth + 1);

    const trunkHue = (28 + state.params.hueShift * 0.08 + depth * 1.2) % 360;
    const trunkSat = 32 + Math.min(depth * 1.4, 18);
    const trunkBrightness = 28 + Math.min(depth * 2.5, 28);

    p.stroke(trunkHue, trunkSat, trunkBrightness, 0.95);
    p.strokeWeight(thickness);
    p.line(0, 0, 0, -len);
    p.translate(0, -len);

    if (len <= state.params.minLength) {
        if (state.params.showLeaves && state.params.leafSize > 0.2) {
            const leafHue = (state.params.hueShift + depth * 6 + p.sin(time + depth) * 8 + 360) % 360;
            const leafBrightness = state.params.preset === "winter" ? 92 : 98;
            const leafSat = state.params.preset === "winter" ? 10 : 56;
            p.noStroke();
            p.fill(leafHue, leafSat, leafBrightness, 0.78);
            p.ellipse(0, 0, state.params.leafSize * 0.95, state.params.leafSize * 1.35);
            state.stats.leaves += 1;
        }
        return;
    }

    const baseAngle = p.radians(state.params.angleDeg);
    const windOffset = p.sin(time + depth * 0.75) * state.params.wind * (0.28 + depth * 0.05);
    const asymmetry = state.params.asymmetry;
    const nextLength = len * state.params.branchRatio;
    const nextThickness = Math.max(0.75, thickness * state.params.thicknessDecay);

    p.push();
    p.rotate(baseAngle + windOffset + asymmetry);
    branch(p, nextLength, depth + 1, nextThickness, time + 0.12);
    p.pop();

    p.push();
    p.rotate(-baseAngle + windOffset - asymmetry);
    branch(p, nextLength, depth + 1, nextThickness, time + 0.18);
    p.pop();
}

function getStageSize(host) {
    const width = Math.max(320, Math.floor(host.clientWidth));
    const height = window.innerWidth < 720 ? Math.max(430, Math.floor(width * 1.12)) : Math.max(600, Math.floor(width * 0.88));
    return { width, height };
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
