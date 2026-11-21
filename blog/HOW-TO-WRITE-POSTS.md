# NET Law-Verse blog: how to add a post

1. Copy `blog/_src/_TEMPLATE.html` to `blog/_src/<url-name>.html` (the file name becomes the URL, e.g. `supreme-court-bail-judgment-nov-2026.html`).
2. Fill the JSON block at the top (title, description, date, category, tags, related links, sources, FAQ), then write the article in simple HTML under it.
3. Run from the site root: `python3 _tools/build_blog.py`
4. Upload the new/changed files together: `blog/` (all: HTML, `blog.css`, `blog.js`, `feed.xml`, `posts.json`), `sitemap.xml` and `sitemap-blog.xml`. Never upload the HTML without `blog.css` and `blog.js`.
5. In Google Search Console: URL Inspection > paste the new URL > Request indexing.

Updating an old post: edit its `_src` file, change `"updated"` to today's date, run the build again. The page shows "Updated <date>" and the sitemap refreshes.

## Components you can use inside a post
- `<div class="bl-key"><strong>Quick summary</strong><ul>...</ul></div>` summary box
- `<div class="bl-facts"><div><b>14 Dec</b><span>Exam starts</span></div>...</div>` fact tiles
- `<div class="bl-note"><strong>Verify</strong><p>...</p></div>` caution box
- Normal `<h2>`, `<h3>`, `<p>`, `<ul>`, `<ol>`, `<table>`, `<blockquote>`. Tables scroll on phones automatically.
- The contents list, read time, share/save/listen tools, follow section, practice links and previous/next links are added automatically.

## Categories
UGC NET Updates, Legal Current Affairs, Preparation Guides (a new category name simply creates a new filter chip).

## Writing rules that help ranking and trust
- One post = one search question. Put that phrase near the start of the title.
- Use official sources only (NTA, sci.gov.in, India Code) and list them under `sources`. Never guess dates.
- For news posts, say what is confirmed and what is not. Update the same post when things change.
- Add 3 to 5 `related` links to your mock tests, notes or PYQs so readers continue into the site.

## Optional
- Show the newest posts on any page: add `<div data-nl-latest></div>` and `<script src="/blog/latest.js" defer></script>`.
- RSS feed: https://netlawverse.in/blog/feed.xml
- Reader preferences (text size, font, spacing, width, focus mode, saved posts) are stored only in the reader's own browser.

## Look and feel
The blog uses the landing page's look (blog/blog.css: ink borders, offset shadows, Manrope, the five colour themes saved under the same `nlv-theme` key, dark mode follows the device). It does not load styles.css, theme.css or the Paper 1 / Paper 2 header. Header and footer live in `_tools/blog/header.html` and `footer.html`; Home must stay `/`.

## Dates rule
State an exam date only when NTA has published it in an official notice, and name that notice under `sources`. If a date is not official yet, say "not confirmed by NTA yet".

## After deploying
Open https://netlawverse.in/blog/blog.css: it should be about 25 KB and contain `--pink` and `.blh`. Test through the live URL or `python3 -m http.server` (root-relative paths break when a file is double-clicked).
