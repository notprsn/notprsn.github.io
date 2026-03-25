import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const skillDir = resolve(__dirname, "..");
const upstreamDir = resolve(skillDir, "references", "upstream");
const manifestPath = resolve(upstreamDir, "manifest.json");

const whitelist = [
    {
        slug: "coding-train-mandelbulb",
        label: "Coding Train Mandelbulb challenge",
        kind: "challenge",
        purpose: "Challenge overview, technique list, and reference implementation context.",
        url: "https://codingtrain.github.io/website-archive/CodingChallenges/168-mandelbulb.html",
    },
    {
        slug: "coding-train-fractal-tree-challenge",
        label: "Coding Train Fractal Tree challenge",
        kind: "challenge",
        purpose: "Challenge overview and framing for the recursive fractal tree sketch.",
        url: "https://codingtrain.github.io/website-archive/CodingChallenges/014-fractaltree.html",
    },
    {
        slug: "coding-train-fractal-tree-p5-source",
        label: "Coding Train Fractal Tree p5 source",
        kind: "challenge-source",
        purpose: "Primary p5 reference implementation for the recursive fractal tree.",
        url: "https://raw.githubusercontent.com/CodingTrain/website-archive/main/CodingChallenges/CC_014_FractalTree/P5/sketch.js",
    },
    {
        slug: "coding-train-fractal-tree-processing-source",
        label: "Coding Train Fractal Tree Processing source",
        kind: "challenge-source",
        purpose: "Primary Processing reference implementation for the recursive fractal tree.",
        url: "https://raw.githubusercontent.com/CodingTrain/website-archive/main/CodingChallenges/CC_014_FractalTree/Processing/CC_014_FractalTree/CC_014_FractalTree.pde",
    },
    {
        slug: "coding-train-koch-snowflake-p5-sketch",
        label: "Coding Train Koch Snowflake p5 sketch",
        kind: "challenge-source",
        purpose: "Primary p5 reference implementation for the Koch Snowflake sketch.",
        url: "https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/129_Koch_Snowflake/P5/sketch.js",
    },
    {
        slug: "coding-train-koch-snowflake-p5-segment",
        label: "Coding Train Koch Snowflake p5 segment",
        kind: "challenge-source",
        purpose: "Segment subdivision logic for the Koch Snowflake p5 sketch.",
        url: "https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/129_Koch_Snowflake/P5/segment.js",
    },
    {
        slug: "coding-train-koch-snowflake-processing-sketch",
        label: "Coding Train Koch Snowflake Processing sketch",
        kind: "challenge-source",
        purpose: "Primary Processing reference implementation for the Koch Snowflake sketch.",
        url: "https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/129_Koch_Snowflake/Processing/CC_129_Koch_Snowflake/CC_129_Koch_Snowflake.pde",
    },
    {
        slug: "coding-train-koch-snowflake-processing-segment",
        label: "Coding Train Koch Snowflake Processing segment",
        kind: "challenge-source",
        purpose: "Segment subdivision logic for the Koch Snowflake Processing sketch.",
        url: "https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/129_Koch_Snowflake/Processing/CC_129_Koch_Snowflake/Segment.pde",
    },
    {
        slug: "coding-train-brownian-snowflake-challenge",
        label: "Coding Train Brownian snowflake challenge",
        kind: "challenge",
        purpose: "Challenge overview and framing for the Brownian motion snowflake sketch.",
        url: "https://codingtrain.github.io/website-archive/CodingChallenges/127-brownian-snowflake.html",
    },
    {
        slug: "coding-train-brownian-snowflake-p5-sketch",
        label: "Coding Train Brownian snowflake p5 sketch",
        kind: "challenge-source",
        purpose: "Primary p5 reference implementation for the Brownian snowflake sketch.",
        url: "https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/127_Snowflake_Brownian/P5/sketch.js",
    },
    {
        slug: "coding-train-brownian-snowflake-p5-particle",
        label: "Coding Train Brownian snowflake p5 particle",
        kind: "challenge-source",
        purpose: "Particle update and sticking logic for the Brownian snowflake p5 sketch.",
        url: "https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/127_Snowflake_Brownian/P5/particle.js",
    },
    {
        slug: "coding-train-brownian-snowflake-processing-sketch",
        label: "Coding Train Brownian snowflake Processing sketch",
        kind: "challenge-source",
        purpose: "Primary Processing reference implementation for the Brownian snowflake sketch.",
        url: "https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/127_Snowflake_Brownian/Processing/CC_127_Snowflake_Brownian/CC_127_Snowflake_Brownian.pde",
    },
    {
        slug: "coding-train-brownian-snowflake-processing-particle",
        label: "Coding Train Brownian snowflake Processing particle",
        kind: "challenge-source",
        purpose: "Particle update and sticking logic for the Brownian snowflake Processing sketch.",
        url: "https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/127_Snowflake_Brownian/Processing/CC_127_Snowflake_Brownian/Particle.pde",
    },
    {
        slug: "vharivinay-julia-set-readme",
        label: "Julia-set shader README",
        kind: "challenge",
        purpose: "Project overview and high-level description of the oscillating Julia-set shader.",
        url: "https://raw.githubusercontent.com/vharivinay/julia-set-with-shaders/main/README.md",
    },
    {
        slug: "vharivinay-julia-set-sketch",
        label: "Julia-set shader sketch",
        kind: "challenge-source",
        purpose: "Primary p5 reference implementation for the Julia-set shader sketch.",
        url: "https://raw.githubusercontent.com/vharivinay/julia-set-with-shaders/main/sketch.js",
    },
    {
        slug: "vharivinay-julia-set-frag",
        label: "Julia-set fragment shader",
        kind: "challenge-source",
        purpose: "Reference fragment shader for the Julia-set render.",
        url: "https://raw.githubusercontent.com/vharivinay/julia-set-with-shaders/main/assets/julia.frag",
    },
    {
        slug: "vharivinay-julia-set-vert",
        label: "Julia-set vertex shader",
        kind: "challenge-source",
        purpose: "Reference vertex shader for the Julia-set render.",
        url: "https://raw.githubusercontent.com/vharivinay/julia-set-with-shaders/main/assets/julia.vert",
    },
    {
        slug: "p5-beginshape",
        label: "p5 beginShape()",
        kind: "p5-reference",
        purpose: "Point-cloud and custom geometry rendering.",
        url: "https://p5js.org/reference/p5/beginShape",
    },
    {
        slug: "p5-line",
        label: "p5 line()",
        kind: "p5-reference",
        purpose: "Branch segment drawing in 2D sketches.",
        url: "https://p5js.org/reference/p5/line/",
    },
    {
        slug: "p5-begincontour",
        label: "p5 beginContour()",
        kind: "p5-reference",
        purpose: "Contour handling when building more advanced polygonal fractal fills.",
        url: "https://p5js.org/reference/p5/beginContour/",
    },
    {
        slug: "p5-pop",
        label: "p5 pop()",
        kind: "p5-reference",
        purpose: "Transform stack semantics in p5.",
        url: "https://p5js.org/reference/p5/pop/",
    },
    {
        slug: "p5-push",
        label: "p5 push()",
        kind: "p5-reference",
        purpose: "Transform stack semantics in p5.",
        url: "https://p5js.org/reference/p5/push/",
    },
    {
        slug: "p5-rotate",
        label: "p5 rotate()",
        kind: "p5-reference",
        purpose: "2D rotation around the current origin.",
        url: "https://p5js.org/reference/p5/rotate/",
    },
    {
        slug: "p5-scale",
        label: "p5 scale()",
        kind: "p5-reference",
        purpose: "Mirroring and symmetric render duplication in 2D sketches.",
        url: "https://p5js.org/reference/p5/scale/",
    },
    {
        slug: "p5-strokeweight",
        label: "p5 strokeWeight()",
        kind: "p5-reference",
        purpose: "Branch thickness control in line-based sketches.",
        url: "https://p5js.org/reference/p5/strokeWeight/",
    },
    {
        slug: "p5-endshape",
        label: "p5 endShape()",
        kind: "p5-reference",
        purpose: "Completing polyline and polygon shapes in p5.",
        url: "https://p5js.org/reference/p5/endShape/",
    },
    {
        slug: "p5-translate",
        label: "p5 translate()",
        kind: "p5-reference",
        purpose: "Coordinate system shifts in 2D and 3D sketches.",
        url: "https://p5js.org/reference/p5/translate/",
    },
    {
        slug: "p5-colormode",
        label: "p5 colorMode()",
        kind: "p5-reference",
        purpose: "Color-space handling for point-cloud palettes.",
        url: "https://p5js.org/reference/p5/colorMode/",
    },
    {
        slug: "p5-loadshader",
        label: "p5 loadShader()",
        kind: "p5-reference",
        purpose: "Loading vertex and fragment shaders for full-screen WEBGL sketches.",
        url: "https://p5js.org/reference/p5/loadShader/",
    },
    {
        slug: "p5-createcanvas",
        label: "p5 createCanvas()",
        kind: "p5-reference",
        purpose: "Renderer setup and WEBGL mode.",
        url: "https://p5js.org/reference/p5/createCanvas/",
    },
    {
        slug: "p5-createcheckbox",
        label: "p5 createCheckbox()",
        kind: "p5-reference",
        purpose: "Interactive toggle controls when using p5 DOM helpers.",
        url: "https://p5js.org/reference/p5/createCheckbox/",
    },
    {
        slug: "p5-createselect",
        label: "p5 createSelect()",
        kind: "p5-reference",
        purpose: "Preset selectors and interactive dropdown controls.",
        url: "https://p5js.org/reference/p5/createSelect/",
    },
    {
        slug: "p5-createslider",
        label: "p5 createSlider()",
        kind: "p5-reference",
        purpose: "Interactive numeric controls.",
        url: "https://p5js.org/reference/p5/createSlider/",
    },
    {
        slug: "p5-orbitcontrol",
        label: "p5 orbitControl()",
        kind: "p5-reference",
        purpose: "Camera orbiting, pan, and zoom in WEBGL sketches.",
        url: "https://p5js.org/reference/p5/orbitControl/",
    },
    {
        slug: "p5-shader",
        label: "p5 shader()",
        kind: "p5-reference",
        purpose: "Applying custom shaders to WEBGL geometry in p5.",
        url: "https://p5js.org/reference/p5/shader/",
    },
    {
        slug: "p5-resizecanvas",
        label: "p5 resizeCanvas()",
        kind: "p5-reference",
        purpose: "Responsive canvas resizing for sketch containers.",
        url: "https://p5js.org/reference/p5/resizeCanvas/",
    },
    {
        slug: "p5-vertex",
        label: "p5 vertex()",
        kind: "p5-reference",
        purpose: "3D vertex placement inside point-cloud shapes.",
        url: "https://p5js.org/reference/p5/vertex/",
    },
    {
        slug: "processing-beginshape",
        label: "Processing beginShape()",
        kind: "processing-reference",
        purpose: "Processing-side point-cloud and custom geometry semantics.",
        url: "https://processing.org/reference/beginshape_",
    },
    {
        slug: "processing-line",
        label: "Processing line()",
        kind: "processing-reference",
        purpose: "2D and 3D line drawing semantics in Processing.",
        url: "https://processing.org/reference/line_.html",
    },
    {
        slug: "processing-endshape",
        label: "Processing endShape()",
        kind: "processing-reference",
        purpose: "Completing polyline and polygon shapes in Processing.",
        url: "https://processing.org/reference/endshape_",
    },
    {
        slug: "processing-point",
        label: "Processing point()",
        kind: "processing-reference",
        purpose: "3D point rendering semantics in Processing.",
        url: "https://processing.org/reference/point_.html",
    },
    {
        slug: "processing-popmatrix",
        label: "Processing popMatrix()",
        kind: "processing-reference",
        purpose: "Transform stack semantics.",
        url: "https://processing.org/reference/popmatrix_",
    },
    {
        slug: "processing-pushmatrix",
        label: "Processing pushMatrix()",
        kind: "processing-reference",
        purpose: "Transform stack semantics.",
        url: "https://processing.org/reference/pushmatrix_",
    },
    {
        slug: "processing-reference-index",
        label: "Processing reference index",
        kind: "processing-reference",
        purpose: "Top-level reference map and category navigation.",
        url: "https://processing.org/reference/",
    },
    {
        slug: "processing-rotate",
        label: "Processing rotate()",
        kind: "processing-reference",
        purpose: "2D rotation around the current origin.",
        url: "https://processing.org/reference/rotate_.html",
    },
    {
        slug: "processing-scale",
        label: "Processing scale()",
        kind: "processing-reference",
        purpose: "Mirroring and symmetric render duplication in 2D sketches.",
        url: "https://processing.org/reference/scale_.html",
    },
    {
        slug: "processing-rotatex",
        label: "Processing rotateX()",
        kind: "processing-reference",
        purpose: "3D transform semantics along the x-axis.",
        url: "https://processing.org/reference/rotatex_",
    },
    {
        slug: "processing-rotatey",
        label: "Processing rotateY()",
        kind: "processing-reference",
        purpose: "3D transform semantics along the y-axis.",
        url: "https://processing.org/reference/rotatey_",
    },
    {
        slug: "processing-rotatez",
        label: "Processing rotateZ()",
        kind: "processing-reference",
        purpose: "3D transform semantics along the z-axis.",
        url: "https://processing.org/reference/rotatez_",
    },
    {
        slug: "processing-size",
        label: "Processing size()",
        kind: "processing-reference",
        purpose: "Renderer setup and the role of P3D.",
        url: "https://processing.org/reference/size_.html",
    },
    {
        slug: "processing-translate",
        label: "Processing translate()",
        kind: "processing-reference",
        purpose: "3D translation semantics and cumulative transforms.",
        url: "https://processing.org/reference/translate_.html",
    },
    {
        slug: "processing-vertex",
        label: "Processing vertex()",
        kind: "processing-reference",
        purpose: "Vertex semantics inside beginShape()/endShape().",
        url: "https://processing.org/reference/vertex_.html",
    },
];

