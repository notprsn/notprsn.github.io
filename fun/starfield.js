document.addEventListener("DOMContentLoaded", () => {
    initFunStarfield();
});

function initFunStarfield() {
    const canvas = document.querySelector("[data-fun-starfield-canvas]");
    if (!canvas) {
        return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasCoarsePointer =
        window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(hover: none)").matches;
    const palette = [
        "rgba(255, 255, 255, 0.96)",
        "rgba(214, 230, 255, 0.86)",
        "rgba(255, 243, 212, 0.82)",
    ];

    let width = 0;
    let height = 0;
    let dpr = 1;
    let edgeRadius = 1;
    let stars = [];
    let lastFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let currentSpeed = 0;
    const targetInterval = 1000 / 30;
    const maxSpeed = 110;
    const densityScale = 0.245;

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

        project(depth) {
            const safeDepth = Math.max(depth, 1);
            return {
                x: (this.x / safeDepth) * width,
                y: (this.y / safeDepth) * height,
            };
        }

        update() {
            const current = this.project(this.z);

            this.pz = this.z;
            this.z -= currentSpeed;

            if (
                this.z < 1 ||
                current.x < -width * 0.54 ||
                current.x > width * 0.54 ||
                current.y < -height * 0.54 ||
                current.y > height * 0.54
            ) {
                this.reset();
            }
        }

        draw() {
            const current = this.project(this.z);
            const previous = this.project(this.pz);
            const screenX = width / 2 + current.x;
            const screenY = height / 2 + current.y;
            const previousX = width / 2 + previous.x;
            const previousY = height / 2 + previous.y;
            const radial = Math.min(1, Math.hypot(current.x, current.y) / edgeRadius);

            if (screenX < 0 || screenX > width || screenY < 0 || screenY > height) {
                return;
            }

            const radius = Math.max(0.2, (1 - this.z / width) * 3.4 * this.twinkle);
            const brightness = (0.3 + (1 - radial) * 0.7) * getContentMask(screenX, screenY);
            const speedRatio = currentSpeed / maxSpeed;
            const isStreaking = speedRatio > 0.16;
            const strokeOpacity = isStreaking ? Math.min(1, brightness + 0.42) : brightness;

            context.strokeStyle = this.color.replace(/[\d.]+\)$/, `${strokeOpacity.toFixed(3)})`);
            context.lineWidth = Math.max(0.4, radius * 2);
            context.lineCap = "round";
            context.beginPath();
            context.moveTo(previousX, previousY);
            context.lineTo(screenX, screenY);
            context.stroke();

            if (!isStreaking) {
                context.fillStyle = this.color.replace(/[\d.]+\)$/, `${Math.min(1, brightness + 0.2).toFixed(3)})`);
                context.beginPath();
                context.arc(screenX, screenY, radius, 0, Math.PI * 2);
                context.fill();
            }
        }
    }

    function resize() {
        dpr = Math.max(window.devicePixelRatio || 1, 1);
        width = window.innerWidth;
        height = window.innerHeight;
        edgeRadius = Math.hypot(width * 0.5, height * 0.5);
        pointerX = width * 0.5;
        pointerY = height * 0.5;

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);

        const starCount = Math.max(
            Math.floor(1200 * densityScale),
            Math.min(Math.floor(5600 * densityScale), Math.floor(width * height * 0.0034 * densityScale))
        );
        stars = Array.from({ length: starCount }, () => new Star(true));

        context.fillStyle = "#000";
        context.fillRect(0, 0, width, height);
    }

    function drawFrame() {
        currentSpeed = getPointerSpeed();
        const fadeAlpha = 0.82 - (currentSpeed / maxSpeed) * 0.54;
        context.fillStyle = `rgba(0, 0, 0, ${fadeAlpha.toFixed(3)})`;
        context.fillRect(0, 0, width, height);

        context.save();
        context.globalCompositeOperation = "screen";
        stars.forEach((star) => {
            star.update();
            star.draw();
        });
        context.restore();
    }

    function drawReducedFrame() {
        context.fillStyle = "#000";
        context.fillRect(0, 0, width, height);

        stars.forEach((star) => {
            star.z = width * (0.35 + Math.random() * 0.65);
            star.pz = star.z;
            star.draw();
        });
    }

    function tick(timestamp) {
        if (timestamp - lastFrame >= targetInterval) {
            drawFrame();
            lastFrame = timestamp;
        }
        window.requestAnimationFrame(tick);
    }

    function getPointerSpeed() {
        if (hasCoarsePointer) {
            return maxSpeed * 0.1;
        }

        const distance = Math.min(edgeRadius, Math.hypot(pointerX - width * 0.5, pointerY - height * 0.5));
        const proximity = 1 - distance / edgeRadius;
        return maxSpeed * Math.pow(Math.max(0, proximity), 2.4);
    }

    function getContentMask(screenX, screenY) {
        const isMobile = width < 760;
        const centerX = width * (isMobile ? 0.5 : 0.37);
        const centerY = height * (isMobile ? 0.36 : 0.42);
        const radiusX = width * (isMobile ? 0.48 : 0.31);
        const radiusY = height * (isMobile ? 0.26 : 0.29);
        const ellipseDistance = Math.sqrt(
            ((screenX - centerX) / radiusX) ** 2 +
            ((screenY - centerY) / radiusY) ** 2
        );

        if (ellipseDistance >= 1) {
            return 1;
        }

        const t = Math.max(0, Math.min(1, ellipseDistance));
        const eased = t * t * (3 - 2 * t);
        return 0.14 + eased * 0.86;
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
    });

    if (prefersReducedMotion) {
        drawReducedFrame();
        return;
    }

    window.requestAnimationFrame(tick);
}
