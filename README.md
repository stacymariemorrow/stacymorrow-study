# stacymorrow.study

Static site. No build step to deploy: upload this folder.

## Swap to a new quarter

1. Add `data/winter-2027.js` (copy `data/fall-2026.js`, replace courses, deep dives, readings).
2. In `index.html`, add `<script src="data/winter-2027.js"></script>` under the fall script. Keep the old one so past quarters stay browsable.
3. In `config.js`, set `currentQuarter: "winter-2027"`.
4. Redeploy.

A quarter picker appears automatically once two quarters are loaded. Link a past quarter with `?q=fall-2026`.

## Amazon

Once Associates approves you, set `amazonTag` in `config.js` (e.g. `"stacymorrow-20"`). Every Buy button picks it up.

## Reading fields

`date` (class day), `short`, `title`, `apa` (italics in *asterisks*), `access` (`free`, `stream`, `book`, `paywalled`), `read_url`, `doi_url`, `isbn10`, `summary`, `analysis`, `themes`, `confidence`.
