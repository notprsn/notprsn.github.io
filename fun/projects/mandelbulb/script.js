const DETAIL_PRESETS = [
    {
        label: "Fluid",
        interaction: { scale: 0.10, maxSteps: 34, aoSamples: 0, epsilon: 0.0048, idleRows: 24 },
        motion: { scale: 0.13, maxSteps: 42, aoSamples: 0, epsilon: 0.0041, idleRows: 20 },
        idle: { scale: 0.18, maxSteps: 54, aoSamples: 1, epsilon: 0.0032, idleRows: 18 },
        caps: { desktop: 228, mobile: 164 },
    },
    {
        label: "Balanced",
        interaction: { scale: 0.12, maxSteps: 40, aoSamples: 0, epsilon: 0.0043, idleRows: 22 },
        motion: { scale: 0.16, maxSteps: 50, aoSamples: 1, epsilon: 0.0036, idleRows: 18 },
        idle: { scale: 0.24, maxSteps: 64, aoSamples: 2, epsilon: 0.0027, idleRows: 15 },
        caps: { desktop: 288, mobile: 208 },
    },
    {
        label: "Crisp",
        interaction: { scale: 0.14, maxSteps: 46, aoSamples: 1, epsilon: 0.0039, idleRows: 18 },
        motion: { scale: 0.20, maxSteps: 58, aoSamples: 1, epsilon: 0.0031, idleRows: 15 },
        idle: { scale: 0.30, maxSteps: 76, aoSamples: 2, epsilon: 0.0023, idleRows: 12 },
        caps: { desktop: 392, mobile: 256 },
    },
];

const CPU_TIER_SETTINGS = {
    interaction: {
        scale: window.innerWidth < 960 ? 0.25 : 0.2,
        maxSteps: 36,
        aoSamples: 0,
        epsilon: 0.0046,
        idleRows: 18,
        caps: { desktop: 300, mobile: 170 },
        tier: "interaction",
    },
    motion: {
        scale: window.innerWidth < 960 ? 0.33 : 0.26,
        maxSteps: 46,
        aoSamples: 0,
        epsilon: 0.0032,
        idleRows: 16,
        caps: { desktop: 390, mobile: 210 },
        tier: "motion",
    },
    idle: {
        scale: window.innerWidth < 960 ? 0.44 : 0.38,
        maxSteps: 92,
        aoSamples: 2,
        epsilon: 0.00142,
        idleRows: 16,
        caps: { desktop: 500, mobile: 280 },
        tier: "idle",
    },
};

const NEON_PALETTE_MIN_ANCHORS = 4;
const NEON_PALETTE_MAX_ANCHORS = 6;
const REFERENCE_DISTANCE = window.innerWidth < 960 ? 5.35 : 4.8;
const REFERENCE_PITCH_RANGE = {
    min: -0.62,
    max: 0.62,
};

const WEBGL_TIER_SETTINGS = {
    interaction: {
        scale: window.innerWidth < 960 ? 0.48 : 0.62,
        maxSteps: 52,
        aoSamples: 0,
        epsilon: 0.0031,
        caps: { desktop: 1280, mobile: 780 },
        tier: "interaction",
    },
    motion: {
        scale: window.innerWidth < 960 ? 0.68 : 0.82,
        maxSteps: 64,
        aoSamples: 1,
        epsilon: 0.0028,
        caps: { desktop: 1500, mobile: 980 },
        tier: "motion",
    },
    idle: {
        scale: window.innerWidth < 960 ? 0.88 : 1.0,
        maxSteps: 78,
        aoSamples: 2,
        epsilon: 0.0025,
        caps: { desktop: 1920, mobile: 1280 },
        tier: "idle",
    },
};

const DEFAULT_PARAMS = {};

const VIEW_LIMITS = {
    pitchMin: -1.05,
    pitchMax: 1.05,
    distanceMin: 2.35,
    distanceMax: 6.8,
};

const INTERACTION_TIER_WINDOW_MS = 180;
const IDLE_SETTLE_WINDOW_MS = 760;

const POWER = 8;
const MAX_BULB_ITER = 14;
const MAX_DIST = 10;
const BOUNDING_SPHERE_RADIUS = 1.82;
const CAMERA_LENS = 1.65;
const LIGHT_DIR_X = 0.7909116;
const LIGHT_DIR_Y = 0.5461068;
const LIGHT_DIR_Z = -0.3012997;
const WEBGL_CONTEXT_ATTRIBUTES = {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
};
const WEBGL_RELAXED_CONTEXT_ATTRIBUTES = {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
};
const WEBGL_CONTEXT_ATTEMPTS = [
    {
        label: "webgl-preferred",
        contextName: "webgl",
        attributes: WEBGL_CONTEXT_ATTRIBUTES,
    },
    {
        label: "webgl-relaxed",
        contextName: "webgl",
        attributes: WEBGL_RELAXED_CONTEXT_ATTRIBUTES,
    },
    {
        label: "webgl-default",
        contextName: "webgl",
        attributes: undefined,
    },
    {
        label: "experimental-webgl-preferred",
        contextName: "experimental-webgl",
        attributes: WEBGL_CONTEXT_ATTRIBUTES,
    },
    {
        label: "experimental-webgl-relaxed",
        contextName: "experimental-webgl",
        attributes: WEBGL_RELAXED_CONTEXT_ATTRIBUTES,
    },
    {
        label: "experimental-webgl-default",
        contextName: "experimental-webgl",
        attributes: undefined,
    },
];
const WEBGL_SHADER_PATHS = {
    vertex: new URL("mandelbulb.vert", window.location.href).href,
    fragment: new URL("mandelbulb.frag", window.location.href).href,
};
const WEBGL_LOG_PREFIX = "[mandelbulb-gl]";
const CPU_LOG_PREFIX = "[mandelbulb-cpu]";

const state = {
    params: { ...DEFAULT_PARAMS },
    view: buildReferenceView(),
    palette: createRandomNeonPalette(),
    paletteVersion: 0,
    displaySize: { width: 0, height: 0 },
    renderSize: { width: 0, height: 0 },
    stageHost: null,
    canvas: null,
    ctx: null,
    frameBuffer: null,
    dragging: false,
    lastPointer: { x: 0, y: 0 },
    lastInteractionAt: performance.now(),
    activeTier: "motion",
    resizeObserver: null,
    rafId: 0,
    fallbackShown: false,
    renderTask: null,
    rendererKind: null,
    gl: null,
    diagnostics: {
        attemptedWebGL: false,
        activeRenderer: "uninitialized",
        fallbackReason: null,
        lastError: null,
        environment: null,
        attempts: [],
    },
    rasterCache: {
        width: 0,
        height: 0,
        uvX: null,
        uvY: null,
    },
};

const elements = {
    stage: document.getElementById("mandelbulb-stage"),
    resetButton: document.querySelector("[data-reset-view]"),
};

