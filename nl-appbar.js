/* nl-appbar.js: a slim "back to the app" bar for the few website pages the phone/tablet app links out to
   (CLAT PG mock tests, past-year questions). Shown only on touch devices and in the installed app, so desktop is unchanged.
   Without it, someone who taps "Mock tests" in the app lands on a plain web page with no way back to the app home. */
(function () {
  try {
    if (window.top !== window.self) return; /* inside the app's mock runner: the app has its own bar */
    var touch = matchMedia('(pointer:coarse)').matches && Math.min(screen.width, screen.height) < 1100;
    var installed = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    if (!touch && !installed) return;
    if (/[?&]desktop=1/.test(location.search) || sessionStorage.getItem('nl-desktop')) return;
  } catch (e) { return; }
  var css = document.createElement('style');
  css.textContent = '.nlab{position:relative;z-index:30;display:flex;align-items:center;gap:6px;height:52px;padding:0 6px;padding-top:env(safe-area-inset-top);box-sizing:content-box;background:#17234a;color:#fff;font:800 .95rem/1.1 Manrope,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}' +
    '.nlab a,.nlab button{display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:14px;background:none;color:#fff;cursor:pointer;padding:0}' +
    '.nlab a:active,.nlab button:active{background:rgba(255,255,255,.16)}.nlab svg{width:22px;height:22px}' +
    '.nlab .nlab-t{flex:1;display:flex;align-items:center;gap:9px;width:auto;height:auto;justify-content:flex-start;color:#fff;text-decoration:none;min-width:0}' +
    '.nlab .nlab-m{position:relative;display:inline-grid;place-items:center;width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,#17234a,#4a86a6);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.3);font-size:.75rem;font-weight:800}' +
    '.nlab .nlab-m::after{content:"";position:absolute;right:-2px;top:-2px;width:9px;height:9px;border-radius:50%;background:#4aa3d9;box-shadow:0 0 0 2px #17234a}' +
    '.nlab b{color:#8fd0f5}';
  document.head.appendChild(css);
  var ic = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; };
  var bar = document.createElement('div');
  bar.className = 'nlab';
  bar.innerHTML = '<button type="button" aria-label="Back">' + ic('<path d="M15 5l-7 7 7 7"/>') + '</button>' +
    '<a class="nlab-t" href="/app.html#/" aria-label="NET Law-Verse app home"><span class="nlab-m">NL</span><span>NET Law<b>-Verse</b></span></a>' +
    '<a href="/app.html#/clat" aria-label="CLAT PG">' + ic('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/>') + '</a>' +
    '<a href="/app.html#/" aria-label="Home">' + ic('<path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z"/>') + '</a>';
  bar.querySelector('button').onclick = function () { if (history.length > 1) history.back(); else location.href = '/app.html#/'; };
  function add() { document.body.insertBefore(bar, document.body.firstChild); }
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
})();
