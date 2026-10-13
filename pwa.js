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
  var WARM_OFFLINE_DATA = false;                 // pre-download question bank + mock tests in the background
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
  var isApp = !!d.getElementById('app');            // the phone/tablet app interface (app.html)
  var iosWebview = isIOS && !/Safari\//.test(ua);      // in-app browsers on iOS (WKWebView) drop the Safari token
  var inApp = iosWebview || /FBAN|FBAV|Instagram|Line\/|WhatsApp|Telegram|MicroMessenger|Snapchat|GSA\/|LinkedInApp|Twitter|Pinterest|Gmail|Messenger|KAKAOTALK|; wv\)/i.test(ua) || /^android-app:/.test(d.referrer || '');
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
  var st = { deferred: null, fallback: isApp, installed: isApp ? false : store(KEY_INSTALLED) === '1', open: false };   // in the app the manual steps are available at once

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
  function visible() { return secure && !standalone() && !st.installed; }
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

  /* ---------- instructions sheet (plain element, not <dialog>: <dialog> is missing or buggy on older iPhones/iPads) ---------- */
  var SHARE = '<svg class="nl-ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Share"><path d="M12 15V3M8 7l4-4 4 4M6 11H5a1 1 0 00-1 1v8a1 1 0 001 1h14a1 1 0 001-1v-8a1 1 0 00-1-1h-1"/></svg>';
  var PLUS = '<svg class="nl-ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Plus"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/></svg>';
  var DOTS = '<b class="nl-k" aria-label="three dots menu">⋮</b>';
  var NAME = 'NET Law 058';

  var GUIDES = {
    ios: ['iPhone and iPad (Safari)', [
      'Open this page in <b>Safari</b>. Adding to the Home Screen does not work from inside WhatsApp, Instagram, Gmail or other apps’ built-in browsers.',
      'Tap the <b>Share</b> button ' + SHARE + '. On iPhone it is in the bottom bar (on newer iOS it can be under the <b>⋯</b> button); on iPad it is at the top.',
      'Scroll the sheet and tap <b>Add to Home Screen</b> ' + PLUS + '. If you cannot see it, tap <b>View More</b> first.',
      'Keep <b>Open as Web App</b> switched on if it is shown, then tap <b>Add</b>. Open ' + NAME + ' from your Home Screen.'],
      'Using Chrome, Edge or Firefox on iPhone? Tap its <b>Share</b> or <b>menu</b> button and choose <b>Add to Home Screen</b>. If that option is missing, open this page in Safari instead.'],
    android: ['Android (Chrome, Edge, Brave)', [
      'Tap the browser menu ' + DOTS + ' (top right).',
      'Tap <b>Install app</b> (or <b>Add to Home screen</b>, then <b>Install</b>).',
      'Confirm. ' + NAME + ' now opens from your home screen or app drawer like any other app.'],
      'Opened this from WhatsApp or another app? Tap ' + DOTS + ' and choose <b>Open in Chrome</b> first, then install.'],
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

  function copyLink(btn) {
    var url = BASE, done = function (ok) { btn.textContent = ok ? 'Link copied. Paste it in ' + (isIOS ? 'Safari' : 'Chrome') : 'Long-press the address bar to copy'; };
    try {
      if (nav.clipboard && nav.clipboard.writeText) { nav.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); }); return; }
    } catch (e) {}
    try {
      var t = d.createElement('textarea'); t.value = url; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
      d.body.appendChild(t); t.select(); t.setSelectionRange(0, url.length); var ok = d.execCommand('copy'); d.body.removeChild(t); done(ok);
    } catch (e) { done(false); }
  }

  var dlg = null, lastFocus = null;
  function buildDialog() {
    var key = detect();
    var order = ['ios', 'android', 'samsung', 'firefoxAndroid', 'desktop', 'mac', 'firefox'];
    var others = order.filter(function (k) { return k !== key; }).map(function (k) { return guideHTML(k, false); }).join('');
    var warn = '';
    if (inApp) warn = '<div class="nl-warn"><p>You seem to be inside another app’s built-in browser (WhatsApp, Instagram, Gmail, etc.). Installing only works from ' + (isIOS ? 'Safari' : 'Chrome') + '.</p><button type="button" class="nl-btn nl-copy" data-nl-copy>Copy link to open in ' + (isIOS ? 'Safari' : 'Chrome') + '</button></div>';
    var el = d.createElement('div');
    el.className = 'nl-sheet'; el.hidden = true;
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'nl-dlg-t');
    el.innerHTML =
      '<div class="nl-bk" data-nl-close></div>' +
      '<div class="nl-pn nl-dlg" tabindex="-1"><div class="nl-dlg-in">' +
        '<div class="nl-dlg-h"><img src="' + BASE + 'icons/icon-192.png" width="44" height="44" alt=""><div><h2 id="nl-dlg-t">' + (key === 'ios' ? 'Add ' + NAME + ' to your Home Screen' : 'Install ' + NAME) + '</h2>' +
        '<p>Opens full screen like an app, launches from your home screen, and keeps your practice and mock-test progress on this device.</p></div></div>' +
        warn + '<div class="nl-dlg-b"><p class="nl-lead">How to install on your device</p>' + guideHTML(key, true) +
        '<details class="nl-more"><summary>Instructions for other browsers and devices</summary>' + others + '</details>' +
        '<p class="nl-note">Already installed? Open it from your home screen, app list, taskbar or Dock. Installing is free and can be undone any time by removing it like any other app.</p></div>' +
        '<div class="nl-dlg-f"><button type="button" class="nl-btn nl-btn-p" data-nl-close>Got it</button></div>' +
      '</div></div>';
    el.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-nl-close],[data-nl-copy]') : null;
      if (!t) return;
      if (t.hasAttribute('data-nl-copy')) { copyLink(t); return; }
      closeDialog();
    });
    el.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDialog(); });
    d.body.appendChild(el);
    return el;
  }
  function openDialog() {
    lastFocus = d.activeElement;
    loadCss().then(function () {
      if (!dlg) dlg = buildDialog();
      st.open = true; dlg.hidden = false;
      d.documentElement.classList.add('nl-lock');
      var pn = dlg.querySelector('.nl-pn'); if (pn && pn.focus) try { pn.focus({ preventScroll: true }); } catch (e) {}
    });
  }
  function closeDialog() {
    if (!dlg || dlg.hidden) return;
    dlg.hidden = true; st.open = false; d.documentElement.classList.remove('nl-lock');
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }

  /* ---------- public API for the phone app ---------- */
  w.NLPWA = {
    available: function () { return mode() !== 'none'; },
    visible: visible,                            // true whenever the app is not installed / not running as an app: drives the always-on install strip
    platform: function () { return detect(); },
    inApp: function () { return inApp; },
    dismissed: dismissed,
    dismiss: dismiss,
    install: install,
    showInstructions: openDialog
  };

  /* ---------- boot ---------- */
  function boot() { ensureNavItem(); refresh(); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})();
