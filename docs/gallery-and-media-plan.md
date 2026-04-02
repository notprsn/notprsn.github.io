# Gallery And Media Plan

Current status
- `/gallery/` exists as a public placeholder route.
- No album directories or public image variants have been committed yet.

Goal
- Keep image-heavy pages fast without overcomplicating the repo.

Recommended approach
- Store originals outside the public site tree.
- Commit optimized public variants only.
- Prefer AVIF or WebP for public delivery.
- Generate multiple widths for responsive loading.
- Use lazy loading and explicit width/height on gallery pages.
- Keep album directories self-contained under `gallery/`.

Suggested future layout
- `gallery/index.html`
- `gallery/albums/<album-slug>/index.html`
- `gallery/albums/<album-slug>/img/`
- `gallery/albums/<album-slug>/data.json`

When the gallery work starts
- Pick one album first.
- Add a tiny script or documented command to generate low-quality public variants.
- Use captions sparingly and link back to essays when an image belongs to a written piece.