const outputNodes = new Map(
    Array.from(document.querySelectorAll("[data-output-for]")).map((node) => [node.dataset.outputFor, node])
);

const controlNodes = new Map(
    Array.from(document.querySelectorAll("input[name]")).map((node) => [node.name, node])
);

const sampleScratch = new Float32Array(4);
const normalScratch = new Float32Array(3);
const paletteScratch = new Float32Array(3);
const shadowScratch = new Float32Array(3);
const accentScratch = new Float32Array(3);
const backgroundScratch = new Float32Array(3);
const backgroundAccentScratch = new Float32Array(3);

bindControls();
updateControlUI();
initialize();

window.addEventListener("pageshow", () => {
    updateControlUI();
    requestRender();
});

window.addEventListener("beforeunload", () => {
    state.resizeObserver?.disconnect();
    if (state.rafId) {
        window.cancelAnimationFrame(state.rafId);
    }
    cleanupWebGLRenderer();
});

function bindControls() {
    controlNodes.forEach((node, name) => {
        const eventName = node.type === "checkbox" ? "change" : "input";
        node.addEventListener(eventName, () => {
            state.params[name] = readControlValue(node);
            updateControlOutput(name);
            markInteraction();
            requestRender();
        });
    });

    elements.resetButton?.addEventListener("click", () => {
        state.palette = createRandomNeonPalette();
        state.paletteVersion += 1;
        state.view = buildReferenceView();
        markInteraction();
        requestRender();
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

    output.textContent = `${state.params[name]}`;
}

async function initialize() {
    if (!elements.stage) {
        return;
    }

    state.stageHost = elements.stage;
    initializeCpuRenderer("startup");
}

function createStageCanvas() {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    return canvas;
}

function initializeCpuRenderer(startReason = "startup", details = state.diagnostics.lastError) {
    logCpu("Initializing CPU fallback renderer", { reason: startReason, details });

    try {
        const canvas = createStageCanvas();

        let ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
        if (!ctx) {
            ctx = canvas.getContext("2d");
        }
        if (!ctx) {
            showFallback("This browser could not create a canvas renderer for the Mandelbulb.");
            return;
        }

        ctx.imageSmoothingEnabled = true;
        state.stageHost.innerHTML = "";
        state.stageHost.append(canvas);
        state.rendererKind = "cpu";
        state.canvas = canvas;
        state.ctx = ctx;
        state.gl = null;
        recordRendererStatus("cpu", startReason, details);
        state.displaySize = getStageSize(state.stageHost);
        syncCanvasResolution(getTierSettings(getQualityTier(performance.now())));
        bindStageInteractions(canvas);
        bindResizeObserver();
        requestRender();
    } catch (error) {
        logCpu("CPU renderer startup failed", error);
        showFallback("This browser could not start the Mandelbulb renderer.");
    }
}

function bindStageInteractions(canvas) {
    canvas.addEventListener("pointerdown", (event) => {
        if (state.fallbackShown) {
            return;
        }

        state.dragging = true;
        state.lastPointer.x = event.clientX;
        state.lastPointer.y = event.clientY;
        canvas.setPointerCapture?.(event.pointerId);
        state.stageHost?.classList.add("is-dragging");
        markInteraction();
        requestRender();
        event.preventDefault();
    });

    canvas.addEventListener("pointermove", (event) => {
        if (!state.dragging) {
            return;
        }

        const dx = event.clientX - state.lastPointer.x;
        const dy = event.clientY - state.lastPointer.y;
        state.lastPointer.x = event.clientX;
        state.lastPointer.y = event.clientY;

        state.view.yaw -= dx * 0.0085;
        state.view.pitch = clamp(state.view.pitch - dy * 0.0075, VIEW_LIMITS.pitchMin, VIEW_LIMITS.pitchMax);
        markInteraction();
        requestRender();
        event.preventDefault();
    });

    const releaseDrag = () => {
        if (!state.dragging) {
            return;
        }

        state.dragging = false;
        state.stageHost?.classList.remove("is-dragging");
        markInteraction();
        requestRender();
    };

    canvas.addEventListener("pointerup", releaseDrag);
    canvas.addEventListener("pointercancel", releaseDrag);
    window.addEventListener("pointerup", releaseDrag);

    canvas.addEventListener("wheel", (event) => {
        event.preventDefault();
        const factor = event.deltaY > 0 ? 1.085 : 0.92;
        state.view.distance = clamp(state.view.distance * factor, VIEW_LIMITS.distanceMin, VIEW_LIMITS.distanceMax);
        markInteraction();
        requestRender();
    }, { passive: false });
}

function logWebGL(message, details) {
    if (details === undefined) {
        console.info(WEBGL_LOG_PREFIX, message);
        return;
    }

    console.info(WEBGL_LOG_PREFIX, message, details);
}

function logCpu(message, details) {
    if (details === undefined) {
        console.info(CPU_LOG_PREFIX, message);
        return;
    }

    console.info(CPU_LOG_PREFIX, message, details);
}

function summarizeContextAttributes(attributes) {
    if (!attributes) {
        return "default";
    }

    return {
        alpha: Boolean(attributes.alpha),
        antialias: Boolean(attributes.antialias),
        depth: Boolean(attributes.depth),
        stencil: Boolean(attributes.stencil),
        premultipliedAlpha: Boolean(attributes.premultipliedAlpha),
        preserveDrawingBuffer: Boolean(attributes.preserveDrawingBuffer),
        powerPreference: attributes.powerPreference || "default",
    };
}

function recordRendererStatus(activeRenderer, reason, details = null) {
    state.diagnostics.activeRenderer = activeRenderer;
    state.diagnostics.fallbackReason = activeRenderer === "cpu" ? reason : null;
    state.diagnostics.lastError = details;
    window.__mandelbulbRendererDiagnostics = {
        ...state.diagnostics,
        details,
        timestamp: new Date().toISOString(),
    };
}

function probeWebGLEnvironment(canvas) {
    const support = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.userAgentData?.platform || navigator.platform || "unknown",
        devicePixelRatio: window.devicePixelRatio,
        hardwareConcurrency: navigator.hardwareConcurrency ?? null,
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol,
        webglRenderingContext: typeof window.WebGLRenderingContext !== "undefined",
        webgl2RenderingContext: typeof window.WebGL2RenderingContext !== "undefined",
    };

    try {
        const webgl2 = canvas.getContext("webgl2");
        support.webgl2ContextAttempt = Boolean(webgl2);
        if (webgl2?.getContextAttributes) {
            support.webgl2ContextAttributes = webgl2.getContextAttributes();
        }
        if (webgl2?.getExtension) {
            const loseContext = webgl2.getExtension("WEBGL_lose_context");
            loseContext?.loseContext();
        }
    } catch (error) {
        support.webgl2ContextAttempt = false;
        support.webgl2Error = String(error);
    }

    state.diagnostics.environment = support;
    recordRendererStatus(state.diagnostics.activeRenderer, state.diagnostics.fallbackReason, state.diagnostics.lastError);
    logWebGL("Environment probe", support);
    return support;
}

function getWebGLContext(canvas) {
    state.diagnostics.attempts = [];

    for (const attempt of WEBGL_CONTEXT_ATTEMPTS) {
        const attemptSummary = {
            label: attempt.label,
            contextName: attempt.contextName,
            attributes: summarizeContextAttributes(attempt.attributes),
        };

        try {
            const context = attempt.attributes === undefined
                ? canvas.getContext(attempt.contextName)
                : canvas.getContext(attempt.contextName, attempt.attributes);

            if (context) {
                attemptSummary.success = true;
                attemptSummary.actualAttributes = context.getContextAttributes?.() || null;
                state.diagnostics.attempts.push(attemptSummary);
                logWebGL("Acquired rendering context", attemptSummary);
                return context;
            }
        } catch (error) {
            attemptSummary.error = String(error);
        }

        attemptSummary.success = false;
        state.diagnostics.attempts.push(attemptSummary);
        logWebGL("Context acquisition attempt failed", attemptSummary);

        if (state.diagnostics.attempts.length >= 1) {
            recordRendererStatus(
                state.diagnostics.activeRenderer,
                state.diagnostics.fallbackReason,
                {
                    environment: state.diagnostics.environment,
                    attempts: state.diagnostics.attempts,
                }
            );
        }
    }

    return null;
}

async function loadShaderSource(label, url) {
    logWebGL("Loading shader source", { label, url });

    try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const source = await response.text();
        logWebGL("Shader source loaded", { label, bytes: source.length });
        return source;
    } catch (error) {
        logWebGL("Shader source load failed", { label, url, error: String(error) });
        return null;
    }
}

