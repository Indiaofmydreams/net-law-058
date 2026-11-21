#!/usr/bin/env python3
"""
build_aibe_notes.py : generates the static AIBE Notes section of NET Law-Verse.

    python3 _tools/build_aibe_notes.py          (run from anywhere; paths are relative to this file)

Reads   _notes-data/aibe/registry.json            which data file covers which syllabus subject(s)
        _notes-data/aibe/<part file>.json          the notes (one file per writing batch)
        _notes-data/aibe/seo-titles.json           optional short SEO titles per chapter
Writes  aibe/notes/index.html                      hub: all 19 subjects in syllabus order + search
        aibe/notes/<subject>/index.html            subject page: exam intelligence + chapter list
        aibe/notes/<subject>/<chapter>.html        one page per chapter (the reader)
        aibe/notes/<subject>/highlights.html       curated highlights, chapter by chapter
        aibe/notes/<subject>/latest-developments.html
        aibe/notes/<subject>/rapid-revision.html   numbers, article cheat sheet, case one-liners
        aibe/notes/<subject>/quick-mcqs.html       self-test
        aibe/notes/my-notes.html                   reader's own highlights, doubts, progress (noindex)
        aibe/notes/notes-index.json                search index
        sitemap.xml                                only the block between the aibe-notes:begin / end markers

Needs Python 3.8+ and nothing else. Output is plain HTML: no build step on the server.
The UI never says "Part 1/2/...": notes are filed under the 19 syllabus subjects.
"""
import html
import json
import math
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / '_notes-data' / 'aibe'
OUT = ROOT / 'aibe' / 'notes'
SITE = 'https://netlawverse.in'
TODAY = '2026-11-19'
OG = SITE + '/aibe/notes/og-aibe-notes.png'

# The 19 AIBE subjects, in syllabus order (names and marks as on aibe/syllabus.html).
SUBJECTS = [
    (1, 'Constitutional Law', 'constitutional-law', 10),
    (2, 'Indian Penal Code / Bharatiya Nyaya Sanhita', 'ipc-bns', 8),
    (3, 'Criminal Procedure Code / Bharatiya Nagarik Suraksha Sanhita', 'crpc-bnss', 10),
    (4, 'Code of Civil Procedure and Limitation', 'cpc-limitation', 10),
    (5, 'Evidence Act / Bharatiya Sakshya Adhiniyam', 'evidence-bsa', 8),
    (6, 'Alternative Dispute Resolution', 'adr', 4),
    (7, 'Family Law', 'family-law', 8),
    (8, 'Public Interest Litigation', 'pil', 4),
    (9, 'Administrative Law', 'administrative-law', 3),
    (10, 'Professional Ethics and Professional Misconduct', 'professional-ethics', 4),
    (11, 'Company Law', 'company-law', 2),
    (12, 'Environmental Law', 'environmental-law', 2),
    (13, 'Cyber Law', 'cyber-law', 2),
    (14, 'Labour and Industrial Law', 'labour-industrial-law', 4),
    (15, 'Torts, Motor Vehicles Act and Consumer Protection', 'torts-mv-act-consumer-protection', 5),
    (16, 'Taxation', 'taxation', 4),
    (17, 'Contract, Specific Relief, Property and Negotiable Instruments', 'contract-property-ni-act', 8),
    (18, 'Land Acquisition', 'land-acquisition', 2),
    (19, 'Intellectual Property Laws', 'intellectual-property-laws', 2),
]
SHORT = {6: 'ADR and Arbitration', 8: 'PIL', 14: 'Labour Law', 1: 'Constitutional Law', 2: 'IPC / BNS', 3: 'CrPC / BNSS', 4: 'CPC and Limitation', 5: 'Evidence / BSA',
         10: 'Professional Ethics', 15: 'Torts, MV Act, CPA', 17: 'Contract and Property', 19: 'IP Laws'}

PRI = {  # priority text in the data -> (label, css class)
    'VERY HIGH': ('Very high yield', 'p1'), 'HIGH': ('High yield', 'p2'), 'MEDIUM-HIGH': ('Medium-high yield', 'p3'),
    'MEDIUM': ('Medium yield', 'p4'), 'LOW-MEDIUM': ('Low-medium yield', 'p5'), 'LOW': ('Low yield', 'p5'),
}

# Cross-references in the source data point at the writing batches ("Part 9 PIL"). Readers never see batches,
# so they are rewritten to the subject name. Anything left over is reported at build time.
PART_FIXES = [
    (r'\[Cross-ref: Part 9 PIL\.\]', '[Cross-ref: Public Interest Litigation.]'),
    (r'\[Cross-ref: Part 10 Taxation\.\]', '[Cross-ref: Taxation.]'),
    (r'\[Cross-ref: Part 8 Administrative Law\.\]', '[Cross-ref: Administrative Law.]'),
    (r'Cross-refer CrPC/BNSS \(Part 2\)\.', 'Cross-refer CrPC/BNSS.'),
    (r'\(cross-ref Part 2\)', '(cross-ref CrPC/BNSS)'),
    (r'Cross-reference to Part 10 \(Labour Law\)\.', 'Cross-reference to Labour Law.'),
    (r'\[Cross-ref Part 6 Family Law\.\]', '[Cross-ref: Family Law.]'),
    (r'\[Cross-ref Part 5 Evidence\.\]', '[Cross-ref: Evidence / BSA.]'),
    (r'\[Cross-ref Part 7 \(NI Act\), Part 9 \(ADR\)\.\]', '[Cross-ref: Negotiable Instruments Act, ADR.]'),
    (r' \(cross-ref Part 10\)', ''),
    (r' \(cross-ref Part 4\)', ' (cross-ref IPC / BNS)'),
    (r'Cross-over with Part 1:', 'Cross-over with Constitutional Law:'),
    (r'across Part 7:', 'across this subject:'),
    (r'within Part 7\.', 'within this subject.'),
    (r' - see Part 5\.', ' - see the Evidence / BSA notes.'),
    (r'\(see Part 5\)', '(see the Evidence / BSA notes)'),
    (r' - see Part 8\.', ' - see the Consumer Protection notes.'),
    (r'the 10-part plan divides it into ten blocks of 10 questions each\. Part 4 = 8 questions from IPC/BNS \+ 2 from Company Law\.',
     'IPC / BNS carries about 8 questions and Company Law about 2.'),
    (r'Civil/Criminal procedure \(Parts 2 and 3\)', 'Civil/Criminal procedure (CrPC/BNSS, CPC)'),
    (r'Contract and NI Act \(Part 7\)', 'Contract and NI Act'),
    (r'Administrative Law \(Part 8\)', 'Administrative Law'),
    (r'Company Law \(Part 4\)', 'Company Law'),
    (r'Family Law \(Part 6\)', 'Family Law'),
    (r'Tort/Consumer/MV Act \(Part 8\)', 'Tort/Consumer/MV Act'),
    (r'Intellectual Property \(Part 8\)', 'Intellectual Property'),
    (r'Constitution \(Part 1\)', 'Constitutional Law'),
    (r'Arbitration and ADR \(Part 6\)', 'Arbitration and ADR'),
    (r'Overlaps: Part 1 \(', 'Overlaps: Constitutional Law ('),
    (r', Part 2 \(prosecution procedure\)', ', CrPC/BNSS (prosecution procedure)'),
    (r', Part 7 \(NI Act, Contract\)', ', Contract and NI Act'),
    (r', Part 6 \(Arbitration/ADR - stamp duty\)', ', ADR (stamp duty)'),
    (r', Part 8 \(Tort/Consumer; IP\)', ', Torts and Consumer Protection, IP'),
    (r', Part 9 \(PIL, Admin Law - delegated legislation, natural justice\)', ', PIL and Administrative Law (delegated legislation, natural justice)'),
    (r'cross-ref Part 1\)', 'cross-ref Constitutional Law)'),
    (r'cross-ref Part 1\.', 'cross-ref Constitutional Law.'),
    (r'Cross-reference to Part 2\b', 'Cross-reference to CrPC/BNSS'),
    (r'\[Cross-ref Part 1\.\]', '[Cross-ref: Constitutional Law.]'),
    (r'\(cross-ref Part 6 ADR\)', '(cross-ref ADR)'),
    (r'\(cross-ref Part 2 BNSS', '(cross-ref BNSS'),
    (r'Cross-over with Part 6\.', 'Cross-over with ADR.'),
    (r'see Part 8 IP module', 'see the Intellectual Property notes'),
    (r', Part 2 \(compounding, plea bargaining, privileges\)', ', CrPC/BNSS (compounding, plea bargaining, privileges)'),
    (r', Part 3 \(CPC s\.89', ', CPC (s.89'),
    (r', Part 7 \(arbitration agreement as contract; stamp duty\)', ', Contract (arbitration agreement as contract; stamp duty)'),
    (r', Part 8 \(Consumer mediation; administrative law and PIL\)', ', Consumer Protection (mediation) and Administrative Law'),
    (r', Part 10 \(Industrial conciliation; stamp duty\)', ', Labour Law (industrial conciliation; stamp duty)'),
    (r'\[Cross-ref Part 6\.\]', '[Cross-ref: Family Law.]'),
    (r' \(Part \d+\)', ''),
]

E = lambda s: html.escape(str(s), quote=False)
A = lambda s: html.escape(str(s), quote=True)


