# Section Workflows

Add a new fun project
1. Create a new `fun/projects/<slug>/` directory with local `index.html`, `style.css`, and `script.js`.
2. If the project uses p5.js or Processing, consult `skills/p5js-processing/SKILL.md` first and keep the runtime plus any assets in that same directory unless they are intentionally shared.
3. Keep all project-specific HTML, CSS, JS, and assets local to that directory.
4. Add one card on `/fun/` linking to the new page.
5. If the project needs shared utilities, add them only after a second project needs the same thing.

Mini-project good practices
1. Default to the same page shell used by the current cleaned-up math projects: shared header/footer, a left sidebar, and a right display stage.
2. Reuse `css/pages/fun-projects.css` for the finished math mini-project shell, and keep local `fun/projects/<slug>/style.css` focused on color variables plus project-specific visuals.
3. On desktop, keep the sidebar narrow and fixed-width, and let the stage consume the remaining width and height.
4. On mobile, stack the sidebar above the stage instead of hiding controls behind drawers.
5. Keep the top card in the sidebar for the project title, and place controls in a separate card below it.
6. Expose only the real structure or growth knobs. Hide render tuning, pacing, and safety caps unless they are essential to understanding the idea.
7. Measure canvases from the actual host box, not rough width-based estimates. Prefer `ResizeObserver` or equivalent host-aware resize logic.
8. Make the stage background pure black unless the visual idea truly depends on a different field.
9. Use hidden safety limits for expensive sketches, but make completion feel driven by the visual goal rather than an arbitrary visible counter.
10. For heavy simulations, prefer persistent offscreen buffers, spatial indexing, and adaptive per-frame work over large visible control surfaces.

Add a new piece of writing
1. Create `words/<slug>/content.md` and keep its assets local.
2. Add a tagged link from `/words/` once it is ready to publish.
3. Run `node scripts/sync-site.mjs`; non-empty markdown generates `words/<slug>/index.html`.
4. Existing assignments are preserved in `docs/writing-backlog.md`.

Update a single-note project page
1. Edit `projects/<slug>/content.md`.
2. Keep the page shell in `projects/<slug>/index.html`.
3. Run `node scripts/sync-site.mjs` so static markdown HTML, SEO metadata, shared asset versions, and HTML cleanup stay current.

Update a multi-note project page
1. Edit `projects/<slug>/<note>/content.md`.
2. Keep the matching shell in `projects/<slug>/<note>/index.html`.
3. Reuse the markdown-backed shell pattern unless the page genuinely needs custom behavior.
4. Bollywoodle is the current example of this pattern.
5. Run `node scripts/sync-site.mjs` after updating the content or shell.

Restyle an existing section
1. Reuse shared primitives from `css/style.css` first, especially nav, footer, typography, and landing/page shells.
2. Put top-level page-specific CSS in `css/pages/<page>.css`.
3. Keep page-family ownership explicit: for example `work.css` for `/work/` plus `/work/stories/*`, and `projects.css` for `/projects/` plus project detail pages.
4. Keep `fun/projects/<slug>/style.css` local to each mini project.
5. If a second page starts using the same pattern, promote it into the shared style layer.
6. Update `docs/style-language.md` when the shared language changes.

Add a gallery later
1. Decide album directories first.
2. Generate optimized image variants before committing.
3. Avoid storing only full-resolution originals in the public tree.