await mkdir(upstreamDir, { recursive: true });

const previousManifest = await readPreviousManifest();
const previousBySlug = new Map((previousManifest.items || []).map((item) => [item.slug, item]));
const results = [];

for (const entry of whitelist.sort((left, right) => left.slug.localeCompare(right.slug))) {
    const previous = previousBySlug.get(entry.slug);
    try {
        const response = await fetch(entry.url, {
            headers: {
                "user-agent": "notprsn-p5-processing-skill-crawler/1.0",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();
        const text = normalizeHtmlToText(html);
        const fetchedAt = new Date().toISOString();
        const filename = `${entry.slug}.md`;
        const filePath = resolve(upstreamDir, filename);
        const snapshot = renderSnapshot(entry, response.url, fetchedAt, text);

        await writeFile(filePath, snapshot, "utf8");

        results.push({
            slug: entry.slug,
            label: entry.label,
            kind: entry.kind,
            purpose: entry.purpose,
            url: entry.url,
            finalUrl: response.url,
            file: `./${filename}`,
            fetchedAt,
            status: "ok",
            bytes: Buffer.byteLength(snapshot, "utf8"),
        });

        console.log(`Fetched ${entry.slug}`);
    } catch (error) {
        results.push({
            slug: entry.slug,
            label: entry.label,
            kind: entry.kind,
            purpose: entry.purpose,
            url: entry.url,
            finalUrl: previous?.finalUrl || entry.url,
            file: previous?.file || `./${entry.slug}.md`,
            fetchedAt: previous?.fetchedAt || null,
            status: "stale",
            bytes: previous?.bytes || null,
            error: error instanceof Error ? error.message : String(error),
        });

        console.warn(`Keeping prior snapshot for ${entry.slug}`);
    }
}

await writeFile(
    manifestPath,
    `${JSON.stringify(
        {
            generatedAt: new Date().toISOString(),
            items: results,
        },
        null,
        2
    )}\n`,
    "utf8"
);

function renderSnapshot(entry, finalUrl, fetchedAt, text) {
    return `# ${entry.label}

- Source: ${finalUrl}
- Original URL: ${entry.url}
- Kind: ${entry.kind}
- Purpose: ${entry.purpose}
- Fetched: ${fetchedAt}

## Extracted text

${text}
`;
}

async function readPreviousManifest() {
    try {
        const raw = await readFile(manifestPath, "utf8");
        return JSON.parse(raw);
    } catch {
        return { items: [] };
    }
}

function normalizeHtmlToText(html) {
    return decodeEntities(
        html
            .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
            .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
            .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
            .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
            .replace(/<\/(p|div|section|article|header|footer|h1|h2|h3|h4|h5|h6|li|pre|code|tr|td|th|ul|ol)>/gi, "\n")
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<[^>]+>/g, " ")
            .replace(/\r/g, "")
            .split("\n")
            .map((line) => line.replace(/[ \t]+/g, " ").trim())
            .filter(Boolean)
            .join("\n")
    );
}

function decodeEntities(text) {
    return text
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, "/")
        .replace(/&mdash;/g, "-")
        .replace(/&ndash;/g, "-")
        .replace(/&rsquo;/g, "'")
        .replace(/&lsquo;/g, "'")
        .replace(/&ldquo;/g, '"')
        .replace(/&rdquo;/g, '"')
        .replace(/&hellip;/g, "...")
        .replace(/\n{3,}/g, "\n\n");
}
