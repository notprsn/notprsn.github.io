# Writing Workflow

Directories
- `words/<slug>/content.md`: draft and published markdown, owned by the Words section.
- `projects/<slug>/content.md`: markdown for a single-note project page or a root project note.
- `projects/<slug>/<note>/content.md`: markdown for a project that owns multiple standalone write-ups.
- `work/stories/<slug>/story.md`: finalized work-story markdown rendered directly on dedicated `work/stories/*` pages.

Path format
- `projects/cloudscript/story/content.md`
- `projects/bollywoodle/story/content.md`
- `words/uk/content.md`
- `words/jigsaw-puzzles/content.md`

Rules
- Writing stays in section-owned folders under `words/`.
- Empty essay `content.md` files are queue placeholders only and do not generate public pages.
- Single-note project write-ups stay in `projects/<slug>/content.md`.
- Multi-note project write-ups stay in `projects/<slug>/<note>/content.md`.
- Work stories stay under `work/stories/<slug>/story.md`.

Website wiring
- Non-empty writing files publish to `/words/<slug>/` during sync.
- Work stories live on dedicated routes like `/work/stories/qicap/` and are linked directly from `/work/`.
- Work and project markdown pages are static-rendered by `scripts/sync-site.mjs`; `js/pages/content-entry.js` remains as a browser enhancement that can refresh the prose from the markdown source.
- The repo currently has 2 kinds of project writing state:
  - a public story page for Bollywoodle
  - a public story page for CloudScript
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
  - writes `robots.txt` and `sitemap.xml`
  - updates canonical, Open Graph, Twitter card, and JSON-LD metadata
  - injects static HTML for markdown-backed work and project pages
  - updates local asset query params in HTML
  - strips legacy Google Analytics snippets from shipped HTML
  - generates writing pages for non-empty section-owned `content.md` files
