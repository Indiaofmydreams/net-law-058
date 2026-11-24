#!/usr/bin/env python3
"""Rebuilds the whole blog (every post page, blog/index.html, feed.xml, posts.json, sitemap-blog.xml, sitemap.xml)
from blog/_src, and keeps hand-made pages that have no _src file listed (their title, description, date, category and
reading time are read from the page itself). Use this instead of build_blog.py when such pages exist.
Run from the project root:  python3 _tools/rebuild_all.py   then   python3 _tools/check_site.py"""
import html, json, os, re, runpy, glob, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
ns = runpy.run_path("_tools/build_blog.py", run_name="lib")
posts = ns["load_posts"](); have = {p["slug"] for p in posts}; OUT = ns["OUT"]; stubs = []
for f in sorted(glob.glob("blog/*.html")):
    slug = os.path.basename(f)[:-5]
    if slug == "index" or slug in have: continue
    t = open(f, encoding="utf-8").read(); g = lambda pat: (re.search(pat, t, re.S) or [None, ""])[1]
    title = html.unescape(g(r"<title>(.*?)</title>")); title = re.sub(r"\s*\|\s*NET Law-Verse\s*$", "", title)
    date = g(r'<time datetime="(\d{4}-\d{2}-\d{2})"') or "2026-01-01"
    cat = html.unescape(g(r'class="bl-cat[^"]*"[^>]*>([^<]+)<')) or "Legal Current Affairs"
    stubs.append(dict(slug=slug, title=title, description=html.unescape(g(r'name="description" content="(.*?)"')), date=date, updated=date,
                      category=cat, mins=int(g(r"(\d+) min read") or 3), tags=[x.strip() for x in html.unescape(g(r'name="keywords" content="(.*?)"')).split(',') if x.strip()][:8], related=[], sources=[], faq=[],
                      body="<h2>x</h2><p>x</p><h2>y</h2><p>y</p><h2>z</h2><p>z</p>"))
    print("kept hand-made page (no _src):", slug)
old = json.load(open("blog/posts.json", encoding="utf-8")) if os.path.exists("blog/posts.json") else []
listed = have | {s["slug"] for s in stubs}
for o in old:  # keep anything already listed in posts.json even if its source or page is not in this copy of the project
    if o["slug"] not in listed:
        stubs.append(dict(o, tags=[], related=[], sources=[], faq=[], body="<h2>x</h2><p>x</p><h2>y</h2><p>y</p><h2>z</h2><p>z</p>")); print("kept from posts.json:", o["slug"])
allp = sorted(posts + stubs, key=lambda p: (p["updated"], p["date"]), reverse=True)
for p in posts: (OUT / f"{p['slug']}.html").write_text(ns["build_post"](p, allp), encoding="utf-8")
(OUT / "index.html").write_text(ns["build_index"](allp), encoding="utf-8")
(OUT / "feed.xml").write_text(ns["build_feed"](allp), encoding="utf-8")
(OUT / "posts.json").write_text(json.dumps([{k: p[k] for k in ("slug", "title", "description", "date", "updated", "category", "mins")} for p in allp], ensure_ascii=False, indent=1), encoding="utf-8")
ns["update_sitemap"](allp)
print(f"rebuilt {len(posts)} posts from _src, listed {len(allp)} in total")
