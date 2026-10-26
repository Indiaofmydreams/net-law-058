NET LAW-VERSE: COMPLETE OVERLAY FOR THE CLAT-PG BRANCH ONLY
============================================================
NEVER copy this onto Main / the live branch: it replaces the live home page
(index.html) with the exam-chooser landing page.

HOW TO APPLY
1. Switch to the CLAT-PG branch and make sure you are on it:  git branch --show-current
2. Copy everything in this zip over the repo (keep the folder structure).
3. Delete from the repo root:  cases-data.js, final-files.zip, theme-update.zip
4. Hard-refresh the preview (Ctrl/Cmd+Shift+R). If a page still looks old,
   clear site data once: the site uses a service worker (sw.js) that caches pages.

WHAT IS INSIDE (20 files)
  index.html                      landing page + restored "Landing in 2027" section (AIBE, Semester)
  net.html                        UGC NET home (Paper 1 / Paper 2 cards link here). MAIN HAS NO net.html.
  faq.html                        site FAQ (CLAT-PG version)
  aibe-2027.html, semester-law-notes-2027.html
  sitemap.xml
  clat-pg/index.html              full CLAT PG page (traps, sample paper, syllabus, prep, numbers, explore)
  clat-pg/faq.html                CLAT PG FAQ. MAIN HAS NO clat-pg/faq.html.
  clat-pg/sample-paper-20-questions.html   was missing from clat-pg/ (link was dead)
  clat-pg/landmark-cases.html, clat-pg/cases-data.js   moved here from the repo root
  clat-pg/cutoffs, nlus, psu-jobs, prep-*, what-clat-pg-really-tests, clat-pg-syllabus

TESTED: this overlay laid on top of a pure copy of Main-branch-fixed.
  Paper 1 / Paper 2 cards -> net.html (opens NET home)      PASS
  CLAT card -> /clat-pg/ with all build sections            PASS
  CLAT FAQ opens                                            PASS
  Sample paper, AIBE, Semester, landmark cases open         PASS
  Broken internal links: 0
