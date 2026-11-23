"""Shared chrome for the CUET PG (LL.M.) section. Mirrors the AILET pages (same head, header, tabs, footer, theme picker,
embed hook and follow-floats) so a change here changes every page. Standard library only."""
import json, html

SITE = "https://netlawverse.in"
NTA = "https://exams.nta.nic.in/cuet-pg/"
MODIFIED = "2026-11-22"
OG = SITE + "/clat-pg/og-clat-mock.png"
esc = lambda s: html.escape(str(s), quote=True)

TABS = [("index.html", "CUET PG"), ("what-is-cuet-pg.html", "What is CUET PG LLM"), ("syllabus.html", "Syllabus"),
        ("analysis.html", "Paper analysis"), ("universities.html", "Universities"), ("practice.html", "Practice"),
        ("practice.html#mocks", "Mock tests"), ("practice.html#mistakes", "Revision"), ("faq.html", "FAQ"),
        ("/blog/?q=cuet", "Articles")]

NAV = ('<nav class="cm-nav" aria-label="Exams"><a href="/">All exams</a><a href="../clat-pg/">CLAT PG</a>'
       '<a href="../ailet/">AILET</a><a href="./" aria-current="page">CUET PG</a><a href="../aibe/">AIBE</a></nav>')

THEMES = '''<div class="themes" role="group" aria-label="Colour theme"><span>Theme</span>
<button class="sw" data-t="violet" style="background:linear-gradient(135deg,#bfa8ff,#8de3ee)" aria-label="Violet theme"></button>
<button class="sw" data-t="ocean" style="background:linear-gradient(135deg,#8fd8ff,#9aa8ff)" aria-label="Ocean theme"></button>
<button class="sw" data-t="mint" style="background:linear-gradient(135deg,#8fe8c4,#8fc7ff)" aria-label="Mint theme"></button>
<button class="sw" data-t="sunset" style="background:linear-gradient(135deg,#ff9eb5,#ffa86b)" aria-label="Sunset theme"></button>
<button class="sw" data-t="sunny" style="background:linear-gradient(135deg,#ffd23f,#ff8fa8)" aria-label="Sunny theme"></button></div>
<script>(function(){var b=document.querySelectorAll('.sw');function mark(){var c=document.documentElement.getAttribute('data-theme');for(var i=0;i<b.length;i++)b[i].setAttribute('aria-pressed',b[i].dataset.t===c)}
for(var i=0;i<b.length;i++)b[i].onclick=function(){var t=this.dataset.t;document.documentElement.setAttribute('data-theme',t);try{localStorage.setItem('clat-theme',t)}catch(e){}mark()};mark()})();</script>'''

FOLLOW = '<script>if(!/[?&]embed=1/.test(location.search)){["/nl-follow-float.js","/nl-lead-float.js","/nl-appbar.js"].forEach(function(u){var s=document.createElement("script");s.src=u;s.defer=true;document.body.appendChild(s)})}</script>'

FOOT = '''<div class="cm-foot" role="contentinfo">
  <p><a href="/about.html">About</a><a href="faq.html">CUET PG FAQ</a><a href="/blog/?q=cuet">Articles</a><a href="https://www.instagram.com/netlawverse/" rel="noopener">Instagram</a><a href="mailto:netlawverse@gmail.com">Contact</a></p>
  <p class="fine">NET Law-Verse is an independent preparation site and is not affiliated with the National Testing Agency or any university. Questions here are original practice material, not taken from any official paper. Dates, fees, syllabus and the list of participating universities change every cycle: always confirm them in the CUET (PG) Information Bulletin on <a href="https://exams.nta.nic.in/cuet-pg/" rel="noopener">exams.nta.nic.in/cuet-pg</a> and on each university's own admission page. Progress is saved only in this browser.</p>
</div>'''


def ld(*items):
    return '<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@graph": list(items)}, ensure_ascii=False) + '</script>'


def crumbs(*pairs):
    items = [{"@type": "ListItem", "position": 1, "name": "NET Law-Verse", "item": SITE + "/"},
             {"@type": "ListItem", "position": 2, "name": "CUET PG LL.M.", "item": SITE + "/cuet-pg/"}]
    for i, (n, u) in enumerate(pairs):
        items.append({"@type": "ListItem", "position": i + 3, "name": n, "item": SITE + u})
    return {"@type": "BreadcrumbList", "itemListElement": items}


def faq_ld(qas):
    return {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in qas]}


def page(path, title, desc, body, active, schema=(), extra_head='', extra_script='', body_class='cu-page', first_tab=None):
    url = SITE + "/cuet-pg/" + ("" if path == "index.html" else path)
    tabs = "".join('<a class="cu-tab" href="%s"%s>%s</a>' % (h, ' aria-current="page"' if h == active else '', t) for h, t in TABS)
    nav = NAV if path == "index.html" else NAV
    return f'''<!DOCTYPE html>
<html lang="en-IN">
<head>
<script src="cuet-embed.js"></script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
<meta name="theme-color" content="#bfa8ff">
<meta property="og:type" content="website"><meta property="og:site_name" content="NET Law-Verse"><meta property="og:locale" content="en_IN">
<meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}"><meta property="og:url" content="{url}">
<meta property="og:image" content="{OG}"><meta name="twitter:card" content="summary_large_image">
{ld(*schema)}
<link rel="icon" href="/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../clat-pg/clat-mock.css">{extra_head}<link rel="stylesheet" href="cuet.css"><link rel="stylesheet" href="../watermark.css">

<script>(function(){{var ok=['violet','ocean','mint','sunset','sunny'],t='violet';try{{var s=localStorage.getItem('clat-theme');if(ok.indexOf(s)>-1)t=s}}catch(e){{}}document.documentElement.setAttribute('data-theme',t)}})();</script>
</head>
<body class="{body_class}">
<a class="skip" href="#main">Skip to content</a><div id="live" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
<div class="shapes" aria-hidden="true"><i class="shape s1"></i><i class="shape s2"></i></div>
<div class="wrap wide">
<header class="cm-head">
  <a class="brand" href="/" aria-label="NET Law-Verse home"><span class="logo">NL</span><span><b>NET Law-Verse</b><small>The universe of law</small></span></a>
  {nav}
</header>
<nav class="cu-tabs" aria-label="CUET PG sections">{tabs}</nav>
<main id="main" tabindex="-1" class="cu-main">

{body}
</main>
{FOOT}
</div>
{THEMES}
{extra_script}
{FOLLOW}
</body>
</html>
'''


def hero(pill, h1a, h1b, lead):
    return f'<section class="cu-hero"><div><span class="pill">{pill}</span><h1>{h1a} <span>{h1b}</span></h1></div>\n<p class="lead">{lead}</p></section>'


def table(rows, head=None, cls=''):
    h = '<thead><tr>' + ''.join('<th>%s</th>' % c for c in head) + '</tr></thead>' if head else ''
    b = ''.join('<tr>' + ''.join('<td>%s</td>' % c for c in r) + '</tr>' for r in rows)
    return f'<div class="cu-tblw"><table class="cu-tbl{(" " + cls) if cls else ""}">{h}<tbody>{b}</tbody></table></div>'


OFF = '<span class="cu-mark">OFFICIAL</span>'
REP = '<span class="cu-mark rep">REPORTED</span>'
EDI = '<span class="cu-mark ed">EDITORIAL</span>'
