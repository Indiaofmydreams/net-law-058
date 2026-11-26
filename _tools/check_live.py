#!/usr/bin/env python3
"""Checks that every blog post (and key section pages) is actually live. Run AFTER deploying, from the project root:
    python3 _tools/check_live.py                      # tests https://netlawverse.in
    python3 _tools/check_live.py --sitemap            # tests every URL in sitemap.xml (slower)
    python3 _tools/check_live.py --base http://localhost:8000
Prints every URL that does not return 200 and exits with code 1 if any fail. Standard library only."""
import argparse, json, os, re, sys, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor
ap = argparse.ArgumentParser(); ap.add_argument("--base", default="https://netlawverse.in"); ap.add_argument("--sitemap", action="store_true")
a = ap.parse_args(); base = a.base.rstrip("/")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
paths = ["/", "/blog/", "/blog/feed.xml", "/cuet-pg/", "/cuet-pg/syllabus.html", "/cuet-pg/universities.html", "/ailet/", "/aibe/", "/clat-pg/", "/net.html"]
paths += [f"/blog/{p['slug']}.html" for p in json.load(open("blog/posts.json", encoding="utf-8"))]
if a.sitemap:
    paths += [re.sub(r"^https?://[^/]+", "", u) for u in re.findall(r"<loc>([^<]+)</loc>", open("sitemap.xml", encoding="utf-8").read())]
paths = list(dict.fromkeys(paths))
def hit(p):
    url = f"{base}{p}{'&' if '?' in p else '?'}nocache={int(time.time())}"   # defeats a cached 404
    for _ in range(2):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "netlawverse-check"}), timeout=20) as r: return p, r.status
        except urllib.error.HTTPError as e: code = e.code
        except Exception as e: code = type(e).__name__
        time.sleep(1)
    return p, code
with ThreadPoolExecutor(8) as ex: res = list(ex.map(hit, paths))
bad = [(p, c) for p, c in res if c != 200]
print(f"checked {len(res)} URLs on {base}: {len(res) - len(bad)} OK, {len(bad)} not OK")
for p, c in bad: print("  NOT OK", c, p)
if bad: print("\nA 404 on /blog/<name>.html means that file is not on the live site: check it is inside the blog folder of the branch your site deploys from, then redeploy.")
sys.exit(1 if bad else 0)
