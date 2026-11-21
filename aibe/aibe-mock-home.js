/* AIBE mock tests: card list with saved progress and share buttons. Same design as clat-pg/clat-mock-home.js. */
(()=>{
const root=document.getElementById('mock-root'),D=window.AIBEMOCKS;if(!root||!D)return;
const g=k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const card=m=>`<article class="cm-card"><div class="cm-tags"><span class="cm-tag">MOCK TEST ${m.n}</span>${window.NLShare?NLShare.btn(()=>NLShare.make.text({kind:'mock',heading:'Share this mock test',title:'AIBE '+m.title+': free timed mock test',desc:m.q+' questions, '+m.minutes+' minutes, no negative marking, pass-mark check and a personalised assessment. Free, no sign-up.',url:'https://netlawverse.in/aibe/mock-test-'+m.n+'.html',image:'https://netlawverse.in/clat-pg/og-clat-mock.png',lines:['📝 AIBE (Bar Exam) '+m.title+' · '+m.theme,m.q+' MCQs · '+m.minutes+' min · no negative marking · free','Green-to-red time meter, pass-mark check and a personalised assessment. No sign-up.','','Try it 👇'],short:'AIBE '+m.title+': free timed mock with instant assessment.'}),{plain:1,icon:1,cls:'cm-sh',aria:'Share '+m.title}):''}</div>
<h3>${esc(m.title)}</h3><p class="cm-ct">${esc(m.kind)} · <b>${esc(m.theme)}</b></p><p class="cm-bl">${esc(m.blurb)}</p>
<ul class="cm-mini"><li>${m.q} questions · ${m.subjects.length} subjects</li><li>${m.minutes} minutes (3 h 30 min)</li><li>No negative marking</li><li>Free</li></ul>
<p class="cm-st" data-n="${m.n}" data-q="${m.q}">Not started</p><a class="cm-btn cm-go" href="mock-test-${m.n}.html" aria-label="Start ${esc(m.title)}">Start Mock Test →</a></article>`;
root.innerHTML=D.map(card).join('');
root.querySelectorAll('.cm-st').forEach(el=>{const n=el.dataset.n,r=g('aibe-mock-'+n+'-result'),a=g('aibe-mock-'+n+'-attempt');
if(a&&a.end){const c=Object.keys(a.ans||{}).length;el.textContent=a.end<=Date.now()?'Time up · open to see result':'In progress · '+c+'/'+el.dataset.q+' answered';el.className='cm-st prog'}
else if(r){el.textContent='✓ Completed · '+r.marks+'/'+el.dataset.q+' marks';el.className='cm-st done'}});
})();
