CUET PG SECTION (LL.M.)
=======================
URL:  /cuet-pg/        (also opens inside the phone app at #/cuet)
Built like the AILET section: same head, header, tabs, footer, theme picker, embed hook, Practice Arena engine.

PAGES
  index.html           Hub: key facts, exam-date banner, toolkit cards, PAA answers, 8 guides, live practice counts
  what-is-cuet-pg.html Exam guide: at a glance, 2027 dates, pattern, eligibility, fee, vs CLAT PG / AILET, admission steps
  syllabus.html        33 subject areas, 99 topic rows (cases, sections, BNS/BNSS/BSA numbers), covered/revised tracker
  analysis.html        Paper analysis: year table, subject-wise estimates, question types, trends, +4/-1 score planner
  universities.html    20 universities with search + type filter, "not CUET PG" list, shortlist checklist
  practice.html        Practice Arena + Mock tests + My mistakes + Bookmarks + Progress (hash tabs)
  faq.html             26 PAA-style answers with FAQPage structured data
  cuet.css, cuet-embed.js

HOW IT IS GENERATED
  Pages are generated from data files. Edit, then run  python3 _tools/cuet_pg/build.py  (standard library only).
    _tools/cuet_pg/data_syllabus.py   subjects, tiers, estimated questions, topics
    _tools/cuet_pg/data_univ.py       universities (+ "not CUET PG" list)
    _tools/cuet_pg/data_faq.py        FAQ
    _tools/cuet_pg/build.py           page text, dates banner, year table
  Practice questions are plain JSON in cuet-pg/practice/ (see _template-set.json, _template-mock.json, _index-example.json).

MARKING NOTE
  The shared practice engine scores +1 per right answer. CUET PG is +4 / -1, so PRACTICE_CFG uses neg:0.25
  (identical scheme divided by four). The pages say "multiply by 4". No engine code was changed.

UPDATE CHECKLIST WHEN NTA PUBLISHES THE 2027 BULLETIN
  1. build.py: exam dates (hub banner, what-is "key dates", analysis year table), fee table in what-is and the eligibility post.
  2. data_faq.py: dates, fee, duration answers.
  3. data_univ.py: confirm each university for the new cycle.
  4. Blog posts: blog/_src/cuet-pg-llm-*.html and how-to-prepare-for-cuet-pg-llm-in-3-months.html (dates, fee, VERIFY notes).
  5. Bump MODIFIED in _tools/cuet_pg/common.py and lastmod in sitemap.xml.

FACT LABELS
  OFFICIAL = from NTA's 2026 bulletin/FAQs.  REPORTED = admission-news coverage and 2026 papers.  EDITORIAL = our estimates
  (subject-wise question counts, core/regular/occasional tiers). NTA publishes no weightage.