function compileWebGLShader(gl, type, source, label) {
    const shader = gl.createShader(type);
    if (!shader) {
        logWebGL("Shader allocation failed", { label });
        return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    const infoLog = gl.getShaderInfoLog(shader) || "";
    if (!compiled) {
        logWebGL("Shader compile failed", { label, infoLog });
        gl.deleteShader(shader);
        return null;
    }

    logWebGL("Shader compile succeeded", {
        label,
        infoLog: infoLog || "(empty)",
    });
    return shader;
}

function linkWebGLProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    if (!program) {
        logWebGL("Program allocation failed");
        return null;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    const infoLog = gl.getProgramInfoLog(program) || "";
    if (!linked) {
        logWebGL("Program link failed", { infoLog });
        gl.deleteProgram(program);
        return null;
    }

    logWebGL("Program link succeeded", {
        infoLog: infoLog || "(empty)",
    });
    return program;
}

function buildWebGLUniformMap(gl, program) {
    const names = [
        "u_resolution",
        "u_time",
        "u_cameraPos",
        "u_cameraTarget",
        "u_paletteA",
        "u_paletteB",
        "u_paletteC",
        "u_glowColor",
        "u_bgTop",
        "u_bgBottom",
        "u_lightDir",
        "u_maxSteps",
        "u_aoSamples",
        "u_surfaceEpsilon",
    ];

    const uniforms = {};
    for (const name of names) {
        uniforms[name] = gl.getUniformLocation(program, name);
        if (uniforms[name] === null) {
            logWebGL("Uniform missing or optimized out", { name });
        }
    }

    return uniforms;
}

function cleanupWebGLRenderer() {
    if (!state.gl) {
        return;
    }

    const glState = state.gl;
    const gl = glState.context;
    try {
        if (glState.quadBuffer) {
            gl.deleteBuffer(glState.quadBuffer);
        }
        if (glState.program) {
            gl.deleteProgram(glState.program);
        }
        if (glState.vertexShader) {
            gl.deleteShader(glState.vertexShader);
        }
        if (glState.fragmentShader) {
            gl.deleteShader(glState.fragmentShader);
        }
    } catch (error) {
        logWebGL("Cleanup encountered an error", String(error));
    }

    state.gl = null;
    if (state.rendererKind === "gl") {
        state.rendererKind = null;
        state.canvas = null;
        state.ctx = null;
    }
}

function switchToCpuRenderer(reason, details = null) {
    if (state.rendererKind === "cpu" || state.fallbackShown) {
        return;
    }

    logWebGL("Switching to CPU fallback", { reason, details });
    state.dragging = false;
    state.stageHost?.classList.remove("is-dragging");
    recordRendererStatus("cpu", reason, details);
    cleanupWebGLRenderer();
    initializeCpuRenderer(reason, details);
}

async function initializeWebGLRenderer() {
    if (!state.stageHost) {
        return false;
    }

    state.diagnostics.attemptedWebGL = true;
    logWebGL("Attempting WebGL renderer startup");

    try {
        const canvas = createStageCanvas();
        probeWebGLEnvironment(canvas);
        const gl = getWebGLContext(canvas);
        if (!gl) {
            state.diagnostics.fallbackReason = "context-unavailable";
            state.diagnostics.lastError = {
                environment: state.diagnostics.environment,
                attempts: state.diagnostics.attempts,
            };
            recordRendererStatus("cpu", "context-unavailable", state.diagnostics.lastError);
            logWebGL("WebGL context unavailable", state.diagnostics.lastError);
            return false;
        }

        canvas.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            switchToCpuRenderer("context-lost");
        }, { once: true });
        canvas.addEventListener("webglcontextrestored", () => {
            logWebGL("Context restored event fired");
        });

        const precision = gl.getShaderPrecisionFormat
            ? gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)
            : null;
        logWebGL("Fragment highp precision report", precision
            ? { precision: precision.precision, rangeMin: precision.rangeMin, rangeMax: precision.rangeMax }
            : { precision: 0, rangeMin: 0, rangeMax: 0 });

        if (!precision || precision.precision === 0) {
            state.diagnostics.fallbackReason = "fragment-highp-unavailable";
            state.diagnostics.lastError = {
                environment: state.diagnostics.environment,
                attempts: state.diagnostics.attempts,
                precision: precision
                    ? { precision: precision.precision, rangeMin: precision.rangeMin, rangeMax: precision.rangeMax }
                    : null,
            };
            logWebGL("Fragment highp float unavailable; refusing WebGL path");
            return false;
        }

        const [vertexSource, fragmentSource] = await Promise.all([
            loadShaderSource("vertex", WEBGL_SHADER_PATHS.vertex),
            loadShaderSource("fragment", WEBGL_SHADER_PATHS.fragment),
        ]);

        if (!vertexSource || !fragmentSource) {
            state.diagnostics.fallbackReason = "shader-fetch-failed";
            return false;
        }

        const vertexShader = compileWebGLShader(gl, gl.VERTEX_SHADER, vertexSource, "vertex");
        if (!vertexShader) {
            state.diagnostics.fallbackReason = "vertex-compile-failed";
            return false;
        }

        const fragmentShader = compileWebGLShader(gl, gl.FRAGMENT_SHADER, fragmentSource, "fragment");
        if (!fragmentShader) {
            gl.deleteShader(vertexShader);
            state.diagnostics.fallbackReason = "fragment-compile-failed";
            return false;
        }

        const program = linkWebGLProgram(gl, vertexShader, fragmentShader);
        if (!program) {
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            state.diagnostics.fallbackReason = "program-link-failed";
            return false;
        }

        const quadBuffer = gl.createBuffer();
        if (!quadBuffer) {
            gl.deleteProgram(program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            state.diagnostics.fallbackReason = "quad-buffer-failed";
            return false;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                -1, -1,
                1, -1,
                -1, 1,
                -1, 1,
                1, -1,
                1, 1,
            ]),
            gl.STATIC_DRAW
        );

        const positionLocation = gl.getAttribLocation(program, "a_position");
        if (positionLocation < 0) {
            gl.deleteBuffer(quadBuffer);
            gl.deleteProgram(program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            state.diagnostics.fallbackReason = "missing-position-attribute";
            logWebGL("Required attribute a_position is missing");
            return false;
        }

        state.stageHost.innerHTML = "";
        state.stageHost.append(canvas);
        state.rendererKind = "gl";
        state.canvas = canvas;
        state.ctx = null;
        state.gl = {
            context: gl,
            program,
            vertexShader,
            fragmentShader,
            quadBuffer,
            positionLocation,
            uniforms: buildWebGLUniformMap(gl, program),
            firstFrameComplete: false,
        };
        recordRendererStatus("webgl", "startup-success", {
            precision: precision.precision,
            contextAttributes: WEBGL_CONTEXT_ATTRIBUTES,
        });

        state.displaySize = getStageSize(state.stageHost);
        syncCanvasResolution(getTierSettings(getQualityTier(performance.now())));
        bindStageInteractions(canvas);
        bindResizeObserver();
        requestRender();

        logWebGL("WebGL renderer ready", {
            width: state.displaySize.width,
            height: state.displaySize.height,
        });
        return true;
    } catch (error) {
        state.diagnostics.fallbackReason = "startup-exception";
        state.diagnostics.lastError = String(error);
        logWebGL("WebGL startup threw", String(error));
        cleanupWebGLRenderer();
        return false;
    }
}

