const BASE_ANCHOR_POINT = { x: 0, y: 10 };
const STEM_TRANSFORM = { role: "stem", weight: 0.01, a: 0, b: 0, c: 0, d: 0.16, e: 0, f: 0 };
const BASE_TRANSFORMS = [
    { role: "apex", weight: 0.85, a: 0.85, b: 0.04, c: -0.04, d: 0.85, e: 0, f: 1.6 },
    { role: "left", weight: 0.07, a: 0.2, b: -0.26, c: 0.23, d: 0.22, e: 0, f: 1.6 },
    { role: "right", weight: 0.07, a: -0.15, b: 0.28, c: 0.26, d: 0.24, e: 0, f: 0.44 },
];
const ROLE_ORDER = ["left", "apex", "right"];
const SCALE_LIMITS = {
    apex: { min: 0.78, max: 1.08 },
    left: { min: 0.65, max: 1.35 },
    right: { min: 0.65, max: 1.35 },
};
const DEFAULT_STATE = {
    hue: 132,
};
const TOTAL_POINTS = {
    desktop: 105000,
    mobile: 68000,
};
const TARGET_DURATION_MS = {
    desktop: 3000,
    mobile: 3400,
};

const DEFAULT_CONTROLS = Object.fromEntries(
    BASE_TRANSFORMS.map((transform) => [transform.role, applyTransform(transform, BASE_ANCHOR_POINT.x, BASE_ANCHOR_POINT.y)])
);

const state = {
    params: { ...DEFAULT_STATE },
    controls: cloneControls(DEFAULT_CONTROLS),
    dragRole: null,
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

    if (name === "hue") {
        output.textContent = `${state.params.hue}\u00b0`;
        return;
    }

    output.textContent = `${state.params[name]}`;
}

function requestReset() {
    state.resetRequested = true;
    state.sketch?.loop();
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
                return;
            }

            p.resizeCanvas(width, height);
            state.displaySize = { width, height };
            createLayer(p);
            resetSimulation(p);
            updateControlUI();
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
            p.frameRate(isCompactViewport() ? 44 : 50);
            state.sketch = p;
            state.displaySize = { width, height };
            createLayer(p);
            resetSimulation(p);

            if ("ResizeObserver" in window) {
                resizeObserver = new ResizeObserver(() => {
                    queueSyncStageSize();
                });
                resizeObserver.observe(host);
            }

            queueSyncStageSize();
        };

        p.draw = () => {
            if (state.resetRequested) {
                resetSimulation(p);
            }

            drawBackdrop(p);
            advanceSimulation(p);
            if (state.simulation?.layer) {
                p.image(state.simulation.layer, 0, 0, p.width, p.height);
            }
            drawGuides(p);
        };

        p.mousePressed = () => {
            const metrics = getModelViewport(p.width, p.height);
            state.dragRole = getHandleAtPointer(metrics, p.mouseX, p.mouseY);
            if (state.dragRole) {
                requestReset();
            }
        };

        p.mouseDragged = () => {
            if (!state.dragRole) {
                return;
            }

            const metrics = getModelViewport(p.width, p.height);
            const nextPoint = screenToModel(metrics, p.mouseX, p.mouseY);
            state.controls[state.dragRole] = nextPoint;
            state.controls = sanitizeControls(state.controls);
            requestReset();
        };

        p.mouseReleased = () => {
            state.dragRole = null;
        };

        p.windowResized = () => {
            queueSyncStageSize();
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

    state.controls = sanitizeControls(state.controls);
    const layer = state.simulation.layer;
    layer.clear();

    state.simulation = {
        layer,
        x: 0,
        y: 0,
        plotted: 0,
        startedAt: p.millis(),
        totalPoints: isCompactViewport() ? TOTAL_POINTS.mobile : TOTAL_POINTS.desktop,
        targetDuration: isCompactViewport() ? TARGET_DURATION_MS.mobile : TARGET_DURATION_MS.desktop,
        metrics: getModelViewport(layer.width, layer.height),
        cumulativeWeights: buildCumulativeWeights(buildFernTransforms(state.controls)),
    };

    setLayerStyle();
    state.resetRequested = false;
    state.sketch?.loop();
}

