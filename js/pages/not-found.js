// GitHub Pages serves this shell for former section URLs without retaining that directory.
if (/^\/essays(?:\/|$)/.test(location.pathname)) {
    location.replace("/words/");
}

const message = document.querySelector("[data-not-found-message]");
if (message && location.pathname.startsWith("/secret/")) {
    document.title = "not quite";
    message.textContent = "not quite, kiddo :p";
}
