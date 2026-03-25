import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve, relative, extname, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");
const pendingDir = resolve(repoRoot, "writings", "pending");
const finalDir = resolve(repoRoot, "writings", "final");
const dataDir = resolve(repoRoot, "data");

const version = buildVersion();
const generatedAt = new Date().toISOString();

await assertNoDuplicateWritingSlugs();
const manifest = await buildWritingsManifest();
await writeJson(resolve(dataDir, "writings-manifest.json"), manifest);
await writeJson(resolve(dataDir, "site-meta.json"), { version, generatedAt });

const htmlFiles = await collectFiles(repoRoot, (filePath) => {
    return extname(filePath) === ".html" && !filePath.includes(`${resolve(repoRoot, "references")}`);
});

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

async function assertNoDuplicateWritingSlugs() {
    const pending = await collectMarkdownBasenames(pendingDir);
    const final = await collectMarkdownBasenames(finalDir);
    const duplicates = pending.filter((slug) => final.includes(slug));

    if (duplicates.length) {
        throw new Error(
            `Move finalized writings out of pending before committing: ${duplicates.join(", ")}`
        );
    }
}

async function buildWritingsManifest() {
    const files = await collectFiles(finalDir, (filePath) => extname(filePath) === ".md");
    const items = [];

    for (const filePath of files.sort()) {
        const slug = basename(filePath, ".md");
        const markdown = await readFile(filePath, "utf8");
        const title = extractTitle(markdown) || fallbackTitle(slug);
        const routing = routeForSlug(slug);

        items.push({
            slug,
            title,
            file: `/${relative(repoRoot, filePath).replaceAll("\\", "/")}`,
            route: `/writings/?slug=${encodeURIComponent(slug)}`,
            backPath: routing.backPath,
            backLabel: routing.backLabel,
            kind: routing.kind,
            kindLabel: routing.kindLabel,
        });
    }

    return {
        version,
        generatedAt,
        items,
    };
}

function extractTitle(markdown) {
    const match = markdown.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : "";
}

function fallbackTitle(slug) {
    return slug
        .replace(/^(work|projects|essays)-/, "")
        .split("-")
        .map((part) => {
            if (part.toUpperCase() === "UK") {
                return "UK";
            }
            if (part.toUpperCase() === "QICAP") {
                return "QiCAP";
            }
            return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join(" ");
}

function routeForSlug(slug) {
    if (slug.startsWith("work-")) {
        return {
            backPath: "/work/",
            backLabel: "Work",
            kind: "work",
            kindLabel: "Work",
        };
    }

    if (slug.startsWith("projects-")) {
        return {
            backPath: "/projects/",
            backLabel: "Projects",
            kind: "projects",
            kindLabel: "Project",
        };
    }

    if (slug.startsWith("essays-travel-")) {
        return {
            backPath: "/essays/travel/",
            backLabel: "Travel Essays",
            kind: "essays-travel",
            kindLabel: "Travel Essay",
        };
    }

    if (slug.startsWith("essays-miscellaneous-")) {
        return {
            backPath: "/essays/miscellaneous/",
            backLabel: "Miscellaneous Essays",
            kind: "essays-miscellaneous",
            kindLabel: "Miscellaneous Essay",
        };
    }

    return {
        backPath: "/writings/",
        backLabel: "Writings",
        kind: "writing",
        kindLabel: "Writing",
    };
}

function updateHtml(source) {
    let updated = source;

    updated = ensureMeta(updated, "site-version", version);
    updated = ensureCacheMeta(updated);
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

function ensureCacheMeta(source) {
    const tags = [
        '<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">',
        '<meta http-equiv="Pragma" content="no-cache">',
        '<meta http-equiv="Expires" content="0">',
    ];

    let updated = source;

    for (const tag of tags) {
        if (!updated.includes(tag)) {
            updated = updated.replace(/(<meta name="viewport" content="[^"]*">\n)/, `$1    ${tag}\n`);
        }
    }

    return updated;
}

async function collectMarkdownBasenames(directory) {
    const files = await collectFiles(directory, (filePath) => extname(filePath) === ".md");
    return files.map((filePath) => basename(filePath, ".md"));
}

async function collectFiles(directory, predicate) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = resolve(directory, entry.name);

        if (entry.isDirectory()) {
            if (entry.name === ".git" || entry.name === "references" || entry.name === "private") {
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