function bindResizeObserver() {
    const host = state.stageHost;
    if (!host) {
        return;
    }

    let syncQueued = false;
    const syncStageSize = () => {
        if (!host || state.fallbackShown) {
            return;
        }

        const nextDisplaySize = getStageSize(host);
        if (nextDisplaySize.width !== state.displaySize.width || nextDisplaySize.height !== state.displaySize.height) {
            state.displaySize = nextDisplaySize;
            state.renderTask = null;
            syncCanvasResolution(getTierSettings(getQualityTier(performance.now())));
            requestRender();
        }
    };

    const queue = () => {
        if (syncQueued) {
            return;
        }

        syncQueued = true;
        window.requestAnimationFrame(() => {
            syncQueued = false;
            syncStageSize();
        });
    };

    state.resizeObserver?.disconnect();

    if ("ResizeObserver" in window) {
        state.resizeObserver = new ResizeObserver(queue);
        state.resizeObserver.observe(host);
    } else {
        window.addEventListener("resize", queue);
    }
}

function markInteraction() {
    state.lastInteractionAt = performance.now();
    state.renderTask = null;
}

function hasActiveRenderer() {
    return Boolean(
        (state.rendererKind === "gl" && state.gl?.context && state.canvas)
        || (state.rendererKind === "cpu" && state.ctx && state.canvas)
    );
}

function requestRender() {
    if (state.fallbackShown || !hasActiveRenderer() || state.rafId) {
        return;
    }

    state.rafId = window.requestAnimationFrame(renderLoop);
}

function renderLoop(now) {
    state.rafId = 0;
    if (state.fallbackShown || !hasActiveRenderer() || !state.canvas) {
        return;
    }

    const tier = getQualityTier(now);
    const tierSettings = getTierSettings(tier);

    syncCanvasResolution(tierSettings);

    if (state.rendererKind === "gl") {
        renderWebGLFrame(tierSettings, now);
    } else if (tierSettings.tier === "idle") {
        renderIdleFrame(tierSettings, now);
    } else {
        state.renderTask = null;
        renderImmediateFrame(tierSettings, now);
    }

    if (
        state.dragging
        || now - state.lastInteractionAt < IDLE_SETTLE_WINDOW_MS
        || (state.rendererKind === "cpu" && state.renderTask)
    ) {
        requestRender();
    }
}

function getQualityTier(now) {
    if (state.dragging || now - state.lastInteractionAt < INTERACTION_TIER_WINDOW_MS) {
        return "interaction";
    }

    if (now - state.lastInteractionAt < IDLE_SETTLE_WINDOW_MS) {
        return "motion";
    }

    return "idle";
}

function getTierSettings(tier) {
    return CPU_TIER_SETTINGS[tier];
}

function syncCanvasResolution(tierSettings) {
    if (!state.canvas) {
        return;
    }

    if (state.rendererKind === "gl") {
        syncWebGLResolution(tierSettings);
        return;
    }

    if (!state.ctx) {
        return;
    }

    const displaySize = state.displaySize.width > 0 ? state.displaySize : getStageSize(state.stageHost);
    state.displaySize = displaySize;
    const nextRenderSize = getRenderSize(displaySize.width, displaySize.height, tierSettings);

    if (
        state.renderSize.width === nextRenderSize.width
        && state.renderSize.height === nextRenderSize.height
        && state.activeTier === tierSettings.tier
        && state.frameBuffer
    ) {
        return;
    }

    state.activeTier = tierSettings.tier;
    state.renderSize = nextRenderSize;
    state.canvas.width = nextRenderSize.width;
    state.canvas.height = nextRenderSize.height;
    state.frameBuffer = state.ctx.createImageData(nextRenderSize.width, nextRenderSize.height);
    syncRasterCache(nextRenderSize.width, nextRenderSize.height);
    state.renderTask = null;
}

function syncWebGLResolution(tierSettings) {
    if (!state.canvas || !state.gl?.context) {
        return;
    }

    const displaySize = state.displaySize.width > 0 ? state.displaySize : getStageSize(state.stageHost);
    state.displaySize = displaySize;
    const nextRenderSize = getRenderSize(displaySize.width, displaySize.height, tierSettings);

    if (
        state.renderSize.width === nextRenderSize.width
        && state.renderSize.height === nextRenderSize.height
        && state.activeTier === tierSettings.tier
    ) {
        return;
    }

    state.activeTier = tierSettings.tier;
    state.renderSize = nextRenderSize;
    state.canvas.width = nextRenderSize.width;
    state.canvas.height = nextRenderSize.height;
    state.gl.context.viewport(0, 0, nextRenderSize.width, nextRenderSize.height);
    state.renderTask = null;
}

