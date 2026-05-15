# Secret puzzle analytics plan

This plan keeps the public personal site, private puzzle source, and Firebase records separated.

## Goals

- Track the highest numbered puzzle level reached by each anonymous Firebase user.
- Keep the future winning state separate from numbered-level progress.
- Support private-listed red-herring `/secret/...` answer routes that show a troll page and then replace the current tab with the Rickroll.
- Avoid publishing the private red-herring answer list in the GitHub Pages artifact.
- Show a public aggregate solver count on `/secret/` without exposing per-user progress records.

## Firebase record

Collection: `puzzleProgress`

Document id: Firebase Anonymous Auth `uid`

Fields:

- `visitorId`: same value as the document id.
- `createdAt`: first puzzle progress write.
- `updatedAt`: latest puzzle progress write.
- `highestLevel`: integer from `0` to `11`.
- `lastLevel`: latest numbered level page visited, also `0` to `11`.
- `lastPath`: latest tracked `/secret/` path.
- `hasWon`: boolean, independent from `highestLevel`.
- `wonAt`: timestamp, present only after `hasWon` becomes `true`.
- `lastWinPath`: optional path for the winner page.
- `countedAsSolver`: set after the first counted win for that anonymous user.
- `solverCountedAt`: timestamp for the aggregate count write.

The important constraint is that `highestLevel` is monotonic and bounded to the current numbered puzzle. The final winner page can be added later with `data-puzzle-won="true"` without changing the document shape.

Public aggregate collection: `publicStats/secretPuzzle`

Fields:

- `solverCount`: total counted anonymous users who have reached the winner state.
- `updatedAt`: latest aggregate update.
- `lastSolvedAt`: latest counted solve.

## Public repo implementation

- `js/firebase-analytics.js`
  - `trackPuzzleLevel(level, { path })` records numbered-level progress.
  - `trackPuzzleWin({ level, path })` marks `hasWon: true`, sets `wonAt` once, preserves the highest numbered level, and increments the public solver count only on that user's first win.
  - `getSecretPuzzleStats()` reads the public aggregate solver count.
- `firestore.rules`
  - users can read and write only their own `puzzleProgress/{uid}` document.
  - admin can read/list progress.
  - `highestLevel` cannot decrease.
  - `hasWon` cannot return to `false`.
  - public users can read only `publicStats/secretPuzzle`.
- `.github/workflows/pages.yml`
  - copies private puzzle files into `_site/secret/`.
  - excludes `red-herrings.json` from the deployed artifact.
  - runs `scripts/build-secret-red-herrings.mjs` against the private red-herring list to generate noindex redirect stubs.
- `404.html`
  - serves the regular not-found page for unlisted missing paths.

Deploy rules after public changes:

```sh
firebase deploy --only firestore:rules
```

## Private puzzle implementation

- Each numbered level page sets `data-puzzle-level="<number>"`.
- `puzzle-analytics.js` imports `/js/firebase-analytics.js` and writes progress.
- A future winner page should set:

```html
<body data-puzzle-level="11" data-puzzle-won="true">
```

Use `level="11"` until the numbered level setup changes.

## Red-herring routes

The private puzzle source owns:

- `fool.html`: shared troll page using `imgs/troll.png`.
- `red-herrings.json`: private answer-route notes, not deployed.
- `puzzle-index.js`: reads the public solver count for `/secret/`.

`red-herrings.json` is only a private notes file:

```json
{
  "routes": [
    "wrong-answer"
  ],
  "customRoutes": []
}
```

Runtime behavior is explicit: real puzzle pages load normally, listed red-herring routes are generated as redirect stubs to `/secret/fool.html`, and unlisted missing `/secret/...` paths hit the public `404.html`. `fool.html` shows the troll image, waits briefly, then calls `window.location.replace(...)` so the Rickroll opens in the same tab.
