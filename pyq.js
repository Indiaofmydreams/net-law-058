/* pyq.js: shuffled PYQ test on pyq.html.

   How it works
   - All previous-year questions live in ONE file, pyq-data.json (see PYQ-README.txt for how to add a paper).
     Each item: { q: question, o: [4 options], a: index of correct option (0-3), e: explanation (optional),
                  s: source paper label, u: unit code (L1-L10 Law 058, P1-P10 Paper 1), n: note about the paper/key (optional) }
   - The "id" used inside the original files is not used anywhere. Students always see 1, 2, 3 ... in the order drawn.
   - Every test is a fresh random draw of 20, 50 or 100 questions from the whole pool, in random order.
     Questions are drawn from those not yet seen on this device first, so repeated tests cover the whole pool
     before anything repeats (the "seen" list is kept in localStorage and resets itself when the pool is used up).
   - Two clocks (PACES below): "half-time" = 30 seconds a question, "exam pace" = 72 seconds a question
     (the real paper: 150 questions in 3 hours). At 0:00 the test is submitted.
   - Result: score, unit-wise breakdown (weakest first, with a Revise link to that unit's notes), full review.
     Explanations are shown ONLY for questions that have one.
   - "Retake wrong and skipped": re-runs just the missed questions, reshuffled, on the same clock. Retakes do not change
     the best score or the seen list.
   Nothing is sent anywhere. To change lengths or clocks, edit LENS and PACES below. */
