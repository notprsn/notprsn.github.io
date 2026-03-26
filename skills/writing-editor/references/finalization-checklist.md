# Finalization Checklist

Use this when a draft is close to done and may be moved from `writings/pending/` to `writings/final/`.

## Content checks

- The piece has a clear `#` title.
- The main point is obvious by the end of the first few paragraphs.
- The strongest sections are not buried.
- The final paragraph feels finished, not abandoned.
- Any factual claims in `work-story-*` drafts line up with the latest resume in `references/`.
- `work-story-*` files keep only the narrative:
  - no date line
  - no role line
  - no `## Website copy`
  - no `## Long write-up`

## Repo checks

- The slug matches the existing file name.
- The same slug does not exist in both `writings/pending/` and `writings/final/`.
- If finalizing, move the file instead of copying it.
- Keep section boundaries intact:
  - `work-story-*` stays work-related
  - `projects-*` stays project-related
  - essays stay in the correct theme family

## Site checks

- The markdown renders cleanly in the generic writings page.
- Lists, headers, and links are intentional.
- The piece does not depend on unpublished local context to make sense.

## After moving

Run:

```bash
node scripts/sync-site.mjs
```

That refreshes the writings manifest and catches duplicate pending/final slugs.
