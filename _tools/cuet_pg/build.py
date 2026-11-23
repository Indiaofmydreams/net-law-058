#!/usr/bin/env python3
"""Builds /cuet-pg/*.html. Run from anywhere:  python3 _tools/cuet_pg/build.py
Edit data_syllabus.py (subjects), data_univ.py (universities), data_faq.py (FAQ) and this file (page text), then re-run.
Standard library only. Safe to re-run."""
import pathlib, sys, re
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from common import *
import data_syllabus as DS, data_faq as DF, data_univ as DU
OUT = HERE.parent.parent / "cuet-pg"

ARTICLES = [
 ("cuet-pg-llm-eligibility-fee-registration-2027", "CUET PG LLM Eligibility, Fee and Registration 2027", "Who can apply, age limit, final-year rule, fee and when the form opens."),
 ("cuet-pg-llm-exam-pattern-marking-scheme-2027", "CUET PG LLM Exam Pattern and Marking Scheme", "75 questions, +4 and -1, duration, language and how to attempt."),
 ("cuet-pg-llm-syllabus-2027-subject-wise-topics", "CUET PG LLM Syllabus 2027: Subject-Wise Topics", "The 30-plus law subjects and what to study in each."),
 ("cuet-pg-llm-paper-analysis-trends-most-repeated-topics", "CUET PG LLM Paper Analysis, Trends and Most Repeated Topics", "Difficulty, subject weightage and question types across recent papers."),
 ("cuet-pg-llm-universities-list-2027", "Universities Accepting CUET PG LLM", "Central, state and private options, and which exams are not CUET PG."),
 ("how-to-prepare-for-cuet-pg-llm-in-3-months", "How to Prepare for CUET PG LLM in 3 Months", "A month-by-month plan, books, mocks and revision."),
 ("cuet-pg-llm-vs-clat-pg-vs-ailet", "CUET PG LLM vs CLAT PG vs AILET", "Which LL.M. entrance to take, and can you take all three."),
 ("cuet-pg-llm-admission-process-merit-list-counselling", "CUET PG LLM Admission Process and Merit List", "From scorecard to seat: how universities select and counsel."),
]
W = lambda name, s: (OUT / name).write_text(s, encoding="utf-8")
def plain(h): return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", h)).strip()
def art_cards(items=ARTICLES):
    return '<div class="cu-art">' + ''.join(f'<a href="/blog/{s}.html"><b>{t}</b><span>{d}</span><em>Read the guide →</em></a>' for s, t, d in items) + '</div>'
ntot = sum(len(g[1]) for s in DS.S for g in s["groups"])

