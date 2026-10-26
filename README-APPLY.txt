NET LAW-VERSE: COMPLETE OVERLAY v2 FOR THE CLAT-PG BRANCH ONLY
===============================================================
NEVER copy this onto Main / production: it replaces the live home page
(index.html) with the exam-chooser landing page.

HOW TO APPLY (on the CLAT-PG branch)
1. Copy everything in this zip over the repo, keeping folders.
2. Delete from the repo root:  cases-data.js, final-files.zip, theme-update.zip
3. Check the NEW deployment URL or the stable branch URL
   https://clat-pg.net-law-058.pages.dev/clat-pg/   (always = latest CLAT-PG commit)
   NOT https://net-law-058.pages.dev  (that is PRODUCTION = Main, by design).

WHAT v2 ADDS
- Case Law Vault (705 cases, 14 subjects) is linked again: new teaser + hub card on /clat-pg/
- Guides (traps, sample paper, syllabus) now open in the SAME tab, so the browser Back button works
- Every CLAT PG sub-page has a floating "<- CLAT PG" button (bottom-left) back to the hub
- Fixed a JS typo on what-clat-pg-really-tests.html (its theme buttons were dead)
- Everything from v1 (landing page + AIBE/Semester section, net.html, clat-pg/faq.html, sample paper in clat-pg/)

TESTED on a pure copy of Main + this overlay: 0 broken links, 0 JS errors on 17 pages.
