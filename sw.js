/* NET Law-Verse service worker (v20): ONLINE ONLY.
 *
 * The site is installable as an app, but nothing is stored for offline use.
 *   - Every request goes straight to the network, exactly as on a site with no service worker.
 *   - The only thing kept on the phone is offline.html (plus its two style files), shown
 *     when someone opens a page without internet.
 *   - On activate, every cache from older versions (pages, fonts, question banks) is deleted,
 *     so phones that already installed the app are cleaned up on their next visit.
 *
 * Bump VERSION to force a clean-up again.
 */
'use strict';

const VERSION = 'v20';
const PREFIX = 'nl058-';
const SHELL = PREFIX + 'offline-' + VERSION;
const BASE = new URL('./', self.registration.scope).href;
const abs = (p) => new URL(p, BASE).href;

/* The offline notice and the styles it uses. Nothing else is ever saved. */
const OFFLINE_FILES = ['offline.html', 'styles.css', 'theme.css', 'icons/icon-192.png', 'icons/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await Promise.allSettled(OFFLINE_FILES.map(async (p) => {
      const res = await fetch(new Request(abs(p), { cache: 'reload' }));
      if (res.ok) await cache.put(abs(p), res);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== SHELL) await caches.delete(k);   // drop all old copies of the site
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(BASE)) return;   // other sites: browser default

  /* Pages: network only. No internet => the offline notice. */
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(async () =>
      (await (await caches.open(SHELL)).match(abs('offline.html'))) || Response.error()));
    return;
  }

  /* Only the offline notice's own styles/icons may come from the cache, and only when the network fails. */
  if (OFFLINE_FILES.some((p) => url.href === abs(p))) {
    event.respondWith(fetch(req).catch(async () =>
      (await (await caches.open(SHELL)).match(req, { ignoreSearch: true })) || Response.error()));
  }
  /* everything else (pages' scripts, questions, mock tests, notes): browser default = needs internet */
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
