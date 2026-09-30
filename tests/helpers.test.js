// Run: node tests/helpers.test.js
const assert = require("assert");
const h = require("../site/app.js");

const q = { start: "2026-09-08", end: "2026-11-20" };
assert.strictEqual(h.weekOfQuarter(q, new Date(2026, 8, 30)).label, "Week 4 of 11");
assert.strictEqual(h.weekOfQuarter(q, new Date(2026, 8, 1)).n, 0);
assert.strictEqual(h.weekOfQuarter(q, new Date(2026, 11, 1)).label, "Quarter complete");

assert.strictEqual(h.mondayOf(new Date(2026, 8, 30)).getDate(), 28);
assert.strictEqual(h.mondayOf(new Date(2026, 9, 4)).getDate(), 28); // Sunday Oct 4

assert.strictEqual(h.amazonUrl("0190942770", ""), "https://www.amazon.com/dp/0190942770");
assert.strictEqual(h.amazonUrl("0190942770", "stacy-20"), "https://www.amazon.com/dp/0190942770?tag=stacy-20");
assert.strictEqual(h.amazonUrl(null, "x"), null);

assert.strictEqual(h.apaToHtml("Smith, J. (2020). *Big <book>*."), "Smith, J. (2020). <em>Big &lt;book&gt;</em>.");

const today = new Date(2026, 8, 30);
const r = { date: "2026-09-30", short: "Hall (1981)", title: "The whites of their eyes", apa: "", themes: ["race", "ideology"], access: "book" };
assert.ok(h.isRead(r, today));
assert.ok(!h.isRead({ date: "2026-10-05" }, today));
assert.ok(h.matches(r, "read", "hall ideology", today));
assert.ok(!h.matches(r, "upcoming", "", today));
assert.ok(!h.matches(r, "free", "", today));
assert.ok(h.matches({ ...r, access: "free", read_url: "https://x" }, "free", "", today));

console.log("all helper tests passed");
