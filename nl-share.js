/* nl-share.js: "Share" for the whole site (desktop pages, mock tests, quizzes and the phone app).
   One file, CSS included, no dependency. Same pattern as nl-report.js.

   WHAT IT DOES
   - One share sheet: WhatsApp, Telegram, Facebook, X, LinkedIn, Email, SMS (phones), Copy link,
     "More apps" (the phone's own share sheet: Instagram, Snapchat, Messenger...) and, for scores,
     "Share as image" (a ready-made score card picture).
   - The sheet shows exactly what the receiver will see: the page's own preview image, title and description.
     Those come from each page's <meta property="og:*"> tags, which is also what WhatsApp, Telegram, Facebook,
     LinkedIn and X read when the link is pasted. The pre-written message adds the site's feature list.
   - Links carry utm_source / utm_medium / utm_campaign so a share can be traced in any analytics later.
     "Copy link" is always the clean URL.

   AUTOMATIC (nothing to add to a page except <script src="nl-share.js" defer></script>)
   - "Share" button in the site header (shares this page)
   - "Share this page" button in the page hero
   - "Share" button next to "Report this question" on every static MCQ question
   - "Share NET Law 058 with a friend" strip at the top of the footer

   FROM CODE
   NLShare.open(payload, opener)      open the sheet
   NLShare.btn(payloadOrFn, opts)     HTML string for a small Share button (use inside templates)
                                      opts: {icon:1} icon only, {cls:"x"} extra class, {label:"Share score"}, {plain:1} no pill styling (host supplies cls)
   NLShare.make.site()                the whole site
   NLShare.make.page()                the current page
   NLShare.make.question(x, ctx)      a question (x = {q, o:[...]}); the answer is NOT revealed
   NLShare.make.mock({title, n, minutes, url})
   NLShare.make.score({what, score, pct, correct, wrong, url, kind})
   NLShare.make.text({title, lines, url})   anything else
   NLShare.unitUrl("Law of Crimes")   topic MCQ page for a unit name (or "")
   Static HTML: data-nls-page (this page) or data-nls-site (the site) on any button. */
