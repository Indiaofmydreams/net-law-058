/* nl-welcome-promo.js: a big "Welcome" box that appears the moment the disclaimer is closed.
   - Shows the highlights of NET Law-Verse and invites the visitor to follow on Instagram and to sign up for study updates.
   - Stays for 25 seconds with a visible countdown ring, and can be closed at any time (button, backdrop click or Esc).
   - "Get study updates" closes this box and opens the existing study-updates form (nl-lead-float.js). Nothing is duplicated.
   - Shown once per visit (sessionStorage), same rhythm as the disclaimer. A new visit / fresh launch shows it again.
   - Does not touch disclaimer.js, disclaimer.css, nl-follow-float.js or nl-lead-float.js. It only watches the disclaimer
     (.tm-back) and starts when that disclaimer is no longer showing. */
(function () {
  if (window.__nlw) return; window.__nlw = 1;
  try { if (top !== self) return; } catch (e) { return; }
  if (/bot|crawl|spider|slurp|lighthouse|inspectiontool|google-read-aloud|mediapartners/i.test(navigator.userAgent)) return;

  var URL = 'https://www.instagram.com/netlawverse/', QR = '/instagram-qr.png', KEY = 'nlw-seen', SECS = 25;
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}

  var css =
    '.nlw-back{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:16px;background:rgba(20,24,58,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;visibility:hidden;transition:opacity .35s,visibility .35s;font-family:"Manrope",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#14183a}' +
    '.nlw-back.show{opacity:1;visibility:visible}' +
    '.nlw-back *{box-sizing:border-box}' +
    '.nlw{position:relative;width:min(860px,100%);max-height:calc(100vh - 32px);max-height:calc(100dvh - 32px);overflow:auto;background:#fff;border:3px solid #14183a;border-radius:26px;box-shadow:8px 8px 0 #ff5d8f;transform:translateY(20px) scale(.97);transition:transform .45s cubic-bezier(.2,.8,.2,1)}' +
    '.show .nlw{transform:none}' +
    '.nlw-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px 14px 20px;background:#14183a;color:#fff}' +
    '.nlw-brand{display:flex;align-items:center;gap:10px;font-weight:800;letter-spacing:-.01em;font-size:1rem}' +
    '.nlw-brand i{font-style:normal;width:34px;height:34px;border-radius:10px;background:#ffd23f;color:#14183a;display:grid;place-items:center;font-weight:800;font-size:.85rem}' +
    '.nlw-brand small{display:block;font-weight:700;font-size:.72rem;opacity:.75;letter-spacing:0}' +
    '.nlw-ctl{display:flex;align-items:center;gap:12px}' +
    '.nlw-tm{display:flex;align-items:center;gap:8px;font-weight:700;font-size:.78rem;opacity:.95}' +
    '.nlw-ring{position:relative;width:42px;height:42px;flex:none}' +
    '.nlw-ring svg{width:42px;height:42px;transform:rotate(-90deg)}' +
    '.nlw-ring circle{fill:none;stroke-width:4}' +
    '.nlw-ring .bg{stroke:rgba(255,255,255,.22)}' +
    '.nlw-ring .fg{stroke:#ffd23f;stroke-linecap:round;stroke-dasharray:113.1;stroke-dashoffset:0}' +
    '.nlw-ring b{position:absolute;inset:0;display:grid;place-items:center;font-size:.95rem;font-weight:800;color:#fff}' +
    '.nlw-x{display:inline-flex;align-items:center;gap:6px;font:inherit;font-weight:800;font-size:.82rem;color:#14183a;background:#fff;border:2.5px solid #fff;border-radius:999px;padding:7px 14px;cursor:pointer;transition:background .15s}' +
    '.nlw-x:hover{background:#ffd23f;border-color:#ffd23f}' +
    '.nlw-x:focus-visible,.nlw a:focus-visible,.nlw-up:focus-visible{outline:3px solid #ffd23f;outline-offset:2px}' +
    '.nlw-bar{height:5px;background:#e9ebf7}' +
    '.nlw-bar span{display:block;height:100%;width:100%;background:linear-gradient(90deg,#ff5d8f,#ffd23f);transform-origin:left center}' +
    '.nlw-body{display:grid;grid-template-columns:1.25fr 1fr;gap:22px;padding:24px}' +
    '.nlw-kick{display:inline-block;background:#ffd23f;border:2.5px solid #14183a;border-radius:999px;font-weight:800;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;padding:3px 11px;margin-bottom:10px}' +
    '.nlw h2{margin:0 0 6px;font-size:clamp(1.45rem,3.2vw,2.05rem);line-height:1.12;font-weight:800;letter-spacing:-.03em}' +
    '.nlw h2 em{font-style:normal;background:#ffd23f;padding:0 .18em;border-radius:8px}' +
    '.nlw-sub{margin:0 0 14px;font-size:.95rem;line-height:1.45;font-weight:700;opacity:.8}' +
    '.nlw ul{list-style:none;margin:0;padding:12px 14px;display:grid;gap:9px;background:#effcf6;border:2.5px solid #14183a;border-radius:16px}' +
    '.nlw li{display:flex;gap:10px;align-items:flex-start;font-size:.9rem;line-height:1.35;font-weight:700}' +
    '.nlw li svg{width:20px;height:20px;flex:none;margin-top:0;color:#14183a;background:#2ec4b6;border-radius:50%;padding:3px}' +
    '.nlw li b{font-weight:800}' +
    '.nlw-side{display:flex;flex-direction:column;gap:12px}' +
    '.nlw-ig{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;background:#fff4f8;border:2.5px solid #14183a;border-radius:18px;padding:14px 14px 16px;box-shadow:4px 4px 0 #14183a}' +
    '.nlw-ig h3{margin:0;font-size:1.05rem;font-weight:800;letter-spacing:-.02em;line-height:1.2}' +
    '.nlw-ig p{margin:0;font-size:.82rem;line-height:1.4;font-weight:700;opacity:.8}' +
    '.nlw-qr{width:112px;height:auto;border-radius:12px;border:2.5px solid #14183a;background:#fff;display:block}' +
    '.nlw-follow{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;text-decoration:none;font-weight:800;font-size:.95rem;color:#fff;background:linear-gradient(135deg,#ff2f7e,#a22bd6 60%,#7a35e8);border:3px solid #14183a;border-radius:14px;padding:10px 14px;box-shadow:3px 3px 0 #14183a;transition:transform .15s,box-shadow .15s}' +
    '.nlw-follow:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 #14183a}' +
    '.nlw-follow svg{width:18px;height:18px}' +
    '.nlw-up{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;font:inherit;font-weight:800;font-size:1.08rem;color:#14183a;background:#ffd23f;border:3px solid #14183a;border-radius:16px;padding:14px 14px;cursor:pointer;box-shadow:5px 5px 0 #ff5d8f;transition:transform .15s,box-shadow .15s,background .15s;animation:nlwpulse 2.2s ease-in-out infinite}' +
    '.nlw-up:hover{background:#ffe066;transform:translate(-1px,-1px);box-shadow:7px 7px 0 #ff5d8f;animation:none}' +
    '.nlw-up:active{transform:translate(3px,3px);box-shadow:2px 2px 0 #ff5d8f}' +
    '@keyframes nlwpulse{0%,100%{transform:none}50%{transform:translateY(-3px)}}' +
    '.nlw-up svg{width:22px;height:22px}' +
    '.nlw-up small{display:block;font-size:.74rem;font-weight:700;opacity:.8}' +
    '.nlw-up[hidden]{display:none}' +
    '.nlw-note{margin:0;text-align:center;font-size:.72rem;font-weight:700;opacity:.65}' +
    '@media (hover:none),(max-width:700px){.nlw-qr{display:none}}' +
    '@media (max-width:700px){.nlw-body{grid-template-columns:1fr;gap:16px;padding:18px 16px}.nlw-tm span{display:none}.nlw-brand small{display:none}.nlw{border-radius:22px;box-shadow:5px 5px 0 #ff5d8f}}' +
    '@media (prefers-reduced-motion:reduce){.nlw-back,.nlw{transition:none}.nlw-up{animation:none}}' +
    '@media print{.nlw-back{display:none}}';

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var tick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var ig = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5.2"/><circle cx="12" cy="12" r="4.1"/><circle cx="17.3" cy="6.7" r=".6" fill="currentColor"/></svg>';
  var mail = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7.5l8 6 8-6"/></svg>';

  var back = document.createElement('div');
  back.className = 'nlw-back'; back.setAttribute('role', 'dialog'); back.setAttribute('aria-modal', 'true'); back.setAttribute('aria-labelledby', 'nlw-t');
  back.innerHTML =
    '<div class="nlw">' +
      '<div class="nlw-top">' +
        '<div class="nlw-brand"><i>NL</i><div>NET Law-Verse<small>The universe of law</small></div></div>' +
        '<div class="nlw-ctl">' +
          '<div class="nlw-tm" aria-live="off"><span>Closing in</span><div class="nlw-ring"><svg viewBox="0 0 42 42" aria-hidden="true"><circle class="bg" cx="21" cy="21" r="18"/><circle class="fg" cx="21" cy="21" r="18"/></svg><b class="nlw-sec">' + SECS + '</b></div></div>' +
          '<button type="button" class="nlw-x" aria-label="Close this box">Close ✕</button>' +
        '</div>' +
      '</div>' +
      '<div class="nlw-bar" aria-hidden="true"><span></span></div>' +
      '<div class="nlw-body">' +
        '<div>' +
          '<span class="nlw-kick">Welcome</span>' +
          '<h2 id="nlw-t">Your law exams, <em>sorted.</em></h2>' +
          '<p class="nlw-sub">Everything for UGC NET and CLAT PG in one free place. Here is what you get:</p>' +
          '<ul>' +
            '<li>' + tick + '<span><b>100% free, no sign-up</b> to start practising</span></li>' +
            '<li>' + tick + '<span><b>UGC NET Paper 1 and Law (058):</b> notes, MCQs, previous-year questions and mock tests</span></li>' +
            '<li>' + tick + '<span><b>CLAT PG:</b> 6 full mock papers, a 705-case Case Law Vault, syllabus tracker and study plans</span></li>' +
            '<li>' + tick + '<span><b>Exam alerts and new papers</b> reach our followers first</span></li>' +
          '</ul>' +
        '</div>' +
        '<div class="nlw-side">' +
          '<div class="nlw-ig">' +
            '<h3>Follow @netlawverse</h3>' +
            '<p>New mocks, exam dates and notifications land on Instagram first.</p>' +
            '<img class="nlw-qr" src="' + QR + '" width="640" height="735" alt="QR code for the NET Law-Verse Instagram profile" loading="lazy">' +
            '<a class="nlw-follow" href="' + URL + '" target="_blank" rel="noopener noreferrer">' + ig + 'Follow on Instagram</a>' +
          '</div>' +
          '<button type="button" class="nlw-up">' + mail + '<span>Get free study updates<small>Takes 20 seconds</small></span></button>' +
          '<p class="nlw-note">Study updates only, never sold or shared.</p>' +
        '</div>' +
      '</div>' +
    '</div>';

  var timer = 0, shown = false, lastFocus = null;
  function markSeen() { try { sessionStorage.setItem(KEY, '' + Date.now()); } catch (e) {} }

  function close() {
    if (!shown) return; shown = false;
    clearInterval(timer);
    document.removeEventListener('keydown', onKey, true);
    back.classList.remove('show');
    document.body.style.overflow = '';
    setTimeout(function () { back.remove(); }, 450);
    try { if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
    if (e.key === 'Tab') {   /* keep keyboard focus inside the box while it is open */
      var f = back.querySelectorAll('a[href],button:not([hidden])'); if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  }

  function openLeadForm() {
    close();
    /* hand over to the existing study-updates form; wait a beat so the click that got us here finishes first */
    setTimeout(function () {
      var box = document.querySelector('.nll'), tab = box && box.querySelector('.nll-tab');
      if (!tab) return;
      box.classList.add('on');
      if (!box.classList.contains('open')) tab.click();
    }, 120);
  }

  function show() {
    if (shown) return; shown = true; markSeen();
    lastFocus = document.activeElement;
    document.body.appendChild(back);

    var up = back.querySelector('.nlw-up');
    if (!document.querySelector('.nll')) up.hidden = true;   /* already signed up, or hidden for this visit: Instagram only */

    var sec = back.querySelector('.nlw-sec'), fg = back.querySelector('.fg'), bar = back.querySelector('.nlw-bar span');
    var C = 113.1, t0 = Date.now(), total = SECS * 1000;
    function paint() {
      var el = Date.now() - t0, left = Math.max(0, total - el);
      sec.textContent = Math.ceil(left / 1000);
      fg.style.strokeDashoffset = (C * (el / total)).toFixed(2);
      bar.style.transform = 'scaleX(' + (left / total).toFixed(4) + ')';
      if (left <= 0) close();
    }
    paint(); timer = setInterval(paint, 100);

    back.querySelector('.nlw-x').onclick = close;
    up.onclick = openLeadForm;
    back.querySelector('.nlw-follow').addEventListener('click', function () { setTimeout(close, 150); });
    back.onclick = function (e) { if (e.target === back) close(); };
    document.addEventListener('keydown', onKey, true);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { requestAnimationFrame(function () { back.classList.add('show'); back.querySelector('.nlw-x').focus({ preventScroll: true }); }); });
  }

  /* Watch the disclaimer (.tm-back). Once it has been showing and is then closed, start. If it never shows
     (already agreed earlier in this visit), start shortly after the page is ready. */
  var sawDisc = false, t0 = Date.now(), poll = 0, done = false;
  function start(delay) { if (done) return; done = true; clearInterval(poll); setTimeout(show, delay); }
  function check() {
    var d = document.querySelector('.tm-back'), on = !!(d && d.classList.contains('show'));
    if (on) { sawDisc = true; return; }
    if (sawDisc) { start(450); return; }                       /* disclaimer just closed */
    if (Date.now() - t0 > 2500) start(600);                    /* disclaimer did not appear this visit */
  }
  function init() { poll = setInterval(check, 150); }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
