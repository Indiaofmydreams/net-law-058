#!/usr/bin/env python3
"""Build the NET Law-Verse blog.  Run from the site root:   python3 _tools/build_blog.py

Reads   blog/_src/<slug>.html      one file per post: a JSON block in an HTML comment, then the article body
Writes  blog/<slug>.html           finished post pages
        blog/index.html            blog home (search, categories, saved posts)
        blog/posts.json            list of posts (used by blog/latest.js)
        blog/feed.xml              RSS feed
        sitemap-blog.xml           blog-only sitemap (listed in robots.txt)
        sitemap.xml                blog URLs added / refreshed (everything else untouched)
Standard library only. Safe to re-run any time. See blog/HOW-TO-WRITE-POSTS.md."""
import json, re, sys, html, datetime, pathlib, hashlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "blog" / "_src"
OUT = ROOT / "blog"
SITE = "https://netlawverse.in"
IG = "https://www.instagram.com/netlawverse/"
LI = "https://www.linkedin.com/in/net-law-verse-82264b445/"
TODAY = datetime.date.today()
CATS = ["UGC NET Updates", "Legal Current Affairs", "Preparation Guides"]
def _v(name):
    return hashlib.md5((ROOT / "blog" / name).read_bytes()).hexdigest()[:8]
esc = lambda s: html.escape(str(s), quote=True)

HEADER = (ROOT / "_tools/blog/header.html").read_text(encoding="utf-8")
FOOTER = (ROOT / "_tools/blog/footer.html").read_text(encoding="utf-8")

def fdate(d):
    return datetime.date.fromisoformat(d).strftime("%-d %b %Y")

def slugify(t):
    t = re.sub(r"<[^>]+>", "", t)
    t = re.sub(r"&[a-z#0-9]+;", "", t)
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")[:60] or "section"

# ---------- icons ----------
I = {
 "ig": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5.2"/><circle cx="12" cy="12" r="4.1"/><circle cx="17.3" cy="6.7" r=".7" fill="currentColor"/></svg>',
 "li": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9.75h4V21H3V9.75zM9.5 9.75h3.8v1.54h.05c.53-1 1.82-2.04 3.75-2.04 4 0 4.75 2.63 4.75 6.05V21h-4v-4.9c0-1.17-.02-2.67-1.63-2.67-1.63 0-1.88 1.27-1.88 2.59V21h-4V9.75z"/></svg>',
 "cal": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
 "clock": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 "aa": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 19l5-13 5 13M5 14h6M15 19l3.5-9 3.5 9M16.2 16h4.6"/></svg>',
 "listen": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14v-2a8 8 0 0116 0v2"/><rect x="2.5" y="13" width="4.5" height="7" rx="2"/><rect x="17" y="13" width="4.5" height="7" rx="2"/></svg>',
 "mark": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z"/></svg>',
 "share": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/></svg>',
 "focus": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V5a1 1 0 011-1h4M20 9V5a1 1 0 00-1-1h-4M4 15v4a1 1 0 001 1h4M20 15v4a1 1 0 01-1 1h-4"/></svg>',
 "wa": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11.5a8 8 0 01-11.8 7L4 20l1.5-4.1A8 8 0 1120 11.5z"/><path d="M9 9.2c.3 2.200 2.600 4.500 5 5.300l1.200-1.300-1.700-.9-.8.6c-.9-.4-1.700-1.200-2.100-2.100l.6-.8-.9-1.700z" fill="currentColor" stroke="none"/></svg>',
 "tg": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.5 3.3L2.7 10.600c-1.300.5-1.300 1.300-.2 1.600l4.800 1.500 1.800 5.600c.2.600.4.800.9.800.4 0 .6-.2.900-.4l2.300-2.200 4.800 3.500c.9.500 1.500.2 1.700-.8L22.900 4.900c.3-1.300-.5-1.900-1.400-1.600zM8.700 13.200l9.600-6c.5-.3.900-.1.500.2l-7.800 7-.3 3.300-2-4.500z"/></svg>',
 "link": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 005.700 0l3-3a4 4 0 10-5.700-5.700l-1 1M14 10a4 4 0 00-5.700 0l-3 3a4 4 0 105.700 5.700l1-1"/></svg>',
 "print": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a1 1 0 01-1-1v-6a2 2 0 012-2h14a2 2 0 012 2v6a1 1 0 01-1 1h-2"/><rect x="6" y="14" width="12" height="7" rx="1"/></svg>',
 "search": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.500-3.500"/></svg>',
 "dl": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 20h14"/></svg>',
 "img": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 9"/></svg>',
}

