CLAT PG PRACTICE ARENA
======================
Page:      clat-pg/practice.html   (also opens inside the phone app at #/clat/practice, as an embedded page)
Code:      clat-pg/practice.js, clat-pg/practice.css   (no build step, no framework)
Data:      clat-pg/practice/index.json  (list of sets)  +  set-01.json, set-02.json, set-03.json  (150 questions each)

ADD ANOTHER SET LATER
1. Save the new JSON (same structure as set-01.json) as clat-pg/practice/set-02.json.
2. Add one entry to clat-pg/practice/index.json:
   {"id":"set-02","file":"set-02.json","title":"Practice Set 02","tag":"Advanced","blurb":"..."}
   The hub, mistakes notebook, bookmarks and progress pages pick it up automatically.
   (Question numbers q_no must be unique inside a set; progress is stored per set id.)

JSON FIELDS USED
 passages[].passage_id / subject_area / title / passage / word_count
 questions[].q_no / question / options{A-D} / correct_option / explanation /
             why_other_options_are_wrong / clat_trap / language_trick / difficulty
 Anything else in the file is ignored, so extra fields are safe.

WHAT STUDENTS GET
 - Passage beside the question (stacked on phones), tap option -> Show answer -> verdict, explanation,
   why the other options fail, CLAT trap, language trick. -0.25 per wrong answer is tracked.
 - Bookmarks, personal notes, question palette, text size, keyboard shortcuts (A-D, Enter, arrows, B).
 - Sessions: whole set, unattempted, mistakes, bookmarked, revealed-not-tried, extreme only,
   custom (subject / difficulty / shuffle passages), or any single passage.
 - My mistakes + Bookmarks notebooks: filter, search, full explanation, passage, print / save as PDF.
 - Progress: accuracy by subject and difficulty, weak-area hint, day streak, backup / restore / reset.
 - Visible NETLAWVERSE.IN watermark on passage, question and explanation panels.

STORAGE
 localStorage key "clatpg-practice-v1" (progress, bookmarks, notes, settings); sessionStorage "clatpg-practice-queue".
 Nothing is sent to a server.

OTHER FILES TOUCHED
 clat-pg/index.html (new carousel slide #2, prominent banner under the carousel, hub/cta links),
 clat-pg/mock-tests.html and the other CLAT pages (nav link), m-clat.js (app tiles + route),
 sitemap.xml, index.html (CLAT card text).
