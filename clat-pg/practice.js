/* CLAT PG Practice Arena. Data: practice/index.json -> practice/<set>.json. Progress lives in localStorage only. */
(function () {
"use strict";
var ROOT = document.getElementById('pr-root'); if (!ROOT) return;
var CFG = Object.assign({ dir: 'practice/', key: 'clatpg-practice-v1', qkey: 'clatpg-practice-queue', exam: 'CLAT PG', arena: 'Practice Arena', slug: 'clat', neg: 0.25, mocks: false,
  pill: 'FREE · NO SIGN-UP · NEW', trapLabel: 'The CLAT trap: how this question is tricky', langLabel: 'Language trick', heroLead: null, how: null, notes: true }, window.PRACTICE_CFG || {});
var KEY = CFG.key, QKEY = CFG.qkey, L = 'ABCD', NEG = CFG.neg;
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
function normQ(q, i, p) {
  var opts = q.options || {};
  if (Array.isArray(opts)) { var o2 = {}; opts.forEach(function (t, k) { o2[L[k]] = t; }); opts = o2; }
  var ans = q.correct_option != null ? q.correct_option : q.answer;
  if (typeof ans === 'number') ans = L[ans];
  ans = String(ans || '').trim().toUpperCase().charAt(0);
  var subj = q.subject_area || q.subject || (p && p.subject_area) || 'General';
  return { no: q.q_no != null ? q.q_no : i + 1, subject: subj, sg: String(subj).replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim(), q: q.question, opts: opts, ans: ans,
    exp: q.explanation || '', why: q.why_other_options_are_wrong || '', trap: q.clat_trap || q.ailet_trap || q.trap || '', lang: q.language_trick || q.lang || '', diff: q.difficulty || 'Moderate' };
}
function flatten(id, raw, meta) {
  var qs = [], byNo = {}, pas = [], src = raw.passages, flat = false, n = 0;
  if (!src && Array.isArray(raw.questions)) {
    flat = true; var size = raw.block_size || 10; src = [];
    for (var a = 0; a < raw.questions.length; a += size) {
      var chunk = raw.questions.slice(a, a + size);
      src.push({ passage_id: 'B' + (src.length + 1 < 10 ? '0' : '') + (src.length + 1), subject_area: 'Mixed', title: 'Questions ' + (a + 1) + ' to ' + (a + chunk.length), passage: '', questions: chunk, __start: a });
    }
  }
  (src || []).forEach(function (p, pi) {
    var pp = { i: pi, id: p.passage_id, subject: p.subject_area, title: p.title, text: p.passage || '', wc: p.word_count, qs: [], flat: flat };
    (p.questions || []).forEach(function (q0, k) {
      var o = normQ(q0, n++, p); o.pi = pi; o.k = k;
      qs.push(o); byNo[o.no] = o; pp.qs.push(o);
    });
    pas.push(pp);
  });
  var subs = {}; qs.forEach(function (q) { subs[q.sg] = (subs[q.sg] || 0) + 1; });
  var mix = {}; qs.forEach(function (q) { mix[q.diff] = (mix[q.diff] || 0) + 1; });
  return { id: id, title: raw.set_title || meta.title, meta: meta, isMock: meta.type === 'mock' && !!CFG.mocks, flat: flat, pat: raw.pattern || {}, passages: pas, qs: qs, byNo: byNo, subjects: Object.keys(subs).sort(), mix: mix };
}
function boot() {
  fetch(CFG.dir + 'index.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (ix) {
    SETS = ix.sets || [];
    return Promise.all(SETS.map(function (m) { return fetch(CFG.dir + m.file).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (raw) { DATA[m.id] = flatten(m.id, raw, m); }); }));
  }).then(function () {
    try { QUEUE = JSON.parse(sessionStorage.getItem(QKEY)); } catch (e) { QUEUE = null; }
    document.addEventListener('keydown', onKey);
    addEventListener('hashchange', route);
    route();
  }).catch(function () {
    ROOT.innerHTML = '<div class="pr-empty"><b>Could not load the questions.</b>Check your connection and <a href="">reload the page</a>. If this keeps happening, write to netlawverse@gmail.com.</div>';
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
  if (v === 'mocks' && CFG.mocks) { mocksHome(); return; }
  if (v === 'result' && DATA[p[1]]) { result(p[1]); return; }
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
    if (o.subject && q.sg !== o.subject) return false;
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
  return '<ul class="pr-tabs" aria-label="Practice sections">' + t('home', 'home', 'Practice') + (CFG.mocks ? t('mocks', 'mocks', 'Mock tests') : '') + t('mistakes', 'mistakes', 'My mistakes', A.bad) + t('bookmarks', 'bookmarks', 'Bookmarks', A.bm) + t('progress', 'progress', 'Progress') + '</ul>';
}
function lastQ() {
  var best = null; Object.keys(S.sets).forEach(function (id) { var s = S.sets[id]; if (s.last && DATA[id] && DATA[id].byNo[s.last.no] && (!best || (s.last.t || 0) > best.t)) best = { id: id, no: s.last.no, t: s.last.t || 0 }; }); return best;
}
var NUMW = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
function psets() { return SETS.filter(function (m) { return DATA[m.id] && !DATA[m.id].isMock; }); }
function msets() { return SETS.filter(function (m) { return DATA[m.id] && DATA[m.id].isMock; }); }
function statsBlock(A, total) {
  return '<div class="pr-stats"><div class="pr-stat"><b>' + (A.ok + A.bad) + '<span style="font-size:.55em;opacity:.6">/' + total + '</span></b><small>attempted</small></div>' +
    '<div class="pr-stat"><b>' + (A.acc == null ? '–' : A.acc + '%') + '</b><small>accuracy</small></div>' +
    '<div class="pr-stat"><b>' + fmtp(A.marks) + '</b><small>marks (−' + NEG + ' per wrong)</small></div>' +
    '<div class="pr-stat"><b>' + A.bad + '</b><small>mistakes to review</small></div>' +
    '<div class="pr-stat"><b>' + A.bm + '</b><small>bookmarked</small></div></div>';
}
function contBar(lq) {
  if (!lq) return '';
  var q = DATA[lq.id].byNo[lq.no];
  return '<div class="pr-cont"><div><b>Pick up where you left off</b><span>' + esc(DATA[lq.id].meta.title) + ' · Question ' + q.no + ' · ' + esc(q.subject) + '</span></div><a class="pr-btn" href="#q/' + lq.id + '/' + lq.no + '">Continue →</a></div>';
}
function home() {
  var A = allStats(), lq = lastQ(), total = Object.keys(DATA).reduce(function (a, id) { return a + DATA[id].qs.length; }, 0), ps = psets();
  var ptotal = ps.reduce(function (a, m) { return a + DATA[m.id].qs.length; }, 0);
  var lead = CFG.heroLead || (ptotal + ' original passage-based questions across ' + (NUMW[ps.length] || ps.length) + ' sets, moderate to extreme. Tap an option, show the answer, and see the trap the question was built on, the language trick, and why every wrong option fails.');
  var h = '<section class="pr-hero"><div><span class="pill">' + esc(CFG.pill) + '</span><h1>' + esc(CFG.exam) + ' <span>' + esc(CFG.arena) + '</span></h1></div><p class="lead">' + esc(lead) + '</p></section>';
  h += statsBlock(A, total) + contBar(lq) + tabs('home') + '<h2 class="pr-h2">Practice sets</h2>';
  if (!ps.length) {
    h += '<div class="pr-empty"><b>The first practice set is on its way</b>Practice sets will appear here as soon as they are published. Everything you answer, bookmark or get wrong is saved in this browser and shows up under My mistakes and Bookmarks.' + (CFG.mocks ? '<br><br><a class="pr-btn" href="#mocks">See mock tests</a>' : '') + '</div>';
  } else {
    if (ps.length > 2) h += '<div class="pr-row" style="margin:-2px 0 16px" role="group" aria-label="Jump to a set"><span class="pr-fine" style="margin:0">Jump to:</span>' + ps.map(function (m) { return '<button type="button" class="pr-btn sm" data-act="jump" data-set="' + m.id + '">' + esc(m.title.replace('Practice ', '')) + '</button>'; }).join('') + '</div>';
    h += '<div class="pr-sets">' + ps.map(function (m) { return setCard(DATA[m.id]); }).join('') + '</div>';
  }
  var how = CFG.how || [
    ['The pattern', 'Passages of about 250 to 400 words with six questions each, one mark per correct answer and 0.25 deducted for each wrong one, exactly as in CLAT PG. The paper has 120 questions in 120 minutes; these sets are longer so you get more practice per topic.'],
    ['Fully annotated', 'Every answer shows why it is right, why each wrong option fails, the CLAT trap that makes the question hard and any language trick (a word like <i>only</i>, <i>unless</i>, <i>not</i>, or a date that shifts the answer).'],
    ['Built for revision', 'Bookmark anything, add your own note, and open <b>My mistakes</b> to re-read the passage, your answer and the full explanation. Progress is saved in this browser. Use Backup on the Progress tab to move it to another device.']];
  h += '<h2 class="pr-h2">How this works</h2><div class="pr-grid2">' + how.map(function (x) { return '<div class="pr-card"><b>' + x[0] + '</b><p class="pr-sub" style="margin:8px 0 0">' + x[1] + '</p></div>'; }).join('') + '</div>';
  ROOT.innerHTML = h; bindHome();
}
function setCard(D) {
  var s = stats(D.id), m = D.meta, done = s.ok + s.bad + s.seen;
  var mixH = DIFFS.map(function (d) { return D.mix[d] ? '<span class="pr-chip d-' + d + '">' + D.mix[d] + ' ' + d + '</span>' : ''; }).join('');
  var subOpts = '<option value="">All subjects</option>' + D.subjects.map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('');
  var hasProg = done > 0, hard = D.mix.Extreme ? 'Extreme' : 'Tough';
  return '<article class="pr-card pr-set" data-set="' + D.id + '"><h3>' + esc(m.title) + ' <span class="pr-chip ink" style="vertical-align:middle">' + esc(m.tag || '') + '</span></h3><p class="b">' + esc(m.blurb || '') + '</p>' +
    '<div class="pr-meta"><span class="pr-chip">' + D.qs.length + ' questions</span>' + (D.flat ? '' : '<span class="pr-chip">' + D.passages.length + ' passages</span>') + '<span class="pr-chip">' + D.subjects.length + ' subjects</span>' + mixH + '</div>' +
    '<div class="pr-prog"><div class="pr-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + D.qs.length + '" aria-valuenow="' + done + '"><i style="width:' + Math.round(done / D.qs.length * 100) + '%"></i></div><small>' + done + ' of ' + D.qs.length + ' done · ' + s.ok + ' right · ' + s.bad + ' wrong' + (s.seen ? ' · ' + s.seen + ' revealed without trying' : '') + '</small></div>' +
    '<div class="pr-row" style="margin-bottom:18px"><button class="pr-btn pri" data-act="startall">' + (hasProg ? 'Continue the set' : 'Start the set') + ' →</button><button class="pr-btn" data-act="startnew"' + (s.n - done ? '' : ' disabled') + '>Only unattempted (' + (s.n - done) + ')</button></div>' +
    '<div class="pr-quick"><button class="pr-qk" data-act="startbad"' + (s.bad ? '' : ' disabled') + '><span class="n">' + s.bad + '</span><b>Retry my mistakes</b><small>Questions you got wrong</small></button>' +
    '<button class="pr-qk" data-act="startbm"' + (s.bm ? '' : ' disabled') + '><span class="n">' + s.bm + '</span><b>Bookmarked</b><small>Practise your starred questions</small></button>' +
    '<button class="pr-qk" data-act="startseen"' + (s.seen ? '' : ' disabled') + '><span class="n">' + s.seen + '</span><b>Revealed, not tried</b><small>Answers you peeked at</small></button>' +
    '<button class="pr-qk" data-act="starthard" data-diff="' + hard + '"><span class="n">' + (D.mix[hard] || 0) + '</span><b>' + hard + ' only</b><small>The hardest questions in this set</small></button></div>' +
    '<details class="pr-build"><summary>Build your own session</summary><div class="in"><div class="pr-fgrid">' +
    '<label class="pr-lab">Show<select class="pr-sel f-scope"><option value="">All questions</option><option value="new">Unattempted</option><option value="bad">My mistakes</option><option value="seen">Revealed, not tried</option><option value="bm">Bookmarked</option></select></label>' +
    '<label class="pr-lab">Subject<select class="pr-sel f-sub">' + subOpts + '</select></label>' +
    '<label class="pr-lab">Difficulty<select class="pr-sel f-diff"><option value="">All levels</option>' + DIFFS.map(function (d) { return '<option>' + d + '</option>'; }).join('') + '</select></label>' +
    '<label class="pr-lab">Order<select class="pr-sel f-ord"><option value="">Paper order</option><option value="s">Shuffle passages</option></select></label></div>' +
    '<div class="pr-row"><button class="pr-btn pri" data-act="startcustom">Start session</button><span class="pr-fine f-count" style="margin:0"></span></div></div></details>' + passageGrid(D) + '</article>';
}
function subjList(p) { var u = []; p.qs.forEach(function (q) { if (u.indexOf(q.sg) < 0) u.push(q.sg); }); return u.slice(0, 3).join(' · ') + (u.length > 3 ? ' +' + (u.length - 3) : ''); }
function passageGrid(D) {
  var h = '<details class="pr-build" style="margin-top:12px"><summary>Browse by ' + (D.flat ? 'block of questions' : 'passage') + ' (' + D.passages.length + ')</summary><div class="in"><p class="pr-sub" style="margin:0">' + (D.flat ? 'Work through the set ten questions at a time.' : 'Pick a passage and work through its six questions, just as in the paper.') + '</p><div class="pr-pg">';
  D.passages.forEach(function (p) {
    h += '<button class="pr-pc" data-act="startpass" data-set="' + D.id + '" data-p="' + p.i + '"><span class="pr-chip" style="align-self:flex-start">' + esc(p.id) + ' · Q' + p.qs[0].no + '–' + p.qs[p.qs.length - 1].no + '</span><span class="t">' + esc(p.title) + '</span><span class="s">' + esc(p.flat ? subjList(p) : p.subject) + '</span><span class="pr-dots" aria-hidden="true">' + p.qs.map(function (q) { var s = status(D.id, q.no); return '<i class="' + (s === 'new' ? '' : s) + '"></i>'; }).join('') + '</span></button>';
  });
  return h + '</div></div></details>';
}
function bindHome() {
  function cfg(card) { return { scope: $('.f-scope', card).value, subject: $('.f-sub', card).value, diff: $('.f-diff', card).value, shuffle: $('.f-ord', card).value === 's' }; }
  $$('.pr-set').forEach(function (card) {
    var id = card.dataset.set;
    function upd() { var c = pick(id, cfg(card)).length; $('.f-count', card).textContent = c + ' question' + (c === 1 ? '' : 's') + ' match'; }
    ['.f-scope', '.f-sub', '.f-diff', '.f-ord'].forEach(function (q) { $(q, card).onchange = upd; }); upd();
  });
  ROOT.oninput = null;
  ROOT.onclick = function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return; var a = b.dataset.act, card = b.closest('[data-set]'), id = card && card.dataset.set;
    if (!DATA[id]) return;
    if (a === 'jump') { var t = $('.pr-set[data-set="' + id + '"]'); if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'start' }); var f = $('[data-act=startall]', t); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 400); } return; }
    if (a === 'startall') { var all = DATA[id].qs.map(function (q) { return q.no; }); var next = all.filter(function (n) { return status(id, n) === 'new'; })[0]; var lastNo = SS(id).last && SS(id).last.no; start(id, all, 'Full set', lastNo || next || all[0]); }
    else if (a === 'startnew') start(id, pick(id, { scope: 'new' }), 'Unattempted');
    else if (a === 'startbad') start(id, pick(id, { scope: 'bad' }), 'My mistakes');
    else if (a === 'startbm') start(id, pick(id, { scope: 'bm' }), 'Bookmarked');
    else if (a === 'startseen') start(id, pick(id, { scope: 'seen' }), 'Revealed, not tried');
    else if (a === 'starthard') start(id, pick(id, { diff: b.dataset.diff }), b.dataset.diff + ' only');
    else if (a === 'startcustom') start(id, pick(id, cfg(card)), 'Custom session');
    else if (a === 'startpass') { var p = DATA[id].passages[+b.dataset.p]; start(id, p.qs.map(function (q) { return q.no; }), p.id + ' · ' + p.title); }
  };
  scrollTop();
}


