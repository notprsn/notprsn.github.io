# notprsn.github.io

Static personal site.

Current sections
- `/`, `/about/`, `/work/`, `/projects/`, `/fun/`, `/essays/`, and `/love-letters/` are all live.
- `/gallery/` and `/glossary/` are still placeholders.
- `/puzzles/` is a hidden noindex trail outside the main nav.

Structure notes
- Shared primitives and global chrome live in `css/style.css`.
- Top-level page-family styling lives in `css/pages/`, for example `home.css`, `work.css`, `projects.css`, `essays.css`, and `love.css`.
- Mini projects under `fun/projects/<slug>/` keep their own local `style.css`, `script.js`, and `index.html`.
- Shared behavior lives in `js/site.js`, with page-owned entrypoints under `js/pages/`.
- Markdown-backed writing currently lives in `work/stories/<slug>/story.md`, `projects/<slug>/content.md`, `projects/<slug>/<note>/content.md`, and `essays/<theme>/<slug>/content.md`.
- `scripts/sync-site.mjs` updates cache-busting metadata and generates essay detail pages from non-empty essay `content.md` files.
- Contributor workflows live in `docs/section-workflows.md`.
