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

window.Site = Object.freeze({
    onReady,
    getSiteVersion,
    appendSiteVersion,
    fetchVersionedResource,
});

onReady(setCurrentYear);
