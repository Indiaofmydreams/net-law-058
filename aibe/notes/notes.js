/* AIBE Notes: reader behaviour. Plain JavaScript, no dependencies, no network calls except the optional doubt form below.
   Everything the reader creates (highlights, notes, doubts, progress) lives in this browser under one key: "aibe-notes-v1".

   OPTIONAL: to receive doubts in a Google Sheet instead of by email, create a Google Form with three short-answer
   questions (doubt, where, reply-to), then set before this script loads (e.g. in an inline <script> in the page head, or here):
     window.NN_DOUBT_FORM = { formId:'1FAIpQLS...', fields:{ doubt:'entry.111', where:'entry.222', reply:'entry.333' } };
   Until that is set, doubts are sent with the reader's own email app / Gmail and also saved in their notebook. */
(function () {
  'use strict';
  var D = document, B = D.body, PAGE = B.dataset.nn, KEY = 'aibe-notes-v1';
  var CONTACT = 'netlawverse@gmail.com';
  var COLORS = { 1: 'Key', 2: 'Got it', 3: 'Trap', 4: 'Revise' };
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var coarse = false; try { coarse = matchMedia('(pointer:coarse)').matches; } catch (e) {}
  var NOTES_REL = (PAGE === 'hub' || PAGE === 'mine') ? '' : '../';

  /* ---------- storage ---------- */
  function blank() { return { hl: {}, read: {}, dq: [], last: null, fs: 0, mcq: {} }; }
  function load() {
    try {
      var o = JSON.parse(localStorage.getItem(KEY) || 'null') || blank();
      var b = blank(); for (var k in b) if (o[k] === undefined) o[k] = b[k];
      return o;
    } catch (e) { return blank(); }
  }
  var ST = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(ST)); return true; } catch (e) { toast('Could not save: your browser is blocking storage.'); return false; } }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function el(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function say(m) { var l = $('#live'); if (l) l.textContent = m; }
  var toastT;
  function toast(m) {
    var t = $('.nn-toast'); if (t) t.remove();
    t = el('div', 'nn-toast', esc(m)); t.setAttribute('role', 'status'); B.appendChild(t); say(m);
    clearTimeout(toastT); toastT = setTimeout(function () { t.remove(); }, 2400);
  }
  function copy(text, done) {
    function fb() { var t = el('textarea'); t.value = text; t.style.cssText = 'position:fixed;opacity:0'; B.appendChild(t); t.select(); try { D.execCommand('copy'); done && done(true); } catch (e) { done && done(false); } t.remove(); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done && done(true); }, fb); else fb();
  }
  function ck() { return B.dataset.nnSubject + '/' + B.dataset.nnChapter; }
  function totalHl() { var n = 0; for (var k in ST.hl) n += ST.hl[k].length; return n; }

  /* ---------- reading progress bar ---------- */
  var bar = $('#nn-bar');
  function onScroll() {
    if (!bar) return;
    var h = D.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? Math.min(100, scrollY / h * 100) : 0) + '%';
  }
  if (bar) { addEventListener('scroll', onScroll, { passive: true }); onScroll(); }

  /* ---------- print / share (all reader pages) ---------- */
  D.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-act]'); if (!b) return;
    var a = b.dataset.act;
    if (a === 'print') { window.print(); }
    else if (a === 'share') {
      var url = location.origin + location.pathname, t = D.title;
      if (navigator.share) navigator.share({ title: t, url: url }).catch(function () {});
      else copy(url, function (ok) { toast(ok ? 'Link copied' : 'Copy this link: ' + url); });
    }
  });

  /* ================= CHAPTER PAGE ================= */
  function chapterPage() {
    var key = ck();
    // last visited (for "continue reading")
    ST.last = { u: B.dataset.nnUrl.replace('/aibe/notes/', ''), t: B.dataset.nnChapterTitle, s: B.dataset.nnSubjectName, n: +B.dataset.nnChapterNo };
    save();

    // text size
    function fs() { B.style.setProperty('--nn-fs', (1.06 + ST.fs * 0.08).toFixed(2) + 'rem'); }
    fs();
    $$('[data-act="fs+"],[data-act="fs-"]').forEach(function (b) {
      b.addEventListener('click', function () { ST.fs = Math.max(-2, Math.min(4, ST.fs + (b.dataset.act === 'fs+' ? 1 : -1))); fs(); save(); });
    });

    // mark as read
    function paintRead() {
      var on = !!ST.read[key];
      $$('.nn-readbtn').forEach(function (b) { b.setAttribute('aria-pressed', on); b.textContent = on ? 'Read' : (b.closest('.nn-end') ? 'Mark chapter as read' : 'Mark as read'); });
    }
    paintRead();
    $$('.nn-readbtn').forEach(function (b) {
      b.addEventListener('click', function () {
        if (ST.read[key]) { delete ST.read[key]; toast('Marked as unread'); } else { ST.read[key] = Date.now(); toast('Chapter marked as read'); }
        save(); paintRead();
      });
    });

    // contents list: scroll-spy + mobile sheet
    var toc = $('.nn-toc'), links = $$('.nn-tocin li a');
    if ('IntersectionObserver' in window && links.length) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting) { links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id); }); }
        });
      }, { rootMargin: '-10% 0px -75% 0px' });
      $$('.nn-sec').forEach(function (s) { io.observe(s); });
    }
    var tb = el('button', 'nn-tocbtn', '☰ Contents'); tb.type = 'button'; tb.setAttribute('aria-expanded', 'false'); B.appendChild(tb);
    tb.addEventListener('click', function () { var o = toc.classList.toggle('open'); tb.setAttribute('aria-expanded', o); });
    links.forEach(function (a) { a.addEventListener('click', function () { toc.classList.remove('open'); tb.setAttribute('aria-expanded', 'false'); }); });

    applyHighlights();
    if (/^#hl-/.test(location.hash)) {
      setTimeout(function () { var m = $('mark[data-hid="' + location.hash.slice(4) + '"]'); if (m) { m.scrollIntoView({ block: 'center' }); m.classList.add('flash'); setTimeout(function () { m.classList.remove('flash'); }, 2200); } }, 250);
    }
  }

  /* ---------- highlighter ---------- */
  function art() { return $('.nn-article'); }
  function blockEl(id) { return art().querySelector('[data-b="' + id + '"]'); }
  function textNodes(root) { var w = D.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), a = [], n; while ((n = w.nextNode())) a.push(n); return a; }
  function wrap(block, start, end, h) {
    var pos = 0, segs = [];
    textNodes(block).forEach(function (n) {
      var len = n.nodeValue.length, s = Math.max(start, pos), e = Math.min(end, pos + len);
      if (s < e) segs.push([n, s - pos, e - pos]);
      pos += len;
    });
    segs.forEach(function (sg) {
      var n = sg[0], s = sg[1], e = sg[2], mid = n;
      if (s > 0) mid = n.splitText(s);
      if (e - s < mid.nodeValue.length) mid.splitText(e - s);
      var m = D.createElement('mark'); m.className = 'nn-hl c' + h.c + (h.note ? ' note' : ''); m.dataset.hid = h.id;
      m.title = COLORS[h.c] + (h.note ? ': ' + h.note : '') + ' (tap to edit)';
      mid.parentNode.insertBefore(m, mid); m.appendChild(mid);
    });
  }
  function unwrap(id) {
    $$('mark[data-hid="' + id + '"]').forEach(function (m) { var p = m.parentNode; while (m.firstChild) p.insertBefore(m.firstChild, m); p.removeChild(m); p.normalize(); });
  }
  function applyHighlights() {
    var list = ST.hl[ck()] || [], changed = false;
    list.forEach(function (h) {
      var b = blockEl(h.b); if (!b) { h.lost = true; return; }
      var tx = b.textContent;
      if (tx.substr(h.s, h.t.length) !== h.t) { var i = tx.indexOf(h.t); if (i < 0) { h.lost = true; return; } h.s = i; changed = true; }
      h.lost = false; wrap(b, h.s, h.s + h.t.length, h);
    });
    if (changed) save();
  }
  function pieces(range) {
    var out = [];
    $$('[data-b]', art()).forEach(function (b) {
      if (!range.intersectsNode(b)) return;
      var br = D.createRange(); br.selectNodeContents(b);
      var sr = range.cloneRange();
      if (sr.compareBoundaryPoints(Range.START_TO_START, br) < 0) sr.setStart(br.startContainer, br.startOffset);
      if (sr.compareBoundaryPoints(Range.END_TO_END, br) > 0) sr.setEnd(br.endContainer, br.endOffset);
      var tx = sr.toString(); if (tx.trim().length < 2) return;
      var pre = D.createRange(); pre.selectNodeContents(b); pre.setEnd(sr.startContainer, sr.startOffset);
      var lead = tx.length - tx.replace(/^\s+/, '').length;
      out.push({ b: b.dataset.b, s: pre.toString().length + lead, t: tx.trim() });
    });
    return out;
  }
  function addHighlights(parts, c) {
    var key = ck(), list = ST.hl[key] = ST.hl[key] || [];
    parts.forEach(function (p) {
      list.filter(function (h) { return h.b === p.b && h.s < p.s + p.t.length && p.s < h.s + h.t.length; }).forEach(function (h) { unwrap(h.id); list.splice(list.indexOf(h), 1); });
      var h = { id: uid(), b: p.b, s: p.s, t: p.t, c: c, note: '', ts: Date.now() };
      list.push(h); wrap(blockEl(p.b), p.s, p.s + p.t.length, h);
    });
    save();
  }
  var pop, popState;
  function ensurePop() { if (!pop) { pop = el('div', 'nn-pop'); pop.hidden = true; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Highlight'); B.appendChild(pop); } return pop; }
  function hidePop() { if (pop) pop.hidden = true; popState = null; }
  function place(rect) {
    var p = pop; p.hidden = false;
    var w = p.offsetWidth, h = p.offsetHeight, x = rect.left + scrollX + rect.width / 2 - w / 2;
    x = Math.max(scrollX + 8, Math.min(x, scrollX + D.documentElement.clientWidth - w - 8));
    var y = (coarse || rect.top < h + 20) ? rect.bottom + scrollY + 12 : rect.top + scrollY - h - 10;
    p.style.left = x + 'px'; p.style.top = y + 'px';
  }
  function colourBtns(cur) {
    var s = ''; for (var c = 1; c <= 4; c++) s += '<button type="button" class="c c' + c + (cur === c ? ' sel' : '') + '" data-c="' + c + '" aria-label="' + COLORS[c] + '" title="' + COLORS[c] + '"></button>';
    return s;
  }
  function showNew(parts, rect, text) {
    ensurePop(); popState = { mode: 'new', parts: parts, text: text };
    pop.innerHTML = '<span class="lab">Highlight as</span>' + colourBtns(0) + '<button type="button" class="t" data-a="doubt">Ask a doubt</button><button type="button" class="t" data-a="copy">Copy</button>';
    place(rect);
  }
  function showEdit(m) {
    var key = ck(), h = (ST.hl[key] || []).filter(function (x) { return x.id === m.dataset.hid; })[0]; if (!h) return;
    ensurePop(); popState = { mode: 'edit', h: h };
    pop.innerHTML = '<span class="lab">' + COLORS[h.c] + ' highlight</span>' + colourBtns(h.c) +
      '<textarea placeholder="Add a note to this highlight" aria-label="Note">' + esc(h.note || '') + '</textarea>' +
      '<button type="button" class="t" data-a="save">Save note</button><button type="button" class="t" data-a="doubt">Ask a doubt</button><button type="button" class="t" data-a="del">Delete</button>';
    place(m.getBoundingClientRect());
  }
  function repaint(h) { $$('mark[data-hid="' + h.id + '"]').forEach(function (m) { m.className = 'nn-hl c' + h.c + (h.note ? ' note' : ''); m.title = COLORS[h.c] + (h.note ? ': ' + h.note : '') + ' (tap to edit)'; }); }
  function highlighterInit() {
    D.addEventListener('click', function (e) {
      var m = e.target.closest && e.target.closest('mark.nn-hl');
      if (m && art() && art().contains(m)) { var s = getSelection(); if (s && !s.isCollapsed) return; showEdit(m); e.stopPropagation(); return; }
    }, true);
    D.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.nn-pop [data-c],.nn-pop [data-a]'); if (!b || !popState) return;
      if (b.dataset.c) {
        var c = +b.dataset.c;
        if (popState.mode === 'new') { addHighlights(popState.parts, c); getSelection().removeAllRanges(); hidePop(); toast('Saved as "' + COLORS[c] + '". See it in My highlights.'); }
        else { popState.h.c = c; repaint(popState.h); save(); $$('.nn-pop .c').forEach(function (x) { x.classList.toggle('sel', +x.dataset.c === c); }); }
        return;
      }
      var a = b.dataset.a;
      if (a === 'copy') { copy(popState.text, function () { toast('Copied'); }); hidePop(); }
      else if (a === 'doubt') {
        var q = popState.mode === 'new' ? popState.text : popState.h.t, bid = popState.mode === 'new' ? popState.parts[0].b : popState.h.b;
        hidePop(); openDoubt({ block: bid, quote: q });
      }
      else if (a === 'save') { popState.h.note = $('textarea', pop).value.trim(); repaint(popState.h); save(); hidePop(); toast('Note saved'); }
      else if (a === 'del') { var key = ck(), l = ST.hl[key]; l.splice(l.indexOf(popState.h), 1); unwrap(popState.h.id); save(); hidePop(); toast('Highlight deleted'); }
    });
    var t;
    D.addEventListener('selectionchange', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        if (pop && !pop.hidden && pop.contains(D.activeElement)) return;
        var s = getSelection();
        if (!s || s.isCollapsed || !s.rangeCount) { if (popState && popState.mode === 'new') hidePop(); return; }
        var r = s.getRangeAt(0);
        if (!art() || !art().contains(r.commonAncestorContainer)) { if (popState && popState.mode === 'new') hidePop(); return; }
        var parts = pieces(r); if (!parts.length) return;
        showNew(parts, r.getBoundingClientRect(), s.toString().replace(/\s+/g, ' ').trim());
      }, coarse ? 350 : 120);
    });
    D.addEventListener('mousedown', function (e) { if (pop && !pop.hidden && !pop.contains(e.target) && !(e.target.closest && e.target.closest('mark.nn-hl'))) { if (popState && popState.mode === 'edit') hidePop(); } });
    D.addEventListener('keydown', function (e) { if (e.key === 'Escape') { hidePop(); closeDoubt(); } });
  }

  /* ---------- ask a doubt ---------- */
  var ov, ovLast;
  function where(block) {
    var sec = '', b = block && art() ? blockEl(block) : null;
    if (b) { var s = b.closest('.nn-sec'); if (s) { var h = $('h2', s); sec = h ? h.textContent.replace(/^\S\s*/, '').trim() : ''; } }
    return sec;
  }
  function closeDoubt() { if (ov && !ov.hidden) { ov.hidden = true; if (ovLast && ovLast.focus) ovLast.focus(); } }
  function openDoubt(ctx) {
    ctx = ctx || {}; ovLast = D.activeElement;
    var quote = ctx.quote || '';
    if (!quote && ctx.block && art()) { var b = blockEl(ctx.block); if (b) quote = b.textContent.replace(/\s+/g, ' ').trim(); }
    if (quote.length > 420) quote = quote.slice(0, 417) + '...';
    var secName = where(ctx.block), subj = B.dataset.nnSubjectName || 'AIBE Notes', chap = B.dataset.nnChapterTitle || '';
    var no = B.dataset.nnChapterNo ? 'Chapter ' + B.dataset.nnChapterNo + ': ' : '';
    var url = location.origin + location.pathname + (ctx.block ? '#' + ctx.block : '');
    var formCfg = window.NN_DOUBT_FORM && window.NN_DOUBT_FORM.formId ? window.NN_DOUBT_FORM : null;
    if (!ov) {
      ov = el('div', 'nn-ov'); ov.hidden = true;
      ov.addEventListener('click', function (e) { if (e.target === ov) closeDoubt(); });
      B.appendChild(ov);
    }
    ov.innerHTML = '<div class="nn-dlg" role="dialog" aria-modal="true" aria-labelledby="nn-dt"><h2 id="nn-dt">Ask a doubt</h2><p class="sub">Tell us what is unclear. We read every doubt.</p>' +
      '<div class="nn-ctx"><b>' + esc(subj) + '</b>' + (chap ? ' › ' + esc(no + chap) : '') + (secName ? ' › ' + esc(secName) : '') + (quote ? '<q>' + esc(quote) + '</q>' : '') + '</div>' +
      '<label for="nn-dq">Your doubt</label><textarea id="nn-dq" placeholder="What exactly are you unsure about? Mention the case, Article or point."></textarea>' +
      '<label for="nn-dr">Your email, so we can reply (optional)</label><input id="nn-dr" type="email" autocomplete="email" placeholder="you@example.com">' +
      '<div class="row">' + (formCfg ? '<button class="btn pri" type="button" data-s="form">Send to NET Law-Verse</button>' : '<button class="btn pri" type="button" data-s="mail">Email it to us</button>') +
      (formCfg ? '' : '<button class="btn" type="button" data-s="gmail">Open in Gmail</button>') + '<button class="btn" type="button" data-s="copy">Copy</button><button class="btn" type="button" data-s="save">Save to my doubts</button><button class="btn" type="button" data-s="x">Close</button></div>' +
      '<p class="fine">' + (formCfg ? 'Your doubt is sent to NET Law-Verse and saved in your notebook.' : 'This opens your own email app with the message ready. Nothing is sent from this page itself. Every doubt is also saved in <a href="' + NOTES_REL + 'my-notes.html">My highlights › Doubts</a> on this device.') + '</p><div id="nn-dm" aria-live="polite"></div></div>';
    ov.hidden = false; $('#nn-dq').focus();
    function compose() {
      var t = $('#nn-dq').value.trim();
      if (t.length < 3) { $('#nn-dm').innerHTML = '<div class="ok" style="background:#ffd0d6">Please write your doubt first.</div>'; $('#nn-dq').focus(); return null; }
      var r = $('#nn-dr').value.trim();
      var msg = 'Doubt on AIBE Notes\nSubject: ' + subj + (chap ? '\nChapter: ' + no + chap : '') + (secName ? '\nSection: ' + secName : '') + '\nPage: ' + url + (quote ? '\n\nText I am asking about:\n"' + quote + '"' : '') + '\n\nMy doubt:\n' + t + (r ? '\n\nReply to: ' + r : '') + '\n';
      return { t: t, r: r, msg: msg, sub: 'AIBE Notes doubt: ' + subj + (chap ? ' - ' + no + chap : '') };
    }
    function keep(c) {
      ST.dq.unshift({ id: uid(), ts: Date.now(), subject: subj, chapter: chap, no: B.dataset.nnChapterNo || '', url: url, quote: quote, text: c.t, resolved: false }); save();
      $('#nn-dm').innerHTML = '<div class="ok">Saved in your notebook ✓</div>';
    }
    ov.onclick = function (e) {
      if (e.target === ov) return closeDoubt();
      var b = e.target.closest('[data-s]'); if (!b) return; var s = b.dataset.s;
      if (s === 'x') return closeDoubt();
      var c = compose(); if (!c) return;
      if (s === 'save') { keep(c); }
      else if (s === 'copy') { copy(c.msg, function (ok) { keep(c); toast(ok ? 'Copied' : 'Copy failed'); }); }
      else if (s === 'mail') { keep(c); location.href = 'mailto:' + CONTACT + '?subject=' + encodeURIComponent(c.sub) + '&body=' + encodeURIComponent(c.msg); }
      else if (s === 'gmail') { keep(c); window.open('https://mail.google.com/mail/?view=cm&fs=1&to=' + CONTACT + '&su=' + encodeURIComponent(c.sub) + '&body=' + encodeURIComponent(c.msg), '_blank', 'noopener'); }
      else if (s === 'form') {
        var f = formCfg, body = new URLSearchParams(); body.append(f.fields.doubt, c.t + (quote ? '\n\nAbout: "' + quote + '"' : '')); body.append(f.fields.where, subj + ' | ' + no + chap + ' | ' + secName + ' | ' + url); body.append(f.fields.reply, c.r);
        fetch('https://docs.google.com/forms/d/e/' + f.formId + '/formResponse', { method: 'POST', mode: 'no-cors', body: body }).then(function () { keep(c); toast('Doubt sent. Thank you!'); setTimeout(closeDoubt, 900); }, function () { $('#nn-dm').innerHTML = '<div class="ok" style="background:#ffd0d6">Could not send. Check your connection and try again.</div>'; });
      }
    };
  }
  function doubtInit() {
    if (!(PAGE === 'chapter' || PAGE === 'highlights' || PAGE === 'dev' || PAGE === 'rapid' || PAGE === 'mcq')) return;
    var f = el('button', 'nn-fab', '<i aria-hidden="true">?</i><span>Ask a doubt</span>'); f.type = 'button'; f.setAttribute('aria-label', 'Ask a doubt'); B.appendChild(f);
    f.addEventListener('click', function () { var s = getSelection(), t = s && !s.isCollapsed && art() && art().contains(s.anchorNode) ? s.toString().replace(/\s+/g, ' ').trim() : ''; openDoubt({ quote: t }); });
    D.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-doubt]'); if (b) openDoubt({ block: b.dataset.doubt || '' }); });
  }

  /* ================= HUB / SUBJECT ================= */
  function resumeBox() {
    var r = $('#nn-resume'); if (!r || !ST.last) return;
    if (PAGE === 'subject' && ST.last.s !== B.dataset.nnSubjectName) return;
    r.hidden = false; r.innerHTML = '<span>Continue where you left off: <b>' + esc(ST.last.s) + ' › Chapter ' + ST.last.n + ', ' + esc(ST.last.t) + '</b></span><a class="btn sm" href="' + NOTES_REL + esc(ST.last.u) + '">Continue reading →</a>';
  }
  function readCount(slug) { var n = 0; for (var k in ST.read) if (k.indexOf(slug + '/') === 0) n++; return n; }
  function hubPage() {
    $$('.nn-sub.live').forEach(function (a) {
      var n = readCount(a.dataset.slug), t = +a.dataset.ch;
      $('.rdn', a).textContent = n; $('.bar u', a).style.width = (t ? n / t * 100 : 0) + '%';
    });
    var h = $('#nn-hlct'); if (h) h.textContent = totalHl();
    resumeBox();
    // search
    var q = $('#nn-q'), out = $('#nn-results'), idx = null, loading = false;
    function run() {
      var v = q.value.trim().toLowerCase();
      if (v.length < 2) { out.hidden = true; return; }
      var tok = v.split(/\s+/);
      var hits = idx.filter(function (r) { return tok.every(function (t) { return r.k.indexOf(t) > -1 || r.t.toLowerCase().indexOf(t) > -1; }); })
        .map(function (r) { var s = 0; tok.forEach(function (t) { if (r.t.toLowerCase().indexOf(t) > -1) s += 3; if (r.a.toLowerCase().indexOf(t) > -1) s += 2; }); return [s, r]; })
        .sort(function (a, b) { return b[0] - a[0]; }).slice(0, 12);
      out.hidden = false;
      out.innerHTML = hits.length ? hits.map(function (x) { var r = x[1]; return '<a href="' + esc(r.u) + '"><small>' + esc(r.s) + ' › Chapter ' + r.n + '</small><b>' + esc(r.t) + '</b><small>' + esc(r.a) + '</small></a>'; }).join('') :
        '<p>No chapter matches “' + esc(q.value.trim()) + '” yet. Try fewer words, or a different spelling. That subject may still be marked “Coming soon”.</p>';
    }
    q.addEventListener('input', function () {
      if (idx) return run();
      if (loading) return; loading = true;
      fetch('notes-index.json').then(function (r) { return r.json(); }).then(function (j) { idx = j; run(); }, function () { out.hidden = false; out.innerHTML = '<p>Search could not load. Check your connection.</p>'; loading = false; });
    });
  }
  function subjectPage() {
    var slug = B.dataset.nnSubject, n = 0;
    $$('.nn-ch').forEach(function (a) { if (ST.read[slug + '/' + a.dataset.slug]) { a.classList.add('read'); n++; } });
    var c = $('#nn-readct'); if (c) c.textContent = n;
    resumeBox();
    $$('[data-pf]').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-pf]').forEach(function (x) { x.classList.toggle('on', x === b); });
        var want = b.dataset.pf === 'all' ? null : b.dataset.pf.split(',');
        $$('.nn-ch').forEach(function (a) { a.classList.toggle('hide', !!want && want.indexOf(a.dataset.p) < 0); });
      });
    });
  }

  /* ================= REVISION PAGES ================= */
  function highlightsPage() {
    var w = $('.nn-wide');
    $$('[data-f]').forEach(function (b) { b.addEventListener('click', function () { $$('[data-f]').forEach(function (x) { x.classList.toggle('on', x === b); }); w.dataset.f = b.dataset.f; }); });
  }
  function devPage() { $$('[data-reveal]').forEach(function (b) { b.addEventListener('click', function () { var a = b.parentNode.querySelector('.nn-ans'); a.hidden = !a.hidden; b.textContent = a.hidden ? 'Show answer' : 'Hide answer'; }); }); }
  function rapidPage() {
    var i = $('#nn-artq'); if (!i) return;
    i.addEventListener('input', function () { var v = i.value.trim().toLowerCase(); $$('#nn-art tbody tr').forEach(function (r) { r.style.display = !v || r.textContent.toLowerCase().indexOf(v) > -1 ? '' : 'none'; }); });
  }
  function mcqPage() {
    var key = B.dataset.nnSubject, qs = $$('.nn-mcq'); ST.mcq[key] = ST.mcq[key] || {};
    function score() {
      var ok = 0; qs.forEach(function (q) { var p = ST.mcq[key][q.dataset.i]; if (p && p === q.dataset.a) ok++; });
      $('#nn-sc').textContent = ok; $('#nn-sp').style.width = (qs.length ? ok / qs.length * 100 : 0) + '%';
    }
    function show(q, pick) {
      q.classList.add('done');
      $$('.nn-opt', q).forEach(function (o) { o.disabled = true; if (o.dataset.o === q.dataset.a) o.classList.add('ok'); else if (o.dataset.o === pick) o.classList.add('bad'); });
      $('.nn-exp', q).hidden = false;
    }
    qs.forEach(function (q) {
      var p = ST.mcq[key][q.dataset.i]; if (p) show(q, p);
      $$('.nn-opt', q).forEach(function (o) { o.addEventListener('click', function () { if (q.classList.contains('done')) return; ST.mcq[key][q.dataset.i] = o.dataset.o; save(); show(q, o.dataset.o); score(); }); });
    });
    score();
    $('#nn-reset').addEventListener('click', function () {
      ST.mcq[key] = {}; save();
      qs.forEach(function (q) { q.classList.remove('done'); $$('.nn-opt', q).forEach(function (o) { o.disabled = false; o.classList.remove('ok', 'bad'); }); $('.nn-exp', q).hidden = true; });
      score(); scrollTo(0, 0);
    });
  }

  /* ================= MY NOTES ================= */
  function minePage() {
    var host = $('#nn-mine'), tab = 'hl', cf = 0, idx = null, term = '';
    var ix = {}; // 'slug/chapterslug' -> {s,n,t,u}
    function title(k) { return ix[k] || { s: k.split('/')[0].replace(/-/g, ' '), n: 0, t: k.split('/')[1] || '', u: k.split('/')[0] + '/' + k.split('/')[1] + '.html' }; }
    function stamp(ts) { var d = new Date(ts); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    function toolbar() {
      return '<div class="nn-tools2"><button class="btn sm" data-m="copy">Copy all</button><button class="btn sm" data-m="print">Print / PDF</button><button class="btn sm" data-m="backup">Backup</button><label class="btn sm" style="cursor:pointer">Restore<input type="file" accept="application/json" data-m="restore" hidden></label></div>';
    }
    function hlView() {
      var groups = {}, total = 0;
      for (var k in ST.hl) ST.hl[k].forEach(function (h) {
        if (cf && h.c !== cf) return; if (term && (h.t + ' ' + (h.note || '')).toLowerCase().indexOf(term) < 0) return;
        (groups[k] = groups[k] || []).push(h); total++;
      });
      var keys = Object.keys(groups).sort(function (a, b) { var A = title(a), B2 = title(b); return A.s === B2.s ? A.n - B2.n : A.s < B2.s ? -1 : 1; });
      var f = '<div class="nn-filter"><button class="nn-fb' + (cf ? '' : ' on') + '" data-cf="0">All</button>' + [1, 2, 3, 4].map(function (c) { return '<button class="nn-fb' + (cf === c ? ' on' : '') + '" data-cf="' + c + '"><span class="nn-hli" style="display:inline-grid;padding:0;border:0;vertical-align:middle"><span class="dot c' + c + '"></span></span> ' + COLORS[c] + '</button>'; }).join('') + '</div><label class="nn-search" style="margin-top:12px"><span class="sr-only">Search my highlights</span><input type="search" id="nn-hs" placeholder="Search my highlights and notes" value="' + esc(term) + '"></label>';
      if (!total) return toolbar() + f + '<div class="nn-empty">' + (totalHl() ? 'No highlights match this filter.' : 'No highlights yet. Open a chapter, select any text and pick a colour. It will appear here, grouped by chapter.') + '<p><a class="btn" href="./">Open the notes</a></p></div>';
      var html = toolbar() + f + '<p class="al-fine">' + total + ' highlight' + (total === 1 ? '' : 's') + ' across ' + keys.length + ' chapter' + (keys.length === 1 ? '' : 's') + '.</p>', last = '';
      keys.forEach(function (k) {
        var t = title(k);
        if (t.s !== last) { html += (last ? '</section>' : '') + '<section class="nn-grp"><h2>' + esc(t.s) + '</h2>'; last = t.s; }
        html += '<div class="nn-chg"><h3><span>' + (t.n ? 'Chapter ' + t.n + ': ' : '') + esc(t.t) + '</span><a href="' + esc(t.u) + '">Open chapter →</a></h3>';
        groups[k].sort(function (a, b) { return a.ts - b.ts; }).forEach(function (h) {
          html += '<div class="nn-hli"><span class="dot c' + h.c + '" title="' + COLORS[h.c] + '"></span><div><p>' + esc(h.t) + '</p>' + (h.note ? '<div class="nt"><b>Note:</b> ' + esc(h.note) + '</div>' : '') + (h.lost ? '<div class="nt">This line was edited in a later version of the notes.</div>' : '') + '</div><span class="ac"><a href="' + esc(t.u) + '#hl-' + h.id + '">Open</a><button type="button" data-del="' + k + '|' + h.id + '">Delete</button></span></div>';
        });
        html += '</div>';
      });
      return html + '</section>';
    }
    function dqView() {
      if (!ST.dq.length) return '<div class="nn-empty">No doubts yet. In any chapter, select text or press the <b>?</b> button and choose Ask a doubt.</div>';
      return ST.dq.map(function (d) {
        return '<div class="nn-chg"><h3><span>' + esc(d.subject) + (d.chapter ? ' › Chapter ' + esc(d.no) + ': ' + esc(d.chapter) : '') + '</span><span class="nn-chip">' + stamp(d.ts) + '</span></h3>' +
          (d.quote ? '<div class="nn-hli"><span class="dot c4"></span><p><i>“' + esc(d.quote) + '”</i></p><span></span></div>' : '') +
          '<p style="font-weight:700;line-height:1.6">' + esc(d.text) + '</p><div class="nn-tools2" style="margin:10px 0 0"><label class="nn-chip" style="cursor:pointer"><input type="checkbox" data-res="' + d.id + '"' + (d.resolved ? ' checked' : '') + '> Resolved</label><a class="btn sm" href="' + esc(d.url) + '">Open page</a><a class="btn sm" href="mailto:' + CONTACT + '?subject=' + encodeURIComponent('AIBE Notes doubt: ' + d.subject) + '&body=' + encodeURIComponent('Page: ' + d.url + '\n\n' + (d.quote ? '"' + d.quote + '"\n\n' : '') + 'My doubt:\n' + d.text) + '">Email again</a><button class="btn sm" data-deld="' + d.id + '">Delete</button></div></div>';
      }).join('');
    }
    function pgView() {
      var by = {}; idx.forEach(function (r) { (by[r.s] = by[r.s] || { slug: r.sl, list: [] }).list.push(r); });
      var h = '';
      Object.keys(by).forEach(function (s) {
        var L = by[s].list.sort(function (a, b) { return a.n - b.n; }), n = L.filter(function (r) { return ST.read[r.sl + '/' + r.u.split('/')[1].replace('.html', '')]; }).length;
        h += '<section class="nn-grp"><h2>' + esc(s) + '</h2><p class="sb">' + n + ' of ' + L.length + ' chapters read</p><div class="nn-score" style="margin:0 0 12px"><i><u style="width:' + (n / L.length * 100) + '%"></u></i></div><div class="nn-chs">' +
          L.map(function (r) { var rd = ST.read[r.sl + '/' + r.u.split('/')[1].replace('.html', '')]; return '<a class="nn-ch' + (rd ? ' read' : '') + '" href="' + esc(r.u) + '"><span class="nn-no sm">' + r.n + '</span><span class="b"><b>' + esc(r.t) + '</b><span class="a">' + esc(r.a) + '</span></span><span class="st"></span></a>'; }).join('') + '</div></section>';
      });
      return (h || '<div class="nn-empty">No subjects yet.</div>') + '<p><button class="btn sm" data-m="resetp">Reset reading progress</button></p>';
    }
    function render() {
      host.innerHTML = tab === 'hl' ? hlView() : tab === 'dq' ? dqView() : pgView();
      var s = $('#nn-hs'); if (s) s.addEventListener('input', function () { term = s.value.trim().toLowerCase(); var p = s.selectionStart; render(); var n = $('#nn-hs'); n.focus(); n.setSelectionRange(p, p); });
    }
    $$('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { tab = b.dataset.tab; $$('[data-tab]').forEach(function (x) { x.classList.toggle('on', x === b); }); render(); }); });
    host.addEventListener('click', function (e) {
      var t = e.target.closest('button,input,label'); if (!t) return;
      if (t.dataset.cf !== undefined) { cf = +t.dataset.cf; render(); }
      else if (t.dataset.del) { var p = t.dataset.del.split('|'), l = ST.hl[p[0]]; for (var i = 0; i < l.length; i++) if (l[i].id === p[1]) { l.splice(i, 1); break; } if (!l.length) delete ST.hl[p[0]]; save(); render(); }
      else if (t.dataset.deld) { ST.dq = ST.dq.filter(function (d) { return d.id !== t.dataset.deld; }); save(); render(); }
      else if (t.dataset.res) { ST.dq.forEach(function (d) { if (d.id === t.dataset.res) d.resolved = t.checked; }); save(); }
      else if (t.dataset.m === 'print') window.print();
      else if (t.dataset.m === 'copy') {
        var out = []; for (var k in ST.hl) { var tt = title(k); out.push(tt.s + ' > ' + (tt.n ? 'Chapter ' + tt.n + ': ' : '') + tt.t); ST.hl[k].forEach(function (h) { out.push('  [' + COLORS[h.c] + '] ' + h.t + (h.note ? '  (Note: ' + h.note + ')' : '')); }); out.push(''); }
        copy('My AIBE highlights (NET Law-Verse, netlawverse.in/aibe/notes)\n\n' + out.join('\n'), function (ok) { toast(ok ? 'Copied all highlights' : 'Copy failed'); });
      }
      else if (t.dataset.m === 'backup') {
        var a = el('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(ST)], { type: 'application/json' })); a.download = 'aibe-notes-backup.json'; D.body.appendChild(a); a.click(); a.remove(); toast('Backup downloaded');
      }
      else if (t.dataset.m === 'resetp') { if (confirm('Clear all "read" marks? Your highlights and doubts are kept.')) { ST.read = {}; save(); render(); } }
    });
    host.addEventListener('change', function (e) {
      var t = e.target; if (t.dataset.m !== 'restore' || !t.files[0]) return;
      var fr = new FileReader(); fr.onload = function () {
        try { var o = JSON.parse(fr.result); if (!o || typeof o !== 'object' || !o.hl) throw 0; if (!confirm('Replace your current notebook with this backup?')) return; ST = o; var b = blank(); for (var k in b) if (ST[k] === undefined) ST[k] = b[k]; save(); render(); toast('Backup restored'); }
        catch (x) { toast('That file is not an AIBE notes backup.'); }
      }; fr.readAsText(t.files[0]);
    });
    fetch('notes-index.json').then(function (r) { return r.json(); }).then(function (j) {
      idx = j; j.forEach(function (r) { ix[r.sl + '/' + r.u.split('/')[1].replace('.html', '')] = r; }); render();
    }, function () { idx = []; render(); });
  }

  /* ---------- chapter navigation bar ---------- */
  function navInit() {
    var nav = document.querySelector('.nn-nav'); if (!nav) return;
    var sw = nav.querySelector('.nn-sw'), sub = B.dataset.nnSubject;
    $$('.nn-swp a[data-slug]', nav).forEach(function (a) {
      if (ST.read && ST.read[sub + '/' + a.dataset.slug]) a.classList.add('done');
    });
    document.addEventListener('click', function (e) { if (sw.open && !sw.contains(e.target)) sw.open = false; });
    sw.addEventListener('toggle', function () {
      if (!sw.open) return;
      var cur = sw.querySelector('[aria-current]');
      if (cur && cur.scrollIntoView) { var box = sw.querySelector('.nn-swp'); box.scrollTop = Math.max(0, cur.offsetTop - 60); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sw.open) { sw.open = false; return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var tg = e.target, tn = tg && tg.tagName;
      if (tn === 'INPUT' || tn === 'TEXTAREA' || tn === 'SELECT' || (tg && tg.isContentEditable)) return;
      var a = e.key === '[' ? nav.querySelector('a.prev') : e.key === ']' ? nav.querySelector('a.next') : null;
      if (a && PAGE === 'chapter') location.href = a.href;
    });
  }

  /* ---------- boot ---------- */
  try {
    if (PAGE !== 'hub' && PAGE !== 'subject' && PAGE !== 'mine') navInit();
    if (PAGE === 'chapter') { highlighterInit(); chapterPage(); }
    else if (PAGE === 'hub') hubPage();
    else if (PAGE === 'subject') subjectPage();
    else if (PAGE === 'highlights') highlightsPage();
    else if (PAGE === 'dev') devPage();
    else if (PAGE === 'rapid') rapidPage();
    else if (PAGE === 'mcq') mcqPage();
    else if (PAGE === 'mine') minePage();
    if (PAGE !== 'chapter' && PAGE !== 'hub' && PAGE !== 'subject' && PAGE !== 'mine') D.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDoubt(); });
    doubtInit();
  } catch (err) { if (window.console) console.error('AIBE notes:', err); }
})();
