#!/usr/bin/env python3
"""
build_notes.py : generates the static study-notes section of NET Law-Verse.

    python3 _tools/build_notes.py            (run from the site root, or anywhere)

Reads   _notes-data/site.json                         papers and units (for the hub page)
        _notes-data/<paper>/<chapter>/chapter.json     metadata, modules, slugs, related links, MCQ links
        _notes-data/<paper>/<chapter>/content.md       the notes themselves (pandoc "gfm" output of the .docx)
Writes  notes/index.html                              hub
        notes/<paper>/<chapter>/index.html            chapter overview (full contents map)
        notes/<paper>/<chapter>/<topic-slug>.html     one page per topic
        notes/<paper>/<chapter>/rapid-recall.html     one-page revision sheet
        notes/search-index.json                       sub-topic search index
        sitemap.xml                                   (only the block between the notes:begin / notes:end markers)

Needs Python 3.8+ and `pip install markdown`. Output is plain HTML: no build step on the server.
"""
import html
import json
import math
import pathlib
import re
import sys

import markdown

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "_notes-data"
OUT = ROOT / "notes"
BASE = "https://netlawverse.in"
WPM = 200  # reading speed used for "min read"
LEVELS = {"module": "Module"}  # label for the 6 syllabus groups; change here if you prefer "Part" / "Section"

esc = html.escape


def md_inline(text):
    out = markdown.markdown(text.strip(), extensions=["tables"])
    out = re.sub(r"^<p>(.*)</p>$", r"\1", out, flags=re.S)
    return out


def plain(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def trunc(s, n):
    s = s.strip()
    if len(s) <= n:
        return s
    cut = s[: n - 1].rsplit(" ", 1)[0].rstrip(",;:")
    return cut + "…"


def first_sentence(s):
    m = re.match(r"(.+?[.!?])(?:\s+[A-Z(“‘]|$)", s.strip(), re.S)
    return m.group(1) if m else s.strip()


def slug_id(num):  # "2A.3" -> "2a-3"
    return num.lower().replace(".", "-")


# --------------------------------------------------------------------------- parsing
def parse_content(path):
    text = path.read_text(encoding="utf-8")
    topics, rapid = {}, None
    order = []
    parts = re.split(r"\n(?=## )", text)
    for part in parts:
        m = re.match(r"## TOPIC (\w+) [–-] (.+)", part)
        if m:
            tid, title = m.group(1), m.group(2).strip()
            topics[tid] = {"id": tid, "title": title, "subs": parse_subs(part)}
            order.append(tid)
        elif part.startswith("## RAPID-RECALL"):
            rapid = parse_rapid(part)
    return topics, order, rapid


def parse_subs(part):
    subs = []
    for chunk in re.split(r"\n(?=### )", part)[1:]:
        head, _, body = chunk.partition("\n")
        m = re.match(r"### (\w+\.\d+) (.+)", head)
        num, title = m.group(1), m.group(2).strip()
        sub = {"num": num, "id": slug_id(num), "title": title, "concept": "", "tables": [], "mem": [], "trap": ""}
        for block in re.split(r"\n\s*\n", body.strip()):
            b = block.strip()
            if b.startswith("**Concept.**"):
                sub["concept"] = md_inline(b[len("**Concept.**"):])
            elif b.startswith("**Analyse / traps.**"):
                sub["trap"] = md_inline(b[len("**Analyse / traps.**"):])
            elif b.startswith("**Memorise.**") or b.startswith("- "):
                for line in b.splitlines():
                    if line.startswith("- "):
                        sub["mem"].append(md_inline(line[2:]))
            elif b.startswith("|"):
                t = markdown.markdown(b, extensions=["tables"])
                t = t.replace("<table>", '<table class="up-table">').replace("<th>", '<th scope="col">')
                sub["tables"].append(t)
        assert sub["concept"] and sub["trap"], f"{num}: missing Concept or Traps"
        assert sub["mem"] or sub["tables"], f"{num}: no Memorise points or table found"
        sub["words"] = len(plain(sub["concept"] + " ".join(sub["mem"]) + sub["trap"]).split())
        sub["summary"] = trunc(first_sentence(plain(sub["concept"])), 175)
        terms = []
        for t in re.findall(r"<em>(.+?)</em>", sub["concept"]):
            t = plain(t)
            if 2 < len(t) <= 30 and t.lower() not in [x.lower() for x in terms]:
                terms.append(t)
        sub["terms"] = terms[:5]
        subs.append(sub)
    return subs


def parse_rapid(part):
    rows = []
    for line in part.splitlines():
        if line.startswith("|") and not re.match(r"\|[-\s|]+\|$", line):
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) == 2 and cells[0] != "Item":
                rows.append((md_inline(cells[0]), md_inline(cells[1])))
    note = re.search(r"\n\*(End of notes.+?)\*", part, re.S)
    return {"rows": rows, "note": plain(note.group(1)) if note else ""}


def fix_nested(text):
    """Python-Markdown only nests lists indented by 4 spaces; pandoc writes 2 (bullets) or 4 (numbers).
    Re-indent every list line to 4 spaces per nesting level so nested lists stay nested."""
    item = re.compile(r"^( *)(?:[-*+]|\d+[.)])\s")
    out, stack = [], []
    for line in text.split("\n"):
        m = item.match(line)
        if m:
            ind = len(m.group(1))
            while stack and stack[-1] > ind:
                stack.pop()
            if not stack or stack[-1] < ind:
                stack.append(ind)
            out.append("    " * (len(stack) - 1) + line[ind:])
        elif not line.strip():
            out.append(line)
        elif line.startswith(" ") and stack:  # continuation paragraph of a list item
            out.append("    " * len(stack) + line.lstrip())
        else:
            stack = []
            out.append(line)
    return "\n".join(out)


def md_block(text):
    out = markdown.markdown(fix_nested(text.strip()), extensions=["tables", "sane_lists"]).replace("<table>", '<table class="up-table">')
    # wide tables scroll inside their own box on phones instead of stretching the page
    return re.sub(r'(<table class="up-table">.*?</table>)', r'<div class="up-tw nt-table">\1</div>', out, flags=re.S)


def strong_terms(html_, limit=8, maxlen=30):
    out = []
    for t in re.findall(r"<strong>(.+?)</strong>", html_):
        t = plain(t).rstrip(":;,. ")
        if 2 < len(t) <= maxlen and t.lower() not in [x.lower() for x in out]:
            out.append(t)
    return out[:limit]


def parse_prose_sub(num, title, body):
    """A section written as ordinary prose, lists and tables (no Concept/Memorise/Traps labels)."""
    html_ = md_block(body)
    sub = {"num": num, "id": slug_id(num), "title": title, "kind": "prose", "body": html_, "raw": body, "tables": [], "mem": [], "concept": "", "trap": ""}
    sub["words"] = len(plain(html_).split())
    m = re.match(r"\s*<p>(.+?)</p>", html_, re.S)
    if m:
        sub["summary"] = trunc(first_sentence(plain(m.group(1))), 175)
    else:  # section opens with a list: summarise by the lead term of each item
        leads = []
        for li in re.findall(r"<li>(.*?)</li>", html_, re.S):
            t = strong_terms(li, 1, 40)
            if t:
                leads.append(t[0])
        sub["summary"] = trunc("Covers " + ", ".join(leads[:5]) + (" and more." if len(leads) > 5 else "."), 175) if leads else trunc(plain(html_), 175)
    sub["terms"] = strong_terms(html_, 5)
    sub["revterms"] = strong_terms(html_, 8)
    return sub


