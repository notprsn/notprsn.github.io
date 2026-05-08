# Secret puzzle analytics plan

This plan keeps the public personal site, private puzzle source, and Firebase records separated.

## Goals

- Track the highest numbered puzzle level reached by each anonymous Firebase user.
- Keep the future winning state separate from numbered-level progress.
- Support private red-herring answer routes that show a troll page and then replace the current tab with the Rickroll.
- Avoid publishing the private red-herring answer list in the GitHub Pages artifact.

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

The important constraint is that `highestLevel` is monotonic and bounded to the current numbered puzzle. The final winner page can be added later with `data-puzzle-won="true"` without changing the document shape.

## Public repo implementation

- `js/firebase-analytics.js`
  - `trackPuzzleLevel(level, { path })` records numbered-level progress.
  - `trackPuzzleWin({ level, path })` marks `hasWon: true`, sets `wonAt` once, and preserves the highest numbered level.
- `firestore.rules`
  - users can read and write only their own `puzzleProgress/{uid}` document.
  - admin can read/list progress.
  - `highestLevel` cannot decrease.
  - `hasWon` cannot return to `false`.
- `.github/workflows/pages.yml`
  - copies private puzzle files into `_site/secret/`.
  - excludes `red-herrings.json` and private puzzle scripts from the deployed artifact.
  - runs the private red-herring generator when present.

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

- `red-herring.html`: shared troll page using `imgs/troll.png`.
- `red-herrings.json`: private answer-route list, not deployed.
- `scripts/build-red-herrings.mjs`: generates static fake-404 decoy pages into `_site/secret/`.

`red-herrings.json` supports either:

```json
{
  "routes": [
    "wrong-answer",
    "wrong-answer.html",
    "nested/wrong-answer/"
  ]
}
```

For an extensionless route like `wrong-answer`, the generator creates both `wrong-answer.html` and `wrong-answer/index.html`. The generated page shows the troll image, waits briefly, then calls `window.location.replace(...)` so the Rickroll opens in the same tab.

The generator refuses to overwrite existing non-generated puzzle pages, so real levels are protected from accidental red-herring route collisions.
