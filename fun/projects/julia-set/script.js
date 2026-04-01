const PHASE_PERIOD = Math.PI;
const TAU = Math.PI * 2;
const AUTO_DRIFT_SPEED = 0.18;
const PHASE_UI_UPDATE_INTERVAL = 4;
const PALETTE_SIZE = 512;
const STANDARD_POINT = {
    x: -0.5125,
    y: 0.5213,
};
const STANDARD_PHASE = (5 * Math.PI) / 8;

const DEFAULT_PARAMS = {
    phase: STANDARD_PHASE,
    radiusX: Math.abs(STANDARD_POINT.x) * Math.SQRT2,
    radiusY: Math.abs(STANDARD_POINT.y) * Math.SQRT2,
};

const DEFAULT_VIEW = {
    zoom: window.innerWidth < 960 ? 1.45 : 1.85,
    center: { x: 0, y: 0 },
};

const ZOOM_LIMITS = {
    min: 0.6,
    max: 10,
};

const state = {
    params: { ...DEFAULT_PARAMS },
    view: {
        zoom: DEFAULT_VIEW.zoom,
        center: { ...DEFAULT_VIEW.center },
    },
    phaseScrubbing: false,
    phaseDirection: 1,
    frameCount: 0,
    needsRender: true,
    dragActive: false,
    activePointers: new Map(),
    pinchActive: false,
    lastPinchDistance: 0,
    lastPinchMidpoint: null,
    displaySize: { width: 0, height: 0 },
    renderSize: { width: 0, height: 0 },
    host: null,
    canvas: null,
    context: null,
    imageData: null,
    paletteHue: 32,
    palette: buildPalette(PALETTE_SIZE, 32),
    resizeObserver: null,
    rafId: 0,
    lastTick: 0,
};

const elements = {
    stage: document.getElementById("julia-stage"),
    resetButton: document.querySelector("[data-reset-view]"),
};

const outputNodes = new Map(
    Array.from(document.querySelectorAll("[data-output-for]")).map((node) => [node.dataset.outputFor, node])
);

const controlNodes = new Map(
    Array.from(document.querySelectorAll("input[name]")).map((node) => [node.name, node])
);

bindControls();
createRenderer();
updateControlUI();
renderFrame();
startAnimation();

window.addEventListener("pageshow", () => {
    updateControlUI();
    state.needsRender = true;
});

window.addEventListener("beforeunload", () => {
    if (state.rafId) {
        window.cancelAnimationFrame(state.rafId);
    }
    state.resizeObserver?.disconnect();
});

function bindControls() {
    controlNodes.forEach((node, name) => {
        node.addEventListener("input", () => {
            state.params[name] = Number(node.value);
            if (name === "phase") {
                if (state.params.phase <= 0.001) {
                    state.phaseDirection = 1;
                } else if (state.params.phase >= PHASE_PERIOD - 0.001) {
                    state.phaseDirection = -1;
                }
            }
            updateControlOutput(name);
            state.needsRender = true;
        });
    });

    const phaseNode = controlNodes.get("phase");
    phaseNode?.addEventListener("pointerdown", () => {
        state.phaseScrubbing = true;
    });
    phaseNode?.addEventListener("focus", () => {
        state.phaseScrubbing = true;
    });
    phaseNode?.addEventListener("blur", () => {
        state.phaseScrubbing = false;
    });
    phaseNode?.addEventListener("change", () => {
        state.phaseScrubbing = false;
    });
    window.addEventListener("pointerup", () => {
        state.phaseScrubbing = false;
    });

    elements.resetButton?.addEventListener("click", () => {
        state.view = {
            zoom: DEFAULT_VIEW.zoom,
            center: { ...DEFAULT_VIEW.center },
        };
        state.needsRender = true;
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
        case "phase":
            output.textContent = `${(value / Math.PI).toFixed(2)}π`;
            break;
        case "radiusX":
        case "radiusY":
            output.textContent = Number(value).toFixed(3);
            break;
        default:
            output.textContent = `${value}`;
            break;
    }
}

function createRenderer() {
    const host = elements.stage;
    if (!host) {
        return;
    }

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    host.innerHTML = "";
    host.append(canvas);

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
        renderFallbackMessage(host);
        return;
    }

    context.imageSmoothingEnabled = false;
    state.host = host;
    state.canvas = canvas;
    state.context = context;

    syncCanvasSize();
    bindCanvasInteractions(canvas);

    if ("ResizeObserver" in window) {
        state.resizeObserver = new ResizeObserver(() => {
            syncCanvasSize();
            state.needsRender = true;
        });
        state.resizeObserver.observe(host);
    } else {
        window.addEventListener("resize", () => {
            syncCanvasSize();
            state.needsRender = true;
        });
    }
}

