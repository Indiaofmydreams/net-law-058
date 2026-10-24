/* Instagram follow (home page).
   - "Follow on Instagram" pill under the carousel: on a mouse/trackpad screen it opens a small dialog with the QR code
     (scan with the phone); on a touch screen, or without JavaScript, it simply opens the profile.
   - The "Stay connected" section is plain HTML; CSS hides the QR on touch screens, where it cannot be scanned. */
(function () {
  var URL = 'https://www.instagram.com/netlawverse/';
  var QR = 'instagram-qr.png';
  var dlg = null;

  function fine() {
    try { return window.matchMedia('(hover:hover) and (pointer:fine)').matches; } catch (e) { return false; }
  }

  function build() {
    var d = document.createElement('dialog');
    d.className = 'nlf-dlg';
    d.setAttribute('aria-labelledby', 'nlf-dt');
    d.innerHTML =
      '<button type="button" class="nlf-x" aria-label="Close">✕</button>' +
      '<h2 id="nlf-dt">Follow @netlawverse</h2>' +
      '<p>Point your phone camera at the code to open our Instagram profile.</p>' +
      '<img src="' + QR + '" width="640" height="735" alt="QR code for the NET Law-Verse Instagram profile, @netlawverse">' +
      '<a class="nlf-follow" href="' + URL + '" target="_blank" rel="noopener noreferrer">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5.2"/><circle cx="12" cy="12" r="4.1"/><circle cx="17.3" cy="6.7" r=".6" fill="currentColor"/></svg>' +
      '<span>Open Instagram</span></a>';
    d.querySelector('.nlf-x').addEventListener('click', function () { d.close(); });
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });   /* click on the dimmed backdrop */
    document.body.appendChild(d);
    return d;
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-nlf-open]');
    if (!a || e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;          /* keep "open in new tab" gestures working */
    if (!fine() || typeof HTMLDialogElement === 'undefined') return;       /* touch / old browsers: follow the link */
    e.preventDefault();
    dlg = dlg || build();
    if (!dlg.open) dlg.showModal();
  });
})();
