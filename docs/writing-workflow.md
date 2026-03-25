# Writing Workflow

Directories
- `writings/pending/`: raw draft queue, plain markdown files, often just text at first.
- `writings/final/`: finalized markdown files that should be considered closed loops.

Slug format
- `work-qicap.md`
- `work-sharpely.md`
- `projects-cloudscript.md`
- `essays-travel-uk.md`
- `essays-miscellaneous-jigsaw-puzzles.md`

Rules
- Pending and final are mutually exclusive for the same slug.
- Once a piece is finalized, move it to `writings/final/` instead of copying it.
- Future updates should happen directly in `writings/final/`.

Website wiring
- Final files are exposed through `/writings/?slug=<slug>`.
- Relevant cards on the site automatically show a `Read final` link once the slug exists in `writings/final/`.
- The manifest lives at `data/writings-manifest.json` and is generated automatically.

Automation
- The git pre-commit hook runs `scripts/sync-site.mjs`.
- That script:
  - refreshes the site version
  - updates local asset query params in HTML
  - regenerates the writings manifest
  - blocks duplicate slugs across pending and final
