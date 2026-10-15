/* nl-report.js: "Report this question" for the whole site.
   One place to change the contact address: SITE.email below.

   NLReport.btn(question, ctx, opts)  -> HTML string for a small Report button (use inside templates)
   NLReport.open(question, ctx)       -> opens the report dialog directly
     question : {q, o:[options], a:index, e:explanation} (also accepts {question, options})
     ctx      : short label such as "Unit 2 - Set 3 - Q14" or "Mock Test 5 - Q22"

   The dialog lets the student report by email app, Gmail in the browser, or copy the text.
   Nothing is sent from the site itself; no server or sign-in is needed. */
(function () {
  "use strict";
  if (window.NLReport) return;
  var SITE = { email: "netlawverse@gmail.com", name: "NET Law-Verse", url: "https://netlawverse.in/" };
  var doc = document, L = "ABCD";

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function clean(s) { return String(s == null ? "" : s).replace(/\s+/g, " ").trim(); }
  function strip(t) { return clean(t).replace(/^[A-Da-d][.)]\s+/, ""); }

  function norm(x) {
    x = x || {};
    var q = x.q != null ? x.q : x.question, o = x.o || x.options || [];
    if (!Array.isArray(o)) o = Object.keys(o).map(function (k) { return o[k]; });          /* {A:"..",B:".."} form */
    var a = typeof x.a === "number" ? x.a : (typeof x.correct === "string" ? L.indexOf(x.correct) : -1);
    return { q: clean(q), o: o.map(function (t) { return strip(t); }), a: a, e: clean(x.e || x.explanation || "") };
  }
  function build(question, ctx) {
    var n = norm(question), where = clean(ctx) || clean(doc.title);
    var q = n.q.length > 420 ? n.q.slice(0, 417) + "..." : n.q;
    var subject = "Question report: " + (where ? where + " - " : "") + (n.q.length > 50 ? n.q.slice(0, 47) + "..." : n.q);
    var body = "Hello " + SITE.name + " team,\n\nI found a problem with this question.\n\n" +
      "Where: " + where + "\nPage: " + location.href.split("#")[0] + (location.hash ? location.hash : "") + "\n\n" +
      "Question: " + q + "\n" +
      n.o.map(function (t, k) { return L[k] + ". " + (t.length > 160 ? t.slice(0, 157) + "..." : t); }).join("\n") + "\n" +
      (n.a > -1 ? "Answer key shows: " + L[n.a] + "\n" : "") +
      "\nWhat is wrong? (keep the one that applies)\n" +
      "- Wrong answer key\n- Explanation is wrong or unclear\n- Spelling / wording problem\n- Law or amendment is outdated\n- Duplicate question\n- Something else\n\n" +
      "My correction / source (section, case, bare-act link):\n\n";
    return { subject: subject, body: body };
  }
  function mailto(r) { return "mailto:" + SITE.email + "?subject=" + encodeURIComponent(r.subject) + "&body=" + encodeURIComponent(r.body); }
  function gmail(r) { return "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(SITE.email) + "&su=" + encodeURIComponent(r.subject) + "&body=" + encodeURIComponent(r.body); }

  var css = ".nl-rep{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 12px;border:1px solid var(--line,var(--ln,#d9e0ec));background:transparent;color:var(--mut,var(--mu,#5b6670));border-radius:99px;font:inherit;font-size:.78rem;font-weight:700;cursor:pointer;line-height:1}" +
    ".nl-rep:hover{border-color:var(--ac,#2d4aa9);color:var(--ac,#2d4aa9)}.nl-rep:focus-visible{outline:3px solid var(--ac,#2d4aa9);outline-offset:2px}.nl-rep svg{flex:none}" +
    ".nl-rep.ic{width:36px;padding:0;justify-content:center}.nl-rep.ic .t{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}" +
    ".nlr-ov{position:fixed;inset:0;z-index:300;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(10,18,30,.62)}" +
    ".nlr-box{width:min(440px,100%);max-height:92vh;overflow:auto;background:var(--surface,var(--sf,#fff));color:var(--text,var(--tx,#1e2a38));border:1px solid var(--line,var(--ln,#d9e0ec));border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.35);padding:18px}" +
    ".nlr-box h2{margin:0 0 4px;font-size:1.1rem}.nlr-box p{margin:0 0 10px;font-size:.85rem;color:var(--mut,var(--mu,#5b6670));line-height:1.45}" +
    ".nlr-q{padding:10px 12px;border-radius:10px;background:var(--chip,#eef1f8);font-size:.82rem;line-height:1.45;margin:0 0 12px;max-height:5.6em;overflow:hidden}" +
    ".nlr-a{display:grid;gap:8px}.nlr-a a,.nlr-a button{display:flex;align-items:center;justify-content:center;min-height:46px;padding:0 14px;border-radius:12px;border:1px solid var(--line,var(--ln,#d9e0ec));background:var(--surface,var(--sf,#fff));color:inherit;font:inherit;font-size:.9rem;font-weight:700;cursor:pointer;text-decoration:none}" +
    ".nlr-a .pri{background:var(--btn,var(--ac,#2d4aa9));border-color:var(--btn,var(--ac,#2d4aa9));color:var(--nl-on,#fff)}.nlr-a a:focus-visible,.nlr-a button:focus-visible{outline:3px solid var(--ac,#2d4aa9);outline-offset:2px}" +
    ".nlr-n{margin:10px 0 0!important;font-size:.78rem!important;text-align:center}";
  var st = doc.createElement("style"); st.textContent = css; (doc.head || doc.documentElement).appendChild(st);

  var flag = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 22V4M4 4h13l-2 4 2 4H4"/></svg>';
  var store = []; /* payloads for rendered buttons, referenced by index so attributes stay short */

  function btn(question, ctx, opts) {
    opts = opts || {};
    var id = store.push({ q: question, c: ctx }) - 1; if (store.length > 4000) { store.splice(0, 2000); id -= 2000; if (id < 0) id = store.push({ q: question, c: ctx }) - 1; }
    var cls = "nl-rep" + (opts.icon ? " ic" : "") + (opts.cls ? " " + opts.cls : "");
    return '<button type="button" class="' + cls + '" data-nlr="' + id + '" aria-label="Report a problem with this question" title="Report a problem with this question">' + flag + '<span class="t">Report</span></button>';
  }

  var openEl = null, returnTo = null;
  function close() { if (!openEl) return; openEl.remove(); openEl = null; doc.removeEventListener("keydown", onKey, true); if (returnTo && returnTo.focus) try { returnTo.focus(); } catch (e) {} }
  function onKey(e) {
    if (e.key === "Escape") { e.stopPropagation(); e.preventDefault(); close(); return; }
    if (e.key === "Tab" && openEl) {
      var f = openEl.querySelectorAll("a[href],button"); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && doc.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  }
  function open(question, ctx) {
    close(); returnTo = doc.activeElement;
    var r = build(question, ctx), n = norm(question);
    var ov = doc.createElement("div"); ov.className = "nlr-ov";
    ov.innerHTML = '<div class="nlr-box" role="dialog" aria-modal="true" aria-labelledby="nlr-t"><h2 id="nlr-t">Report this question</h2>' +
      '<p>Spotted a wrong answer, a typo or an outdated law? Tell us and we will check it.</p>' +
      '<div class="nlr-q">' + esc(n.q.length > 200 ? n.q.slice(0, 197) + "..." : n.q) + '</div>' +
      '<div class="nlr-a"><a class="pri" href="' + esc(mailto(r)) + '">Email us (opens your mail app)</a>' +
      '<a href="' + esc(gmail(r)) + '" target="_blank" rel="noopener noreferrer">Open in Gmail</a>' +
      '<button type="button" data-copy>Copy report text</button><button type="button" data-x>Cancel</button></div>' +
      '<p class="nlr-n" role="status" aria-live="polite">Or write to <b>' + esc(SITE.email) + '</b></p></div>';
    doc.body.appendChild(ov); openEl = ov;
    ov.addEventListener("click", function (e) {
      if (e.target === ov || e.target.closest("[data-x]")) { close(); return; }
      var c = e.target.closest("[data-copy]");
      if (c) {
        var txt = "To: " + SITE.email + "\nSubject: " + r.subject + "\n\n" + r.body, note = ov.querySelector(".nlr-n");
        var done = function (ok) { note.textContent = ok ? "Copied. Paste it into an email to " + SITE.email : "Could not copy. Please write to " + SITE.email; };
        try { navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { done(false); }); } catch (err) { done(false); }
      }
      if (e.target.closest("a[href]")) setTimeout(close, 400);
    });
    doc.addEventListener("keydown", onKey, true);
    var f = ov.querySelector("a"); if (f) f.focus();
  }

  doc.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-nlr],[data-nlr-q]"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (b.hasAttribute("data-nlr-q")) {                  /* static buttons written into a page's HTML */
      try { open(JSON.parse(b.getAttribute("data-nlr-q")), b.getAttribute("data-nlr-c") || ""); } catch (err) {}
      return;
    }
    var p = store[+b.getAttribute("data-nlr")]; if (p) open(p.q, p.c);
  }, true);

  window.NLReport = { btn: btn, open: open, email: SITE.email, mailto: function (q, c) { return mailto(build(q, c)); } };
})();