(function () {
  "use strict";
  var host = document.getElementById("pq-app"); if (!host) return;

  var LENS = [20, 50, 100], KEY = "netlaw-pyq-v1", SEEN = "netlaw-pyq-seen-v1", DATA = "pyq-data.json";
  var PACES = {
    half: { sps: 30, name: "Half-time", sub: "30 seconds a question", note: "Half a minute per question, so the time is half the number of questions. Tighter than the real exam, so the real pace feels roomy." },
    exam: { sps: 72, name: "Exam pace", sub: "72 seconds a question", note: "72 seconds per question, the average on the real paper (150 questions in 3 hours). 50 questions = 60 minutes, 100 = 120." }
  };
  var UN = {
    L1: ["Jurisprudence", "ugc-net-law-unit-1-jurisprudence.html"], L2: ["Constitutional & Administrative Law", "ugc-net-law-unit-2-constitutional-administrative-law.html"],
    L3: ["Public International Law & IHL", "ugc-net-law-unit-3-public-international-law-ihl.html"], L4: ["Law of Crimes", "ugc-net-law-unit-4-law-of-crimes.html"],
    L5: ["Torts & Consumer Protection", "ugc-net-law-unit-5-torts-consumer-protection.html"], L6: ["Commercial Law", "ugc-net-law-unit-6-commercial-law.html"],
    L7: ["Family Law", "ugc-net-law-unit-7-family-law.html"], L8: ["Environment & Human Rights", "ugc-net-law-unit-8-environment-human-rights.html"],
    L9: ["IPR & IT Law", "ugc-net-law-unit-9-ipr-it-law.html"], L10: ["Comparative Public Law", "ugc-net-law-unit-10-comparative-public-law.html"],
    P1: ["Teaching Aptitude", "ugc-net-paper-1-unit-1-teaching-aptitude.html"], P2: ["Research Aptitude", "ugc-net-paper-1-unit-2-research-aptitude.html"],
    P3: ["Comprehension", "ugc-net-paper-1-unit-3-comprehension.html"], P4: ["Communication", "ugc-net-paper-1-unit-4-communication.html"],
    P5: ["Mathematical Reasoning", "ugc-net-paper-1-unit-5-mathematical-reasoning.html"], P6: ["Logical Reasoning", "ugc-net-paper-1-unit-6-logical-reasoning.html"],
    P7: ["Data Interpretation", "ugc-net-paper-1-unit-7-data-interpretation.html"], P8: ["ICT", "ugc-net-paper-1-unit-8-ict.html"],
    P9: ["People, Development & Environment", "ugc-net-paper-1-unit-9-people-development-environment.html"], P10: ["Higher Education System", "ugc-net-paper-1-unit-10-higher-education-system.html"]
  };
  var ORDER = ["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "L10", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10"];
  var doc = document, say = function (m) { if (window.announce) window.announce(m); };
  var S = { mode: "idle", bank: null, loading: null, N: 50, pace: "half", Q: [], ans: [], i: 0, secs: 0, end: 0, t0: 0, tick: 0, said: {}, confirm: false, res: null, fromFresh: 0, retake: false };

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function mmss(sec) { sec = Math.max(0, Math.round(sec)); var m = Math.floor(sec / 60), s = sec % 60; return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s; }
  function sps() { return PACES[S.pace].sps; }
  function mins(n) { return Math.round(n * sps() / 60); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
  function get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function bkey(n) { return S.pace === "half" ? String(n) : n + "e"; }          /* "half" keeps the original keys, so earlier best scores survive */
  function left() { return Math.max(0, Math.ceil((S.end - Date.now()) / 1000)); }
  function answered() { return S.ans.filter(function (a) { return a > -1; }).length; }
  function reduced() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function toTop() { var el = host.firstElementChild; el && el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" }); }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  function uname(c) { return UN[c] ? UN[c][0] : ""; }
  function group(c) { return c && c.charAt(0) === "P" ? "Paper 1" : "Law 058"; }

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
    var by = {}, order = [], un = {};
    arr.forEach(function (x) { if (!by[x.s]) { by[x.s] = 0; order.push(x.s); } by[x.s]++; if (x.u) un[x.u] = (un[x.u] || 0) + 1; });
    function setAll(sel, v) { [].forEach.call(doc.querySelectorAll(sel), function (el) { el.textContent = v; }); }
    setAll("[data-pq-total]", arr.length); setAll("[data-pq-papers]", order.length);
    setAll("[data-pq-expl]", arr.filter(function (x) { return x.e; }).length);
    setAll("[data-pq-notes]", arr.filter(function (x) { return x.n; }).length);
    setAll("[data-pq-units-n]", Object.keys(un).length);
    var list = doc.querySelector("[data-pq-list]");
    if (list) list.innerHTML = order.map(function (s) { return "<li><b>" + by[s] + "</b> " + esc(s) + "</li>"; }).join("");
    var ul = doc.querySelector("[data-pq-units]");
    if (ul) ul.innerHTML = ["Law 058", "Paper 1"].map(function (g) {
      return '<h3 class="pq-gh">' + g + '</h3><ul class="pq-papers">' + ORDER.filter(function (c) { return group(c) === g && un[c]; }).map(function (c) {
        return '<li><a href="' + UN[c][1] + '">' + esc(UN[c][0]) + " <b>" + un[c] + "</b></a></li>"; }).join("") + "</ul>";
    }).join("");
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
  function bestHTML() {
    var d = get(KEY) || {}, b = d[bkey(S.N)];
    return b ? '<span class="pq-best">Your best at ' + S.N + " (" + PACES[S.pace].name.toLowerCase() + "): " + b.best + "/" + S.N + " &middot; " + plural(b.n, "attempt") + "</span>" : "";
  }
  function ruleText() {
    var total = S.bank ? S.bank.length : null;
    return PACES[S.pace].note + (total ? " Questions are drawn at random from all " + total + " in the pool." : "");
  }
  function paintIdle(msg) {
    S.mode = "idle"; clearInterval(S.tick);
    var total = S.bank ? S.bank.length : null;
    var cov = total && coverage() ? '<p class="pq-rule">You have covered ' + coverage() + " of " + total + " questions so far. New tests pick unseen questions first.</p>" : "";
    host.innerHTML = '<section class="pq" aria-labelledby="pq-h">' +
      '<span class="pq-tag">FREE &middot; SHUFFLED PYQ TEST</span>' +
      '<h2 id="pq-h">Take a shuffled PYQ test</h2>' +
      '<p class="pq-lead">Real previous-year questions. Random order. A clock that does not wait.</p>' +
      '<h3 class="pq-h4" id="pq-len-h">How many questions?</h3>' +
      '<fieldset class="pq-lens" aria-labelledby="pq-len-h"><legend>Number of questions</legend>' +
      LENS.map(function (n) {
        return '<label class="pq-len"><input type="radio" name="pq-n" value="' + n + '"' + (n === S.N ? " checked" : "") + "><b>" + n + "</b><span>Questions</span><em data-t=\"" + n + '">' + mins(n) + " minutes</em></label>";
      }).join("") + "</fieldset>" +
      '<h3 class="pq-h4" id="pq-pace-h">Which clock?</h3>' +
      '<fieldset class="pq-lens pq-paces" aria-labelledby="pq-pace-h"><legend>Clock</legend>' +
      Object.keys(PACES).map(function (k) {
        return '<label class="pq-len pq-pace"><input type="radio" name="pq-p" value="' + k + '"' + (k === S.pace ? " checked" : "") + "><em>" + PACES[k].name + "</em><small>" + PACES[k].sub + "</small></label>";
      }).join("") + "</fieldset>" +
      '<p class="pq-rule" id="pq-rule">' + ruleText() + "</p>" + cov +
      '<div class="pq-cta"><button type="button" class="pq-btn pri" data-a="start">Start the test →</button><span id="pq-bestwrap">' + bestHTML() + "</span></div>" +
      (msg ? '<p class="pq-foot" role="alert">' + esc(msg) + "</p>" : '<p class="pq-foot">Instant score &middot; Unit-wise result &middot; No sign-up &middot; No negative marking. Not affiliated with NTA or UGC.</p>') + "</section>";
  }
  function refreshIdle() {                         /* update the setup card in place (keeps keyboard focus) */
    [].forEach.call(host.querySelectorAll("[data-t]"), function (el) { el.textContent = mins(+el.getAttribute("data-t")) + " minutes"; });
    var r = host.querySelector("#pq-rule"); if (r) r.textContent = ruleText();
    var b = host.querySelector("#pq-bestwrap"); if (b) b.innerHTML = bestHTML();
  }

  function start(btn) {
    if (btn) { btn.disabled = true; btn.textContent = "Loading questions…"; }
    load().then(function () {
      var n = Math.min(S.N, S.bank.length), r = draw(n);
      begin(r.Q, false, r.fromFresh);
    }).catch(function () { paintIdle("Could not load the questions. Check your connection and refresh the page."); });
  }
  function begin(Q, retake, fromFresh) {
    S.Q = Q; S.retake = !!retake; S.fromFresh = fromFresh || 0; S.ans = Q.map(function () { return -1; }); S.i = 0; S.confirm = false; S.res = null; S.said = {};
    S.secs = Q.length * sps(); S.t0 = Date.now(); S.end = S.t0 + S.secs * 1000; S.mode = "run";
    clearInterval(S.tick); S.tick = setInterval(onTick, 250);
    paintRun(true); toTop();
    say((retake ? "Retake started. " : "Test started. ") + Q.length + " questions, " + Math.round(S.secs / 60) + " minutes.");
  }

  function paintRun(focus) {
    var N = S.Q.length, x = S.Q[S.i], last = S.i === N - 1, un = N - answered();
    host.innerHTML = '<section class="pq" role="group" aria-label="' + (S.retake ? "PYQ retake" : "PYQ test") + ' in progress">' +
      '<div class="pq-top"><span class="pq-qn">' + (S.retake ? "Retake · " : "") + "Question " + (S.i + 1) + " of " + N + '</span><span class="pq-ans">' + answered() + ' answered</span><span class="pq-clock' + (left() <= 60 ? " warn" : "") + '" aria-hidden="true">⏱ ' + mmss(left()) + "</span></div>" +
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
    var N = S.Q.length, used = Math.min(S.secs, Math.round((Date.now() - S.t0) / 1000)), ok = 0, tried = 0, by = {};
    S.Q.forEach(function (x, k) {
      var u = x.u || "", b = by[u] || (by[u] = { ok: 0, n: 0 }); b.n++;
      if (S.ans[k] > -1) { tried++; if (S.ans[k] === x.a) { ok++; b.ok++; } }
    });
    var prev = null, pb = false;
    if (!S.retake) {                                /* retakes never touch the best score or the seen list */
      var d = get(KEY) || {}, key = bkey(N); prev = d[key]; var n = (prev && prev.n || 0) + 1; pb = !prev || ok > prev.best;
      d[key] = { best: pb ? ok : prev.best, n: n, last: ok }; put(KEY, d); commitSeen(); pb = pb && n > 1;
    }
    S.res = { ok: ok, wrong: tried - ok, skip: N - tried, sec: used, timeUp: !!timeUp, pb: pb, prevBest: prev && prev.best, filter: "all", by: by, retake: S.retake, total: S.secs };
    paintResult(); toTop();
    say((timeUp ? "Time is up. " : "Test submitted. ") + "You scored " + ok + " out of " + N + ".");
  }

  function missed() { return S.Q.filter(function (x, k) { return S.ans[k] !== x.a; }); }

  function paintResult() {
    var r = S.res, N = S.Q.length, pct = Math.round(r.ok / N * 100), miss = r.wrong + r.skip;
    var msg = pct >= 85 ? "Outstanding. You are performing at exam-ready level." : pct >= 65 ? "Strong result. Revise the weaker units below, then take another shuffle." : pct >= 40 ? "A solid start. Go through the unit list and the review below, revise, then retake." : "Every attempt builds recall. Study the answers below, then try again.";
    var rows = Object.keys(r.by).filter(function (u) { return u && UN[u] && r.by[u].n; }).map(function (u) { return { u: u, ok: r.by[u].ok, n: r.by[u].n }; })
      .sort(function (a, b) { return a.ok / a.n - b.ok / b.n || b.n - a.n; });
    var units = rows.length ? '<h3 class="pq-h4">Where to focus next</h3><ul class="pq-units">' + rows.map(function (x) {
      var c = x.ok === x.n ? " hi" : x.ok === 0 ? " lo" : "";
      return '<li class="' + c.trim() + '"><span class="un"><span>' + esc(uname(x.u)) + ' <i>' + group(x.u) + "</i></span>" +
        (x.ok < x.n ? '<a href="' + UN[x.u][1] + '">Revise this unit →</a>' : "") + '</span><span class="n">' + x.ok + "/" + x.n + "</span></li>";
    }).join("") + "</ul>" : "";
    var cnt = { all: N, bad: r.wrong, skip: r.skip };
    var items = S.Q.map(function (x, k) {
      var a = S.ans[k], good = a === x.a, cls = good ? "ok" : a < 0 ? "sk" : "no";
      if (r.filter === "bad" && (a < 0 || good)) return "";
      if (r.filter === "skip" && a > -1) return "";
      return '<div class="pq-r ' + cls + '"><p class="v">' + (k + 1) + ". " + (good ? "CORRECT" : a < 0 ? "NOT ANSWERED" : "INCORRECT") + '</p><p class="t">' + esc(x.q) + "</p>" +
        (good ? "" : "<p>Your answer: " + (a < 0 ? "none" : esc(x.o[a])) + "</p>") + "<p><b>Correct answer: " + esc(x.o[x.a]) + "</b></p>" +
        (x.e ? '<p class="e">' + esc(x.e) + "</p>" : "") +
        (x.n ? '<p class="nt"><b>Note on this question:</b> ' + esc(x.n) + "</p>" : "") +
        '<p class="src">' + (uname(x.u) ? esc(uname(x.u)) + " · " : "") + esc(x.s) + "</p>" +
        (window.NLReport || window.NLShare ? "<p>" + (window.NLReport ? NLReport.btn(x, "PYQ test (" + x.s + ") - Q" + (k + 1)) : "") + (window.NLShare ? " " + NLShare.btn(function () { return NLShare.make.question(x, "UGC NET Law PYQ"); }, { icon: 1, aria: "Share this question" }) : "") + "</p>" : "") + "</div>";
    }).join("");
    var open = host.querySelector("details") && host.querySelector("details").open;
    host.innerHTML = '<section class="pq" role="group" aria-label="PYQ ' + (r.retake ? "retake" : "test") + ' result">' +
      '<span class="pq-tag">' + (r.timeUp ? "TIME&#39;S UP" : r.retake ? "RETAKE COMPLETE" : "TEST COMPLETE") + " &middot; " + N + " QUESTIONS</span>" +
      '<div class="pq-score" role="status"><b>' + r.ok + "</b><span> / " + N + " &middot; " + pct + "%</span></div>" +
      (r.pb ? '<p class="pq-pb">New personal best at ' + N + " questions!</p>" : r.prevBest != null ? '<p class="pq-pb">Your best at ' + N + ": " + Math.max(r.prevBest, r.ok) + "/" + N + "</p>" : "") +
      '<div class="pq-chips"><span>' + r.ok + " correct</span><span>" + r.wrong + " wrong</span><span>" + r.skip + " skipped</span><span>Time " + mmss(r.sec) + " of " + mmss(r.total) + "</span><span>" + (r.sec / N).toFixed(0) + " s per question</span></div>" +
      '<p class="pq-msg">' + msg + "</p>" + units +
      '<details class="pq-det"' + (open || r.filter !== "all" ? " open" : "") + '><summary>Review all answers</summary><div class="pq-sw" role="group" aria-label="Which answers to review">' +
      '<button type="button" data-f="all" aria-pressed="' + (r.filter === "all") + '">All (' + cnt.all + ')</button><button type="button" data-f="bad" aria-pressed="' + (r.filter === "bad") + '">Wrong (' + cnt.bad + ')</button><button type="button" data-f="skip" aria-pressed="' + (r.filter === "skip") + '">Skipped (' + cnt.skip + ")</button></div>" +
      (items || '<p class="pq-msg">Nothing here. Well done.</p>') + "</details>" +
      '<div class="pq-f">' + (miss ? '<button type="button" class="pq-btn pri" data-a="retake">Retake my wrong ones (' + miss + ")</button>" : "") +
      '<button type="button" class="pq-btn' + (miss ? "" : " pri") + '" data-a="again">New shuffled test</button><button type="button" class="pq-btn" data-a="change">Change length or clock</button><button type="button" class="pq-btn" data-a="share">Share my score</button></div>' +
      '<p class="pq-foot">' + (miss ? "“Wrong ones” means wrong and skipped, reshuffled, on the same clock. " : "") + (r.retake ? "Retakes do not change your best score. " : "") + "Scores are kept on this device only.</p></section>";
  }

  function share(opener) {
    var r = S.res, N = S.Q.length, pc = Math.round(r.ok / N * 100);
    if (window.NLShare) {
      NLShare.open(NLShare.make.score({ what: "UGC NET Law " + N + "-question PYQ " + (r.retake ? "retake" : "test"), score: r.ok + "/" + N, pct: pc, correct: r.ok, wrong: r.wrong, time: mmss(r.sec), kind: "quiz", url: location.href.split("#")[0], chips: [r.ok + " correct", r.wrong + " wrong", mmss(r.sec)] }), opener);
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
    else if (a === "retake") { var m = missed(); if (m.length) begin(shuffle(m), true, 0); }
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
    if (e.target.name === "pq-n") { S.N = +e.target.value; refreshIdle(); return; }
    if (e.target.name === "pq-p") { S.pace = e.target.value; refreshIdle(); return; }
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

  /* ?n=20|50|100 and ?pace=half|exam in the link pre-select the setup (e.g. from the home page) */
  try { var qs = new URLSearchParams(location.search), qn = +qs.get("n"), qp = qs.get("pace"); if (LENS.indexOf(qn) > -1) S.N = qn; if (PACES[qp]) S.pace = qp; } catch (e) {}
  paintIdle();
  load().then(function () { if (S.mode === "idle") paintIdle(); }).catch(function () {});   /* warm the data so Start is instant */
})();
