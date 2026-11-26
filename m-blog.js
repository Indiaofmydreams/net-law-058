/* NET Law-Verse phone + tablet app: the Blog.
   #/blog                 all articles (search, category chips, load more)
   #/blog/c/<category>    one category      #/blog/saved   articles you saved on this device
   #/blog/<slug>          an article, opened from /blog/<slug>.html inside the app (website header hidden)
   The list comes from blog/posts.json, so every new post made with _tools/build_blog.py appears here automatically.
   Saved articles are stored only on this device (nl-m-blogbm). Each article keeps its own reading tools (text size, listen, save, share). */
(function () {
"use strict";
var N = window.NLM; if (!N) return;
var esc = N.esc, I = N.I, ico = N.ico, R = N.R, A = N.A, screen = N.screen, tbar = N.tbar, ls = N.ls, go = N.go, toast = N.toast, S = N.S;
var SITE = N.SITE_URL, PAGE = 24;
var st = { q: '', shown: PAGE };

function bm() { return S.bgbm || (S.bgbm = ls.get('nl-m-blogbm', {})); }
function saveBm() { ls.set('nl-m-blogbm', S.bgbm); }
function card(p) {
  var on = !!bm()[p.slug];
  return '<article class="bcard"><a class="bc-a" href="#/blog/' + esc(p.slug) + '"><span class="pk">' + esc(p.category || 'Blog') + '</span><b>' + esc(p.title) + '</b><p>' + esc(p.description || '') + '</p><small>' + N.pdate(p.date) + ' · ' + (p.mins || 3) + ' min read</small></a>' +
    '<div class="bc-x"><button class="ib' + (on ? ' on' : '') + '" data-a="bgsave" data-s="' + esc(p.slug) + '" aria-pressed="' + on + '" aria-label="' + (on ? 'Remove from saved' : 'Save for later') + '">' + N.sv(N.P.bm, 22, on ? 'currentColor' : 'none') + '</button>' +
    '<button class="ib" data-a="sharescr" data-t="' + esc(p.title) + '" data-u="' + SITE + 'blog/' + esc(p.slug) + '.html" data-d="' + esc(p.description || '') + '" aria-label="Share">' + I.share + '</button></div></article>';
}
A.bgsave = function (t) {
  var s = t.dataset.s, b = bm(); if (b[s]) { delete b[s]; toast('Removed from saved'); } else { b[s] = Date.now(); toast('Saved for later'); }
  saveBm(); var on = !!b[s];
  document.querySelectorAll('[data-a=bgsave][data-s="' + s + '"]').forEach(function (e) { e.classList.toggle('on', on); e.setAttribute('aria-pressed', on); e.innerHTML = N.sv(N.P.bm, 22, on ? 'currentColor' : 'none'); });
  if (/^#\/blog\/saved/.test(location.hash)) list(['saved']);
};
A.bgmore = function () { st.shown += PAGE; list(curArgs, true); };
A.bgback = function () { if (S.hist > 0) history.back(); else go('/blog'); };

var curArgs = [];
function list(p, keep) {
  curArgs = p || [];
  var cat = p[0] === 'c' ? decodeURIComponent(p[1] || '') : '', saved = p[0] === 'saved';
  var title = saved ? 'Saved articles' : cat || 'Blog';
  var bar = '<div class="tb">' + (cat || saved ? '<button class="ib" data-a="bgback" aria-label="Back">' + I.back + '</button>' : '<button class="ib" data-a="drawer" aria-label="Menu">' + I.menu + '</button>') +
    '<h1>' + esc(title) + '<small>' + (saved ? 'Read later, on this device' : 'Guides, updates and legal current affairs') + '</small></h1>' +
    N.shareBtn({ t: 'NET Law-Verse blog', u: SITE + 'blog/', d: 'Exam guides, cut-offs, study plans and legal current affairs for UGC NET, CLAT PG, AILET, CUET PG and AIBE.' }) +
    (saved ? '' : '<a class="ib" href="#/blog/saved" aria-label="Saved articles">' + N.sv(N.P.bm, 22) + '</a>') + '</div>';
  if (!keep) { st.shown = PAGE; screen({ top: bar, nav: 'blog', body: '<div class="empty" style="padding:60px 0"><div class="spin"></div></div>' }); }
  N.loadPosts().then(function (L) {
    if (!/^#\/blog/.test(location.hash) || curArgs !== p) return;
    var cats = {}; L.forEach(function (x) { cats[x.category] = (cats[x.category] || 0) + 1; });
    var names = Object.keys(cats).sort(function (a, b) { return cats[b] - cats[a]; });
    var base = saved ? L.filter(function (x) { return bm()[x.slug]; }) : cat ? L.filter(function (x) { return x.category === cat; }) : L;
    var q = st.q.trim().toLowerCase(), m = q ? base.filter(function (x) { return (x.title + ' ' + (x.description || '') + ' ' + x.category).toLowerCase().indexOf(q) > -1; }) : base;
    var chips = '<div class="chips hs"><a class="chip' + (!cat && !saved ? ' on' : '') + '" href="#/blog">All</a>' + names.map(function (c) { return '<a class="chip' + (cat === c ? ' on' : '') + '" href="#/blog/c/' + encodeURIComponent(c) + '">' + esc(c) + '</a>'; }).join('') + '</div>';
    var body = '<div class="xs"><input id="bg-q" class="cx-s" type="search" value="' + esc(st.q) + '" placeholder="Search ' + L.length + ' articles…" autocomplete="off" aria-label="Search articles"></div>' + chips +
      '<div id="bg-l">' + (m.length ? '<div class="bgrid">' + m.slice(0, st.shown).map(card).join('') + '</div>' + (m.length > st.shown ? '<button class="btn sec" data-a="bgmore" style="margin-top:14px">Show more (' + (m.length - st.shown) + ' left)</button>' : '') :
        '<div class="empty"><b>' + (saved ? 'Nothing saved yet' : 'No articles found') + '</b>' + (saved ? 'Tap the bookmark on any article to read it later.' : 'Try a shorter search or another category.') + '</div>') + '</div>' +
      '<div class="card cont" style="margin-top:18px">' + ico('share', 'var(--c2-deep)') + '<div class="ti"><h3>Found it useful?</h3><p>Share the blog with a friend who is preparing.</p></div><button class="btn sm" data-a="sharescr" data-t="NET Law-Verse blog" data-u="' + SITE + 'blog/" data-d="Exam guides, cut-offs and legal current affairs. Free.">Share</button></div>';
    var y = keep ? document.getElementById('view').scrollTop : 0;
    screen({ top: bar, nav: 'blog', body: body, keep: !!keep });
    if (keep) document.getElementById('view').scrollTop = y;
    var inp = document.getElementById('bg-q'), t = 0;
    inp.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { st.q = inp.value; st.shown = PAGE; var c = inp.selectionStart; list(curArgs, true); var n = document.getElementById('bg-q'); if (n) { n.focus(); n.setSelectionRange(c, c); } }, 220); });
  }).catch(function () {
    screen({ top: bar, nav: 'blog', body: '<div class="empty"><b>Could not load the articles</b>Check your connection and try again.<br><br><button class="btn" data-a="reload">Retry</button><a class="btn ghost" href="blog/" style="margin-top:10px">Open the blog website</a></div>' });
  });
}

/* ---------- one article ---------- */
var EMBCSS = '.blh,.bl-head+.blh{display:none!important}html,body{background:transparent}body.bl{padding-top:0!important}';
function inject(fr, slug) {
  try {
    var d = fr.contentDocument; if (!d || !d.head) return false;
    if (d.getElementById('nl-emb')) return true;
    var s = d.createElement('style'); s.id = 'nl-emb'; s.textContent = EMBCSS; d.head.appendChild(s);
    d.documentElement.classList.add('emb');
    d.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
      var h = a.getAttribute('href') || '', m;
      if (/^#|^mailto:|^tel:|^javascript:|^whatsapp:|^tg:/.test(h) || a.target === '_blank') return;
      if ((m = /(?:^|\/)blog\/([a-z0-9-]+)\.html/.exec(h)) || (m = /^([a-z0-9-]+)\.html(?:[?#].*)?$/.exec(h))) { e.preventDefault(); go('/blog/' + m[1]); return; }
      if (/(^|\/)blog\/?(index\.html)?$/.test(h)) { e.preventDefault(); go('/blog'); return; }
      if (/^https?:/i.test(h) && h.indexOf(location.origin) !== 0) { a.target = '_blank'; a.rel = 'noopener'; return; }
      var u; try { u = new URL(h, fr.contentWindow.location.href); } catch (x) { return; }
      if (u.origin !== location.origin) { a.target = '_blank'; a.rel = 'noopener'; return; }
      var path = u.pathname;
      if (/^\/(index\.html)?$/.test(path)) { e.preventDefault(); go('/'); return; }
      var r = [[/^\/clat-pg\/?(index\.html)?$/, '/clat'], [/^\/aibe\/?(index\.html)?$/, '/aibe'], [/^\/ailet\/?(index\.html)?$/, '/ailet'], [/^\/cuet-pg\/?(index\.html)?$/, '/cuet'], [/^\/(clat-pg|aibe|ailet|cuet-pg)\/mock-tests\.html$/, null]];
      for (var i = 0; i < r.length; i++) if (r[i][0].test(path)) {
        e.preventDefault();
        if (r[i][1]) go(r[i][1]); else go('/' + (path.split('/')[1] === 'clat-pg' ? 'clat' : path.split('/')[1] === 'cuet-pg' ? 'cuet' : path.split('/')[1]) + '/mocks');
        return;
      }
      var mm = /^\/(clat-pg|aibe|ailet|cuet-pg)\/mock-test-(\d+)\.html$/.exec(path);
      if (mm) { e.preventDefault(); go('/' + (mm[1] === 'clat-pg' ? 'clat' : mm[1] === 'cuet-pg' ? 'cuet' : mm[1]) + '/mock/' + mm[2]); return; }
      a.target = '_top';
    }, true);
    return true;
  } catch (e) { return false; }
}
function read(slug) {
  if (!/^[a-z0-9-]+$/.test(slug)) return go('/blog');
  var on = !!bm()[slug];
  var meta = (S.posts || []).filter(function (x) { return x.slug === slug; })[0] || {};
  var title = meta.title || 'Article';
  screen({
    top: '<div class="tb"><button class="ib" data-a="bgback" aria-label="Back">' + I.back + '</button><h1>' + esc(meta.category || 'Blog') + '<small>' + (meta.mins ? meta.mins + ' min read' : 'Article') + '</small></h1>' +
      '<button class="ib' + (on ? ' on' : '') + '" data-a="bgsave" data-s="' + slug + '" aria-pressed="' + on + '" aria-label="Save for later">' + N.sv(N.P.bm, 22, on ? 'currentColor' : 'none') + '</button>' +
      N.shareBtn({ t: title, u: SITE + 'blog/' + slug + '.html', d: meta.description || '' }) + '<a class="ib" href="#/" aria-label="Home">' + I.home + '</a></div>',
    flush: true, exam: true, cls: 'cmv', nav: null,
    body: '<div class="bl-load" id="bl-load"><div class="spin"></div></div><iframe class="cmf bl-fr" title="' + esc(title) + '" src="blog/' + slug + '.html" allow="clipboard-write; web-share" style="visibility:hidden"></iframe>'
  });
  var fr = document.querySelector('.bl-fr'); if (!fr) return;
  var tries = 0, tm = setInterval(function () {
    tries++; var ok = false;
    try { ok = fr.contentDocument && fr.contentDocument.readyState !== 'uninitialized' && fr.contentDocument.location.href.indexOf('/blog/') > -1 && inject(fr, slug); } catch (e) { }
    if (ok || tries > 80) { clearInterval(tm); show(); }
  }, 60);
  function show() { fr.style.visibility = 'visible'; var l = document.getElementById('bl-load'); if (l) l.remove(); }
  fr.addEventListener('load', function () { clearInterval(tm); inject(fr, slug); show(); });
  /* make sure the posts list exists so Save / category are right even on a direct link */
  N.loadPosts().catch(function () { });
}

R.blog = function (p) {
  p = p || [];
  if (!p[0]) { curArgs = []; return list([]); }
  if (p[0] === 'c' || p[0] === 'saved') return list(p);
  return read(p[0]);
};
})();