function drawBackdrop(p) {
    p.background(0, 0, 0);
}

function drawGuides(p) {
    const metrics = getModelViewport(p.width, p.height);
    const root = modelToScreen(metrics, { x: 0, y: 0 });
    const left = modelToScreen(metrics, state.controls.left);
    const apex = modelToScreen(metrics, state.controls.apex);
    const right = modelToScreen(metrics, state.controls.right);
    const hue = state.params.hue;

    p.push();
    p.stroke(hue, 22, 98, 0.16);
    p.strokeWeight(1.15);
    p.noFill();
    p.beginShape();
    p.vertex(root.x, root.y);
    p.vertex(left.x, left.y);
    p.vertex(apex.x, apex.y);
    p.endShape();
    p.beginShape();
    p.vertex(root.x, root.y);
    p.vertex(right.x, right.y);
    p.vertex(apex.x, apex.y);
    p.endShape();

    p.stroke(hue, 16, 90, 0.22);
    p.line(root.x, root.y, apex.x, apex.y);

    drawHandle(p, root.x, root.y, false, true, hue);
    ROLE_ORDER.forEach((role) => {
        const point = modelToScreen(metrics, state.controls[role]);
        drawHandle(p, point.x, point.y, state.dragRole === role, false, hue);
    });
    p.pop();
}

function drawHandle(p, x, y, active, fixed, hue) {
    const outerSize = fixed ? 10 : active ? 15 : 13;
    const innerSize = fixed ? 4.5 : active ? 6.5 : 5.5;

    p.noStroke();
    p.fill(hue, fixed ? 12 : 30, 96, fixed ? 0.28 : 0.18);
    p.circle(x, y, outerSize);
    p.fill(hue, fixed ? 18 : 56, 100, 0.98);
    p.circle(x, y, innerSize);
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
    const maxBatch = isCompactViewport() ? 760 : 1400;
    const minBatch = isCompactViewport() ? 90 : 220;
    let batch = Math.min(remaining, Math.max(minBatch, targetPoints - simulation.plotted), maxBatch);

    if (batch === 0 && progress < 1) {
        batch = 1;
    }

    const ctx = simulation.layer.drawingContext;
    const pointSize = isCompactViewport() ? 1.05 : 1.15;

    for (let index = 0; index < batch; index += 1) {
        const transform = pickTransform(simulation.cumulativeWeights, Math.random());
        const nextPoint = applyTransform(transform, simulation.x, simulation.y);
        simulation.x = nextPoint.x;
        simulation.y = nextPoint.y;

        const screenPoint = modelToScreen(simulation.metrics, nextPoint);
        if (
            screenPoint.x >= 0
            && screenPoint.x < simulation.layer.width
            && screenPoint.y >= 0
            && screenPoint.y < simulation.layer.height
        ) {
            ctx.fillRect(screenPoint.x | 0, screenPoint.y | 0, pointSize, pointSize);
        }
        simulation.plotted += 1;

        if (simulation.plotted >= simulation.totalPoints) {
            break;
        }
    }

    if (simulation.plotted >= simulation.totalPoints) {
        state.sketch?.noLoop();
    }
}

function buildFernTransforms(controls) {
    return [
        STEM_TRANSFORM,
        ...BASE_TRANSFORMS.map((baseTransform) => {
            const currentHandle = controls[baseTransform.role];
            const referenceHandle = DEFAULT_CONTROLS[baseTransform.role];
            const transformedMatrix = deriveRoleMatrix(baseTransform, referenceHandle, currentHandle);
            const anchorPoint = applyLinear(transformedMatrix, BASE_ANCHOR_POINT);

            return {
                role: baseTransform.role,
                weight: baseTransform.weight,
                ...transformedMatrix,
                e: currentHandle.x - anchorPoint.x,
                f: currentHandle.y - anchorPoint.y,
            };
        }),
    ];
}

