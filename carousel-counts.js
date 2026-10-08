/* Keeps the Paper 1 and Paper 2 (Law 058) carousel slides, their side-rail labels and the first slide in sync with the real question bank.
   Counts come from the same data the module cards use, so every number updates by itself whenever a pack is added.
   If the bank cannot load, the numbers already written in index.html stay as they are. */
(function () {
  if (!window.loadBank) return;
  var P1 = [
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
  var P2 = [
    ['Jurisprudence', 'Jurisprudence'],
    ['Constitutional and Administrative Law', 'Constitutional & Administrative Law'],
    ['Public International Law and IHL', 'Public International Law & IHL'],
    ['Law of Crimes', 'Law of Crimes'],
    ['Law of Torts and Consumer Protection', 'Torts & Consumer Protection'],
    ['Commercial Law', 'Commercial Law'],
    ['Family Law', 'Family Law'],
    ['Environment and Human Rights Law', 'Environment & Human Rights'],
    ['Intellectual Property Rights and Information Technology Law', 'IPR & IT Law'],
    ['Comparative Public Law and Systems of Governance', 'Comparative Public Law']
  ];
  var fmt = function (n) { return n.toLocaleString('en-IN'); };
  var chip = function (cnt) { return function (m) { return '<span>' + m[1] + ' <em>' + fmt(cnt[m[0]] || 0) + '</em></span>'; }; };
  var sum = function (list, cnt) { return list.reduce(function (t, m) { return t + (cnt[m[0]] || 0); }, 0); };

  window.loadBank().then(function (bank) {
    var cnt = {};
    bank.forEach(function (x) { cnt[x.u] = (cnt[x.u] || 0) + 1; });
    var t1 = sum(P1, cnt), t2 = sum(P2, cnt);
    var root = document.querySelector('[data-cc]');
    if (!root || !t1 || !t2) return;
    var slides = [].slice.call(root.querySelectorAll('.cc-slide')), btns = root.querySelectorAll('.cc-opt-btn');
    var find = function (label) { return slides.filter(function (s) { return s.getAttribute('data-label') === label; })[0]; };
    var railSub = function (slide, text) {
      var b = btns[slides.indexOf(slide)], s = b && b.querySelector('.co-s'); if (s) s.textContent = text;
    };

    var s1 = find('Paper 1');
    if (s1) {
      var tag1 = 'GENERAL PAPER · ' + fmt(t1) + ' MCQs';
      s1.querySelector('.cc-tag').textContent = tag1;
      s1.querySelector('.cc-line').textContent = fmt(t1) + ' free MCQs across all 10 modules, at no cost.';
      s1.querySelector('.cc-chips').innerHTML = P1.map(chip(cnt)).join('');
      railSub(s1, tag1);
    }

    var s2 = find('Paper 2: Law: 058');
    if (s2) {
      var tag2 = 'PAPER 2 · LAW · ' + fmt(t2) + ' MCQs';
      s2.querySelector('.cc-tag').textContent = tag2;
      s2.querySelector('.cc-line').textContent = fmt(t2) + ' free MCQs across all 10 syllabus units. Zero cost.';
      var syl = s2.querySelector('.cc-syl'); if (syl) syl.innerHTML = P2.map(chip(cnt)).join('');
      railSub(s2, tag2);
    }

    /* first slide quotes both totals */
    var first = slides[0] && slides[0].querySelector('.cc-more');
    if (first) first.textContent = first.textContent
      .replace(/[\d,+]+\s+Law 058/, fmt(t2) + ' Law 058')
      .replace(/[\d,+]+\s+Paper 1/, fmt(t1) + ' Paper 1');
  }).catch(function () {});
})();
