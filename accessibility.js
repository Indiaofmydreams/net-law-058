/* accessibility.js: font-size (A A A) + language (अ / A) toolbar.
   One file. No other changes needed except one <script> line in index.html. */
(function () {
  var SIZES = [100, 115, 130];            // normal, bigger, even bigger (% of base)
  var LS = { size: "nl-size", lang: "nl-lang" };

  // ---------- Hindi dictionary (add more lines anytime: "English": "हिन्दी") ----------
  var HI = {
    "Home": "होम",
    "Law 058": "विधि 058",
    "Syllabus": "पाठ्यक्रम",
    "MCQs": "प्रश्न (MCQ)",
    "Paper 1": "पेपर 1",
    "Notes": "नोट्स",
    "PYQs": "पिछले वर्ष के प्रश्न",
    "Prepare smarter.": "समझदारी से तैयारी करें।",
    "Practice freely.": "खुलकर अभ्यास करें।",
    "Free notes, topic-wise MCQs, case-law revision and Paper 1 resources for UGC NET Law aspirants.":
      "UGC NET विधि के अभ्यर्थियों के लिए निःशुल्क नोट्स, विषयवार MCQ, केस-लॉ रिविजन और पेपर 1 सामग्री।",
    "Start MCQs": "MCQ शुरू करें",
    "Explore Notes": "नोट्स देखें",
    "100% FREE · NO SIGN-UP": "100% निःशुल्क · साइन-अप नहीं",
    "free MCQs": "निःशुल्क MCQ",
    "Practise the way the exam tests you": "परीक्षा जैसे पूछती है, वैसे अभ्यास करें",
    "Every module of both papers, 20 in all": "दोनों पेपर के सभी 20 मॉड्यूल",
    "Instant feedback with clear explanations": "तुरंत उत्तर और स्पष्ट व्याख्या",
    "Nothing to pay. Just open and practise": "कोई शुल्क नहीं। बस खोलें और अभ्यास करें",
    "Free resources": "निःशुल्क सामग्री",
    "Topic-wise practice": "विषयवार अभ्यास",
    "Case-law focused": "केस-लॉ पर केंद्रित",
    "Pick one module. Answer ten questions. See where you stand today.":
      "एक मॉड्यूल चुनें। दस प्रश्न हल करें। देखें आज आप कहाँ हैं।"
  };

  // ---------- Styles (injected, so no CSS file needed) ----------
  var css =
    "#a11y-bar{display:flex;justify-content:flex-end;align-items:center;gap:6px;" +
    "padding:4px 16px;font:14px system-ui,sans-serif;" +
    "background:rgba(127,127,127,.10);border-bottom:1px solid rgba(127,127,127,.2)}" +
    "#a11y-bar .grp{display:flex;gap:2px;align-items:center}" +
    "#a11y-bar .sep{width:1px;height:18px;background:rgba(127,127,127,.35);margin:0 8px}" +
    "#a11y-bar button{all:unset;cursor:pointer;min-width:34px;height:30px;text-align:center;" +
    "line-height:30px;border-radius:6px;font-weight:600;color:inherit}" +
    "#a11y-bar button:hover{background:rgba(127,127,127,.2)}" +
    "#a11y-bar button:focus-visible{outline:2px solid currentColor;outline-offset:1px}" +
    "#a11y-bar button[aria-pressed=true]{background:rgba(127,127,127,.3);" +
    "box-shadow:inset 0 -2px 0 currentColor}" +
    "html[lang=hi] body{font-family:'Noto Sans Devanagari','Nirmala UI',Mangal,system-ui,sans-serif}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  // ---------- Helpers ----------
  function get(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // ---------- Font size ----------
  function applySize(i) {
    document.documentElement.style.fontSize = SIZES[i] + "%";
    var btns = document.querySelectorAll("#a11y-bar [data-size]");
    for (var n = 0; n < btns.length; n++)
      btns[n].setAttribute("aria-pressed", String(+btns[n].dataset.size === i));
    set(LS.size, i);
  }

  // ---------- Language (swaps visible text; originals are remembered) ----------
  var originals = new WeakMap();
  var lang = get(LS.lang, "en");
  var busy = false;

  function translateNode(node) {
    var raw = node.nodeValue;
    var t = raw.trim();
    if (!t) return;
    if (!originals.has(node)) originals.set(node, raw);
    var orig = originals.get(node);
    if (lang === "en") { if (raw !== orig) node.nodeValue = orig; return; }
    var o = orig.trim();
    var arrow = /\s*[→>]$/.test(o) ? " →" : "";
    var key = o.replace(/\s*[→>]$/, "").trim();
    var key2 = key.replace(/^✓\s*/, "");
    var hit = HI[key] || HI[key2];
    if (hit) node.nodeValue = orig.replace(o, (key !== key2 ? "✓ " : "") + hit + arrow);
  }

  function walk(root) {
    busy = true;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode && n.parentNode.nodeName;
        if (p === "SCRIPT" || p === "STYLE" || p === "TEXTAREA") return NodeFilter.FILTER_REJECT;
        if (n.parentNode.closest && n.parentNode.closest("#a11y-bar")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n; while ((n = w.nextNode())) translateNode(n);
    busy = false;
  }

  function applyLang(l) {
    lang = l;
    document.documentElement.lang = l;
    walk(document.body);
    var btns = document.querySelectorAll("#a11y-bar [data-lang]");
    for (var i = 0; i < btns.length; i++)
      btns[i].setAttribute("aria-pressed", String(btns[i].dataset.lang === l));
    set(LS.lang, l);
  }

  // ---------- Build the bar ----------
  function build() {
    var bar = document.createElement("div");
    bar.id = "a11y-bar";
    bar.setAttribute("role", "toolbar");
    bar.setAttribute("aria-label", "Accessibility options");
    bar.innerHTML =
      '<div class="grp" role="group" aria-label="Text size">' +
      '<button data-size="0" style="font-size:12px" aria-label="Normal text" title="Normal">A</button>' +
      '<button data-size="1" style="font-size:16px" aria-label="Bigger text" title="Bigger">A</button>' +
      '<button data-size="2" style="font-size:21px" aria-label="Biggest text" title="Biggest">A</button>' +
      '</div><span class="sep"></span>' +
      '<div class="grp" role="group" aria-label="Language">' +
      '<button data-lang="hi" aria-label="हिन्दी" title="हिन्दी">अ</button>' +
      '<button data-lang="en" aria-label="English" title="English">A</button>' +
      '</div>';
    document.body.insertBefore(bar, document.body.firstChild);

    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.size !== undefined) applySize(+b.dataset.size);
      if (b.dataset.lang) applyLang(b.dataset.lang);
    });

    applySize(+get(LS.size, 0));
    applyLang(lang);

    // re-translate content added later (e.g. MCQs loaded by script)
    var timer;
    new MutationObserver(function () {
      if (busy || lang === "en") return;
      clearTimeout(timer);
      timer = setTimeout(function () { walk(document.body); }, 150);
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
