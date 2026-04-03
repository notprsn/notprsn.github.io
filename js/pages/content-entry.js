const onReady = window.Site?.onReady ?? ((callback) => callback());
const fetchVersionedResource =
    window.Site?.fetchVersionedResource ??
    ((resourcePath, options = {}) => fetch(resourcePath, options));

onReady(initContentEntries);

function initContentEntries() {
    initWorkStoryPage();
    initProjectMarkdownPage();
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
        const response = await fetchVersionedResource(storyFile);
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
        const response = await fetchVersionedResource(storyFile);
        if (!response.ok) {
            throw new Error("Could not load project markdown.");
        }

        const markdown = await response.text();
        proseTarget.innerHTML = renderMarkdown(stripTitle ? stripLeadingTitle(markdown) : markdown);
        enhanceProjectMarkdown(root, proseTarget);
    } catch (error) {
        console.error(error);
        proseTarget.innerHTML = `<p>${escapeHtml("Could not load project writing.")}</p>`;
    }
}

function enhanceProjectMarkdown(root, proseTarget) {
    if (!document.body.classList.contains("page-project-bollywoodle")) {
        return;
    }

    const fitCodeBlocks = () => fitBollywoodleMobileCodeBlocks(proseTarget);

    fitCodeBlocks();

    if (document.fonts?.ready) {
        document.fonts.ready.then(fitCodeBlocks).catch(() => {});
    }

    if (!root.dataset.codeBlocksFitBound) {
        let frame = 0;
        const scheduleFit = () => {
            if (frame) {
                cancelAnimationFrame(frame);
            }
            frame = requestAnimationFrame(() => {
                frame = 0;
                fitCodeBlocks();
            });
        };

        window.addEventListener("resize", scheduleFit, { passive: true });
        root.dataset.codeBlocksFitBound = "true";
    }
}

function fitBollywoodleMobileCodeBlocks(proseTarget) {
    const codeBlocks = proseTarget.querySelectorAll("pre code");

    codeBlocks.forEach((codeBlock) => {
        codeBlock.style.fontSize = "";

        if (window.innerWidth > 720) {
            return;
        }

        const pre = codeBlock.closest("pre");
        if (!pre) {
            return;
        }

        const safeInlinePadding = 10;
        const availableWidth = Math.max(pre.clientWidth - safeInlinePadding, 0);
        const baseFontSize = parseFloat(getComputedStyle(codeBlock).fontSize);

        if (!availableWidth || !Number.isFinite(baseFontSize)) {
            return;
        }

        let nextFontSize = baseFontSize;

        for (let attempt = 0; attempt < 3; attempt += 1) {
            const contentWidth = codeBlock.scrollWidth;

            if (!contentWidth || contentWidth <= availableWidth) {
                break;
            }

            nextFontSize *= availableWidth / contentWidth;
            codeBlock.style.fontSize = `${nextFontSize}px`;
        }
    });
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
        const languageData = codeBlock.language ? ` data-code-language="${escapeHtml(codeBlock.language)}"` : "";
        html.push(`<pre${languageData}><code${languageClass}>${escapeHtml(codeBlock.lines.join("\n"))}</code></pre>`);
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
        return `<a href="${url}">${label}</a>`;
    });
    output = output.replace(/`([^`]+)`/g, (_match, code) => `<code>${code}</code>`);
    output = output.replace(/\*\*([^*]+)\*\*/g, (_match, strong) => `<strong>${strong}</strong>`);
    output = output.replace(/\*([^*]+)\*/g, (_match, emphasis) => `<em>${emphasis}</em>`);

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
