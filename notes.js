/* notes.js: study-notes section. Everything here is an enhancement: with JS off, all notes, links and the contents list still work.
   Browser storage (one key, nl-notes-v1) holds only reading mode, "studied" ticks and the last place read, and is wrapped in try/catch. */
(function () {
  "use strict";
  var KEY = "nl-notes-v1", body = document.body, ch = body.getAttribute("data-chapter") || "";
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  var st = load(); st.done = st.done || {}; st.last = st.last || {};
  function doneList() { return (st.done[ch] = st.done[ch] || []); }
  function say(msg) { var l = $("#live"); if (l) { l.textContent = ""; setTimeout(function () { l.textContent = msg; }, 30); } }

  /* ---------- reading mode (full notes / revision) ---------- */
  function setMode(m, persist) {
    body.classList.toggle("nt-revise", m === "revise");
    $$(".nt-mode button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-mode") === m)); });
    if (persist) { st.mode = m; save(); say(m === "revise" ? "Revision mode on: concept paragraphs hidden" : "Full notes"); }
  }
  setMode(location.hash === "#revise" ? "revise" : (st.mode || "full"), false);
  window.addEventListener("hashchange", function () { if (location.hash === "#revise") setMode("revise", false); });
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".nt-mode button");
    if (b) { setMode(b.getAttribute("data-mode"), true); return; }
    var d = e.target.closest && e.target.closest("[data-done]");
    if (d) { toggleDone(d.getAttribute("data-done")); }
  });

  /* ---------- studied ticks and progress ---------- */
  function toggleDone(id) {
    var l = doneList(), i = l.indexOf(id);
    if (i > -1) l.splice(i, 1); else l.push(id);
    save(); paint(); say(i > -1 ? "Unmarked" : "Marked as studied");
  }
  function paint() {
    var l = doneList(), has = function (id) { return l.indexOf(id) > -1; };
    $$("[data-done]").forEach(function (b) {
      var on = has(b.getAttribute("data-done"));
      b.setAttribute("aria-pressed", String(on)); b.textContent = on ? "Studied" : "Mark as studied";
      var a = b.closest(".nt-sub"); if (a) a.classList.toggle("is-done", on);
    });
    $$("a[data-sub]").forEach(function (a) { a.classList.toggle("is-done", has(a.getAttribute("data-sub"))); });
    $$("a[data-topic][data-n]").forEach(function (a) {
      var p = a.getAttribute("data-topic").toLowerCase() + "-", n = 0;
      l.forEach(function (x) { if (x.indexOf(p) === 0) n++; });
      a.classList.toggle("is-done", n >= +a.getAttribute("data-n"));
    });
    $$("[data-prog-mod]").forEach(function (el) {
      var sec = el.closest(".nt-module"), all = $$("a[data-sub]", sec), n = all.filter(function (a) { return has(a.getAttribute("data-sub")); }).length;
      el.hidden = !n; el.textContent = n ? "· " + n + "/" + all.length + " studied" : "";
    });
    var bar = $(".nt-bar"), txt = $("#nt-progress");
    if (bar && txt) {
      var total = $$(".nt-module a[data-sub]").length, n2 = l.length;
      if (total && n2) { bar.hidden = false; $("i", bar).style.width = Math.round(100 * n2 / total) + "%"; txt.textContent = n2 + " of " + total + " sub-topics studied (" + Math.round(100 * n2 / total) + "%). Saved in this browser only."; }
      else { bar.hidden = true; }
    }
  }
  paint();

  /* ---------- topic page: contents list behaviour, scroll-spy, last place ---------- */
  var subs = $$(".nt-sub");
  var panel = $(".nt-contents");
  if (panel && window.matchMedia("(max-width:900px)").matches) panel.open = false;
  var side = $(".nt-side"), curLink = $(".nt-tree .is-cur");
  if (side && curLink && !window.matchMedia("(max-width:900px)").matches) {
    var cr = curLink.getBoundingClientRect(), sr = side.getBoundingClientRect();
    if (cr.bottom > sr.bottom - 20 || cr.top < sr.top) side.scrollTop += cr.top - sr.top - 90;
  }
  if (subs.length && "IntersectionObserver" in window) {
    var links = {}; $$(".nt-subs a[data-sub]").forEach(function (a) { links[a.getAttribute("data-sub")] = a; });
    var active = null;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.getAttribute("data-sub");
        if (active && links[active]) links[active].removeAttribute("aria-current");
        active = id; if (links[id]) { links[id].setAttribute("aria-current", "true"); keepVisible(links[id]); }
        rememberPlace(e.target);
      });
    }, { rootMargin: "-90px 0px -65% 0px" });
    subs.forEach(function (s) { io.observe(s); });
  }
  function keepVisible(a) {
    if (!side || window.matchMedia("(max-width:900px)").matches) return;
    var r = a.getBoundingClientRect(), s = side.getBoundingClientRect();
    if (r.top < s.top + 60 || r.bottom > s.bottom - 20) side.scrollTop += r.top - s.top - s.height / 3;
  }
  var lastT = 0;
  function rememberPlace(el) {
    var now = Date.now(); if (now - lastT < 1500) return; lastT = now;
    var h = $("h2", el), n = h && $(".nt-num", h), num = n ? n.textContent : "";
    st.last[ch] = { u: location.pathname + "#" + el.id, t: h ? (num + " " + h.textContent.replace(num, "").replace(/#$/, "")).trim() : el.id };
    save();
  }

  /* ---------- chapter page: resume link, collapse all, module scroll-spy ---------- */
  var resume = $("#nt-resume");
  if (resume && st.last[ch] && st.last[ch].u) {
    resume.href = st.last[ch].u; resume.textContent = "Continue: " + st.last[ch].t.replace(/\s+/g, " ").trim(); resume.hidden = false;
  }
  var tog = $("#nt-toggle-all");
  if (tog) tog.addEventListener("click", function () {
    var ds = $$(".nt-topic details"), open = ds.some(function (d) { return d.open; });
    ds.forEach(function (d) { d.open = !open; }); tog.textContent = open ? "Expand sub-topic lists" : "Collapse sub-topic lists";
  });
  var jump = $$("[data-jump]");
  if (jump.length && "IntersectionObserver" in window) {
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        jump.forEach(function (a) { a.removeAttribute("aria-current"); });
        var a = $('[data-jump="' + e.target.getAttribute("data-mod") + '"]'); if (a) a.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-90px 0px -70% 0px" });
    $$(".nt-module").forEach(function (m) { io2.observe(m); });
  }

  /* ---------- search ---------- */
  function rx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function initSearch(box) {
    var input = $("input", box), list = $(".nt-results", box), live = $("[role=status]", box), idx = null, loading = null, timer = null;
    function ensure() {
      if (idx) return Promise.resolve(idx);
      if (!loading) loading = fetch(box.getAttribute("data-index")).then(function (r) { return r.json(); }).then(function (d) {
        d.forEach(function (e) { e.l = (e.t + " " + e.p).toLowerCase(); e.xl = e.x.toLowerCase(); }); idx = d; return d;
      });
      return loading;
    }
    function hide() { list.hidden = true; list.innerHTML = ""; }
    function mark(s, toks) { var t = esc(s); toks.forEach(function (k) { t = t.replace(new RegExp("(" + rx(esc(k)) + ")", "ig"), "<mark>$1</mark>"); }); return t; }
    function run() {
      var q = input.value.trim().toLowerCase();
      if (q.length < 2) { hide(); return; }
      ensure().then(function (d) {
        if (input.value.trim().toLowerCase() !== q) return;
        var toks = q.split(/\s+/), scope = box.getAttribute("data-scope"), res = [];
        d.forEach(function (e) {
          if (scope && e.c !== scope) return;
          var s = 0;
          for (var i = 0; i < toks.length; i++) {
            var inT = e.l.indexOf(toks[i]) > -1, inX = e.xl.indexOf(toks[i]) > -1;
            if (!inT && !inX) return;
            s += (inT ? 10 : 0) + (inX ? 1 : 0);
          }
          res.push([s, e]);
        });
        res.sort(function (a, b) { return b[0] - a[0]; });
        res = res.slice(0, 8);
        if (!res.length) { list.innerHTML = '<li class="nt-none">No match. Try a shorter word.</li>'; list.hidden = false; live.textContent = "No results"; return; }
        list.innerHTML = res.map(function (r) {
          var e = r[1], i = e.xl.indexOf(toks[0]), sn = "";
          if (i > -1) sn = (i > 50 ? "…" : "") + e.x.slice(Math.max(0, i - 50), i + 110) + "…";
          return '<li><a href="' + esc(e.u) + '"><small>' + esc(e.p) + "</small><b>" + mark(e.t, toks) + "</b>" + (sn ? "<em>" + mark(sn, toks) + "</em>" : "") + "</a></li>";
        }).join("");
        list.hidden = false; live.textContent = res.length + " results";
      });
    }
    input.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(run, 120); });
    input.addEventListener("focus", function () { ensure(); if (input.value.trim().length > 1) run(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { hide(); }
      else if (e.key === "ArrowDown") { var a = $("a", list); if (a) { e.preventDefault(); a.focus(); } }
      else if (e.key === "Enter") { var f = $("a", list); if (f) { e.preventDefault(); location.href = f.href; } }
    });
    list.addEventListener("keydown", function (e) {
      var a = document.activeElement;
      if (e.key === "ArrowDown" && a.parentNode.nextElementSibling) { e.preventDefault(); $("a", a.parentNode.nextElementSibling).focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); var p = a.parentNode.previousElementSibling; if (p) $("a", p).focus(); else input.focus(); }
      else if (e.key === "Escape") { hide(); input.focus(); }
    });
    document.addEventListener("click", function (e) { if (!box.contains(e.target)) hide(); });
  }
  $$(".nt-search").forEach(initSearch);

  /* ---------- rapid-recall filter ---------- */
  var rq = $("#nt-rr-q"), rows = $$("#nt-rr tbody tr"), rn = $("#nt-rr-n");
  if (rq) rq.addEventListener("input", function () {
    var q = rq.value.trim().toLowerCase(), n = 0;
    rows.forEach(function (r) { var ok = !q || r.textContent.toLowerCase().indexOf(q) > -1; r.hidden = !ok; if (ok) n++; });
    rn.textContent = q ? n + " of " + rows.length + " shown" : "";
  });
})();