def slugify(s, maxlen=70):
    s = re.sub(r'\(.*?\)', ' ', s.lower())
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    if len(s) > maxlen:
        s = s[:maxlen].rsplit('-', 1)[0]
    return s


def clean_parts(t):
    for a, b in PART_FIXES:
        t = re.sub(a, b, t)
    return t


def nice_range(s):
    return re.sub(r'\s*to\s*', '–', str(s))


def trim(s, n):
    s = re.sub(r'\s+', ' ', s).strip()
    if len(s) <= n:
        return s
    return s[:n - 1].rsplit(' ', 1)[0].rstrip(',;: -') + '…'


def fmt_date(iso):
    y, m, d = iso.split('-')
    mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][int(m) - 1]
    return '%d %s %s' % (int(d), mon, y)


# ---------------------------------------------------------------- inline formatting
W = r"(?:[A-Z][\w.&'’\-]*|of|and|the|for|&)"
GENERIC_CASE = r"%s(?:\s%s){0,4}\sv\.\s%s(?:\s%s){0,4}" % (W, W, W, W)
ART = (r"\bArts?\.?\s\d+[A-Z]{0,2}(?:\([a-zA-Z0-9]+\))*"
       r"(?:(?:-|–|\s(?:and|to)\s)\d+[A-Z]{0,2}(?:\([a-zA-Z0-9]+\))*)*")
LEAD_JUNK = ('Overruled', 'Upheld', 'Applied', 'See', 'Held', 'Struck', 'Following', 'Compare', 'Cf', 'In', 'The',
             'And', 'Also', 'Seven', 'Nine', 'Five', 'Eleven', 'Thirteen', 'Cases', 'Case', 'Bench', 'Judges')


def make_formatter(case_names):
    known, known_short = set(), set()
    for c in case_names:
        base = re.sub(r'\s*\(.*?\)', '', c).strip()
        for v in (base, c):
            if len(v) > 8:
                known.add(E(v))
        short = re.split(r' v\.? ', base)[0].strip()
        if len(short) >= 11 and ' ' in short and short.split(' ')[0] not in ('State', 'Union', 'In', 'Special', 'Commissioner', 'Supreme', 'Govt'):
            known_short.add(E(short))
    known_alt = '|'.join(re.escape(k) for k in sorted(known, key=len, reverse=True)) or r'(?!x)x'
    # a short name ("Subramanian Swamy") is italicised alone only when no "v. ..." follows, so full names stay whole
    short_alt = '|'.join(re.escape(k) for k in sorted(known_short, key=len, reverse=True)) or r'(?!x)x'
    rx = re.compile(r'(?P<vf>\[VERIFY[^\]]*\])|(?P<art>%s)|(?P<case>%s|%s|(?:%s)(?! v\.? ))' % (ART, known_alt, GENERIC_CASE, short_alt))

    def sub(m):
        if m.group('vf'):
            inner = re.sub(r'^\[VERIFY\s*|\]$', '', m.group('vf')).strip()
            lab = 'Verify' + (' · ' + inner if inner else '')
            return ('<span class="nn-vf" title="Reported by press or secondary sources. Check the official judgment, '
                    'gazette or BCI notice before the exam.">%s</span>' % lab)
        if m.group('art'):
            return '<span class="nn-art">%s</span>' % m.group('art')
        c = m.group('case')
        words = c.split(' ')
        lead = ''
        while words and words[0] in LEAD_JUNK and re.search(r' v\.? ', ' '.join(words)):
            lead += words.pop(0) + ' '
        return lead + '<i class="nn-case">%s</i>' % ' '.join(words)

    def fmt(t):
        return rx.sub(sub, E(clean_parts(t)))
    return fmt


def split_label(t):
    """'Art 12: State includes ...' -> ('Art 12', 'State includes ...'). Only short, sentence-free lead-ins."""
    i = t.find(': ')
    if 0 < i <= 90 and '. ' not in t[:i]:
        return t[:i], t[i + 2:]
    return None, t


# ---------------------------------------------------------------- data loading
def load_data():
    reg = json.loads((DATA / 'registry.json').read_text(encoding='utf-8'))
    seo = {}
    if (DATA / 'seo-titles.json').exists():
        seo = json.loads((DATA / 'seo-titles.json').read_text(encoding='utf-8'))
    live = {}
    for entry in reg['files']:
        d = json.loads((DATA / entry['file']).read_text(encoding='utf-8'))
        nos = entry['subjects']
        if entry.get('adapter'):  # differently shaped batch: convert, nothing is shortened
            sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
            from aibe_adapters import ADAPTERS
            for no, dd in ADAPTERS[entry['adapter']](d).items():
                if dd['sections']:
                    live[no] = dd
            continue
        for k, no in enumerate(nos):
            def mine(items, key='subject_no'):
                out = []
                for it in items:
                    tag = it.get(key) if isinstance(it, dict) else None
                    if (tag is None and k == 0) or tag == no:
                        out.append(it)
                return out
            secs = [s for s in d['sections'] if (len(nos) == 1 or s.get('subject_no') == no)]
            if not secs:
                continue
            rr = d.get('rapid_revision', {}) if k == 0 else {}
            live[no] = dict(
                meta=d['meta'], exam=d.get('exam_intelligence', {}) if k == 0 else {}, sections=secs,
                dev=mine(d.get('latest_developments', [])), rr=rr, mcq=mine(d.get('mcq_bank', [])))
    return live, seo


# ---------------------------------------------------------------- page chrome
def pref(depth):
    """prefixes from a page that sits `depth` folders below /aibe/notes/"""
    notes = '../' * depth
    return dict(notes=notes, aibe=notes + '../', site=notes + '../../')


def head(title, desc, path, depth, ld, *, kind='article', robots=None, modified=None, prev=None, nxt=None):
    p = pref(depth)
    url = SITE + path
    robots = robots or 'index,follow,max-snippet:-1,max-image-preview:large'
    extra = ''
    if prev:
        extra += '<link rel="prev" href="%s">' % A(prev)
    if nxt:
        extra += '<link rel="next" href="%s">' % A(nxt)
    mod = ('<meta property="article:modified_time" content="%s"><meta property="article:section" content="AIBE Notes">'
           % modified) if kind == 'article' and modified else ''
    ldjson = ''.join('<script type="application/ld+json">%s</script>' % json.dumps(x, ensure_ascii=False) for x in ld)
    return f'''<!DOCTYPE html>
<html lang="en-IN">
<head>
<script src="{p['aibe']}aibe-embed.js"></script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(title)}</title>
<meta name="description" content="{A(desc)}">
<meta name="author" content="NET Law-Verse">
<link rel="canonical" href="{url}">
<meta name="robots" content="{robots}">
<meta name="theme-color" content="#bfa8ff">
<meta property="og:type" content="{'article' if kind == 'article' else 'website'}"><meta property="og:site_name" content="NET Law-Verse"><meta property="og:locale" content="en_IN">
<meta property="og:title" content="{A(title)}"><meta property="og:description" content="{A(desc)}"><meta property="og:url" content="{url}">
<meta property="og:image" content="{OG}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="AIBE Notes by NET Law-Verse">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{A(title)}"><meta name="twitter:description" content="{A(desc)}"><meta name="twitter:image" content="{OG}">
{mod}{extra}
{ldjson}
<link rel="icon" href="/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{p['site']}clat-pg/clat-mock.css"><link rel="stylesheet" href="{p['aibe']}aibe.css"><link rel="stylesheet" href="{p['site']}watermark.css"><link rel="stylesheet" href="{p['notes']}notes.css">
<script>(function(){{var ok=['violet','ocean','mint','sunset','sunny'],t='violet';try{{var s=localStorage.getItem('clat-theme');if(ok.indexOf(s)>-1)t=s}}catch(e){{}}document.documentElement.setAttribute('data-theme',t)}})();</script>
</head>
'''


def top(depth, crumbs):
    p = pref(depth)
    bc = ''.join(('<a href="%s">%s</a>' % (h, E(t))) if h else '<span aria-current="page">%s</span>' % E(t) for t, h in crumbs)
    bc = '<span class="sep" aria-hidden="true">›</span>'.join(
        ('<a href="%s">%s</a>' % (h, E(t))) if h else '<span aria-current="page">%s</span>' % E(t) for t, h in crumbs)
    return f'''<a class="skip" href="#main">Skip to content</a><div id="live" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
<div class="shapes" aria-hidden="true"><i class="shape s1"></i><i class="shape s2"></i></div>
<div class="nn-bar" aria-hidden="true"><i id="nn-bar"></i></div>
<div class="wrap wide">
<header class="cm-head">
  <a class="brand" href="/" aria-label="NET Law-Verse home"><span class="logo">NL</span><span><b>NET Law-Verse</b><small>The universe of law</small></span></a>
  <nav class="cm-nav" aria-label="Exams"><a href="/">All exams</a><a href="{p['site']}clat-pg/">CLAT PG</a><a href="{p['site']}ailet/">AILET</a><a href="{p['aibe']}" aria-current="page">AIBE</a></nav>
</header>
<nav class="al-tabs" aria-label="AIBE sections"><a class="al-tab" href="{p['aibe']}index.html">AIBE</a><a class="al-tab" href="{p['aibe']}what-is-aibe.html">What is AIBE</a><a class="al-tab" href="{p['aibe']}syllabus.html">Syllabus</a><a class="al-tab" href="{p['notes']}" aria-current="page">Notes</a><a class="al-tab" href="{p['aibe']}practice.html">Practice</a><a class="al-tab" href="{p['aibe']}practice.html#mocks">Mock tests</a><a class="al-tab" href="{p['aibe']}practice.html#mistakes">Revision</a><a class="al-tab" href="{p['aibe']}faq.html">FAQ</a></nav>
<nav class="nn-crumbs" aria-label="Breadcrumb">{bc}</nav>
'''


