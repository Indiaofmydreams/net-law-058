AIBE SECTION (All India Bar Examination)
========================================
URL:  /aibe/          (also opens inside the phone app at #/aibe)
The old placeholder page aibe-2027.html now redirects here.

NO DATES, ON PURPOSE
  Exam dates, application windows, fees and result dates are not listed anywhere in this section. Pages tell
  students to check the Bar Council of India notification. If you later want to add dates, put them in
  index.html (the "About dates" note) and what-is-aibe.html (the "Dates, fees and registration" box).

PAGES
  index.html          Hub (toolkit, live counts from practice/index.json)
  what-is-aibe.html   Exam guide: at a glance, why it matters, pattern, pass marks, eligibility,
                      19-subject mark distribution, new criminal laws, question style, AIBE vs LL.M. tests, prep steps
  syllabus.html       19 subjects with approximate marks, 59 topic groups, covered/revised tracker
  practice.html       Practice Arena + Mock tests + My mistakes + Bookmarks + Progress
  faq.html            16 questions with FAQ structured data

THINGS YOU MAY WANT TO EDIT PERIODICALLY
  Pass marks:  practice.html, near the top, in window.PRACTICE_CFG -> pass:[{label,pct}, ...]
               (mock results show a pass-mark check using these). Also mentioned as text in what-is-aibe.html
               and faq.html (marked "Reported").
  Pattern facts (100 MCQs, 100 marks, 3h30m, no negative marking, 19 subjects, mark distribution table):
               what-is-aibe.html and faq.html. Every such line is marked "Reported" because it comes from
               coverage of recent editions, not from a current BCI notice. Update them from the latest notification.
  If negative marking is ever introduced: set neg:0.25 (or the new value) in practice.html PRACTICE_CFG; all
  wording and scoring follow.

ADDING CONTENT (same as AILET; no code changes)
  1. Practice set: copy practice/_template-set.json -> practice/set-01.json, fill in, add an entry to
     practice/index.json (see practice/_index-example.json). A set can be one subject or mixed.
  2. Mock test:    copy practice/_template-mock.json -> practice/mock-01.json (100 questions) and add an entry with
     "type":"mock". Mocks are untimed.
  Question fields: question, options{A-D}, correct_option; optional subject_area, difficulty, explanation,
  why_other_options_are_wrong, aibe_trap, language_trick. Subject names with brackets are grouped under the
  base subject for filters and progress. Use the AIBE subject names from syllabus.html so Progress lines up.

SHARED ENGINE
  Uses ../clat-pg/practice.js and practice.css, like AILET. Storage key "aibe-practice-v1", separate from
  CLAT PG and AILET. Syllabus tracker key "aibe-syllabus-v1".

NO TIMER
  Assumed to match AILET: nothing on the AIBE practice or mock pages counts down. The real paper's 3 hours 30 minutes
  appears only as information.
