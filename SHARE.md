# Share kit (nl-share.js)

One file, no dependency, loaded on every page (`<script src="/nl-share.js" defer></script>` after `nl-report.js`).
New HTML pages: copy that line from any existing page. Phone app (`app.html`) places its own buttons in `m-app.js`.

## Where Share appears
| Place | What is shared |
|---|---|
| Header icon on every page (desktop and tablet) | The page |
| "Share this page" button in page heroes (notes, MCQ sets, plans, cut-off, FAQ...) | The page |
| Footer strip "Know someone preparing for UGC NET?" | The whole site |
| Home page, under the carousel; Resources menu | The whole site |
| Every MCQ (static sets, question bank, topic modules, quiz and test reviews, mock-test review) | The question (answer NOT revealed) |
| Mock-test cards on the home page; mock intro screen | The test |
| Mock-test result, 20-MCQ test result, daily quiz / random quiz result | Your score (+ "Share as image" score card) |
| Wisdom page, each doha | The doha |
| Phone app: Home invite card, menu, Profile, question icon, topic options, mock intro/result/review, study plans, strategy result, wisdom | Site / question / topic / test / score / plan / doha |

Not shown during a timed mock test (no distractions, no leaking questions mid-exam).

## Channels
WhatsApp, Telegram, Facebook, X, LinkedIn, Reddit, Email, SMS (phones), Copy link, and "More apps" (the phone's own share sheet: Instagram, Snapchat, Messenger...).
"Share as image": a branded score card, or a branded question card (question + options, no answer) as a 4:5 picture. Sites, pages and tests offer "Share preview image".

## What the receiver sees
Platforms read each page's `og:` tags, so every page carries title, description and a 1200x630 image.
* `og-site.png`  home, about, FAQ, mission, cut-off, wisdom, Paper 1 guide (lists the site's features)
* `og-mcq.png`   all MCQ pages;  `og-mock.png` mock tests;  `og-notes.png` unit notes;  `og-plan.png` study plans
* The pre-written message adds the feature list. Edit it in ONE place: the `SITE` object at the top of `nl-share.js`.
Facts quoted in several places (update together when they change): 9,000+ MCQs, 17 mock tests, 20 units, 4 study plans:
`nl-share.js` (SITE), `og-site.png`, `og-mcq.png`, `og-mock.png`, `index.html` og/twitter description, `app.html` og tags, `m-app.js` invite card.

## Tracking
Shared links carry `utm_source` (whatsapp, telegram, ...), `utm_medium` and `utm_campaign=share_<kind>` (site, page, question, mock, score, quiz, wisdom). "Copy link" is the clean URL. Add any analytics (Cloudflare Web Analytics, GA...) and shares show up by channel. A `nl-share` DOM event fires on every share if you want to count them yourself.

## From code
`NLShare.open(payload)`, `NLShare.btn(payloadOrFn, {icon, plain, cls, label})`, `NLShare.make.site|page|question|mock|score|text`. Details at the top of `nl-share.js`.
