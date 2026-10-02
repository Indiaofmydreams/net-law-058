/* accessibility.js: text-size toolbar (A A A). One file; only needs one <script> line in index.html. */
(function () {
  var SIZES = [100, 115, 130];            // normal, bigger, even bigger (% of base)
  var KEY = "nl-size", NAMES = ["Normal", "Bigger", "Biggest"];
  var css =
    "#a11y-bar{display:flex;justify-content:flex-end;align-items:center;gap:4px;padding:2px 16px;" +
    "font:14px system-ui,sans-serif;background:rgba(127,127,127,.10);border-bottom:1px solid rgba(127,127,127,.2)}" +
    "#a11y-bar .lbl{margin-right:6px;opacity:.75;font-size:12px}" +
    "#a11y-bar button{all:unset;cursor:pointer;min-width:44px;height:44px;text-align:center;line-height:44px;border-radius:8px;font-weight:600;color:inherit}" +
    "#a11y-bar button:hover{background:rgba(127,127,127,.2)}" +
    "#a11y-bar button:focus-visible{outline:3px solid currentColor;outline-offset:-3px}" +
    "#a11y-bar button[aria-pressed=true]{background:rgba(127,127,127,.3);box-shadow:inset 0 -3px 0 currentColor}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  function get(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function applySize(i, say) {
    document.documentElement.style.fontSize = SIZES[i] + "%";
    var btns = document.querySelectorAll("#a11y-bar [data-size]");
    for (var n = 0; n < btns.length; n++) btns[n].setAttribute("aria-pressed", String(+btns[n].dataset.size === i));
    set(KEY, i);
    if (say && window.announce) window.announce("Text size: " + NAMES[i]);
  }
  function build() {
    var bar = document.createElement("div");
    bar.id = "a11y-bar"; bar.setAttribute("role", "toolbar"); bar.setAttribute("aria-label", "Text size");
    bar.innerHTML =
      '<span class="lbl" aria-hidden="true">Text size</span>' +
      '<button data-size="0" style="font-size:12px" aria-label="Normal text size" title="Normal">A</button>' +
      '<button data-size="1" style="font-size:16px" aria-label="Bigger text size" title="Bigger">A</button>' +
      '<button data-size="2" style="font-size:21px" aria-label="Biggest text size" title="Biggest">A</button>';
    var skip = document.querySelector(".skip");
    document.body.insertBefore(bar, skip ? skip.nextSibling : document.body.firstChild);
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (b && b.dataset.size !== undefined) applySize(+b.dataset.size, true);
    });
    var s = +get(KEY, 0); applySize(SIZES[s] ? s : 0, false);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
