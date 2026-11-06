NET LAW-VERSE: "ALL EXAMS" NAVIGATION + SAFETY FIXES   (CLAT-PG BRANCH ONLY)
=========================================================================
Never apply this on Main-branch-fixed / production directly.

1) UPLOAD these 5 files to the CLAT-PG branch (same folder, overwrite):
     index.html      exam chooser: old links (/#mcqs, index.html#home, /#law-3 ...) are forwarded to net.html; canonical added
     net.html        NET home: "<- All exams" link (top bar, left), "All exams" in Resources menu + footer; canonical -> /net.html
     m-app.js        phone app: "All exams" in the menu and More screen; "Use desktop site" now opens net.html?desktop=1
     manifest.json   installed-app start address and shortcuts -> net.html (so the installed app still opens the NET site)
     faq.html        RESTORED to the live UGC NET FAQ (the CLAT PG FAQ stays at clat-pg/faq.html)

2) DELETE these from the CLAT-PG repo root (stray / duplicate files, none are needed):
     cases-data.js  final-files.zip  theme-update.zip  README-APPLY.txt  APPLY-ON-CLAT-PG-BRANCH.txt
     cutoffs.html  nlus.html  psu-jobs.html  prep-2-weeks.html  prep-3-months.html  prep-4-weeks.html
     prep-6-months.html  what-clat-pg-really-tests.html  clat-pg-syllabus.html  sample-paper-20-questions.html
   (the real copies live in clat-pg/)

3) Test at https://clat-pg.net-law-058.pages.dev/  (NOT net-law-058.pages.dev, that is production)

WHAT CHANGES FOR THE LIVE SITE ON A FUTURE MERGE (checked against live Main):
   removed: nothing.   changed: index.html, m-app.js, manifest.json, sitemap.xml, 4 old hidden clat-pg pages
   added: net.html, aibe-2027.html, semester-law-notes-2027.html, 10 files in clat-pg/
   The header menu of the NET home is pixel-identical to live at 1024-1920 px.
Known, already on live (not caused by this): /icons/favicon-96.png is missing.
