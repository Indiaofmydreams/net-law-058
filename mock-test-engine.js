/* Mock test engine: exam interface, timer, persistence, result dashboard. Client-side only. */
(()=>{
const app=document.getElementById('app');if(!app||!window.MOCK)return;
const N=+app.dataset.n,M=window.MOCK,Q=M.questions,TOT=Q.length,DUR=90*60000,MARK=2,MAXM=TOT*MARK;
const AK=`netlaw058-mock-${N}-attempt`,RK=`netlaw058-mock-${N}-result`;
const SUG={"Teaching Aptitude":"teaching methods, learner characteristics, evaluation systems and ICT-based support","Research Aptitude":"research types and methods, the steps of research, ethics and referencing","Comprehension":"reading passages slowly, finding the central idea and drawing inferences from the text","Communication":"types and barriers of communication, classroom communication and mass media","Mathematical Reasoning and Aptitude":"series, coding, ratio, percentage, profit and loss, and time and distance","Logical Reasoning":"argument structure, fallacies, syllogisms, Venn diagrams and Indian logic","Data Interpretation":"reading tables and charts, percentage change, ratios and averages","Information and Communication Technology (ICT)":"ICT abbreviations, internet and e-mail basics and digital initiatives in higher education","People, Development and Environment":"SDGs, pollution, climate change, natural hazards and environmental agreements","Higher Education System":"ancient and modern institutions, regulatory bodies and national education policies","Jurisprudence":"nature and sources of law, schools of jurisprudence, rights and duties, legal personality and liability","Constitutional and Administrative Law":"fundamental rights, directive principles, emergency provisions, natural justice and grounds of judicial review","Public International Law and IHL":"sources of international law, recognition, extradition and asylum, UN organs, WTO and the Geneva Conventions","Law of Crimes":"actus reus and mens rea, inchoate crimes, general exceptions and the corresponding BNS provisions","Law of Torts and Consumer Protection":"negligence, nuisance, strict and absolute liability, State liability, and the Consumer Protection Act, 2019","Commercial Law":"essential elements of a contract, specific contracts, Sale of Goods Act, Negotiable Instruments Act and company law","Family Law":"marriage and divorce, maintenance, adoption and guardianship, succession, and the Uniform Civil Code debate","Environment and Human Rights Law":"environmental principles, EIA, the NGT, the International Bill of Rights and NHRC","Intellectual Property Rights and Information Technology Law":"copyright, patents, trademarks, geographical indications, IPR conventions and the IT Act","Comparative Public Law and Systems of Governance":"federalism models, separation of powers, rule of law, constitutional review and the ombudsman"};
const ld=k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}},sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}},rm=k=>{try{localStorage.removeItem(k)}catch{}};
const say=m=>{const l=document.getElementById('live');if(l){l.textContent='';setTimeout(()=>l.textContent=m,60)}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>String(n).padStart(2,'0'),fmt=ms=>{const s=Math.ceil(Math.max(0,ms)/1000);return pad(Math.floor(s/3600))+':'+pad(Math.floor(s%3600/60))+':'+pad(s%60)};
const dur=ms=>{const m=Math.floor(ms/60000),s=Math.floor(ms%60000/1000);return m+' min '+s+' s'};
let A=null,tick=null;
const save=()=>sv(AK,A);

function intro(){const r=ld(RK);
app.innerHTML=`<div class="mt-intro"><span class="eyebrow">${esc(M.eyebrow||'UGC NET LAW · CODE 058')}</span><h1>${esc(M.title)}</h1><p class="mt-sub">${esc(M.blurb)}</p>
<ul class="mt-facts"><li>${TOT} questions</li><li>90 minutes</li><li>${MARK} marks each · ${MAXM} total</li><li>No negative marking</li><li>Free</li></ul>
<h2 class="mt-h">Before you begin</h2><ul class="mt-rules"><li>The timer starts when you press Start and keeps running on its own clock, even if you switch tabs.</li><li>If you refresh or close the page, your attempt and remaining time are restored from this browser when you return. The timer does not pause while you are away.</li><li>The test submits automatically at zero. You will be warned at 15, 5 and 1 minute.</li><li>Progress is saved in this browser only. Clearing site data, private browsing or another device will lose it. This is a practice tool, not a secure or proctored exam, and results can be edited by anyone with browser access.</li></ul>
<div class="mt-row"><button class="mt-btn pri" id="go">Start Mock Test</button>${r?'<button class="mt-btn" id="last">View last result</button>':''}<a class="mt-btn" href="index.html#mock-tests">All mock tests</a></div></div>`;
app.querySelector('#go').onclick=()=>{const t=Date.now();A={start:t,end:t+DUR,ans:{},mk:{},vis:{0:1},cur:0,w:{}};save();exam()};
const l=app.querySelector('#last');if(l)l.onclick=()=>result(r)}

function exam(){
app.innerHTML=`<div class="mt-top"><div class="mt-id"><b>${esc(M.title)}</b><span id="qn"></span></div><div class="mt-timer" id="tm" role="timer" aria-label="Time remaining">--:--:--</div><button class="mt-btn dng" id="sub">Submit Test</button></div>
<div class="mt-grid"><section class="mt-q" aria-label="Question"><p class="mt-meta" id="meta"></p><h2 class="mt-qt" id="qt"></h2><div class="mt-opts" id="op" role="radiogroup" aria-labelledby="qt"></div>
<div class="mt-acts"><button class="mt-btn" id="pv">← Previous</button><button class="mt-btn" id="mk"></button><button class="mt-btn" id="cl">Clear Response</button><button class="mt-btn pri" id="nx">Next →</button></div></section>
<aside class="mt-pal" aria-label="Question palette"><h3>Question palette</h3><div class="mt-pg" id="pg"></div>
<ul class="mt-leg"><li><i class="mt-p nv"></i>Not visited</li><li><i class="mt-p va"></i>Visited, unanswered</li><li><i class="mt-p an"></i>Answered</li><li><i class="mt-p mr"></i>Marked for review</li><li><i class="mt-p amr"></i>Answered and marked</li></ul><p class="mt-cnt" id="cnt"></p></aside></div>
<dialog id="dlg" class="mt-dlg" aria-labelledby="dt"><h2 id="dt">Submit test?</h2><p id="dp"></p><div class="mt-row"><button class="mt-btn" id="no">Continue test</button><button class="mt-btn dng" id="yes">Yes, submit</button></div></dialog>`;
const $=s=>app.querySelector(s),pg=$('#pg');
pg.innerHTML=Q.map((_,i)=>`<button class="mt-p" data-i="${i}">${i+1}</button>`).join('');
const st=i=>{const a=A.ans[i]!==undefined,m=!!A.mk[i];return a&&m?'amr':m?'mr':a?'an':A.vis[i]?'va':'nv'};
const SN={nv:'not visited',va:'visited, unanswered',an:'answered',mr:'marked for review',amr:'answered and marked for review'};
function pal(){pg.querySelectorAll('.mt-p').forEach((b,i)=>{const s=st(i);b.className='mt-p '+s+(i===A.cur?' cur':'');b.setAttribute('aria-label',`Question ${i+1}, ${SN[s]}`);i===A.cur?b.setAttribute('aria-current','true'):b.removeAttribute('aria-current')});
const n=Object.keys(A.ans).length,m=Object.keys(A.mk).filter(k=>A.mk[k]).length;$('#cnt').textContent=`${n} answered · ${TOT-n} unanswered · ${m} marked`}
function show(i,focus){A.cur=i;A.vis[i]=1;save();const x=Q[i];
$('#qn').textContent=`Question ${i+1}/${TOT}`;$('#meta').textContent=`${x.s} · ${x.d}`;$('#qt').textContent=x.q;
$('#op').innerHTML=x.o.map((t,k)=>`<label class="mt-opt"><input type="radio" name="o" value="${k}" ${A.ans[i]===k?'checked':''}><span></span></label>`).join('');
$('#op').querySelectorAll('.mt-opt span').forEach((s,k)=>s.textContent=x.o[k]);
$('#op').onchange=e=>{A.ans[i]=+e.target.value;save();pal()};
$('#pv').disabled=i===0;$('#nx').disabled=i===TOT-1;$('#mk').textContent=A.mk[i]?'Unmark Review':'Mark for Review';pal();
if(focus)$('#qt').setAttribute('tabindex','-1'),$('#qt').focus({preventScroll:false})}
pg.onclick=e=>{const b=e.target.closest('.mt-p');if(b)show(+b.dataset.i,true)};
$('#pv').onclick=()=>show(A.cur-1,true);$('#nx').onclick=()=>show(A.cur+1,true);
$('#mk').onclick=()=>{A.mk[A.cur]=!A.mk[A.cur];if(!A.mk[A.cur])delete A.mk[A.cur];save();$('#mk').textContent=A.mk[A.cur]?'Unmark Review':'Mark for Review';pal();say(A.mk[A.cur]?'Marked for review':'Review mark removed')};
$('#cl').onclick=()=>{delete A.ans[A.cur];save();$('#op').querySelectorAll('input').forEach(r=>r.checked=false);pal();say('Response cleared')};
const dlg=$('#dlg');
$('#sub').onclick=()=>{const n=Object.keys(A.ans).length,m=Object.keys(A.mk).filter(k=>A.mk[k]).length;$('#dp').textContent=`You have answered ${n} of ${TOT} questions, left ${TOT-n} unanswered and marked ${m} for review. Time left: ${fmt(A.end-Date.now())}. You cannot change answers after submitting.`;dlg.showModal?dlg.showModal():dlg.setAttribute('open','')};
$('#no').onclick=()=>dlg.close();$('#yes').onclick=()=>{dlg.close();submit(false)};
window.onbeforeunload=e=>{e.preventDefault();e.returnValue=''};
const tm=$('#tm');
const TH=[1,5,15];
function loop(){const rem=A.end-Date.now();if(rem<=0){submit(true);return}
tm.textContent=fmt(rem);tm.classList.toggle('low',rem<=5*60000);
const th=TH.find(t=>rem<=t*60000);if(th&&!A.w[th]){TH.forEach(t=>{if(t>=th)A.w[t]=1});save();toast(`${th} minute${th>1?'s':''} remaining`)}}
function toast(m){const t=document.createElement('div');t.className='mt-toast';t.setAttribute('role','alert');t.textContent='⏱ '+m;app.appendChild(t);say(m);setTimeout(()=>t.remove(),7000)}
clearInterval(tick);tick=setInterval(loop,500);document.addEventListener('visibilitychange',()=>{if(A&&!document.hidden)loop()});
loop();show(A.cur)}

function score(ans){let c=0,w=0;Q.forEach((x,i)=>{if(ans[i]!==undefined)ans[i]===x.a?c++:w++});const att=c+w;
return{correct:c,wrong:w,unans:TOT-att,marks:c*MARK,pct:c*MARK/MAXM*100,acc:att?c/att*100:0}}
function submit(auto){clearInterval(tick);const r=Object.assign({at:Date.now(),taken:Math.min(DUR,Date.now()-A.start),auto:!!auto,ans:A.ans},score(A.ans));
sv(RK,r);rm(AK);A=null;window.onbeforeunload=null;result(r);say(auto?'Time is up. Test submitted automatically.':'Test submitted.')}
const band=p=>p>=85?'Excellent':p>=70?'Very Good':p>=55?'Good':p>=40?'Needs Improvement':'Requires Focused Revision';
const ind=(att,acc)=>!att?['Not attempted','none']:acc>=70?['Strong','ok']:acc>=50?['Developing','mid']:['Weak','bad'];

function result(r){const ans=r.ans,subs={},tops={},diffs={};
Q.forEach((x,i)=>{const a=ans[i],S=subs[x.s]=subs[x.s]||{n:0,att:0,c:0,w:0,u:[]};S.n++;const T=tops[x.s+' · '+x.t]=tops[x.s+' · '+x.t]||{att:0,w:0};
const D=diffs[x.d]=diffs[x.d]||{att:0,w:0};if(a===undefined){S.u.push(i+1)}else{S.att++;T.att++;D.att++;if(a===x.a)S.c++;else{S.w++;T.w++;D.w++}}});
const L=Object.entries(subs).map(([s,v])=>({s,...v,acc:v.att?v.c/v.att*100:0}));
const strong=L.filter(v=>v.att>=3&&v.acc>=70),weak=L.filter(v=>v.att>=3&&v.acc<50),skipped=L.filter(v=>v.att===0||v.u.length>=v.n/2);
const rep=Object.entries(tops).filter(([,v])=>v.w>=2).sort((a,b)=>b[1].w-a[1].w).slice(0,6);
const sg=[];const att=r.correct+r.wrong;
weak.sort((a,b)=>a.acc-b.acc).forEach(v=>sg.push(`<b>${esc(v.s)}</b>: accuracy was ${v.acc.toFixed(0)}% (${v.c} of ${v.att}). Revise ${esc(SUG[v.s]||'the core topics of this module')}.`));
strong.forEach(v=>sg.push(`<b>${esc(v.s)}</b> is a strength at ${v.acc.toFixed(0)}%. Move on to harder case-based and assertion–reason questions in this module.`));
if(r.unans>=15)sg.push(`You left <b>${r.unans}</b> questions unanswered. There is no negative marking in this test, so practise timed sets and make an educated guess rather than skipping.`);
else if(r.unans>0)sg.push(`${r.unans} question${r.unans>1?'s were':' was'} left blank. Use the last few minutes to attempt every remaining question.`);
if(att>=40&&r.taken<45*60000&&r.acc<50)sg.push(`You attempted ${att} questions in only ${dur(r.taken)} with ${r.acc.toFixed(0)}% accuracy. Slow down and read each statement and option fully before answering.`);
const E=diffs.Easy;if(E&&E.att>=10&&E.w/E.att>=.3)sg.push(`${E.w} of ${E.att} easy questions were wrong. Revisit basic definitions and section numbers before attempting advanced material.`);
if(r.acc>=70&&att>=60&&r.pct<70)sg.push(`Your accuracy on attempted questions is strong (${r.acc.toFixed(0)}%), but you attempted only ${att}. Work on speed to raise your total.`);
if(!sg.length)sg.push('Your performance is balanced across modules. Retake this test after a few days, or try another mock test, to check consistency.');
const cat=band(r.pct);
app.innerHTML=`<div class="mt-res"><div class="mt-rh"><div><span class="eyebrow">RESULT</span><h1>${esc(M.title)}</h1><p class="mt-sub">${r.auto?'Submitted automatically when time expired · ':''}Attempted ${new Date(r.at).toLocaleString()}</p></div><div class="mt-row"><button class="mt-btn pri" id="re">Retake test</button><a class="mt-btn" href="index.html#mock-tests">All mock tests</a></div></div>
<div class="mt-score"><div class="mt-big"><b>${r.marks}</b><span>/ ${MAXM} marks</span></div><div><div class="mt-cat">${cat}</div><div>${r.pct.toFixed(1)}% score</div></div></div>
<div class="mt-kpis">${[['Total questions',TOT],['Correct',r.correct],['Incorrect',r.wrong],['Unattempted',r.unans],['Accuracy',r.acc.toFixed(1)+'%'],['Time taken',dur(r.taken)]].map(([a,b])=>`<div class="mt-kpi"><b>${b}</b><span>${a}</span></div>`).join('')}</div>
<p class="mt-note">Marking: ${MARK} marks per correct answer, no negative marking (as in UGC NET Paper 2). Categories (Excellent 85+, Very Good 70–84, Good 55–69, Needs Improvement 40–54, Requires Focused Revision below 40, on percentage score) are website practice bands only, not official NTA qualification or cut-off categories. Results are stored only in this browser and are not tamper-proof.</p>
<h2 class="mt-h">Subject-wise analysis</h2><div class="mt-tw"><table class="mt-tb"><thead><tr><th>Subject</th><th>Attempted</th><th>Correct</th><th>Incorrect</th><th>Accuracy</th><th>Indicator</th></tr></thead><tbody>${L.map(v=>{const[t,c]=ind(v.att,v.acc);return`<tr><th scope="row">${esc(v.s)}</th><td>${v.att}/${v.n}</td><td>${v.c}</td><td>${v.w}</td><td><div class="mt-pb"><i class="${c}" style="width:${v.acc}%"></i></div>${v.acc.toFixed(0)}%</td><td><span class="mt-ind ${c}">${t}</span></td></tr>`}).join('')}</tbody></table></div>
<h2 class="mt-h">Strengths and weaknesses</h2><div class="mt-two"><div class="mt-box"><h3>Strong subjects</h3><p>${strong.length?strong.map(v=>esc(v.s)+' ('+v.acc.toFixed(0)+'%)').join('; '):'None reached 70% accuracy with at least 3 attempts.'}</p><h3>Needs improvement</h3><p>${weak.length?weak.map(v=>esc(v.s)+' ('+v.acc.toFixed(0)+'%)').join('; '):'No subject fell below 50% accuracy.'}</p></div>
<div class="mt-box"><h3>Repeated mistakes (subject · question type)</h3><p>${rep.length?rep.map(([k,v])=>esc(k)+': '+v.w+' wrong of '+v.att).join('<br>'):'No subject and question-type combination had 2 or more wrong answers.'}</p><h3>Mostly unanswered</h3><p>${skipped.length?skipped.map(v=>esc(v.s)+' ('+v.u.length+' blank)').join('; '):'No subject was left mostly blank.'}</p></div></div>
<h2 class="mt-h">Personalised suggestions</h2><ul class="mt-sg">${sg.map(s=>'<li>'+s+'</li>').join('')}</ul>
<h2 class="mt-h">Review answers</h2><div class="mt-fl" role="group" aria-label="Filter review"><button class="mt-chip on" data-f="all">All (${TOT})</button><button class="mt-chip" data-f="ok">Correct (${r.correct})</button><button class="mt-chip" data-f="bad">Incorrect (${r.wrong})</button><button class="mt-chip" data-f="un">Unanswered (${r.unans})</button></div><div id="rv"></div></div>`;
const rv=app.querySelector('#rv');
Q.forEach((x,i)=>{const a=ans[i],k=a===undefined?'un':a===x.a?'ok':'bad',d=document.createElement('article');d.className='mt-rc '+k;d.dataset.k=k;
d.innerHTML=`<p class="mt-meta"><b>Q${i+1}</b> · <span class="s"></span> · ${x.d} · <b class="mt-tag ${k}">${k==='ok'?'✓ Correct':k==='bad'?'✗ Incorrect':'– Unanswered'}</b></p><p class="mt-qt q"></p><p class="y"></p><p class="c"></p><p class="mt-ex"></p>`;
d.querySelector('.s').textContent=x.s;d.querySelector('.q').textContent=x.q;d.querySelector('.y').textContent='Your answer: '+(a===undefined?'Not answered':x.o[a]);d.querySelector('.c').textContent='Correct answer: '+x.o[x.a];d.querySelector('.mt-ex').textContent='Explanation: '+(x.e||'');rv.appendChild(d)});
app.querySelector('.mt-fl').onclick=e=>{const b=e.target.closest('button');if(!b)return;app.querySelectorAll('.mt-chip').forEach(c=>c.classList.toggle('on',c===b));rv.querySelectorAll('.mt-rc').forEach(c=>c.hidden=b.dataset.f!=='all'&&c.dataset.k!==b.dataset.f)};
app.querySelector('#re').onclick=()=>{if(confirm('Start a fresh attempt? Your last result will be replaced when you submit the new one.')){const t=Date.now();A={start:t,end:t+DUR,ans:{},mk:{},vis:{0:1},cur:0,w:{}};save();exam()}};
window.scrollTo(0,0)}

const a=ld(AK);if(a&&a.end){A=a;Date.now()>=A.end?submit(true):exam()}else intro();
})();
