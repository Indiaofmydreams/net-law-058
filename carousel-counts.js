/* Keeps the Paper 1 carousel slide (and its side-rail label) in sync with the real question bank.
   Counts come from the same data the Paper 1 module cards use, so the number updates by itself whenever a pack is added.
   If the bank cannot load, the numbers already written in index.html stay as they are. */
(function () {
  if (!window.loadBank) return;
  var MODS = [
    ['Teaching Aptitude', 'Teaching Aptitude'],
    ['Research Aptitude', 'Research Aptitude'],
    ['Comprehension', 'Comprehension'],
    ['Communication', 'Communication'],
    ['Mathematical Reasoning and Aptitude', 'Mathematical Reasoning'],
    ['Logical Reasoning', 'Logical Reasoning'],
    ['Data Interpretation', 'Data Interpretation'],
    ['Information and Communication Technology (ICT)', 'ICT'],
    ['People, Development and Environment', 'People, Development & Environment'],
    ['Higher Education System', 'Higher Education System']
  ];
  var fmt = function (n) { return n.toLocaleString('en-IN'); };
  window.loadBank().then(function (bank) {
    var cnt = {}, total = 0;
    bank.forEach(function (x) { cnt[x.u] = (cnt[x.u] || 0) + 1; });
    MODS.forEach(function (m) { total += cnt[m[0]] || 0; });
    if (!total) return;
    var root = document.querySelector('[data-cc]');
    var slide = root && root.querySelector('.cc-slide[data-label="Paper 1"]');
    if (!slide) return;
    var tag = slide.querySelector('.cc-tag'), line = slide.querySelector('.cc-line'), chips = slide.querySelector('.cc-chips');
    if (tag) tag.textContent = 'GENERAL PAPER · ' + fmt(total) + ' MCQs';
    if (line) line.textContent = fmt(total) + ' free MCQs across all 10 modules, at no cost.';
    if (chips) chips.innerHTML = MODS.map(function (m) {
      return '<span>' + m[1] + ' <em>' + fmt(cnt[m[0]] || 0) + '</em></span>';
    }).join('');
    /* the side rail copied the old tag text when the carousel started */
    var all = root.querySelectorAll('.cc-slide'), i = [].indexOf.call(all, slide);
    var btn = root.querySelectorAll('.cc-opt-btn')[i], s = btn && btn.querySelector('.co-s');
    if (s && tag) s.textContent = tag.textContent;
    /* first slide mentions the Paper 1 total too */
    var first = root.querySelector('.cc-slide .cc-more');
    if (first) first.textContent = first.textContent.replace(/[\d,+]+\s+Paper 1/, fmt(total) + ' Paper 1');
  }).catch(function () {});
})();