# ---------------- hub ----------------
def hub():
    qs = [(q, a) for g, q, a, e in DF.F if q in ("What is CUET PG LLM?", "When is CUET PG 2027, and has registration opened?", "What is the marking scheme and is there negative marking in CUET PG LLM?", "Which universities accept CUET PG LLM scores?")]
    paa = ''.join(f'<div class="cu-paa"><h3>{q}</h3><p>{a}</p></div>' for q, a in qs)
    b = hero("NTA · LL.M. · FREE · NO TIMER", "CUET PG", "LL.M. prep", "Everything for the Central University Entrance Test (PG) Law paper in one place: the pattern, a full subject-wise syllabus with tracker, paper analysis and trends, the universities that use the score, practice questions and a revision notebook that fills itself with your mistakes.")
    b += '''<div class="cu-facts"><div class="cu-fact"><b>75</b><small>compulsory MCQs</small></div><div class="cu-fact"><b>300</b><small>marks (+4 per right answer)</small></div><div class="cu-fact"><b>90</b><small>minutes in the real exam</small></div><div class="cu-fact"><b>−1</b><small>per wrong answer</small></div></div>'''
    b += f'<div class="cu-note blue"><b>CUET PG 2027:</b> NTA\'s revised calendar starts the exam on <b>2 March 2027</b>, over 17 days with no buffer dates. The Information Bulletin and registration are expected in December 2026; the Law (LL.M.) paper\'s own date will be in the subject-wise timetable. All dates are tentative until the bulletin is out. Check <a href="{NTA}" rel="noopener">exams.nta.nic.in/cuet-pg</a>.</div>'
    b += '<div class="cu-cta"><a class="btn" href="what-is-cuet-pg.html">What is CUET PG LLM?</a><a class="btn" href="practice.html" style="background:var(--ink);color:#fff">Start practising →</a></div><div class="cu-status" id="cu-status" aria-live="polite"></div>'
    b += '<h2 class="cu-h2">Your CUET PG toolkit</h2><div class="cu-grid f3">'
    feats = [("c1","?","What is CUET PG LLM?","what-is-cuet-pg.html","Pattern, marking, dates, eligibility, fee, language, how it differs from CLAT PG and AILET, and how admission works. Official and reported facts are labelled.","Read the guide →"),
     ("c2","✓","Syllabus and tracker","syllabus.html",f"{len(DS.S)} subject areas of the COQP14 paper broken into {ntot} topic rows with the cases and sections to know. Tick topics as you cover and revise them.","Open the syllabus →"),
     ("c3","↗","Paper analysis and trends","analysis.html","Difficulty, subject-wise question estimates, question types, year-on-year changes and a score planner that shows what +4 and −1 really do to your marks.","See the analysis →"),
     ("c4","U","Universities list","universities.html","Central, state and private universities reported to use CUET PG for LL.M., with a search filter, plus the exams that are not CUET PG.","Browse universities →"),
     ("c5","Q","Practice Arena","practice.html","Standalone MCQs with the answer, the reasoning and the trap behind every option. Bookmark questions, add notes, practise by subject or difficulty.","Start practising →"),
     ("c6","R","Revision notebook","practice.html#mistakes","Every wrong answer is saved with the question, your answer and the full explanation. Filter by subject, retry them, print them.","Open the notebook →")]
    for c, ic, t, h, d, go in feats:
        st = ' id="st-prac"' if c == "c5" else ''
        b += f'<a class="cu-feat {c}" href="{h}"><span class="ic">{ic}</span><b>{t}</b><span class="d">{d}</span>' + ('<span class="st" id="st-prac">CHECKING…</span>' if c == "c5" else '') + f'<span class="go">{go}</span></a>'
    b += '</div><h2 class="cu-h2">CUET PG LLM questions, answered</h2>' + paa + '<p class="cu-fine">More answers on the <a href="faq.html">CUET PG FAQ</a>.</p>'
    b += '<h2 class="cu-h2">Read the guides</h2><p class="cu-sub">Eight in-depth articles, each answering a cluster of the questions aspirants search most.</p>' + art_cards()
    b += '''<h2 class="cu-h2">How this section is different</h2><div class="cu-grid">
 <div class="cu-card"><h3>Built for a subject-knowledge paper</h3><p>CUET PG LLM is 75 standalone questions across 30-plus law subjects, not passages. Practice sets are tagged by subject so your weak branches show up in Progress.</p></div>
 <div class="cu-card"><h3>Marks in the real ratio</h3><p>The Practice Arena scores one mark per right answer and −0.25 per wrong one. That is the real +4 and −1 scheme divided by four: multiply by 4 to compare with the 300-mark scale.</p></div>
 <div class="cu-card"><h3>No timer, by design</h3><p>Accuracy and understanding first. The real paper gives 72 seconds a question, so add speed later by timing yourself off-site. Your data stays in your browser.</p></div></div>'''
    b += '''<script>(function(){var S=document.getElementById('cu-status');function chip(t,c){var s=document.createElement('span');s.className='cu-chip'+(c?' '+c:'');s.textContent=t;S.appendChild(s)}
fetch('practice/index.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(ix){var all=ix.sets||[],m=all.filter(function(x){return x.type==='mock'}).length,p=all.length-m;var sp=document.getElementById('st-prac');sp.textContent=p?p+(p===1?' SET LIVE':' SETS LIVE'):'FIRST SET SOON';chip(p+(p===1?' practice set':' practice sets'),p?'ok':'sun');chip(m+(m===1?' mock test':' mock tests'),m?'ok':'sun');chip('No timer','ok')}).catch(function(){document.getElementById('st-prac').textContent='OPEN'});
try{var d=JSON.parse(localStorage.getItem('cuet-practice-v1')||'{}'),n=0;Object.keys(d.sets||{}).forEach(function(k){var q=(d.sets[k].q)||{};Object.keys(q).forEach(function(x){if(q[x]&&q[x].r)n++})});if(n)chip(n+' questions done so far','sun')}catch(e){}})();</script>'''
    sch = [{"@type": "WebPage", "name": "CUET PG LL.M. Preparation", "url": SITE + "/cuet-pg/", "inLanguage": "en-IN", "dateModified": MODIFIED, "isPartOf": {"@type": "WebSite", "name": "NET Law-Verse", "url": SITE + "/"}}, crumbs(), faq_ld([(q, plain(a)) for q, a in qs])]
    W("index.html", page("index.html", "CUET PG LLM 2027 Preparation: Pattern, Syllabus, Universities and Practice | NET Law-Verse", "Free CUET PG LLM (COQP14) preparation: 75 MCQs, +4/−1 marking, subject-wise syllabus with tracker, paper analysis, universities list and practice questions. No sign-up, no timer.", b, "index.html", sch))

