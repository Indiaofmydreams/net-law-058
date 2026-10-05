/* nl-countdown.js: live exam countdown, to the second, in Indian Standard Time (IST, UTC+5:30).
   TO UPDATE THE EXAM DATE: edit exam-dates.json (the only file you ever touch for this).
     "date": "2026-12-15"   year-month-day (15-12-2026 and 15/12/2026 also work). Leave "" to show "date to be announced".
     "time": "09:00"        optional, 24-hour IST. "00:00" counts to the start of that day.
     "name": "UGC NET ..."  the heading shown above the clock.
   The clock uses the student's device clock for "now" but always converts the exam moment to IST,
   so it is correct in any time zone (as long as the device clock itself is right). */
(function () {
  "use strict";
  var host = document.getElementById("nl-countdown"); if (!host) return;
  var IST = 19800000, MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var css = [
    ".nl-cd{border:1px solid var(--line,var(--ln,#e1ebe7));background:var(--surface,var(--sf,#fff));color:var(--text,var(--tx,#1e3138));border-radius:18px;padding:16px 18px;margin:18px 0 0;max-width:560px}",
    ".nl-cd-t{display:flex;flex-wrap:wrap;justify-content:space-between;gap:2px 14px;align-items:baseline}.nl-cd-t b{font-size:.95rem}.nl-cd-t span{font-size:.8125rem;color:var(--mut,var(--mu,#5b6670))}",
    ".nl-cd-g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}",
    ".nl-cd-g div{text-align:center;padding:10px 4px;border-radius:12px;background:var(--tint,#e3f0ea)}",
    ".nl-cd-g strong{display:block;font:800 1.7rem/1.1 system-ui,sans-serif;font-variant-numeric:tabular-nums}",
    ".nl-cd-g small{display:block;margin-top:2px;font-size:.6875rem;letter-spacing:.06em;text-transform:uppercase;color:var(--mut,var(--mu,#5b6670))}",
    ".nl-cd-m{margin:0;font-weight:700}",
    ".nl-sr{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}",
    "@media(max-width:420px){.nl-cd-g strong{font-size:1.35rem}}"
  ].join("");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* "2026-12-15" | "15-12-2026" | "15/12/2026"  ->  {y,m,d} or null */
  function parseDate(s) {
    s = String(s || "").trim(); var m;
    if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s))) return valid(+m[1], +m[2], +m[3]);
    if ((m = /^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/.exec(s))) return valid(+m[3], +m[2], +m[1]);
    return null;
  }
  function valid(y, mo, d) { var t = new Date(Date.UTC(y, mo - 1, d)); return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d ? { y: y, m: mo, d: d } : null; }
  function parseTime(s) { var m = /^(\d{1,2}):(\d{2})$/.exec(String(s || "00:00").trim()); return m && +m[1] < 24 && +m[2] < 60 ? { h: +m[1], mi: +m[2] } : { h: 0, mi: 0 }; }
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };

  function init(cfg) {
    cfg = cfg || {}; var name = cfg.name || "UGC NET", dt = parseDate(cfg.date), tm = parseTime(cfg.time);
    if (!dt) { host.innerHTML = '<section class="nl-cd" aria-label="Exam countdown"><div class="nl-cd-t"><b>' + esc(name) + '</b></div><p class="nl-cd-m">Exam date: to be announced.</p></section>'; return; }
    var target = Date.UTC(dt.y, dt.m - 1, dt.d, tm.h, tm.mi) - IST;                 /* the exam moment, in real UTC time */
    var dayEnd = Date.UTC(dt.y, dt.m - 1, dt.d, 23, 59, 59) - IST;                  /* last second of exam day, IST */
    var h12 = tm.h % 12 || 12, label = dt.d + " " + MONTHS[dt.m - 1] + " " + dt.y + (cfg.time && /^\d/.test(cfg.time) ? ", " + h12 + ":" + pad(tm.mi) + (tm.h < 12 ? " AM" : " PM") : "") + " IST";
    host.innerHTML = '<section class="nl-cd" role="group" aria-label="Exam countdown"><div class="nl-cd-t"><b>' + esc(name) + '</b><span>Counting down to ' + esc(label) + '</span></div>' +
      '<div class="nl-cd-g" aria-hidden="true"><div><strong data-u="d">--</strong><small>Days</small></div><div><strong data-u="h">--</strong><small>Hours</small></div><div><strong data-u="m">--</strong><small>Minutes</small></div><div><strong data-u="s">--</strong><small>Seconds</small></div></div>' +
      '<p class="nl-sr" role="status" aria-live="off" id="nl-cd-sr"></p></section>';
    var sec = host.firstChild, grid = sec.querySelector(".nl-cd-g"), U = {}, lastMin = -1;
    ["d", "h", "m", "s"].forEach(function (k) { U[k] = sec.querySelector('[data-u="' + k + '"]'); });
    function paint() {
      var now = Date.now(), diff = target - now;
      if (diff <= 0) {
        if (now <= dayEnd) { sec.innerHTML = '<div class="nl-cd-t"><b>' + esc(name) + '</b><span>' + esc(label) + '</span></div><p class="nl-cd-m">It is exam day. All the best!</p>'; return false; }
        host.innerHTML = ""; return false;                                            /* exam is over: hide the banner */
      }
      var s = Math.floor(diff / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sc = s % 60;
      U.d.textContent = d; U.h.textContent = pad(h); U.m.textContent = pad(m); U.s.textContent = pad(sc);
      var minKey = Math.floor(s / 60);
      if (minKey !== lastMin) { lastMin = minKey; sec.setAttribute("aria-label", d + " days, " + h + " hours and " + m + " minutes until " + name + ", " + label); }   /* screen readers get a calm, once-a-minute label */
      return true;
    }
    (function loop() { if (paint()) setTimeout(loop, 1000 - (Date.now() % 1000) + 5); })();
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  fetch("exam-dates.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(init);
})();