def parse_chapters_md(path):
    """Format 'chapters': ## Chapter N: Title > ### N.M Section, plus ### Memory Capsule / ### Analysis Angle per chapter."""
    text = path.read_text(encoding="utf-8")
    topics, order = {}, []
    for part in re.split(r"\n(?=## )", text):
        m = re.match(r"## Chapter (\d+)[:.]? (.+)", part)
        if not m:
            continue
        tid, title = m.group(1), m.group(2).strip()
        subs, capsule, angle = [], [], ""
        chunks = re.split(r"\n(?=### )", part)
        overview_md = chunks[0].partition("\n")[2].strip()  # optional overview paragraph(s) before the first sub-topic
        for chunk in chunks[1:]:
            head, _, body = chunk.partition("\n")
            if head.startswith("### Memory Capsule"):
                capsule = [md_inline(l[2:]) for l in body.splitlines() if l.startswith("- ")]
            elif head.startswith("### Analysis Angle"):
                angle = re.sub(r"^<p>(.*)</p>$", r"\1", md_block(body), flags=re.S)
            else:
                m2 = re.match(r"### (\d+\.\d+) (.+)", head)
                num, st = (m2.group(1), m2.group(2).strip()) if m2 else (f"{tid}.{len(subs) + 1}", head[4:].strip())
                subs.append(parse_prose_sub(num, st, body))
        topics[tid] = {"id": tid, "title": title, "subs": subs, "capsule": capsule, "angle": angle,
                       "overview": md_block(overview_md) if overview_md else ""}
        order.append(tid)
    return topics, order


def rapid_from_subs(topics, nums, label_subs=()):
    """Rows for the rapid-recall page from list sections such as '**Label:** fact. **Label:** fact.'"""
    rows = []
    for n in nums:
        for t in topics.values():
            for s in t["subs"]:
                if s["num"] != n:
                    continue
                lines = s["raw"].splitlines()
                hdr = []
                for li, line in enumerate(lines):
                    if line.startswith("|"):  # table row: first column is the item, the other columns are the fact
                        nxt = lines[li + 1] if li + 1 < len(lines) else ""
                        if re.match(r"\|[-\s|:]+\|$", line) or re.match(r"\|[-\s|:]+\|$", nxt):  # separator or header row
                            if re.match(r"\|[-\s|:]+\|$", nxt):
                                hdr = [c.strip() for c in line.strip().strip("|").split("|")]
                            continue
                        cells = [c.strip() for c in line.strip().strip("|").split("|")]
                        if len(cells) in (2, 3) and cells[0] and cells[1]:
                            if n in label_subs and len(cells) == 3 and len(hdr) == 3:  # keep the column names, e.g. "IPC 34; BNS 3(5)"
                                fact = "; ".join(f"{h} {c}" for h, c in zip(hdr[1:], cells[1:]) if c)
                            else:
                                fact = "; ".join(c for c in cells[1:] if c)
                            rows.append((md_inline(cells[0]), md_inline(fact)))
                        continue
                    if not line.startswith("- "):
                        continue
                    for lab, txt in re.findall(r"\*\*([^*]+?):\*\*\s*(.*?)(?=\s\*\*[^*]+?:\*\*|$)", line[2:]):
                        txt = txt.replace("\\<", "&lt;").replace("\\>", "&gt;").strip().rstrip(".;")
                        rows.append((md_inline(lab), md_inline(txt[:1].upper() + txt[1:])))
    return {"rows": rows, "note": ""}


def xref(h, ch):
    """Links references to other topics of the same chapter.
    chapter.json "xref": "chapter" (default) turns 'Chapter 6' into a link to topic 6 (the site calls them topics);
    "topic" links 'topic 6' / 'topics 1, 2 and 6' instead (use it when 'Chapter N' means a statute chapter); "none" links nothing."""
    mode = ch.get("xref", "chapter")
    if mode == "none":
        return h
    if mode == "topic":
        def run(m):
            def one(n):
                t = ch["topics"].get(n.group(0))
                return f'<a href="{t["url"]}">{n.group(0)}</a>' if t else n.group(0)
            return m.group(1) + " " + re.sub(r"\d+", one, m.group(2))
        return re.sub(r"\b([Tt]opics?) (\d+(?:(?:,\s*|\s+and\s+|\s+or\s+|\s+to\s+)\d+)*)", run, h)

    def r(m):
        t = ch["topics"].get(m.group(1))
        return f'<a href="{t["url"]}">Topic {m.group(1)}</a>' if t else m.group(0)
    return re.sub(r"Chapter (\d+)", r, h)


def load_chapters():
    chapters = []
    for cj in sorted(DATA.glob("*/*/chapter.json")):
        ch = json.loads(cj.read_text(encoding="utf-8"))
        fmt = ch.get("format", "pattern")
        if fmt == "chapters":
            topics, order = parse_chapters_md(cj.parent / "content.md")
            rapid = rapid_from_subs(topics, ch.get("rapid_from", []), ch.get("rapid_labels", []))
        else:
            topics, order, rapid = parse_content(cj.parent / "content.md")
        ch["_dir"] = cj.parent
        if ch.get("search_placeholder"):
            PLACEHOLDER[ch["slug"]] = ch["search_placeholder"]
        ch["rapid"] = rapid
        ch["base"] = f"/notes/{ch['paper']}/{ch['slug']}/"
        # merge content + structure; validate
        for mod in ch["modules"]:
            for tid in mod["topics"]:
                assert tid in topics, f"{tid} in chapter.json but not in content.md"
                assert tid in ch["topics"], f"{tid} has no entry in chapter.json topics"
        flat = []
        for mi, mod in enumerate(ch["modules"], 1):
            mod["n"] = mi
            for tid in mod["topics"]:
                t = {**topics[tid], **ch["topics"][tid]}
                t["module"] = mod
                t["url"] = ch["base"] + t["slug"] + ".html"
                t.setdefault("overview", "")
                t["words"] = sum(s["words"] for s in t["subs"]) + len(plain(t["overview"]).split())
                t["minutes"] = max(1, math.ceil(t["words"] / WPM))
                t.setdefault("capsule", [])
                t.setdefault("angle", "")
                if fmt == "chapters":
                    t["n_mem"] = len(t["capsule"])
                    t["n_trap"] = 1 if t["angle"] else 0
                else:
                    t["n_mem"] = sum(len(s["mem"]) for s in t["subs"])
                    t["n_trap"] = len(t["subs"])
                ch["topics"][tid] = t
                flat.append(t)
        ch["flat"] = flat
        unknown = set(topics) - {t["id"] for t in flat}
        assert not unknown, f"content.md has topics not placed in any module: {unknown}"
        ch["n_topics"] = len(flat)
        ch["n_subs"] = sum(len(t["subs"]) for t in flat)
        ch["n_mem"] = sum(t["n_mem"] for t in flat)
        ch["n_trap"] = sum(t["n_trap"] for t in flat)
        ch["fmt"] = fmt
        if fmt == "chapters":  # cross-reference "Chapter N" mentions
            for t in flat:
                for s in t["subs"]:
                    s["body"] = xref(s["body"], ch)
                t["capsule"] = [xref(c, ch) for c in t["capsule"]]
                t["overview"] = xref(t["overview"], ch)
                t["angle"] = xref(t["angle"], ch)
        ch["words"] = sum(t["words"] for t in flat)
        ch["minutes"] = sum(t["minutes"] for t in flat)
        for mod in ch["modules"]:
            ts = [ch["topics"][i] for i in mod["topics"]]
            mod["n_subs"] = sum(len(t["subs"]) for t in ts)
            mod["minutes"] = sum(t["minutes"] for t in ts)
        chapters.append(ch)
    return chapters