# ---------------- what is ----------------
def what():
    b = hero("THE EXAM EXPLAINED", "What is", "CUET PG LLM?", "CUET (PG) is the Common University Entrance Test for postgraduate admission, conducted by the National Testing Agency. This guide covers the Law (LL.M.) paper: pattern, marking, dates, eligibility, fee, how it differs from CLAT PG and AILET, and how admission works.")
    b += f'<div class="cu-note"><b>Read this first.</b> NTA issues a new Information Bulletin every cycle and the 2027 one is not out yet. Facts marked {OFF} come from NTA\'s 2026 bulletin and FAQs; facts marked {REP} come from admission-news coverage and 2026 papers; confirm them in the 2027 bulletin before you rely on them.</div>'
    b += '<h2 class="cu-h2">CUET PG LLM at a glance</h2>' + table([
     ("Full form", "Common University Entrance Test (Postgraduate), Law (LL.M.) paper"),
     ("Conducted by", f'National Testing Agency (NTA) · <a href="{NTA}" rel="noopener">exams.nta.nic.in/cuet-pg</a> {OFF}'),
     ("Paper code", f"COQP14 {REP}"), ("Used for", "LL.M. admission at participating central, state and private universities"),
     ("Mode", f"Computer-based test at NTA-allotted centres {REP}"), ("Language", f"English and Hindi {REP}"),
     ("Held", "Once a year, in March (2026: 6 to 27 March; the LL.M. paper on 17 March 2026)"),
     ("Counselling", f"None centrally. Every university runs its own merit list and counselling {REP}")])
    b += '<h2 class="cu-h2">CUET PG 2027 cycle: key dates</h2>' + table([
     ("Revised exam calendar released", "26 October 2026 (first calendar: 16 September 2026)"),
     ("Information Bulletin and registration", "Expected December 2026 (not yet announced)"),
     ("<b>Examination window</b>", "<b>2 March 2027 onwards, over 17 days, no buffer dates</b> (tentative)"),
     ("LL.M. paper date and shift", "Not yet announced; comes with the subject-wise timetable"),
     ("Result and university counselling", "Expected April 2027 (2026 result: 24 April 2026)")], ("Event", "Date"))
    b += '<p class="cu-fine">The 2027 in CUET PG 2027 is the admission year. NTA calls all published dates tentative; trust the bulletin and the NTA website over any other site, including this one.</p>'
    b += '<h2 class="cu-h2">Exam pattern: CUET PG LLM</h2>' + table([
     ("Questions", f"<b>75</b> multiple-choice questions, all compulsory {REP}"), ("Sections", "None. No General Test, language or aptitude part in the LL.M. paper"),
     ("Marks", f"<b>300</b> (4 marks per question) {REP}"), ("Negative marking", f"<b>−1 per wrong answer</b>; unattempted carries nothing {REP}"),
     ("Duration", f"<b>90 minutes</b> in the 2026 papers, about 72 seconds per question. Some older articles say 105 minutes {REP}"),
     ("Difficulty", "Easy to moderate in 2025 and 2026 per candidate feedback; basics such as Constitution, Contract, Torts and IPC dominated")])
    b += '<div class="cu-note blue"><b>A worked example.</b> You attempt 60 questions and get 48 right and 12 wrong: 48 × 4 − 12 × 1 = <b>180</b> out of 300. Had you skipped the 6 you were least sure about, and 3 of them were right, you would have lost 3 × 4 − 3 × 1 = 9 marks. Skipping pays only when you would have been right less than a fifth of the time. See the <a href="analysis.html#planner">score planner</a>.</div>'
    b += '<h2 class="cu-h2">Eligibility, fee and application</h2><ul class="cu-list">'
    b += f'<li><b>Qualification:</b> a bachelor\'s degree or equivalent; candidates in the final year in 2026 were eligible {OFF}. For LL.M. the university will require an LL.B. (three-year or five-year integrated), usually with a minimum percentage (often 50 percent, relaxed for reserved categories) {REP}. The percentage is set by each university, not by NTA.</li>'
    b += f'<li><b>Age:</b> no age limit for appearing in CUET (PG) {OFF}; a university may have its own condition.</li>'
    b += f'<li><b>Fee (2026 cycle, up to two papers):</b> Rs 1,400 General; Rs 1,200 Gen-EWS and OBC-NCL; Rs 1,100 SC, ST and Third Gender; Rs 1,000 PwBD; additional papers Rs 600 to Rs 700 each; outside India Rs 7,000 {OFF}. The 2027 fee will be in the new bulletin.</li>'
    b += '<li><b>How to apply:</b> register on the NTA portal, fill the form, choose the Law (LL.M.) paper code, upload documents, pay the fee online, then check the correction window. Then apply to each university separately after the result.</li></ul>'
    b += '<h2 class="cu-h2">CUET PG LLM versus CLAT PG and AILET</h2>' + table([
     ("Conducted by", "NTA", "Consortium of NLUs", "NLU Delhi"), ("Admits to", "Participating central, state and private universities", "LL.M. at NLUs and some other institutions", "NLU Delhi LL.M. only"),
     ("Questions", "75, standalone", "120, passage-based", "100, standalone"), ("Marks", "300", "120", "100"), ("Negative marking", "−1 (on 4)", "−0.25", "−0.25"),
     ("Mode", "Computer-based", "Offline (pen and paper)", "Offline (pen and paper)"), ("Feel of the paper", "Wide syllabus, direct subject questions", "Read a passage, apply the law", "Direct legal-knowledge questions")],
     ("", "CUET PG LLM", "CLAT PG", "AILET LL.M."))
    b += '<p class="cu-fine">Many aspirants write all three. See our <a href="../clat-pg/">CLAT PG</a> and <a href="../ailet/">AILET</a> sections, and the article <a href="/blog/cuet-pg-llm-vs-clat-pg-vs-ailet.html">CUET PG LLM vs CLAT PG vs AILET</a>.</p>'
    b += '<h2 class="cu-h2">From score to seat: how admission works</h2><ol class="cu-steps"><li><b>NTA publishes the scorecard</b> with your marks and percentile-style details. This is the only thing NTA does after the exam.</li><li><b>Each university announces its own process</b>: an application form, the seats, the eligibility percentage and the date of the merit list.</li><li><b>You apply separately</b> to every university you want. Delhi University uses its CSAS PG portal; BHU runs its own portal.</li><li><b>Merit lists and rounds</b> follow, with reservation as per each university. Many have document verification and fee payment windows.</li><li><b>Keep a backup:</b> apply to more universities than you think you need, because cut-offs depend on the number of test-takers and seats.</li></ol>'
    b += '<h2 class="cu-h2">How to prepare for this paper</h2><ol class="cu-steps"><li><b>Lock in the core subjects first.</b> Constitution, Criminal Law (with BNS, BNSS and BSA), Contract, Torts, Jurisprudence and Family Law.</li><li><b>Cover the wide middle</b> of Property, Company, Administrative, Environmental, International, Human Rights, CPC, Evidence and IPR with bare acts and short notes.</li><li><b>Keep a case file</b> and a section map (old and new criminal-law numbers).</li><li><b>Practise untimed, then add pace</b>: 75 questions in 90 minutes is 72 seconds each.</li><li><b>Review every wrong answer</b> in your <a href="practice.html#mistakes">revision notebook</a> weekly.</li><li><b>Revise current legal developments</b> last: new Acts and recent landmark judgments.</li></ol>'
    b += '<h2 class="cu-h2">Official sources</h2><p class="cu-src">NTA CUET (PG) portal and Information Bulletin: <a href="https://exams.nta.nic.in/cuet-pg/" rel="noopener">exams.nta.nic.in/cuet-pg</a>. NTA exam calendar notice of 26 October 2026: <a href="https://nta.ac.in/" rel="noopener">nta.ac.in</a>. Items marked Reported come from admission-news coverage of the 2026 and 2027 cycles and 2026 memory-based papers.</p>'
    b += '<div class="cu-cta"><a class="btn" href="syllabus.html">See the syllabus →</a><a class="btn" href="practice.html" style="background:var(--ink);color:#fff">Start practising →</a></div>'
    qa = [(q, plain(a)) for g, q, a, e in DF.F if g in ("The exam", "Pattern and marking")][:6]
    sch = [{"@type": "Article", "headline": "What is CUET PG LLM? Exam pattern, dates, eligibility and fee", "inLanguage": "en-IN", "dateModified": MODIFIED, "datePublished": "2026-11-22", "author": {"@type": "Organization", "name": "NET Law-Verse"}, "url": SITE + "/cuet-pg/what-is-cuet-pg.html", "isPartOf": {"@type": "WebSite", "name": "NET Law-Verse", "url": SITE + "/"}}, crumbs(("What is CUET PG LLM", "/cuet-pg/what-is-cuet-pg.html"))]
    W("what-is-cuet-pg.html", page("what-is-cuet-pg.html", "What is CUET PG LLM? Exam Pattern, 2027 Dates, Eligibility, Fee and Admission | NET Law-Verse", "CUET PG LLM explained: 75 MCQs, 300 marks, +4/−1 marking, 90 minutes, exam from 2 March 2027. Eligibility, fee, universities, and CUET PG vs CLAT PG vs AILET.", b, "what-is-cuet-pg.html", sch))