/* ---------- MOCK TESTS (untimed: no clock anywhere) ---------- */
function tOn(id) { var D = DATA[id], t = D && SS(id).test; return !!(D && D.isMock && t && t.on); }
function mockCard(D) {
  var S0 = SS(D.id), T = S0.test || {}, att = S0.attempts || [], last = att[att.length - 1], n = D.qs.length;
  var answered = D.qs.filter(function (q) { var x = S0.q[q.no]; return x && x.s && !x.r; }).length;
  var mixH = DIFFS.map(function (d) { return D.mix[d] ? '<span class="pr-chip d-' + d + '">' + D.mix[d] + ' ' + d + '</span>' : ''; }).join('');
  var state = T.on ? 'progress' : last ? 'done' : 'new', line, btns;
  if (state === 'new') { line = 'Not started'; btns = '<button class="pr-btn pri" data-act="starttest" data-set="' + D.id + '">Start mock test →</button>'; }
  else if (state === 'progress') { line = answered + ' of ' + n + ' answered. Your answers are saved; come back any time.'; btns = '<button class="pr-btn pri" data-act="resumetest" data-set="' + D.id + '">Resume test →</button><button class="pr-btn" data-act="retake" data-set="' + D.id + '">Start over</button>'; }
  else { line = 'Last score ' + fmtp(last.marks) + ' / ' + n + ' · ' + last.c + ' right, ' + last.w + ' wrong, ' + last.s + ' skipped' + (att.length > 1 ? ' · attempt ' + att.length : ''); btns = '<a class="pr-btn pri" href="#result/' + D.id + '">View result</a><button class="pr-btn" data-act="reviewmock" data-set="' + D.id + '">Review answers</button><button class="pr-btn" data-act="retake" data-set="' + D.id + '">Retake</button>'; }
  return '<article class="pr-card pr-set" data-set="' + D.id + '"><h3>' + esc(D.meta.title) + (D.meta.tag ? ' <span class="pr-chip ink" style="vertical-align:middle">' + esc(D.meta.tag) + '</span>' : '') + '</h3><p class="b">' + esc(D.meta.blurb || '') + '</p>' +
    '<div class="pr-meta"><span class="pr-chip">' + n + ' questions</span><span class="pr-chip">' + n + ' marks</span><span class="pr-chip">−' + NEG + ' per wrong answer</span><span class="pr-chip ok">No timer</span><span class="pr-chip">' + D.subjects.length + ' subjects</span>' + mixH + '</div>' +
    '<p class="pr-fine" style="margin:0 0 14px;opacity:.85">' + esc(line) + '</p><div class="pr-row" style="margin-bottom:6px">' + btns + '</div></article>';
}
function mocksHome() {
  var ms = msets();
  var h = '<section class="pr-hero"><div><span class="pill">NO TIMER · AT YOUR OWN PACE</span><h1>' + esc(CFG.exam) + ' <span>Mock tests</span></h1></div><p class="lead">Full-length papers in the real marking scheme: one mark for each right answer, ' + NEG + ' off for each wrong one. There is no clock. Mark questions for review, submit when you are ready, and every mistake lands in your revision notebook.</p></section>';
  h += statsBlock(allStats(), Object.keys(DATA).reduce(function (a, id) { return a + DATA[id].qs.length; }, 0)) + tabs('mocks') + '<h2 class="pr-h2">Full-length papers</h2>';
  if (!ms.length) h += '<div class="pr-empty"><b>Mock tests are being prepared</b>The first full-length paper will appear here. Once you take one you will get a score, a subject-wise breakdown, and all your mistakes saved for revision.<br><br><a class="pr-btn" href="#home">Practise meanwhile</a></div>';
  else h += '<div class="pr-sets">' + ms.map(function (m) { return mockCard(DATA[m.id]); }).join('') + '</div>';
  h += '<h2 class="pr-h2">How mock tests work here</h2><div class="pr-grid2"><div class="pr-card"><b>Exam-style, minus the clock</b><p class="pr-sub" style="margin:8px 0 0">Answer, change your mind, clear a response or mark a question for review. Nothing is revealed until you submit. Close the tab and your answers are still there.</p></div><div class="pr-card"><b>A proper debrief</b><p class="pr-sub" style="margin:8px 0 0">You get your net marks, accuracy, a subject-wise and difficulty-wise breakdown and a list of where marks leaked, then the full explanation for every question.</p></div><div class="pr-card"><b>Revision is automatic</b><p class="pr-sub" style="margin:8px 0 0">Wrong and skipped questions go to <b>My mistakes</b> and <b>Revealed, not tried</b> by themselves. Retake a paper later and your score history is kept.</p></div></div>';
  ROOT.innerHTML = h; ROOT.oninput = null;
  ROOT.onclick = function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return; var a = b.dataset.act, id = b.dataset.set;
    if (a === 'starttest') startTest(id, true); else if (a === 'resumetest') startTest(id, false);
    else if (a === 'retake') { if (confirm('Start this paper over? Your current answers are cleared, and its mistakes leave My mistakes until you submit again. Your score history stays.')) startTest(id, true); }
    else if (a === 'reviewmock') { var nos = DATA[id].qs.map(function (q) { return q.no; }); start(id, nos, 'Review: ' + DATA[id].meta.title); }
  };
  scrollTop();
}
function startTest(id, fresh) {
  var D = DATA[id], S0 = SS(id), resume = !fresh && S0.test && S0.test.on;
  if (!resume) { D.qs.forEach(function (q) { delete S0.q[q.no]; }); S0.test = { on: true, started: Date.now(), mark: {} }; }
  var nos = D.qs.map(function (q) { return q.no; }); setQueue(id, nos, 'Mock test'); save();
  go('#q/' + id + '/' + (resume && S0.last && D.byNo[S0.last.no] ? S0.last.no : nos[0]));
}
function tcounts(id) {
  var D = DATA[id], S0 = SS(id), mk = (S0.test && S0.test.mark) || {}, a = 0, m = 0;
  D.qs.forEach(function (q) { var x = S0.q[q.no]; if (x && x.s) a++; if (mk[q.no]) m++; });
  return { a: a, m: m, u: D.qs.length - a, n: D.qs.length };
}
function tstatus(id, no) { var S0 = SS(id), x = S0.q[no], an = !!(x && x.s), mk = !!(S0.test && S0.test.mark && S0.test.mark[no]); return an && mk ? 'amr' : mk ? 'mr' : an ? 'an' : 'new'; }
function confirmSubmit() {
  var id = CUR.id, c = tcounts(id);
  var h = '<div class="pr-pal pr-dlgw" role="dialog" aria-modal="true" aria-label="Submit test"><div class="pr-dlg"><h3>Submit this test?</h3><p>You have answered <b>' + c.a + '</b> of ' + c.n + ' questions' + (c.u ? ', <b>' + c.u + '</b> unanswered' : '') + (c.m ? ' and <b>' + c.m + '</b> marked for review' : '') + '. Unanswered questions score nothing and cost nothing. You cannot change answers after submitting.</p><div class="pr-row"><button class="pr-btn" data-d="no">Keep working</button><button class="pr-btn pri" data-d="yes">Yes, submit</button></div></div></div>';
  var r = $('#palroot'); r.innerHTML = h; var d = r.firstChild; lastFocus = document.activeElement;
  d.onclick = function (e) { var b = e.target.closest('[data-d]'); if (e.target === d || (b && b.dataset.d === 'no')) return closePal(); if (b && b.dataset.d === 'yes') { var i = grade(id); closePal(); go('#result/' + id + '/' + i); } };
  var f = d.querySelector('[data-d=no]'); if (f) f.focus();
}
function grade(id) {
  var D = DATA[id], S0 = SS(id), c = 0, w = 0, sk = 0, by = {}, dby = {};
  D.qs.forEach(function (q) {
    var st = S0.q[q.no] || {}, sel = st.s || null, ok = sel === q.ans;
    var b = by[q.sg] = by[q.sg] || { c: 0, w: 0, s: 0, n: 0 }, d = dby[q.diff] = dby[q.diff] || { c: 0, w: 0, s: 0, n: 0 }; b.n++; d.n++;
    if (!sel) { sk++; b.s++; d.s++; } else if (ok) { c++; b.c++; d.c++; } else { w++; b.w++; d.w++; }
    S0.q[q.no] = { s: sel, r: 1, c: sel && ok ? 1 : 0, n: (st.n || 0) + (sel ? 1 : 0), w: (st.w || 0) + (sel && !ok ? 1 : 0), t: Date.now() };
  });
  var rec = { t: Date.now(), c: c, w: w, s: sk, n: D.qs.length, marks: Math.round((c - w * NEG) * 100) / 100, by: by, dby: dby, marked: Object.keys((S0.test && S0.test.mark) || {}).length };
  S0.attempts = S0.attempts || []; S0.attempts.push(rec); S0.test = { on: false, done: true, finished: rec.t }; markDay(); save(); return S0.attempts.length - 1;
}
function result(id) {
  var D = DATA[id], S0 = SS(id), att = S0.attempts || [], p = parse(), ix = p[2] != null && att[+p[2]] ? +p[2] : att.length - 1, r = att[ix];
  if (!r) { go('#mocks'); return; }
  var n = r.n, attempted = r.c + r.w, acc = attempted ? Math.round(r.c / attempted * 100) : null, lost = Math.round(r.w * NEG * 100) / 100;
  var rows = Object.keys(r.by).map(function (k) { var b = r.by[k], t = b.c + b.w; return { k: k, b: b, acc: t ? Math.round(b.c / t * 100) : null }; }).sort(function (a, b) { return (a.acc == null ? 101 : a.acc) - (b.acc == null ? 101 : b.acc); });
  var h = '<section class="pr-hero"><div><span class="pill">RESULT · ATTEMPT ' + (ix + 1) + ' OF ' + att.length + '</span><h1>' + esc(D.meta.title) + ' <span>result</span></h1></div><p class="lead">Submitted ' + new Date(r.t).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) + '. No clock was running, so this score is purely about accuracy and judgement.</p></section>';
  h += '<div class="pr-stats"><div class="pr-stat" style="background:var(--ink);color:#fff"><b>' + fmtp(r.marks) + '<span style="font-size:.5em;opacity:.7"> / ' + n + '</span></b><small style="color:#fff;opacity:.85">net marks</small></div><div class="pr-stat"><b>' + r.c + '</b><small>correct</small></div><div class="pr-stat"><b>' + r.w + '</b><small>wrong (−' + lost + ')</small></div><div class="pr-stat"><b>' + r.s + '</b><small>skipped</small></div><div class="pr-stat"><b>' + (acc == null ? '–' : acc + '%') + '</b><small>accuracy on attempted</small></div></div>';
  var ins = [];
  if (r.w && r.w * NEG >= 1) ins.push('Negative marking cost you <b>' + fmtp(lost) + ' marks</b> from ' + r.w + ' wrong answers. Next time, leave a question blank when you cannot eliminate at least two options.');
  var weak = rows.filter(function (x) { return x.b.c + x.b.w >= 3 && x.acc != null && x.acc < 60; }).slice(0, 3);
  if (weak.length) ins.push('Weakest areas: ' + weak.map(function (x) { return '<b>' + esc(x.k) + '</b> (' + x.acc + '%)'; }).join(', ') + '. Filter <a href="#mistakes">My mistakes</a> by subject and re-read those explanations.');
  var strong = rows.filter(function (x) { return x.b.c + x.b.w >= 3 && x.acc != null && x.acc >= 80; }).slice(-2);
  if (strong.length) ins.push('Solid on ' + strong.map(function (x) { return '<b>' + esc(x.k) + '</b> (' + x.acc + '%)'; }).join(' and ') + '. Keep these warm with quick revision rather than new reading.');
  if (r.s > n * 0.25) ins.push('You skipped <b>' + r.s + '</b> questions. If most were skipped from caution, practise eliminating options; if from lack of knowledge, the Revealed, not tried list is your reading list.');
  if (att.length > 1 && ix > 0) { var d = Math.round((r.marks - att[ix - 1].marks) * 100) / 100; ins.push('Compared with your previous attempt, net marks ' + (d >= 0 ? 'rose' : 'fell') + ' by <b>' + Math.abs(d) + '</b>.'); }
  if (!ins.length) ins.push('A clean sheet to learn from. Open Review answers and read the explanation for every question, including those you got right.');
  h += '<div class="pr-focus"><b>What to do next</b><ul style="margin:8px 0 0;padding-left:20px;display:grid;gap:6px">' + ins.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>';
  h += '<div class="pr-row" style="margin:6px 0 18px"><button class="pr-btn pri" data-act="rv">Review all answers</button><button class="pr-btn" data-act="rvbad"' + ((r.w || r.s) ? '' : ' disabled') + '>Practise my ' + (r.w + r.s) + ' misses</button><a class="pr-btn" href="#mistakes">Open My mistakes</a><button class="pr-btn" data-act="rt">Retake</button><a class="pr-btn" href="#mocks">All mock tests</a></div>';
  h += '<div class="pr-grid2"><div class="pr-card"><h3 style="margin:0 0 12px">By subject</h3><div class="pr-bars">' + rows.map(function (x) { var t = x.b.n; return '<div class="pr-brow"><span class="nm">' + esc(x.k) + '</span><div class="pr-bar pr-stack" role="img" aria-label="' + esc(x.k) + ': ' + x.b.c + ' right, ' + x.b.w + ' wrong, ' + x.b.s + ' skipped"><i class="g" style="width:' + x.b.c / t * 100 + '%"></i><i class="r" style="width:' + x.b.w / t * 100 + '%"></i></div><span class="v">' + x.b.c + '/' + t + '</span></div>'; }).join('') + '</div><p class="pr-fine"><span class="pr-dot g"></span>right <span class="pr-dot r"></span>wrong, remainder skipped</p></div>';
  h += '<div class="pr-card"><h3 style="margin:0 0 12px">By difficulty</h3><div class="pr-bars">' + DIFFS.filter(function (d) { return r.dby[d]; }).map(function (d) { var b = r.dby[d], t = b.n; return '<div class="pr-brow"><span class="nm">' + d + '</span><div class="pr-bar pr-stack"><i class="g" style="width:' + b.c / t * 100 + '%"></i><i class="r" style="width:' + b.w / t * 100 + '%"></i></div><span class="v">' + b.c + '/' + t + '</span></div>'; }).join('') + '</div>' +
    (att.length > 1 ? '<h3 style="margin:22px 0 10px">Attempt history</h3><div class="pr-bars">' + att.map(function (a, i) { return '<div class="pr-brow"><span class="nm"><a href="#result/' + id + '/' + i + '">Attempt ' + (i + 1) + '</a> · ' + new Date(a.t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + '</span><div class="pr-bar"><i style="width:' + Math.max(0, a.marks) / a.n * 100 + '%"></i></div><span class="v">' + fmtp(a.marks) + '</span></div>'; }).join('') + '</div>' : '') + '</div></div>';
  ROOT.innerHTML = h; ROOT.oninput = null;
  ROOT.onclick = function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return; var a = b.dataset.act, all = D.qs.map(function (q) { return q.no; });
    if (a === 'rv') start(id, all, 'Review: ' + D.meta.title);
    else if (a === 'rvbad') { var nos = D.qs.filter(function (q) { var s = status(id, q.no); return s === 'bad' || s === 'seen'; }).map(function (q) { return q.no; }); start(id, nos, 'Your misses'); }
    else if (a === 'rt') { if (confirm('Retake this paper? Your current answers are cleared and its mistakes leave My mistakes until you submit again. Your score history stays.')) startTest(id, true); }
  };
  scrollTop();
}

