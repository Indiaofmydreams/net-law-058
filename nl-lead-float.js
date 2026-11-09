/* nl-lead-float.js: an optional, floating "get study updates" box that sends name, phone and email to a Google Form.
   - Desktop (mouse): a small tab sits bottom-right, above the Theme bar. When the pointer (or keyboard focus) rests on it,
     it opens into a short call to action, the reasons to share contact details, and the form.
   - Phone / touch: tap the tab and the form opens as a bottom sheet. There is no hover on a phone.
   - Submitting posts straight to your Google Form (see GOOGLE-FORM-SETUP.txt). Responses land in the form's Sheet.
   - "Not now" hides it for the current visit only; it returns on the next launch. After a successful sign-up it never shows again on that browser.
   - Not loaded on mock-exam pages, so it never distracts mid-paper.

   CONFIG: set formId and the three entry ids below (or define window.NL_LEAD_CONFIG before this script loads).
   While formId is empty the box runs in DEMO mode: everything works, but nothing is sent. */
(function () {
  if (window.__nll) return; window.__nll = 1;

  var DEFAULTS = {
    formId: '1FAIpQLSd08rgfuPH3bHFPixKVbHAmH_yTt9nEvjnhst06rQP-Z9NS9g',                       // the long id in https://docs.google.com/forms/d/e/<formId>/viewform
    fields: {                         // Google Form question ids, e.g. 'entry.1234567890'
      name:   'entry.928581150',
      phone:  'entry.20635590',
      email:  'entry.712394518',
      source: 'entry.729727756'                      // optional: a 4th short-answer question that records which page they signed up on
    },
    contact: 'netlawverse@gmail.com', // shown in the privacy note (where people can ask for deletion)
    hideDays: 3,                      // "Not now" hides the box for this many days
    appearAfter: 3500,                // ms before the tab slides in
    storagePrefix: 'nll'
  };

  var user = window.NL_LEAD_CONFIG || {};
  var CFG = {};
  for (var k in DEFAULTS) CFG[k] = (user[k] !== undefined) ? user[k] : DEFAULTS[k];
  CFG.fields = {};
  for (var f in DEFAULTS.fields) CFG.fields[f] = (user.fields && user.fields[f]) || DEFAULTS.fields[f];

  var DEMO = !CFG.formId;
  /* Safety: until a Google Form id is set, stay invisible to real visitors (so nobody types details that are never saved).
     Demo mode only shows when a page sets window.NL_LEAD_CONFIG = { demo: true } (the sample page does). */
  if (DEMO && !user.demo) return;
  var KEY_CLOSED = CFG.storagePrefix + '-closed', KEY_DONE = CFG.storagePrefix + '-done';
  var HIDE = CFG.hideDays * 864e5;

  try {
    if (localStorage.getItem(KEY_DONE)) return;
    if (sessionStorage.getItem(KEY_CLOSED)) return;   // closed during this visit only; it comes back on the next launch
  } catch (e) {}

  var fine = false;
  try { fine = matchMedia('(hover:hover) and (pointer:fine)').matches && innerWidth > 700; } catch (e) {}

  var css = [
    '.nll{position:fixed;right:14px;bottom:var(--nll-b,76px);z-index:19;font-family:"Manrope",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#14183a;opacity:0;transform:translateY(14px);transition:opacity .4s,transform .4s;pointer-events:none}',
    '.nll.on{opacity:1;transform:none;pointer-events:auto}',
    '.nll.open{z-index:60}',
    '.nll *{box-sizing:border-box}',

    /* collapsed tab */
    '.nll-tab{display:flex;align-items:center;gap:10px;background:#fff;color:#14183a;border:3px solid #14183a;border-radius:20px;padding:9px 16px 9px 10px;cursor:pointer;font:inherit;font-weight:800;font-size:.92rem;letter-spacing:-.01em;box-shadow:4px 4px 0 #14183a;transition:box-shadow .2s,transform .2s;position:relative}',
    '.nll-tab:hover{box-shadow:6px 6px 0 #ff5d8f;transform:translate(-1px,-1px)}',
    '.nll-tab i{width:30px;height:30px;border-radius:10px;background:#2ec4b6;border:2.5px solid #14183a;display:grid;place-items:center;flex:none}',
    '.nll-tab svg{width:16px;height:16px}',
    '.nll-tab small{display:block;font-size:.7rem;font-weight:700;opacity:.7;letter-spacing:0;line-height:1.1}',
    '.nll-tab b{display:block;line-height:1.15;font-weight:800}',
    '.nll-dot{position:absolute;top:-7px;right:-7px;background:#ff5d8f;color:#14183a;border:2.5px solid #14183a;border-radius:999px;font-size:.58rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:1px 7px}',

    /* expanded panel */
    '.nll-panel{position:absolute;right:0;bottom:0;width:318px;max-height:calc(100vh - var(--nll-b,76px) - 14px);overflow-y:auto;overscroll-behavior:contain;background:#fff;border:3px solid #14183a;border-radius:22px;padding:14px 16px 8px;box-shadow:6px 6px 0 #ff5d8f;transform-origin:bottom right;transform:scale(.9) translateY(10px);opacity:0;visibility:hidden;transition:transform .22s ease,opacity .18s,visibility 0s .22s}',
    '.nll.open .nll-panel{transform:none;opacity:1;visibility:visible;transition:transform .22s ease,opacity .18s,visibility 0s}',
    '.nll.open .nll-tab{opacity:0;pointer-events:none}',
    '.nll-x{position:absolute;top:10px;right:10px;width:28px;height:28px;border-radius:50%;border:2.5px solid #14183a;background:#fff;color:#14183a;font:800 .8rem/1 inherit;cursor:pointer;display:grid;place-items:center;padding:0}',
    '.nll-x:hover{background:#ffd23f}',
    '.nll-kick{display:none;background:#14183a;color:#fff;font-size:.66rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:3px 10px;border-radius:999px;margin-bottom:8px}',
    '.nll h2{margin:0 34px 4px 0;font-size:1.15rem;line-height:1.18;font-weight:800;letter-spacing:-.025em}',
    '.nll-sub{margin:0 0 8px;font-size:.82rem;line-height:1.35;font-weight:700;opacity:.8}',
    '.nll ul{list-style:none;margin:0 0 10px;padding:8px 10px;background:#effcf6;border:2px solid #14183a;border-radius:14px;display:grid;gap:5px}',
    '.nll li{display:flex;gap:8px;align-items:flex-start;font-size:.78rem;line-height:1.3;font-weight:700}',
    '.nll li svg{width:16px;height:16px;flex:none;margin-top:1px;color:#14183a;background:#2ec4b6;border-radius:50%;padding:2px}',

    /* form */
    '.nll form{display:grid;gap:7px;margin:0}',
    '.nll label{display:grid;gap:3px;font-size:.74rem;font-weight:800;letter-spacing:.02em}',
    '.nll input[type=text],.nll input[type=tel],.nll input[type=email]{width:100%;font:inherit;font-size:16px;font-weight:700;color:#14183a;background:#fff;border:2.5px solid #14183a;border-radius:11px;padding:7px 11px;outline:0;transition:box-shadow .15s,border-color .15s}',
    '.nll input::placeholder{color:#14183a;opacity:.38;font-weight:600}',
    '.nll input:focus{box-shadow:0 0 0 3px #ffd23f}',
    '.nll input[aria-invalid=true]{border-color:#d6246e;box-shadow:0 0 0 3px #ffd6e6}',
    '.nll-hp{position:absolute!important;left:-9999px!important;width:1px;height:1px;opacity:0;pointer-events:none}',
    '.nll-ck{display:flex!important;grid-template-columns:none;gap:8px!important;align-items:flex-start;font-size:.74rem!important;font-weight:700!important;letter-spacing:0!important;line-height:1.35;cursor:pointer}',
    '.nll-ck input{flex:none;width:18px;height:18px;margin:1px 0 0;accent-color:#14183a;cursor:pointer}',
    '.nll-err{min-height:0;margin:0;font-size:.78rem;font-weight:800;color:#b3125a;line-height:1.35}',
    '.nll-err:empty{display:none}',
    '.nll-go{font:inherit;font-weight:800;font-size:.95rem;color:#fff;background:#14183a;border:3px solid #14183a;border-radius:14px;padding:9px 14px;cursor:pointer;box-shadow:3px 3px 0 #ff5d8f;transition:transform .15s,box-shadow .15s}',
    '.nll-go:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 #ff5d8f}',
    '.nll-go:active{transform:translate(2px,2px);box-shadow:1px 1px 0 #ff5d8f}',
    '.nll-go[disabled]{opacity:.6;cursor:progress;transform:none}',
    '.nll-fine{margin:8px 0 0;font-size:.68rem;line-height:1.4;font-weight:700;opacity:.7}',
    '.nll-fine a{color:inherit;font-weight:800}',
    '.nll-later{display:block;margin:6px auto 0;background:none;border:0;font:inherit;font-weight:800;font-size:.74rem;color:#14183a;opacity:.65;cursor:pointer;text-decoration:underline;padding:4px}',
    '.nll-later:hover{opacity:1}',

    /* success */
    '.nll-ok{display:none;text-align:center;padding:12px 4px 6px}',
    '.nll.done .nll-ok{display:block}',
    '.nll.done .nll-form-view{display:none}',
    '.nll-ok .nll-tick{width:58px;height:58px;margin:0 auto 10px;border-radius:50%;background:#2ec4b6;border:3px solid #14183a;display:grid;place-items:center;box-shadow:3px 3px 0 #14183a}',
    '.nll-ok .nll-tick svg{width:28px;height:28px}',
    '.nll-ok h2{margin:0 0 6px}',
    '.nll-ok p{margin:0;font-size:.88rem;line-height:1.45;font-weight:700;opacity:.8}',

    '.nll-demo{margin:8px 0 0;font-size:.68rem;font-weight:800;background:#ffd23f;border:2px solid #14183a;border-radius:9px;padding:3px 8px;text-align:center}',

    /* phone / touch: bottom sheet */
    '.nll-bd{display:none}',
    '@media (hover:none),(max-width:700px){',
      '.nll{right:12px;bottom:var(--nll-b-m,122px)}',
      '.nll-tab{padding:8px 14px 8px 8px;box-shadow:3px 3px 0 #14183a}',
      '.nll-tab small{display:none}',
      '.nll-panel{position:fixed;left:10px;right:10px;bottom:10px;width:auto;max-width:440px;margin:0 auto;max-height:calc(100vh - 20px);max-height:calc(100dvh - 20px);transform-origin:bottom center}',
      '.nll.open .nll-bd{display:block;position:fixed;inset:0;background:rgba(20,24,58,.5);z-index:-1}',
    '}',
    '@media (prefers-reduced-motion:reduce){.nll,.nll-tab,.nll-panel,.nll-go{transition:none!important}}',
    '@media print{.nll{display:none}}'
  ].join('');

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var tick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var mail = '<svg viewBox="0 0 24 24" fill="none" stroke="#14183a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7.5l8 6 8-6"/></svg>';
  var uid = 'nll' + Math.floor(Math.random() * 1e5);

  var el = document.createElement('aside');
  el.className = 'nll';
  el.setAttribute('aria-label', 'Get free study updates from NET Law-Verse');
  el.innerHTML =
    '<div class="nll-bd" aria-hidden="true"></div>' +
    '<button type="button" class="nll-tab" aria-expanded="false" aria-controls="' + uid + '-p">' +
      '<span class="nll-dot">Free</span><i>' + mail + '</i>' +
      '<span><b>Get study updates</b><small>Takes 20 seconds</small></span>' +
    '</button>' +
    '<div class="nll-panel" id="' + uid + '-p" role="dialog" aria-labelledby="' + uid + '-h">' +
      '<button type="button" class="nll-x" aria-label="Close this box">✕</button>' +
      '<div class="nll-form-view">' +
                '<h2 id="' + uid + '-h">Don’t miss a thing before the exam.</h2>' +
        '<p class="nll-sub">Free to join. Be first to know about every update.</p>' +
        '<ul>' +
          '<li>' + tick + '<span>Exam date and notification alerts the moment they are out</span></li>' +
          '<li>' + tick + '<span>A heads-up when new mock tests and notes go live</span></li>' +
          '<li>' + tick + '<span>First access to new sections for your exam</span></li>' +
        '</ul>' +
        '<form novalidate autocomplete="on">' +
          '<label>Your name<input type="text" name="nll_name" autocomplete="name" placeholder="e.g. Aarav Sharma" maxlength="80" required></label>' +
          '<label>Phone number<input type="tel" name="nll_phone" autocomplete="tel" inputmode="tel" placeholder="10-digit mobile number" maxlength="18" required></label>' +
          '<label>Email id<input type="email" name="nll_email" autocomplete="email" inputmode="email" placeholder="you@example.com" maxlength="120" required></label>' +
          '<label class="nll-hp" aria-hidden="true">Leave this empty<input type="text" name="nll_website" tabindex="-1" autocomplete="off"></label>' +
          '<label class="nll-ck"><input type="checkbox" name="nll_ok"><span>I agree to NET Law-Verse using these details to send me study updates.</span></label>' +
          '<p class="nll-err" role="alert" aria-live="polite"></p>' +
          '<button type="submit" class="nll-go">Send me updates</button>' +
        '</form>' +
        '<p class="nll-fine">Study updates only, never sold or shared. To delete your details any time, email <a href="mailto:' + CFG.contact + '">' + CFG.contact + '</a>.</p>' +
        (DEMO ? '<p class="nll-demo">DEMO MODE: nothing is sent until you add the Google Form id.</p>' : '') +
        '<button type="button" class="nll-later">Not now, hide this</button>' +
      '</div>' +
      '<div class="nll-ok" role="status" aria-live="polite">' +
        '<div class="nll-tick">' + tick + '</div>' +
        '<h2>You’re on the list!</h2>' +
        '<p>Thank you, <span class="nll-nm"></span>. Watch your phone and inbox for the next update.</p>' +
      '</div>' +
    '</div>';

  var tab, panel, form, errEl, goBtn, dirty = false, hoverT = 0, leaveT = 0, openedAt = 0, quiet = false;
  function refocus() { quiet = true; tab.focus({ preventScroll: true }); setTimeout(function () { quiet = false; }, 50); }

  function setOpen(on) {
    clearTimeout(hoverT); clearTimeout(leaveT);
    if (on === el.classList.contains('open')) return;
    el.classList.toggle('open', on);
    tab.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on) { openedAt = Date.now(); if (!fine) setTimeout(function () { var n = form.nll_name; n && n.focus({ preventScroll: true }); }, 260); }
  }
  function hide(days) {
    el.classList.remove('on', 'open');
    try { (days === 'done' ? localStorage : sessionStorage).setItem(days === 'done' ? KEY_DONE : KEY_CLOSED, '' + Date.now()); } catch (e) {}
    setTimeout(function () { el.remove(); }, 450);
  }

  /* validation */
  function cleanPhone(v) {
    var d = String(v).replace(/[\s\-().]/g, '');
    if (/^\+?91/.test(d) && d.replace(/\D/g, '').length === 12) d = d.replace(/^\+?91/, '');
    else if (/^0\d{10}$/.test(d)) d = d.slice(1);
    return d;
  }
  function validate() {
    var name = form.nll_name.value.trim(), phone = cleanPhone(form.nll_phone.value), email = form.nll_email.value.trim(), bad = null, msg = '';
    ['nll_name', 'nll_phone', 'nll_email'].forEach(function (n) { form[n].removeAttribute('aria-invalid'); });
    if (name.length < 2) { bad = form.nll_name; msg = 'Please enter your name.'; }
    else if (!/^[6-9]\d{9}$/.test(phone)) { bad = form.nll_phone; msg = 'Please enter a valid 10-digit Indian mobile number.'; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { bad = form.nll_email; msg = 'Please enter a valid email id.'; }
    else if (!form.nll_ok.checked) { bad = form.nll_ok; msg = 'Please tick the box so we know you are happy to hear from us.'; }
    if (bad) { errEl.textContent = msg; if (bad.type !== 'checkbox') bad.setAttribute('aria-invalid', 'true'); bad.focus(); return null; }
    errEl.textContent = '';
    return { name: name, phone: phone, email: email };
  }

  function send(d) {
    if (DEMO) { try { console.info('[nl-lead-float] DEMO: would send', d); } catch (e) {} return new Promise(function (r) { setTimeout(r, 700); }); }
    var body = new URLSearchParams();
    if (CFG.fields.name)   body.append(CFG.fields.name, d.name);
    if (CFG.fields.phone)  body.append(CFG.fields.phone, d.phone);
    if (CFG.fields.email)  body.append(CFG.fields.email, d.email);
    if (CFG.fields.source) body.append(CFG.fields.source, location.pathname || '/');
    /* no-cors: Google answers with an opaque response, so a resolved promise means the request left the browser. */
    return fetch('https://docs.google.com/forms/d/e/' + CFG.formId + '/formResponse', { method: 'POST', mode: 'no-cors', body: body });
  }

  function onSubmit(e) {
    e.preventDefault();
    if (form.nll_website.value) { hide('done'); return; }             // honeypot: a bot filled the hidden field
    var d = validate(); if (!d) return;
    goBtn.disabled = true; goBtn.textContent = 'Sending…';
    send(d).then(function () {
      el.querySelector('.nll-nm').textContent = d.name.split(/\s+/)[0];
      el.classList.add('done');
      try { localStorage.setItem(KEY_DONE, '' + Date.now()); } catch (er) {}
      setTimeout(function () { hide('done'); }, 7000);
    }).catch(function () {
      goBtn.disabled = false; goBtn.textContent = 'Send me updates';
      errEl.textContent = 'Could not send. Please check your internet connection and try again.';
    });
  }

  function add() {
    document.body.appendChild(el);
    tab = el.querySelector('.nll-tab'); panel = el.querySelector('.nll-panel');
    form = el.querySelector('form'); errEl = el.querySelector('.nll-err'); goBtn = el.querySelector('.nll-go');

    tab.addEventListener('click', function () { setOpen(!el.classList.contains('open')); });
    el.querySelector('.nll-x').onclick = function () { setOpen(false); refocus(); };
    el.querySelector('.nll-later').onclick = function () { hide(); };
    el.querySelector('.nll-bd').onclick = function () { if (!dirty) setOpen(false); };
    form.addEventListener('submit', onSubmit);
    form.addEventListener('input', function () { dirty = true; });

    /* desktop: open on hover or keyboard focus, with a short delay so a passing cursor does not trigger it */
    if (fine) {
      el.addEventListener('mouseenter', function () { clearTimeout(leaveT); hoverT = setTimeout(function () { setOpen(true); }, 130); });
      el.addEventListener('mouseleave', function () {
        clearTimeout(hoverT);
        leaveT = setTimeout(function () { if (!dirty && !el.contains(document.activeElement)) setOpen(false); }, 450);
      });
    }
    tab.addEventListener('focus', function () { if (fine && !quiet) setOpen(true); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Escape' && el.classList.contains('open')) { setOpen(false); refocus(); } });
    document.addEventListener('click', function (e) { if (el.classList.contains('open') && !dirty && !el.contains(e.target)) setOpen(false); });

    setTimeout(function () { el.classList.add('on'); }, CFG.appearAfter);
  }
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
})();