# ---------------- syllabus ----------------
def syllabus():
    tier = {1: ("CORE", "CORE"), 2: ("REGULAR", "REGULAR"), 3: ("OCCASIONAL", "OCCASIONAL")}
    b = hero("CUET PG LLM SYLLABUS · COQP14", "Syllabus", "and tracker", f"The Law (LL.M.) paper draws on {len(DS.S)} subject areas of the LL.B. curriculum. This page breaks each into topics with the cases and sections to know, then lets you tick what you have covered and revised.")
    b += f'<div class="cu-note"><b>How to read this.</b> NTA publishes the subject list for the paper but no topic weightage. The subject list follows the COQP14 coverage reported for recent cycles ({REP}); the topic breakdown and the core, regular and occasional tiers are our own editorial reading of the LL.B. curriculum and recent papers ({EDI}). The <i>typical questions</i> figure is an estimate over a 75-question paper, not an official number. Confirm the syllabus in the 2027 Information Bulletin.</div>'
    b += f'<div class="cu-prog" id="prog"><div><b id="pp">0%</b><br><small id="pt">0 of {ntot} topics covered</small></div><div class="bar" aria-hidden="true"><i id="pb" style="width:0%"></i></div><div><small id="pr">0 revised</small></div><button type="button" id="rst">Reset tracker</button></div>'
    b += '<div class="cu-cta" style="margin-top:0"><button type="button" class="btn" id="exp">Expand all</button><button type="button" class="btn" id="col">Collapse all</button></div>'
    for bi, s in enumerate(DS.S):
        n = sum(len(g[1]) for g in s["groups"])
        b += f'<details class="cu-acc" data-b="{bi}" id="b{bi}"><summary><span class="no">{bi+1}</span><span class="nm">{s["name"]}<small>{tier[s["tier"]][0]} · {n} topics · about {s["q"]} questions</small></span><span class="pc" data-pc>0%</span></summary><div class="body">'
        for gi, (gn, ts) in enumerate(s["groups"]):
            b += f'<p class="cu-grp">{gn}</p>'
            for ti, t in enumerate(ts):
                b += f'<div class="cu-tp" data-id="b{bi}-g{gi}-t{ti}"><div class="ck"><label><input type="checkbox" data-k="d"> Covered</label><label><input type="checkbox" data-k="r"> Revised</label></div><div class="tx">{t}</div></div>'
        b += '</div></details>'
    b += '<p class="cu-fine">Your ticks are stored only in this browser. Pair this with the <a href="practice.html">Practice Arena</a>: after covering a subject, filter practice by it. For the exam view of these subjects see <a href="analysis.html">Paper analysis</a>.</p>'
    js = '''<script>
(function(){
 var KEY='cuet-syllabus-v1',S={};try{S=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
 var rows=[].slice.call(document.querySelectorAll('.cu-tp')),TOT=rows.length;
 rows.forEach(function(r){var s=S[r.dataset.id]||{};r.querySelector('[data-k=d]').checked=!!s.d;r.querySelector('[data-k=r]').checked=!!s.r});
 function upd(){var d=0,r=0;rows.forEach(function(x){var s=S[x.dataset.id]||{};if(s.d)d++;if(s.r)r++});
  var p=TOT?Math.round(d/TOT*100):0;document.getElementById('pp').textContent=p+'%';document.getElementById('pt').textContent=d+' of '+TOT+' topics covered';
  document.getElementById('pr').textContent=r+' revised';document.getElementById('pb').style.width=p+'%';
  [].forEach.call(document.querySelectorAll('.cu-acc'),function(a){var rs=[].slice.call(a.querySelectorAll('.cu-tp')),c=0;rs.forEach(function(x){if((S[x.dataset.id]||{}).d)c++});a.querySelector('[data-pc]').textContent=c+'/'+rs.length})}
 document.addEventListener('change',function(e){var c=e.target;if(!c.matches||!c.matches('.cu-tp input'))return;var id=c.closest('.cu-tp').dataset.id,s=S[id]=S[id]||{};
  if(c.checked)s[c.dataset.k]=1;else delete s[c.dataset.k];
  if(c.dataset.k==='r'&&c.checked){s.d=1;c.closest('.cu-tp').querySelector('[data-k=d]').checked=true}
  if(!s.d&&!s.r)delete S[id];save();upd()});
 document.getElementById('exp').onclick=function(){[].forEach.call(document.querySelectorAll('.cu-acc'),function(a){a.open=true})};
 document.getElementById('col').onclick=function(){[].forEach.call(document.querySelectorAll('.cu-acc'),function(a){a.open=false})};
 document.getElementById('rst').onclick=function(){if(confirm('Clear all ticks on the syllabus tracker? This cannot be undone.')){S={};save();rows.forEach(function(r){r.querySelectorAll('input').forEach(function(i){i.checked=false})});upd()}};
 if(location.hash){var m=/^#b(\\d+)$/.exec(location.hash);if(m){var a=document.querySelector('.cu-acc[data-b="'+m[1]+'"]');if(a)a.open=true}}
 upd();
})();
</script>'''
    sch = [{"@type": "WebPage", "name": "CUET PG LLM Syllabus and Tracker", "url": SITE + "/cuet-pg/syllabus.html", "inLanguage": "en-IN", "dateModified": MODIFIED, "isPartOf": {"@type": "WebSite", "name": "NET Law-Verse", "url": SITE + "/"}}, crumbs(("Syllabus", "/cuet-pg/syllabus.html"))]
    W("syllabus.html", page("syllabus.html", f"CUET PG LLM Syllabus 2027 (COQP14): {len(DS.S)} Subjects, Topic-Wise, with Tracker | NET Law-Verse", f"CUET PG LLM syllabus 2027 subject by subject: Constitution, Contract, Torts, Criminal Law, Jurisprudence, Family Law and more, with {ntot} topics, key cases and a free progress tracker.", b, "syllabus.html", sch, extra_script=js))

