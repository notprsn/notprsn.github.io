# Style Language

This site has two layers of styling:

1. Shared primitives in `css/style.css`
2. Page-family styling in `css/pages/*.css`

Use the shared layer for anything that should feel consistent across the site:
- typography tokens
- nav and footer chrome
- shared page spacing
- cards, lists, panels, and writing shells
- reusable dark landing primitives
- generic `page-paper` shells and shared JS hook styling

Keep page-owned visuals in `css/pages/*.css` when they are specific to one top-level page:
- canvas backgrounds
- one-off animations
- section-only layout tweaks
- experimental treatments that are not reused elsewhere
- project shelf themes and project-detail themes
- work ledger layout and work-story presentation
- love-letters surfaces and lock layout

The exception is `fun/projects/<slug>/`, where each mini project keeps its own `style.css`.

## Shared dark landing pattern

For dark landing pages, reuse the shared classes already defined in `css/style.css`:
- body: add `page-dark` plus the section page class
- header: use `site-header site-header--transparent`
- main shell: use `landing-shell`
- content wrapper: use `landing-copy`
- eyebrow: use `landing-eyebrow`
- title: use `landing-title`
- text block: use `landing-copy-block`
- body lines: use `landing-line`
- action row: use `landing-actions`
- footer: use `site-footer site-footer--scene`

That keeps nav sizing, footer spacing, display typography, and body copy scale aligned with the rest of the site.

## Ownership rules

- Do not restyle nav or footer in page-specific CSS unless the shared language is missing a reusable primitive.
- If a visual treatment is reused by a second page, promote it into `css/style.css`.
- Keep top-level page-family CSS under `css/pages/`, for example `css/pages/home.css`, `css/pages/work.css`, `css/pages/projects.css`, `css/pages/about.css`, and `css/pages/fun.css`.
- Keep mini-project CSS inside `fun/projects/<slug>/style.css`.
- Shared JS in `js/scripts.js` should stay generic. Section-only effects should not be added there unless they become shared behavior.

## Current examples

- `/` uses the shared dark landing structure plus a home-specific canvas effect.
- `/about/` uses the shared dark landing structure plus an about-specific neon rain effect.
- `/work/` keeps its ledger and story layout in `css/pages/work.css`.
- `/projects/` keeps its shelf card themes and project-note themes in `css/pages/projects.css`.
- `/love-letters/` uses shared dark chrome but keeps its lock/archive styling in `css/pages/love.css`.