# ---------- shared blocks ----------
def follow_block():
    tiles = [
        ("t-p1", "P1", "Paper 1 Mock Tests", "UGC NET Paper 1 full mock tests, free.", "/mock-test-14.html"),
        ("t-p2", "P2", "Paper 2 (Law 058) Mocks", "UGC NET Law 100-question mock tests.", "/mock-test-1.html"),
        ("t-n", "N", "Study Notes", "Detailed chapter notes for Paper 1 and Law (058).", "/notes/"),
        ("t-x", "PYQ", "Previous Year Questions", "Past NET papers to practise the real pattern.", "/pyq.html"),
        ("t-x", "CUT", "Cut-off (Law) Trend", "How cut-offs have moved over the years.", "/cutoff.html"),
        ("t-x", "PLAN", "Study Plans", "2-week, 1-month, 3-month and 6-month plans.", "/ugc-net-law-preparation-plan.html"),
        ("t-pg", "PG", "CLAT PG Practice", "Practice arena with trap-explained questions.", "/clat-pg/practice.html"),
        ("t-pg", "PG", "CLAT Case Vault", "Landmark cases: facts, issue, held, principle.", "/clat-pg/landmark-cases.html"),
        ("t-bar", "BAR", "AIBE Notes", "Detailed part-wise notes and mocks.", "/aibe-2027.html"),
    ]
    t = "".join(f'<a class="bl-tile {c}" href="{u}"><span class="bl-tag">{tg}</span><span class="bl-tx"><b>{esc(n)}</b><span>{esc(d)}</span></span></a>' for c, tg, n, d, u in tiles)
    return f'''<section class="bl-follow" aria-labelledby="bl-follow-h" id="follow">
  <div class="bl-wrap">
    <p class="bl-eyebrow">STAY IN THE LOOP</p>
    <h2 id="bl-follow-h">Never miss an exam update</h2>
    <p class="bl-follow-lead">Exam notices, legal current affairs and free MCQs, posted where you already scroll. Follow once and your preparation stays on track. Everything on NET Law-Verse is free, with no sign-up.</p>
    <div class="bl-soc">
      <div class="bl-card ig">
        <div class="bl-card-h"><span class="bl-ico ig">{I["ig"]}</span><h3>Instagram<small>@netlawverse</small></h3></div>
        <p>Quick-revision cards, exam alerts and daily law updates you can read in a minute.</p>
        <div class="bl-act">
          <a class="bl-cta ig" href="{IG}" target="_blank" rel="noopener noreferrer">{I["ig"]}<span>Follow on Instagram</span></a>
          <span class="bl-qr"><img src="/instagram-qr.png" width="112" height="129" loading="lazy" alt="QR code for the NET Law-Verse Instagram profile"><span>Or scan with your phone camera</span></span>
        </div>
      </div>
      <div class="bl-card li">
        <div class="bl-card-h"><span class="bl-ico li">{I["li"]}</span><h3>LinkedIn<small>NET Law-Verse</small></h3></div>
        <p>Exam news, study notes and career updates for UGC NET aspirants, law students and young lawyers.</p>
        <div class="bl-act">
          <a class="bl-cta li" href="{LI}" target="_blank" rel="noopener noreferrer">{I["li"]}<span>Connect on LinkedIn</span></a>
          <a class="bl-cta ghost" href="https://wa.me/?text={esc("Free UGC NET Law (058) preparation: mock tests, MCQs and notes. https://netlawverse.in/blog/")}" target="_blank" rel="noopener noreferrer">{I["wa"]}<span>Share with a friend</span></a>
        </div>
      </div>
    </div>
    <div class="bl-imp">
      <h3>Important links</h3>
      <div class="bl-tiles">{t}</div>
    </div>
    <div class="bl-poster">
      <button type="button" class="bl-thumb" data-bl-poster aria-label="Open the NET Law-Verse quick-links card"><img src="/blog/netlawverse-quick-links-sm.webp" width="380" height="538" loading="lazy" alt="NET Law-Verse quick-links card with QR codes for CLAT PG Practice, Case Vault, Paper 1 and Paper 2 mocks, Study Notes and AIBE Notes"></button>
      <div class="bl-ptxt">
        <h3>One-tap quick-links card</h3>
        <p>Every key section of the site on one card, each with its own QR code. Open it, save it to your phone, or send it to your study group.</p>
        <button type="button" class="bl-cta ghost sm" data-bl-poster>{I["img"]}<span>Open the card</span></button>
        <a class="bl-cta ghost sm" href="/blog/netlawverse-quick-links.png" download="NET-Law-Verse-quick-links.png">{I["dl"]}<span>Download</span></a>
      </div>
    </div>
    <dialog class="bl-dlg" id="bl-poster-dlg" aria-label="NET Law-Verse quick-links card">
      <img src="/blog/netlawverse-quick-links.webp" width="1252" height="1772" loading="lazy" alt="NET Law-Verse quick-links card. Tap any card in the PDF version, or scan its QR code, to open that section of netlawverse.in.">
      <div class="bl-dact"><a class="bl-cta ghost sm" href="/blog/netlawverse-quick-links.png" download="NET-Law-Verse-quick-links.png">{I["dl"]}<span>Download PNG</span></a><button type="button" class="bl-x" data-bl-close>Close</button></div>
    </dialog>
  </div>
</section>'''

