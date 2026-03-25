const siteVersion = document.querySelector('meta[name="site-version"]')?.content || "dev";
const isMobileViewport = window.matchMedia("(max-width: 720px)").matches;

const QUALITY_PRESETS = {
    fast: {
        label: "Fast",
        previewScale: 0.42,
        refineScale: 0.82,
    },
    balanced: {
        label: "Balanced",
        previewScale: 0.56,
        refineScale: 1,
    },
    crisp: {
        label: "Crisp",
        previewScale: 0.66,
        refineScale: 1.18,
    },
};

const DEFAULTS = {
    power: 8,
    maxIterations: 12,
    gridResolution: isMobileViewport ? 30 : 44,
    bounds: 1.18,
    escapeRadius: 4,
    pointSize: isMobileViewport ? 2.2 : 2.8,
    hueShift: 146,
    autoRotate: true,
    autoRotateSpeed: 0.28,
    surfaceOnly: true,
    qualityPreset: isMobileViewport ? "fast" : "balanced",
};

const GEOMETRY_KEYS = new Set([
    "power",
    "maxIterations",
    "gridResolution",
    "bounds",
    "escapeRadius",
    "surfaceOnly",
    "qualityPreset",
]);

const numberFormatter = new Intl.NumberFormat("en-US");

const state = {
    params: { ...DEFAULTS },
    geometry: null,
    stats: null,
    progress: 0,
    status: "Preparing first build",
    activeWorker: null,
    activeStage: null,
    jobId: 0,
    refineTimer: null,
    pendingRefine: false,
    controlsOpen: false,
};

