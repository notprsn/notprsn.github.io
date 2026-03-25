const PRESETS = {
    orchid: {
        wings: 2,
        minRadius: 54,
        maxRadius: 252,
        detail: 200,
        noiseStep: 0.043,
        driftSpeed: 0.01,
        pulse: 0.055,
        verticalStretch: 0.86,
        hueShift: 318,
        glow: 0.28,
        fillAlpha: 0.56,
        outlineWeight: 2.2,
        showEcho: true,
    },
    lagoon: {
        wings: 2.45,
        minRadius: 48,
        maxRadius: 238,
        detail: 220,
        noiseStep: 0.036,
        driftSpeed: 0.008,
        pulse: 0.04,
        verticalStretch: 0.94,
        hueShift: 188,
        glow: 0.24,
        fillAlpha: 0.52,
        outlineWeight: 1.8,
        showEcho: true,
    },
    ember: {
        wings: 1.8,
        minRadius: 64,
        maxRadius: 276,
        detail: 180,
        noiseStep: 0.052,
        driftSpeed: 0.014,
        pulse: 0.07,
        verticalStretch: 0.78,
        hueShift: 18,
        glow: 0.35,
        fillAlpha: 0.61,
        outlineWeight: 2.4,
        showEcho: true,
    },
    moonlight: {
        wings: 3.15,
        minRadius: 38,
        maxRadius: 214,
        detail: 260,
        noiseStep: 0.029,
        driftSpeed: 0.006,
        pulse: 0.03,
        verticalStretch: 1.08,
        hueShift: 266,
        glow: 0.18,
        fillAlpha: 0.44,
        outlineWeight: 1.4,
        showEcho: false,
    },
};

const isMobileViewport = window.matchMedia("(max-width: 720px)").matches;
const DEFAULT_STATE = {
    preset: "orchid",
    ...PRESETS.orchid,
    maxRadius: isMobileViewport ? 220 : PRESETS.orchid.maxRadius,
};

const state = {
    params: { ...DEFAULT_STATE },
    controlsOpen: false,
    stats: {
        vertexCount: 0,
        span: 0,
        drift: 0,
    },
};

const elements = {
    stage: document.getElementById("butterfly-stage"),
    wingReadout: document.getElementById("wing-readout"),
    vertexCount: document.getElementById("vertex-count"),
    spanReadout: document.getElementById("span-readout"),
    driftReadout: document.getElementById("drift-readout"),
    hudPreset: document.getElementById("hud-preset"),
    hudSpan: document.getElementById("hud-span"),
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
    const preset = PRESETS[presetName] || PRESETS.orchid;
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
        case "wings":
        case "verticalStretch":
        case "glow":
        case "fillAlpha":
            output.textContent = Number(value).toFixed(2);
            break;
        case "noiseStep":
        case "driftSpeed":
        case "pulse":
            output.textContent = Number(value).toFixed(3);
            break;
        case "outlineWeight":
            output.textContent = Number(value).toFixed(1);
            break;
        default:
            output.textContent = `${value}`;
            break;
    }
}

function updateReadout() {
    elements.wingReadout.textContent = Number(state.params.wings).toFixed(2);
    elements.vertexCount.textContent = state.stats.vertexCount ? `${state.stats.vertexCount}` : "-";
    elements.spanReadout.textContent = state.stats.span ? `${Math.round(state.stats.span)} px` : "-";
    elements.driftReadout.textContent = Number(state.stats.drift).toFixed(3);
    elements.hudPreset.textContent = state.params.preset;
    elements.hudSpan.textContent = state.stats.span ? `span ${Math.round(state.stats.span)} px` : "span -- px";
}