# --------------------------------------------------------------------------- site shell (copied from an existing page so look and nav stay in sync)
class Shell:
    def __init__(self):
        src = (ROOT / "ugc-net-paper-1-unit-2-research-aptitude.html").read_text(encoding="utf-8")
        self.theme = re.search(r"  <script>try\{var t=.*?</script>", src, re.S).group(0)
        self.fonts = re.search(r'  <link rel="preconnect" href="https://fonts.googleapis.com">.*?rel="stylesheet">', src, re.S).group(0)
        self.icons = re.search(r'<link rel="manifest".*?<meta name="application-name"[^>]*>', src, re.S).group(0)
        self.header = self.fix(re.search(r'<header class="site-header">.*?</header>', src, re.S).group(0))
        self.footer = self.fix(re.search(r"<footer>.*?</footer>", src, re.S).group(0))
        self.icons = self.fix(self.icons)

    @staticmethod
    def fix(h):
        h = re.sub(r'(href|src)="(?!(?:/|#|https?:|mailto:|tel:|javascript:|data:))([^"]*)"', r'\1="/\2"', h)
        h = h.replace('"/index.html#', '"/#').replace('"/index.html"', '"/"')
        h = h.replace('href="/#notes">Notes<', 'href="/notes/">Notes<')
        return h


SHELL = None


def page(*, title, desc, canonical, main, jsonld, robots="index,follow,max-snippet:-1,max-image-preview:large", chapter=""):
    global SHELL
    SHELL = SHELL or Shell()
    ld = json.dumps({"@context": "https://schema.org", "@graph": jsonld}, ensure_ascii=False)
    img = BASE + "/og-notes.png"
    t, d = esc(title, True), esc(desc, True)
    css = "".join(f'  <link rel="stylesheet" href="/{c}.css">\n' for c in ["styles", "disclaimer", "theme", "faq", "nav-resources", "unit-page", "notes"])
    js = "".join(f'<script src="/{j}.js" defer></script>\n' for j in ["script", "theme", "disclaimer", "nav-resources", "nl-report", "nl-share", "pwa", "notes"])
    return f"""<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{t}</title>
  <meta name="description" content="{d}">
  <link rel="canonical" href="{canonical}">
  <meta name="robots" content="{robots}">
  <meta name="theme-color" content="#2d4aa9" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0c1413" media="(prefers-color-scheme: dark)">
  <meta property="og:type" content="article"><meta property="og:site_name" content="NET Law-Verse"><meta property="og:locale" content="en_IN">
  <meta property="og:title" content="{t}"><meta property="og:description" content="{d}"><meta property="og:url" content="{canonical}">
  <meta property="og:image" content="{img}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="NET Law-Verse: unit-wise UGC NET study notes">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{t}"><meta name="twitter:description" content="{d}"><meta name="twitter:image" content="{img}">
{SHELL.theme}
{SHELL.fonts}
{css}  <script type="application/ld+json">{ld}</script>
{SHELL.icons}
</head>
<body class="nt" data-chapter="{chapter}">
<a class="skip" href="#main">Skip to content</a>
<div id="live" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
{SHELL.header}

<main id="main" tabindex="-1">
{main}
</main>
{SHELL.footer}
{js}</body>
</html>
"""


# --------------------------------------------------------------------------- shared components
def crumbs(items):
    """items: list of (label, url or None). Returns (html, json-ld BreadcrumbList)."""
    parts, ld = [], []
    for i, (label, url) in enumerate(items, 1):
        if url and i < len(items):
            parts.append(f'<a href="{url}">{esc(label)}</a>')
        else:
            parts.append(f'<span aria-current="page">{esc(label)}</span>')
        ld.append({"@type": "ListItem", "position": i, "name": label, **({"item": BASE + url} if url else {})})
    h = '<nav class="faq-crumb" aria-label="Breadcrumb">' + '<span aria-hidden="true">&rsaquo;</span>'.join(parts) + "</nav>"
    return h, {"@type": "BreadcrumbList", "itemListElement": ld}


def badges(items):
    return '<ul class="faq-badges" aria-label="Highlights">' + "".join(f"<li>{i}</li>" for i in items) + "</ul>"


def plural(n, word):
    return f"{n} {word}{'' if n == 1 else 's'}"


def mins(m):
    return f"{m} min" if m < 90 else f"{m / 60:.1f} h"


PLACEHOLDER = {}  # chapter slug -> search hint, filled from chapter.json ("search_placeholder")


def search_box(scope=""):
    ph = esc(PLACEHOLDER.get(scope, "Find a concept: e.g. Kuhn, Type I error, APA"), True)
    return (
        f'<div class="nt-search" data-index="/notes/search-index.json" data-scope="{scope}">'
        '<label class="sr-only" for="nt-q">Search the notes</label>'
        f'<input id="nt-q" type="search" placeholder="{ph}" autocomplete="off" spellcheck="false">'
        '<ul class="nt-results" hidden></ul><p class="sr-only" role="status" aria-live="polite"></p></div>'
    )


def revise_hint(ch):
    if ch.get("fmt") == "chapters":
        cap = any(t["capsule"] for t in ch["flat"])
        ang = any(t["angle"] for t in ch["flat"])
        if cap and ang:
            return "Revision mode hides the full explanations and keeps each section's key terms and lists, plus the Memory Capsule and Analysis Angle. Use it from your second read onward."
        extra = " and the Analysis Angle" if ang else (" and the Memory Capsule" if cap else "")
        return "Revision mode hides the full explanations and keeps each section's key terms, lists and tables" + extra + ". Use it from your second read onward."
    return "Revision mode hides the Concept paragraphs and keeps the Memorise points, exam traps and tables. Use it from your second read onward."


def mode_toggle():
    return (
        '<div class="nt-mode" role="group" aria-label="Reading mode">'
        '<button type="button" data-mode="full" aria-pressed="true">Full notes</button>'
        '<button type="button" data-mode="revise" aria-pressed="false">Revision mode</button></div>'
    )


