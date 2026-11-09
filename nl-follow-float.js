/* nl-follow-float.js: a small floating Instagram QR on the site's reading pages.
   - Desktop (mouse): a compact QR tile sits bottom-left. Only when the pointer (or keyboard focus) is on it does it
     open into a short call to action. Clicking it opens the profile.
   - Phone / narrow screen: a QR cannot be scanned from the same screen, so a small "Follow" pill links straight to the profile.
   - The close button hides it for the current visit only; it returns on the next launch. Not loaded on mock-exam pages, so it never distracts mid-paper. */
(function () {
  if (window.__nlq) return; window.__nlq = 1;
  var URL = 'https://www.instagram.com/netlawverse/', QR = '/instagram-qr.png', KEY = 'nlq-closed', HIDE = 3 * 864e5;
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}   /* closed during this visit only; returns on the next launch */

  var css =
    '.nlq{position:fixed;left:14px;bottom:14px;z-index:19;font-family:"Manrope",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#14183a;opacity:0;transform:translateY(14px);transition:opacity .4s,transform .4s;pointer-events:none}' +
    '.nlq.on{opacity:1;transform:none;pointer-events:auto}' +
    '.nlq *{box-sizing:border-box}' +
    '.nlq-card{display:block;width:92px;background:#fff;border:3px solid #14183a;border-radius:20px;padding:7px;text-decoration:none;color:inherit;box-shadow:4px 4px 0 #14183a;overflow:hidden;transition:width .25s ease,box-shadow .2s,transform .2s;position:relative}' +
    '.nlq-txt{display:block;max-height:0;opacity:0;overflow:hidden;transition:max-height .25s ease,opacity .2s,margin .25s}' +
    '.nlq-txt b{display:block;font-size:1.02rem;font-weight:800;letter-spacing:-.02em;line-height:1.2;margin-bottom:3px}' +
    '.nlq-txt span{display:block;font-size:.84rem;line-height:1.4;font-weight:700;opacity:.8}' +
    '.nlq-img{display:block;width:100%;height:auto;border-radius:12px}' +
    '.nlq-go{display:block;max-height:0;opacity:0;overflow:hidden;transition:max-height .25s ease,opacity .2s,margin .25s;margin-top:0;background:#14183a;color:#fff;border-radius:11px;text-align:center;font-weight:800;font-size:.84rem;padding:0 8px}' +
    '.nlq-tag{position:absolute;top:-1px;left:50%;transform:translateX(-50%);background:#ff5d8f;color:#14183a;font-weight:800;font-size:.62rem;letter-spacing:.04em;text-transform:uppercase;padding:2px 9px;border:2px solid #14183a;border-radius:0 0 9px 9px;transition:opacity .15s}' +
    '.nlq-card{padding-top:16px}' +
    '.nlq:hover .nlq-card,.nlq:focus-within .nlq-card{width:238px;box-shadow:6px 6px 0 #ff5d8f}' +
    '.nlq:hover .nlq-txt,.nlq:focus-within .nlq-txt{max-height:120px;opacity:1;margin:0 3px 8px}' +
    '.nlq:hover .nlq-go,.nlq:focus-within .nlq-go{max-height:40px;opacity:1;margin-top:8px;padding:8px}' +
    '.nlq:hover .nlq-tag,.nlq:focus-within .nlq-tag{opacity:0}' +
    '.nlq-x{position:absolute;top:-10px;right:-10px;width:26px;height:26px;border-radius:50%;border:2.5px solid #14183a;background:#fff;color:#14183a;font:800 .8rem/1 inherit;cursor:pointer;display:none;place-items:center;padding:0;z-index:2}' +
    '.nlq:hover .nlq-x,.nlq:focus-within .nlq-x{display:grid}' +
    '.nlq-x:hover{background:#ffd23f}' +
    '.nlq-pill{display:none;align-items:center;gap:8px;text-decoration:none;color:#14183a;background:#fff;border:3px solid #14183a;border-radius:999px;padding:8px 14px 8px 10px;font-weight:800;font-size:.86rem;box-shadow:3px 3px 0 #14183a}' +
    '.nlq-pill i{width:24px;height:24px;border-radius:8px;display:grid;place-items:center;background:linear-gradient(135deg,#ff2f7e,#a22bd6 60%,#7a35e8);color:#fff}' +
    '.nlq-pill svg{width:15px;height:15px}' +
    '@media (hover:hover) and (pointer:fine) and (min-width:701px){.nlq-card{animation:nlqp 7s ease-in-out 4s infinite}.nlq:hover .nlq-card,.nlq:focus-within .nlq-card{animation:none}}' +
    '@keyframes nlqp{0%,88%,100%{transform:none}92%{transform:translateY(-5px)}96%{transform:none}}' +
    '@media (hover:none),(max-width:700px){.nlq{bottom:68px}.nlq-card,.nlq-x{display:none!important}.nlq-pill{display:inline-flex}.nlq:focus-within .nlq-pill{background:#ffd23f}}' +
    '@media (prefers-reduced-motion:reduce){.nlq,.nlq-card,.nlq-txt,.nlq-go{transition:none;animation:none!important}}' +
    '@media print{.nlq{display:none}}';

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var ig = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5.2"/><circle cx="12" cy="12" r="4.1"/><circle cx="17.3" cy="6.7" r=".6" fill="currentColor"/></svg>';
  var el = document.createElement('aside');
  el.className = 'nlq'; el.setAttribute('aria-label', 'Follow NET Law-Verse on Instagram');
  el.innerHTML =
    '<a class="nlq-card" href="' + URL + '" target="_blank" rel="noopener noreferrer" aria-label="Follow @netlawverse on Instagram. Scan the code with your phone camera, or select to open the profile.">' +
      '<span class="nlq-tag">Follow</span>' +
      '<span class="nlq-txt"><b>Don’t miss the next mock.</b><span>New papers and exam alerts land on Instagram first. Scan with your phone camera.</span></span>' +
      '<img class="nlq-img" src="' + QR + '" width="640" height="735" alt="" loading="lazy">' +
      '<span class="nlq-go">Follow @netlawverse</span>' +
    '</a>' +
    '<button type="button" class="nlq-x" aria-label="Hide the Instagram prompt">✕</button>' +
    '<a class="nlq-pill" href="' + URL + '" target="_blank" rel="noopener noreferrer"><i>' + ig + '</i>Follow @netlawverse</a>';
  function add() {
    document.body.appendChild(el);
    el.querySelector('.nlq-x').onclick = function (e) {
      e.preventDefault(); el.classList.remove('on');
      try { sessionStorage.setItem(KEY, '' + Date.now()); } catch (er) {}
      setTimeout(function () { el.remove(); }, 450);
    };
    setTimeout(function () { el.classList.add('on'); }, 2500);
  }
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
})();