def bottom(depth, page, extra_attrs='', floats=False):
    p = pref(depth)
    fl = ('<script>if(!/[?&]embed=1/.test(location.search)){["/nl-follow-float.js","/nl-lead-float.js","/nl-appbar.js"].forEach(function(u){var s=document.createElement("script");s.src=u;s.defer=true;document.body.appendChild(s)})}</script>'
          if floats else
          '<script>if(!/[?&]embed=1/.test(location.search)){var dl=document.createElement("link");dl.rel="stylesheet";dl.href="/disclaimer.css";document.head.appendChild(dl);["/disclaimer.js","/nl-appbar.js"].forEach(function(u){var s=document.createElement("script");s.src=u;s.defer=true;document.body.appendChild(s)})}</script>')
    return f'''<div class="nn-pfoot" aria-hidden="true">NET Law-Verse · netlawverse.in/aibe/notes · Free AIBE notes · Study aid, not legal advice</div>
<div class="cm-foot" role="contentinfo">
  <p><a href="/about.html">About</a><a href="{p['aibe']}faq.html">AIBE FAQ</a><a href="https://www.instagram.com/netlawverse/" rel="noopener">Instagram</a><a href="mailto:netlawverse@gmail.com">Contact</a></p>
  <p class="fine">NET Law-Verse is an independent preparation site and is not affiliated with the Bar Council of India. These notes are a study aid and not legal advice. Exam rules, dates and pass marks change between editions: always confirm them with the <a href="https://www.barcouncilofindia.org/" rel="noopener">Bar Council of India</a> notification. Highlights, doubts and progress are saved only in this browser.</p>
</div>
</div>
<div class="themes" role="group" aria-label="Colour theme"><span>Theme</span>
<button class="sw" data-t="violet" style="background:linear-gradient(135deg,#bfa8ff,#8de3ee)" aria-label="Violet theme"></button>
<button class="sw" data-t="ocean" style="background:linear-gradient(135deg,#8fd8ff,#9aa8ff)" aria-label="Ocean theme"></button>
<button class="sw" data-t="mint" style="background:linear-gradient(135deg,#8fe8c4,#8fc7ff)" aria-label="Mint theme"></button>
<button class="sw" data-t="sunset" style="background:linear-gradient(135deg,#ff9eb5,#ffa86b)" aria-label="Sunset theme"></button>
<button class="sw" data-t="sunny" style="background:linear-gradient(135deg,#ffd23f,#ff8fa8)" aria-label="Sunny theme"></button></div>
<script>(function(){{var b=document.querySelectorAll('.sw');function mark(){{var c=document.documentElement.getAttribute('data-theme');for(var i=0;i<b.length;i++)b[i].setAttribute('aria-pressed',b[i].dataset.t===c)}}
for(var i=0;i<b.length;i++)b[i].onclick=function(){{var t=this.dataset.t;document.documentElement.setAttribute('data-theme',t);try{{localStorage.setItem('clat-theme',t)}}catch(e){{}}mark()}};mark()}})();</script>
<script src="{p['notes']}notes.js" defer></script>
{fl}
</body>
</html>
'''


def body_open(page, **attrs):
    a = ''.join(' data-nn-%s="%s"' % (k.replace('_', '-'), A(v)) for k, v in attrs.items())
    return '<body class="al-page nn-page" data-nn="%s"%s>\n' % (page, a)


def brandbar(label, updated, ver):
    return f'''<div class="nn-brandbar"><span class="nn-seal" aria-hidden="true">NL</span>
<span class="t"><b>NET Law-Verse</b> · AIBE Notes<small>{E(label)}</small></span>
<span class="chips"><span class="nn-chip ok">Free · no sign-up</span><span class="nn-chip">Updated {E(updated)}</span><span class="nn-chip">v{E(ver)}</span></span></div>'''


def about_card(updated, disclaimer_extra=''):
    return f'''<aside class="nn-about" aria-label="About these notes">
<div class="nn-seal lg" aria-hidden="true">NL</div>
<div><h2>Notes by NET Law-Verse</h2>
<p>Written for the AIBE and organised under the 19 subjects of the Bar Council of India syllabus. Updated {E(updated)}; later developments are not covered. Anything we could not confirm from an official source carries a <span class="nn-vf">Verify</span> tag: check it against the judgment, gazette or BCI notice before the exam.</p>
<p class="mut">Spotted an error or want something explained better? Select the text and press <b>Ask a doubt</b>. We read every one.</p>
<p class="links"><a class="btn sm" href="https://www.instagram.com/netlawverse/" rel="noopener">Follow @netlawverse</a><a class="btn sm" href="mailto:netlawverse@gmail.com">Email us</a></p></div></aside>'''


def breadcrumb_ld(items):
    return {'@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': u} for i, (n, u) in enumerate(items)]}


PUBLISHER = {'@type': 'Organization', 'name': 'NET Law-Verse', 'url': SITE + '/',
             'logo': {'@type': 'ImageObject', 'url': SITE + '/icon-512.png'}}


# ---------------------------------------------------------------- builders
def rapid_blocks(blocks, fmt):
    """Generic rapid-revision renderer: list / table / pairs / groups / qa blocks."""
    out = []
    for b in blocks:
        h = '<section class="nn-sec" id="%s"><h2><span class="nn-ic" aria-hidden="true">%s</span>%s</h2>' % (b['id'], E(b.get('icon', '§')), E(b['title']))
        if b.get('intro'):
            h += '<p class="mut">%s</p>' % fmt(b['intro'])
        k = b['kind']
        if k == 'list':
            h += '<ul class="nn-oneline">%s</ul>' % ''.join('<li>%s</li>' % fmt(x) for x in b['items'])
        elif k == 'table':
            tid = 'nn-t-' + b['id']
            if b.get('filter'):
                h += '<label class="nn-search"><span class="sr-only">Filter</span><input type="search" data-ftbl="%s" placeholder="Filter this table" autocomplete="off"></label>' % tid
            h += '<div class="al-tblw"><table class="al-tbl nn-tbl" id="%s"><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % (
                tid, ''.join('<th scope="col">%s</th>' % E(c) for c in b['cols']),
                ''.join('<tr>%s</tr>' % ''.join('<td>%s</td>' % fmt(c) for c in r) for r in b['rows']))
        elif k == 'pairs':
            h += '<dl class="nn-pairs">%s</dl>' % ''.join('<div><dt>%s</dt><dd>%s</dd></div>' % (fmt(a), fmt(c)) for a, c in b['pairs'])
        elif k == 'groups':
            h += ''.join('<h3 class="nn-gh">%s</h3><ul class="nn-oneline">%s</ul>' % (fmt(a), ''.join('<li>%s</li>' % fmt(x) for x in items)) for a, items in b['groups'])
        elif k == 'qa':
            h += ''.join('<article class="nn-scn"><p><b>Scenario:</b> %s</p><p class="nn-ans-s"><b>Answer:</b> %s</p>%s</article>' % (
                fmt(x['scenario']), fmt(x['answer']), ('<p class="mut"><b>Rule:</b> %s</p>' % fmt(x['rule'])) if x.get('rule') else '') for x in b['items'])
        out.append(h + '</section>')
    return '\n'.join(out)


