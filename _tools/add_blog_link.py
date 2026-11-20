#!/usr/bin/env python3
"""Puts a "Blog" link right after the "FAQ" link in the site-wide menus and footers (after "About" on pages that have no FAQ link).
Run from the site root:  python3 _tools/add_blog_link.py      Safe to re-run: it first removes earlier Blog links it added."""
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
BLOG = '<a href="/blog/">Blog</a>'
faq = re.compile(r'(<a href="faq\.html"[^>]*>FAQ</a>)')
about = re.compile(r'(<a href="about\.html"[^>]*>About</a>)')
n = 0
for f in sorted(root.glob("*.html")):
    s = f.read_text(encoding="utf-8")
    t = s.replace(BLOG, "")
    if faq.search(t):
        t = faq.sub(lambda m: m.group(1) + BLOG, t)
    elif about.search(t):
        t = about.sub(lambda m: m.group(1) + BLOG, t)
    if t != s:
        f.write_text(t, encoding="utf-8"); n += 1
print(f"{n} page(s) updated")
