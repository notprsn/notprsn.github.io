const PRESETS = {
    classic: {
        arms: 6,
        spawnRadius: 248,
        particleRadius: 3,
        stickiness: 2,
        maxParticles: 960,
        stepsPerFrame: 18,
        inwardDrift: 1,
        jitter: 3,
        rotationSpeed: 0.03,
        hueShift: 196,
        bloom: 0.18,
        showWalker: true,
    },
    halo: {
        arms: 8,
        spawnRadius: 236,
        particleRadius: 2.5,
        stickiness: 1.85,
        maxParticles: 1320,
        stepsPerFrame: 26,
        inwardDrift: 1.05,
        jitter: 2.5,
        rotationSpeed: 0.05,
        hueShift: 212,
        bloom: 0.24,
        showWalker: true,
    },
    blizzard: {
        arms: 7,
        spawnRadius: 270,
        particleRadius: 2.2,
        stickiness: 1.75,
        maxParticles: 1800,
        stepsPerFrame: 34,
        inwardDrift: 1.18,
        jitter: 4.2,
        rotationSpeed: 0.07,
        hueShift: 204,
        bloom: 0.3,
        showWalker: true,
    },
    ember: {
        arms: 5,
        spawnRadius: 224,
        particleRadius: 3.4,
        stickiness: 2.15,
        maxParticles: 820,
        stepsPerFrame: 14,
        inwardDrift: 0.82,
        jitter: 2.2,
        rotationSpeed: 0.02,
        hueShift: 18,
        bloom: 0.22,
        showWalker: true,
    },
};

const RESET_KEYS = new Set(["arms", "spawnRadius", "particleRadius", "stickiness", "inwardDrift", "jitter"]);
const isMobileViewport = window.matchMedia("(max-width: 720px)").matches;
const DEFAULT_STATE = withResponsiveLimits({
    preset: "classic",
    ...PRESETS.classic,
});

const state = {
    params: { ...DEFAULT_STATE },
    controlsOpen: false,
    particles: [],
    current: null,
    complete: false,
    paused: false,
    stats: {
        frontier: 0,
    },
};

const elements = {
    stage: document.getElementById("brownian-stage"),
    particleCount: document.getElementById("particle-count"),
    frontierCount: document.getElementById("frontier-count"),
    armCount: document.getElementById("arm-count"),
    statusReadout: document.getElementById("status-readout"),
    hudPreset: document.getElementById("hud-preset"),
    hudStatus: document.getElementById("hud-status"),
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

            if (RESET_KEYS.has(name)) {
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

    elements.runToggle?.addEventListener("click", () => {
        if (state.complete) {
            return;
        }

        state.paused = !state.paused;
        updateReadout();
    });

    elements.resetButton?.addEventListener("click", () => {
        resetSimulation();
        updateReadout();
    });
}

function applyPreset(presetName) {
    const preset = PRESETS[presetName] || PRESETS.classic;
    state.params = withResponsiveLimits({
        preset: presetName,
        ...preset,
    });
    updateControlUI();
    resetSimulation();
    updateReadout();
}

function resetSimulation() {
    state.params = withResponsiveLimits(state.params);
    state.particles = [];
    state.current = new Walker(state.params.spawnRadius, 0, state.params.particleRadius);
    state.complete = false;
    state.paused = false;
    state.stats.frontier = 0;
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
        case "particleRadius":
        case "jitter":
            output.textContent = Number(value).toFixed(1);
            break;
        case "stickiness":
        case "inwardDrift":
        case "rotationSpeed":
        case "bloom":
            output.textContent = Number(value).toFixed(2);
            break;
        default:
            output.textContent = `${value}`;
            break;
    }
}

