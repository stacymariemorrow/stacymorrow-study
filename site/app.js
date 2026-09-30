(function () {
  "use strict";

  var W = typeof window !== "undefined" ? window : {};
  var CFG = W.SITE_CONFIG || {};
  var QUARTERS = W.QUARTERS || [];
  var BOOKSHELF = W.BOOKSHELF || [];
  var VISIBLE = 5;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* ---------- helpers (pure, tested in tests/helpers.test.js) ---------- */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  // APA strings mark italics with *asterisks*
  function apaToHtml(s) {
    return esc(s).replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }
  function parseDate(iso) {
    if (!iso) return null;
    var p = iso.split("-").map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }
  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function fmtShort(d) { return MONTHS[d.getMonth()] + " " + d.getDate(); }
  function mondayOf(d) {
    var x = startOfDay(d);
    var off = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - off);
    return x;
  }
  function weekOfQuarter(q, today) {
    var start = mondayOf(parseDate(q.start));
    var end = parseDate(q.end);
    var t = startOfDay(today);
    if (t < start) return { label: "Starts " + fmtShort(parseDate(q.start)), n: 0 };
    if (t > end) return { label: "Quarter complete", n: -1 };
    var n = Math.floor((t - start) / (7 * 864e5)) + 1;
    var total = Math.floor((mondayOf(end) - start) / (7 * 864e5)) + 1;
    return { label: "Week " + n + " of " + total, n: n };
  }
  function amazonUrl(isbn10, tag) {
    if (!isbn10) return null;
    var u = "https://www.amazon.com/dp/" + encodeURIComponent(isbn10);
    return tag ? u + "?tag=" + encodeURIComponent(tag) : u;
  }
  function scholarUrl(r) {
    return "https://scholar.google.com/scholar?q=" + encodeURIComponent('"' + r.title + '"');
  }
  function isRead(r, today) {
    var d = parseDate(r.date);
    return d ? d <= startOfDay(today) : false;
  }
  function matches(r, filter, query, today) {
    if (filter === "free" && !(r.read_url && (r.access === "free" || r.access === "stream"))) return false;
    if (!query) return true;
    var hay = [r.short, r.title, r.apa, (r.themes || []).join(" ")].join(" ").toLowerCase();
    return query.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }

  // Readings already assigned (date on or before today), newest class day first.
  function newestFirst(list, today) {
    return list.filter(function (r) { return r.apa && isRead(r, today); })
      .map(function (r, i) { return { r: r, i: i }; })
      .sort(function (a, b) { return b.r.date.localeCompare(a.r.date) || a.i - b.i; })
      .map(function (x) { return x.r; });
  }

  var helpers = { newestFirst: newestFirst, esc: esc, apaToHtml: apaToHtml, parseDate: parseDate, mondayOf: mondayOf,
    weekOfQuarter: weekOfQuarter, amazonUrl: amazonUrl, isRead: isRead, matches: matches };
  if (typeof module !== "undefined" && module.exports) { module.exports = helpers; return; }

  /* ---------- rendering ---------- */

  var today = new Date();
  var state = { filter: "all", query: "", quarter: null };

  function pickQuarter() {
    var byUrl = new URLSearchParams(location.search).get("q");
    var id = byUrl || CFG.currentQuarter;
    return QUARTERS.filter(function (q) { return q.id === id; })[0] || QUARTERS[QUARTERS.length - 1];
  }

  function readingsFor(q, slug) {
    return q.readings.filter(function (r) { return r.course === slug; })
      .sort(function (a, b) { return (a.date || "9").localeCompare(b.date || "9"); });
  }

  function actions(r) {
    var out = [];
    var tag = CFG.amazonTag || "";
    if (r.read_url && r.access === "free") out.push('<a class="btn btn-gold" href="' + esc(r.read_url) + '" target="_blank" rel="noopener">Read now</a>');
    if (r.read_url && r.access === "stream") out.push('<a class="btn btn-gold" href="' + esc(r.read_url) + '" target="_blank" rel="noopener">Watch or listen</a>');
    if (r.isbn10) out.push('<a class="btn btn-crimson" href="' + esc(amazonUrl(r.isbn10, tag)) + '" target="_blank" rel="sponsored noopener">Buy the book</a>');
    if (r.read_url && r.access === "book") out.push('<a class="btn btn-ghost" href="' + esc(r.read_url) + '" target="_blank" rel="noopener">Borrow free</a>');
    if (r.doi_url) out.push('<a class="btn btn-ghost" href="' + esc(r.doi_url) + '" target="_blank" rel="noopener">Publisher page</a>');
    if (r.kind !== "film" && r.kind !== "podcast" && r.title && r.apa) out.push('<a class="btn btn-ghost" href="' + esc(scholarUrl(r)) + '" target="_blank" rel="noopener">Google Scholar</a>');
    return out.join("");
  }

  function badges(r) {
    if (r.read_url && (r.access === "free" || r.access === "stream")) return '<span class="badge free">Free</span>';
    if (r.isbn10) return '<span class="badge">Book</span>';
    return "";
  }

  function readingHtml(r, prefix) {
    var showTitle = r.title && r.short.indexOf(r.title) === -1;
    var body = "";
    if (r.apa) body += '<p class="apa"><span class="label">APA 7</span>' + apaToHtml(r.apa) + "</p>";
    if (r.summary) body += '<div><span class="block-label">Summary</span><p>' + esc(r.summary) + "</p></div>";
    if (r.analysis) body += '<div class="analysis"><span class="block-label">Analysis</span><p>' + esc(r.analysis) + "</p></div>";
    if (r.themes && r.themes.length) body += '<div class="tags">' + r.themes.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</div>";
    var act = actions(r);
    if (act) body += '<div class="actions-row">' + act + "</div>";
    if (r.confidence && r.confidence !== "confirmed") body += '<p class="note">Syllabus lists the author only; this is the most likely assigned text and will be confirmed against the course file.</p>';
    return '<details class="reading" id="' + (prefix || "r-") + esc(r.id) + '"><summary class="reading-sum">' +
      '<span class="line"><span class="who">' + esc(r.short) + "</span>" +
      (showTitle ? ' <span class="title">' + esc(r.title) + "</span>" : "") + "</span>" +
      '<span class="badges">' + badges(r) + '</span><span class="toggle" aria-hidden="true"></span>' +
      '</summary><div class="reading-body">' + body + "</div></details>";
  }

  // First VISIBLE items shown, the rest behind a "Show N more" expander.
  function listHtml(items, label, prefix, expandAll) {
    if (!items.length) return '<div class="empty">No readings match.</div>';
    var shown = expandAll ? items : items.slice(0, VISIBLE);
    var rest = expandAll ? [] : items.slice(VISIBLE);
    var html = shown.map(function (r) { return readingHtml(r, prefix); }).join("");
    if (rest.length) {
      html += '<details class="more"><summary class="more-sum"><span>Show ' + rest.length + " earlier " + esc(label) + (rest.length === 1 ? "" : "s") +
        '</span><span class="toggle" aria-hidden="true"></span></summary>' + rest.map(function (r) { return readingHtml(r, prefix); }).join("") + "</details>";
    }
    return html;
  }

  function renderCourses(q) {
    document.getElementById("course-cards").innerHTML = q.courses.map(function (c) {
      var done = newestFirst(readingsFor(q, c.slug), today).length;
      return '<article class="course-card">' +
        '<span class="code">' + esc(c.code) + "</span>" +
        "<h3>" + esc(c.title) + "</h3>" +
        '<p class="meta">' + esc(c.instructor) + " | " + esc(c.text) + "</p>" +
        '<p class="desc">' + esc(c.description) + "</p>" +
        '<p class="count-line"><strong>' + done + "</strong> readings so far</p>" +
        '<a class="card-link" href="#list-' + esc(c.slug) + '" data-open="' + esc(c.slug) + '">Open reading list</a>' +
        "</article>";
    }).join("");
  }

  function renderDives(q) {
    document.getElementById("dive-list").innerHTML = (q.deepDives || []).map(function (d) {
      var s = d.status.toLowerCase();
      var cls = /complete|presented/.test(s) ? "s-done" : /progress|development/.test(s) ? "s-active" : "s-plan";
      return '<article class="dive' + (cls === "s-active" ? " active" : "") + '">' +
        '<div class="dive-top"><span class="where">' + esc(d.course) + '</span><span class="status ' + cls + '">' + esc(d.status) + "</span></div>" +
        "<h3>" + esc(d.title) + "</h3><p>" + esc(d.summary) + "</p>" +
        (d.sources && d.sources.length ? '<div class="sources">Drawing on ' + esc(d.sources.join("; ")) + "</div>" : "") +
        "</article>";
    }).join("");
  }

  function rememberOpen() {
    var open = {};
    document.querySelectorAll("details[open]").forEach(function (d) { if (d.id) open[d.id] = true; });
    return open;
  }
  function restoreOpen(root, open) {
    root.querySelectorAll("details.reading").forEach(function (d) { if (open[d.id]) { d.open = true; var m = d.closest("details.more"); if (m) m.open = true; } });
  }

  function renderLists(q) {
    var open = rememberOpen();
    var searching = !!state.query || state.filter !== "all";
    var html = q.courses.map(function (c) {
      var read = newestFirst(readingsFor(q, c.slug), today);
      var rs = read.filter(function (r) { return matches(r, state.filter, state.query, today); });
      var id = "list-" + c.slug;
      var isOpen = open[id] || searching;
      return '<details class="course" id="' + esc(id) + '"' + (isOpen ? " open" : "") + '><summary class="course-sum">' +
        '<div><span class="code">' + esc(c.code) + "</span><h3>" + esc(c.title) + '</h3><p class="meta">' + esc(c.instructor) + "</p></div>" +
        '<span class="counts">' + read.length + ' read</span><span class="toggle" aria-hidden="true"></span>' +
        '</summary><div class="course-body">' + listHtml(rs, "reading", "r-", searching) + "</div></details>";
    }).join("");
    var root = document.getElementById("course-lists");
    root.innerHTML = html;
    restoreOpen(root, open);
  }

  function renderShelf() {
    var el = document.getElementById("shelf-list");
    if (!el) return;
    var open = rememberOpen();
    el.innerHTML = listHtml(BOOKSHELF, "book", "b-", false);
    restoreOpen(el, open);
    var n = document.getElementById("shelf-count");
    if (n) n.textContent = BOOKSHELF.length + " books";
  }

  function openReading(id) {
    var el = document.getElementById("r-" + id);
    if (!el) return;
    var course = el.closest("details.course");
    if (course) course.open = true;
    var more = el.closest("details.more");
    if (more) more.open = true;
    el.open = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function render() {
    var q = state.quarter;
    document.getElementById("quarter-label").textContent = q.label;
    document.getElementById("week-label").textContent = weekOfQuarter(q, today).label;
    renderCourses(q); renderDives(q); renderLists(q); renderShelf();
  }

  function init() {
    if (!QUARTERS.length) return;
    state.quarter = pickQuarter();

    if (QUARTERS.length > 1) {
      var sel = document.getElementById("quarter-select");
      sel.innerHTML = QUARTERS.map(function (q) { return '<option value="' + esc(q.id) + '">' + esc(q.label) + "</option>"; }).join("");
      sel.value = state.quarter.id;
      sel.addEventListener("change", function () {
        state.quarter = QUARTERS.filter(function (q) { return q.id === sel.value; })[0];
        history.replaceState(null, "", "?q=" + encodeURIComponent(sel.value));
        render();
      });
      document.getElementById("quarter-switch").hidden = false;
    }

    document.getElementById("q").addEventListener("input", function (e) { state.query = e.target.value.trim(); renderLists(state.quarter); });
    document.querySelectorAll(".chip").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll(".chip").forEach(function (x) { x.classList.remove("is-on"); x.setAttribute("aria-pressed", "false"); });
        b.classList.add("is-on"); b.setAttribute("aria-pressed", "true");
        state.filter = b.dataset.filter; renderLists(state.quarter);
      });
    });
    document.addEventListener("click", function (e) {
      var a = e.target.closest("[data-reading]");
      if (a) { e.preventDefault(); openReading(a.dataset.reading); return; }
      var o = e.target.closest("[data-open]");
      if (o) { var d = document.getElementById("list-" + o.dataset.open); if (d) d.open = true; }
    });

    if (CFG.email) {
      var em = document.getElementById("email-link"); em.href = "mailto:" + CFG.email; em.textContent = CFG.email;
    }
    document.getElementById("contact-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = e.target;
      var subject = f.topic.value + " from " + f.name.value;
      window.location.href = "mailto:" + (CFG.email || "") + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(f.message.value + "\n\n" + f.name.value);
    });

    render();
    if (location.hash.indexOf("#r-") === 0) openReading(location.hash.slice(3));
  }

  document.addEventListener("DOMContentLoaded", init);
})();
