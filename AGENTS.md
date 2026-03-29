# AGENTS

This repo is a static personal site. Keep content and behavior local to the section they belong to, with non-mini-project styling organized under `css/`.

Rules
- Treat `references/` as read-only source material. Do not edit files there.
- Keep section content self-contained. Link across sections when needed, but organize non-mini-project styles under `css/` rather than inside section directories.
- Use the latest resume in `references/` as the source of truth for `work/`. Do not invent work facts.
- Keep `projects/` separate from `work/`.
- Keep `fun/` experiments inside `fun/projects/<slug>/` with local `index.html`, `style.css`, and `script.js`.
- When working on p5.js or Processing-based `fun/` projects, consult `skills/p5js-processing/SKILL.md` first and keep any project-specific runtime/assets local to that project unless they are intentionally shared.
- Keep essay themes inside their own directories under `essays/`.
- Keep in-progress writing drafts in `writings/pending/` and finalized markdown in `writings/final/`.
- Never keep the same writing slug in both `writings/pending/` and `writings/final/`.
- Organize styling under `css/`:
  - `css/style.css` for shared primitives and global page chrome
  - `css/pages/<page>.css` for top-level page-specific styles
  - keep `fun/projects/<slug>/style.css` local to each mini project
- Keep shared JS in `js/scripts.js` for truly shared concerns.
- Leave `data/love-letters.enc.json` encrypted-only. Plaintext stays under ignored local files.
- Prefer small, explicit placeholder copy over invented marketing language.

Section map
- `/` home page
- `/about/` about placeholder
- `/work/` resume-backed professional page
- `/projects/` current projects shelf
- `/fun/` hub for mini projects
- `/essays/` hub for themes
- `/love-letters/` encrypted archive
- `/gallery/` future photo gallery placeholder
- `/glossary/` future glossary placeholder
- `/writings/` generic renderer for finalized markdown in `writings/final/`

Before shipping
- Search for stale usernames and dead links.
- Check that nav order stays `Work`, `Projects`, `Fun Stuff`, `Essays`.
- Verify mobile layout for new pages.
- Run `node scripts/sync-site.mjs` if hooks are unavailable.
