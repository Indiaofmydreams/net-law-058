/* nl-install-bar.js: a slim "Install the app" bar for content pages (the blog), without editing any page.
   It is loaded by blog/blog.js, which every blog page already includes. It adds a small bar at the bottom of the screen and
   loads pwa.js, which decides whether installing is possible and shows or hides the bar.

   The bar is NOT shown:
     - inside the app (the app's own article reader frames the page), or on any ?embed=1 page
     - when the site already runs as an installed app, or when installing is not possible on this device
     - for 14 days after someone taps "Not now" (same memory as the landing page strip)
     - during the first few seconds, so a reader is never greeted by a banner; it appears after ~8 s or after some scrolling
   Nothing is sent anywhere. */
(function () {
  "use strict";
  try { if (window.top !== window.self) return; } catch (e) { return; }
  if (/[?&]embed=1/.test(location.search) || document.getElementById('nl-ib')) return;
  try {
    if (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true) return;
  } catch (e) { }

  var css = document.createElement('style');
  css.textContent =
    '#nl-ib{position:fixed;left:50%;bottom:calc(10px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:60;box-sizing:border-box;width:min(560px,calc(100vw - 20px));display:flex;align-items:center;gap:10px;padding:9px 10px 9px 12px;border-radius:20px;background:#1b1e4a;color:#eeecff;border:2px solid #b7b1ff;box-shadow:0 14px 30px -12px rgba(5,6,30,.7);font:700 .875rem/1.25 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '#nl-ib[hidden],#nl-ib.nib-wait{display:none}' +
    '#nl-ib img{flex:none;width:36px;height:36px;border-radius:10px}' +
    '#nl-ib .nib-t{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}#nl-ib .nib-t b{font-size:.9rem;font-weight:800}#nl-ib .nib-t span{font-size:.75rem;font-weight:600;color:#c3bdff}' +
    '#nl-ib button{font:inherit;font-weight:800;border-radius:999px;min-height:40px;cursor:pointer;border:0}' +
    '#nl-ib [data-nl-install]{padding:0 16px;background:#ff8fb6;color:#1b1850}' +
    '#nl-ib [data-nl-dismiss]{padding:0 10px;background:transparent;color:#c3bdff}' +
    '#nl-ib .nib-t b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '@media(max-width:520px){#nl-ib .nib-t span{display:none}#nl-ib{padding:8px 8px 8px 10px;gap:8px}#nl-ib [data-nl-install]{padding:0 14px}#nl-ib [data-nl-dismiss]{padding:0 6px;font-size:.8125rem}}' +
    '@media(prefers-reduced-motion:no-preference){#nl-ib{animation:nibin .35s ease-out}@keyframes nibin{from{opacity:0;transform:translate(-50%,16px)}}}' +
    'body.nib-pad{padding-bottom:84px!important}';
  document.head.appendChild(css);

  var bar = document.createElement('section');
  bar.id = 'nl-ib'; bar.className = 'nib-wait';
  bar.setAttribute('data-nl-show', ''); bar.setAttribute('data-nl-strip', ''); bar.hidden = true;
  bar.setAttribute('aria-label', 'Install the app');
  bar.innerHTML = '<img src="/icons/icon-192.png" width="36" height="36" alt="">' +
    '<div class="nib-t"><b>Get the app</b><span>NET Law-Verse: free, opens full screen from your home screen.</span></div>' +
    '<button type="button" data-nl-install>Install</button><button type="button" data-nl-dismiss aria-label="Not now">Not now</button>';
  document.body.appendChild(bar);

  /* keep the end of the article clear of the bar while it is on screen */
  function pad() { document.body.classList.toggle('nib-pad', !bar.hidden && !bar.classList.contains('nib-wait')); }
  new MutationObserver(pad).observe(bar, { attributes: true, attributeFilter: ['hidden', 'class'] });

  /* appear after a few seconds of reading, or once the reader has scrolled */
  var done = false;
  function reveal() { if (done) return; done = true; bar.classList.remove('nib-wait'); removeEventListener('scroll', onScroll); }
  function onScroll() { if (scrollY > 400) reveal(); }
  addEventListener('scroll', onScroll, { passive: true });
  setTimeout(reveal, 8000);

  var s = document.createElement('script'); s.src = '/pwa.js'; s.defer = true; document.body.appendChild(s);
})();
