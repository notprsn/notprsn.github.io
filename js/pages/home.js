const { onReady, getCanvas2DContext, rafThrottle } = window.Site;

onReady(initMatrixRain);

function initMatrixRain() {
    const canvas = document.querySelector("[data-matrix-canvas]");
    if (!canvas) {
        return;
    }

    const context = getCanvas2DContext(canvas);
    if (!context) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const glyphs = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>[]=+";
    let width = 0;
    let height = 0;
    let fontSize = 18;
    let columns = 0;
    let drops = [];
    let lastFrame = 0;
    let frameId = 0;
    const targetInterval = 1000 / (hasCoarsePointer ? 14 : 18);

    function resize() {
        const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), hasCoarsePointer ? 1.25 : 1.5);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        fontSize = width < 640 ? 14 : 18;
        columns = Math.ceil(width / fontSize);
        drops = Array.from({ length: columns }, () => Math.random() * -80);
        context.font = `${fontSize}px IBM Plex Mono, monospace`;
        context.textBaseline = "top";
        context.fillStyle = "#05070a";
        context.fillRect(0, 0, width, height);
    }

    function drawFrame() {
        context.fillStyle = "rgba(5, 7, 10, 0.14)";
        context.fillRect(0, 0, width, height);

        for (let column = 0; column < columns; column += 1) {
            const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
            const x = column * fontSize;
            const y = drops[column] * fontSize;
            const isBright = Math.random() > 0.962;
            context.fillStyle = isBright ? "rgba(233, 255, 238, 0.92)" : "rgba(120, 255, 146, 0.72)";
            context.fillText(glyph, x, y);

            const beyondBottom = y > height + fontSize * 4;
            if (beyondBottom && Math.random() > 0.975) {
                drops[column] = Math.random() * -40;
            } else {
                drops[column] += 1 + Math.random() * 0.35;
            }
        }
    }

    function tick(timestamp) {
        if (timestamp - lastFrame >= targetInterval) {
            drawFrame();
            lastFrame = timestamp;
        }
        frameId = window.requestAnimationFrame(tick);
    }

    function stop() {
        if (!frameId) {
            return;
        }

        window.cancelAnimationFrame(frameId);
        frameId = 0;
    }

    function start() {
        if (prefersReducedMotion || document.hidden || frameId) {
            return;
        }

        lastFrame = performance.now();
        frameId = window.requestAnimationFrame(tick);
    }

    const handleResize = rafThrottle(() => {
        resize();
        if (prefersReducedMotion) {
            for (let index = 0; index < 10; index += 1) {
                drawFrame();
            }
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
        for (let index = 0; index < 10; index += 1) {
            drawFrame();
        }
        return;
    }

    start();
}
