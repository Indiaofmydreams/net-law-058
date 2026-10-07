/* section-nav.js: compact left-side section navigator for index.html.
   Self-contained: builds its own markup, touches nothing else on the page.
   To add/remove an entry, edit SECTIONS below (entries whose id is missing from the page are skipped). */
(function () {
  "use strict";

  var SECTIONS = [
    { id: "home",       label: "Home" },
    { id: "plan",       label: "Study Plan" },
    { id: "mock-tests", label: "Mock Tests" },
    { id: "law",        label: "Law 058" },
    { id: "syllabus",   label: "Syllabus" },
    { id: "mcqs",       label: "MCQs" },
    { id: "paper1",     label: "Paper 1" },
    { id: "notes",      label: "Notes" },
    { id: "pyq",        label: "PYQs" }
  ];

  var LINE_RATIO = 0.3;      // a section counts as "current" once its top passes 30% down the visible area
  var items = [];            // [{ id, el, link }]
  var activeId = null;
  var lockId = null;         // while a click-triggered scroll is running, keep the clicked item highlighted
  var lockTimer = null;
  var ticking = false;

  function reduceMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  function headerH() {
    var h = document.querySelector(".site-header");
    return h ? h.offsetHeight : 0;
  }

  function build() {
    var nav = document.createElement("nav");
    nav.className = "nlsn";
    nav.id = "nlsn";
    nav.setAttribute("aria-label", "Page sections");
    var ul = document.createElement("ul");

    SECTIONS.forEach(function (s) {
      var el = document.getElementById(s.id);
      if (!el) return;
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + s.id;
      a.setAttribute("data-nlsn", s.id);
      a.innerHTML = '<span class="nlsn-mark" aria-hidden="true"></span><span class="nlsn-label"></span>';
      a.lastChild.textContent = s.label;
      li.appendChild(a);
      ul.appendChild(li);
      items.push({ id: s.id, el: el, link: a });
    });

    if (!items.length) return null;
    nav.appendChild(ul);
    document.body.appendChild(nav);
    return nav;
  }

  function setActive(id) {
    if (id === activeId) return;
    activeId = id;
    items.forEach(function (it) {
      var on = it.id === id;
      it.link.classList.toggle("is-active", on);
      if (on) it.link.setAttribute("aria-current", "true");
      else it.link.removeAttribute("aria-current");
    });
  }

  function currentFromScroll() {
    var hh = headerH();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var line = hh + (vh - hh) * LINE_RATIO;
    var doc = document.documentElement;
    var atBottom = (window.pageYOffset + vh) >= (doc.scrollHeight - 2);
    var found = items[0].id;

    if (atBottom && window.pageYOffset > 0) return items[items.length - 1].id;
    for (var i = 0; i < items.length; i++) {
      if (items[i].el.getBoundingClientRect().top <= line) found = items[i].id;
      else break;
    }
    return found;
  }

  function update() {
    ticking = false;
    if (!items.length) return;
    if (lockId) { setActive(lockId); return; }
    setActive(currentFromScroll());
  }
  function schedule() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  function unlock() {
    if (!lockId) return;
    lockId = null;
    clearTimeout(lockTimer);
    schedule();
  }

  function goTo(id) {
    var it = items.filter(function (x) { return x.id === id; })[0];
    if (!it) return;
    var y = id === items[0].id
      ? 0
      : it.el.getBoundingClientRect().top + window.pageYOffset - headerH();
    lockId = id;
    setActive(id);
    clearTimeout(lockTimer);
    lockTimer = setTimeout(unlock, 900);   // safety net; normally released when scrolling stops
    window.scrollTo({ top: Math.max(0, y), behavior: reduceMotion() ? "auto" : "smooth" });
  }

  function init() {
    var nav = build();
    if (!nav) return;

    nav.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a[data-nlsn]") : null;
      if (!a) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      goTo(a.getAttribute("data-nlsn"));
    });

    // Keyboard users: expand the panel while a link has visible focus (mouse clicks don't trigger this)
    nav.addEventListener("focusin", function (e) {
      var vis = true;
      try { vis = e.target.matches(":focus-visible"); } catch (err) {}
      if (vis) nav.classList.add("is-open");
    });
    nav.addEventListener("focusout", function () { nav.classList.remove("is-open"); });

    window.addEventListener("scroll", function () {
      if (lockId) {                         // release the lock shortly after the animated scroll settles
        clearTimeout(lockTimer);
        lockTimer = setTimeout(unlock, 140);
      }
      schedule();
    }, { passive: true });
    // If the user takes over mid-animation, stop forcing the highlight
    ["wheel", "touchstart", "keydown"].forEach(function (ev) {
      window.addEventListener(ev, unlock, { passive: true });
    });
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);

    // Sections are partly rendered by other scripts and can change height (accordions, panels)
    if (window.ResizeObserver) {
      var main = document.getElementById("main");
      if (main) new ResizeObserver(schedule).observe(main);
    }
    schedule();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
