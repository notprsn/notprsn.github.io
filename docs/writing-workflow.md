# Writing Workflow

Directories
- `writings/pending/`: raw draft queue, plain markdown files, often just text at first.
- `writings/final/`: finalized markdown files that are published through `/writings/`.
- `work/stories/<slug>/story.md`: finalized work-story markdown rendered directly on dedicated `work/stories/*` pages.

Slug format
- `projects-cloudscript.md`
- `essays-travel-uk.md`
- `essays-miscellaneous-jigsaw-puzzles.md`

Rules
- Pending and final are mutually exclusive for the same slug.
- Once a non-work piece is finalized, move it to `writings/final/` instead of copying it.
- Future updates to non-work pieces should happen directly in `writings/final/`.
- Work stories do not belong in `writings/final/`; keep them under `work/stories/<slug>/story.md`.

Website wiring
- Final files are exposed through `/writings/?slug=<slug>`.
- Work stories live on dedicated routes like `/work/stories/qicap/` and are linked directly from `/work/`.
- Work-story markdown should contain the narrative only:
  - keep the `# Company` title in `story.md`
  - do not repeat dates, role, or resume bullets inside the markdown
  - the resume bullets live on `/work/`
- Relevant cards in projects and essays automatically wire their story links from the manifest once the slug exists in `writings/final/`.
- The manifest lives at `data/writings-manifest.json` and is generated automatically.

Automation
- The git pre-commit hook runs `scripts/sync-site.mjs`.
- That script:
  - refreshes the site version
  - updates local asset query params in HTML
  - regenerates the writings manifest
  - blocks duplicate slugs across pending and final
