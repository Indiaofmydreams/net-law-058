/* nl-test.js: "Test Your UGC NET Law Preparation" card on the home page.
   A 20-question, 7-minute, Law-only test that runs INSIDE the card (no pop-up, no new page).

   How it works
   - Questions come from the same bank as the rest of the site (window.loadBank), Law 058 units only. Paper 1 is excluded.
   - Every test is freshly shuffled: 2 random questions from each of the 10 Law units (20 in all, like a mini exam),
     then the order is mixed. Questions already used in this visit are avoided until the bank runs out.
   - 7:00 countdown. At 0:00 the test is submitted automatically.
   - Answers are saved to the student's progress (NLNav.prog) when the test ends, so "Mistakes", "Unanswered" and the
     daily goal in Practice questions stay in step. Best score and attempts are kept on the device only (localStorage).
   To change the length or time, edit N, PER and SECS below. */
(function () {
  "use strict";
  var host = document.getElementById("nl-test"); if (!host) return;

  var LAW = [
    ["Jurisprudence", "Jurisprudence"],
    ["Constitutional and Administrative Law", "Constitutional & Administrative Law"],
    ["Public International Law and IHL", "Public International Law & IHL"],
    ["Law of Crimes", "Law of Crimes"],
    ["Law of Torts and Consumer Protection", "Torts & Consumer Protection"],
    ["Commercial Law", "Commercial Law"],
    ["Family Law", "Family Law"],
    ["Environment and Human Rights Law", "Environment & Human Rights"],
    ["Intellectual Property Rights and Information Technology Law", "IPR & IT Law"],
    ["Comparative Public Law and Systems of Governance", "Comparative Public Law"]
  ];
  var PER = 2, N = LAW.length * PER, SECS = 420, MIN = SECS / 60, PACE = Math.round(SECS / N), KEY = "netlaw058-test20-v1";
  var doc = document, say = function (m) { if (window.announce) window.announce(m); };
  var S = { mode: "idle", by: null, loading: null, seen: [], Q: [], ans: [], i: 0, end: 0, t0: 0, tick: 0, said: {}, confirm: false, res: null };

  /* ---------- styles (theme variables, rem units: follows the site's text-size and colour controls) ---------- */
  var css = [
    ".hero-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;align-items:stretch}",
    ".hero-row #nl-countdown{display:flex;min-width:0}.hero-row #nl-countdown:empty{display:none}.hero-row:has(#nl-countdown:empty) #nl-test{grid-column:1/-1}",
    ".hero-row .nl-cd{width:100%;max-width:none;margin:0;padding:16px 22px;display:flex;flex-direction:column;justify-content:center;border-radius:20px;border-top:4px solid var(--ac2);box-shadow:0 10px 28px color-mix(in srgb,var(--deep) 10%,transparent)}",
    ".hero-row .nl-cd-t{justify-content:center;text-align:center;flex-direction:column;align-items:center;gap:4px}.hero-row .nl-cd-t b{font-size:1.25rem;font-weight:800;letter-spacing:.02em}.hero-row .nl-cd-g{gap:10px;margin-top:12px}.hero-row .nl-cd-g div{padding:12px 4px}.hero-row .nl-cd-g strong{font-size:2rem}",
    ".hero-row #nl-test{min-width:0;display:flex}.hero-row #nl-test>.nlt{width:100%}",
    ".hero-row.is-live #nl-countdown{display:none}.hero-row.is-live #nl-test{grid-column:1/-1;justify-content:center}.hero-row.is-live #nl-test>.nlt{max-width:860px}",
    "@media(max-width:900px){.hero-row{grid-template-columns:1fr}.hero-row .nl-cd-g strong{font-size:1.9rem}}",
    "@media(max-width:420px){.hero-row .nl-cd{padding:16px 14px}.hero-row .nl-cd-g strong{font-size:1.5rem}}",
    ".nlt{position:relative;scroll-margin-top:96px;display:flex;flex-direction:column;justify-content:center;padding:14px 22px 12px;color:var(--text);background:linear-gradient(135deg,var(--tint),var(--surface) 62%);border:1px solid var(--ac2);border-top:4px solid var(--ac);border-radius:20px;box-shadow:0 10px 28px color-mix(in srgb,var(--deep) 10%,transparent)}",
    ".nlt-tag{align-self:flex-start;display:inline-block;padding:5px 12px;border-radius:999px;background:var(--surface);color:var(--ac-d);font-size:.6875rem;font-weight:800;letter-spacing:.07em;border:1px solid var(--line2)}",
    ".nlt h3{margin:8px 0 2px;font-size:clamp(1.2rem,2vw,1.45rem);line-height:1.2;letter-spacing:-.02em;font-weight:800}",
    ".nlt-lead{margin:0;font-size:.9375rem;font-weight:700;color:var(--ac-d)}",
    ".nlt-why{margin:6px 0 0;font-size:.8125rem;line-height:1.5;color:var(--text2)}",
    ".nlt-facts{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 0;padding:0;list-style:none}.nlt-facts li{padding:6px 12px;border-radius:99px;background:var(--surface);border:1px solid var(--line2);font-size:.8125rem;font-weight:700}",
    ".nlt-cta{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;margin-top:10px}",
    ".nlt-best{font-size:.8125rem;font-weight:700;color:var(--text2)}",
    ".nlt-foot{margin:6px 0 0;font-size:.71875rem;line-height:1.4;color:var(--mut)}",
    ".nlt-btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 20px;border:1px solid var(--line2);background:var(--surface);color:var(--text);border-radius:12px;font:inherit;font-size:.875rem;font-weight:700;cursor:pointer;text-decoration:none}",
    ".nlt-btn:hover:not(:disabled){border-color:var(--ac)}.nlt-btn:disabled{opacity:.45;cursor:not-allowed}",
    ".nlt-btn.pri{background:var(--btn,var(--ac));border-color:var(--btn,var(--ac));color:var(--nl-on,#fff)}",
    ".nlt-btn:focus-visible,.nlt-pal button:focus-visible,.nlt-link:focus-visible,.nlt-sw button:focus-visible,.nlt summary:focus-visible{outline:3px solid var(--ac);outline-offset:2px}",
    ".nlt-top{display:flex;align-items:center;gap:10px;font-size:.8125rem;color:var(--text2)}.nlt-qn{font-weight:800;color:var(--text)}.nlt-ans{flex:1}",
    ".nlt-clock{padding:4px 12px;border-radius:99px;background:var(--surface);border:1px solid var(--line2);font:800 .9375rem/1.4 system-ui,sans-serif;font-variant-numeric:tabular-nums;color:var(--text)}",
    ".nlt-clock.warn{background:var(--bad-bg,#fdf1f1);border-color:var(--bad-text,#9b2c2c);color:var(--bad-text,#9b2c2c)}",
    ".nlt-bar{height:6px;margin:10px 0 0;border-radius:99px;background:var(--chip);overflow:hidden}.nlt-bar i{display:block;height:100%;background:var(--ac);transition:width .25s}",
    ".nlt-q{margin:16px 0 12px;font-size:1.0625rem;font-weight:700;line-height:1.45;white-space:pre-line}",
    ".nlt-o{border:0;margin:0;padding:0;display:grid;gap:8px;min-width:0}.nlt-o legend{position:absolute;left:-9999px}",
    ".nlt-op{position:relative;display:flex;align-items:flex-start;min-height:48px;padding:12px 14px;border:1px solid var(--line2);border-radius:12px;background:var(--surface);cursor:pointer;line-height:1.4;font-size:.9375rem;transition:background .15s,border-color .15s}",
    ".nlt-op:hover{border-color:var(--ac)}.nlt-op input{position:absolute;opacity:0;inset:0;width:100%;height:100%;margin:0;cursor:pointer}",
    ".nlt-op:has(input:checked){background:var(--tint);border-color:var(--ac);box-shadow:inset 0 0 0 1px var(--ac)}.nlt-op:has(input:focus-visible){outline:3px solid var(--ac);outline-offset:2px}",
    ".nlt-f{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:14px}.nlt-f .sp{flex:1}",
    ".nlt-warn{flex:1 1 100%;margin:0;font-size:.875rem;font-weight:700}",
    ".nlt-pal{display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:6px;margin-top:14px}.nlt-pal button{width:100%;min-width:0;height:36px;padding:0;border:1px solid var(--line2);border-radius:9px;background:var(--surface);color:var(--text2);font:700 .8125rem system-ui,sans-serif;cursor:pointer}",
    ".nlt-pal button.a{background:var(--tint);border-color:var(--ac);color:var(--ac-d)}.nlt-pal button.c{background:var(--btn,var(--ac));border-color:var(--btn,var(--ac));color:var(--nl-on,#fff)}",
    ".nlt-hint{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 12px;margin:12px 0 0;font-size:.71875rem;color:var(--mut)}",
    ".nlt-link{padding:0;border:0;background:none;color:var(--ac-d);font:inherit;font-weight:700;text-decoration:underline;cursor:pointer}",
    ".nlt-score{margin:14px 0 2px;text-align:center}.nlt-score b{font-size:3.25rem;line-height:1;letter-spacing:-.03em}.nlt-score span{font-size:1.1rem;color:var(--text2)}",
    ".nlt-pb{margin:4px 0 0;text-align:center;font-size:.8125rem;font-weight:800;color:var(--ac-d)}",
    ".nlt-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:10px 0 0}.nlt-chips span{padding:6px 12px;border-radius:99px;background:var(--surface);border:1px solid var(--line2);font-size:.8125rem;font-weight:700}",
    ".nlt-msg{margin:12px 0 0;text-align:center;font-size:.9375rem;color:var(--text2)}",
    ".nlt-h4{margin:16px 0 8px;font-size:.8125rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--text2)}",
    ".nlt-units{list-style:none;margin:0;padding:0;display:grid;gap:6px}.nlt-units li{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 12px;border-radius:10px;background:var(--surface);border:1px solid var(--line);font-size:.8125rem;font-weight:600}",
    ".nlt-units .n{font-weight:800;white-space:nowrap}.nlt-units .lo{border-color:var(--bad-text,#9b2c2c)}.nlt-units .lo .n{color:var(--bad-text,#9b2c2c)}.nlt-units .hi .n{color:var(--ok-text,#1f5c3b)}",
    ".nlt details{margin-top:14px}.nlt summary{min-height:44px;display:flex;align-items:center;font-size:.875rem;font-weight:800;cursor:pointer}",
    ".nlt-sw{display:flex;gap:8px;margin:4px 0 10px}.nlt-sw button{min-height:40px;padding:0 14px;border:1px solid var(--line2);background:var(--surface);color:var(--text2);border-radius:99px;font:inherit;font-size:.8125rem;font-weight:700;cursor:pointer}.nlt-sw button[aria-pressed=true]{background:var(--btn,var(--ac));border-color:var(--btn,var(--ac));color:var(--nl-on,#fff)}",
    ".nlt-r{margin:0 0 10px;padding:12px 14px;border:1px solid var(--line);border-radius:14px;background:var(--surface)}.nlt-r p{margin:4px 0;font-size:.875rem}.nlt-r .t{font-weight:700;white-space:pre-line}.nlt-r .v{font-size:.75rem;font-weight:800;letter-spacing:.03em}.nlt-r .e{color:var(--text2)}",
    ".nlt-r.ok{box-shadow:inset 4px 0 0 var(--ok,#2f6f58)}.nlt-r.no{box-shadow:inset 4px 0 0 var(--bad-text,#9b2c2c)}",
    "@media(max-width:560px){.nlt{padding:16px 14px}.nlt-btn{padding:0 14px}.nlt-cta .nlt-btn{width:100%}}",
    "@media(prefers-reduced-motion:reduce){.nlt-bar i,.nlt-op{transition:none}}"
  ].join("");
  var st = doc.createElement("style"); st.textContent = css; doc.head.appendChild(st);

  /* ---------- helpers ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function mmss(sec) { sec = Math.max(0, Math.round(sec)); var m = Math.floor(sec / 60), s = sec % 60; return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function store(v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(KEY) || "null"); localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { return null; } }
  function left() { return Math.max(0, Math.ceil((S.end - Date.now()) / 1000)); }
  function answered() { return S.ans.filter(function (a) { return a > -1; }).length; }
  function reduced() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function toTop() { host.firstElementChild && host.firstElementChild.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" }); }

  /* ---------- question bank ---------- */
  function load() {
    if (S.by) return Promise.resolve(S.by);
    if (S.loading) return S.loading;
    if (!window.loadBank) return Promise.reject(new Error("no bank"));
    return (S.loading = window.loadBank().then(function (bank) {
      var by = {}, dup = {}; LAW.forEach(function (u) { by[u[0]] = []; });
      bank.forEach(function (x) {
        if (!by.hasOwnProperty(x.u)) return;                       /* Law units only: Paper 1 is skipped */
        var k = String(x.q).replace(/\s+/g, " ").trim().toLowerCase(); if (dup[k]) return; dup[k] = 1;
        by[x.u].push(x);
      });
      S.by = by; return by;
    }).catch(function (e) { S.loading = null; throw e; }));
  }
  function draw() {                                                /* PER random questions per unit, fresh ones first, then mixed */
    var out = [];
    LAW.forEach(function (u) {
      var arr = S.by[u[0]], fresh = shuffle(arr.filter(function (x) { return S.seen.indexOf(x) < 0; })), old = shuffle(arr.filter(function (x) { return S.seen.indexOf(x) > -1; }));
      out = out.concat(fresh.concat(old).slice(0, PER));
    });
    if (out.length < N) {                                          /* a unit with too few questions: top up from the rest of the Law bank */
      var rest = []; LAW.forEach(function (u) { rest = rest.concat(S.by[u[0]].filter(function (x) { return out.indexOf(x) < 0; })); });
      out = out.concat(shuffle(rest).slice(0, N - out.length));
    }
    out.forEach(function (x) { S.seen.push(x); });
    return shuffle(out);
  }

  /* ---------- screens ---------- */
  function live(on) { var row = host.parentNode; row && row.classList && row.classList.toggle("is-live", !!on); }
  function paintIdle(msg) {
    S.mode = "idle"; clearInterval(S.tick); live(false);
    var d = store(), best = d && d.best != null ? '<span class="nlt-best">Your best: ' + d.best + "/" + N + " &middot; " + d.n + " attempt" + (d.n === 1 ? "" : "s") + "</span>" : "";
    host.innerHTML = '<section class="nlt" aria-labelledby="nlt-h">' +
      '<span class="nlt-tag">FREE &middot; ' + MIN + '-MINUTE CHALLENGE</span>' +
      '<h3 id="nlt-h">Test Your UGC NET Law Preparation</h3>' +
      '<p class="nlt-lead">' + N + ' MCQs. ' + MIN + ' minutes. See where you really stand.</p>' +
      '<p class="nlt-why">Check your <b>speed and accuracy</b> under time pressure, about ' + PACE + ' seconds a question. Two from each of the 10 Law units, fresh every time.</p>' +
      '<ul class="nlt-facts"><li>' + N + ' questions</li><li>' + MIN + ' minutes</li><li>Law only</li><li>Instant score</li></ul>' +
      '<div class="nlt-cta"><button type="button" class="nlt-btn pri" data-a="start">Start the test \u2192</button>' + best + "</div>" +
      (msg ? '<p class="nlt-foot" role="alert">' + esc(msg) + "</p>" : '<p class="nlt-foot">No sign-up. No negative marking. Not affiliated with NTA or UGC.</p>') + "</section>";
  }

  function start(btn) {
    if (btn) { btn.disabled = true; btn.textContent = "Loading questions\u2026"; }
    load().then(function () {
      S.Q = draw(); S.ans = S.Q.map(function () { return -1; }); S.i = 0; S.confirm = false; S.res = null; S.said = {};
      S.t0 = Date.now(); S.end = S.t0 + SECS * 1000; S.mode = "run";
      clearInterval(S.tick); S.tick = setInterval(onTick, 250);
      paintRun(true); toTop(); say("Test started. " + N + " questions, " + MIN + " minutes.");
    }).catch(function () { paintIdle("Could not load the questions. Check your connection and refresh the page."); });
  }

  function paintRun(focus) {
    live(true);
    var x = S.Q[S.i], last = S.i === N - 1, un = N - answered();
    host.innerHTML = '<section class="nlt" role="group" aria-label="Law test in progress">' +
      '<div class="nlt-top"><span class="nlt-qn">Question ' + (S.i + 1) + " of " + N + '</span><span class="nlt-ans">' + answered() + ' answered</span><span class="nlt-clock' + (left() <= 60 ? " warn" : "") + '" aria-hidden="true">\u23F1 ' + mmss(left()) + "</span></div>" +
      '<div class="nlt-bar" role="progressbar" aria-label="Test progress" aria-valuemin="0" aria-valuemax="' + N + '" aria-valuenow="' + (S.i + 1) + '"><i style="width:' + ((S.i + 1) / N * 100) + '%"></i></div>' +
      '<p class="nlt-q" id="nlt-q">' + esc(x.q) + "</p>" +
      '<fieldset class="nlt-o" aria-labelledby="nlt-q"><legend>Choose one answer</legend>' +
      x.o.map(function (t, k) { return '<label class="nlt-op"><input type="radio" name="nlt" value="' + k + '"' + (S.ans[S.i] === k ? " checked" : "") + "><span>" + esc(t) + "</span></label>"; }).join("") + "</fieldset>" +
      '<div class="nlt-f"><button type="button" class="nlt-btn" data-a="prev"' + (S.i ? "" : " disabled") + '>\u2039 Previous</button><span class="sp"></span>' +
      (last ? '<button type="button" class="nlt-btn pri" data-a="finish">Submit test</button>' : '<button type="button" class="nlt-btn pri" data-a="next">Next \u203A</button>') + "</div>" +
      (S.confirm ? '<div class="nlt-f"><p class="nlt-warn" role="alert">' + un + " question" + (un === 1 ? "" : "s") + ' not answered. Submit anyway?</p><button type="button" class="nlt-btn" data-a="back">Keep going</button><button type="button" class="nlt-btn pri" data-a="submit">Submit anyway</button></div>' : "") +
      '<div class="nlt-pal" role="group" aria-label="Jump to a question">' + S.Q.map(function (_, k) {
        var a = S.ans[k] > -1;
        return '<button type="button" data-g="' + k + '" class="' + (a ? "a" : "") + (k === S.i ? " c" : "") + '" aria-label="Question ' + (k + 1) + (a ? ", answered" : ", not answered") + '"' + (k === S.i ? ' aria-current="true"' : "") + ">" + (k + 1) + "</button>";
      }).join("") + "</div>" +
      '<p class="nlt-hint"><span>Keys: A\u2013D or 1\u20134 choose \u00B7 N next \u00B7 P previous</span>' + (last ? "" : '<button type="button" class="nlt-link" data-a="finish">Submit early</button>') + '<button type="button" class="nlt-link" data-a="quit">Quit test</button></p></section>';
    if (focus) { var f = host.querySelector("input:checked") || host.querySelector("input"); f && f.focus({ preventScroll: true }); }
  }

  function onTick() {
    var l = left(), c = host.querySelector(".nlt-clock");
    if (c) { c.textContent = "\u23F1 " + mmss(l); c.classList.toggle("warn", l <= 60); }
    [[300, "5 minutes left."], [60, "1 minute left."], [30, "30 seconds left."]].forEach(function (m) { if (l <= m[0] && !S.said[m[0]] && l > 0) { S.said[m[0]] = 1; say(m[1]); } });
    if (l <= 0) finish(true);
  }

  function finish(timeUp) {
    if (S.mode !== "run") return;
    clearInterval(S.tick); S.mode = "result";
    var used = Math.min(SECS, Math.round((Date.now() - S.t0) / 1000)), ok = 0, pairs = [], by = {};
    LAW.forEach(function (u) { by[u[0]] = { ok: 0, n: 0 }; });
    S.Q.forEach(function (x, k) {
      by[x.u].n++; if (S.ans[k] > -1) { pairs.push([x, S.ans[k]]); if (S.ans[k] === x.a) { ok++; by[x.u].ok++; } }
    });
    try { if (pairs.length && window.NLNav && NLNav.prog) NLNav.prog.setMany(pairs); } catch (e) {}
    var prev = store(), n = (prev && prev.n || 0) + 1, pb = !prev || prev.best == null || ok > prev.best;
    store({ best: pb ? ok : prev.best, n: n, last: ok });
    S.res = { ok: ok, wrong: pairs.length - ok, skip: N - pairs.length, sec: used, by: by, timeUp: !!timeUp, pb: pb && n > 1, prevBest: prev && prev.best, filter: "all" };
    paintResult(); toTop();
    say((timeUp ? "Time is up. " : "Test submitted. ") + "You scored " + ok + " out of " + N + ".");
  }

  function paintResult() {
    live(true);
    var r = S.res, pct = Math.round(r.ok / N * 100);
    var msg = pct >= 85 ? "Outstanding. You are performing at exam-ready level." : pct >= 65 ? "Strong result. A little revision of the weaker units will push you higher." : pct >= 40 ? "A solid start. Revise the units flagged below, then retake." : "Every attempt builds recall. Study the answers below, then try again.";
    var rows = LAW.map(function (u) { return { name: u[1], ok: r.by[u[0]].ok, n: r.by[u[0]].n }; }).filter(function (u) { return u.n; }).sort(function (a, b) { return a.ok / a.n - b.ok / b.n; });
    var items = S.Q.map(function (x, k) {
      var a = S.ans[k], good = a === x.a; if (r.filter === "bad" && good) return "";
      return '<div class="nlt-r ' + (good ? "ok" : "no") + '"><p class="v">' + (k + 1) + ". " + (good ? "CORRECT" : a < 0 ? "NOT ANSWERED" : "INCORRECT") + '</p><p class="t">' + esc(x.q) + "</p>" +
        (good ? "" : "<p>Your answer: " + (a < 0 ? "none" : esc(x.o[a])) + "</p>") + "<p><b>Correct answer: " + esc(x.o[x.a]) + "</b></p>" + (x.e ? '<p class="e">' + esc(x.e) + "</p>" : "") + "</div>";
    }).join("");
    var open = host.querySelector("details") && host.querySelector("details").open;
    host.innerHTML = '<section class="nlt" role="group" aria-label="Law test result">' +
      '<span class="nlt-tag">' + (r.timeUp ? "TIME&#39;S UP" : "TEST COMPLETE") + "</span>" +
      '<div class="nlt-score" role="status"><b>' + r.ok + "</b><span> / " + N + " &middot; " + pct + "%</span></div>" +
      (r.pb ? '<p class="nlt-pb">New personal best!</p>' : r.prevBest != null ? '<p class="nlt-pb">Your best: ' + Math.max(r.prevBest, r.ok) + "/" + N + "</p>" : "") +
      '<div class="nlt-chips"><span>' + r.ok + " correct</span><span>" + r.wrong + " wrong</span><span>" + r.skip + " skipped</span><span>Time " + mmss(r.sec) + "</span><span>" + (r.sec / N).toFixed(0) + " s per question</span></div>" +
      '<p class="nlt-msg">' + msg + "</p>" +
      '<h4 class="nlt-h4">Where to focus next</h4><ul class="nlt-units">' + rows.map(function (u) { var c = u.ok === u.n ? " hi" : u.ok === 0 ? " lo" : ""; return '<li class="' + c.trim() + '"><span>' + esc(u.name) + '</span><span class="n">' + u.ok + "/" + u.n + "</span></li>"; }).join("") + "</ul>" +
      '<details' + (open ? " open" : "") + '><summary>Review all answers</summary><div class="nlt-sw" role="group" aria-label="Which answers to review"><button type="button" data-f="all" aria-pressed="' + (r.filter === "all") + '">All answers</button><button type="button" data-f="bad" aria-pressed="' + (r.filter === "bad") + '">Wrong or skipped</button></div>' +
      (items || '<p class="nlt-msg">Nothing to review. Every answer was correct.</p>') + "</details>" +
      '<div class="nlt-f"><button type="button" class="nlt-btn pri" data-a="again">Take a new test</button><button type="button" class="nlt-btn" data-a="share">Share my score</button><a class="nlt-btn" href="#mcqs">Practise more MCQs</a></div>' +
      '<p class="nlt-foot" id="nlt-note">Your answers are saved to your practice progress on this device.</p></section>';
  }

  function share() {
    var r = S.res, text = "I scored " + r.ok + "/" + N + " in " + mmss(r.sec) + " on the UGC NET Law 20-MCQ test. Can you beat it? Try it free:", url = location.href.split("#")[0] + "#home";
    var note = host.querySelector("#nlt-note");
    if (navigator.share) { navigator.share({ title: "UGC NET Law test", text: text, url: url }).catch(function () {}); return; }
    window.open("https://wa.me/?text=" + encodeURIComponent(text + " " + url), "_blank", "noopener");
    if (note) note.textContent = "Opening WhatsApp so you can share your score.";
  }

  /* ---------- events (one set of listeners, delegated) ---------- */
  host.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.f) { S.res.filter = b.dataset.f; paintResult(); var d = host.querySelector("details"); d && (d.open = true); return; }
    if (b.dataset.g != null) { S.i = +b.dataset.g; S.confirm = false; paintRun(true); return; }
    var a = b.dataset.a; if (!a) return;
    if (a === "start" || a === "again") start(b);
    else if (a === "next") { S.i = Math.min(N - 1, S.i + 1); S.confirm = false; paintRun(true); }
    else if (a === "prev") { S.i = Math.max(0, S.i - 1); S.confirm = false; paintRun(true); }
    else if (a === "finish") { if (answered() < N) { S.confirm = true; paintRun(false); var s = host.querySelector('[data-a="submit"]'); s && s.focus(); } else finish(false); }
    else if (a === "submit") finish(false);
    else if (a === "back") { S.confirm = false; paintRun(true); }
    else if (a === "quit") { if (window.confirm("Quit this test? Your answers will not be saved.")) { say("Test cancelled."); paintIdle(); var sb = host.querySelector('[data-a="start"]'); sb && sb.focus({ preventScroll: true }); } }
    else if (a === "share") share();
  });
  host.addEventListener("change", function (e) {
    if (e.target.name !== "nlt") return;
    S.ans[S.i] = +e.target.value;
    var m = host.querySelector(".nlt-ans"); if (m) m.textContent = answered() + " answered";
    var p = host.querySelector('.nlt-pal [data-g="' + S.i + '"]'); if (p) { p.classList.add("a"); p.setAttribute("aria-label", "Question " + (S.i + 1) + ", answered"); }
  });
  host.addEventListener("keydown", function (e) {
    if (S.mode !== "run" || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key.toLowerCase(), idx = "abcd".indexOf(k); if (idx < 0 && k >= "1" && k <= "4") idx = +k - 1;
    if (idx > -1 && k.length === 1) { var inp = host.querySelectorAll('input[name="nlt"]')[idx]; if (inp) { inp.checked = true; inp.dispatchEvent(new Event("change", { bubbles: true })); inp.focus({ preventScroll: true }); e.preventDefault(); } }
    else if (k === "n") { var nx = host.querySelector('[data-a="next"]'); nx && nx.click(); }
    else if (k === "p") { var pv = host.querySelector('[data-a="prev"]'); pv && !pv.disabled && pv.click(); }
  });

  paintIdle();
  load().catch(function () {});                                    /* warm the bank so Start is instant */
})();
