PYQ page (pyq.html), added 18 Oct 2026
=======================================
Every "PYQs" link on the site (header menu, footer, home carousel, left section nav, FAQ, study-plan pages, phone app)
now opens pyq.html. The old "Coming next" block on the home page is now a short teaser that links to it.

FILES
  pyq.html       page: hero + test, "what is in the pool" numbers, rationale (why shuffled), disclaimer, links to other sections
  pyq.css        styles (theme tokens: works in all 8 colour themes + dark mode)
  pyq.js         the test engine (same architecture as the home-page 7-minute challenge: runs inside the card, no pop-up)
  pyq-data.json  ALL PYQs in one file (700 questions). This is the only file you edit to add questions.

HOW A TEST WORKS
  * Student picks 20, 50 or 100 questions. Time = 30 seconds per question (10 / 25 / 50 minutes). Auto-submits at 0:00.
  * Questions are a fresh random draw from the whole pool, in random order. Numbers shown are always 1, 2, 3 ... of the test.
    The old "PYQ 1 ... PYQ 800" ids are NOT used anywhere (only the source label, e.g. "UGC NET Dec 2025", appears in the review).
  * Unseen questions are drawn first (kept in the student's browser, localStorage), so repeated tests walk through all 700
    before anything repeats; the list resets itself when the pool is used up.
  * Review after submit: your answer, correct answer, explanation (shown ONLY if the question has one), and a "Note on this
    question" where the paper itself had a printing error / dropped question. Wrong / Skipped filters. Report + Share buttons.
  * Best score is kept per test length, on the device only.

pyq-data.json FORMAT  (array of objects)
  { "q": "question text", "o": ["opt A","opt B","opt C","opt D"], "a": 2,   <- a = index of correct option (0=A ... 3=D)
    "e": "explanation (can be empty string)", "s": "UGC NET June 2026", "n": "optional note about the paper/key" }
  To add a paper later: append its questions with a new "s" label. Every count on the page (700, 5 papers, per-paper list,
  explanations, notes) is calculated from this file, so nothing else needs editing.
  Options are NOT shuffled (several questions say "both A and B" / "(A) and (B) only").

CHANGED EXISTING FILES
  ~470 .html pages : href "/#pyq" and "index.html#pyq" -> "/pyq.html" / "pyq.html"
  index.html       nav, footer, carousel slide (text + link), #pyq section turned into a teaser
  section-nav.js   PYQs entry opens pyq.html (still highlights while the teaser is on screen)
  ese.js           "Previous-year questions" action links to pyq.html
  m-app.js         phone app: drawer + Resources row open pyq.html; #/pyq route redirects there
  faq.html, m-extras.js  FAQ answer "Where can I find PYQs?" updated (it said the section was being built)
  sw.js            VERSION v14 -> v15; pyq.css/pyq.js pre-cached; pyq-data.json and pyq.html are live-only (like mocks)
  sitemap.xml      pyq.html added
