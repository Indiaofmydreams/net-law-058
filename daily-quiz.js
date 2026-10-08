/* Daily Paper 1 quiz: 10 questions, 4 minutes. The slide is in the hero carousel (index.html).
   - The same 10 questions for everyone on a given date, drawn from Paper 1 only.
   - Data Interpretation and Mathematical Reasoning are never used (EXCLUDED below).
   - Tapping the slide stops the carousel and opens the quiz; the timer starts at once and the quiz submits itself at 00:00.
   - It uses NLQuiz (nl-quiz.js) for the questions, the timer, the score and the answer review.
   - Today's score is remembered in this browser only, so the slide can say "Today: 7/10". */
(function () {
  "use strict";
  var COUNT = 10, SECONDS = 240;
  var INCLUDED = ["Teaching Aptitude", "Research Aptitude", "Comprehension", "Communication", "Logical Reasoning",
    "Information and Communication Technology (ICT)", "People, Development and Environment", "Higher Education System"];
  var EXCLUDED = ["Data Interpretation", "Mathematical Reasoning and Aptitude"];   /* listed for clarity: never in INCLUDED */

  var root = document.querySelector("[data-cc]");
  var slide = root && root.querySelector('.cc-slide[data-label="Daily Quiz"]');
  if (!slide) return;
  var card = slide.querySelector(".cc-card"), tag = slide.querySelector(".cc-tag");
  var defaultTag = tag ? tag.textContent : "";

  function dateKey(d) { var m = d.getMonth() + 1, day = d.getDate(); return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day; }
  var KEY = "nl-dq-" + dateKey(new Date());
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }

  /* small seeded generator so every visitor gets the same set on the same day */
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function pick(bank) {
    var pool = bank.filter(function (x) { return INCLUDED.indexOf(x.u) > -1 && EXCLUDED.indexOf(x.u) < 0; });
    pool.sort(function (a, b) { return hash(a.q) - hash(b.q); });                   /* stable order, whatever order the files load in */
    var r = rng(hash("nl-daily-" + dateKey(new Date())));
    for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    return pool.slice(0, COUNT);
  }

  function refresh() {
    var d = load(); if (!tag) return;
    tag.textContent = d ? "TODAY: " + d.ok + "/" + d.total + " · TAP TO RETRY" : defaultTag;
    var btns = root.querySelectorAll(".cc-opt-btn"), i = [].indexOf.call(root.querySelectorAll(".cc-slide"), slide), s = btns[i] && btns[i].querySelector(".co-s");
    if (s) s.textContent = tag.textContent;
    var cta = slide.querySelector(".cc-cta"); if (cta) cta.textContent = d ? "Retry today’s quiz →" : "Start today’s quiz →";
  }
  var dt = slide.querySelector(".dq-date");
  if (dt) dt.textContent = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  refresh();

  function pause() { root.dispatchEvent(new Event("cc-pause")); }
  function resume() { root.dispatchEvent(new Event("cc-resume")); }
  var opening = false;
  function open() {
    if (opening || !window.NLQuiz || !window.loadBank) return;
    opening = true; pause();
    window.loadBank().then(function (bank) {
      var qs = pick(bank);
      if (qs.length < COUNT) { opening = false; resume(); window.announce && window.announce("Today’s quiz could not be built."); return; }
      NLQuiz.start({
        title: "Paper 1 · " + new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        heading: "Daily Paper 1 quiz", questions: qs, seconds: SECONDS, opener: card,
        onFinish: function (r, total) { save({ ok: r.ok, total: total }); refresh(); },
        onClose: function () { opening = false; resume(); }
      });
    }).catch(function () { opening = false; resume(); });
  }

  /* Runs after the carousel's own click handler: a swipe or a click on a side card has already been cancelled there. */
  root.querySelector(".cc-stage").addEventListener("click", function (e) {
    if (e.defaultPrevented || !e.target.closest(".cc-slide") || e.target.closest(".cc-slide") !== slide || !slide.classList.contains("is-active")) return;
    e.preventDefault(); open();
  });
})();
