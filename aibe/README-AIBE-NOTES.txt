AIBE NOTES  (/aibe/notes/)
==========================
Chapter-wise notes filed under the 19 BCI syllabus subjects, in syllabus order. The reader never sees "Part 1/2/...":
those are only your writing batches. Everything is static HTML generated from JSON: no server, no build step on the host.

ADD THE NEXT PART (about 2 minutes)
  1. Put the JSON in            _notes-data/aibe/part-02-....json     (same structure as Part 1)
  2. Add one line to            _notes-data/aibe/registry.json
        {"file":"part-02-crpc-bnss.json","subjects":[3]}          <- subject numbers from the syllabus (1-19)
     A batch that holds TWO subjects (e.g. IPC/BNS + Company Law):  "subjects":[2,11]
     and add  "subject_no": 2  or  11  to each entry in "sections" (and optionally to latest_developments / mcq_bank
     items). File-level blocks without a tag (exam_intelligence, rapid_revision) go to the FIRST subject listed.
  3. Optional: short SEO titles per chapter in  _notes-data/aibe/seo-titles.json
        {"crpc-bnss": {"1": "Short title for chapter 1", ...}}      (without one, the title is trimmed automatically)
     Chapter URLs come from these short titles, so set them BEFORE the first publish and do not rename later.
  4. Run:   python3 _tools/build_aibe_notes.py
     It rewrites aibe/notes/ (hub, subject pages, chapters, highlights, developments, rapid revision, MCQs, search
     index) and the block between "aibe-notes:begin/end" in sitemap.xml. The hub flips that subject from
     "Coming soon" to "Notes live" by itself. Upload aibe/notes/ and sitemap.xml.
  Subject slugs / marks are listed at the top of _tools/build_aibe_notes.py (SUBJECTS).
  Cross-references written as "Part 9 PIL" in the data are rewritten to the subject name (PART_FIXES in the script);
  the build prints a WARNING if any "Part N" wording is left.

WHAT IS IN EACH SUBJECT
  index.html                 exam intelligence ("where the marks come from") + all chapters with read-ticks
  <chapter>.html             reader: contents, key provisions, landmark cases, memory aids, traps, likely questions
  highlights.html            curated highlights clubbed chapter by chapter (filter by type, print)
  latest-developments.html   recent rulings/amendments with click-to-reveal likely question
  rapid-revision.html        numbers, Article cheat sheet (filterable), case one-liners
  quick-mcqs.html            self-test (answers + reasons; score saved in the browser)
  ../my-notes.html           the reader's OWN highlights (clubbed chapter by chapter), doubts and progress. noindex.

READER FEATURES (all saved only in the reader's browser, key "aibe-notes-v1")
  Select text -> highlight (Key / Got it / Trap / Revise), add a note, Ask a doubt, copy. Backup/Restore on My highlights.
  Reading progress bar, contents scroll-spy, text size, mark-as-read, print/save as PDF with watermark + branded footer.
  Search on the hub (notes/notes-index.json).

ASK A DOUBT
  Default: opens the reader's email app / Gmail with the doubt, subject, chapter, section, quoted text and link filled in,
  addressed to netlawverse@gmail.com, and saves a copy in the reader's notebook. Nothing is posted from the page itself.
  To receive doubts in a Google Sheet instead: make a Google Form with 3 short-answer questions (doubt, where, reply-to)
  and put in the <head> of the pages (or at the top of notes.js):
     window.NN_DOUBT_FORM={formId:'1FAIpQLS...',fields:{doubt:'entry.1',where:'entry.2',reply:'entry.3'}};
  The dialog then shows "Send to NET Law-Verse" and posts to the form (same method as nl-lead-float.js).

WATERMARK / BRANDING
  Content cards carry data-wm, so the shared watermark.css paints the NETLAWVERSE.IN pattern (strength: --wm-fade in
  notes.css, currently 1.7). Print/PDF keeps it and adds a footer line on every sheet. Every page has the NL brand bar
  (updated date, version, "Free - no sign-up") and a "Notes by NET Law-Verse" card. Trust claims are limited to what is true:
  BCI syllabus mapping, Verify tags, dated/versioned pages, private storage. Add real numbers (students, reviewers) only when true.

THINGS THAT CHANGED OUTSIDE aibe/notes/ (all additive)
  aibe/index.html, what-is-aibe.html, syllabus.html, practice.html, faq.html : one "Notes" tab added to the tab bar;
  index.html also gets a "New: AIBE Notes" banner above the toolkit.   aibe/aibe.css : small block appended at the end.
  sitemap.xml : block between aibe-notes:begin/end.   _notes-data/aibe/, _tools/build_aibe_notes.py : sources + generator
  (already blocked for crawlers by robots.txt).

TAGS IN THE DATA
  [VERIFY ...] is shown as a yellow "Verify" chip so readers know what to double-check. Remove the tag from the JSON once confirmed.


==============================================================
ADDING MORE PARTS (adapters)  - updated
==============================================================
Data lives in _notes-data/aibe/. Build with:  python3 _tools/build_aibe_notes.py
(upload the regenerated aibe/, sitemap.xml and _notes-data/ - no server build step).

1. Drop the new part JSON into _notes-data/aibe/.
2. Add an entry to registry.json:
     {"file":"part-03-....json","subjects":[<syllabus nos>],"adapter":"partN"}
   Parts 1 and 2 are already in canonical shape and need NO "adapter".
   Parts 4,5,6,7,8,10 use adapters "part4".."part8", "part10" (see _tools/aibe_adapters.py).
   A new batch with a different JSON layout needs a small adapter function added
   to aibe_adapters.py and registered in ADAPTERS; nothing is shortened or dropped.
3. Add a short SEO title for every chapter in seo-titles.json
   (subject slug -> chapter number -> title, max ~52 chars). Slugs come from it.
4. Rebuild, then check the console: it must not print "WARNING: batch wording".
   (Writing-batch phrases such as "Part 6" are rewritten by PART_FIXES; add a
   rule there if a new one leaks.)

Subject numbers (BCI syllabus order): 1 Constitutional, 2 IPC/BNS, 3 CrPC/BNSS,
4 CPC, 5 Evidence/BSA, 6 ADR, 7 Family, 8 PIL, 9 Administrative, 10 Ethics,
11 Company, 12 Environmental, 13 Cyber, 14 Labour, 15 Torts/MV/Consumer,
16 Taxation, 17 Contract/Property/NI, 18 Land Acquisition, 19 IP.
Currently live: 1,2,3,5,7,9,11,12,13,14,15,16,17,18,19.  Still to come: 4 (CPC), 6 (ADR), 8 (PIL), 10 (Professional Ethics).

Rapid revision pages for adapted parts are built from generic blocks
(list / table / pairs / groups / qa) defined in the adapter; Part 1 keeps its own markup.
Case-name italics are computed per subject, so one subject's data never changes another's pages.
