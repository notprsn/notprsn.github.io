---
name: writing-editor
description: Use when editing or finalizing markdown drafts in writings/pending/ or writings/final/, especially for improving clarity, coherence, tone, structure, and repo-ready finalization without inventing facts.
---

# writing-editor

Use this skill for:
- polishing drafts in `writings/pending/`
- tightening finished markdown in `writings/final/`
- restructuring rough notes into readable essays, project write-ups, or work summaries
- preserving voice while making prose clearer, sharper, and more coherent
- deciding whether a draft is ready to move from `writings/pending/` to `writings/final/`

Keep the skill lean:
- read only the reference file needed for the current task
- preserve the author's voice instead of flattening it into generic clean prose
- for `work-story-*` drafts, use the latest resume in `references/` as the source of truth and do not invent facts
- when a draft is too thin to finish honestly, surface the missing facts or gaps instead of hallucinating

## Quick workflow

1. Identify the draft type from the slug:
   - `work-story-*`
   - `projects-*`
   - `essays-travel-*`
   - `essays-miscellaneous-*`
2. Read the full draft once before changing anything. Write down the piece's core point in one sentence.
3. Load the minimum reference needed:
   - use `references/quality-rubric.md` for evaluation and acceptance criteria
   - use `references/editing-passes.md` for the actual revision sequence
   - use `references/finalization-checklist.md` when the piece is close to done
4. Edit in passes, not sentence-by-sentence chaos:
   - structure first
   - then paragraph and line edits
   - then read-aloud cleanup
   - then markdown cleanup and final repo checks
5. If the task is to finalize the piece, move it into `writings/final/` rather than copying it.
6. Run `node scripts/sync-site.mjs` if hooks are unavailable or the manifest needs a manual refresh.

## Core editing rules

- Prefer clarity over sounding deep.
- Preserve the existing energy, humor, and specificity when they are doing real work.
- Cut filler, repeated ideas, and decorative abstractions.
- Keep tone consistent from start to finish unless the shift is intentional.
- Use concrete detail and story when the draft feels abstract or over-explained.
- Do not simultaneously invent structure and micro-polish every sentence. Solve the big shape first.
- If a `work-story-*` or `projects-*` draft makes a factual claim, keep it grounded in provided material.
- For `work-story-*`, keep the markdown narrative-only:
  - keep the `# Company` title
  - remove date, role, and resume-bullet sections from the markdown body
  - leave the factual bullets to `/work/`

## Reference map

- `references/quality-rubric.md`
  - the main quality bar: clarity, coherence, tone, language, and emotional or logical effect
- `references/editing-passes.md`
  - the recommended revision sequence for turning a rough draft into a publishable piece
- `references/finalization-checklist.md`
  - repo-specific checks for moving a piece from `pending` to `final`

## Repo-specific rules

- `writings/pending/` is the draft queue and `writings/final/` is the closed loop.
- Do not keep the same slug in both places.
- Keep `projects/` separate from `work/`.
- Use small, explicit improvements over inflated marketing copy.
- Keep markdown readable by default:
  - one `#` title
  - logical heading hierarchy
  - lists only when they improve scanability
  - links only when they add concrete value

## Expected outputs

Depending on the request, produce one of these:
- an edited draft in place
- a tighter structure plus rewritten sections
- a short editorial assessment with the main issues and fixes
- a finalized markdown file moved into `writings/final/`

When asked to explain edits, focus on:
- what changed structurally
- what was cut or compressed
- where clarity, rhythm, or tone improved