function bindCanvasInteractions(canvas) {
    canvas.addEventListener("pointerdown", (event) => {
        if (!state.canvas) {
            return;
        }

        state.activePointers.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
        });
        state.dragActive = state.activePointers.size === 1;
        state.pinchActive = state.activePointers.size >= 2;
        state.lastPointerX = event.clientX;
        state.lastPointerY = event.clientY;

        if (state.pinchActive) {
            const gesture = getPinchGesture();
            state.lastPinchDistance = gesture.distance;
            state.lastPinchMidpoint = gesture.midpoint;
        }

        canvas.setPointerCapture?.(event.pointerId);
        event.preventDefault();
    });

    canvas.addEventListener("pointermove", (event) => {
        if (!state.activePointers.has(event.pointerId)) {
            return;
        }

        state.activePointers.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
        });

        if (state.activePointers.size >= 2) {
            const gesture = getPinchGesture();
            if (gesture && state.lastPinchDistance > 0 && state.lastPinchMidpoint) {
                const zoomFactor = gesture.distance / state.lastPinchDistance;
                state.view.zoom = clamp(state.view.zoom * zoomFactor, ZOOM_LIMITS.min, ZOOM_LIMITS.max);

                const dx = gesture.midpoint.x - state.lastPinchMidpoint.x;
                const dy = gesture.midpoint.y - state.lastPinchMidpoint.y;
                applyPanDelta(dx, dy);
                state.lastPinchDistance = gesture.distance;
                state.lastPinchMidpoint = gesture.midpoint;
                state.needsRender = true;
            }
            event.preventDefault();
            return;
        }

        if (!state.dragActive) {
            return;
        }

        const dx = event.clientX - state.lastPointerX;
        const dy = event.clientY - state.lastPointerY;
        state.lastPointerX = event.clientX;
        state.lastPointerY = event.clientY;

        applyPanDelta(dx, dy);
        state.needsRender = true;
        event.preventDefault();
    });

    const releasePointer = (event) => {
        state.activePointers.delete(event.pointerId);
        state.pinchActive = state.activePointers.size >= 2;
        state.dragActive = state.activePointers.size === 1;

        if (state.pinchActive) {
            const gesture = getPinchGesture();
            state.lastPinchDistance = gesture.distance;
            state.lastPinchMidpoint = gesture.midpoint;
            return;
        }

        state.lastPinchDistance = 0;
        state.lastPinchMidpoint = null;

        const remaining = [...state.activePointers.values()][0];
        if (remaining) {
            state.lastPointerX = remaining.x;
            state.lastPointerY = remaining.y;
            return;
        }

        state.dragActive = false;
    };

    canvas.addEventListener("pointerup", releasePointer);
    canvas.addEventListener("pointercancel", releasePointer);
    canvas.addEventListener("lostpointercapture", releasePointer);

    canvas.addEventListener("wheel", (event) => {
        event.preventDefault();
        const factor = event.deltaY > 0 ? 0.92 : 1.08;
        state.view.zoom = clamp(state.view.zoom * factor, ZOOM_LIMITS.min, ZOOM_LIMITS.max);
        state.needsRender = true;
    }, { passive: false });
}