def nudge():
    return f'''<aside class="bl-nudge" aria-label="Follow NET Law-Verse"><div class="bl-nudge-t"><b>Enjoying this? Get the next update first.</b><span>Exam alerts and quick revision, free on Instagram and LinkedIn.</span></div><div class="bl-nudge-a"><a class="bl-cta ig sm" href="{IG}" target="_blank" rel="noopener noreferrer">{I["ig"]}<span>Instagram</span></a><a class="bl-cta li sm" href="{LI}" target="_blank" rel="noopener noreferrer">{I["li"]}<span>LinkedIn</span></a></div></aside>'''

HEAD_COMMON = '''  <script>try{var t=localStorage.getItem("nlv-theme");document.documentElement.setAttribute("data-theme",["violet","ocean","mint","sunset","sunny"].indexOf(t)>-1?t:"violet")}catch(e){document.documentElement.setAttribute("data-theme","violet")}</script>
  <script>try{var p=JSON.parse(localStorage.getItem("nlb-prefs")||"{}"),r=document.documentElement,F={sans:'"Manrope",system-ui,sans-serif',serif:'Georgia,"Iowan Old Style","Times New Roman",serif',easy:'"Atkinson Hyperlegible",Verdana,sans-serif'},L={tight:1.55,normal:1.75,loose:2.05},W={narrow:"56ch",medium:"68ch",wide:"84ch"};if(p.s)r.style.setProperty("--bl-scale",(Math.max(80,Math.min(200,+p.s))/100).toFixed(2));if(L[p.l])r.style.setProperty("--bl-lh",L[p.l]);if(W[p.w])r.style.setProperty("--bl-measure",W[p.w]);if(F[p.f])r.style.setProperty("--bl-font",F[p.f])}catch(e){}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/disclaimer.css">
  <link rel="stylesheet" href="/blog/blog.css?v=''' + _v("blog.css") + '''">
  <link rel="alternate" type="application/rss+xml" title="NET Law-Verse Blog" href="/blog/feed.xml">
<link rel="manifest" href="/manifest.json">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/icons/icon.svg" type="image/svg+xml" sizes="any">
<link rel="icon" href="/icons/favicon-48.png" type="image/png" sizes="48x48">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">'''

SCRIPTS = '''<script src="/disclaimer.js" defer></script>
<script src="/blog/blog.js?v=''' + _v("blog.js") + '''" defer></script>'''

