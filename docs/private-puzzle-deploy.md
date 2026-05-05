# Private Puzzle Deploy Runbook

The secret puzzle is developed in a private repo and injected into the public GitHub Pages artifact during the public repo deploy.

Repos
- Public site: `/Users/prasanniyer/notprsn.github.io`
- Private puzzle source: `/Users/prasanniyer/notprsn.github.io/private/site-private-puzzle`
- Deployed route: `/secret/`
- Private upstream: `https://github.com/notprsn/site-private-puzzle.git`
- Public upstream: `https://github.com/notprsn/notprsn.github.io.git`

Deployment path
1. Push puzzle changes to `notprsn/site-private-puzzle`.
2. Push public site changes to `notprsn/notprsn.github.io`.
3. `.github/workflows/pages.yml` runs on public `main`.
4. The workflow checks out the public repo into `public-site`.
5. The workflow checks out `notprsn/site-private-puzzle` into `private-puzzle` using `secrets.PUZZLE_REPO_PAT`.
6. The workflow runs `node scripts/sync-site.mjs` in the public repo.
7. The public artifact excludes `private/`, `docs/`, `scripts/`, `references/`, `.github/`, and other repo-only files.
8. The workflow copies `private-puzzle/` into `_site/secret/`, excluding only its `.git/` and `.github/`.
9. The workflow fails if any `_site/secret/**/*.html` file is missing `<meta name="robots" content="noindex,nofollow">`.

Puzzle edit checklist
1. Work inside the private puzzle repo:

   ```bash
   cd /Users/prasanniyer/notprsn.github.io/private/site-private-puzzle
   ```

2. Keep puzzle HTML, CSS, and assets self-contained in this private repo.
3. Keep all puzzle HTML files noindex:

   ```bash
   for file in *.html; do
     grep -q '<meta name="robots" content="noindex,nofollow">' "$file" || echo "$file"
   done
   ```

4. If a clue uses `steghide`, verify the embedded payload before committing:

   ```bash
   steghide extract -sf imgs/steg.jpg -xf /tmp/puzzle-payload.txt -p "" -f
   cat /tmp/puzzle-payload.txt
   ```

5. Serve locally for manual testing:

   ```bash
   python3 -m http.server 8080
   ```

   Then open `http://localhost:8080/`.

Commit and push order
1. Commit and push the private puzzle repo first:

   ```bash
   cd /Users/prasanniyer/notprsn.github.io/private/site-private-puzzle
   git status --short
   git add <changed puzzle files>
   git commit -m "Update secret puzzle levels"
   git push origin main
   ```

2. Commit and push the public repo second:

   ```bash
   cd /Users/prasanniyer/notprsn.github.io
   git status --short
   # Run this when public site content, shells, assets, or markdown changed.
   node scripts/sync-site.mjs
   git status --short
   git add <changed public files>
   git commit -m "Document private puzzle deploy workflow"
   git push origin main
   ```

   For a docs-only public commit used to trigger a puzzle deploy, do not keep unrelated generated metadata churn from `sync-site`.

3. Watch the public Pages workflow. The private push alone does not deploy; the public push is what triggers the Pages artifact rebuild.

Operational notes
- Do not commit private puzzle source into the public repo outside `private/site-private-puzzle`; the public deploy intentionally excludes `private/`.
- Do not edit `references/` as part of puzzle work.
- Do not resize, optimize, recompress, or re-export steghide carrier images after embedding a payload.
- If the public workflow fails at the noindex check, fix the missing meta tag in the private puzzle repo, push it, then push or rerun the public workflow.
