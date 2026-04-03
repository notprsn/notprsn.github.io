const { onReady, getCanvas2DContext, rafThrottle } = window.Site;

onReady(initFunStarfield);

function initFunStarfield() {
    const canvas = document.querySelector("[data-fun-starfield-canvas]");
    if (!canvas) {
        return;
    }

    const context = getCanvas2DContext(canvas);
    if (!context) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasCoarsePointer =
        window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(hover: none)").matches;
    const palette = [
        "255, 255, 255",
        "214, 230, 255",
        "255, 243, 212",
    ];

    let width = 0;
    let height = 0;
    let halfWidth = 0;
    let halfHeight = 0;
    let dpr = 1;
    let edgeRadius = 1;
    let contentMaskCenterX = 0;
    let contentMaskCenterY = 0;
    let contentMaskScaleX = 1;
    let contentMaskScaleY = 1;
    let stars = [];
    let lastFrame = 0;
    let frameId = 0;
    let pointerX = 0;
    let pointerY = 0;
    let currentSpeed = 0;
    const targetInterval = 1000 / (hasCoarsePointer ? 24 : 30);
    const maxSpeed = 110;
    const densityScale = hasCoarsePointer ? 0.18 : 0.245;
    const rgba = (rgb, alpha) => `rgba(${rgb}, ${alpha.toFixed(3)})`;

    class Star {
        constructor(initial = false) {
            this.reset(initial);
        }

        reset(initial = false) {
            this.x = (Math.random() * 2 - 1) * width;
            this.y = (Math.random() * 2 - 1) * height;
            this.z = initial ? Math.random() * width : width * (0.58 + Math.random() * 0.42);
            this.pz = this.z;
            this.color = palette[Math.floor(Math.random() * palette.length)];
            this.twinkle = 0.4 + Math.random() * 0.6;
        }

        update() {
            const currentDepth = Math.max(this.z, 1);
            const currentX = (this.x / currentDepth) * width;
            const currentY = (this.y / currentDepth) * height;

            this.pz = this.z;
            this.z -= currentSpeed;

            if (
                this.z < 1 ||
                currentX < -width * 0.54 ||
                currentX > width * 0.54 ||
                currentY < -height * 0.54 ||
                currentY > height * 0.54
            ) {
                this.reset();
            }
        }

        draw() {
            const currentDepth = Math.max(this.z, 1);
            const previousDepth = Math.max(this.pz, 1);
            const currentX = (this.x / currentDepth) * width;
            const currentY = (this.y / currentDepth) * height;
            const previousProjectedX = (this.x / previousDepth) * width;
            const previousProjectedY = (this.y / previousDepth) * height;
            const screenX = halfWidth + currentX;
            const screenY = halfHeight + currentY;
            const previousX = halfWidth + previousProjectedX;
            const previousY = halfHeight + previousProjectedY;
            const radial = Math.min(1, Math.hypot(currentX, currentY) / edgeRadius);

            if (screenX < 0 || screenX > width || screenY < 0 || screenY > height) {
                return;
            }

            const radius = Math.max(0.2, (1 - this.z / width) * 3.4 * this.twinkle);
            const brightness = (0.3 + (1 - radial) * 0.7) * getContentMask(screenX, screenY);
            const speedRatio = currentSpeed / maxSpeed;
            const isStreaking = speedRatio > 0.16;
            const strokeOpacity = isStreaking ? Math.min(1, brightness + 0.42) : brightness;

            context.strokeStyle = rgba(this.color, strokeOpacity);
            context.lineWidth = Math.max(0.4, radius * 2);
            context.lineCap = "round";
            context.beginPath();
            context.moveTo(previousX, previousY);
            context.lineTo(screenX, screenY);
            context.stroke();

            if (!isStreaking) {
                context.fillStyle = rgba(this.color, Math.min(1, brightness + 0.2));
                context.beginPath();
                context.arc(screenX, screenY, radius, 0, Math.PI * 2);
                context.fill();
            }
        }
    }

    function resize() {
        dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), hasCoarsePointer ? 1.25 : 1.5);
        width = window.innerWidth;
        height = window.innerHeight;
        halfWidth = width * 0.5;
        halfHeight = height * 0.5;
        edgeRadius = Math.hypot(halfWidth, halfHeight);
        pointerX = halfWidth;
        pointerY = halfHeight;

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);

        updateContentMask();

        const starCount = Math.max(
            Math.floor(1200 * densityScale),
            Math.min(Math.floor(5600 * densityScale), Math.floor(width * height * 0.0034 * densityScale))
        );
        stars = Array.from({ length: starCount }, () => new Star(true));

        context.fillStyle = "#000";
        context.fillRect(0, 0, width, height);
    }

    function updateContentMask() {
        const isMobile = width < 760;
        const radiusX = width * (isMobile ? 0.48 : 0.31);
        const radiusY = height * (isMobile ? 0.26 : 0.29);

        contentMaskCenterX = width * (isMobile ? 0.5 : 0.37);
        contentMaskCenterY = height * (isMobile ? 0.36 : 0.42);
        contentMaskScaleX = 1 / Math.max(radiusX, 1);
        contentMaskScaleY = 1 / Math.max(radiusY, 1);
    }

    function drawFrame() {
        currentSpeed = getPointerSpeed();
        const fadeAlpha = 0.82 - (currentSpeed / maxSpeed) * 0.54;
        context.fillStyle = `rgba(0, 0, 0, ${fadeAlpha.toFixed(3)})`;
        context.fillRect(0, 0, width, height);

        context.save();
        context.globalCompositeOperation = "screen";
        for (let index = 0; index < stars.length; index += 1) {
            const star = stars[index];
            star.update();
            star.draw();
        }
        context.restore();
    }

    function drawReducedFrame() {
        context.fillStyle = "#000";
        context.fillRect(0, 0, width, height);

        for (let index = 0; index < stars.length; index += 1) {
            const star = stars[index];
            star.z = width * (0.35 + Math.random() * 0.65);
            star.pz = star.z;
            star.draw();
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

    function getPointerSpeed() {
        if (hasCoarsePointer) {
            return maxSpeed * 0.1;
        }

        const distance = Math.min(edgeRadius, Math.hypot(pointerX - halfWidth, pointerY - halfHeight));
        const proximity = 1 - distance / edgeRadius;
        return maxSpeed * Math.pow(Math.max(0, proximity), 2.4);
    }

    function getContentMask(screenX, screenY) {
        const ellipseDistance = Math.sqrt(
            ((screenX - contentMaskCenterX) * contentMaskScaleX) ** 2 +
            ((screenY - contentMaskCenterY) * contentMaskScaleY) ** 2
        );

        if (ellipseDistance >= 1) {
            return 1;
        }

        const t = Math.max(0, Math.min(1, ellipseDistance));
        const eased = t * t * (3 - 2 * t);
        return 0.14 + eased * 0.86;
    }

    const handleResize = rafThrottle(() => {
        resize();
        if (prefersReducedMotion) {
            drawReducedFrame();
        }
    });

    resize();
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener(
        "pointermove",
        (event) => {
            pointerX = event.clientX;
            pointerY = event.clientY;
        },
        { passive: true }
    );
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stop();
            return;
        }

        start();
    });

    if (prefersReducedMotion) {
        drawReducedFrame();
        return;
    }

    start();
}