def seo(title, desc, url, typ, image="/og-site.png", extra=""):
    img = SITE + image
    return f'''  <title>{esc(title)}</title>
  <meta name="description" content="{esc(desc)}">
  <link rel="canonical" href="{url}">
  <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
  <meta name="theme-color" content="#bfa8ff" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#14183a" media="(prefers-color-scheme: dark)">
  <meta property="og:type" content="{typ}">
  <meta property="og:site_name" content="NET Law-Verse">
  <meta property="og:locale" content="en_IN">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(desc)}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{img}">
  <meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{esc(title)}">
  <meta name="twitter:description" content="{esc(desc)}">
  <meta name="twitter:image" content="{img}">{extra}'''

# ---------- load posts ----------
def load_posts():
    posts = []
    for f in sorted(SRC.glob("*.html")):
        if f.name.startswith("_"):
            continue
        raw = f.read_text(encoding="utf-8")
        m = re.match(r"\s*<!--(.*?)-->\s*(.*)$", raw, re.S)
        if not m:
            sys.exit(f"{f.name}: must start with a <!-- {{JSON}} --> block")
        try:
            meta = json.loads(m.group(1))
        except json.JSONDecodeError as e:
            sys.exit(f"{f.name}: bad JSON in the top comment: {e}")
        for k in ("title", "description", "date", "category"):
            if not meta.get(k):
                sys.exit(f"{f.name}: missing '{k}'")
        meta.setdefault("updated", meta["date"]); meta.setdefault("tags", [])
        meta.setdefault("related", []); meta.setdefault("sources", []); meta.setdefault("faq", [])
        if meta["category"] not in CATS:
            print(f"note: {f.name}: category '{meta['category']}' is new; it will get its own chip")
        meta["slug"] = f.stem; meta["body"] = m.group(2).strip()
        words = len(re.sub(r"<[^>]+>", " ", meta["body"]).split())
        meta["mins"] = max(1, round(words / 200))
        posts.append(meta)
    posts.sort(key=lambda p: (p["updated"], p["date"]), reverse=True)
    return posts

def process_body(body):
    used = set(); toc = []
    def hid(m):
        tag, attrs, inner = m.group(1), m.group(2), m.group(3)
        idm = re.search(r'id="([^"]+)"', attrs)
        i = idm.group(1) if idm else slugify(inner)
        base, n = i, 2
        while i in used:
            i = f"{base}-{n}"; n += 1
        used.add(i)
        toc.append((tag, i, re.sub(r"<[^>]+>", "", inner)))
        attrs = re.sub(r'\s*id="[^"]*"', "", attrs)
        return f'<{tag} id="{i}"{attrs}>{inner}</{tag}>'
    body = re.sub(r"<(h[23])([^>]*)>(.*?)</\1>", hid, body, flags=re.S)
    body = re.sub(r'(?<!<div class="bl-tablewrap">)(<table.*?</table>)', r'<div class="bl-tablewrap">\1</div>', body, flags=re.S)
    return body, toc

def insert_nudge(body):
    hs = [m.start() for m in re.finditer(r"<h2[ >]", body)]
    return body[:hs[2]] + nudge() + body[hs[2]:] if len(hs) >= 3 else body

