const { onReady, getCanvas2DContext, rafThrottle } = window.Site;

onReady(initAboutRain);

function initAboutRain() {
    const canvas = document.querySelector("[data-about-rain-canvas]");
    if (!canvas) {
        return;
    }

    const context = getCanvas2DContext(canvas);
    if (!context) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const palette = {
        deepBg: [11, 15, 26],
        cyan: [0, 245, 255],
        blue: [93, 169, 255],
        purple: [106, 92, 255],
        pink: [255, 46, 136],
        magenta: [212, 20, 90],
    };

    const state = {
        width: 0,
        height: 0,
        dpr: 1,
        renderScale: 1,
        time: 0,
        streaks: [],
        lastFrame: 0,
        frameId: 0,
    };
    const targetInterval = 1000 / 18;

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const lerp = (start, end, amount) => start + (end - start) * amount;
    const mixColor = (from, to, amount) => from.map((channel, index) => Math.round(lerp(channel, to[index], amount)));
    const rgba = (rgb, alpha) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;

    function getRenderScale(width) {
        if (prefersReducedMotion) {
            return 1;
        }

        if (width >= 1280) {
            return 0.68;
        }

        if (width >= 820) {
            return 0.78;
        }

        return 0.9;
    }

    function createStreak(initial = false) {
        const width = state.width || window.innerWidth;
        const height = state.height || window.innerHeight;
        const length = lerp(72, 180, Math.random());

        return {
            x: Math.random() * width,
            y: initial ? Math.random() * height : -length - Math.random() * height * 0.3,
            length,
            speed: lerp(180, 420, Math.random()),
            width: lerp(0.75, 1.65, Math.random()),
            sway: lerp(0.15, 0.65, Math.random()),
            drift: lerp(0.03, 0.09, Math.random()),
            tintShift: Math.random(),
            phase: Math.random() * Math.PI * 2,
        };
    }

    function buildStreaks() {
        const count = clamp(Math.floor(state.width / 42), 16, 30);
        state.streaks = Array.from({ length: count }, () => createStreak(true));
    }

    function resize() {
        state.dpr = 1;
        state.width = window.innerWidth;
        state.height = window.innerHeight;
        state.renderScale = getRenderScale(state.width);
        canvas.width = Math.round(state.width * state.renderScale);
        canvas.height = Math.round(state.height * state.renderScale);
        canvas.style.width = `${state.width}px`;
        canvas.style.height = `${state.height}px`;
        context.setTransform(state.renderScale, 0, 0, state.renderScale, 0, 0);
        context.fillStyle = `rgb(${palette.deepBg.join(",")})`;
        context.fillRect(0, 0, state.width, state.height);
        buildStreaks();
    }

    function drawStreak(streak, index) {
        const blend = 0.5 + 0.5 * Math.sin(state.time * 0.00034 + streak.phase + index * 0.02);
        const cool = mixColor(palette.cyan, palette.blue, 0.28 + blend * 0.48);
        const warm = mixColor(palette.pink, palette.magenta, 0.22 + (1 - blend) * 0.56);
        const mid = mixColor(cool, palette.purple, 0.18 + streak.tintShift * 0.32);
        const x = streak.x + Math.sin(state.time * 0.00024 + streak.phase) * streak.sway;
        const y1 = streak.y - streak.length;
        const y2 = streak.y;

        context.beginPath();
        context.strokeStyle = rgba(mid, 0.06);
        context.lineWidth = streak.width * 1.8;
        context.moveTo(x, y1 - streak.length * 0.1);
        context.lineTo(x, y2 + streak.length * 0.05);
        context.stroke();

        const gradient = context.createLinearGradient(x, y1, x, y2);
        gradient.addColorStop(0, rgba(cool, 0));
        gradient.addColorStop(0.3, rgba(cool, 0.12));
        gradient.addColorStop(1, rgba(warm, 0.74));

        context.beginPath();
        context.strokeStyle = gradient;
        context.lineWidth = streak.width;
        context.moveTo(x, y1);
        context.lineTo(x, y2);
        context.stroke();

        context.fillStyle = rgba(warm, 0.76);
        context.beginPath();
        context.arc(x, y2, streak.width * 0.72, 0, Math.PI * 2);
        context.fill();
    }

    function drawFrame(timestamp) {
        if (timestamp - state.lastFrame < targetInterval) {
            state.frameId = window.requestAnimationFrame(drawFrame);
            return;
        }

        const dt = Math.min((timestamp - state.lastFrame) / 1000, 0.05);
        state.lastFrame = timestamp;
        state.time = timestamp;

        context.globalCompositeOperation = "source-over";
        context.fillStyle = "rgba(11, 15, 26, 0.22)";
        context.fillRect(0, 0, state.width, state.height);

        context.globalCompositeOperation = "lighter";
        context.lineCap = "round";
        state.streaks.forEach((streak, index) => {
            streak.y += streak.speed * dt;
            streak.x += Math.sin(timestamp * 0.00012 + streak.phase) * streak.drift;

            if (streak.y - streak.length > state.height + 48) {
                Object.assign(streak, createStreak(false));
            }

            drawStreak(streak, index);
        });

        state.frameId = window.requestAnimationFrame(drawFrame);
    }

    function drawStaticFrame() {
        context.globalCompositeOperation = "source-over";
        context.fillStyle = `rgb(${palette.deepBg.join(",")})`;
        context.fillRect(0, 0, state.width, state.height);
        context.globalCompositeOperation = "lighter";
        context.lineCap = "round";
        state.streaks.forEach((streak, index) => {
            drawStreak(streak, index);
        });
    }

    function stop() {
        if (state.frameId) {
            window.cancelAnimationFrame(state.frameId);
            state.frameId = 0;
        }
    }

    function start() {
        if (prefersReducedMotion || document.hidden || state.frameId) {
            return;
        }

        state.lastFrame = performance.now();
        state.frameId = window.requestAnimationFrame(drawFrame);
    }

    const handleResize = rafThrottle(() => {
        resize();
        if (prefersReducedMotion) {
            drawStaticFrame();
        }
    });

    resize();
    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stop();
            return;
        }

        start();
    });

    if (prefersReducedMotion) {
        drawStaticFrame();
        return;
    }

    start();
}
