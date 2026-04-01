# notprsn.github.io

Static personal site.

Structure notes
- Shared primitives and global chrome live in `css/style.css`.
- Top-level page-family styling lives in `css/pages/`, for example `home.css`, `work.css`, `projects.css`, `essays.css`, and `love.css`.
- Mini projects under `fun/projects/<slug>/` keep their own local `style.css`, `script.js`, and `index.html`.
- Shared behavior lives in `js/site.js`, with page-owned entrypoints under `js/pages/`.
- Contributor workflows live in `docs/section-workflows.md`.
