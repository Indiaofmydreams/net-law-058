/* clat-embed.js: used when a CLAT PG mock test is shown inside the phone/tablet app (?embed=1).
   It hides the website's own header, footer and theme picker (the app already has its own), and sends the
   "All mock tests" and "next test" buttons to the matching app screens instead of the website. Does nothing on the website itself. */
(function () {
  if (!/[?&]embed=1/.test(location.search)) return;
  document.documentElement.classList.add('emb');
  var to = function (h) { try { parent.location.hash = h; } catch (e) { location.href = '/app.html#' + h.slice(1); } };
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    var h = a.getAttribute('href') || '', m;
    if (/(^|\/)mock-tests\.html/.test(h)) { e.preventDefault(); to('#/clat/mocks'); return; }
    if ((m = /(^|\/)mock-test-(\d+)\.html/.exec(h))) { e.preventDefault(); to('#/clat/mock/' + m[2]); return; }
    if (/^#|^mailto:|^tel:|^javascript:/.test(h) || a.target === '_blank') return;
    a.target = '_top';
  }, true);
})();
