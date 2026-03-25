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

Patterns
- Work: resume-backed, factual, low-interpretation.
- Projects: current build shelf only.
- Fun: hub page plus self-contained project directories.
- Essays: theme hubs first, essay pages later.
- Gallery and glossary: placeholders now, fuller structures later.

Current self-contained directories
- `fun/projects/mod-circle/`
- `fun/projects/template/`
- `essays/travel/`
- `essays/miscellaneous/`