def tree(ch, cur=None):  # noqa
    """Right-hand chapter contents: modules > topics, with the current topic expanded into its sub-topics."""
    out = ['<nav class="nt-tree" aria-label="Chapter contents">']
    for mod in ch["modules"]:
        is_cur = cur is not None and cur["module"] is mod
        out.append(f'<details class="nt-mod" data-mod="{mod["id"]}"{" open" if is_cur else ""}><summary><span class="nt-modn">{LEVELS["module"]} {mod["n"]}</span> {esc(mod["title"])}</summary><ol>')
        for tid in mod["topics"]:
            t = ch["topics"][tid]
            c = t is cur
            cur_attr = ' aria-current="page"' if c else ""
            out.append(
                f'<li class="nt-t{" is-cur" if c else ""}"><a href="{t["url"]}" data-topic="{t["id"]}" data-n="{len(t["subs"])}"{cur_attr}>'
                f'<b>{t["id"]}</b> {esc(t["title"])}</a><span class="nt-cnt" title="{plural(len(t["subs"]), "sub-topic")}">{len(t["subs"])}</span>'
            )
            if c:
                out.append('<ol class="nt-subs">' + ('<li><a href="#overview" data-sub="overview"><b>&sect;</b> Overview</a></li>' if t.get("overview") else "") + "".join(
                    f'<li><a href="#{s["id"]}" data-sub="{s["id"]}"><b>{s["num"].split(".")[1]}</b> {esc(s["title"])}</a></li>' for s in t["subs"])
                    + ('<li><a href="#capsule"><b>&#9733;</b> Memory Capsule</a></li>' if t["capsule"] else "")
                    + ('<li><a href="#angle"><b>&#9733;</b> Analysis Angle</a></li>' if t["angle"] else "") + "</ol>")
            out.append("</li>")
        out.append("</ol></details>")
    out.append(f'<p class="nt-tree-foot"><a href="{ch["base"]}rapid-recall.html">Rapid-recall sheet</a> · <a href="{ch["base"]}">Chapter overview</a></p>')
    out.append("</nav>")
    return "".join(out)


def side_contents(ch, cur=None):
    label = f'Contents: {cur["id"]} {esc(cur["title"])}' if cur else "Chapter contents"
    return (
        f'<details class="up-box nt-contents" open><summary><span>{label}</span></summary>'
        f'{search_box(ch["slug"])}{mode_toggle() if cur else ""}{tree(ch, cur)}</details>'
    )


# --------------------------------------------------------------------------- topic page
def topic_desc(t, ch):
    subs = "; ".join(s["title"] for s in t["subs"])
    d = f'{t["title"]} notes for {ch["paper_name"]} {ch["name"]}: {subs}. Concepts, memory points and exam traps.'
    if len(d) > 158:
        d = f'{t["title"]}: {len(t["subs"])} sub-topics of notes for {ch["paper_name"]} {ch["name"]}, with memory points, exam traps and a revision mode.'
    return t.get("description") or trunc(d, 160)


def topic_title(t, ch):
    if t.get("seo_title"):
        return t["seo_title"]
    for cand in (f'{t["title"]}: {ch["paper_name"]} {ch["name"]} Notes', f'{t["title"]} Notes | {ch["paper_name"]}', f'{t["title"]} | UGC NET Notes'):
        if len(cand) <= 66:
            return cand
    return trunc(t["title"], 60)


