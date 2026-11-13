/* CLAT PG Practice Arena. Data: practice/index.json -> practice/<set>.json. Progress lives in localStorage only. */
(function () {
"use strict";
var ROOT = document.getElementById('pr-root'); if (!ROOT) return;
var KEY = 'clatpg-practice-v1', QKEY = 'clatpg-practice-queue', L = 'ABCD', NEG = 0.25;
var DIFFS = ['Moderate', 'Tough', 'Extreme'];
var mem = null, SETS = [], DATA = {}, QUEUE = null, toastT, lastFocus = null;

/* ---------- storage ---------- */
function load() { try { var r = localStorage.getItem(KEY); return r ? JSON.parse(r) : {}; } catch (e) { return mem || {}; } }
var S = load(); S.sets = S.sets || {}; S.prefs = S.prefs || { fs: 1, auto: false }; S.days = S.days || [];
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { mem = S; } }
function SS(id) { var s = S.sets[id]; if (!s) s = S.sets[id] = {}; s.q = s.q || {}; s.bm = s.bm || {}; s.note = s.note || {}; return s; }
function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function markDay() { var t = today(); if (S.days.indexOf(t) < 0) { S.days.push(t); if (S.days.length > 400) S.days.shift(); } }

/* ---------- helpers ---------- */
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function $(s, r) { return (r || ROOT).querySelector(s); }
function $$(s, r) { return [].slice.call((r || ROOT).querySelectorAll(s)); }
function toast(m) { clearTimeout(toastT); var o = document.querySelector('.pr-toast'); if (o) o.remove(); var t = document.createElement('div'); t.className = 'pr-toast'; t.setAttribute('role', 'status'); t.textContent = m; document.body.appendChild(t); toastT = setTimeout(function () { t.remove(); }, 2200); }
function say(m) { var l = document.getElementById('live'); if (l) { l.textContent = ''; setTimeout(function () { l.textContent = m; }, 30); } }
var IC = {
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>'
};

/* ---------- data ---------- */
function flatten(id, raw, meta) {
  var qs = [], byNo = {}, pas = [];
  raw.passages.forEach(function (p, pi) {
    var pp = { i: pi, id: p.passage_id, subject: p.subject_area, title: p.title, text: p.passage, wc: p.word_count, qs: [] };
    p.questions.forEach(function (q, k) {
      var o = { no: q.q_no, pi: pi, k: k, subject: p.subject_area, q: q.question, opts: q.options, ans: q.correct_option, exp: q.explanation, why: q.why_other_options_are_wrong, trap: q.clat_trap, lang: q.language_trick, diff: q.difficulty };
      qs.push(o); byNo[o.no] = o; pp.qs.push(o);
    });
    pas.push(pp);
  });
  var subs = {}; qs.forEach(function (q) { subs[q.subject] = (subs[q.subject] || 0) + 1; });
  var mix = {}; qs.forEach(function (q) { mix[q.diff] = (mix[q.diff] || 0) + 1; });
  return { id: id, title: raw.set_title || meta.title, meta: meta, pat: raw.pattern || {}, passages: pas, qs: qs, byNo: byNo, subjects: Object.keys(subs).sort(), mix: mix };
}
function boot() {
  fetch('practice/index.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (ix) {
    SETS = ix.sets || [];
    return Promise.all(SETS.map(function (m) { return fetch('practice/' + m.file).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (raw) { DATA[m.id] = flatten(m.id, raw, m); }); }));
  }).then(function () {
    try { QUEUE = JSON.parse(sessionStorage.getItem(QKEY)); } catch (e) { QUEUE = null; }
    document.addEventListener('keydown', onKey);
    addEventListener('hashchange', route);
    route();
  }).catch(function () {
    ROOT.innerHTML = '<div class="pr-empty"><b>Could not load the practice questions.</b>Check your connection and <a href="">reload the page</a>. If this keeps happening, write to netlawverse@gmail.com.</div>';
  });
}

/* ---------- state per question ---------- */
function QS(id, no) { return SS(id).q[no] || null; }
function status(id, no) { var q = QS(id, no); if (!q || !q.r) return 'new'; if (!q.s) return 'seen'; return q.c ? 'ok' : 'bad'; }
function stats(id, list) {
  var D = DATA[id], r = { n: 0, ok: 0, bad: 0, seen: 0, bm: 0, marks: 0 };
  (list || D.qs).forEach(function (q) { var s = status(id, q.no); r.n++; if (s === 'ok') r.ok++; else if (s === 'bad') r.bad++; else if (s === 'seen') r.seen++; if (SS(id).bm[q.no]) r.bm++; });
  r.marks = r.ok - r.bad * NEG; r.att = r.ok + r.bad; r.acc = r.att ? Math.round(r.ok / r.att * 100) : null; return r;
}
function allStats() { var t = { ok: 0, bad: 0, seen: 0, bm: 0, n: 0, marks: 0 }; Object.keys(DATA).forEach(function (id) { var s = stats(id); t.ok += s.ok; t.bad += s.bad; t.seen += s.seen; t.bm += s.bm; t.n += s.n; }); t.marks = t.ok - t.bad * NEG; t.att = t.ok + t.bad; t.acc = t.att ? Math.round(t.ok / t.att * 100) : null; return t; }
function fmt(n) { var v = Math.round(n * 100) / 100; return (v > 0 ? '+' : '') + v; }
function fmtp(n) { return String(Math.round(n * 100) / 100); }

