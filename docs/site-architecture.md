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

Structure principles
- Each section owns its own content and future assets.
- Shared CSS/JS should stay minimal and generic.
- New experiments or essays should be added as subdirectories inside their parent section.
- Shared page chrome and reusable layout primitives live in `css/style.css`.
- Top-level page-family styles live in `css/pages/`.
- The finished math mini-project shell lives in `css/pages/fun-projects.css`.
- Mini-project styles under `fun/projects/<slug>/` stay local to that project for theme variables and project-specific visuals.
- Contributor workflows live in `docs/section-workflows.md`.

Current page-family CSS
- `/` uses `css/pages/home.css`.
- `/work/` and `/work/stories/*` use `css/pages/work.css`.
- `/projects/` and `projects/*` use `css/pages/projects.css`.
- `/essays/`, essay theme pages, and `/writings/` use `css/pages/essays.css`.
- `/love-letters/` uses `css/pages/love.css`.
- `/about/` uses `css/pages/about.css`.
- `/fun/` uses `css/pages/fun.css`.
- The cleaned-up math mini-projects share `css/pages/fun-projects.css` plus their local project styles.
- `/puzzles/` uses `css/pages/puzzles.css`.

Patterns
- Work: resume-backed, factual, low-interpretation.
- Projects: current build shelf only.
- Fun: hub page plus self-contained project directories.
- Essays: theme hubs first, essay pages later.
- Gallery and glossary: placeholders now, fuller structures later.
- Shared style language: see `docs/style-language.md`.

Current self-contained directories
- `fun/projects/<slug>/`
- `essays/travel/`
- `essays/miscellaneous/`