function renderImmediateFrame(tierSettings, now) {
    const frameConfig = createFrameConfig(tierSettings, now);
    renderRows(frameConfig, state.frameBuffer.data, 0, state.renderSize.height);
    drawFrameBuffer();
}

function renderIdleFrame(tierSettings, now) {
    const signature = createFrameSignature(tierSettings);
    if (!state.renderTask || state.renderTask.signature !== signature) {
        state.renderTask = {
            signature,
            nextRow: 0,
            frameConfig: createFrameConfig(tierSettings, now),
            buffer: state.ctx.createImageData(state.renderSize.width, state.renderSize.height),
        };
    }

    const endRow = Math.min(state.renderSize.height, state.renderTask.nextRow + tierSettings.idleRows);
    renderRows(state.renderTask.frameConfig, state.renderTask.buffer.data, state.renderTask.nextRow, endRow);
    state.renderTask.nextRow = endRow;

    if (state.renderTask.nextRow >= state.renderSize.height) {
        state.frameBuffer = state.renderTask.buffer;
        drawFrameBuffer();
        state.renderTask = null;
    }
}

function renderWebGLFrame(tierSettings, now) {
    if (!state.gl?.context || !state.canvas) {
        return;
    }

    const glState = state.gl;
    const gl = glState.context;
    const frameConfig = createFrameConfig(tierSettings, now);
    const paletteUniforms = buildWebGLPaletteUniforms(frameConfig.palette);

    gl.useProgram(glState.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, glState.quadBuffer);
    gl.enableVertexAttribArray(glState.positionLocation);
    gl.vertexAttribPointer(glState.positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.viewport(0, 0, state.renderSize.width, state.renderSize.height);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);

    setWebGLUniformVec2(gl, glState.uniforms.u_resolution, state.renderSize.width, state.renderSize.height);
    setWebGLUniformFloat(gl, glState.uniforms.u_time, frameConfig.time);
    setWebGLUniformVec3(gl, glState.uniforms.u_cameraPos, frameConfig.cameraPos);
    setWebGLUniformVec3(gl, glState.uniforms.u_cameraTarget, frameConfig.target);
    setWebGLUniformVec3(gl, glState.uniforms.u_paletteA, paletteUniforms.paletteA);
    setWebGLUniformVec3(gl, glState.uniforms.u_paletteB, paletteUniforms.paletteB);
    setWebGLUniformVec3(gl, glState.uniforms.u_paletteC, paletteUniforms.paletteC);
    setWebGLUniformVec3(gl, glState.uniforms.u_glowColor, paletteUniforms.glow);
    setWebGLUniformVec3(gl, glState.uniforms.u_bgTop, paletteUniforms.bgTop);
    setWebGLUniformVec3(gl, glState.uniforms.u_bgBottom, paletteUniforms.bgBottom);
    setWebGLUniformVec3(gl, glState.uniforms.u_lightDir, [LIGHT_DIR_X, LIGHT_DIR_Y, LIGHT_DIR_Z]);
    setWebGLUniformInt(gl, glState.uniforms.u_maxSteps, tierSettings.maxSteps);
    setWebGLUniformInt(gl, glState.uniforms.u_aoSamples, tierSettings.aoSamples);
    setWebGLUniformFloat(gl, glState.uniforms.u_surfaceEpsilon, tierSettings.epsilon);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    const errorCode = glState.firstFrameComplete ? gl.NO_ERROR : gl.getError();
    if (errorCode !== gl.NO_ERROR) {
        switchToCpuRenderer("draw-error", {
            errorCode,
            tier: tierSettings.tier,
            width: state.renderSize.width,
            height: state.renderSize.height,
        });
        return;
    }

    if (!glState.firstFrameComplete) {
        glState.firstFrameComplete = true;
        logWebGL("First frame drawn", {
            tier: tierSettings.tier,
            width: state.renderSize.width,
            height: state.renderSize.height,
            maxSteps: tierSettings.maxSteps,
            aoSamples: tierSettings.aoSamples,
        });
    }
}

function buildWebGLPaletteUniforms(palette) {
    samplePalette(0.08, palette, paletteScratch);
    samplePalette(0.42, palette, shadowScratch);
    samplePalette(0.78, palette, accentScratch);
    samplePalette(0.18, palette, backgroundScratch);
    samplePalette(0.56, palette, backgroundAccentScratch);

    return {
        paletteA: [paletteScratch[0], paletteScratch[1], paletteScratch[2]],
        paletteB: [shadowScratch[0], shadowScratch[1], shadowScratch[2]],
        paletteC: [accentScratch[0], accentScratch[1], accentScratch[2]],
        glow: [palette.glow[0], palette.glow[1], palette.glow[2]],
        bgTop: [
            mix(backgroundScratch[0] * 0.18, palette.glow[0] * 0.12, 0.35),
            mix(backgroundScratch[1] * 0.18, palette.glow[1] * 0.12, 0.35),
            mix(backgroundScratch[2] * 0.18, palette.glow[2] * 0.12, 0.35),
        ],
        bgBottom: [
            backgroundAccentScratch[0] * 0.05,
            backgroundAccentScratch[1] * 0.05,
            backgroundAccentScratch[2] * 0.05,
        ],
    };
}

function setWebGLUniformFloat(gl, location, value) {
    if (location !== null) {
        gl.uniform1f(location, value);
    }
}

function setWebGLUniformInt(gl, location, value) {
    if (location !== null) {
        gl.uniform1i(location, value);
    }
}

function setWebGLUniformVec2(gl, location, x, y) {
    if (location !== null) {
        gl.uniform2f(location, x, y);
    }
}

function setWebGLUniformVec3(gl, location, vector) {
    if (location !== null) {
        gl.uniform3f(location, vector[0], vector[1], vector[2]);
    }
}

function createFrameSignature(tierSettings) {
    return [
        tierSettings.tier,
        state.renderSize.width,
        state.renderSize.height,
        state.paletteVersion,
        Number(state.view.yaw).toFixed(3),
        Number(state.view.pitch).toFixed(3),
        Number(state.view.distance).toFixed(3),
    ].join("|");
}

