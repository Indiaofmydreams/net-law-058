/* aibe-embed.js: used when the AIBE section is shown inside the phone/tablet app (?embed=1).
   Hides the website header/footer/theme picker (the app has its own) and keeps navigation between AIBE pages
   inside the frame by carrying ?embed=1 along. Does nothing on the website itself. */
(function () {
  if (!/[?&]embed=1/.test(location.search)) return;
  document.documentElement.classList.add('emb');
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    var h = a.getAttribute('href') || '';
    if (/^#|^mailto:|^tel:|^javascript:/.test(h) || a.target === '_blank') return;
    if (/^https?:/i.test(h) && h.indexOf(location.origin) !== 0) { a.target = '_blank'; a.rel = 'noopener'; return; }
    var u; try { u = new URL(h, location.href); } catch (x) { return; }
    if (u.origin === location.origin && u.pathname.indexOf('/aibe/') === 0 || (u.origin === location.origin && /\/aibe\/?$/.test(u.pathname))) {
      if (!/[?&]embed=1/.test(u.search)) u.search += (u.search ? '&' : '?') + 'embed=1';
      e.preventDefault(); location.href = u.href; return;
    }
    a.target = '_top';
  }, true);
})();
