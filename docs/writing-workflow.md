# Writing Workflow

Directories
- `essays/<theme>/<slug>/content.md`: essay draft and published markdown, owned by its theme directory.
- `projects/<slug>/content.md`: markdown for a single-note project page.
- `projects/<slug>/<note>/content.md`: markdown for a project that owns multiple standalone write-ups.
- `work/stories/<slug>/story.md`: finalized work-story markdown rendered directly on dedicated `work/stories/*` pages.

Path format
- `projects/cloudscript/content.md`
- `projects/bollywoodle/story/content.md`
- `essays/travel/uk/content.md`
- `essays/miscellaneous/jigsaw-puzzles/content.md`

Rules
- Essays stay in theme-owned folders under `essays/`.
- Empty essay `content.md` files are queue placeholders only and do not generate public pages.
- Single-note project write-ups stay in `projects/<slug>/content.md`.
- Multi-note project write-ups stay in `projects/<slug>/<note>/content.md`.
- Work stories stay under `work/stories/<slug>/story.md`.

Website wiring
- Non-empty essay files publish to `/essays/travel/<slug>/` or `/essays/miscellaneous/<slug>/` during sync.
- Theme queue cards wire their `Open essay` link from `data-essay-slot` and `data-essay-link` during sync.
- Work stories live on dedicated routes like `/work/stories/qicap/` and are linked directly from `/work/`.
- Project markdown pages load through `js/pages/content-entry.js`.
- The repo currently has 3 kinds of project writing state:
  - public multi-note pages for Bollywoodle
  - a public single-note shell for CloudScript with intentionally minimal markdown
  - an empty unpublished draft for Polymarket Crypto Desk
- Work-story markdown should contain the narrative only:
  - keep the `# Company` title in `story.md`
  - do not repeat dates, role, or resume bullets inside the markdown
  - the resume bullets live on `/work/`

Automation
- The git pre-commit hook runs `scripts/sync-site.mjs`.
- That script:
  - refreshes the site version
  - writes `data/site-meta.json`
  - updates local asset query params in HTML
  - strips legacy Google Analytics snippets from shipped HTML
  - generates essay detail pages for non-empty theme-local `content.md` files
  - rewires theme queue cards when an essay becomes publishable
