/* Homepage: mock test cards (with progress) and the digital clock. */
(()=>{
const g=k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}};
const root=document.getElementById('mock-root');
if(root){const T=["Full-length paper · Set 1","Full-length paper · Set 2","Full-length paper · Set 3","Full-length paper · Set 4","Revision mix · Sets 1–4"];
root.innerHTML=`<div class="section-head"><div><span class="eyebrow">FREE · NO SIGN-UP</span><h2>Free Mock Tests – UGC NET Law (Code 058)</h2></div><p>Timed 100-question practice papers with a question palette, instant result analysis and full answer review.</p></div><div class="mt-cards">${T.map((t,i)=>`<article class="mt-card"><span class="tag">MOCK TEST ${i+1}</span><h3>Mock Test ${i+1}</h3><p class="mt-ct">${t}</p><ul class="mt-mini"><li>100 questions</li><li>90 minutes</li><li>Free</li></ul><p class="mt-st" data-n="${i+1}">Not started</p><a class="btn primary" href="mock-test-${i+1}.html" aria-label="Start Mock Test ${i+1}">Start Mock Test →</a></article>`).join('')}</div><p class="mt-foot">Progress is saved in this browser only. Categories are website practice bands, not official NTA cut-offs.</p>`;
root.querySelectorAll('.mt-st').forEach(el=>{const n=el.dataset.n,r=g(`netlaw058-mock-${n}-result`),a=g(`netlaw058-mock-${n}-attempt`);
if(a&&a.end){const c=Object.keys(a.ans||{}).length;el.textContent=a.end<=Date.now()?'Time up · open to see result':`In progress · ${c}/100 answered`;el.className='mt-st prog'}
else if(r){el.textContent=`✓ Completed · ${r.marks}/200 marks`;el.className='mt-st done'}})}
const tr=document.querySelector('.hero .trust-row');
if(tr){const c=document.createElement('div');c.className='mt-clock';c.setAttribute('aria-hidden','true');c.innerHTML='<b class="t">--:--:--</b><span class="d"></span>';tr.after(c);
const t=c.querySelector('.t'),d=c.querySelector('.d'),up=()=>{if(document.hidden)return;const n=new Date();t.textContent=n.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});d.textContent=n.toLocaleDateString([],{weekday:'short',day:'numeric',month:'short',year:'numeric'})};up();setInterval(up,1000)}
})();
