/* nl-nav.js: shared navigation kit for NET Law 058. One file, CSS included, no other dependency.

   EVERY PAGE that loads accessibility.js gets this file automatically, so any new page gets:
     1. a slim vertical reading-progress rail on the right edge (with % and a draggable handle)
     2. "Back to top" and "Go to bottom" buttons

   FOR MCQ LISTS it exposes:
     NLNav.pager({...})     range chips (1-100, 101-200 ...) + Prev / 1 2 3 / Next + page size
     NLNav.practice(host)   "Practice Progress: 35/100 attempted - 35%" bar
     NLNav.track(el)        make the reading rail follow this list instead of the whole page
     Pomodoro timer (25/5, bottom-left) appears automatically on any page that uses pager()/practice(),
     and on any page if <html data-nl-pomodoro> is set. Never on mock tests. It keeps running across pages.
     (or just put data-nl-track on any long element, no JS needed)

   Mock tests: only the rail and the jump buttons are added. Timer, palette, submit and results are not touched. */
(function () {
  "use strict";
  if (window.NLNav) return;
  var doc = document;
  var reduce = function () { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; };
  var say = function (m) { if (window.announce) window.announce(m); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  /* ---------- styles (use the site's theme variables, with fallbacks for standalone pages) ---------- */
  var css = [
    ":root{--nl-ac:var(--ac,#2f6f58);--nl-btn:var(--btn,var(--ac,#2f6f58));--nl-bg:var(--surface,var(--sf,#fff));--nl-ln:var(--line,var(--ln,#e1ebe7));--nl-tx:var(--text,var(--tx,#1e3138));--nl-mu:var(--mut,var(--mu,#5b6670));--nl-tint:var(--tint,#e3f0ea);--nl-chip:var(--chip,#e8eeec);--nl-ok:var(--ok,var(--ac,#2f6f58))}",
    /* reading rail */
    "#nl-rail{position:fixed;right:3px;top:116px;bottom:28px;width:14px;z-index:30;pointer-events:none;opacity:0;transition:opacity .25s}",
    "#nl-rail.on{opacity:1}#nl-rail[hidden]{display:none}",
    ".nl-r-track{position:absolute;right:4px;top:0;bottom:0;width:6px;border-radius:99px;background:var(--nl-chip);box-shadow:inset 0 0 0 1px var(--nl-ln);pointer-events:auto;touch-action:none}",
    ".nl-r-fill{position:absolute;left:0;top:0;width:100%;height:0;border-radius:99px;background:var(--nl-ac)}",
    ".nl-r-thumb{position:absolute;left:50%;top:0;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;background:var(--nl-ac);border:2px solid var(--nl-bg);box-shadow:0 1px 5px rgba(0,0,0,.3);cursor:grab}",
    "#nl-rail.drag .nl-r-thumb{cursor:grabbing;transform:scale(1.15)}",
    ".nl-r-pct{position:absolute;right:2px;top:-28px;padding:5px 8px;border-radius:99px;background:var(--nl-bg);border:1px solid var(--nl-ln);color:var(--nl-mu);font:700 11px/1 system-ui,sans-serif}",
    "@media(max-width:899px){#nl-rail{right:1px;width:12px;top:100px}.nl-r-track{right:3px;width:4px}.nl-r-pct{display:none}#nl-rail.drag .nl-r-pct{display:block}}",
    /* jump buttons */
    "#nl-jump{position:fixed;right:18px;bottom:18px;z-index:31;display:flex;flex-direction:column;gap:8px}",
    ".nl-j{width:44px;height:44px;border-radius:50%;border:1px solid var(--nl-ln);background:var(--nl-bg);color:var(--nl-tx);box-shadow:0 4px 14px rgba(0,0,0,.18);cursor:pointer;display:grid;place-items:center;padding:0;transition:background .2s,transform .2s}",
    ".nl-j:hover{background:var(--nl-tint);transform:translateY(-1px)}.nl-j:focus-visible{outline:3px solid var(--nl-ac);outline-offset:2px}.nl-j[hidden]{display:none}",
    "@media(max-width:560px){#nl-jump{right:10px;bottom:10px;gap:6px}.nl-j{width:40px;height:40px;opacity:.92}}",
    ".mt-page{padding-bottom:84px}",
    /* range chips */
    ".nl-rgs{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 10px;margin:0 0 6px;scrollbar-width:thin;-webkit-overflow-scrolling:touch}",
    ".nl-rg{flex:none;min-height:44px;padding:0 16px;border:1px solid var(--nl-ln);background:var(--nl-bg);color:var(--nl-mu);border-radius:12px;font:inherit;font-size:.8125rem;font-weight:700;cursor:pointer;white-space:nowrap;transition:background .2s,border-color .2s,color .2s}",
    ".nl-rg:hover{border-color:var(--nl-ac);color:var(--nl-tx)}.nl-rg:focus-visible,.nl-pb:focus-visible,.nl-pg select:focus-visible{outline:3px solid var(--nl-ac);outline-offset:2px}",
    ".nl-rg[aria-pressed=true]{background:var(--nl-btn);border-color:var(--nl-btn);color:var(--nl-on,#fff)}",
    /* pagination bar */
    ".nl-pg{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:10px 0}",
    ".nl-info{flex:1 1 100%;margin:0;font-size:.8125rem;color:var(--nl-mu)}.nl-info b{color:var(--nl-tx)}",
    ".nl-pb{min-width:44px;min-height:44px;padding:0 12px;border:1px solid var(--nl-ln);background:var(--nl-bg);color:var(--nl-tx);border-radius:10px;font:inherit;font-size:.875rem;font-weight:700;cursor:pointer;transition:background .2s,border-color .2s}",
    ".nl-pb:hover:not(:disabled){border-color:var(--nl-ac);background:var(--nl-tint)}.nl-pb:disabled{opacity:.45;cursor:not-allowed}",
    ".nl-pb[aria-current=page]{background:var(--nl-btn);border-color:var(--nl-btn);color:var(--nl-on,#fff)}",
    ".nl-gap{color:var(--nl-mu);padding:0 2px}",
    ".nl-pg select{min-height:44px;margin-left:auto;padding:0 10px;border:1px solid var(--nl-ln);border-radius:10px;background:var(--nl-bg);color:var(--nl-tx);font:inherit;font-size:.8125rem}",
    "@media(max-width:560px){.nl-pb{min-width:40px;padding:0 9px}.nl-t{display:none}.nl-pg{gap:6px}.nl-pg select{margin-left:0}}",
    /* practice progress */
    ".nl-pp{border:1px solid var(--nl-ln);background:var(--nl-bg);border-radius:14px;padding:12px 14px;margin:0 0 12px}.nl-pp[hidden]{display:none}",
    ".nl-pp-t{display:flex;flex-wrap:wrap;justify-content:space-between;gap:2px 14px;font-size:.875rem;color:var(--nl-tx)}.nl-pp-t span{color:var(--nl-mu);font-size:.8125rem}",
    ".nl-pp-b{height:8px;margin-top:8px;border-radius:99px;background:var(--nl-chip);overflow:hidden}.nl-pp-b i{display:block;height:100%;width:0;background:var(--nl-ok);transition:width .3s}",
    ".nl-ans{box-shadow:inset 3px 0 0 var(--nl-ok)}",
    /* pomodoro */
    "#nl-pomo{position:fixed;left:14px;bottom:18px;z-index:31;display:flex;flex-direction:column;align-items:flex-start;gap:8px}#nl-pomo[hidden]{display:none}",
    ".nl-po-pill{display:flex;align-items:center;gap:8px;min-height:44px;padding:0 14px 0 12px;border-radius:99px;border:1px solid var(--nl-ln);background:var(--nl-bg);color:var(--nl-tx);box-shadow:0 4px 14px rgba(0,0,0,.18);cursor:pointer;font:700 .875rem/1 system-ui,sans-serif;font-variant-numeric:tabular-nums;transition:background .2s}",
    ".nl-po-pill:hover{background:var(--nl-tint)}.nl-po-pill:focus-visible,.nl-po-panel button:focus-visible,.nl-po-panel select:focus-visible,.nl-po-panel input:focus-visible{outline:3px solid var(--nl-ac);outline-offset:2px}",
    "#nl-pomo[data-s=run] .nl-po-pill{border-color:var(--nl-ac)}#nl-pomo[data-s=run] .nl-po-pill svg{color:var(--nl-ac)}#nl-pomo[data-m=s] .nl-po-pill,#nl-pomo[data-m=l] .nl-po-pill{border-style:dashed}",
    ".nl-po-panel{width:min(280px,calc(100vw - 28px));padding:14px;border-radius:16px;border:1px solid var(--nl-ln);background:var(--nl-bg);color:var(--nl-tx);box-shadow:0 8px 28px rgba(0,0,0,.22)}.nl-po-panel[hidden]{display:none}",
    ".nl-po-h{display:flex;justify-content:space-between;align-items:center}.nl-po-h b{font-size:.8125rem;letter-spacing:.04em;text-transform:uppercase;color:var(--nl-mu)}",
    ".nl-po-x{width:44px;height:44px;margin:-8px -8px -8px 0;border:0;background:none;color:var(--nl-mu);font-size:1.1rem;cursor:pointer;border-radius:10px}",
    ".nl-po-t{margin:2px 0 8px;font:800 2.6rem/1.1 system-ui,sans-serif;font-variant-numeric:tabular-nums;text-align:center}",
    ".nl-po-bar{height:6px;border-radius:99px;background:var(--nl-chip);overflow:hidden}.nl-po-bar i{display:block;height:100%;width:0;background:var(--nl-ok);transition:width .4s linear}",
    ".nl-po-b{display:flex;gap:8px;margin:12px 0}.nl-po-b button{flex:1;min-height:44px;border:1px solid var(--nl-ln);border-radius:10px;background:var(--nl-bg);color:var(--nl-tx);font:inherit;font-size:.875rem;font-weight:700;cursor:pointer}",
    ".nl-po-b button:hover{background:var(--nl-tint)}.nl-po-b .nl-po-go{background:var(--nl-btn);border-color:var(--nl-btn);color:var(--nl-on,#fff)}.nl-po-b .nl-po-go:hover{background:var(--nl-btn);filter:brightness(1.08)}",
    ".nl-po-o{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;font-size:.8125rem;color:var(--nl-mu)}.nl-po-o label{display:flex;align-items:center;gap:6px;min-height:44px}",
    ".nl-po-o select{min-height:44px;padding:0 8px;border:1px solid var(--nl-ln);border-radius:10px;background:var(--nl-bg);color:var(--nl-tx);font:inherit}.nl-po-o input{width:20px;height:20px}",
    ".nl-po-r{margin:2px 0 0;font-size:.8125rem;color:var(--nl-mu)}.nl-po-r b{color:var(--nl-tx)}",
    "@media(max-width:560px){#nl-pomo{left:10px;bottom:10px}}",
    "@media(prefers-reduced-motion:reduce){#nl-rail,.nl-j,.nl-rg,.nl-pb,.nl-pp-b i,.nl-po-pill,.nl-po-bar i{transition:none}}",
    "@media print{#nl-rail,#nl-jump,#nl-pomo,.nl-rgs,.nl-pg{display:none!important}}"
  ].join("");
  var st = doc.createElement("style"); st.textContent = css; doc.head.appendChild(st);

  /* ---------- scrolling helpers ---------- */
  function stickyOffset(anchor) {
    var m = 0;
    [".site-header", ".qb-tools", ".mt-top"].forEach(function (s) {
      var e = doc.querySelector(s); if (!e) return;
      var cs = getComputedStyle(e); if (cs.position !== "sticky" && cs.position !== "fixed") return;
      if (s === ".qb-tools" && anchor && !(e.parentNode && e.parentNode.contains(anchor))) return;
      m = Math.max(m, (parseFloat(cs.top) || 0) + e.getBoundingClientRect().height);
    });
    return m;
  }
  function scrollToEl(el) {
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.pageYOffset - stickyOffset(el) - 10;
    window.scrollTo({ top: Math.max(0, y), behavior: reduce() ? "auto" : "smooth" });
  }

  /* ---------- reading-progress rail + back-to-top / bottom ---------- */
  var T = [], rail, track, fill, thumb, pct, jump, jTop, jBot, ticking = false, drag = null;
  function track_(el) { if (el && T.indexOf(el) < 0) T.push(el); refresh(); }
  function untrack(el) { var i = T.indexOf(el); if (i > -1) T.splice(i, 1); refresh(); }
  function docH() { return Math.max(doc.documentElement.scrollHeight, doc.body ? doc.body.scrollHeight : 0); }

  /* Which range the rail measures: a tall tracked list that is on screen, otherwise the whole page. */
  function mode() {
    var vh = window.innerHeight, y = window.pageYOffset;
    var all = T.concat([].slice.call(doc.querySelectorAll("[data-nl-track]")));
    for (var i = 0; i < all.length; i++) {
      var el = all[i]; if (!el.isConnected) continue;
      var r = el.getBoundingClientRect();
      if (r.height > vh * 1.1 && r.top < vh * 0.75 && r.bottom > vh * 0.25) {
        var start = r.top + y - 90, end = r.top + y + r.height - vh;
        if (end > start) return { start: start, end: end, list: true };
      }
    }
    return { start: 0, end: Math.max(1, docH() - vh), list: false };
  }
  function update() {
    ticking = false; if (!rail) return;
    var vh = window.innerHeight, y = window.pageYOffset, scrollable = docH() - vh > 60;
    rail.classList.toggle("on", scrollable);
    var m = mode(), p = clamp((y - m.start) / (m.end - m.start), 0, 1), v = Math.round(p * 100);
    fill.style.height = p * 100 + "%"; thumb.style.top = p * 100 + "%"; pct.textContent = v + "%";
    rail.setAttribute("aria-valuenow", v);
    rail.setAttribute("aria-label", m.list ? "Reading progress through this page of questions" : "Reading progress through this page");
    var max = docH() - vh;
    jTop.hidden = y < 320; jBot.hidden = max < 640 || max - y < 320;
  }
  function refresh() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  function startDrag(e) {
    if (e.button > 0) return;
    drag = mode(); rail.classList.add("drag"); e.currentTarget.setPointerCapture(e.pointerId); e.preventDefault(); moveDrag(e);
  }
  function moveDrag(e) {
    if (!drag) return;
    var r = track.getBoundingClientRect(), f = clamp((e.clientY - r.top) / r.height, 0, 1);
    window.scrollTo({ top: drag.start + f * (drag.end - drag.start), behavior: "instant" });
  }
  function endDrag() { drag = null; rail && rail.classList.remove("drag"); }

  var ICON = function (d) { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>'; };
  function build() {
    if (doc.getElementById("nl-rail")) return;
    rail = doc.createElement("div"); rail.id = "nl-rail";
    rail.setAttribute("role", "progressbar"); rail.setAttribute("aria-valuemin", "0"); rail.setAttribute("aria-valuemax", "100"); rail.setAttribute("aria-valuenow", "0");
    rail.innerHTML = '<span class="nl-r-pct" aria-hidden="true">0%</span><div class="nl-r-track" aria-hidden="true"><i class="nl-r-fill"></i><b class="nl-r-thumb"></b></div>';
    doc.body.appendChild(rail);
    track = rail.querySelector(".nl-r-track"); fill = rail.querySelector(".nl-r-fill"); thumb = rail.querySelector(".nl-r-thumb"); pct = rail.querySelector(".nl-r-pct");
    track.addEventListener("pointerdown", startDrag); track.addEventListener("pointermove", moveDrag);
    track.addEventListener("pointerup", endDrag); track.addEventListener("pointercancel", endDrag);

    jump = doc.createElement("div"); jump.id = "nl-jump"; jump.setAttribute("role", "group"); jump.setAttribute("aria-label", "Page navigation");
    jump.innerHTML = '<button type="button" class="nl-j" id="nl-top" aria-label="Back to top" title="Back to top" hidden>' + ICON("M12 19V5M5 12l7-7 7 7") + '</button>' +
      '<button type="button" class="nl-j" id="nl-bot" aria-label="Go to bottom" title="Go to bottom" hidden>' + ICON("M12 5v14M19 12l-7 7-7-7") + '</button>';
    doc.body.appendChild(jump);
    jTop = jump.querySelector("#nl-top"); jBot = jump.querySelector("#nl-bot");
    jTop.onclick = function () { window.scrollTo({ top: 0, behavior: reduce() ? "auto" : "smooth" }); say("Back at the top"); };
    jBot.onclick = function () { window.scrollTo({ top: docH(), behavior: reduce() ? "auto" : "smooth" }); say("Bottom of the page"); };

    window.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", refresh);
    if (window.ResizeObserver) new ResizeObserver(refresh).observe(doc.body);
    update();
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", build); else build();

  /* ---------- practice progress (attempted questions, separate from reading progress) ---------- */
  function practice(host) {
    wantPomo(); 
    host.className = (host.className + " nl-pp").trim(); host.hidden = true;
    host.setAttribute("role", "group"); host.setAttribute("aria-label", "Practice progress");
    host.innerHTML = '<div class="nl-pp-t"><div><b>Practice Progress:</b> <span class="a"></span></div><span class="u"></span></div><div class="nl-pp-b" role="progressbar" aria-label="Questions attempted" aria-valuemin="0" aria-valuemax="100"><i></i></div>';
    var A = host.querySelector(".a"), U = host.querySelector(".u"), B = host.querySelector(".nl-pp-b"), F = B.firstChild;
    return {
      set: function (done, total, label) {
        host.hidden = !total; if (!total) return;
        var p = Math.round(done / total * 100);
        A.textContent = done + "/" + total + " attempted \u2014 " + p + "%";
        U.textContent = (total - done) + " unanswered" + (label ? " \u00b7 " + label : "");
        F.style.width = p + "%"; B.setAttribute("aria-valuenow", p);
      }
    };
  }

  /* ---------- pager: ranges + pages ----------
     o.rangeHost / o.topHost / o.bottomHost : empty elements to fill (any may be omitted)
     o.rangeSize (100)  o.pageSize (20)  o.pagination (false = ranges only)  o.label ("questions")
     o.anchor : element to scroll to after a page/range change
     o.onChange(state) : called after the user changes range, page or page size; re-draw the list there
     api.setTotal(n, keep) : call whenever the (filtered) list length changes; keep=true keeps position
     api.get() -> {from,to,rs,re,range,ranges,page,pages,size,total}   from/to/rs/re are 0-based, end-exclusive */
  function pager(o) {
    wantPomo();
    var RS = o.rangeSize || 100, label = o.label || "questions", paged = o.pagination !== false;
    var S = { total: 0, range: 0, page: 0, size: paged ? (o.pageSize || 20) : RS };
    var hosts = [o.rangeHost, o.topHost, o.bottomHost].filter(Boolean);
    function rangesN() { return Math.max(1, Math.ceil(S.total / RS)); }
    function bounds() { var rs = S.range * RS; return { rs: rs, re: Math.min(S.total, rs + RS) }; }
    function pagesN() { var b = bounds(); return Math.max(1, Math.ceil((b.re - b.rs) / S.size)); }
    function get() {
      var b = bounds(), from = Math.min(b.re, b.rs + S.page * S.size);
      return { from: from, to: Math.min(b.re, from + S.size), rs: b.rs, re: b.re, range: S.range, ranges: rangesN(), page: S.page, pages: pagesN(), size: S.size, total: S.total };
    }
    function pageList(p, n) {
      var set = {}, out = [];
      [1, 2, p - 1, p, p + 1, n - 1, n].forEach(function (x) { if (x >= 1 && x <= n) set[x] = 1; });
      var k = Object.keys(set).map(Number).sort(function (a, b) { return a - b; });
      k.forEach(function (v, i) { var d = i ? v - k[i - 1] : 1; if (d === 2) out.push(v - 1); else if (d > 2) out.push("\u2026"); out.push(v); });
      return out;
    }
    function bar(withSize) {
      var g = get(); if (!g.total || !paged) return "";
      var h = '<nav class="nl-pg" aria-label="' + esc(label) + ' pages"><p class="nl-info">Showing <b>' + (g.from + 1) + "\u2013" + g.to + "</b> of " + g.total + " " + esc(label) +
        (g.ranges > 1 ? " in this range" : "") + (g.pages > 1 ? " \u00b7 Page " + (g.page + 1) + " of " + g.pages : "") + "</p>";
      if (g.pages > 1) {
        h += '<button type="button" class="nl-pb" data-a="prev"' + (g.page === 0 ? " disabled" : "") + ' aria-label="Previous page">\u2039<span class="nl-t"> Prev</span></button>';
        pageList(g.page + 1, g.pages).forEach(function (v) {
          h += v === "\u2026" ? '<span class="nl-gap" aria-hidden="true">\u2026</span>' :
            '<button type="button" class="nl-pb" data-p="' + (v - 1) + '" aria-label="Page ' + v + '"' + (v - 1 === g.page ? ' aria-current="page"' : "") + ">" + v + "</button>";
        });
        h += '<button type="button" class="nl-pb" data-a="next"' + (g.page >= g.pages - 1 ? " disabled" : "") + ' aria-label="Next page"><span class="nl-t">Next </span>\u203a</button>';
      }
      if (withSize && g.total > 10) {
        h += '<select aria-label="Questions per page" data-s="1">' + [10, 20, 50, 100].map(function (n) { return '<option value="' + n + '"' + (n === S.size ? " selected" : "") + ">" + n + " per page</option>"; }).join("") + "</select>";
      }
      return h + "</nav>";
    }
    function paint() {
      var g = get();
      if (o.rangeHost) {
        if (g.ranges < 2) o.rangeHost.innerHTML = "";
        else {
          var h = '<div class="nl-rgs" role="group" aria-label="Question ranges">';
          for (var r = 0; r < g.ranges; r++) {
            var a = r * RS + 1, b = Math.min(S.total, (r + 1) * RS);
            h += '<button type="button" class="nl-rg" data-r="' + r + '" aria-pressed="' + (r === S.range) + '" aria-label="Questions ' + a + " to " + b + '">' + a + "\u2013" + b + "</button>";
          }
          o.rangeHost.innerHTML = h + "</div>";
        }
      }
      if (o.topHost) o.topHost.innerHTML = bar(true);
      if (o.bottomHost) o.bottomHost.innerHTML = g.pages > 1 ? bar(false) : "";
    }
    function go(range, page, why) {
      S.range = clamp(range, 0, rangesN() - 1); S.page = clamp(page, 0, pagesN() - 1);
      paint(); o.onChange && o.onChange(get());
      var g = get(), el = o.anchor || o.rangeHost || o.topHost;
      if (why !== "size") scrollToEl(el);
      say(paged ? "Page " + (g.page + 1) + " of " + g.pages + ", " + label + " " + (g.from + 1) + " to " + g.to : label + " " + (g.rs + 1) + " to " + g.re);
      refresh();
    }
    function refocus(host, sel) {
      var e = host && (host.querySelector(sel) || host.querySelector('[aria-current=page]') || host.querySelector("button:not(:disabled)"));
      if (e) e.focus({ preventScroll: true });
    }
    hosts.forEach(function (h) {
      h.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b || b.disabled) return;
        var d = b.dataset;
        if (d.r !== undefined) { go(+d.r, 0); refocus(h, '[data-r="' + d.r + '"]'); }
        else if (d.p !== undefined) { go(S.range, +d.p); refocus(h, '[data-p="' + d.p + '"]'); }
        else if (d.a) { go(S.range, S.page + (d.a === "next" ? 1 : -1)); refocus(h, '[data-a="' + d.a + '"]'); }
      });
      h.addEventListener("change", function (e) {
        if (!e.target.dataset.s) return;
        var first = get().from - bounds().rs, size = +e.target.value;
        S.size = size; S.page = Math.floor(first / size); go(S.range, S.page, "size"); refocus(h, "select");
      });
    });
    return {
      get: get,
      setTotal: function (n, keep) {
        S.total = Math.max(0, n | 0);
        if (keep) { S.range = clamp(S.range, 0, rangesN() - 1); S.page = clamp(S.page, 0, pagesN() - 1); } else { S.range = 0; S.page = 0; }
        paint();
      }
    };
  }


  /* ---------- pomodoro timer ---------- */
  var PK = "nl-pomo-v1", PRE = { "25": { f: 25, s: 5, l: 15 }, "50": { f: 50, s: 10, l: 30 } };
  var MODE = { f: "Focus", s: "Short break", l: "Long break" };
  var P, po, poTick = null, poWant = false, poBuilt = false, T0 = "", actx = null;
  function today() { try { return new Date().toLocaleDateString("en-CA"); } catch (e) { return String(new Date().getDate()); } }
  function pLoad() {
    try { var s = JSON.parse(localStorage.getItem(PK)); if (s && s.v === 1 && PRE[s.preset]) return s; } catch (e) {}
    return { v: 1, preset: "25", mode: "f", status: "idle", left: 0, endAt: 0, cycle: 0, sound: true, day: today(), rounds: 0 };
  }
  function pSave() { try { localStorage.setItem(PK, JSON.stringify(P)); } catch (e) {} }
  function dur(m) { return PRE[P.preset][m || P.mode] * 60000; }
  function left() { return P.status === "run" ? Math.max(0, P.endAt - Date.now()) : P.status === "pause" ? P.left : dur(); }
  function fmt(ms) { var t = Math.ceil(ms / 1000), m = Math.floor(t / 60), s = t % 60; return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s; }
  function isMock() { return !!(doc.querySelector(".mt-page,.mt-top") || doc.querySelector('script[src*="mock-test-engine"]') || doc.documentElement.hasAttribute("data-nl-pomodoro-off")); }

  function beep() {
    try {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      actx = actx || new AC(); if (actx.state === "suspended") actx.resume();
      [0, 0.28, 0.56].forEach(function (d) {
        var o = actx.createOscillator(), g = actx.createGain(); o.type = "sine"; o.frequency.value = 880;
        g.gain.setValueAtTime(0.0001, actx.currentTime + d); g.gain.exponentialRampToValueAtTime(0.25, actx.currentTime + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + d + 0.22);
        o.connect(g); g.connect(actx.destination); o.start(actx.currentTime + d); o.stop(actx.currentTime + d + 0.25);
      });
    } catch (e) {}
  }
  function rollDay() { if (P.day !== today()) { P.day = today(); P.rounds = 0; } }
  function finish(quiet) {
    var was = P.mode; rollDay();
    if (was === "f") { P.rounds++; P.cycle++; P.mode = P.cycle >= 4 ? "l" : "s"; if (P.cycle >= 4) P.cycle = 0; } else P.mode = "f";
    P.status = "idle"; P.left = 0; P.endAt = 0; pSave(); poRender();
    if (!quiet) {
      if (P.sound) beep();
      say(was === "f" ? "Focus round complete. Time for a " + (P.mode === "l" ? "long" : "short") + " break." : "Break over. Ready for the next focus round.");
    }
  }
  function tick() {
    if (P.status !== "run") return poRender();
    if (Date.now() >= P.endAt) {                       /* re-read first, so two open tabs never count one round twice */
      var f = pLoad(); if (f.status === "run" && Date.now() >= f.endAt) { P = f; finish(false); } else { P = f; poRender(); }
      return;
    }
    poRender();
  }
  function poStart() {
    try { var AC = window.AudioContext || window.webkitAudioContext; if (AC && !actx) actx = new AC(); if (actx && actx.state === "suspended") actx.resume(); } catch (e) {}
    rollDay(); var l = P.status === "pause" ? P.left : dur(); P.endAt = Date.now() + l; P.status = "run"; pSave(); poRender(); say(MODE[P.mode] + " started, " + Math.round(l / 60000) + " minutes");
  }
  function poPause() { P.left = Math.max(0, P.endAt - Date.now()); P.status = "pause"; pSave(); poRender(); say("Timer paused"); }
  function poReset() { P.status = "idle"; P.left = 0; P.endAt = 0; pSave(); poRender(); say("Timer reset"); }
  function poSkip() {
    if (P.mode === "f") { P.mode = P.cycle >= 3 ? "l" : "s"; if (P.mode === "l") P.cycle = 0; else P.cycle++; } else P.mode = "f";
    P.status = "idle"; P.left = 0; P.endAt = 0; pSave(); poRender(); say("Switched to " + MODE[P.mode]);
  }

  function poRender() {
    if (!po) return;
    var l = left(), run = P.status === "run", pct = clamp((1 - l / dur()) * 100, 0, 100);
    po.root.setAttribute("data-s", P.status); po.root.setAttribute("data-m", P.mode);
    po.time.textContent = fmt(l); po.big.textContent = fmt(l); po.mode.textContent = MODE[P.mode] + (P.status === "pause" ? " (paused)" : "");
    po.bar.style.width = pct + "%";
    po.go.textContent = run ? "Pause" : P.status === "pause" ? "Resume" : "Start";
    po.pill.setAttribute("aria-label", "Pomodoro timer, " + MODE[P.mode] + ", " + fmt(l) + (run ? " running" : P.status === "pause" ? " paused" : " ready") + ". Open timer");
    po.sel.value = P.preset; po.snd.checked = !!P.sound;
    rollDay(); po.rounds.textContent = P.rounds;
    po.cyc.textContent = P.mode === "f" ? "Round " + (P.cycle + 1) + " of 4" : P.mode === "l" ? "Long break" : "Break";
    if (run) { if (!T0) T0 = doc.title; doc.title = "(" + fmt(l) + ") " + T0.replace(/^\(\d\d:\d\d\)\s*/, ""); } else if (T0) { doc.title = T0; T0 = ""; }
    if (run && !poTick) poTick = setInterval(tick, 500);
    if (!run && poTick) { clearInterval(poTick); poTick = null; }
  }
  function poBuild() {
    if (poBuilt || !doc.body) return; poBuilt = true;
    var r = doc.createElement("div"); r.id = "nl-pomo";
    r.innerHTML =
      '<div class="nl-po-panel" id="nl-po-panel" role="group" aria-label="Pomodoro timer" hidden>' +
        '<div class="nl-po-h"><b class="nl-po-mode">Focus</b><button type="button" class="nl-po-x" aria-label="Close timer panel">\u2715</button></div>' +
        '<div class="nl-po-t" role="timer" aria-live="off">25:00</div><div class="nl-po-bar" aria-hidden="true"><i></i></div>' +
        '<div class="nl-po-b"><button type="button" class="nl-po-go">Start</button><button type="button" class="nl-po-rs">Reset</button><button type="button" class="nl-po-sk" title="Skip to the next phase">Skip</button></div>' +
        '<div class="nl-po-o"><label>Preset <select aria-label="Timer preset"><option value="25">25 / 5 min</option><option value="50">50 / 10 min</option></select></label><label><input type="checkbox" class="nl-po-sn"> Sound</label></div>' +
        '<p class="nl-po-r">Rounds today: <b class="nl-po-n">0</b> \u00b7 <span class="nl-po-c"></span></p></div>' +
      '<button type="button" class="nl-po-pill" aria-expanded="false" aria-controls="nl-po-panel">' + ICON("M12 8v4l2.5 2.5M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 1h6").replace('width="20" height="20"', 'width="18" height="18"') + '<span class="nl-po-time">25:00</span></button>';
    doc.body.appendChild(r);
    var q = function (s) { return r.querySelector(s); };
    po = { root: r, panel: q(".nl-po-panel"), pill: q(".nl-po-pill"), time: q(".nl-po-time"), big: q(".nl-po-t"), mode: q(".nl-po-mode"), bar: q(".nl-po-bar i"), go: q(".nl-po-go"), sel: q("select"), snd: q(".nl-po-sn"), rounds: q(".nl-po-n"), cyc: q(".nl-po-c") };
    function toggle(open) { po.panel.hidden = !open; po.pill.setAttribute("aria-expanded", open); if (open) po.go.focus({ preventScroll: true }); else po.pill.focus({ preventScroll: true }); try { sessionStorage.setItem("nl-po-open", open ? "1" : ""); } catch (e) {} }
    po.pill.onclick = function () { toggle(po.panel.hidden); };
    q(".nl-po-x").onclick = function () { toggle(false); };
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && !po.panel.hidden) toggle(false); });
    po.go.onclick = function () { P.status === "run" ? poPause() : poStart(); };
    q(".nl-po-rs").onclick = poReset; q(".nl-po-sk").onclick = poSkip;
    po.sel.onchange = function () { P.preset = po.sel.value; P.mode = "f"; P.cycle = 0; P.status = "idle"; P.left = 0; P.endAt = 0; pSave(); poRender(); say("Preset " + (P.preset === "50" ? "50 minutes focus, 10 minutes break" : "25 minutes focus, 5 minutes break")); };
    po.snd.onchange = function () { P.sound = po.snd.checked; pSave(); };
    window.addEventListener("storage", function (e) { if (e.key === PK) { P = pLoad(); poRender(); } });
    doc.addEventListener("visibilitychange", function () { if (!doc.hidden) tick(); });
    try { if (sessionStorage.getItem("nl-po-open")) { po.panel.hidden = false; po.pill.setAttribute("aria-expanded", "true"); } } catch (e) {}
    /* a round that ended while this page was closed: count it quietly */
    if (P.status === "run" && Date.now() >= P.endAt) finish(true);
    poRender();
  }
  /* The timer is shown on MCQ pages, on pages that opt in, and anywhere it is already running or paused. Never on mock tests. */
  function wantPomo() { poWant = true; if (doc.readyState !== "loading") poEnsure(); }
  function poEnsure() {
    if (isMock()) return;
    P = P || pLoad();
    if (poWant || doc.documentElement.hasAttribute("data-nl-pomodoro") || P.status !== "idle") poBuild();
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", poEnsure); else poEnsure();

  window.NLNav = { pager: pager, practice: practice, track: track_, untrack: untrack, refresh: refresh, scrollTo: scrollToEl, stickyOffset: stickyOffset, pomodoro: { show: function () { poWant = true; P = P || pLoad(); poBuild(); } } };
})();
