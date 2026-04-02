# Site Architecture

Primary sections
- `/` home
- `/about/`
- `/work/`
- `/projects/`
- `/fun/`
- `/essays/`
- `/love-letters/`
- `/gallery/`
- `/glossary/`
- `/puzzles/` hidden noindex trail outside the main nav

Structure principles
- Each section owns its own content and future assets.
- Shared CSS/JS should stay minimal and generic.
- New experiments or essays should be added as subdirectories inside their parent section.
- Shared page chrome and reusable layout primitives live in `css/style.css`.
- Top-level page-family styles live in `css/pages/`.
- Shared JS lives in `js/site.js`, and page-owned entrypoints live in `js/pages/`.
- The finished math mini-project shell lives in `css/pages/fun-projects.css`.
- Mini-project styles under `fun/projects/<slug>/` stay local to that project for theme variables and project-specific visuals.
- Markdown-backed detail pages currently render through `js/pages/content-entry.js`.
- Contributor workflows live in `docs/section-workflows.md`.

Current page-family CSS
- `/` uses `css/pages/home.css`.
- `/work/` and `/work/stories/*` use `css/pages/work.css`.
- `/projects/` and `projects/*` use `css/pages/projects.css`.
- `/essays/`, essay theme pages, and generated essay detail pages use `css/pages/essays.css`.
- `/love-letters/` uses `css/pages/love.css`.
- `/about/` uses `css/pages/about.css`.
- `/fun/` uses `css/pages/fun.css`.
- All six current math mini-projects share `css/pages/fun-projects.css` plus their local project styles.
- `/puzzles/` uses `css/pages/puzzles.css`.

Patterns
- Work: resume-backed, factual, low-interpretation.
- Projects: current build shelf plus selective project-specific detail pages.
- Fun: hub page plus self-contained project directories.
- Essays: theme hubs plus theme-local `content.md` files that publish when they have prose.
- Gallery and glossary: placeholders now, fuller structures later.
- Puzzles: intentionally off-nav, noindex, and self-contained.
- Shared style language: see `docs/style-language.md`.

Current content inventory
- Work:
  - `/work/` has 6 experience blocks, scholastic achievements, and a skills section.
  - `work/stories/` has 6 public long-form story pages.
- Projects:
  - `/projects/` has 3 shelf cards.
  - Bollywoodle has 2 public detail pages: `story` and `humming`.
  - CloudScript has a public detail page shell with an intentionally minimal public note.
  - Polymarket Crypto Desk has a shelf card and sample data, but no linked public detail page yet.
- Fun:
  - `/fun/` links to 6 live mini-projects.
- Essays:
  - `/essays/` has 2 theme hubs.
  - All 22 essay `content.md` files are currently blank, so there are 0 generated public essay detail pages.
- Love Letters:
  - The decryption flow is live and `data/love-letters.enc.json` is initialized with a real encrypted bundle.
- Gallery and Glossary:
  - Both routes are still placeholders.
- Puzzles:
  - `puzzles/` contains an entry page, 5 levels, and a final page.

Current self-contained directories
- `fun/projects/<slug>/`
- `essays/travel/`
- `essays/miscellaneous/`
- `projects/<slug>/`
- `projects/bollywoodle/<note>/`
- `work/stories/<slug>/`
