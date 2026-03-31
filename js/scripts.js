let writingManifestPromise;

document.addEventListener("DOMContentLoaded", () => {
    setCurrentYear();
    initMatrixRain();
    initLoveLetters();
    initWorkLedgerAccordion();
    initProjectCardLinks();
    initWritingLinks();
    initWritingPage();
    initWorkStoryPage();
    initProjectMarkdownPage();
});

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

async function fetchWritingManifest() {
    if (!writingManifestPromise) {
        const version = encodeURIComponent(getSiteVersion());
        writingManifestPromise = fetch(`/data/writings-manifest.json?v=${version}`, { cache: "no-store" })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error("Could not load writings manifest.");
                }
                return response.json();
            })
            .catch((error) => {
                console.warn(error);
                return { items: [] };
            });
    }

    return writingManifestPromise;
}

function initMatrixRain() {
    const canvas = document.querySelector("[data-matrix-canvas]");
    if (!canvas) {
        return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const glyphs = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>[]=+";
    let width = 0;
    let height = 0;
    let fontSize = 18;
    let columns = 0;
    let drops = [];
    let lastFrame = 0;
    const targetInterval = 1000 / 18;

    function resize() {
        const dpr = Math.max(window.devicePixelRatio || 1, 1);
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
        window.requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);

    if (prefersReducedMotion) {
        for (let index = 0; index < 10; index += 1) {
            drawFrame();
        }
        return;
    }

    window.requestAnimationFrame(tick);
}

function initWorkLedgerAccordion() {
    const rows = document.querySelectorAll("[data-ledger-item]");
    if (!rows.length) {
        return;
    }

    const mobileQuery = window.matchMedia("(max-width: 940px)");

    rows.forEach((row) => {
        const toggle = row.querySelector(".paper-ledger__toggle");
        if (!toggle) {
            return;
        }

        toggle.addEventListener("click", () => {
            if (!mobileQuery.matches) {
                return;
            }

            const isOpen = row.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    });

    function syncLedgerState() {
        if (!mobileQuery.matches) {
            rows.forEach((row) => {
                row.classList.remove("is-open");
                const toggle = row.querySelector(".paper-ledger__toggle");
                if (toggle) {
                    toggle.setAttribute("aria-expanded", "false");
                }
            });
        }
    }

    syncLedgerState();
    mobileQuery.addEventListener("change", syncLedgerState);
}

function initProjectCardLinks() {
    const cards = document.querySelectorAll("[data-project-card-link]");
    if (!cards.length) {
        return;
    }

    cards.forEach((card) => {
        const href = card.getAttribute("data-project-card-link");
        if (!href) {
            return;
        }

        const isInteractiveTarget = (target) => {
            if (!(target instanceof Element)) {
                return false;
            }
            const interactiveParent = target.closest("a, button, input, select, textarea, summary, [role='button'], [role='link']");
            return Boolean(interactiveParent && interactiveParent !== card);
        };

        card.addEventListener("click", (event) => {
            if (isInteractiveTarget(event.target)) {
                return;
            }
            window.location.href = href;
        });

        card.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }
            event.preventDefault();
            window.location.href = href;
        });
    });
}

async function initWritingLinks() {
    const slots = document.querySelectorAll("[data-writing-slot]");
    if (!slots.length) {
        return;
    }

    const manifest = await fetchWritingManifest();
    const items = Array.isArray(manifest.items) ? manifest.items : [];
    const bySlug = new Map(items.map((item) => [item.slug, item]));

    slots.forEach((slot) => {
        const slug = slot.getAttribute("data-writing-slot");
        const entry = bySlug.get(slug);
        const linkCluster = slot.querySelector("[data-writing-link]");

        if (!entry || !linkCluster) {
            return;
        }

        linkCluster.hidden = false;
        linkCluster.replaceChildren();

        const link = document.createElement("a");
        link.className = "story-link";
        link.href = entry.route;
        link.setAttribute("aria-label", `Open the story for ${entry.title}`);

        const label = document.createElement("span");
        label.className = "story-link-label";
        label.textContent = "Open story";

        const arrow = document.createElement("span");
        arrow.className = "story-link-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = ">";

        link.append(label, arrow);
        linkCluster.append(link);
    });
}