def build_subject(no, name, slug, marks, D, seo, fmt, sitemap, index_rows):
    meta, exam, secs = D['meta'], D['exam'], D['sections']
    upd = fmt_date(meta['prepared_as_of'])
    ver = meta.get('version', '1.0')
    secs = sorted(secs, key=lambda s: s['order'])
    for i, s in enumerate(secs):
        s['_n'] = i + 1
        st = (seo.get(slug) or {}).get(str(i + 1))
        s['_seo'] = st or trim(re.sub(r'\s*\(.*?\)', '', s['title']), 52)
        s['_slug'] = slugify(s['_seo'])
        words = sum(len(x.split()) for x in s.get('must_know', [])) + len(s.get('overview', '').split()) + \
            sum(len(c['held'].split()) + len(c['case'].split()) for c in s.get('landmark_cases', []))
        s['_min'] = max(2, math.ceil(words / 190))
        s['_url'] = s['_slug'] + '.html'
    sdir = OUT / slug
    sdir.mkdir(parents=True, exist_ok=True)
    for old in sdir.glob('*.html'):  # never leave pages from an earlier build (renamed chapters) behind
        old.unlink()
    short = SHORT.get(no, name)
    n_ch = len(secs)
    base = '/aibe/notes/%s/' % slug
    has_rev = [('highlights.html', 'Highlights', 'highlights', True), ('rapid-revision.html', 'Rapid revision', 'rapid', bool(D['rr'])),
               ('latest-developments.html', 'Latest developments', 'dev', bool(D['dev'])), ('quick-mcqs.html', 'Quick MCQs', 'mcq', bool(D['mcq']))]

    def navbar(cur, idx=None):
        """Sticky chapter navigation: all chapters, prev/next, chapter switcher, revision links."""
        h = '<nav class="nn-nav" aria-label="Chapter navigation"><a class="nn-nb all" href="./" title="All chapters"><span aria-hidden="true">&#9776;</span><i>All chapters</i></a>'
        if idx is not None:
            pv = secs[idx - 1] if idx else None
            nx = secs[idx + 1] if idx + 1 < n_ch else None
            h += ('<a class="nn-nb prev" rel="prev" href="%s" title="Previous: %s"><span aria-hidden="true">&larr;</span><i>Prev</i></a>' % (pv['_url'], A(pv['_seo']))) if pv else '<span class="nn-nb prev off"><span aria-hidden="true">&larr;</span><i>Prev</i></span>'
            lab = '<b>Chapter %d</b> of %d <span class="t">%s</span>' % (idx + 1, n_ch, E(secs[idx]['_seo']))
        else:
            lab = '<b>%s</b> <span class="t">Jump to a chapter</span>' % E(cur)
        h += '<details class="nn-sw"><summary>%s</summary><div class="nn-swp"><p class="nn-swh">Chapters</p><ol>' % lab
        for k, c in enumerate(secs):
            h += '<li><a href="%s" data-slug="%s"%s><span class="n">%d</span><span class="tt">%s</span><span class="tk" aria-hidden="true"></span></a></li>' % (
                c['_url'], c['_slug'], ' aria-current="page"' if idx == k else '', k + 1, E(c['_seo']))
        h += '</ol><p class="nn-swh">Revision</p><div class="nn-swr">'
        for u, lbl, key, ok in has_rev:
            if ok:
                h += '<a href="%s"%s>%s</a>' % (u, ' aria-current="page"' if cur == lbl else '', lbl)
        h += '<a href="../my-notes.html">My highlights</a></div></div></details>'
        if idx is not None:
            nx = secs[idx + 1] if idx + 1 < n_ch else None
            h += ('<a class="nn-nb next" rel="next" href="%s" title="Next: %s"><i>Next</i><span aria-hidden="true">&rarr;</span></a>' % (nx['_url'], A(nx['_seo']))) if nx else '<a class="nn-nb next" href="highlights.html" title="Revise the highlights"><i>Highlights</i><span aria-hidden="true">&rarr;</span></a>'
        return h + '</nav>'

    crumbs_ld = [('NET Law-Verse', SITE + '/'), ('AIBE', SITE + '/aibe/'), ('Notes', SITE + '/aibe/notes/')]

    # ---------- chapter pages
    for i, s in enumerate(secs):
        pri_lbl, pri_cls = PRI.get(s['priority'], (s['priority'].title(), 'p4'))
        prev_s = secs[i - 1] if i else None
        next_s = secs[i + 1] if i + 1 < n_ch else None
        pts, toc = [], [('overview', 'Overview')]
        for j, t in enumerate(s.get('must_know', [])):
            lab, rest = split_label(t)
            lead = '<b class="nn-lbl">%s</b> ' % fmt(lab) if lab else ''
            if lab:
                lead = '<b class="nn-lbl">%s:</b> ' % fmt(lab)
            bid = 'm%d' % (j + 1)
            pts.append(f'<li class="nn-pt" id="{bid}"><div class="nn-bl" data-b="{bid}">{lead}{fmt(rest)}</div>'
                       f'<button class="nn-q" type="button" data-doubt="{bid}" aria-label="Ask a doubt on this point" title="Ask a doubt">?</button></li>')
        toc.append(('must-know', 'Must know (%d points)' % len(pts)))
        kp = ''.join('<tr><td data-b="k%dr">%s</td><td data-b="k%dc">%s</td></tr>' % (k, fmt(x['ref']), k, fmt(x['content']))
                     for k, x in enumerate(s.get('key_provisions', [])))
        if kp:
            toc.append(('provisions', 'Key provisions'))
        cs = ''.join(
            f'<article class="nn-case-card"><header><h3>{fmt(c["case"])}</h3><span class="nn-yr">{E(c["year"])}</span></header>'
            f'<p class="nn-held" data-b="c{k}">{fmt(c["held"])}</p></article>' for k, c in enumerate(s.get('landmark_cases', [])))
        if cs:
            toc.append(('cases', 'Landmark cases (%d)' % len(s['landmark_cases'])))
        mn = ''.join(f'<li class="nn-memo" data-b="n{k}">{fmt(x)}</li>' for k, x in enumerate(s.get('mnemonics', [])))
        if mn:
            toc.append(('memory', 'Memory aids'))
        tr = ''.join(f'<li class="nn-trap" data-b="t{k}"><span class="nn-tag">Trap</span><span>{fmt(x)}</span></li>'
                     for k, x in enumerate(s.get('exam_traps', [])))
        if tr:
            toc.append(('traps', 'Exam traps'))
        pq = ''.join(f'<li data-b="q{k}">{fmt(x)}</li>' for k, x in enumerate(s.get('probable_questions', [])))
        if pq:
            toc.append(('likely', 'Likely questions'))
        arts = s.get('articles', '')
        sec = lambda id_, h, icon, inner, cls='': (
            f'<section class="nn-sec {cls}" id="{id_}" aria-labelledby="h-{id_}"><h2 id="h-{id_}"><span class="nn-ic" aria-hidden="true">{icon}</span>{h}</h2>{inner}</section>')
        article = f'''<article class="nn-article" data-wm>
{sec('overview', 'Overview', 'i', f'<p class="nn-lede" data-b="ov">{fmt(s["overview"])}</p>')}
{sec('must-know', 'Must know', '★', '<ol class="nn-pts">%s</ol>' % ''.join(pts))}
{sec('provisions', 'Key provisions', '§', '<div class="al-tblw"><table class="al-tbl nn-tbl"><thead><tr><th scope="col">Provision</th><th scope="col">What it says</th></tr></thead><tbody>%s</tbody></table></div>' % kp) if kp else ''}
{sec('cases', 'Landmark cases', '⚖', '<div class="nn-cases">%s</div>' % cs) if cs else ''}
{sec('memory', 'Memory aids', '✎', '<ul class="nn-memos">%s</ul>' % mn) if mn else ''}
{sec('traps', 'Exam traps', '!', '<ul class="nn-traps">%s</ul>' % tr) if tr else ''}
{sec('likely', 'Likely questions', '?', '<ol class="nn-likely">%s</ol><p class="mut">These are the question shapes this chapter most often feeds. Test yourself in the <a href="quick-mcqs.html">quick MCQs</a> or the <a href="../../practice.html">Practice Arena</a>.</p>' % pq) if pq else ''}
</article>'''
        toc_html = ''.join('<li><a href="#%s">%s</a></li>' % (a, E(b)) for a, b in toc)
        nav = '<nav class="nn-pn" aria-label="Chapter navigation">'
        nav += ('<a class="prev" href="%s"><small>← Previous chapter</small><b>%s</b></a>' % (prev_s['_url'], E(prev_s['_seo']))) if prev_s else \
            '<a class="prev" href="./"><small>← Back</small><b>All chapters in %s</b></a>' % E(short)
        nav += ('<a class="next" href="%s"><small>Next chapter →</small><b>%s</b></a>' % (next_s['_url'], E(next_s['_seo']))) if next_s else \
            '<a class="next" href="highlights.html"><small>Finished the chapters →</small><b>Revise the highlights</b></a>'
        nav += '</nav>'
        title = next((c for c in (s['_seo'] + ' | AIBE Notes | NET Law-Verse', s['_seo'] + ' | AIBE Notes') if len(c) <= 64), s['_seo'])
        ov = re.sub(r'\s+', ' ', clean_parts(s['overview']))
        desc = trim('%s AIBE %s notes: key provisions, landmark cases, traps and likely questions. Free.' % (ov, short), 158)
        url = SITE + base + s['_url']
        ld = [{'@context': 'https://schema.org', '@graph': [
            {'@type': 'Article', 'headline': s['title'], 'name': title, 'description': desc, 'url': url, 'mainEntityOfPage': url,
             'inLanguage': 'en-IN', 'datePublished': meta['prepared_as_of'], 'dateModified': meta['prepared_as_of'],
             'author': PUBLISHER, 'publisher': PUBLISHER, 'image': OG, 'isAccessibleForFree': True,
             'articleSection': name, 'about': {'@type': 'Thing', 'name': name + ' (AIBE)'},
             'educationalUse': 'Exam preparation', 'learningResourceType': 'Study notes',
             'audience': {'@type': 'EducationalAudience', 'educationalRole': 'student'},
             'isPartOf': {'@type': 'CollectionPage', 'name': 'AIBE %s notes' % name, 'url': SITE + base},
             'wordCount': len(re.sub(r'<[^>]+>', ' ', article).split())},
            breadcrumb_ld(crumbs_ld + [(short, SITE + base), (s['_seo'], url)])]}]
        pg = head(title, desc, base + s['_url'], 1, ld, modified=meta['prepared_as_of'],
                  prev=prev_s['_url'] if prev_s else None, nxt=next_s['_url'] if next_s else None)
        pg += body_open('chapter', subject=slug, subject_name=name, chapter=s['_slug'], chapter_title=s['_seo'],
                        chapter_no=s['_n'], chapter_total=n_ch, url=base + s['_url'])
        pg += top(1, [('AIBE', '../../'), ('Notes', '../'), (short, './'), ('Chapter %d' % s['_n'], None)])
        pg += f'''<main id="main" tabindex="-1" class="al-main nn-main">
{brandbar('%s · Chapter %d of %d' % (name, s['_n'], n_ch), upd, ver)}
{navbar('chapter', i)}
<header class="nn-chead">
<div class="nn-no" aria-hidden="true">{s['_n']}</div>
<div class="nn-ct"><p class="nn-kick">{E(name)} · Chapter {s['_n']} of {n_ch}</p>
<h1>{E(s['title'])}</h1>
<div class="nn-meta"><span class="nn-pri {pri_cls}">{pri_lbl}</span>{('<span class="nn-chip">%s Qs expected</span>' % nice_range(s['expected_questions'])) if s.get('expected_questions') else ''}<span class="nn-chip">{s['_min']} min read</span>{('<span class="nn-chip art">%s</span>' % E(arts)) if arts else ''}</div></div>
<div class="nn-tools" role="group" aria-label="Reading tools">
<button class="btn sm" type="button" data-act="fs-" aria-label="Smaller text">A−</button><button class="btn sm" type="button" data-act="fs+" aria-label="Larger text">A+</button>
<button class="btn sm" type="button" data-act="print">Print / PDF</button><button class="btn sm" type="button" data-act="share">Share</button>
<button class="btn sm nn-readbtn" type="button" data-act="read" aria-pressed="false">Mark as read</button></div>
</header>
<div class="nn-layout">
<aside class="nn-toc" aria-label="On this page"><div class="nn-tocin"><p class="h">In this chapter</p><ol>{toc_html}</ol>
<p class="nn-tochl"><a href="highlights.html#c{s['_n']}">Chapter highlights →</a><a href="../my-notes.html">My highlights →</a></p>
<p class="nn-hint">Tip: select any text to highlight it or ask a doubt.</p></div></aside>
<div class="nn-col">
{article}
<div class="nn-end"><button class="btn nn-readbtn" type="button" data-act="read" aria-pressed="false">Mark chapter as read</button>
<button class="btn" type="button" data-doubt="">Ask a doubt on this chapter</button></div>
{nav}
{about_card(upd)}
</div></div>
</main>
'''
        pg += bottom(1, 'chapter')
        (sdir / s['_url']).write_text(pg, encoding='utf-8')
        sitemap.append((base + s['_url'], '0.8'))
        kw = ' '.join([s['title'], arts, s['overview'], ' '.join(c['case'] for c in s.get('landmark_cases', [])),
                       ' '.join(x['ref'] for x in s.get('key_provisions', [])), ' '.join(s.get('mnemonics', []))])
        index_rows.append(dict(s=name, sl=slug, n=s['_n'], t=s['_seo'], f=s['title'], u=slug + '/' + s['_url'],
                               a=arts, k=re.sub(r'\s+', ' ', clean_parts(kw)).lower()))

    # ---------- highlights (curated, chapter by chapter)
    hl = []
    for s in secs:
        pri_lbl, pri_cls = PRI.get(s['priority'], (s['priority'].title(), 'p4'))
        rows = ''.join('<tr><td>%s</td><td>%s</td></tr>' % (fmt(x['ref']), fmt(x['content'])) for x in s.get('key_provisions', []))
        prov = ('<div class="nn-hsub" data-kind="prov"><h3>Key provisions</h3><div class="al-tblw"><table class="al-tbl nn-tbl"><tbody>%s</tbody></table></div></div>' % rows) if rows else ''
        cases = ''.join('<li><b>%s</b> <span class="nn-yr">%s</span> %s</li>' % (fmt(c['case']), E(c['year']), fmt(c['held']))
                        for c in s.get('landmark_cases', []))
        cases = ('<div class="nn-hsub" data-kind="case"><h3>Cases in one line</h3><ul class="nn-oneline">%s</ul></div>' % cases) if cases else ''
        mm = ''.join('<li class="nn-memo">%s</li>' % fmt(x) for x in s.get('mnemonics', []))
        mm = ('<div class="nn-hsub" data-kind="memo"><h3>Memory aids</h3><ul class="nn-memos">%s</ul></div>' % mm) if mm else ''
        tt = ''.join('<li class="nn-trap"><span class="nn-tag">Trap</span><span>%s</span></li>' % fmt(x) for x in s.get('exam_traps', []))
        tt = ('<div class="nn-hsub" data-kind="trap"><h3>Exam traps</h3><ul class="nn-traps">%s</ul></div>' % tt) if tt else ''
        hl.append(f'''<section class="nn-hch" id="c{s['_n']}" aria-labelledby="hc{s['_n']}"><header><span class="nn-no sm" aria-hidden="true">{s['_n']}</span>
<div><h2 id="hc{s['_n']}">{E(s['title'])}</h2><div class="nn-meta"><span class="nn-pri {pri_cls}">{pri_lbl}</span><a class="nn-chip" href="{s['_url']}">Read the full chapter →</a></div></div></header>{prov}{cases}{mm}{tt}</section>''')
    jump = ''.join('<a href="#c%d" title="%s">%d</a>' % (s['_n'], A(s['_seo']), s['_n']) for s in secs)
    t = 'AIBE %s Highlights | NET Law-Verse' % short
    d = trim('All AIBE %s highlights in one place, chapter by chapter: key provisions, landmark cases in one line, memory aids and exam traps. Free.' % name, 158)
    ld = [{'@context': 'https://schema.org', '@graph': [
        {'@type': 'Article', 'headline': 'AIBE %s highlights' % name, 'description': d, 'url': SITE + base + 'highlights.html',
         'inLanguage': 'en-IN', 'datePublished': meta['prepared_as_of'], 'dateModified': meta['prepared_as_of'], 'author': PUBLISHER,
         'publisher': PUBLISHER, 'image': OG, 'isAccessibleForFree': True, 'learningResourceType': 'Revision sheet'},
        breadcrumb_ld(crumbs_ld + [(short, SITE + base), ('Highlights', SITE + base + 'highlights.html')])]}]
    pg = head(t, d, base + 'highlights.html', 1, ld, modified=meta['prepared_as_of'])
    pg += body_open('highlights', subject=slug, subject_name=name, chapter='highlights', chapter_title='Highlights', url=base + 'highlights.html')
    pg += top(1, [('AIBE', '../../'), ('Notes', '../'), (short, './'), ('Highlights', None)])
    pg += f'''<main id="main" tabindex="-1" class="al-main nn-main">
{brandbar('%s · Highlights' % name, upd, ver)}
{navbar('Highlights')}
<header class="nn-phead"><p class="nn-kick">{E(name)}</p><h1>Highlights, <span>chapter by chapter</span></h1>
<p class="lead">The part of every chapter you should still remember the night before the exam: provisions, cases in a line, memory aids and traps. Want your own? Highlight any text in a chapter and it collects in <a href="../my-notes.html">My highlights</a>.</p>
<div class="nn-filter" role="group" aria-label="Show"><button class="nn-fb on" data-f="all">All</button><button class="nn-fb" data-f="prov">Provisions</button><button class="nn-fb" data-f="case">Cases</button><button class="nn-fb" data-f="memo">Memory aids</button><button class="nn-fb" data-f="trap">Traps</button><button class="btn sm" data-act="print" type="button">Print / PDF</button></div>
<nav class="nn-jump" aria-label="Jump to chapter"><span>Chapter</span>{jump}</nav></header>
<div class="nn-wide" data-wm>{''.join(hl)}</div>
{about_card(upd)}
</main>
'''
    pg += bottom(1, 'highlights')
    (sdir / 'highlights.html').write_text(pg, encoding='utf-8')
    sitemap.append((base + 'highlights.html', '0.7'))

    # ---------- latest developments
    kinds = []
    if D['dev']:
        cards = []
        for k, x in enumerate(D['dev']):
            q = x.get('likely_question', '')
            m = re.match(r'^(.*\?)\s*\((.+)\)\s*$', q)
            qh = ''
            if m:
                qh = ('<div class="nn-qa"><p><b>Likely question:</b> %s</p><button class="btn sm" type="button" data-reveal>Show answer</button>'
                      '<p class="nn-ans" hidden><b>Answer:</b> %s</p></div>' % (fmt(m.group(1)), fmt(m.group(2))))
            elif q:
                qh = '<div class="nn-qa"><p><b>Likely question:</b> %s</p></div>' % fmt(q)
            cards.append(f'''<article class="nn-dev" id="d{k + 1}"><header><h2>{fmt(x['topic'])}</h2><span class="nn-chip">{fmt(x['date'])}</span></header>
<p>{fmt(x['summary'])}</p><p class="nn-why"><b>Why it matters:</b> {fmt(x['why_it_matters'])}</p>{qh}</article>''')
        t = 'AIBE %s: Latest Developments | NET Law-Verse' % short
        d = trim('Recent Supreme Court rulings, amendments and constitutional news that AIBE %s questions are built on, with the likely question for each. Free.' % name, 158)
        ld = [{'@context': 'https://schema.org', '@graph': [
            {'@type': 'Article', 'headline': 'AIBE %s: latest developments' % name, 'description': d, 'url': SITE + base + 'latest-developments.html',
             'inLanguage': 'en-IN', 'datePublished': meta['prepared_as_of'], 'dateModified': meta['prepared_as_of'], 'author': PUBLISHER,
             'publisher': PUBLISHER, 'image': OG, 'isAccessibleForFree': True},
            breadcrumb_ld(crumbs_ld + [(short, SITE + base), ('Latest developments', SITE + base + 'latest-developments.html')])]}]
        pg = head(t, d, base + 'latest-developments.html', 1, ld, modified=meta['prepared_as_of'])
        pg += body_open('dev', subject=slug, subject_name=name, chapter='latest-developments', chapter_title='Latest developments', url=base + 'latest-developments.html')
        pg += top(1, [('AIBE', '../../'), ('Notes', '../'), (short, './'), ('Latest developments', None)])
        pg += f'''<main id="main" tabindex="-1" class="al-main nn-main">
{brandbar('%s · Latest developments' % name, upd, ver)}
{navbar('Latest developments')}
<header class="nn-phead"><p class="nn-kick">{E(name)}</p><h1>Latest <span>developments</span></h1>
<p class="lead">Recent judgments, amendments and institutional changes that are favourite current-affairs questions. Notes cover developments up to {E(upd)}; anything tagged <span class="nn-vf">Verify</span> should be checked against the official source.</p></header>
<div class="nn-wide nn-devs" data-wm>{''.join(cards)}</div>
{about_card(upd)}
</main>
'''
        pg += bottom(1, 'dev')
        (sdir / 'latest-developments.html').write_text(pg, encoding='utf-8')
        sitemap.append((base + 'latest-developments.html', '0.7'))
        kinds.append('dev')

    # ---------- rapid revision
    rr = D['rr']
    if rr:
        nums = ''.join('<li data-b="r%d">%s</li>' % (k, fmt(x)) for k, x in enumerate(rr.get('numbers_to_remember', [])))
        cheat = ''.join('<tr><td>%s</td><td>%s</td></tr>' % (fmt('Art ' + x['article']), fmt(x['subject'])) for x in rr.get('article_cheat_sheet', []))
        one = ''.join('<li>%s</li>' % fmt(x) for x in rr.get('case_law_one_liners', []))
        bor = ''.join('<li><b>%s</b> %s</li>' % (E(a.split('-', 1)[0].strip()), E(a.split('-', 1)[1].strip()) if '-' in a else '')
                      for a in [z.strip() for z in re.split(r';\s*', rr.get('borrowed_features_quick', '')) if z.strip()])
        t = 'AIBE %s Rapid Revision | NET Law-Verse' % short
        d = trim('One-page AIBE %s revision: numbers to remember, an article cheat sheet, case law in one line each and borrowed features. Free.' % name, 158)
        generic = bool(rr.get('blocks'))
        if generic:
            d = trim('Last-day AIBE %s revision sheets: %s. Free.' % (name, ', '.join(b_['title'].lower() for b_ in rr['blocks'][:4])), 158)
            rr_lead = 'The last-day sheets. AIBE is open book, so knowing <i>where</i> a provision sits is as valuable as memorising it: use these tables to tab your Bare Act.'
            rr_jump = ''.join('<a href="#%s">%s</a>' % (b_['id'], E(b_['title'])) for b_ in rr['blocks'])
            rr_body = rapid_blocks(rr['blocks'], fmt)
        else:
            rr_lead = 'The last-day sheet. AIBE is open book, so knowing <i>where</i> an Article sits is as valuable as memorising it: use the cheat sheet to tab your Bare Act.'
            rr_jump = '<a href="#numbers">Numbers</a><a href="#articles">Article sheet</a><a href="#cases">Cases</a><a href="#borrowed">Borrowed features</a>'
            rr_body = None
        ld = [{'@context': 'https://schema.org', '@graph': [
            {'@type': 'Article', 'headline': 'AIBE %s rapid revision' % name, 'description': d, 'url': SITE + base + 'rapid-revision.html',
             'inLanguage': 'en-IN', 'datePublished': meta['prepared_as_of'], 'dateModified': meta['prepared_as_of'], 'author': PUBLISHER,
             'publisher': PUBLISHER, 'image': OG, 'isAccessibleForFree': True, 'learningResourceType': 'Cheat sheet'},
            breadcrumb_ld(crumbs_ld + [(short, SITE + base), ('Rapid revision', SITE + base + 'rapid-revision.html')])]}]
        pg = head(t, d, base + 'rapid-revision.html', 1, ld, modified=meta['prepared_as_of'])
        pg += body_open('rapid', subject=slug, subject_name=name, chapter='rapid-revision', chapter_title='Rapid revision', url=base + 'rapid-revision.html')
        pg += top(1, [('AIBE', '../../'), ('Notes', '../'), (short, './'), ('Rapid revision', None)])
        p1_html = '' if generic else f'''<section class="nn-sec" id="numbers"><h2><span class="nn-ic" aria-hidden="true">#</span>Numbers to remember</h2><ul class="nn-nums">{nums}</ul></section>
<section class="nn-sec" id="articles"><h2><span class="nn-ic" aria-hidden="true">§</span>Article cheat sheet</h2>
<label class="nn-search"><span class="sr-only">Filter articles</span><input type="search" id="nn-artq" placeholder="Filter: type an article number or a topic" autocomplete="off"></label>
<div class="al-tblw"><table class="al-tbl nn-tbl" id="nn-art"><thead><tr><th scope="col">Article</th><th scope="col">Subject</th></tr></thead><tbody>{cheat}</tbody></table></div></section>
<section class="nn-sec" id="cases"><h2><span class="nn-ic" aria-hidden="true">⚖</span>Case law in one line</h2><ul class="nn-oneline">{one}</ul></section>
<section class="nn-sec" id="borrowed"><h2><span class="nn-ic" aria-hidden="true">⇄</span>Borrowed features</h2><ul class="nn-oneline">{bor}</ul></section>
'''
        pg += f'''<main id="main" tabindex="-1" class="al-main nn-main">
{brandbar('%s · Rapid revision' % name, upd, ver)}
{navbar('Rapid revision')}
<header class="nn-phead"><p class="nn-kick">{E(name)}</p><h1>Rapid <span>revision</span></h1>
<p class="lead">{rr_lead}</p>
<div class="nn-filter"><button class="btn sm" data-act="print" type="button">Print / PDF</button></div>
<nav class="nn-jump" aria-label="Jump to"><span>Jump to</span>{rr_jump}</nav></header>
<div class="nn-wide" data-wm>
{rr_body if generic else ''}
{p1_html}
</div>
{about_card(upd)}
</main>
'''
        pg += bottom(1, 'rapid')
        (sdir / 'rapid-revision.html').write_text(pg, encoding='utf-8')
        sitemap.append((base + 'rapid-revision.html', '0.7'))
        kinds.append('rapid')

    # ---------- quick MCQs
    if D['mcq']:
        qs = []
        for k, q in enumerate(D['mcq']):
            opts = ''.join('<li><button type="button" class="nn-opt" data-o="%s"><b>%s</b><span>%s</span></button></li>'
                           % (o, o, fmt(v)) for o, v in q['options'].items())
            qs.append(f'<article class="nn-mcq" id="q{k + 1}" data-a="{A(q["answer"])}" data-i="{q["id"]}"><p class="nn-qt"><span class="n">{k + 1}</span>{fmt(q["question"])}</p>'
                      f'<ul class="nn-opts">{opts}</ul><div class="nn-exp" hidden><p><b>Answer {E(q["answer"])}.</b> {fmt(q["explanation"])}</p></div></article>')
        t = 'AIBE %s MCQs with Answers | NET Law-Verse' % short
        d = trim('%d AIBE %s MCQs with answers and one-line explanations: tap an option, see the answer, track your score. Free, no sign-up.' % (len(qs), name), 158)
        ld = [{'@context': 'https://schema.org', '@graph': [
            {'@type': 'WebPage', 'name': 'AIBE %s quick MCQs' % name, 'description': d, 'url': SITE + base + 'quick-mcqs.html',
             'inLanguage': 'en-IN', 'dateModified': meta['prepared_as_of'], 'isAccessibleForFree': True, 'publisher': PUBLISHER,
             'learningResourceType': 'Practice questions'},
            breadcrumb_ld(crumbs_ld + [(short, SITE + base), ('Quick MCQs', SITE + base + 'quick-mcqs.html')])]}]
        pg = head(t, d, base + 'quick-mcqs.html', 1, ld, modified=meta['prepared_as_of'])
        pg += body_open('mcq', subject=slug, subject_name=name, chapter='quick-mcqs', chapter_title='Quick MCQs', url=base + 'quick-mcqs.html')
        pg += top(1, [('AIBE', '../../'), ('Notes', '../'), (short, './'), ('Quick MCQs', None)])
        pg += f'''<main id="main" tabindex="-1" class="al-main nn-main">
{brandbar('%s · Quick MCQs' % name, upd, ver)}
{navbar('Quick MCQs')}
<header class="nn-phead"><p class="nn-kick">{E(name)}</p><h1>Quick <span>MCQs</span></h1>
<p class="lead">{len(qs)} recall questions to close each study session. Tap an option to see the answer and the reason. There is no timer and no negative marking.</p>
<div class="nn-score" aria-live="polite"><b id="nn-sc">0</b><span>/ {len(qs)} correct</span><i><u id="nn-sp"></u></i><button class="btn sm" type="button" id="nn-reset">Start over</button></div></header>
<div class="nn-wide nn-mcqs" data-wm>{''.join(qs)}</div>
<p class="al-fine">Want full-length papers and the mistakes notebook? Use the <a href="../../practice.html">Practice Arena</a> and <a href="../../practice.html#mocks">mock tests</a>.</p>
{about_card(upd)}
</main>
'''
        pg += bottom(1, 'mcq')
        (sdir / 'quick-mcqs.html').write_text(pg, encoding='utf-8')
        sitemap.append((base + 'quick-mcqs.html', '0.6'))
        kinds.append('mcq')

    # ---------- subject page
    chap_cards = []
    for s in secs:
        pri_lbl, pri_cls = PRI.get(s['priority'], (s['priority'].title(), 'p4'))
        chap_cards.append(f'''<a class="nn-ch" href="{s['_url']}" data-p="{pri_cls}" data-slug="{s['_slug']}"><span class="nn-no sm">{s['_n']}</span>
<span class="b"><b>{E(s['title'])}</b><span class="m"><span class="nn-pri {pri_cls}">{pri_lbl}</span>{('<span>%s Qs</span>' % nice_range(s['expected_questions'])) if s.get('expected_questions') else ''}<span>{s['_min']} min</span></span>
<span class="a">{fmt(s.get('articles', ''))}</span></span><span class="st" aria-hidden="true"></span></a>''')
    dist = ''
    for c in exam.get('indicative_distribution', []):
        nums = [int(x) for x in re.findall(r'\d+', c['expected_questions'])] or [0]
        lo, hi = min(nums), max(nums)
        dist += (f'<li><div class="r"><b>{E(c["cluster"])}</b><span>{nice_range(c["expected_questions"])} Qs</span></div>'
                 f'<i class="bar" aria-hidden="true"><u style="left:{lo * 10}%;width:{max(hi - lo, 0.4) * 10}%"></u></i><p>{fmt(c["comment"])}</p></li>')
    lst = lambda key: ''.join('<li>%s</li>' % fmt(x) for x in exam.get(key, []))
    exam_html = ''
    if exam:
        cards_html = ''.join('<div class="al-card"><h3>%s</h3><ul class="al-list">%s</ul></div>' % (
            E(c['title']), ''.join('<li>%s</li>' % fmt(x) for x in c['items'] if x)) for c in exam.get('cards', []) if c.get('items')) if exam.get('cards') else (
            f'''<div class="al-card"><h3>Question patterns</h3><ul class="al-list">{lst('question_patterns')}</ul></div>
<div class="al-card"><h3>High-yield topics</h3><ul class="al-list">{lst('high_yield_topics')}</ul></div>
<div class="al-card"><h3>Time strategy</h3><ul class="al-list">{lst('time_strategy')}</ul></div>
<div class="al-card trap"><h3>Common traps</h3><ul class="al-list">{lst('common_traps')}</ul></div>''')
        dist_html = (f'<ul class="nn-dist">{dist}</ul><p class="al-fine">{fmt(exam.get("distribution_note", ""))} (Scale: 0 to 10 questions.)</p>' if dist
                     else (f'<p class="al-fine">{fmt(exam.get("distribution_note", ""))}</p>' if exam.get('distribution_note') else ''))
        exam_html = f'''<section class="nn-sec" id="marks"><h2><span class="nn-ic" aria-hidden="true">%</span>Where the marks come from</h2>
<p class="lead sm">{E(name)} carries about <b>{marks} of 100</b> questions. {fmt(exam.get('paper_format_note', ''))}</p>
{dist_html}
<div class="nn-two">{cards_html}</div></section>'''
    kit = [('highlights.html', 'Highlights', 'Provisions, cases, memory aids and traps, chapter by chapter.', 'c1', '★')]
    if 'rapid' in kinds:
        kit.append(('rapid-revision.html', 'Rapid revision', ('Numbers, section finders, tables and last-day checklists.' if (D['rr'] or {}).get('blocks') else 'Numbers, article cheat sheet and one-line cases.'), 'c2', '⚡'))
    if 'dev' in kinds:
        kit.append(('latest-developments.html', 'Latest developments', 'Recent judgments and amendments, with the likely question.', 'c3', 'N'))
    if 'mcq' in kinds:
        kit.append(('quick-mcqs.html', 'Quick MCQs', '%d recall questions with reasons.' % len(D['mcq']), 'c4', 'Q'))
    kit.append(('../my-notes.html', 'My highlights', 'Everything you highlighted or asked, clubbed chapter by chapter.', 'c5', '✎'))
    kit_html = ''.join(f'<a class="al-feat {c}" href="{h}"><span class="ic">{ic}</span><b>{E(n)}</b><span class="d">{E(dd)}</span><span class="go">Open →</span></a>'
                       for h, n, dd, c, ic in kit)
    t = 'AIBE %s Notes: Chapter-wise | NET Law-Verse' % short
    d = trim('Free AIBE %s notes: %d chapters with key provisions, landmark cases, traps, highlights and MCQs. About %d of 100 questions.' % (name, n_ch, marks), 158)
    ld = [{'@context': 'https://schema.org', '@graph': [
        {'@type': 'CollectionPage', 'name': 'AIBE %s notes' % name, 'description': d, 'url': SITE + base, 'inLanguage': 'en-IN',
         'dateModified': meta['prepared_as_of'], 'isAccessibleForFree': True, 'publisher': PUBLISHER, 'image': OG,
         'about': {'@type': 'Thing', 'name': name},
         'mainEntity': {'@type': 'ItemList', 'numberOfItems': n_ch, 'itemListElement': [
             {'@type': 'ListItem', 'position': s['_n'], 'name': s['_seo'], 'url': SITE + base + s['_url']} for s in secs]}},
        breadcrumb_ld(crumbs_ld + [(short, SITE + base)])]}]
    pg = head(t, d, base, 1, ld, modified=meta['prepared_as_of'])
    pg += body_open('subject', subject=slug, subject_name=name, chapter_total=n_ch, url=base)
    pg += top(1, [('AIBE', '../../'), ('Notes', '../'), (short, None)])
    pg += f'''<main id="main" tabindex="-1" class="al-main nn-main">
{brandbar(name, upd, ver)}
<section class="al-hero nn-shero"><div><span class="pill">AIBE NOTES · SUBJECT {no} OF 19</span><h1>{E(short)} <span>notes</span></h1>
<p class="nn-full">{E(name)}</p></div>
<p class="lead">{n_ch} chapters, written for the AIBE. Read in order or jump to the high-yield ones; every chapter has key provisions, landmark cases, memory aids, exam traps and likely questions.</p></section>
<div class="al-facts"><div class="al-fact"><b>{n_ch}</b><small>chapters</small></div><div class="al-fact"><b>~{marks}</b><small>questions in AIBE</small></div><div class="al-fact"><b id="nn-readct">0</b><small>chapters read</small></div><div class="al-fact"><b>{sum(len(s.get('landmark_cases', [])) for s in secs)}</b><small>landmark cases</small></div></div>
<div class="nn-resume" id="nn-resume" hidden></div>
<h2 class="al-h2">Revision kit</h2><div class="al-grid f3">{kit_html}</div>
<div data-wm class="nn-block">
{exam_html}
<section class="nn-sec" id="chapters"><h2><span class="nn-ic" aria-hidden="true">☰</span>All {n_ch} chapters</h2>
<div class="nn-filter" role="group" aria-label="Filter chapters by yield"><button class="nn-fb on" data-pf="all">All</button><button class="nn-fb" data-pf="p1">Very high yield</button><button class="nn-fb" data-pf="p2">High yield</button><button class="nn-fb" data-pf="p3,p4,p5">The rest</button></div>
<div class="nn-chs">{''.join(chap_cards)}</div></section></div>
{about_card(upd)}
</main>
'''
    pg += bottom(1, 'subject', floats=True)
    (sdir / 'index.html').write_text(pg, encoding='utf-8')
    sitemap.append((base, '0.9'))
    return dict(chapters=n_ch, cases=sum(len(s.get('landmark_cases', [])) for s in secs), updated=upd, version=ver,
                first=secs[0]['_url'], mcq=len(D['mcq']))


