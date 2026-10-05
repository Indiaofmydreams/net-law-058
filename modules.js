(()=>{
const SETS=[
{grid:'mod-grid',panel:'mod-panel',mods:[
["Jurisprudence","Jurisprudence","Schools, rights, duties, liability and legal thinkers."],
["Constitutional and Administrative Law","Constitutional & Administrative Law","Fundamental rights, institutions, judicial review and natural justice."],
["Public International Law and IHL","Public International Law & IHL","Sources, recognition, the UN, WTO and humanitarian law."],
["Law of Crimes","Law of Crimes","Criminal liability, offences, defences and punishment."],
["Law of Torts and Consumer Protection","Torts & Consumer Protection","Negligence, strict liability, consumer and competition law."],
["Commercial Law","Commercial Law","Contracts, sale of goods, partnership, cheques and company law."],
["Family Law","Family Law","Marriage, divorce, maintenance, succession and the UCC."],
["Environment and Human Rights Law","Environment & Human Rights","Environmental principles, the NGT, human rights and enforcement."],
["Intellectual Property Rights and Information Technology Law","IPR & IT Law","Copyright, patents, trademarks, GI and cyber law."],
["Comparative Public Law and Systems of Governance","Comparative Public Law","Federalism, rule of law, separation of powers and the ombudsman."]]},
{grid:'p1-grid',panel:'p1-panel',mods:[
["Teaching Aptitude","Teaching Aptitude","Teaching concepts, methods, support systems and evaluation."],
["Research Aptitude","Research Aptitude","Research types, methods, steps, ethics and writing."],
["Comprehension","Comprehension","Reading passages, central ideas and inference."],
["Communication","Communication","Types, barriers, classroom communication and mass media."],
["Mathematical Reasoning and Aptitude","Mathematical Reasoning","Series, coding, ratio, percentage and simple calculations."],
["Logical Reasoning","Logical Reasoning","Arguments, fallacies, syllogisms, Venn diagrams and Indian logic."],
["Data Interpretation","Data Interpretation","Tables, charts, graphs and data analysis."],
["Information and Communication Technology (ICT)","ICT","Internet, terminology, digital initiatives and governance."],
["People, Development and Environment","People, Development & Environment","SDGs, pollution, climate change, resources and hazards."],
["Higher Education System","Higher Education System","Ancient to modern institutions, regulators and policies."]]}];
const eye='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
let Q=null;const inits=[];
SETS.forEach(S=>{const grid=document.getElementById(S.grid),panel=document.getElementById(S.panel);if(!grid||!panel)return;
const M=S.mods,inner=panel.querySelector('.mod-in');const P=NLNav.prog;let cur=-1,pg=null,pp=null,sf=null,trk=null,snap=[],redraw=null;
const list=i=>(Q||[]).filter(x=>x.u===M[i][0]);
grid.innerHTML=M.map((m,i)=>`<div class="unit mod" role="button" tabindex="0" data-i="${i}" aria-expanded="false"><span>${String(i+1).padStart(2,'0')}</span><h3>${m[1]}</h3><p>${m[2]}</p><b class="go">Practice MCQs <i>→</i></b><em class="cnt"></em></div>`).join('');
const counts=()=>grid.querySelectorAll('.mod').forEach((c,i)=>{const n=list(i).length;c.querySelector('.cnt').textContent=n?n+' MCQs':'Coming soon'});
const view=f=>f==='all'?list(cur):list(cur).filter(x=>P.status(x)===f);
const score=()=>{if(cur<0)return;const el=inner.querySelector('.mod-score');if(!el)return;const L=list(cur),s=P.stats(L);el.textContent=s.a?`Answered ${s.a} of ${L.length} · ${s.ok} correct`:'';prac();sf&&sf.counts(s)};
const prac=()=>{if(!pg||!pp)return;const L=list(cur);if(sf.get()==='all'){const g=pg.get(),v=snap.slice(g.rs,g.re),s=P.stats(v);pp.set(s.a,v.length,`Questions ${g.rs+1}–${g.re}`)}else{const s=P.stats(L);pp.set(s.a,L.length,`Whole module · ${s.bad} mistake${s.bad===1?'':'s'}`)}};
function card(x,n){const c=document.createElement('div');c.className='qb-card';
c.innerHTML=`<div class="qb-h"><span class="qb-n">${n}</span><p class="qb-q"></p><div class="qb-acts"><button class="qb-ic qb-eye" type="button" aria-label="Show answer" aria-expanded="false" title="Show answer">${eye}</button></div></div><div class="qb-o">${x.o.map((t,k)=>`<div class="qb-opt${k===x.a?' ok':''}" data-k="${k}" role="button" tabindex="0"><span></span><span class="mk"></span></div>`).join('')}</div><div class="qb-e"><div><p></p></div></div>`;
c.querySelector('.qb-q').textContent=x.q;c.querySelector('.qb-e p').textContent=x.e||'';
const b=c.querySelector('.qb-eye'),show=on=>{c.classList.toggle('rev',on);b.setAttribute('aria-expanded',on);b.title=on?'Hide answer':'Show answer'};
const mark=k=>{c.querySelectorAll('.qb-opt').forEach((z,j)=>z.classList.toggle('sel',j===k));c.dataset.done='1';c.classList.add('nl-ans');
 if(!c.querySelector('.qb-retry')){const r=document.createElement('button');r.type='button';r.className='qb-ic qb-retry nl-retry';r.setAttribute('aria-label','Try this question again');r.title='Clear my answer and try again';r.textContent='↺';
  r.onclick=()=>{P.clear(x);c.replaceWith(card(x,n));window.announce&&window.announce('Answer cleared. Try the question again.')};c.querySelector('.qb-acts').prepend(r)}};
c.querySelectorAll('.qb-opt').forEach((o,k)=>{o.firstChild.textContent=x.o[k];const f=()=>{if(P.get(x))return;P.set(x,k);mark(k);show(true);window.announce&&window.announce((k===x.a?'Correct. ':'Incorrect. ')+'Right answer: '+x.o[x.a])};o.onclick=f;o.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f()}}});
b.onclick=()=>{const on=!c.classList.contains('rev');show(on);window.announce&&window.announce(on?'Answer: '+x.o[x.a]+'. '+(x.e||''):'Answer hidden')};
const st=P.get(x);if(st){mark(st.k);show(true)}return c}
function render(){const m=M[cur],L=list(cur);
inner.innerHTML=`<div class="mod-head"><div><span class="eyebrow">MODULE ${String(cur+1).padStart(2,'0')}</span><h3>${m[1]}</h3><p class="mod-sub"></p><p class="mod-score" aria-live="polite"></p></div><div class="mod-btns"><button class="nl-btn nl-qz" type="button" hidden>Random 20 quiz</button><button class="mod-x" type="button">✕ Close</button></div></div><div class="nl-dg-h"></div><div class="nl-pp-h"></div><div class="nl-sf-h"></div><div class="nl-rg-h"></div><div class="nl-pg-t"></div><div class="mod-list"></div><div class="nl-pg-b"></div>`;
inner.querySelector('.mod-sub').textContent=Q===null?'Loading…':L.length?`${L.length} questions. Tap an option to check it, or tap the green eye to see the answer.`:'';
const box=inner.querySelector('.mod-list');trk&&NLNav.untrack(trk);trk=null;pg=pp=sf=null;redraw=null;
if(Q&&!L.length)box.innerHTML='<div class="mod-empty"><b>MCQs for this module are coming soon.</b><span>Check back shortly, or try the other modules.</span></div>';
else if(L.length){
const empty={u:'You have answered every question in this module.',bad:'No mistakes to review. Nice work.',all:''};
function page(){const g=pg.get();box.innerHTML='';if(!snap.length){box.innerHTML=`<div class="mod-empty"><b>${empty[sf.get()]}</b><span>Choose “All” to see every question.</span></div>`}
 else snap.slice(g.from,g.to).forEach((x,k)=>box.appendChild(card(x,g.from+k+1)));prac();NLNav.refresh()}
redraw=page;
function refilter(){snap=view(sf.get());pg.setTotal(snap.length);page()}
NLNav.daily(inner.querySelector('.nl-dg-h'));
pp=NLNav.practice(inner.querySelector('.nl-pp-h'));
sf=NLNav.statusFilter(inner.querySelector('.nl-sf-h'),refilter);
pg=NLNav.pager({rangeHost:inner.querySelector('.nl-rg-h'),topHost:inner.querySelector('.nl-pg-t'),bottomHost:inner.querySelector('.nl-pg-b'),anchor:inner.querySelector('.mod-head'),list:box,onChange:page});
snap=L;pg.setTotal(L.length);page();trk=box;NLNav.track(box);
const qz=inner.querySelector('.nl-qz');if(window.NLQuiz){qz.hidden=false;qz.onclick=()=>NLQuiz.start({title:m[1],pool:L,opener:qz,onClose:()=>{if(cur>=0&&redraw)redraw()}})}}
inner.querySelector('.mod-x').onclick=close;score()}
function close(){trk&&NLNav.untrack(trk);trk=null;panel.classList.remove('open');grid.querySelectorAll('.mod').forEach(c=>{c.classList.remove('active');c.setAttribute('aria-expanded','false')});cur=-1}
function open(i){if(cur===i){close();return}cur=i;grid.querySelectorAll('.mod').forEach((c,k)=>{c.classList.toggle('active',k===i);c.setAttribute('aria-expanded',k===i)});render();panel.classList.add('open');setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'start'}),120)}
document.addEventListener('nl-prog',()=>{if(cur>=0)score()});
grid.addEventListener('click',e=>{const c=e.target.closest('.mod');if(c)open(+c.dataset.i)});
grid.addEventListener('keydown',e=>{const c=e.target.closest('.mod');if(c&&(e.key==='Enter'||e.key===' ')){e.preventDefault();open(+c.dataset.i)}});
inits.push(()=>{counts();if(cur>=0)render()});counts()});
(window.QBANK_DATA?Promise.resolve(window.QBANK_DATA):window.loadBank()).then(d=>{Q=d;document.querySelectorAll('[data-qcount]').forEach(e=>e.textContent=Math.floor(d.length/50)*50+'+');inits.forEach(f=>f())}).catch(()=>{Q=[];inits.forEach(f=>f())});
})();
