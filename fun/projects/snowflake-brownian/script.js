const TAU = Math.PI * 2;
const FIXED_SPAWN_RADIUS = 248;
const TARGET_FRONTIER_RADIUS = 212;
const FIXED_ROTATION_SPEED = 0.6;
const FIXED_BLOOM = 0.2;

const DEFAULT_PARAMS = {
    arms: 6,
    particleRadius: 3.0,
    stickiness: 2.0,
    inwardDrift: 1.0,
    jitter: 3.0,
};

const state = {
    params: { ...DEFAULT_PARAMS },
    particles: [],
    current: null,
    palette: createPalette(),
    frontier: 0,
    complete: false,
    spatialIndex: new Map(),
    cellSize: 8,
    sceneScale: 1,
    sketch: null,
    layer: null,
    resizeObserver: null,
};

const elements = {
    stage: document.getElementById("brownian-stage"),
    resetButton: document.querySelector("[data-reset-sim]"),
};

const outputNodes = new Map(
    Array.from(document.querySelectorAll("[data-output-for]")).map((node) => [node.dataset.outputFor, node])
);

const controlNodes = new Map(
    Array.from(document.querySelectorAll("input[name]")).map((node) => [node.name, node])
);

function bindControls() {
    controlNodes.forEach((node, name) => {
        node.addEventListener("input", () => {
            state.params[name] = Number(node.value);
            updateControlOutput(name);
            resetSimulation();
        });
    });

    elements.resetButton?.addEventListener("click", () => {
        resetSimulation();
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

    const value = state.params[name];
    switch (name) {
        case "arms":
            output.textContent = `${Math.round(value)}`;
            break;
        default:
            output.textContent = Number(value).toFixed(1);
            break;
    }
}

function resetSimulation() {
    state.palette = createPalette();
    state.particles = [];
    state.frontier = 0;
    state.complete = false;
    state.cellSize = Math.max(6, state.params.particleRadius * state.params.stickiness * 1.6);
    state.spatialIndex = new Map();

    const seed = createSettledParticle(0, 0, state.params.particleRadius);
    addSettledParticle(seed);
    state.current = createWalker();

    clearLayer();
    redrawClusterLayer();
}

function createSketch() {
    const sketch = (p) => {
        let host;
        let syncQueued = false;

        const syncStageSize = () => {
            if (!host) {
                return;
            }

            const { width, height } = getStageSize(host);
            if (width === p.width && height === p.height) {
                return;
            }

            p.resizeCanvas(width, height);
            initializeLayer(p, width, height);
            redrawClusterLayer();
        };

        const queueSyncStageSize = () => {
            if (syncQueued) {
                return;
            }
            syncQueued = true;
            window.requestAnimationFrame(() => {
                syncQueued = false;
                syncStageSize();
            });
        };

        p.setup = () => {
            host = elements.stage;
            const { width, height } = getStageSize(host);
            const canvas = p.createCanvas(width, height);
            canvas.parent(host);
            p.pixelDensity(1);
            p.colorMode(p.HSB, 360, 100, 100, 1);
            p.frameRate(isCompactViewport() ? 42 : 50);
            p.strokeCap(p.ROUND);
            state.sketch = p;
            initializeLayer(p, width, height);

            if ("ResizeObserver" in window) {
                state.resizeObserver?.disconnect();
                state.resizeObserver = new ResizeObserver(() => {
                    queueSyncStageSize();
                });
                state.resizeObserver.observe(host);
            }

            queueSyncStageSize();
        };

        p.draw = () => {
            advanceSimulation();
            p.background(0);
            p.push();
            p.translate(p.width * 0.5, p.height * 0.5);
            p.rotate(p.frameCount * FIXED_ROTATION_SPEED * 0.01);
            p.imageMode(p.CENTER);
            if (state.layer) {
                p.image(state.layer, 0, 0, p.width, p.height);
            }
            if (state.current && !state.complete) {
                drawWalker(p);
            }
            p.pop();
        };

        p.windowResized = () => {
            queueSyncStageSize();
        };
    };

    new p5(sketch);
}

function initializeLayer(p, width, height) {
    state.sceneScale = Math.min(width, height) * (isCompactViewport() ? 0.35 : 0.38) / TARGET_FRONTIER_RADIUS;

    if (state.layer) {
        state.layer.remove();
    }

    state.layer = p.createGraphics(width, height);
    state.layer.pixelDensity(1);
    state.layer.clear();
    state.layer.colorMode(p.HSB, 360, 100, 100, 1);
    state.layer.strokeCap(p.ROUND);
    state.layer.noFill();
}

function clearLayer() {
    state.layer?.clear();
}

function redrawClusterLayer() {
    if (!state.layer) {
        return;
    }

    state.layer.clear();
    for (const particle of state.particles) {
        drawParticleSet(state.layer, particle, false, true);
    }
}

function advanceSimulation() {
    if (state.complete || !state.current) {
        return;
    }

    const startTime = performance.now();
    const timeBudget = isCompactViewport() ? 4.5 : 7.5;
    const maxSteps = isCompactViewport() ? 1600 : 2800;
    let steps = 0;

    while (!state.complete && steps < maxSteps && (performance.now() - startTime) < timeBudget) {
        state.current.update(state.params);

        if (walkerIntersectsCluster(state.current)) {
            addSettledParticle(state.current.freeze());
            drawParticleSet(state.layer, state.particles[state.particles.length - 1], false, true);

            if (state.frontier >= TARGET_FRONTIER_RADIUS || state.particles.length >= getHiddenParticleLimit()) {
                state.complete = true;
                state.current = null;
                break;
            }

            state.current = createWalker();
        } else if (state.current.isExpired()) {
            state.current = createWalker();
        }

        steps += 1;
    }
}

function addSettledParticle(particle) {
    state.particles.push(particle);
    insertParticle(particle);
    state.frontier = Math.max(state.frontier, magnitude(particle.pos));
}

function walkerIntersectsCluster(walker) {
    const threshold = state.params.particleRadius * state.params.stickiness;
    const nearby = getNearbyParticles(walker.pos);

    for (const particle of nearby) {
        if (distance(walker.pos, particle.pos) <= threshold) {
            return true;
        }
    }

    return false;
}

function insertParticle(particle) {
    const key = getGridKey(particle.pos.x, particle.pos.y);
    const bucket = state.spatialIndex.get(key);
    if (bucket) {
        bucket.push(particle);
        return;
    }

    state.spatialIndex.set(key, [particle]);
}

function getNearbyParticles(position) {
    const cellX = Math.floor(position.x / state.cellSize);
    const cellY = Math.floor(position.y / state.cellSize);
    const result = [];

    for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
            const bucket = state.spatialIndex.get(`${cellX + offsetX}:${cellY + offsetY}`);
            if (bucket) {
                result.push(...bucket);
            }
        }
    }

    return result;
}

