/* Hero carousel: one main card with a vertical option rail. Auto-advance every 4.5s, pauses on hover/focus/touch, swipe on touch. */
(function () {
  var root = document.querySelector('[data-cc]');
  if (!root) return;
  var stage = root.querySelector('.cc-stage');
  var slides = [].slice.call(root.querySelectorAll('.cc-slide'));
  var dotsEl = root.querySelector('.cc-dots');
  var rail = root.querySelector('.cc-rail');
  var n = slides.length, cur = 0, timer = null;
  var paused = false;
  var hovering = false, focused = false, touching = false, dragging = false, justDragged = false;
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqMobile = window.matchMedia('(max-width: 767px)');
  var DELAY = 4500, DELAY_MOBILE = 6500;

  var dots = slides.map(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'cc-dot';
    b.setAttribute('aria-label', 'Go to slide ' + (i + 1) + ' of ' + n + ': ' + s.getAttribute('data-label'));
    b.innerHTML = '<i></i>';
    b.addEventListener('click', function () { go(i); });
    dotsEl.appendChild(b);
    s.setAttribute('aria-label', (i + 1) + ' of ' + n + ': ' + s.getAttribute('data-label'));
    return b;
  });

  /* Vertical option rail: one button per slide, built from the slide's own label and tag. */
  var opts = slides.map(function (s, i) {
    var tagEl = s.querySelector('.cc-tag'), b = document.createElement('button');
    b.type = 'button';
    b.className = 'cc-opt-btn';
    b.setAttribute('aria-label', 'Show ' + s.getAttribute('data-label') + ' (' + (i + 1) + ' of ' + n + ')');
    b.innerHTML = '<span class="co-t"></span><span class="co-s"></span><i class="co-bar" aria-hidden="true"></i>';
    b.querySelector('.co-t').textContent = s.getAttribute('data-label');
    b.querySelector('.co-s').textContent = tagEl ? tagEl.textContent : '';
    b.addEventListener('click', function () { go(i); });
    rail.appendChild(b);
    return b;
  });

  function rel(i) {
    var d = (((i - cur) % n) + n) % n;
    return d > n / 2 ? d - n : d;
  }
  function render() {
    slides.forEach(function (s, i) {
      var d = rel(i), card = s.firstElementChild;
      s.style.setProperty('--d', d);
      s.classList.toggle('is-active', d === 0);
      s.classList.toggle('is-prev', d === -1);
      s.classList.toggle('is-next', d === 1);
      s.classList.toggle('is-far', d < -1 || d > 1);
      s.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
      card.tabIndex = d === 0 ? 0 : -1;
      dots[i].setAttribute('aria-current', d === 0 ? 'true' : 'false');
      opts[i].setAttribute('aria-current', d === 0 ? 'true' : 'false');
    });
  }
  function canPlay() {
    return !paused && !mqReduce.matches && !hovering && !focused && !touching && !dragging && !document.hidden;
  }
  function schedule() {
    clearTimeout(timer);
    stage.setAttribute('aria-live', canPlay() ? 'off' : 'polite');
    /* Progress line on the active option mirrors the auto-slide timer. */
    rail.classList.remove('is-run');
    if (!canPlay()) return;
    rail.style.setProperty('--cc-delay', (mqMobile.matches ? DELAY_MOBILE : DELAY) + 'ms');
    void rail.offsetWidth;
    rail.classList.add('is-run');
    timer = setTimeout(function () { go(cur + 1); }, mqMobile.matches ? DELAY_MOBILE : DELAY);
  }
  function go(i) {
    cur = ((i % n) + n) % n;
    render();
    schedule();
  }

  root.querySelector('[data-prev]').addEventListener('click', function () { go(cur - 1); });
  root.querySelector('[data-next]').addEventListener('click', function () { go(cur + 1); });

  /* Pause completely while the cursor is inside; resume on leave. */
  root.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hovering = true; schedule(); } });
  root.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hovering = false; schedule(); } });
  root.addEventListener('focusin', function (e) { focused = e.target.matches(':focus-visible'); schedule(); });
  root.addEventListener('focusout', function (e) { if (!root.contains(e.relatedTarget)) { focused = false; schedule(); } });
  document.addEventListener('visibilitychange', schedule);
  /* A quiz (or anything else) can stop the auto-slide with root.dispatchEvent(new Event('cc-pause')) and restart it with 'cc-resume'. */
  root.addEventListener('cc-pause', function () { paused = true; schedule(); });
  root.addEventListener('cc-resume', function () { paused = false; schedule(); });
  if (mqReduce.addEventListener) { mqReduce.addEventListener('change', schedule); mqMobile.addEventListener('change', schedule); }

  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
    else if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && rail.contains(e.target)) {
      e.preventDefault();
      go(cur + (e.key === 'ArrowDown' ? 1 : -1));
      opts[cur].focus();
    }
  });

  /* A click on the main card follows its link (unless it was the end of a swipe). */
  stage.addEventListener('click', function (e) {
    if (justDragged) { e.preventDefault(); return; }
    var s = e.target.closest('.cc-slide');
    if (s && !s.classList.contains('is-active')) e.preventDefault();
  });

  /* Swipe / drag (touch and pen) with snap to the nearest card. */
  var sx = 0, sy = 0, pid = null, dx = 0;
  stage.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse') return;
    sx = e.clientX; sy = e.clientY; pid = e.pointerId; dx = 0;
    touching = true; schedule();
  });
  stage.addEventListener('pointermove', function (e) {
    if (e.pointerId !== pid) return;
    var mx = e.clientX - sx, my = e.clientY - sy;
    if (!dragging) {
      if (Math.abs(mx) < 8 || Math.abs(mx) < Math.abs(my)) return;
      dragging = true;
      stage.classList.add('is-drag');
      try { stage.setPointerCapture(pid); } catch (err) {}
    }
    dx = mx;
    stage.style.setProperty('--dx', dx + 'px');
  });
  function end(e) {
    if (e.pointerId !== pid) return;
    pid = null; touching = false;
    var moved = dragging;
    if (moved) {
      dragging = false;
      justDragged = true;
      setTimeout(function () { justDragged = false; }, 0);
      stage.classList.remove('is-drag');
      stage.style.setProperty('--dx', '0px');
      var thr = Math.min(80, stage.clientWidth * 0.12);
      if (e.type === 'pointerup' && dx <= -thr) { go(cur + 1); return; }
      if (e.type === 'pointerup' && dx >= thr) { go(cur - 1); return; }
    }
    schedule();
  }
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  stage.addEventListener('dragstart', function (e) { e.preventDefault(); });

  render();
  schedule();
})();
