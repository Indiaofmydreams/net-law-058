/* cutoff.js: renders the Cut-off Trend page from cutoff-data.js. Progressive enhancement:
   the disclaimer, analysis and mark plans are plain HTML and read fine without it; this adds the data table, chart,
   expected ranges (calculated, never typed in), the target calculator and the section highlighter. No libraries, no network. */
(function () {
  "use strict";
  var d = document, D = window.NL_CUTOFF;
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  try { var z = +localStorage.getItem("nl-size"); if (z > 0 && z < 3) d.documentElement.style.fontSize = [100, 115, 130][z] + "%"; } catch (e) {}

  /* ---------- disclaimer: expand / collapse ---------- */
  $$("[data-co-all]").forEach(function (b) {
    b.addEventListener("click", function () {
      var open = b.getAttribute("data-co-all") === "open";
      $$("#g-disclaimer .faq-item").forEach(function (el) { el.open = open; });
    });
  });
  (function fromHash() {
    var id = ""; try { id = decodeURIComponent(location.hash.slice(1)); } catch (e) {}
    var el = id && d.getElementById(id);
    if (el && el.classList.contains("faq-item")) el.open = true;
  })();

  /* ---------- section highlighter ---------- */
  var navLinks = $$(".faq-nav a"), groups = $$(".faq-group");
  if ("IntersectionObserver" in window && navLinks.length) {
    var map = {}; navLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
        var a = map[en.target.id];
        if (a) {
          a.setAttribute("aria-current", "true");
          var ul = a.closest("ul");
          if (ul && ul.scrollWidth > ul.clientWidth) ul.scrollTo({ left: a.offsetLeft - 16, behavior: "smooth" });
        }
      });
    }, { rootMargin: "-25% 0px -65% 0px" });
    groups.forEach(function (g) { io.observe(g); });
  }

  if (!D || !D.sessions) return;

  /* ---------- numbers ---------- */
  var S = D.sessions, CATS = D.cats, OUT = ["JRF", "Assistant Professor", "PhD only"], OUTS = ["JRF", "AP", "PhD"];
  var state = { cat: "UR", goal: 1 };
  var ev = function (x) { return Math.round(x / 2) * 2; };
  function recent() { return S.filter(function (s) { return s.UR && s.UR[2] != null; }).slice(-5); }
  function expected(cat, i) {
    var v = recent().map(function (s) { return (s[cat] || [])[i]; }).filter(function (x) { return x != null; });
    if (!v.length) return null;
    var m = v.reduce(function (a, b) { return a + b; }, 0) / v.length;
    var sd = Math.sqrt(v.reduce(function (a, b) { return a + (b - m) * (b - m); }, 0) / v.length);
    return { mean: Math.round(m), lo: ev(m - sd), hi: ev(m + sd), safe: ev(m + sd) + 6, min: Math.min.apply(0, v), max: Math.max.apply(0, v), n: v.length };
  }
  function catName(id) { return CATS.filter(function (c) { return c.id === id; })[0].name; }
  function prevVal(cat, idx, i) {
    for (var k = idx - 1; k >= 0; k--) { var v = (S[k][cat] || [])[i]; if (v != null) return v; }
    return null;
  }
  function srcChip(s) {
    return s.src === "nta" ? '<span class="co-chk nta" title="Checked against the NTA PDF">NTA PDF checked</span>'
      : '<span class="co-chk" title="Figures matched across independent published compilations">' + s.src + ' sources match</span>';
  }

  /* ---------- hero facts + range cards ---------- */
  var ur = [0, 1, 2].map(function (i) { return expected("UR", i); });
  $$("[data-exp]").forEach(function (el) {
    var p = el.getAttribute("data-exp").split(":"), e = expected(p[0], +p[1]);
    if (e) el.textContent = e[p[2]];
  });
  var host = $("#co-ranges");
  if (host && ur[0]) {
    host.innerHTML = [0, 1, 2].map(function (i) {
      var e = ur[i], lo = e.min - 6, hi = e.max + 6, span = hi - lo;
      var l = (e.lo - lo) / span * 100, w = (e.hi - e.lo) / span * 100, m = (e.mean - lo) / span * 100;
      var blurb = ["Highest value of the five sessions: " + e.max + ". Lowest: " + e.min + ".",
        "The line most aspirants actually need. Highest: " + e.max + ". Lowest: " + e.min + ".",
        "Doctoral admission only. Highest: " + e.max + ". Lowest: " + e.min + "."][i];
      return '<div class="co-range"><h4>' + ["JRF", "Assistant Professor", "PhD admission only"][i] + ' (Unreserved)</h4>' +
        '<span class="big">' + e.lo + ' to ' + e.hi + ' <small>/ 300</small></span>' +
        '<div class="co-bar" aria-hidden="true"><i style="left:' + l + '%;width:' + w + '%"></i><b style="left:calc(' + m + '% - 1px)"></b></div>' +
        '<div class="co-barscale"><span>' + lo + '</span><span>average ' + e.mean + '</span><span>' + hi + '</span></div>' +
        '<p style="margin-top:10px">' + blurb + '</p>' +
        '<div class="co-safe">Safe target: ' + e.safe + ' or more (' + Math.ceil(e.safe / 2) + ' correct of 150)</div></div>';
    }).join("");
  }

  /* ---------- table ---------- */
  function renderTable() {
    var c = state.cat, rows = "";
    var e = [0, 1, 2].map(function (i) { return expected(c, i); });
    rows += '<tr class="exp"><th scope="row">' + esc(D.nextSession) + ' (expected)<small>Planning range, not an NTA figure</small></th>' +
      e.map(function (x) { return '<td>' + (x ? x.lo + ' to ' + x.hi : '-') + '</td>'; }).join("") + '</tr>';
    for (var k = S.length - 1; k >= 0; k--) {
      var s = S[k], v = s[c] || [null, null, null], cells = "";
      for (var i = 0; i < 3; i++) {
        if (v[i] == null) { cells += '<td class="na">-</td>'; continue; }
        var pv = prevVal(c, k, i), dl = pv == null ? "" : '<i>' + (v[i] - pv >= 0 ? "+" : "−") + Math.abs(v[i] - pv) + '</i>';
        cells += '<td>' + v[i] + dl + '</td>';
      }
      rows += '<tr><th scope="row">' + esc(s.label) + srcChip(s) + (s.note ? '<small>' + esc(s.note) + '</small>' : '') + '</th>' + cells + '</tr>';
    }
    $("#co-table").innerHTML = '<table class="co-table"><caption>' + esc(catName(c)) + ': cut-off marks out of ' + D.max +
      '<span>The small figure under each mark is the change from the previous session in the same column.</span></caption>' +
      '<thead><tr><th scope="col">Session</th><th scope="col">JRF<small>also AP and PhD</small></th><th scope="col">Assistant Professor<small>also PhD</small></th><th scope="col">PhD only<small>admission</small></th></tr></thead><tbody>' + rows + '</tbody></table>';
  }

  /* ---------- chart ---------- */
  var W = 760, H = 380, M = { l: 44, r: 118, t: 18, b: 40 };
  function renderChart() {
    var c = state.cat, n = S.length, slots = n + 1;
    var vals = [];
    S.forEach(function (s) { (s[c] || []).forEach(function (x) { if (x != null) vals.push(x); }); });
    var ex = [0, 1, 2].map(function (i) { return expected(c, i); });
    ex.forEach(function (e) { if (e) { vals.push(e.lo, e.hi); } });
    var lo = Math.floor((Math.min.apply(0, vals) - 8) / 10) * 10, hi = Math.ceil((Math.max.apply(0, vals) + 8) / 10) * 10;
    var iw = W - M.l - M.r, ih = H - M.t - M.b;
    var X = function (k) { return M.l + iw * (k + .5) / slots; };
    var Y = function (v) { return M.t + ih * (1 - (v - lo) / (hi - lo)); };
    var g = "", step = (hi - lo) > 120 ? 20 : 10;
    for (var t = lo; t <= hi; t += step) g += '<line class="grid" x1="' + M.l + '" x2="' + (W - M.r) + '" y1="' + Y(t) + '" y2="' + Y(t) + '"/><text x="' + (M.l - 8) + '" y="' + (Y(t) + 4) + '" text-anchor="end">' + t + '</text>';
    var band = '<rect class="band" x="' + (X(n) - iw / slots / 2 + 4) + '" y="' + M.t + '" width="' + (iw / slots - 8) + '" height="' + ih + '" rx="12"/>';
    var xl = "";
    S.forEach(function (s, k) { xl += '<text class="xl" x="' + X(k) + '" y="' + (H - 16) + '" text-anchor="middle">' + esc(s.label.replace(" ", " ")) + '</text>'; });
    xl += '<text class="xl exp" x="' + X(n) + '" y="' + (H - 16) + '" text-anchor="middle">Dec 2026</text><text class="xl exp" x="' + X(n) + '" y="' + (H - 3) + '" text-anchor="middle">expected</text>';
    var cls = ["jrf", "ap", "phd"], paths = "", marks = "";
    for (var i = 0; i < 3; i++) {
      var seg = "", pen = false;
      S.forEach(function (s, k) {
        var v = (s[c] || [])[i];
        if (v == null) { pen = false; return; }
        seg += (pen ? "L" : "M") + X(k).toFixed(1) + " " + Y(v).toFixed(1) + " "; pen = true;
        marks += i === 0 ? '<circle class="m-jrf" cx="' + X(k) + '" cy="' + Y(v) + '" r="5"/>'
          : i === 1 ? '<rect class="m-ap" x="' + (X(k) - 4.5) + '" y="' + (Y(v) - 4.5) + '" width="9" height="9" rx="1.5"/>'
          : '<path class="m-phd" d="M' + X(k) + ' ' + (Y(v) - 6) + 'L' + (X(k) + 6) + ' ' + Y(v) + 'L' + X(k) + ' ' + (Y(v) + 6) + 'L' + (X(k) - 6) + ' ' + Y(v) + 'Z"/>';
      });
      paths += '<path class="s-' + cls[i] + '" d="' + seg + '"/>';
    }
    var caps = "", lbl = "";
    ex.forEach(function (e, i) {
      if (!e) return;
      var x = X(n), y1 = Y(e.hi), y2 = Y(e.lo);
      caps += '<rect class="rng-' + cls[i] + '" x="' + (x - 6) + '" y="' + y1 + '" width="12" height="' + Math.max(12, y2 - y1) + '" rx="6"/>';
      lbl += '<text class="dl dl-' + cls[i] + '" x="' + (x + 16) + '" y="' + ((y1 + y2) / 2 + 4) + '">' + OUTS[i] + ' ' + e.lo + '–' + e.hi + '</text>';
    });
    var hits = "";
    for (var k = 0; k < slots; k++) hits += '<rect class="hit" data-k="' + k + '" x="' + (X(k) - iw / slots / 2) + '" y="' + M.t + '" width="' + (iw / slots) + '" height="' + ih + '"/>';
    var sum = catName(c) + ' cut-off trend, ' + S[0].label + ' to ' + S[n - 1].label + ', with the expected ' + D.nextSession + ' range. A table with every figure follows.';
    $("#co-chart-host").innerHTML = '<div class="co-svgwrap"><div class="co-inner"><svg class="co-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(sum) + '">' +
      g + band + '<line class="axis" x1="' + M.l + '" x2="' + (W - M.r) + '" y1="' + (M.t + ih) + '" y2="' + (M.t + ih) + '"/>' + xl + paths + marks + caps + lbl +
      '<line class="cross" id="co-cross" x1="0" x2="0" y1="' + M.t + '" y2="' + (M.t + ih) + '"/>' + hits + '</svg><div class="co-tip" id="co-tip" role="presentation"></div></div></div>';
    var wrap = $(".co-svgwrap"); if (wrap && wrap.scrollWidth > wrap.clientWidth) wrap.scrollLeft = wrap.scrollWidth;
    var svg = $(".co-svg"), tip = $("#co-tip"), cross = $("#co-cross");
    function show(k, ev2) {
      var s = S[k], html;
      if (k === n) html = '<b>' + esc(D.nextSession) + ' (expected)</b>' + ex.map(function (e, i) { return e ? '<span>' + OUT[i] + '<em>' + e.lo + ' to ' + e.hi + '</em></span>' : ""; }).join("");
      else html = '<b>' + esc(s.label) + '</b>' + (s[c] || []).map(function (v, i) { return '<span>' + OUT[i] + '<em>' + (v == null ? "-" : v) + '</em></span>'; }).join("");
      tip.innerHTML = html;
      cross.setAttribute("x1", X(k)); cross.setAttribute("x2", X(k)); cross.style.opacity = 1;
      var r = svg.getBoundingClientRect(), px = X(k) / W * r.width;
      tip.style.left = Math.min(Math.max(px + 14, 4), r.width - 170) + "px"; tip.style.top = "8px"; tip.classList.add("on");
    }
    function hide() { tip.classList.remove("on"); cross.style.opacity = 0; }
    $$(".hit", svg).forEach(function (h) {
      h.addEventListener("pointerenter", function (e) { show(+h.getAttribute("data-k"), e); });
      h.addEventListener("pointermove", function (e) { show(+h.getAttribute("data-k"), e); });
    });
    svg.addEventListener("pointerleave", hide);
  }

  /* ---------- category tabs ---------- */
  var seg = $("#co-cats");
  if (seg) {
    seg.innerHTML = CATS.map(function (c) { return '<button type="button" data-c="' + c.id + '" aria-pressed="' + (c.id === state.cat) + '">' + esc(c.name) + '</button>'; }).join("");
    seg.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      state.cat = b.getAttribute("data-c");
      $$("button", seg).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      renderTable(); renderChart();
      if (window.announce) window.announce(catName(state.cat) + " cut-offs shown");
    });
  }
  if ($("#co-table")) renderTable();
  if ($("#co-chart-host")) renderChart();

  /* ---------- target calculator ---------- */
  var base = +($("#co-base-total") || { dataset: { v: 194 } }).dataset.v;
  var cCat = $("#co-calc-cat"), cGoal = $("#co-calc-goal"), out = $("#co-calc-out");
  function renderCalc() {
    var e = expected(state.cat, state.goal); if (!e || !out) return;
    var gap = e.safe - base, need = Math.ceil(e.safe / 2);
    var verdict = gap <= 0
      ? "The baseline plan already reaches this target with " + (-gap) + " marks to spare. Protect it: keep your banker units above their targets and spend the extra time on mocks."
      : "You need " + gap + " marks (" + Math.ceil(gap / 2) + " more correct answers) beyond the baseline plan. See the three routes below for where to find them.";
    out.innerHTML = '<div><strong>' + e.lo + ' to ' + e.hi + '</strong><span>Expected range for ' + esc(D.nextSession) + '</span></div>' +
      '<div><strong>' + e.safe + '</strong><span>Safe target (top of range + 6 marks)</span></div>' +
      '<div><strong>' + need + ' of 150</strong><span>Correct answers needed at the safe target</span></div>' +
      '<div><strong>' + (gap > 0 ? "+" + gap : "0") + '</strong><span>Marks beyond the ' + base + '-mark baseline plan</span></div>' +
      '<p class="co-verdict" style="grid-column:1/-1">' + verdict + '</p>';
  }
  if (cCat && cGoal) {
    cCat.innerHTML = CATS.map(function (c) { return '<button type="button" data-c="' + c.id + '" aria-pressed="' + (c.id === state.cat) + '">' + esc(c.name) + '</button>'; }).join("");
    cGoal.innerHTML = [["PhD admission", 2], ["Assistant Professor", 1], ["JRF", 0]].map(function (g) { return '<button type="button" data-g="' + g[1] + '" aria-pressed="' + (g[1] === state.goal) + '">' + g[0] + '</button>'; }).join("");
    cCat.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return; state.cat = b.getAttribute("data-c");
      $$("button", cCat).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      $$("button", seg).forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-c") === state.cat); });
      renderTable(); renderChart(); renderCalc();
    });
    cGoal.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return; state.goal = +b.getAttribute("data-g");
      $$("button", cGoal).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      renderCalc();
    });
    renderCalc();
  }
  if (seg) seg.addEventListener("click", function () { if (cCat) $$("button", cCat).forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-c") === state.cat); }); renderCalc(); });
})();
