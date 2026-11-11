NET LAW-VERSE: LIVE VISIT METER, SAFE INSTALL PACK
===================================================

This pack contains NO site pages, so it cannot overwrite anything you have edited elsewhere.
It adds only 6 small things to your site:

  1. nl-visit-meter.js                    a new file in your site's root folder
  2. one <script> line                    before </body> in:  index.html, net.html, clat-pg/index.html, app.html
  3. one <div> placeholder                at the end of the "stay" line in m-app.js (the phone app's "Stay connected")

Tested on your latest upload (net-law-058-Main-branch-fixed__1_): 27 browser checks passed, on desktop pages and
inside the phone app. Running the tool twice changes nothing the second time.


OPTION A: automatic (needs Python 3, on a copy of your site folder on your computer)
  python3 apply-visit-meter.py "/path/to/net-law-058-Main-branch-fixed"
  Add --dry-run first to see what it would do. Add --also faq.html about.html to put the meter on more desktop pages.
  Then upload the changed files to GitHub / Cloudflare as you normally do.


OPTION B: by hand (GitHub website, no tools needed)
  1. Upload nl-visit-meter.js into the ROOT of the repository (next to index.html). Add file > Upload files.
  2. For each of these four files, open it, click the pencil (Edit), scroll to the very bottom, and paste this line
     on its own line just ABOVE the closing </body> tag, then Commit:
         <script src="/nl-visit-meter.js" defer></script>
       index.html
       net.html
       clat-pg/index.html
       app.html
  3. Open m-app.js, press Ctrl+F (Cmd+F) and search for:   const stay=
     That line currently ends like this:   ...${updCard()}${igBox()}</div>`;
     Change the ending to:                 ...${updCard()}${igBox()}</div><div id="nl-visit-meter"></div>`;
     (only add <div id="nl-visit-meter"></div> before the final backtick, change nothing else) and Commit.


AFTER UPLOADING
  - Wait 1 to 3 minutes for GitHub Pages / Cloudflare to publish, then hard refresh (Ctrl+Shift+R, or reopen the app).
  - Open https://api.counterapi.dev/v1/netlawverse-in/visits once in your browser. A small block with a "count"
    number (or "not found" before the first visit) means the free counter service is reachable.
  - Open netlawverse.in, scroll to the bottom: the card appears. On a phone, look in "Stay connected".
  - Remember: it only counts on netlawverse.in, never on localhost or preview links. The counter starts at 0.

LATER CHANGES
  Future tweaks to the meter (look, wording, settings defaults) need only a fresh nl-visit-meter.js. The page edits
  above are one-time.

SETTINGS (optional): add before the script tag on a page
  <script>window.NL_VISIT_CONFIG = { minToShow: 100, celebrate: false };</script>
  minToShow   hide the card until the total reaches this number (default 0)
  baseline    add a REAL earlier figure only, e.g. from hosting analytics (default 0). Never invent numbers.
  celebrate   false turns confetti off
  showWeek    false hides the 7-day bars (they stay hidden until earlier days have real visits)
  showToday   false shows only the total
  caption     the line under the digits
  provider    'counterapi' (default) or 'abacus': switch if one free service ever misbehaves
  namespace   your private bucket name; keep it unusual so nobody guesses it

GOOD TO KNOW
  - If the counter service is down or blocked, the card simply does not appear. No error, no zero.
  - One visit = one browser session (30 minutes). Refreshes and page hops add nothing. Bots are ignored.
  - Free public counters can be nudged up by anyone who finds the URL: fine for a friendly meter, not audited figures.
  - The counter service sees each visitor's IP address, as any outside service does. Add a line to your Disclaimer, e.g.
    "We use a simple public counter to show how many people visit."
