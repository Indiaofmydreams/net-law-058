(()=>{const grid=document.getElementById('mod-grid'),panel=document.getElementById('mod-panel');if(!grid||!panel)return;
const M=[["Jurisprudence","Jurisprudence","Schools, rights, duties, liability and legal thinkers."],
["Constitutional and Administrative Law","Constitutional & Administrative Law","Fundamental rights, institutions, judicial review and natural justice."],
["Public International Law and IHL","Public International Law & IHL","Sources, recognition, the UN, WTO and humanitarian law."],
["Law of Crimes","Law of Crimes","Criminal liability, offences, defences and punishment."],
["Law of Torts and Consumer Protection","Torts & Consumer Protection","Negligence, strict liability, consumer and competition law."],
["Commercial Law","Commercial Law","Contracts, sale of goods, partnership, cheques and company law."],
["Family Law","Family Law","Marriage, divorce, maintenance, succession and the UCC."],
["Environment and Human Rights Law","Environment & Human Rights","Environmental principles, the NGT, human rights and enforcement."],
["Intellectual Property Rights and Information Technology Law","IPR & IT Law","Copyright, patents, trademarks, GI and cyber law."],
["Comparative Public Law and Systems of Governance","Comparative Public Law","Federalism, rule of law, separation of powers and the ombudsman."]];
let Q=null,cur=-1,shown=5;const inner=panel.querySelector('.mod-in'),eye='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const list=i=>(Q||[]).filter(x=>x.u===M[i][0]);
grid.innerHTML=M.map((m,i)=>`<div class="unit mod" role="button" tabindex="0" data-i="${i}" aria-expanded="false"><span>${String(i+1).padStart(2,'0')}</span><h3>${m[1]}</h3><p>${m[2]}</p><b class="go">Practice MCQs <i>→</i></b><em class="cnt"></em></div>`).join('');
function counts(){grid.querySelectorAll('.mod').forEach((c,i)=>{const n=list(i).length;c.querySelector('.cnt').textContent=n?n+' MCQs':'Coming soon'})}
function card(x,n){const c=document.createElement('div');c.className='qb-card';
c.innerHTML=`<div class="qb-h"><span class="qb-n">${n}</span><p class="qb-q"></p><div class="qb-acts"><button class="qb-ic qb-eye" type="button" aria-label="Show answer" aria-expanded="false" title="Show answer">${eye}</button></div></div><div class="qb-o">${x.o.map((t,k)=>`<div class="qb-opt${k===x.a?' ok':''}" data-k="${k}" role="button" tabindex="0"><span></span><span class="mk">✓</span></div>`).join('')}</div><div class="qb-e"><div><p></p></div></div>`;
c.querySelector('.qb-q').textContent=x.q;c.querySelector('.qb-e p').textContent=x.e||'';c.querySelectorAll('.qb-opt').forEach((o,k)=>{o.firstChild.textContent=x.o[k];const f=()=>c.querySelectorAll('.qb-opt').forEach(z=>z.classList.toggle('sel',z===o));o.onclick=f;o.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f()}}});
const b=c.querySelector('.qb-eye');b.onclick=()=>{const on=c.classList.toggle('rev');b.setAttribute('aria-expanded',on);b.title=on?'Hide answer':'Show answer'};return c}
function render(){const m=M[cur],L=list(cur);
inner.innerHTML=`<div class="mod-head"><div><span class="eyebrow">MODULE ${String(cur+1).padStart(2,'0')}</span><h3>${m[1]}</h3><p class="mod-sub"></p></div><button class="mod-x" type="button">✕ Close</button></div><div class="mod-list"></div>`;
inner.querySelector('.mod-sub').textContent=Q===null?'Loading…':L.length?`${L.length} questions. Try each one, then tap the green eye to see the answer.`:'';
const box=inner.querySelector('.mod-list');
if(Q&&!L.length)box.innerHTML='<div class="mod-empty"><b>MCQs for this module are coming soon.</b><span>Check back shortly, or try the other modules.</span></div>';
L.slice(0,shown).forEach((x,k)=>box.appendChild(card(x,k+1)));
if(L.length>shown){const more=document.createElement('button');more.className='qb-more';more.type='button';more.textContent=`Show more (${L.length-shown} left)`;more.onclick=()=>{const s=shown;shown+=5;L.slice(s,shown).forEach((x,k)=>box.insertBefore(card(x,s+k+1),more));if(L.length<=shown)more.remove();else more.textContent=`Show more (${L.length-shown} left)`};box.appendChild(more)}
inner.querySelector('.mod-x').onclick=close}
function close(){panel.classList.remove('open');grid.querySelectorAll('.mod').forEach(c=>{c.classList.remove('active');c.setAttribute('aria-expanded','false')});cur=-1}
function open(i){if(cur===i){close();return}cur=i;shown=5;grid.querySelectorAll('.mod').forEach((c,k)=>{c.classList.toggle('active',k===i);c.setAttribute('aria-expanded',k===i)});render();panel.classList.add('open');setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'start'}),120)}
grid.addEventListener('click',e=>{const c=e.target.closest('.mod');if(c)open(+c.dataset.i)});
grid.addEventListener('keydown',e=>{const c=e.target.closest('.mod');if(c&&(e.key==='Enter'||e.key===' ')){e.preventDefault();open(+c.dataset.i)}});
(window.QBANK_DATA?Promise.resolve(window.QBANK_DATA):fetch('questions.json').then(r=>r.json())).then(d=>{Q=d;counts();if(cur>=0)render()}).catch(()=>{Q=[];counts()});
})();
