const siteVersion = document.querySelector('meta[name="site-version"]')?.content || "dev";
const isMobileViewport = window.matchMedia("(max-width: 720px)").matches;
const TAU = Math.PI * 2;

const DEFAULTS = {
    phase: 1.85,
    autoPlay: true,
    driftSpeed: 0.18,
    zoom: isMobileViewport ? 1.45 : 1.85,
    iterations: isMobileViewport ? 180 : 220,
    paletteShift: 0.18,
};

const state = {
    params: { ...DEFAULTS },
    center: { x: 0, y: 0 },
    controlsOpen: false,
    needsReadoutSync: true,
};

const elements = {
    stage: document.getElementById("julia-stage"),
    constantReadout: document.getElementById("constant-readout"),
    centerReadout: document.getElementById("center-readout"),
    zoomReadout: document.getElementById("zoom-readout"),
    detailReadout: document.getElementById("detail-readout"),
    hudConstant: document.getElementById("hud-constant"),
    hudZoom: document.getElementById("hud-zoom"),
    controlsShell: document.querySelector("[data-controls-shell]"),
    controlsToggle: document.querySelector("[data-controls-toggle]"),
    resetButton: document.querySelector("[data-reset-controls]"),
};

const outputNodes = new Map(
    Array.from(document.querySelectorAll("[data-output-for]")).map((node) => [node.dataset.outputFor, node])
);

const controlNodes = new Map(
    Array.from(document.querySelectorAll("input[name]")).map((node) => [node.name, node])
);

bindControls();
updateControlUI();
updateReadout();
createSketch();
window.addEventListener("pageshow", () => {
    updateControlUI();
    updateReadout();
});

function bindControls() {
    controlNodes.forEach((node, name) => {
        const eventName = node.type === "checkbox" ? "change" : "input";
        node.addEventListener(eventName, () => {
            state.params[name] = readControlValue(node);
            updateControlOutput(name);
            state.needsReadoutSync = true;
        });
    });

    elements.controlsToggle?.addEventListener("click", () => {
        state.controlsOpen = !state.controlsOpen;
        elements.controlsShell?.classList.toggle("controls-open", state.controlsOpen);
        elements.controlsToggle.textContent = state.controlsOpen ? "Close controls" : "Open controls";
    });

    elements.resetButton?.addEventListener("click", () => {
        state.params = { ...DEFAULTS };
        state.center = { x: 0, y: 0 };
        updateControlUI();
        updateReadout();
        state.needsReadoutSync = false;
    });
}

function readControlValue(node) {
    if (node.type === "checkbox") {
        return node.checked;
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
        case "phase":
            output.textContent = `${Number(value).toFixed(2)} rad`;
            break;
        case "zoom":
            output.textContent = `${Number(value).toFixed(2)}x`;
            break;
        case "driftSpeed":
            output.textContent = Number(value).toFixed(2);
            break;
        case "paletteShift":
            output.textContent = Number(value).toFixed(3);
            break;
        default:
            output.textContent = `${value}`;
            break;
    }
}

function updateReadout() {
    const constant = getJuliaConstant();
    elements.constantReadout.textContent = formatComplex(constant);
    elements.centerReadout.textContent = `${state.center.x.toFixed(3)}, ${state.center.y.toFixed(3)}`;
    elements.zoomReadout.textContent = `${state.params.zoom.toFixed(2)}x`;
    elements.detailReadout.textContent = `${Math.round(state.params.iterations)}`;
    elements.hudConstant.textContent = `c = ${formatComplex(constant)}`;
    elements.hudZoom.textContent = `${state.params.zoom.toFixed(2)}x`;
}

function createSketch() {
    const sketch = (p) => {
        let host;
        let juliaShader;

        p.preload = () => {
            juliaShader = p.loadShader(
                `julia.vert?v=${encodeURIComponent(siteVersion)}`,
                `julia.frag?v=${encodeURIComponent(siteVersion)}`
            );
        };

        p.setup = () => {
            host = elements.stage;
            const { width, height } = getStageSize(host);
            const canvas = p.createCanvas(width, height, p.WEBGL);
            canvas.parent(host);
            p.pixelDensity(1);
            p.noStroke();
            p.frameRate(36);
        };

        p.draw = () => {
            if (state.params.autoPlay) {
                state.params.phase = wrapPhase(state.params.phase + state.params.driftSpeed * 0.01);
                const phaseNode = controlNodes.get("phase");
                if (phaseNode) {
                    phaseNode.value = `${state.params.phase}`;
                }
                updateControlOutput("phase");
                state.needsReadoutSync = true;
            }

            const constant = getJuliaConstant();

            p.shader(juliaShader);
            juliaShader.setUniform("u_resolution", [p.width, p.height]);
            juliaShader.setUniform("u_center", [state.center.x, state.center.y]);
            juliaShader.setUniform("u_zoom", state.params.zoom);
            juliaShader.setUniform("u_c", [constant.x, constant.y]);
            juliaShader.setUniform("u_iterations", state.params.iterations);
            juliaShader.setUniform("u_paletteShift", state.params.paletteShift);
            juliaShader.setUniform("u_time", p.millis() / 1000);
            p.quad(-1, -1, 1, -1, 1, 1, -1, 1);

            if (state.needsReadoutSync || p.frameCount % 8 === 0) {
                updateReadout();
                state.needsReadoutSync = false;
            }
        };

        p.mouseDragged = () => {
            if (!pointerInsideCanvas(p)) {
                return;
            }

            const aspect = p.width / p.height;
            state.center.x -= ((p.mouseX - p.pmouseX) / p.width) * (2 / state.params.zoom) * aspect;
            state.center.y += ((p.mouseY - p.pmouseY) / p.height) * (2 / state.params.zoom);
            state.needsReadoutSync = true;
            return false;
        };

        p.mouseWheel = (event) => {
            if (!pointerInsideCanvas(p)) {
                return true;
            }

            const factor = event.delta > 0 ? 0.92 : 1.08;
            state.params.zoom = clamp(state.params.zoom * factor, 0.6, 8);
            const zoomNode = controlNodes.get("zoom");
            if (zoomNode) {
                zoomNode.value = `${state.params.zoom}`;
            }
            updateControlOutput("zoom");
            state.needsReadoutSync = true;
            return false;
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

function getJuliaConstant() {
    return {
        x: 0.7885 * Math.cos(state.params.phase),
        y: -Math.sin(state.params.phase),
    };
}

function formatComplex(value) {
    const real = value.x.toFixed(3);
    const imagAbs = Math.abs(value.y).toFixed(3);
    const sign = value.y >= 0 ? "+" : "-";
    return `${real} ${sign} ${imagAbs}i`;
}

function wrapPhase(value) {
    if (value < 0) {
        return value + TAU;
    }
    if (value > TAU) {
        return value - TAU;
    }
    return value;
}

function getStageSize(host) {
    const width = Math.max(320, Math.floor(host.clientWidth));
    const height = window.innerWidth < 720 ? Math.max(430, Math.floor(width * 1.02)) : Math.max(620, Math.floor(width * 0.84));
    return { width, height };
}

function pointerInsideCanvas(p) {
    return p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