function updateReadout() {
    elements.particleCount.textContent = `${state.particles.length}`;
    elements.frontierCount.textContent = state.stats.frontier.toFixed(1);
    elements.armCount.textContent = `${state.params.arms}`;
    elements.statusReadout.textContent = getStatusLabel();
    elements.hudPreset.textContent = state.params.preset;
    elements.hudStatus.textContent = getStatusLabel().toLowerCase();

    if (elements.runToggle) {
        elements.runToggle.textContent = state.complete ? "Growth complete" : state.paused ? "Resume growth" : "Pause growth";
        elements.runToggle.disabled = state.complete;
    }
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
            p.strokeCap(p.ROUND);
        };

        p.draw = () => {
            advanceSimulation();
            drawBackdrop(p);
            p.push();
            p.translate(p.width / 2, p.height / 2);
            p.rotate(p.frameCount * state.params.rotationSpeed * 0.01);
            drawGuides(p);
            drawCluster(p);
            if (state.params.showWalker && state.current && !state.complete) {
                drawWalker(p);
            }
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

function advanceSimulation() {
    if (!state.current || state.complete || state.paused) {
        return;
    }

    for (let step = 0; step < state.params.stepsPerFrame; step += 1) {
        if (state.particles.length > 0 && state.current.intersects(state.particles, state.params)) {
            state.complete = true;
            return;
        }

        state.current.update(state.params);

        if (state.current.finished() || state.current.intersects(state.particles, state.params)) {
            attachCurrentParticle();

            if (state.particles.length >= state.params.maxParticles) {
                state.complete = true;
                return;
            }

            state.current = new Walker(state.params.spawnRadius, 0, state.params.particleRadius);
        }
    }
}

function attachCurrentParticle() {
    const settled = state.current.freeze();
    state.particles.push(settled);
    state.stats.frontier = Math.max(state.stats.frontier, magnitude(settled.pos));
}

function drawBackdrop(p) {
    p.background(224, 44, 8);

    for (let index = 0; index < 10; index += 1) {
        const glowY = p.map(index, 0, 9, p.height * 0.12, p.height * 0.92);
        const glowAlpha = p.map(index, 0, 9, 0.08, 0.02);
        p.noStroke();
        p.fill(208 + index * 2, 34, 18 + index * 4, glowAlpha);
        p.ellipse(p.width * 0.5, glowY, p.width * 1.18, p.height * 0.2);
    }

    p.fill((state.params.hueShift + 24) % 360, 22, 98, 0.08);
    p.circle(p.width * 0.17, p.height * 0.18, Math.min(p.width, p.height) * 0.16);
    p.fill((state.params.hueShift + 180) % 360, 18, 92, 0.08);
    p.circle(p.width * 0.84, p.height * 0.22, Math.min(p.width, p.height) * 0.14);
}

function drawGuides(p) {
    const wedgeAngle = Math.PI / state.params.arms;
    const guideHue = (state.params.hueShift + 28) % 360;

    p.noFill();
    p.stroke(guideHue, 18, 54, 0.18);
    p.strokeWeight(1);
    p.circle(0, 0, state.params.spawnRadius * 2);

    if (state.stats.frontier > 0) {
        p.stroke(guideHue, 24, 74, 0.14);
        p.circle(0, 0, state.stats.frontier * 2);
    }

    p.stroke(guideHue, 20, 78, 0.18);
    p.line(0, 0, state.params.spawnRadius, 0);
    p.push();
    p.rotate(wedgeAngle);
    p.line(0, 0, state.params.spawnRadius, 0);
    p.pop();
}

function drawCluster(p) {
    const rotationStep = (Math.PI * 2) / state.params.arms;
    const particleCount = Math.max(1, state.particles.length);

    for (let arm = 0; arm < state.params.arms; arm += 1) {
        const armOffset = arm * rotationStep;
        p.push();
        p.rotate(armOffset);
        drawWedgePoints(p, particleCount, false);
        p.scale(1, -1);
        drawWedgePoints(p, particleCount, false);
        p.pop();
    }
}

function drawWedgePoints(p, particleCount) {
    for (let index = 0; index < state.particles.length; index += 1) {
        const particle = state.particles[index];
        const ratio = magnitude(particle.pos) / Math.max(1, state.params.spawnRadius);
        const hue = (state.params.hueShift + ratio * 64 + index * 0.06) % 360;

        p.stroke(hue, 34 + ratio * 22, 100, state.params.bloom * 0.36);
        p.strokeWeight(particle.r * 4.4);
        p.point(particle.pos.x, particle.pos.y);

        p.stroke(hue, 52 + ratio * 18, 96 - ratio * 10, 0.96);
        p.strokeWeight(Math.max(1, particle.r * 1.65));
        p.point(particle.pos.x, particle.pos.y);
    }
}

function drawWalker(p) {
    const rotationStep = (Math.PI * 2) / state.params.arms;
    const walkerHue = (state.params.hueShift + 92) % 360;

    for (let arm = 0; arm < state.params.arms; arm += 1) {
        p.push();
        p.rotate(arm * rotationStep);
        drawWalkerPoint(p, walkerHue);
        p.scale(1, -1);
        drawWalkerPoint(p, walkerHue);
        p.pop();
    }
}

function drawWalkerPoint(p, walkerHue) {
    p.stroke(walkerHue, 44, 100, 0.24);
    p.strokeWeight(state.current.r * 5.6);
    p.point(state.current.pos.x, state.current.pos.y);
    p.stroke(walkerHue, 26, 100, 1);
    p.strokeWeight(Math.max(1.4, state.current.r * 2.3));
    p.point(state.current.pos.x, state.current.pos.y);
}

function getStatusLabel() {
    if (state.complete) {
        return "Complete";
    }

    if (state.paused) {
        return "Paused";
    }

    return "Growing";
}

function withResponsiveLimits(params) {
    const next = { ...params };
    if (isMobileViewport) {
        next.spawnRadius = Math.min(next.spawnRadius, 214);
        next.maxParticles = Math.min(next.maxParticles, 1000);
        next.stepsPerFrame = Math.min(next.stepsPerFrame, 24);
    }
    return next;
}

function getStageSize(host) {
    const width = Math.max(320, Math.floor(host.clientWidth));
    const height = window.innerWidth < 720 ? Math.max(430, Math.floor(width * 1.06)) : Math.max(620, Math.floor(width * 0.84));
    return { width, height };
}

function magnitude(vector) {
    return Math.hypot(vector.x, vector.y);
}

class Walker {
    constructor(radius, angle, particleRadius) {
        this.pos = vectorFromAngle(angle, radius);
        this.r = particleRadius;
    }

    update(params) {
        this.pos.x -= params.inwardDrift;
        this.pos.y += randomBetween(-params.jitter, params.jitter);

        const angle = clamp(Math.atan2(this.pos.y, this.pos.x), 0, Math.PI / params.arms);
        const mag = magnitude(this.pos);
        this.pos = vectorFromAngle(angle, mag);
    }

    intersects(cluster, params) {
        if (!cluster.length) {
            return false;
        }

        for (const settled of cluster) {
            const threshold = ((this.r + settled.r) * params.stickiness) / 2;
            if (distance(this.pos, settled.pos) < threshold) {
                return true;
            }
        }

        return false;
    }

    finished() {
        return this.pos.x < Math.max(1, this.r * 0.8);
    }

    freeze() {
        return {
            pos: { x: this.pos.x, y: this.pos.y },
            r: this.r,
        };
    }
}

function vectorFromAngle(angle, radius) {
    return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
    };
}

function distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

bindControls();
updateControlUI();
resetSimulation();
updateReadout();
createSketch();
window.addEventListener("pageshow", () => {
    if (!state.params.preset || !PRESETS[state.params.preset]) {
        state.params = { ...DEFAULT_STATE };
        resetSimulation();
    }
    updateControlUI();
    updateReadout();
});