function syncCanvasSize() {
    if (!state.host || !state.canvas || !state.context) {
        return;
    }

    const displaySize = getStageSize(state.host);
    const renderSize = getRenderSize(displaySize.width, displaySize.height);

    state.displaySize = displaySize;

    if (state.renderSize.width === renderSize.width && state.renderSize.height === renderSize.height) {
        return;
    }

    state.renderSize = renderSize;
    state.canvas.width = renderSize.width;
    state.canvas.height = renderSize.height;
    state.context.imageSmoothingEnabled = false;
    state.imageData = state.context.createImageData(renderSize.width, renderSize.height);
}

function startAnimation() {
    state.lastTick = performance.now();

    const tick = (now) => {
        const targetFrameTime = 1000 / (isCompactViewport() ? 22 : 28);
        const elapsed = now - state.lastTick;

        if (elapsed >= targetFrameTime) {
            const deltaSeconds = Math.min(0.05, elapsed / 1000);
            state.lastTick = now;

            if (!state.phaseScrubbing) {
                state.params.phase = advancePhase(state.params.phase, AUTO_DRIFT_SPEED * deltaSeconds);
                if (state.frameCount % PHASE_UI_UPDATE_INTERVAL === 0) {
                    const phaseNode = controlNodes.get("phase");
                    if (phaseNode) {
                        phaseNode.value = `${state.params.phase}`;
                    }
                    updateControlOutput("phase");
                }
                state.needsRender = true;
            }

            if (state.needsRender) {
                renderFrame();
            }

            state.frameCount += 1;
        }

        state.rafId = window.requestAnimationFrame(tick);
    };

    state.rafId = window.requestAnimationFrame(tick);
}

function renderFrame() {
    if (!state.context || !state.imageData) {
        return;
    }

    const width = state.renderSize.width;
    const height = state.renderSize.height;
    if (!width || !height) {
        return;
    }

    const pixels = state.imageData.data;
    const palette = state.palette;
    const iterations = getAdaptiveIterations(state.view.zoom);
    const constant = getJuliaConstant();
    const aspect = state.displaySize.width / Math.max(state.displaySize.height, 1);
    const invZoom = 1 / state.view.zoom;
    const escapeRadiusSquared = 16;
    let offset = 0;

    for (let y = 0; y < height; y += 1) {
        const imaginary = state.view.center.y + (1 - ((y + 0.5) / height) * 2) * invZoom;

        for (let x = 0; x < width; x += 1) {
            let zx = state.view.center.x + ((((x + 0.5) / width) * 2) - 1) * aspect * invZoom;
            let zy = imaginary;
            let iteration = 0;
            let magnitudeSquared = 0;

            while (iteration < iterations) {
                const zxSquared = zx * zx;
                const zySquared = zy * zy;
                magnitudeSquared = zxSquared + zySquared;
                if (magnitudeSquared > escapeRadiusSquared) {
                    break;
                }

                zy = (2 * zx * zy) + constant.y;
                zx = (zxSquared - zySquared) + constant.x;
                iteration += 1;
            }

            if (iteration >= iterations) {
                pixels[offset] = 8;
                pixels[offset + 1] = 8;
                pixels[offset + 2] = 12;
                pixels[offset + 3] = 255;
                offset += 4;
                continue;
            }

            const magnitude = Math.sqrt(Math.max(magnitudeSquared, 1.000001));
            const smoothIteration = iteration + 1 - (Math.log(Math.log(magnitude)) / Math.LN2);
            const t = clamp(smoothIteration / iterations, 0, 1);
            const paletteIndex = Math.min(PALETTE_SIZE - 1, Math.floor(t * (PALETTE_SIZE - 1))) * 4;

            pixels[offset] = palette[paletteIndex];
            pixels[offset + 1] = palette[paletteIndex + 1];
            pixels[offset + 2] = palette[paletteIndex + 2];
            pixels[offset + 3] = 255;
            offset += 4;
        }
    }

    state.context.putImageData(state.imageData, 0, 0);
    state.needsRender = false;
}

