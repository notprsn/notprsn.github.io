# Reading and writing checklists

The Words shelf links to `words/1000-night-reading/` and `words/writing/`. Both use `css/pages/words.css` and `js/pages/words.js`. New scheduled entries start incomplete. Reading has one completion per night, covering all three assigned works. Progress is stored in Firebase and publicly readable; only the verified Google account `prasann.work@gmail.com` can edit it. The page's small owner sign-in control works on GitHub Pages and saves progress across devices.

## Reading source

The schedule comes from the [1000 Nights Reading Program](https://archive.org/details/1000-nights-reading-program). It contains 1,000 nights, each with one short story, poem, and essay. The site imports titles, author credits, and source URLs, and links readers to the original hosts. It does not publish the works' full texts or present them as Prasann's writing.

The Archive marks the list with the Public Domain Mark. That marking does not establish rights for the individual works, translations, or linked editions. Any future on-site reader needs a separate decision and source-by-source rights checks.

## Reimporting

Download the original DOCX linked in `scripts/import-reading-program.py`, then run:

```sh
python3 scripts/import-reading-program.py /path/to/1000-Nights-Reading-Program.docx
node scripts/sync-site.mjs
```

The importer checks that all 1,000 nights have exactly three readings and records the source document's SHA-256. The generated `schedule.json` is committed, so normal site builds and page loads do not depend on the Archive being online.

## Source quality

The original list contains incorrect links. For example, its Night 2 Kipling story points to Gutenberg ebook 2818, which is *Beautiful Joe* by Marshall Saunders. Do not assume a reachable URL contains the assigned piece.

`source-links.json` records verified reading links keyed by the schedule's title and author. Reimports preserve these corrections and apply them to repeated assignments. Only mark an entry verified after confirming the actual assigned piece in the source. Unchecked entries retain the original URL, display “Link unchecked”, and offer a title-and-author search. Some assignments name selections ambiguously; do not silently substitute a different piece.

All 300 assignments in the first 100 nights now have checked reading destinations. Corrections and exact title matches in the same checked editions also populate later nights: 1,968 of 3,000 readings have checked links, covering all three assignments in 297 nights. The remaining 1,032 readings retain their unchecked labels. This is not a complete audit of every source in the program. Gutenberg destinations use section anchors or text fragments where possible; hosts without reliable section anchors may open the correct complete work. Full texts downloaded for checking links stay outside the repository.

Numbered Dickinson and Whitman selections follow the linked edition's reading order, as approved by Prasann. Dickinson counts numbered poems across the three series in ebook 12242, excluding the unnumbered introductory poem; Whitman counts poem headings in ebook 1322, excluding book headings. Each selection displays its resolved poem title in a small note. Shakespeare sonnets link to their numbered poem's opening line. Alternate translation titles and unspecified excerpts are also noted. The Tatler assignment does not identify individual papers, so its link opens the credited collection with that limitation stated.

Links were checked against the actual edition's contents and Gutenberg's own catalogue on 2026-10-06, rather than trusting the original ebook IDs. Bibliographic titles, authors, original source URLs, and the source document hash remain unchanged. Corrections also link to credited publications on Poetry Foundation, the Orwell Foundation, Wikisource, the Lovecraft Archive, Representative Poetry Online, Poetry in Translation, and Poem Hunter.

## Writing

`words/writing/tasks.json` contains all 28 locations from the old setup. The 13 countries with recorded dates appear chronologically; India and its 14 locations appear under “Dates to add” because the original setup did not assign them years. Update the years in this file when known; do not infer visit dates.

The shelf is titled “Almost Prasann” with “For Substack first. Eternity second.” Owner controls let Prasann attach a `https://<publication>.substack.com/p/<post>` link to each location. Saving a post link marks the location published. Removing it returns the location to pending. Visitors can read published links but cannot edit or mark progress. The original assignment notes remain in `docs/writing-backlog.md` for reference; that older list does not drive the live checklist.

## Firebase

- Reading documents: `wordProgress/reading/nights/<1–1000>`, with `complete` and `updatedAt`.
- Writing documents: `wordProgress/writing/places/<slug>`, with `complete`, `substackUrl`, and `updatedAt`.
- `js/pages/words-progress.js` uses the existing Firebase configuration and a separate named app so Google owner sign-in does not replace the anonymous analytics session.
- `firestore.rules` allows public reads, requires the owner's verified email and Google sign-in for writes, validates fields and night IDs, and rejects completed writing entries without a Substack post URL.
- Google sign-in and `notprsn.github.io` must remain enabled in Firebase Authentication. After changing rules, deploy with `firebase deploy --only firestore:rules --project notprsn-github-io`.
- Existing browser-only checkmarks are not imported: those were per visitor, so they cannot establish the owner's public progress.

## Former URLs

All site navigation points to `/words/`. GitHub Pages' custom `404.html` sends former `/essays/` URLs to `/words/` through `js/pages/not-found.js`, with a Words link for browsers without JavaScript. The existing private puzzle fallback is preserved. This is a browser redirect from a 404 response, not an HTTP 301.
