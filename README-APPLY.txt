NET LAW-VERSE: ALL-EXAMS LANDING FOR APP + TABLET   (v2 of the all-exams package)
================================================================================
Apply on the same branch you tested ("Merged" / CLAT-PG). NEVER directly on production.

1) UPLOAD these 5 files (same folder, overwrite). The last upload had the same 5 names; m-app.js and index.html are NEW versions:
     m-app.js        NEW: in-app "All exams" screen (#/exams): big tiles for Paper 1 / Paper 2, cards for CLAT PG, AIBE, Semester Law Notes.
                     Reachable from: Home screen card, side menu, More screen, first-run welcome, and a permanent entry in the TABLET sidebar.
                     Phones: one column, big tap targets. Tablets: two columns (three on wide iPad landscape).
                     Also: "Use desktop site" -> net.html?desktop=1.
     index.html      website chooser: tablets (601-900px) now get 2 columns instead of the phone layout;
                     fixed my "Landing in 2027" cards overflowing on 360-375px phones; old-link forwarder + canonical (as before)
     net.html        "<- All exams" in the top bar, Resources menu, footer; canonical -> /net.html (as before)
     manifest.json   installed app opens the NET site (as before)
     faq.html        live UGC NET FAQ restored (as before)

2) DELETE from the repo root (if not done yet): cases-data.js final-files.zip theme-update.zip README-APPLY.txt
   APPLY-ON-CLAT-PG-BRANCH.txt cutoffs.html nlus.html psu-jobs.html prep-2-weeks.html prep-3-months.html
   prep-4-weeks.html prep-6-months.html what-clat-pg-really-tests.html clat-pg-syllabus.html sample-paper-20-questions.html

3) TEST on the branch's preview link (every upload also creates a new random link; use the newest, or the branch address).
   Phone: open /net.html -> app opens -> Home -> "All exams" card.   Tablet: sidebar -> "All exams".

Footprint vs live Main on a future merge is unchanged: nothing removed; changed index.html, m-app.js, manifest.json, sitemap.xml, 4 hidden clat-pg pages; added net.html, aibe, semester, 10 clat-pg files.
Known and pre-existing: /icons/favicon-96.png missing on live; the original chooser cards are ~20px too wide on 320px-wide screens (old iPhone SE).
