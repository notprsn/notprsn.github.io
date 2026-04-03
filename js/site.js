function onReady(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback, { once: true });
        return;
    }

    callback();
}

function setCurrentYear() {
    const targets = document.querySelectorAll("[data-current-year]");
    const year = new Date().getFullYear().toString();

    targets.forEach((target) => {
        target.textContent = year;
    });
}

function getSiteVersion() {
    const meta = document.querySelector('meta[name="site-version"]');
    return meta?.content || "dev";
}

function appendSiteVersion(resourcePath) {
    const version = encodeURIComponent(getSiteVersion());
    const separator = resourcePath.includes("?") ? "&" : "?";
    return `${resourcePath}${separator}v=${version}`;
}

async function fetchVersionedResource(resourcePath, options = {}) {
    return fetch(appendSiteVersion(resourcePath), {
        cache: "force-cache",
        ...options,
    });
}

function getCanvas2DContext(canvas) {
    if (!(canvas instanceof HTMLCanvasElement)) {
        return null;
    }

    return (
        canvas.getContext("2d", { alpha: false, desynchronized: true }) ||
        canvas.getContext("2d", { alpha: false }) ||
        canvas.getContext("2d")
    );
}

function rafThrottle(callback) {
    let frameId = 0;
    let lastArgs = [];

    const throttled = (...args) => {
        lastArgs = args;
        if (frameId) {
            return;
        }

        frameId = window.requestAnimationFrame(() => {
            frameId = 0;
            callback(...lastArgs);
        });
    };

    throttled.cancel = () => {
        if (!frameId) {
            return;
        }

        window.cancelAnimationFrame(frameId);
        frameId = 0;
    };

    return throttled;
}

window.Site = Object.freeze({
    onReady,
    getSiteVersion,
    appendSiteVersion,
    fetchVersionedResource,
    getCanvas2DContext,
    rafThrottle,
});

onReady(setCurrentYear);
