/* NET Law-Verse phone + tablet app: AIBE, AILET and CUET PG as real in-app sections, plus the Revise screen.
   Loaded on demand by m-app.js the first time #/aibe, #/ailet, #/cuet or #/revise is opened.

   Each exam gets the same structure so an aspirant learns it once:
     Hub (#/<exam>)        pattern at a glance, countdown where the date is published, your progress, tiles, mocks, guides
     Guide / Syllabus / Practice / Revision notebook / FAQ  -> the website's own pages shown inside the app (?embed=1)
     Mocks (#/<exam>/mocks) native list with saved status;  #/<exam>/mock/N runs the website's own mock engine
     Notes (#/<exam>/notes) AIBE: 216 chapter notes, searchable, by subject.  AILET / CUET PG: guides + related notes
   Everything saved uses the same localStorage keys as the website pages (aibe-mock-N-result, aibe-practice-v1 ...),
   so progress is shared between the website and the app. Nothing is stored on a server. */
(function () {
"use strict";
var N = window.NLM; if (!N) return;
var esc = N.esc, sv = N.sv, P = N.P, I = N.I, ico = N.ico, R = N.R, A = N.A, screen = N.screen, tbar = N.tbar, ls = N.ls, go = N.go, toast = N.toast, XM = N.XM;
var SITE = N.SITE_URL;
var EMB = '?embed=1';

/* ---------- the three exams ---------- */
var EX = {
  aibe: {
    k: 'aibe', dir: 'aibe/', name: 'AIBE', title: 'AIBE prep', full: 'All India Bar Examination', kick: 'Bar Council of India · Free', icon: 'brief', cat: 'AIBE', mocks: 6,
    lead: 'The Bar exam, organised: a 19-subject syllabus, chapter notes, practice, full mock tests and a revision notebook that fills itself with your mistakes.',
    facts: [['100', 'MCQs'], ['100', 'marks'], ['19', 'subjects'], ['None', 'negative']],
    pattern: '100 questions · 100 marks · no negative marking. Check the Bar Council of India notification for the current pattern.',
    note: 'Exam dates, application windows and fees change with every edition and are announced by the Bar Council of India. Check the official notification before you plan around a date.',
    pages: { what: ['what-is-aibe.html', 'What is AIBE?', 'Pattern, marking, pass marks, eligibility and the Certificate of Practice'], syllabus: ['syllabus.html', 'Syllabus', '19 subjects with a tracker'], practice: ['practice.html', 'Practice Arena', 'MCQs with the provision and the trap'], revision: ['practice.html#mistakes', 'Revision notebook', 'Every wrong answer, saved for you'], faq: ['faq.html', 'AIBE FAQ', 'Short answers to common questions'] },
    share: { t: 'AIBE preparation', u: SITE + 'aibe/', d: 'Free AIBE preparation: 19-subject syllabus tracker, chapter notes, practice, full mock tests and a revision notebook. No sign-up.' }
  },
  ailet: {
    k: 'ailet', dir: 'ailet/', name: 'AILET', title: 'AILET LL.M. prep', full: 'NLU Delhi LL.M. entrance', kick: 'NLU Delhi · LL.M. · Free', icon: 'target', cat: 'AILET LLM', mocks: 8,
    lead: 'The NLU Delhi LL.M. entrance, step by step: the branch-wise syllabus, practice, eight full-length mocks with a time meter, and a revision notebook of your mistakes.',
    facts: [['100', 'MCQs'], ['120', 'minutes'], ['−0.25', 'per wrong'], ['8', 'mocks']],
    pattern: '100 questions · 120 minutes · 0.25 deducted for each wrong answer.',
    date: Date.UTC(2026, 11, 13, 8, 30, 0), dateLabel: 'AILET LL.M. · Sun 13 Dec 2026, 2 PM',
    note: 'Date as published on the AILET page of this site. Check the official NLU Delhi website for any change and for your admit card.',
    pages: { what: ['what-is-ailet.html', 'What is AILET?', 'Pattern, marking, dates, eligibility and seats'], syllabus: ['syllabus.html', 'Syllabus', 'Branch-wise topics with a tracker'], practice: ['practice.html', 'Practice Arena', 'MCQs with reasoning and traps'], revision: ['practice.html#mistakes', 'Revision notebook', 'Every wrong answer, saved for you'], faq: ['faq.html', 'AILET FAQ', 'Eligibility, negative marking and more'] },
    share: { t: 'AILET LL.M. preparation', u: SITE + 'ailet/', d: 'Free AILET LL.M. preparation: syllabus tracker, practice, eight full-length mock tests and a revision notebook. No sign-up.' }
  },
  cuet: {
    k: 'cuet', dir: 'cuet-pg/', name: 'CUET PG', title: 'CUET PG LL.M. prep', full: 'Central Universities LL.M. entrance', kick: 'NTA · LL.M. · Free', icon: 'target', cat: 'CUET PG', mocks: 8,
    lead: 'The CUET PG Law paper, organised: pattern, 33-area syllabus tracker, paper analysis, participating universities, practice, eight full-length mocks and a revision notebook.',
    facts: [['75', 'MCQs'], ['300', 'marks'], ['+4 / −1', 'marking'], ['90', 'minutes']],
    pattern: '75 compulsory questions · 300 marks · +4 for a right answer, −1 for a wrong one · 90 minutes.',
    date: Date.UTC(2027, 2, 1, 18, 30, 0), dateLabel: 'CUET PG window starts · 2 Mar 2027 (tentative)',
    note: 'All dates are tentative until the NTA Information Bulletin is out. The Law paper has its own date in the subject-wise timetable. Check exams.nta.nic.in/cuet-pg.',
    pages: { what: ['what-is-cuet-pg.html', 'What is CUET PG LLM?', 'Pattern, marking, eligibility, fee and admission'], syllabus: ['syllabus.html', 'Syllabus', '33 subject areas with a tracker'], analysis: ['analysis.html', 'Paper analysis', 'Difficulty, trends and a score planner'], universities: ['universities.html', 'Universities', 'Institutions that use the score'], practice: ['practice.html', 'Practice Arena', 'MCQs with reasoning and traps'], revision: ['practice.html#mistakes', 'Revision notebook', 'Every wrong answer, saved for you'], faq: ['faq.html', 'CUET PG FAQ', 'Short answers to common questions'] },
    share: { t: 'CUET PG LL.M. preparation', u: SITE + 'cuet-pg/', d: 'Free CUET PG (LL.M.) preparation: syllabus tracker, paper analysis, universities list, eight full-length mock tests and a revision notebook. No sign-up.' }
  }
};

/* ---------- helpers ---------- */
function curEx() { var m = /^#\/(aibe|ailet|cuet)/.exec(location.hash); return m ? m[1] : null; }
function here(k) { return curEx() === k; }
A.xexams = function () { go('/exams'); };
A.xhub = function () { var k = curEx(); go(k ? '/' + k : '/exams'); };
A.xmocks = function () { var k = curEx(); go(k ? '/' + k + '/mocks' : '/mocks'); };
A.xnotes = function () { var k = curEx(); go(k ? '/' + k + '/notes' : '/notes'); };
var fnum = function (n) { return N.fnum ? N.fnum(n) : String(n); };

function frame(o) {
  screen({
    top: tbar(o.title, { sub: o.sub || '', la: o.la || 'xhub', share: o.share || null }),
    flush: true, exam: true, cls: 'cmv',
    body: '<iframe class="cmf" title="' + esc(o.title) + '" src="' + o.src + '" allow="clipboard-write; web-share"></iframe>'
  });
}

/* your numbers: practice done, questions to revise, mocks finished (read from the same keys the website pages write) */
function prog(k) {
  var d = ls.get(k + '-practice-v1', null) || {}, done = 0, bad = 0;
  Object.keys(d.sets || {}).forEach(function (s) {
    var q = (d.sets[s] && d.sets[s].q) || {};
    Object.keys(q).forEach(function (n) { var x = q[n]; if (x && x.r) { done++; if (x.s && !x.c) bad++; } });
  });
  var md = 0, c = EX[k];
  if (c && XM[k]) for (var n = 1; n <= c.mocks; n++) { if (ls.get(XM[k].p + n + '-result', null)) md++; }   /* CLAT PG has its own mock screens, so only practice is counted for it */
  return { done: done, bad: bad, md: md };
}
function best(k) {
  var b = null, c = EX[k];
  for (var n = 1; n <= c.mocks; n++) { var r = ls.get(XM[k].p + n + '-result', null); if (r && (b === null || r.pct > b)) b = r.pct; }
  return b;
}
function daysTo(t) { return Math.ceil((t - Date.now()) / 864e5); }
function fmtDate(t) { return new Date(t + 19800000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }); }

/* ---------- hub ---------- */
function hub(k) {
  var c = EX[k], p = prog(k), bst = best(k);
  ls.set('nl-m-lastex', k);
  var cd = '';
  if (c.date) {
    var d = daysTo(c.date);
    cd = d > 0
      ? '<div class="xh-cd"><b>' + d + '</b><span>day' + (d > 1 ? 's' : '') + ' to go<small>' + esc(c.dateLabel) + '</small></span></div>'
      : '<div class="xh-cd"><b class="now">' + (d === 0 ? 'Today' : 'Done') + '</b><span><small>' + esc(c.dateLabel) + '</small></span></div>';
  }
  var tiles = [['what', 'info', c.pages.what[1], 'Pattern, marking, eligibility'], ['syllabus', 'book', 'Syllabus', 'Topics with a tracker'], ['notes', 'file', k === 'aibe' ? 'Chapter notes' : 'Notes & guides', k === 'aibe' ? '216 chapters, 19 subjects' : 'Guides and related notes'], ['practice', 'pencil', 'Practice', 'MCQs with reasoning'], ['mocks', 'test', 'Mock tests', c.mocks + ' full-length papers'], ['revision', 'refresh', 'Revision', p.bad ? p.bad + ' to revise' : 'Your mistakes notebook']];
  if (c.pages.analysis) tiles.push(['analysis', 'bars', 'Paper analysis', 'Trends and score planner']);
  if (c.pages.universities) tiles.push(['universities', 'inst', 'Universities', 'Who uses the score']);
  tiles.push(['faq', 'help', 'FAQ', 'Quick answers']);
  var path = tiles.map(function (t, i) {
    return '<a class="xh-t" href="#/' + k + '/' + t[0] + '"><span class="ico" style="--c:var(' + (i % 2 ? '--c2-deep' : '--c3-deep') + ')">' + I[t[1]] + '</span><b>' + t[2] + '</b><small>' + t[3] + '</small></a>';
  }).join('');
  var done = p.md, tot = c.mocks, pc = Math.round(done / tot * 100);
  var progress = '<div class="xh-pg"><a href="#/' + k + '/mocks"><b>' + done + '<em>/' + tot + '</em></b><small>Mocks done</small><i style="--w:' + pc + '%"></i></a>' +
    '<a href="#/' + k + '/practice"><b>' + fnum(p.done) + '</b><small>Practice done</small></a>' +
    '<a href="#/' + k + '/revision" class="' + (p.bad ? 'hot' : '') + '"><b>' + fnum(p.bad) + '</b><small>To revise</small></a></div>' +
    (bst !== null ? '<p class="xh-best">Your best mock score: <b>' + Math.round(bst) + '%</b>. Every attempt teaches you something.</p>' : '<p class="xh-best">Start with Mock Test 1 to find your baseline. There is no wrong place to begin.</p>');
  screen({
    top: tbar(c.name, { sub: c.full, la: 'xexams', share: c.share }),
    nav: 'sub',
    body: '<section class="xh"><span class="xk">' + esc(c.kick) + '</span><h2>' + esc(c.title) + '</h2><p>' + esc(c.lead) + '</p>' + cd +
      '<div class="xh-f">' + c.facts.map(function (f) { return '<div><b>' + f[0] + '</b><small>' + f[1] + '</small></div>'; }).join('') + '</div></section>' +
      '<p class="xh-note">' + I.info + '<span>' + esc(c.note) + '</span></p>' +
      '<h2 class="h2">Your progress</h2>' + progress +
      '<h2 class="h2">Prepare</h2><div class="xh-g">' + path + '</div>' +
      '<h2 class="h2">Mock tests<a href="#/' + k + '/mocks">All ' + c.mocks + '</a></h2><div class="rows two" id="xh-mk"><div class="empty" style="padding:18px 0"><div class="spin"></div></div></div>' +
      '<h2 class="h2">Guides from the blog<a href="#/blog/c/' + encodeURIComponent(c.cat) + '">More</a></h2><div class="rows" id="xh-bl"><div class="empty" style="padding:18px 0"><div class="spin"></div></div></div>' +
      '<h2 class="h2">Spread the word</h2><div class="card cont">' + ico('share', 'var(--c2-deep)') + '<div class="ti"><h3>Know someone preparing for ' + esc(c.name) + '?</h3><p>Share this free section with a friend or study group.</p></div><button class="btn sm" data-a="sharescr" data-t="' + esc(c.share.t) + '" data-u="' + esc(c.share.u) + '" data-d="' + esc(c.share.d) + '">Share</button></div>' +
      N.stay() +
      '<p class="muted" style="font-size:.75rem;text-align:center;margin:18px 8px 0;line-height:1.5">Independent study resource. Not affiliated with or endorsed by any examining authority. Verify dates, pattern and syllabus from the official notification.</p>'
  });
  N.xMeta(k).then(function (D) {
    var el = document.getElementById('xh-mk'); if (!el || !here(k)) return;
    el.innerHTML = D.slice(0, 3).map(function (m) { return N.xRow(k, m); }).join('') + '<a class="row" href="#/' + k + '/mocks">' + ico('grid', 'var(--c2-deep)') + '<div class="ti"><h3>See all ' + D.length + ' mock tests</h3></div>' + I.chevR + '</a>';
  }).catch(function () { var el = document.getElementById('xh-mk'); if (el) el.innerHTML = '<a class="row" href="#/' + k + '/mocks">' + ico('test', 'var(--c3-deep)') + '<div class="ti"><h3>Open the mock tests</h3></div>' + I.chevR + '</a>'; });
  N.loadPosts().then(function (L) {
    var el = document.getElementById('xh-bl'); if (!el || !here(k)) return;
    var m = L.filter(function (x) { return x.category === c.cat; }).slice(0, 4);
    el.innerHTML = m.length ? m.map(blogRow).join('') : '<a class="row" href="#/blog">' + ico('news', 'var(--c2-deep)') + '<div class="ti"><h3>Browse all guides</h3></div>' + I.chevR + '</a>';
  }).catch(function () { var el = document.getElementById('xh-bl'); if (el) el.innerHTML = '<a class="row" href="#/blog">' + ico('news', 'var(--c2-deep)') + '<div class="ti"><h3>Open the blog</h3></div>' + I.chevR + '</a>'; });
}
function blogRow(p) {
  return '<a class="row" href="#/blog/' + esc(p.slug) + '">' + ico('news', 'var(--c2-deep)') + '<div class="ti"><h3>' + esc(p.title) + '</h3><p>' + N.pdate(p.date) + ' · ' + (p.mins || 3) + ' min read</p></div>' + I.chevR + '</a>';
}

/* ---------- mocks ---------- */
function mocks(k) {
  var c = EX[k], sp = '<div class="empty" style="padding:18px 0"><div class="spin"></div></div>';
  screen({
    top: tbar(c.name + ' mock tests', { sub: c.pattern.split(' · ').slice(0, 2).join(' · '), la: 'xhub', share: c.share }),
    nav: 'mock',
    body: '<div class="xh-intro">' + I.test + '<p>' + esc(c.pattern) + ' Your answers and results stay on this device. Resume any paper where you left off.</p></div><div class="rows two" id="xm-list">' + sp + '</div>' +
      '<div class="card cont" style="margin-top:16px">' + ico('refresh', 'var(--c3-deep)') + '<div class="ti"><h3>After a mock, revise</h3><p>Wrong answers go to your revision notebook automatically.</p></div><a class="btn sm" href="#/' + k + '/revision">Open</a></div>' +
      '<p class="muted" style="font-size:.75rem;text-align:center;margin:14px 8px 0;line-height:1.5">Practice papers written for this site. Not official papers.</p>'
  });
  N.xMeta(k).then(function (D) { var el = document.getElementById('xm-list'); if (el && here(k)) el.innerHTML = D.map(function (m) { return N.xRow(k, m); }).join(''); })
    .catch(function () { var el = document.getElementById('xm-list'); if (el) el.innerHTML = '<div class="empty"><b>Could not load the list</b>Check your connection and try again.<br><br><button class="btn" data-a="reload">Retry</button></div>'; });
}
function runMock(k, n) {
  var c = EX[k]; if (!n || n < 1 || n > c.mocks) return go('/' + k + '/mocks');
  frame({ title: c.name + ' Mock Test ' + n, sub: 'Your answers are saved on this device', src: c.dir + 'mock-test-' + n + '.html' + EMB, la: 'xmocks' });
}

/* ---------- website pages shown inside the app ---------- */
function page(k, key) {
  var c = EX[k], pg = c.pages[key]; if (!pg) return hub(k);
  var f = pg[0], i = f.indexOf('#'), file = i < 0 ? f : f.slice(0, i), hash = i < 0 ? '' : f.slice(i);
  frame({ title: pg[1], sub: c.name, src: c.dir + file + EMB + hash, share: { t: c.name + ': ' + pg[1], u: SITE + c.dir + file, d: pg[2] } });
}

/* ---------- AILET / CUET PG: notes and guides ---------- */
function guides(k) {
  var c = EX[k], sp = '<div class="empty" style="padding:18px 0"><div class="spin"></div></div>';
  var g = Object.keys(c.pages).filter(function (x) { return x !== 'practice' && x !== 'revision' && x !== 'faq'; }).map(function (x) {
    var pg = c.pages[x]; return '<a class="row" href="#/' + k + '/' + x + '">' + ico(x === 'syllabus' ? 'book' : x === 'analysis' ? 'bars' : x === 'universities' ? 'inst' : 'info', 'var(--c3-deep)') + '<div class="ti"><h3>' + esc(pg[1]) + '</h3><p>' + esc(pg[2]) + '</p></div>' + I.chevR + '</a>';
  }).join('');
  screen({
    top: tbar(c.name + ' notes & guides', { sub: 'Read, then revise', la: 'xhub', share: { t: c.name + ' notes and guides', u: SITE + c.dir, d: c.share.d } }),
    nav: 'notes',
    body: '<div class="xh-intro">' + I.file + '<p>Start with the guide and syllabus, then read the articles below. For the core law subjects, the Law (058) chapter notes and the Case Law Vault are the same subjects you are tested on.</p></div>' +
      '<h2 class="h2">Exam guides</h2><div class="rows">' + g + '</div>' +
      '<h2 class="h2">Articles for ' + esc(c.name) + '</h2><div class="rows" id="xg-bl">' + sp + '</div>' +
      '<h2 class="h2">Core law notes</h2><div class="rows">' +
      '<a class="row" href="#/notes">' + ico('file', 'var(--c3-deep)') + '<div class="ti"><h3>Law (058) chapter notes</h3><p>Constitutional, criminal, contract, torts, family, IPR and more</p></div>' + I.chevR + '</a>' +
      '<a class="row" href="#/clat/cases">' + ico('scale', 'var(--c2-deep)') + '<div class="ti"><h3>Case Law Vault</h3><p>705 landmark cases, searchable, with bookmarks</p></div>' + I.chevR + '</a>' +
      '<a class="row" href="#/clat/prep">' + ico('target', 'var(--c3-deep)') + '<div class="ti"><h3>Study plans (CLAT PG)</h3><p>2 weeks to 6 months; the same LL.M. subjects apply</p></div>' + I.chevR + '</a></div>'
  });
  N.loadPosts().then(function (L) {
    var el = document.getElementById('xg-bl'); if (!el || !here(k)) return;
    var m = L.filter(function (x) { return x.category === c.cat; });
    el.innerHTML = m.length ? m.map(blogRow).join('') : '<a class="row" href="#/blog">' + ico('news', 'var(--c2-deep)') + '<div class="ti"><h3>Browse all guides</h3></div>' + I.chevR + '</a>';
  }).catch(function () { var el = document.getElementById('xg-bl'); if (el) el.innerHTML = '<a class="row" href="#/blog">' + ico('news', 'var(--c2-deep)') + '<div class="ti"><h3>Open the blog</h3></div>' + I.chevR + '</a>'; });
}

/* ---------- AIBE notes: 19 subjects, 216 chapters, read from aibe/notes/notes-index.json ---------- */
var AN = null;
function loadAN() {
  if (AN) return Promise.resolve(AN);
  return N.getJSON('aibe/notes/notes-index.json').then(function (d) {
    var g = {}, order = [];
    d.forEach(function (x) { if (!g[x.sl]) { g[x.sl] = { sl: x.sl, s: x.s, ch: [] }; order.push(x.sl); } g[x.sl].ch.push(x); });
    AN = { all: d, g: g, order: order }; return AN;
  });
}
function aibeNotes(p) {
  if (p[0]) return aibeSubject(p[0]);
  var sp = '<div class="empty" style="padding:30px 0"><div class="spin"></div></div>';
  var bar = tbar('AIBE notes', { sub: 'Chapter-wise, 19 subjects', la: 'xhub', share: { t: 'AIBE chapter notes', u: SITE + 'aibe/notes/', d: 'Chapter-wise AIBE notes for all 19 subjects: key provisions, landmark cases, traps and rapid revision. Free.' } });
  screen({ top: bar, nav: 'notes', body: sp });
  loadAN().then(function (D) {
    if (!here('aibe') || !/^#\/aibe\/notes\/?$/.test(location.hash)) return;
    screen({
      top: bar, nav: 'notes', keep: false,
      body: '<div class="xh-intro">' + I.file + '<p>Key provisions, landmark cases, memory aids and traps for every AIBE subject. Tap a subject, or search a topic, case or section.</p></div>' +
        '<div class="xs"><input id="xn-q" class="cx-s" type="search" placeholder="Search 216 chapters: Art 21, Section 482, Kesavananda…" autocomplete="off" aria-label="Search AIBE notes"></div>' +
        '<div id="xn-res"></div>' +
        '<div id="xn-sub"><div class="rows two">' + D.order.map(function (sl, i) { var s = D.g[sl]; return '<a class="row" href="#/aibe/notes/' + sl + '">' + ico('book', i % 2 ? 'var(--c2-deep)' : 'var(--c3-deep)') + '<div class="ti"><h3>' + esc(s.s) + '</h3><p>' + s.ch.length + ' chapter' + (s.ch.length > 1 ? 's' : '') + '</p></div>' + I.chevR + '</a>'; }).join('') + '</div>' +
        '<h2 class="h2">More from AIBE Notes</h2><div class="rows"><a class="row" href="#/aibe/notesite">' + ico('spark', 'var(--c3-deep)') + '<div class="ti"><h3>Notes home</h3><p>Highlights, latest developments, doubts</p></div>' + I.chevR + '</a><a class="row" href="#/aibe/mynotes">' + ico('pencil', 'var(--c2-deep)') + '<div class="ti"><h3>My notes</h3><p>Your own highlights and notes, saved on this device</p></div>' + I.chevR + '</a></div></div>'
    });
    var q = document.getElementById('xn-q'), res = document.getElementById('xn-res'), sub = document.getElementById('xn-sub'), t = 0;
    q.addEventListener('input', function () {
      clearTimeout(t); t = setTimeout(function () {
        var v = q.value.trim().toLowerCase();
        if (v.length < 2) { res.innerHTML = ''; sub.hidden = false; return; }
        sub.hidden = true;
        var w = v.split(/\s+/), m = D.all.filter(function (x) { var h = (x.t + ' ' + x.f + ' ' + x.s + ' ' + (x.a || '') + ' ' + (x.k || '')).toLowerCase(); return w.every(function (z) { return h.indexOf(z) > -1; }); }).slice(0, 40);
        res.innerHTML = m.length ? '<div class="rows">' + m.map(chRow).join('') + '</div>' : '<div class="empty"><b>No chapter found</b>Try a section number, a case name or a shorter word.</div>';
      }, 160);
    });
  }).catch(function () { if (here('aibe')) screen({ top: bar, nav: 'notes', body: '<div class="empty"><b>Could not load the notes</b>Check your connection and try again.<br><br><button class="btn" data-a="reload">Retry</button><a class="btn ghost" href="#/aibe/notesite" style="margin-top:10px">Open notes home</a></div>' }); });
}
function chRow(x) {
  var file = x.u.split('/').pop();
  return '<a class="row" href="#/aibe/read/' + x.sl + '/' + file + '">' + ico('file', 'var(--c3-deep)') + '<div class="ti"><h3>' + (x.n ? x.n + '. ' : '') + esc(x.t) + '</h3><p>' + esc(x.s) + (x.a ? ' · ' + esc(x.a) : '') + '</p></div>' + I.chevR + '</a>';
}
function aibeSubject(sl) {
  var bar = tbar('AIBE notes', { sub: '', la: 'xnotes' });
  screen({ top: bar, nav: 'notes', body: '<div class="empty" style="padding:30px 0"><div class="spin"></div></div>' });
  loadAN().then(function (D) {
    var s = D.g[sl]; if (!s) return go('/aibe/notes');
    if (!here('aibe') || location.hash.indexOf('/aibe/notes/' + sl) < 0) return;
    var extra = [['highlights.html', 'Highlights', 'The points examiners love, chapter by chapter', 'spark'], ['rapid-revision.html', 'Rapid revision', 'Numbers, Articles and case one-liners', 'refresh'], ['quick-mcqs.html', 'Quick MCQs', 'Self-test with answers and reasons', 'pencil'], ['latest-developments.html', 'Latest developments', 'Recent rulings and amendments', 'news']];
    screen({
      top: tbar(s.s, { sub: s.ch.length + ' chapters', la: 'xnotes', share: { t: 'AIBE notes: ' + s.s, u: SITE + 'aibe/notes/' + sl + '/', d: 'Chapter-wise AIBE notes on ' + s.s + ': key provisions, landmark cases, traps and rapid revision.' } }), nav: 'notes',
      body: '<h2 class="h2 first">Revision tools</h2><div class="rows two" id="xs-x"></div><h2 class="h2">Chapters</h2><div class="rows">' + s.ch.map(chRow).join('') + '</div>'
    });
    /* only list the revision pages this subject actually has (not every subject has all four) */
    Promise.all(extra.map(function (e) { return fetch('aibe/notes/' + sl + '/' + e[0], { method: 'HEAD' }).then(function (r) { return r.ok; }).catch(function () { return true; }); })).then(function (ok) {
      var el = document.getElementById('xs-x'); if (!el) return;
      el.innerHTML = extra.filter(function (e, i) { return ok[i]; }).map(function (e, i) { return '<a class="row" href="#/aibe/read/' + sl + '/' + e[0] + '">' + ico(e[3], i % 2 ? 'var(--c2-deep)' : 'var(--c3-deep)') + '<div class="ti"><h3>' + e[1] + '</h3><p>' + e[2] + '</p></div>' + I.chevR + '</a>'; }).join('');
    });
  }).catch(function () { if (here('aibe')) screen({ top: bar, nav: 'notes', body: '<div class="empty"><b>Could not load the notes</b>Check your connection and try again.<br><br><button class="btn" data-a="reload">Retry</button></div>' }); });
}
function aibeRead(p) {
  var sl = p[0], file = p[1]; if (!sl || !file) return go('/aibe/notes');
  var s = AN && AN.g[sl];
  frame({ title: s ? s.s : 'AIBE notes', sub: 'Chapter notes', src: 'aibe/notes/' + encodeURIComponent(sl) + '/' + encodeURIComponent(file) + EMB, la: 'xnotesub', share: { t: 'AIBE notes: ' + (s ? s.s : ''), u: SITE + 'aibe/notes/' + sl + '/' + file, d: 'AIBE chapter notes with key provisions, landmark cases and traps.' } });
}
A.xnotesub = function () { var m = /^#\/aibe\/read\/([^/]+)/.exec(location.hash); go(m ? '/aibe/notes/' + m[1] : '/aibe/notes'); };

/* ---------- Revise: one place for everything you have saved or got wrong ---------- */
function revise() {
  var bm = Object.keys(ls.get('nl-m-bm', {}) || {}).length, cp = prog('clatpg');
  var ex = ['aibe', 'ailet', 'cuet'].map(function (k) { return { k: k, p: prog(k) }; });
  function row(href, icon, title, sub, tag, col) {
    return '<a class="row" href="' + href + '">' + ico(icon, col || 'var(--c3-deep)') + '<div class="ti"><h3>' + title + '</h3><p>' + sub + '</p></div>' + (tag ? '<span class="st ' + (tag[1] || '') + '">' + tag[0] + '</span>' : I.chevR) + '</a>';
  }
  var tot = bm + cp.bad + ex.reduce(function (a, e) { return a + e.p.bad; }, 0);
  screen({
    top: tbar('Revise', { sub: 'Everything you saved or missed', la: 'drawer', left: I.menu, share: { t: 'Revision on NET Law-Verse', u: SITE, d: 'Mistake notebooks, bookmarks, rapid-recall sheets and case vaults for UGC NET, CLAT PG, AILET, CUET PG and AIBE. Free.' } }),
    nav: 'sub',
    body: '<section class="xh slim"><span class="xk">Revision</span><h2>' + (tot ? fnum(tot) + ' item' + (tot > 1 ? 's' : '') + ' waiting for you' : 'Revision starts with your first mistake') + '</h2><p>' + (tot ? 'A short, regular revision beats a long, rare one. Even ten minutes today counts.' : 'Wrong answers and bookmarks collect here automatically, so nothing you struggled with is lost.') + '</p></section>' +
      '<div class="xh-tip">' + I.bulb + '<p><b>Revise on a rhythm.</b> Look again after 1 day, 1 week and 1 month. Mistakes you have fixed three times rarely come back.</p></div>' +
      '<h2 class="h2">UGC NET</h2><div class="rows">' + row('#/bookmarks', 'bm', 'Bookmarked questions', 'Questions you saved while practising', [bm + ' saved', bm ? 'go' : '']) + row('notes/', 'file', 'Rapid-recall sheets', 'Every notes chapter ends with one; use Revision mode', null, 'var(--c2-deep)') + row('#/plan', 'cal', 'Study plans', '6 months to 2 weeks, revision built in') + '</div>' +
      '<h2 class="h2">CLAT PG</h2><div class="rows">' + row('#/clat/practice', 'refresh', 'Practice mistakes', 'Retry the questions you got wrong', [cp.bad + ' to revise', cp.bad ? 'go' : '']) + row('#/clat/cases', 'scale', 'Case Law Vault', '705 landmark cases with bookmarks', null, 'var(--c2-deep)') + row('#/clat/syllabus', 'book', 'Syllabus tracker', 'Tick topics as you revise them') + '</div>' +
      ex.map(function (e) {
        var c = EX[e.k];
        return '<h2 class="h2">' + c.name + '</h2><div class="rows">' + row('#/' + e.k + '/revision', 'refresh', 'Revision notebook', 'Every wrong answer, with the explanation', [e.p.bad + ' to revise', e.p.bad ? 'go' : '']) + row('#/' + e.k + '/mocks', 'test', 'Mock tests', e.p.md + ' of ' + c.mocks + ' attempted; review any paper', null, 'var(--c2-deep)') + (e.k === 'aibe' ? row('#/aibe/notes', 'spark', 'Rapid revision sheets', 'Per-subject numbers, Articles and case one-liners') : row('#/' + e.k + '/syllabus', 'book', 'Syllabus tracker', 'Tick topics as you revise them')) + '</div>';
      }).join('')
  });
}

/* ---------- routes ---------- */
function route(k, p) {
  p = p || []; var a = p[0];
  switch (a) {
    case 'mocks': return mocks(k);
    case 'mock': return runMock(k, +p[1]);
    case 'notes': return k === 'aibe' ? aibeNotes(p.slice(1)) : guides(k);
    case 'read': return k === 'aibe' ? aibeRead(p.slice(1)) : hub(k);
    case 'notesite': return k === 'aibe' ? frame({ title: 'AIBE notes', sub: 'Notes home', src: 'aibe/notes/index.html' + EMB, la: 'xnotes', share: { t: 'AIBE Notes', u: SITE + 'aibe/notes/', d: 'Chapter-wise AIBE notes for all 19 subjects.' } }) : hub(k);
    case 'mynotes': return k === 'aibe' ? frame({ title: 'My AIBE notes', sub: 'Saved on this device', src: 'aibe/notes/my-notes.html' + EMB, la: 'xnotes' }) : hub(k);
    case 'what': case 'syllabus': case 'practice': case 'revision': case 'faq': case 'analysis': case 'universities': return page(k, a);
    default: return hub(k);
  }
}
R.aibe = function (p) { route('aibe', p); };
R.ailet = function (p) { route('ailet', p); };
R.cuet = function (p) { route('cuet', p); };
R.revise = function () { revise(); };
})();
