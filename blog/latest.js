/* Optional: shows the 3 newest blog posts anywhere. Add  <div data-nl-latest></div>  and  <script src="/blog/latest.js" defer></script>  to a page. */
(function () {
  var host = document.querySelector("[data-nl-latest]"); if (!host) return;
  fetch("/blog/posts.json").then(function (r) { return r.json(); }).then(function (l) {
    host.innerHTML = '<h2 style="margin:0 0 12px">From the blog</h2><div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">' +
      l.slice(0, 3).map(function (p) {
        return '<a href="/blog/' + p.slug + '.html" style="display:block;padding:16px;border:1px solid var(--line,#d4d9e8);border-radius:14px;background:var(--surface,#fff);color:inherit;text-decoration:none"><small style="font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--ac,#2d4aa9)">' + p.category + '</small><b style="display:block;margin:6px 0 4px">' + p.title + '</b><span style="font-size:.85em;opacity:.8">' + p.mins + ' min read</span></a>';
      }).join("") + '</div><p style="margin:12px 0 0"><a href="/blog/">All articles &rarr;</a></p>';
  }).catch(function () {});
})();
