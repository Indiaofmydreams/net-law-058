/* CLAT PG mock test engine: passage-based exam screen, 120-minute timer, green-to-red time meter,
   negative marking, persistence and a curated assessment. Client-side only. */
(()=>{
const app=document.getElementById('app');if(!app||!window.CLATMOCK)return;
const M=window.CLATMOCK,N=M.n,DUR=M.minutes*60000,NEG=M.neg,EXAM=Date.UTC(2026,11,6,8,30,0);
const Q=[],FIRST=[];M.p.forEach((p,pi)=>{FIRST.push(Q.length);p.q.forEach((q,k)=>Q.push(Object.assign({pi,k,s:p.s,pid:p.id,pn:p.q.length},q)))});
const TOT=Q.length,NP=M.p.length,MAXM=TOT,BUD=DUR/NP,RED=100/120;
const AK='clatpg-mock-'+N+'-attempt',RK='clatpg-mock-'+N+'-result',L='ABCD';
const ld=k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}},sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}},rm=k=>{try{localStorage.removeItem(k)}catch{}};
const say=m=>{const l=document.getElementById('live');if(l){l.textContent='';setTimeout(()=>l.textContent=m,60)}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SH=(p,o)=>window.NLShare?NLShare.btn(p,o):'';
const pad=n=>String(n).padStart(2,'0'),fmt=ms=>{const s=Math.ceil(Math.max(0,ms)/1000);return pad(Math.floor(s/3600))+':'+pad(Math.floor(s%3600/60))+':'+pad(s%60)};
const dur=ms=>{const m=Math.floor(ms/60000),s=Math.floor(ms%60000/1000);return m+' min '+s+' s'};
const ms2=ms=>{const s=Math.round(ms/1000);return Math.floor(s/60)+'m '+pad(s%60)+'s'};
const r2=x=>Math.round(x*100)/100,num=x=>(r2(x)).toString();
const base=()=>{const l=document.querySelector('link[rel="canonical"]');return l&&l.href?l.href.split('#')[0]:location.href.split('#')[0].split('?')[0]};
const SITE='https://netlawverse.in/';
let A=null,tick=null;
const tough=x=>x.d==='Tough';

/* ---------- time meter ---------- */
const STOPS=[[0,[46,196,182]],[.25,[127,211,90]],[.5,[255,210,63]],[.75,[255,159,64]],[1,[230,57,70]]];
function colAt(f){f=Math.min(1,Math.max(0,f));for(let i=1;i<STOPS.length;i++){if(f<=STOPS[i][0]){const a=STOPS[i-1],b=STOPS[i],t=(f-a[0])/(b[0]-a[0]);return a[1].map((v,k)=>Math.round(v+(b[1][k]-v)*t))}}return STOPS[4][1]}
const rgb=c=>`rgb(${c[0]},${c[1]},${c[2]})`,tint=(c,k)=>rgb(c.map(v=>Math.round(v+(255-v)*k)));
const zone=f=>f<.5?{k:'GREEN ZONE',t:'Settle in',c:'#d9f7ec'}:f<RED?{k:'AMBER ZONE',t:'Keep moving',c:'#fff1b8'}:{k:'RED ZONE',t:'Final stretch',c:'#ffd0d6'};
function meterHTML(f,id){return `<div class="cm-meter" ${id?'id="'+id+'"':''} role="img" aria-label="Time meter from green at the start to red at the end of the exam"><div class="cm-mt"><i class="tk" style="left:25%"></i><i class="tk" style="left:50%"></i><i class="tk" style="left:${RED*100}%"></i><i class="rest" style="width:${(1-f)*100}%"></i><i class="pin" style="left:${f*100}%;--pin:${rgb(colAt(f))}"></i></div><div class="cm-ms" aria-hidden="true"><span>START</span><span>30</span><span>60</span><span>90</span><span>120 MIN</span></div></div>`}
function meterSet(root,f){const m=root.querySelector('.cm-mt');if(!m)return;m.querySelector('.rest').style.width=(1-f)*100+'%';const p=m.querySelector('.pin');p.style.left=f*100+'%';p.style.setProperty('--pin',rgb(colAt(f)));root.classList.toggle('red',f>=RED)}

/* ---------- intro ---------- */
const sharePayload=()=>{const p=NLShare.make.text({kind:'mock',heading:'Share this mock test',title:'CLAT PG '+M.title+': free timed mock test',desc:`${TOT} passage-based questions, ${M.minutes} minutes, ${MAXM} marks, 0.25 negative marking. Time meter, instant result analysis and a personalised assessment. Free, no sign-up.`,url:base(),image:SITE+'clat-pg/og-clat-mock.png',
lines:['📝 CLAT PG (LL.M.) '+M.title+' · '+M.theme,`${TOT} passage-based MCQs · ${M.minutes} min · ${MAXM} marks · −0.25 per wrong answer`,'Green-to-red time meter, instant analysis and a personalised assessment. Free, no sign-up.','','Try it 👇'],short:'CLAT PG '+M.title+': free timed mock with instant assessment.'});return p};
function intro(){document.body.classList.remove('cm-exam');const r=ld(RK),next=N<(window.CLATMOCKS||[]).length;
app.innerHTML=`<div class="cm-intro"><span class="pill">CLAT PG · ${esc(M.kind.toUpperCase())}</span><h1 class="cm-h1">CLAT PG <span>${esc(M.title)}</span></h1><p class="cm-sub"><b>${esc(M.theme)}.</b> ${esc(M.blurb)}</p>
<ul class="cm-facts"><li>${TOT} questions</li><li>${NP} passages</li><li>${M.minutes} minutes</li><li>${MAXM} marks</li><li>−0.25 for each wrong answer</li><li>Free</li></ul>
<div class="cm-box cm-demo" aria-label="How the time meter works"><h2>The time meter</h2>${meterHTML(.42)}<p>The pin moves from green to red as your ${M.minutes} minutes run out. Red begins with 20 minutes left. Your final assessment shows where on the meter you finished, and whether your preparation needs more time.</p></div>
<div class="cm-box"><h2>Before you begin</h2><ul class="cm-rules"><li>The paper follows the CLAT PG pattern: passages followed by questions, one mark for each correct answer and 0.25 deducted for each wrong answer. Unanswered questions score zero.</li><li>The timer starts when you press Start and keeps running on its own clock, even if you switch tabs. You are warned at 30, 15, 5 and 1 minute, and the test submits automatically at zero.</li><li>If you refresh or close the page, your attempt and remaining time are restored from this browser. The timer does not pause while you are away.</li><li>Progress is saved in this browser only. Clearing site data, private browsing or another device will lose it. This is a practice tool, not a proctored exam.</li></ul></div>
<div class="cm-row" style="margin-top:22px"><button class="cm-btn pri" id="go">Start Mock Test →</button>${r?'<button class="cm-btn" id="last">View last result</button>':''}<a class="cm-btn" href="mock-tests.html">All mock tests</a>${SH(sharePayload,{plain:1,cls:'cm-btn',label:'Share this test',aria:'Share this mock test'})}</div></div>`;
app.querySelector('#go').onclick=()=>{const t=Date.now();A={start:t,end:t+DUR,ans:{},mk:{},vis:{0:1},cur:0,w:{},tq:{},ats:{},t0:t,lq:0};save();exam()};
const l=app.querySelector('#last');if(l)l.onclick=()=>result(r);window.scrollTo(0,0)}
const save=()=>sv(AK,A);

/* ---------- exam ---------- */
function exam(){
document.body.classList.add('cm-exam');
app.innerHTML=`<div class="cm-top"><div class="cm-topr"><div class="cm-id"><b>CLAT PG ${esc(M.title)}</b><span id="qn"></span></div><div class="cm-timer" id="tm" role="timer" aria-label="Time remaining">--:--:--</div><div class="cm-row">${SH(sharePayload,{plain:1,icon:1,cls:'cm-sh',aria:'Share this mock test'})}<button class="cm-btn dng sm" id="sub">Submit Test</button></div></div>${meterHTML(0,'mtr')}<p class="cm-mst" id="mst"></p></div>
<div class="cm-prog" aria-hidden="true"><i id="pb"></i></div>
<div class="cm-grid" id="gr"><section class="cm-pass" data-wm id="ps" aria-label="Passage"></section>
<section class="mt-q" aria-label="Question"><p class="cm-meta" id="meta"></p><h2 class="cm-qt" id="qt"></h2><div class="cm-opts" id="op" role="radiogroup" aria-labelledby="qt"></div>
<div class="cm-acts"><button class="cm-btn" id="pv">← Previous</button><button class="cm-btn" id="mk"></button><button class="cm-btn" id="cl">Clear Response</button><span id="rpw"></span><button class="cm-btn pri" id="nx">Next →</button></div></section>
<aside class="cm-side"><div class="cm-pal" aria-label="Question palette"><h3>Question palette</h3><div class="cm-pgs" id="pg"></div>
<ul class="cm-leg"><li><i class="cm-p"></i>Not visited</li><li><i class="cm-p va"></i>Visited, unanswered</li><li><i class="cm-p an"></i>Answered</li><li><i class="cm-p mr"></i>Marked for review</li><li><i class="cm-p amr"></i>Answered and marked</li><li><i class="cm-hd inl"></i>Tough question (red mark)</li></ul><p class="cm-cnt" id="cnt"></p><p class="cm-cnt">Keys: A–D select · N next · P previous · M mark</p></div></aside></div>
<dialog id="dlg" class="cm-dlg" aria-labelledby="dt"><h2 id="dt">Submit test?</h2><p id="dp"></p><div class="cm-row"><button class="cm-btn" id="no">Continue test</button><button class="cm-btn dng" id="yes">Yes, submit</button></div></dialog>`;
const $=s=>app.querySelector(s),pg=$('#pg'),ps=$('#ps'),gr=$('#gr');
try{const fs=+localStorage.getItem('clatpg-fs');if(fs>=.85&&fs<=1.5)gr.style.setProperty('--cm-fs',fs)}catch{}
pg.innerHTML=M.p.map((p,pi)=>`<div class="cm-pgr"><span class="cm-pgl" title="${esc(p.s)}">P${pi+1}</span><div class="cm-pgb">${p.q.map((_,k)=>{const i=FIRST[pi]+k;return `<button class="cm-p" data-i="${i}">${i+1}${tough(Q[i])?'<i class="cm-hd" aria-hidden="true"></i>':''}</button>`}).join('')}</div></div>`).join('');
const st=i=>{const a=A.ans[i]!==undefined,m=!!A.mk[i];return a&&m?'amr':m?'mr':a?'an':A.vis[i]?'va':'nv'};
const SN={nv:'not visited',va:'visited, unanswered',an:'answered',mr:'marked for review',amr:'answered and marked for review'};
function pal(){pg.querySelectorAll('.cm-p').forEach(b=>{const i=+b.dataset.i,s=st(i);b.className='cm-p '+(s==='nv'?'':s)+(i===A.cur?' cur':'');b.setAttribute('aria-label',`Question ${i+1}, ${SN[s]}${tough(Q[i])?', tough question':''}`);i===A.cur?b.setAttribute('aria-current','true'):b.removeAttribute('aria-current')});
const n=Object.keys(A.ans).length,m=Object.keys(A.mk).filter(k=>A.mk[k]).length;$('#cnt').textContent=`${n} answered · ${TOT-n} unanswered · ${m} marked`;$('#pb').style.width=n/TOT*100+'%'}
function flush(){const n=Date.now();if(A.lq!=null)A.tq[A.lq]=(A.tq[A.lq]||0)+Math.max(0,n-A.t0);A.t0=n}
let shownP=-1;
function passage(pi){if(shownP===pi)return;shownP=pi;const p=M.p[pi];
ps.innerHTML=`<div class="ph"><span class="pk">PASSAGE ${pi+1} OF ${NP}</span><span class="cm-row" style="gap:8px"><button class="cm-btn sm cm-ptog" id="pt" aria-expanded="true">Hide passage</button><span class="cm-fs" role="group" aria-label="Text size"><button data-d="-1" aria-label="Smaller text">A−</button><button data-d="1" aria-label="Larger text">A+</button></span></span></div><h2></h2><p class="tx"></p>`;
ps.querySelector('h2').textContent=p.t;ps.querySelector('.tx').textContent=p.x;ps.scrollTop=0;ps.classList.remove('collapsed');
ps.querySelector('.cm-fs').onclick=e=>{const b=e.target.closest('button');if(!b)return;let v=Math.min(1.5,Math.max(.85,(+getComputedStyle(gr).getPropertyValue('--cm-fs')||1)+.1*b.dataset.d));v=Math.round(v*100)/100;gr.style.setProperty('--cm-fs',v);try{localStorage.setItem('clatpg-fs',v)}catch{}};
ps.querySelector('#pt').onclick=e=>{const c=ps.classList.toggle('collapsed');e.currentTarget.textContent=c?'Show passage':'Hide passage';e.currentTarget.setAttribute('aria-expanded',!c)}}
function show(i,focus){flush();A.cur=i;A.lq=i;A.vis[i]=1;save();const x=Q[i];
$('#qn').textContent=`Question ${i+1}/${TOT} · Passage ${x.pi+1}/${NP}`;
$('#meta').innerHTML=`<span class="cm-chip">Q${x.k+1} of ${x.pn} on this passage</span><span>${esc(x.s)}</span>${tough(x)?'<b class="cm-chip t">▲ TOUGH</b>':x.d==='Easy'?'<b class="cm-chip e">EASY</b>':'<b class="cm-chip">MODERATE</b>'}`;
$('.mt-q').classList.toggle('tough',tough(x));$('#qt').textContent=x.q;passage(x.pi);
if(window.NLReport)$('#rpw').innerHTML=NLReport.btn({q:x.q,o:x.o,a:x.a,e:x.e},'CLAT PG '+M.title+' - Q'+(i+1));
$('#op').innerHTML=x.o.map((t,k)=>`<label class="cm-opt"><input type="radio" name="o" value="${k}" ${A.ans[i]===k?'checked':''}><b class="l">${L[k]}</b><span></span></label>`).join('');
$('#op').querySelectorAll('.cm-opt span').forEach((s,k)=>s.textContent=x.o[k]);
$('#op').onchange=e=>{A.ans[i]=+e.target.value;A.ats[i]=Date.now()-A.start;save();pal()};
$('#pv').disabled=i===0;$('#nx').disabled=i===TOT-1;$('#mk').textContent=A.mk[i]?'Unmark Review':'Mark for Review';pal();
if(focus){$('#qt').setAttribute('tabindex','-1');$('#qt').focus({preventScroll:true});const r=$('.mt-q').getBoundingClientRect();if(r.top<150||r.top>innerHeight*.6)window.scrollTo({top:scrollY+r.top-160})}}
pg.onclick=e=>{const b=e.target.closest('.cm-p');if(b)show(+b.dataset.i,true)};
$('#pv').onclick=()=>show(A.cur-1,true);$('#nx').onclick=()=>show(A.cur+1,true);
$('#mk').onclick=()=>{A.mk[A.cur]=!A.mk[A.cur];if(!A.mk[A.cur])delete A.mk[A.cur];save();$('#mk').textContent=A.mk[A.cur]?'Unmark Review':'Mark for Review';pal();say(A.mk[A.cur]?'Marked for review':'Review mark removed')};
$('#cl').onclick=()=>{delete A.ans[A.cur];delete A.ats[A.cur];save();$('#op').querySelectorAll('input').forEach(r=>r.checked=false);pal();say('Response cleared')};
const dlg=$('#dlg');
$('#sub').onclick=()=>{const n=Object.keys(A.ans).length,m=Object.keys(A.mk).filter(k=>A.mk[k]).length;$('#dp').textContent=`You have answered ${n} of ${TOT} questions, left ${TOT-n} unanswered and marked ${m} for review. Time left: ${fmt(A.end-Date.now())}. Each wrong answer costs 0.25 marks. You cannot change answers after submitting.`;dlg.showModal?dlg.showModal():dlg.setAttribute('open','')};
$('#no').onclick=()=>dlg.close();$('#yes').onclick=()=>{dlg.close();submit(false)};
window.onbeforeunload=e=>{e.preventDefault();e.returnValue=''};
document.onkeydown=e=>{if(!A||e.ctrlKey||e.metaKey||e.altKey||dlg.open||e.key.length!==1||document.querySelector('.nlr-ov,.nls-ov'))return;const k=e.key.toLowerCase();
if(k==='n'&&A.cur<TOT-1)show(A.cur+1,true);else if(k==='p'&&A.cur>0)show(A.cur-1,true);else if(k==='m')$('#mk').click();
else if('abcd1234'.includes(k)){const r=$('#op').querySelectorAll('input')['abcd1234'.indexOf(k)%4];if(r){r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}))}}};
const tm=$('#tm'),mtr=$('#mtr'),mst=$('#mst'),TH=[30,15,5,1];
function loop(){const rem=A.end-Date.now();if(rem<=0){submit(true);return}
const f=1-rem/DUR,z=zone(f),c=colAt(f);tm.textContent=fmt(rem);tm.style.setProperty('--tm-bg',tint(c,.55));meterSet(mtr,f);
const exp=Math.floor(f*TOT),seen=Object.keys(A.vis).length,d=seen-exp;
const pace=f<.03?'Take a breath and read the first passage carefully.':d>=8?'Ahead of pace':d>=-8?'On pace':`Behind pace by about ${-d} questions`;
mst.innerHTML=`<span class="z" style="--zc:${z.c}">${z.k}</span><span>${z.t} · ${Math.ceil(rem/60000)} min left</span><span class="pc">· ${pace}</span>`;
const th=TH.filter(t=>rem<=t*60000).pop();if(th&&!A.w[th]){TH.forEach(t=>{if(t>=th)A.w[t]=1});save();toast(`${th} minute${th>1?'s':''} remaining`+(th<=15?'. Make every remaining answer count.':''),th<=5)}}
function toast(m,red){const t=document.createElement('div');t.className='cm-toast'+(red?' red':'');t.setAttribute('role','alert');t.textContent='⏱ '+m;app.appendChild(t);say(m);setTimeout(()=>t.remove(),7000)}
clearInterval(tick);tick=setInterval(loop,500);document.addEventListener('visibilitychange',()=>{if(A&&!document.hidden)loop()});
loop();show(A.cur)}