# ---------------- analysis ----------------
def analysis():
    tiers = {1: "", 2: " t2", 3: " t3"}
    def mid(q): a, c = [int(x) for x in re.findall(r"\d+", q)]; return (a + c) / 2
    rows = sorted(DS.S, key=lambda s: -mid(s["q"]))
    mx = max(mid(s["q"]) for s in rows)
    bars = ''.join(f'<div class="cu-bar{tiers[s["tier"]]}"><span class="lb">{s["name"]}</span><span class="tr"><i style="width:{round(mid(s["q"])/mx*100)}%"></i></span><span class="nm">{s["q"]}</span></div>' for s in rows if mid(s["q"]) >= 1.5)
    rest = ', '.join(s["name"] for s in rows if mid(s["q"]) < 1.5)
    b = hero("PAPER ANALYSIS · QUESTIONS · TRENDS", "Paper", "analysis", "What the CUET PG LLM paper has looked like, which subjects carry the marks, what kinds of questions are asked, how the paper has changed, and how +4 and −1 should shape the way you attempt it.")
    b += f'<div class="cu-note"><b>Where these numbers come from.</b> NTA does not publish subject-wise weightage or official papers with topic tags. This page combines {OFF} pattern facts, {REP} candidate counts and difficulty feedback from 2025 and 2026 coverage, and {EDI} estimates built from the syllabus structure and published coaching analyses. Treat the estimates as a planning guide, not a promise.</div>'
    b += '<h2 class="cu-h2">The paper at a glance, year by year</h2>' + table([
     ("Law (LL.M.) paper code", "COQP14", "COQP14", "COQP14"),
     ("Questions and marks", "75 questions, 300 marks", "75 questions, 300 marks", "75 questions, 300 marks"),
     ("Marking", "+4 / −1", "+4 / −1", "+4 / −1"),
     ("Reported duration", "105 minutes in some reports", "90 minutes in most reports", "90 minutes"),
     ("Date of the LL.M. paper", "Not found", "26 March 2025", "17 March 2026"),
     ("Registered for LL.M.", "Not found", "about 13,335", "about 14,701"),
     ("Candidates appeared", "Not found", "about 11,000", "about 11,000"),
     ("Difficulty (reports)", "Moderate", "Easy to moderate", "Easy to moderate"),
     ("What stood out", "Case-based questions on judicial review and PIL (reported)", "Basic subjects; easy to moderate", "Constitution, Contract, Torts, IPC; no general awareness")], ("", "2024", "2025", "2026"))
    b += '<p class="cu-fine">Reported figures come from NTA result data as quoted by Careers360 and admission-news sites; the two years\' appeared counts are close and one source repeats the same figure for both, so read them as roughly 11,000. Before 2024 the Law paper carried a General Test part and 100 questions; the General Test was dropped when the paper moved to 75 questions.</p>'
    b += '<h2 class="cu-h2">Which subjects carry the marks? (typical questions in 75)</h2><p class="cu-sub">An editorial estimate of how many of the 75 questions each subject usually supplies. Pink = core, yellow = regular, green = occasional.</p><div class="cu-card"><div class="cu-bars">' + bars + '</div></div>'
    b += f'<p class="cu-fine">Subjects expected to supply fewer than two questions in a typical paper: {rest}. Ranges overlap and do not add to 75 because a paper never repeats the same split; use them to rank your time, not to skip a subject.</p>'
    b += '<h2 class="cu-h2">Core, regular, occasional</h2><div class="cu-tier"><div class="t"><div><span class="tag">CORE</span></div><p><b>Constitution of India</b> is the single largest block. Add <b>Criminal Law (substantive and procedure), Contract, Torts, Jurisprudence and Hindu Law</b>. Together these usually supply well over half of the paper.</p></div><div class="t r2"><div><span class="tag">REGULAR</span></div><p><b>Property, Company, Administrative, Muslim Law, Environmental, Public International Law, Human Rights, CPC, Evidence, IPR and Interpretation of Statutes</b> give a few questions each; any one of them can surprise you.</p></div><div class="t r3"><div><span class="tag">OCCASIONAL</span></div><p><b>Labour, Banking, Insurance, ADR, RTI, Taxation, Competition, Professional Ethics, Penology, White Collar Crimes, Women and Criminal Law and International Trade</b> give one or two questions or none. Do the basics for these late.</p></div></div>'
    b += '<h2 class="cu-h2">What kinds of questions are asked?</h2>' + table([
     ("Direct recall", "Which Article, section or Act deals with X? Who propounded Y?", "Memory of numbers and names; the largest share"),
     ("Case-to-principle", "Which case laid down the doctrine of Z?", "A short case list per subject"),
     ("Statement-based", "Consider statements I and II; which is correct?", "Read qualifiers: only, always, except"),
     ("Match the following", "Match schools, cases, sections or Acts", "Learn pairs, not paragraphs"),
     ("Assertion and reason", "Assertion (A) and Reason (R): choose the best option", "Check whether R explains A"),
     ("Application", "A short fact situation with a one-line legal question", "Rarer than in CLAT PG; usually basic")], ("Type", "Looks like", "How to handle it"))
    b += '<h2 class="cu-h2">Trends to plan around</h2><div class="cu-grid">'
    for t, p in [("The paper is wide, not deep", "Thirty-plus subjects in 75 questions means many subjects appear once. Breadth with accurate basics beats deep reading of a few subjects."),
     ("Basics dominate", "Easy-to-moderate ratings in 2025 and 2026 came from direct questions on standard LL.B. content. Marks are lost on carelessness and half-knowledge, not on obscure cases."),
     ("Old and new criminal codes", "2026 papers still used IPC terms. With BNS, BNSS and BSA in force since July 2024, expect mixed numbering over the next cycles: know both."),
     ("Current developments matter a little", "Recent Acts (Labour Codes, Mediation Act 2023, DPDP Act 2023) and landmark judgments appear as one-liners. A short last-month revision is enough."),
     ("Competition is regional", "About 11,000 candidates sat the LL.M. paper in 2026, but each university has few seats, so the cut-off you need depends on where you apply, not on a national rank."),
     ("Accuracy beats attempts", "With −1 on every wrong answer, 60 accurate attempts usually beat 75 guessed ones. Use the planner below.")]:
        b += f'<div class="cu-card"><h3>{t}</h3><p>{p}</p></div>'
    b += '</div><h2 class="cu-h2" id="planner">Score and attempt planner</h2><p class="cu-sub">+4 for a right answer, −1 for a wrong one, 0 for a blank. Enter how many you attempt and how many you get right.</p>'
    b += '''<div class="cu-plan"><div class="row"><label>Questions attempted (0 to 75)<input id="pa" type="number" min="0" max="75" value="60" inputmode="numeric"></label><label>Of those, correct<input id="pc" type="number" min="0" max="75" value="48" inputmode="numeric"></label></div>
<div class="cu-out"><div><b id="o-s">180</b><small>score out of 300</small></div><div><b id="o-p">60%</b><small>of the maximum</small></div><div><b id="o-w">12</b><small>wrong answers</small></div><div><b id="o-a">80%</b><small>accuracy</small></div></div>
<p class="cu-fine" id="o-m" style="margin-top:12px"></p></div>
<script>(function(){var a=document.getElementById('pa'),c=document.getElementById('pc');function n(v){v=parseInt(v,10);return isNaN(v)?0:v}
function go(){var A=Math.max(0,Math.min(75,n(a.value))),C=Math.max(0,Math.min(A,n(c.value))),W=A-C,S=4*C-W;
document.getElementById('o-s').textContent=S;document.getElementById('o-p').textContent=Math.round(S/3)+'%';document.getElementById('o-w').textContent=W;
document.getElementById('o-a').textContent=A?Math.round(C/A*100)+'%':'–';
var m='';if(A&&C/A<0.2)m='At under 20% accuracy every attempt loses marks on average: 4×0.2 − 1×0.8 = 0.';else if(A&&C/A<0.5)m='Below 50% accuracy, attempting more questions adds little. Raise accuracy first.';else if(A)m='Each extra question you answer correctly is worth +4, each wrong one −1, so one wrong answer costs a quarter of a right one. Skip questions where you cannot remove two options.';
document.getElementById('o-m').textContent=m}
a.oninput=c.oninput=go;go()})();</script>'''
    sc = [(60, 48), (65, 52), (70, 56), (75, 60), (60, 54), (75, 45)]
    b += '<h3 class="cu-h3" style="margin:20px 0 8px">Sample outcomes</h3>' + table([(f"{a}", f"{c}", f"{a-c}", f"<b>{4*c-(a-c)}</b>", f"{round(c/a*100)}%") for a, c in sc], ("Attempted", "Correct", "Wrong", "Score / 300", "Accuracy"))
    b += '<p class="cu-fine">Break-even is 20 percent accuracy: below it a blind attempt loses marks on average. Narrowing four options to two moves a guess to 50 percent, where the expected gain is +1.5 per question.</p>'
    b += '<h2 class="cu-h2">Strategy that follows from the trends</h2><ol class="cu-steps"><li><b>Pass 1 (about 45 minutes):</b> answer every question you are sure of. Do not linger past 60 seconds.</li><li><b>Pass 2 (about 30 minutes):</b> return to questions where you can remove two options; answer those.</li><li><b>Pass 3 (rest):</b> check marked answers and leave the pure guesses blank.</li><li><b>Prepare in layers:</b> core subjects to 90 percent, regular to 70 percent, occasional to the basics.</li><li><b>Practise in the real ratio:</b> the <a href="practice.html">Practice Arena</a> scores 1 and −0.25, which is +4 and −1 divided by four.</li></ol>'
    b += '<h2 class="cu-h2">Related guides</h2>' + art_cards([ARTICLES[3], ARTICLES[1], ARTICLES[5]])
    sch = [{"@type": "Article", "headline": "CUET PG LLM paper analysis: subject-wise questions, trends and question types", "inLanguage": "en-IN", "dateModified": MODIFIED, "datePublished": "2026-11-22", "author": {"@type": "Organization", "name": "NET Law-Verse"}, "url": SITE + "/cuet-pg/analysis.html"}, crumbs(("Paper analysis", "/cuet-pg/analysis.html"))]
    W("analysis.html", page("analysis.html", "CUET PG LLM Paper Analysis: Subject-Wise Questions, Trends and Score Planner | NET Law-Verse", "CUET PG LLM paper analysis: difficulty, subject-wise question estimates, question types, 2024 to 2026 changes and a +4/−1 score and attempt planner.", b, "analysis.html", sch))

