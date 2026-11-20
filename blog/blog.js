/* NET Law-Verse blog: reader tools + index filters. No dependencies.
   Post pages: text size, font, line spacing, column width, listen (read aloud), save for later, share, focus mode,
   reading progress, "on this page" highlighting. Index page: search, category chips, saved posts.
   Everything is stored only in this browser (localStorage); the page works without it. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function say(m) { var l = $("#live"); if (l) { l.textContent = ""; setTimeout(function () { l.textContent = m; }, 30); } }

  /* ---------- preferences ---------- */
  var FONTS = {
    sans: '"Manrope",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif',
    serif: 'Georgia,"Iowan Old Style","Times New Roman",serif',
    easy: '"Atkinson Hyperlegible",Verdana,"Segoe UI",sans-serif'
  };
  var LH = { tight: 1.55, normal: 1.75, loose: 2.05 };
  var MEASURE = { narrow: "56ch", medium: "68ch", wide: "84ch" };
  var P = { s: 100, f: "sans", l: "normal", w: "medium" };
  try { var saved = JSON.parse(get("nlb-prefs", "{}")); for (var k in P) if (saved[k] != null) P[k] = saved[k]; } catch (e) {}
  var fontLoaded = false;
  function loadEasyFont() {
    if (fontLoaded) return; fontLoaded = true;
    var l = doc.createElement("link"); l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap";
    doc.head.appendChild(l);
  }
  function applyPrefs() {
    P.s = Math.max(80, Math.min(200, +P.s || 100));
    root.style.setProperty("--bl-scale", (P.s / 100).toFixed(2));
    root.style.setProperty("--bl-lh", LH[P.l] || LH.normal);
    root.style.setProperty("--bl-measure", MEASURE[P.w] || MEASURE.medium);
    root.style.setProperty("--bl-font", FONTS[P.f] || FONTS.sans);
    if (P.f === "easy") loadEasyFont();
    $$("[data-pct]").forEach(function (n) { n.textContent = P.s + "%"; });
    $$("#bl-size").forEach(function (n) { n.value = P.s; });
    $$("[data-pref]").forEach(function (g) {
      var key = g.getAttribute("data-pref");
      $$("button", g).forEach(function (b) { b.setAttribute("aria-pressed", String(b.value === String(P[key]))); });
    });
  }
  function savePrefs() { set("nlb-prefs", JSON.stringify(P)); }
  applyPrefs();

  /* ---------- saved posts ---------- */
  function savedList() { try { return JSON.parse(get("nlb-saved", "[]")) || []; } catch (e) { return []; } }
  function isSaved(slug) { return savedList().indexOf(slug) > -1; }
  function toggleSaved(slug) {
    var l = savedList(), i = l.indexOf(slug);
    if (i > -1) l.splice(i, 1); else l.push(slug);
    set("nlb-saved", JSON.stringify(l));
    return i === -1;
  }
  function paintSaveButtons() {
    $$("[data-save]").forEach(function (b) {
      var on = isSaved(b.getAttribute("data-save"));
      b.setAttribute("aria-pressed", String(on));
      var lab = $(".bl-lab", b); if (lab) lab.textContent = on ? "Saved" : "Save";
      b.setAttribute("aria-label", (on ? "Remove from saved: " : "Save for later: ") + (b.getAttribute("data-title") || "this post"));
    });
  }
  doc.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-save]");
    if (!b) return;
    e.preventDefault();
    var on = toggleSaved(b.getAttribute("data-save"));
    paintSaveButtons(); say(on ? "Saved for later" : "Removed from saved");
    if (root.hasAttribute("data-bl-index")) filter();
  });
  paintSaveButtons();

  /* ---------- popovers ---------- */
  function popover(btn, pop) {
    if (!btn || !pop) return;
    function close() { pop.hidden = true; btn.setAttribute("aria-expanded", "false"); }
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = pop.hidden;
      $$(".bl-pop").forEach(function (p) { p.hidden = true; });
      $$("[aria-controls][aria-expanded]", $(".bl-bar")).forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
      pop.hidden = !open; btn.setAttribute("aria-expanded", String(open));
      if (open) { var f = $("button,a,input", pop); if (f) f.focus({ preventScroll: true }); }
    });
    doc.addEventListener("click", function (e) { if (!pop.hidden && !pop.contains(e.target) && e.target !== btn) close(); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && !pop.hidden) { close(); btn.focus(); } });
  }

  /* ---------- post page ---------- */
  var body = $("#bl-body");
  if (body) {
    popover($("#bl-set-btn"), $("#bl-set"));
    popover($("#bl-share-btn"), $("#bl-share"));

    $("#bl-minus").addEventListener("click", function () { P.s = Math.max(80, P.s - 10); applyPrefs(); savePrefs(); say("Text size " + P.s + " percent"); });
    $("#bl-plus").addEventListener("click", function () { P.s = Math.min(200, P.s + 10); applyPrefs(); savePrefs(); say("Text size " + P.s + " percent"); });
    $$("#bl-size").forEach(function (r) { r.addEventListener("input", function () { P.s = +r.value; applyPrefs(); savePrefs(); }); });
    $$("[data-pref]").forEach(function (g) {
      g.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        P[g.getAttribute("data-pref")] = b.value; applyPrefs(); savePrefs();
      });
    });
    var rs = $("#bl-reset");
    if (rs) rs.addEventListener("click", function () { P = { s: 100, f: "sans", l: "normal", w: "medium" }; applyPrefs(); savePrefs(); say("Reading settings reset"); });

    /* keyboard: + / - change text size when not typing */
    doc.addEventListener("keydown", function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target; if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
      if (e.key === "+" || e.key === "=") { P.s = Math.min(200, P.s + 10); applyPrefs(); savePrefs(); }
      else if (e.key === "-" || e.key === "_") { P.s = Math.max(80, P.s - 10); applyPrefs(); savePrefs(); }
    });

    /* focus mode */
    var fb = $("#bl-focus");
    function setFocus(on) {
      doc.body.classList.toggle("bl-focus", on); fb.setAttribute("aria-pressed", String(on));
      set("nlb-focus", on ? "1" : "0"); say(on ? "Focus mode on" : "Focus mode off");
    }
    if (fb) { fb.addEventListener("click", function () { setFocus(!doc.body.classList.contains("bl-focus")); });
      if (get("nlb-focus", "0") === "1") { doc.body.classList.add("bl-focus"); fb.setAttribute("aria-pressed", "true"); } }

    /* share */
    var url = ($("link[rel=canonical]") || {}).href || location.href, title = doc.title;
    var enc = encodeURIComponent;
    var wa = $("#bl-wa"); if (wa) wa.href = "https://wa.me/?text=" + enc(title + " " + url);
    var tg = $("#bl-tg"); if (tg) tg.href = "https://t.me/share/url?url=" + enc(url) + "&text=" + enc(title);
    var li = $("#bl-li"); if (li) li.href = "https://www.linkedin.com/sharing/share-offsite/?url=" + enc(url);
    var cp = $("#bl-copy");
    if (cp) cp.addEventListener("click", function () {
      function ok() { say("Link copied"); cp.querySelector("span").textContent = "Link copied"; setTimeout(function () { cp.querySelector("span").textContent = "Copy link"; }, 1800); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, ok);
      else { var t = doc.createElement("input"); t.value = url; doc.body.appendChild(t); t.select(); try { doc.execCommand("copy"); } catch (e) {} t.remove(); ok(); }
    });
    var ns = $("#bl-native");
    if (ns) { if (navigator.share) ns.hidden = false; ns.addEventListener("click", function () { navigator.share({ title: title, url: url }).catch(function () {}); }); }
    var pr = $("#bl-print"); if (pr) pr.addEventListener("click", function () { window.print(); });

    /* progress bar */
    var bar = $(".bl-progress i");
    function prog() {
      var r = body.getBoundingClientRect(), h = r.height - window.innerHeight * 0.6;
      var p = h > 0 ? Math.min(1, Math.max(0, (-r.top + window.innerHeight * 0.2) / h)) : 1;
      if (bar) bar.style.width = (p * 100).toFixed(1) + "%";
    }
    window.addEventListener("scroll", prog, { passive: true }); window.addEventListener("resize", prog); prog();

    /* on-this-page highlighting */
    var heads = $$("h2[id],h3[id]", body), links = $$(".bl-toc a");
    if ("IntersectionObserver" in window && heads.length && links.length) {
      var cur = null;
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) cur = en.target.id; });
        if (cur) links.forEach(function (a) { a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + cur)); });
      }, { rootMargin: "-140px 0px -65% 0px" });
      heads.forEach(function (h) { io.observe(h); });
    }
    $$(".bl-toc-m a").forEach(function (a) { a.addEventListener("click", function () { var d = $(".bl-toc-m"); if (d) d.open = false; }); });

    /* listen (text to speech) */
    var lb = $("#bl-listen"), pl = $("#bl-player");
    if (lb && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
      lb.hidden = false;
      var syn = window.speechSynthesis, blocks = [], idx = 0, active = false, paused = false, rate = 1, mark = null;
      var out = $("#bl-now"), pp = $("#bl-pp"), st = $("#bl-stop"), rt = $("#bl-rate");
      function collect() {
        blocks = $$("h2,h3,p,li,summary,blockquote", body).filter(function (n) {
          return !n.closest(".bl-nudge,.bl-sources,table") && n.textContent.trim().length > 1 && !(n.tagName === "P" && n.closest("li,blockquote"));
        });
      }
      function voice() {
        var vs = syn.getVoices ? syn.getVoices() : [];
        return vs.filter(function (v) { return /en[-_]IN/i.test(v.lang); })[0] || vs.filter(function (v) { return /^en/i.test(v.lang); })[0] || null;
      }
      function unmark() { if (mark) mark.classList.remove("bl-speaking"); mark = null; }
      function speak() {
        if (!active) return;
        if (idx >= blocks.length) return stop(true);
        var el = blocks[idx], u = new SpeechSynthesisUtterance(el.textContent.replace(/\s+/g, " ").trim());
        var v = voice(); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = "en-IN";
        u.rate = rate;
        u.onend = function () { if (active && !paused) { idx++; speak(); } };
        u.onerror = function (ev) { if (ev && (ev.error === "interrupted" || ev.error === "canceled")) return; stop(); };
        unmark(); mark = el; el.classList.add("bl-speaking");
        var r = el.getBoundingClientRect(); if (r.top < 160 || r.bottom > window.innerHeight - 40) el.scrollIntoView({ block: "center", behavior: "smooth" });
        if (out) out.textContent = "Reading " + (idx + 1) + " of " + blocks.length;
        syn.speak(u);
      }
      function start() { collect(); if (!blocks.length) return; syn.cancel(); idx = 0; active = true; paused = false; pl.classList.add("on"); pp.textContent = "Pause"; lb.setAttribute("aria-pressed", "true"); speak(); }
      function stop(done) { active = false; paused = false; syn.cancel(); unmark(); pl.classList.remove("on"); lb.setAttribute("aria-pressed", "false"); if (done) say("Finished reading"); }
      lb.addEventListener("click", function () { if (active) stop(); else start(); });
      pp.addEventListener("click", function () {
        if (!active) return;
        if (paused) { paused = false; pp.textContent = "Pause"; syn.cancel(); speak(); }   /* restart the current block: pause/resume is unreliable on some phones */
        else { paused = true; pp.textContent = "Resume"; syn.cancel(); }
      });
      st.addEventListener("click", function () { stop(); });
      rt.addEventListener("change", function () { rate = +rt.value; if (active && !paused) { syn.cancel(); speak(); } });
      $("#bl-prev").addEventListener("click", function () { if (active) { idx = Math.max(0, idx - 1); paused = false; pp.textContent = "Pause"; syn.cancel(); speak(); } });
      $("#bl-next").addEventListener("click", function () { if (active) { idx = Math.min(blocks.length - 1, idx + 1); paused = false; pp.textContent = "Pause"; syn.cancel(); speak(); } });
      window.addEventListener("pagehide", function () { syn.cancel(); });
      if (syn.onvoiceschanged !== undefined) syn.onvoiceschanged = function () {};
    }
  }

  /* ---------- quick-links card dialog ---------- */
  doc.addEventListener("click", function (e) {
    var o = e.target.closest && e.target.closest("[data-bl-poster]");
    if (o) { var d = $("#bl-poster-dlg"); if (d && d.showModal) { e.preventDefault(); d.showModal(); } return; }
    var c = e.target.closest && e.target.closest("[data-bl-close]");
    if (c) { var d2 = c.closest("dialog"); if (d2) d2.close(); return; }
    if (e.target.tagName === "DIALOG" && e.target.classList.contains("bl-dlg")) e.target.close();
  });

  /* ---------- blog index: search + categories + saved (sidebar list) ---------- */
  var items = $$(".bl-si"), groups = $$(".bl-sg");
  var state = { cat: "all", q: "" };
  function filter() {
    var shown = 0, terms = state.q.trim().toLowerCase().split(/\s+/).filter(Boolean), sv = savedList();
    items.forEach(function (c) {
      var ok = true;
      if (state.cat === "saved") ok = sv.indexOf(c.getAttribute("data-slug")) > -1;
      else if (state.cat !== "all") ok = c.getAttribute("data-cat") === state.cat;
      if (ok && terms.length) { var t = c.getAttribute("data-text") || ""; ok = terms.every(function (w) { return t.indexOf(w) > -1; }); }
      c.hidden = !ok; if (ok) shown++;
    });
    groups.forEach(function (g) { g.hidden = !$$(".bl-si", g).some(function (i) { return !i.hidden; }); });
    var n = $("#bl-count"), em = $("#bl-empty");
    if (n) n.textContent = shown;
    if (em) { em.hidden = shown > 0; em.textContent = state.cat === "saved" ? "No saved posts yet. Tap the bookmark on a post to keep it here." : "No posts match that search."; }
  }
  if ($("#bl-q")) {
    root.setAttribute("data-bl-index", "");
    var qs = new URLSearchParams(location.search); if (qs.get("q")) { state.q = qs.get("q"); $("#bl-q").value = state.q; }
    $("#bl-q").addEventListener("input", function () { state.q = this.value; filter(); });
    $$(".bl-chip").forEach(function (ch) {
      ch.addEventListener("click", function () {
        state.cat = ch.getAttribute("data-cat");
        $$(".bl-chip").forEach(function (x) { x.setAttribute("aria-pressed", String(x === ch)); });
        filter();
      });
    });
    filter();
  }
})();
