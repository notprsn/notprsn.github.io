#!/usr/bin/env node

import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const [redHerringsPath, outputDir] = process.argv.slice(2);

if (!redHerringsPath || !outputDir) {
  console.error("Usage: node scripts/build-secret-red-herrings.mjs <red-herrings.json> <secret-output-dir>");
  process.exit(1);
}

const outputRoot = path.resolve(outputDir);
const source = JSON.parse(await readFile(redHerringsPath, "utf8"));
const routes = [...readRouteList(source.routes, "routes"), ...readRouteList(source.customRoutes, "customRoutes")];
const redirectHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex,nofollow">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0; url=/secret/fool.html">
  <title>not found</title>
</head>
<body>
  <p>not found</p>
  <script>
    window.location.replace("/secret/fool.html");
  </script>
</body>
</html>
`;

const normalizeRoute = (route) => {
  if (typeof route !== "string") {
    throw new Error(`Red-herring route must be a string: ${String(route)}`);
  }

  const cleaned = route.trim().replace(/^\/+/, "").replace(/^secret\/+/, "");

  if (!cleaned || cleaned.includes("\\") || cleaned.includes("\0")) {
    throw new Error(`Invalid red-herring route: ${route}`);
  }

  const normalized = path.posix.normalize(cleaned);

  if (normalized === "." || normalized === ".." || normalized.startsWith("../") || path.posix.isAbsolute(normalized)) {
    throw new Error(`Unsafe red-herring route: ${route}`);
  }

  return normalized.replace(/\/+$/, "");
};

function readRouteList(value, name) {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error(`red-herrings.json field "${name}" must be an array.`);
  }

  return value;
}

const outputPathsForRoute = (route) => {
  const routePath = normalizeRoute(route);
  const htmlPaths = new Set();

  if (routePath.endsWith(".html")) {
    htmlPaths.add(path.resolve(outputRoot, routePath));
    htmlPaths.add(path.resolve(outputRoot, routePath.replace(/\.html$/, ""), "index.html"));
  } else {
    htmlPaths.add(path.resolve(outputRoot, `${routePath}.html`));
    htmlPaths.add(path.resolve(outputRoot, routePath, "index.html"));
  }

  return [...htmlPaths];
};

const assertInsideOutputRoot = (filePath) => {
  const relative = path.relative(outputRoot, filePath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to write outside secret output directory: ${filePath}`);
  }
};

const assertNoCollision = async (filePath) => {
  try {
    await stat(filePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      return;
    }

    throw error;
  }

  throw new Error(`Red-herring route would overwrite an existing puzzle file: ${filePath}`);
};

const plannedOutputPaths = new Set();
let written = 0;

for (const route of routes) {
  for (const filePath of outputPathsForRoute(route)) {
    if (plannedOutputPaths.has(filePath)) {
      continue;
    }

    plannedOutputPaths.add(filePath);
    assertInsideOutputRoot(filePath);
    await assertNoCollision(filePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, redirectHtml);
    written += 1;
  }
}

console.log(`Generated ${written} secret red-herring redirect pages.`);
