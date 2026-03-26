# Writing Workflow

Directories
- `writings/pending/`: raw draft queue, plain markdown files, often just text at first.
- `writings/final/`: finalized markdown files that should be considered closed loops.

Slug format
- `work-story-qicap.md`
- `work-story-sharpely.md`
- `projects-cloudscript.md`
- `essays-travel-uk.md`
- `essays-miscellaneous-jigsaw-puzzles.md`

Rules
- Pending and final are mutually exclusive for the same slug.
- Once a piece is finalized, move it to `writings/final/` instead of copying it.
- Future updates should happen directly in `writings/final/`.

Website wiring
- Final files are exposed through `/writings/?slug=<slug>`.
- Work stories use the `work-story-*` slug family and route back to `/work/`.
- Work-story markdown should contain the narrative only:
  - keep the `# Company` title for manifest metadata
  - do not repeat dates, role, or resume bullets inside the markdown
  - the resume bullets live on `/work/`
- Relevant cards on the site automatically wire their story links from the manifest once the slug exists in `writings/final/`.
- The manifest lives at `data/writings-manifest.json` and is generated automatically.

Automation
- The git pre-commit hook runs `scripts/sync-site.mjs`.
- That script:
  - refreshes the site version
  - updates local asset query params in HTML
  - regenerates the writings manifest
  - blocks duplicate slugs across pending and final