const elements = {
    stage: document.getElementById("mandelbulb-stage"),
    status: document.getElementById("render-status"),
    progress: document.getElementById("render-progress"),
    mode: document.getElementById("render-mode"),
    pointCount: document.getElementById("point-count"),
    resolution: document.getElementById("resolution-readout"),
    quality: document.getElementById("quality-readout"),
    hudStatus: document.getElementById("hud-status"),
    hudProgress: document.getElementById("hud-progress"),
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
scheduleGeometryRebuild();

function bindControls() {
    controlNodes.forEach((node, name) => {
        const eventName = node.tagName === "SELECT" || node.type === "checkbox" ? "change" : "input";
        node.addEventListener(eventName, () => {
            state.params[name] = readControlValue(node);
            updateControlOutput(name);

            if (GEOMETRY_KEYS.has(name)) {
                scheduleGeometryRebuild();
            } else {
                updateReadout();
            }
        });
    });

    elements.controlsToggle?.addEventListener("click", () => {
        state.controlsOpen = !state.controlsOpen;
        elements.controlsShell?.classList.toggle("controls-open", state.controlsOpen);
        elements.controlsToggle.textContent = state.controlsOpen ? "Close controls" : "Open controls";
    });

    elements.resetButton?.addEventListener("click", () => {
        state.params = { ...DEFAULTS, gridResolution: isMobileViewport ? 30 : 44, pointSize: isMobileViewport ? 2.2 : 2.8, qualityPreset: isMobileViewport ? "fast" : "balanced" };
        updateControlUI();
        scheduleGeometryRebuild();
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
        case "power":
        case "bounds":
            output.textContent = Number(value).toFixed(2);
            break;
        case "escapeRadius":
            output.textContent = Number(value).toFixed(1);
            break;
        case "pointSize":
        case "autoRotateSpeed":
            output.textContent = Number(value).toFixed(2);
            break;
        default:
            output.textContent = `${value}`;
            break;
    }
}

function scheduleGeometryRebuild() {
    window.clearTimeout(state.refineTimer);
    state.pendingRefine = false;
    requestGeometry("preview");
    state.refineTimer = window.setTimeout(() => {
        if (state.activeStage === "preview") {
            state.pendingRefine = true;
            state.status = "Preview in flight; refine queued";
            updateReadout();
            return;
        }

        requestGeometry("refine");
    }, 320);
}

function requestGeometry(stage) {
    const quality = buildQuality(stage);
    const jobId = state.jobId + 1;
    state.jobId = jobId;
    state.activeStage = stage;

    if (state.activeWorker) {
        state.activeWorker.terminate();
    }

    const worker = new Worker(`worker.js?v=${encodeURIComponent(siteVersion)}`);
    state.activeWorker = worker;
    state.status = stage === "preview" ? "Computing coarse preview" : "Refining point cloud";
    state.progress = 0;
    updateReadout();

    worker.addEventListener("message", (event) => {
        const message = event.data;
        if (!message || message.jobId !== jobId) {
            return;
        }

        if (message.type === "progress") {
            state.progress = message.percent;
            state.status = message.label || state.status;
            updateReadout();
            return;
        }

        if (message.type === "complete") {
            state.geometry = {
                positions: new Float32Array(message.geometry.positions),
                values: new Float32Array(message.geometry.values),
            };
            state.stats = message.stats;
            state.progress = 100;
            state.status = stage === "preview" ? "Preview ready" : "Refined point cloud ready";
            updateReadout();
            worker.terminate();
            if (state.activeWorker === worker) {
                state.activeWorker = null;
            }
            if (state.activeStage === stage) {
                state.activeStage = null;
            }
            if (stage === "preview" && state.pendingRefine) {
                state.pendingRefine = false;
                requestGeometry("refine");
            }
        }
    });

    worker.addEventListener("error", (error) => {
        console.error(error);
        state.status = "Worker failed";
        updateReadout();
        worker.terminate();
        if (state.activeWorker === worker) {
            state.activeWorker = null;
        }
        if (state.activeStage === stage) {
            state.activeStage = null;
        }
    });

    worker.postMessage({
        type: "generate",
        jobId,
        params: state.params,
        quality,
    });
}

function buildQuality(stage) {
    const preset = QUALITY_PRESETS[state.params.qualityPreset] || QUALITY_PRESETS.balanced;
    const multiplier = stage === "preview" ? preset.previewScale : preset.refineScale;
    const min = stage === "preview" ? 16 : 18;
    const cap = window.innerWidth < 720 ? 50 : 68;
    const resolution = clamp(Math.round(state.params.gridResolution * multiplier), min, cap);

    return {
        stage,
        label: `${preset.label} ${stage}`,
        resolution,
    };
}

function updateReadout() {
    const stats = state.stats;
    const pointCount = state.geometry ? state.geometry.positions.length / 3 : 0;
    const modeLabel = state.params.surfaceOnly ? "surface shell" : "solid core";

    elements.status.textContent = state.status;
    elements.progress.textContent = `${Math.round(state.progress)}%`;
    elements.mode.textContent = modeLabel;
    elements.pointCount.textContent = pointCount ? numberFormatter.format(pointCount) : "-";
    elements.resolution.textContent = stats ? `${stats.resolution}^3` : "-";
    elements.quality.textContent = stats ? `${stats.qualityLabel}` : "-";
    elements.hudStatus.textContent = state.status.toLowerCase();
    elements.hudProgress.textContent = `${Math.round(state.progress)}%`;
}

function createSketch() {
    const sketch = (p) => {
        let host;

        p.setup = () => {
            host = elements.stage;
            const { width, height } = getStageSize(host);
            const canvas = p.createCanvas(width, height, p.WEBGL);
            canvas.parent(host);
            canvas.elt.setAttribute("aria-hidden", "true");
            canvas.elt.addEventListener("contextmenu", (event) => event.preventDefault());
            p.pixelDensity(1);
            p.colorMode(p.HSB, 360, 100, 100, 1);
        };

        p.draw = () => {
            p.background(220, 18, 7);
            p.orbitControl(1, 1, 0.8, {
                disableTouchActions: true,
                freeRotation: false,
            });

            p.push();
            p.noFill();
            p.strokeWeight(state.params.pointSize);
            p.strokeCap(p.ROUND);

            const sceneScale = computeSceneScale(p.width, p.height, state.params.bounds);
            p.scale(sceneScale);

            if (state.params.autoRotate) {
                p.rotateY(p.frameCount * state.params.autoRotateSpeed * 0.01);
            }
            p.rotateX(-0.18);

            if (state.geometry) {
                const positions = state.geometry.positions;
                const values = state.geometry.values;
                p.beginShape(p.POINTS);
                for (let index = 0; index < values.length; index += 1) {
                    const offset = index * 3;
                    const hue = (state.params.hueShift + values[index] * 180 + index * 0.013) % 360;
                    const saturation = 58 + values[index] * 28;
                    const brightness = 70 + values[index] * 28;
                    const alpha = 0.34 + values[index] * 0.54;
                    p.stroke(hue, saturation, brightness, alpha);
                    p.vertex(positions[offset], positions[offset + 1], positions[offset + 2]);
                }
                p.endShape();
            } else {
                p.stroke(155, 28, 80, 0.85);
                p.sphere(0.8, 10, 10);
            }

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

function getStageSize(host) {
    const width = Math.max(320, Math.floor(host.clientWidth));
    const height = window.innerWidth < 720 ? Math.max(420, Math.floor(width * 0.98)) : Math.max(560, Math.floor(width * 0.72));
    return { width, height };
}

function computeSceneScale(width, height, bounds) {
    return Math.min(width, height) * 0.28 / Math.max(bounds, 0.1);
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
