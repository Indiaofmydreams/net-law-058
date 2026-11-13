/* NET Law-Verse phone app: CLAT PG, AIBE and Semester Law Notes as real in-app screens.
   Loaded on demand by m-app.js the first time #/clat, #/aibe or #/sem is opened.
   Paper 1 and Law (058) are not touched by this file.

   The text of every guide is read live from the website pages in /clat-pg/ (so an edit to a page shows up in the app
   with no second copy to maintain) and drawn here as phone screens: bottom tabs, tappable cards, accordions,
   a one-question-at-a-time sample paper, a searchable case vault and a syllabus tracker.
   Everything saved (syllabus ticks, sample-paper answers, bookmarked cases) stays on this phone and uses the same
   keys as the website where one exists (clat-syl-v1). Needs internet, like the rest of the app. */
(function () {
"use strict";
var N = window.NLM; if (!N) return;
var esc = N.esc, sv = N.sv, P = N.P, I = N.I, ico = N.ico, R = N.R, A = N.A, screen = N.screen, tbar = N.tbar, ls = N.ls, go = N.go, toast = N.toast;
var BASE = 'clat-pg/';
var NAVEL = document.getElementById('nav'), FOOT = document.getElementById('foot'), VIEW = document.getElementById('view');
var EXAM_T = Date.UTC(2026, 11, 6, 8, 30, 0);              /* 6 December 2026, same value the website uses */
var SYL_KEY = 'clat-syl-v1', SMP_KEY = 'nl-clat-sample-v1', BM_KEY = 'nl-clat-case-bm';
var timers = [];
function clearTimers() { while (timers.length) clearInterval(timers.pop()); }
addEventListener('hashchange', function () { if (!/^#\/(clat|ug|aibe|sem)/.test(location.hash)) clearTimers(); });

/* ---------- styles (scoped with the cx- prefix) ---------- */
(function () {
  if (document.getElementById('nlc-css')) return;
  var s = document.createElement('style'); s.id = 'nlc-css';
  s.textContent = [
    '.cx-hero{position:relative;overflow:hidden;border-radius:26px;padding:20px 18px 18px;color:#fff;background:radial-gradient(70% 90% at 100% 0%,color-mix(in srgb,var(--c2) 55%,transparent),transparent 70%),linear-gradient(160deg,var(--deep),var(--deep2));box-shadow:0 18px 34px -18px var(--c3-deep)}',
    '.cx-hero small.k{display:inline-block;font-size:.6875rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:5px 11px;border-radius:99px;background:rgba(255,255,255,.16)}',
    '.cx-hero h2{margin:10px 0 4px;font-size:1.45rem;line-height:1.15;font-weight:800;letter-spacing:-.025em}',
    '.cx-hero p{margin:0;font-size:.875rem;line-height:1.45;font-weight:600;color:rgba(255,255,255,.86)}',
    '.cx-days{display:flex;align-items:flex-end;gap:10px;margin-top:14px}.cx-days b{font-size:3.1rem;line-height:.9;font-weight:800;letter-spacing:-.04em}.cx-days span{font-size:.8125rem;font-weight:700;color:rgba(255,255,255,.85);padding-bottom:4px;line-height:1.25}',
    '.cx-facts{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:16px}.cx-facts div{background:rgba(255,255,255,.12);border-radius:13px;padding:9px 4px;text-align:center}.cx-facts b{display:block;font-size:1rem;font-weight:800}.cx-facts small{display:block;font-size:.625rem;font-weight:700;color:rgba(255,255,255,.78);margin-top:1px}',
    '.cx-tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cx-t{display:flex;flex-direction:column;gap:8px;padding:14px;border-radius:20px;background:var(--surface);border:1px solid var(--card);box-shadow:var(--sh);color:var(--text);min-height:112px}.cx-t b{font-size:.9375rem;font-weight:800;line-height:1.2}.cx-t small{font-size:.75rem;font-weight:600;color:var(--text2);line-height:1.3}.cx-t .ico{width:38px;height:38px;border-radius:12px}',
    '.cx-path{display:flex;gap:12px;align-items:center;padding:14px;border-radius:20px;background:var(--surface);border:1.5px solid var(--card);box-shadow:var(--sh);color:var(--text);position:relative;margin-bottom:10px}.cx-path.fit{border-color:var(--ac);background:var(--tint)}',
    '.cx-path em{font-style:normal;flex:none;width:58px;height:58px;border-radius:17px;display:grid;place-items:center;text-align:center;background:var(--gA);color:#fff;font-weight:800;font-size:1.5rem;line-height:1}.cx-path em small{display:block;font-size:.5625rem;letter-spacing:.05em;margin-top:2px}',
    '.cx-path b{display:block;font-size:.9375rem;font-weight:800}.cx-path span{display:block;font-size:.8125rem;line-height:1.4;font-weight:600;color:var(--text2);margin-top:2px}.cx-path .tag{position:absolute;top:-9px;right:12px;font-size:.625rem;font-weight:800;padding:3px 9px;border-radius:99px;background:var(--ac-d);color:#fff}',
    '.cx-prog{display:flex;gap:10px}.cx-prog>a{flex:1;padding:13px 14px;border-radius:18px;background:var(--surface);border:1px solid var(--card);box-shadow:var(--sh);color:var(--text)}.cx-prog b{display:block;font-size:1.35rem;font-weight:800;letter-spacing:-.02em}.cx-prog small{display:block;font-size:.75rem;font-weight:700;color:var(--text2);margin-top:1px}.cx-meter{height:6px;border-radius:9px;background:var(--chip);margin-top:9px;overflow:hidden}.cx-meter i{display:block;height:100%;border-radius:9px;background:var(--ok);width:0}',
    '.cx-note{margin:12px 0;padding:12px 14px;border-radius:14px;background:var(--soft);border:1px solid var(--line);font-size:.8125rem;line-height:1.5;font-weight:600;color:var(--text2)}',
    '.cx-d{background:var(--surface);border:1px solid var(--card);border-radius:18px;margin-bottom:10px;box-shadow:var(--sh);overflow:hidden}.cx-d>summary{list-style:none;display:flex;align-items:center;gap:10px;padding:15px 16px;font-weight:800;font-size:.9375rem;line-height:1.3;cursor:pointer;color:var(--text)}.cx-d>summary::-webkit-details-marker{display:none}.cx-d>summary>span,.cx-d>summary>div{flex:1;min-width:0}.cx-d>summary>svg.chev{flex:none;transition:transform .2s;color:var(--mut)}.cx-d[open]>summary>svg.chev{transform:rotate(180deg)}',
    '.cx-b{padding:0 16px 16px;font-size:.9375rem;line-height:1.62;color:var(--text);overflow-wrap:anywhere}.cx-b h2,.cx-b h3,.cx-b h4{margin:16px 0 6px;font-size:.9375rem;font-weight:800;line-height:1.3}.cx-b>:first-child{margin-top:0}.cx-b p{margin:8px 0}.cx-b ul,.cx-b ol{margin:8px 0;padding-left:20px}.cx-b li{margin:5px 0}.cx-b a{color:var(--ac-d);font-weight:700;text-decoration:underline}.cx-b sup{font-size:.7em}',
    '.cx-b .x-tw,.cx-r .x-tw{overflow-x:auto;margin:10px -4px;-webkit-overflow-scrolling:touch}.cx-b table,.cx-r table{border-collapse:collapse;min-width:100%;font-size:.8125rem;line-height:1.4}.cx-b th,.cx-b td,.cx-r th,.cx-r td{border:1px solid var(--line);padding:8px 10px;text-align:left;vertical-align:top}.cx-b th,.cx-r th{background:var(--soft);font-weight:800;white-space:nowrap}',
    '.cx-b .x-note,.cx-r .x-note{margin:12px 0;padding:11px 13px;border-radius:13px;background:var(--soft);border:1px solid var(--line);font-size:.8125rem;line-height:1.5;color:var(--text2);font-weight:600}',
    '.cx-b .x-tiles,.cx-r .x-tiles{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}.cx-b .x-tile,.cx-r .x-tile{padding:11px;border-radius:14px;background:var(--soft);border:1px solid var(--line);text-align:center}.cx-b .x-tile b,.cx-r .x-tile b{display:block;font-size:1.15rem;margin:0}.cx-b .x-tile small,.cx-r .x-tile small{display:block;font-size:.6875rem;color:var(--text2);font-weight:700;margin-top:2px;line-height:1.3}',
    '.cx-b .x-stat,.cx-r .x-stat{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}.cx-b .x-stat>div{padding:10px 6px;border-radius:13px;background:var(--soft);text-align:center;font-size:.75rem;font-weight:700}.cx-b .x-stat b{display:block;font-size:1.05rem}',
    '.cx-b .x-dx-grid,.cx-r .x-dx-grid{display:grid;gap:10px;margin:10px 0}.cx-b .x-dx-c,.cx-b .x-dx-t,.cx-b .x-dx-case,.cx-b .x-dx-call,.cx-b .x-aff{padding:12px 13px;border-radius:15px;background:var(--soft);border:1px solid var(--line)}.cx-b .x-dx-c>:first-child,.cx-b .x-dx-t>:first-child{margin-top:0}.cx-b .x-dx-call{border-color:var(--ac)}.cx-b .x-dx-sub{color:var(--text2);font-weight:600}.cx-b .x-dx-traps,.cx-b .x-dx-plan{padding-left:22px}',
    '.cx-b details{border:1px solid var(--line);border-radius:13px;padding:10px 13px;margin:10px 0;background:var(--soft)}.cx-b details summary{font-weight:800;cursor:pointer}',
    '.cx-lead{margin:2px 2px 12px;font-size:.9375rem;line-height:1.55;font-weight:600;color:var(--text2)}',
    '.cx-top{display:flex;gap:8px;margin:0 0 12px}.cx-top button{flex:none;padding:8px 14px;border-radius:99px;background:var(--chip);color:var(--text2);font-weight:800;font-size:.8125rem}',
    '.cx-rel a{display:flex;align-items:center;gap:12px;padding:12px 14px;margin-bottom:8px;border-radius:16px;background:var(--surface);border:1px solid var(--card);color:var(--text);font-weight:800;font-size:.875rem}.cx-rel a span{flex:1}',
    /* syllabus */
    '.cx-sy>summary{padding:13px 14px}.cx-sy .tg{display:inline-block;margin-top:3px;font-size:.6875rem;font-weight:800;padding:3px 9px;border-radius:99px;background:var(--chip);color:var(--text2)}.cx-sy.t1 .tg{background:var(--bad-bg);color:var(--bad-text)}.cx-sy.t3 .tg{background:var(--ok-bg);color:var(--ok-text)}',
    '.cx-ck{flex:none;width:34px;height:34px;border-radius:50%;border:2px solid var(--line2);display:grid;place-items:center;color:transparent;background:var(--surface)}.cx-ck svg{width:18px;height:18px}.cx-ck.on{background:var(--ok);border-color:var(--ok);color:#fff}',
    '.cx-sy h4{margin:14px 0 5px;font-size:.75rem;letter-spacing:.05em;text-transform:uppercase;color:var(--mut);font-weight:800}.cx-sy .cx-b p{margin:4px 0}',
    /* cases */
    '.cx-s{width:100%;height:46px;border-radius:14px;border:1.5px solid var(--line);background:var(--surface);color:var(--text);padding:0 14px;font:inherit;font-weight:600;font-size:.9375rem}.cx-s:focus{outline:2px solid var(--ac);border-color:var(--ac)}',
    '.cx-sticky{position:sticky;top:-1px;z-index:5;background:var(--bg);padding:2px 0 8px;margin:0 -16px;padding-left:16px;padding-right:16px}',
    '.cx-case>summary{align-items:flex-start;padding:13px 14px}.cx-case h3{margin:3px 0 0;font-size:.9375rem;line-height:1.3;font-weight:800}.cx-case h3 em{font-style:normal;color:var(--mut);font-weight:700;font-size:.8125rem}.cx-lab{font-size:.625rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--ac-d)}.cx-pr{margin:5px 0 0;font-size:.8125rem;line-height:1.45;color:var(--text2);font-weight:600}',
    '.cx-case dl{margin:0;padding:0 14px 14px}.cx-case dt{margin:12px 0 3px;font-size:.6875rem;font-weight:800;letter-spacing:.06em;color:var(--mut)}.cx-case dt.h{color:var(--ok-text)}.cx-case dt.p{color:var(--ac-d)}.cx-case dd{margin:0;font-size:.875rem;line-height:1.55;font-weight:600}',
    '.cx-bm{flex:none;width:34px;height:34px;display:grid;place-items:center;color:var(--mut);border-radius:50%}.cx-bm.on{color:var(--star,#e3a008)}.cx-bm svg{width:20px;height:20px}',
    /* sample paper */
    '.cx-qbar{height:6px;border-radius:9px;background:var(--chip);overflow:hidden;margin:0 0 12px}.cx-qbar i{display:block;height:100%;background:var(--gA);border-radius:9px}',
    '.cx-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}.cx-chips span{font-size:.6875rem;font-weight:800;padding:4px 10px;border-radius:99px;background:var(--chip);color:var(--text2)}',
    '.cx-pass{padding:14px;border-radius:16px;background:var(--soft);border:1px solid var(--line);font-size:.9375rem;line-height:1.62;margin-bottom:12px}.cx-pass .l{display:block;font-size:.625rem;font-weight:800;letter-spacing:.07em;color:var(--mut);margin-bottom:5px}.cx-pass p{margin:6px 0}',
    '.cx-stem{font-size:1rem;line-height:1.5;font-weight:800;margin:4px 2px 12px}.cx-stem p{margin:0}',
    '.cx-o{display:flex;gap:11px;align-items:flex-start;width:100%;text-align:left;padding:13px;margin-bottom:9px;border-radius:15px;background:var(--surface);border:1.5px solid var(--line);color:var(--text);font-size:.9375rem;line-height:1.45;font-weight:600}.cx-o i{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-weight:800;font-size:.8125rem;background:var(--chip)}',
    '.cx-o.ok{border-color:var(--ok);background:var(--ok-bg)}.cx-o.ok i{background:var(--ok);color:#fff}.cx-o.bad{border-color:#d33;background:var(--bad-bg)}.cx-o.bad i{background:#d33;color:#fff}.cx-o:disabled{opacity:1}',
    '.cx-v{padding:12px 14px;border-radius:14px;font-weight:800;font-size:.9375rem;margin:6px 0 12px}.cx-v.ok{background:var(--ok-bg);color:var(--ok-text)}.cx-v.bad{background:var(--bad-bg);color:var(--bad-text)}.cx-v.skip{background:var(--chip);color:var(--text2)}',
    '.cx-tt{display:flex;margin-bottom:10px}.cx-tt .seg{width:100%}.cx-tt .seg button{font-size:.75rem}',
    '.cx-why{list-style:none;padding:0!important;margin:10px 0}.cx-why li{display:flex;gap:10px;padding:10px;border-radius:12px;background:var(--soft);margin:6px 0;font-size:.875rem;line-height:1.5}.cx-why li.good{background:var(--ok-bg)}.cx-why .l{flex:none;width:24px;height:24px;border-radius:50%;background:var(--chip);display:grid;place-items:center;font-weight:800;font-size:.75rem}.cx-why .t{display:block;font-weight:800;margin-bottom:2px}',
    '.cx-timer{margin-left:auto;font-variant-numeric:tabular-nums;font-weight:800;font-size:.8125rem;color:var(--mut)}',
    '.cx-res{text-align:center;padding:22px 16px;border-radius:24px;color:#fff;background:linear-gradient(160deg,var(--deep),var(--deep2));box-shadow:0 18px 34px -18px var(--c3-deep)}.cx-res b{display:block;font-size:3.2rem;line-height:1;font-weight:800;letter-spacing:-.04em}.cx-res small{display:block;margin-top:6px;font-size:.875rem;font-weight:700;color:rgba(255,255,255,.85)}',
    '.cx-st{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}.cx-st div{padding:12px 6px;border-radius:15px;background:var(--surface);border:1px solid var(--card);text-align:center}.cx-st b{display:block;font-size:1.3rem;font-weight:800}.cx-st small{font-size:.6875rem;font-weight:700;color:var(--text2)}',
    '.cx-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.cx-grid a{display:grid;place-items:center;height:46px;border-radius:13px;font-weight:800;background:var(--chip);color:var(--text2)}.cx-grid a.ok{background:var(--ok);color:#fff}.cx-grid a.bad{background:#d33;color:#fff}',
    '.cx-steps{counter-reset:s;list-style:none;padding:0;margin:0}.cx-steps li{counter-increment:s;display:flex;gap:11px;padding:10px 0;font-size:.875rem;line-height:1.5}.cx-steps li::before{content:counter(s);flex:none;width:26px;height:26px;border-radius:50%;background:var(--gA);color:#fff;display:grid;place-items:center;font-weight:800;font-size:.8125rem}',
    '.cx-foot{display:flex;gap:10px;width:100%}.cx-foot .btn{flex:1}',
    /* coming soon (AIBE, semester notes) */
    '.cx-clock{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:16px}.cx-clock div{background:rgba(255,255,255,.13);border-radius:14px;padding:11px 4px;text-align:center}.cx-clock b{display:block;font-size:1.4rem;font-weight:800;font-variant-numeric:tabular-nums}.cx-clock small{font-size:.625rem;font-weight:700;color:rgba(255,255,255,.8)}',
    '.cx-big{font-size:1rem}',
    '@media(min-width:768px){.cx-tiles{grid-template-columns:repeat(4,1fr)}.cx-grid{grid-template-columns:repeat(10,1fr)}.cx-b .x-dx-grid{grid-template-columns:1fr 1fr}}'
  ].join('\n');
  document.head.appendChild(s);
})();

/* ---------- small helpers ---------- */
var chev = '<svg class="chev" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
function spinner(msg) { return '<div class="empty" style="padding-top:80px"><div class="spin"></div><b>' + esc(msg || 'Opening…') + '</b></div>'; }
function failBody(retryRoute) { return '<div class="empty" style="padding-top:60px"><b>Needs an internet connection</b>This part of the app loads from the website and could not be reached.<br><br><button class="btn" data-a="reload">Try again</button></div>'; }
function here(prefix) { return (location.hash || '#/').indexOf(prefix) === 0; }
function txt(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }

/* bottom tabs for the CLAT PG area (they replace the NET Law-Verse tabs while you are inside CLAT PG) */
var TABS = [['app', 'Home', '/', 'home'], ['home', 'CLAT PG', '/clat', 'target'], ['prep', 'Prepare', '/clat/prep', 'book'], ['prac', 'Practice', '/clat/mocks', 'test'], ['cases', 'Cases', '/clat/cases', 'scale']];
function tabsHTML(on) {
  return '<a class="rb" href="#/clat" aria-label="CLAT PG home"><i>' + N.LOGO(34) + '</i><span class="wm">CLAT PG</span></a>' +
    TABS.map(function (t) { return '<a href="#' + t[2] + '" class="' + (on === t[0] ? 'on' : '') + '"><span class="ni">' + sv(P[t[3]]) + '</span>' + t[1] + '</a>'; }).join('') +
    (N.isTab() ? '<span class="nsec"></span><a href="#/exams"><span class="ni">' + sv(P.grid) + '</span>All exams</a><a href="#/subjects"><span class="ni">' + sv(P.scale) + '</span>UGC NET</a>' : '');
}
function cscreen(o, tab, opt) {
  clearTimers();
  screen(o);
  if (opt && opt.nonav) { NAVEL.hidden = true; return; }
  NAVEL.hidden = false; NAVEL.innerHTML = tabsHTML(tab);
}
function cbar(title, sub, la) { return tbar(title, { sub: sub || '', la: la || 'back', right: '<a class="ib" href="#/" aria-label="Home">' + I.home + '</a>' }); }

/* the website's pages, fetched once per visit */
var DOCS = {};
function getDoc(file) {
  if (DOCS[file]) return DOCS[file];
  return (DOCS[file] = fetch(file, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw 0; return r.text(); })
    .then(function (t) { return new DOMParser().parseFromString(t, 'text/html'); })
    .catch(function (e) { delete DOCS[file]; throw e; }));
}

/* ---------- turning website HTML into safe in-app HTML ---------- */
var OKT = { h2: 1, h3: 1, h4: 1, p: 1, ul: 1, ol: 1, li: 1, b: 1, strong: 1, i: 1, em: 1, a: 1, table: 1, thead: 1, tbody: 1, tr: 1, th: 1, td: 1, div: 1, article: 1, span: 1, details: 1, summary: 1, sup: 1, small: 1, mark: 1, br: 1, dl: 1, dt: 1, dd: 1, section: 1, blockquote: 1 };
var DROPT = { script: 1, style: 1, form: 1, button: 1, input: 1, nav: 1, svg: 1, iframe: 1, noscript: 1, select: 1, textarea: 1, label: 1, img: 1, link: 1, meta: 1, h1: 1 };
var DROPC = { 'dx-back': 1, 'dx-kick': 1, 'dx-q': 1, cta: 1, crumbs: 1, 'sx-back': 1, 'sx-js-only': 1, 'q-nav': 1, 'dm-back': 1, 'sx-tools': 1 };
var KEEPC = { note: 1, tbl: 1, stat: 1, aff: 1, tile: 1, tiles: 1, good: 1, 'q-why': 1, 'dx-c': 1, 'dx-t': 1, 'dx-call': 1, 'dx-sub': 1, 'dx-case': 1, 'dx-traps': 1, 'dx-plan': 1, 'dx-grid': 1, 'dx-note': 1 };
var PAGEMAP = {
  '': '#/clat', 'index.html': '#/clat', 'nlus.html': '#/clat/read/nlus', 'cutoffs.html': '#/clat/read/cutoffs', 'psu-jobs.html': '#/clat/read/psu-jobs', 'faq.html': '#/clat/read/faq',
  'what-clat-pg-really-tests.html': '#/clat/read/traps', 'clat-pg-syllabus.html': '#/clat/syllabus', 'sample-paper-20-questions.html': '#/clat/sample', 'practice.html': '#/clat/practice', 'landmark-cases.html': '#/clat/cases',
  'prep-6-months.html': '#/clat/read/prep-6-months', 'prep-3-months.html': '#/clat/read/prep-3-months', 'prep-4-weeks.html': '#/clat/read/prep-4-weeks', 'prep-2-weeks.html': '#/clat/read/prep-2-weeks'
};
function linkFor(href) {
  if (!href || href.charAt(0) === '#') return null;
  if (/^(https?:|mailto:|tel:)/i.test(href)) return { h: href, ext: 1 };
  var abs = href.charAt(0) === '/', m = /^([^#?]*)(.*)$/.exec(href.replace(/^\//, '')), f = m[1];
  if (abs) {
    if (f === '' || f === 'index.html') return { h: '#/exams' };
    if (f === 'net.html') return { h: '#/' };
    if (f === 'faq.html') return { h: '#/faq' };
    if (f.indexOf('clat-pg/') !== 0) return { h: '/' + f + m[2] };
    f = f.slice(8);
  }
  if (PAGEMAP.hasOwnProperty(f)) return { h: PAGEMAP[f] };
  return { h: (abs ? '/' : '') + f + m[2] };
}
function san(node) {
  var out = '';
  for (var c = node.firstChild; c; c = c.nextSibling) {
    if (c.nodeType === 3) { out += esc(c.nodeValue); continue; }
    if (c.nodeType !== 1) continue;
    var t = c.tagName.toLowerCase();
    if (DROPT[t]) continue;
    var cls = (c.getAttribute('class') || '').split(/\s+/), skip = false;
    for (var i = 0; i < cls.length; i++) if (DROPC[cls[i]]) skip = true;
    if (skip) continue;
    if (t === 'br') { out += '<br>'; continue; }
    var inner = san(c);
    if (!OKT[t]) { out += inner; continue; }
    var at = '', kc = cls.filter(function (x) { return KEEPC[x] || x === 'l' || x === 't'; }).map(function (x) { return 'x-' + x; }).join(' ');
    if (kc) at += ' class="' + kc + '"';
    if (t === 'a') {
      var L = linkFor(c.getAttribute('href'));
      if (!L) { out += inner; continue; }
      at += ' href="' + esc(L.h) + '"' + (L.ext ? ' target="_blank" rel="noopener noreferrer"' : '');
    }
    if ((t === 'td' || t === 'th') && c.getAttribute('colspan')) at += ' colspan="' + (+c.getAttribute('colspan') || 1) + '"';
    if (t === 'details' && c.hasAttribute('open')) at += ' open';
    out += t === 'table' ? '<div class="x-tw"><table' + at + '>' + inner + '</table></div>' : '<' + t + at + '>' + inner + '</' + t + '>';
  }
  return out;
}
function sanSelf(el) { var w = document.createElement('div'); w.appendChild(el.cloneNode(true)); return san(w); }

/* ---------- reader pages (guides) ---------- */
var PG = {
  traps: { f: 'what-clat-pg-really-tests.html', t: 'What CLAT PG really tests', s: '12 traps hidden in the paper', tab: 'prep', split: 'h3', ic: 'target' },
  'prep-6-months': { f: 'prep-6-months.html', t: '6-month plan', s: 'Build your foundation', tab: 'prep', ic: 'cal' },
  'prep-3-months': { f: 'prep-3-months.html', t: '3-month plan', s: 'Accelerate your preparation', tab: 'prep', ic: 'cal' },
  'prep-4-weeks': { f: 'prep-4-weeks.html', t: '4-week plan', s: 'Consolidate and test', tab: 'prep', ic: 'cal' },
  'prep-2-weeks': { f: 'prep-2-weeks.html', t: '2-week plan', s: 'Retrieve, practise and refine', tab: 'prep', ic: 'cal' },
  nlus: { f: 'nlus.html', t: 'Participating NLUs', s: 'The universities behind CLAT PG', tab: 'more', ic: 'inst' },
  cutoffs: { f: 'cutoffs.html', t: 'Cut-offs', s: 'How closing ranks work', tab: 'more', ic: 'bars' },
  'psu-jobs': { f: 'psu-jobs.html', t: 'PSU jobs', s: 'Legal careers through CLAT PG', tab: 'more', ic: 'brief' },
  faq: { f: 'faq.html', t: 'CLAT PG FAQ', s: 'Dates, fees, eligibility, pattern', tab: 'more', ic: 'help', faq: 1 }
};
function buildReader(doc, key) {
  var cfg = PG[key], intro = '', secs = [], main = doc.querySelector('main') || doc.body, html = '';
  if (cfg.faq) {
    var lead = doc.querySelector('.intro .lead'), al = doc.querySelector('p.alert');
    if (lead) intro += '<p class="cx-lead">' + san(lead) + '</p>';
    if (al) intro += '<div class="cx-note">' + san(al) + '</div>';
    [].slice.call(doc.querySelectorAll('details.qa')).forEach(function (d) {
      var s = d.querySelector('summary'), body = '';
      for (var c = d.firstChild; c; c = c.nextSibling) if (c !== s) body += c.nodeType === 1 ? sanSelf(c) : esc(c.nodeValue || '');
      secs.push({ title: txt(s), html: body });
    });
    var upd = doc.querySelector('p.upd'); if (upd) html += '<div class="cx-note">' + san(upd) + '</div>';
  } else {
    var root = cfg.split ? (doc.querySelector('section#different') || main) : (doc.querySelector('article.art') || doc.querySelector('article') || main), hdr = cfg.split || 'h2', cur = null;
    [].slice.call(root.children).forEach(function (el) {
      var t = el.tagName.toLowerCase(), cl = el.className || '';
      if (t === hdr) { cur = { title: txt(el), html: '' }; secs.push(cur); return; }
      if (t === 'h1' || /\b(cta|dx-back|dx-kick|crumbs|dx-q)\b/.test(cl)) return;
      if (/dx-lead|lead/.test(cl) && !cur) { intro += '<p class="cx-lead">' + san(el) + '</p>'; return; }
      var h = sanSelf(el);
      if (cur) cur.html += h; else intro += '<div class="cx-b" style="padding:0 2px">' + h + '</div>';
    });
    secs = secs.filter(function (x) { return !/in 60 seconds/i.test(x.title); });   /* the website's mini-quiz needs the web page */
    if (!cfg.split && !secs.length) secs.push({ title: cfg.t, html: san(root) });
  }
  var body = intro + '<div class="cx-top"><button data-a="cxall" data-o="1">Expand all</button><button data-a="cxall" data-o="0">Collapse all</button></div>';
  secs.forEach(function (s, i) {
    body += '<details class="cx-d"' + (i === 0 && !cfg.faq ? ' open' : '') + '><summary><span>' + esc(s.title) + '</span>' + chev + '</summary><div class="cx-b">' + s.html + '</div></details>';
  });
  body += html;
  var rel = Object.keys(PG).filter(function (k) { return k !== key && PG[k].tab === cfg.tab; });
  body += '<h2 class="h2">More in CLAT PG</h2><div class="cx-rel">' + rel.map(function (k) { return '<a href="#/clat/read/' + k + '">' + ico(PG[k].ic, 'var(--c3-deep)') + '<span>' + esc(PG[k].t) + '</span>' + I.chevR + '</a>'; }).join('') + '</div>';
  return '<div class="cx-r">' + body + '</div>';
}
function reader(key) {
  var cfg = PG[key]; if (!cfg) return hub();
  cscreen({ top: cbar(cfg.t, cfg.s), body: spinner() }, cfg.tab);
  getDoc(BASE + cfg.f).then(function (doc) {
    if (!here('#/clat/read/' + key)) return;
    cscreen({ top: cbar(cfg.t, cfg.s), body: buildReader(doc, key) }, cfg.tab);
  }).catch(function () { if (here('#/clat/read/' + key)) cscreen({ top: cbar(cfg.t), body: failBody() }, cfg.tab); });
}
A.cxall = function (t) { var o = t.dataset.o === '1'; [].forEach.call(VIEW.querySelectorAll('details.cx-d'), function (d) { d.open = o; }); };

/* ---------- hub (Home tab) ---------- */
var PATHS = [
  ['prep-6-months', '6', 'MONTHS', 'Build your foundation', 'Learn every subject properly, test as you go and let revision come round more than once.'],
  ['prep-3-months', '3', 'MONTHS', 'Accelerate your preparation', 'Cover everything at pace, practise previous-year papers early and finish with mocks.'],
  ['prep-4-weeks', '4', 'WEEKS', 'Consolidate and test', 'Stop widening your reading. Revise, test, find weak areas and close them.'],
  ['prep-2-weeks', '2', 'WEEKS', 'Retrieve, practise and refine', 'Not the time to start over. Sharpen what you know and make every day count.']
];
function daysLeft() { return Math.ceil((EXAM_T - Date.now()) / 864e5); }
function fitIdx(d) { return d >= 135 ? 0 : d >= 60 ? 1 : d >= 22 ? 2 : 3; }
function pathCards() {
  var d = daysLeft(), fit = d > 0 ? fitIdx(d) : -1;
  return PATHS.map(function (p, i) {
    return '<a class="cx-path' + (i === fit ? ' fit' : '') + '" href="#/clat/read/' + p[0] + '">' + (i === fit ? '<span class="tag">Closest fit</span>' : '') + '<em>' + p[1] + '<small>' + p[2] + '</small></em><div><b>' + esc(p[3]) + '</b><span>' + esc(p[4]) + '</span></div></a>';
  }).join('');
}
function sylDone() { var s = ls.get(SYL_KEY, {}), n = 0; for (var k in s) if (s[k]) n++; return n; }
function sampleSaved() { return ls.get(SMP_KEY, { a: {} }); }
function sampleScore(a, qs) {
  var r = 0, w = 0, s = 0; (qs || []).forEach(function (q) { var v = a[q.n]; if (!v) return; if (v === '-') s++; else if (v === q.ans) r++; else w++; });
  return { right: r, wrong: w, skip: s, marks: r - w * 0.25 };
}
function hub() {
  var d = daysLeft(), done = sylDone(), sm = sampleSaved(), answered = Object.keys(sm.a || {}).length;
  var heroDays = d > 0 ? '<div class="cx-days"><b>' + d + '</b><span>days to the exam<br>6 December 2026</span></div>' : '<div class="cx-days"><span>The CLAT PG 2027 exam date (6 December 2026) has passed.<br>Check the FAQ for results and counselling.</span></div>';
  cscreen({
    top: '<div class="tb"><a class="ib" href="#/" aria-label="Home">' + I.home + '</a><h1>CLAT PG<small>LL.M. entrance, free</small></h1><a class="ib" href="#/clat/cases" aria-label="Search cases">' + I.search + '</a></div>',
    body: '<div class="cx-hero"><small class="k">CLAT PG 2027</small><h2>Crack the LL.M. entrance, one clear step at a time.</h2><p>Free guides, a 20-question sample paper and 705 landmark cases. No sign-up.</p>' + heroDays +
      '<div class="cx-facts"><div><b>120</b><small>questions</small></div><div><b>120</b><small>minutes</small></div><div><b>&minus;0.25</b><small>per wrong</small></div><div><b>26</b><small>NLUs</small></div></div></div>' +
      pracCard() + '<h2 class="h2" style="margin-top:18px">Your progress</h2><div class="cx-prog"><a href="#/clat/syllabus"><b>' + done + '<span style="font-size:.9rem;color:var(--mut)"> / 14</span></b><small>subjects covered</small><div class="cx-meter"><i style="width:' + Math.round(done / 14 * 100) + '%"></i></div></a>' +
      '<a href="#/clat/sample"><b>' + (answered ? answered + '<span style="font-size:.9rem;color:var(--mut)"> / 20</span>' : '&ndash;') + '</b><small>' + (answered ? 'sample questions done' : 'Try the sample paper') + '</small><div class="cx-meter"><i style="width:' + Math.round(answered / 20 * 100) + '%"></i></div></a></div>' +
      '<h2 class="h2">Pick your pathway</h2>' + pathCards() +
      '<h2 class="h2">Explore</h2><div class="cx-tiles">' +
      tile('#/clat/practice', 'target', 'Practice Arena', '300 questions with traps explained', 'var(--c3-deep)') +
      tile('#/clat/syllabus', 'book', 'Syllabus', '14 subjects in priority order, with a tracker', 'var(--c3-deep)') +
      tile('#/clat/read/traps', 'target', '12 traps', 'What the paper really tests', 'var(--c2-deep)') +
      tile('#/clat/sample', 'test', 'Sample paper', '20 questions, every trap explained', 'var(--c3-deep)') +
      tile('#/clat/mocks', 'test', 'Mock tests', '6 full papers, 120 min, time meter', 'var(--c2-deep)') +
      tile('#/clat/cases', 'scale', 'Case vault', '705 landmark cases, searchable', 'var(--c2-deep)') +
      tile('#/clat/read/nlus', 'inst', 'NLUs', 'The 26 participating universities', 'var(--c3-deep)') +
      tile('#/clat/read/cutoffs', 'bars', 'Cut-offs', 'How closing ranks work', 'var(--c2-deep)') +
      tile('#/clat/read/psu-jobs', 'brief', 'PSU jobs', 'Legal careers through CLAT PG', 'var(--c3-deep)') +
      tile('#/clat/read/faq', 'help', 'FAQ', 'Dates, fees, eligibility, counselling', 'var(--c2-deep)') + '</div>' +
      N.stay() + '<div class="cx-note" style="margin-top:18px">Independent study resource, not affiliated with the Consortium of NLUs or any PSU. Always verify dates and rules on consortiumofnlus.ac.in.</div>'
  }, 'home');
}
function tile(h, ic, t, s, c) { return '<a class="cx-t" href="' + h + '">' + ico(ic, c) + '<b>' + t + '</b><small>' + s + '</small></a>'; }
A.cexams = function () { go('/exams'); };
A.chub = function () { go('/clat'); };
A.cmocks = function () { go('/clat/mocks'); };
/* ---------- full-length mock tests: list + runner. The runner is the website's own CLAT mock engine shown inside the app
   (clat-pg/mock-test-N.html?embed=1), so timer, negative marking, resume and results behave exactly as on the website. ---------- */
function mocks() {
  var bar = cbar('Practice', 'Practice Arena, sample paper and mocks', 'chub');
  cscreen({ top: bar, body: spinner() }, 'prac');
  N.clatMeta().then(function (D) {
    if (!here('#/clat/mocks')) return;
    var smp = sampleSaved(), sn = Object.keys(smp.a || {}).length;
    cscreen({ top: bar, body:
      pracCard() + '<a class="card cont" href="#/clat/sample">' + ico('file', 'var(--c2-deep)') + '<div class="ti"><h3>Sample paper</h3><p>20 questions with every trap explained' + (sn ? ' · ' + sn + '/20 done' : '') + '</p></div>' + I.chevR + '</a>' +
      '<h2 class="h2">Full-length mock tests</h2><div class="rows two">' + D.map(N.clatRow).join('') + '</div>' +
      '<p class="muted" style="font-size:.75rem;text-align:center;margin:14px 6px 0">120 passage-based questions in 120 minutes. 1 mark for each correct answer, 0.25 deducted for each wrong answer. Your answers and results stay on this device. Always verify the pattern on consortiumofnlus.ac.in. Not affiliated with the Consortium of NLUs.</p>' }, 'prac');
  }).catch(function () { if (here('#/clat/mocks')) cscreen({ top: bar, body: failBody() }, 'prac'); });
}
function mockRun(n) {
  n = +n; if (!(n >= 1 && n <= 6)) return go('/clat/mocks');
  cscreen({ top: tbar('CLAT PG Mock Test ' + n, { sub: '120 questions · 120 minutes', la: 'cmocks', right: '<a class="ib" href="#/" aria-label="Home">' + I.home + '</a>' }),
    flush: true, exam: true, cls: 'cmv',
    body: '<iframe class="cmf" title="CLAT PG Mock Test ' + n + '" src="clat-pg/mock-test-' + n + '.html?embed=1" allow="clipboard-write; web-share"></iframe>' }, 'prac', { nonav: true });
}

/* ---------- Practice Arena: the website's practice page shown inside the app (clat-pg/practice.html?embed=1) ---------- */
function pracSaved() {
  var r = { done: 0, bad: 0, bm: 0 };
  try { var d = JSON.parse(localStorage.getItem('clatpg-practice-v1') || '{}'); Object.keys(d.sets || {}).forEach(function (k) { var t = d.sets[k]; Object.keys(t.q || {}).forEach(function (n) { var q = t.q[n]; if (q && q.r) { r.done++; if (q.s && !q.c) r.bad++; } }); r.bm += Object.keys(t.bm || {}).length; }); } catch (e) {}
  return r;
}
function pracCard() {
  var p = pracSaved(), sub = p.done ? p.done + ' of 300 done' + (p.bad ? ' · ' + p.bad + ' to review' : '') : '300 questions · trap and language trick explained';
  return '<a class="card cont" href="#/clat/practice" style="margin-top:14px">' + ico('target', 'var(--c2-deep)') + '<div class="ti"><h3>Practice Arena <span style="font-size:.6rem;font-weight:800;padding:2px 7px;border-radius:99px;background:var(--ac);color:#fff;vertical-align:middle">NEW</span></h3><p>' + sub + '</p></div>' + I.chevR + '</a>';
}
function practice() {
  cscreen({ top: tbar('Practice Arena', { sub: '300 trap-explained questions', la: 'chub', right: '<a class="ib" href="#/" aria-label="Home">' + I.home + '</a>' }),
    flush: true, exam: true, cls: 'cmv',
    body: '<iframe class="cmf" title="CLAT PG Practice Arena" src="clat-pg/practice.html?embed=1" allow="clipboard-write; web-share"></iframe>' }, 'prac', { nonav: true });
}

/* ---------- Prepare tab ---------- */
function prep() {
  cscreen({
    top: cbar('Prepare', 'Plans, syllabus and what to expect', 'chub'),
    body: '<h2 class="h2">Pick your pathway</h2>' + pathCards() +
      '<h2 class="h2">Know the paper</h2><div class="rows">' +
      '<a class="row" href="#/clat/read/traps">' + ico('target', 'var(--c2-deep)') + '<div class="ti"><h3>What CLAT PG really tests</h3><p>12 traps hidden in the paper and how to spot them</p></div>' + I.chevR + '</a>' +
      '<a class="row" href="#/clat/syllabus">' + ico('book', 'var(--c3-deep)') + '<div class="ti"><h3>Syllabus tracker</h3><p>' + sylDone() + ' of 14 subjects covered</p></div>' + I.chevR + '</a>' +
      '<a class="row" href="#/clat/practice">' + ico('target', 'var(--c3-deep)') + '<div class="ti"><h3>Practice Arena</h3><p>300 questions, bookmarks, mistakes notebook</p></div>' + I.chevR + '</a>' +
      '<a class="row" href="#/clat/sample">' + ico('test', 'var(--c2-deep)') + '<div class="ti"><h3>Sample paper</h3><p>20 passage-based questions</p></div>' + I.chevR + '</a>' +
      '<a class="row" href="#/clat/mocks">' + ico('test', 'var(--c3-deep)') + '<div class="ti"><h3>Mock tests</h3><p>6 full papers, 120 minutes each</p></div>' + I.chevR + '</a>' +
      '<a class="row" href="#/clat/cases">' + ico('scale', 'var(--c3-deep)') + '<div class="ti"><h3>Case Law Vault</h3><p>705 landmark cases</p></div>' + I.chevR + '</a></div>'
  }, 'prep');
}

/* ---------- More tab ---------- */
function more() {
  cscreen({
    top: cbar('More', 'Universities, careers and answers', 'chub'),
    body: '<div class="rows">' +
      '<a class="row" href="#/clat/read/nlus">' + ico('inst', 'var(--c3-deep)') + '<div class="ti"><h3>Participating NLUs</h3><p>The 26 member universities and how to choose</p></div>' + I.chevR + '</a>' +
      '<a class="row" href="#/clat/read/cutoffs">' + ico('bars', 'var(--c2-deep)') + '<div class="ti"><h3>Cut-offs</h3><p>How closing ranks work</p></div>' + I.chevR + '</a>' +
      '<a class="row" href="#/clat/read/psu-jobs">' + ico('brief', 'var(--c3-deep)') + '<div class="ti"><h3>PSU jobs</h3><p>Legal careers through CLAT PG</p></div>' + I.chevR + '</a>' +
      '<a class="row" href="#/clat/read/faq">' + ico('help', 'var(--c2-deep)') + '<div class="ti"><h3>FAQ</h3><p>Dates, fees, eligibility, pattern, counselling</p></div>' + I.chevR + '</a></div>' +
      '<h2 class="h2">Other exams</h2><div class="rows">' +
      '<a class="row" href="#/exams">' + ico('grid', 'var(--c3-deep)') + '<div class="ti"><h3>All exams</h3><p>Paper 1, Law 058, CLAT PG and more</p></div>' + I.chevR + '</a>' +
      '<a class="row" href="#/">' + ico('scale', 'var(--c2-deep)') + '<div class="ti"><h3>UGC NET Law and Paper 1</h3><p>MCQs, mock tests and notes</p></div>' + I.chevR + '</a></div>' +
      '<div class="cx-note" style="margin-top:18px">Independent study resource, not affiliated with the Consortium of NLUs or any PSU. Verify details on official websites.</div>'
  }, 'more');
}

/* ---------- syllabus tracker ---------- */
var SYF = 'all';
function syllabus() {
  cscreen({ top: cbar('Syllabus', '14 subjects, in priority order', 'chub'), body: spinner() }, 'prep');
  getDoc(BASE + 'clat-pg-syllabus.html').then(function (doc) {
    if (!here('#/clat/syllabus')) return;
    var subs = [].slice.call(doc.querySelectorAll('details.sy')).map(function (d) {
      var ck = d.querySelector('input[data-k]'), two = [].slice.call(d.querySelectorAll('.sy-2 > div'));
      return { id: ck ? ck.getAttribute('data-k') : d.id, name: txt(d.querySelector('.sy-n')), tier: +d.getAttribute('data-tier') || 0, tag: txt(d.querySelector('.sy-tag')),
        topics: [].slice.call(d.querySelectorAll('.sy-l li')).map(txt), extra: two.map(function (x) { return [txt(x.querySelector('h4')), txt(x.querySelector('p'))]; }) };
    });
    SY = { subs: subs, note: txt(doc.querySelector('.sx-note')) };
    drawSyllabus();
  }).catch(function () { if (here('#/clat/syllabus')) cscreen({ top: cbar('Syllabus', '', 'chub'), body: failBody() }, 'prep'); });
}
var SY = null;
function drawSyllabus(keep) {
  var s = ls.get(SYL_KEY, {}), subs = SY.subs, done = subs.filter(function (x) { return s[x.id]; }).length;
  var chips = [['all', 'All'], ['1', 'Read first'], ['2', 'Read next'], ['3', 'Easy marks']].map(function (c) { return '<button class="chip' + (SYF === c[0] ? ' on' : '') + '" data-a="cxsyf" data-f="' + c[0] + '">' + c[1] + '</button>'; }).join('');
  var list = subs.filter(function (x) { return SYF === 'all' || String(x.tier) === SYF; }).map(function (x) {
    return '<details class="cx-d cx-sy t' + x.tier + '"><summary><button class="cx-ck' + (s[x.id] ? ' on' : '') + '" data-a="cxsy" data-k="' + esc(x.id) + '" aria-label="Mark ' + esc(x.name) + ' as covered" aria-pressed="' + !!s[x.id] + '">' + I.check + '</button><div>' + esc(x.name) + '<br><span class="tg">' + esc(x.tag) + '</span></div>' + chev + '</summary><div class="cx-b">' +
      '<h4>Topics to cover</h4><ul>' + x.topics.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
      x.extra.map(function (e) { return '<h4>' + esc(e[0]) + '</h4><p>' + esc(e[1]) + '</p>'; }).join('') + '</div></details>';
  }).join('');
  var html = '<div class="cx-prog" style="margin-bottom:10px"><a href="#/clat/syllabus" style="pointer-events:none"><b id="cxsyn">' + done + '<span style="font-size:.9rem;color:var(--mut)"> / ' + subs.length + '</span></b><small>subjects covered and revised</small><div class="cx-meter"><i id="cxsyb" style="width:' + Math.round(done / subs.length * 100) + '%"></i></div></a></div>' +
    '<div class="chips" style="margin-bottom:8px">' + chips + '</div>' + list +
    (SY.note ? '<div class="cx-note">' + esc(SY.note) + '</div>' : '');
  var top = VIEW.scrollTop;
  cscreen({ top: cbar('Syllabus', '14 subjects, in priority order', 'chub'), body: html, keep: !!keep }, 'prep');
  if (keep) VIEW.scrollTop = top;
}
A.cxsyf = function (t) { SYF = t.dataset.f; drawSyllabus(); };
A.cxsy = function (t) {
  var s = ls.get(SYL_KEY, {}), k = t.dataset.k; if (s[k]) delete s[k]; else s[k] = 1; ls.set(SYL_KEY, s);
  var on = !!s[k]; t.classList.toggle('on', on); t.setAttribute('aria-pressed', on);
  var n = SY.subs.filter(function (x) { return s[x.id]; }).length, e = document.getElementById('cxsyn'), b = document.getElementById('cxsyb');
  if (e) e.firstChild.nodeValue = n; if (b) b.style.width = Math.round(n / SY.subs.length * 100) + '%';
};

/* ---------- case vault ---------- */
var SUBJ = [['all', 'All'], ['con', 'Constitutional law'], ['jur', 'Jurisprudence'], ['adm', 'Administrative law'], ['cnt', 'Contract'], ['tor', 'Torts'], ['fam', 'Family law'], ['cri', 'Criminal law'], ['pro', 'Property law'], ['com', 'Company law'], ['pil', 'Public international law'], ['tax', 'Tax law'], ['env', 'Environmental law'], ['ipr', 'IPR'], ['lab', 'Labour law']];
var SN = {}; SUBJ.forEach(function (x) { SN[x[0]] = x[1]; });
var CS = { cur: 'all', q: '', kind: 'all', n: 30, saved: false }, CASES = null;
function loadCases() {
  if (CASES) return Promise.resolve(CASES);
  return new Promise(function (ok, no) {
    if (window.CASES) return ok(window.CASES);
    var e = document.createElement('script'); e.src = BASE + 'cases-data.js'; e.onload = function () { ok(window.CASES); }; e.onerror = no; document.head.appendChild(e);
  }).then(function (c) {
    CASES = c.map(function (x, i) { return [x, i]; }).sort(function (a, b) { return b[0][2] - a[0][2] || a[1] - b[1]; }).map(function (x) { return x[0]; });
    return CASES;
  });
}
var cbm = function () { return ls.get(BM_KEY, {}); };
var ckey = function (c) { return c[1] + '|' + c[2]; };
function cases() {
  cscreen({ top: cbar('Case Law Vault', 'Landmark cases, searchable', 'chub'), body: spinner('Opening the vault…') }, 'cases');
  loadCases().then(function () {
    if (!here('#/clat/cases')) return;
    var chips = '<div class="chips" id="cxchips"></div><div class="chips" id="cxkinds" style="display:none"></div>';
    cscreen({ top: cbar('Case Law Vault', CASES.length + ' landmark cases', 'chub'),
      body: '<div class="cx-sticky"><input id="cxq" class="cx-s" type="search" placeholder="Search ' + CASES.length + ' cases, issues, principles…" value="' + esc(CS.q) + '" aria-label="Search cases" autocomplete="off">' + chips + '</div><p class="muted" id="cxcnt" style="margin:6px 2px 10px;font-size:.8125rem;font-weight:700"></p><div id="cxl"></div>' }, 'cases');
    document.getElementById('cxq').oninput = function () { CS.q = this.value; CS.n = 30; drawCases(); };
    drawCases();
  }).catch(function () { if (here('#/clat/cases')) cscreen({ top: cbar('Case Law Vault', '', 'chub'), body: failBody() }, 'cases'); });
}
function caseList() {
  var k = CS.q.toLowerCase().trim(), bm = cbm();
  return CASES.filter(function (c) {
    if (CS.saved) return !!bm[ckey(c)];
    return (CS.cur === 'all' || c[0] === CS.cur) && (!k || c.join(' ').toLowerCase().indexOf(k) > -1) && (CS.cur !== 'jur' || CS.kind === 'all' || (CS.kind === 't') === (c[7] === 't'));
  });
}
function drawCases() {
  var bm = cbm(), nSaved = Object.keys(bm).length;
  var cnt = function (key) { return key === 'all' ? CASES.length : CASES.filter(function (c) { return c[0] === key; }).length; };
  document.getElementById('cxchips').innerHTML = '<button class="chip' + (CS.saved ? ' on' : '') + '" data-a="cxsub" data-s="__saved">&#9733; Saved ' + nSaved + '</button>' +
    SUBJ.map(function (x) { var c = cnt(x[0]); return c ? '<button class="chip' + (!CS.saved && CS.cur === x[0] ? ' on' : '') + '" data-a="cxsub" data-s="' + x[0] + '">' + esc(x[1]) + ' ' + c + '</button>' : ''; }).join('');
  var kd = document.getElementById('cxkinds'); kd.style.display = CS.cur === 'jur' && !CS.saved ? 'flex' : 'none';
  kd.innerHTML = [['all', 'All'], ['t', 'Theories & concepts'], ['c', 'Cases']].map(function (x) { return '<button class="chip' + (CS.kind === x[0] ? ' on' : '') + '" data-a="cxkind" data-k="' + x[0] + '">' + x[1] + '</button>'; }).join('');
  var L = caseList(), shown = L.slice(0, CS.n);
  document.getElementById('cxcnt').textContent = CS.saved ? L.length + ' saved case' + (L.length === 1 ? '' : 's') : L.length + ' case' + (L.length === 1 ? '' : 's') + (CS.cur === 'all' ? '' : ' in ' + SN[CS.cur]);
  document.getElementById('cxl').innerHTML = shown.length ? shown.map(function (c) {
    var t = c[7] === 't', lb = t ? ['SCHOOL', 'CORE IDEA', 'KEY POINTS', 'EXAM TIP'] : ['FACTS', 'ISSUE', 'HELD', 'PRINCIPLE'], y = c[2] < 0 ? 'c. ' + (-c[2]) + ' BC' : c[2], on = !!bm[ckey(c)];
    return '<details class="cx-d cx-case"><summary><div><span class="cx-lab">' + esc(SN[c[0]] || '') + (t ? ' &middot; Theory' : '') + '</span><h3>' + esc(c[1]) + ' <em>(' + y + ')</em></h3><p class="cx-pr">' + esc(c[6]) + '</p></div>' +
      '<button class="cx-bm' + (on ? ' on' : '') + '" data-a="cxbm" data-k="' + esc(ckey(c)) + '" aria-label="Save case" aria-pressed="' + on + '">' + sv(P.bm, 20, on ? 'currentColor' : 'none') + '</button></summary>' +
      '<dl><dt>' + lb[0] + '</dt><dd>' + esc(c[3]) + '</dd><dt>' + lb[1] + '</dt><dd>' + esc(c[4]) + '</dd><dt class="h">' + lb[2] + '</dt><dd>' + esc(c[5]) + '</dd><dt class="p">' + lb[3] + '</dt><dd>' + esc(c[6]) + '</dd></dl></details>';
  }).join('') + (L.length > shown.length ? '<button class="btn sec" data-a="cxmore" style="margin:6px 0 10px">Show ' + Math.min(30, L.length - shown.length) + ' more (' + (L.length - shown.length) + ' left)</button>' : '')
    : '<div class="empty"><b>' + (CS.saved ? 'No saved cases yet' : 'No case matches') + '</b>' + (CS.saved ? 'Tap the bookmark on any case to keep it here.' : 'Try a different word or subject.') + '</div>';
}
A.cxsub = function (t) { var s = t.dataset.s; if (s === '__saved') CS.saved = !CS.saved; else { CS.saved = false; CS.cur = s; if (s !== 'jur') CS.kind = 'all'; } CS.n = 30; drawCases(); };
A.cxkind = function (t) { CS.kind = t.dataset.k; CS.n = 30; drawCases(); };
A.cxmore = function () { CS.n += 30; var y = VIEW.scrollTop; drawCases(); VIEW.scrollTop = y; };
A.cxbm = function (t) {
  var b = cbm(), k = t.dataset.k; if (b[k]) delete b[k]; else b[k] = 1; ls.set(BM_KEY, b);
  var on = !!b[k]; t.classList.toggle('on', on); t.setAttribute('aria-pressed', on); t.innerHTML = sv(P.bm, 20, on ? 'currentColor' : 'none');
  toast(on ? 'Case saved' : 'Removed from saved');
  var c = document.querySelector('[data-a=cxsub][data-s=__saved]'); if (c) c.innerHTML = '&#9733; Saved ' + Object.keys(b).length;
};

/* ---------- sample paper ---------- */
var SP = null, TABN = [['asked', 'Asked'], ['hidden', 'Hidden'], ['attempt', 'Attempt'], ['stuck', 'Stuck']];
function loadSample() {
  if (SP) return Promise.resolve(SP);
  return getDoc(BASE + 'sample-paper-20-questions.html').then(function (doc) {
    var qs = [].slice.call(doc.querySelectorAll('article.q')).map(function (a) {
      var chips = [].slice.call(a.querySelectorAll('.q-chip')).map(txt), pass = a.querySelector('.q-pass'), ptag = pass && pass.querySelector('.dx-tag');
      if (ptag) ptag.remove();
      var panels = {}; [].slice.call(a.querySelectorAll('.q-panel')).forEach(function (p) { panels[p.getAttribute('data-t')] = sanSelf(p).replace(/^<div>|<\/div>$/g, ''); });
      return { n: +a.getAttribute('data-n'), ans: a.getAttribute('data-ans'), subj: a.getAttribute('data-subj'), diff: a.getAttribute('data-diff'), type: chips[2] || '',
        pass: pass ? san(pass) : '', stem: san(a.querySelector('.q-stem') || document.createElement('p')),
        opts: [].slice.call(a.querySelectorAll('.q-opt')).map(function (o) { return { k: o.getAttribute('data-k'), t: txt(o.querySelector('span')) }; }), panels: panels };
    }).filter(function (q) { return q.n && q.ans && q.opts.length; });
    var steps = [].slice.call(doc.querySelectorAll('.dm-steps li')).map(function (li) { var b = li.querySelector('b'), h = b ? txt(b) : ''; if (b) b.remove(); return [h, txt(li)]; });
    var pause = [].slice.call(doc.querySelectorAll('#pause .dm-card')).map(function (c) { return [txt(c.querySelector('b')), txt(c.querySelector('p'))]; });
    var note = txt(doc.querySelector('#how .dm-note'));
    SP = { qs: qs, steps: steps, pause: pause, note: note }; return SP;
  });
}
function sample(p) {
  var sub = p[0];
  var back = function () { cscreen({ top: cbar('Sample paper', '', 'chub'), body: failBody() }, 'prac'); };
  cscreen({ top: cbar('Sample paper', '20 questions', 'chub'), body: spinner('Loading the paper…') }, 'prac');
  loadSample().then(function (d) {
    if (!here('#/clat/sample')) return;
    if (sub === 'q') return question(d, +p[1], false);
    if (sub === 'review') return question(d, +p[1], true);
    if (sub === 'result') return result(d);
    intro(d);
  }).catch(back);
}
function intro(d) {
  var sm = sampleSaved(), a = sm.a || {}, n = Object.keys(a).length, total = d.qs.length, next = 1;
  for (var i = 0; i < d.qs.length; i++) { if (!a[d.qs[i].n]) { next = d.qs[i].n; break; } next = 0; }
  var cta = n === 0 ? '<a class="btn" href="#/clat/sample/q/1">Start the paper</a>' : next ? '<a class="btn" href="#/clat/sample/q/' + next + '">Continue with question ' + next + '</a><a class="btn ghost" href="#/clat/sample/result" style="margin-top:10px">See my score so far</a>' : '<a class="btn" href="#/clat/sample/result">See my result</a>';
  cscreen({
    top: cbar('Sample paper', total + ' questions · every trap explained', 'chub'),
    body: '<div class="cx-hero"><small class="k">Free sample paper</small><h2>' + total + ' questions that get harder.</h2><p>Constitutional law, jurisprudence, international law and family law. After every answer, see what the question really asked and how the right answer was hidden.</p>' +
      '<div class="cx-facts"><div><b>' + total + '</b><small>questions</small></div><div><b>+1</b><small>right</small></div><div><b>&minus;0.25</b><small>wrong</small></div><div><b>0</b><small>skipped</small></div></div></div>' +
      '<div style="margin:16px 0 4px">' + cta + '</div>' +
      (n ? '<button class="btn dng" data-a="cxreset" style="margin-top:10px">Start over</button>' : '') +
      '<h2 class="h2">The routine for every question</h2><div class="card"><ol class="cx-steps">' + d.steps.map(function (s) { return '<li><div><b>' + esc(s[0]) + '</b> ' + esc(s[1]) + '</div></li>'; }).join('') + '</ol></div>' +
      (d.pause.length ? '<h2 class="h2">When it gets hard: PAUSE</h2><div class="card">' + d.pause.map(function (x) { return '<p style="margin:8px 0"><b>' + esc(x[0]) + '.</b> ' + esc(x[1]) + '</p>'; }).join('') + '</div>' : '') +
      (d.note ? '<div class="cx-note" style="margin-top:14px">' + esc(d.note) + '</div>' : '')
  }, 'prac');
}
A.cxreset = function () { ls.rm(SMP_KEY); toast('Sample paper reset'); sample([]); };
function question(d, n, review) {
  var q = d.qs.filter(function (x) { return x.n === n; })[0]; if (!q) return result(d);
  var sm = sampleSaved(), a = sm.a || {}, got = a[n], total = d.qs.length, answered = !!got;
  var opts = q.opts.map(function (o) {
    var cl = 'cx-o'; if (answered) { if (o.k === q.ans) cl += ' ok'; else if (o.k === got) cl += ' bad'; }
    return '<button class="' + cl + '" data-a="cxopt" data-k="' + o.k + '" data-n="' + n + '"' + (answered ? ' disabled' : '') + '><i>' + o.k + '</i><span>' + esc(o.t) + '</span></button>';
  }).join('');
  var verdict = '', expl = '';
  if (answered) {
    verdict = got === '-' ? '<div class="cx-v skip">Skipped, 0 marks. The answer is ' + q.ans + '.</div>' : got === q.ans ? '<div class="cx-v ok">Correct. +1 mark</div>' : '<div class="cx-v bad">Not quite. &minus;0.25. The answer is ' + q.ans + '.</div>';
    var tab = ls.get('nl-clat-tab', 'asked'); if (!q.panels[tab]) tab = 'asked';
    expl = '<div class="cx-tt"><div class="seg" role="tablist">' + TABN.map(function (t) { return q.panels[t[0]] ? '<button role="tab" class="' + (tab === t[0] ? 'on' : '') + '" data-a="cxtab" data-t="' + t[0] + '">' + t[1] + '</button>' : ''; }).join('') + '</div></div><div class="card cx-b" id="cxpanel" style="padding:14px 16px">' + panelHTML(q.panels[tab]) + '</div>';
  }
  var prev = n > 1 ? '<a class="btn ghost" href="#/clat/sample/' + (review ? 'review' : 'q') + '/' + (n - 1) + '" style="flex:none;width:auto;padding:0 18px">' + I.back + '</a>' : '';
  var foot;
  if (!answered) foot = '<div class="cx-foot">' + prev + '<button class="btn sec" data-a="cxopt" data-k="-" data-n="' + n + '">Skip (0 marks)</button><span class="cx-timer" id="cxt">0:00</span></div>';
  else if (review) foot = '<div class="cx-foot">' + prev + '<a class="btn ghost" href="#/clat/sample/result">Result</a>' + (n < total ? '<a class="btn" href="#/clat/sample/review/' + (n + 1) + '">Next</a>' : '') + '</div>';
  else foot = '<div class="cx-foot">' + prev + '<a class="btn" href="#/clat/sample/' + (n < total ? 'q/' + (n + 1) : 'result') + '">' + (n < total ? 'Next question' : 'See my result') + '</a></div>';
  cscreen({
    top: tbar((review ? 'Review · ' : '') + 'Question ' + n + ' of ' + total, { sub: esc(q.subj) + ' · ' + esc(q.diff), la: 'cxsample' }),
    body: '<div class="cx-qbar"><i style="width:' + Math.round((answered ? n : n - 1) / total * 100) + '%"></i></div><div class="cx-chips"><span>' + esc(q.subj) + '</span><span>' + esc(q.diff) + '</span>' + (q.type ? '<span>' + esc(q.type) + '</span>' : '') + '</div>' +
      '<div class="cx-pass"><span class="l">PASSAGE</span>' + q.pass + '</div><div class="cx-stem">' + q.stem + '</div>' + opts + verdict + expl,
    foot: foot
  }, 'prac', { nonav: true });
  if (!answered) {
    var t0 = Date.now(), el = document.getElementById('cxt');
    timers.push(setInterval(function () { var s = Math.floor((Date.now() - t0) / 1000); if (el) { el.textContent = Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); if (s === 60) el.style.color = 'var(--star,#e3a008)'; if (s === 120) el.style.color = '#d33'; } }, 1000));
  }
}
function panelHTML(h) { return (h || '').replace(/class="x-q-why"/g, 'class="cx-why"').replace(/class="x-good"/g, 'class="good"').replace(/<span class="x-l">/g, '<span class="l">').replace(/<span class="x-t">/g, '<span class="t">'); }
A.cxsample = function () { go('/clat/sample'); };
A.cxopt = function (t) {
  var n = +t.dataset.n, sm = sampleSaved(); sm.a = sm.a || {}; if (sm.a[n]) return; sm.a[n] = t.dataset.k; ls.set(SMP_KEY, sm);
  question(SP, n, false);
};
A.cxtab = function (t) {
  var tab = t.dataset.t; ls.set('nl-clat-tab', tab);
  var n = +((location.hash.match(/\/(?:q|review)\/(\d+)/) || [])[1]); var q = SP.qs.filter(function (x) { return x.n === n; })[0]; if (!q) return;
  document.getElementById('cxpanel').innerHTML = panelHTML(q.panels[tab]);
  [].forEach.call(t.parentNode.children, function (b) { b.classList.toggle('on', b === t); });
};
function result(d) {
  var a = sampleSaved().a || {}, sc = sampleScore(a, d.qs), total = d.qs.length, by = {};
  d.qs.forEach(function (q) { var b = by[q.subj] || (by[q.subj] = { r: 0, t: 0 }); b.t++; if (a[q.n] === q.ans) b.r++; });
  var answered = Object.keys(a).length;
  cscreen({
    top: cbar('Your result', answered + ' of ' + total + ' attempted', 'cxsample'),
    body: '<div class="cx-res"><b>' + (Math.round(sc.marks * 100) / 100) + '</b><small>marks out of ' + total + '</small></div>' +
      '<div class="cx-st"><div><b style="color:var(--ok-text)">' + sc.right + '</b><small>Correct</small></div><div><b style="color:var(--bad-text)">' + sc.wrong + '</b><small>Wrong</small></div><div><b>' + (total - sc.right - sc.wrong) + '</b><small>Skipped / left</small></div></div>' +
      (sc.wrong ? '<div class="cx-note">' + sc.wrong + ' wrong answer' + (sc.wrong > 1 ? 's' : '') + ' cost ' + (sc.wrong * 0.25) + ' marks. In the real paper, skip a question when you cannot cut it to two options.</div>' : '') +
      '<h2 class="h2">By subject</h2><div class="card">' + Object.keys(by).map(function (k) { return '<p style="display:flex;justify-content:space-between;margin:7px 0;font-weight:700;font-size:.9rem"><span>' + esc(k) + '</span><span>' + by[k].r + ' / ' + by[k].t + '</span></p>'; }).join('') + '</div>' +
      '<h2 class="h2">Review questions</h2><div class="cx-grid">' + d.qs.map(function (q) { var v = a[q.n]; return '<a class="' + (!v || v === '-' ? '' : v === q.ans ? 'ok' : 'bad') + '" href="#/clat/sample/' + (v ? 'review' : 'q') + '/' + q.n + '" aria-label="Question ' + q.n + '">' + q.n + '</a>'; }).join('') + '</div>' +
      '<button class="btn dng" data-a="cxreset" style="margin-top:20px">Retake the paper</button>'
  }, 'prac');
}

/* ---------- AIBE and Semester Law Notes ("coming 2027" sections) ---------- */
var SOON = { ug: ['clat-ug-2027.html', 'CLAT UG', 'cap', 'Law entrance after Class 12'], aibe: ['aibe-2027.html', 'AIBE', 'brief', 'All India Bar Examination'], sem: ['semester-law-notes-2027.html', 'Semester Law Notes', 'file', 'LL.B. notes, semester by semester'] };
function soon(key) {
  var c = SOON[key], route = '#/' + key;
  cscreen({ top: tbar(c[1], { sub: c[3], la: 'cexams' }), body: spinner() }, null, { nonav: true });
  getDoc(c[0]).then(function (doc) {
    if (!here(route)) return;
    var h1 = doc.querySelector('.hero h1'), cards = [].slice.call(doc.querySelectorAll('.sec .grid article.c')), wait = doc.querySelector('.wait h2'), waitp = doc.querySelector('.wait p');
    var T = Date.UTC(2026, 11, 31, 18, 30, 0);
    cscreen({
      top: tbar(c[1], { sub: c[3], la: 'cexams' }),
      body: '<div class="cx-hero"><small class="k">' + esc(txt(doc.querySelector('.hero .pill'))) + '</small><h2>' + esc(txt(h1)) + '</h2><p>' + esc(txt(doc.querySelector('.hero .lead'))) + '</p>' +
        '<div class="cx-clock" role="timer"><div><b id="cxd">--</b><small>days</small></div><div><b id="cxh">--</b><small>hours</small></div><div><b id="cxm">--</b><small>minutes</small></div><div><b id="cxs">--</b><small>seconds</small></div></div></div>' +
        '<h2 class="h2">' + esc(txt(doc.querySelector('.sec h2'))) + '</h2><div class="rows">' + cards.map(function (x) { return '<div class="row">' + ico(c[2], 'var(--c3-deep)') + '<div class="ti"><h3>' + esc(txt(x.querySelector('b'))) + '</h3><p>' + esc(txt(x.querySelector('p'))) + '</p></div><span class="xtag" style="flex:none;padding:5px 11px;border-radius:99px;background:var(--soft);color:var(--ac-d);font-size:.6875rem;font-weight:800">' + esc(txt(x.querySelector('i'))) + '</span></div>'; }).join('') + '</div>' +
        '<h2 class="h2">' + esc(txt(wait)) + '</h2><p class="muted" style="margin:0 2px 12px;font-weight:600;line-height:1.5">' + esc(txt(waitp)) + '</p>' +
        '<a class="btn" href="#/subjects">Practise Law (058) MCQs</a><a class="btn ghost" href="#/notes" style="margin-top:10px">Open the notes</a>' +
        '<h2 class="h2">Be first through the door</h2><p class="muted" style="margin:0 2px 12px;font-weight:600;line-height:1.5">We announce every new section on Instagram. Follow along, or write to us with what you would like to see.</p>' +
        '<a class="btn sec" href="https://www.instagram.com/netlawverse/" target="_blank" rel="noopener noreferrer">Follow on Instagram</a><a class="btn ghost" href="mailto:netlawverse@gmail.com" style="margin-top:10px">Email us</a>'
    }, null, { nonav: true });
    function tick() {
      var s = Math.floor(Math.max(0, T - Date.now()) / 1000), p = function (v) { return v < 10 ? '0' + v : '' + v; };
      var e = { d: document.getElementById('cxd'), h: document.getElementById('cxh'), m: document.getElementById('cxm'), s: document.getElementById('cxs') };
      if (!e.d) return; e.d.textContent = Math.floor(s / 86400); e.h.textContent = p(Math.floor(s % 86400 / 3600)); e.m.textContent = p(Math.floor(s % 3600 / 60)); e.s.textContent = p(s % 60);
    }
    tick(); timers.push(setInterval(tick, 1000));
  }).catch(function () { if (here(route)) cscreen({ top: tbar(c[1], { la: 'cexams' }), body: failBody() }, null, { nonav: true }); });
}

/* ---------- routes ---------- */
R.clat = function (p) {
  p = p || [];
  switch (p[0]) {
    case 'prep': return prep();
    case 'more': return more();
    case 'read': return reader(p[1]);
    case 'syllabus': return syllabus();
    case 'sample': return sample(p.slice(1));
    case 'mocks': return mocks();
    case 'practice': return practice();
    case 'mock': return mockRun(p[1]);
    case 'cases': return cases();
    default: return hub();
  }
};
R.ug = function () { soon('ug'); };
R.aibe = function () { soon('aibe'); };
R.sem = function () { soon('sem'); };
})();
