# stacymorrow.study

Static site served by the Cloudflare Worker `stacymorrow-study` on stacymorrow.study.

## Deploy

1. `python3 build_data.py` if reading data changed. Bump the `?v=` number on the css and script tags in `index.html`, then commit and push to `main`.
2. Run `tools/deploy-worker.js` in the browser console on dash.cloudflare.com.

Tests: `node tests/helpers.test.js`

## Swap to a new quarter

1. Add `data/winter-2027.js` (copy `data/fall-2026.js`, replace courses, deep dives, readings).
2. In `index.html`, add `<script src="data/winter-2027.js"></script>` under the fall script. Keep the old one so past quarters stay browsable.
3. In `config.js`, set `currentQuarter: "winter-2027"`.
4. Push, then deploy.

A quarter picker appears automatically once two quarters are loaded. Link a past quarter with `?q=fall-2026`.

## Bookshelf

Books outside the syllabus live in `site/data/bookshelf.js`. Add new books at the top; the newest five show and the rest sit behind an expander. Course lists work the same way and only show readings whose class date has passed.

## Amazon

Once Associates approves you, set `amazonTag` in `config.js` (e.g. `"stacymorrow-20"`). Every Buy button picks it up.

## Reading fields

`date` (class day), `short`, `title`, `apa` (italics in *asterisks*), `access` (`free`, `stream`, `book`, `paywalled`), `read_url`, `doi_url`, `isbn10`, `summary`, `analysis`, `themes`, `confidence`.

## Analytics

Google Tag Manager `GTM-5X4KNMK6` (account backroom) loads GA4 stream `G-XHQLZ3YJME` (property Backroom Syndicate, stream "stacymorrow study").
GA4 enhanced measurement covers page views, scrolls, outbound clicks, site search, file downloads and form interactions.
The site pushes these to `dataLayer`, and the GTM tag "GA4 Event - site events" forwards them with parameters
`label, course, section, link_url, search_term, cta_location`:

read_now, buy_book, borrow_free, publisher_page, google_scholar, watch_listen, reading_open, show_more,
course_open, search, filter_select, contact_click, generate_lead, work_link_click
