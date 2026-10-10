/* NET Law 058 service worker.
 *
 * Goals: installable + works offline, WITHOUT ever getting in the way of site updates.
 *   - Every request goes to the NETWORK FIRST (identical to a site with no service worker).
 *     A copy is saved as a side effect; it is only used when the network fails or takes > 5 s.
 *   - No request is ever answered from cache while the network is healthy, so a new deploy
 *     (new questions, packs.json, mock tests, HTML, JS) is picked up on the very next load.
 *   - Only plain GET requests for this site (plus Google Fonts) are touched. Everything else
 *     (POST, ranges, other origins) passes straight through. Quiz progress lives in the page's
 *     localStorage, which a service worker never reads or writes.
 *
 * All URLs are resolved against the worker's own scope, so this works unchanged under
 * https://<user>.github.io/net-law-058/ and under a custom domain at "/".
 *
 * To force clients to drop old caches after a big change, bump VERSION below.
 */
'use strict';

const VERSION = 'v1';
const PREFIX = 'nl058-';
const PAGES = PREFIX + 'pages-' + VERSION;   // site files
const FONTS = PREFIX + 'fonts-v1';           // Google Fonts (css + woff2)
const BASE = new URL('./', self.registration.scope).href;
const abs = (p) => new URL(p, BASE).href;
const NETWORK_TIMEOUT_MS = 5000;             // slow network + cached copy => use the copy
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

/* App shell: pages, styles, scripts, icons. Pre-cached at install (best effort; see below). */
const CORE = [
  './', 'index.html', 'app.html', 'offline.html',
  'about.html', 'faq.html', 'cutoff.html', 'ugc-net-paper-1.html',
  'ugc-net-law-preparation-plan.html', 'ugc-net-law-6-month-preparation-plan.html',
  'ugc-net-law-3-month-preparation-plan.html', 'ugc-net-law-1-month-preparation-plan.html',
  'ugc-net-law-2-week-preparation-plan.html', 'unit-2-constitutional-administrative-law.html',
  'manifest.json', 'pwa.js', 'pwa.css',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon.svg', 'icons/apple-touch-icon.png', 'icons/favicon-32.png',
  'welcome-graduates.jpg',
  'styles.css', 'syllabus-pro.css', 'qbank.css', 'disclaimer.css', 'theme.css', 'mock-tests.css',
  'hero-carousel.css', 'section-nav.css', 'plan.css', 'nav-resources.css', 'about.css', 'faq.css',
  'cutoff.css', 'm-app.css', 'm-themes.css',
  'script.js', 'syllabus-data.js', 'syllabus-pro.js', 'bank-loader.js', 'nl-nav.js', 'nl-quiz.js',
  'qbank.js', 'modules.js', 'theme.js', 'disclaimer.js', 'mock-home.js', 'accessibility.js',
  'nl-countdown.js', 'hero-carousel.js', 'carousel-counts.js', 'daily-quiz.js', 'ese.js',
  'nl-test.js', 'section-nav.js', 'plan.js', 'nav-resources.js', 'about.js', 'faq.js',
  'cutoff.js', 'cutoff-data.js', 'mock-test-engine.js', 'm-app.js',
];
/* If any of these cannot be fetched the install fails and is retried later. */
const REQUIRED = ['index.html', 'app.html', 'offline.html'];

const stripSearch = (url) => { const u = new URL(url); u.search = ''; u.hash = ''; return u.href; };

const cacheable = (res) =>
  res && res.status === 200 && res.type === 'basic' &&
  !/no-store/i.test(res.headers.get('Cache-Control') || '');

/* ---------- install / activate ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(PAGES);
    const results = await Promise.allSettled(CORE.map(async (p) => {
      const res = await fetch(new Request(abs(p), { cache: 'reload' }));   // bypass HTTP cache
      if (!res.ok) throw new Error(p + ' -> ' + res.status);
      await cache.put(abs(p), res);
    }));
    const failed = CORE.filter((_, i) => results[i].status === 'rejected');
    if (failed.some((p) => REQUIRED.includes(p))) throw new Error('Shell unavailable: ' + failed.join(', '));
    await self.skipWaiting();   // safe: the worker never alters content, it only adds an offline fallback
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = [PAGES, FONTS];
    for (const k of await caches.keys()) if (k.startsWith(PREFIX) && !keep.includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

/* ---------- fetch ---------- */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  if (req.cache === 'only-if-cached' && req.mode !== 'same-origin') return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (!url.href.startsWith(BASE)) return;              // outside our scope
    if (url.pathname.endsWith('/sw.js')) return;         // never cache the worker itself
    event.respondWith(req.mode === 'navigate' ? navigate(event) : asset(event));
  } else if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(font(event));
  }
  /* anything else: browser default */
});

