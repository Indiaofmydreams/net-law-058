# NET Law 058 as an installable app (PWA)

Static HTML/CSS/JS only. No backend, no build step, no framework.

## What was added
| File | Purpose |
|---|---|
| `manifest.json` | App name, short name, `standalone` display, start URL, theme/background colour, icons, shortcuts |
| `sw.js` | Service worker: network-first caching + offline fallback (never blocks site updates) |
| `pwa.js` / `pwa.css` | Registers the worker; "Install App" UI; manual instructions for iOS / other browsers |
| `offline.html` | Shown only when a page was never saved and there is no connection |
| `icons/` | 192 / 512 px icons (any + maskable), Apple touch icon, favicons, SVG source |

Every page also gets `<link rel="manifest">`, icon and Apple meta tags in `<head>` and `<script src="pwa.js" defer>` before `</body>`.
`index.html` has a new install strip under the hero and an "Install App" footer link; `app.html` (phone interface) has an install card on Home and rows in the menu and Profile.

## Paths
All URLs are relative, so the same files work at `https://<user>.github.io/net-law-058/` and on a custom domain at `/`.
Manifest: `start_url "./?source=pwa"`, `scope "./"`. Worker scope = the folder `sw.js` is in.
Note: moving to a custom domain later changes the origin, so users must install again on the new domain (progress in localStorage does not move across origins).

## Caching rules (why updates are safe)
* Every request goes to the network first, exactly as before. The cached copy is used only if the network fails, returns 5xx, or takes > 5 s.
* Only same-site GET requests (and Google Fonts) are touched. localStorage (quiz progress, mock-test attempts, theme) is never read or written by the worker.
* After the first visit the question bank, packs (read from `packs.json`) and all `mock-test-N` files are downloaded once in the background (skipped on Data Saver / 2G), refreshed at most every 3 days. New packs / mock tests need no change in `sw.js`.
* Changing `sw.js` (e.g. bumping `VERSION`) installs the new worker on the next visit and deletes old caches. New pages added later work offline after being opened once; add them to `CORE` in `sw.js` to pre-cache them.
* GitHub Pages sends `Cache-Control: max-age=600`, so normal browser caching can still show a deploy up to ~10 minutes late. That is unchanged from before.

## Where the install option appears
* Desktop header: **Resources → Install App** (the header has no spare room for another top-level item). Tablet/phone hamburger menu: an **Install App** button. Homepage strip ("Not now" hides it for 14 days) and footer link.
* Phone app (`app.html`): card on Home, "Install app" in the ☰ menu and in Profile.
* Shown only when installing is possible: native prompt (`beforeinstallprompt`) where supported, iOS, or after ~2.5 s as manual steps in other browsers. Hidden when already running as an installed app, after `appinstalled`, and on non-HTTPS pages.

## Testing after deploy (https://indiaofmydreams.github.io/net-law-058/)
1. **Chrome desktop**: open the site, DevTools → Application → *Manifest* (no errors, icons shown) and *Service Workers* (activated, scope `/net-law-058/`). Resources → Install App → Install. The app opens in its own window.
2. **Offline**: browse a few pages, wait ~15 s, DevTools → Network → Offline (or turn on airplane mode in the installed app). Reload; open Mock Test 1 and an MCQ unit. Pages and quizzes should work. An unvisited page shows the offline page.
3. **Android Chrome**: Install card / menu → Install. Launch from the home screen: no browser bar.
4. **iPhone/iPad Safari**: Share → Add to Home Screen. The in-app card shows the same steps.
5. **Update test**: change any file, push, reload twice online: new content appears; nothing needs clearing.
6. DevTools → Lighthouse → "Progressive Web App" / Installability should pass.
7. To reset: DevTools → Application → Storage → Clear site data (this also clears saved quiz progress).