function deriveRoleMatrix(baseTransform, referenceHandle, currentHandle) {
    const referenceAngle = Math.atan2(referenceHandle.y, referenceHandle.x);
    const currentAngle = Math.atan2(currentHandle.y, currentHandle.x);
    const deltaAngle = currentAngle - referenceAngle;
    const referenceLength = Math.hypot(referenceHandle.x, referenceHandle.y);
    const currentLength = Math.hypot(currentHandle.x, currentHandle.y);
    const limits = SCALE_LIMITS[baseTransform.role];
    const scale = clamp(currentLength / referenceLength, limits.min, limits.max);
    const cosAngle = Math.cos(deltaAngle);
    const sinAngle = Math.sin(deltaAngle);

    return {
        a: scale * (cosAngle * baseTransform.a - sinAngle * baseTransform.c),
        b: scale * (cosAngle * baseTransform.b - sinAngle * baseTransform.d),
        c: scale * (sinAngle * baseTransform.a + cosAngle * baseTransform.c),
        d: scale * (sinAngle * baseTransform.b + cosAngle * baseTransform.d),
    };
}

function applyLinear(transform, point) {
    return {
        x: transform.a * point.x + transform.b * point.y,
        y: transform.c * point.x + transform.d * point.y,
    };
}

function sanitizeControls(controls) {
    const nextControls = cloneControls(controls);

    nextControls.apex.x = clamp(nextControls.apex.x, -1.85, 1.85);
    nextControls.apex.y = clamp(nextControls.apex.y, 8.4, 12.6);

    const leftMaxX = Math.min(-0.8, nextControls.apex.x - 0.9);
    nextControls.left.x = clamp(nextControls.left.x, -5.3, leftMaxX);
    nextControls.left.y = clamp(nextControls.left.y, 2.2, nextControls.apex.y - 1.3);

    const rightMinX = Math.max(0.8, nextControls.apex.x + 0.9);
    nextControls.right.x = clamp(nextControls.right.x, rightMinX, 5.4);
    nextControls.right.y = clamp(nextControls.right.y, 1.4, nextControls.apex.y - 1.5);

    return nextControls;
}

function getHandleAtPointer(metrics, mouseX, mouseY) {
    const hitRadius = isCompactViewport() ? 20 : 18;

    for (const role of ROLE_ORDER) {
        const point = modelToScreen(metrics, state.controls[role]);
        if (Math.hypot(mouseX - point.x, mouseY - point.y) <= hitRadius) {
            return role;
        }
    }

    return null;
}

function getModelViewport(width, height) {
    return {
        rootX: width * 0.5,
        rootY: height * (isCompactViewport() ? 0.92 : 0.94),
        unitScale: Math.min(width * 0.09, height * 0.074),
    };
}

function modelToScreen(metrics, point) {
    return {
        x: metrics.rootX + point.x * metrics.unitScale,
        y: metrics.rootY - point.y * metrics.unitScale,
    };
}

function screenToModel(metrics, screenX, screenY) {
    return {
        x: (screenX - metrics.rootX) / metrics.unitScale,
        y: (metrics.rootY - screenY) / metrics.unitScale,
    };
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

function setLayerStyle() {
    if (!state.simulation?.layer) {
        return;
    }

    const { hue } = state.params;
    const context = state.simulation.layer.drawingContext;
    context.fillStyle = hsbToRgbaString(hue, 70, 100, 0.78);
    context.shadowColor = hsbToRgbaString(hue, 82, 100, 0.34);
    context.shadowBlur = isCompactViewport() ? 5 : 7;
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

function getFernRenderScale() {
    return isCompactViewport() ? 0.62 : 0.74;
}

function isCompactViewport() {
    return window.innerWidth < 960;
}

function cloneControls(controls) {
    return {
        apex: { ...controls.apex },
        left: { ...controls.left },
        right: { ...controls.right },
    };
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
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
