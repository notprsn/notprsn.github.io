import { access, readFile, readdir } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const skippedDirectories = new Set([
    ".git",
    "node_modules",
    "private",
    "references",
    "skills",
]);
const faviconRels = new Set([
    "icon",
    "apple-touch-icon",
    "manifest",
    "mask-icon",
]);

const htmlFiles = await collectHtmlFiles(repoRoot);
const broken = [];
let checked = 0;

for (const filePath of htmlFiles) {
    const source = await readFile(filePath, "utf8");
    const references = [];

    for (const [tag] of source.matchAll(/<link\b[^>]*>/g)) {
        const rel = attribute(tag, "rel");
        const href = attribute(tag, "href");
        if (faviconRels.has(rel) && href) {
            references.push(href);
        }
    }

    for (const [tag] of source.matchAll(/<meta\b[^>]*>/g)) {
        if (attribute(tag, "name") === "msapplication-config") {
            const content = attribute(tag, "content");
            if (content) {
                references.push(content);
            }
        }
    }

    for (const reference of references) {
        if (/^(?:https?:|data:|\/\/)/.test(reference)) {
            continue;
        }

        checked += 1;
        const cleanReference = reference.split(/[?#]/, 1)[0];
        const target = cleanReference.startsWith("/")
            ? resolve(repoRoot, cleanReference.slice(1))
            : resolve(dirname(filePath), cleanReference);

        try {
            await access(target);
        } catch {
            broken.push({
                page: filePath.slice(repoRoot.length + 1),
                reference,
                target: target.slice(repoRoot.length + 1),
            });
        }
    }
}

if (broken.length) {
    console.error(`Found ${broken.length} broken favicon reference(s):`);
    for (const item of broken) {
        console.error(`- ${item.page}: ${item.reference} -> ${item.target}`);
    }
    process.exit(1);
}

console.log(`Checked ${checked} favicon references across ${htmlFiles.length} HTML files.`);

function attribute(tag, name) {
    return tag.match(new RegExp(`\\b${name}="([^"]+)"`))?.[1] || "";
}

async function collectHtmlFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        if (entry.isDirectory() && skippedDirectories.has(entry.name)) {
            continue;
        }

        const fullPath = resolve(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await collectHtmlFiles(fullPath)));
        } else if (entry.isFile() && extname(entry.name) === ".html") {
            files.push(fullPath);
        }
    }

    return files;
}