function createSketch() {
    const sketch = (p) => {
        let host;
        let yoff = 0;

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

            const geometry = buildWingGeometry(p, yoff);

            p.push();
            p.translate(p.width / 2, p.height / 2);

            if (state.params.showEcho) {
                drawWingLayer(p, geometry.points, {
                    scale: 1.08,
                    rotation: p.sin(p.frameCount * 0.01) * 0.06,
                    hue: (state.params.hueShift + 46) % 360,
                    saturation: 52,
                    brightness: 92,
                    alpha: Math.max(0.16, state.params.fillAlpha * 0.44),
                    outlineAlpha: 0.22,
                    glowScale: 0.82,
                });
            }

            drawWingLayer(p, geometry.points, {
                scale: 1,
                rotation: p.sin(p.frameCount * 0.015) * 0.025,
                hue: state.params.hueShift % 360,
                saturation: 72,
                brightness: 96,
                alpha: state.params.fillAlpha,
                outlineAlpha: 0.82,
                glowScale: 1,
            });

            drawCore(p);
            p.pop();

            yoff += state.params.driftSpeed;
            state.stats = {
                vertexCount: geometry.points.length,
                span: geometry.span,
                drift: yoff,
            };
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
    p.background(262, 42, 8);

    for (let index = 0; index < 10; index += 1) {
        const glowY = p.map(index, 0, 9, p.height * 0.12, p.height * 0.86);
        const glowAlpha = p.map(index, 0, 9, 0.09, 0.02);
        p.noStroke();
        p.fill((state.params.hueShift + 18 + index * 4) % 360, 38, 28 + index * 5, glowAlpha);
        p.ellipse(p.width * 0.5, glowY, p.width * 1.08, p.height * 0.18);
    }

    p.fill((state.params.hueShift + 52) % 360, 24, 96, 0.07);
    p.circle(p.width * 0.2, p.height * 0.18, Math.min(p.width, p.height) * 0.16);

    p.fill((state.params.hueShift + 310) % 360, 36, 96, 0.06);
    p.circle(p.width * 0.82, p.height * 0.22, Math.min(p.width, p.height) * 0.14);
}

function buildWingGeometry(p, yoff) {
    const points = [];
    const delta = p.PI / Math.max(60, state.params.detail);
    let xoff = 0;
    let minX = Infinity;
    let maxX = -Infinity;

    for (let angle = 0; angle <= p.TWO_PI + delta; angle += delta) {
        const noiseValue = p.noise(xoff, yoff);
        const radius = p.sin(state.params.wings * angle)
            * p.map(noiseValue, 0, 1, state.params.minRadius, state.params.maxRadius)
            * (1 + p.sin(p.frameCount * 0.02) * state.params.pulse);

        const x = radius * p.cos(angle);
        const y = radius * p.sin(angle) * state.params.verticalStretch;

        if (angle < p.PI) {
            xoff += state.params.noiseStep;
        } else {
            xoff -= state.params.noiseStep;
        }

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        points.push({ x, y });
    }

    return {
        points,
        span: maxX - minX,
    };
}

function drawWingLayer(p, points, config) {
    const context = p.drawingContext;
    context.save();
    context.shadowBlur = state.params.glow * 54 * config.glowScale;
    context.shadowColor = `hsla(${config.hue}, 100%, 78%, ${0.16 + state.params.glow * 0.42})`;

    p.push();
    p.rotate(config.rotation);
    p.scale(config.scale);
    p.noStroke();
    p.fill(config.hue, config.saturation, config.brightness, config.alpha);
    traceWingShape(p, points);
    p.pop();

    context.restore();

    p.push();
    p.rotate(config.rotation);
    p.scale(config.scale);
    p.noFill();
    p.stroke((config.hue + 14) % 360, 30, 100, config.outlineAlpha);
    p.strokeWeight(state.params.outlineWeight);
    traceWingShape(p, points);
    p.pop();
}

function drawCore(p) {
    p.noStroke();
    p.fill((state.params.hueShift + 28) % 360, 12, 100, 0.92);
    p.ellipse(0, 0, 16, 54);

    p.stroke((state.params.hueShift + 18) % 360, 26, 100, 0.82);
    p.strokeWeight(1.2);
    p.line(0, -18, -10, -36);
    p.line(0, -18, 10, -36);
}

function traceWingShape(p, points) {
    p.beginShape();
    points.forEach((point) => {
        p.vertex(point.x, point.y);
    });
    p.endShape(p.CLOSE);
}

function getStageSize(host) {
    const width = Math.max(320, Math.floor(host.clientWidth));
    const height = window.innerWidth < 720 ? Math.max(430, Math.floor(width * 1.12)) : Math.max(600, Math.floor(width * 0.88));
    return { width, height };
}
