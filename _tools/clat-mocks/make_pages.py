import json,re,sys,os
OUT=sys.argv[1]
meta=json.loads(open(os.path.join(OUT,'clat-mock-meta.js')).read()[len('window.CLATMOCKS='):].rstrip(';\n'))
HEAD='''<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>@@title@@</title>
<meta name="description" content="@@desc@@">
<link rel="canonical" href="https://netlawverse.in/clat-pg/@@file@@">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
<meta name="theme-color" content="#bfa8ff">
<meta property="og:type" content="website"><meta property="og:site_name" content="NET Law-Verse"><meta property="og:locale" content="en_IN">
<meta property="og:title" content="@@title@@"><meta property="og:description" content="@@desc@@"><meta property="og:url" content="https://netlawverse.in/clat-pg/@@file@@">
<meta property="og:image" content="https://netlawverse.in/clat-pg/og-clat-mock.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="@@title@@"><meta name="twitter:description" content="@@desc@@"><meta name="twitter:image" content="https://netlawverse.in/clat-pg/og-clat-mock.png">
<script type="application/ld+json">@@ld@@</script>
<link rel="icon" href="/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="clat-mock.css"><link rel="stylesheet" href="../watermark.css">
<script>(function(){var ok=['violet','ocean','mint','sunset','sunny'],t='violet';try{var s=localStorage.getItem('clat-theme');if(ok.indexOf(s)>-1)t=s}catch(e){}document.documentElement.setAttribute('data-theme',t)})();</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a><div id="live" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
<div class="shapes" aria-hidden="true"><i class="shape s1"></i><i class="shape s2"></i></div>
<div class="wrap@@wide@@">
<header class="cm-head">
  <a class="brand" href="/" aria-label="NET Law-Verse home"><span class="logo">NL</span><span><b>NET Law-Verse</b><small>The universe of law</small></span></a>
  <nav class="cm-nav" aria-label="Main"><a href="./">CLAT PG</a><a href="mock-tests.html"@@cur@@>Mock tests</a><a href="faq.html">FAQ</a></nav>
</header>
'''
FOOT='''<footer class="cm-foot">
  <p><a href="/about.html">About</a><a href="faq.html">CLAT PG FAQ</a><a href="https://www.instagram.com/netlawverse/" rel="noopener">Instagram</a><a href="mailto:netlawverse@gmail.com">Contact</a></p>
  <p class="fine">Practice papers written for NET Law-Verse. Pattern follows the published CLAT PG format; always verify on consortiumofnlus.ac.in. NET Law-Verse is independent and not affiliated with the Consortium of NLUs.</p>
</footer>
</div>
<div class="themes" role="group" aria-label="Colour theme"><span>Theme</span>
<button class="sw" data-t="violet" style="background:linear-gradient(135deg,#bfa8ff,#8de3ee)" aria-label="Violet theme"></button>
<button class="sw" data-t="ocean" style="background:linear-gradient(135deg,#8fd8ff,#9aa8ff)" aria-label="Ocean theme"></button>
<button class="sw" data-t="mint" style="background:linear-gradient(135deg,#8fe8c4,#8fc7ff)" aria-label="Mint theme"></button>
<button class="sw" data-t="sunset" style="background:linear-gradient(135deg,#ff9eb5,#ffa86b)" aria-label="Sunset theme"></button>
<button class="sw" data-t="sunny" style="background:linear-gradient(135deg,#ffd23f,#ff8fa8)" aria-label="Sunny theme"></button></div>
<script>(function(){var b=document.querySelectorAll('.sw');function mark(){var c=document.documentElement.getAttribute('data-theme');for(var i=0;i<b.length;i++)b[i].setAttribute('aria-pressed',b[i].dataset.t===c)}
for(var i=0;i<b.length;i++)b[i].onclick=function(){var t=this.dataset.t;document.documentElement.setAttribute('data-theme',t);try{localStorage.setItem('clat-theme',t)}catch(e){}mark()};mark()})();</script>
'''
def page(file,title,desc,ld,body,scripts,wide=False,cur=False):
    h=HEAD
    for k,v in dict(title=title,desc=desc,file=file,ld=json.dumps(ld),wide=' wide' if wide else '',cur=' aria-current="page"' if cur else '').items(): h=h.replace('@@'+k+'@@',v)
    open(os.path.join(OUT,file),'w',encoding='utf-8').write(h+body+FOOT+scripts+'</body>\n</html>\n')