function createFrameConfig(tierSettings, now) {
    const palette = buildNeonPalette();
    const cameraPos = getCameraPosition();
    const targetX = 0;
    const targetY = 0.05;
    const targetZ = 0;

    const forward = normalize3(
        targetX - cameraPos[0],
        targetY - cameraPos[1],
        targetZ - cameraPos[2]
    );

    let right = normalize3(forward[2], 0, -forward[0]);
    if (Math.abs(right[0]) + Math.abs(right[1]) + Math.abs(right[2]) < 1e-4) {
        right = [1, 0, 0];
    }
    const up = normalize3(
        forward[1] * right[2] - forward[2] * right[1],
        forward[2] * right[0] - forward[0] * right[2],
        forward[0] * right[1] - forward[1] * right[0]
    );

    return {
        width: state.renderSize.width,
        height: state.renderSize.height,
        maxSteps: tierSettings.maxSteps,
        aoSamples: tierSettings.aoSamples,
        epsilon: tierSettings.epsilon,
        normalEpsilon: tierSettings.tier === "idle"
            ? Math.max(0.00105, tierSettings.epsilon * 0.72)
            : Math.max(0.0017, tierSettings.epsilon * 1.08),
        time: now * 0.001,
        cameraPos,
        target: [targetX, targetY, targetZ],
        forward,
        right,
        up,
        palette,
        simplifiedShading: tierSettings.tier !== "idle",
    };
}

function drawFrameBuffer() {
    if (!state.ctx || !state.frameBuffer) {
        return;
    }

    state.ctx.putImageData(state.frameBuffer, 0, 0);
}

function renderRows(frameConfig, pixels, rowStart, rowEnd) {
    const width = frameConfig.width;
    const height = frameConfig.height;
    const cache = state.rasterCache;
    const uvXValues = cache.uvX;
    const uvYValues = cache.uvY;
    const rox = frameConfig.cameraPos[0];
    const roy = frameConfig.cameraPos[1];
    const roz = frameConfig.cameraPos[2];
    const fx = frameConfig.forward[0];
    const fy = frameConfig.forward[1];
    const fz = frameConfig.forward[2];
    const rx = frameConfig.right[0];
    const ry = frameConfig.right[1];
    const rz = frameConfig.right[2];
    const ux = frameConfig.up[0];
    const uy = frameConfig.up[1];
    const uz = frameConfig.up[2];
    const palette = frameConfig.palette;
    const glow = palette.glow;
    const lensFx = fx * CAMERA_LENS;
    const lensFy = fy * CAMERA_LENS;
    const lensFz = fz * CAMERA_LENS;
    const simplifiedShading = frameConfig.simplifiedShading;

    for (let y = rowStart; y < rowEnd; y += 1) {
        const uvY = uvYValues[y];
        const rowBaseX = lensFx + ux * uvY;
        const rowBaseY = lensFy + uy * uvY;
        const rowBaseZ = lensFz + uz * uvY;
        for (let x = 0; x < width; x += 1) {
            const uvX = uvXValues[x];
            const rayDirX = rowBaseX + rx * uvX;
            const rayDirY = rowBaseY + ry * uvX;
            const rayDirZ = rowBaseZ + rz * uvX;
            const rayInvLength = 1 / (Math.sqrt(rayDirX * rayDirX + rayDirY * rayDirY + rayDirZ * rayDirZ) || 1);
            const rdx = rayDirX * rayInvLength;
            const rdy = rayDirY * rayInvLength;
            const rdz = rayDirZ * rayInvLength;

            let r = 0;
            let g = 0;
            let b = 0;

            const hit = rayMarch(
                rox, roy, roz,
                rdx, rdy, rdz,
                frameConfig.maxSteps,
                frameConfig.epsilon
            );

            if (hit.hit) {
                const hitX = rox + rdx * hit.distance;
                const hitY = roy + rdy * hit.distance;
                const hitZ = roz + rdz * hit.distance;
                estimateNormal(hitX, hitY, hitZ, frameConfig.normalEpsilon, normalScratch);
                const normalX = normalScratch[0];
                const normalY = normalScratch[1];
                const normalZ = normalScratch[2];
                const ao = frameConfig.aoSamples > 0
                    ? ambientOcclusion(hitX, hitY, hitZ, normalX, normalY, normalZ, frameConfig.aoSamples)
                    : 1;
                const diffuse = Math.max(dot3(normalX, normalY, normalZ, LIGHT_DIR_X, LIGHT_DIR_Y, LIGHT_DIR_Z), 0);
                const fill = 0.5 + 0.5 * normalY;
                const facing = Math.max(dot3(normalX, normalY, normalZ, -rdx, -rdy, -rdz), 0);
                const rim = Math.pow(clamp01(1 - facing), 2.8);
                const heightSignal = clamp01(0.5 + 0.5 * normalY);
                if (simplifiedShading) {
                    const signal = clamp01(
                        hit.iterSignal * 0.62
                        + hit.trapSignal * 0.23
                        + heightSignal * 0.15
                    );
                    samplePalette(signal, palette, paletteScratch);
                    const baseR = paletteScratch[0];
                    const baseG = paletteScratch[1];
                    const baseB = paletteScratch[2];
                    const lightStrength = (0.2 + 0.58 * diffuse + 0.16 * fill) * ao;
                    const rimStrength = 0.05 + 0.18 * rim;
                    const glowStrength = 0.06 + 0.12 * (1 - ao);

                    r = baseR * lightStrength + glow[0] * (rimStrength + glowStrength);
                    g = baseG * lightStrength + glow[1] * (rimStrength + glowStrength);
                    b = baseB * lightStrength + glow[2] * (rimStrength + glowStrength);

                    r = Math.pow(clamp01(r), 0.9);
                    g = Math.pow(clamp01(g), 0.9);
                    b = Math.pow(clamp01(b), 0.9);
                } else {
                    const fresnel = Math.pow(1 - facing, 2.2);
                    const lightDot = 2 * dot3(-LIGHT_DIR_X, -LIGHT_DIR_Y, -LIGHT_DIR_Z, normalX, normalY, normalZ);
                    const reflectedX = -LIGHT_DIR_X - lightDot * normalX;
                    const reflectedY = -LIGHT_DIR_Y - lightDot * normalY;
                    const reflectedZ = -LIGHT_DIR_Z - lightDot * normalZ;
                    const specular = Math.pow(Math.max(dot3(reflectedX, reflectedY, reflectedZ, -rdx, -rdy, -rdz), 0), 26);
                    const band = 0.5 + 0.5 * Math.sin(hit.iterSignal * 14 + hit.trapSignal * 8 + hitY * 2.4 + frameConfig.time * 0.15);
                    const contour = 0.5 + 0.5 * Math.sin((hitX + hitZ) * 3.4 + hit.trapSignal * 6);
                    const signal = clamp01(
                        hit.iterSignal * 0.5
                        + hit.trapSignal * 0.24
                        + heightSignal * 0.18
                        + band * 0.08
                        + contour * 0.05
                    );
                    samplePalette(signal, palette, paletteScratch);
                    samplePalette(signal + 0.22 + contour * 0.08, palette, shadowScratch);
                    samplePalette(signal + 0.56 + band * 0.10 + heightSignal * 0.04, palette, accentScratch);
                    const baseR = paletteScratch[0];
                    const baseG = paletteScratch[1];
                    const baseB = paletteScratch[2];
                    const shadowR = shadowScratch[0];
                    const shadowG = shadowScratch[1];
                    const shadowB = shadowScratch[2];
                    const accentR = accentScratch[0];
                    const accentG = accentScratch[1];
                    const accentB = accentScratch[2];
                    const shadowMix = clamp01((1 - diffuse) * 0.74 + (1 - ao) * 0.42 + contour * 0.14);
                    const lightStrength = (0.17 + 0.55 * diffuse + 0.18 * fill) * ao;
                    const accentStrength = 0.06 + 0.14 * rim + 0.08 * fresnel;
                    const specularStrength = specular * 0.12;

                    r = baseR * lightStrength + shadowR * shadowMix * 0.38;
                    g = baseG * lightStrength + shadowG * shadowMix * 0.38;
                    b = baseB * lightStrength + shadowB * shadowMix * 0.38;

                    r += accentR * accentStrength + accentR * specularStrength;
                    g += accentG * accentStrength + accentG * specularStrength;
                    b += accentB * accentStrength + accentB * specularStrength;

                    r = mix(r, baseR * 0.94, 0.08 * fresnel);
                    g = mix(g, baseG * 0.94, 0.08 * fresnel);
                    b = mix(b, baseB * 0.94, 0.08 * fresnel);

                    r = Math.pow(clamp01(r), 0.84);
                    g = Math.pow(clamp01(g), 0.84);
                    b = Math.pow(clamp01(b), 0.84);
                }
            }

            const index = (y * width + x) * 4;
            pixels[index] = Math.round(clamp01(r) * 255);
            pixels[index + 1] = Math.round(clamp01(g) * 255);
            pixels[index + 2] = Math.round(clamp01(b) * 255);
            pixels[index + 3] = 255;
        }
    }
}

