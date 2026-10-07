/* faq.js: progressive enhancement only. The FAQ is fully readable and usable without it
   (native <details> accordions, plain anchor links). No libraries, no network requests. */
(function () {
  "use strict";
  var d = document;
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }

  /* keep the text size chosen on other pages (accessibility.js stores it as nl-size) */
  try { var z = +localStorage.getItem("nl-size"); if (z > 0 && z < 3) d.documentElement.style.fontSize = [100, 115, 130][z] + "%"; } catch (e) {}

  var items = $$(".faq-item"), groups = $$(".faq-group"), input = $("#faq-q"),
      hero = $(".faq-hero"), meta = $("#faq-meta"), empty = $("#faq-empty"), navLinks = $$(".faq-nav a");
  if (!items.length) return;
  var text = items.map(function (el) { return (el.textContent || "").toLowerCase().replace(/\s+/g, " "); });
  var autoOpened = [];

  function setMeta(msg) { if (meta) meta.textContent = msg; }

  /* ---------- search ---------- */
  function filter() {
    var terms = (input.value || "").toLowerCase().split(/\s+/).filter(Boolean), shown = 0, hits = [];
    items.forEach(function (el, i) {
      var ok = terms.every(function (t) { return text[i].indexOf(t) > -1; });
      el.hidden = !ok;
      if (ok) { shown++; hits.push(el); }
    });
    groups.forEach(function (g) { g.hidden = !g.querySelector(".faq-item:not([hidden])"); });
    if (empty) empty.hidden = shown !== 0;
    if (hero) hero.classList.toggle("is-searching", terms.length > 0);
    autoOpened.forEach(function (el) { el.open = false; });
    autoOpened = [];
    if (terms.length) {
      if (shown && shown <= 3) hits.forEach(function (el) { if (!el.open) { el.open = true; autoOpened.push(el); } });
      setMeta(shown + (shown === 1 ? " question matches" : " questions match") + " \u201C" + input.value.trim() + "\u201D");
    } else {
      setMeta(items.length + " questions in " + groups.length + " sections");
    }
  }
  if (input) {
    var t; input.addEventListener("input", function () { clearTimeout(t); t = setTimeout(filter, 90); });
    input.addEventListener("keydown", function (e) { if (e.key === "Escape" && input.value) { input.value = ""; filter(); } });
    d.addEventListener("keydown", function (e) {
      if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test((d.activeElement || {}).tagName || "") && !e.ctrlKey && !e.metaKey) { e.preventDefault(); input.focus(); }
    });
  }

  /* ---------- expand / collapse all ---------- */
  $$("[data-faq-all]").forEach(function (b) {
    b.addEventListener("click", function () {
      var open = b.getAttribute("data-faq-all") === "open";
      items.forEach(function (el) { if (!el.hidden) el.open = open; });
      autoOpened = [];
    });
  });

  /* ---------- deep links: faq.html#negative-marking opens and scrolls to that answer ---------- */
  function fromHash() {
    var id = ""; try { id = decodeURIComponent(location.hash.slice(1)); } catch (e) {}
    var el = id && d.getElementById(id);
    if (el && el.classList.contains("faq-item")) {
      if (input && input.value) { input.value = ""; filter(); }
      el.open = true;
      setTimeout(function () { el.scrollIntoView({ block: "start" }); }, 30);
    }
  }
  addEventListener("hashchange", fromHash);
  fromHash();

  /* ---------- copy link ---------- */
  items.forEach(function (el) {
    var foot = d.createElement("div"), b = d.createElement("button");
    foot.className = "faq-foot"; b.type = "button"; b.className = "faq-copy"; b.textContent = "Copy link";
    b.setAttribute("aria-label", "Copy link to this question");
    b.addEventListener("click", function () {
      var url = location.href.split("#")[0] + "#" + el.id;
      function done() { b.textContent = "Link copied"; if (window.announce) window.announce("Link copied"); setTimeout(function () { b.textContent = "Copy link"; }, 1800); }
      try { history.replaceState(null, "", "#" + el.id); } catch (e) {}
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, done); else done();
    });
    foot.appendChild(b); el.querySelector(".faq-a").appendChild(foot);
  });

  /* ---------- category nav: highlight the section being read ---------- */
  if ("IntersectionObserver" in window && navLinks.length) {
    var map = {}; navLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
        var a = map[en.target.id];
        if (a) {
          a.setAttribute("aria-current", "true");
          var ul = a.closest("ul");
          if (ul && ul.scrollWidth > ul.clientWidth) ul.scrollTo({ left: a.offsetLeft - 16, behavior: "smooth" });
        }
      });
    }, { rootMargin: "-25% 0px -65% 0px" });
    groups.forEach(function (g) { io.observe(g); });
  }

  /* ---------- print: show every answer ---------- */
  var closed = [];
  addEventListener("beforeprint", function () { closed = items.filter(function (el) { return !el.open; }); closed.forEach(function (el) { el.open = true; }); });
  addEventListener("afterprint", function () { closed.forEach(function (el) { el.open = false; }); closed = []; });
})();
