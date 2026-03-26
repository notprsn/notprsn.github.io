#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const namedEntities = {
    amp: "&",
    apos: "'",
    copy: "©",
    gt: ">",
    hellip: "...",
    laquo: "«",
    ldquo: '"',
    lsquo: "'",
    mdash: "-",
    nbsp: " ",
    ndash: "-",
    quot: '"',
    raquo: "»",
    rdquo: '"',
    rsquo: "'",
    trade: "™",
    zwnj: "",
    zwj: "",
};

const usage = `Usage:
  node scripts/extract-page-text.mjs <url> [--json]

Examples:
  node scripts/extract-page-text.mjs https://example.com
  node scripts/extract-page-text.mjs file:///tmp/page.html --json

Notes:
  - Extracts text already present in the fetched HTML.
  - Does not execute page JavaScript.
  - Does not bypass login walls, paywalls, or other access controls.
`;

const { inputUrl, asJson } = parseArgs(process.argv.slice(2));

if (!inputUrl) {
    console.error(usage);
    process.exit(1);
}

const html = await loadHtml(inputUrl);
const result = extractPageText(html, inputUrl);

if (asJson) {
    console.log(`${JSON.stringify(result, null, 2)}\n`);
} else {
    const parts = [];

    if (result.title) {
        parts.push(`# ${result.title}`);
    }

    parts.push(`Source: ${result.url}`);
    parts.push(result.text);

    console.log(`${parts.filter(Boolean).join("\n\n")}\n`);
}

function parseArgs(args) {
    let inputUrl = "";
    let asJson = false;

    for (const arg of args) {
        if (arg === "--json") {
            asJson = true;
            continue;
        }

        if (arg === "--help" || arg === "-h") {
            console.log(usage);
            process.exit(0);
        }

        if (!inputUrl) {
            inputUrl = arg;
            continue;
        }

        throw new Error(`Unknown argument: ${arg}`);
    }

    return { inputUrl, asJson };
}

async function loadHtml(inputUrl) {
    const parsed = new URL(inputUrl);

    if (parsed.protocol === "file:") {
        return readFile(fileURLToPath(parsed), "utf8");
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:" && parsed.protocol !== "data:") {
        throw new Error(`Unsupported URL protocol: ${parsed.protocol}`);
    }

    const response = await fetch(parsed, {
        headers: {
            "user-agent": "notprsn.github.io text extractor/1.0",
            accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1",
        },
        redirect: "follow",
    });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return response.text();
}

function extractPageText(html, url) {
    const normalizedHtml = html.replace(/\r\n?/g, "\n");
    const title = decodeEntities(extractTitle(normalizedHtml));
    const region = pickContentRegion(normalizedHtml);
    const text = htmlToText(region || normalizedHtml);

    return {
        url,
        title,
        text,
    };
}

function extractTitle(html) {
    const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
        return titleMatch[1].trim();
    }

    const ogTitleMatch = html.match(
        /<meta\b[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i
    );
    if (ogTitleMatch) {
        return ogTitleMatch[1].trim();
    }

    return "";
}

function pickContentRegion(html) {
    const candidates = [
        ...findRegions(html, /<article\b[^>]*>([\s\S]*?)<\/article>/gi),
        ...findRegions(html, /<main\b[^>]*>([\s\S]*?)<\/main>/gi),
        ...findRegions(
            html,
            /<([a-z0-9:-]+)\b[^>]*\brole=["']main["'][^>]*>([\s\S]*?)<\/\1>/gi,
            2
        ),
        ...findRegions(html, /<body\b[^>]*>([\s\S]*?)<\/body>/gi),
    ];

    if (!candidates.length) {
        return html;
    }

    candidates.sort((left, right) => right.length - left.length);
    return candidates[0];
}

function findRegions(html, pattern, groupIndex = 1) {
    return Array.from(html.matchAll(pattern), (match) => match[groupIndex]).filter(Boolean);
}

function htmlToText(html) {
    let text = html;

    text = text.replace(/<!--[\s\S]*?-->/g, "\n");
    text = stripRepeatedBlocks(text, /<(script|style|noscript|template|svg|canvas|iframe)\b[^>]*>[\s\S]*?<\/\1>/gi);
    text = stripRepeatedBlocks(text, /<(nav|footer|header|aside|form)\b[^>]*>[\s\S]*?<\/\1>/gi);
    text = stripRepeatedBlocks(
        text,
        /<([a-z0-9:-]+)\b[^>]*\b(?:class|id)=["'][^"']*(?:nav|header|footer|sidebar|menu|share|social|comment|comments|cookie|popup|modal|overlay|subscribe|signup|newsletter|paywall)[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi
    );

    text = text.replace(/<br\s*\/?>/gi, "\n");
    text = text.replace(/<\/(p|div|section|article|main|li|ul|ol|h1|h2|h3|h4|h5|h6|blockquote|pre|tr|table)>/gi, "\n\n");
    text = text.replace(/<(li|tr)\b[^>]*>/gi, "\n- ");
    text = text.replace(/<[^>]+>/g, " ");
    text = decodeEntities(text);
    text = text.replace(/[ \t\f\v]+/g, " ");
    text = text.replace(/\n[ \t]+/g, "\n");
    text = text.replace(/[ \t]+\n/g, "\n");
    text = text.replace(/\n{3,}/g, "\n\n");

    return text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .join("\n");
}

function stripRepeatedBlocks(text, pattern) {
    let previous = "";
    let current = text;

    while (current !== previous) {
        previous = current;
        current = current.replace(pattern, "\n");
    }

    return current;
}

function decodeEntities(text) {
    return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code) => {
        const lowered = code.toLowerCase();

        if (lowered[0] === "#") {
            const isHex = lowered[1] === "x";
            const raw = isHex ? lowered.slice(2) : lowered.slice(1);
            const value = Number.parseInt(raw, isHex ? 16 : 10);

            return Number.isFinite(value) ? String.fromCodePoint(value) : entity;
        }

        return namedEntities[lowered] ?? entity;
    });
}