def bar(slug, title):
    return f'''<div class="bl-bar" role="toolbar" aria-label="Reading tools">
    <div class="bl-grp" role="group" aria-label="Text size">
      <button type="button" class="bl-btn a-sm" id="bl-minus" aria-label="Smaller text" title="Smaller text (-)">A&minus;</button>
      <span class="bl-pct" data-pct aria-live="polite">100%</span>
      <button type="button" class="bl-btn a-lg" id="bl-plus" aria-label="Larger text" title="Larger text (+)">A+</button>
    </div>
    <button type="button" class="bl-btn" id="bl-set-btn" title="Reading settings" aria-label="Reading settings" aria-expanded="false" aria-controls="bl-set">{I["aa"]}<span class="bl-lab">Reading settings</span></button>
    <button type="button" class="bl-btn" id="bl-listen" title="Listen to this article" aria-label="Listen to this article" aria-pressed="false" hidden>{I["listen"]}<span class="bl-lab">Listen</span></button>
    <span class="bl-sp"></span>
    <button type="button" class="bl-btn" data-save="{esc(slug)}" data-title="{esc(title)}" aria-pressed="false">{I["mark"]}<span class="bl-lab">Save</span></button>
    <button type="button" class="bl-btn" id="bl-share-btn" title="Share" aria-label="Share this article" aria-expanded="false" aria-controls="bl-share">{I["share"]}<span class="bl-lab">Share</span></button>
    <button type="button" class="bl-btn" id="bl-focus" aria-pressed="false" title="Focus mode: hide menus and distractions" aria-label="Focus mode">{I["focus"]}<span class="bl-lab">Focus</span></button>
    <div class="bl-player" id="bl-player" role="group" aria-label="Read aloud controls">
      <button type="button" class="bl-btn" id="bl-prev" aria-label="Previous paragraph">&laquo;</button>
      <button type="button" class="bl-btn" id="bl-pp">Pause</button>
      <button type="button" class="bl-btn" id="bl-next" aria-label="Next paragraph">&raquo;</button>
      <button type="button" class="bl-btn" id="bl-stop">Stop</button>
      <label class="bl-sr" for="bl-rate">Reading speed</label>
      <select id="bl-rate"><option value="0.8">0.8x</option><option value="1" selected>1x</option><option value="1.25">1.25x</option><option value="1.5">1.5x</option></select>
      <output id="bl-now" aria-live="off"></output>
    </div>
    <div class="bl-pop" id="bl-set" hidden role="group" aria-label="Reading settings">
      <h2>Reading settings</h2>
      <div class="bl-row"><label for="bl-size">Text size <span data-pct>100%</span></label><input class="bl-range" id="bl-size" type="range" min="80" max="200" step="5" value="100"></div>
      <div class="bl-row"><span class="bl-lab">Font</span><div class="bl-seg" data-pref="f"><button type="button" value="sans">Sans</button><button type="button" value="serif">Serif</button><button type="button" value="easy">Easy read</button></div></div>
      <div class="bl-row"><span class="bl-lab">Line spacing</span><div class="bl-seg" data-pref="l"><button type="button" value="tight">Tight</button><button type="button" value="normal">Normal</button><button type="button" value="loose">Roomy</button></div></div>
      <div class="bl-row"><span class="bl-lab">Column width</span><div class="bl-seg" data-pref="w"><button type="button" value="narrow">Narrow</button><button type="button" value="medium">Medium</button><button type="button" value="wide">Wide</button></div></div>
      <button type="button" class="bl-reset" id="bl-reset">Reset to default</button>
    </div>
    <div class="bl-pop" id="bl-share" hidden role="group" aria-label="Share this article">
      <h2>Share this article</h2>
      <div class="bl-share">
        <a id="bl-wa" href="#" target="_blank" rel="noopener noreferrer">{I["wa"]}WhatsApp</a>
        <a id="bl-tg" href="#" target="_blank" rel="noopener noreferrer">{I["tg"]}Telegram</a>
        <a id="bl-li" href="#" target="_blank" rel="noopener noreferrer">{I["li"]}LinkedIn</a>
        <button type="button" id="bl-copy">{I["link"]}<span>Copy link</span></button>
        <button type="button" id="bl-native" hidden>{I["share"]}<span>More apps</span></button>
        <button type="button" id="bl-print">{I["print"]}<span>Print or save as PDF</span></button>
      </div>
    </div>
  </div>'''

def cat_order(posts):
    return [c for c in CATS if any(p["category"] == c for p in posts)] + sorted({p["category"] for p in posts} - set(CATS))

def side_list(posts, current=None):
    """Compact list of all posts grouped by category (sidebar, like a table of contents)."""
    out = ""
    for c in cat_order(posts):
        items = [p for p in posts if p["category"] == c]
        li = ""
        for p in items:
            cur = ' aria-current="page"' if p["slug"] == current else ""
            new = ' <b class="bl-newdot" title="New">NEW</b>' if (TODAY - datetime.date.fromisoformat(p["updated"])).days <= 7 else ""
            text = esc(" ".join([p["title"], p["description"], p["category"]] + p["tags"]).lower())
            li += f'<li class="bl-si" data-slug="{esc(p["slug"])}" data-cat="{esc(c)}" data-text="{text}"><a href="/blog/{p["slug"]}.html"{cur}>{esc(p["title"])}{new}</a><small>{fdate(p["updated"])} &middot; {p["mins"]} min</small></li>'
        out += f'<section class="bl-sg" data-cat="{esc(c)}"><h3>{esc(c)} <small>{len(items)}</small></h3><ul class="bl-pl">{li}</ul></section>'
    return out