function getGridKey(x, y) {
    return `${Math.floor(x / state.cellSize)}:${Math.floor(y / state.cellSize)}`;
}

function createWalker() {
    return new Walker(FIXED_SPAWN_RADIUS, 0, state.params.particleRadius);
}

function createSettledParticle(x, y, radius) {
    return {
        pos: { x, y },
        r: radius,
    };
}

function drawParticleSet(target, particle, isWalker, useAbsoluteCenter = false) {
    if (!target) {
        return;
    }

    const scaled = scalePoint(particle.pos);
    const ratio = clamp(magnitude(particle.pos) / TARGET_FRONTIER_RADIUS, 0, 1);
    const isSeed = Math.abs(particle.pos.x) < 0.0001 && Math.abs(particle.pos.y) < 0.0001;

    if (isSeed) {
        drawParticlePoint(target, scaled.x, scaled.y, particle.r, ratio, isWalker, useAbsoluteCenter);
        return;
    }

    const rotationStep = TAU / state.params.arms;
    for (let arm = 0; arm < state.params.arms; arm += 1) {
        const rotated = rotatePoint(scaled, arm * rotationStep);
        drawParticlePoint(target, rotated.x, rotated.y, particle.r, ratio, isWalker, useAbsoluteCenter);
        drawParticlePoint(target, rotated.x, -rotated.y, particle.r, ratio, isWalker, useAbsoluteCenter);
    }
}

