# Finalization Checklist

Use this when an essay or project draft is close to done in its section-owned `content.md` file, or when a work story in `work/stories/*/story.md` is being tightened for publication.

## Content checks

- The piece has a clear `#` title.
- The main point is obvious by the end of the first few paragraphs.
- The strongest sections are not buried.
- The final paragraph feels finished, not abandoned.
- Any factual claims in work stories line up with the latest resume in `references/`.
- Work stories keep only the narrative:
  - no date line
  - no role line
  - no `## Website copy`
  - no `## Long write-up`

## Repo checks

- The slug matches the existing file name.
- Keep section boundaries intact:
  - work stories stay under `work/stories/`
  - project write-ups stay under `projects/<slug>/content.md`
  - essays stay in the correct theme family under `essays/<theme>/<slug>/content.md`

## Site checks

- Essay markdown renders cleanly in its generated essay page.
- Project markdown renders cleanly in its project detail page.
- Work stories render cleanly in the dedicated `work/stories/*` page shell.
- Lists, headers, and links are intentional.
- The piece does not depend on unpublished local context to make sense.

## After moving

Run:

```bash
node scripts/sync-site.mjs
```

That refreshes site metadata, rewires essay queue cards, and regenerates publishable essay pages.
