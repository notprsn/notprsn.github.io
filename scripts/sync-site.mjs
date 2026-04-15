import { readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");
const dataDir = resolve(repoRoot, "data");
const SITE_ORIGIN = "https://notprsn.github.io";
const SITE_NAME = "Prasann Iyer";
const SITE_IMAGE = `${SITE_ORIGIN}/img/profile.JPEG`;
const GOOGLE_SITE_VERIFICATION = "GZtrgh8Ax2owrBJKA_MCv-YCBtpKMIvS2hiNTc_GqU0";
const SOCIAL_LINKS = [
    "https://github.com/notprsn",
    "https://www.linkedin.com/in/prsn/",
    "https://x.com/fireballthecat",
    "https://bollywoodle.app",
    "https://cloudscript.lalalab.tech",
];
const TRAVEL_ESSAY_CONFIG = {
    directory: resolve(repoRoot, "essays", "travel"),
    backPath: "/essays/travel/",
    backLabel: "Travel Essays",
    descriptionLabel: "travel essay",
};
const SEO_OVERRIDES = {
    "/": {
        title: "Prasann Iyer",
        description: "Personal website of Prasann Iyer: work, projects, essays, Bollywoodle, CloudScript, math, music, and small web experiments.",
        schemaType: "home",
    },
    "/about/": {
        description: "About Prasann Iyer: math, music, curiosity, and whatever intuition says to build next.",
    },
    "/work/": {
        description: "Professional work experience, scholastic achievements, technical skills, and CV of Prasann Iyer.",
    },
    "/projects/": {
        description: "Projects by Prasann Iyer, including Bollywoodle, CloudScript, and other web experiments.",
    },
    "/projects/bollywoodle/story/": {
        description: "How Prasann Iyer built Bollywoodle, a daily Bollywood music guessing game, and the story behind it.",
        schemaType: "creativeWork",
    },
    "/projects/bollywoodle/humming/": {
        description: "The humming algorithm behind Bollywoodle Musicle, explained by Prasann Iyer.",
        schemaType: "creativeWork",
    },
    "/projects/cloudscript/story/": {
        description: "The story behind CloudScript, a cloud-message web app by Prasann Iyer.",
        schemaType: "creativeWork",
    },
    "/projects/cloudscript/message/": {
        description: "A CloudScript message by Prasann Iyer.",
        schemaType: "creativeWork",
    },
    "/fun/": {
        description: "Pretty math experiments and visual toys by Prasann Iyer.",
    },
    "/essays/": {
        description: "Essay themes and writing queues for Prasann Iyer.",
    },
    "/essays/travel/": {
        description: "Travel atlas and essay index for Prasann Iyer.",
    },
};
const NOINDEX_ROUTES = new Set([
    "/love-letters/",
]);

const version = buildVersion();
const generatedAt = new Date().toISOString();

const essayEntries = await collectEssayEntries();
await syncEssayPages(essayEntries);
await rm(resolve(dataDir, "writings-manifest.json"), { force: true });
await writeJson(resolve(dataDir, "site-meta.json"), { version, generatedAt });

const htmlFiles = await collectFiles(repoRoot, (filePath) => extname(filePath) === ".html");

for (const filePath of htmlFiles) {
    const source = await readFile(filePath, "utf8");
    const updated = await updateHtml(filePath, source);
    if (updated !== source) {
        await writeFile(filePath, updated, "utf8");
    }
}

await writeRobotsTxt();
await writeSitemapXml(htmlFiles);

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
${buildFaviconLinks(assetPrefix)}
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
            <span>&copy; <span data-current-year>${currentYear}</span> PI - All rights reversed</span>
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

function buildFaviconLinks(assetPrefix) {
    const basePath = `${assetPrefix}img/favicon`;
    return [
        `<link href="${basePath}/favicon.ico" rel="icon" sizes="any">`,
        `<link href="${basePath}/favicon.svg" rel="icon" type="image/svg+xml">`,
        `<link href="${basePath}/favicon-32x32.png" rel="icon" type="image/png" sizes="32x32">`,
        `<link href="${basePath}/favicon-16x16.png" rel="icon" type="image/png" sizes="16x16">`,
        `<link href="${basePath}/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180">`,
        `<link href="${basePath}/site.webmanifest" rel="manifest">`,
        `<link href="${basePath}/safari-pinned-tab.svg" rel="mask-icon" color="#78ff92">`,
        `<meta name="theme-color" content="#05070a">`,
        `<meta name="msapplication-TileColor" content="#05070a">`,
        `<meta name="msapplication-config" content="${basePath}/browserconfig.xml">`,
    ].map((line) => `    ${line}`).join("\n");
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

function escapeXml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}

async function updateHtml(filePath, source) {
    let updated = source;
    const route = routeFromFile(filePath);
    const seo = buildSeoForPage(route, updated);

    updated = await renderMarkdownBackedContent(updated);
    updated = ensureTitle(updated, seo.title);
    updated = ensureMeta(updated, "description", seo.description);
    updated = ensureMeta(updated, "site-version", version);
    updated = ensureGoogleSiteVerification(updated, route);
    updated = ensureRobotsMeta(updated, route);
    updated = stripCacheMeta(updated);
    updated = stripGoogleAnalytics(updated);
    updated = stripManagedSeo(updated);
    updated = ensureFaviconLinks(updated);
    updated = ensureManagedSeo(updated, seo);
    updated = updated.replace(
        /((?:href|src)=["'])(?!https?:\/\/|\/\/|mailto:|#)([^"']+\.(?:css|js))(?:\?v=[^"']*)?(["'])/g,
        `$1$2?v=${version}$3`
    );

    return updated;
}

async function renderMarkdownBackedContent(source) {
    let updated = source;
    const articlePattern = /<article\b[^>]*\bdata-story-file="([^"]+)"[^>]*>[\s\S]*?<\/article>/g;
    const articles = [...source.matchAll(articlePattern)];

    for (const articleMatch of articles) {
        const [article, storyFile] = articleMatch;
        const markdownPath = resolve(repoRoot, storyFile.replace(/^\//, ""));
        let markdown = "";

        try {
            markdown = await readFile(markdownPath, "utf8");
        } catch {
            continue;
        }

        const shouldStripTitle = article.includes("data-strip-leading-title") || article.includes("data-work-story-page");
        const renderedMarkdown = renderMarkdown(shouldStripTitle ? stripLeadingTitle(markdown) : markdown);
        const renderedArticle = article.replace(
            /(<div\b[^>]*\bdata-(?:work-story|project-markdown)-prose\b[^>]*>\n)([\s\S]*?)(\n\s*<\/div>)/,
            (_match, openTag, _content, closeTag) => `${openTag}${indentMultiline(renderedMarkdown, 20)}${closeTag}`
        );

        updated = updated.replace(article, renderedArticle);
    }

    return updated;
}

function ensureTitle(source, title) {
    const tag = `<title>${escapeHtml(title)}</title>`;

    if (/<title>[^<]*<\/title>/.test(source)) {
        return source.replace(/<title>[^<]*<\/title>/, tag);
    }

    return source.replace(/(<head>\n)/, `$1    ${tag}\n`);
}

function ensureMeta(source, name, content) {
    const tag = `<meta name="${name}" content="${escapeHtml(content)}">`;
    const withoutExisting = stripMetaByName(source, name);
    const preferredAnchor =
        name === "description"
            ? /(<meta name="viewport" content="[^"]*">\n)/
            : /(<meta name="author" content="[^"]*">\n)/;
    const anchors = [
        preferredAnchor,
        /(<meta name="viewport" content="[^"]*">\n)/,
        /(<meta charset="utf-8">\n)/,
        /(<head>\n)/,
    ];

    for (const anchor of anchors) {
        if (anchor.test(withoutExisting)) {
            return withoutExisting.replace(anchor, `$1    ${tag}\n`);
        }
    }

    return withoutExisting;
}

function stripMetaByName(source, name) {
    const pattern = new RegExp(`^\\s*<meta\\b(?=[^>]*\\bname="${escapeRegExp(name)}")[^>]*>\\n?`, "gm");
    return source.replace(pattern, "");
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function ensureGoogleSiteVerification(source, route) {
    if (route !== "/") {
        return stripMetaByName(source, "google-site-verification");
    }

    return ensureMeta(source, "google-site-verification", GOOGLE_SITE_VERIFICATION);
}

function ensureRobotsMeta(source, route) {
    if (shouldNoindex(route)) {
        return ensureMeta(source, "robots", "noindex");
    }

    return source.replace(/^\s*<meta name="robots" content="[^"]*">\n/gm, "");
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

function stripManagedSeo(source) {
    return source
        .replace(/^\s*<(?:link|meta)\b(?=[^>]*\bdata-managed-seo\b)[^>]*>\n/gm, "")
        .replace(/^\s*<script type="application\/ld\+json" data-site-schema>[\s\S]*?<\/script>\n/gm, "");
}

function ensureFaviconLinks(source) {
    const assetPrefix = source.match(/<link href="([^"]*)img\/favicon(?:\/[^"]+|\.[^"]+)"/)?.[1] ||
        source.match(/<link href="([^"]*)css\/style\.css/)?.[1] ||
        "";
    const withoutFavicons = source
        .replace(/^\s*<link\b(?=[^>]*\brel="(?:icon|apple-touch-icon|manifest|mask-icon)")[^>]*>\n/gm, "")
        .replace(/^\s*<meta name="(?:theme-color|msapplication-TileColor|msapplication-config)" content="[^"]*">\n/gm, "");

    return withoutFavicons.replace(/(<title>[^<]*<\/title>\n)/, `$1${buildFaviconLinks(assetPrefix)}\n`);
}

function ensureManagedSeo(source, seo) {
    const tags = buildManagedSeoTags(seo);
    return source.replace(/(<title>[^<]*<\/title>\n)/, `$1${tags}\n`);
}

function buildManagedSeoTags(seo) {
    const schema = buildStructuredData(seo);
    const tags = [
        `<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" data-managed-seo>`,
        `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" data-managed-seo>`,
        `<meta property="og:type" content="${seo.schemaType === "creativeWork" ? "article" : "website"}" data-managed-seo>`,
        `<meta property="og:title" content="${escapeHtml(seo.title)}" data-managed-seo>`,
        `<meta property="og:description" content="${escapeHtml(seo.description)}" data-managed-seo>`,
        `<meta property="og:url" content="${escapeHtml(seo.canonicalUrl)}" data-managed-seo>`,
        `<meta property="og:image" content="${escapeHtml(SITE_IMAGE)}" data-managed-seo>`,
        `<meta name="twitter:card" content="summary_large_image" data-managed-seo>`,
        `<meta name="twitter:title" content="${escapeHtml(seo.title)}" data-managed-seo>`,
        `<meta name="twitter:description" content="${escapeHtml(seo.description)}" data-managed-seo>`,
        `<meta name="twitter:image" content="${escapeHtml(SITE_IMAGE)}" data-managed-seo>`,
        `<script type="application/ld+json" data-site-schema>${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`,
    ];

    return tags.map((tag) => `    ${tag}`).join("\n");
}

function buildStructuredData(seo) {
    const person = {
        "@type": "Person",
        "@id": `${SITE_ORIGIN}/#prasann-iyer`,
        name: "Prasann Iyer",
        alternateName: "prasann",
        url: `${SITE_ORIGIN}/`,
        sameAs: SOCIAL_LINKS,
        knowsAbout: [
            "Quantitative trading",
            "Mathematics",
            "Music",
            "Bollywoodle",
            "CloudScript",
            "Web projects",
        ],
    };
    const webSite = {
        "@type": "WebSite",
        "@id": `${SITE_ORIGIN}/#website`,
        name: SITE_NAME,
        url: `${SITE_ORIGIN}/`,
        publisher: {
            "@id": person["@id"],
        },
    };
    const webPage = {
        "@type": seo.schemaType === "creativeWork" ? "CreativeWork" : "WebPage",
        "@id": `${seo.canonicalUrl}#webpage`,
        url: seo.canonicalUrl,
        name: seo.title,
        description: seo.description,
        isPartOf: {
            "@id": webSite["@id"],
        },
        author: {
            "@id": person["@id"],
        },
    };

    if (seo.schemaType === "home") {
        return {
            "@context": "https://schema.org",
            "@graph": [
                person,
                webSite,
                {
                    ...webPage,
                    mainEntity: {
                        "@id": person["@id"],
                    },
                },
            ],
        };
    }

    return {
        "@context": "https://schema.org",
        "@graph": [
            person,
            webSite,
            webPage,
        ],
    };
}

function buildSeoForPage(route, source) {
    const title = SEO_OVERRIDES[route]?.title || extractTagContent(source, "title") || SITE_NAME;
    const description =
        SEO_OVERRIDES[route]?.description ||
        extractMetaContent(source, "description") ||
        "Personal website of Prasann Iyer.";
    const schemaType = SEO_OVERRIDES[route]?.schemaType || "webPage";

    return {
        route,
        title,
        description,
        schemaType,
        canonicalUrl: buildCanonicalUrl(route),
    };
}

function routeFromFile(filePath) {
    const relativePath = relative(repoRoot, filePath).replaceAll("\\", "/");

    if (relativePath === "index.html") {
        return "/";
    }

    if (relativePath.endsWith("/index.html")) {
        return `/${relativePath.replace(/\/index\.html$/, "/")}`;
    }

    return `/${relativePath}`;
}

function buildCanonicalUrl(route) {
    return `${SITE_ORIGIN}${route}`;
}

function extractTagContent(source, tagName) {
    const match = source.match(new RegExp(`<${tagName}>([^<]*)<\\/${tagName}>`));
    return match ? match[1].trim() : "";
}

function extractMetaContent(source, name) {
    const match = source.match(new RegExp(`<meta\\b(?=[^>]*\\bname="${escapeRegExp(name)}")[^>]*\\bcontent="([^"]*)"[^>]*>`));
    return match ? match[1].trim() : "";
}

function shouldNoindex(route) {
    return route.startsWith("/puzzles/") || NOINDEX_ROUTES.has(route);
}

function shouldIncludeInSitemap(route) {
    return route.endsWith("/") && !shouldNoindex(route);
}

async function writeRobotsTxt() {
    const contents = [
        "User-agent: *",
        "Allow: /",
        "Disallow: /private/",
        "Disallow: /data/love-letters.enc.json",
        "",
        `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
        "",
    ].join("\n");

    await writeFile(resolve(repoRoot, "robots.txt"), contents, "utf8");
}

async function writeSitemapXml(htmlFiles) {
    const routes = htmlFiles
        .map(routeFromFile)
        .filter(shouldIncludeInSitemap)
        .sort((left, right) => {
            if (left === "/") {
                return -1;
            }
            if (right === "/") {
                return 1;
            }
            return left.localeCompare(right);
        });
    const lastmod = generatedAt.slice(0, 10);
    const urls = routes.map((route) => {
        const priority = route === "/" ? "1.0" : route.startsWith("/projects/") || route === "/work/" ? "0.8" : "0.6";

        return [
            "  <url>",
            `    <loc>${escapeXml(buildCanonicalUrl(route))}</loc>`,
            `    <lastmod>${lastmod}</lastmod>`,
            `    <priority>${priority}</priority>`,
            "  </url>",
        ].join("\n");
    });
    const contents = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls,
        "</urlset>",
        "",
    ].join("\n");

    await writeFile(resolve(repoRoot, "sitemap.xml"), contents, "utf8");
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