function drawParticlePoint(target, x, y, radius, ratio, isWalker, useAbsoluteCenter) {
    const hue = (state.palette.baseHue + ratio * 28) % 360;
    const glowHue = (state.palette.glowHue + ratio * 16) % 360;
    const scaledRadius = radius * state.sceneScale;

    target.push();
    if (useAbsoluteCenter) {
        target.translate(target.width * 0.5, target.height * 0.5);
    }
    target.stroke(glowHue, 36 + ratio * 18, 100, isWalker ? 0.16 : FIXED_BLOOM * 0.42);
    target.strokeWeight(Math.max(1.2, scaledRadius * (isWalker ? 2.15 : 2.45)));
    target.point(x, y);

    target.stroke(hue, 48 + ratio * 18, isWalker ? 100 : 94 - ratio * 8, isWalker ? 0.78 : 0.96);
    target.strokeWeight(Math.max(1.2, scaledRadius * (isWalker ? 1.15 : 1.3)));
    target.point(x, y);
    target.pop();
}

function drawWalker(p) {
    drawParticleSet(p, state.current.freeze(), true, false);
}

function scalePoint(point) {
    return {
        x: point.x * state.sceneScale,
        y: point.y * state.sceneScale,
    };
}

function rotatePoint(point, angle) {
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    return {
        x: point.x * cosine - point.y * sine,
        y: point.x * sine + point.y * cosine,
    };
}

function getHiddenParticleLimit() {
    return isCompactViewport() ? 3200 : 5200;
}

function createPalette() {
    const baseHue = randomBetween(0, 360);
    const accentOffset = randomBetween(24, 60);
    return {
        baseHue,
        glowHue: (baseHue + accentOffset) % 360,
    };
}

function getStageSize(host) {
    const rect = host.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width || host.clientWidth));
    const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height
        ?? (window.innerWidth < 720 ? 108 : 69);
    const footerHeight = document.querySelector(".site-footer")?.getBoundingClientRect().height
        ?? (window.innerWidth < 720 ? 124 : 76);
    const main = host.closest(".fun-project-main");
    const mainStyles = main ? window.getComputedStyle(main) : null;
    const verticalPadding = mainStyles
        ? parseFloat(mainStyles.paddingTop || "0") + parseFloat(mainStyles.paddingBottom || "0")
        : 0;
    const availableHeight = Math.floor(window.innerHeight - headerHeight - footerHeight - verticalPadding - 6);
    const fallbackHeight = window.innerWidth < 960
        ? Math.max(430, Math.floor(width * 1.04))
        : Math.max(420, availableHeight);
    const measuredHeight = Math.floor(rect.height || host.clientHeight || 0);
    const height = Math.max(360, measuredHeight || fallbackHeight);
    return { width, height };
}

function magnitude(vector) {
    return Math.hypot(vector.x, vector.y);
}

function distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function isCompactViewport() {
    return window.innerWidth < 960;
}

class Walker {
    constructor(spawnRadius, wedgeAngle, particleRadius) {
        this.radius = spawnRadius;
        this.angle = wedgeAngle;
        this.r = particleRadius;
        this.updatePosition();
    }

    update(params) {
        const wedgeAngle = Math.PI / params.arms;
        this.pos.x -= params.inwardDrift;
        this.pos.y += randomBetween(-params.jitter, params.jitter);

        const clampedAngle = clamp(Math.atan2(this.pos.y, this.pos.x), 0, wedgeAngle);
        this.radius = magnitude(this.pos);
        this.angle = clampedAngle;
        this.updatePosition();
    }

    isExpired() {
        return this.radius <= this.r * 0.75;
    }

    freeze() {
        return createSettledParticle(this.pos.x, this.pos.y, this.r);
    }

    updatePosition() {
        this.pos = {
            x: Math.cos(this.angle) * this.radius,
            y: Math.sin(this.angle) * this.radius,
        };
    }
}

bindControls();
updateControlUI();
resetSimulation();
createSketch();

window.addEventListener("pageshow", () => {
    updateControlUI();
});