def build_hub(live_info, sitemap):
    n_live = len(live_info)
    cards = []
    for no, name, slug, marks in SUBJECTS:
        inf = live_info.get(no)
        if inf:
            cards.append(f'''<a class="nn-sub live" href="{slug}/" data-slug="{slug}" data-ch="{inf['chapters']}"><span class="nn-no">{no}</span>
<span class="b"><b>{E(name)}</b><span class="m"><span class="nn-chip ok">Notes live</span><span>{inf['chapters']} chapters</span><span>~{marks} Qs</span></span>
<span class="bar" aria-hidden="true"><u></u></span><span class="rd"><span class="rdn">0</span> of {inf['chapters']} read</span></span><span class="go" aria-hidden="true">→</span></a>''')
        else:
            cards.append(f'''<div class="nn-sub soon"><span class="nn-no">{no}</span>
<span class="b"><b>{E(name)}</b><span class="m"><span class="nn-chip">Coming soon</span><span>~{marks} Qs</span></span></span></div>''')
    faq = [
        ('Are the AIBE notes free?', 'Yes. Every note, highlight sheet and MCQ on NET Law-Verse is free and needs no sign-up or login.'),
        ('How are the AIBE notes organised?', 'Under the 19 subjects of the Bar Council of India AIBE syllabus, in syllabus order. Each subject is split into chapters, and each chapter has an overview, must-know points, key provisions, landmark cases, memory aids, exam traps and likely questions.'),
        ('Which subjects are available now?', ('Notes are being added subject by subject. %d of 19 subjects are live: %s. The rest are marked Coming soon on the notes page.' if n_live < 19 else 'All %d subjects of the BCI syllabus are live: %s. New chapters and updates are added as the law changes.') % (n_live, ', '.join(SUBJECTS[no - 1][1] for no in sorted(live_info)))),
        ('Can I highlight the notes and save my highlights?', 'Yes. Select any text in a chapter and choose a colour. Highlights are saved in your browser and collected chapter by chapter on the My highlights page, where you can print or copy them.'),
        ('How do I ask a doubt?', 'Select the text you are unsure about, or use the ? button next to any point, and choose Ask a doubt. Your doubt is saved on your device and you can send it to NET Law-Verse by email in one tap.'),
        ('Are these notes enough for AIBE?', 'They are a revision aid, not a substitute for the Bare Acts. AIBE has been reported as an open-book test with unannotated Bare Acts, so use the notes to know what to look up and where. Confirm the rules for your edition in the Bar Council of India notification.'),
        ('How current are the notes?', 'Each page shows the date it was last updated. Facts that rest on press or secondary reports are tagged Verify so you can check them against the official source.'),
    ]
    t = 'Free AIBE Notes: All 19 Subjects, Chapter-wise | NET Law-Verse'
    d = 'Free AIBE notes under the 19 Bar Council of India subjects: provisions, landmark cases, traps, highlights, latest developments and MCQs.'
    ld = [{'@context': 'https://schema.org', '@graph': [
        {'@type': 'CollectionPage', 'name': 'AIBE notes', 'description': d, 'url': SITE + '/aibe/notes/', 'inLanguage': 'en-IN',
         'isAccessibleForFree': True, 'publisher': PUBLISHER, 'image': OG,
         'mainEntity': {'@type': 'ItemList', 'numberOfItems': len(SUBJECTS), 'itemListElement': [
             ({'@type': 'ListItem', 'position': no, 'name': name, 'url': SITE + '/aibe/notes/%s/' % slug} if no in live_info
              else {'@type': 'ListItem', 'position': no, 'name': name}) for no, name, slug, _ in SUBJECTS]}},
        {'@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faq]},
        breadcrumb_ld([('NET Law-Verse', SITE + '/'), ('AIBE', SITE + '/aibe/'), ('Notes', SITE + '/aibe/notes/')])]}]
    pg = head(t, d, '/aibe/notes/', 0, ld, kind='website')
    pg += body_open('hub')
    pg += top(0, [('AIBE', '../'), ('Notes', None)])
    feats = [
        ('c1', '▤', 'Chapter reader', 'Clean, distraction-free chapters with a live contents list, reading progress, text size and print to PDF.'),
        ('c2', '✎', 'Highlighter', 'Select text and mark it Key, Got it, Trap or Revise. Add a note to any highlight.'),
        ('c3', '★', 'Highlights page', 'Curated provisions, cases and traps per chapter, plus your own highlights clubbed chapter by chapter.'),
        ('c6', '?', 'Ask a doubt', 'Stuck on a point? Select it, ask, and send it to us in one tap. Your doubts are kept in your notebook.'),
    ]
    fh = ''.join(f'<div class="al-feat {c}"><span class="ic">{i}</span><b>{E(n)}</b><span class="d">{E(dd)}</span></div>' for c, i, n, dd in feats)
    fq = ''.join('<details><summary>%s</summary><div class="a"><p>%s</p></div></details>' % (E(q), E(a)) for q, a in faq)
    pg += f'''<main id="main" tabindex="-1" class="al-main nn-main">
<section class="al-hero"><div><span class="pill">BAR COUNCIL OF INDIA SYLLABUS · FREE · NO SIGN-UP</span><h1>AIBE <span>notes</span></h1></div>
<p class="lead">Chapter-wise notes for all 19 AIBE subjects, in syllabus order. Read, highlight, ask doubts, then revise from your own highlights.</p></section>
<div class="nn-resume" id="nn-resume" hidden></div>
<div class="al-facts"><div class="al-fact"><b>{n_live}<small style="display:inline;font-size:.5em;opacity:.7"> / 19</small></b><small>subjects live</small></div><div class="al-fact"><b>{sum(i['chapters'] for i in live_info.values())}</b><small>chapters</small></div><div class="al-fact"><b>{sum(i['cases'] for i in live_info.values())}</b><small>landmark cases</small></div><div class="al-fact"><b id="nn-hlct">0</b><small>your highlights</small></div></div>
<label class="nn-search big"><span class="sr-only">Search the notes</span><input type="search" id="nn-q" placeholder="Search notes: an Article, a case, a topic (try “basic structure” or “Art 21”)" autocomplete="off"></label>
<div id="nn-results" class="nn-results" hidden></div>
<h2 class="al-h2" id="subjects">All 19 subjects</h2>
<p class="al-sub">Listed in the order of the AIBE syllabus. {'Subjects marked <b>Notes live</b> are ready to read; the others are being added one by one.' if len(live_info) < 19 else 'All 19 subjects have notes. Pick a subject to start, or search across every chapter.'}</p>
<div class="nn-subs" data-wm>{''.join(cards)}</div>
<h2 class="al-h2">What you get in every subject</h2><div class="al-grid">{fh}</div>
<h2 class="al-h2">Why you can rely on these notes</h2>
<div class="nn-trust" data-wm>
<div class="al-card"><h3>Built to the BCI syllabus</h3><p>Filed under the 19 subjects of the Bar Council of India syllabus, with the approximate marks for each, so you spend time where the questions are.</p></div>
<div class="al-card"><h3>Uncertain facts are flagged</h3><p>Anything resting on press or secondary reports carries a <span class="nn-vf">Verify</span> tag. You always know what to double-check against the official source.</p></div>
<div class="al-card"><h3>Dated and versioned</h3><p>Every page shows when it was last updated and its version. Developments after that date are not covered, and the page says so.</p></div>
<div class="al-card"><h3>Private by design</h3><p>Your highlights, doubts and progress stay in your browser. No account, no tracking of what you mark.</p></div></div>
<h2 class="al-h2">AIBE notes: common questions</h2>
<div class="al-faq">{fq}</div>
{about_card('16 Nov 2026')}
</main>
'''
    pg += bottom(0, 'hub', floats=True)
    (OUT / 'index.html').write_text(pg, encoding='utf-8')
    sitemap.append(('/aibe/notes/', '0.9'))


def build_mine():
    t = 'My AIBE Notes: Highlights, Doubts and Progress | NET Law-Verse'
    d = 'Your own AIBE highlights, notes, doubts and reading progress, saved in this browser.'
    pg = head(t, d, '/aibe/notes/my-notes.html', 0, [], kind='website', robots='noindex,follow')
    pg += body_open('mine')
    pg += top(0, [('AIBE', '../'), ('Notes', './'), ('My highlights', None)])
    pg += '''<main id="main" tabindex="-1" class="al-main nn-main">
<header class="nn-phead"><p class="nn-kick">Private to this browser</p><h1>My <span>highlights</span></h1>
<p class="lead">Everything you highlighted, noted or asked, clubbed chapter by chapter. Saved only on this device: use Backup to move it.</p>
<div class="nn-filter" role="tablist" aria-label="My notebook"><button class="nn-fb on" data-tab="hl" role="tab">Highlights</button><button class="nn-fb" data-tab="dq" role="tab">Doubts</button><button class="nn-fb" data-tab="pg" role="tab">Progress</button></div></header>
<div id="nn-mine" class="nn-wide" data-wm><p class="mut">Loading your notebook…</p></div>
</main>
'''
    pg += bottom(0, 'mine')
    (OUT / 'my-notes.html').write_text(pg, encoding='utf-8')


def update_sitemap(entries):
    p = ROOT / 'sitemap.xml'
    x = p.read_text(encoding='utf-8')
    block = '\n'.join('  <url><loc>%s%s</loc><lastmod>%s</lastmod><changefreq>weekly</changefreq><priority>%s</priority></url>'
                      % (SITE, u, TODAY, pr) for u, pr in entries)
    block = '  <!-- aibe-notes:begin -->\n' + block + '\n  <!-- aibe-notes:end -->'
    if '<!-- aibe-notes:begin -->' in x:
        x = re.sub(r'  <!-- aibe-notes:begin -->.*?<!-- aibe-notes:end -->', lambda m: block, x, flags=re.S)
    else:
        x = x.replace('</urlset>', block + '\n</urlset>')
    p.write_text(x, encoding='utf-8')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    live, seo = load_data()
    sitemap, rows, info = [], [], {}
    for no, name, slug, marks in SUBJECTS:
        if no in live:
            # case-name italics come from this subject's own cases, so one subject's data never alters another's pages
            fmt = make_formatter([c['case'] for s in live[no]['sections'] for c in s.get('landmark_cases', [])])
            info[no] = build_subject(no, name, slug, marks, live[no], seo, fmt, sitemap, rows)
    build_hub(info, sitemap)
    build_mine()
    (OUT / 'notes-index.json').write_text(json.dumps(rows, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    update_sitemap(sitemap)
    # safety: no writing-batch language may reach readers
    bad = []
    for f in OUT.rglob('*.html'):
        for m in re.finditer(r'\bParts? \d+\b', re.sub(r'<script.*?</script>', '', f.read_text(encoding='utf-8'), flags=re.S)):
            bad.append((f.name, m.group(0)))
    if bad:
        print('WARNING: batch wording left in output:', bad[:10])
    print('Built %d subject(s), %d pages, %d sitemap entries.' % (len(info), len(sitemap), len(sitemap)))


if __name__ == '__main__':
    sys.exit(main())
