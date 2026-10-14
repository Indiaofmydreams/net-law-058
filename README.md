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


## Reading watermark (watermark.css)
A faint diagonal "NETLAWVERSE.IN" pattern sits over every question surface (unit-page MCQs, question bank cards,
quiz overlay incl. its review, timed test, mock-test questions and review, app practice / test / review).
It is CSS only: no JavaScript, no per-question markup, so new questions and new quiz packs are covered automatically.
- New page with questions: add `<link rel="stylesheet" href="watermark.css">` after the other stylesheets (copy from any page).
- New question container class: add its selector to the host list at the top of `watermark.css` (the list appears in the rules as `:is(...)`).
- Strength: `:root{--wm-fade:1}` (0 = off, 1 = default, 1.5 = stronger). High-contrast themes automatically use 60% of this.
- Colours follow `<html data-mode>` so every theme in light and dark is covered.
- `m-app.js`: the app's mock-test question body is wrapped in `<div data-wm>` so it has something to attach to.


## Share kit (nl-share.js)
Share buttons for the site, pages, questions, mock tests, scores and dohas, with rich link previews. See SHARE.md. New HTML pages: copy the `nl-share.js` script line from any existing page.