(function () {
  "use strict";
  if (window.NLShare) return;
  var doc = document, L = "ABCD";

  /* ---------- site facts: the ONE place to edit the feature list that goes out with every share ---------- */
  var SITE = {
    name: "NET Law 058", brand: "NetLawVerse", url: "https://netlawverse.in/", host: "netlawverse.in",
    image: "https://netlawverse.in/og-site.png",
    headline: "UGC NET Law (058) & Paper 1: free preparation",
    features: [
      "9,000+ MCQs with explanations",
      "17 mock tests with instant result analysis",
      "Unit-wise notes and syllabus",
      "Study plans from 6 months to 2 weeks",
      "Cut-off trends, daily quiz, works offline"
    ],
    promise: "100% free. No sign-up.",
    hashtags: "UGCNET,UGCNETLaw"
  };
  var FEATURE_LINE = "Free on " + SITE.name + ": 9,000+ MCQs, 17 mock tests, notes and study plans. No sign-up.";

  /* topic MCQ pages, so a shared question lands on a page with a proper preview */
  var UNIT_SLUG = {
    "Jurisprudence": "ugc-net-law/jurisprudence", "Constitutional and Administrative Law": "ugc-net-law/constitutional-administrative-law",
    "Public International Law and IHL": "ugc-net-law/public-international-law-ihl", "Law of Crimes": "ugc-net-law/law-of-crimes",
    "Law of Torts and Consumer Protection": "ugc-net-law/torts-consumer-protection", "Commercial Law": "ugc-net-law/commercial-law",
    "Family Law": "ugc-net-law/family-law", "Environment and Human Rights Law": "ugc-net-law/environment-human-rights",
    "Intellectual Property Rights and Information Technology Law": "ugc-net-law/ipr-it-law",
    "Comparative Public Law and Systems of Governance": "ugc-net-law/comparative-public-law",
    "Teaching Aptitude": "ugc-net-paper-1/teaching-aptitude", "Research Aptitude": "ugc-net-paper-1/research-aptitude",
    "Comprehension": "ugc-net-paper-1/comprehension", "Communication": "ugc-net-paper-1/communication",
    "Mathematical Reasoning and Aptitude": "ugc-net-paper-1/mathematical-reasoning", "Logical Reasoning": "ugc-net-paper-1/logical-reasoning",
    "Data Interpretation": "ugc-net-paper-1/data-interpretation", "Information and Communication Technology (ICT)": "ugc-net-paper-1/ict",
    "People, Development and Environment": "ugc-net-paper-1/people-development-environment", "Higher Education System": "ugc-net-paper-1/higher-education-system"
  };
  function unitUrl(u) { return UNIT_SLUG[u] ? SITE.url + "mcq/" + UNIT_SLUG[u] + "/" : ""; }

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function clean(s) { return String(s == null ? "" : s).replace(/\s+/g, " ").trim(); }
  function strip(t) { return clean(t).replace(/^[A-Da-d][.)]\s+/, ""); }
  function cut(s, n) { s = clean(s); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : s; }
  function enc(s) { return encodeURIComponent(s); }
  function meta(sel) { var m = doc.querySelector(sel); return m ? clean(m.getAttribute("content")) : ""; }
  function canon() {
    var l = doc.querySelector('link[rel="canonical"]'), h = l && l.href;
    if (h) return h.split("#")[0];
    return SITE.url + location.pathname.replace(/^\//, "");
  }
  function withUtm(url, ch, kind) {
    try {
      var u = new URL(url, SITE.url);
      u.searchParams.set("utm_source", ch);
      u.searchParams.set("utm_medium", ch === "email" ? "email" : ch === "sms" || ch === "whatsapp" || ch === "telegram" ? "messaging" : ch === "native" ? "share" : "social");
      u.searchParams.set("utm_campaign", "share_" + (kind || "page"));
      return u.toString();
    } catch (e) { return url; }
  }
  var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));

  /* ---------- payload builders ---------- */
  /* A payload: {kind, heading, title, desc, image, url, text:function(ch)->string (no link), short:string (for X)}.
     text() receives the channel id so WhatsApp can get *bold*. */
  function B(ch, s) { return ch === "whatsapp" ? "*" + s + "*" : s; }
  function featureBlock(ch) { return SITE.features.map(function (f) { return "✅ " + f; }).join("\n"); }

  function site() {
    return {
      kind: "site", heading: "Share NET Law 058", title: SITE.name + ": " + SITE.headline,
      desc: SITE.features.join(". ") + ". " + SITE.promise, url: SITE.url, image: SITE.url + "og-site.png",
      text: function (ch) { return "📚 " + B(ch, SITE.name + ": " + SITE.headline) + "\n\n" + featureBlock(ch) + "\n\n" + SITE.promise + " 👇"; },
      short: "Free UGC NET Law (058) & Paper 1 prep: 9,000+ MCQs, 17 mock tests, notes, study plans. No sign-up."
    };
  }
  function pageTitle() {
    var h = doc.querySelector("h1");
    var t = clean(meta('meta[property="og:title"]') || (h && h.textContent) || doc.title);
    return t.replace(/\s*[|–—-]\s*(UGC NET Law|NET Law 058)\s*$/i, "");
  }
  function page() {
    var p = location.pathname.replace(/\/index\.html$/, "/");
    if (p === "/" || /\/app\.html$/.test(p)) return site();
    var t = pageTitle(), d = meta('meta[property="og:description"]') || meta('meta[name="description"]');
    return {
      kind: "page", heading: "Share this page", title: t, desc: d, url: canon(),
      text: function (ch) { return "📖 " + B(ch, t) + "\n" + cut(d, 150) + "\n\n" + FEATURE_LINE + " 👇"; },
      short: cut(t, 110) + ". Free on NET Law 058."
    };
  }
  function question(x, ctx, o) {
    o = o || {}; var q = clean(x.q != null ? x.q : x.question), opts = (x.o || x.options || []).map(strip);
    var url = o.url || unitUrl(x.u) || unitUrl(x.s) || (o.hash ? canon() : SITE.url);
    if (o.hash) url = url.split("#")[0] + "#" + o.hash;
    var c = clean(ctx);
    return {
      kind: "question", heading: "Share this question", title: "Can you answer this UGC NET question?",
      desc: cut(q, 170), url: url, image: SITE.url + "og-mcq.png",
      text: function (ch) {
        return "🧠 " + B(ch, "UGC NET Law question: can you answer it?") + "\n\n" + cut(q, 380) + "\n\n" +
          opts.map(function (t, k) { return L[k] + ") " + cut(t, 120); }).join("\n") + "\n\nCheck the answer and explanation, free 👇";
      },
      short: "UGC NET question: " + cut(q, 150),
      card: { type: "question", q: q, opts: opts, tag: x.u || x.s || "UGC NET Law question" }, file: "net-law-058-question.png"
    };
  }
  function mock(o) {
    var line = o.n + " questions · " + o.minutes + " min" + (o.marks ? " · " + o.marks + " marks" : "") + " · free";
    return {
      kind: "mock", heading: "Share this mock test", title: o.title + ": free UGC NET mock test",
      desc: o.desc || "Timed mock test with a question palette, instant result analysis and full answer review. No sign-up.", url: o.url || canon(), image: SITE.url + "og-mock.png",
      text: function (ch) { return "📝 " + B(ch, o.title) + "\n" + line + "\nTimed paper with instant result analysis and full answer review. No sign-up.\n\nTry it 👇"; },
      short: o.title + ": free timed UGC NET mock test, instant result analysis."
    };
  }
  function score(o) {
    var head = "I scored " + o.score + (o.pct != null ? " (" + o.pct + "%)" : "") + " in " + o.what;
    return {
      kind: o.kind || "score", heading: "Share your score", title: head, url: o.url || canon(), image: (o.kind === "mock" ? SITE.url + "og-mock.png" : SITE.url + "og-site.png"),
      desc: "Think you can beat it? Take it free on " + SITE.name + ": MCQs, mock tests, notes and study plans.",
      text: function (ch) {
        return "🎯 " + B(ch, head + " on " + SITE.name + "!") + "\n" +
          (o.correct != null ? "✅ " + o.correct + " correct · ❌ " + o.wrong + " wrong" + (o.time ? " · ⏱ " + o.time : "") + "\n" : "") +
          "Think you can beat me? Try it free 👇";
      },
      short: head + ". Can you beat it? Free on NET Law 058.",
      card: { top: o.what, big: o.score, sub: o.pct != null ? o.pct + "%" : "", chips: o.chips || [] }, file: "net-law-058-score.png"
    };
  }
  function text(o) {
    return {
      kind: o.kind || "text", heading: o.heading || "Share", title: o.title, desc: o.desc || "", url: o.url || canon(), image: o.image,
      text: function (ch) { return (o.lines || []).map(function (l) { return typeof l === "function" ? l(ch) : l; }).join("\n"); },
      short: o.short || cut(o.title, 140)
    };
  }
  var make = { site: site, page: page, question: question, mock: mock, score: score, text: text };

  /* ---------- channels ---------- */
  var IC = {
    whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
    telegram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg>',
    reddit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.1 3.1 0 01.04.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.545A1.755 1.755 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 00.029-.463.33.33 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    sms: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h9"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V4M8 8l4-4 4 4M6 12H5a1 1 0 00-1 1v7a1 1 0 001 1h14a1 1 0 001-1v-7a1 1 0 00-1-1h-1"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 9"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8l7.4-4.3M8.3 13.2l7.4 4.3"/></svg>'
  };
  var CH = [
    { id: "whatsapp", name: "WhatsApp", c: "#25D366", href: function (t, u) { return "https://wa.me/?text=" + enc(t + "\n" + u); } },
    { id: "telegram", name: "Telegram", c: "#229ED9", href: function (t, u) { return "https://t.me/share/url?url=" + enc(u) + "&text=" + enc(t); } },
    { id: "facebook", name: "Facebook", c: "#1877F2", href: function (t, u) { return "https://www.facebook.com/sharer/sharer.php?u=" + enc(u); } },
    { id: "x", name: "X", c: "#111111", href: function (t, u, p) { return "https://twitter.com/intent/tweet?text=" + enc(p.short) + "&url=" + enc(u) + "&hashtags=" + enc(SITE.hashtags); } },
    { id: "linkedin", name: "LinkedIn", c: "#0A66C2", href: function (t, u) { return "https://www.linkedin.com/sharing/share-offsite/?url=" + enc(u); } },
    { id: "reddit", name: "Reddit", c: "#FF4500", href: function (t, u, p) { return "https://www.reddit.com/submit?url=" + enc(u) + "&title=" + enc(cut(p.title, 280)); } },
    { id: "email", name: "Email", c: "#5b6ad0", href: function (t, u, p) { return "mailto:?subject=" + enc(p.title) + "&body=" + enc(t + "\n\n" + u); } },
    { id: "sms", name: "SMS", c: "#2e9b5f", mobile: true, href: function (t, u) { return "sms:?&body=" + enc(t + "\n" + u); } }
  ];
  function chHref(c, p) { var u = withUtm(p.url, c.id, p.kind); return c.href(p.text(c.id), u, p); }

  /* ---------- clipboard ---------- */
  function copy(s) {
    return new Promise(function (ok, no) {
      function fallback() {
        try {
          var ta = doc.createElement("textarea"); ta.value = s; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
          doc.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, s.length); var r = doc.execCommand("copy"); ta.remove(); r ? ok() : no();
        } catch (e) { no(e); }
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).then(ok, fallback); else fallback();
    });
  }

  /* ---------- score card picture ---------- */
  function drawScoreCard(c) {
    return new Promise(function (ok, no) {
      try {
        var W = 1080, H = 1080, cv = doc.createElement("canvas"); cv.width = W; cv.height = H;
        var g = cv.getContext("2d"), F = "Manrope, Inter, 'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif";
        var bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#2d4aa9"); bg.addColorStop(1, "#111c45"); g.fillStyle = bg; g.fillRect(0, 0, W, H);
        g.fillStyle = "rgba(255,255,255,.06)"; g.beginPath(); g.arc(W - 120, 140, 330, 0, 7); g.fill(); g.beginPath(); g.arc(80, H - 60, 260, 0, 7); g.fill();
        function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
        rr(80, 80, 120, 120, 30); g.fillStyle = "#1b2a5e"; g.fill();
        g.fillStyle = "#fff"; g.font = "800 62px " + F; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("NL", 140, 134);
        g.fillStyle = "#8fa5ee"; g.fillRect(114, 168, 52, 6);
        g.textAlign = "left"; g.fillStyle = "#fff"; g.font = "800 54px " + F; g.fillText(SITE.name, 230, 126);
        g.fillStyle = "#c3cff5"; g.font = "600 30px " + F; g.fillText(SITE.host, 230, 174);
        g.textAlign = "center"; g.fillStyle = "#c3cff5"; g.font = "700 38px " + F; g.fillText(cut(c.top, 40).toUpperCase(), W / 2, 380);
        var big = String(c.big), fs = big.length > 8 ? 150 : big.length > 4 ? 190 : 250; g.fillStyle = "#fff"; g.font = "800 " + fs + "px " + F; g.fillText(big, W / 2, 560);
        if (c.sub) { g.fillStyle = "#9bd3f5"; g.font = "800 84px " + F; g.fillText(c.sub, W / 2, 700); }
        var chips = (c.chips || []).slice(0, 3), cx = W / 2; g.font = "700 32px " + F;
        var ws = chips.map(function (t) { return g.measureText(t).width + 56; }), tot = ws.reduce(function (a, b) { return a + b; }, 0) + 20 * (chips.length - 1), x = cx - tot / 2;
        chips.forEach(function (t, i) { rr(x, 750, ws[i], 64, 32); g.fillStyle = "rgba(255,255,255,.16)"; g.fill(); g.fillStyle = "#fff"; g.fillText(t, x + ws[i] / 2, 783); x += ws[i] + 20; });
        g.fillStyle = "#fff"; g.font = "800 58px " + F; g.fillText("Can you beat it?", W / 2, 900);
        g.fillStyle = "#c3cff5"; g.font = "600 32px " + F; g.fillText("Free MCQs, mock tests, notes and study plans", W / 2, 960);
        rr(W / 2 - 250, 990, 500, 62, 31); g.fillStyle = "#fff"; g.fill(); g.fillStyle = "#2a459d"; g.font = "800 32px " + F; g.fillText(SITE.host, W / 2, 1022);
        if (cv.toBlob) cv.toBlob(function (b) { b ? ok(b) : no(); }, "image/png"); else no();
      } catch (e) { no(e); }
    });
  }


  /* ---------- question card picture: the question and its four options, NO answer, branded, 4:5 for feeds and stories ---------- */
  function wrapText(g, text, maxW) {
    var words = String(text).split(/\s+/), lines = [], cur = "";
    words.forEach(function (w) {
      var t = cur ? cur + " " + w : w;
      if (g.measureText(t).width <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur); return lines;
  }
  function drawQuestionCard(c) {
    return new Promise(function (ok, no) {
      try {
        var W = 1080, H = 1350, PAD = 80, cv = doc.createElement("canvas"); cv.width = W; cv.height = H;
        var g = cv.getContext("2d"), F = "Manrope, Inter, 'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif";
        var bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#2d4aa9"); bg.addColorStop(1, "#111c45"); g.fillStyle = bg; g.fillRect(0, 0, W, H);
        g.fillStyle = "rgba(255,255,255,.05)"; g.beginPath(); g.arc(W - 100, 120, 300, 0, 7); g.fill(); g.beginPath(); g.arc(60, H - 40, 240, 0, 7); g.fill();
        function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
        /* header */
        rr(PAD, 64, 84, 84, 22); g.fillStyle = "#1b2a5e"; g.fill();
        g.fillStyle = "#fff"; g.font = "800 44px " + F; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("NL", PAD + 42, 104);
        g.fillStyle = "#8fa5ee"; g.fillRect(PAD + 21, 130, 42, 5);
        g.textAlign = "left"; g.fillStyle = "#fff"; g.font = "800 40px " + F; g.fillText(SITE.name, PAD + 108, 96);
        g.fillStyle = "#c3cff5"; g.font = "600 25px " + F; g.fillText(SITE.host, PAD + 108, 132);
        var tag = cut(c.tag || "UGC NET Law question", 34).toUpperCase(); g.font = "800 22px " + F;
        var tw = g.measureText(tag).width + 40; rr(W - PAD - tw, 82, tw, 46, 23); g.fillStyle = "#fff"; g.fill();
        g.fillStyle = "#2a459d"; g.textAlign = "center"; g.fillText(tag, W - PAD - tw / 2, 106);
        /* fit text: shrink fonts until the question and options fit between header and footer */
        var top = 210, bottom = H - 190, avail = bottom - top, innerW = W - PAD * 2;
        var q = cut(c.q, 480), opts = (c.opts || []).slice(0, 4).map(function (t) { return cut(t, 150); });
        var qf = 48, of = 36, lay = null;
        for (; qf >= 28; qf -= 2, of = Math.max(24, of - 1)) {
          g.font = "800 " + qf + "px " + F; var ql = wrapText(g, q, innerW), qh = ql.length * qf * 1.28;
          g.font = "600 " + of + "px " + F;
          var ol = opts.map(function (t, k) { return wrapText(g, L[k] + ")  " + t, innerW - 70); });
          var oh = ol.reduce(function (a, l) { return a + l.length * of * 1.3 + 34 + 16; }, 0);
          lay = { qf: qf, of: of, ql: ql, ol: ol, h: qh + 36 + oh };
          if (lay.h <= avail) break;
        }
        var y = top + Math.max(0, (avail - lay.h) / 2) * 0.6;
        g.textAlign = "left"; g.textBaseline = "top"; g.fillStyle = "#fff"; g.font = "800 " + lay.qf + "px " + F;
        lay.ql.forEach(function (l) { g.fillText(l, PAD, y); y += lay.qf * 1.28; });
        y += 36; g.font = "600 " + lay.of + "px " + F;
        lay.ol.forEach(function (lines) {
          var bh = lines.length * lay.of * 1.3 + 34; rr(PAD, y, innerW, bh, 18); g.fillStyle = "rgba(255,255,255,.13)"; g.fill();
          g.strokeStyle = "rgba(255,255,255,.2)"; g.lineWidth = 2; g.stroke();
          g.fillStyle = "#fff"; lines.forEach(function (l, i) { g.fillText(i ? "      " + l.replace(/^\s+/, "") : l, PAD + 30, y + 21 + i * lay.of * 1.3); });
          y += bh + 16;
        });
        /* footer */
        g.textBaseline = "middle"; g.textAlign = "center";
        g.fillStyle = "#c3cff5"; g.font = "700 30px " + F; g.fillText("Answer and explanation are free on", W / 2, H - 138);
        rr(W / 2 - 270, H - 108, 540, 66, 33); g.fillStyle = "#fff"; g.fill(); g.fillStyle = "#2a459d"; g.font = "800 34px " + F; g.fillText(SITE.host, W / 2, H - 74);
        if (cv.toBlob) cv.toBlob(function (b) { b ? ok(b) : no(); }, "image/png"); else no();
      } catch (e) { no(e); }
    });
  }
  function drawCard(c) { return c && c.type === "question" ? drawQuestionCard(c) : drawScoreCard(c); }

  /* the page's own preview picture as a file (site, page and mock-test shares) */
  function fetchPic(url) {
    return fetch(url, { credentials: "omit" }).then(function (r) { if (!r.ok) throw new Error("pic"); return r.blob(); });
  }

  /* ---------- the sheet ---------- */
  var css = [
    ".nl-shr{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 12px;border:1px solid var(--line,var(--ln,#d9e0ec));background:transparent;color:var(--mut,var(--mu,#5b6670));border-radius:99px;font:inherit;font-size:.78rem;font-weight:700;line-height:1;cursor:pointer;text-decoration:none;position:relative;white-space:nowrap}",
    ".nl-shr:hover{border-color:var(--ac,#2d4aa9);color:var(--ac,#2d4aa9)}.nl-shr:focus-visible{outline:3px solid var(--ac,#2d4aa9);outline-offset:2px}.nl-shr svg{width:15px;height:15px;flex:none}",
    ".nl-shr.ic{width:36px;padding:0;justify-content:center}.nl-shr.ic .t{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}",
    ".nl-shr.pri{background:var(--btn,var(--ac,#2d4aa9));border-color:var(--btn,var(--ac,#2d4aa9));color:var(--nl-on,#fff)}.nl-shr.pri:hover{filter:brightness(1.08);color:var(--nl-on,#fff)}",
    ".nls-hdr{flex:none;width:38px;min-height:38px;padding:0;justify-content:center;margin:0 6px 0 auto;color:var(--ac,#2d4aa9);border-color:var(--ac2,var(--ac,#2d4aa9))}.nls-hdr svg{width:17px;height:17px}.nls-hdr .t{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}",
    ".nls-cc{margin-left:auto;min-height:40px;padding:0 16px;font-size:.84rem;color:var(--ac,#2d4aa9);border-color:var(--ac2,var(--ac,#2d4aa9));background:var(--surface,#fff)}",
    ".nls-hero{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 0}.nls-hero .nl-shr{min-height:40px;padding:0 16px;font-size:.84rem}",
    ".uq-r{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.uq-r .nl-shr{min-height:36px}",
    ".mt-tags .mt-sh{margin-left:auto}",
    ".nls-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px 24px;padding:20px 0 22px;margin-bottom:6px;border-bottom:1px solid rgba(255,255,255,.14)}",
    ".nls-foot b{display:block;font-size:1.02rem;color:#fff}.nls-foot span.d{display:block;margin-top:3px;font-size:.84rem;color:#b8c0ce;max-width:520px;line-height:1.45}",
    ".nls-row{display:flex;flex-wrap:wrap;gap:8px}.nls-ci{display:inline-grid;place-items:center;width:42px;height:42px;border-radius:50%;background:var(--nlc,#2d4aa9);color:#fff;border:0;cursor:pointer;text-decoration:none;padding:0}",
    ".nls-ci svg{width:21px;height:21px}.nls-ci:hover{filter:brightness(1.12);transform:translateY(-1px)}.nls-ci:focus-visible{outline:3px solid #fff;outline-offset:2px}",
    ".nls-ov{position:fixed;inset:0;z-index:2000;display:flex;align-items:flex-end;justify-content:center;background:rgba(10,18,30,.6);animation:nlsf .16s ease-out}",
    ".nls-box{width:min(480px,100%);max-height:92vh;max-height:92dvh;overflow:auto;overscroll-behavior:contain;background:var(--surface,var(--sf,#fff));color:var(--text,var(--tx,#1e2a38));border:1px solid var(--line,var(--ln,#d9e0ec));border-radius:22px 22px 0 0;box-shadow:0 -12px 50px rgba(0,0,0,.35);padding:16px 18px calc(18px + env(safe-area-inset-bottom,0px));animation:nlsu .2s ease-out}",
    "@media(min-width:600px){.nls-ov{align-items:center;padding:16px}.nls-box{border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.35);padding-bottom:18px}}",
    "@keyframes nlsu{from{transform:translateY(24px);opacity:.4}to{transform:none;opacity:1}}@keyframes nlsf{from{opacity:0}to{opacity:1}}@media(prefers-reduced-motion:reduce){.nls-ov,.nls-box{animation:none}}",
    ".nls-h{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 12px}.nls-h h2{margin:0;font-size:1.1rem;font-weight:800}",
    ".nls-x{width:38px;height:38px;border-radius:50%;border:1px solid var(--line,#d9e0ec);background:transparent;color:inherit;font-size:1rem;cursor:pointer;display:grid;place-items:center}.nls-x:focus-visible,.nls-t:focus-visible,.nls-b:focus-visible{outline:3px solid var(--ac,#2d4aa9);outline-offset:2px}",
    ".nls-pv{display:flex;gap:12px;align-items:stretch;border:1px solid var(--line,#d9e0ec);border-radius:14px;overflow:hidden;background:var(--chip,var(--soft,#eef1f8));margin:0 0 14px}",
    ".nls-pv img{width:136px;height:auto;aspect-ratio:1200/630;align-self:center;object-fit:cover;flex:none;background:#2d4aa9}.nls-pv div{padding:9px 12px 9px 0;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:2px}",
    ".nls-pv.noimg div{padding-left:12px}.nls-pv b{font-size:.84rem;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}",
    ".nls-pv small{font-size:.74rem;line-height:1.35;color:var(--mut,#5b6670);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.nls-pv em{font-style:normal;font-size:.7rem;font-weight:700;color:var(--mut,#5b6670);letter-spacing:.02em}",
    ".nls-g{display:grid;grid-template-columns:repeat(4,1fr);gap:12px 6px;margin:0 0 12px}",
    ".nls-t{display:flex;flex-direction:column;align-items:center;gap:6px;padding:4px 2px;border:0;background:transparent;color:inherit;font:inherit;font-size:.72rem;font-weight:700;cursor:pointer;text-decoration:none;text-align:center;min-width:0}",
    ".nls-t i{display:grid;place-items:center;width:52px;height:52px;border-radius:50%;background:var(--nlc,#2d4aa9);color:#fff;transition:transform .12s}.nls-t i svg{width:25px;height:25px}.nls-t:hover i{transform:scale(1.07)}.nls-t span{line-height:1.2}",
    ".nls-b{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:46px;margin:0 0 8px;padding:0 14px;border-radius:12px;border:1px solid var(--line,#d9e0ec);background:var(--surface,#fff);color:inherit;font:inherit;font-size:.9rem;font-weight:700;cursor:pointer}",
    ".nls-b svg{width:18px;height:18px}.nls-b.pri{background:var(--btn,var(--ac,#2d4aa9));border-color:var(--btn,var(--ac,#2d4aa9));color:var(--nl-on,#fff)}",
    ".nls-d{margin:2px 0 8px;font-size:.8rem}.nls-d summary{cursor:pointer;font-weight:700;color:var(--mut,#5b6670);padding:6px 0}.nls-d pre{margin:6px 0 8px;padding:10px 12px;border-radius:10px;background:var(--chip,#eef1f8);white-space:pre-wrap;word-break:break-word;font:inherit;font-size:.78rem;line-height:1.5;max-height:170px;overflow:auto}",
    ".nls-hint{margin:0 0 8px;font-size:.74rem;line-height:1.4;color:var(--mut,#5b6670);text-align:center}",
    ".nls-st{margin:6px 0 0;min-height:1.2em;text-align:center;font-size:.8rem;font-weight:700;color:var(--ac,#2d4aa9)}",
    "[data-nls] svg{width:16px;height:16px;flex:none}[data-nls]:not(.nl-shr) svg{margin-right:7px}",
    "@media(max-width:340px){.nls-g{grid-template-columns:repeat(3,1fr)}}"
  ].join("");
  var st = doc.createElement("style"); st.textContent = css; (doc.head || doc.documentElement).appendChild(st);

  var store = [];
  function btn(p, opts) {
    opts = opts || {};
    var id = store.push(p) - 1; if (store.length > 4000) { store.splice(0, 2000); id -= 2000; if (id < 0) id = store.push(p) - 1; }
    var lab = opts.label || "Share", cls = (opts.plain ? "" : "nl-shr") + (opts.icon ? " ic" : "") + (opts.cls ? " " + opts.cls : ""); cls = cls.trim();
    return '<button type="button" class="' + cls + '" data-nls="' + id + '" aria-label="' + esc(opts.aria || "Share") + '" title="' + esc(opts.aria || "Share") + '">' + IC.share + '<span class="t">' + esc(lab) + "</span></button>";
  }

  var openEl = null, returnTo = null;
  function close() { if (!openEl) return; openEl.remove(); openEl = null; doc.removeEventListener("keydown", onKey, true); if (returnTo && returnTo.focus) try { returnTo.focus(); } catch (e) {} }
  function onKey(e) {
    if (e.key === "Escape") { e.stopPropagation(); e.preventDefault(); close(); return; }
    if (e.key === "Tab" && openEl) {
      var f = openEl.querySelectorAll("a[href],button,summary"); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && doc.activeElement === last) { first.focus(); e.preventDefault(); }
    }
    e.stopPropagation();     /* quiz / test shortcuts (A-D, N, P) must not fire behind the sheet */
  }

  function open(p, opener) {
    if (!p) return;
    close(); returnTo = opener || doc.activeElement;
    var img = p.image || meta('meta[property="og:image"]') || SITE.image;
    if (img && img.indexOf(SITE.url) === 0 && location.origin !== SITE.url.replace(/\/$/, "")) img = location.origin + "/" + img.slice(SITE.url.length);  /* preview from this origin while testing */
    var shareUrl = withUtm(p.url, "native", p.kind), full = p.text("native") + "\n" + p.url;
    var hasPic = !!(p.card || (img && /^(site|page|mock|wisdom)$/.test(p.kind)));
    var canFiles = false;
    try { var tf = new File([new Blob(["x"], { type: "image/png" })], "a.png", { type: "image/png" }); canFiles = !!(navigator.canShare && navigator.canShare({ files: [tf] })); } catch (er) {}
    var canClip = !!(window.ClipboardItem && navigator.clipboard && navigator.clipboard.write);
    function picBlob() { return p.card ? drawCard(p.card) : fetchPic(img); }
    var picBtn = hasPic ? '<button type="button" class="nls-b pri" data-do="card">' + IC.image +
      (canFiles ? "Send image + link (WhatsApp, Instagram...)" : p.card ? "Download image" : "Download preview image") + "</button>" : "";
    function track(ch) { try { doc.dispatchEvent(new CustomEvent("nl-share", { detail: { channel: ch, kind: p.kind, url: p.url } })); } catch (er) {} }
    var native = typeof navigator.share === "function";
    var tiles = CH.filter(function (c) { return !c.mobile || isMobile; }).map(function (c) {
      return '<a class="nls-t" style="--nlc:' + c.c + '" href="' + esc(chHref(c, p)) + '" target="_blank" rel="noopener noreferrer" data-ch="' + c.id + '"><i>' + IC[c.id] + "</i><span>" + c.name + "</span></a>";
    }).join("");
    tiles += '<button type="button" class="nls-t" style="--nlc:#4a5568" data-do="copy"><i>' + IC.copy + "</i><span>Copy link</span></button>";
    if (native) tiles = '<button type="button" class="nls-t" style="--nlc:#2d4aa9" data-do="native"><i>' + IC.more + "</i><span>More apps</span></button>" + tiles;
    var ov = doc.createElement("div"); ov.className = "nls-ov";
    ov.innerHTML = '<div class="nls-box" role="dialog" aria-modal="true" aria-labelledby="nls-t"><div class="nls-h"><h2 id="nls-t">' + esc(p.heading || "Share") + '</h2><button type="button" class="nls-x" data-do="close" aria-label="Close">✕</button></div>' +
      '<div class="nls-pv' + (img ? "" : " noimg") + '">' + (img ? '<img src="' + esc(img) + '" alt="" loading="lazy">' : "") + "<div><b>" + esc(cut(p.title, 90)) + "</b><small>" + esc(cut(p.desc, 130)) + "</small><em>" + esc(SITE.host) + "</em></div></div>" +
      (canFiles ? picBtn : "") + '<div class="nls-g">' + tiles + "</div>" + (canFiles ? "" : picBtn) +
      (hasPic && !canFiles && canClip ? '<p class="nls-hint">WhatsApp and Telegram: the picture is copied, then paste it in the chat (Ctrl/Cmd + V).</p>' : "") +
      '<details class="nls-d"><summary>See the message that goes with the link</summary><pre>' + esc(full) + '</pre><button type="button" class="nls-b" data-do="msg">' + IC.copy + "Copy message with link</button></details>" +
      '<p class="nls-st" role="status" aria-live="polite"></p></div>';
    doc.body.appendChild(ov); openEl = ov;
    var stEl = ov.querySelector(".nls-st"), note = function (m) { stEl.textContent = m; };
    var im = ov.querySelector(".nls-pv img"); if (im) im.onerror = function () { var pv = ov.querySelector(".nls-pv"); im.remove(); pv.classList.add("noimg"); };
    ov.addEventListener("click", function (e) {
      if (e.target === ov) { close(); return; }
      var a = e.target.closest("a[data-ch]");
      if (a && hasPic && !canFiles && canClip && (a.dataset.ch === "whatsapp" || a.dataset.ch === "telegram")) {
        e.preventDefault(); track(a.dataset.ch);
        var href = a.href;
        try {
          navigator.clipboard.write([new ClipboardItem({ "image/png": picBlob().then(function (b) { return b.type === "image/png" ? b : b.slice(0, b.size, "image/png"); }) })])
            .then(function () { note("Picture copied. Paste it in the chat with Ctrl/Cmd + V."); }, function () { note(""); });
        } catch (er) {}
        window.open(href, "_blank", "noopener,noreferrer");
        return;
      }
      if (a) { try { doc.dispatchEvent(new CustomEvent("nl-share", { detail: { channel: a.dataset.ch, kind: p.kind, url: p.url } })); } catch (er) {} setTimeout(close, 450); return; }
      var b = e.target.closest("[data-do]"); if (!b) return; var d = b.dataset["do"];
      if (d === "close") close();
      else if (d === "copy") copy(p.url).then(function () { track("copy"); note("Link copied"); }, function () { note("Could not copy. Select the link and copy it."); });
      else if (d === "msg") copy(full).then(function () { track("message"); note("Message copied. Paste it anywhere."); }, function () { note("Could not copy."); });
      else if (d === "native") { navigator.share({ title: p.title, text: p.text("native"), url: shareUrl }).then(function () { track("native"); close(); }, function () {}); }
      else if (d === "card") {
        note(p.card ? "Making your image..." : "Getting the image...");
        var fname = p.file || (img ? String(img).split("/").pop().split("?")[0] : "net-law-058.png");
        (p.card ? drawCard(p.card) : fetchPic(img)).then(function (blob) {
          var f = null; try { f = new File([blob], fname, { type: blob.type || "image/png" }); } catch (er) {}
          if (f && navigator.canShare && navigator.canShare({ files: [f] })) {
            return navigator.share({ files: [f], title: p.title, text: p.text("native") + "\n" + shareUrl }).then(function () { track("image"); close(); }, function () { note(""); });
          }
          var url = URL.createObjectURL(blob), a2 = doc.createElement("a"); a2.href = url; a2.download = fname; doc.body.appendChild(a2); a2.click(); a2.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 4000); track("image"); note("Image saved. Attach it to any post or chat.");
        }, function () { note("Could not make the image on this browser."); });
      }
    });
    doc.addEventListener("keydown", onKey, true);
    var f1 = ov.querySelector(".nls-t"); if (f1) f1.focus({ preventScroll: true });
  }

  /* ---------- click delegation ---------- */
  doc.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-nls],[data-nls-page],[data-nls-site]"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (b.hasAttribute("data-nls")) { var p = store[+b.getAttribute("data-nls")]; open(typeof p === "function" ? p() : p, b); }
    else if (b.hasAttribute("data-nls-site")) open(site(), b);
    else open(page(), b);
  }, true);

  /* ---------- automatic placement on static pages ---------- */
  function enhance() {
    if (doc.getElementById("sheet") && doc.getElementById("shade") && doc.getElementById("view")) return;   /* phone app (app.html) has its own screens: m-app.js places Share itself */
    var hdr = doc.querySelector(".site-header .nav, .site-header .container");
    var tc = doc.querySelector(".site-header .theme-ctl");
    var cc = doc.querySelector(".cc-ctrl");   /* home page: the header is full (nav + clock), so Share goes under the hero instead */
    if (cc && !cc.querySelector(".nls-cc")) {
      var c = doc.createElement("button"); c.type = "button"; c.className = "nl-shr nls-cc"; c.setAttribute("data-nls-site", ""); c.setAttribute("aria-label", "Share NET Law 058");
      c.innerHTML = IC.share + "<span>Share NET Law 058</span>"; cc.appendChild(c);
    }
    if (hdr && !cc && !doc.querySelector(".nls-hdr")) {
      var h = doc.createElement("button"); h.type = "button"; h.className = "nl-shr nls-hdr"; h.setAttribute("data-nls-page", ""); h.setAttribute("aria-label", "Share this page"); h.title = "Share this page";
      h.innerHTML = IC.share + '<span class="t">Share</span>';
      if (tc && tc.parentNode) tc.parentNode.insertBefore(h, tc); else hdr.appendChild(h);
    }
    var dd = doc.querySelector("#nav-res .nav-dd-in");
    if (dd && !dd.querySelector("[data-nls-site]")) { var li = doc.createElement("a"); li.href = "#"; li.setAttribute("data-nls-site", ""); li.textContent = "Share NET Law 058"; dd.appendChild(li); }
    var hero = doc.querySelector(".faq-hero .container, .pl-hero .container");
    if (hero && !hero.querySelector(".nls-hero")) {
      var w = doc.createElement("div"); w.className = "nls-hero";
      w.innerHTML = '<button type="button" class="nl-shr pri" data-nls-page aria-label="Share this page">' + IC.share + "<span>Share this page</span></button>";
      var anchor = hero.querySelector(".faq-badges, .pl-meta"); if (anchor) anchor.insertAdjacentElement("afterend", w); else { var h1 = hero.querySelector("h1"); h1 ? h1.insertAdjacentElement("afterend", w) : hero.appendChild(w); }
    }
    /* static MCQ questions */
    doc.querySelectorAll("article.uq").forEach(function (a) {
      var r = a.querySelector(".uq-r"); if (!r || r.querySelector(".nl-shr")) return;
      var qe = a.querySelector(".uq-q span:last-child"), opts = [].map.call(a.querySelectorAll(".uq-o li"), function (li) { return li.textContent; });
      if (!qe || !opts.length) return;
      var p = question({ q: qe.textContent, o: opts }, "", { hash: a.id, url: canon() });
      var s = doc.createElement("span"); s.innerHTML = btn(p, { label: "Share question", aria: "Share this question" });
      r.insertBefore(s.firstChild, r.firstChild);
    });
    /* wisdom page: each doha */
    doc.querySelectorAll("figure.wd-card").forEach(function (fig) {
      if (fig.querySelector(".nl-shr")) return;
      var bq = fig.querySelector("blockquote"), tr = fig.querySelector(".wd-tr"); if (!bq) return;
      var dv = clean(bq.innerHTML.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")).replace(/\s*\n\s*/g, " "), meaning = tr ? clean(tr.textContent) : "";
      var sec = fig.closest("section,article"), hd = sec && sec.querySelector("h2,h3"), au = hd ? clean(hd.textContent) : "";
      var p = text({ kind: "wisdom", heading: "Share this doha", title: "Wisdom for the journey", desc: meaning, url: SITE.url + "wisdom.html",
        lines: ["📜 " + dv, meaning, au ? "— " + au : "", "", "From NetLawVerse: free UGC NET Law (058) & Paper 1 preparation 👇"], short: cut(dv, 120) });
      var w = doc.createElement("div"); w.style.margin = "10px 0 0"; w.innerHTML = btn(p, { label: "Share this doha", aria: "Share this doha" }); fig.appendChild(w);
    });
    /* footer strip: shares the whole site */
    var ft = doc.querySelector("footer");
    if (ft && !ft.querySelector(".nls-foot")) {
      var sp = site(), box = doc.createElement("div"); box.className = "container nls-foot";
      var links = CH.filter(function (c) { return !c.mobile || isMobile; }).map(function (c) {
        return '<a class="nls-ci" style="--nlc:' + c.c + '" href="' + esc(chHref(c, sp)) + '" target="_blank" rel="noopener noreferrer" aria-label="Share NET Law 058 on ' + c.name + '" title="' + c.name + '">' + IC[c.id] + "</a>";
      }).join("");
      box.innerHTML = '<div><b>Know someone preparing for UGC NET?</b><span class="d">Share NET Law 058 with a friend: free MCQs, mock tests, notes and study plans.</span></div><div class="nls-row">' + links +
        '<button type="button" class="nls-ci" style="--nlc:#4a5568" data-nls-site aria-label="More ways to share" title="Copy link or more apps">' + IC.copy + "</button></div>";
      ft.insertBefore(box, ft.firstChild);
    }
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", enhance); else enhance();

  window.NLShare = { open: open, btn: btn, make: make, close: close, unitUrl: unitUrl, site: SITE, enhance: enhance };
})();