def build_topic(ch, t, i):
    flat = ch["flat"]
    prev_t = flat[i - 1] if i > 0 else None
    next_t = flat[i + 1] if i < len(flat) - 1 else None
    mod = t["module"]
    url = BASE + t["url"]
    cb, cb_ld = crumbs([("Home", "/"), ("Study notes", "/notes/"), (ch["name"], ch["base"]), (t["title"], t["url"])])

    # position track: all topics of the chapter, current highlighted
    track = ['<nav class="nt-track" aria-label="Position in the chapter"><ol>']
    for m in ch["modules"]:
        track.append(f'<li class="nt-trk-m"><span class="nt-trk-l" title="{esc(m["title"])}">{m["n"]}</span><ol>')
        for tid in m["topics"]:
            x = ch["topics"][tid]
            cur = ' aria-current="page"' if x is t else ""
            track.append(f'<li><a href="{x["url"]}" data-topic="{x["id"]}" data-n="{len(x["subs"])}" title="{esc(x["title"])}"{cur}>{x["id"]}</a></li>')
        track.append("</ol></li>")
    track.append("</ol></nav>")

    if ch["fmt"] == "chapters":
        stats = badges([plural(len(t["subs"]), "sub-topic")] + ([f'{t["n_mem"]}-point Memory Capsule'] if t["capsule"] else []) + (["Analysis Angle"] if t["angle"] else [])
                       + [f'{mins(t["minutes"])} read', (f'Topic {t["id"]} of {flat[-1]["id"]}' if flat[0]["id"] == "0" else f'Topic {i + 1} of {ch["n_topics"]}')])
    else:
        stats = badges([
            f'{plural(len(t["subs"]), "sub-topic")}',
            f'{t["n_mem"]} memory points',
            f'{len(t["subs"])} exam-trap notes',
            f'{mins(t["minutes"])} read',
            f'Topic {i + 1} of {ch["n_topics"]}',
        ])
    hero = f"""<section class="faq-hero up-hero nt-hero">
  <div class="container">
    {cb}
    <span class="eyebrow">{esc(ch["paper_name"].upper())} · UNIT {ch["unit"]:02d} · <a href="{ch["base"]}#{mod["id"]}">{LEVELS["module"].upper()} {mod["n"]}: {esc(mod["title"].upper())}</a> · TOPIC {t["id"]}</span>
    <h1>{esc(t["title"])}</h1>
    <p class="faq-sub">{esc(t.get("lead") or f'Notes on {t["title"].lower()} for {ch["paper_name"]} {ch["name"]}, in {len(t["subs"])} short sub-topics. Each one gives the concept, the facts to memorise and the traps examiners set.')}</p>
    {stats}
    {"".join(track)}
  </div>
</section>"""

    covers = ['<section id="covers" aria-labelledby="h-covers" class="nt-covers"><h2 id="h-covers">What this topic covers</h2>',
              f'<p class="nt-covers-sub">{plural(len(t["subs"]), "sub-topic")}, in the order to study them. Tap one to jump to it.</p><ol class="nt-map">']
    for s in t["subs"]:
        chips = "".join(f"<li>{esc(x)}</li>" for x in s["terms"])
        chips_html = f'<ul class="nt-chips" aria-label="Key terms">{chips}</ul>' if chips else ""
        covers.append(
            f'<li><a href="#{s["id"]}"><span class="nt-num">{s["num"]}</span><span class="nt-map-t"><b>{esc(s["title"])}</b>'
            f'<span class="nt-map-s">{esc(s["summary"])}</span></span></a>{chips_html}</li>')
    for anchor, lab, txt in (("capsule", "Memory Capsule", "The names, dates and one-line facts from this topic, for daily recall."),
                             ("angle", "Analysis Angle", "How examiners twist this topic, and how to reason through scenario questions.")):
        if (anchor == "capsule" and t["capsule"]) or (anchor == "angle" and t["angle"]):
            covers.append(f'<li><a href="#{anchor}"><span class="nt-num">&#9733;</span><span class="nt-map-t"><b>{lab}</b><span class="nt-map-s">{txt}</span></span></a></li>')
    covers.append("</ol></section>")
    if t.get("overview"):
        covers.insert(2, f'<li><a href="#overview"><span class="nt-num">&sect;</span><span class="nt-map-t"><b>Overview</b>'
                         f'<span class="nt-map-s">{esc(trunc(first_sentence(plain(t["overview"])), 175))}</span></span></a></li>')

    body = [mode_toggle().replace('class="nt-mode"', 'class="nt-mode nt-mode-main"'),
            f'<p class="nt-mode-hint">{revise_hint(ch)}</p>']
    if t.get("overview"):
        body.append('<section class="nt-sub nt-overview" id="overview" data-sub="overview" aria-labelledby="h-overview"><h2 id="h-overview"><span class="nt-num">&sect;</span>Overview'
                    f'<a class="nt-anchor" href="#overview" aria-label="Link to the overview">#</a></h2><div class="nt-pbody">{t["overview"]}</div>'
                    '<p class="nt-sub-foot"><span></span><a href="#covers">Back to topic map &uarr;</a></p></section>')
    for s in t["subs"]:
        if s.get("kind") == "prose":
            rt = "".join(f"<li>{esc(x)}</li>" for x in s["revterms"])
            body.append(
                f'<article class="nt-sub nt-prose" id="{s["id"]}" data-sub="{s["id"]}" aria-labelledby="h-{s["id"]}">'
                f'<h2 id="h-{s["id"]}"><span class="nt-num">{s["num"]}</span>{esc(s["title"])}<a class="nt-anchor" href="#{s["id"]}" aria-label="Link to {esc(s["title"])}">#</a></h2>'
                f'<div class="nt-revsum"><p class="nt-lbl">In brief</p><p>{esc(s["summary"])}</p>' + (f'<ul class="nt-chips" aria-label="Key terms">{rt}</ul>' if rt else "") + '</div>'
                f'<div class="nt-pbody">{s["body"]}</div>'
                f'<p class="nt-sub-foot"><button type="button" class="nt-done" data-done="{s["id"]}" aria-pressed="false">Mark as studied</button>'
                f'<a href="#covers">Back to topic map &uarr;</a></p></article>')
            continue
        mem = "".join(f"<li>{m}</li>" for m in s["mem"])
        tabs = "".join(f'<div class="up-tw nt-table">{x}</div>' for x in s["tables"])
        body.append(
            f'<article class="nt-sub" id="{s["id"]}" data-sub="{s["id"]}" aria-labelledby="h-{s["id"]}">'
            f'<h2 id="h-{s["id"]}"><span class="nt-num">{s["num"]}</span>{esc(s["title"])}<a class="nt-anchor" href="#{s["id"]}" aria-label="Link to {esc(s["title"])}">#</a></h2>'
            f'<div class="nt-concept"><p class="nt-lbl">Concept</p><p>{s["concept"]}</p></div>{tabs}'
            + (f'<div class="nt-mem"><p class="nt-lbl">Memorise</p><ul>{mem}</ul></div>' if mem else "")
            + f'<div class="nt-trap"><p class="nt-lbl">Analyse / traps</p><p>{s["trap"]}</p></div>'
            f'<p class="nt-sub-foot"><button type="button" class="nt-done" data-done="{s["id"]}" aria-pressed="false">Mark as studied</button>'
            f'<a href="#covers">Back to topic map &uarr;</a></p></article>')

    if t["capsule"]:
        body.append('<section class="nt-sub nt-capsule" id="capsule" aria-labelledby="h-capsule"><h2 id="h-capsule"><span class="nt-num">&#9733;</span>Memory Capsule: ' + esc(t["title"]) + '</h2>'
                    '<div class="nt-mem"><p class="nt-lbl">Memorise</p><ul>' + "".join(f"<li>{c}</li>" for c in t["capsule"]) + '</ul></div></section>')
    if t["angle"]:
        body.append('<section class="nt-sub nt-angle" id="angle" aria-labelledby="h-angle"><h2 id="h-angle"><span class="nt-num">&#9733;</span>Analysis Angle: ' + esc(t["title"]) + '</h2>'
                    '<div class="nt-trap"><p class="nt-lbl">Analyse / traps</p><p>' + t["angle"] + '</p></div>'
                    '<p class="nt-sub-foot"><a href="#covers">Back to topic map &uarr;</a></p></section>')
    mcq = "".join(f'<li><a href="{ch["mcq_base"]}{m["slug"]}.html">{esc(m["label"])} MCQs</a></li>' for m in t["mcq"])
    practise = (f'<section id="practise" aria-labelledby="h-practise" class="nt-practise"><h2 id="h-practise">Test yourself on {esc(t["title"])}</h2>'
                f'<p>Practise with free MCQs and answer keys, then return here to fix what you got wrong.</p><ul class="nt-pills">{mcq}'
                f'<li><a href="{ch["base"]}rapid-recall.html">Rapid-recall sheet</a></li></ul></section>')

    rel = ['<section id="related" aria-labelledby="h-rel" class="nt-related"><h2 id="h-rel">Related topics</h2>'
           f'<p>Concepts in this topic connect to these. Read them next if you want the full picture.</p><ul class="nt-cards">']
    for r in t["related"]:
        x = ch["topics"][r["id"]]
        rel.append(f'<li><a href="{x["url"]}"><span class="nt-num">{x["id"]}</span><b>{esc(x["title"])}</b><span>{esc(r["why"])}</span></a></li>')
    rel.append("</ul></section>")

    def pn(x, d):
        if not x:
            return "<span></span>"
        arrow = ("&larr; Previous" if d == "prev" else "Next &rarr;")
        return f'<a class="nt-pn-{d}" href="{x["url"]}"><small>{arrow}{" · new module" if x["module"] is not mod else ""}</small><b>{x["id"]} {esc(x["title"])}</b></a>'

    nav = (f'<nav class="nt-pn" aria-label="Previous and next topic">{pn(prev_t, "prev")}{pn(next_t, "next")}</nav>'
           f'<p class="nt-up"><a href="{ch["base"]}#{mod["id"]}">&uarr; {LEVELS["module"]} {mod["n"]}: {esc(mod["title"])}</a> · <a href="{ch["base"]}">All {ch["n_topics"]} topics in {esc(ch["name"])}</a> · <a href="{ch["unit_page"]}">Unit overview and sample MCQs</a></p>')
    if not next_t:
        nav = nav.replace("<span></span></nav>", f'<a class="nt-pn-next" href="{ch["base"]}rapid-recall.html"><small>Finished? Next &rarr;</small><b>Rapid-recall sheet</b></a></nav>', 1) if "<span></span></nav>" in nav else nav

    stamp = (f'<p class="faq-stamp">Last updated: <time datetime="{ch["updated"]}">{fmt_date(ch["updated"])}</time>. Notes are a revision aid; check official UGC sources for any rule or scheme that changes over time. '
             'Spotted a mistake? Write to <a href="mailto:netlawverse@gmail.com">netlawverse@gmail.com</a>.</p>')

    main = f"""{hero}
<div class="container up-wrap nt-wrap">
<div class="up-main">
{"".join(covers)}
<div class="nt-body">
{"".join(body)}
</div>
{practise}
{"".join(rel)}
{nav}
{stamp}
</div>
<aside class="up-side nt-side" aria-label="Chapter contents">
{side_contents(ch, t)}
</aside>
</div>"""

    ld = [
        cb_ld,
        {"@type": ["Article", "LearningResource"], "@id": url + "#notes", "headline": t["title"] + " (" + ch["name"] + " notes)", "description": topic_desc(t, ch),
         "url": url, "inLanguage": "en-IN", "dateModified": ch["updated"], "datePublished": ch.get("published", ch["updated"]),
         "author": {"@id": BASE + "/#org"}, "publisher": {"@id": BASE + "/#org"},
         "image": BASE + "/og-notes.png", "mainEntityOfPage": url,
         "isPartOf": {"@type": "CollectionPage", "@id": BASE + ch["base"] + "#chapter", "name": ch["paper_name"] + " " + ch["name"] + " notes", "url": BASE + ch["base"]},
         "learningResourceType": "Study notes", "educationalLevel": "Postgraduate entrance exam (UGC NET)", "isAccessibleForFree": True,
         "timeRequired": f"PT{t['minutes']}M", "about": ch["name"], "teaches": [s["title"] for s in t["subs"]],
         "wordCount": t["words"], "articleSection": mod["title"]},
    ]
    return page(title=topic_title(t, ch), desc=topic_desc(t, ch), canonical=url, main=main, jsonld=ld, chapter=ch["slug"])


MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


def fmt_date(iso):
    y, m, d = iso.split("-")
    return f"{int(d)} {MONTHS[int(m) - 1]} {y}"


# --------------------------------------------------------------------------- chapter overview
def build_chapter(ch):
    first = ch["flat"][0]
    cb, cb_ld = crumbs([("Home", "/"), ("Study notes", "/notes/"), (ch["name"], None)])
    url = BASE + ch["base"]
    hide = ch.get("hide_stats", [])
    stats = "".join(f'<li><b>{n}</b><span>{lbl}</span></li>' for n, lbl in [
        (len(ch["modules"]), "modules"), (ch["n_topics"], "topics"), (ch["n_subs"], "sub-topics"), (ch["n_mem"], "memory points"),
        (ch["n_trap"], "analysis angles" if ch["fmt"] == "chapters" else "exam-trap notes"), (mins(ch["minutes"]), "to read once")]
        if lbl not in hide and not (n == 0 and lbl in ("memory points", "analysis angles", "exam-trap notes")))
    hero = f"""<section class="faq-hero up-hero nt-hero">
  <div class="container">
    {cb}
    <span class="eyebrow">{esc(ch["paper_name"].upper())}{" · CODE " + esc(ch.get("paper_code", "00")) if ch.get("paper_code", "00") else ""} · UNIT {ch["unit"]:02d}</span>
    <h1>{esc(ch["paper_name"])} {esc(ch["name"])}: Detailed Study Notes</h1>
    <p class="faq-sub">{esc(ch["intro"])}</p>
    <ul class="nt-stats" aria-label="Size of this chapter">{stats}</ul>
    <div class="nt-hero-row">{search_box(ch["slug"])}
    <div class="up-cta"><a href="{first["url"]}" id="nt-start">{"Start here" if first["id"] == "0" else "Start with " + first["id"]}: {esc(first["title"])}</a><a class="ghost" id="nt-resume" href="#" hidden>Continue where you left off</a><a class="ghost" href="{ch["base"]}rapid-recall.html">Rapid-recall sheet</a></div></div>
    <p class="faq-note">NET Law-Verse is an independent study aid, not affiliated with UGC or NTA. Always check the official <a href="https://ugcnet.nta.ac.in/" target="_blank" rel="noopener">UGC NET syllabus</a>.</p>
  </div>
</section>"""

    if ch.get("how"):
        how = ('<section id="how" aria-labelledby="h-how"><h2 id="h-how">How to use these notes</h2><ol class="nt-rounds">'
               + "".join(f'<li><b>{esc(a)}</b><span>{b}</span></li>' for a, b in ch["how"]) + '</ol></section>')
    else:
      how = f"""<section id="how" aria-labelledby="h-how"><h2 id="h-how">How to use these notes</h2>
<ol class="nt-rounds">
<li><b>Round 1: Read</b><span>Go module by module. Read each <i>Concept</i> once, slowly; it is what lets you answer reasoning and “which statement is correct” questions.</span></li>
<li><b>Round 2: Revise</b><span>Switch on <i>Revision mode</i> on any topic page. You see only the <i>Memorise</i> points, the <i>Analyse / traps</i> notes and the comparison tables.</span></li>
<li><b>Last week: Recall</b><span>Use the <a href="{ch["base"]}rapid-recall.html">rapid-recall sheet</a>, re-read the traps, and practise MCQs topic by topic.</span></li>
</ol></section>"""

    mods = []
    for mod in ch["modules"]:
        cards = []
        for tid in mod["topics"]:
            t = ch["topics"][tid]
            subs = "".join(f'<li><a href="{t["url"]}#{s["id"]}" data-sub="{s["id"]}" data-topic="{t["id"]}"><b>{s["num"]}</b> {esc(s["title"])}</a></li>' for s in t["subs"])
            m1 = t["mcq"][0]
            cards.append(
                f'<article class="nt-topic" id="t-{t["id"].lower()}"><h3><a href="{t["url"]}" data-topic="{t["id"]}" data-n="{len(t["subs"])}"><span class="nt-num">{t["id"]}</span>{esc(t["title"])}</a></h3>'
                f'<p class="nt-meta">{plural(len(t["subs"]), "sub-topic")} · {(str(t["n_mem"]) + " memory points · ") if t["n_mem"] and "memory points" not in ch.get("hide_stats", []) else ""}{mins(t["minutes"])}</p>'
                f'<details open><summary>Sub-topics</summary><ul class="nt-sublist">{subs}</ul></details>'
                f'<p class="nt-links"><a href="{t["url"]}">Read</a><a href="{t["url"]}#revise" data-revise>Revise</a><a href="{ch["mcq_base"]}{m1["slug"]}.html">MCQs</a></p></article>')
        mods.append(
            f'<section id="{mod["id"]}" class="nt-module" aria-labelledby="h-{mod["id"]}" data-mod="{mod["id"]}">'
            f'<h2 id="h-{mod["id"]}"><span class="nt-modn">{LEVELS["module"]} {mod["n"]}</span>{esc(mod["title"])}</h2>'
            f'<p class="nt-blurb">{esc(mod["blurb"])}</p>'
            f'<p class="nt-meta">{plural(len(mod["topics"]), "topic")} · {mod["n_subs"]} sub-topics · {mins(mod["minutes"])} <span class="nt-prog" data-prog-mod="{mod["id"]}" hidden></span></p>'
            f'<div class="nt-topics">{"".join(cards)}</div></section>')
    path = ('<section id="map" aria-labelledby="h-map"><h2 id="h-map">Full syllabus map</h2>'
            f'<p>Every topic and sub-topic in this chapter, in study order. <button type="button" class="nt-toggle" id="nt-toggle-all">Collapse sub-topic lists</button></p></section>')

    nxt = ('<section id="more" aria-labelledby="h-more"><h2 id="h-more">Keep going</h2><ul class="nt-pills">'
           f'<li><a href="{ch["mcq_index"]}">All {ch["mcq_total"]} MCQs for this unit</a></li><li><a href="{ch["unit_page"]}">Unit overview and sample questions</a></li>'
           '<li><a href="/pyq.html">Previous-year questions</a></li><li><a href="/ugc-net-law-preparation-plan.html">Preparation plans</a></li><li><a href="/notes/">All study notes</a></li></ul></section>')

    side = f"""<aside class="up-side nt-side nt-side-ch" aria-label="Chapter contents">
<div class="up-box nt-contents-chapter"><h2>Jump to a module</h2>{search_box(ch["slug"]).replace('id="nt-q"', 'id="nt-q2"').replace('for="nt-q"', 'for="nt-q2"')}
<ol class="nt-jump">{"".join(f'<li><a href="#{m["id"]}" data-jump="{m["id"]}"><b>{m["n"]}</b> {esc(m["title"])}<span>{len(m["topics"])} topics · {m["n_subs"]} sub-topics</span></a></li>' for m in ch["modules"])}</ol>
<p class="nt-tree-foot"><a href="#how">How to use</a> · <a href="{ch["base"]}rapid-recall.html">Rapid-recall sheet</a></p></div>
<div class="up-box"><h2>Your progress</h2><p class="nt-progress-txt" id="nt-progress">Mark sub-topics as studied while you read; your progress is saved in this browser only.</p><div class="nt-bar" hidden><i></i></div></div>
</aside>"""
    main = f"""{hero}
<div class="container up-wrap nt-wrap">
<div class="up-main">
{how}
{path}
{"".join(mods)}
{nxt}
<p class="faq-stamp">Last updated: <time datetime="{ch["updated"]}">{fmt_date(ch["updated"])}</time>. Spotted a mistake? Write to <a href="mailto:netlawverse@gmail.com">netlawverse@gmail.com</a>.</p>
</div>
{side}
</div>"""
    ld = [cb_ld,
          {"@type": "CollectionPage", "@id": url + "#chapter", "name": f'{ch["paper_name"]} {ch["name"]}: detailed study notes', "url": url, "description": ch["description"], "inLanguage": "en-IN",
           "dateModified": ch["updated"], "isPartOf": {"@id": BASE + "/#website"}, "publisher": {"@id": BASE + "/#org"},
           "about": ch["name"], "numberOfItems": ch["n_topics"],
           "mainEntity": {"@type": "ItemList", "itemListElement": [{"@type": "ListItem", "position": i, "name": t["id"] + " " + t["title"], "url": BASE + t["url"]} for i, t in enumerate(ch["flat"], 1)]}}]
    return page(title=ch["seo_title"], desc=ch["description"], canonical=url, main=main, jsonld=ld, chapter=ch["slug"])


