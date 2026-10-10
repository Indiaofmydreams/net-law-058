# NET Law 058 — Website Starter

A free static website starter for UGC NET Law Code 058 and Paper 1.

## Files
- index.html — website structure
- styles.css — responsive design
- script.js — interactive sample MCQ engine

## Publish for free
Upload these files to GitHub Pages or Cloudflare Pages.

## Next content to add
- Your complete Law 058 syllabus
- Unit-wise notes
- Your MCQ database
- PYQs
- Case-law pages
- Paper 1 question banks
- Search and filtering

## Navigation kit (nl-nav.js)
Every page that includes `accessibility.js` automatically gets, with no other edits:
- a slim vertical reading-progress rail on the right (percentage, draggable handle)
- Back to top / Go to bottom buttons

New HTML pages: copy the `<script src="accessibility.js"></script>` line from any existing page. That is all.

Long MCQ lists: use `NLNav.pager({...})` (range chips + pagination) and `NLNav.practice(el)` (attempted-questions bar).
Any long element can also be followed by the rail with the attribute `data-nl-track`.
Mock tests only get the rail and jump buttons; their engine is untouched.


## Installable app (PWA)
See PWA.md. New HTML pages: add `<link rel="manifest" href="manifest.json">` in `<head>` and `<script src="pwa.js" defer></script>` before `</body>` (copy from any page).
