"""CUET PG timed mock tests: mock-tests.html and mock-test-1..8.html (uses the shared chrome in common.py).
Data files come from build_mocks_data.py. Standard library only."""
import pathlib, json
from common import page, hero, crumbs, SITE, MODIFIED, esc
import build_mocks_data as BD

OUT = BD.OUT
SCRIPTS = '<script src="../nl-report.js"></script><script src="../nl-share.js"></script><script src="cuet-mock-meta.js"></script>'


def build():
    metas = BD.build()
    for m in metas:
        n = m["n"]
        url = f"{SITE}/cuet-pg/mock-test-{n}.html"
        title = f"CUET PG LL.M. Mock Test {n}: 75 Questions, +4/−1 Marking | NET Law-Verse"
        desc = f"Free CUET PG LL.M. Mock Test {n}: 75 MCQs, 300 marks, 90 minutes, +4/−1 marking. {m['theme']}. Time meter, instant analysis and a personalised assessment."
        body = (f'<div id="app" data-n="{n}"><noscript>JavaScript is required for the mock test.</noscript></div>'
                f'<section class="cm-sec" style="max-width:940px;margin:0 auto"><h2>About this mock test</h2><p>CUET PG LL.M. Mock Test {n} is a free, timed practice paper in the CUET PG Law pattern: <b>75 multiple-choice questions</b> in <b>90 minutes</b>, '
                f'+4 for each correct answer and −1 for each wrong answer, for 300 marks. {esc(m["blurb"])} Your answers and result stay in your browser; there is no sign-up.</p></section>')
        sch = [{"@type": "LearningResource", "name": f"CUET PG LL.M. Mock Test {n}", "url": url, "description": desc, "inLanguage": "en-IN", "isAccessibleForFree": True,
                "educationalLevel": "Postgraduate (LL.M. entrance)", "learningResourceType": "Mock test", "timeRequired": "PT90M", "numberOfItems": 75, "dateModified": MODIFIED},
               crumbs(("Mock tests", "/cuet-pg/mock-tests.html"), (f"Mock Test {n}", f"/cuet-pg/mock-test-{n}.html"))]
        s = page(f"mock-test-{n}.html", title, desc, body, "mock-tests.html", sch,
                 extra_script=SCRIPTS + f'<script src="cuet-mock-data-{n}.js"></script><script src="cuet-mock-engine.js"></script>')
        # exam pages: only the app bar float, as on the CLAT PG / AILET mock test pages
        s = s.replace('<script>if(!/[?&]embed=1/.test(location.search)){["/nl-follow-float.js","/nl-lead-float.js","/nl-appbar.js"].forEach(function(u){var s=document.createElement("script");s.src=u;s.defer=true;document.body.appendChild(s)})}</script>',
                      '<script src="/nl-appbar.js" defer></script>')
        (OUT / f"mock-test-{n}.html").write_text(s, encoding="utf-8")
    body = hero("FREE · NO SIGN-UP", "Free CUET PG LL.M.", "Mock Tests", "Full-length practice papers in the CUET PG Law pattern: 75 questions in 90 minutes, +4/−1 marking, a green-to-red time meter, instant result analysis and a personalised assessment.")
    body += ('<div class="cm-cards" id="mock-root"><noscript>JavaScript is required for the mock tests.</noscript></div>'
             '<section class="cm-sec"><h2>The paper, as in the exam</h2><p>Every mock follows the published CUET PG Law pattern, so your timing and marking practice carries over to exam day.</p>'
             '<div class="cm-tiles"><div class="cm-tile"><b>75</b><small>questions</small></div><div class="cm-tile"><b>90</b><small>minutes</small></div><div class="cm-tile"><b>300</b><small>marks</small></div><div class="cm-tile"><b>+4 / −1</b><small>marking</small></div></div>'
             '<p class="cm-note">Like the real paper, each mock is one set of 75 standalone MCQs with no passages and no sections, drawn from constitutional law, jurisprudence, contract, torts, criminal and procedural law, evidence, international law and more. The eight papers rise in difficulty from Mock Test 1 to Mock Test 8. Your answers and results stay in this browser. After every attempt you get an area-wise and difficulty-wise analysis, a pace chart, timing per area and a preparation assessment. Categories are website practice guides, not official NTA categories.</p></section>'
             '<section class="cm-cta"><div><h3>New to the pattern?</h3><p>Read what CUET PG is, check the syllabus, then come back and time yourself.</p></div><div class="cm-row"><a class="btn" href="what-is-cuet-pg.html">What is CUET PG?</a><a class="btn" href="syllabus.html">Syllabus</a><a class="btn" href="practice.html">Practice Arena</a></div></section>')
    sch = [{"@type": "CollectionPage", "name": "Free CUET PG LL.M. Mock Tests", "url": SITE + "/cuet-pg/mock-tests.html", "inLanguage": "en-IN", "dateModified": MODIFIED,
            "isPartOf": {"@type": "WebSite", "name": "NET Law-Verse", "url": SITE + "/"}}, crumbs(("Mock tests", "/cuet-pg/mock-tests.html"))]
    s = page("mock-tests.html", "Free CUET PG LL.M. Mock Tests: 75 Questions, 90 Minutes | NET Law-Verse",
             "Free CUET PG LL.M. mock tests in the real pattern: 75 MCQs, 90 minutes, +4/−1 marking, time meter and a personalised assessment. 8 full papers, no sign-up.",
             body, "mock-tests.html", sch, extra_script=SCRIPTS + '<script src="cuet-mock-home.js"></script>')
    (OUT / "mock-tests.html").write_text(s, encoding="utf-8")
    return len(metas)


if __name__ == "__main__":
    print("built mocks:", build())