# --------------------------------------------------------------------------- rapid recall
def build_rapid(ch):
    url = BASE + ch["base"] + "rapid-recall.html"
    cb, cb_ld = crumbs([("Home", "/"), ("Study notes", "/notes/"), (ch["name"], ch["base"]), ("Rapid-recall sheet", ch["base"] + "rapid-recall.html")])
    rows = "".join(f"<tr><th scope=\"row\">{a}</th><td>{b}</td></tr>" for a, b in ch["rapid"]["rows"])
    sn = ch.get("short_name", ch["name"])  # optional shorter name for titles
    title = f'{sn} Rapid-Recall Sheet | {ch["paper_name"]}'
    desc = f'One-page rapid-recall sheet for {ch["paper_name"]} {sn}: {len(ch["rapid"]["rows"])} high-yield names, dates and facts to revise in the last days before the exam.'
    main = f"""<section class="faq-hero up-hero nt-hero"><div class="container">{cb}
<span class="eyebrow">{esc(ch["paper_name"].upper())} · UNIT {ch["unit"]:02d} · REVISION</span>
<h1>{esc(ch["name"])} Rapid-Recall Sheet</h1>
<p class="faq-sub">Each line is a typical direct-recall item. Use it in the last days of revision, after you have read the topics and the exam traps.</p>
{badges([f'{len(ch["rapid"]["rows"])} high-yield facts', "One page", "Type to filter"])}
</div></section>
<div class="container up-wrap nt-wrap"><div class="up-main">
<section aria-labelledby="h-rr"><h2 id="h-rr">High-yield facts</h2>
<div class="nt-filter"><label class="sr-only" for="nt-rr-q">Filter the sheet</label><input id="nt-rr-q" type="search" placeholder="Filter: e.g. {esc(ch.get("rapid_placeholder", "Popper, 2017, FAIR"), True)}" autocomplete="off"><span id="nt-rr-n" role="status" aria-live="polite"></span></div>
<div class="up-tw"><table class="up-table nt-rr" id="nt-rr"><caption class="sr-only">Rapid-recall facts</caption><thead><tr><th scope="col">Item</th><th scope="col">Key fact</th></tr></thead><tbody>{rows}</tbody></table></div>
{f'<p class="nt-note">{esc(ch["rapid"]["note"])}</p>' if ch["rapid"]["note"] else ""}</section>
<section aria-labelledby="h-rr2"><h2 id="h-rr2">Where each fact is explained</h2><p>Open the topic for the concept behind any line you cannot recall.</p>
<ul class="nt-pills">{"".join(f'<li><a href="{t["url"]}">{t["id"]} {esc(t["title"])}</a></li>' for t in ch["flat"])}</ul></section>
<p class="up-pn"><a href="{ch["base"]}">&larr; Chapter overview</a><a href="{ch["mcq_index"]}">Practise MCQs &rarr;</a></p>
<p class="faq-stamp">Last updated: <time datetime="{ch["updated"]}">{fmt_date(ch["updated"])}</time>.</p>
</div><aside class="up-side nt-side" aria-label="Chapter contents">{side_contents(ch)}</aside></div>"""
    ld = [cb_ld, {"@type": "WebPage", "@id": url, "name": title, "url": url, "description": desc, "inLanguage": "en-IN", "dateModified": ch["updated"], "isPartOf": {"@id": BASE + ch["base"] + "#chapter"}}]
    return page(title=title, desc=desc, canonical=url, main=main, jsonld=ld, chapter=ch["slug"])


