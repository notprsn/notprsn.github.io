const DEFAULT_STATE = {
    angleDeg: 22.5,
    branchRatio: 0.68,
    fullness: 5,
    breeze: true,
};

const FIXED_BREEZE_STRENGTH = 0.25;
const FIXED_THICKNESS_DECAY = 0.74;
const FULLNESS_TO_TWIG_LENGTH = [15.5, 14.2, 12.9, 11.6, 10.3, 9.1, 8.1, 7.1, 6.2];

const state = {
    params: { ...DEFAULT_STATE },
    sketch: null,
};

const elements = {
    stage: document.getElementById("tree-stage"),
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
    syncAnimationState(true);
});

function bindControls() {
    controlNodes.forEach((node, name) => {
        const eventName = node.type === "checkbox" ? "change" : "input";
        node.addEventListener(eventName, () => {
            state.params[name] = readControlValue(node);
            updateControlOutput(name);
            syncAnimationState(true);
        });
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
        case "angleDeg":
            output.textContent = `${Number(value).toFixed(2)}°`;
            break;
        case "branchRatio":
            output.textContent = Number(value).toFixed(2);
            break;
        case "breeze":
            output.textContent = value ? "On" : "Off";
            break;
        default:
            output.textContent = `${value}`;
            break;
    }
}

function createSketch() {
    const sketch = (p) => {
        let host;
        let resizeObserver;
        let syncQueued = false;

        const syncStageSize = () => {
            if (!host) {
                return;
            }

            const { width, height } = getStageSize(host);
            if (width === p.width && height === p.height) {
                if (!state.params.breeze) {
                    p.redraw();
                }
                return;
            }

            p.resizeCanvas(width, height);
            if (!state.params.breeze) {
                p.redraw();
            }
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
            p.frameRate(isCompactViewport() ? 36 : 42);
            state.sketch = p;

            if ("ResizeObserver" in window) {
                resizeObserver = new ResizeObserver(() => {
                    queueSyncStageSize();
                });
                resizeObserver.observe(host);
            }

            syncAnimationState(true);
            queueSyncStageSize();
        };

        p.draw = () => {
            const time = state.params.breeze ? p.frameCount * 0.022 : 0;
            drawBackdrop(p);
            drawTree(p, time);
        };

        p.windowResized = () => {
            queueSyncStageSize();
        };
    };

    new p5(sketch);
}

function drawBackdrop(p) {
    const glowSize = Math.min(p.width, p.height);

    p.background(0);
    p.noStroke();
    p.fill(28, 58, 12, 0.065);
    p.ellipse(p.width * 0.5, p.height * 0.64, glowSize * 0.9, glowSize * 1.04);
    p.fill(204, 24, 18, 0.035);
    p.ellipse(p.width * 0.62, p.height * 0.24, glowSize * 0.44, glowSize * 0.44);
    p.fill(22, 24, 10, 0.22);
    p.rect(0, p.height * 0.92, p.width, p.height * 0.08);
}

function drawTree(p, time) {
    const geometry = getTreeGeometry(p);

    p.push();
    p.translate(p.width * 0.5, p.height * 0.93);
    branch(p, geometry.rootLength, 0, geometry.initialThickness, time, geometry);
    p.pop();
}

function branch(p, len, depth, thickness, time, geometry) {
    const trunkHue = 26 + Math.min(depth * 1.8, 16);
    const trunkSat = 30 + Math.min(depth * 1.6, 18);
    const trunkBrightness = 32 + Math.min(depth * 3.4, 34);

    p.stroke(trunkHue, trunkSat, trunkBrightness, 0.94);
    p.strokeWeight(thickness);
    p.line(0, 0, 0, -len);
    p.translate(0, -len);

    if (len <= geometry.minLength) {
        drawLeaf(p, time, depth, geometry.leafSize);
        return;
    }

    const baseAngle = p.radians(state.params.angleDeg);
    const windOffset = geometry.breeze * p.sin(time + depth * 0.82) * (0.18 + depth * 0.05);
    const nextLength = len * state.params.branchRatio;
    const nextThickness = Math.max(0.8, thickness * FIXED_THICKNESS_DECAY);

    p.push();
    p.rotate(baseAngle + windOffset);
    branch(p, nextLength, depth + 1, nextThickness, time + 0.12, geometry);
    p.pop();

    p.push();
    p.rotate(-baseAngle + windOffset);
    branch(p, nextLength, depth + 1, nextThickness, time + 0.18, geometry);
    p.pop();
}

function drawLeaf(p, time, depth, size) {
    const leafHue = 118 + p.sin(time + depth * 0.48) * 4;

    p.noStroke();
    p.fill(leafHue, 38, 90, 0.38);
    p.ellipse(0, 0, size * 0.9, size * 1.3);
}

function getTreeGeometry(p) {
    const compact = isCompactViewport();
    const fullnessIndex = Math.max(0, Math.min(FULLNESS_TO_TWIG_LENGTH.length - 1, Math.round(state.params.fullness) - 1));
    const minDimension = Math.min(p.width, p.height);

    return {
        rootLength: minDimension * (compact ? 0.22 : 0.24),
        minLength: FULLNESS_TO_TWIG_LENGTH[fullnessIndex],
        initialThickness: Math.max(1.6, minDimension * 0.021),
        leafSize: compact ? 4.4 : 5.2,
        breeze: state.params.breeze ? FIXED_BREEZE_STRENGTH : 0,
    };
}

function syncAnimationState(forceRedraw = false) {
    const sketch = state.sketch;
    if (!sketch) {
        return;
    }

    if (state.params.breeze) {
        sketch.loop();
        return;
    }

    sketch.noLoop();
    if (forceRedraw) {
        sketch.redraw();
    }
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

function isCompactViewport() {
    return window.innerWidth < 960;
}
