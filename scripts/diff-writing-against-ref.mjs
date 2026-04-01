#!/usr/bin/env node

import { access, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");

const usage = `Usage:
  node scripts/diff-writing-against-ref.mjs [--ref <git-ref>] --work
  node scripts/diff-writing-against-ref.mjs [--ref <git-ref>] <slug> [<slug> ...]

Examples:
  node scripts/diff-writing-against-ref.mjs --work
  node scripts/diff-writing-against-ref.mjs projects-cloudscript
  node scripts/diff-writing-against-ref.mjs --ref origin/main work-story:qicap

Notes:
  - Essay and project slugs resolve to section-owned content files.
  - Work stories use work-story:<slug> and resolve to work/stories/<slug>/story.md.
  - Looks for the previous file at the given ref in the same path family as the current file.
  - Uses a regular unified diff, so it works even when the current file is untracked.
`;

const { ref, compareWork, slugs } = parseArgs(process.argv.slice(2));

if (!compareWork && slugs.length === 0) {
    console.error(usage);
    process.exit(1);
}

const targetSlugs = compareWork ? await collectCurrentWorkStorySlugs() : normalizeSlugs(slugs);

if (targetSlugs.length === 0) {
    console.error("No matching slugs found.");
    process.exit(1);
}

const scratchDir = await mkdtemp(join(tmpdir(), "writing-diff-"));
let sawDiff = false;
let sawFailure = false;

try {
    for (const slug of targetSlugs) {
        const currentPath = await findCurrentPath(slug);
        if (!currentPath) {
            console.error(`Skipping ${slug}: current file not found.`);
            sawFailure = true;
            continue;
        }

        const previousPath = findPreviousPath(ref, slug);
        if (!previousPath) {
            console.error(`Skipping ${slug}: no file found for ${slug} at ${ref}.`);
            sawFailure = true;
            continue;
        }

        const previousContents = gitStdout(["show", `${ref}:${previousPath}`]);
        const scratchFile = join(scratchDir, `${slug}.md`);
        await writeFile(scratchFile, previousContents, "utf8");

        process.stdout.write(`\n=== ${slug} ===\n`);

        const result = spawnSync(
            "diff",
            [
                "-u",
                "--label",
                `${ref}:${previousPath}`,
                "--label",
                currentPath,
                scratchFile,
                resolve(repoRoot, currentPath),
            ],
            {
                cwd: repoRoot,
                stdio: "inherit",
            }
        );

        if (result.status === 1) {
            sawDiff = true;
            continue;
        }

        if (result.status === 0) {
            process.stdout.write("(no changes)\n");
            continue;
        }

        sawFailure = true;
    }
} finally {
    await rm(scratchDir, { recursive: true, force: true });
}

if (sawFailure) {
    process.exit(2);
}

process.exit(sawDiff ? 1 : 0);

function parseArgs(args) {
    let ref = "origin/main";
    let compareWork = false;
    const slugs = [];

    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];

        if (arg === "--help" || arg === "-h") {
            console.log(usage);
            process.exit(0);
        }

        if (arg === "--ref") {
            ref = args[index + 1];
            if (!ref) {
                throw new Error("Missing value for --ref");
            }
            index += 1;
            continue;
        }

        if (arg === "--work") {
            compareWork = true;
            continue;
        }

        slugs.push(arg);
    }

    return { ref, compareWork, slugs };
}

async function collectCurrentWorkStorySlugs() {
    const storiesRoot = resolve(repoRoot, "work", "stories");
    let entries = [];

    try {
        entries = await readdir(storiesRoot, { withFileTypes: true });
    } catch {
        return [];
    }

    const found = [];

    for (const entry of entries) {
        if (!entry.isDirectory()) {
            continue;
        }

        const storyPath = resolve(storiesRoot, entry.name, "story.md");
        try {
            await access(storyPath, constants.F_OK);
            found.push(`work-story:${entry.name}`);
        } catch {
            continue;
        }
    }

    return found.sort();
}

function normalizeSlugs(slugs) {
    return slugs.map((slug) => slug.replace(/\.md$/, ""));
}

async function findCurrentPath(slug) {
    const candidates = resolveCandidates(slug);

    for (const candidate of candidates) {
        try {
            await access(resolve(repoRoot, candidate), constants.F_OK);
            return candidate;
        } catch {
            continue;
        }
    }

    return "";
}

function findPreviousPath(ref, slug) {
    const candidates = resolveCandidates(slug);

    for (const candidate of candidates) {
        const result = spawnSync("git", ["cat-file", "-e", `${ref}:${candidate}`], {
            cwd: repoRoot,
            stdio: "ignore",
        });

        if (result.status === 0) {
            return candidate;
        }
    }

    return "";
}

function resolveCandidates(slug) {
    if (slug.startsWith("work-story:")) {
        const workSlug = slug.replace(/^work-story:/, "");
        return [`work/stories/${workSlug}/story.md`];
    }

    if (slug.startsWith("projects-")) {
        const projectSlug = slug.replace(/^projects-/, "");
        return [`projects/${projectSlug}/content.md`];
    }

    if (slug.startsWith("essays-travel-")) {
        const essaySlug = slug.replace(/^essays-travel-/, "");
        return [`essays/travel/${essaySlug}/content.md`];
    }

    if (slug.startsWith("essays-miscellaneous-")) {
        const essaySlug = slug.replace(/^essays-miscellaneous-/, "");
        return [`essays/miscellaneous/${essaySlug}/content.md`];
    }

    return [];
}

function gitStdout(args) {
    const result = spawnSync("git", args, {
        cwd: repoRoot,
        encoding: "utf8",
    });

    if (result.status !== 0) {
        throw new Error(result.stderr || `git ${args.join(" ")} failed`);
    }

    return result.stdout;
}
