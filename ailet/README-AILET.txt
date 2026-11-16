AILET SECTION (NLU Delhi LL.M.)
===============================
URL:  /ailet/         (also opens inside the phone app at #/ailet)

PAGES
  index.html          Hub (toolkit cards, exam date banner, live counts read from practice/index.json)
  what-is-ailet.html  Exam guide: at a glance, key dates, pattern, marking, tie-break, eligibility, seats,
                      other AILET papers, AILET vs CLAT PG, past-paper trends, how to prepare, sources
  syllabus.html       13 official branches + allied areas, 104 topics, cases to know, covered/revised tracker
  practice.html       Practice Arena + Mock tests + My mistakes + Bookmarks + Progress (one page, hash tabs)
  faq.html            15 questions with FAQ structured data
  ailet.css, ailet-embed.js   styles; embed behaviour for the app

ENGINE
  practice.html uses the SAME engine as the CLAT PG Practice Arena: ../clat-pg/practice.js and practice.css.
  AILET behaviour comes from window.PRACTICE_CFG in practice.html (storage key "ailet-practice-v1", mocks on).
  CLAT PG pages are unaffected (they set no config, so the original behaviour applies).

NO TIMER
  Nothing on the AILET practice or mock pages counts down or records time. The real paper's 120 minutes is
  mentioned only as information.

ADDING CONTENT (no code changes needed)
  1. Practice set:  copy practice/_template-set.json -> practice/set-01.json, fill in, and add an entry to
                    practice/index.json (see practice/_index-example.json).
  2. Mock test:     copy practice/_template-mock.json -> practice/mock-01.json, fill in 100 questions, and add an
                    entry with "type":"mock".
  Files starting with "_" are templates and are never loaded.
  Question fields: question, options{A-D} (or an array of 4), correct_option, and optionally subject_area,
  difficulty (Moderate/Tough/Extreme), explanation, why_other_options_are_wrong, ailet_trap, language_trick.
  Standalone questions go in a flat "questions" list; the engine groups them in blocks of 10 ("block_size").
  A CLAT-style "passages" list also works. Subject names with brackets, e.g. "Constitutional Law (Judiciary)",
  are grouped under the base subject for filters and progress.

WHAT STUDENTS GET
  Practice: show answer -> verdict, explanation, why other options fail, trap, language trick; bookmarks; notes;
            palette; sessions by subject / difficulty / unattempted / mistakes / bookmarked; progress.
  Mocks:    start, resume (answers saved), mark for review, clear response, palette, submit with confirmation,
            then net marks, accuracy, subject and difficulty breakdown, what-to-do-next advice, attempt history,
            full review with explanations. Wrong answers flow into My mistakes automatically.
            Retake clears the current answers (score history is kept).

KEEP THESE CURRENT EACH CYCLE (search for "13 December 2026" and "10 November 2026")
  index.html, what-is-ailet.html, faq.html, and m-clat.js has no dates. Eligibility (50% / 45%), seat numbers,
  application dates and result timing are marked "Reported" on the guide: confirm them in the official NLU Delhi
  notification and update the page. The pattern (100 MCQs, 100 marks, 120 minutes, 0.25 negative, tie-break) and
  the LL.M. branch scheme are from NLU Delhi's own exam-details page.
  The syllabus topic breakdown and the core / regular / occasional tiers are editorial, built from standard LL.B.
  coverage and coaching analyses of past papers. NLU Delhi publishes no topic list.