async function initWritingPage() {
    const root = document.querySelector("[data-writing-page]");
    if (!root) {
        return;
    }

    const titleTarget = document.querySelector("[data-writing-title]");
    const metaTarget = document.querySelector("[data-writing-meta]");
    const proseTarget = document.querySelector("[data-writing-prose]");
    const backLink = document.querySelector("[data-writing-back-link]");
    const intro = document.querySelector("[data-writing-intro]");
    const slug = new URLSearchParams(window.location.search).get("slug");

    if (!slug || !titleTarget || !metaTarget || !proseTarget || !backLink) {
        showWritingPageError("Missing writing slug.");
        return;
    }

    const fallbackRoute = routeWritingSlug(slug);
    backLink.href = fallbackRoute.backPath;
    backLink.textContent = `Back to ${fallbackRoute.backLabel}`;

    const manifest = await fetchWritingManifest();
    const items = Array.isArray(manifest.items) ? manifest.items : [];
    const entry = items.find((item) => item.slug === slug);

    if (!entry) {
        showWritingPageError("That finalized writing does not exist yet.");
        return;
    }

    titleTarget.textContent = entry.title;
    metaTarget.textContent = `${entry.kindLabel} / finalized writing`;
    backLink.href = entry.backPath;
    backLink.textContent = `Back to ${entry.backLabel}`;
    document.title = `${entry.title} | Prasann Iyer`;

    if (intro) {
        intro.hidden = false;
    }

    try {
        const version = encodeURIComponent(getSiteVersion());
        const response = await fetch(`${entry.file}?v=${version}`, { cache: "no-store" });
        if (!response.ok) {
            throw new Error("Could not load finalized markdown.");
        }

        const markdown = await response.text();
        proseTarget.innerHTML = renderMarkdown(markdown);
    } catch (error) {
        console.error(error);
        showWritingPageError("Could not load finalized markdown.");
    }
}

async function initWorkStoryPage() {
    const root = document.querySelector("[data-work-story-page]");
    if (!root) {
        return;
    }

    const proseTarget = root.querySelector("[data-work-story-prose]");
    const storyFile = root.getAttribute("data-story-file");

    if (!proseTarget || !storyFile) {
        return;
    }

    try {
        const version = encodeURIComponent(getSiteVersion());
        const response = await fetch(`${storyFile}?v=${version}`, { cache: "no-store" });
        if (!response.ok) {
            throw new Error("Could not load work story markdown.");
        }

        const markdown = await response.text();
        proseTarget.innerHTML = renderMarkdown(stripLeadingTitle(markdown));
    } catch (error) {
        console.error(error);
        proseTarget.innerHTML = `<p>${escapeHtml("Could not load work story.")}</p>`;
    }
}

async function initProjectMarkdownPage() {
    const root = document.querySelector("[data-project-markdown-page]");
    if (!root) {
        return;
    }

    const proseTarget = root.querySelector("[data-project-markdown-prose]");
    const storyFile = root.getAttribute("data-story-file");
    const stripTitle = root.hasAttribute("data-strip-leading-title");

    if (!proseTarget || !storyFile) {
        return;
    }

    try {
        const version = encodeURIComponent(getSiteVersion());
        const response = await fetch(`${storyFile}?v=${version}`, { cache: "no-store" });
        if (!response.ok) {
            throw new Error("Could not load project markdown.");
        }

        const markdown = await response.text();
        proseTarget.innerHTML = renderMarkdown(stripTitle ? stripLeadingTitle(markdown) : markdown);
    } catch (error) {
        console.error(error);
        proseTarget.innerHTML = `<p>${escapeHtml("Could not load project writing.")}</p>`;
    }
}

function showWritingPageError(message) {
    const titleTarget = document.querySelector("[data-writing-title]");
    const metaTarget = document.querySelector("[data-writing-meta]");
    const proseTarget = document.querySelector("[data-writing-prose]");

    if (titleTarget) {
        titleTarget.textContent = "Writing unavailable";
    }
    if (metaTarget) {
        metaTarget.textContent = message;
    }
    if (proseTarget) {
        proseTarget.innerHTML = `<p>${escapeHtml(message)}</p>`;
    }
}

function routeWritingSlug(slug) {
    if (slug.startsWith("projects-")) {
        return { backPath: "/projects/", backLabel: "Projects" };
    }

    if (slug.startsWith("essays-travel-")) {
        return { backPath: "/essays/travel/", backLabel: "Travel Essays" };
    }

    if (slug.startsWith("essays-miscellaneous-")) {
        return { backPath: "/essays/miscellaneous/", backLabel: "Miscellaneous Essays" };
    }

    return { backPath: "/writings/", backLabel: "Writings" };
}