def build_post(p, posts):
    url = f"{SITE}/blog/{p['slug']}.html"
    body, toc = process_body(p["body"])
    body = insert_nudge(body)
    srcs = ""
    if p["sources"]:
        srcs = '<div class="bl-sources"><h2>Sources</h2><ul>' + "".join(f'<li><a href="{esc(s["u"])}" target="_blank" rel="noopener noreferrer">{esc(s["t"])}</a></li>' for s in p["sources"]) + "</ul></div>"
    faq = ""
    if p["faq"]:
        faq = "<h2 id=\"faqs\">Frequently asked questions</h2>" + "".join(f"<details><summary>{esc(q['q'])}</summary><div><p>{q['a']}</p></div></details>" for q in p["faq"])
        toc.append(("h2", "faqs", "Frequently asked questions"))
    tocl = "".join(f'<li class="l{tag[1]}"><a href="#{i}">{esc(x)}</a></li>' for tag, i, x in toc)
    allp = side_list(posts, p["slug"])
    toc_side = f'<aside class="bl-toc" aria-label="Contents and all posts">' + (f'<h2>On this page</h2><ol>{tocl}</ol>' if toc else "") + f'<h2 class="bl-h2b"><a href="/blog/">All posts</a></h2>{allp}</aside>'
    toc_m = (f'<details class="bl-toc-m"><summary>On this page</summary><ol>{tocl}</ol></details>' if toc else "") + f'<details class="bl-toc-m bl-allm"><summary>All posts ({len(posts)})</summary><div class="bl-allin">{allp}</div></details>'
    rel = ""
    if p["related"]:
        rel = '<section class="bl-practice" aria-labelledby="bl-pr-h"><h2 id="bl-pr-h">Practise what you just read</h2><p>Free on NET Law-Verse, no sign-up.</p><div class="bl-links">' + "".join(f'<a href="{esc(r["u"])}"><b>{esc(r["t"])}</b><span>{esc(r.get("d",""))}</span></a>' for r in p["related"]) + "</div></section>"
    i = posts.index(p)
    newer = posts[i - 1] if i > 0 else None
    older = posts[i + 1] if i + 1 < len(posts) else None
    pn = ""
    if newer or older:
        pn = '<nav class="bl-pn" aria-label="More articles">' + (f'<a href="/blog/{older["slug"]}.html"><small>&larr; Previous</small><b>{esc(older["title"])}</b></a>' if older else "<span></span>") + (f'<a class="nx" href="/blog/{newer["slug"]}.html"><small>Next &rarr;</small><b>{esc(newer["title"])}</b></a>' if newer else "<span></span>") + "</nav>"
    upd = f'<li class="bl-upd">Updated {fdate(p["updated"])}</li>' if p["updated"] != p["date"] else ""
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "BlogPosting", "@id": url + "#article", "mainEntityOfPage": url, "headline": p["title"], "description": p["description"],
         "datePublished": p["date"], "dateModified": p["updated"], "inLanguage": "en-IN", "articleSection": p["category"],
         "keywords": ", ".join(p["tags"]), "image": SITE + p.get("image", "/og-site.png"),
         "author": {"@type": "Organization", "name": "NET Law-Verse", "url": SITE + "/"},
         "publisher": {"@type": "Organization", "name": "NET Law-Verse", "url": SITE + "/", "logo": {"@type": "ImageObject", "url": SITE + "/icons/icon-512.png"}}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": SITE + "/blog/"},
            {"@type": "ListItem", "position": 3, "name": p["title"], "item": url}]}]}
    if p["faq"]:
        ld["@graph"].append({"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q["q"], "acceptedAnswer": {"@type": "Answer", "text": re.sub(r"<[^>]+>", "", q["a"])}} for q in p["faq"]]})
    ldj = json.dumps(ld, ensure_ascii=False)
    return f'''<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
{seo(p["title"] + " | NET Law-Verse", p["description"], url, "article", p.get("image", "/og-site.png"), chr(10) + f'  <meta property="article:published_time" content="{p["date"]}"><meta property="article:modified_time" content="{p["updated"]}"><meta property="article:section" content="{esc(p["category"])}">')}
{HEAD_COMMON}
  <script type="application/ld+json">{ldj}</script>
</head>
<body class="bl">
<a class="skip" href="#main">Skip to content</a>
<div id="live" class="bl-sr" role="status" aria-live="polite" aria-atomic="true"></div>
<div class="bl-progress" aria-hidden="true"><i></i></div>
{HEADER}
<main id="main">
  <div class="bl-wrap">
    <nav class="bl-crumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">&rsaquo;</span><a href="/blog/">Blog</a><span aria-hidden="true">&rsaquo;</span><span aria-current="page">{esc(p["category"])}</span></nav>
    <article id="bl-article" itemscope itemtype="https://schema.org/BlogPosting">
      <header class="bl-head">
        <a class="bl-cat" href="/blog/?q={esc(p["category"].split()[0].lower())}">{esc(p["category"])}</a>
        <h1 itemprop="headline">{esc(p["title"])}</h1>
        <p class="bl-dek">{esc(p["description"])}</p>
        <ul class="bl-meta"><li>{I["cal"]}<time datetime="{p["date"]}" itemprop="datePublished">{fdate(p["date"])}</time></li>{upd}<li>{I["clock"]}{p["mins"]} min read</li><li>By NET Law-Verse</li></ul>
      </header>
      {bar(p["slug"], p["title"])}
      <div class="bl-grid">
        {toc_side}
        <div>
          {toc_m}
          <div class="bl-body" id="bl-body" itemprop="articleBody">
{body}
{faq}
{srcs}
          </div>
          <div class="bl-after">{rel}{pn}</div>
        </div>
      </div>
    </article>
  </div>
</main>
{follow_block()}
{FOOTER}
{SCRIPTS}
</body>
</html>
'''

def build_index(posts):
    cats = cat_order(posts)
    chips = '<button type="button" class="bl-chip" data-cat="all" aria-pressed="true">All</button>' + "".join(f'<button type="button" class="bl-chip" data-cat="{esc(c)}" aria-pressed="false">{esc(c)}</button>' for c in cats) + f'<button type="button" class="bl-chip" data-cat="saved" aria-pressed="false">Saved</button>'
    rows = ""
    for p in posts[:5]:
        new = (TODAY - datetime.date.fromisoformat(p["updated"])).days <= 7
        rows += f'''<article class="bl-row">
        <div class="bl-row-top"><span class="bl-cat">{esc(p["category"])}</span>{'<span class="bl-new">NEW</span>' if new else ''}<button type="button" class="bl-save" data-save="{esc(p["slug"])}" data-title="{esc(p["title"])}" aria-pressed="false"><span class="bl-lab bl-sr">Save</span>{I["mark"]}</button></div>
        <h3><a href="/blog/{p["slug"]}.html">{esc(p["title"])}</a></h3>
        <p>{esc(p["description"])}</p>
        <ul class="bl-meta"><li>{I["cal"]}{'Updated ' if p["updated"] != p["date"] else ''}{fdate(p["updated"])}</li><li>{I["clock"]}{p["mins"]} min read</li></ul>
      </article>
'''
    url = SITE + "/blog/"
    title = "UGC NET Law Blog: Exam Updates, Legal Current Affairs & Study Guides"
    desc = "Free UGC NET Law (058) and Paper 1 blog: latest NTA exam updates, legal current affairs with MCQs, and practical study guides. No sign-up."
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Blog", "@id": url + "#blog", "url": url, "name": "NET Law-Verse Blog", "description": desc, "inLanguage": "en-IN",
         "publisher": {"@type": "Organization", "name": "NET Law-Verse", "url": SITE + "/"},
         "blogPost": [{"@type": "BlogPosting", "headline": p["title"], "url": f"{SITE}/blog/{p['slug']}.html", "datePublished": p["date"], "dateModified": p["updated"]} for p in posts]},
        {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"}, {"@type": "ListItem", "position": 2, "name": "Blog", "item": url}]}]}
    return f'''<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
{seo(title + " | NET Law-Verse", desc, url, "website")}
{HEAD_COMMON}
  <script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
<body class="bl">
<a class="skip" href="#main">Skip to content</a>
<div id="live" class="bl-sr" role="status" aria-live="polite" aria-atomic="true"></div>
{HEADER}
<main id="main">
  <section class="bl-hero slim">
    <div class="bl-wrap">
      <p class="bl-eyebrow">THE NET LAW-VERSE BLOG</p>
      <h1>What's new for <span>UGC NET Law</span></h1>
      <p>Exam updates from NTA, legal current affairs and study guides. Free, always.</p>
    </div>
  </section>
  <div class="bl-wrap bl-split">
    <aside class="bl-side" aria-label="All posts">
      <h2>All posts <span id="bl-count" aria-live="polite">{len(posts)}</span></h2>
      <div class="bl-search"><label class="bl-sr" for="bl-q">Search posts</label>{I["search"]}<input id="bl-q" type="search" placeholder="Search posts" autocomplete="off"></div>
      <div class="bl-chips" role="group" aria-label="Filter by category">{chips}</div>
      <div class="bl-sgs">{side_list(posts)}</div>
      <p class="bl-empty" id="bl-empty" hidden></p>
    </aside>
    <div class="bl-latest">
      <h2 class="bl-lh">Latest</h2>
      {rows}
    </div>
  </div>
</main>
{follow_block()}
{FOOTER}
{SCRIPTS}
</body>
</html>
'''

def build_feed(posts):
    items = "".join(f'''<item><title>{html.escape(p["title"])}</title><link>{SITE}/blog/{p["slug"]}.html</link><guid>{SITE}/blog/{p["slug"]}.html</guid><pubDate>{datetime.datetime.fromisoformat(p["updated"]).strftime("%a, %d %b %Y 06:00:00 +0530")}</pubDate><category>{html.escape(p["category"])}</category><description>{html.escape(p["description"])}</description></item>''' for p in posts[:30])
    return f'<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>NET Law-Verse Blog</title><link>{SITE}/blog/</link><description>UGC NET Law (058) exam updates, legal current affairs and study guides.</description><language>en-IN</language>{items}</channel></rss>'

def update_sitemap(posts):
    sm = ROOT / "sitemap.xml"
    s = sm.read_text(encoding="utf-8")
    s = re.sub(r"\s*<url><loc>https://netlawverse\.in/blog/[^<]*</loc>.*?</url>", "", s)
    last = max(p["updated"] for p in posts)
    rows = f'\n  <url><loc>{SITE}/blog/</loc><lastmod>{last}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>'
    for p in posts:
        rows += f'\n  <url><loc>{SITE}/blog/{p["slug"]}.html</loc><lastmod>{p["updated"]}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>'
    s = s.replace("</urlset>", rows + "\n</urlset>")
    sm.write_text(s, encoding="utf-8")
    (ROOT / "sitemap-blog.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + rows + "\n</urlset>\n", encoding="utf-8")


def main():
    posts = load_posts()
    if not posts:
        sys.exit("No posts found in blog/_src/")
    for p in posts:
        (OUT / f"{p['slug']}.html").write_text(build_post(p, posts), encoding="utf-8")
    (OUT / "index.html").write_text(build_index(posts), encoding="utf-8")
    (OUT / "feed.xml").write_text(build_feed(posts), encoding="utf-8")
    (OUT / "posts.json").write_text(json.dumps([{k: p[k] for k in ("slug", "title", "description", "date", "updated", "category", "mins")} for p in posts], ensure_ascii=False, indent=1), encoding="utf-8")
    update_sitemap(posts)
    print(f"Built {len(posts)} post(s), blog/index.html, feed.xml, posts.json, sitemap-blog.xml, sitemap.xml")

if __name__ == "__main__":
    main()