function rayMarch(rox, roy, roz, rdx, rdy, rdz, maxSteps, epsilon) {
    const bounds = intersectBoundingSphere(rox, roy, roz, rdx, rdy, rdz, BOUNDING_SPHERE_RADIUS);
    if (!bounds || bounds.far < 0) {
        return {
            hit: false,
            distance: 0,
            iterSignal: 0,
            trapSignal: 0,
        };
    }

    let total = Math.max(0, bounds.near - 0.04);
    const maxDistance = Math.min(MAX_DIST, bounds.far + 0.04);
    let iterSignal = 0;
    let trapSignal = 0;

    for (let step = 0; step < maxSteps; step += 1) {
        const px = rox + rdx * total;
        const py = roy + rdy * total;
        const pz = roz + rdz * total;
        sampleBulbInfo(px, py, pz, sampleScratch);
        const dist = sampleScratch[0];
        iterSignal = sampleScratch[1];
        trapSignal = sampleScratch[2];

        if (dist < epsilon) {
            return {
                hit: true,
                distance: total,
                iterSignal,
                trapSignal,
            };
        }

        total += dist;
        if (total > maxDistance) {
            break;
        }
    }

    return {
        hit: false,
        distance: total,
        iterSignal,
        trapSignal,
    };
}

function sampleBulbInfo(x, y, z, out) {
    let zx = x;
    let zy = y;
    let zz = z;
    let dr = 1;
    let radius = 0;
    let iter = 0;
    let trap = 1e6;

    for (let i = 0; i < MAX_BULB_ITER; i += 1) {
        const xyRadius = Math.sqrt(zx * zx + zy * zy);
        radius = Math.sqrt(xyRadius * xyRadius + zz * zz);
        trap = Math.min(trap, Math.abs(radius - 0.92));
        if (radius > 4) {
            break;
        }

        const safeRadius = Math.max(radius, 1e-6);
        const theta = Math.atan2(xyRadius, zz);
        const phi = Math.atan2(zy, zx);
        const safePow = Math.pow(safeRadius, POWER - 1);

        dr = POWER * safePow * dr + 1;

        const zr = safePow * safeRadius;
        const nextTheta = theta * POWER;
        const nextPhi = phi * POWER;
        const sinTheta = Math.sin(nextTheta);

        zx = zr * sinTheta * Math.cos(nextPhi) + x;
        zy = zr * sinTheta * Math.sin(nextPhi) + y;
        zz = zr * Math.cos(nextTheta) + z;
        iter += 1;
    }

    const distanceEstimate = 0.25 * Math.log(Math.max(radius, 1)) * radius / Math.max(dr, 1);
    out[0] = distanceEstimate;
    out[1] = iter / MAX_BULB_ITER;
    out[2] = clamp01(1 - trap * 0.85);
    out[3] = clamp01(radius * 0.18);
}

function sampleBulbDistance(x, y, z) {
    sampleBulbInfo(x, y, z, sampleScratch);
    return sampleScratch[0];
}

function estimateNormal(x, y, z, epsilon, out) {
    const d1 = sampleBulbDistance(x + epsilon, y - epsilon, z - epsilon);
    const d2 = sampleBulbDistance(x - epsilon, y - epsilon, z + epsilon);
    const d3 = sampleBulbDistance(x - epsilon, y + epsilon, z - epsilon);
    const d4 = sampleBulbDistance(x + epsilon, y + epsilon, z + epsilon);

    const nx = d1 - d2 - d3 + d4;
    const ny = -d1 - d2 + d3 + d4;
    const nz = -d1 + d2 - d3 + d4;
    const inverseLength = 1 / (Math.sqrt(nx * nx + ny * ny + nz * nz) || 1);
    out[0] = nx * inverseLength;
    out[1] = ny * inverseLength;
    out[2] = nz * inverseLength;
}

function ambientOcclusion(x, y, z, nx, ny, nz, samples) {
    let occlusion = 0;
    let weight = 1;

    for (let i = 0; i < samples; i += 1) {
        const travel = 0.05 + i * 0.085;
        const sampleDist = sampleBulbDistance(x + nx * travel, y + ny * travel, z + nz * travel);
        occlusion += Math.max(0, travel - sampleDist) * weight;
        weight *= 0.6;
    }

    return clamp(1 - occlusion, 0.32, 1);
}

function buildNeonPalette() {
    const palette = state.palette || createRandomNeonPalette();
    return {
        anchorCount: palette.anchors.length / 3,
        anchors: palette.anchors,
        glow: palette.glow,
    };
}

function samplePalette(signal, palette, out) {
    if (palette.anchorCount === 1) {
        const gray = clamp(0.18 + clamp01(signal) * 0.82, 0, 1);
        out[0] = gray;
        out[1] = gray;
        out[2] = gray;
        return;
    }

    const wrapped = wrap01(signal);
    const scaled = wrapped * palette.anchorCount;
    const startIndex = Math.floor(scaled) % palette.anchorCount;
    const localT = smoothstep(0, 1, scaled - Math.floor(scaled));
    const nextIndex = (startIndex + 1) % palette.anchorCount;
    const anchors = palette.anchors;
    const offsetA = startIndex * 3;
    const offsetB = nextIndex * 3;

    out[0] = clamp01(mix(anchors[offsetA], anchors[offsetB], localT) + 0.04 * Math.sin(wrapped * Math.PI * 2.0 * palette.anchorCount));
    out[1] = clamp01(mix(anchors[offsetA + 1], anchors[offsetB + 1], localT) + 0.04 * Math.sin(0.9 + wrapped * Math.PI * 2.0 * palette.anchorCount));
    out[2] = clamp01(mix(anchors[offsetA + 2], anchors[offsetB + 2], localT) + 0.04 * Math.sin(1.8 + wrapped * Math.PI * 2.0 * palette.anchorCount));
}

