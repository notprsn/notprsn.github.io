const { onReady, getCanvas2DContext, rafThrottle } = window.Site;

onReady(initMatrixRain);
onReady(initPiMascot);

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

function initPiMascot() {
    const mascot = document.querySelector("[data-pi-mascot]");
    const face = document.querySelector("[data-pi-mascot-face]");
    const copy = document.querySelector(".landing-copy");
    if (!mascot || !face || !copy) {
        return;
    }

    const neutralSrc = face.dataset.neutralSrc;
    const smileSrc = face.dataset.smileSrc;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const interactionQuery = window.matchMedia("(min-width: 721px) and (pointer: fine)");
    let size = 0;
    let x = 0;
    let y = 0;
    let path = null;
    let bounds = null;
    let frameId = 0;
    let smiling = false;
    let cornered = false;
    let pointer = null;
    let lastPathType = Math.random() > 0.5 ? "ellipse" : "lemniscate";

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function random(min, max) {
        return min + Math.random() * (max - min);
    }

    function isInteractive() {
        return interactionQuery.matches && !motionQuery.matches && !document.hidden;
    }

    function getBounds() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        size = mascot.offsetWidth;
        const copyRect = copy.getBoundingClientRect();
        const headerOffset = parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue("--scene-header-offset")) || 0;
        const margin = clamp(width * 0.05, 72, 112);
        const nextBounds = {
            left: copyRect.right + margin,
            right: width - size - margin,
            top: headerOffset + margin,
            bottom: height - size - margin,
        };
        nextBounds.width = nextBounds.right - nextBounds.left;
        nextBounds.height = nextBounds.bottom - nextBounds.top;
        return nextBounds.width > size * 0.28 && nextBounds.height > size * 0.42 ? nextBounds : null;
    }

    function setSmile(nextSmiling) {
        if (smiling === nextSmiling) {
            return;
        }

        smiling = nextSmiling;
        mascot.classList.toggle("pi-mascot--smile", smiling);
        if (neutralSrc && smileSrc) {
            face.src = smiling ? smileSrc : neutralSrc;
        }
    }

    function setCornered(nextCornered) {
        if (cornered === nextCornered) {
            return;
        }

        cornered = nextCornered;
        mascot.classList.toggle("pi-mascot--cornered", cornered);
    }

    function clampToBounds(point) {
        return {
            x: clamp(point.x, bounds.left, bounds.right),
            y: clamp(point.y, bounds.top, bounds.bottom),
        };
    }

    function choosePath(now) {
        const type = Math.random() > 0.32 ? (lastPathType === "ellipse" ? "lemniscate" : "ellipse") : lastPathType;
        lastPathType = type;
        const rx = random(bounds.width * 0.18, bounds.width * 0.46);
        const ry = random(bounds.height * 0.16, bounds.height * 0.42);
        path = {
            type,
            cx: random(bounds.left + rx, bounds.right - rx),
            cy: random(bounds.top + ry, bounds.bottom - ry),
            rx,
            ry,
            angle: random(-0.48, 0.48),
            phase: random(0, Math.PI * 2),
            speed: random(0.00036, 0.00062) * (Math.random() > 0.5 ? 1 : -1),
            expiresAt: now + random(7600, 12800),
        };
    }

    function pointOnPath(now) {
        const t = path.phase + now * path.speed;
        const cos = Math.cos(t);
        const sin = Math.sin(t);
        const raw = path.type === "ellipse"
            ? { x: cos * path.rx, y: sin * path.ry }
            : {
                x: (cos / (1 + sin * sin)) * path.rx,
                y: ((sin * cos) / (1 + sin * sin)) * path.ry,
            };
        const angleCos = Math.cos(path.angle);
        const angleSin = Math.sin(path.angle);
        return clampToBounds({
            x: path.cx + raw.x * angleCos - raw.y * angleSin,
            y: path.cy + raw.x * angleSin + raw.y * angleCos,
        });
    }

    function nearWall(point) {
        const edge = size * 0.22;
        return (
            point.x <= bounds.left + edge ||
            point.x >= bounds.right - edge ||
            point.y <= bounds.top + edge ||
            point.y >= bounds.bottom - edge
        );
    }

    function applyPointer(base) {
        if (!pointer) {
            setSmile(false);
            setCornered(false);
            return base;
        }
        const centerX = x + size * 0.52;
        const centerY = y + size * 0.46;
        const awayX = centerX - pointer.x;
        const awayY = centerY - pointer.y;
        const distance = Math.hypot(awayX, awayY) || 1;
        const onMascot = distance < size * 0.48;
        const pinned = onMascot && nearWall({ x, y });
        setSmile(onMascot);
        setCornered(pinned);

        if (pinned) {
            return { x, y };
        }

        const repelRadius = Math.max(size * 1.3, 170);
        if (distance >= repelRadius) {
            return base;
        }

        const pressure = (repelRadius - distance) / repelRadius;
        const push = 40 + pressure * 150;
        return clampToBounds({
            x: x + (awayX / distance) * push,
            y: y + (awayY / distance) * push,
        });
    }

    function stop() {
        if (!frameId) {
            return;
        }

        window.cancelAnimationFrame(frameId);
        frameId = 0;
    }

    function reset() {
        stop();
        pointer = null;
        path = null;
        setSmile(false);
        setCornered(false);
        mascot.hidden = !interactionQuery.matches;
        mascot.style.top = "";
        mascot.style.left = "";
        mascot.style.transform = "";
    }

    function tick(now) {
        if (!isInteractive()) {
            reset();
            return;
        }

        bounds = getBounds();
        if (!bounds) {
            mascot.hidden = true;
            stop();
            return;
        }

        mascot.hidden = false;
        if (!path || now > path.expiresAt) {
            choosePath(now);
        }

        const target = applyPointer(pointOnPath(now));
        x += (target.x - x) * (cornered ? 0.08 : 0.12);
        y += (target.y - y) * (cornered ? 0.08 : 0.12);
        const tilt = clamp((target.x - x) * 0.08, -8, 8);
        mascot.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${tilt.toFixed(2)}deg)`;
        frameId = window.requestAnimationFrame(tick);
    }

    function start() {
        if (!isInteractive() || frameId) {
            return;
        }

        bounds = getBounds();
        if (!bounds) {
            mascot.hidden = true;
            return;
        }

        mascot.hidden = false;
        mascot.style.top = "0";
        mascot.style.left = "0";
        const now = performance.now();
        choosePath(now);
        const initial = pointOnPath(now);
        x = initial.x;
        y = initial.y;
        mascot.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(-2deg)`;
        frameId = window.requestAnimationFrame(tick);
    }

    function handlePointerMove(event) {
        pointer = {
            x: event.clientX,
            y: event.clientY,
        };
    }

    function handlePointerLeave() {
        pointer = null;
        setSmile(false);
    }

    const handleResize = rafThrottle(() => {
        if (!isInteractive()) {
            reset();
            return;
        }

        stop();
        start();
    });

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stop();
            return;
        }

        start();
    });
    start();
}