# ---------------- universities ----------------
def universities():
    b = hero("CENTRAL · STATE · PRIVATE", "Universities", "using CUET PG", "Institutions reported to admit to LL.M. through the CUET PG Law score, with the exams that are not CUET PG. Participation changes every year, so use this as a starting shortlist and confirm on each university's own admission page.")
    b += f'<div class="cu-note"><b>How to use this list.</b> No official, complete list exists in one place: NTA publishes the list of participating universities in each cycle, and each university decides whether its LL.M. uses CUET PG. Entries marked <span class="cu-tag ok">Widely reported</span> were named in several 2026 admission lists; <span class="cu-tag sun">Reported</span> means at least one list names it. Careers360 counted about 142 participating universities in 2026, of which about 54 offer LL.M. programmes ({REP}).</div>'
    b += '<div class="cu-filter"><input type="search" id="uq" placeholder="Search by name, city or state" aria-label="Search universities"><button class="cu-chipbtn" data-f="all" aria-pressed="true">All</button><button class="cu-chipbtn" data-f="c" aria-pressed="false">Central</button><button class="cu-chipbtn" data-f="s" aria-pressed="false">State</button><button class="cu-chipbtn" data-f="p" aria-pressed="false">Private</button></div><div class="cu-uni" id="ul">'
    tl = {"c": ("Central", "c"), "s": ("State", "s"), "p": ("Private", "p")}
    for n, t, loc, conf, note in DU.U:
        cf = '<span class="cu-tag ok">Widely reported</span>' if conf == "core" else '<span class="cu-tag sun">Reported</span>'
        b += f'<div class="cu-u" data-t="{t}" data-s="{esc((n + " " + loc).lower())}"><h3>{n}</h3><div class="mt"><span class="cu-tag {tl[t][1]}">{tl[t][0]}</span>{cf}</div><p><b>{loc}</b></p><p>{note}</p></div>'
    b += '</div><div class="cu-empty" id="ue" hidden>No university matches. Clear the search or the filter.</div>'
    b += '<h2 class="cu-h2">Not CUET PG: do not confuse these</h2><div class="cu-tblw"><table class="cu-tbl"><thead><tr><th>Institution</th><th>LL.M. route</th></tr></thead><tbody>' + ''.join(f'<tr><td>{a}</td><td>{c}</td></tr>' for a, c in DU.NOT_CUET) + '</tbody></table></div>'
    b += '<p class="cu-fine">See our <a href="../clat-pg/">CLAT PG</a> and <a href="../ailet/">AILET</a> sections for those routes.</p>'
    b += '<h2 class="cu-h2">What to check before you shortlist</h2><ol class="cu-steps"><li><b>Does this year\'s LL.M. use CUET PG?</b> Open the university\'s admission page and the NTA participating-university list.</li><li><b>Eligibility:</b> minimum LL.B. percentage, final-year rule, and any age or specialisation condition.</li><li><b>Seats and reservation:</b> LL.M. intake is small; confirm category-wise seats.</li><li><b>Programme:</b> one-year or two-year LL.M., specialisations, and fee for the whole course.</li><li><b>Process dates:</b> each university has its own form, merit list and rounds after the result in April.</li><li><b>Backup list:</b> apply to a mix of central, state and private options.</li></ol>'
    b += '<h2 class="cu-h2">Related guides</h2>' + art_cards([ARTICLES[4], ARTICLES[7], ARTICLES[6]])
    js = '''<script>(function(){var q=document.getElementById('uq'),f='all',cs=[].slice.call(document.querySelectorAll('.cu-u')),e=document.getElementById('ue');
function run(){var t=q.value.trim().toLowerCase(),n=0;cs.forEach(function(c){var ok=(f==='all'||c.dataset.t===f)&&(!t||c.dataset.s.indexOf(t)>-1);c.hidden=!ok;if(ok)n++});e.hidden=n>0}
q.oninput=run;[].forEach.call(document.querySelectorAll('.cu-chipbtn'),function(b){b.onclick=function(){f=b.dataset.f;[].forEach.call(document.querySelectorAll('.cu-chipbtn'),function(x){x.setAttribute('aria-pressed',x===b)});run()}})})();</script>'''
    il = {"@type": "ItemList", "name": "Universities reported to use CUET PG for LL.M. admission", "itemListElement": [{"@type": "ListItem", "position": i + 1, "item": {"@type": "CollegeOrUniversity", "name": n.split(",")[0]}} for i, (n, *_r) in enumerate(DU.U)]}
    sch = [{"@type": "WebPage", "name": "Universities accepting CUET PG LLM", "url": SITE + "/cuet-pg/universities.html", "inLanguage": "en-IN", "dateModified": MODIFIED}, il, crumbs(("Universities", "/cuet-pg/universities.html"))]
    W("universities.html", page("universities.html", "Universities Accepting CUET PG LLM 2027: Central, State and Private List | NET Law-Verse", "List of universities reported to admit to LL.M. through CUET PG: DU, BHU, BBAU, CUSB, central, state and private, with search and the exams that are not CUET PG.", b, "universities.html", sch, extra_script=js))

