/* CUET PG LL.M. mock tests: card list with saved progress and share buttons. */
(()=>{
const root=document.getElementById('mock-root'),D=window.CUETMOCKS;if(!root||!D)return;
const g=k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const card=m=>`<article class="cm-card"><div class="cm-tags"><span class="cm-tag">MOCK TEST ${m.n}</span>${window.NLShare?NLShare.btn(()=>NLShare.make.text({kind:'mock',heading:'Share this mock test',title:'CUET PG LL.M. '+m.title+': free timed mock test',desc:m.q+' MCQs, '+m.minutes+' minutes, +4/-1 marking, instant result analysis and a personalised assessment. Free, no sign-up.',url:'https://netlawverse.in/cuet-pg/mock-test-'+m.n+'.html',image:'https://netlawverse.in/clat-pg/og-clat-mock.png',lines:['📝 CUET PG LL.M. '+m.title+' · '+m.theme,m.q+' MCQs · '+m.minutes+' min · +4 / −1 · free','Green-to-red time meter, instant analysis and a personalised assessment. No sign-up.','','Try it 👇'],short:'CUET PG LL.M. '+m.title+': free timed mock with instant assessment.'}),{plain:1,icon:1,cls:'cm-sh',aria:'Share '+m.title}):''}</div>
<h3>${esc(m.title)}</h3><p class="cm-ct">${esc(m.kind)} · <b>${esc(m.theme)}</b></p><p class="cm-bl">${esc(m.blurb)}</p>
<ul class="cm-mini"><li>${m.q} questions · ${m.marks} marks</li><li>${m.minutes} minutes</li><li>+4 / −1 marking</li><li>${m.easy} easy · ${m.medium} medium · ${m.hard} hard</li><li>Free</li></ul>
<p class="cm-st" data-n="${m.n}" data-q="${m.marks}">Not started</p><a class="cm-btn cm-go" href="mock-test-${m.n}.html" aria-label="Start ${esc(m.title)}">Start Mock Test →</a></article>`;
root.innerHTML=D.map(card).join('');
root.querySelectorAll('.cm-st').forEach(el=>{const n=el.dataset.n,r=g('cuet-mock-'+n+'-result'),a=g('cuet-mock-'+n+'-attempt');
if(a&&a.end){const c=Object.keys(a.ans||{}).length;el.textContent=a.end<=Date.now()?'Time up · open to see result':'In progress · '+c+'/75 answered';el.className='cm-st prog'}
else if(r){el.textContent='✓ Completed · '+r.marks+'/'+el.dataset.q+' marks';el.className='cm-st done'}});
})();