/* ---------- routing ---------- */
function parse() { var h = (location.hash || '').replace(/^#\/?/, ''); var p = h.split('/'); return p; }
function go(h) { if (location.hash === h) route(); else location.hash = h; }
function route() {
  var p = parse(), v = p[0] || 'home';
  closePal();
  if (v === 'q' && DATA[p[1]] && DATA[p[1]].byNo[+p[2]]) { qview(p[1], +p[2]); return; }
  if (v === 'mistakes' || v === 'bookmarks') { review(v); return; }
  if (v === 'progress') { progress(); return; }
  home();
  if (!p[0] || p[0] === 'home') { /* keep scroll */ } 
}
function scrollTop() { try { window.scrollTo({ top: 0 }); } catch (e) { window.scrollTo(0, 0); } }

/* ---------- queues ---------- */
function setQueue(id, nos, label) { QUEUE = { set: id, nos: nos, label: label || '' }; try { sessionStorage.setItem(QKEY, JSON.stringify(QUEUE)); } catch (e) {} }
function activeQueue(id, no) {
  if (QUEUE && QUEUE.set === id && QUEUE.nos.indexOf(no) > -1) return QUEUE;
  var q = { set: id, nos: DATA[id].qs.map(function (x) { return x.no; }), label: '' }; return q;
}
function start(id, nos, label, firstNo) {
  if (!nos.length) { toast('No questions match that selection.'); return; }
  setQueue(id, nos, label); go('#q/' + id + '/' + (firstNo || nos[0]));
}
function pick(id, o) {
  var D = DATA[id], list = D.qs.filter(function (q) {
    var s = status(id, q.no);
    if (o.scope === 'new' && s !== 'new') return false;
    if (o.scope === 'bad' && s !== 'bad') return false;
    if (o.scope === 'seen' && s !== 'seen') return false;
    if (o.scope === 'bm' && !SS(id).bm[q.no]) return false;
    if (o.subject && q.subject !== o.subject) return false;
    if (o.diff && q.diff !== o.diff) return false;
    return true;
  });
  if (o.shuffle) {
    var groups = {}; list.forEach(function (q) { (groups[q.pi] = groups[q.pi] || []).push(q); });
    var keys = Object.keys(groups); for (var i = keys.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = keys[i]; keys[i] = keys[j]; keys[j] = t; }
    list = []; keys.forEach(function (k) { list = list.concat(groups[k]); });
  }
  return list.map(function (q) { return q.no; });
}

/* ---------- HOME ---------- */
function tabs(cur) {
  var A = allStats();
  function t(h, k, label, n) { return '<li><a class="pr-tab" href="#' + h + '"' + (cur === k ? ' aria-current="page"' : '') + '>' + label + (n ? '<em>' + n + '</em>' : '') + '</a></li>'; }
  return '<ul class="pr-tabs" aria-label="Practice sections">' + t('home', 'home', 'Practice') + t('mistakes', 'mistakes', 'My mistakes', A.bad) + t('bookmarks', 'bookmarks', 'Bookmarks', A.bm) + t('progress', 'progress', 'Progress') + '</ul>';
}
function lastQ() {
  var best = null; Object.keys(S.sets).forEach(function (id) { var s = S.sets[id]; if (s.last && DATA[id] && DATA[id].byNo[s.last.no] && (!best || (s.last.t || 0) > best.t)) best = { id: id, no: s.last.no, t: s.last.t || 0 }; }); return best;
}
function home() {
  var A = allStats(), lq = lastQ(), total = Object.keys(DATA).reduce(function (a, id) { return a + DATA[id].qs.length; }, 0);
  var h = '<section class="pr-hero"><div><span class="pill">FREE · NO SIGN-UP · NEW</span><h1>CLAT PG <span>Practice Arena</span></h1></div>' +
    '<p class="lead">' + total + ' original passage-based questions, moderate to extreme. Tap an option, show the answer, and see the trap the question was built on, the language trick, and why every wrong option fails.</p></section>';
  h += '<div class="pr-stats"><div class="pr-stat"><b>' + (A.ok + A.bad) + '<span style="font-size:.55em;opacity:.6">/' + total + '</span></b><small>attempted</small></div>' +
    '<div class="pr-stat"><b>' + (A.acc == null ? '–' : A.acc + '%') + '</b><small>accuracy</small></div>' +
    '<div class="pr-stat"><b>' + fmtp(A.marks) + '</b><small>marks (−0.25 per wrong)</small></div>' +
    '<div class="pr-stat"><b>' + A.bad + '</b><small>mistakes to review</small></div>' +
    '<div class="pr-stat"><b>' + A.bm + '</b><small>bookmarked</small></div></div>';
  if (lq) {
    var q = DATA[lq.id].byNo[lq.no];
    h += '<div class="pr-cont"><div><b>Pick up where you left off</b><span>Question ' + q.no + ' · ' + esc(q.subject) + '</span></div><a class="pr-btn" href="#q/' + lq.id + '/' + lq.no + '">Continue →</a></div>';
  }
  h += tabs('home');
  SETS.forEach(function (m) { h += setCard(DATA[m.id]); });
  SETS.forEach(function (m) { h += passageGrid(DATA[m.id]); });
  h += '<h2 class="pr-h2">How this set works</h2><div class="pr-grid2"><div class="pr-card"><b>The pattern</b><p class="pr-sub" style="margin:8px 0 0">Passages of about 250 to 400 words with six questions each, one mark per correct answer and 0.25 deducted for each wrong one, exactly as in CLAT PG. The paper has 120 questions in 120 minutes; this set is longer so you get more practice per topic.</p></div>' +
    '<div class="pr-card"><b>Fully annotated</b><p class="pr-sub" style="margin:8px 0 0">Every answer shows why it is right, why each wrong option fails, the CLAT trap that makes the question hard and any language trick (a word like <i>only</i>, <i>unless</i>, <i>not</i>, or a date that shifts the answer).</p></div>' +
    '<div class="pr-card"><b>Built for revision</b><p class="pr-sub" style="margin:8px 0 0">Bookmark anything, add your own note, and open <b>My mistakes</b> to re-read the passage, your answer and the full explanation. Progress is saved in this browser. Use Backup on the Progress tab to move it to another device.</p></div></div>';
  ROOT.innerHTML = h; bindHome();
}
function setCard(D) {
  var s = stats(D.id), m = D.meta, done = s.ok + s.bad + s.seen;
  var mixH = DIFFS.map(function (d) { return D.mix[d] ? '<span class="pr-chip d-' + d + '">' + D.mix[d] + ' ' + d + '</span>' : ''; }).join('');
  var subOpts = '<option value="">All subjects</option>' + D.subjects.map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('');
  var hasProg = done > 0;
  return '<h2 class="pr-h2">Practice sets</h2><article class="pr-card pr-set" data-set="' + D.id + '"><h3>' + esc(m.title) + ' <span class="pr-chip ink" style="vertical-align:middle">' + esc(m.tag || '') + '</span></h3><p class="b">' + esc(m.blurb || '') + '</p>' +
    '<div class="pr-meta"><span class="pr-chip">' + D.qs.length + ' questions</span><span class="pr-chip">' + D.passages.length + ' passages</span><span class="pr-chip">' + D.subjects.length + ' subjects</span>' + mixH + '</div>' +
    '<div class="pr-prog"><div class="pr-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + D.qs.length + '" aria-valuenow="' + done + '"><i style="width:' + Math.round(done / D.qs.length * 100) + '%"></i></div><small>' + done + ' of ' + D.qs.length + ' done · ' + s.ok + ' right · ' + s.bad + ' wrong' + (s.seen ? ' · ' + s.seen + ' revealed without trying' : '') + '</small></div>' +
    '<div class="pr-row" style="margin-bottom:18px"><button class="pr-btn pri" data-act="startall">' + (hasProg ? 'Continue the set' : 'Start the set') + ' →</button><button class="pr-btn" data-act="startnew"' + (s.n - done ? '' : ' disabled') + '>Only unattempted (' + (s.n - done) + ')</button></div>' +
    '<div class="pr-quick"><button class="pr-qk" data-act="startbad"' + (s.bad ? '' : ' disabled') + '><span class="n">' + s.bad + '</span><b>Retry my mistakes</b><small>Questions you got wrong</small></button>' +
    '<button class="pr-qk" data-act="startbm"' + (s.bm ? '' : ' disabled') + '><span class="n">' + s.bm + '</span><b>Bookmarked</b><small>Practise your starred questions</small></button>' +
    '<button class="pr-qk" data-act="startseen"' + (s.seen ? '' : ' disabled') + '><span class="n">' + s.seen + '</span><b>Revealed, not tried</b><small>Answers you peeked at</small></button>' +
    '<button class="pr-qk" data-act="startext"><span class="n">' + (D.mix.Extreme || 0) + '</span><b>Extreme only</b><small>The hardest questions</small></button></div>' +
    '<details class="pr-build"><summary>Build your own session</summary><div class="in"><div class="pr-fgrid">' +
    '<label class="pr-lab">Show<select class="pr-sel" id="f-scope"><option value="">All questions</option><option value="new">Unattempted</option><option value="bad">My mistakes</option><option value="seen">Revealed, not tried</option><option value="bm">Bookmarked</option></select></label>' +
    '<label class="pr-lab">Subject<select class="pr-sel" id="f-sub">' + subOpts + '</select></label>' +
    '<label class="pr-lab">Difficulty<select class="pr-sel" id="f-diff"><option value="">All levels</option>' + DIFFS.map(function (d) { return '<option>' + d + '</option>'; }).join('') + '</select></label>' +
    '<label class="pr-lab">Order<select class="pr-sel" id="f-ord"><option value="">Paper order</option><option value="s">Shuffle passages</option></select></label></div>' +
    '<div class="pr-row"><button class="pr-btn pri" data-act="startcustom">Start session</button><span class="pr-fine" id="f-count" style="margin:0"></span></div></div></details></article>';
}
function passageGrid(D) {
  var h = '<h2 class="pr-h2">Browse by passage</h2><p class="pr-sub">Pick a passage and work through its six questions, just as in the paper.</p><div class="pr-pg">';
  D.passages.forEach(function (p) {
    h += '<button class="pr-pc" data-act="startpass" data-set="' + D.id + '" data-p="' + p.i + '"><span class="pr-chip" style="align-self:flex-start">' + esc(p.id) + ' · Q' + p.qs[0].no + '–' + p.qs[p.qs.length - 1].no + '</span><span class="t">' + esc(p.title) + '</span><span class="s">' + esc(p.subject) + '</span><span class="pr-dots" aria-hidden="true">' + p.qs.map(function (q) { var s = status(D.id, q.no); return '<i class="' + (s === 'new' ? '' : s) + '"></i>'; }).join('') + '</span></button>';
  });
  return h + '</div>';
}
function bindHome() {
  var sel = ['#f-scope', '#f-sub', '#f-diff', '#f-ord'];
  function upd() {
    var id = SETS[0].id, c = pick(id, cfg()).length, el = $('#f-count'); if (el) el.textContent = c + ' question' + (c === 1 ? '' : 's') + ' match';
  }
  function cfg() { return { scope: $('#f-scope').value, subject: $('#f-sub').value, diff: $('#f-diff').value, shuffle: $('#f-ord').value === 's' }; }
  sel.forEach(function (s) { var e = $(s); if (e) e.onchange = upd; }); if ($('#f-scope')) upd();
  ROOT.oninput = null;
  ROOT.onclick = function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return; var a = b.dataset.act, card = b.closest('[data-set]'), id = (card && card.dataset.set) || b.dataset.set || (SETS[0] && SETS[0].id);
    if (!DATA[id]) return;
    if (a === 'startall') { var all = DATA[id].qs.map(function (q) { return q.no; }); var next = all.filter(function (n) { return status(id, n) === 'new'; })[0]; var lastNo = SS(id).last && SS(id).last.no; start(id, all, 'Full set', lastNo || next || all[0]); }
    else if (a === 'startnew') start(id, pick(id, { scope: 'new' }), 'Unattempted');
    else if (a === 'startbad') start(id, pick(id, { scope: 'bad' }), 'My mistakes');
    else if (a === 'startbm') start(id, pick(id, { scope: 'bm' }), 'Bookmarked');
    else if (a === 'startseen') start(id, pick(id, { scope: 'seen' }), 'Revealed, not tried');
    else if (a === 'startext') start(id, pick(id, { diff: 'Extreme' }), 'Extreme only');
    else if (a === 'startcustom') start(id, pick(id, cfg()), 'Custom session');
    else if (a === 'startpass') { var p = DATA[id].passages[+b.dataset.p]; start(id, p.qs.map(function (q) { return q.no; }), p.id + ' · ' + p.title); }
  };
  scrollTop();
}

/* ---------- QUESTION VIEW ---------- */
var CUR = null;
function qview(id, no) {
  var D = DATA[id], q = D.byNo[no], P = D.passages[q.pi], Q = activeQueue(id, no), idx = Q.nos.indexOf(no);
  CUR = { id: id, no: no, Q: Q, idx: idx };
  SS(id).last = { no: no, t: Date.now() }; save();
  document.documentElement.style.setProperty('--pr-fs', S.prefs.fs || 1);
  var pct = Math.round((idx + 1) / Q.nos.length * 100);
  var h = '<div class="pr-top" role="toolbar" aria-label="Question tools"><div class="l"><a class="pr-ib" href="#home" aria-label="Back to practice home" title="Practice home">' + IC.home + '</a>' +
    '<div class="pos">Question ' + (idx + 1) + ' of ' + Q.nos.length + '<small>' + esc(Q.label || D.meta.title) + ' · Q' + q.no + ' of ' + D.qs.length + '</small></div></div>' +
    '<div class="r"><button class="pr-ib" data-act="fs-" aria-label="Smaller text">A−</button><button class="pr-ib" data-act="fs+" aria-label="Larger text">A+</button>' +
    '<button class="pr-ib" id="bmb" data-act="bm" aria-pressed="false" aria-label="Bookmark this question" title="Bookmark (B)">' + IC.star + '</button>' +
    '<button class="pr-btn sm" data-act="pal">' + IC.grid.replace('<svg', '<svg width="18" height="18"') + ' Questions</button></div></div>' +
    '<div class="pr-qprog" aria-hidden="true"><i style="width:' + pct + '%"></i></div>' +
    '<div class="pr-split"><details class="pr-pass" data-wm id="pass"' + '' + ' open><summary><span class="t"><small>' + esc(P.id) + ' · ' + esc(P.subject) + '</small>' + esc(P.title) + '</span></summary><div class="pr-ptext">' + esc(P.text) + '<span class="wc">About ' + (P.wc || '') + ' words · questions ' + P.qs[0].no + ' to ' + P.qs[P.qs.length - 1].no + '</span></div></details>' +
    '<div id="qpane"></div></div><div id="palroot"></div>';
  ROOT.innerHTML = h;
  /* on phones the passage is open for the first question of a passage, collapsed for later ones */
  if (matchMedia('(max-width:999px)').matches && q.k > 0 && status(id, no) !== 'new') $('#pass').open = false;
  renderQ(); ROOT.onclick = onQClick; ROOT.oninput = onQInput; scrollTop();
  say('Question ' + (idx + 1) + ' of ' + Q.nos.length);
}
function renderQ() {
  var c = CUR, D = DATA[c.id], q = D.byNo[c.no], st = QS(c.id, c.no) || {}, rev = !!st.r, sel = st.s || null, S0 = SS(c.id);
  var bm = !!S0.bm[c.no], b = $('#bmb'); if (b) { b.classList.toggle('on', bm); b.setAttribute('aria-pressed', bm); }
  var h = '<section class="pr-q" data-wm aria-label="Question ' + q.no + '"><div class="pr-qhead"><span class="pr-qno">Q' + q.no + '</span><span class="pr-chip d-' + esc(q.diff) + '">' + esc(q.diff) + '</span><span class="pr-chip">' + esc(q.subject) + '</span>' +
    (rev ? '' : '') + '</div><p class="pr-qtext" id="qt">' + esc(q.q) + '</p>';
  h += '<div class="pr-opts" role="radiogroup" aria-labelledby="qt">';
  L.split('').forEach(function (k) {
    var cls = 'pr-opt', mk = '';
    if (rev) {
      if (k === q.ans) { cls += ' right'; mk = '<span class="mk">' + (sel === k ? 'YOUR ANSWER ✓' : 'CORRECT') + '</span>'; }
      else if (k === sel) { cls += ' wrong'; mk = '<span class="mk">YOUR ANSWER ✗</span>'; }
      else cls += ' dim';
    }
    h += '<button type="button" role="radio" class="' + cls + '" data-act="opt" data-k="' + k + '" aria-checked="' + (sel === k) + '"' + (rev ? ' disabled' : '') + '><span class="l">' + k + '</span><span class="tx">' + esc(q.opts[k]) + '</span>' + mk + '</button>';
  });
  h += '</div>';
  if (!rev) {
    h += '<div class="pr-act"><button class="pr-btn pri" data-act="show">' + (sel ? 'Check answer' : 'Show answer') + '</button>' + (sel ? '<button class="pr-btn" data-act="clear">Clear</button>' : '') + '<span class="grow"></span></div>' +
      '<p class="pr-hint"><kbd>A</kbd>–<kbd>D</kbd> choose · <kbd>Enter</kbd> show answer · <kbd>←</kbd> <kbd>→</kbd> move · <kbd>B</kbd> bookmark</p>';
  } else {
    var ok = st.s && st.c, cls = !st.s ? 'seen' : (ok ? 'ok' : 'bad');
    h += '<div class="pr-verdict ' + cls + '" role="status"><div><span class="big">' + (!st.s ? 'Answer revealed' : ok ? 'Correct' : 'Not quite') + '</span><small>' +
      (!st.s ? 'You did not pick an option, so this is not scored. The correct answer is ' + q.ans + '.' : ok ? 'Option ' + q.ans + ' is right.' : 'You chose ' + st.s + '. The correct answer is ' + q.ans + '.') + '</small></div>' +
      '<span class="sc">' + (!st.s ? '0' : ok ? '+1' : '−0.25') + '</span></div>';
    h += '<div class="pr-act"><button class="pr-btn" data-act="retry">Try again</button><button class="pr-btn" data-act="report">Report an issue</button></div>';
  }
  h += '<span class="pr-stamp" aria-hidden="true">NETLAWVERSE.IN</span></section>';
  if (rev) {
    h += '<section class="pr-exp pr-expw" data-wm id="exp" aria-label="Explanation">' +
      '<div class="pr-ex e1"><h4><i>✓</i>Why option ' + q.ans + ' is correct</h4><p>' + esc(q.exp) + '</p></div>' +
      '<div class="pr-ex e2"><h4><i>✗</i>Why the other options fail</h4>' + whyList(q.why, q.ans) + '</div>' +
      '<div class="pr-ex e3"><h4><i>⚠</i>The CLAT trap: how this question is tricky</h4><p>' + esc(q.trap) + '</p></div>' +
      '<div class="pr-ex e4"><h4><i>Aa</i>Language trick</h4><p>' + esc(q.lang) + '</p></div>' +
      '<span class="pr-stamp" aria-hidden="true">NETLAWVERSE.IN</span></section>';
  }
  var nt = S0.note[c.no] || '';
  h += '<div class="pr-note"><label for="note">Your note for this question</label><textarea id="note" maxlength="1200" placeholder="Write the rule in your own words, or why you slipped…">' + esc(nt) + '</textarea></div>';
  var Q = c.Q, i = c.idx, prev = Q.nos[i - 1], next = Q.nos[i + 1], endOfPass = next && D.byNo[next].pi !== q.pi;
  h += '<div class="pr-nav"><button class="pr-btn" data-act="prev"' + (prev ? '' : ' disabled') + '>← Previous</button><span class="mid">' + (next ? (endOfPass ? 'Next: a new passage' : '') : 'Last question in this session') + '</span>' +
    (next ? '<button class="pr-btn pri" data-act="next">Next →</button>' : '<a class="pr-btn pri" href="#home">Finish session</a>') + '</div>';
  $('#qpane').innerHTML = h;
}
function whyList(txt, ans) {
  var parts = String(txt || '').split(/\s+(?=Options?\s+[A-D]\b)/).filter(Boolean);
  if (parts.length < 2) return '<p>' + esc(txt) + '</p>';
  return '<ul class="pr-why">' + parts.map(function (p) {
    var m = /^Options?\s+([A-D](?:\s*(?:,|and|&)\s*[A-D])*)\s*[:\-–]?\s*(.*)$/s.exec(p.trim());
    if (!m) return '<li><span>' + esc(p) + '</span></li>';
    return '<li><span class="l">' + esc(m[1].replace(/\s*(,|and|&)\s*/g, '')) + '</span><span>' + esc(m[2]) + '</span></li>';
  }).join('') + '</ul>';
}
function pickOpt(k) {
  var c = CUR, st = QS(c.id, c.no); if (st && st.r) return;
  var S0 = SS(c.id); S0.q[c.no] = Object.assign({}, st || {}, { s: k }); save();
  if (S.prefs.auto) { reveal(); return; }
  renderQ(); var o = $('[data-k="' + k + '"]'); if (o) o.focus();
}
function reveal() {
  var c = CUR, D = DATA[c.id], q = D.byNo[c.no], S0 = SS(c.id), st = S0.q[c.no] || {};
  if (st.r) return;
  var sel = st.s || null, ok = sel === q.ans;
  S0.q[c.no] = { s: sel, r: 1, c: sel ? (ok ? 1 : 0) : 0, n: (st.n || 0) + (sel ? 1 : 0), w: (st.w || 0) + (sel && !ok ? 1 : 0), t: Date.now() };
  markDay(); save(); renderQ();
  say(!sel ? 'Answer revealed: ' + q.ans : ok ? 'Correct' : 'Incorrect. Correct answer is ' + q.ans);
  var e = $('#pr-root .pr-verdict'); if (e && e.scrollIntoView) { try { e.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (x) {} }
}
function retry() { var c = CUR, S0 = SS(c.id), st = S0.q[c.no] || {}; S0.q[c.no] = { s: null, r: 0, c: 0, n: st.n || 0, w: st.w || 0, t: Date.now() }; save(); renderQ(); say('Question reset'); }
function move(d) {
  var c = CUR, n = c.Q.nos[c.idx + d]; if (n) go('#q/' + c.id + '/' + n);
}
function toggleBm() { var c = CUR, S0 = SS(c.id); if (S0.bm[c.no]) { delete S0.bm[c.no]; toast('Bookmark removed'); } else { S0.bm[c.no] = Date.now(); toast('Bookmarked. Find it under Bookmarks.'); } save(); renderQ(); }
var noteT;
function onQInput(e) {
  if (e.target.id !== 'note' || !CUR) return; var v = e.target.value, c = CUR;
  clearTimeout(noteT); noteT = setTimeout(function () { var S0 = SS(c.id); if (v.trim()) S0.note[c.no] = v; else delete S0.note[c.no]; save(); }, 350);
}
function onQClick(e) {
  var b = e.target.closest('[data-act]'); if (!b || !CUR) return; var a = b.dataset.act;
  if (a === 'opt') pickOpt(b.dataset.k);
  else if (a === 'show') reveal();
  else if (a === 'clear') { var S0 = SS(CUR.id), st = S0.q[CUR.no] || {}; S0.q[CUR.no] = Object.assign({}, st, { s: null }); save(); renderQ(); }
  else if (a === 'retry') retry();
  else if (a === 'next') move(1);
  else if (a === 'prev') move(-1);
  else if (a === 'bm') toggleBm();
  else if (a === 'fs+' || a === 'fs-') { var v = Math.max(.85, Math.min(1.45, (S.prefs.fs || 1) + (a === 'fs+' ? .1 : -.1))); S.prefs.fs = Math.round(v * 100) / 100; save(); document.documentElement.style.setProperty('--pr-fs', S.prefs.fs); }
  else if (a === 'pal') openPal();
  else if (a === 'report') { var D = DATA[CUR.id], q = D.byNo[CUR.no]; if (window.NLReport) NLReport.open({ q: q.q, o: [q.opts.A, q.opts.B, q.opts.C, q.opts.D], a: L.indexOf(q.ans), e: q.exp }, 'CLAT PG Practice ' + D.title + ' - Q' + q.no); else location.href = 'mailto:netlawverse@gmail.com?subject=' + encodeURIComponent('Practice Q' + q.no); }
}
function onKey(e) {
  if (!CUR || !/^#\/?q\//.test(location.hash)) return;
  var t = e.target; if (t && /^(TEXTAREA|INPUT|SELECT)$/.test(t.tagName)) return; if (e.ctrlKey || e.metaKey || e.altKey) return;
  var pal = $('.pr-pal:not([hidden])'); if (pal) { if (e.key === 'Escape') closePal(); return; }
  var k = e.key, st = QS(CUR.id, CUR.no), rev = st && st.r;
  if (/^[a-dA-D]$/.test(k) && !rev) { pickOpt(k.toUpperCase()); e.preventDefault(); }
  else if (/^[1-4]$/.test(k) && !rev) { pickOpt(L[+k - 1]); }
  else if (k === 'Enter') { if (t && t.tagName === 'A') return; e.preventDefault(); if (!rev) reveal(); else move(1); }
  else if (k === 'ArrowRight' || k === 'n') move(1);
  else if (k === 'ArrowLeft' || k === 'p') move(-1);
  else if (k === 'b' || k === 'B') toggleBm();
  else if (k === 'r' && rev) retry();
}

/* palette */
function openPal() {
  var c = CUR, D = DATA[c.id], inQ = {}; c.Q.nos.forEach(function (n) { inQ[n] = 1; });
  var h = '<div class="pr-pal" role="dialog" aria-modal="true" aria-label="All questions"><div class="sheet"><div class="hd"><h3>All questions</h3><button class="pr-btn sm" data-pal="x">Close</button></div>' +
    '<div class="pr-leg"><span><i class="ok"></i>Right</span><span><i class="bad"></i>Wrong</span><span><i class="seen"></i>Revealed</span><span><i></i>Not done</span><span>★ Bookmarked</span></div>';
  D.passages.forEach(function (p) {
    h += '<div class="pr-pg-t">' + esc(p.id) + ' <small>· ' + esc(p.title) + '</small></div><div class="pr-cells">';
    p.qs.forEach(function (q) { var s = status(c.id, q.no); h += '<button class="pr-cell ' + (s === 'new' ? '' : s) + (q.no === c.no ? ' cur' : '') + (inQ[q.no] ? '' : ' out') + '" data-pal="' + q.no + '" aria-label="Question ' + q.no + (s === 'new' ? ', not done' : ', ' + s) + '">' + q.no + (SS(c.id).bm[q.no] ? '<span class="st">★</span>' : '') + '</button>'; });
    h += '</div>';
  });
  h += '<p class="pr-fine">Faded numbers are outside your current session. Tapping one opens it as a single-question session within the full set.</p></div></div>';
  var r = $('#palroot'); r.innerHTML = h; var pal = r.firstChild; lastFocus = document.activeElement;
  pal.onclick = function (e) {
    if (e.target === pal) return closePal(); var b = e.target.closest('[data-pal]'); if (!b) return;
    if (b.dataset.pal === 'x') return closePal(); var n = +b.dataset.pal;
    if (c.Q.nos.indexOf(n) < 0) { var all = D.qs.map(function (q) { return q.no; }); setQueue(c.id, all, 'Full set'); }
    closePal(); go('#q/' + c.id + '/' + n);
  };
  var cur = pal.querySelector('.cur'); if (cur) { cur.scrollIntoView({ block: 'center' }); cur.focus(); }
}
function closePal() { var p = document.querySelector('.pr-pal'); if (p) { p.remove(); if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {} } }

/* ---------- REVIEW (mistakes / bookmarks) ---------- */
var RF = { sub: '', diff: '', txt: '', sort: 'paper' };
function reviewCard(id, q) {
  var D = DATA[id], st = QS(id, q.no) || {}, S0 = SS(id), P = D.passages[q.pi], bm = !!S0.bm[q.no], note = S0.note[q.no], s = status(id, q.no);
  var chips = '<span class="pr-qno">Q' + q.no + '</span><span class="pr-chip d-' + esc(q.diff) + '">' + esc(q.diff) + '</span><span class="pr-chip">' + esc(q.subject) + '</span>' +
    (s === 'bad' ? '<span class="pr-chip bad">You chose ' + esc(st.s) + ' · answer ' + q.ans + '</span>' : s === 'ok' ? '<span class="pr-chip ok">Right</span>' : s === 'seen' ? '<span class="pr-chip seen">Revealed</span>' : '<span class="pr-chip">Not attempted</span>') +
    (bm ? '<span class="pr-chip" style="background:var(--sun)">★ Bookmarked</span>' : '') + ((st.w || 0) > 1 ? '<span class="pr-chip">Wrong ' + st.w + '×</span>' : '');
  var opts = L.split('').map(function (k) {
    var cl = k === q.ans ? 'right' : (k === st.s ? 'wrong' : ''), mk = k === q.ans ? (k === st.s ? 'YOUR ANSWER ✓' : 'CORRECT') : (k === st.s ? 'YOUR ANSWER ✗' : '');
    return '<li class="' + cl + '"><span class="l">' + k + '</span><span>' + esc(q.opts[k]) + '</span>' + (mk ? '<span class="mk">' + mk + '</span>' : '') + '</li>';
  }).join('');
  return '<details class="pr-rv" data-no="' + q.no + '" data-set="' + id + '"><summary><div class="chips">' + chips + '</div><div class="stem">' + esc(q.q) + '</div></summary><div class="body" data-wm>' +
    '<details class="pp"><summary>Read the passage: ' + esc(P.title) + '</summary><div class="pt">' + esc(P.text) + '</div></details>' +
    '<p class="pr-qtext" style="margin:0">' + esc(q.q) + '</p><ul class="roptions">' + opts + '</ul>' +
    '<div class="pr-ex e1"><h4><i>✓</i>Why option ' + q.ans + ' is correct</h4><p>' + esc(q.exp) + '</p></div>' +
    '<div class="pr-ex e2"><h4><i>✗</i>Why the other options fail</h4>' + whyList(q.why, q.ans) + '</div>' +
    '<div class="pr-ex e3"><h4><i>⚠</i>The CLAT trap</h4><p>' + esc(q.trap) + '</p></div>' +
    '<div class="pr-ex e4"><h4><i>Aa</i>Language trick</h4><p>' + esc(q.lang) + '</p></div>' +
    (note ? '<div class="note"><b>Your note:</b> ' + esc(note) + '</div>' : '') +
    '<div class="acts"><button class="pr-btn sm pri" data-ract="one">Practise this question</button><button class="pr-btn sm" data-ract="bm">' + (bm ? 'Remove bookmark' : 'Bookmark') + '</button>' + (s === 'bad' || s === 'seen' ? '<button class="pr-btn sm" data-ract="reset">Reset &amp; retry later</button>' : '') + '</div>' +
    '<span class="pr-stamp" aria-hidden="true">NETLAWVERSE.IN</span></div></details>';
}
function review(kind) {
  var all = [], A = allStats();
  Object.keys(DATA).forEach(function (id) { DATA[id].qs.forEach(function (q) { var s = status(id, q.no), inc = kind === 'mistakes' ? s === 'bad' : !!SS(id).bm[q.no]; if (inc) all.push({ id: id, q: q, t: (QS(id, q.no) || {}).t || SS(id).bm[q.no] || 0 }); }); });
  var subs = {}; all.forEach(function (x) { subs[x.q.subject] = 1; });
  var title = kind === 'mistakes' ? 'My mistakes' : 'Bookmarks';
  var h = '<section class="pr-hero"><div><h1>' + title + '</h1></div><p class="lead">' + (kind === 'mistakes' ? 'Every question you answered wrongly, with the passage, your answer, the right answer, the trap and the language trick. Re-read, then retry.' : 'Questions you starred, with their full explanations and your notes.') + '</p></section>' + tabs(kind);
  h += '<div class="pr-tools"><label class="pr-lab grow">Search<input class="pr-in" id="rf-t" type="search" placeholder="Search question text or subject" value="' + esc(RF.txt) + '"></label>' +
    '<label class="pr-lab">Subject<select class="pr-sel" id="rf-s"><option value="">All subjects</option>' + Object.keys(subs).sort().map(function (x) { return '<option' + (RF.sub === x ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('') + '</select></label>' +
    '<label class="pr-lab">Difficulty<select class="pr-sel" id="rf-d"><option value="">All levels</option>' + DIFFS.map(function (d) { return '<option' + (RF.diff === d ? ' selected' : '') + '>' + d + '</option>'; }).join('') + '</select></label>' +
    '<label class="pr-lab">Order<select class="pr-sel" id="rf-o"><option value="paper">Paper order</option><option value="recent"' + (RF.sort === 'recent' ? ' selected' : '') + '>Most recent first</option></select></label></div>';
  h += '<div class="pr-row" style="margin-bottom:12px"><button class="pr-btn pri sm" data-act="rpractice">Practise these</button><button class="pr-btn sm" data-act="rexp">Expand all</button><button class="pr-btn sm" data-act="rcol">Collapse all</button><button class="pr-btn sm" data-act="rprint">Print / save as PDF</button></div><div id="rlist"></div>';
  ROOT.innerHTML = h;
  function draw() {
    var f = all.filter(function (x) { return (!RF.sub || x.q.subject === RF.sub) && (!RF.diff || x.q.diff === RF.diff) && (!RF.txt || (x.q.q + ' ' + x.q.subject + ' ' + DATA[x.id].passages[x.q.pi].title).toLowerCase().indexOf(RF.txt.toLowerCase()) > -1); });
    f.sort(function (a, b) { return RF.sort === 'recent' ? b.t - a.t : (a.id === b.id ? a.q.no - b.q.no : a.id < b.id ? -1 : 1); });
    var out = !all.length ? '<div class="pr-empty"><b>' + (kind === 'mistakes' ? 'No mistakes yet' : 'Nothing bookmarked yet') + '</b>' + (kind === 'mistakes' ? 'Wrong answers collect here automatically once you check an answer. Good or bad, that is how you learn the traps.' : 'Tap the star while practising to save a question here.') + '<br><br><a class="pr-btn pri" href="#home">Start practising</a></div>'
      : !f.length ? '<div class="pr-empty"><b>No matches</b>Try clearing the filters.</div>'
      : '<p class="pr-count">' + f.length + ' question' + (f.length === 1 ? '' : 's') + '</p><div class="pr-list">' + f.map(function (x) { return reviewCard(x.id, x.q); }).join('') + '</div>';
    $('#rlist').innerHTML = out; draw.cur = f;
  }
  draw();
  function ev(id, fn) { var e = $(id); if (e) e.addEventListener('input', fn); }
  ev('#rf-t', function (e) { RF.txt = e.target.value; draw(); });
  ev('#rf-s', function (e) { RF.sub = e.target.value; draw(); });
  ev('#rf-d', function (e) { RF.diff = e.target.value; draw(); });
  ev('#rf-o', function (e) { RF.sort = e.target.value; draw(); });
  ROOT.oninput = null;
  ROOT.onclick = function (e) {
    var a = e.target.closest('[data-act]'), r = e.target.closest('[data-ract]');
    if (a) {
      if (a.dataset.act === 'rexp') $$('.pr-rv').forEach(function (d) { d.open = true; });
      else if (a.dataset.act === 'rcol') $$('.pr-rv').forEach(function (d) { d.open = false; });
      else if (a.dataset.act === 'rprint') { $$('.pr-rv,.pr-rv details').forEach(function (d) { d.open = true; }); setTimeout(function () { print(); }, 80); }
      else if (a.dataset.act === 'rpractice') {
        var f = draw.cur || []; if (!f.length) return toast('Nothing to practise here yet.');
        var id = f[0].id; var nos = f.filter(function (x) { return x.id === id; }).map(function (x) { return x.q.no; });
        if (kind === 'mistakes') nos.forEach(function (n) { var S0 = SS(id), st = S0.q[n] || {}; S0.q[n] = { s: null, r: 0, c: 0, n: st.n || 0, w: st.w || 0, t: Date.now() }; }); save();
        start(id, nos, kind === 'mistakes' ? 'Retry mistakes' : 'Bookmarked');
      }
      return;
    }
    if (r) {
      var card = r.closest('.pr-rv'), id2 = card.dataset.set, no = +card.dataset.no, S0 = SS(id2);
      if (r.dataset.ract === 'one') { start(id2, [no], 'Single question'); }
      else if (r.dataset.ract === 'bm') { if (S0.bm[no]) delete S0.bm[no]; else S0.bm[no] = Date.now(); save(); review(kind); toast('Updated'); }
      else if (r.dataset.ract === 'reset') { var st = S0.q[no] || {}; S0.q[no] = { s: null, r: 0, c: 0, n: st.n || 0, w: st.w || 0, t: Date.now() }; save(); review(kind); toast('Moved back to unattempted'); }
    }
  };
  scrollTop();
}

/* ---------- PROGRESS ---------- */
function bars(rows) {
  return '<div class="pr-bars">' + rows.map(function (r) { return '<div class="pr-brow"><span class="nm">' + esc(r.n) + '</span><div class="pr-bar' + (r.a != null && r.a < 50 ? ' w' : '') + '" role="img" aria-label="' + esc(r.n) + ' ' + (r.a == null ? 'not attempted' : r.a + ' percent') + '"><i style="width:' + (r.a || 0) + '%"></i></div><span class="v">' + (r.a == null ? '–' : r.a + '%') + ' <small style="opacity:.6">(' + r.k + ')</small></span></div>'; }).join('') + '</div>';
}
function progress() {
  var A = allStats(), h = '<section class="pr-hero"><div><h1>Your <span>progress</span></h1></div><p class="lead">See which subjects and difficulty levels cost you marks, and where to spend your next hour.</p></section>' + tabs('progress');
  var bySub = {}, byDiff = {};
  Object.keys(DATA).forEach(function (id) { DATA[id].qs.forEach(function (q) {
    var s = status(id, q.no); var a = bySub[q.subject] = bySub[q.subject] || { ok: 0, bad: 0 }, b = byDiff[q.diff] = byDiff[q.diff] || { ok: 0, bad: 0 };
    if (s === 'ok') { a.ok++; b.ok++; } else if (s === 'bad') { a.bad++; b.bad++; }
  }); });
  var subRows = Object.keys(bySub).sort().map(function (k) { var v = bySub[k], t = v.ok + v.bad; return { n: k, a: t ? Math.round(v.ok / t * 100) : null, k: v.ok + '/' + t, t: t }; });
  var weak = subRows.filter(function (r) { return r.t >= 2 && r.a < 60; }).sort(function (a, b) { return a.a - b.a; }).slice(0, 3);
  h += '<div class="pr-stats" style="margin-bottom:16px"><div class="pr-stat"><b>' + A.att + '</b><small>questions attempted</small></div><div class="pr-stat"><b>' + (A.acc == null ? '–' : A.acc + '%') + '</b><small>accuracy</small></div><div class="pr-stat"><b>' + fmtp(A.marks) + '</b><small>net marks</small></div><div class="pr-stat"><b>' + S.days.length + '</b><small>days practised</small></div><div class="pr-stat"><b>' + streak() + '</b><small>day streak</small></div></div>';
  if (weak.length) h += '<div class="pr-focus">Focus next: ' + weak.map(function (w) { return '<b>' + esc(w.n) + '</b> (' + w.a + '%)'; }).join(', ') + '. Open <a href="#mistakes">My mistakes</a> and filter by subject.</div>';
  else if (!A.att) h += '<div class="pr-focus">Attempt a few questions and your weak subjects will show up here.</div>';
  h += '<div class="pr-grid2"><div class="pr-card"><h3 style="margin:0 0 12px">By subject</h3>' + bars(subRows) + '</div><div class="pr-card"><h3 style="margin:0 0 12px">By difficulty</h3>' + bars(DIFFS.map(function (d) { var v = byDiff[d] || { ok: 0, bad: 0 }, t = v.ok + v.bad; return { n: d, a: t ? Math.round(v.ok / t * 100) : null, k: v.ok + '/' + t }; })) +
    '<p class="pr-fine">Accuracy counts only questions where you picked an option before checking. Answers revealed without trying are not scored.</p>' +
    '<h3 style="margin:22px 0 8px">Settings</h3><label class="pr-row" style="gap:10px;font-weight:700"><input type="checkbox" id="auto" ' + (S.prefs.auto ? 'checked' : '') + ' style="width:20px;height:20px"> Show the answer as soon as I pick an option</label>' +
    '<h3 style="margin:22px 0 8px">Your data</h3><div class="pr-data"><button class="pr-btn sm" data-act="exp">Backup (download)</button><label class="pr-btn sm" style="cursor:pointer">Restore<input type="file" id="imp" accept="application/json,.json" hidden></label><button class="pr-btn sm dng" data-act="reset">Reset all progress</button></div>' +
    '<p class="pr-fine">Everything is stored only in this browser. Clearing site data erases it, so download a backup before you do.</p></div></div>';
  ROOT.innerHTML = h;
  ROOT.oninput = null;
  $('#auto').onchange = function (e) { S.prefs.auto = e.target.checked; save(); toast(S.prefs.auto ? 'Answers will show on selection' : 'Use the Show answer button'); };
  $('#imp').onchange = function (e) {
    var f = e.target.files[0]; if (!f) return; var r = new FileReader();
    r.onload = function () { try { var d = JSON.parse(r.result); if (!d || typeof d.sets !== 'object') throw 0; if (!confirm('Replace the progress in this browser with the backup?')) return; S = d; S.prefs = S.prefs || { fs: 1, auto: false }; S.days = S.days || []; save(); toast('Progress restored'); progress(); } catch (x) { toast('That file is not a valid backup.'); } };
    r.readAsText(f);
  };
  ROOT.onclick = function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    if (b.dataset.act === 'exp') { var blob = new Blob([JSON.stringify(S)], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'netlawverse-clat-practice-backup.json'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
    else if (b.dataset.act === 'reset') { if (confirm('Erase all practice progress, bookmarks and notes in this browser? This cannot be undone.')) { S = { sets: {}, prefs: S.prefs, days: [] }; save(); try { sessionStorage.removeItem(QKEY); } catch (x) {} QUEUE = null; toast('Progress cleared'); progress(); } }
  };
  scrollTop();
}
function streak() {
  var set = {}; S.days.forEach(function (d) { set[d] = 1; }); var n = 0, d = new Date();
  if (!set[today()]) d.setDate(d.getDate() - 1);
  for (;;) { var k = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); if (set[k]) { n++; d.setDate(d.getDate() - 1); } else break; }
  return n;
}

boot();
})();