function getRenderSize(displayWidth, displayHeight, tierSettings) {
    const compact = isCompactViewport();
    const maxDimension = compact ? tierSettings.caps.mobile : tierSettings.caps.desktop;
    let width = Math.max(120, Math.round(displayWidth * tierSettings.scale));
    let height = Math.max(120, Math.round(displayHeight * tierSettings.scale));
    const largestDimension = Math.max(width, height);

    if (largestDimension > maxDimension) {
        const resizeScale = maxDimension / largestDimension;
        width = Math.max(120, Math.floor(width * resizeScale));
        height = Math.max(120, Math.floor(height * resizeScale));
    }

    return { width, height };
}

function syncRasterCache(width, height) {
    const cache = state.rasterCache;
    if (cache.width === width && cache.height === height && cache.uvX && cache.uvY) {
        return;
    }

    const invHeight = 1 / height;
    cache.width = width;
    cache.height = height;
    cache.uvX = new Float32Array(width);
    cache.uvY = new Float32Array(height);

    for (let x = 0; x < width; x += 1) {
        const uvX = ((x + 0.5) - 0.5 * width) * invHeight;
        cache.uvX[x] = uvX;
    }

    for (let y = 0; y < height; y += 1) {
        const uvY = ((y + 0.5) - 0.5 * height) * invHeight;
        cache.uvY[y] = uvY;
    }
}

function createRandomNeonPalette() {
    const anchorCount = Math.floor(randomBetween(NEON_PALETTE_MIN_ANCHORS, NEON_PALETTE_MAX_ANCHORS + 1));
    const modeRoll = Math.random();
    const baseHue = Math.random();
    const span = modeRoll < 0.34
        ? randomBetween(0.16, 0.28)
        : modeRoll < 0.68
            ? randomBetween(0.34, 0.52)
            : randomBetween(0.56, 0.8);
    const direction = Math.random() < 0.5 ? -1 : 1;
    const anchors = new Float32Array(anchorCount * 3);
    let glowHue = baseHue;
    let glowSat = 0.84;
    let glowVal = 1.0;

    for (let index = 0; index < anchorCount; index += 1) {
        const ratio = anchorCount === 1 ? 0 : index / (anchorCount - 1);
        const wave = Math.sin((ratio * Math.PI * 2) + modeRoll * Math.PI * 2) * 0.035;
        const jitter = randomBetween(-0.025, 0.025);
        const hue = wrap01(baseHue + direction * span * (ratio - 0.5) + wave + jitter);
        const saturation = randomBetween(0.74, 0.98);
        const value = randomBetween(0.95, 1.0);
        const rgb = hsvToRgb(hue, saturation, value);
        const offset = index * 3;

        anchors[offset] = rgb[0];
        anchors[offset + 1] = rgb[1];
        anchors[offset + 2] = rgb[2];

        if (index === Math.floor(anchorCount * 0.65)) {
            glowHue = hue;
            glowSat = saturation;
            glowVal = value;
        }
    }

    return {
        anchors,
        glow: hsvToRgb(glowHue + randomBetween(-0.04, 0.04), Math.max(0.68, glowSat - 0.14), glowVal),
    };
}

function buildReferenceView() {
    return {
        yaw: randomBetween(-Math.PI, Math.PI),
        pitch: randomBetween(REFERENCE_PITCH_RANGE.min, REFERENCE_PITCH_RANGE.max),
        distance: REFERENCE_DISTANCE,
    };
}

function randomBetween(min, max) {
    return min + (max - min) * Math.random();
}

function getCameraPosition() {
    const radius = state.view.distance;
    const cosPitch = Math.cos(state.view.pitch);

    return [
        radius * cosPitch * Math.sin(state.view.yaw),
        radius * Math.sin(state.view.pitch),
        radius * cosPitch * Math.cos(state.view.yaw),
    ];
}

function intersectBoundingSphere(rox, roy, roz, rdx, rdy, rdz, radius) {
    const b = rox * rdx + roy * rdy + roz * rdz;
    const c = rox * rox + roy * roy + roz * roz - radius * radius;
    const disc = b * b - c;

    if (disc < 0) {
        return null;
    }

    const root = Math.sqrt(disc);
    return {
        near: -b - root,
        far: -b + root,
    };
}

function normalize3(x, y, z) {
    const length = Math.hypot(x, y, z) || 1;
    return [x / length, y / length, z / length];
}

function dot3(ax, ay, az, bx, by, bz) {
    return ax * bx + ay * by + az * bz;
}

function hsvToRgb(h, s, v) {
    const hue = wrap01(h) * 6;
    const sector = Math.floor(hue);
    const f = hue - sector;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (sector % 6) {
        case 0:
            return [v, t, p];
        case 1:
            return [q, v, p];
        case 2:
            return [p, v, t];
        case 3:
            return [p, q, v];
        case 4:
            return [t, p, v];
        default:
            return [v, p, q];
    }
}

function mix(a, b, t) {
    return a + (b - a) * t;
}

function smoothstep(edge0, edge1, x) {
    const t = clamp01((x - edge0) / (edge1 - edge0 || 1));
    return t * t * (3 - 2 * t);
}

function clamp01(value) {
    return clamp(value, 0, 1);
}

function wrap01(value) {
    const wrapped = value % 1;
    return wrapped < 0 ? wrapped + 1 : wrapped;
}

function showFallback(message) {
    if (state.fallbackShown || !elements.stage) {
        return;
    }

    state.fallbackShown = true;
    cleanupWebGLRenderer();
    state.rendererKind = null;
    state.resizeObserver?.disconnect();
    if (state.rafId) {
        window.cancelAnimationFrame(state.rafId);
    }
    elements.stage.classList.remove("is-dragging");
    elements.stage.innerHTML = "";
    const notice = document.createElement("div");
    notice.className = "canvas-fallback";
    notice.textContent = message;
    elements.stage.append(notice);
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
        ? Math.max(430, Math.floor(width * 1.02))
        : Math.max(420, availableHeight);
    const measuredHeight = Math.floor(rect.height || host.clientHeight || 0);
    const height = Math.max(360, measuredHeight || fallbackHeight);
    return { width, height };
}

function isCompactViewport() {
    return window.innerWidth < 960;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
