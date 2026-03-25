# Section Workflows

Add a new fun project
1. Copy `fun/projects/template/` into `fun/projects/<slug>/`.
2. Keep all HTML, CSS, and JS local to that new directory.
3. Add one card on `/fun/` linking to the new page.
4. If the project needs shared utilities, add them only after a second project needs the same thing.

Add a new essay theme
1. Create `essays/<theme>/index.html`.
2. Keep theme-specific notes or assets under that directory.
3. Link the theme from `/essays/`.

Add a new essay page later
1. Create it under the relevant theme directory.
2. Keep supporting images or media with the essay if they are theme-specific.
3. Cross-link from the theme hub and only then from elsewhere.

Finalize a writing
1. Write raw text in `writings/pending/<slug>.md`.
2. Polish it into markdown headers, structure, and links.
3. Move the file into `writings/final/<slug>.md`.
4. Commit normally. The pre-commit hook will refresh the manifest and cache-bust site assets.
5. Do not leave a copy behind in `writings/pending/`.

Add a new glossary page
1. Add the term page under `glossary/`.
2. Link back to the section that motivated the term.

Add a gallery later
1. Decide album directories first.
2. Generate optimized image variants before committing.
3. Avoid storing only full-resolution originals in the public tree.
