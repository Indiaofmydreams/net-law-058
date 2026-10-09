/* Exam Strategy Engine (ESE). A slide in the hero carousel (index.html) that opens in the same window as the Paper 1 quiz, with no timer.
   It reads what the site already knows on this device (practice progress, Daily Quiz scores, the 20-question Paper 2 test, mock results,
   the exam date in exam-dates.json), asks a few plain questions, and builds a personalised NET strategy: 10 analyses, each with the parts of
   the site to use. Nothing leaves the browser. The strategy is saved on this device, refreshes from live practice every time it is opened,
   and "Recalculate my strategy" re-runs it and shows what changed.
   To change wording or numbers, edit the clearly marked sections: QS (questions), TUNING (numbers), and the build functions near the end. */
(function () {
  "use strict";
  var root = document.querySelector("[data-cc]");
  var slide = root && root.querySelector('.cc-slide[data-label="Exam Strategy Engine"]');
  if (!slide || !window.loadBank) return;
  var doc = document, KEY = "nl-ese-v1", RECALC_AT = 200;
  var DISC = "This strategy is personalised guidance based on your inputs and performance; it does not guarantee results, rank, qualification, or examination success.";

  /* ---------- the site's modules, in the same order as modules.js (used to find a module card to open) ---------- */
  var P1U = [["Teaching Aptitude", "Teaching Aptitude"], ["Research Aptitude", "Research Aptitude"], ["Comprehension", "Comprehension"], ["Communication", "Communication"],
    ["Mathematical Reasoning and Aptitude", "Mathematical Reasoning"], ["Logical Reasoning", "Logical Reasoning"], ["Data Interpretation", "Data Interpretation"],
    ["Information and Communication Technology (ICT)", "ICT"], ["People, Development and Environment", "People, Development & Environment"], ["Higher Education System", "Higher Education System"]];
  var P2U = [["Jurisprudence", "Jurisprudence"], ["Constitutional and Administrative Law", "Constitutional & Administrative Law"], ["Public International Law and IHL", "Public International Law & IHL"],
    ["Law of Crimes", "Law of Crimes"], ["Law of Torts and Consumer Protection", "Torts & Consumer Protection"], ["Commercial Law", "Commercial Law"], ["Family Law", "Family Law"],
    ["Environment and Human Rights Law", "Environment & Human Rights"], ["Intellectual Property Rights and Information Technology Law", "IPR & IT Law"],
    ["Comparative Public Law and Systems of Governance", "Comparative Public Law"]];
  var UNIT = {};
  P1U.forEach(function (u, i) { UNIT[u[0]] = { short: u[1], set: 1, i: i }; });
  P2U.forEach(function (u, i) { UNIT[u[0]] = { short: u[1], set: 2, i: i }; });

  /* ---------- small helpers ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} return null; }
  function band(x, cuts) { var i = 0; while (i < cuts.length && x >= cuts[i]) i++; return i; }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function rnd(x) { return Math.round(x); }
  function sd(d) { try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); } catch (e) { return ""; } }
  function ist(t) { return window.NLNav && NLNav.istDay ? NLNav.istDay(t) : new Date(t == null ? Date.now() : t).toISOString().slice(0, 10); }
  function short(u) { return UNIT[u] ? UNIT[u].short : u; }

  /* ---------- 1. what the site already knows about this student ---------- */
  function signals(bank, exam) {
    var S = { attempts: 0, ok: 0, byUnit: {}, accPct: null, activeDays14: 0, streak: 0, dq: [], t20: null, mocks: [], mockAvg: null, daysLeft: null, examDate: null };
    var P = window.NLNav && NLNav.prog;
    if (P) {
      bank.forEach(function (x) {
        var s = P.status(x); if (s === "u") return;
        S.attempts++; if (s === "ok") S.ok++;
        var b = S.byUnit[x.u] || (S.byUnit[x.u] = { a: 0, ok: 0 }); b.a++; if (s === "ok") b.ok++;
      });
      try { S.streak = P.daily().streak || 0; } catch (e) {}
    }
    if (S.attempts) S.accPct = S.ok / S.attempts * 100;
    var pg = ls("nl-prog-v1"); if (pg && pg.days) for (var i = 0; i < 14; i++) { var r = pg.days[ist(Date.now() - i * 864e5)]; if (r && r.n > 0) S.activeDays14++; }
    try {
      for (var j = 0; j < localStorage.length; j++) {
        var k = localStorage.key(j), m = /^nl-dq-(\d{4}-\d{2}-\d{2})$/.exec(k || "");
        if (m) { var v = ls(k); if (v && v.total) S.dq.push({ d: m[1], ok: v.ok, total: v.total }); }
      }
    } catch (e) {}
    S.dq.sort(function (a, b) { return a.d < b.d ? -1 : 1; });
    var t = ls("netlaw058-test20-v1"); if (t && t.last != null) S.t20 = { best: t.best, last: t.last, n: t.n || 1, total: 20 };
    for (var n = 1; n <= 13; n++) { var rr = ls("netlaw058-mock-" + n + "-result"); if (rr && rr.marks != null) S.mocks.push({ n: n, marks: rr.marks, pct: rr.pct, acc: rr.acc, at: rr.at || 0, min: rr.taken ? rr.taken / 60000 : null }); }
    if (S.mocks.length) S.mockAvg = S.mocks.reduce(function (a, x) { return a + x.pct; }, 0) / S.mocks.length;
    if (exam && exam.date) { var dt = Date.parse(exam.date + "T" + (exam.time || "00:00") + ":00+05:30"); if (dt) { S.examDate = dt; S.daysLeft = Math.ceil((dt - Date.now()) / 864e5); } }
    return S;
  }
  function dqAvg(S) { var l = S.dq.slice(-5); return l.length ? l.reduce(function (a, x) { return a + x.ok / x.total * 100; }, 0) / l.length : null; }

  /* ---------- 2. the questions (edit wording here). "auto" reads from the device; a student can always choose another answer ---------- */
  var QS = [
    { id: "when", q: "When are you aiming to sit NET?", o: ["Within a month", "In 1 to 3 months", "In 3 to 6 months", "More than 6 months away"],
      auto: function (S) { return S.daysLeft > 0 ? { v: band(S.daysLeft, [30, 90, 180]), num: S.daysLeft, t: "Use the exam date set on this site: " + sd(S.examDate) + " (about " + S.daysLeft + " days away)" } : null; } },
    { id: "cover", q: "How much of the Law 058 syllabus have you covered so far?", o: ["Under 25%", "25% to 50%", "50% to 75%", "75% or more"] },
    { id: "acc", q: "Roughly how do you score on MCQs at the moment?", o: ["Below 40%", "40% to 55%", "55% to 70%", "70% or more"],
      auto: function (S) { return S.attempts >= 30 ? { v: band(S.accPct, [40, 55, 70]), num: S.accPct, t: "Use my practice accuracy on this site: " + rnd(S.accPct) + "% across " + S.attempts + " questions" } : null; } },
    { id: "why", q: "When an MCQ goes wrong, what is usually behind it?", o: ["I didn't know it", "I knew it but forgot", "I misread it or mixed up two options", "A careless slip"] },
    { id: "hours", q: "How much can you realistically study each day?", o: ["Under 2 hours", "2 to 4 hours", "4 to 6 hours", "6 hours or more"] },
    { id: "revise", q: "How regularly do you revise what you have studied?", o: ["Rarely", "Occasionally", "Weekly", "On a fixed system"] },
    { id: "mcq", q: "How often do you practise MCQs?", o: ["Rarely", "1 to 2 times a week", "3 to 5 times a week", "Daily"],
      auto: function (S) { if (S.attempts < 20) return null; var w = S.activeDays14 / 2; return { v: band(w, [1, 3, 6]), t: "Use my activity on this site: practised on " + S.activeDays14 + " of the last 14 days" }; } },
    { id: "mock", q: "How often do you take full or sectional mocks?", o: ["Never", "Occasionally", "Weekly", "2 or more a week"],
      auto: function (S) { if (!S.mocks.length) return null; var rc = S.mocks.filter(function (x) { return Date.now() - x.at < 14 * 864e5; }).length, w = rc / 2;
        return { v: w >= 2 ? 3 : w >= 1 ? 2 : 1, t: "Use my mock history: " + S.mocks.length + " completed, " + rc + " in the last 2 weeks" }; } },
    { id: "pile", q: "With a lot of syllabus still left, what do you usually do?", o: ["Work through it topic by topic", "Make a detailed plan first", "Move between topics as I go", "Put it off and start late"] },
    { id: "loss", q: "Where do you lose the most marks?", o: ["Understanding concepts", "Remembering what I studied", "Applying knowledge to MCQs", "Managing time", "Avoiding careless mistakes"] },
    { id: "stage", q: "Which sounds closest to where you are now?", o: ["I need to build my foundation", "I've studied, but I need better retention", "I know the material, but my scores are low", "I'm reasonably prepared and want to maximise marks"] },
    { id: "dq", q: "How did you score on the Daily Paper 1 quiz?", score: true, ctx: "The Daily Quiz is the 10-question, 4-minute slide in the carousel.",
      bands: [["0 to 3 out of 10", 15], ["4 to 6 out of 10", 50], ["7 to 8 out of 10", 75], ["9 to 10 out of 10", 95]],
      auto: function (S) { var l = S.dq[S.dq.length - 1]; return l ? { v: l.ok / l.total * 100, num: l.ok / l.total * 100, t: "Use my latest Daily Quiz result: " + l.ok + " out of " + l.total + " (" + sd(l.d) + ")" } : null; } },
    { id: "t20", q: "How did you score on the 20-question Paper 2 test?", score: true, ctx: "That is “Test Your UGC NET Law Preparation”, further down the home page.",
      bands: [["0 to 7 out of 20", 25], ["8 to 11 out of 20", 50], ["12 to 15 out of 20", 72], ["16 to 20 out of 20", 90]],
      auto: function (S) { var t = S.t20; return t ? { v: t.last / 20 * 100, num: t.last / 20 * 100, t: "Use my latest result: " + t.last + " out of 20" + (t.best != null && t.best !== t.last ? " (best " + t.best + ")" : "") } : null; } }
  ];
  var QBY = {}; QS.forEach(function (q) { QBY[q.id] = q; });

  /* the options a student sees for a question: [auto option first if the site found one] + the usual choices */
  function optionsFor(q, S) {
    var out = [], a = q.auto ? q.auto(S) : null;
    if (a) out.push({ t: a.t, v: a.v, num: a.num, auto: true });
    if (q.score) { q.bands.forEach(function (b) { out.push({ t: b[0], v: b[1] }); }); out.push({ t: "I haven’t tried it yet", v: null }); }
    else q.o.forEach(function (t, i) { out.push({ t: t, v: i }); });
    return out;
  }
  /* keep saved answers in step with the live device data (so a returning student's numbers are never stale) */
  function refreshAuto(A, S) {
    var out = {}; Object.keys(A).forEach(function (k) { out[k] = A[k]; });
    QS.forEach(function (q) { var a = q.auto ? q.auto(S) : null; if (a && (!out[q.id] || out[q.id].auto)) out[q.id] = { v: a.v, num: a.num, auto: true, t: a.t }; });
    return out;
  }

  /* ---------- 3. the engine ---------- */
  var TUNING = {
    cover: [12, 37, 62, 88], acc: [32, 47, 62, 78], hrs: [1.5, 3, 5, 7], days: [20, 60, 135, 210], rev: [10, 35, 65, 90], mcq: [10, 35, 65, 90],
    hrsScore: [25, 50, 75, 90], mock: [0, 35, 70, 95], need: { syllabusHours: 300, practiceHours: 150, revisionHours: 40 }, goal: [20, 30, 40, 50]
  };
  var STAGES = [
    { max: 35, name: "Foundation", line: "You are at the foundation stage. The biggest gain right now comes from covering the syllabus properly, not from more mocks." },
    { max: 52, name: "Building", line: "You are building. Part of the syllabus is in place, so your plan balances new topics with steady practice." },
    { max: 70, name: "Gaining pace", line: "You are gaining pace. Your coverage is solid enough that practice and revision will now move your score the most." },
    { max: 101, name: "Sharpening", line: "You are sharpening. The gains now come from accuracy, speed and fixing specific weak units." }
  ];
  var LEAKS = {
    concept: { name: "Concept gaps", fix: ["Learn before you test: take one unit at a time from the Syllabus and read its Notes first.", "Then do 20 to 30 MCQs on that unit and read every explanation, including the ones you got right.", "Do not start full mocks until you have covered about half of the syllabus."], acts: [["Open the Syllabus", "#syllabus"], ["Read the Notes", "#notes"], ["Practise MCQs", "#mcqs"]] },
    recall: { name: "Retention", fix: ["Bring each topic back at day 3, day 7 and day 21 with a short MCQ set instead of re-reading.", "Use the Mistakes filter in Practice questions: re-attempt every wrong answer a week later.", "End each study day with five minutes of recall: write down what you remember before checking the Notes."], acts: [["Revise from the Notes", "#notes"], ["Re-attempt Mistakes", "#mcqs"]] },
    apply: { name: "Applying knowledge and reading options", fix: ["Practise statements, assertion–reason and match-the-following questions: they reward careful reading, not just facts.", "Read all four options before choosing, and mark qualifiers such as “only”, “always” and “except”.", "After each set, write one line on why the right option is right and why the closest wrong one is wrong."], acts: [["Practise MCQs", "#mcqs"], ["Try previous-year questions", "#pyq"], ["Take a mock", "#mock-tests"]] },
    time: { name: "Time handling", fix: ["Train on the clock: 10 questions in 10 minutes, then build up to 25 in 25.", "Set a ceiling of about 70 seconds per question and move on when you cross it: you can come back.", "Take timed papers regularly so the pace feels normal on exam day."], acts: [["Take the 7-minute test", "#nl-test"], ["Take a timed mock", "#mock-tests"], { t: "Take the Daily Quiz", slide: "Daily Quiz", open: true }] },
    care: { name: "Careless slips", fix: ["Keep a three-line error log after every set: what you chose, why, and the trap you fell for.", "Build a last-ten-seconds habit: re-read the question stem before you lock an answer.", "Tag every wrong answer in a mock as “knew it” or “didn’t know it”: only the first group is a slip."], acts: [["Re-attempt Mistakes", "#mcqs"], ["Review a mock", "#mock-tests"]] }
  };
  var PATHS = [
    { max: 25, href: "ugc-net-law-2-week-preparation-plan.html", name: "2 weeks", sub: "Retrieve, practise and refine" },
    { max: 75, href: "ugc-net-law-1-month-preparation-plan.html", name: "1 month", sub: "Consolidate and test" },
    { max: 150, href: "ugc-net-law-3-month-preparation-plan.html", name: "3 months", sub: "Accelerate your preparation" },
    { max: 1e9, href: "ugc-net-law-6-month-preparation-plan.html", name: "6 months", sub: "Build your foundation" }
  ];

  function analyse(A, S) {
    var g = function (id) { return A[id] || { v: 0 }; };
    var m = {}, perf = [], src = [];
    m.C = TUNING.cover[g("cover").v];
    m.accNum = g("acc").num != null ? g("acc").num : TUNING.acc[g("acc").v];
    perf.push({ w: 1, v: m.accNum }); src.push("practice accuracy " + rnd(m.accNum) + "%");
    var dqv = g("dq").v, dqa = dqAvg(S);
    m.dq = dqv != null ? (g("dq").auto && dqa != null ? dqa : dqv) : null;
    if (m.dq != null) { perf.push({ w: 1, v: m.dq }); src.push("Daily Quiz " + rnd(m.dq) + "%"); }
    var tv = g("t20").v; m.t20 = tv != null ? tv : null;
    if (m.t20 != null) { perf.push({ w: 1, v: m.t20 }); src.push("20-question Paper 2 test " + rnd(m.t20) + "%"); }
    if (S.mockAvg != null) { perf.push({ w: 1.5, v: S.mockAvg }); src.push("mocks " + rnd(S.mockAvg) + "%"); }
    m.src = src;
    m.P = perf.reduce(function (a, x) { return a + x.w * x.v; }, 0) / perf.reduce(function (a, x) { return a + x.w; }, 0);
    m.K = clamp(0.4 * TUNING.rev[g("revise").v] + 0.4 * TUNING.mcq[g("mcq").v] + 0.2 * TUNING.hrsScore[g("hours").v] + (S.streak >= 3 ? 5 : 0), 0, 100);
    m.MH = TUNING.mock[g("mock").v];
    m.days = g("when").num != null ? g("when").num : TUNING.days[g("when").v];
    m.hrs = TUNING.hrs[g("hours").v];
    m.avail = m.days * m.hrs * 0.75;
    m.need = (100 - m.C) / 100 * TUNING.need.syllabusHours + Math.max(0, 80 - m.P) / 80 * TUNING.need.practiceHours + TUNING.need.revisionHours;
    m.F = m.avail / m.need; m.TS = clamp(m.F * 100, 0, 100);
    m.R = rnd(0.30 * m.C + 0.30 * m.P + 0.15 * m.K + 0.10 * m.MH + 0.15 * m.TS);
    m.stage = STAGES[band(m.R, [35, 52, 70])];
    m.si = band(m.R, [35, 52, 70]);
    var votes = { concept: 0, recall: 0, apply: 0, time: 0, care: 0 };
    votes[["concept", "recall", "apply", "care"][g("why").v]]++;
    votes[["concept", "recall", "apply", "time", "care"][g("loss").v]]++;
    votes[["concept", "recall", "apply", "apply"][g("stage").v]] += 0.5;
    if (m.C < 45) votes.concept += 1;
    var order = ["concept", "recall", "apply", "care", "time"];
    m.leaks = order.slice().sort(function (a, b) { return votes[b] - votes[a] || order.indexOf(a) - order.indexOf(b); });
    m.p2Share = 67;
    if (m.dq != null && m.t20 != null) { if (m.dq < m.t20 - 15) m.p2Share = 55; else if (m.t20 < m.dq - 15) m.p2Share = 78; }
    var units = Object.keys(S.byUnit).filter(function (u) { return S.byUnit[u].a >= 5 && UNIT[u]; }).map(function (u) { var b = S.byUnit[u]; return { u: u, short: short(u), pct: b.ok / b.a * 100, a: b.a, set: UNIT[u].set, i: UNIT[u].i }; });
    units.sort(function (a, b) { return a.pct - b.pct; });
    m.weak = units.filter(function (x) { return x.pct < 65; }).slice(0, 3);
    m.strong = units.filter(function (x) { return x.pct >= 70; }).slice(-2).reverse();
    m.unitsKnown = units.length;
    m.attempts = S.attempts; m.mocksN = S.mocks.length;
    m.path = PATHS.filter(function (p) { return m.days <= p.max; })[0];
    m.goal = TUNING.goal[m.si];
    return m;
  }
  function lite(m, S) {
    return { R: m.R, C: m.C, P: rnd(m.P), K: rnd(m.K), TS: rnd(m.TS), att: S.attempts, acc: S.accPct != null ? rnd(S.accPct) : null, dq: m.dq != null ? rnd(m.dq) : null, t20: m.t20 != null ? rnd(m.t20) : null,
      mocks: S.mocks.length, weak: m.weak.map(function (w) { return { u: w.u, pct: rnd(w.pct) }; }), stage: m.stage.name };
  }

  /* ---------- 4. the ten analyses ---------- */
  function sections(m, A, S) {
    var g = function (id) { return A[id] || { v: 0 }; }, L = LEAKS[m.leaks[0]], L2 = LEAKS[m.leaks[1]], out = [];
    var P2 = [["Open Paper 2", "#law"]], P1 = [["Open Paper 1", "#paper1"]];
    var dqAct = { t: "Take the Daily Quiz", slide: "Daily Quiz", open: true }, t20Act = ["Take the 20-question test", "#nl-test"];

    /* 1 */
    var gap = m.P >= m.C + 10 ? (m.P >= 55 ? "Your scores are ahead of your coverage: you do well on what you have studied, so the next gain is widening the syllabus." : "Your scores are a little ahead of your coverage, but both have room to grow: widen the syllabus first, then practise what you learn.")
      : m.C >= m.P + 15 ? "You have covered more than your scores show: the gap is converting knowledge into marks, so shift hours from reading to practice."
      : "Your coverage and your scores are moving together, which is a healthy sign.";
    out.push({ title: "Where you stand today", find: m.stage.line + " " + gap,
      pts: ["Syllabus covered: about " + m.C + "%.", "Performance: " + rnd(m.P) + "% (from " + m.src.join(", ") + ").", "Study consistency: " + rnd(m.K) + "/100 from your revision, practice and daily hours.", "Time fit: " + rnd(m.TS) + "/100 (see the next analysis)."],
      acts: [["Open the Syllabus", "#syllabus"], ["Practise MCQs", "#mcqs"]] });

    /* 2 */
    var tf = m.F >= 1 ? "At your current pace you can finish the syllabus and still have room for revision." : m.F >= 0.7 ? "Your time is tight but workable if you prioritise high-yield units and protect your study hours." : "At this pace the full syllabus will not fit. Raise your daily hours or narrow your focus to the units that carry the most questions.";
    out.push({ title: "Your time, and what it asks of you", find: tf,
      pts: [(S.daysLeft > 0 ? "The exam date set on this site is " + sd(S.examDate) + ", about " + S.daysLeft + " days away." : "You are preparing for an attempt about " + rnd(m.days) + " days away."),
        "At " + m.hrs + " hours a day you have roughly " + rnd(m.avail) + " usable study hours; the plan needs about " + rnd(m.need) + " (a rough estimate).",
        "Closest pathway on this site: " + m.path.name + " — “" + m.path.sub + "”."],
      acts: [["Open the " + m.path.name + " pathway", m.path.href], ["Compare all pathways", "#plan"]] });

    /* 3 */
    out.push({ title: "Where you are losing marks", find: "Your biggest leak looks like: " + L.name + ". Your second is " + L2.name.toLowerCase() + ".", pts: L.fix, acts: L.acts });

    /* 4 */
    var d1 = m.dq != null ? "Daily Paper 1 quiz: " + rnd(m.dq) + "%." : "Daily Paper 1 quiz: no score yet.", d2 = m.t20 != null ? "20-question Paper 2 test: " + rnd(m.t20) + "%." : "20-question Paper 2 test: no score yet.";
    var bal = (m.dq != null && m.t20 != null) ? (m.p2Share === 55 ? "Paper 1 is your softer side, so give it a larger share than usual." : m.p2Share === 78 ? "Paper 2 is your softer side, so lean harder on it." : "Both papers are close, so split your time by marks.") : "Take the quizzes above so this split is based on your scores, not a guess.";
    out.push({ title: "Paper 1 and Paper 2: how to split your effort", find: bal,
      pts: [d1, d2, "Suggested split of study time: about " + (100 - m.p2Share) + "% Paper 1 and " + m.p2Share + "% Paper 2.", "Exam pattern: Paper 1 has 50 questions (100 marks) and Paper 2 has 100 questions (200 marks), in one 3-hour sitting."],
      acts: [m.dq == null ? dqAct : P1[0], m.t20 == null ? t20Act : P2[0], P1[0], P2[0]].filter(function (x, i, a) { return a.indexOf(x) === i; }).slice(0, 3) });

    /* 5 */
    var acts5 = m.weak.map(function (w) { return { t: "Practise " + w.short, unit: w }; });
    if (m.unitsKnown >= 2) out.push({ title: "Your strongest and weakest areas", find: m.weak.length ? "Your practice shows where marks are leaking: start with " + m.weak[0].short + "." : "None of your practised units is below 65%: keep widening, and keep testing the units you have not touched.",
      pts: (m.weak.length ? m.weak.map(function (w) { return "Needs work: " + w.short + " (" + rnd(w.pct) + "% over " + w.a + " questions)."; }) : []).concat(m.strong.map(function (s) { return "Strong: " + s.short + " (" + rnd(s.pct) + "%)."; })).concat(["Re-attempt your Mistakes in a weak unit a week after you first miss them."]),
      acts: acts5.length ? acts5 : [["Practise MCQs", "#mcqs"]] });
    else out.push({ title: "Your strongest and weakest areas", find: "The site needs a little practice from you before it can name your weak units.",
      pts: ["Answer at least 5 questions in a few modules and this section will list your weakest and strongest areas using your own results.", "Until then, start with the units you feel least sure about."], acts: [["Practise Paper 2", "#law"], ["Practise Paper 1", "#paper1"]] });

    /* 6 */
    var mins = rnd(m.hrs * 60), split = [[50, 25, 15, 10], [40, 30, 20, 10], [25, 35, 20, 20], [10, 40, 20, 30]][m.si];
    var bl = function (p) { return Math.max(5, rnd(mins * p / 100 / 5) * 5); };
    out.push({ title: "Your daily study blueprint", find: "A " + m.hrs + "-hour day, shaped for the " + m.stage.name.toLowerCase() + " stage.",
      pts: ["Learn new material: about " + bl(split[0]) + " minutes (Syllabus and Notes).", "Practise MCQs: about " + bl(split[1]) + " minutes.", "Revise earlier topics: about " + bl(split[2]) + " minutes.", "Review mistakes: about " + bl(split[3]) + " minutes.", "Work in 25-minute rounds with the Pomodoro timer, and set your Daily goal in Practice questions to " + m.goal + " questions."],
      acts: [{ t: "See the Pomodoro Technique", slide: "Pomodoro Technique" }, ["Open Practice questions", "#mcqs"]] });

    /* 7 */
    var rv = g("revise").v;
    out.push({ title: "Your revision system", find: rv < 2 ? "Revision is where you can gain fastest: a simple fixed rhythm beats long, occasional sessions." : "You already revise with some structure. The aim now is to make it spaced and tied to your mistakes.",
      pts: ["Spaced reviews: revisit each topic at day 1, day 3, day 7 and day 21.", "Weekly: one hour on your Mistakes list, and one hour on the units you rated weakest.", rv < 2 ? "Start small: a ten-minute recall at the end of each study day is enough to begin." : "Every fourth week, do a mixed-topic set to check that older units have not faded.", "Keep one page of formulas, tests, case names and sections per unit, and add to it from your mistakes."],
      acts: [["Revise from the Notes", "#notes"], ["Re-attempt Mistakes", "#mcqs"]] });

    /* 8 */
    var mp = m.days < 30 ? (m.C < 40 ? "2 full-length mocks a week alongside daily topic-wise practice, because time is short" : "3 full-length mocks a week")
      : m.C < 40 ? "topic-wise tests first, then a full mock every two weeks once about half the syllabus is covered"
      : m.days < 90 ? "2 full-length mocks a week" : m.days < 180 ? "1 full-length mock a week" : "a full mock every two weeks, rising to weekly as the exam nears";
    out.push({ title: "Your practice and mock rhythm", find: m.mocksN ? "You have completed " + m.mocksN + " mock" + (m.mocksN === 1 ? "" : "s") + " here. Keep them regular and always review them." : "You have not taken a mock here yet. Take one soon: it shows you the exam, not just your knowledge.",
      pts: ["For your timeline, aim for " + mp + ".", "Daily: " + m.goal + " MCQs, mixing the weakest units with fresh ones.", "After each mock, spend as long reviewing it as you did taking it.", "Use previous-year questions to see how the exam actually asks things.", "Use the 7-minute 20-question test and the Daily Quiz as quick checks between mocks."],
      acts: [["Take a mock test", "#mock-tests"], ["Previous-year questions", "#pyq"], t20Act] });

    /* 9 */
    var spd = g("loss").v === 3 ? "Time is one of your named leaks, so build speed deliberately." : "Speed matters for everyone: it is what turns knowledge into marks.";
    out.push({ title: "Your accuracy and speed playbook", find: spd,
      pts: ["There are 150 questions in 3 hours, so you have about 70 seconds each on average.", "Use two passes: answer what you know quickly, mark the rest, then return.", "Answer every question: the site’s mocks follow the exam in having no negative marking.", L2.fix[0]],
      acts: [["Take a timed mock", "#mock-tests"], dqAct] });

    /* 10 */
    var steps = [];
    steps.push("Days 1 to 2: " + (m.dq == null || m.t20 == null ? "set your baselines: " + (m.dq == null ? "take the Daily Quiz" : "") + (m.dq == null && m.t20 == null ? " and " : "") + (m.t20 == null ? "take the 20-question test." : ".") : "open the Syllabus and mark the units you could explain without notes."));
    steps.push("Days 2 to 5: " + (m.weak.length ? "practise " + m.weak.map(function (w) { return w.short; }).join(", ") + " (20 MCQs each) and re-attempt every Mistake." : "pick your three least-confident units and do 20 MCQs on each, then re-attempt the Mistakes."));
    steps.push("Days 4 to 7: work on your main leak (" + L.name.toLowerCase() + ") using the steps in analysis 3.");
    steps.push("By day 7: " + (m.mocksN ? "take your next mock and log every wrong answer." : "take Mock Test 1 under exam conditions."));
    steps.push("Every day: " + m.goal + " MCQs, Pomodoro rounds, and a short Mistakes review.");
    steps.push("Around day 14, or after about " + RECALC_AT + " new questions: recalculate your strategy below.");
    out.push({ title: "Your next 14 days", find: "Do these in order. They are built from your answers and your results.", pts: steps,
      acts: [m.dq == null ? dqAct : ["Open the Syllabus", "#syllabus"], ["Practise MCQs", "#mcqs"], ["Take a mock test", "#mock-tests"]] });
    return out;
  }

  /* ---------- 5. the window (same look as the Paper 1 quiz, no timer) ---------- */
  var css = [
    ".ese-box{width:min(860px,100%)}.ese-box.ese-q{width:min(720px,100%)}",
    ".ese-auto{margin:6px 0 0;font-size:.8125rem;color:var(--ac-d,#1f3a85);font-weight:700}.ese-ctx{margin:-4px 0 10px;font-size:.8125rem;color:var(--mut,#5b6670)}",
    ".ese-op-auto{background:var(--tint,#e3e8fb);border-color:var(--ac2,var(--ac,#2d4aa9))}.ese-op-auto small{display:block;margin-top:2px;font-size:.75rem;font-weight:800;letter-spacing:.06em;color:var(--ac-d,#1f3a85)}",
    ".ese-disc{margin:14px 0 0;padding-top:10px;border-top:1px solid var(--line,#e1ebe7);font-size:.75rem;line-height:1.5;color:var(--mut,#5b6670)}",
    ".ese-work{display:grid;gap:12px;margin:22px 4px 8px}.ese-work p{margin:0;display:flex;align-items:center;gap:10px;font-weight:700;opacity:.35;transition:opacity .35s}.ese-work p.on{opacity:1}.ese-work i{flex:none;width:22px;height:22px;border-radius:50%;background:var(--ac,#2d4aa9);color:#fff;font-style:normal;display:grid;place-items:center;font-size:.75rem}",
    ".ese-hero{display:grid;grid-template-columns:auto 1fr;gap:22px;align-items:center;margin:14px 0 6px;padding:18px;border:1px solid var(--ac2,var(--line,#e1ebe7));border-radius:18px;background:linear-gradient(135deg,var(--tint,#e3e8fb),var(--surface,#fff) 70%)}",
    ".ese-ring{position:relative;width:132px;height:132px}.ese-ring svg{width:100%;height:100%;transform:rotate(-90deg)}.ese-ring circle{fill:none;stroke-width:10;stroke-linecap:round}.ese-ring .bg{stroke:var(--chip,#e8eeec)}.ese-ring .fg{stroke:var(--ac,#2d4aa9);transition:stroke-dashoffset .9s ease}",
    ".ese-ring b{position:absolute;inset:0;display:grid;place-content:center;text-align:center;font-size:2.4rem;line-height:1;font-weight:800;letter-spacing:-.04em;color:var(--ac-d,#1f3a85)}.ese-ring b small{display:block;margin-top:4px;font-size:.6875rem;font-weight:800;letter-spacing:.09em;color:var(--text2,#44505c)}",
    ".ese-hero h3{margin:0;font-size:1.35rem;letter-spacing:-.02em;outline:none}.ese-hero p{margin:4px 0 12px;font-size:.9375rem;line-height:1.5;color:var(--text2,#44505c)}",
    ".ese-meters{display:grid;grid-template-columns:1fr 1fr;gap:8px 18px}.ese-meters div span{display:flex;justify-content:space-between;font-size:.75rem;font-weight:700;color:var(--text2,#44505c)}.ese-meters div i{display:block;height:6px;border-radius:99px;background:var(--chip,#e8eeec);margin-top:4px;overflow:hidden}.ese-meters div i b{display:block;height:100%;border-radius:99px;background:var(--ac,#2d4aa9)}",
    ".ese-sec{margin:12px 0 0;padding:16px 16px 14px;border:1px solid var(--line,#e1ebe7);border-radius:16px;background:var(--surface,#fff)}",
    ".ese-sec header{display:flex;align-items:center;gap:10px}.ese-n{flex:none;display:grid;place-items:center;min-width:34px;height:26px;padding:0 8px;border-radius:99px;background:var(--tint,#e3e8fb);color:var(--ac-d,#1f3a85);font-size:.75rem;font-weight:800;letter-spacing:.06em}.ese-sec h3{margin:0;font-size:1.0625rem;letter-spacing:-.01em}",
    ".ese-find{margin:10px 0 6px;font-size:.9375rem;font-weight:700;line-height:1.5}.ese-sec ul{margin:6px 0 0;padding:0 0 0 18px;display:grid;gap:5px;font-size:.875rem;line-height:1.5;color:var(--text2,#44505c)}.ese-sec li::marker{color:var(--ac,#2d4aa9)}",
    ".ese-acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.ese-act{display:inline-flex;align-items:center;min-height:38px;padding:0 14px;border:1px solid var(--ac2,var(--line2,#c9d6d1));border-radius:99px;background:var(--surface,#fff);color:var(--ac-d,#1f3a85);font:inherit;font-size:.8125rem;font-weight:800;text-decoration:none;cursor:pointer}.ese-act:hover{background:var(--tint,#e3e8fb)}.ese-act:focus-visible{outline:3px solid var(--ac,#2d4aa9);outline-offset:2px}",
    ".ese-re{margin:16px 0 0;padding:16px;border:1px dashed var(--ac2,var(--line2,#c9d6d1));border-radius:16px;background:var(--soft,#f1f6f4)}.ese-re h3{margin:0 0 4px;font-size:1.0625rem}.ese-re p{margin:0 0 8px;font-size:.875rem;color:var(--text2,#44505c)}.ese-bar{height:8px;border-radius:99px;background:var(--chip,#e8eeec);overflow:hidden;margin:8px 0 12px}.ese-bar i{display:block;height:100%;background:var(--ac,#2d4aa9);border-radius:99px}.ese-re ul{margin:8px 0 12px;padding-left:18px;font-size:.875rem;display:grid;gap:4px}",
    ".ese-re.ready{border-style:solid;border-color:var(--ac,#2d4aa9)}",
    "@media(max-width:560px){.ese-hero{grid-template-columns:1fr;justify-items:center;text-align:center}.ese-meters{grid-template-columns:1fr;width:100%}.ese-ring{width:116px;height:116px}}"
  ].join("");
  var st = doc.createElement("style"); st.id = "ese-css"; st.textContent = css; doc.head.appendChild(st);

  var S, snap, ans, step, recalc, ov, box, opener = slide.querySelector(".cc-card"), busy = false, prevOverflow = "", timers = [];
  function pause() { root.dispatchEvent(new Event("cc-pause")); }
  function resume() { root.dispatchEvent(new Event("cc-resume")); }
  function say(t) { if (window.announce) window.announce(t); }
  function head(sub) { return '<div class="nlq-h"><div><h2 id="ese-title">Exam Strategy Engine</h2><p>' + esc(sub) + '</p></div><button type="button" class="nlq-x" aria-label="Close">✕</button></div>'; }
  function disc() { return '<p class="ese-disc">' + esc(DISC) + "</p>"; }
  function setBox(html, cls) { box.className = "nlq-box ese-box " + (cls || ""); box.innerHTML = html; }

  /* a question page */
  function paintQ(focus) {
    var q = QS[step], opts = optionsFor(q, S), cur = ans[q.id], sel = -1, total = QS.length;
    if (cur) { sel = opts.findIndex(function (o) { return o.auto ? !!cur.auto : (!cur.auto && o.v === cur.v && o.t === cur.t); }); if (sel < 0) sel = opts.findIndex(function (o) { return !o.auto && o.v === cur.v; }); }
    if (sel < 0 && opts[0] && opts[0].auto) sel = 0;
    var picked = sel > -1;
    setBox(head(step === 0 ? "A few quick questions. Wherever the site already knows the answer, it fills it in for you." : "Reading your preparation") +
      '<div class="nlq-meta"><span>Question ' + (step + 1) + " of " + total + '</span><span>No timer</span></div>' +
      '<div class="nlq-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + (step + 1) + '"><i style="width:' + ((step + 1) / total * 100) + '%"></i></div>' +
      '<p class="nlq-q" id="ese-q">' + esc(q.q) + "</p>" + (q.ctx ? '<p class="ese-ctx">' + esc(q.ctx) + "</p>" : "") +
      '<fieldset class="nlq-o" aria-labelledby="ese-q"><legend>Choose one</legend>' +
      opts.map(function (o, k) { return '<label class="nlq-op' + (o.auto ? " ese-op-auto" : "") + '"><input type="radio" name="ese" value="' + k + '"' + (k === sel ? " checked" : "") + "><span>" + (o.auto ? "<small>FOUND ON THIS DEVICE</small>" : "") + esc(o.t) + "</span></label>"; }).join("") + "</fieldset>" +
      (q.score ? '<p class="nlq-hint">Not taken it yet? Choose “I haven’t tried it yet”: your strategy will plan it in as a first step.</p>' : "") +
      '<div class="nlq-f"><button type="button" class="nlq-b" data-a="prev"' + (step ? "" : " disabled") + '>‹ Previous</button><span class="sp"></span><button type="button" class="nlq-b pri" data-a="next"' + (picked ? "" : " disabled") + ">" + (step === total - 1 ? "Build my strategy" : "Next ›") + "</button></div>" + disc(), "ese-q");
    box._opts = opts;
    if (focus) { var f = box.querySelector("input:checked") || box.querySelector("input"); f && f.focus({ preventScroll: true }); }
  }
  function choose(k) {
    var o = box._opts[k], q = QS[step]; if (!o) return;
    ans[q.id] = { v: o.v, num: o.num, auto: !!o.auto, t: o.t };
    var nx = box.querySelector('[data-a="next"]'); if (nx) nx.disabled = false;
  }
  function next() { if (!ans[QS[step].id]) return; if (step === QS.length - 1) return finish(); step++; paintQ(true); }

  /* the short "working it out" screen, then the strategy */
  function finish() {
    var steps = ["Reading your preparation", "Checking your performance", "Weighing your time", "Finding where marks are leaking", "Building your strategy"];
    setBox(head("Building your strategy") + '<div class="ese-work" role="status">' + steps.map(function (t) { return "<p><i>✓</i>" + t + "</p>"; }).join("") + "</div>" + disc(), "ese-q");
    var ps = box.querySelectorAll(".ese-work p"); [].forEach.call(ps, function (p, i) { timers.push(setTimeout(function () { p.classList.add("on"); }, 120 + i * 260)); });
    timers.push(setTimeout(function () { save(); paintDash(); }, 120 + steps.length * 260 + 250));
  }
  function save() {
    var m = analyse(ans, S), next = { v: 1, at: Date.now(), ans: ans, m: lite(m, S), base: S.attempts, prev: snap ? { at: snap.at, m: snap.m } : null };
    ls(KEY, next); snap = next; refreshSlide();
  }

  /* the strategy dashboard */
  function diffs(m, S) {
    var ref = snap.prev || snap, a = ref.m, b = lite(m, S), L = [], arrow = function (x, y, u) { return x + (u || "") + " → " + y + (u || ""); };
    if (a.R !== b.R) L.push("Readiness: " + arrow(a.R, b.R) + " (" + (b.R > a.R ? "+" : "") + (b.R - a.R) + ")");
    if (a.stage !== b.stage) L.push("Stage: " + a.stage + " → " + b.stage);
    if (b.att - a.att !== 0) L.push("Practice volume: " + (b.att > a.att ? "+" : "") + (b.att - a.att) + " questions answered");
    if (a.acc != null && b.acc != null && a.acc !== b.acc) L.push("Practice accuracy: " + arrow(a.acc, b.acc, "%"));
    if (a.dq != null && b.dq != null && a.dq !== b.dq) L.push("Daily Quiz: " + arrow(a.dq, b.dq, "%"));
    if (a.t20 != null && b.t20 != null && a.t20 !== b.t20) L.push("20-question Paper 2 test: " + arrow(a.t20, b.t20, "%"));
    if (b.mocks !== a.mocks) L.push("Mocks completed: " + arrow(a.mocks, b.mocks));
    (a.weak || []).forEach(function (w) { var s = S.byUnit[w.u]; if (s && s.a >= 5) { var now = rnd(s.ok / s.a * 100); if (now !== w.pct) L.push(short(w.u) + ": " + arrow(w.pct, now, "%")); } });
    return { L: L, since: ref.at };
  }
  function actHtml(a) {
    if (Array.isArray(a)) return '<a class="ese-act" href="' + esc(a[1]) + '">' + esc(a[0]) + " →</a>";
    if (a.slide) return '<a class="ese-act" href="#home" data-slide="' + esc(a.slide) + '"' + (a.open ? ' data-open="1"' : "") + ">" + esc(a.t) + " →</a>";
    if (a.unit) return '<a class="ese-act" href="#' + (a.unit.set === 1 ? "paper1" : "law") + '" data-set="' + a.unit.set + '" data-i="' + a.unit.i + '">' + esc(a.t) + " →</a>";
    return "";
  }
  function paintDash() {
    ans = refreshAuto(ans, S);
    var m = analyse(ans, S), secs = sections(m, ans, S), d = diffs(m, S), newQ = Math.max(0, S.attempts - (snap.base || 0)), ready = newQ >= RECALC_AT, C = 2 * Math.PI * 54;
    var meters = [["Syllabus covered", m.C], ["Performance", rnd(m.P)], ["Consistency", rnd(m.K)], ["Time fit", rnd(m.TS)]];
    setBox(head("Your personalised NET strategy · built " + sd(snap.at)) +
      '<div class="ese-hero"><div class="ese-ring" role="img" aria-label="Readiness ' + m.R + ' out of 100"><svg viewBox="0 0 120 120"><circle class="bg" cx="60" cy="60" r="54"/><circle class="fg" cx="60" cy="60" r="54" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + C.toFixed(1) + '"/></svg><b>' + m.R + "<small>READINESS</small></b></div>" +
      "<div><h3>" + esc(m.stage.name) + " stage</h3><p>" + esc(m.stage.line) + '</p><div class="ese-meters">' + meters.map(function (x) { return "<div><span>" + x[0] + "<b>" + x[1] + '%</b></span><i><b style="width:' + x[1] + '%"></b></i></div>'; }).join("") + "</div></div></div>" +
      secs.map(function (s, i) { return '<section class="ese-sec" aria-labelledby="ese-h' + i + '"><header><span class="ese-n">' + String(i + 1).padStart(2, "0") + '</span><h3 id="ese-h' + i + '">' + esc(s.title) + '</h3></header><p class="ese-find">' + esc(s.find) + "</p><ul>" + s.pts.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + '</ul><div class="ese-acts">' + s.acts.map(actHtml).join("") + "</div></section>"; }).join("") +
      '<section class="ese-re' + (ready ? " ready" : "") + '" aria-labelledby="ese-re"><h3 id="ese-re">Recalculate my strategy</h3><p>' + (ready ? "You have answered " + newQ + " new questions since this strategy was built. It is a good time to recalculate." : "Your strategy adapts as you practise. After about " + RECALC_AT + " new questions, recalculate to see what changed.") + '</p><div class="ese-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + RECALC_AT + '" aria-valuenow="' + Math.min(newQ, RECALC_AT) + '"><i style="width:' + Math.min(100, newQ / RECALC_AT * 100) + '%"></i></div><p><b>' + Math.min(newQ, RECALC_AT) + " of " + RECALC_AT + "</b> new questions since " + sd(snap.at) + ".</p>" +
      "<p><b>What has changed since " + sd(d.since) + "</b></p>" + (d.L.length ? "<ul>" + d.L.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "<p>Nothing has moved yet. Practise, take a quiz or a mock, and come back.</p>") +
      '<div class="nlq-f"><span class="sp"></span><button type="button" class="nlq-b" data-a="close">Close</button><button type="button" class="nlq-b pri" data-a="recalc">Recalculate my strategy</button></div></section>' + disc(), "");
    var fg = box.querySelector(".fg"); timers.push(setTimeout(function () { if (fg) fg.style.strokeDashoffset = (C * (1 - m.R / 100)).toFixed(1); }, 60));
    var h = box.querySelector(".ese-hero h3"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    ov.scrollTop = 0; say("Your strategy is ready. Readiness " + m.R + " out of 100, " + m.stage.name + " stage.");
  }

  /* ---------- 6. opening, closing, actions ---------- */
  function close() {
    timers.forEach(clearTimeout); timers = [];
    doc.removeEventListener("keydown", onKey, true); ov && ov.remove(); doc.body.style.overflow = prevOverflow; busy = false;
    opener && opener.focus && opener.focus({ preventScroll: true }); resume(); refreshSlide();
  }
  function goSlide(label, openIt) {
    var all = [].slice.call(root.querySelectorAll(".cc-slide")), i = all.findIndex(function (s) { return s.getAttribute("data-label") === label; }), b = root.querySelectorAll(".cc-opt-btn")[i];
    if (i < 0) return; root.scrollIntoView({ behavior: "smooth", block: "center" }); if (b) b.click();
    if (openIt) setTimeout(function () { var c = all[i].querySelector(".cc-card"); c && c.click(); }, 900);
  }
  function jump(h) { var t = doc.querySelector(h); if (!t) return; if (location.hash !== h) { try { history.pushState(null, "", h); } catch (e) { location.hash = h; } } t.scrollIntoView({ behavior: "smooth", block: "start" }); }
  function onClick(e) {
    var b = e.target.closest("button, a"); if (!b || !box.contains(b)) return;
    if (b.classList.contains("nlq-x")) return close();
    var a = b.dataset.a;
    if (a === "prev") { if (step > 0) { step--; paintQ(true); } return; }
    if (a === "next") return next();
    if (a === "close") return close();
    if (a === "recalc") { recalc = true; step = 0; ans = refreshAuto(ans, S); paintQ(true); return; }
    if (b.tagName === "A") {
      if (b.dataset.slide) { e.preventDefault(); close(); goSlide(b.dataset.slide, !!b.dataset.open); return; }
      if (b.dataset.set) { e.preventDefault(); var set = b.dataset.set, i = +b.dataset.i; close(); jump(set === "1" ? "#paper1" : "#law");
        setTimeout(function () { var c = doc.querySelector((set === "1" ? "#p1-grid" : "#mod-grid") + ' .mod[data-i="' + i + '"]'); c && c.click(); }, 450); return; }
      var h = b.getAttribute("href");
      if (h && h.charAt(0) === "#") { e.preventDefault(); close(); setTimeout(function () { jump(h); }, 60); return; }
      close();                                          /* a normal page link: let the browser follow it */
    }
  }
  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key === "Tab") { var f = [].filter.call(box.querySelectorAll("button,input,a[href],[tabindex]"), function (el) { return !el.disabled && el.tabIndex >= 0 && el.offsetParent !== null; }); if (!f.length) return; var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && doc.activeElement === z) { e.preventDefault(); a.focus(); } return; }
    if (!box.classList.contains("ese-q") || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key.toLowerCase();
    if (k >= "1" && k <= "9") { var inp = box.querySelectorAll('input[name="ese"]')[+k - 1]; if (inp) { inp.checked = true; inp.dispatchEvent(new Event("change", { bubbles: true })); inp.focus({ preventScroll: true }); e.preventDefault(); } }
    else if (k === "n" || k === "enter") { var nx = box.querySelector('[data-a="next"]'); if (nx && !nx.disabled && doc.activeElement.tagName !== "BUTTON") { e.preventDefault(); nx.click(); } }
    else if (k === "p") { var pv = box.querySelector('[data-a="prev"]'); pv && !pv.disabled && pv.click(); }
  }
  function getExam() { return fetch("exam-dates.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }
  function open() {
    if (busy) return; busy = true; pause();
    Promise.all([window.loadBank(), getExam()]).then(function (r) {
      S = signals(r[0], r[1]); snap = ls(KEY); if (snap && !(snap.v === 1 && snap.ans)) snap = null;
      ans = snap ? refreshAuto(snap.ans, S) : {}; step = 0; recalc = false; prevOverflow = doc.body.style.overflow;
      ov = doc.createElement("div"); ov.className = "nlq-ov"; box = doc.createElement("div"); box.className = "nlq-box ese-box"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-labelledby", "ese-title");
      ov.appendChild(box); doc.body.appendChild(ov); doc.body.style.overflow = "hidden";
      box.addEventListener("click", onClick);
      box.addEventListener("change", function (e) { if (e.target.name === "ese") choose(+e.target.value); });
      doc.addEventListener("keydown", onKey, true);
      if (snap) paintDash(); else { ans = refreshAuto({}, S); paintQ(true); say("Exam Strategy Engine opened. " + QS.length + " quick questions."); }
    }).catch(function () { busy = false; resume(); });
  }

  /* ---------- 7. the carousel slide (label, button, and a live preview that shows the student's own numbers) ---------- */
  function refreshSlide() {
    var d = ls(KEY), tag = slide.querySelector(".cc-tag"), cta = slide.querySelector(".cc-cta"), ring = slide.querySelector(".ese-mini b"), rows = slide.querySelectorAll(".ese-rows i b"), note = slide.querySelector(".ese-note");
    var ok = d && d.v === 1 && d.m;
    if (tag) tag.textContent = ok ? "YOUR STRATEGY · READINESS " + d.m.R + "/100" : "PERSONAL NET STRATEGY · " + QS.length + " QUICK QUESTIONS";
    if (cta) cta.textContent = ok ? "Open my strategy →" : "Build my strategy →";
    var btns = root.querySelectorAll(".cc-opt-btn"), all = [].slice.call(root.querySelectorAll(".cc-slide")), i = all.indexOf(slide), s = btns[i] && btns[i].querySelector(".co-s"); if (s && tag) s.textContent = tag.textContent;
    if (ok && ring) {
      ring.firstChild.textContent = d.m.R;
      var fg = slide.querySelector(".ese-mini .fg"); if (fg) fg.style.strokeDashoffset = (339.3 * (1 - d.m.R / 100)).toFixed(1);
      var gapv = d.m.weak && d.m.weak.length ? 100 - d.m.weak[0].pct : 100 - d.m.P;
      [d.m.C, d.m.P, d.m.TS != null ? d.m.TS : d.m.K, clamp(gapv, 0, 100)].forEach(function (v, k) { if (rows[k]) rows[k].style.width = v + "%"; });
    }
    if (note) note.textContent = ok ? (d.m.weak && d.m.weak.length ? "Weakest unit: " + short(d.m.weak[0].u) : "Stage: " + d.m.stage) : "Sample preview";
  }
  refreshSlide();
  root.querySelector(".cc-stage").addEventListener("click", function (e) {
    var s = e.target.closest(".cc-slide");
    if (e.defaultPrevented || s !== slide || !slide.classList.contains("is-active")) return;
    e.preventDefault(); open();
  });
})();