# ---------------- practice ----------------
def practice():
    cfg = """<script>window.PRACTICE_CFG={exam:'CUET PG LLM',arena:'Practice Arena',slug:'cuet',key:'cuet-practice-v1',qkey:'cuet-practice-queue',dir:'practice/',mocks:true,neg:0.25,pill:'FREE · NO SIGN-UP · NO TIMER',
trapLabel:'The CUET PG trap: how this question is tricky',langLabel:'Language trick',
heroLead:'Standalone MCQs on the subjects the CUET PG LLM paper tests, each with the answer, the reasoning and the trap. Practise by subject or difficulty, bookmark what you want to revisit, and take full mock tests with no timer.',
how:[['Scored in the real ratio','The real paper gives +4 for a right answer and −1 for a wrong one. Here each right answer is 1 mark and each wrong one −0.25, which is the same scheme divided by four. Multiply your marks by 4 to compare with the 300-mark paper.'],
['Learn from every answer','Show the answer and see why it is right, why each other option fails, and the trap that makes the question harder than it looks.'],
['Revision is built in','Wrong answers, bookmarks and your own notes collect in <b>My mistakes</b> and <b>Bookmarks</b>. Progress is saved in this browser; use Backup on the Progress tab to move it.']]};</script>"""
    body = '<div id="pr-root" class="pr-root"><div class="pr-load" role="status">Loading…</div><noscript>JavaScript is required for the Practice Arena.</noscript></div>'
    sch = [{"@type": "LearningResource", "name": "CUET PG LLM Practice Arena", "url": SITE + "/cuet-pg/practice.html", "inLanguage": "en-IN", "educationalLevel": "Postgraduate entrance", "isAccessibleForFree": True}, crumbs(("Practice", "/cuet-pg/practice.html"))]
    s = page("practice.html", "CUET PG LLM Practice Arena and Mock Tests (No Timer) | NET Law-Verse", "Free CUET PG LLM practice questions with explanations, bookmarks, a mistakes notebook and progress tracking, scored in the real +4/−1 ratio. No sign-up, no timer.", body, "practice.html", sch,
             extra_head='<link rel="stylesheet" href="../clat-pg/practice.css">' , extra_script='<script src="../nl-report.js"></script><script src="../clat-pg/practice.js"></script>', body_class="cu-page pr-page")
    s = s.replace('<link rel="stylesheet" href="cuet.css">', '<link rel="stylesheet" href="cuet.css">' + cfg)
    W("practice.html", s)

