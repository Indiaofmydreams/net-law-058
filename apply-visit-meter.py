#!/usr/bin/env python3
"""Adds the NET Law-Verse live visit meter to a copy of your site, touching as little as possible.

Usage:
    python3 apply-visit-meter.py /path/to/your/site            # make the changes
    python3 apply-visit-meter.py /path/to/your/site --dry-run  # only report what would change
    python3 apply-visit-meter.py /path/to/your/site --also faq.html about.html   # extra desktop pages

What it does (nothing else is touched, your other edits stay as they are):
  1. Copies nl-visit-meter.js into the site root.
  2. Adds   <script src="/nl-visit-meter.js" defer></script>   before </body> in
        index.html, net.html, clat-pg/index.html, app.html   (and any pages named with --also).
  3. In m-app.js, adds   <div id="nl-visit-meter"></div>   to the end of the "stay" block, which is
     where the phone app shows "Stay connected".
It is safe to run twice: anything already added is left alone. Line endings and encoding are preserved.
"""
import os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
TAG = '<script src="/nl-visit-meter.js" defer></script>'
PLACEHOLDER = '<div id="nl-visit-meter"></div>'
PAGES = ["index.html", "net.html", "clat-pg/index.html", "app.html"]


def read(path):
    with open(path, "rb") as f:
        raw = f.read()
    return raw.decode("utf-8"), ("\r\n" if b"\r\n" in raw else "\n")


def write(path, text):
    with open(path, "wb") as f:
        f.write(text.encode("utf-8"))


def add_script_tag(path, dry):
    if not os.path.isfile(path):
        return "MISSING (file not found)"
    s, nl = read(path)
    if "nl-visit-meter" in s:
        return "already has the meter"
    i = s.lower().rfind("</body>")
    if i < 0:
        return "SKIPPED (no </body> found)"
    if not dry:
        write(path, s[:i] + TAG + nl + s[i:])
    return "added script tag"


def add_placeholder(path, dry):
    if not os.path.isfile(path):
        return "MISSING (file not found)"
    s, _ = read(path)
    if PLACEHOLDER in s:
        return "already has the placeholder"
    m = re.search(r"^const stay=\(\)=>`.*`;[ \t]*$", s, re.M)
    if not m:
        return ("NOT FOUND: could not locate the line starting 'const stay='. Add " + PLACEHOLDER +
                " just before the closing backtick of that line by hand (see README).")
    line = m.group(0)
    k = line.rstrip().rfind("`;")
    new = line[:k] + PLACEHOLDER + line[k:]
    if not dry:
        write(path, s[:m.start()] + new + s[m.end():])
    return "added placeholder to the stay block"


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry = "--dry-run" in sys.argv
    extra = []
    if "--also" in sys.argv:
        extra = sys.argv[sys.argv.index("--also") + 1:]
        extra = [e for e in extra if not e.startswith("--")]
        args = [a for a in args if a not in extra]
    if not args:
        print(__doc__); sys.exit(1)
    root = args[0]
    if not os.path.isfile(os.path.join(root, "index.html")):
        print("This does not look like your site folder (no index.html found in %s)." % root); sys.exit(1)
    src = os.path.join(HERE, "nl-visit-meter.js")
    if not os.path.isfile(src):
        print("nl-visit-meter.js must sit next to this script."); sys.exit(1)

    print(("DRY RUN: nothing will be changed\n" if dry else "") + "Site: " + os.path.abspath(root))
    dst = os.path.join(root, "nl-visit-meter.js")
    same = os.path.isfile(dst) and open(dst, "rb").read() == open(src, "rb").read()
    if not dry and not same:
        shutil.copyfile(src, dst)
    print("  %-26s %s" % ("nl-visit-meter.js", "already up to date" if same else ("will be copied" if dry else "copied")))
    problems = 0
    for p in PAGES + extra:
        r = add_script_tag(os.path.join(root, p), dry)
        problems += r.startswith(("MISSING", "SKIPPED"))
        print("  %-26s %s" % (p, r))
    r = add_placeholder(os.path.join(root, "m-app.js"), dry)
    problems += r.startswith(("MISSING", "NOT FOUND"))
    print("  %-26s %s" % ("m-app.js", r))
    print("\n" + ("Everything is in place." if not problems else "%d item(s) need a manual step, see above and the README." % problems))


if __name__ == "__main__":
    main()
