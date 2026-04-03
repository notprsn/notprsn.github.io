import { readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");
const dataDir = resolve(repoRoot, "data");
const TRAVEL_ESSAY_CONFIG = {
    directory: resolve(repoRoot, "essays", "travel"),
    backPath: "/essays/travel/",
    backLabel: "Travel Essays",
    descriptionLabel: "travel essay",
};

const version = buildVersion();
const generatedAt = new Date().toISOString();

const essayEntries = await collectEssayEntries();
await syncEssayPages(essayEntries);
await rm(resolve(dataDir, "writings-manifest.json"), { force: true });
await writeJson(resolve(dataDir, "site-meta.json"), { version, generatedAt });

const htmlFiles = await collectFiles(repoRoot, (filePath) => extname(filePath) === ".html");

for (const filePath of htmlFiles) {
    const source = await readFile(filePath, "utf8");
    const updated = updateHtml(source);
    if (updated !== source) {
        await writeFile(filePath, updated, "utf8");
    }
}

console.log(`Synced site metadata at version ${version}`);

function buildVersion() {
    return new Date().toISOString().replace(/\D/g, "");
}

async function collectEssayEntries() {
    const entries = [];
    const folders = await readdir(TRAVEL_ESSAY_CONFIG.directory, { withFileTypes: true });

    for (const folder of folders) {
        if (!folder.isDirectory()) {
            continue;
        }

        const slug = folder.name;
        const contentPath = resolve(TRAVEL_ESSAY_CONFIG.directory, slug, "content.md");
        let markdown = "";

        try {
            markdown = await readFile(contentPath, "utf8");
        } catch {
            continue;
        }

        entries.push({
            slug,
            markdown,
            hasContent: Boolean(markdown.trim()),
            outputPath: resolve(TRAVEL_ESSAY_CONFIG.directory, slug, "index.html"),
            route: `${TRAVEL_ESSAY_CONFIG.backPath}${encodeURIComponent(slug)}/`,
            title: extractTitle(markdown) || fallbackTitle(slug),
            ...TRAVEL_ESSAY_CONFIG,
        });
    }

    return entries.sort((left, right) => left.route.localeCompare(right.route));
}

async function syncEssayPages(entries) {
    for (const entry of entries) {
        if (!entry.hasContent) {
            await rm(entry.outputPath, { force: true });
            continue;
        }

        await writeFile(entry.outputPath, buildTravelEssayHtml(entry), "utf8");
    }
}

function buildTravelEssayHtml(entry) {
    const assetPrefix = buildAssetPrefix(entry.outputPath);
    const proseMarkdown = stripLeadingTitle(entry.markdown);
    const proseHtml = renderMarkdown(proseMarkdown.trim() ? proseMarkdown : entry.markdown);
    const title = escapeHtml(entry.title);
    const backLabel = escapeHtml(entry.backLabel);
    const descriptionLabel = escapeHtml(entry.descriptionLabel);
    const currentYear = new Date().getFullYear().toString();
    const heroMarkup = `        <section class="paper-hero paper-hero--work work-story-page__hero">
            <div>
                <a class="story-back-link work-story-page__back" href="${entry.backPath}">&lt; Back to ${backLabel}</a>
                <h1 class="paper-ledger__title work-story-page__title">${title}</h1>
            </div>
            <div class="paper-hero__rule" aria-hidden="true"></div>
        </section>`;
    const articleMarkup = `        <section class="paper-section">
            <article class="paper-panel work-story-page__panel">
                <div class="writing-prose work-story-page__prose">
${indentMultiline(proseHtml, 20)}
                </div>
            </article>
        </section>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${title}, a ${descriptionLabel} by Prasann Iyer.">
    <meta name="author" content="Prasann Iyer">
    <meta name="site-version" content="${version}">
    <title>${title} | Prasann Iyer</title>
    <link href="${assetPrefix}img/favicon.png" rel="icon" type="image/png" sizes="128x128">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
    <link href="${assetPrefix}css/style.css" rel="stylesheet">
    <link href="${assetPrefix}css/pages/essays.css" rel="stylesheet">
    <link href="${assetPrefix}css/pages/work.css" rel="stylesheet">
</head>
<body class="page-paper page-travel-story">
    <header class="site-header">
        <div class="site-nav-shell">
            <a class="site-brand" href="/">Prasann Iyer</a>
            <div class="site-nav-tools">
            <nav class="site-nav" aria-label="Primary">
                <a href="/work/">Work</a>
                <a href="/projects/">Projects</a>
                <a href="/fun/">Fun Stuff</a>
                <a href="/essays/" aria-current="page">Essays</a>
            </nav>
            </div>
        </div>
    </header>

    <main class="page-main page-main--paper">
${heroMarkup}
${articleMarkup}
    </main>

    <footer class="site-footer">
        <div class="footer-shell">
            <span>${backLabel}</span>
            <div class="footer-links">
                <a href="/essays/">Essays</a>
                <span class="footer-link-placeholder">Gallery</span>
                <span class="footer-link-placeholder">Glossary</span>
                <a href="https://github.com/notprsn" target="_blank" rel="noreferrer">GitHub</a>
            </div>
            <span>&copy; <span data-current-year>${currentYear}</span> Prasann Iyer</span>
        </div>
    </footer>

    <script type="module" src="${assetPrefix}js/site.js"></script>
</body>
</html>
`;
}

function buildAssetPrefix(filePath) {
    const fromFileDirToRoot = relative(dirname(filePath), repoRoot).replaceAll("\\", "/");
    return fromFileDirToRoot ? `${fromFileDirToRoot}/` : "";
}

function indentMultiline(value, spaces) {
    const indentation = " ".repeat(spaces);
    return value
        .split("\n")
        .map((line) => `${indentation}${line}`)
        .join("\n");
}

function extractTitle(markdown) {
    const match = markdown.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : "";
}

function fallbackTitle(slug) {
    return slug
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
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

function updateHtml(source) {
    let updated = source;

    updated = ensureMeta(updated, "site-version", version);
    updated = stripCacheMeta(updated);
    updated = stripGoogleAnalytics(updated);
    updated = ensureFaviconLink(updated);
    updated = updated.replace(
        /((?:href|src)=["'])(?!https?:\/\/|\/\/|mailto:|#)([^"']+\.(?:css|js))(?:\?v=[^"']*)?(["'])/g,
        `$1$2?v=${version}$3`
    );

    return updated;
}

function ensureMeta(source, name, content) {
    const tag = `<meta name="${name}" content="${content}">`;
    const pattern = new RegExp(`<meta name="${name}" content="[^"]*">`);

    if (pattern.test(source)) {
        return source.replace(pattern, tag);
    }

    return source.replace(/(<meta name="author" content="[^"]*">\n)/, `$1    ${tag}\n`);
}

function stripCacheMeta(source) {
    return source.replace(/^\s*<meta http-equiv="(?:Cache-Control|Pragma|Expires)" content="[^"]*">\n/gm, "");
}

function stripGoogleAnalytics(source) {
    return source
        .replace(/^\s*<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"]+"><\/script>\n?/gm, "")
        .replace(
            /^\s*<script>\s*window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\];[\s\S]*?gtag\("config",\s*"[^"]+"\);\s*<\/script>\n?/gm,
            ""
        );
}

function ensureFaviconLink(source) {
    return source.replace(
        /<link href="([^"]*?)favicon\.(?:ico|png|svg)" rel="icon" type="[^"]*"(?: sizes="[^"]*")?>/,
        '<link href="$1favicon.png" rel="icon" type="image/png" sizes="128x128">'
    );
}

async function collectFiles(directory, predicate) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = resolve(directory, entry.name);

        if (entry.isDirectory()) {
            if (
                entry.name === ".git" ||
                entry.name === "references" ||
                entry.name === "private" ||
                entry.name === "skills" ||
                entry.name === "node_modules"
            ) {
                continue;
            }
            files.push(...(await collectFiles(fullPath, predicate)));
            continue;
        }

        if (entry.isFile() && predicate(fullPath)) {
            files.push(fullPath);
        }
    }

    return files;
}

async function writeJson(filePath, value) {
    await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