# ---------------- faq ----------------
def faq():
    b = hero("CUET PG LLM FAQ", "Questions", "answered", "Short answers to the questions every LL.M. aspirant asks about CUET PG: dates, pattern, negative marking, eligibility, syllabus, universities and how it compares with CLAT PG and AILET.")
    b += f'<div class="cu-note blue"><b>Facts change every cycle.</b> The 2027 Information Bulletin is not out yet. Answers use the 2026 bulletin and 2026 papers and say so where a 2027 detail is still awaited. Confirm everything on <a href="{NTA}" rel="noopener">exams.nta.nic.in/cuet-pg</a>.</div><div class="cu-faq">'
    cur = None
    for g, q, a, e in DF.F:
        if g != cur:
            b += ('' if cur is None else '') + f'<h2 class="cu-h2">{g}</h2>'; cur = g
        b += f'<details><summary>{q}</summary><div class="a"><p>{a}</p>' + (f'<p>{e}</p>' if e else '') + '</div></details>'
    b += '</div><div class="cu-cta"><a class="btn" href="what-is-cuet-pg.html">Read the full guide →</a><a class="btn" href="practice.html" style="background:var(--ink);color:#fff">Start practising →</a></div><h2 class="cu-h2">Read next</h2>' + art_cards(ARTICLES[:4])
    sch = [{"@type": "WebPage", "name": "CUET PG LLM FAQ", "url": SITE + "/cuet-pg/faq.html", "inLanguage": "en-IN", "dateModified": MODIFIED}, crumbs(("FAQ", "/cuet-pg/faq.html")), faq_ld([(q, plain(a) + (" " + plain(e) if e else "")) for g, q, a, e in DF.F])]
    W("faq.html", page("faq.html", "CUET PG LLM FAQ 2027: Dates, Pattern, Negative Marking, Eligibility, Universities | NET Law-Verse", f"{len(DF.F)} answers on CUET PG LLM: exam date 2 March 2027, 75 MCQs, +4/−1 marking, eligibility, fee, syllabus, universities and CUET PG vs CLAT PG.", b, "faq.html", sch))

if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    hub(); what(); syllabus(); analysis(); universities(); practice(); faq()
    print("built:", sorted(p.name for p in OUT.glob("*.html")))
