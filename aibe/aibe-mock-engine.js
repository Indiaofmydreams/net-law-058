/* AIBE mock test engine: standalone-MCQ exam screen, 210-minute timer, green-to-red time meter,
   no negative marking, pass-mark check, persistence and a curated assessment. Client-side only.
   Adapted from clat-pg/clat-mock-engine.js (passages and negative marking removed, AIBE pattern added). */
(()=>{
const app=document.getElementById('app');if(!app||!window.AIBEMOCK)return;
const M=window.AIBEMOCK,N=M.n,DUR=M.minutes*60000,NEG=M.neg||0;
const Q=M.q,TOT=Q.length,MAXM=TOT,BLK=10,NB=Math.ceil(TOT/BLK),BUD=DUR/NB;
const REDMIN=30,RED=(M.minutes-REDMIN)/M.minutes;
const PASS=Object.keys(M.pass).map(k=>({label:k,marks:M.pass[k]/100*MAXM,pct:M.pass[k]}));
const AK='aibe-mock-'+N+'-attempt',RK='aibe-mock-'+N+'-result',L='ABCD';
const ld=k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}},sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}},rm=k=>{try{localStorage.removeItem(k)}catch{}};
const say=m=>{const l=document.getElementById('live');if(l){l.textContent='';setTimeout(()=>l.textContent=m,60)}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SH=(p,o)=>window.NLShare?NLShare.btn(p,o):'';
const pad=n=>String(n).padStart(2,'0'),fmt=ms=>{const s=Math.ceil(Math.max(0,ms)/1000);return pad(Math.floor(s/3600))+':'+pad(Math.floor(s%3600/60))+':'+pad(s%60)};
const dur=ms=>{const m=Math.floor(ms/60000),s=Math.floor(ms%60000/1000);return m+' min '+s+' s'};
const ms2=ms=>{const s=Math.round(ms/1000);return Math.floor(s/60)+'m '+pad(s%60)+'s'};
const r2=x=>Math.round(x*100)/100,num=x=>(r2(x)).toString();
const base=()=>{const l=document.querySelector('link[rel="canonical"]');return l&&l.href?l.href.split('#')[0]:location.href.split('#')[0].split('?')[0]};
const SITE='https://netlawverse.in/',IMG=SITE+'clat-pg/og-clat-mock.png';
const WHAT='AIBE '+M.title;
let A=null,tick=null;

/* ---------- time meter ---------- */
const STOPS=[[0,[46,196,182]],[.25,[127,211,90]],[.5,[255,210,63]],[.75,[255,159,64]],[1,[230,57,70]]];
function colAt(f){f=Math.min(1,Math.max(0,f));for(let i=1;i<STOPS.length;i++){if(f<=STOPS[i][0]){const a=STOPS[i-1],b=STOPS[i],t=(f-a[0])/(b[0]-a[0]);return a[1].map((v,k)=>Math.round(v+(b[1][k]-v)*t))}}return STOPS[4][1]}
const rgb=c=>`rgb(${c[0]},${c[1]},${c[2]})`,tint=(c,k)=>rgb(c.map(v=>Math.round(v+(255-v)*k)));
const zone=f=>f<.5?{k:'GREEN ZONE',t:'Settle in',c:'#d9f7ec'}:f<RED?{k:'AMBER ZONE',t:'Keep moving',c:'#fff1b8'}:{k:'RED ZONE',t:'Final stretch',c:'#ffd0d6'};
const MARKS=[0,60,120,180].filter(m=>m<M.minutes);
function meterHTML(f,id){return `<div class="cm-meter" ${id?'id="'+id+'"':''} role="img" aria-label="Time meter from green at the start to red at the end of the exam"><div class="cm-mt">${MARKS.slice(1).map(m=>`<i class="tk" style="left:${m/M.minutes*100}%"></i>`).join('')}<i class="rest" style="width:${(1-f)*100}%"></i><i class="pin" style="left:${f*100}%;--pin:${rgb(colAt(f))}"></i></div><div class="cm-ms am-ms" aria-hidden="true"><span style="left:0;transform:none">START</span>${MARKS.slice(1).map(m=>`<span style="left:${m/M.minutes*100}%">${m}</span>`).join('')}<span style="right:0;left:auto;transform:none">${M.minutes} MIN</span></div></div>`}
function meterSet(root,f){const m=root.querySelector('.cm-mt');if(!m)return;m.querySelector('.rest').style.width=(1-f)*100+'%';const p=m.querySelector('.pin');p.style.left=f*100+'%';p.style.setProperty('--pin',rgb(colAt(f)));root.classList.toggle('red',f>=RED)}

/* ---------- intro ---------- */
const sharePayload=()=>NLShare.make.text({kind:'mock',heading:'Share this mock test',title:WHAT+': free timed mock test',desc:`${TOT} questions, ${M.minutes} minutes, ${MAXM} marks, no negative marking. Time meter, pass-mark check and a personalised assessment. Free, no sign-up.`,url:base(),image:IMG,
lines:['📝 AIBE (Bar Exam) '+M.title+' · '+M.theme,`${TOT} MCQs · ${M.minutes} min (3 h 30 min) · ${MAXM} marks · no negative marking`,'Green-to-red time meter, pass-mark check and a personalised assessment. Free, no sign-up.','','Try it 👇'],short:WHAT+': free timed mock with instant assessment.'});
const fresh=()=>{const t=Date.now();return{start:t,end:t+DUR,ans:{},mk:{},vis:{0:1},cur:0,w:{},tq:{},ats:{},t0:t,lq:0}};
function intro(){document.body.classList.remove('cm-exam');const r=ld(RK),next=N<(window.AIBEMOCKS||[]).length;
app.innerHTML=`<div class="cm-intro"><span class="pill">AIBE · ${esc(M.kind.toUpperCase())}</span><h1 class="cm-h1">AIBE <span>${esc(M.title)}</span></h1><p class="cm-sub"><b>${esc(M.theme)}.</b> ${esc(M.blurb)}</p>
<ul class="cm-facts"><li>${TOT} questions</li><li>${M.minutes} minutes (3 h 30 min)</li><li>${MAXM} marks</li><li>No negative marking</li><li>Pass mark ${PASS.map(p=>p.pct+'%').join(' / ')}</li><li>Free</li></ul>
<div class="cm-box cm-demo" aria-label="How the time meter works"><h2>The time meter</h2>${meterHTML(.42)}<p>The pin moves from green to red as your ${M.minutes} minutes run out. Red begins with ${REDMIN} minutes left. That is about 2 minutes 6 seconds for each question. Your final assessment shows where on the meter you finished and how you compare with the pass mark.</p></div>
<div class="cm-box"><h2>Before you begin</h2><ul class="cm-rules"><li>The paper follows the AIBE pattern: ${TOT} standalone multiple-choice questions, one mark for each correct answer and <b>no negative marking</b>. Never leave a question blank: a guess costs nothing.</li><li>The timer starts when you press Start and keeps running on its own clock, even if you switch tabs. You are warned at 60, 30, 15, 5 and 1 minute, and the test submits automatically at zero.</li><li>If you refresh or close the page, your attempt and remaining time are restored from this browser. The timer does not pause while you are away.</li><li>Recent AIBE editions have allowed Bare Acts in the hall. Use yours here only if your edition's rules allow it, and do not search online. Read the Bar Council of India notification and your admit card.</li><li>Questions follow the law as on ${esc(M.asOn||'19 November 2026')}, with the BNS, BNSS, BSA and the labour codes treated as in force.</li><li>Progress is saved in this browser only. Clearing site data, private browsing or another device will lose it. This is a practice tool, not a proctored exam.</li></ul></div>
<div class="cm-row" style="margin-top:22px"><button class="cm-btn pri" id="go">Start Mock Test →</button>${r?'<button class="cm-btn" id="last">View last result</button>':''}<a class="cm-btn" href="mock-tests.html">All mock tests</a>${SH(sharePayload,{plain:1,cls:'cm-btn',label:'Share this test',aria:'Share this mock test'})}</div></div>`;
app.querySelector('#go').onclick=()=>{A=fresh();save();exam()};
const l=app.querySelector('#last');if(l)l.onclick=()=>result(r);window.scrollTo(0,0)}
const save=()=>sv(AK,A);

/* ---------- exam ---------- */
function exam(){
document.body.classList.add('cm-exam');
app.innerHTML=`<div class="cm-top"><div class="cm-topr"><div class="cm-id"><b>${esc(WHAT)}</b><span id="qn"></span></div><div class="cm-timer" id="tm" role="timer" aria-label="Time remaining">--:--:--</div><div class="cm-row">${SH(sharePayload,{plain:1,icon:1,cls:'cm-sh',aria:'Share this mock test'})}<button class="cm-btn dng sm" id="sub">Submit Test</button></div></div>${meterHTML(0,'mtr')}<p class="cm-mst" id="mst"></p></div>
<div class="cm-prog" aria-hidden="true"><i id="pb"></i></div>
<div class="cm-grid am" id="gr"><section class="mt-q" data-wm aria-label="Question"><div class="am-qh"><p class="cm-meta" id="meta"></p><span class="cm-fs" role="group" aria-label="Text size"><button data-d="-1" aria-label="Smaller text">A−</button><button data-d="1" aria-label="Larger text">A+</button></span></div><h2 class="cm-qt" id="qt"></h2><div class="cm-opts" id="op" role="radiogroup" aria-labelledby="qt"></div>
<div class="cm-acts"><button class="cm-btn" id="pv">← Previous</button><button class="cm-btn" id="mk"></button><button class="cm-btn" id="cl">Clear Response</button><span id="rpw"></span><button class="cm-btn pri" id="nx">Next →</button></div></section>
<aside class="cm-side"><div class="cm-pal" aria-label="Question palette"><h3>Question palette</h3><div class="cm-pgs" id="pg"></div>
<div class="am-jump"><button class="cm-btn sm" id="ju">Next unanswered</button><button class="cm-btn sm" id="jm">Next marked</button></div>
<ul class="cm-leg"><li><i class="cm-p"></i>Not visited</li><li><i class="cm-p va"></i>Visited, unanswered</li><li><i class="cm-p an"></i>Answered</li><li><i class="cm-p mr"></i>Marked for review</li><li><i class="cm-p amr"></i>Answered and marked</li></ul><p class="cm-cnt" id="cnt"></p><p class="cm-cnt">Keys: A–D select · N next · P previous · M mark</p></div></aside></div>
<dialog id="dlg" class="cm-dlg" aria-labelledby="dt"><h2 id="dt">Submit test?</h2><p id="dp"></p><div class="cm-row"><button class="cm-btn" id="no">Continue test</button><button class="cm-btn" id="rvu">Go to unanswered</button><button class="cm-btn dng" id="yes">Yes, submit</button></div></dialog>`;
const $=s=>app.querySelector(s),pg=$('#pg'),gr=$('#gr');
try{const fs=+localStorage.getItem('aibe-fs');if(fs>=.85&&fs<=1.5)gr.style.setProperty('--cm-fs',fs)}catch{}
pg.innerHTML=Array.from({length:NB},(_,b)=>{const a=b*BLK,z=Math.min(TOT,a+BLK);return `<div class="cm-pgr"><span class="cm-pgl">${a+1}–${z}</span><div class="cm-pgb">${Array.from({length:z-a},(_,k)=>`<button class="cm-p" data-i="${a+k}">${a+k+1}</button>`).join('')}</div></div>`}).join('');
const st=i=>{const a=A.ans[i]!==undefined,m=!!A.mk[i];return a&&m?'amr':m?'mr':a?'an':A.vis[i]?'va':'nv'};
const SN={nv:'not visited',va:'visited, unanswered',an:'answered',mr:'marked for review',amr:'answered and marked for review'};
function pal(){pg.querySelectorAll('.cm-p').forEach(b=>{const i=+b.dataset.i,s=st(i);b.className='cm-p '+(s==='nv'?'':s)+(i===A.cur?' cur':'');b.setAttribute('aria-label',`Question ${i+1}, ${SN[s]}`);i===A.cur?b.setAttribute('aria-current','true'):b.removeAttribute('aria-current')});
const n=Object.keys(A.ans).length,m=Object.keys(A.mk).filter(k=>A.mk[k]).length;$('#cnt').textContent=`${n} answered · ${TOT-n} unanswered · ${m} marked`;$('#pb').style.width=n/TOT*100+'%'}
function flush(){const n=Date.now();if(A.lq!=null)A.tq[A.lq]=(A.tq[A.lq]||0)+Math.max(0,n-A.t0);A.t0=n}
function show(i,focus){flush();A.cur=i;A.lq=i;A.vis[i]=1;save();const x=Q[i];
$('#qn').textContent=`Question ${i+1} of ${TOT}`;
$('#meta').innerHTML=`<span class="cm-chip">Q${i+1}</span><span>${esc(x.s)}</span>`;
$('#qt').textContent=x.q;
if(window.NLReport)$('#rpw').innerHTML=NLReport.btn({q:x.q,o:x.o,a:x.a,e:x.e},WHAT+' - Q'+(i+1));
$('#op').innerHTML=x.o.map((t,k)=>`<label class="cm-opt"><input type="radio" name="o" value="${k}" ${A.ans[i]===k?'checked':''}><b class="l">${L[k]}</b><span></span></label>`).join('');
$('#op').querySelectorAll('.cm-opt span').forEach((s,k)=>s.textContent=x.o[k]);
$('#op').onchange=e=>{A.ans[i]=+e.target.value;A.ats[i]=Date.now()-A.start;save();pal()};
$('#pv').disabled=i===0;$('#nx').disabled=i===TOT-1;$('#mk').textContent=A.mk[i]?'Unmark Review':'Mark for Review';pal();
if(focus){$('#qt').setAttribute('tabindex','-1');$('#qt').focus({preventScroll:true});const r=$('.mt-q').getBoundingClientRect();if(r.top<150||r.top>innerHeight*.6)window.scrollTo({top:scrollY+r.top-160})}}
$('.cm-fs').onclick=e=>{const b=e.target.closest('button');if(!b)return;let v=Math.min(1.5,Math.max(.85,(+getComputedStyle(gr).getPropertyValue('--cm-fs')||1)+.1*b.dataset.d));v=Math.round(v*100)/100;gr.style.setProperty('--cm-fs',v);try{localStorage.setItem('aibe-fs',v)}catch{}};
pg.onclick=e=>{const b=e.target.closest('.cm-p');if(b)show(+b.dataset.i,true)};
const nextWhere=f=>{for(let k=1;k<=TOT;k++){const i=(A.cur+k)%TOT;if(f(i))return i}return -1};
$('#ju').onclick=()=>{const i=nextWhere(i=>A.ans[i]===undefined);if(i<0)say('Every question is answered');else show(i,true)};
$('#jm').onclick=()=>{const i=nextWhere(i=>A.mk[i]);if(i<0)say('No questions are marked for review');else show(i,true)};
$('#pv').onclick=()=>show(A.cur-1,true);$('#nx').onclick=()=>show(A.cur+1,true);
$('#mk').onclick=()=>{A.mk[A.cur]=!A.mk[A.cur];if(!A.mk[A.cur])delete A.mk[A.cur];save();$('#mk').textContent=A.mk[A.cur]?'Unmark Review':'Mark for Review';pal();say(A.mk[A.cur]?'Marked for review':'Review mark removed')};
$('#cl').onclick=()=>{delete A.ans[A.cur];delete A.ats[A.cur];save();$('#op').querySelectorAll('input').forEach(r=>r.checked=false);pal();say('Response cleared')};
const dlg=$('#dlg');
$('#sub').onclick=()=>{const n=Object.keys(A.ans).length,m=Object.keys(A.mk).filter(k=>A.mk[k]).length,u=TOT-n;$('#dp').textContent=`You have answered ${n} of ${TOT} questions, left ${u} unanswered and marked ${m} for review. Time left: ${fmt(A.end-Date.now())}. There is no negative marking, so ${u?'every unanswered question is a mark you can still try for. ':'you have answered everything. '}You cannot change answers after submitting.`;$('#rvu').hidden=!u;dlg.showModal?dlg.showModal():dlg.setAttribute('open','')};
$('#no').onclick=()=>dlg.close();$('#rvu').onclick=()=>{dlg.close();$('#ju').click()};$('#yes').onclick=()=>{dlg.close();submit(false)};
window.onbeforeunload=e=>{e.preventDefault();e.returnValue=''};
document.onkeydown=e=>{if(!A||e.ctrlKey||e.metaKey||e.altKey||dlg.open||e.key.length!==1||document.querySelector('.nlr-ov,.nls-ov'))return;const k=e.key.toLowerCase();
if(k==='n'&&A.cur<TOT-1)show(A.cur+1,true);else if(k==='p'&&A.cur>0)show(A.cur-1,true);else if(k==='m')$('#mk').click();
else if('abcd1234'.includes(k)){const r=$('#op').querySelectorAll('input')['abcd1234'.indexOf(k)%4];if(r){r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}))}}};
const tm=$('#tm'),mtr=$('#mtr'),mst=$('#mst'),TH=[60,30,15,5,1];
function loop(){const rem=A.end-Date.now();if(rem<=0){submit(true);return}
const f=1-rem/DUR,z=zone(f),c=colAt(f);tm.textContent=fmt(rem);tm.style.setProperty('--tm-bg',tint(c,.55));meterSet(mtr,f);
const exp=Math.floor(f*TOT),seen=Object.keys(A.vis).length,d=seen-exp;
const pace=f<.03?'Take a breath and read the first question carefully.':d>=8?'Ahead of pace':d>=-8?'On pace':`Behind pace by about ${-d} questions`;
mst.innerHTML=`<span class="z" style="--zc:${z.c}">${z.k}</span><span>${z.t} · ${Math.ceil(rem/60000)} min left</span><span class="pc">· ${pace}</span>`;
const th=TH.filter(t=>rem<=t*60000).pop();if(th&&!A.w[th]){TH.forEach(t=>{if(t>=th)A.w[t]=1});save();toast(`${th} minute${th>1?'s':''} remaining`+(th<=15?'. Answer every blank: there is no negative marking.':''),th<=5)}}
function toast(m,red){const t=document.createElement('div');t.className='cm-toast'+(red?' red':'');t.setAttribute('role','alert');t.textContent='⏱ '+m;app.appendChild(t);say(m);setTimeout(()=>t.remove(),7000)}
clearInterval(tick);tick=setInterval(loop,500);document.addEventListener('visibilitychange',()=>{if(A&&!document.hidden)loop()});
loop();show(A.cur);window.scrollTo(0,0)}

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
const SUG={"Constitutional Law":["constitutional-law","fundamental rights, Articles 12 to 35, basic structure, emergency, federalism and the leading Supreme Court judgments"],"Criminal Procedure (BNSS)":["crpc-bnss","arrest, bail, FIR, investigation timelines, trial stages, appeals and the BNSS sections that replaced the CrPC"],"Criminal Law (BNS)":["ipc-bns","general exceptions, offences against the body and property, and the BNS section numbers that replaced the IPC"],"Civil Procedure (CPC)":["cpc-limitation","jurisdiction, pleadings, interim orders, execution, appeals and the Orders and Rules most often asked"],"Evidence (BSA)":["evidence-bsa","relevancy, admissions and confessions, burden of proof, privilege and electronic evidence under the BSA"],"Family Law":["family-law","Hindu, Muslim and Christian personal law: marriage, divorce, maintenance, adoption and succession"],"Professional Ethics & Advocates Act":["professional-ethics","the Advocates Act, BCI Rules on duties to court, client and colleagues, misconduct and contempt of court"],"Contract, Specific Relief & Sale of Goods":["contract-property-ni-act","formation, free consent, void and voidable agreements, remedies, specific relief, sale of goods, bailment and surety"],"Property Law":["contract-property-ni-act","sale, mortgage, lease, gift, easements and the Registration Act"],"Alternative Dispute Resolution":["adr","the Arbitration and Conciliation Act, Lok Adalat, mediation and the Legal Services Authorities Act"],"Jurisprudence":[null,"the schools of jurisprudence, rights and duties, legal personality, possession and ownership"],"Labour Law":["labour-industrial-law","the four labour codes, industrial disputes, wages, social security and workplace safety"],"Cyber Law":["cyber-law","the Information Technology Act: offences, penalties, intermediaries and digital signatures"],"Land Acquisition Law":["land-acquisition","the RFCTLARR Act, 2013: consent, social impact assessment, compensation and rehabilitation"],"Administrative Law":["administrative-law","natural justice, delegated legislation, judicial review and the Lokpal"],"Company Law":["company-law","incorporation, directors, meetings, shares and the doctrines of corporate personality and indoor management"],"Environmental Law":["environmental-law","the pollution control Acts, EIA, the NGT and the precautionary and polluter-pays principles"],"Intellectual Property Law":["intellectual-property-laws","patents, copyright, trade marks, designs and passing off"],"Interpretation of Statutes":[null,"the literal, golden and mischief rules, ejusdem generis, provisos and the General Clauses Act"],"Public International Law":["pil","sources, treaties, State responsibility, the ICJ, the law of the sea and diplomatic law"],"Taxation":["taxation","the constitutional scheme of taxation, GST and the Income-tax Act, 2025"],"Tort & Consumer Law":["torts-mv-act-consumer-protection","negligence, nuisance, strict and absolute liability, defences and the Consumer Protection Act, 2019"],"Limitation Law":["cpc-limitation","the periods of limitation for suits and appeals, condonation of delay and exclusion of time"]};
const sug=s=>SUG[s]||[null,'the core provisions and leading cases of this subject'];
const notes=s=>{const x=sug(s)[0];return x?` <a href="notes/${x}/">Read the notes</a>.`:' See the <a href="syllabus.html">syllabus</a>.'};
function curve(ats,taken){const W=680,H=300,pl=48,pr=14,pt=14,pb=40,T=M.minutes,x=m=>pl+m/T*(W-pl-pr),y=v=>H-pb-v/TOT*(H-pt-pb);
const pts=Object.values(ats).map(t=>t/60000).sort((a,b)=>a-b);let d=`M${x(0)} ${y(0)}`;pts.forEach((t,i)=>{d+=` L${x(t)} ${y(i)} L${x(t)} ${y(i+1)}`});d+=` L${x(Math.min(T,taken/60000))} ${y(pts.length)}`;
const gx=[0,60,120,180,T].map(m=>`<text x="${x(m)}" y="${H-pb+20}" text-anchor="middle" font-size="12" font-weight="700" fill="#14183a">${m}</text>`).join(''),gy=[0,20,40,60,80,100].filter(v=>v<=TOT).map(v=>`<line x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}" stroke="#14183a" stroke-opacity=".12"/><text x="${pl-8}" y="${y(v)+4}" text-anchor="end" font-size="12" font-weight="700" fill="#14183a">${v}</text>`).join('');
const gm=T*.5,rm=T-REDMIN;
return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Chart of questions answered over time compared with an even pace"><rect x="${x(0)}" y="${pt}" width="${x(gm)-x(0)}" height="${H-pt-pb}" fill="#2ec4b6" fill-opacity=".14"/><rect x="${x(gm)}" y="${pt}" width="${x(rm)-x(gm)}" height="${H-pt-pb}" fill="#ffd23f" fill-opacity=".2"/><rect x="${x(rm)}" y="${pt}" width="${x(T)-x(rm)}" height="${H-pt-pb}" fill="#e63946" fill-opacity=".16"/>${gy}${gx}
<text x="${(x(0)+x(gm))/2}" y="${pt+14}" text-anchor="middle" font-size="11" font-weight="800" fill="#14183a" opacity=".7">GREEN</text><text x="${(x(gm)+x(rm))/2}" y="${pt+14}" text-anchor="middle" font-size="11" font-weight="800" fill="#14183a" opacity=".7">AMBER</text><text x="${(x(rm)+x(T))/2}" y="${pt+14}" text-anchor="middle" font-size="11" font-weight="800" fill="#14183a" opacity=".7">RED</text>
<line x1="${x(0)}" y1="${y(0)}" x2="${x(T)}" y2="${y(TOT)}" stroke="#14183a" stroke-width="2" stroke-dasharray="6 5" opacity=".7"/><text x="${x(T*.58)}" y="${y(TOT*.58)-14}" font-size="12" font-weight="800" fill="#14183a">Even pace</text>
<path d="${d}" fill="none" stroke="#3a86ff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${x(Math.min(T,taken/60000))}" cy="${y(pts.length)}" r="6" fill="#3a86ff" stroke="#14183a" stroke-width="2.5"/>
<text x="${pl+(W-pl-pr)/2}" y="${H-4}" text-anchor="middle" font-size="12" font-weight="800" fill="#14183a">Minutes elapsed</text><text transform="translate(12 ${(pt+H-pb)/2}) rotate(-90)" text-anchor="middle" font-size="12" font-weight="800" fill="#14183a">Questions answered</text></svg>`}

function result(r){document.body.classList.remove('cm-exam');const ans=r.ans,tq=r.tq||{},ats=r.ats||{},subs={},blk=Array.from({length:NB},()=>({c:0,w:0,t:0}));
Q.forEach((x,i)=>{const a=ans[i],S=subs[x.s]=subs[x.s]||{n:0,att:0,c:0,w:0,u:[]};S.n++;const B=blk[Math.floor(i/BLK)];B.t+=tq[i]||0;
if(a===undefined)S.u.push(i+1);else{S.att++;if(a===x.a){S.c++;B.c++}else{S.w++;B.w++}}});
const Ls=Object.entries(subs).map(([s,v])=>({s,...v,acc:v.att?v.c/v.att*100:0,lost:v.n-v.c})).sort((a,b)=>b.lost-a.lost||a.s.localeCompare(b.s));
const att=r.correct+r.wrong,strong=Ls.filter(v=>v.att>=4&&v.acc>=70),weak=Ls.filter(v=>v.att>=4&&v.acc<50).sort((a,b)=>a.acc-b.acc),skipped=Ls.filter(v=>v.att===0||v.u.length>=v.n*.6);
const f=r.auto?1:r.taken/DUR,zn=f<.5?'green':f<RED?'amber':'red',zl=zone(f),cat=band(r.pct);
const pg=PASS.map(p=>({...p,ok:r.marks>=p.marks,gap:r2(Math.abs(r.marks-p.marks))}));const top=PASS[0],topOk=r.marks>=top.marks;
const bk=[{n:'first half of the paper',a:0,b:M.minutes*.5,c:0,t:0},{n:'amber zone',a:M.minutes*.5,b:M.minutes-REDMIN,c:0,t:0},{n:`red zone (last ${REDMIN} min)`,a:M.minutes-REDMIN,b:M.minutes+1,c:0,t:0}];
Object.keys(ats).forEach(k=>{const m=ats[k]/60000,B=bk.find(b=>m>=b.a&&m<b.b);if(!B)return;B.t++;if(ans[k]===Q[k].a)B.c++});
const red=bk[2],first=bk[0];
const tier=r.pct>=75?0:r.pct>=60?1:r.pct>=45?2:r.pct>=30?3:4;
const early=f<.5&&att>=40&&r.acc<55;
let vt,vh,vl=[];
if(early){vt='Rushed finish: slow down and read';vh=`You finished with ${dur(DUR-r.taken)} to spare, but only ${r.acc.toFixed(0)}% of your attempted answers were right. AIBE options are built on one-word differences. Use the spare time to re-read each stem and option, and check the provision if your edition allows Bare Acts.`}
else if(tier===0){vt=zn==='red'?'Exam-ready score, tight finish':'Exam-ready pace and score';vh=zn==='red'?'Your score is strong, but you needed almost the whole paper. Build a little more speed so you have time to review.':'Strong score with time in hand. Keep sitting mixed mocks to stay consistent.'}
else if(tier===1){vt='Comfortably above the pass mark';vh='You have a safe margin on the reported pass marks. Fix your weakest subjects to make it wider.'}
else if(tier===2){vt='Above the pass mark, but the margin is thin';vh='You cleared the reported pass mark, but a harder paper on the day could push you below it. Aim for 60 or more in mocks before you rely on this.'}
else{vt=tier===3?'Below the pass mark: preparation needs more time':'Build your foundation first';vh=tier===3?'You are some distance from the pass mark. The subject table below shows exactly where marks were lost. Fix those subjects first.':'This attempt shows large gaps in subject knowledge. Study the syllabus subject by subject, then come back to full mocks.'}
vl.push(pg.map(p=>`${p.ok?'Above':'Below'} the ${p.pct}% pass mark for <b>${esc(p.label)}</b> by <b>${num(p.gap)}</b> mark${p.gap===1?'':'s'}`).join('; ')+'.');
if(r.auto)vl.push(`Time ran out. The meter reached red and you still had <b>${r.unans}</b> question${r.unans===1?'':'s'} unattempted. Next time, answer the quick ones first and guess before the last ${REDMIN} minutes begin.`);
else vl.push(`You submitted at <b>${dur(r.taken)}</b> of ${M.minutes} minutes, so the time meter ended in the <b>${zn} zone</b>.`);
if(r.unans>0)vl.push(`You left <b>${r.unans}</b> question${r.unans===1?'':'s'} blank. There is no negative marking, so a blind guess has a 1 in 4 chance of a mark. A blank can never score.`);
if(red.t>=4&&first.t>=8&&red.c/red.t+.15<first.c/first.t)vl.push(`Under pressure your accuracy fell from <b>${(first.c/first.t*100).toFixed(0)}%</b> in the first half to <b>${(red.c/red.t*100).toFixed(0)}%</b> in the red zone. Practise a steady pace so the last ${REDMIN} minutes are not a scramble.`);
if(tier>=3&&(zn==='red'||r.auto))vl.push('Running into the red zone <b>and</b> scoring below the pass mark means the problem is both knowledge and speed. Fix knowledge first.');
const sg=[];
weak.slice(0,5).forEach(v=>sg.push(`<b>${esc(v.s)}</b>: accuracy was ${v.acc.toFixed(0)}% (${v.c} of ${v.att}). Revise ${esc(sug(v.s)[1])}.${notes(v.s)}`));
strong.slice(0,3).forEach(v=>sg.push(`<b>${esc(v.s)}</b> is a strength at ${v.acc.toFixed(0)}%. Keep it warm with a few questions every few days.`));
if(r.unans>=5)sg.push(`Answer every question. With no negative marking, even a guess after removing one option raises your odds from 25% to 33%. Leaving ${r.unans} blank cost you an expected ${num(r.unans*.25)} marks or more.`);
if(r.wrong>=15&&r.acc<60)sg.push(`${r.wrong} wrong answers means many options looked right. Re-read the explanations for every wrong answer below and note the exact words that decide the answer: <i>only</i>, <i>not</i>, <i>within</i>, <i>at least</i>.`);
const slow=blk.filter(b=>b.t>BUD*1.5).length;
if(slow>=3)sg.push(`${slow} blocks of ${BLK} questions took more than one and a half times the ${ms2(BUD)} budget. If a question has you stuck for more than 3 minutes, mark it, guess, and come back.`);
sg.push(`Use the <a href="practice.html">Practice Arena</a> to drill weak subjects, then retake this paper or move to ${N<(window.AIBEMOCKS||[]).length?`<a href="mock-test-${N+1}.html">Mock Test ${N+1}</a>`:'an earlier mock you have not yet revised'} and compare your time meter.`);
const meterEnd=meterHTML(f);
app.innerHTML=`<div class="cm-res"><div class="cm-rh"><div><span class="pill">RESULT</span><h1 class="cm-h1">AIBE <span>${esc(M.title)}</span></h1><p class="cm-sub" style="margin:0">${r.auto?'Submitted automatically when time expired · ':''}Attempted ${new Date(r.at).toLocaleString()}</p></div><div class="cm-row"><button class="cm-btn pri" id="re">Retake test</button>${SH(()=>{const p=NLShare.make.score({what:WHAT,score:num(r.marks)+'/'+MAXM,pct:Math.round(r.pct),correct:r.correct,wrong:r.wrong,time:dur(r.taken),url:base(),kind:'score',chips:[r.correct+' correct',r.acc.toFixed(0)+'% accuracy',dur(r.taken)]});p.image=IMG;p.desc='Think you can beat it? Take this AIBE mock free on NET Law-Verse, with a time meter and a personalised assessment.';return p},{plain:1,cls:'cm-btn',label:'Share my score',aria:'Share my score'})}<button class="cm-btn" id="pr">Print / save PDF</button><a class="cm-btn" href="mock-tests.html">All mock tests</a></div></div>
<div class="cm-score"><div class="cm-big"><b>${num(r.marks)}</b><span>/ ${MAXM} marks</span></div><div><div class="cm-cat">${cat}</div><div style="font-weight:700">${r.pct.toFixed(1)}% score</div></div><div class="am-pass">${pg.map(p=>`<span class="am-pc ${p.ok?'ok':'no'}"><b>${p.ok?'✓ PASS':'✗ BELOW'}</b> ${esc(p.label)} · ${p.pct}%</span>`).join('')}</div></div>
<div class="cm-kpis">${[['Total questions',TOT],['Correct',r.correct],['Incorrect',r.wrong],['Unattempted',r.unans],['Accuracy',r.acc.toFixed(1)+'%'],['Time taken',ms2(r.taken)],['Avg per question',att?ms2(r.taken/Math.max(1,att)):'–']].map(([a,b])=>`<div class="cm-kpi"><b>${b}</b><span>${a}</span></div>`).join('')}</div>
<section class="cm-verdict v${early?3:tier}" aria-label="Preparation assessment"><span class="vk">PREPARATION ASSESSMENT</span><h2>${vt}</h2><p>${vh}</p>${meterEnd}<p class="cm-mst" style="margin-top:4px"><span class="z" style="--zc:${zl.c}">${zl.k}</span><span>You finished at ${dur(r.taken)} of ${M.minutes} min</span></p><ul>${vl.map(s=>'<li>'+s+'</li>').join('')}</ul></section>
<p class="cm-fine">Marking: 1 mark per correct answer, nothing deducted for wrong or unanswered questions (as reported for recent AIBE editions). Pass marks (${PASS.map(p=>p.pct+'% for '+esc(p.label)).join(', ')}) are as reported for recent editions: confirm them in the current Bar Council of India notification. Categories (Excellent 75%+, Very Good 60–74, Good 45–59, Needs Improvement 30–44, Requires Focused Revision below 30) and the preparation assessment are website practice guides, not official BCI categories. Results are stored only in this browser and are not tamper-proof.</p>
<h2 class="cm-h">Pace: questions answered over time</h2><div class="cm-ch">${att?curve(ats,r.taken):'<p>No answers were recorded.</p>'}<p class="cap">The dashed line is an even pace of one question every ${num(M.minutes/TOT)} minutes. ${bk.map(b=>b.t?`${b.n[0].toUpperCase()+b.n.slice(1)}: ${b.t} answered, ${(b.c/b.t*100).toFixed(0)}% right`:`${b.n[0].toUpperCase()+b.n.slice(1)}: none answered`).join(' · ')}.</p></div>
<h2 class="cm-h">Time spent on each block of ${BLK} questions</h2><div class="cm-ch"><div class="cm-pt">${blk.map((b,i)=>{const t=b.t,ra=t/BUD,cl=ra<=1?'#2ec4b6':ra<=1.4?'#ffd23f':'#ff5d8f',w=Math.min(100,t/(BUD*2)*100),a=i*BLK+1,z=Math.min(TOT,a+BLK-1);return `<div class="cm-ptr"><div class="n"><span>Q${a}–${z}</span></div><div class="b" role="img" aria-label="${ms2(t)} spent, budget ${ms2(BUD)}"><i style="width:${w}%;background:${cl}"></i><em style="left:50%"></em></div><div class="v">${ms2(t)}<br><small>${b.c}/${z-a+1} right</small></div></div>`}).join('')}</div><p class="cap">The black marker is the ${ms2(BUD)} budget for each block (${M.minutes} min ÷ ${NB}). Green is within budget, yellow up to 1.4×, pink over that.</p></div>
<h2 class="cm-h">Subject-wise analysis</h2><p class="am-cap">Sorted by marks lost, so the subjects that cost you most come first.</p><div class="cm-tw"><table class="cm-tb"><thead><tr><th>Subject</th><th>Attempted</th><th>Correct</th><th>Incorrect</th><th>Marks lost</th><th>Accuracy</th><th>Indicator</th></tr></thead><tbody>${Ls.map(v=>{const[t,c]=ind(v.att,v.acc);return`<tr><th scope="row">${esc(v.s)}</th><td>${v.att}/${v.n}</td><td>${v.c}</td><td>${v.w}</td><td>${v.lost}</td><td><div class="cm-pb"><i class="${c}" style="width:${v.acc}%"></i></div>${v.acc.toFixed(0)}%</td><td><span class="cm-ind ${c}">${t}</span></td></tr>`}).join('')}</tbody></table></div>
<h2 class="cm-h">Strengths and weaknesses</h2><div class="cm-two"><div class="cm-box"><h3>Strong subjects</h3><p>${strong.length?strong.map(v=>esc(v.s)+' ('+v.acc.toFixed(0)+'%)').join('; '):'None reached 70% accuracy with at least 4 attempts.'}</p><h3>Needs improvement</h3><p>${weak.length?weak.map(v=>esc(v.s)+' ('+v.acc.toFixed(0)+'%)').join('; '):'No subject fell below 50% accuracy.'}</p></div><div class="cm-box"><h3>Mostly unanswered</h3><p>${skipped.length?skipped.map(v=>esc(v.s)+' ('+v.u.length+' blank)').join('; '):'No subject was left mostly blank.'}</p><h3>Slowest blocks</h3><p>${(()=>{const s=blk.map((b,i)=>({i,t:b.t})).sort((a,b)=>b.t-a.t).slice(0,3).filter(x=>x.t>0);return s.length?s.map(x=>'Q'+(x.i*BLK+1)+'–'+Math.min(TOT,x.i*BLK+BLK)+' ('+ms2(x.t)+')').join('; '):'No timing recorded.'})()}</p></div></div>
<h2 class="cm-h">Personalised suggestions</h2><ul class="cm-sg">${sg.map(s=>'<li>'+s+'</li>').join('')}</ul>
<h2 class="cm-h">Review answers</h2><div class="cm-fl" role="group" aria-label="Filter review"><button class="cm-chipb on" data-f="all">All (${TOT})</button><button class="cm-chipb" data-f="ok">Correct (${r.correct})</button><button class="cm-chipb" data-f="bad">Incorrect (${r.wrong})</button><button class="cm-chipb" data-f="un">Unanswered (${r.unans})</button><label class="am-sel"><span class="sr-only">Filter by subject</span><select id="fs"><option value="">All subjects</option>${Ls.slice().sort((a,b)=>a.s.localeCompare(b.s)).map(v=>`<option value="${esc(v.s)}">${esc(v.s)}</option>`).join('')}</select></label></div><div id="rv"></div></div>`;
const rv=app.querySelector('#rv');
Q.forEach((x,i)=>{const a=ans[i],kk=a===undefined?'un':a===x.a?'ok':'bad',d=document.createElement('article');d.className='mt-rc '+kk;d.dataset.k=kk;d.dataset.s=x.s;
d.innerHTML=`<p class="meta"><b>Q${i+1}</b> · <span class="s"></span> · <b class="tg ${kk}">${kk==='ok'?'✓ Correct':kk==='bad'?'✗ Incorrect':'– Unanswered'}</b> · ${tq[i]?ms2(tq[i]):'no time recorded'}</p><p class="cm-qt q"></p><div class="am-ro"></div><p class="y"></p><p class="c"></p><p class="ex"></p><p class="rp"></p>`;
d.querySelector('.s').textContent=x.s;d.querySelector('.q').textContent=x.q;
d.querySelector('.am-ro').innerHTML=x.o.map((t,k)=>`<div class="am-o${k===x.a?' right':''}${k===a&&a!==x.a?' wrong':''}"><b>${L[k]}</b><span></span></div>`).join('');d.querySelectorAll('.am-o span').forEach((s,k)=>s.textContent=x.o[k]);
d.querySelector('.y').textContent='Your answer: '+(a===undefined?'Not answered':L[a]+'. '+x.o[a]);if(kk==='bad')d.querySelector('.y').classList.add('bad');
d.querySelector('.c').textContent='Correct answer: '+L[x.a]+'. '+x.o[x.a];d.querySelector('.ex').textContent='Explanation: '+(x.e||'');
if(window.NLReport)d.querySelector('.rp').innerHTML=NLReport.btn({q:x.q,o:x.o,a:x.a,e:x.e},WHAT+' - Q'+(i+1));rv.appendChild(d)});
let FK='all',FS='';const filt=()=>rv.querySelectorAll('.mt-rc').forEach(c=>c.hidden=(FK!=='all'&&c.dataset.k!==FK)||(FS&&c.dataset.s!==FS));
app.querySelector('.cm-fl').onclick=e=>{const b=e.target.closest('button');if(!b)return;FK=b.dataset.f;app.querySelectorAll('.cm-chipb').forEach(c=>c.classList.toggle('on',c===b));filt()};
app.querySelector('#fs').onchange=e=>{FS=e.target.value;filt()};
app.querySelector('#pr').onclick=()=>window.print();
app.querySelector('#re').onclick=()=>{if(confirm('Start a fresh attempt? Your last result will be replaced when you submit the new one.')){A=fresh();save();exam()}};
window.scrollTo(0,0)}

const a=ld(AK);if(a&&a.end){A=a;A.t0=Date.now();A.tq=A.tq||{};A.ats=A.ats||{};Date.now()>=A.end?submit(true):exam()}else intro();
})();
