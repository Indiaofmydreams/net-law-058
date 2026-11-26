/* NET Law-Verse phone + tablet app: a small always-available Share button, and one gentle reminder after a minute of use.
   Loaded by app.html after m-app.js. It only adds two floating elements; no existing screen is changed.

   Share button   Small round button near the bottom-right corner on every main screen (phone and tablet). It slides out of the way
                  while you scroll down and returns when you stop. It is hidden on focused screens (a running test, an article frame),
                  where the top bar already has a Share icon, so it never covers a question or the text you are reading.
   Reminder       Once per visit, after 60 seconds of use: "Enjoying NET Law-Verse? Share it with friends..." with Share / Not now.
                  It waits for a calm moment (no disclaimer, welcome pop-up, sheet or running test) and is skipped for 7 days after
                  someone has shared. Nothing is sent anywhere; the choice is remembered only on this device. */
(function () {
"use strict";
var N = window.NLM; if (!N) return;
try { if (top !== self) return; } catch (e) { return; }
var KEY_SEEN = 'nl-nudge-seen', KEY_DONE = 'nl-nudge-done', WAIT = 60000, QUIET_DAYS = 7;
var nav = document.getElementById('nav'), view = document.getElementById('view'), app = document.getElementById('app');
if (!nav || !view || !app) return;

function openShare() {
  try { N.A.shareapp(); } catch (e) { if (window.NLShare) NLShare.open(NLShare.make.site()); }
  try { localStorage.setItem(KEY_DONE, '' + Date.now()); } catch (e) { }
}

/* ---- floating share button ---- */
var fab = document.createElement('button');
fab.type = 'button'; fab.className = 'sfab'; fab.setAttribute('aria-label', 'Share NET Law-Verse with friends'); fab.title = 'Share the app';
fab.innerHTML = N.sv(N.P.share, 20); fab.hidden = true;
fab.addEventListener('click', openShare);
document.body.appendChild(fab);

function calm() {
  var d = document.querySelector('.tm-back.show, .nlw-back.show');
  return !d && document.getElementById('sheet').hidden && !nav.hidden;
}
/* keep the button just above the bottom bar (phone) or in the corner (tablet), inside the app column */
function place() {
  var r = app.getBoundingClientRect(), tab = innerWidth >= 768;
  var navH = tab ? 0 : nav.offsetHeight;
  var ins = document.getElementById('foot');
  var footH = ins && !ins.hidden ? ins.offsetHeight : 0;
  document.documentElement.style.setProperty('--sfab-b', (navH + footH + 12) + 'px');
  document.documentElement.style.setProperty('--sfab-r', Math.max(10, innerWidth - r.right + 12) + 'px');
}
function sync() { place(); fab.hidden = !calm(); }
setInterval(sync, 700);
addEventListener('resize', sync); addEventListener('hashchange', function () { setTimeout(sync, 60); });
var st = 0, lastY = 0;
view.addEventListener('scroll', function () {
  var y = view.scrollTop;
  if (y > lastY + 6 && y > 80) fab.classList.add('away'); else if (y < lastY - 6) fab.classList.remove('away');
  lastY = y; clearTimeout(st); st = setTimeout(function () { fab.classList.remove('away'); }, 900);
}, { passive: true });
sync();

/* ---- reminder after one minute of use ---- */
var seen = false; try { seen = !!sessionStorage.getItem(KEY_SEEN); } catch (e) { }
var quiet = false; try { var d = +localStorage.getItem(KEY_DONE) || 0; quiet = d && Date.now() - d < QUIET_DAYS * 864e5; } catch (e) { }
if (seen || quiet) return;

var used = 0, card = null;
setInterval(function () { if (!document.hidden) used += 1000; if (!seen && used >= WAIT && calm() && !card) showCard(); }, 1000);

function showCard() {
  seen = true; try { sessionStorage.setItem(KEY_SEEN, '1'); } catch (e) { }
  place();
  card = document.createElement('div'); card.className = 'snudge'; card.setAttribute('role', 'status');
  card.innerHTML = '<span class="nlm" style="--s:38px" aria-hidden="true">NL</span>' +
    '<div class="sn-t"><b>Enjoying the app?</b><span>Share it with friends preparing for law exams and help us grow.</span></div>' +
    '<div class="sn-b"><button type="button" class="sn-go">Share</button><button type="button" class="sn-x">Not now</button></div>';
  document.body.appendChild(card);
  requestAnimationFrame(function () { card.classList.add('on'); });
  var t = setTimeout(hide, 20000);
  function hide() { clearTimeout(t); if (!card) return; card.classList.remove('on'); var c = card; card = null; setTimeout(function () { c.remove(); }, 260); }
  card.querySelector('.sn-go').addEventListener('click', function () { hide(); openShare(); });
  card.querySelector('.sn-x').addEventListener('click', hide);
}
})();