/* ---------- QUESTION VIEW ---------- */
var CUR = null;
function qview(id, no) {
  var D = DATA[id], q = D.byNo[no], P = D.passages[q.pi], Q = activeQueue(id, no), idx = Q.nos.indexOf(no), T = tOn(id), solo = !P.text;
  CUR = { id: id, no: no, Q: Q, idx: idx };
  SS(id).last = { no: no, t: Date.now() }; save();
  document.documentElement.style.setProperty('--pr-fs', S.prefs.fs || 1);
  var pct = Math.round((idx + 1) / Q.nos.length * 100);
  var h = '<div class="pr-top" role="toolbar" aria-label="Question tools"><div class="l"><a class="pr-ib" href="' + (T ? '#mocks' : '#home') + '" aria-label="' + (T ? 'Back to mock tests (your answers are saved)' : 'Back to practice home') + '" title="' + (T ? 'Back to mock tests. Your answers are saved.' : 'Practice home') + '">' + IC.home + '</a>' +
    '<div class="pos">Question ' + (idx + 1) + ' of ' + Q.nos.length + '<small>' + esc(T ? D.meta.title : (Q.label || D.meta.title)) + ' · Q' + q.no + ' of ' + D.qs.length + '</small></div></div>' +
    '<div class="r"><button class="pr-ib" data-act="fs-" aria-label="Smaller text">A−</button><button class="pr-ib" data-act="fs+" aria-label="Larger text">A+</button>' +
    '<button class="pr-ib" id="bmb" data-act="bm" aria-pressed="false" aria-label="Bookmark this question" title="Bookmark (B)">' + IC.star + '</button>' +
    '<button class="pr-btn sm" data-act="pal" aria-label="Question palette">' + IC.grid.replace('<svg', '<svg width="18" height="18"') + ' <span class="lbl">Questions</span></button>' + (T ? '<button class="pr-btn sm pri" data-act="submit">Submit</button>' : '') + '</div></div>' +
    '<div class="pr-qprog" aria-hidden="true"><i style="width:' + pct + '%"></i></div>' + (T ? '<p class="pr-tcount" id="tcount"></p>' : '') +
    '<div class="pr-split' + (solo ? ' solo' : '') + '">' + (solo ? '' : '<details class="pr-pass" data-wm id="pass" open><summary><span class="t"><small>' + esc(P.id) + ' · ' + esc(P.subject) + '</small>' + esc(P.title) + '</span></summary><div class="pr-ptext">' + esc(P.text) + '<span class="wc">' + (P.wc ? 'About ' + P.wc + ' words · ' : '') + 'questions ' + P.qs[0].no + ' to ' + P.qs[P.qs.length - 1].no + '</span></div></details>') +
    '<div id="qpane"></div></div><div id="palroot"></div>';
  ROOT.innerHTML = h;
  if (!solo && matchMedia('(max-width:999px)').matches && q.k > 0 && status(id, no) !== 'new' && !T) $('#pass').open = false;
  renderQ(); ROOT.onclick = onQClick; ROOT.oninput = onQInput; scrollTop();
  say('Question ' + (idx + 1) + ' of ' + Q.nos.length);
}
function updT() { var c = CUR, el = $('#tcount'); if (!el || !c) return; var k = tcounts(c.id); el.innerHTML = '<b>' + k.a + '</b> answered · <b>' + k.u + '</b> not answered · <b>' + k.m + '</b> marked for review. No timer.'; }
function renderQ() {
  var c = CUR, D = DATA[c.id], q = D.byNo[c.no], T = tOn(c.id), st = QS(c.id, c.no) || {}, rev = !T && !!st.r, sel = st.s || null, S0 = SS(c.id);
  var bm = !!S0.bm[c.no], b = $('#bmb'); if (b) { b.classList.toggle('on', bm); b.setAttribute('aria-pressed', bm); }
  var marked = !!(T && S0.test && S0.test.mark && S0.test.mark[c.no]);
  var h = '<section class="pr-q" data-wm aria-label="Question ' + q.no + '"><div class="pr-qhead"><span class="pr-qno">Q' + q.no + '</span>' + (T ? '' : '<span class="pr-chip d-' + esc(q.diff) + '">' + esc(q.diff) + '</span>') + '<span class="pr-chip">' + esc(q.subject) + '</span>' + (marked ? '<span class="pr-chip" style="background:#d9c7ff">Marked for review</span>' : '') +
    '</div><p class="pr-qtext" id="qt">' + esc(q.q) + '</p>';
  h += '<div class="pr-opts" role="radiogroup" aria-labelledby="qt">';
  L.split('').forEach(function (k) {
    if (q.opts[k] == null) return;
    var cls = 'pr-opt', mk = '';
    if (rev) {
      if (k === q.ans) { cls += ' right'; mk = '<span class="mk">' + (sel === k ? 'YOUR ANSWER ✓' : 'CORRECT') + '</span>'; }
      else if (k === sel) { cls += ' wrong'; mk = '<span class="mk">YOUR ANSWER ✗</span>'; }
      else cls += ' dim';
    }
    h += '<button type="button" role="radio" class="' + cls + '" data-act="opt" data-k="' + k + '" aria-checked="' + (sel === k) + '"' + (rev ? ' disabled' : '') + '><span class="l">' + k + '</span><span class="tx">' + esc(q.opts[k]) + '</span>' + mk + '</button>';
  });
  h += '</div>';
  if (T) {
    h += '<div class="pr-act"><button class="pr-btn" data-act="tmark" aria-pressed="' + marked + '">' + (marked ? '✓ Marked for review' : 'Mark for review') + '</button>' + (sel ? '<button class="pr-btn" data-act="clear">Clear response</button>' : '') + '<span class="grow"></span></div>' +
      '<p class="pr-hint"><kbd>A</kbd>–<kbd>D</kbd> choose (press again to clear) · <kbd>M</kbd> mark · <kbd>←</kbd> <kbd>→</kbd> move · <kbd>B</kbd> bookmark</p>';
  } else if (!rev) {
    h += '<div class="pr-act"><button class="pr-btn pri" data-act="show">' + (sel ? 'Check answer' : 'Show answer') + '</button>' + (sel ? '<button class="pr-btn" data-act="clear">Clear</button>' : '') + '<span class="grow"></span></div>' +
      '<p class="pr-hint"><kbd>A</kbd>–<kbd>D</kbd> choose · <kbd>Enter</kbd> show answer · <kbd>←</kbd> <kbd>→</kbd> move · <kbd>B</kbd> bookmark</p>';
  } else {
    var ok = st.s && st.c, cls2 = !st.s ? 'seen' : (ok ? 'ok' : 'bad');
    h += '<div class="pr-verdict ' + cls2 + '" role="status"><div><span class="big">' + (!st.s ? 'Answer revealed' : ok ? 'Correct' : 'Not quite') + '</span><small>' +
      (!st.s ? 'You did not pick an option, so this is not scored. The correct answer is ' + q.ans + '.' : ok ? 'Option ' + q.ans + ' is right.' : 'You chose ' + st.s + '. The correct answer is ' + q.ans + '.') + '</small></div>' +
      '<span class="sc">' + (!st.s ? '0' : ok ? '+1' : '−' + NEG) + '</span></div>';
    h += '<div class="pr-act"><button class="pr-btn" data-act="retry">Try again</button><button class="pr-btn" data-act="report">Report an issue</button></div>';
  }
  h += '<span class="pr-stamp" aria-hidden="true">NETLAWVERSE.IN</span></section>';
  if (rev) {
    h += '<section class="pr-exp pr-expw" data-wm id="exp" aria-label="Explanation">' +
      (q.exp ? '<div class="pr-ex e1"><h4><i>✓</i>Why option ' + q.ans + ' is correct</h4><p>' + esc(q.exp) + '</p></div>' : '') +
      (q.why ? '<div class="pr-ex e2"><h4><i>✗</i>Why the other options fail</h4>' + whyList(q.why, q.ans) + '</div>' : '') +
      (q.trap ? '<div class="pr-ex e3"><h4><i>⚠</i>' + esc(CFG.trapLabel) + '</h4><p>' + esc(q.trap) + '</p></div>' : '') +
      (q.lang ? '<div class="pr-ex e4"><h4><i>Aa</i>' + esc(CFG.langLabel) + '</h4><p>' + esc(q.lang) + '</p></div>' : '') +
      '<span class="pr-stamp" aria-hidden="true">NETLAWVERSE.IN</span></section>';
  }
  if (!T && CFG.notes) {
    var nt = S0.note[c.no] || '';
    h += '<div class="pr-note"><label for="note">Your note for this question</label><textarea id="note" maxlength="1200" placeholder="Write the rule in your own words, or why you slipped…">' + esc(nt) + '</textarea></div>';
  }
  var Q = c.Q, i = c.idx, prev = Q.nos[i - 1], next = Q.nos[i + 1], endOfPass = next && !D.flat && D.byNo[next].pi !== q.pi;
  h += '<div class="pr-nav"><button class="pr-btn" data-act="prev"' + (prev ? '' : ' disabled') + '>← Previous</button><span class="mid">' + (next ? (endOfPass ? 'Next: a new passage' : '') : (T ? 'Last question. Review your palette, then submit.' : 'Last question in this session')) + '</span>' +
    (next ? '<button class="pr-btn pri" data-act="next">Next →</button>' : (T ? '<button class="pr-btn pri" data-act="submit">Submit test</button>' : '<a class="pr-btn pri" href="#home">Finish session</a>')) + '</div>';
  $('#qpane').innerHTML = h; updT();
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
  var c = CUR, st = QS(c.id, c.no), T = tOn(c.id); if (!T && st && st.r) return;
  var S0 = SS(c.id);
  if (T && st && st.s === k) S0.q[c.no] = Object.assign({}, st, { s: null });
  else S0.q[c.no] = Object.assign({}, st || {}, { s: k });
  save();
  if (!T && S.prefs.auto) { reveal(); return; }
  renderQ(); var o = $('[data-k="' + k + '"]'); if (o) o.focus();
}
function toggleMark() { var c = CUR, S0 = SS(c.id); S0.test = S0.test || {}; S0.test.mark = S0.test.mark || {}; if (S0.test.mark[c.no]) delete S0.test.mark[c.no]; else S0.test.mark[c.no] = 1; save(); renderQ(); }
function reveal() {
  if (tOn(CUR.id)) return;
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
  else if (a === 'tmark') toggleMark();
  else if (a === 'submit') confirmSubmit();
  else if (a === 'fs+' || a === 'fs-') { var v = Math.max(.85, Math.min(1.45, (S.prefs.fs || 1) + (a === 'fs+' ? .1 : -.1))); S.prefs.fs = Math.round(v * 100) / 100; save(); document.documentElement.style.setProperty('--pr-fs', S.prefs.fs); }
  else if (a === 'pal') openPal();
  else if (a === 'report') { var D = DATA[CUR.id], q = D.byNo[CUR.no]; if (window.NLReport) NLReport.open({ q: q.q, o: [q.opts.A, q.opts.B, q.opts.C, q.opts.D], a: L.indexOf(q.ans), e: q.exp }, CFG.exam + ' Practice ' + D.meta.title + ' - Q' + q.no); else location.href = 'mailto:netlawverse@gmail.com?subject=' + encodeURIComponent(CFG.exam + ' ' + D.meta.title + ' Q' + q.no); }
}
function onKey(e) {
  if (!CUR || !/^#\/?q\//.test(location.hash)) return;
  var t = e.target; if (t && /^(TEXTAREA|INPUT|SELECT)$/.test(t.tagName)) return; if (e.ctrlKey || e.metaKey || e.altKey) return;
  var pal = $('.pr-pal:not([hidden])'); if (pal) { if (e.key === 'Escape') closePal(); return; }
  var T = tOn(CUR.id), k = e.key, st = QS(CUR.id, CUR.no), rev = !T && st && st.r;
  if (/^[a-dA-D]$/.test(k) && !rev) { pickOpt(k.toUpperCase()); e.preventDefault(); }
  else if (/^[1-4]$/.test(k) && !rev) { pickOpt(L[+k - 1]); }
  else if (k === 'Enter') { if (t && (t.tagName === 'A' || t.tagName === 'BUTTON')) return; e.preventDefault(); if (T) move(1); else if (!rev) reveal(); else move(1); }
  else if (k === 'ArrowRight' || k === 'n') move(1);
  else if (k === 'ArrowLeft' || k === 'p') move(-1);
  else if (k === 'b' || k === 'B') toggleBm();
  else if ((k === 'm' || k === 'M') && T) toggleMark();
  else if (k === 'r' && rev) retry();
}
function openPal() {
  var c = CUR, D = DATA[c.id], T = tOn(c.id), inQ = {}; c.Q.nos.forEach(function (n) { inQ[n] = 1; });
  var h = '<div class="pr-pal" role="dialog" aria-modal="true" aria-label="All questions"><div class="sheet"><div class="hd"><h3>All questions</h3><button class="pr-btn sm" data-pal="x">Close</button></div>' +
    (T ? '<div class="pr-leg"><span><i class="an"></i>Answered</span><span><i class="mr"></i>Marked</span><span><i></i>Not answered</span><span>★ Bookmarked</span></div>' : '<div class="pr-leg"><span><i class="ok"></i>Right</span><span><i class="bad"></i>Wrong</span><span><i class="seen"></i>Revealed</span><span><i></i>Not done</span><span>★ Bookmarked</span></div>');
  D.passages.forEach(function (p) {
    h += '<div class="pr-pg-t">' + esc(p.id) + ' <small>· ' + esc(p.title) + '</small></div><div class="pr-cells">';
    p.qs.forEach(function (q) { var s = T ? tstatus(c.id, q.no) : status(c.id, q.no); h += '<button class="pr-cell ' + (s === 'new' ? '' : s) + (q.no === c.no ? ' cur' : '') + (inQ[q.no] ? '' : ' out') + '" data-pal="' + q.no + '" aria-label="Question ' + q.no + (s === 'new' ? ', not done' : ', ' + s) + '">' + q.no + (SS(c.id).bm[q.no] ? '<span class="st">★</span>' : '') + '</button>'; });
    h += '</div>';
  });
  h += T ? '<p class="pr-fine">Tap a number to jump to that question. Your answers are saved as you go.</p><div class="pr-row" style="margin-top:12px"><button class="pr-btn pri" data-pal="sub">Submit test</button></div></div></div>' : '<p class="pr-fine">Faded numbers are outside your current session. Tapping one opens it as a single-question session within the full set.</p></div></div>';
  var r = $('#palroot'); r.innerHTML = h; var pal = r.firstChild; lastFocus = document.activeElement;
  pal.onclick = function (e) {
    if (e.target === pal) return closePal(); var b = e.target.closest('[data-pal]'); if (!b) return;
    if (b.dataset.pal === 'x') return closePal();
    if (b.dataset.pal === 'sub') { closePal(); return confirmSubmit(); }
    var n = +b.dataset.pal;
    if (c.Q.nos.indexOf(n) < 0) { var all = D.qs.map(function (q) { return q.no; }); setQueue(c.id, all, 'Full set'); }
    closePal(); go('#q/' + c.id + '/' + n);
  };
  var cur = pal.querySelector('.cur'); if (cur) { cur.scrollIntoView({ block: 'center' }); cur.focus(); }
}
function closePal() { var p = document.querySelector('.pr-pal'); if (p) { p.remove(); if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {} } }

/* ---------- REVIEW (mistakes / bookmarks) ---------- */
var RF = { sub: '', diff: '', txt: '', sort: 'paper', set: '' };
function reviewCard(id, q) {
  var D = DATA[id], st = QS(id, q.no) || {}, S0 = SS(id), P = D.passages[q.pi], bm = !!S0.bm[q.no], note = S0.note[q.no], s = status(id, q.no);
  var chips = (SETS.length > 1 ? '<span class="pr-chip ink">' + esc(D.meta.title.replace('Practice ', '')) + '</span>' : '') + '<span class="pr-qno">Q' + q.no + '</span><span class="pr-chip d-' + esc(q.diff) + '">' + esc(q.diff) + '</span><span class="pr-chip">' + esc(q.subject) + '</span>' +
    (s === 'bad' ? '<span class="pr-chip bad">You chose ' + esc(st.s) + ' · answer ' + q.ans + '</span>' : s === 'ok' ? '<span class="pr-chip ok">Right</span>' : s === 'seen' ? '<span class="pr-chip seen">Revealed</span>' : '<span class="pr-chip">Not attempted</span>') +
    (bm ? '<span class="pr-chip" style="background:var(--sun)">★ Bookmarked</span>' : '') + ((st.w || 0) > 1 ? '<span class="pr-chip">Wrong ' + st.w + '×</span>' : '');
  var opts = L.split('').map(function (k) {
    var cl = k === q.ans ? 'right' : (k === st.s ? 'wrong' : ''), mk = k === q.ans ? (k === st.s ? 'YOUR ANSWER ✓' : 'CORRECT') : (k === st.s ? 'YOUR ANSWER ✗' : '');
    return '<li class="' + cl + '"><span class="l">' + k + '</span><span>' + esc(q.opts[k]) + '</span>' + (mk ? '<span class="mk">' + mk + '</span>' : '') + '</li>';
  }).join('');
  return '<details class="pr-rv" data-no="' + q.no + '" data-set="' + id + '"><summary><div class="chips">' + chips + '</div><div class="stem">' + esc(q.q) + '</div></summary><div class="body" data-wm>' +
    (P.text ? '<details class="pp"><summary>Read the passage: ' + esc(P.title) + '</summary><div class="pt">' + esc(P.text) + '</div></details>' : '') +
    '<p class="pr-qtext" style="margin:0">' + esc(q.q) + '</p><ul class="roptions">' + opts + '</ul>' +
    (q.exp ? '<div class="pr-ex e1"><h4><i>✓</i>Why option ' + q.ans + ' is correct</h4><p>' + esc(q.exp) + '</p></div>' : '') +
    (q.why ? '<div class="pr-ex e2"><h4><i>✗</i>Why the other options fail</h4>' + whyList(q.why, q.ans) + '</div>' : '') +
    (q.trap ? '<div class="pr-ex e3"><h4><i>⚠</i>' + esc(CFG.trapLabel.replace(': how this question is tricky', '')) + '</h4><p>' + esc(q.trap) + '</p></div>' : '') +
    (q.lang ? '<div class="pr-ex e4"><h4><i>Aa</i>' + esc(CFG.langLabel) + '</h4><p>' + esc(q.lang) + '</p></div>' : '') +
    (note ? '<div class="note"><b>Your note:</b> ' + esc(note) + '</div>' : '') +
    '<div class="acts"><button class="pr-btn sm pri" data-ract="one">Practise this question</button><button class="pr-btn sm" data-ract="bm">' + (bm ? 'Remove bookmark' : 'Bookmark') + '</button>' + (s === 'bad' || s === 'seen' ? '<button class="pr-btn sm" data-ract="reset">Reset &amp; retry later</button>' : '') + '</div>' +
    '<span class="pr-stamp" aria-hidden="true">NETLAWVERSE.IN</span></div></details>';
}
function review(kind) {
  var all = [], A = allStats();
  Object.keys(DATA).forEach(function (id) { DATA[id].qs.forEach(function (q) { var s = status(id, q.no), inc = kind === 'mistakes' ? s === 'bad' : !!SS(id).bm[q.no]; if (inc) all.push({ id: id, q: q, t: (QS(id, q.no) || {}).t || SS(id).bm[q.no] || 0 }); }); });
  var subs = {}; all.forEach(function (x) { subs[x.q.sg] = 1; });
  var title = kind === 'mistakes' ? 'My mistakes' : 'Bookmarks';
  var h = '<section class="pr-hero"><div><h1>' + title + '</h1></div><p class="lead">' + (kind === 'mistakes' ? 'Every question you answered wrongly, with the passage, your answer, the right answer, the trap and the language trick. Re-read, then retry.' : 'Questions you starred, with their full explanations and your notes.') + '</p></section>' + tabs(kind);
  h += '<div class="pr-tools"><label class="pr-lab grow">Search<input class="pr-in" id="rf-t" type="search" placeholder="Search question text or subject" value="' + esc(RF.txt) + '"></label>' +
    (SETS.length > 1 ? '<label class="pr-lab">Set<select class="pr-sel" id="rf-set"><option value="">All sets</option>' + SETS.map(function (m) { return '<option value="' + m.id + '"' + (RF.set === m.id ? ' selected' : '') + '>' + esc(m.title) + '</option>'; }).join('') + '</select></label>' : '') + '<label class="pr-lab">Subject<select class="pr-sel" id="rf-s"><option value="">All subjects</option>' + Object.keys(subs).sort().map(function (x) { return '<option' + (RF.sub === x ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('') + '</select></label>' +
    '<label class="pr-lab">Difficulty<select class="pr-sel" id="rf-d"><option value="">All levels</option>' + DIFFS.map(function (d) { return '<option' + (RF.diff === d ? ' selected' : '') + '>' + d + '</option>'; }).join('') + '</select></label>' +
    '<label class="pr-lab">Order<select class="pr-sel" id="rf-o"><option value="paper">Paper order</option><option value="recent"' + (RF.sort === 'recent' ? ' selected' : '') + '>Most recent first</option></select></label></div>';
  h += '<div class="pr-row" style="margin-bottom:12px"><button class="pr-btn pri sm" data-act="rpractice">Practise these</button><button class="pr-btn sm" data-act="rexp">Expand all</button><button class="pr-btn sm" data-act="rcol">Collapse all</button><button class="pr-btn sm" data-act="rprint">Print / save as PDF</button></div><div id="rlist"></div>';
  ROOT.innerHTML = h;
  function draw() {
    var f = all.filter(function (x) { return (!RF.set || x.id === RF.set) && (!RF.sub || x.q.sg === RF.sub) && (!RF.diff || x.q.diff === RF.diff) && (!RF.txt || (x.q.q + ' ' + x.q.subject + ' ' + DATA[x.id].passages[x.q.pi].title).toLowerCase().indexOf(RF.txt.toLowerCase()) > -1); });
    f.sort(function (a, b) { return RF.sort === 'recent' ? b.t - a.t : (a.id === b.id ? a.q.no - b.q.no : a.id < b.id ? -1 : 1); });
    var out = !all.length ? '<div class="pr-empty"><b>' + (kind === 'mistakes' ? 'No mistakes yet' : 'Nothing bookmarked yet') + '</b>' + (kind === 'mistakes' ? 'Wrong answers collect here automatically once you check an answer. Good or bad, that is how you learn the traps.' : 'Tap the star while practising to save a question here.') + '<br><br><a class="pr-btn pri" href="#home">Start practising</a></div>'
      : !f.length ? '<div class="pr-empty"><b>No matches</b>Try clearing the filters.</div>'
      : '<p class="pr-count">' + f.length + ' question' + (f.length === 1 ? '' : 's') + '</p><div class="pr-list">' + f.map(function (x) { return reviewCard(x.id, x.q); }).join('') + '</div>';
    $('#rlist').innerHTML = out; draw.cur = f;
  }
  draw();
  function ev(id, fn) { var e = $(id); if (e) e.addEventListener('input', fn); }
  ev('#rf-t', function (e) { RF.txt = e.target.value; draw(); });
  ev('#rf-set', function (e) { RF.set = e.target.value; draw(); });
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
        if (nos.length < f.length) toast('Practising ' + DATA[id].meta.title + ' first. Use the Set filter to practise the other set.');
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
    var s = status(id, q.no); var a = bySub[q.sg] = bySub[q.sg] || { ok: 0, bad: 0 }, b = byDiff[q.diff] = byDiff[q.diff] || { ok: 0, bad: 0 };
    if (s === 'ok') { a.ok++; b.ok++; } else if (s === 'bad') { a.bad++; b.bad++; }
  }); });
  var subRows = Object.keys(bySub).sort().map(function (k) { var v = bySub[k], t = v.ok + v.bad; return { n: k, a: t ? Math.round(v.ok / t * 100) : null, k: v.ok + '/' + t, t: t }; });
  var weak = subRows.filter(function (r) { return r.t >= 2 && r.a < 60; }).sort(function (a, b) { return a.a - b.a; }).slice(0, 3);
  h += '<div class="pr-stats" style="margin-bottom:16px"><div class="pr-stat"><b>' + A.att + '</b><small>questions attempted</small></div><div class="pr-stat"><b>' + (A.acc == null ? '–' : A.acc + '%') + '</b><small>accuracy</small></div><div class="pr-stat"><b>' + fmtp(A.marks) + '</b><small>net marks</small></div><div class="pr-stat"><b>' + S.days.length + '</b><small>days practised</small></div><div class="pr-stat"><b>' + streak() + '</b><small>day streak</small></div></div>';
  if (weak.length) h += '<div class="pr-focus">Focus next: ' + weak.map(function (w) { return '<b>' + esc(w.n) + '</b> (' + w.a + '%)'; }).join(', ') + '. Open <a href="#mistakes">My mistakes</a> and filter by subject.</div>';
  else if (!A.att) h += '<div class="pr-focus">Attempt a few questions and your weak subjects will show up here.</div>';
  var mockH = '';
  if (CFG.mocks) {
    var mr = [];
    msets().forEach(function (m) { (SS(m.id).attempts || []).forEach(function (a, i) { mr.push({ n: DATA[m.id].meta.title + ' · attempt ' + (i + 1), a: Math.max(0, Math.round(a.marks / a.n * 100)), k: fmtp(a.marks) + '/' + a.n, t: a.t }); }); });
    mr.sort(function (a, b) { return b.t - a.t; });
    mockH = '<div class="pr-card" style="margin-bottom:18px"><h3 style="margin:0 0 12px">Mock test scores</h3>' + (mr.length ? bars(mr.slice(0, 12)) + '<p class="pr-fine">Bars show net marks as a share of the paper. Open a result from the Mock tests tab to see the full breakdown.</p>' : '<p class="pr-sub" style="margin:0">No mock test submitted yet. Your net marks for each attempt will be listed here.</p>') + '</div>';
  }
  var setRows = SETS.map(function (m) { var st = stats(m.id); return { n: m.title, a: st.acc, k: st.ok + '/' + st.att }; });
  h += mockH + '<div class="pr-grid2"><div class="pr-card"><h3 style="margin:0 0 12px">By set</h3>' + bars(setRows) + '<h3 style="margin:22px 0 12px">By subject</h3>' + bars(subRows) + '</div><div class="pr-card"><h3 style="margin:0 0 12px">By difficulty</h3>' + bars(DIFFS.map(function (d) { var v = byDiff[d] || { ok: 0, bad: 0 }, t = v.ok + v.bad; return { n: d, a: t ? Math.round(v.ok / t * 100) : null, k: v.ok + '/' + t }; })) +
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
    if (b.dataset.act === 'exp') { var blob = new Blob([JSON.stringify(S)], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'netlawverse-' + CFG.slug + '-practice-backup.json'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
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
