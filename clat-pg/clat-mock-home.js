/* CLAT PG mock tests: card list with saved progress and share buttons. */
(()=>{
const root=document.getElementById('mock-root'),D=window.CLATMOCKS;if(!root||!D)return;
const g=k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shareIc='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>';
const card=m=>`<article class="cm-card"><div class="cm-tags"><span class="cm-tag">MOCK TEST ${m.n}</span>${window.NLShare?NLShare.btn(()=>NLShare.make.text({kind:'mock',heading:'Share this mock test',title:'CLAT PG '+m.title+': free timed mock test',desc:m.q+' passage-based questions, '+m.minutes+' minutes, instant result analysis and a personalised assessment. Free, no sign-up.',url:'https://netlawverse.in/clat-pg/mock-test-'+m.n+'.html',image:'https://netlawverse.in/clat-pg/og-clat-mock.png',lines:['📝 CLAT PG (LL.M.) '+m.title+' · '+m.theme,m.q+' passage-based MCQs · '+m.minutes+' min · free','Green-to-red time meter, instant analysis and a personalised assessment. No sign-up.','','Try it 👇'],short:'CLAT PG '+m.title+': free timed mock with instant assessment.'}),{plain:1,icon:1,cls:'cm-sh',aria:'Share '+m.title}):''}</div>
<h3>${esc(m.title)}</h3><p class="cm-ct">${esc(m.kind)} · <b>${esc(m.theme)}</b></p><p class="cm-bl">${esc(m.blurb)}</p>
<ul class="cm-mini"><li>${m.q} questions · ${m.subjects.length} subjects</li><li>${m.minutes} minutes</li><li>0.25 negative marking</li><li>Free</li></ul>
<p class="cm-st" data-n="${m.n}" data-q="${m.q}">Not started</p><a class="cm-btn cm-go" href="mock-test-${m.n}.html" aria-label="Start ${esc(m.title)}">Start Mock Test →</a></article>`;
root.innerHTML=D.map(card).join('');
root.querySelectorAll('.cm-st').forEach(el=>{const n=el.dataset.n,r=g('clatpg-mock-'+n+'-result'),a=g('clatpg-mock-'+n+'-attempt');
if(a&&a.end){const c=Object.keys(a.ans||{}).length;el.textContent=a.end<=Date.now()?'Time up · open to see result':'In progress · '+c+'/'+el.dataset.q+' answered';el.className='cm-st prog'}
else if(r){el.textContent='✓ Completed · '+r.marks+'/'+el.dataset.q+' marks';el.className='cm-st done'}});
})();