function getJuliaConstant() {
    const theta = state.params.phase * 2;
    return {
        x: state.params.radiusX * Math.cos(theta),
        y: -state.params.radiusY * Math.sin(theta),
    };
}

function getAdaptiveIterations(zoom) {
    return Math.round(clamp(54 + 24 * Math.log2(zoom + 1), 54, isCompactViewport() ? 96 : 132));
}

function advancePhase(value, delta) {
    let nextValue = value + delta * state.phaseDirection;
    let bounced = false;

    if (nextValue >= PHASE_PERIOD) {
        nextValue = PHASE_PERIOD - (nextValue - PHASE_PERIOD);
        state.phaseDirection = -1;
        bounced = true;
    } else if (nextValue <= 0) {
        nextValue = Math.abs(nextValue);
        state.phaseDirection = 1;
        bounced = true;
    }

    if (bounced) {
        setPaletteHue(randomNeonHue());
    }

    return clamp(nextValue, 0, PHASE_PERIOD);
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

function getRenderSize(displayWidth, displayHeight) {
    const baseScale = isCompactViewport() ? 0.42 : 0.5;
    const maxPixels = isCompactViewport() ? 130000 : 210000;
    let width = Math.max(220, Math.floor(displayWidth * baseScale));
    let height = Math.max(220, Math.floor(displayHeight * baseScale));

    const pixelCount = width * height;
    if (pixelCount > maxPixels) {
        const scale = Math.sqrt(maxPixels / pixelCount);
        width = Math.max(220, Math.floor(width * scale));
        height = Math.max(220, Math.floor(height * scale));
    }

    return { width, height };
}

function buildPalette(size, baseHue) {
    const palette = new Uint8ClampedArray(size * 4);

    for (let index = 0; index < size; index += 1) {
        const t = index / Math.max(size - 1, 1);
        const offset = index * 4;
        const hue = (baseHue + 62 * t + 26 * Math.sin(TAU * (t + 0.12))) % 360;
        const saturation = clamp(0.72 + 0.22 * Math.sin(Math.PI * t), 0, 1);
        const value = clamp(0.14 + 0.96 * Math.pow(t, 0.72), 0, 1);
        const rgb = hsvToRgb(hue, saturation, value);
        palette[offset] = rgb.r;
        palette[offset + 1] = rgb.g;
        palette[offset + 2] = rgb.b;
        palette[offset + 3] = 255;
    }

    return palette;
}

function setPaletteHue(hue) {
    state.paletteHue = hue;
    state.palette = buildPalette(PALETTE_SIZE, hue);
    state.needsRender = true;
}

function toByte(value) {
    return Math.round(clamp(value, 0, 1) * 255);
}

function hsvToRgb(hue, saturation, value) {
    const chroma = value * saturation;
    const hueSection = (((hue % 360) + 360) % 360) / 60;
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

    const match = value - chroma;
    return {
        r: toByte(red + match),
        g: toByte(green + match),
        b: toByte(blue + match),
    };
}

function randomNeonHue() {
    return Math.floor(Math.random() * 360);
}

function applyPanDelta(dx, dy) {
    const aspect = state.displaySize.width / Math.max(state.displaySize.height, 1);
    state.view.center.x -= (dx / Math.max(state.displaySize.width, 1)) * (2 / state.view.zoom) * aspect;
    state.view.center.y += (dy / Math.max(state.displaySize.height, 1)) * (2 / state.view.zoom);
}

function getPinchGesture() {
    const pointers = [...state.activePointers.values()];
    if (pointers.length < 2) {
        return null;
    }

    const first = pointers[0];
    const second = pointers[1];
    return {
        distance: Math.hypot(second.x - first.x, second.y - first.y),
        midpoint: {
            x: (first.x + second.x) * 0.5,
            y: (first.y + second.y) * 0.5,
        },
    };
}

function renderFallbackMessage(host) {
    host.innerHTML = `
        <div class="canvas-fallback" role="status">
            The Julia renderer could not start on this browser.
        </div>
    `;
}

function isCompactViewport() {
    return window.innerWidth < 960;
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
