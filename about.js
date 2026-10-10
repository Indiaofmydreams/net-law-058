/* about.js: progressive enhancement only. Highlights the current section in the side contents. */
(function () {
  "use strict";
  try { var z = +localStorage.getItem("nl-size"); if (z > 0 && z < 3) document.documentElement.style.fontSize = [100, 115, 130][z] + "%"; } catch (e) {}
  var links = [].slice.call(document.querySelectorAll(".faq-nav a")), map = {};
  links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
  var secs = [].slice.call(document.querySelectorAll(".faq-group")).filter(function (s) { return map[s.id]; });
  if (!secs.length || !("IntersectionObserver" in window)) return;
  function set(id) { links.forEach(function (a) { a.removeAttribute("aria-current"); }); if (map[id]) map[id].setAttribute("aria-current", "true"); }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) set(e.target.id); });
  }, { rootMargin: "-20% 0px -70% 0px" });
  secs.forEach(function (s) { io.observe(s); });
})();
