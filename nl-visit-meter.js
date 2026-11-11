/* nl-visit-meter.js (v2): a small, playful "live visits" card for NET Law-Verse.

   What visitors see
     - A card with a pulsing LIVE dot and rolling odometer digits that spin up when it scrolls into view.
     - A "today" figure and a 7-day bar chart (appears once there are earlier days with real visits).
     - "You're visitor #24,871": their own number, kept for the whole session.
     - When the count rises while the page is open, the digits roll and a little "+1" floats up.
     - Milestones (every 1,000th visitor, plus #100 and #500) get a confetti burst. Tapping the card gives a small cheer.
     Everything shown comes from the real counter. Nothing is invented.

   How it counts
     One visit = one browser session (a return within 30 minutes is the same visit), so refreshes and page hops add nothing.
     Only the hosts listed below count; bots and automated browsers are ignored.

   Safety and privacy
     If the counter service is unreachable, the card never appears (no error, no zero, no stale number).
     Nothing is sent but the counter's own address; like any web request, the service sees the visitor's IP.

   Placement: inside the page's <footer>, or inside <div id="nl-visit-meter"></div> if you add one.
   CONFIG (optional): window.NL_VISIT_CONFIG = { ... } before this script. See the settings below. */
(function () {
  if (window.__nlvm) return; window.__nlvm = 1;

  var DEFAULTS = {
    provider: 'counterapi',                           // 'counterapi' or 'abacus' (free, no sign-up)
    namespace: 'netlawverse-in',                      // your private bucket name; keep it unusual
    totalKey: 'visits',
    hosts: ['netlawverse.in', 'www.netlawverse.in'],  // only these hosts add to the count
    sessionMinutes: 30,
    refreshSeconds: 60,
    maxRefreshes: 10,
    showToday: true,
    showWeek: true,                                   // 7-day bars (6 extra reads, cached for 15 minutes)
    celebrate: true,                                  // confetti on milestones and on tap
    minToShow: 0,                                     // hide the card until the total reaches this
    baseline: 0,                                      // add a REAL earlier figure only; never invent one
    caption: 'visits to NET Law-Verse',
    storagePrefix: 'nlvm'
  };
  var user = window.NL_VISIT_CONFIG || {}, C = {};
  for (var k in DEFAULTS) C[k] = user[k] !== undefined ? user[k] : DEFAULTS[k];

  var ua = navigator.userAgent || '';
  if (navigator.webdriver || /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit/i.test(ua)) return;

  var isLive = C.hosts.indexOf(location.hostname) > -1;
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function enc(s) { return encodeURIComponent(s); }
  function fmt(n) { try { return n.toLocaleString('en-IN'); } catch (e) { return String(n); } }
  function el(tag, cls, text) { var x = document.createElement(tag); if (cls) x.className = cls; if (text != null) x.textContent = text; return x; }

  /* ---------- counter providers ---------- */
  var PROVIDERS = {
    counterapi: {
      hit: function (k) { return 'https://api.counterapi.dev/v1/' + enc(C.namespace) + '/' + enc(k) + '/up'; },
      get: function (k) { return 'https://api.counterapi.dev/v1/' + enc(C.namespace) + '/' + enc(k); }
    },
    abacus: {
      hit: function (k) { return 'https://abacus.jasoncameron.dev/hit/' + enc(C.namespace) + '/' + enc(k); },
      get: function (k) { return 'https://abacus.jasoncameron.dev/get/' + enc(C.namespace) + '/' + enc(k); }
    }
  };
  var P = PROVIDERS[C.provider] || PROVIDERS.counterapi;

  function pickNumber(j) {
    if (!j) return NaN;
    var v = j.count != null ? j.count : j.value != null ? j.value : j.up_count != null ? j.up_count :
            (j.data && (j.data.up_count != null ? j.data.up_count : j.data.count));
    v = Number(v);
    return isFinite(v) && v >= 0 ? Math.floor(v) : NaN;
  }
  function call(url) {
    return fetch(url, { cache: 'no-store', mode: 'cors', credentials: 'omit' }).then(function (r) {
      if (r.status === 404) return { count: 0 };
      if (!r.ok) throw new Error('status ' + r.status);
      return r.json();
    }).then(function (j) { var n = pickNumber(j); if (isNaN(n)) throw new Error('bad reply'); return n; });
  }

  /* ---------- one visit per session ---------- */
  var LAST = C.storagePrefix + '-last', ME = C.storagePrefix + '-me', WEEK = C.storagePrefix + '-week';
  var now = Date.now(), shouldHit = isLive, myNo = 0;
  try {
    var last = +localStorage.getItem(LAST) || 0;
    if (last && now - last < C.sessionMinutes * 60000) { shouldHit = false; myNo = isLive ? (+localStorage.getItem(ME) || 0) : 0; }
    localStorage.setItem(LAST, String(now));
  } catch (e) {}

  function dayKeyFor(off) { return 'd' + new Date(Date.now() + 19800000 - off * 864e5).toISOString().slice(0, 10).replace(/-/g, ''); }
  function dayLabel(off) {
    try { return new Date(Date.now() + 19800000 - off * 864e5).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }); }
    catch (e) { return dayKeyFor(off); }
  }
  var dayKey = dayKeyFor(0);

  function fetchAll(count) {
    var op = count ? P.hit : P.get;
    var total = call(op(C.totalKey));
    var today = C.showToday ? call(op(dayKey)).catch(function () { return NaN; }) : Promise.resolve(NaN);
    return Promise.all([total, today]);
  }
  function fetchWeek() {
    try {
      var c = JSON.parse(sessionStorage.getItem(WEEK) || 'null');
      if (c && c.k === dayKey && Date.now() - c.t < 900000) return Promise.resolve(c.v);
    } catch (e) {}
    var jobs = [];
    for (var i = 6; i >= 1; i--) jobs.push(call(P.get(dayKeyFor(i))).catch(function () { return NaN; }));
    return Promise.all(jobs).then(function (v) {
      try { sessionStorage.setItem(WEEK, JSON.stringify({ k: dayKey, t: Date.now(), v: v })); } catch (e) {}
      return v;
    });
  }

  /* ---------- styles ---------- */
  var CSS =
    '.nlvm{display:flex;justify-content:center;margin:24px auto 10px;padding:0 12px;font:inherit;color:inherit}' +
    '.nlvm-card{position:relative;width:min(100%,440px);padding:18px 22px 16px;border-radius:26px;text-align:center;overflow:hidden;cursor:pointer;' +
      'background:rgba(127,127,127,.09);border:1px solid rgba(127,127,127,.3);box-shadow:0 18px 40px -24px rgba(60,40,140,.5);' +
      '-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);opacity:0;transform:translateY(12px);transition:opacity .6s,transform .6s}' +
    '.nlvm-card.in{opacity:1;transform:none}' +
    '.nlvm-card:active{transform:scale(.99)}' +
    '.nlvm-card::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,#3F5FE0,#7A3FE0,#C23A7B)}' +
    '.nlvm-top{display:flex;align-items:center;justify-content:center;gap:8px;font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}' +
    '.nlvm-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;flex:none;animation:nlvm-pulse 2s infinite}' +
    '@keyframes nlvm-pulse{0%{box-shadow:0 0 0 0 rgba(34,197,94,.55)}70%{box-shadow:0 0 0 8px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}' +
    '.nlvm-ow{position:relative;display:flex;justify-content:center;margin:14px 0 6px}' +
    '.nlvm-odo{display:inline-flex;align-items:center;gap:5px;font-size:38px;font-weight:800;line-height:1.1;letter-spacing:-1px;font-variant-numeric:tabular-nums}' +
    '.nlvm-c{display:inline-block;width:.66em;height:1.1em;overflow:hidden;border-radius:10px;background:rgba(127,127,127,.14);box-shadow:inset 0 0 0 1px rgba(127,127,127,.2)}' +
    '.nlvm-r{display:flex;flex-direction:column;transition:transform 1.4s cubic-bezier(.2,.9,.25,1)}' +
    '.nlvm-r i{display:block;height:1.1em;line-height:1.1em;text-align:center;font-style:normal;color:#7A3FE0;' +
      'background:linear-gradient(180deg,#3F5FE0,#7A3FE0 55%,#C23A7B);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}' +
    '.nlvm-s{font-size:.6em;font-weight:800;opacity:.5;margin:0 -1px}' +
    '.nlvm-cap{font-size:13px;font-weight:600;opacity:.8}' +
    '.nlvm-row{display:flex;align-items:flex-end;justify-content:center;gap:28px;margin-top:16px}' +
    '.nlvm-st b{display:block;font-size:22px;font-weight:800;line-height:1.1;font-variant-numeric:tabular-nums}' +
    '.nlvm-st span,.nlvm-bl{display:block;margin-top:2px;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;opacity:.65}' +
    '.nlvm-bars{display:flex;align-items:flex-end;justify-content:center;gap:5px;height:30px}' +
    '.nlvm-b{width:9px;min-height:4px;border-radius:4px;background:linear-gradient(180deg,#7A3FE0,#3F5FE0);opacity:.6;transition:height .9s cubic-bezier(.2,.9,.25,1)}' +
    '.nlvm-b.now{opacity:1;background:linear-gradient(180deg,#C23A7B,#7A3FE0)}' +
    '.nlvm-me{display:inline-block;margin-top:14px;padding:7px 15px;border-radius:999px;font-size:13px;font-weight:700;' +
      'background:linear-gradient(90deg,rgba(63,95,224,.16),rgba(194,58,123,.16));border:1px solid rgba(122,63,224,.3)}' +
    '.nlvm-me.ms{background:linear-gradient(90deg,#3F5FE0,#7A3FE0 60%,#C23A7B);border-color:transparent;color:#fff}' +
    '.nlvm-plus{position:absolute;right:-4px;top:-6px;font-size:15px;font-weight:800;color:#16a34a;pointer-events:none;animation:nlvm-rise 1.8s ease-out forwards}' +
    '@keyframes nlvm-rise{0%{opacity:0;transform:translateY(8px) scale(.8)}20%{opacity:1}100%{opacity:0;transform:translateY(-28px) scale(1.15)}}' +
    '.nlvm-sr{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
    '.nlvm-card.lt{background:rgba(255,255,255,.68);border-color:rgba(255,255,255,.9);box-shadow:0 22px 44px -26px rgba(60,40,140,.55)}' +
    '.nlvm-card.lt .nlvm-c{background:#fff;box-shadow:inset 0 0 0 1px rgba(122,63,224,.16),0 8px 16px -10px rgba(60,40,140,.55)}' +
    '.nlvm-card.dk{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.16)}' +
    '.nlvm-card.dk .nlvm-c{background:rgba(255,255,255,.09);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}' +
    '.nlvm-card.dk .nlvm-r i{background:linear-gradient(180deg,#8FAAFF,#B994FF 55%,#FF8CC0);-webkit-background-clip:text;background-clip:text}' +
    '.nlvm-card.dk .nlvm-b{background:linear-gradient(180deg,#B994FF,#8FAAFF)}' +
    '.nlvm-card.dk .nlvm-b.now{background:linear-gradient(180deg,#FF8CC0,#B994FF)}' +
    '@media (max-width:600px){.nlvm{margin-bottom:120px}}' +
    '@media (max-width:420px){.nlvm-odo{font-size:30px}.nlvm-row{gap:20px}}' +
    '@media (prefers-reduced-motion:reduce){.nlvm-dot,.nlvm-plus{animation:none}.nlvm-r,.nlvm-b,.nlvm-card{transition:none}}';

  /* ---------- odometer ---------- */
  function Odometer(host) { this.host = host; this.cols = []; this.str = ''; }
  Odometer.prototype.set = function (n, animate) {
    var s = fmt(n), self = this;
    if (s.length !== this.str.length) {
      this.host.textContent = ''; this.cols = [];
      for (var i = 0; i < s.length; i++) {
        if (/\d/.test(s.charAt(i))) {
          var col = el('span', 'nlvm-c'), roll = el('span', 'nlvm-r');
          for (var d = 0; d < 10; d++) roll.appendChild(el('i', null, String(d)));
          col.appendChild(roll); this.host.appendChild(col); this.cols.push({ roll: roll, d: 0, at: i });
        } else this.host.appendChild(el('span', 'nlvm-s', s.charAt(i)));
      }
      void this.host.offsetWidth;                                   // start from 0 so the digits visibly roll in
    }
    this.str = s;
    var digits = s.replace(/\D/g, ''), total = this.cols.length;
    this.cols.forEach(function (c, idx) {
      var dg = +digits.charAt(idx);
      c.roll.style.transitionDelay = (animate && !reduce) ? ((total - 1 - idx) * 70) + 'ms' : '0ms';
      c.roll.style.transform = 'translateY(' + (-dg * 1.1) + 'em)';
      c.d = dg;
    });
  };

  /* ---------- confetti ---------- */
  function confetti(from, count) {
    if (reduce || !C.celebrate) return;
    var cv = document.createElement('canvas'), W = window.innerWidth, H = window.innerHeight, dpr = window.devicePixelRatio || 1;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:99999';
    document.body.appendChild(cv);
    var g = cv.getContext('2d'); g.scale(dpr, dpr);
    var colors = ['#3F5FE0', '#7A3FE0', '#C23A7B', '#2C9A86', '#F5B83D', '#EF4444'], ps = [];
    for (var i = 0; i < (count || 70); i++) {
      var a = -Math.PI / 2 + (Math.random() - .5) * 1.6, sp = 5 + Math.random() * 9;
      ps.push({ x: from.x, y: from.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, w: 5 + Math.random() * 6, h: 3 + Math.random() * 5,
                r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: colors[i % colors.length] });
    }
    var t0 = null;
    (function frame(ts) {
      if (t0 === null) t0 = ts;
      var age = ts - t0; g.clearRect(0, 0, W, H);
      ps.forEach(function (p) {
        p.vy += .28; p.vx *= .992; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        g.save(); g.globalAlpha = Math.max(0, 1 - age / 2400); g.translate(p.x, p.y); g.rotate(p.r);
        g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore();
      });
      if (age < 2400) requestAnimationFrame(frame); else if (cv.parentNode) cv.parentNode.removeChild(cv);
    })(performance.now());
    cv.id = 'nlvm-confetti';
  }
  function isMilestone(n) { return n === 100 || n === 500 || (n >= 1000 && n % 1000 === 0); }

  /* ---------- the card ---------- */
  var S = { t: 0, d: NaN, week: null, built: false, visible: false, painted: false, celebrated: false };
  var card, odo, odoHost, todayB, todayWrap, barsWrap, bars = [], meEl, srEl, rowEl;

  var SPA = !!(document.getElementById('view') && document.getElementById('app'));   // the phone app shell swaps screens in and out
  var autoBox = null, obs = null, raf = 0;

  function createCard() {
    document.head.appendChild(el('style', null, CSS));
    card = el('div', 'nlvm-card'); card.setAttribute('role', 'status'); card.setAttribute('aria-live', 'off'); card.title = 'Tap for a little cheer';
    var top = el('div', 'nlvm-top'), dot = el('span', 'nlvm-dot'); dot.setAttribute('aria-hidden', 'true');
    top.appendChild(dot); top.appendChild(el('span', null, 'Live'));
    var ow = el('div', 'nlvm-ow'); odoHost = el('div', 'nlvm-odo'); odoHost.setAttribute('aria-hidden', 'true'); ow.appendChild(odoHost);
    var cap = el('div', 'nlvm-cap', C.caption);
    rowEl = el('div', 'nlvm-row'); rowEl.style.display = 'none';
    todayWrap = el('div', 'nlvm-st'); todayB = el('b', null, '0'); todayWrap.appendChild(todayB); todayWrap.appendChild(el('span', null, 'today'));
    barsWrap = el('div'); barsWrap.style.display = 'none'; barsWrap.setAttribute('aria-hidden', 'true');
    var bw = el('div', 'nlvm-bars'); barsWrap.appendChild(bw); barsWrap.appendChild(el('span', 'nlvm-bl', 'last 7 days'));
    for (var i = 0; i < 7; i++) { var b = el('span', 'nlvm-b' + (i === 6 ? ' now' : '')); b.style.height = '4px'; bw.appendChild(b); bars.push(b); }
    rowEl.appendChild(todayWrap); rowEl.appendChild(barsWrap);
    meEl = el('div', 'nlvm-me'); meEl.style.display = 'none';
    srEl = el('span', 'nlvm-sr');
    [top, ow, cap, rowEl, meEl, srEl].forEach(function (x) { card.appendChild(x); });
    odo = new Odometer(odoHost);

    card.addEventListener('click', function () {
      var r = card.getBoundingClientRect(); confetti({ x: r.left + r.width / 2, y: r.top + r.height / 3 }, 45);
    });
    document.addEventListener('click', function () { setTimeout(tone, 120); }, { passive: true });   // theme buttons
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { io.disconnect(); reveal(); }
      }, { threshold: 0.35 });
      io.observe(card);
    } else reveal();
    S.built = true;
    if (SPA && !obs && window.MutationObserver) {          // re-attach the card whenever a screen with a placeholder is shown
      obs = new MutationObserver(function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; mount(); }); });
      obs.observe(document.getElementById('view'), { childList: true });
    }
  }

  /* Put the card where it belongs: <div id="nl-visit-meter"> if the page has one, else the page footer. */
  function mount() {
    if (!card) return false;
    var host = document.getElementById('nl-visit-meter');
    if (!host && !SPA) {
      if (autoBox && autoBox.parentNode) host = autoBox;
      else { var foot = document.querySelector('footer'); if (!foot) return false; host = autoBox = el('div'); foot.appendChild(host); }
    }
    if (!host) return false;
    host.classList.add('nlvm');
    if (card.parentNode !== host) { host.appendChild(card); tone(); }
    return true;
  }

  function tone() {
    if (!card || !card.parentNode) return;
    var m = (getComputedStyle(card.parentNode).color || '').match(/[\d.]+/g);
    if (!m || m.length < 3) return;
    var luma = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
    card.classList.toggle('lt', luma < 0.5); card.classList.toggle('dk', luma >= 0.5);
  }

  function reveal() { S.visible = true; card.classList.add('in'); paint(); }

  function paintBars() {
    var hasPast = S.week && S.week.some(function (v) { return v > 0; });
    if (!C.showWeek || !hasPast || isNaN(S.d)) { barsWrap.style.display = 'none'; return; }
    barsWrap.style.display = '';
    var vals = S.week.concat([S.d]), max = Math.max.apply(null, vals.filter(function (v) { return !isNaN(v); }).concat([1]));
    bars.forEach(function (b, i) {
      var v = vals[i]; b.style.height = (isNaN(v) ? 4 : 4 + Math.round((v / max) * 26)) + 'px';
      b.title = dayLabel(6 - i) + (isNaN(v) ? '' : ': ' + fmt(v) + ' visits');
    });
  }

  function glide(node, from, to) {
    if (from === to || reduce || !window.requestAnimationFrame) { node.textContent = fmt(to); return; }
    var t0 = null;
    requestAnimationFrame(function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / 900), e = 1 - Math.pow(1 - p, 3);
      node.textContent = fmt(Math.round(from + (to - from) * e));
      if (p < 1) requestAnimationFrame(step);
    });
  }

  var shownT = 0, shownD = 0;
  function paint() {
    if (!S.visible) return;
    tone();
    var t = S.t, d = S.d, first = !S.painted;
    odo.set(t, first);
    if (!first && t > shownT) {
      var plus = el('span', 'nlvm-plus', '+' + fmt(t - shownT)); odoHost.parentNode.appendChild(plus);
      setTimeout(function () { if (plus.parentNode) plus.parentNode.removeChild(plus); }, 1900);
    }
    shownT = t;
    var hasDay = !isNaN(d);
    rowEl.style.display = hasDay ? '' : 'none';
    if (hasDay) { glide(todayB, first ? 0 : shownD, d); shownD = d; }
    paintBars();
    if (myNo > 0 && !S.meDone) {
      S.meDone = true; var ms = C.celebrate && S.milestone;
      meEl.style.display = ''; meEl.className = 'nlvm-me' + (ms ? ' ms' : '');
      meEl.textContent = (ms ? 'Milestone! ' : '') + 'You’re visitor #' + fmt(myNo);
      if (ms && !S.celebrated) {
        S.celebrated = true;
        setTimeout(function () { var r = card.getBoundingClientRect(); confetti({ x: r.left + r.width / 2, y: r.top + r.height / 2 }, 110); }, 900);
      }
    }
    srEl.textContent = fmt(t) + ' visits in total' + (hasDay ? ', ' + fmt(d) + ' today' : '') + '.';
    S.painted = true;
  }

  function update(t, d) {
    t = t + (+C.baseline || 0);
    if (t < C.minToShow) return;
    S.t = t; S.d = d;
    if (!S.built) createCard();
    mount();
    card.setAttribute('data-total', String(t)); card.setAttribute('data-today', isNaN(d) ? '' : String(d));
    paint();
  }

  function start() {
    fetchAll(shouldHit).then(function (r) {
      if (shouldHit) {
        myNo = r[0] + (+C.baseline || 0); S.milestone = isMilestone(myNo);
        try { localStorage.setItem(ME, String(myNo)); } catch (e) {}
      }
      update(r[0], r[1]);
      if (C.showWeek && !isNaN(r[1])) fetchWeek().then(function (w) { S.week = w; if (S.built) paintBars(); }).catch(function () {});
      var n = 0, timer = setInterval(function () {
        if (++n > C.maxRefreshes) { clearInterval(timer); return; }
        if (document.visibilityState !== 'visible') return;
        dayKey = dayKeyFor(0);
        fetchAll(false).then(function (x) { update(x[0], x[1]); }).catch(function () {});
      }, Math.max(15, C.refreshSeconds) * 1000);
    }).catch(function () { /* counter unreachable: stay invisible */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
