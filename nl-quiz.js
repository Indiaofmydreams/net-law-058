/* nl-quiz.js: "Random 20 quiz" with a score and answer review.
   NLQuiz.start({ title, pool, n = 20, opener, onClose, questions, seconds, heading, onFinish })
     questions : (optional) a fixed list to ask instead of a random draw, e.g. the daily quiz
     seconds   : (optional) countdown limit; the quiz is submitted automatically at 00:00
     heading   : (optional) replaces the default "Random N quiz" heading
     onFinish  : (optional) called with ({ok, wrong, skip, ms}, total) when the quiz is scored
     pool   : array of questions in the site format {q, o:[4 options], a:index, e:explanation}
     opener : the button that opened it (focus returns there)
   Answers are saved to the student's progress (NLNav.prog) only when the quiz is finished, so Mistakes,
   Unanswered and the daily goal all stay in step. Nothing is sent anywhere. */
(function () {
  "use strict";
  if (window.NLQuiz) return;
  var doc = document, say = function (m) { if (window.announce) window.announce(m); };
  var seen = {};                                          /* per source: questions already used, so "New quiz" avoids repeats */

  var css = [
    ".nlq-ov{position:fixed;inset:0;z-index:60;display:flex;align-items:flex-start;justify-content:center;padding:max(12px,env(safe-area-inset-top)) 12px max(12px,env(safe-area-inset-bottom));background:rgba(10,18,16,.62);overflow-y:auto;-webkit-overflow-scrolling:touch}",
    ".nlq-box{width:min(720px,100%);margin:auto;background:var(--surface,var(--sf,#fff));color:var(--text,var(--tx,#1e3138));border:1px solid var(--line,var(--ln,#e1ebe7));border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.35);padding:18px 18px 16px}",
    ".nlq-h{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.nlq-h h2{margin:0;font-size:1.15rem}.nlq-h p{margin:2px 0 0;font-size:.8125rem;color:var(--mut,var(--mu,#5b6670))}",
    ".nlq-x{flex:none;width:44px;height:44px;margin:-6px -6px 0 0;border:0;background:none;color:var(--mut,var(--mu,#5b6670));font-size:1.2rem;cursor:pointer;border-radius:10px}",
    ".nlq-meta{display:flex;justify-content:space-between;gap:10px;margin:12px 0 6px;font-size:.8125rem;color:var(--mut,var(--mu,#5b6670))}",
    ".nlq-bar{height:6px;border-radius:99px;background:var(--chip,#e8eeec);overflow:hidden}.nlq-bar i{display:block;height:100%;width:0;background:var(--ok,var(--ac,#2d4aa9));transition:width .25s}",
    ".nlq-q{margin:16px 0 12px;font-size:1.05rem;font-weight:700;line-height:1.45;white-space:pre-line}",
    ".nlq-o{border:0;margin:0;padding:0;display:grid;gap:8px}.nlq-o legend{position:absolute;left:-9999px}",
    ".nlq-op{position:relative;display:flex;gap:10px;align-items:flex-start;min-height:48px;padding:12px 14px;border:1px solid var(--line,var(--ln,#e1ebe7));border-radius:12px;cursor:pointer;line-height:1.4;transition:background .15s,border-color .15s}",
    ".nlq-op:hover{border-color:var(--ac,#2d4aa9)}.nlq-op input{position:absolute;opacity:0;inset:0;width:100%;height:100%;margin:0;cursor:pointer}",
    ".nlq-op:has(input:checked){background:var(--tint,#e3e8fb);border-color:var(--ac,#2d4aa9);box-shadow:inset 0 0 0 1px var(--ac,#2d4aa9)}.nlq-op:has(input:focus-visible){outline:3px solid var(--ac,#2d4aa9);outline-offset:2px}",
    ".nlq-f{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:16px}.nlq-f .sp{flex:1}",
    ".nlq-b{min-height:44px;padding:0 18px;border:1px solid var(--line,var(--ln,#e1ebe7));background:var(--surface,var(--sf,#fff));color:inherit;border-radius:12px;font:inherit;font-size:.875rem;font-weight:700;cursor:pointer}.nlq-b:hover:not(:disabled){border-color:var(--ac,#2d4aa9)}.nlq-b:disabled{opacity:.45;cursor:not-allowed}",
    ".nlq-b.pri{background:var(--btn,var(--ac,#2d4aa9));border-color:var(--btn,var(--ac,#2d4aa9));color:var(--nl-on,#fff)}.nlq-b:focus-visible,.nlq-x:focus-visible,.nlq-sw button:focus-visible{outline:3px solid var(--ac,#2d4aa9);outline-offset:2px}",
    ".nlq-hint{margin:10px 0 0;font-size:.75rem;color:var(--mut,var(--mu,#5b6670))}.nlq-warn{flex:1 1 100%;margin:0;font-size:.875rem;font-weight:700}",
    ".nlq-score{text-align:center;margin:14px 0 4px}.nlq-score b{font-size:3rem;line-height:1}.nlq-score span{font-size:1.1rem;color:var(--mut,var(--mu,#5b6670))}",
    ".nlq-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:8px 0 4px}.nlq-chips span{padding:6px 12px;border-radius:99px;background:var(--chip,#e8eeec);font-size:.8125rem;font-weight:700}",
    ".nlq-msg{text-align:center;margin:8px 0 14px;color:var(--mut,var(--mu,#5b6670))}",
    ".nlq-sw{display:flex;gap:8px;margin:6px 0 12px}.nlq-sw button{min-height:44px;padding:0 14px;border:1px solid var(--line,var(--ln,#e1ebe7));background:var(--surface,var(--sf,#fff));color:var(--mut,var(--mu,#5b6670));border-radius:99px;font:inherit;font-size:.8125rem;font-weight:700;cursor:pointer}.nlq-sw button[aria-pressed=true]{background:var(--btn,var(--ac,#2d4aa9));border-color:var(--btn,var(--ac,#2d4aa9));color:var(--nl-on,#fff)}",
    ".nlq-r{border:1px solid var(--line,var(--ln,#e1ebe7));border-radius:14px;padding:12px 14px;margin:0 0 10px}.nlq-r p{margin:4px 0}.nlq-r .t{font-weight:700;white-space:pre-line}.nlq-r .v{font-size:.8125rem;font-weight:800;letter-spacing:.03em}",
    ".nlq-r.ok{box-shadow:inset 4px 0 0 var(--ok,#2d4aa9)}.nlq-r.no{box-shadow:inset 4px 0 0 #b3261e}.nlq-r .e{font-size:.875rem;color:var(--mut,var(--mu,#5b6670))}",
    "@media(prefers-reduced-motion:reduce){.nlq-bar i,.nlq-op{transition:none}}",
    "@media(max-width:560px){.nlq-box{padding:14px}.nlq-b{padding:0 14px}}"
  ].join("");
  var st = doc.createElement("style"); st.textContent = css + '.nlq-clock.low{color:#c0392b;font-weight:800}'; doc.head.appendChild(st);

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function mmss(ms) { var t = Math.round(ms / 1000), m = Math.floor(t / 60), s = t % 60; return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s; }
  function draw(pool, n, key) {                           /* random sample, preferring questions not used by earlier quizzes from this source */
    var P = window.NLNav && NLNav.prog, used = seen[key] || (seen[key] = {});
    var fresh = pool.filter(function (x) { return !used[P.id(x)]; });
    if (fresh.length < Math.min(n, pool.length)) { used = seen[key] = {}; fresh = pool.slice(); }
    for (var i = fresh.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = fresh[i]; fresh[i] = fresh[j]; fresh[j] = t; }
    var pick = fresh.slice(0, Math.min(n, fresh.length)); pick.forEach(function (x) { used[P.id(x)] = 1; });
    return pick;
  }

  function start(o) {
    var pool = (o.pool || o.questions || []).filter(function (x) { return x && x.o && x.o.length === 4; });
    if (!pool.length) { say("There are no questions to build a quiz from."); return; }
    var LIM = (o.seconds || 0) * 1000, timedOut = false;
    var N = o.questions ? o.questions.length : (o.n || 20), key = o.title || "all", opener = o.opener || doc.activeElement, prevOverflow = doc.body.style.overflow;
    var Q, ans, i, t0, tick, confirming, result;

    var ov = doc.createElement("div"); ov.className = "nlq-ov";
    var box = doc.createElement("div"); box.className = "nlq-box"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-labelledby", "nlq-title");
    ov.appendChild(box); doc.body.appendChild(ov); doc.body.style.overflow = "hidden";

    function newRun() {
      Q = o.questions ? o.questions.slice() : draw(pool, N, key); timedOut = false; ans = Q.map(function () { return -1; }); i = 0; t0 = Date.now(); confirming = false; result = null;
      clearInterval(tick); tick = setInterval(function () { if (result) return; var e = box.querySelector(".nlq-clock"); if (e) { e.textContent = clock(); e.classList.toggle("low", !!LIM && Date.now() - t0 > LIM - 30000); } if (LIM && Date.now() - t0 >= LIM) { timedOut = true; finish(); } }, 500);
      paintQ(true); say("Quiz started. " + Q.length + " questions.");
    }
    function clock() { return LIM ? mmss(Math.max(0, LIM - (Date.now() - t0))) : mmss(Date.now() - t0); }
    function head(sub) {
      return '<div class="nlq-h"><div><h2 id="nlq-title">' + esc(o.heading || "Random " + Q.length + " quiz") + '</h2><p>' + esc(sub) + '</p></div><button type="button" class="nlq-x" aria-label="Close quiz">\u2715</button></div>';
    }
    function answered() { return ans.filter(function (a) { return a > -1; }).length; }

    function paintQ(focusFirst) {
      var x = Q[i], last = i === Q.length - 1;
      box.innerHTML = head(o.questions ? o.title : o.title + " \u00b7 " + pool.length + " questions in this set") +
        '<div class="nlq-meta"><span>Question ' + (i + 1) + " of " + Q.length + " \u00b7 " + answered() + ' answered</span><span class="nlq-clock' + (LIM && Date.now() - t0 > LIM - 30000 ? ' low' : '') + '" ' + (LIM ? 'title="Time left" ' : '') + 'aria-hidden="true">' + (LIM ? '\u23f1 ' : '') + clock() + '</span></div>' +
        '<div class="nlq-bar" role="progressbar" aria-label="Quiz progress" aria-valuemin="0" aria-valuemax="' + Q.length + '" aria-valuenow="' + (i + 1) + '"><i style="width:' + ((i + 1) / Q.length * 100) + '%"></i></div>' +
        '<p class="nlq-q" id="nlq-q">' + esc(x.q) + "</p>" +
        '<fieldset class="nlq-o" aria-labelledby="nlq-q"><legend>Choose one answer</legend>' +
        x.o.map(function (t, k) { return '<label class="nlq-op"><input type="radio" name="nlq" value="' + k + '"' + (ans[i] === k ? " checked" : "") + "><span>" + esc(t) + "</span></label>"; }).join("") + "</fieldset>" +
        '<div class="nlq-f"><button type="button" class="nlq-b" data-a="prev"' + (i ? "" : " disabled") + '>\u2039 Previous</button><span class="sp"></span>' +
        (last ? '<button type="button" class="nlq-b pri" data-a="finish">Finish quiz</button>' : '<button type="button" class="nlq-b pri" data-a="next">Next \u203a</button>') + "</div>" +
        (confirming ? '<div class="nlq-f"><p class="nlq-warn" role="alert">' + (Q.length - answered()) + ' question' + (Q.length - answered() === 1 ? "" : "s") + ' unanswered. Finish anyway?</p><button type="button" class="nlq-b" data-a="back">Keep going</button><button type="button" class="nlq-b pri" data-a="finish-now">Finish anyway</button></div>' : "") +
        '<p class="nlq-hint">Keys: A\u2013D or 1\u20134 choose \u00b7 N next \u00b7 P previous \u00b7 Esc close. Answers are scored at the end.</p>';
      if (focusFirst) { var f = box.querySelector("input:checked") || box.querySelector("input"); f && f.focus({ preventScroll: true }); }
    }

    function finish() {
      clearInterval(tick); var ms = LIM ? Math.min(LIM, Date.now() - t0) : Date.now() - t0, ok = 0, pairs = [];
      Q.forEach(function (x, k) { if (ans[k] > -1) { pairs.push([x, ans[k]]); if (ans[k] === x.a) ok++; } });
      if (pairs.length) NLNav.prog.setMany(pairs);
      result = { ok: ok, wrong: pairs.length - ok, skip: Q.length - pairs.length, ms: ms, filter: "all" };
      paintR(); say((timedOut ? "Time is up. " : "") + "Quiz finished. You scored " + ok + " out of " + Q.length + ".");
      if (o.onFinish) { try { o.onFinish(result, Q.length); } catch (err) {} }
    }
    function paintR() {
      var r = result, pct = Math.round(r.ok / Q.length * 100);
      var msg = (timedOut ? "Time is up, so the quiz was submitted automatically. " : "") + (pct >= 80 ? "Excellent work." : pct >= 50 ? "Good effort. Review the mistakes below." : "Keep practising. Review the answers below and try again.");
      var items = Q.map(function (x, k) {
        var a = ans[k], good = a === x.a; if (r.filter === "bad" && good) return "";
        return '<div class="nlq-r ' + (good ? "ok" : "no") + '"><p class="v">' + (k + 1) + ". " + (good ? "CORRECT" : a < 0 ? "NOT ANSWERED" : "INCORRECT") + '</p><p class="t">' + esc(x.q) + "</p>" +
          (good ? "" : '<p>Your answer: ' + (a < 0 ? "none" : esc(x.o[a])) + "</p>") + "<p><b>Correct answer: " + esc(x.o[x.a]) + "</b></p>" + (x.e ? '<p class="e">' + esc(x.e) + "</p>" : "") + "</div>";
      }).join("");
      box.innerHTML = head(o.title) +
        '<div class="nlq-score" role="status"><b>' + r.ok + "</b><span> / " + Q.length + " \u00b7 " + pct + '%</span></div>' +
        '<div class="nlq-chips"><span>' + r.ok + " correct</span><span>" + r.wrong + " wrong</span><span>" + r.skip + " not answered</span><span>Time " + mmss(r.ms) + "</span></div>" +
        '<p class="nlq-msg">' + msg + "</p>" +
        '<div class="nlq-sw" role="group" aria-label="Which answers to review"><button type="button" data-f="all" aria-pressed="' + (r.filter === "all") + '">All answers</button><button type="button" data-f="bad" aria-pressed="' + (r.filter === "bad") + '">Wrong or skipped</button></div>' +
        (items || '<p class="nlq-msg">Nothing to review. Every answer was correct.</p>') +
        '<div class="nlq-f"><span class="sp"></span><button type="button" class="nlq-b" data-a="close">Close</button><button type="button" class="nlq-b pri" data-a="again">' + (o.questions ? "Retry this quiz" : "New random " + N) + "</button></div>";
      var h = box.querySelector(".nlq-score"); h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: false });
    }

    function close(force) {
      if (!force && !result && answered() > 0 && !window.confirm("Quit this quiz? Your answers so far will not be saved.")) return;
      clearInterval(tick); doc.removeEventListener("keydown", onKey, true); ov.remove(); doc.body.style.overflow = prevOverflow;
      opener && opener.focus && opener.focus(); o.onClose && o.onClose();
    }
    function go(d) { i = Math.max(0, Math.min(Q.length - 1, i + d)); confirming = false; paintQ(true); }

    box.addEventListener("change", function (e) { if (e.target.name === "nlq") { ans[i] = +e.target.value; var m = box.querySelector(".nlq-meta span"); m.textContent = "Question " + (i + 1) + " of " + Q.length + " \u00b7 " + answered() + " answered"; } });
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.classList.contains("nlq-x")) return close();
      if (b.dataset.f) { result.filter = b.dataset.f; return paintR(); }
      var a = b.dataset.a; if (!a) return;
      if (a === "prev") go(-1); else if (a === "next") go(1);
      else if (a === "finish") { if (answered() < Q.length) { confirming = true; paintQ(false); box.querySelector('[data-a="finish-now"]').focus(); } else finish(); }
      else if (a === "finish-now") finish(); else if (a === "back") { confirming = false; paintQ(true); }
      else if (a === "again") newRun(); else if (a === "close") close(true);
    });
    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); close(!!result); return; }
      if (e.key === "Tab") {                              /* keep keyboard focus inside the dialog */
        var f = [].filter.call(box.querySelectorAll("button,input,[tabindex]"), function (el) { return !el.disabled && el.tabIndex >= 0 && el.offsetParent !== null; });
        if (!f.length) return; var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && doc.activeElement === z) { e.preventDefault(); a.focus(); }
        return;
      }
      if (result || e.ctrlKey || e.metaKey || e.altKey) return;
      var k = e.key.toLowerCase(), idx = "abcd".indexOf(k); if (idx < 0 && k >= "1" && k <= "4") idx = +k - 1;
      if (idx > -1) { var inp = box.querySelectorAll('input[name="nlq"]')[idx]; if (inp) { inp.checked = true; inp.dispatchEvent(new Event("change", { bubbles: true })); inp.focus({ preventScroll: true }); e.preventDefault(); } }
      else if (k === "n") { var nx = box.querySelector('[data-a="next"]'); nx && nx.click(); }
      else if (k === "p") { var pv = box.querySelector('[data-a="prev"]'); pv && !pv.disabled && pv.click(); }
    }
    doc.addEventListener("keydown", onKey, true);
    newRun();
  }
  window.NLQuiz = { start: start };
})();