function stripLeadingTitle(markdown) {
    return markdown.replace(/^#\s+.+\n+(?=\S)/, "");
}

function renderMarkdown(markdown) {
    const lines = markdown.replace(/\r\n/g, "\n").split("\n");
    const html = [];
    let paragraph = [];
    let listType = null;
    let codeBlock = null;

    const flushParagraph = () => {
        if (!paragraph.length) {
            return;
        }
        html.push(`<p>${parseInlineMarkdown(paragraph.join(" "))}</p>`);
        paragraph = [];
    };

    const closeList = () => {
        if (!listType) {
            return;
        }
        html.push(listType === "ol" ? "</ol>" : "</ul>");
        listType = null;
    };

    const flushCodeBlock = () => {
        if (!codeBlock) {
            return;
        }
        const languageClass = codeBlock.language ? ` class="language-${escapeHtml(codeBlock.language)}"` : "";
        html.push(`<pre><code${languageClass}>${escapeHtml(codeBlock.lines.join("\n"))}</code></pre>`);
        codeBlock = null;
    };

    lines.forEach((line) => {
        const trimmed = line.trim();

        if (codeBlock) {
            if (/^```/.test(trimmed)) {
                flushCodeBlock();
            } else {
                codeBlock.lines.push(line);
            }
            return;
        }

        if (/^```/.test(trimmed)) {
            flushParagraph();
            closeList();
            codeBlock = {
                language: trimmed.replace(/^```/, "").trim(),
                lines: [],
            };
            return;
        }

        if (!trimmed) {
            flushParagraph();
            closeList();
            return;
        }

        const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (headingMatch) {
            flushParagraph();
            closeList();
            const level = headingMatch[1].length;
            html.push(`<h${level}>${parseInlineMarkdown(headingMatch[2])}</h${level}>`);
            return;
        }

        if (/^[-*]\s+/.test(trimmed)) {
            flushParagraph();
            if (listType !== "ul") {
                closeList();
                html.push("<ul>");
                listType = "ul";
            }
            html.push(`<li>${parseInlineMarkdown(trimmed.replace(/^[-*]\s+/, ""))}</li>`);
            return;
        }

        if (/^\d+\.\s+/.test(trimmed)) {
            flushParagraph();
            if (listType !== "ol") {
                closeList();
                html.push("<ol>");
                listType = "ol";
            }
            html.push(`<li>${parseInlineMarkdown(trimmed.replace(/^\d+\.\s+/, ""))}</li>`);
            return;
        }

        if (/^>\s?/.test(trimmed)) {
            flushParagraph();
            closeList();
            html.push(`<blockquote><p>${parseInlineMarkdown(trimmed.replace(/^>\s?/, ""))}</p></blockquote>`);
            return;
        }

        if (/^---+$/.test(trimmed)) {
            flushParagraph();
            closeList();
            html.push("<hr>");
            return;
        }

        paragraph.push(trimmed);
    });

    flushParagraph();
    closeList();
    flushCodeBlock();

    return html.join("\n");
}

function parseInlineMarkdown(text) {
    let output = escapeHtml(text);

    output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
        return `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`;
    });

    output = output.replace(/`([^`]+)`/g, (_match, code) => `<code>${escapeHtml(code)}</code>`);
    output = output.replace(/\*\*([^*]+)\*\*/g, (_match, strong) => `<strong>${escapeHtml(strong)}</strong>`);
    output = output.replace(/\*([^*]+)\*/g, (_match, emphasis) => `<em>${escapeHtml(emphasis)}</em>`);

    return output;
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function initLoveLetters() {
    const form = document.querySelector("[data-love-letters-form]");
    if (!form) {
        return;
    }

    const passwordInput = form.querySelector('input[name="password"]');
    const status = document.querySelector("[data-love-letters-status]");
    const output = document.querySelector("[data-love-letters-output]");
    const archiveTitle = document.querySelector("[data-archive-title]");
    const archiveIntro = document.querySelector("[data-archive-intro]");
    const lettersList = document.querySelector("[data-letters-list]");
    const submitButton = form.querySelector('button[type="submit"]');
    let bundlePromise;

    const setStatus = (message, state = "info") => {
        if (!status) {
            return;
        }
        status.textContent = message;
        status.dataset.state = state;
    };

    const getBundle = async () => {
        if (!bundlePromise) {
            const version = encodeURIComponent(getSiteVersion());
            bundlePromise = fetch(`/data/love-letters.enc.json?v=${version}`, { cache: "no-store" }).then(async (response) => {
                if (!response.ok) {
                    throw new Error("Could not load ciphertext bundle.");
                }
                return response.json();
            });
        }
        return bundlePromise;
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!passwordInput || !lettersList || !archiveTitle || !archiveIntro || !output) {
            return;
        }

        const passphrase = passwordInput.value.trim();
        if (!passphrase) {
            setStatus("Enter the passphrase first.", "error");
            return;
        }

        submitButton.disabled = true;
        setStatus("Deriving key and decrypting...", "pending");

        try {
            const bundle = await getBundle();
            if (!bundle.configured) {
                setStatus(bundle.message || "The archive has not been initialized yet.", "info");
                output.hidden = true;
                return;
            }

            const plaintext = await decryptArchive(bundle, passphrase);
            const archive = JSON.parse(plaintext);
            renderArchive(archive, { archiveTitle, archiveIntro, lettersList });
            output.hidden = false;
            form.reset();
            setStatus("Archive unlocked.", "success");
        } catch (error) {
            console.error(error);
            output.hidden = true;
            setStatus("Incorrect passphrase or unreadable archive.", "error");
        } finally {
            submitButton.disabled = false;
        }
    });
}

async function decryptArchive(bundle, passphrase) {
    if (!window.crypto || !window.crypto.subtle) {
        throw new Error("Web Crypto is not available.");
    }

    const subtle = window.crypto.subtle;
    const encoder = new TextEncoder();
    const passwordKey = await subtle.importKey("raw", encoder.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
    const key = await subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: decodeBase64(bundle.kdf.salt),
            iterations: bundle.kdf.iterations,
            hash: bundle.kdf.hash,
        },
        passwordKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
    );

    const decrypted = await subtle.decrypt(
        {
            name: "AES-GCM",
            iv: decodeBase64(bundle.cipher.iv),
            tagLength: bundle.cipher.tagLength,
        },
        key,
        decodeBase64(bundle.ciphertext)
    );

    return new TextDecoder().decode(decrypted);
}

function renderArchive(archive, targets) {
    const { archiveTitle, archiveIntro, lettersList } = targets;
    const title = typeof archive.archiveTitle === "string" ? archive.archiveTitle : "Love Letters";
    const intro = typeof archive.intro === "string"
        ? archive.intro
        : "Unlocked locally in your browser.";
    const letters = Array.isArray(archive.letters) ? archive.letters : [];

    archiveTitle.textContent = title;
    archiveIntro.textContent = intro;
    lettersList.replaceChildren();

    letters.forEach((letter) => {
        const shell = document.createElement("article");
        shell.className = "letter-shell";

        const heading = document.createElement("h2");
        heading.textContent = typeof letter.title === "string" ? letter.title : "Untitled";
        shell.appendChild(heading);

        const metaBits = [];
        if (typeof letter.date === "string" && letter.date) {
            metaBits.push(letter.date);
        }
        if (typeof letter.location === "string" && letter.location) {
            metaBits.push(letter.location);
        }
        if (metaBits.length) {
            const meta = document.createElement("p");
            meta.className = "letter-meta";
            meta.textContent = metaBits.join(" / ");
            shell.appendChild(meta);
        }

        const body = document.createElement("div");
        body.className = "letter-body";
        const paragraphs = normalizeParagraphs(letter.body);
        paragraphs.forEach((paragraphText) => {
            const paragraph = document.createElement("p");
            paragraph.textContent = paragraphText;
            body.appendChild(paragraph);
        });
        shell.appendChild(body);

        if (typeof letter.signoff === "string" && letter.signoff) {
            const signoff = document.createElement("p");
            signoff.className = "letter-meta";
            signoff.textContent = letter.signoff;
            shell.appendChild(signoff);
        }

        lettersList.appendChild(shell);
    });
}

function normalizeParagraphs(value) {
    if (Array.isArray(value)) {
        return value
            .filter((item) => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(/\n\s*\n/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

function decodeBase64(value) {
    const binary = window.atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
}