/* ---------- scoring ---------- */
function score(ans){let c=0,w=0;Q.forEach((x,i)=>{if(ans[i]!==undefined)ans[i]===x.a?c++:w++});const net=r2(c-NEG*w),att=c+w;
return{correct:c,wrong:w,unans:TOT-att,marks:net,pct:Math.max(0,net)/MAXM*100,acc:att?c/att*100:0,pen:r2(NEG*w)}}
function submit(auto){clearInterval(tick);if(A.lq!=null){A.tq[A.lq]=(A.tq[A.lq]||0)+Math.max(0,Date.now()-A.t0)}
const taken=auto?DUR:Math.min(DUR,Date.now()-A.start);
const r=Object.assign({at:Date.now(),taken,auto:!!auto,ans:A.ans,tq:A.tq,ats:A.ats},score(A.ans));
sv(RK,r);rm(AK);A=null;window.onbeforeunload=null;document.onkeydown=null;result(r);say(auto?'Time is up. Test submitted automatically.':'Test submitted.')}

/* ---------- assessment ---------- */
const band=p=>p>=75?'Excellent':p>=60?'Very Good':p>=45?'Good':p>=30?'Needs Improvement':'Requires Focused Revision';
const ind=(att,acc)=>!att?['Not attempted','none']:acc>=70?['Strong','ok']:acc>=50?['Developing','mid']:['Weak','bad'];
const SUG={"Constitutional Law":"fundamental rights, basic structure, amendments, federalism and the leading Supreme Court judgments","Jurisprudence":"Hart, Kelsen, Austin, Dworkin, rights and duties, legal personality and the schools of thought","Administrative Law":"natural justice, delegated legislation, judicial review and the grounds of illegality, irrationality and proportionality","Criminal Law":"the general exceptions, inchoate offences, culpable homicide and the corresponding BNS provisions","Criminal Procedure":"cognizance, bail, trial stages, and the BNSS provisions that replaced the CrPC","Law of Evidence":"relevancy, admissions and confessions, burden of proof and electronic evidence under the BSA","Law of Contract":"offer and acceptance, consideration, free consent, frustration and remedies, including specific relief","Law of Torts":"negligence, nuisance, strict and absolute liability, defences and State liability","Property Law":"transfer of property, lease, mortgage, easements and part performance","Family Law":"marriage, divorce, maintenance, succession and the Uniform Civil Code debate","Intellectual Property Law":"copyright, patents, trademarks, geographical indications and personality rights","Public International Law":"sources, treaties, State responsibility, jurisdiction, the law of the sea and dispute settlement","Environmental Law":"the polluter-pays and precautionary principles, EIA, forest and wildlife law and the NGT","Labour Law":"the labour codes, industrial disputes, social security and constitutional protection of workers","Company Law":"incorporation, directors, meetings, corporate governance and oppression and mismanagement","Insolvency and Company Law":"the IBC process, moratorium, creditors' committee and the Companies Act, 2013","Tax Law":"the constitutional scheme of taxation, GST, income tax and key tax judgments","Arbitration Law":"the Arbitration and Conciliation Act, 1996, appointment, interim relief and challenge and enforcement of awards","Civil Procedure and Commercial Disputes":"the CPC, pleadings, limitation and pre-institution mediation under the Commercial Courts Act","Competition Law":"abuse of dominance, anti-competitive agreements and combinations","Consumer Protection Law":"the Consumer Protection Act, 2019, deficiency in service, product liability and unfair trade practices","International Economic Law":"WTO law, trade agreements and investment protection","Securities Law":"SEBI's powers, insider trading and the regulation of the securities market"};
function plan(){const d=Math.ceil((EXAM-Date.now())/864e5);if(d<=0)return null;const P=[[180,'prep-6-months.html','6-month'],[90,'prep-3-months.html','3-month'],[28,'prep-4-weeks.html','4-week'],[14,'prep-2-weeks.html','2-week']];let b=P[0],m=1e9;P.forEach(p=>{const x=Math.abs(Math.log(d/p[0]));if(x<m){m=x;b=p}});return{d,h:b[1],n:b[2]}}
function curve(ats,taken){const W=680,H=300,pl=48,pr=14,pt=14,pb=40,x=m=>pl+m/120*(W-pl-pr),y=v=>H-pb-v/TOT*(H-pt-pb);
const pts=Object.values(ats).map(t=>t/60000).sort((a,b)=>a-b);let d=`M${x(0)} ${y(0)}`;pts.forEach((t,i)=>{d+=` L${x(t)} ${y(i)} L${x(t)} ${y(i+1)}`});d+=` L${x(Math.min(120,taken/60000))} ${y(pts.length)}`;
const gx=[0,30,60,90,120].map(m=>`<text x="${x(m)}" y="${H-pb+20}" text-anchor="middle" font-size="12" font-weight="700" fill="#14183a">${m}</text>`).join(''),gy=[0,30,60,90,120].filter(v=>v<=TOT).map(v=>`<line x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}" stroke="#14183a" stroke-opacity=".12"/><text x="${pl-8}" y="${y(v)+4}" text-anchor="end" font-size="12" font-weight="700" fill="#14183a">${v}</text>`).join('');
return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Chart of questions answered over time compared with an even pace"><rect x="${x(0)}" y="${pt}" width="${x(60)-x(0)}" height="${H-pt-pb}" fill="#2ec4b6" fill-opacity=".14"/><rect x="${x(60)}" y="${pt}" width="${x(100)-x(60)}" height="${H-pt-pb}" fill="#ffd23f" fill-opacity=".2"/><rect x="${x(100)}" y="${pt}" width="${x(120)-x(100)}" height="${H-pt-pb}" fill="#e63946" fill-opacity=".16"/>${gy}${gx}
<text x="${(x(0)+x(60))/2}" y="${pt+14}" text-anchor="middle" font-size="11" font-weight="800" fill="#14183a" opacity=".7">GREEN</text><text x="${(x(60)+x(100))/2}" y="${pt+14}" text-anchor="middle" font-size="11" font-weight="800" fill="#14183a" opacity=".7">AMBER</text><text x="${(x(100)+x(120))/2}" y="${pt+14}" text-anchor="middle" font-size="11" font-weight="800" fill="#14183a" opacity=".7">RED</text>
<line x1="${x(0)}" y1="${y(0)}" x2="${x(120)}" y2="${y(TOT)}" stroke="#14183a" stroke-width="2" stroke-dasharray="6 5" opacity=".7"/><text x="${x(70)}" y="${y(TOT*70/120)-16}" font-size="12" font-weight="800" fill="#14183a">Even pace</text>
<path d="${d}" fill="none" stroke="#3a86ff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${x(Math.min(120,taken/60000))}" cy="${y(pts.length)}" r="6" fill="#3a86ff" stroke="#14183a" stroke-width="2.5"/>
<text x="${pl+(W-pl-pr)/2}" y="${H-4}" text-anchor="middle" font-size="12" font-weight="800" fill="#14183a">Minutes elapsed</text><text transform="translate(12 ${(pt+H-pb)/2}) rotate(-90)" text-anchor="middle" font-size="12" font-weight="800" fill="#14183a">Questions answered</text></svg>`}

function result(r){document.body.classList.remove('cm-exam');const ans=r.ans,tq=r.tq||{},ats=r.ats||{},subs={},diffs={},pas=M.p.map(()=>({c:0,w:0,t:0}));
Q.forEach((x,i)=>{const a=ans[i],S=subs[x.s]=subs[x.s]||{n:0,att:0,c:0,w:0,u:[]};S.n++;const D=diffs[x.d]=diffs[x.d]||{n:0,att:0,c:0,w:0};D.n++;pas[x.pi].t+=tq[i]||0;
if(a===undefined)S.u.push(i+1);else{S.att++;D.att++;if(a===x.a){S.c++;D.c++;pas[x.pi].c++}else{S.w++;D.w++;pas[x.pi].w++}}});
const Ls=Object.entries(subs).map(([s,v])=>({s,...v,acc:v.att?v.c/v.att*100:0,net:r2(v.c-NEG*v.w)})).sort((a,b)=>b.n-a.n||a.s.localeCompare(b.s));
const att=r.correct+r.wrong,strong=Ls.filter(v=>v.att>=4&&v.acc>=70),weak=Ls.filter(v=>v.att>=4&&v.acc<50).sort((a,b)=>a.acc-b.acc),skipped=Ls.filter(v=>v.att===0||v.u.length>=v.n*.6);
const f=r.auto?1:r.taken/DUR,zn=f<.5?'green':f<RED?'amber':'red',zl=zone(f),cat=band(r.pct),pl=plan();
/* accuracy by time bucket */
const bk=[{n:'first hour',a:0,b:60,c:0,t:0},{n:'amber zone (60 to 100 min)',a:60,b:100,c:0,t:0},{n:'red zone (last 20 min)',a:100,b:121,c:0,t:0}];
Object.keys(ats).forEach(k=>{const m=ats[k]/60000,B=bk.find(b=>m>=b.a&&m<b.b);if(!B)return;B.t++;if(ans[k]===Q[k].a)B.c++});
const red=bk[2],first=bk[0];
const tier=r.pct>=75?0:r.pct>=60?1:r.pct>=45?2:r.pct>=30?3:4;
const early=f<.5&&att>=40&&r.acc<55;
let vt,vh,vl=[];
if(early){vt='Rushed finish: slow down and read';vh=`You finished with ${dur(r.taken)} to spare, but only ${r.acc.toFixed(0)}% of your attempted answers were right. In CLAT PG the passage holds the answer; speed without reading costs marks.`}
else if(tier===0){vt=zn==='red'?'Exam-ready score, tight finish':'Exam-ready pace and score';vh=zn==='red'?'Your score is strong, but you needed almost the whole paper. Build a little more speed so you have time to review.':'Strong score with time in hand. Keep practising mixed mocks to stay consistent.'}
else if(tier===1){vt='Almost there';vh='You are close. A few weak subjects and a little more speed will lift you into the top band.'}
else if(tier===2){vt='Preparation needs more time';vh='Your score shows the core is forming, but the gaps are still costing you marks. More revision time, and more timed passage practice, will make the difference.'}
else{vt=tier===3?'Preparation needs significantly more time':'Build your foundation first';vh='This attempt shows large gaps in subject knowledge. Study the syllabus subject by subject, then come back to full mocks.'}
if(r.auto)vl.push(`Time ran out. The meter reached red and you still had <b>${r.unans}</b> question${r.unans===1?'':'s'} unattempted. In the real paper, that is marks left on the table.`);
else vl.push(`You submitted at <b>${dur(r.taken)}</b>, so the time meter ended in the <b>${zn} zone</b>.`);
if(red.t>=4&&first.t>=8&&red.c/red.t+.15<first.c/first.t)vl.push(`Under pressure your accuracy fell from <b>${(first.c/first.t*100).toFixed(0)}%</b> in the first hour to <b>${(red.c/red.t*100).toFixed(0)}%</b> in the red zone. Practise finishing passages on schedule so the last 20 minutes are not a scramble.`);
if(tier>=2&&(zn==='red'||r.auto))vl.push('Running into the red zone <b>and</b> scoring below 60% means the problem is both knowledge and reading speed. Fix both, in that order.');
if(tier>=2&&pl)vl.push(`CLAT PG 2027 is on 6 December 2026, about <b>${pl.d} days</b> away. The <a href="${pl.h}">${pl.n} plan</a> fits your time best.`);
if(r.wrong>0)vl.push(`Negative marking cost you <b>${num(r.pen)}</b> mark${r.pen===1?'':'s'} from ${r.wrong} wrong answer${r.wrong>1?'s':''}. Without them your score would have been ${r.correct}.`);
/* suggestions */
const sg=[];
weak.slice(0,5).forEach(v=>sg.push(`<b>${esc(v.s)}</b>: accuracy was ${v.acc.toFixed(0)}% (${v.c} of ${v.att}). Revise ${esc(SUG[v.s]||'the core topics of this subject')}.`));
strong.slice(0,3).forEach(v=>sg.push(`<b>${esc(v.s)}</b> is a strength at ${v.acc.toFixed(0)}%. Keep it warm with one passage every few days.`));
const E=diffs.Easy;if(E&&E.att>=8&&E.w/E.att>=.3)sg.push(`${E.w} of ${E.att} easy questions were wrong. Easy questions are where careless reading hurts most. Re-read the question stem and every option before you choose. See <a href="what-clat-pg-really-tests.html">what CLAT PG really tests</a>.`);
if(r.wrong>=15&&r.acc<60)sg.push(`With 0.25 negative marking, a blind guess is worth about +0.06 marks, but a guess after removing two options is worth about +0.38. Guess only when you can eliminate at least two options.`);
if(r.unans>=20&&!r.auto)sg.push(`You left <b>${r.unans}</b> questions unanswered with time to spare. If you can remove two options, answer it.`);
const slow=M.p.map((p,i)=>({i,t:pas[i].t})).filter(x=>x.t>BUD*1.5).length;
if(slow>=3)sg.push(`${slow} passages took more than one and a half times the ${ms2(BUD)} budget. Practise reading a passage and answering its questions in ${Math.round(BUD/60000)} minutes.`);
if(weak.length)sg.push('Read the explanations for every wrong answer below, then look up the cases in the <a href="landmark-cases.html">Case Law Vault</a>.');
sg.push(`After a few days of revision, retake this paper or move to ${N<(window.CLATMOCKS||[]).length?`<a href="mock-test-${N+1}.html">Mock Test ${N+1}</a>`:'a fresh set of passages'} and compare your time meter.`);
const tt=Q.filter(tough).length,tc=Q.filter((x,i)=>tough(x)&&ans[i]===x.a).length;
const meterEnd=meterHTML(f);
app.innerHTML=`<div class="cm-res"><div class="cm-rh"><div><span class="pill">RESULT</span><h1 class="cm-h1">CLAT PG <span>${esc(M.title)}</span></h1><p class="cm-sub" style="margin:0">${r.auto?'Submitted automatically when time expired · ':''}Attempted ${new Date(r.at).toLocaleString()}</p></div><div class="cm-row"><button class="cm-btn pri" id="re">Retake test</button>${SH(()=>{const p=NLShare.make.score({what:'CLAT PG '+M.title,score:num(r.marks)+'/'+MAXM,pct:Math.round(r.pct),correct:r.correct,wrong:r.wrong,time:dur(r.taken),url:base(),kind:'score',chips:[r.correct+' correct',r.acc.toFixed(0)+'% accuracy',dur(r.taken)]});p.image=SITE+'clat-pg/og-clat-mock.png';p.desc='Think you can beat it? Take this CLAT PG mock free on NET Law-Verse, with a time meter and a personalised assessment.';return p},{plain:1,cls:'cm-btn',label:'Share my score',aria:'Share my score'})}<a class="cm-btn" href="mock-tests.html">All mock tests</a></div></div>
<div class="cm-score"><div class="cm-big"><b>${num(r.marks)}</b><span>/ ${MAXM} marks</span></div><div><div class="cm-cat">${cat}</div><div style="font-weight:700">${r.pct.toFixed(1)}% score</div></div></div>
<div class="cm-kpis">${[['Total questions',TOT],['Correct',r.correct],['Incorrect',r.wrong],['Unattempted',r.unans],['Negative marks',r.pen?'−'+num(r.pen):'0'],['Accuracy',r.acc.toFixed(1)+'%'],['Time taken',ms2(r.taken)],...(tt?[['Tough correct',tc+' of '+tt]]:[])].map(([a,b])=>`<div class="cm-kpi"><b>${b}</b><span>${a}</span></div>`).join('')}</div>
<section class="cm-verdict v${early?3:tier}" aria-label="Preparation assessment"><span class="vk">PREPARATION ASSESSMENT</span><h2>${vt}</h2><p>${vh}</p>${meterEnd}<p class="cm-mst" style="margin-top:4px"><span class="z" style="--zc:${zl.c}">${zl.k}</span><span>You finished at ${dur(r.taken)} of ${M.minutes} min</span></p><ul>${vl.map(s=>'<li>'+s+'</li>').join('')}</ul></section>
<p class="cm-fine">Marking: 1 mark per correct answer, 0.25 deducted per wrong answer, none for unanswered (as in CLAT PG). Categories (Excellent 75%+, Very Good 60–74, Good 45–59, Needs Improvement 30–44, Requires Focused Revision below 30, on net score) and the preparation assessment are website practice guides, not official CLAT PG or cut-off categories. Results are stored only in this browser and are not tamper-proof.</p>
<h2 class="cm-h">Pace: questions answered over time</h2><div class="cm-ch">${att?curve(ats,r.taken):'<p>No answers were recorded.</p>'}<p class="cap">The dashed line is an even pace of one question per minute. ${bk.map(b=>b.t?`${b.n[0].toUpperCase()+b.n.slice(1)}: ${b.t} answered, ${(b.c/b.t*100).toFixed(0)}% right`:`${b.n[0].toUpperCase()+b.n.slice(1)}: none answered`).join(' · ')}.</p></div>
<h2 class="cm-h">Time spent on each passage</h2><div class="cm-ch"><div class="cm-pt">${M.p.map((p,i)=>{const t=pas[i].t,ra=t/BUD,cl=ra<=1?'#2ec4b6':ra<=1.4?'#ffd23f':'#ff5d8f',w=Math.min(100,t/(BUD*2)*100);return `<div class="cm-ptr"><div class="n"><span>P${i+1}. </span>${esc(p.t.length>52?p.t.slice(0,50)+'…':p.t)}<small>${esc(p.s)}</small></div><div class="b" role="img" aria-label="${ms2(t)} spent, budget ${ms2(BUD)}"><i style="width:${w}%;background:${cl}"></i><em style="left:50%"></em></div><div class="v">${ms2(t)}<br><small>${pas[i].c}/${p.q.length} right</small></div></div>`}).join('')}</div><p class="cap">The black marker is the ${ms2(BUD)} budget per passage (${M.minutes} min ÷ ${NP}). Green is within budget, yellow up to 1.4×, pink over that.</p></div>
<h2 class="cm-h">Subject-wise analysis</h2><div class="cm-tw"><table class="cm-tb"><thead><tr><th>Subject</th><th>Attempted</th><th>Correct</th><th>Incorrect</th><th>Net marks</th><th>Accuracy</th><th>Indicator</th></tr></thead><tbody>${Ls.map(v=>{const[t,c]=ind(v.att,v.acc);return`<tr><th scope="row">${esc(v.s)}</th><td>${v.att}/${v.n}</td><td>${v.c}</td><td>${v.w}</td><td>${num(v.net)}</td><td><div class="cm-pb"><i class="${c}" style="width:${v.acc}%"></i></div>${v.acc.toFixed(0)}%</td><td><span class="cm-ind ${c}">${t}</span></td></tr>`}).join('')}</tbody></table></div>
<h2 class="cm-h">By difficulty</h2><div class="cm-tw"><table class="cm-tb" style="min-width:480px"><thead><tr><th>Level</th><th>Questions</th><th>Attempted</th><th>Correct</th><th>Accuracy</th></tr></thead><tbody>${['Easy','Moderate','Tough'].filter(k=>diffs[k]).map(k=>{const v=diffs[k],a=v.att?v.c/v.att*100:0;return`<tr><th scope="row">${k}</th><td>${v.n}</td><td>${v.att}</td><td>${v.c}</td><td>${v.att?a.toFixed(0)+'%':'–'}</td></tr>`}).join('')}</tbody></table></div>
<h2 class="cm-h">Strengths and weaknesses</h2><div class="cm-two"><div class="cm-box"><h3>Strong subjects</h3><p>${strong.length?strong.map(v=>esc(v.s)+' ('+v.acc.toFixed(0)+'%)').join('; '):'None reached 70% accuracy with at least 4 attempts.'}</p><h3>Needs improvement</h3><p>${weak.length?weak.map(v=>esc(v.s)+' ('+v.acc.toFixed(0)+'%)').join('; '):'No subject fell below 50% accuracy.'}</p></div><div class="cm-box"><h3>Mostly unanswered</h3><p>${skipped.length?skipped.map(v=>esc(v.s)+' ('+v.u.length+' blank)').join('; '):'No subject was left mostly blank.'}</p><h3>Slowest passages</h3><p>${(()=>{const s=M.p.map((p,i)=>({i,t:pas[i].t})).sort((a,b)=>b.t-a.t).slice(0,3).filter(x=>x.t>0);return s.length?s.map(x=>'P'+(x.i+1)+' ('+ms2(x.t)+')').join('; '):'No timing recorded.'})()}</p></div></div>
<h2 class="cm-h">Personalised suggestions</h2><ul class="cm-sg">${sg.map(s=>'<li>'+s+'</li>').join('')}</ul>
<h2 class="cm-h">Review answers</h2><div class="cm-fl" role="group" aria-label="Filter review"><button class="cm-chipb on" data-f="all">All (${TOT})</button><button class="cm-chipb" data-f="ok">Correct (${r.correct})</button><button class="cm-chipb" data-f="bad">Incorrect (${r.wrong})</button><button class="cm-chipb" data-f="un">Unanswered (${r.unans})</button></div><div id="rv"></div></div>`;
const rv=app.querySelector('#rv');
M.p.forEach((p,pi)=>{const g=document.createElement('details');g.className='cm-rg';g.open=true;g.innerHTML='<summary></summary><div class="ptx" data-wm></div><div class="qs"></div>';g.querySelector('summary').textContent=`Passage ${pi+1}: ${p.t}`;g.querySelector('.ptx').textContent=p.x;
const qs=g.querySelector('.qs');
p.q.forEach((_,k)=>{const i=FIRST[pi]+k,x=Q[i],a=ans[i],kk=a===undefined?'un':a===x.a?'ok':'bad',d=document.createElement('article');d.className='mt-rc '+kk;d.dataset.k=kk;
d.innerHTML=`<p class="meta"><b>Q${i+1}</b> · <span class="s"></span> · ${tough(x)?'<b class="cm-chip t">▲ TOUGH</b>':esc(x.d)} · <b class="tg ${kk}">${kk==='ok'?'✓ Correct':kk==='bad'?'✗ Incorrect':'– Unanswered'}</b> · ${tq[i]?ms2(tq[i]):'no time recorded'}</p><p class="cm-qt q"></p><p class="y"></p><p class="c"></p><p class="ex"></p><p class="rp"></p>`;
d.querySelector('.s').textContent=x.s;d.querySelector('.q').textContent=x.q;d.querySelector('.y').textContent='Your answer: '+(a===undefined?'Not answered':L[a]+'. '+x.o[a]);if(kk==='bad')d.querySelector('.y').classList.add('bad');
d.querySelector('.c').textContent='Correct answer: '+L[x.a]+'. '+x.o[x.a];d.querySelector('.ex').textContent='Explanation: '+(x.e||'');
if(window.NLReport)d.querySelector('.rp').innerHTML=NLReport.btn({q:x.q,o:x.o,a:x.a,e:x.e},'CLAT PG '+M.title+' - Q'+(i+1));qs.appendChild(d)});rv.appendChild(g)});
app.querySelector('.cm-fl').onclick=e=>{const b=e.target.closest('button');if(!b)return;app.querySelectorAll('.cm-chipb').forEach(c=>c.classList.toggle('on',c===b));rv.querySelectorAll('.mt-rc').forEach(c=>c.hidden=b.dataset.f!=='all'&&c.dataset.k!==b.dataset.f);rv.querySelectorAll('.cm-rg').forEach(g=>g.hidden=!g.querySelector('.mt-rc:not([hidden])'))};
app.querySelector('#re').onclick=()=>{if(confirm('Start a fresh attempt? Your last result will be replaced when you submit the new one.')){const t=Date.now();A={start:t,end:t+DUR,ans:{},mk:{},vis:{0:1},cur:0,w:{},tq:{},ats:{},t0:t,lq:0};save();exam()}};
window.scrollTo(0,0)}

const a=ld(AK);if(a&&a.end){A=a;A.t0=Date.now();A.tq=A.tq||{};A.ats=A.ats||{};Date.now()>=A.end?submit(true):exam()}else intro();
})();