bc=lambda *a:{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":i+1,"name":n,"item":u} for i,(n,u) in enumerate(a)]}
# list page
body='''<main id="main" tabindex="-1">
<section class="cm-hero"><div><span class="pill">FREE · NO SIGN-UP</span><h1 class="cm-h1">Free CLAT PG <span>Mock Tests</span></h1></div><p class="lead">Full-length, passage-based practice papers in the CLAT PG pattern: 120 questions in 120 minutes, with a green-to-red time meter, instant result analysis and a personalised assessment.</p></section>
<div class="cm-cards" id="mock-root"><noscript>JavaScript is required for the mock tests.</noscript></div>
<section class="cm-sec"><h2>The paper, as in the exam</h2><p>Every mock follows the published CLAT PG pattern, so your timing practice carries over to exam day.</p>
<div class="cm-tiles"><div class="cm-tile"><b>120</b><small>questions</small></div><div class="cm-tile"><b>120</b><small>minutes</small></div><div class="cm-tile"><b>120</b><small>marks</small></div><div class="cm-tile"><b>−0.25</b><small>per wrong answer</small></div></div>
<p class="cm-note">Each paper is built from passages with five or six questions each. Your answers and results stay in this browser. After every attempt you get a subject-wise analysis, a pace chart, passage-wise timing and a preparation assessment. Categories are website practice guides, not official CLAT PG categories.</p></section>
<section class="cm-cta"><div><h3>New to the pattern?</h3><p>Read what CLAT PG really tests, then come back and time yourself.</p></div><div class="cm-row"><a class="btn" href="what-clat-pg-really-tests.html">What CLAT PG tests</a><a class="btn" href="sample-paper-20-questions.html">20-question sample</a></div></section>
</main>
'''
ld=[{"@type":"CollectionPage","name":"Free CLAT PG Mock Tests","url":"https://netlawverse.in/clat-pg/mock-tests.html","inLanguage":"en-IN","isPartOf":{"@type":"WebSite","name":"NET Law-Verse","url":"https://netlawverse.in/"}},bc(("NET Law-Verse","https://netlawverse.in/"),("CLAT PG","https://netlawverse.in/clat-pg/"),("Mock tests","https://netlawverse.in/clat-pg/mock-tests.html"))]
page('mock-tests.html','Free CLAT PG Mock Tests: 120 Questions, 120 Minutes | NET Law-Verse','Free CLAT PG (LL.M.) mock tests in the official pattern: 120 passage-based MCQs, 120 minutes, 0.25 negative marking, time meter and a personalised assessment.',{"@context":"https://schema.org","@graph":ld},body,'<script src="../nl-report.js"></script><script src="../nl-share.js"></script><script src="clat-mock-meta.js"></script><script src="clat-mock-home.js"></script>',cur=True)
for m in meta:
    n=m['n'];f=f'mock-test-{n}.html'
    t=f"CLAT PG Mock Test {n}: {m['q']} Questions with Answers | NET Law-Verse"
    d=f"Free CLAT PG (LL.M.) {m['title']}: {m['q']} passage-based MCQs, {m['minutes']} minutes, 0.25 negative marking. {m['theme']}. Time meter and personalised assessment."
    body=f'''<main id="main" tabindex="-1" class="cm-page"><div id="app" data-n="{n}"><noscript>JavaScript is required for the mock test.</noscript></div>
<section class="cm-sec" style="max-width:940px;margin:0 auto"><h2>About this mock test</h2><p>CLAT PG {m['title']} is a free, timed practice paper in the CLAT PG pattern: <b>{m['q']} passage-based questions</b> in <b>{m['minutes']} minutes</b>, one mark each with 0.25 deducted for each wrong answer. {m['blurb']} Subjects covered: {', '.join(m['subjects'])}. Your answers and result stay in your browser; there is no sign-up.</p></section>
</main>
'''
    ld=[{"@type":"LearningResource","name":f"CLAT PG {m['title']}","url":f"https://netlawverse.in/clat-pg/{f}","description":d,"inLanguage":"en-IN","isAccessibleForFree":True,"educationalLevel":"Postgraduate (LL.M. entrance)","learningResourceType":"Mock test","timeRequired":"PT120M","numberOfItems":m['q'],"isPartOf":{"@type":"WebSite","name":"NET Law-Verse","url":"https://netlawverse.in/"}},bc(("NET Law-Verse","https://netlawverse.in/"),("CLAT PG","https://netlawverse.in/clat-pg/"),("Mock tests","https://netlawverse.in/clat-pg/mock-tests.html"),(f"Mock Test {n}",f"https://netlawverse.in/clat-pg/{f}"))]
    page(f,t,d,{"@context":"https://schema.org","@graph":ld},body,f'<script src="../nl-report.js"></script><script src="../nl-share.js"></script><script src="clat-mock-meta.js"></script><script src="clat-mock-data-{n}.js"></script><script src="clat-mock-engine.js"></script>',wide=True,cur=True)
print('pages ok')
