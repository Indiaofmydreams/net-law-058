/* NET Law 058 PWA helper: service-worker registration + "Install App" UI.
 * Loaded (deferred) by every page. Adds nothing visible unless installing is actually possible.
 *
 * Any element with  data-nl-install  or  data-nl-show  is shown/hidden automatically; clicking an
 * element with data-nl-install opens the install flow (data-nl-show is visibility only). The nav item (on pages with #main-nav) is created here.
 * Phone app (app.html / m-app.js) uses the small window.NLPWA API at the bottom.
 */
(function () {
  'use strict';
  var d = document, w = window, nav = navigator;
  var WARM_OFFLINE_DATA = true;                 // pre-download question bank + mock tests in the background
  var DISMISS_DAYS = 14;                        // how long "Not now" hides the homepage strip
  var KEY_INSTALLED = 'nl-pwa-installed', KEY_DISMISS = 'nl-pwa-dismiss', KEY_WARM = 'nl-pwa-warm';

  /* ---------- helpers ---------- */
  function store(k, v) {
    try { if (v === undefined) return w.localStorage.getItem(k); if (v === null) w.localStorage.removeItem(k); else w.localStorage.setItem(k, v); } catch (e) { return null; }
  }
  var me = d.currentScript;
  var BASE = new URL('./', (me && me.src) || w.location.href).href;   // folder this script lives in
  var secure = w.isSecureContext || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(w.location.hostname);

  var ua = nav.userAgent || '';
  var isIOS = /iPad|iPhone|iPod/.test(ua) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(ua);
  var inApp = /FBAN|FBAV|Instagram|Line\/|WhatsApp|Telegram|MicroMessenger|Snapchat|; wv\)/i.test(ua);
  var isSamsung = /SamsungBrowser/i.test(ua);
  var isFirefox = /Firefox|FxiOS/i.test(ua);
  var isEdge = /Edg(e|A|iOS)?\//.test(ua);
  var isIOSAltBrowser = isIOS && /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
  var isSafari = /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|EdgiOS|Edg\/|OPR|Android/i.test(ua);
  var isChromium = /Chrome|Chromium|CriOS|Edg\//.test(ua) && !isFirefox;

  function standalone() {
    try {
      return w.matchMedia('(display-mode: standalone)').matches || w.matchMedia('(display-mode: fullscreen)').matches ||
        w.matchMedia('(display-mode: minimal-ui)').matches || w.matchMedia('(display-mode: window-controls-overlay)').matches ||
        nav.standalone === true;
    } catch (e) { return nav.standalone === true; }
  }

  /* ---------- service worker ---------- */
  var swReg = null;
  if ('serviceWorker' in nav && secure) {
    w.addEventListener('load', function () {
      nav.serviceWorker.register(BASE + 'sw.js', { scope: BASE, updateViaCache: 'none' }).then(function (reg) {
        swReg = reg;
        var last = 0;
        function check() { if (Date.now() - last > 3600e3) { last = Date.now(); reg.update().catch(function () {}); } }
        d.addEventListener('visibilitychange', function () { if (d.visibilityState === 'visible') check(); });
        nav.serviceWorker.ready.then(scheduleWarm);
      }).catch(function () { /* unsupported / blocked: the site simply works online as before */ });
    });
    nav.serviceWorker.addEventListener('message', function (e) {
      if (e.data && e.data.type === 'WARM_DONE' && e.data.ok > 0) store(KEY_WARM, String(Date.now()));
    });
  }
  function scheduleWarm(reg) {
    if (!WARM_OFFLINE_DATA || !reg || !reg.active) return;
    var c = nav.connection || {};
    if (c.saveData || /(^|-)2g$/.test(c.effectiveType || '')) return;          // respect Data Saver / very slow links
    var last = +store(KEY_WARM) || 0;
    if (Date.now() - last < 3 * 864e5) return;                                  // refresh at most every 3 days
    setTimeout(function () { if (d.visibilityState === 'visible') reg.active.postMessage({ type: 'WARM' }); }, 4000);
  }

  /* ---------- install state ---------- */
  var st = { deferred: null, fallback: false, installed: store(KEY_INSTALLED) === '1', open: false };

  w.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();                          // we show our own button instead of the browser mini-infobar
    st.deferred = e; st.installed = false; store(KEY_INSTALLED, null);
    refresh();
  });
  w.addEventListener('appinstalled', function () {
    st.deferred = null; st.installed = true; store(KEY_INSTALLED, '1');
    closeDialog(); refresh();
  });
  try { w.matchMedia('(display-mode: standalone)').addEventListener('change', refresh); } catch (e) {}

  /* Browsers that never fire beforeinstallprompt (iOS, desktop Safari/Firefox, or Chrome when criteria are not met):
     after a moment offer the manual instructions instead. */
  if (secure) setTimeout(function () { st.fallback = true; refresh(); }, 2500);

  function mode() {
    if (!secure || standalone() || st.installed) return 'none';
    if (st.deferred) return 'native';
    if (isIOS) return 'ios';
    if (st.fallback) return 'manual';
    return 'none';
  }
  function dismissed() { var t = +store(KEY_DISMISS) || 0; return Date.now() - t < DISMISS_DAYS * 864e5; }

  /* ---------- CSS (loaded only when there is something to show) ---------- */
  var cssP = null;
  function loadCss() {
    if (cssP) return cssP;
    cssP = new Promise(function (res) {
      var l = d.createElement('link'); l.rel = 'stylesheet'; l.href = BASE + 'pwa.css';
      l.onload = l.onerror = function () { res(); }; d.head.appendChild(l);
    });
    return cssP;
  }

  /* ---------- UI: nav item, other triggers ---------- */
  var ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 20h14"/></svg>';
  /* The header is already full on desktop (logo, 7 links, theme controls, live clock), so there the item lives in
     the "Resources" dropdown. In the phone / tablet hamburger menu (<= 900px) it is a button at the end of the list. */
  function ensureNavItem() {
    var n = d.getElementById('main-nav');
    if (!n) return;
    function make(cls) {
      var b = d.createElement('button');
      b.type = 'button'; b.className = cls; b.setAttribute('data-nl-install', ''); b.hidden = true;
      b.innerHTML = ICON + '<span>Install App</span>';
      return b;
    }
    if (!n.querySelector('.nl-install-nav')) n.appendChild(make('nl-install-nav'));
    var menu = n.querySelector('.nav-dd-in');
    if (menu && !menu.querySelector('.nl-install-dd')) menu.appendChild(make('nl-install-dd'));
  }

  function refresh() {
    ensureNavItem();
    var m = mode();
    function apply() {                           // re-evaluate at run time: css may finish loading after state changed
      var show = mode() !== 'none';
      Array.prototype.forEach.call(d.querySelectorAll('[data-nl-install],[data-nl-show]'), function (el) {
        el.hidden = !show || (el.hasAttribute('data-nl-strip') && dismissed());
      });
    }
    if (m !== 'none' && d.querySelector('[data-nl-install],[data-nl-show]')) loadCss().then(apply); else apply();
    try { w.dispatchEvent(new CustomEvent('nlpwa:change', { detail: { mode: m } })); } catch (e) {}
  }

  d.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-nl-install],[data-nl-dismiss]');
    if (!t) return;
    if (t.hasAttribute('data-nl-dismiss')) { e.preventDefault(); dismiss(); return; }
    if (t.tagName === 'A') e.preventDefault();
    var dd = t.closest('.nav-dd');
    if (dd) { dd.classList.remove('open'); var bt = dd.querySelector('.nav-dd-btn'); if (bt) bt.setAttribute('aria-expanded', 'false'); if (d.activeElement && d.activeElement.blur) d.activeElement.blur(); }
    install();
  });
  function dismiss() { store(KEY_DISMISS, String(Date.now())); refresh(); }

  /* ---------- install action ---------- */
  function install() {
    var p = st.deferred;
    if (p) {
      st.deferred = null;                        // a prompt event can only be used once
      p.prompt();
      p.userChoice.then(function (c) {
        if (c && c.outcome === 'accepted') { st.installed = true; store(KEY_INSTALLED, '1'); }
        st.fallback = true; refresh();           // if dismissed, later clicks show manual steps
      });
      refresh();
      return;
    }
    openDialog();
  }

  /* ---------- instructions dialog ---------- */
  var SHARE = '<svg class="nl-ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Share"><path d="M12 15V3M8 7l4-4 4 4M6 11H5a1 1 0 00-1 1v8a1 1 0 001 1h14a1 1 0 001-1v-8a1 1 0 00-1-1h-1"/></svg>';
  var PLUS = '<svg class="nl-ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Plus"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/></svg>';
  var DOTS = '<b class="nl-k" aria-label="three dots menu">⋮</b>';
  var NAME = 'NET Law 058';

  var GUIDES = {
    ios: ['iPhone / iPad (Safari)', [
      'Open this site in <b>Safari</b> (installing is not possible from other apps’ built-in browsers).',
      'Tap the <b>Share</b> button ' + SHARE + ' (bottom bar on iPhone, top bar on iPad).',
      'Scroll down and tap <b>Add to Home Screen</b> ' + PLUS + '.',
      'Keep “Open as Web App” on if it is shown, then tap <b>Add</b>. Launch ' + NAME + ' from your Home Screen.'],
      'Using Chrome, Edge or Firefox on iPhone? Tap its <b>Share</b> or <b>menu</b> button and choose <b>Add to Home Screen</b>. If you cannot find it, open this page in Safari instead.'],
    android: ['Android (Chrome, Edge, Brave)', [
      'Tap the browser menu ' + DOTS + ' (top right).',
      'Tap <b>Install app</b> (or <b>Add to Home screen</b>, then <b>Install</b>).',
      'Confirm. ' + NAME + ' now opens from your home screen or app drawer like any other app.']],
    samsung: ['Samsung Internet', [
      'Tap the menu <b>≡</b> (bottom right).',
      'Tap <b>Add page to</b>, then <b>Home screen</b> (or <b>Install</b> if shown).',
      'Confirm to place ' + NAME + ' on your home screen.']],
    firefoxAndroid: ['Firefox for Android', [
      'Tap the menu ' + DOTS + '.',
      'Tap <b>Install</b> (or <b>Add to Home screen</b>).',
      'Confirm to add ' + NAME + '.']],
    desktop: ['Windows, macOS, Linux, ChromeOS (Chrome or Edge)', [
      'Look for the <b>Install</b> icon at the right end of the address bar (a monitor with a down arrow) and click it.',
      'Or open the browser menu ' + DOTS + ' → <b>Cast, save and share</b> → <b>Install page as app…</b> (Chrome) / <b>Apps</b> → <b>Install this site as an app</b> (Edge).',
      'Click <b>Install</b>. The app opens in its own window and can be pinned to your taskbar or dock.']],
    mac: ['macOS (Safari 17 or later)', [
      'In the menu bar choose <b>File</b> → <b>Add to Dock…</b>.',
      'Click <b>Add</b>. ' + NAME + ' opens from the Dock in its own window.']],
    firefox: ['Firefox on a computer', [
      'Firefox for desktop does not offer a standard “install website as app” option.',
      'For the installable app experience, open this site in <b>Chrome</b> or <b>Edge</b> and follow the steps above. You can also pin this tab in Firefox.']]
  };

  function detect() {
    if (isIOS) return 'ios';
    if (isAndroid) return isSamsung ? 'samsung' : (isFirefox ? 'firefoxAndroid' : 'android');
    if (isFirefox) return 'firefox';
    if (isSafari) return 'mac';
    return 'desktop';
  }

  function guideHTML(key, open) {
    var g = GUIDES[key];
    var steps = g[1].map(function (s) { return '<li>' + s + '</li>'; }).join('');
    return '<details class="nl-g"' + (open ? ' open' : '') + '><summary>' + g[0] + '</summary><ol>' + steps + '</ol>' + (g[2] ? '<p class="nl-note">' + g[2] + '</p>' : '') + '</details>';
  }

  var dlg = null, lastFocus = null;
  function buildDialog() {
    var key = detect();
    var order = ['ios', 'android', 'samsung', 'firefoxAndroid', 'desktop', 'mac', 'firefox'];
    var others = order.filter(function (k) { return k !== key; }).map(function (k) { return guideHTML(k, false); }).join('');
    var warn = '';
    if (inApp) warn = '<p class="nl-warn">You seem to be inside another app’s browser (WhatsApp, Instagram, etc.). Open this page in ' + (isIOS ? 'Safari' : 'Chrome') + ' first, then install.</p>';
    var el = d.createElement('dialog');
    el.className = 'nl-dlg';
    el.setAttribute('aria-labelledby', 'nl-dlg-t');
    el.innerHTML =
      '<form method="dialog" class="nl-dlg-in">' +
        '<div class="nl-dlg-h"><img src="' + BASE + 'icons/icon-192.png" width="44" height="44" alt=""><div><h2 id="nl-dlg-t">Install ' + NAME + '</h2>' +
        '<p>Opens in its own window, launches from your home screen, and keeps your practice and mock-test progress on this device. Pages you have opened work offline.</p></div></div>' +
        warn + '<div class="nl-dlg-b"><p class="nl-lead">How to install on your device</p>' + guideHTML(key, true) +
        '<details class="nl-more"><summary>Instructions for other browsers and devices</summary>' + others + '</details>' +
        '<p class="nl-note">Already installed? Open it from your home screen, app list, taskbar or Dock. Installing is free and can be undone any time by uninstalling it like any other app.</p></div>' +
        '<div class="nl-dlg-f"><button class="nl-btn nl-btn-p" value="close" autofocus>Got it</button></div>' +
      '</form>';
    el.addEventListener('close', function () { st.open = false; if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {} });
    el.addEventListener('click', function (e) { if (e.target === el) el.close(); });   // backdrop click
    d.body.appendChild(el);
    return el;
  }
  function openDialog() {
    lastFocus = d.activeElement;
    loadCss().then(function () {
      if (!dlg) dlg = buildDialog();
      st.open = true;
      if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
    });
  }
  function closeDialog() { if (dlg && dlg.open) try { dlg.close(); } catch (e) {} }

  /* ---------- public API for the phone app ---------- */
  w.NLPWA = {
    available: function () { return mode() !== 'none'; },
    dismissed: dismissed,
    dismiss: dismiss,
    install: install,
    showInstructions: openDialog
  };

  /* ---------- boot ---------- */
  function boot() { ensureNavItem(); refresh(); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})();