/* Network first; cached copy only if the network fails, errors (5xx) or is slower than the timeout. */
async function networkFirst(event, key, ignoreSearch) {
  const cache = await caches.open(PAGES);
  const cached = await cache.match(key, { ignoreSearch });

  const net = fetch(event.request).then((res) => {
    if (cacheable(res)) event.waitUntil(cache.put(key, res.clone()).catch(() => {}));
    return res;
  });
  if (!cached) return net;                               // nothing to fall back on: plain network behaviour

  event.waitUntil(net.catch(() => {}));                  // let a slow request finish and refresh the copy
  const timer = new Promise((resolve) => setTimeout(resolve, NETWORK_TIMEOUT_MS, null));
  try {
    const res = await Promise.race([net, timer]);
    return !res || res.status >= 500 ? cached : res;
  } catch (_) {
    return cached;
  }
}

async function navigate(event) {
  const key = stripSearch(event.request.url);            // ?desktop=1, ?source=pwa etc. share one entry
  try {
    return await networkFirst(event, key, true);
  } catch (_) {
    const cache = await caches.open(PAGES);
    return (key === BASE && (await cache.match(abs('index.html')))) ||
           (await cache.match(abs('offline.html'))) ||
           Response.error();
  }
}

function asset(event) {
  return networkFirst(event, event.request.url, false);  // failure with no copy => normal network error
}

/* Fonts: stale-while-revalidate (they are immutable, so this is safe). */
async function font(event) {
  const cache = await caches.open(FONTS);
  const cached = await cache.match(event.request);
  const net = fetch(event.request).then((res) => {
    if (res && (res.ok || res.type === 'opaque')) event.waitUntil(cache.put(event.request, res.clone()).catch(() => {}));
    return res;
  });
  if (cached) { event.waitUntil(net.catch(() => {})); return cached; }
  return net;
}

/* ---------- messages from the page ---------- */
let warming = null;
self.addEventListener('message', (event) => {
  const d = event.data || {};
  if (d.type === 'SKIP_WAITING') self.skipWaiting();
  if (d.type === 'WARM') {
    if (!warming) warming = warm().finally(() => { warming = null; });
    event.waitUntil(warming);
  }
});

/* Background download of the question bank and mock tests so quizzes work offline.
   The file list is discovered from packs.json and by probing mock-test-1, 2, 3, ... so new
   packs / mock tests need no change here. */
async function warm() {
  const cache = await caches.open(PAGES);
  let ok = 0, failed = 0;
  const grab = async (p) => {
    try {
      const res = await fetch(abs(p));
      if (!cacheable(res)) return false;
      await cache.put(abs(p), res); ok++; return true;
    } catch (_) { failed++; return false; }
  };
  const files = ['questions.json', 'packs.json', 'exam-dates.json'];
  try {
    const res = await fetch(abs('packs.json'));
    if (res.ok) {
      const packs = await res.clone().json();
      for (const k of packs) if (k && typeof k.file === 'string') files.push(k.file);
      if (cacheable(res)) { await cache.put(abs('packs.json'), res); }
    }
  } catch (_) { /* packs.json optional */ }

  for (let i = 0; i < files.length; i += 4) await Promise.all(files.slice(i, i + 4).map(grab));

  for (let n = 1; n <= 80; n++) {                        // mock-test-N.html + mock-test-data-N.js
    const page = await grab('mock-test-' + n + '.html');
    if (!page) break;                                    // first missing number ends the series
    await grab('mock-test-data-' + n + '.js');
  }
  const all = await self.clients.matchAll({ includeUncontrolled: true });
  all.forEach((c) => c.postMessage({ type: 'WARM_DONE', ok, failed }));
}