# --------------------------------------------------------------------------- hub
def build_hub(chapters):
    site = json.loads((DATA / "site.json").read_text(encoding="utf-8"))
    live = {(c["paper"], c["slug"]): c for c in chapters}
    cb, cb_ld = crumbs([("Home", "/"), ("Study notes", None)])
    n_topics = sum(c["n_topics"] for c in chapters)
    n_subs = sum(c["n_subs"] for c in chapters)
    sections = []
    for p in site["papers"]:
        cards = []
        for u in p["units"]:
            c = live.get((p["id"], u["slug"]))
            if c:
                cards.append(f'<li class="nt-unit is-live"><a href="{c["base"]}"><span class="nt-num">{u["n"]:02d}</span><b>{esc(u["name"])}</b>'
                             f'<span>{len(c["modules"])} modules · {c["n_topics"]} topics · {c["n_subs"]} sub-topics</span><em>Detailed notes</em></a></li>')
            else:
                cards.append(f'<li class="nt-unit"><a href="{u["page"]}"><span class="nt-num">{u["n"]:02d}</span><b>{esc(u["name"])}</b><span>Overview and MCQs now; detailed notes coming</span></a></li>')
        sections.append(f'<section id="{p["id"]}" aria-labelledby="h-{p["id"]}"><h2 id="h-{p["id"]}">{esc(p["name"])}</h2><p>{esc(p["blurb"])}</p><ul class="nt-units">{"".join(cards)}</ul></section>')
    title = "UGC NET Study Notes: Paper 1 and Law (058) | NET Law-Verse"
    desc = f"Free chapter-wise UGC NET study notes for Paper 1 and Law 058, organised as modules, topics and sub-topics with revision mode and MCQ links. {n_subs} sub-topics live."
    main = f"""<section class="faq-hero up-hero nt-hero"><div class="container">{cb}
<span class="eyebrow">STUDY NOTES</span>
<h1>UGC NET Study Notes, Chapter by Chapter</h1>
<p class="faq-sub">Each chapter is split into modules, topics and sub-topics, so you can see the whole syllabus at a glance, study it in order, or jump straight to one concept.</p>
{badges([f"{len(chapters)} chapter{'s' if len(chapters) != 1 else ''} live", f"{n_topics} topics", f"{n_subs} sub-topics", "Revision mode", "Free, no sign-up"])}
{search_box("")}
</div></section>
<div class="container up-wrap nt-wrap"><div class="up-main">
{"".join(sections)}
<section aria-labelledby="h-how"><h2 id="h-how">How every chapter is organised</h2>
<ol class="nt-rounds"><li><b>Chapter overview</b><span>The whole syllabus map in one page: modules, topics and every sub-topic.</span></li>
<li><b>Topic page</b><span>Sub-topics in sequence with memory points and exam traps, plus a contents list on the right.</span></li>
<li><b>Revision</b><span>Revision mode on every topic page and a rapid-recall sheet for each chapter.</span></li></ol></section>
<p class="faq-stamp">New chapters are added regularly.</p>
</div><aside class="up-side nt-side"><div class="up-box"><h2>Also on NET Law-Verse</h2><a href="/mcq/">MCQs by topic</a><a href="/pyq.html">Previous-year questions</a><a href="/#mock-tests">Mock tests</a><a href="/ugc-net-law-preparation-plan.html">Study plans</a><a href="/cutoff.html">Cut-off trend</a></div></aside></div>"""
    ld = [cb_ld, {"@type": "CollectionPage", "@id": BASE + "/notes/", "name": title, "url": BASE + "/notes/", "description": desc, "inLanguage": "en-IN", "isPartOf": {"@id": BASE + "/#website"},
                  "mainEntity": {"@type": "ItemList", "itemListElement": [{"@type": "ListItem", "position": i, "name": f'{c["paper_name"]} {c["name"]}', "url": BASE + c["base"]} for i, c in enumerate(chapters, 1)]}}]
    return page(title=title, desc=desc, canonical=BASE + "/notes/", main=main, jsonld=ld)


# --------------------------------------------------------------------------- search index + sitemap
def build_search(chapters):
    out = []
    for ch in chapters:
        for t in ch["flat"]:
            for s in t["subs"]:
                body = plain(" ".join([s["concept"]] + s["mem"] + [s["trap"]] + s["tables"] + [s.get("body", "")]))
                out.append({"u": f'{t["url"]}#{s["id"]}', "t": f'{s["num"]} {s["title"]}', "p": f'{t["title"]} · {ch["name"]}', "c": ch["slug"], "x": body})
            if t.get("overview"):
                out.append({"u": f'{t["url"]}#overview', "t": f'Overview: {t["title"]}', "p": f'{t["title"]} · {ch["name"]}', "c": ch["slug"], "x": plain(t["overview"])})
            if t["capsule"]:
                out.append({"u": f'{t["url"]}#capsule', "t": f'Memory Capsule: {t["title"]}', "p": f'{t["title"]} · {ch["name"]}', "c": ch["slug"], "x": plain(" ".join(t["capsule"]))})
            if t["angle"]:
                out.append({"u": f'{t["url"]}#angle', "t": f'Analysis Angle: {t["title"]}', "p": f'{t["title"]} · {ch["name"]}', "c": ch["slug"], "x": plain(t["angle"])})
    return json.dumps(out, ensure_ascii=False, separators=(",", ":"))


def patch_sitemap(chapters):
    sm = ROOT / "sitemap.xml"
    txt = sm.read_text(encoding="utf-8")
    txt = re.sub(r"\s*<!-- notes:begin -->.*?<!-- notes:end -->", "", txt, flags=re.S)
    rows = [("/notes/", max(c["updated"] for c in chapters), "weekly", "0.8")]
    for ch in chapters:
        rows.append((ch["base"], ch["updated"], "monthly", "0.8"))
        rows += [(t["url"], ch["updated"], "monthly", "0.7") for t in ch["flat"]]
        rows.append((ch["base"] + "rapid-recall.html", ch["updated"], "monthly", "0.6"))
    block = "\n  <!-- notes:begin -->\n" + "\n".join(
        f"  <url><loc>{BASE}{u}</loc><lastmod>{d}</lastmod><changefreq>{f}</changefreq><priority>{p}</priority></url>" for u, d, f, p in rows) + "\n  <!-- notes:end -->"
    txt = txt.replace("</urlset>", block.lstrip("\n") + "\n</urlset>")
    sm.write_text(txt, encoding="utf-8")
    return len(rows)


def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def main():
    chapters = load_chapters()
    n = 0
    for ch in chapters:
        base = ROOT / ch["base"].strip("/")
        write(base / "index.html", build_chapter(ch))
        write(base / "rapid-recall.html", build_rapid(ch))
        for i, t in enumerate(ch["flat"]):
            write(base / (t["slug"] + ".html"), build_topic(ch, t, i))
            n += 1
    write(OUT / "index.html", build_hub(chapters))
    write(OUT / "search-index.json", build_search(chapters))
    rows = patch_sitemap(chapters)
    print(f"built {len(chapters)} chapter(s), {n} topic pages, {rows} sitemap rows")


if __name__ == "__main__":
    sys.exit(main())
