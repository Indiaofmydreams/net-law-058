/* pyq.js: shuffled PYQ test on pyq.html.

   How it works
   - All previous-year questions live in ONE file, pyq-data.json (see PYQ-README.txt for how to add a paper).
     Each item: { q: question, o: [4 options], a: index of correct option (0-3), e: explanation (optional),
                  s: source paper label, n: note about the paper/key (optional) }
   - The "id" used inside the original files is not used anywhere. Students always see 1, 2, 3 ... in the order drawn.
   - Every test is a fresh random draw of 20, 50 or 100 questions from the whole pool, in random order.
     Questions are drawn from those not yet seen on this device first, so repeated tests cover the whole pool
     before anything repeats (the "seen" list is kept in localStorage and resets itself when the pool is used up).
   - Timer = half a minute per question: 20 Q = 10 min, 50 Q = 25 min, 100 Q = 50 min. At 0:00 the test is submitted.
   - Explanations are shown in the review ONLY for questions that have one. Nothing is sent anywhere.
   To change the lengths or the time rule, edit LENS and SEC_PER_Q below. */
(function () {
  "use strict";
  var host = document.getElementById("pq-app"); if (!host) return;

  var LENS = [20, 50, 100], SEC_PER_Q = 30, KEY = "netlaw-pyq-v1", SEEN = "netlaw-pyq-seen-v1", DATA = "pyq-data.json";
  var doc = document, say = function (m) { if (window.announce) window.announce(m); };
  var S = { mode: "idle", bank: null, loading: null, N: 50, Q: [], ans: [], i: 0, secs: 0, end: 0, t0: 0, tick: 0, said: {}, confirm: false, res: null, fromFresh: 0 };

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function mmss(sec) { sec = Math.max(0, Math.round(sec)); var m = Math.floor(sec / 60), s = sec % 60; return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s; }
  function mins(n) { return Math.round(n * SEC_PER_Q / 60); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
  function get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function left() { return Math.max(0, Math.ceil((S.end - Date.now()) / 1000)); }
  function answered() { return S.ans.filter(function (a) { return a > -1; }).length; }
  function reduced() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function toTop() { var el = host.firstElementChild; el && el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" }); }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }

  /* ---------- data ---------- */
  function load() {
    if (S.bank) return Promise.resolve(S.bank);
    if (S.loading) return S.loading;
    return (S.loading = fetch(DATA, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); }).then(function (arr) {
      arr.forEach(function (x) { x.k = hash(x.q + "|" + x.o.join("|")); });
      S.bank = arr; fillCounts(arr); return arr;
    }).catch(function (e) { S.loading = null; throw e; }));
  }
  function fillCounts(arr) {                       /* keep every number on the page in step with the data file */
    var by = {}, order = [];
    arr.forEach(function (x) { if (!by[x.s]) { by[x.s] = 0; order.push(x.s); } by[x.s]++; });
    [].forEach.call(doc.querySelectorAll("[data-pq-total]"), function (el) { el.textContent = arr.length; });
    [].forEach.call(doc.querySelectorAll("[data-pq-papers]"), function (el) { el.textContent = order.length; });
    [].forEach.call(doc.querySelectorAll("[data-pq-expl]"), function (el) { el.textContent = arr.filter(function (x) { return x.e; }).length; });
    [].forEach.call(doc.querySelectorAll("[data-pq-notes]"), function (el) { el.textContent = arr.filter(function (x) { return x.n; }).length; });
    var list = doc.querySelector("[data-pq-list]");
    if (list) list.innerHTML = order.map(function (s) { return "<li><b>" + by[s] + "</b> " + esc(s) + "</li>"; }).join("");
  }
  function draw(n) {
    var seen = get(SEEN) || [], set = {}; seen.forEach(function (k) { set[k] = 1; });
    var fresh = shuffle(S.bank.filter(function (x) { return !set[x.k]; }));
    var pick, fromFresh;
    if (fresh.length >= n) { pick = fresh.slice(0, n); fromFresh = n; }
    else {                                          /* pool nearly used up: take what is left, top up from the rest, start a new round */
      var rest = shuffle(S.bank.filter(function (x) { return set[x.k]; }));
      pick = fresh.concat(rest.slice(0, n - fresh.length)); fromFresh = fresh.length;
    }
    return { Q: shuffle(pick), fromFresh: fromFresh };
  }
  function commitSeen() {
    var seen = get(SEEN) || [], set = {}; seen.forEach(function (k) { set[k] = 1; });
    var freshKeys = S.Q.filter(function (x) { return !set[x.k]; }).map(function (x) { return x.k; });
    var next = S.fromFresh >= S.Q.length ? seen.concat(freshKeys) : S.Q.map(function (x) { return x.k; });   /* pool used up: this test opens a new round */
    if (next.length >= S.bank.length) next = [];    /* whole pool covered: start a new round */
    put(SEEN, next);
  }
  function coverage() { var s = get(SEEN) || []; return s.length; }

  /* ---------- screens ---------- */
  function paintIdle(msg) {
    S.mode = "idle"; clearInterval(S.tick);
    var d = get(KEY) || {}, total = S.bank ? S.bank.length : null;
    var best = d[S.N] ? '<span class="pq-best">Your best at ' + S.N + ": " + d[S.N].best + "/" + S.N + " &middot; " + plural(d[S.N].n, "attempt") + "</span>" : "";
    var cov = total && coverage() ? '<p class="pq-rule">You have covered ' + coverage() + " of " + total + " questions so far. New tests pick unseen questions first.</p>" : "";
    host.innerHTML = '<section class="pq" aria-labelledby="pq-h">' +
      '<span class="pq-tag">FREE &middot; SHUFFLED PYQ TEST</span>' +
      '<h2 id="pq-h">Take a shuffled PYQ test</h2>' +
      '<p class="pq-lead">Real previous-year questions. Random order. A clock that does not wait.</p>' +
      '<h3 class="pq-h4" id="pq-len-h">How many questions?</h3>' +
      '<fieldset class="pq-lens" aria-labelledby="pq-len-h"><legend>Number of questions</legend>' +
      LENS.map(function (n) {
        return '<label class="pq-len"><input type="radio" name="pq-n" value="' + n + '"' + (n === S.N ? " checked" : "") + "><b>" + n + "</b><span>Questions</span><em>" + mins(n) + " minutes</em><small>" + SEC_PER_Q + " seconds each</small></label>";
      }).join("") + "</fieldset>" +
      '<p class="pq-rule">The timer is half a minute per question, so the time is half the number of questions. ' + (total ? "Questions are drawn at random from all " + total + " in the pool." : "") + "</p>" + cov +
      '<div class="pq-cta"><button type="button" class="pq-btn pri" data-a="start">Start the test →</button>' + best + "</div>" +
      (msg ? '<p class="pq-foot" role="alert">' + esc(msg) + "</p>" : '<p class="pq-foot">Instant score &middot; No sign-up &middot; No negative marking. Not affiliated with NTA or UGC.</p>') + "</section>";
  }

  function start(btn) {
    if (btn) { btn.disabled = true; btn.textContent = "Loading questions…"; }
    load().then(function () {
      var n = Math.min(S.N, S.bank.length), r = draw(n);
      S.Q = r.Q; S.fromFresh = r.fromFresh; S.ans = S.Q.map(function () { return -1; }); S.i = 0; S.confirm = false; S.res = null; S.said = {};
      S.secs = S.Q.length * SEC_PER_Q; S.t0 = Date.now(); S.end = S.t0 + S.secs * 1000; S.mode = "run";
      clearInterval(S.tick); S.tick = setInterval(onTick, 250);
      paintRun(true); toTop(); say("Test started. " + S.Q.length + " questions, " + mins(S.Q.length) + " minutes.");
    }).catch(function () { paintIdle("Could not load the questions. Check your connection and refresh the page."); });
  }

  function paintRun(focus) {
    var N = S.Q.length, x = S.Q[S.i], last = S.i === N - 1, un = N - answered();
    host.innerHTML = '<section class="pq" role="group" aria-label="PYQ test in progress">' +
      '<div class="pq-top"><span class="pq-qn">Question ' + (S.i + 1) + " of " + N + '</span><span class="pq-ans">' + answered() + ' answered</span><span class="pq-clock' + (left() <= 60 ? " warn" : "") + '" aria-hidden="true">⏱ ' + mmss(left()) + "</span></div>" +
      '<div class="pq-bar" role="progressbar" aria-label="Test progress" aria-valuemin="0" aria-valuemax="' + N + '" aria-valuenow="' + (S.i + 1) + '"><i style="width:' + ((S.i + 1) / N * 100) + '%"></i></div>' +
      '<p class="pq-q" id="pq-q">' + esc(x.q) + "</p>" +
      '<fieldset class="pq-o" aria-labelledby="pq-q"><legend>Choose one answer</legend>' +
      x.o.map(function (t, k) { return '<label class="pq-op"><input type="radio" name="pq" value="' + k + '"' + (S.ans[S.i] === k ? " checked" : "") + "><span>" + esc(t) + "</span></label>"; }).join("") + "</fieldset>" +
      '<div class="pq-f"><button type="button" class="pq-btn" data-a="prev"' + (S.i ? "" : " disabled") + '>‹ Previous</button>' + (window.NLReport ? NLReport.btn(x, "PYQ test (" + x.s + ") - Q" + (S.i + 1)) : "") + '<span class="sp"></span>' +
      (last ? '<button type="button" class="pq-btn pri" data-a="finish">Submit test</button>' : '<button type="button" class="pq-btn pri" data-a="next">Next ›</button>') + "</div>" +
      (S.confirm ? '<div class="pq-f"><p class="pq-warn" role="alert">' + plural(un, "question") + ' not answered. Submit anyway?</p><button type="button" class="pq-btn" data-a="back">Keep going</button><button type="button" class="pq-btn pri" data-a="submit">Submit anyway</button></div>' : "") +
      '<div class="pq-pal" role="group" aria-label="Jump to a question">' + S.Q.map(function (_, k) {
        var a = S.ans[k] > -1;
        return '<button type="button" data-g="' + k + '" class="' + (a ? "a" : "") + (k === S.i ? " c" : "") + '" aria-label="Question ' + (k + 1) + (a ? ", answered" : ", not answered") + '"' + (k === S.i ? ' aria-current="true"' : "") + ">" + (k + 1) + "</button>";
      }).join("") + "</div>" +
      '<p class="pq-hint"><span>Keys: A–D or 1–4 choose · N next · P previous</span>' + (last ? "" : '<button type="button" class="pq-link" data-a="finish">Submit early</button>') + '<button type="button" class="pq-link" data-a="quit">Quit test</button></p></section>';
    if (focus) { var f = host.querySelector("input:checked") || host.querySelector("input"); f && f.focus({ preventScroll: true }); }
  }

  function onTick() {
    var l = left(), c = host.querySelector(".pq-clock");
    if (c) { c.textContent = "⏱ " + mmss(l); c.classList.toggle("warn", l <= 60); }
    var marks = S.secs >= 600 ? [[300, "5 minutes left."], [60, "1 minute left."], [30, "30 seconds left."]] : [[60, "1 minute left."], [30, "30 seconds left."]];
    marks.forEach(function (m) { if (l <= m[0] && !S.said[m[0]] && l > 0) { S.said[m[0]] = 1; say(m[1]); } });
    if (l <= 0) finish(true);
  }

  function finish(timeUp) {
    if (S.mode !== "run") return;
    clearInterval(S.tick); S.mode = "result";
    var N = S.Q.length, used = Math.min(S.secs, Math.round((Date.now() - S.t0) / 1000)), ok = 0, tried = 0;
    S.Q.forEach(function (x, k) { if (S.ans[k] > -1) { tried++; if (S.ans[k] === x.a) ok++; } });
    var d = get(KEY) || {}, prev = d[N], n = (prev && prev.n || 0) + 1, pb = !prev || ok > prev.best;
    d[N] = { best: pb ? ok : prev.best, n: n, last: ok }; put(KEY, d);
    commitSeen();
    S.res = { ok: ok, wrong: tried - ok, skip: N - tried, sec: used, timeUp: !!timeUp, pb: pb && n > 1, prevBest: prev && prev.best, filter: "all" };
    paintResult(); toTop();
    say((timeUp ? "Time is up. " : "Test submitted. ") + "You scored " + ok + " out of " + N + ".");
  }

  function paintResult() {
    var r = S.res, N = S.Q.length, pct = Math.round(r.ok / N * 100);
    var msg = pct >= 85 ? "Outstanding. You are performing at exam-ready level." : pct >= 65 ? "Strong result. Read the explanations for the ones you missed, then take another shuffle." : pct >= 40 ? "A solid start. Go through the review below, revise those topics, then retake." : "Every attempt builds recall. Study the answers below, then try a fresh shuffle.";
    var cnt = { all: N, bad: r.wrong, skip: r.skip };
    var items = S.Q.map(function (x, k) {
      var a = S.ans[k], good = a === x.a, cls = good ? "ok" : a < 0 ? "sk" : "no";
      if (r.filter === "bad" && a < 0) return ""; if (r.filter === "bad" && good) return "";
      if (r.filter === "skip" && a > -1) return "";
      return '<div class="pq-r ' + cls + '"><p class="v">' + (k + 1) + ". " + (good ? "CORRECT" : a < 0 ? "NOT ANSWERED" : "INCORRECT") + '</p><p class="t">' + esc(x.q) + "</p>" +
        (good ? "" : "<p>Your answer: " + (a < 0 ? "none" : esc(x.o[a])) + "</p>") + "<p><b>Correct answer: " + esc(x.o[x.a]) + "</b></p>" +
        (x.e ? '<p class="e">' + esc(x.e) + "</p>" : "") +
        (x.n ? '<p class="nt"><b>Note on this question:</b> ' + esc(x.n) + "</p>" : "") +
        '<p class="src">' + esc(x.s) + "</p>" +
        (window.NLReport || window.NLShare ? "<p>" + (window.NLReport ? NLReport.btn(x, "PYQ test (" + x.s + ") - Q" + (k + 1)) : "") + (window.NLShare ? " " + NLShare.btn(function () { return NLShare.make.question(x, "UGC NET Law PYQ"); }, { icon: 1, aria: "Share this question" }) : "") + "</p>" : "") + "</div>";
    }).join("");
    var open = host.querySelector("details") && host.querySelector("details").open;
    host.innerHTML = '<section class="pq" role="group" aria-label="PYQ test result">' +
      '<span class="pq-tag">' + (r.timeUp ? "TIME&#39;S UP" : "TEST COMPLETE") + " &middot; " + N + " QUESTIONS</span>" +
      '<div class="pq-score" role="status"><b>' + r.ok + "</b><span> / " + N + " &middot; " + pct + "%</span></div>" +
      (r.pb ? '<p class="pq-pb">New personal best at ' + N + " questions!</p>" : r.prevBest != null ? '<p class="pq-pb">Your best at ' + N + ": " + Math.max(r.prevBest, r.ok) + "/" + N + "</p>" : "") +
      '<div class="pq-chips"><span>' + r.ok + " correct</span><span>" + r.wrong + " wrong</span><span>" + r.skip + " skipped</span><span>Time " + mmss(r.sec) + " of " + mmss(S.secs) + "</span><span>" + (r.sec / N).toFixed(0) + " s per question</span></div>" +
      '<p class="pq-msg">' + msg + "</p>" +
      '<details class="pq-det"' + (open || r.filter !== "all" ? " open" : "") + '><summary>Review all answers</summary><div class="pq-sw" role="group" aria-label="Which answers to review">' +
      '<button type="button" data-f="all" aria-pressed="' + (r.filter === "all") + '">All (' + cnt.all + ')</button><button type="button" data-f="bad" aria-pressed="' + (r.filter === "bad") + '">Wrong (' + cnt.bad + ')</button><button type="button" data-f="skip" aria-pressed="' + (r.filter === "skip") + '">Skipped (' + cnt.skip + ")</button></div>" +
      (items || '<p class="pq-msg">Nothing here. Well done.</p>') + "</details>" +
      '<div class="pq-f"><button type="button" class="pq-btn pri" data-a="again">New shuffled test</button><button type="button" class="pq-btn" data-a="change">Change length</button><button type="button" class="pq-btn" data-a="share">Share my score</button></div>' +
      '<p class="pq-foot">Each new test draws different questions where it can. Scores are kept on this device only.</p></section>';
  }

  function share(opener) {
    var r = S.res, N = S.Q.length, pc = Math.round(r.ok / N * 100);
    if (window.NLShare) {
      NLShare.open(NLShare.make.score({ what: "UGC NET Law " + N + "-question PYQ test", score: r.ok + "/" + N, pct: pc, correct: r.ok, wrong: r.wrong, time: mmss(r.sec), kind: "quiz", url: location.href.split("#")[0], chips: [r.ok + " correct", r.wrong + " wrong", mmss(r.sec)] }), opener);
      return;
    }
    var text = "I scored " + r.ok + "/" + N + " on a shuffled UGC NET Law PYQ test. Try it free:", url = location.href.split("#")[0];
    if (navigator.share) { navigator.share({ title: "UGC NET Law PYQ test", text: text, url: url }).catch(function () {}); return; }
    window.open("https://wa.me/?text=" + encodeURIComponent(text + " " + url), "_blank", "noopener");
  }

  /* ---------- events (delegated) ---------- */
  host.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.f) { S.res.filter = b.dataset.f; paintResult(); return; }
    if (b.dataset.g != null) { S.i = +b.dataset.g; S.confirm = false; paintRun(true); return; }
    var a = b.dataset.a; if (!a) return;
    var N = S.Q.length;
    if (a === "start") start(b);
    else if (a === "again") { S.mode = "idle"; start(b); }
    else if (a === "change") { paintIdle(); toTop(); }
    else if (a === "next") { S.i = Math.min(N - 1, S.i + 1); S.confirm = false; paintRun(true); }
    else if (a === "prev") { S.i = Math.max(0, S.i - 1); S.confirm = false; paintRun(true); }
    else if (a === "finish") { if (answered() < N) { S.confirm = true; paintRun(false); var s = host.querySelector('[data-a="submit"]'); s && s.focus(); } else finish(false); }
    else if (a === "submit") finish(false);
    else if (a === "back") { S.confirm = false; paintRun(true); }
    else if (a === "quit") { if (window.confirm("Quit this test? Your answers will not be saved.")) { clearInterval(S.tick); say("Test cancelled."); paintIdle(); var sb = host.querySelector('[data-a="start"]'); sb && sb.focus({ preventScroll: true }); } }
    else if (a === "share") share(b);
  });
  host.addEventListener("change", function (e) {
    if (e.target.name === "pq-n") { S.N = +e.target.value; var d = get(KEY) || {}, bst = host.querySelector(".pq-best"); if (bst) bst.remove(); if (d[S.N]) { var c = host.querySelector(".pq-cta"); c && c.insertAdjacentHTML("beforeend", '<span class="pq-best">Your best at ' + S.N + ": " + d[S.N].best + "/" + S.N + " &middot; " + plural(d[S.N].n, "attempt") + "</span>"); } return; }
    if (e.target.name !== "pq") return;
    S.ans[S.i] = +e.target.value;
    var m = host.querySelector(".pq-ans"); if (m) m.textContent = answered() + " answered";
    var p = host.querySelector('.pq-pal [data-g="' + S.i + '"]'); if (p) { p.classList.add("a"); p.setAttribute("aria-label", "Question " + (S.i + 1) + ", answered"); }
  });
  host.addEventListener("keydown", function (e) {
    if (S.mode !== "run" || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key.toLowerCase(), idx = "abcd".indexOf(k); if (idx < 0 && k >= "1" && k <= "4") idx = +k - 1;
    if (idx > -1 && k.length === 1) { var inp = host.querySelectorAll('input[name="pq"]')[idx]; if (inp) { inp.checked = true; inp.dispatchEvent(new Event("change", { bubbles: true })); inp.focus({ preventScroll: true }); e.preventDefault(); } }
    else if (k === "n") { var nx = host.querySelector('[data-a="next"]'); nx && nx.click(); }
    else if (k === "p") { var pv = host.querySelector('[data-a="prev"]'); pv && !pv.disabled && pv.click(); }
  });

  /* ?n=20|50|100 in the link pre-selects a length (e.g. from the home page) */
  try { var qn = +new URLSearchParams(location.search).get("n"); if (LENS.indexOf(qn) > -1) S.N = qn; } catch (e) {}
  paintIdle();
  load().then(function () { if (S.mode === "idle") paintIdle(); }).catch(function () {});   /* warm the data so Start is instant */
})();
