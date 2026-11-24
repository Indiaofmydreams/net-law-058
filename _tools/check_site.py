#!/usr/bin/env python3
"""Pre-commit check for NET Law-Verse. Run from the project root:  python3 _tools/check_site.py
Exits with code 1 if anything is missing. Standard library only."""
import json, os, re, sys, glob
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
UNLISTED_OK = {"ai-fake-citations-supreme-court-nclt-pooja-ramesh-singh-2026"}  # pages with no _src (listed by hand)
err, warn = [], []
rd = lambda p: open(p, encoding="utf-8").read()
src = {os.path.basename(f)[:-5] for f in glob.glob("blog/_src/*.html") if not os.path.basename(f).startswith("_")}
pages = {os.path.basename(f)[:-5] for f in glob.glob("blog/*.html")} - {"index"}
posts = json.load(open("blog/posts.json", encoding="utf-8")); pj = [p["slug"] for p in posts]
expected = src | UNLISTED_OK
for s in sorted(src - pages): err.append(f"no built page for source: blog/{s}.html (run _tools/build_blog.py)")
for s in sorted(pages - src - UNLISTED_OK): warn.append(f"blog page without source (keep it listed by running _tools/rebuild_all.py, not build_blog.py): {s}")
for s in sorted(expected - set(pj)): err.append(f"missing from blog/posts.json: {s}")
for s in sorted(set(pj) - expected): err.append(f"in posts.json but no source or page: {s}")
if len(pj) != len(set(pj)): err.append("duplicate slugs in posts.json")
idx, feed, smb, sm = rd("blog/index.html"), rd("blog/feed.xml"), rd("sitemap-blog.xml"), rd("sitemap.xml")
for s in sorted(expected):
    if f"/blog/{s}.html" not in idx and f"{s}.html" not in idx: err.append(f"not linked in blog/index.html: {s}")
    if f"/blog/{s}.html" not in smb: err.append(f"not in sitemap-blog.xml: {s}")
    if f"/blog/{s}.html" not in sm: err.append(f"not in sitemap.xml: {s}")
m = re.search(r"All posts[^<]*<[^>]*>\s*(\d+)", idx) or re.search(r'bl-count[^>]*>(\d+)', idx)
for f in glob.glob("cuet-pg/*.html"):
    u = "/cuet-pg/" + ("" if f.endswith("index.html") else os.path.basename(f))
    if u not in sm: err.append(f"not in sitemap.xml: {u}")
newest = [p["slug"] for p in sorted(posts, key=lambda p: (p["updated"], p["date"]), reverse=True)][:30]  # feed keeps the 30 newest
for s in newest:
    if f"/blog/{s}.html" not in feed: err.append(f"not in blog/feed.xml (30 newest): {s}")
# internal links / assets
bad = set()
check = glob.glob("blog/*.html") + glob.glob("cuet-pg/*.html") + ["index.html", "net.html"]
for f in check:
    t = rd(f)
    for h in re.findall(r'(?:href|src)="([^"#?]+)', t):
        if h.startswith(("http", "mailto:", "tel:", "data:", "//", "javascript:")): continue
        tgt = os.path.join(".", h.lstrip("/")) if h.startswith("/") else os.path.normpath(os.path.join(os.path.dirname(f), h))
        if os.path.isdir(tgt): tgt = os.path.join(tgt, "index.html")
        if not os.path.exists(tgt): bad.add((f, h))
for f, h in sorted(bad): err.append(f"broken link in {f}: {h}")
# landing page + popup
home = rd("index.html")
for need in ("nl-welcome-promo.js", "nl-follow-float.js", "nl-lead-float.js", "/cuet-pg/", "/ailet/", "/aibe/", "/clat-pg/"):
    if need not in home: err.append(f"index.html is missing: {need}")
for need in ("nl-welcome-promo.js", "nl-follow-float.js", "nl-lead-float.js", "disclaimer.js", "instagram-qr.png"):
    if not os.path.exists(need): err.append(f"missing file: {need}")
print(f"sources: {len(src)}  built pages: {len(pages)}  posts.json: {len(pj)}")
for w in warn: print("WARN ", w)
for e in err: print("ERROR", e)
print("OK: nothing missing" if not err else f"{len(err)} problem(s) found")
sys.exit(1 if err else 0)
