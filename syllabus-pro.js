/* Module intelligence. EDIT these numbers with your own PYQ analysis.
   [stars 1-5, questions per paper over last 6 sessions (oldest→latest), 3 question patterns] */
const INSIGHTS={
paper1:[
[4,[5,5,5,5,5,5],["Match the following: teaching methods, evaluation types, support systems","Statement-based: choose the correct statements on learner characteristics","Direct recall: levels of teaching, CBCS, computer-based testing"]],
[5,[5,5,5,5,5,5],["Sequence the steps of research in correct order","Match research types and methods with their features","True/false statements on ethics, plagiarism and referencing styles"]],
[5,[5,5,5,5,5,5],["One passage followed by 5 questions: central idea, inference, tone","Answers sit inside the passage: read, do not recall","Vocabulary-in-context and conclusion-drawing questions"]],
[3,[5,5,5,5,5,5],["Identify communication barriers and types from short scenarios","Statements on mass media and classroom communication","Match communication models with their features"]],
[3,[5,5,5,5,5,5],["Number and letter series, coding-decoding","Percentage, ratio, profit-loss and time-distance word problems","Blood-relation and classification puzzles"]],
[4,[5,5,5,5,5,5],["Identify the fallacy in a given argument","Validity through the square of opposition and Venn diagrams","Match pramanas with their meaning (Indian logic)"]],
[4,[5,5,5,5,5,5],["One table or chart followed by 5 calculation questions","Percentage change, ratio and average from a graph","Statements on data and governance"]],
[3,[5,5,5,5,5,5],["Full forms of ICT abbreviations","Match digital initiatives (SWAYAM, DIKSHA) with their purpose","Internet, e-mail and conferencing terminology"]],
[4,[5,5,5,5,5,5],["Recall of SDGs, climate agreements and protocols","Statements on pollution sources and health impacts","Match environmental laws and agreements with their subject"]],
[4,[5,5,5,5,5,5],["Functions of regulators: UGC, AICTE, NAAC, NCTE","Ancient institutions and NEP 2020 recall","Match policy or commission with its recommendation"]]],
law:[
[3,[9,10,8,9,10,9],["Match thinkers with their school or theory","Statement-based questions on rights, duties and liability","Assertion-reason on law and morality, legal personality"]],
[5,[13,12,14,12,13,14],["Article-number recall: emergency, executive, legislature","Case-law match: constitutional doctrines and judicial review","Statement-based: natural justice and grounds of judicial review"]],
[4,[10,11,10,12,11,10],["Treaty and convention recall (Geneva Conventions, WTO)","Statement questions on sources, recognition and extradition","Match UN organs with their functions"]],
[4,[11,10,10,10,11,10],["Section-number recall under the new criminal codes (BNS)","Application: identify the offence from a short fact pattern","Statements on mens rea, inchoate crimes and punishment theories"]],
[3,[9,8,9,10,9,9],["Case-based: negligence, nuisance, strict and absolute liability","Statement questions on defences and State liability","Competition Act and Motor Vehicles Act provision recall"]],
[3,[9,9,10,9,8,9],["Section recall: Contract Act, Sale of Goods, Negotiable Instruments","Match contract types with their features","Company law: prospectus, directors, CSR statements"]],
[3,[8,9,9,10,9,9],["Statements on personal laws: marriage, divorce, maintenance","Case-law match on Muslim and Hindu law developments","Uniform Civil Code and live-in relationship debates"]],
[4,[10,9,11,10,10,11],["Match UN conferences and environmental principles with cases","Statements on NGT, EIA and constitutional provisions","Human-rights instruments: ICCPR, ICESCR, group rights"]],
[4,[11,12,10,11,12,11],["Match IPR conventions (Berne, TRIPS, Paris) with subject","Statement questions: copyright exceptions, patentability, passing off","IT Act: electronic records, cybercrime penalties"]],
[2,[9,10,9,10,9,10],["Compare federal and parliamentary models across countries","Match countries with their constitutional features","Statements on ombudsman and right to information systems"]]]};
(()=>{
const root=document.getElementById('sy-root');if(!root)return;
const C={1:'var(--t1)',2:'var(--t2)',3:'var(--t3)'},TN={1:'Tier 1 · High yield',2:'Tier 2 · Steady',3:'Tier 3 · Low yield'};
const tier=s=>s>=4?1:s===3?2:3;
let paper='paper1',tf=0,q='';const KEY='netlaw058-syllabus-progress-v1';
const ld=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}},sv=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}};
const stars=n=>'★'.repeat(n)+'<s>'+'★'.repeat(5-n)+'</s>',avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
root.innerHTML=`<div class="sy-top"><div><h2>UGC NET syllabus, ranked by importance</h2><p>Open any module to see how often it appears, how to approach it, and the question patterns to expect.</p></div>
<div class="sy-seg" id="sy-seg"><span class="sy-pill"></span><button class="on" data-p="paper1">Paper 1</button><button data-p="law">Paper 2 · Law 058</button></div></div>
<div class="sy-map"><div class="sy-map-h"><b id="sy-mt"></b><span>Segment width = questions per paper. Click to jump.</span></div><div class="sy-strip" id="sy-strip"></div>
<div class="sy-legend"><span><i style="background:${C[1]}"></i>Tier 1 · 4–5★</span><span><i style="background:${C[2]}"></i>Tier 2 · 3★</span><span><i style="background:${C[3]}"></i>Tier 3 · 1–2★</span></div></div>
<div class="sy-bar"><div class="sy-chips" id="sy-chips"></div><input class="sy-search" id="sy-q" type="search" placeholder="Search modules and topics" aria-label="Search syllabus"></div>
<div class="sy-prog"><span id="sy-pl"></span><div><i id="sy-pb"></i></div></div><div id="sy-list"></div>
<p class="sy-note">Syllabus: <a href="https://www.ugcnetonline.in/syllabus-new.php" target="_blank" rel="noopener">UGC NET official portal</a>. Paper 1 carries 5 questions per unit by design. Star ratings and the Law appearance history are indicative estimates, so verify against official papers and update <code>INSIGHTS</code> in syllabus-pro.js with your own PYQ count.</p>`;
const $=s=>root.querySelector(s);
function pill(){const b=$('#sy-seg .on'),p=$('.sy-pill');p.style.width=b.offsetWidth+'px';p.style.transform=`translateX(${b.offsetLeft-4}px)`}
function chips(){$('#sy-chips').innerHTML=[['All modules',0],['Tier 1',1],['Tier 2',2],['Tier 3',3]].map(([n,v])=>`<button class="sy-chip${tf===v?' on':''}" data-t="${v}">${n}</button>`).join('')}
function prog(){const d=syllabus[paper],s=ld();let n=0;d.forEach((u,i)=>{if(u[1].every((_,t)=>s[`${paper}-${i}-${t}`]))n++});$('#sy-pl').textContent=`${n} of ${d.length} modules completed`;$('#sy-pb').style.width=n/d.length*100+'%'}
function strip(){const I=INSIGHTS[paper],tot=I.reduce((a,x)=>a+avg(x[1]),0);$('#sy-mt').textContent=paper==='paper1'?'50 questions across 10 units':'100 questions across 10 units';
$('#sy-strip').innerHTML=syllabus[paper].map((u,i)=>`<button class="sy-seg-u" data-i="${i}" style="flex:${avg(I[i][1])};background:${C[tier(I[i][0])]};animation-delay:${i*50}ms" title="${u[0]}"><span>${avg(I[i][1]).toFixed(0)} Q</span><span>${u[0].split(' ')[0]}</span></button>`).join('')}
function list(){const I=INSIGHTS[paper],S=ld(),L=$('#sy-list');L.innerHTML='';let m=0;
syllabus[paper].forEach((u,i)=>{const[st,tr,pt]=I[i],T=tier(st);if(tf&&T!==tf)return;const tp=u[1].map((t,k)=>[t,k]).filter(([t])=>!q||u[0].toLowerCase().includes(q)||t.toLowerCase().includes(q));if(!tp.length)return;m++;
const mx=Math.max(...tr)+2,a=avg(tr),card=document.createElement('div');card.className='sy-card'+(q?' open':'');card.id='sy-'+i;card.style.setProperty('--c',C[T]);
card.innerHTML=`<button class="sy-head" aria-expanded="${!!q}"><span class="sy-no" style="background:${C[T]}">${i+1}</span><span class="sy-name">${u[0]}<small>${u[1].length} topics · ~${a.toFixed(0)} questions per paper</small></span><span class="sy-stars" aria-label="${st} of 5 stars">${stars(st)}</span><span class="sy-tier" style="background:color-mix(in srgb,${C[T]} 14%,transparent);color:${T===3?'var(--mut)':C[T]}">${TN[T]}</span><span class="sy-chev"></span></button>
<div class="sy-body"><div><div class="sy-in"><div><h4>Appearance in last 6 sessions (questions per paper)</h4><div class="sy-chart">${tr.map((v,k)=>`<div class="sy-col"><span>${v}</span><i style="--h:${v/mx*100}%;background:${C[T]};transition-delay:${k*70}ms"></i></div>`).join('')}</div><div class="sy-lbls">${tr.map((_,k)=>`<span>S${k+1}</span>`).join('')}</div>
<div class="sy-kpis"><div class="sy-kpi"><b>${a.toFixed(1)}</b><span>Average Qs</span></div><div class="sy-kpi"><b>${Math.max(...tr)}</b><span>Peak</span></div><div class="sy-kpi"><b>${(a/(paper==='law'?100:50)*100).toFixed(0)}%</b><span>Paper share</span></div></div></div>
<div><h4>Expected question patterns</h4><ul class="sy-pat">${pt.map(x=>`<li>${x}</li>`).join('')}</ul></div>
<div class="sy-topics"><h4>Detailed syllabus<span>${u[1].length} topics</span></h4>${tp.map(([t,k])=>`<label class="sy-t${S[`${paper}-${i}-${k}`]?' done':''}"><input type="checkbox" data-k="${k}" ${S[`${paper}-${i}-${k}`]?'checked':''}><span></span></label>`).join('')}</div></div></div></div>`;
card.querySelectorAll('.sy-t span').forEach((s,n)=>s.textContent=tp[n][0]);
card.querySelector('.sy-head').onclick=e=>{const o=card.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',o)};
card.querySelectorAll('input').forEach(cb=>cb.onchange=()=>{const s=ld();s[`${paper}-${i}-${cb.dataset.k}`]=cb.checked;sv(s);cb.parentNode.classList.toggle('done',cb.checked);prog()});L.appendChild(card)});
if(!m)L.innerHTML='<p class="sy-empty">No modules match. Clear the search or choose another tier.</p>';prog()}
function all(){strip();chips();list()}
$('#sy-seg').onclick=e=>{const b=e.target.closest('button');if(!b)return;paper=b.dataset.p;root.querySelectorAll('#sy-seg button').forEach(x=>x.classList.toggle('on',x===b));pill();all()};
$('#sy-chips').onclick=e=>{const b=e.target.closest('button');if(!b)return;tf=+b.dataset.t;chips();list()};
$('#sy-q').oninput=e=>{q=e.target.value.trim().toLowerCase();list()};
$('#sy-strip').onclick=e=>{const b=e.target.closest('button');if(!b)return;tf=0;chips();if(q){q='';$('#sy-q').value=''}list();const c=document.getElementById('sy-'+b.dataset.i);c.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>{c.classList.add('open','hl');c.querySelector('.sy-head').setAttribute('aria-expanded','true')},350)};
addEventListener('resize',pill);all();requestAnimationFrame(pill);document.fonts&&document.fonts.ready.then(pill);
})();
