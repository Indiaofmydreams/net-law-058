/* NET Law 058: phone app. Reuses questions.json, packs.json, mock-test-data-N.js and the same saved progress
   (nl-prog-v1, netlaw058-mock-N-attempt/result) as the desktop site, so nothing is lost when switching. */
(()=>{
"use strict";
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const strip=t=>String(t).replace(/^[A-D][.)]\s+/,'');
const ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}},rm(k){try{localStorage.removeItem(k)}catch{}}};
const pad=n=>String(n).padStart(2,'0');
const fmt=ms=>{const s=Math.ceil(Math.max(0,ms)/1000);return pad(Math.floor(s/3600))+':'+pad(Math.floor(s%3600/60))+':'+pad(s%60)};
const dur=ms=>{const m=Math.floor(ms/60000),s=Math.floor(ms%60000/1000);return m+'m '+s+'s'};
const fnum=n=>n.toLocaleString('en-IN');

/* ---------- icons ---------- */
const sv=(p,s=22,f='none')=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="${f}" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const P={
menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',search:'<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>',back:'<path d="M15 5l-7 7 7 7"/>',
chevR:'<path d="M9 5l7 7-7 7"/>',chevD:'<path d="M6 9l6 6 6-6"/>',bm:'<path d="M7 4h10a1 1 0 011 1v15l-6-4-6 4V5a1 1 0 011-1z"/>',
more:'<circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/>',
close:'<path d="M6 6l12 12M18 6L6 18"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
retry:'<path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v4h4"/>',home:'<path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z"/>',
pencil:'<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',test:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 11h6M9 15h4"/>',
file:'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
list:'<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
cal:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/>',book:'<path d="M4 5.5C6 4 9 4 12 6c3-2 6-2 8-.5V19c-2-1.5-5-1.5-8 .5-3-2-6-2-8-.5z"/><path d="M12 6v13.5"/>',
scale:'<path d="M12 3v18M7 21h10M4 7h16"/><path d="M6 7l-3 7a3.2 3.2 0 006 0zM18 7l-3 7a3.2 3.2 0 006 0z"/>',
moon:'<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>',bars:'<path d="M5 20V10M12 20V4M19 20v-7"/>',
cols:'<path d="M3 9l9-5 9 5M5 9v9M10 9v9M14 9v9M19 9v9M3 20h18"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',warn:'<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>',
brief:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 13h18"/>',heart:'<path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z"/>',
leaf:'<path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15"/><path d="M5 19c3-4 6-6 10-8"/>',bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.4.4.5.8.5 1.1h6c0-.3.1-.7.5-1.1A6 6 0 0012 3z"/>',
swap:'<path d="M4 8h14l-3-3M20 16H6l3 3"/>',cap:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
flask:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3"/>',chat:'<path d="M4 5h16v11H9l-5 4z"/>',
calc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M8 16h2M12 16h2"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
mon:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',tree:'<path d="M12 21v-6M12 15c-4 0-6-3-5-6 0-3 2-5 5-6 3 1 5 3 5 6 1 3-1 6-5 6z"/>',
inst:'<path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>',desk:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.5"/>',
trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-.8.6-1.5 1-1.5 2M12 17v.5"/>'
};
const I=new Proxy({},{get:(_,k)=>sv(P[k])});
const IBM=on=>sv(P.bm,22,on?'currentColor':'none');

/* ---------- units ---------- */
const LAW=[["Jurisprudence","Jurisprudence","Schools, rights, duties, liability and thinkers.","scale"],["Constitutional and Administrative Law","Constitutional & Administrative Law","Fundamental rights, institutions, judicial review.","cols"],["Public International Law and IHL","Public International Law & IHL","Sources, recognition, the UN, WTO and IHL.","globe"],["Law of Crimes","Law of Crimes","Criminal liability, offences, defences.","shield"],["Law of Torts and Consumer Protection","Torts & Consumer Protection","Negligence, strict liability, consumer law.","warn"],["Commercial Law","Commercial Law","Contracts, sale of goods, partnership, company law.","brief"],["Family Law","Family Law","Marriage, divorce, maintenance, succession.","heart"],["Environment and Human Rights Law","Environment & Human Rights","Environmental principles, NGT, human rights.","leaf"],["Intellectual Property Rights and Information Technology Law","IPR & IT Law","Copyright, patents, trademarks, cyber law.","bulb"],["Comparative Public Law and Systems of Governance","Comparative Public Law","Federalism, rule of law, ombudsman.","swap"]];
const P1=[["Teaching Aptitude","Teaching Aptitude","Concepts, methods, support systems, evaluation.","cap"],["Research Aptitude","Research Aptitude","Types, methods, steps, ethics and writing.","flask"],["Comprehension","Comprehension","Passages, central ideas and inference.","file"],["Communication","Communication","Types, barriers, classroom, mass media.","chat"],["Mathematical Reasoning and Aptitude","Mathematical Reasoning","Series, coding, ratio, percentage.","calc"],["Logical Reasoning","Logical Reasoning","Arguments, fallacies, syllogisms, Venn.","gear"],["Data Interpretation","Data Interpretation","Tables, charts, graphs.","bars"],["Information and Communication Technology (ICT)","ICT","Internet, terminology, digital initiatives.","mon"],["People, Development and Environment","People, Development & Environment","SDGs, pollution, climate, hazards.","tree"],["Higher Education System","Higher Education System","Institutions, regulators and policies.","inst"]];
const COL=['var(--ac)','var(--c2)','var(--ac)','var(--c2)','var(--ac)','var(--c2)','var(--ac)','var(--c2)','var(--ac)','var(--c2)'];
const SETS={L:LAW,P:P1};
const unitOf=key=>{const m=/^([LP])(\d+)$/.exec(key);return m?{set:m[1],i:+m[2],u:SETS[m[1]][+m[2]]}:null};

/* ---------- saved progress (same format as the desktop site's NLNav.prog) ---------- */
const PGK='nl-prog-v1';let PG=null,PGV=0;const idc=new WeakMap();
function h53(str){let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<str.length;i++){const c=str.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}
h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return(4294967296*(2097151&h2)+(h1>>>0)).toString(36)}
const otx=t=>String(t).replace(/^[A-D][.)]\s+/,'').replace(/\s+/g,' ').trim().toLowerCase();
function ids(x){let c=idc.get(x);if(c)return c;const oh=x.o.map(t=>h53(otx(t)));c={id:h53(String(x.q).replace(/\s+/g,' ').trim().toLowerCase()+'|'+x.o.map(otx).sort().join('|')),oh};idc.set(x,c);return c}
const qid=x=>ids(x).id;
const istDay=t=>new Date((t==null?Date.now():t)+19800000).toISOString().slice(0,10);
function pgs(){if(PG)return PG;try{const d=JSON.parse(localStorage.getItem(PGK));if(d&&d.v===1)PG=d}catch{}return PG||(PG={v:1,a:{},days:{},today:{d:'',ids:[]},goal:20})}
function pgSave(){const g=pgs(),k=Object.keys(g.days).sort();while(k.length>400)delete g.days[k.shift()];ls.set(PGK,g);PGV++;stc.clear()}
function countToday(key){const g=pgs(),d=istDay();if(g.today.d!==d)g.today={d,ids:[]};if(g.today.ids.includes(key))return;g.today.ids.push(key);const r=g.days[d]||(g.days[d]={n:0,met:false});r.n++;if(!r.met&&r.n>=g.goal)r.met=true}
const prog={
get(x){const r=pgs().a[ids(x).id];if(!r)return null;const k=ids(x).oh.indexOf(r[0]);return k<0?null:{k,ok:k===x.a}},
status(x){const r=prog.get(x);return!r?'u':r.ok?'ok':'bad'},
stats(list){const o={a:0,ok:0,bad:0,u:0,n:list.length};for(const x of list){const s=prog.status(x);if(s==='u')o.u++;else{o.a++;o[s]++}}return o},
set(x,k){const i=ids(x);pgs().a[i.id]=[i.oh[k],Date.now()];countToday(i.id);pgSave()},
clear(x){delete pgs().a[ids(x).id];pgSave()},
daily(){const g=pgs(),d=istDay(),r=g.today.d===d?g.days[d]:null;let t=Date.parse(d+'T00:00:00Z'),n=0;const cur=g.days[d];if(!(cur&&cur.met))t-=864e5;for(;;){const q=g.days[new Date(t).toISOString().slice(0,10)];if(q&&q.met){n++;t-=864e5}else break}return{n:r?r.n:0,goal:g.goal,streak:n}},
setGoal(n){const g=pgs();g.goal=n;const r=g.days[istDay()];if(r)r.met=r.n>=n;pgSave()}
};
addEventListener('storage',e=>{if(e.key===PGK){PG=null;PGV++;stc.clear()}});
const stc=new Map();
const ustats=(key,list)=>{let s=stc.get(key);if(!s){s=prog.stats(list);stc.set(key,s)}return s};

/* ---------- settings, bookmarks, theme ---------- */
const ST=Object.assign({view:'card',exp:0,fs:1},ls.get('nl-m-set',{}));
const saveST=()=>ls.set('nl-m-set',ST);
const BM=ls.get('nl-m-bm',{});const saveBM=()=>ls.set('nl-m-bm',BM);
const POS=ls.get('nl-m-pos',{});const savePOS=()=>ls.set('nl-m-pos',POS);
const SCHEMES=[['navy','Royal Navy','#607bd2'],['blue','Blue','#6095d2'],['aqua','Aqua','#359cbb'],['purple','Purple','#9560d2'],['magenta','Magenta','#d260a1'],['midnight','Midnight HC','#4d47eb'],['ruby','Ruby HC','#e11948'],['graphite','Graphite HC','#1e6ee6']];
function setTheme(s,m){const r=document.documentElement,t=ls.get('netlaw058-theme',{});if(s)t.s=s;if(m)t.m=m;ls.set('netlaw058-theme',t);r.dataset.scheme=t.s||'navy';r.dataset.mode=t.m||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
const mt=$('meta[name=theme-color]');if(mt)mt.content=getComputedStyle(r).getPropertyValue('--surface').trim()||'#fff'}

/* ---------- question bank (same loading rules as bank-loader.js) ---------- */
const S={bank:null,by:{},err:false,hist:0,prac:null,ex:new Set(),exam:null,peek:new Set()};
const normQ=(it,unit)=>{if(Array.isArray(it.o)&&typeof it.a==='number')return{...it,u:it.u||unit};
const o=it.options||{},keys=Array.isArray(o)?o.map((_,i)=>'ABCD'[i]):Object.keys(o).sort();
const txt=keys.map(k=>String(Array.isArray(o)?o[keys.indexOf(k)]:o[k]).replace(/^[A-D][.)]\s+/,''));
const a=typeof it.answer==='number'?it.answer:keys.indexOf(String(it.answer).trim().toUpperCase());
return{u:it.u||it.unit||it.subject||unit,t:it.t||it.category||it.topic||it.type||'',q:it.question||it.q,o:txt.map((t,i)=>'ABCD'[i]+'. '+t),a,e:it.explanation||it.e||''}};
const getJSON=f=>fetch(f).then(r=>{if(!r.ok)throw 0;return r.json()});
function loadBank(){return S.bankP||(S.bankP=getJSON('questions.json').then(base=>getJSON('packs.json').catch(()=>[]).then(packs=>Promise.all(packs.map(k=>getJSON(k.file).then(d=>(Array.isArray(d)?d:d.questions||[]).map(x=>normQ(x,k.unit))).catch(()=>[])))).then(parts=>{
const all=base.map(x=>normQ(x,x.u)).concat(...parts).filter(x=>x.q&&x.o&&x.o.length===4&&x.a>=0&&x.a<4);S.bank=all;S.by={};for(const x of all)(S.by[x.u]||(S.by[x.u]=[])).push(x);stc.clear();return all})).catch(e=>{S.err=true;S.bankP=null;throw e}))}
const list=(set,i)=>S.by[SETS[set][i][0]]||[];
const keyList=key=>{const u=unitOf(key);return u?list(u.set,u.i):[]};

/* ---------- shell ---------- */
const top=$('#top'),view=$('#view'),nav=$('#nav'),foot=$('#foot'),sheet=$('#sheet'),shade=$('#shade'),toastEl=$('#toast'),appEl=$('#app');
let toastT=null;
function toast(m,warn){toastEl.textContent=m;toastEl.className=warn?'warn':'';toastEl.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>toastEl.hidden=true,warn?6000:2400)}
function openSheet(html,cls=''){sheet.className=cls;sheet.innerHTML=html;sheet.hidden=false;shade.hidden=false}
function closeSheet(){sheet.hidden=true;shade.hidden=true;sheet.innerHTML=''}
shade.onclick=closeSheet;
const go=p=>{location.hash='#'+p};
const back=()=>{if(S.hist>0)history.back();else go('/')};
const NAV=[['/','home','Home','home'],['/subjects','sub','Practice','pencil'],['/mocks','mock','Mock Test','test'],['/notes','notes','Notes','file'],['/profile','prof','Profile','user']];
function screen(o){
  top.innerHTML=o.top||'';top.hidden=!o.top;
  view.innerHTML=o.body||'';view.className=o.flush?'flush':'';
  if(o.nav){nav.hidden=false;nav.innerHTML=NAV.map(n=>`<a href="#${n[0]}" class="${o.nav===n[1]?'on':''}">${sv(P[n[3]])}${n[2]}</a>`).join('')}else nav.hidden=true;
  foot.hidden=!o.foot;foot.innerHTML=o.foot||'';
  if(!o.keep)view.scrollTop=0;
}
const tbar=(title,{sub='',right='',left=I.back,la='back'}={})=>`<div class="tb"><button class="ib" data-a="${la}" aria-label="Back">${left}</button><h1>${esc(title)}${sub?`<small>${sub}</small>`:''}</h1>${right}</div>`;
const loading=(msg='Loading questions…')=>screen({top:tbar('NET Law 058',{left:I.menu,la:'drawer'}),body:`<div class="empty" style="padding-top:90px"><div class="spin"></div><b>${msg}</b>First time only. After this your phone keeps them.</div>`,nav:'home'});
const ico=(name,c)=>`<span class="ico" style="--c:${c}">${I[name]}</span>`;

/* ---------- routing ---------- */
const NEEDS_BANK=/^\/(subjects|practice|search|bookmarks|profile|syllabus)/;
let cleanup=null;
function route(){
  toastEl.hidden=true;if(cleanup){cleanup();cleanup=null}closeSheet();
  const h=location.hash.slice(1)||'/',p=h.split('/').filter(Boolean),r='/'+(p[0]||'');
  if(h==='/'&&!ls.get('nl-m-seen',0)){return R.landing()}
  if(NEEDS_BANK.test(r)&&!S.bank){loading();loadBank().then(()=>route()).catch(()=>screen({top:tbar('NET Law 058'),body:`<div class="empty"><b>Couldn't load questions</b>Check your connection and try again.<br><br><button class="btn" data-a="reload">Retry</button></div>`}));return}
  const f=R[p[0]||'home'];(f||R.home)(p.slice(1));
}
const R={};
addEventListener('hashchange',()=>{S.hist++;route()});

/* ---------- actions (event delegation) ---------- */
const A={};
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(!t)return;const f=A[t.dataset.a];if(f){e.preventDefault();f(t,e)}});
A.back=back;A.close=closeSheet;A.reload=()=>location.reload();
A.toast=t=>toast(t.dataset.m);

/* ---------- landing ---------- */
R.landing=()=>{screen({body:`<div class="land"><div class="logo">${sv(P.scale,76)}</div><h1>NET Law 058</h1><p class="tag">WELCOME · 100% FREE · NO SIGN-UP</p><p class="d" style="margin-bottom:10px"><b style="font-size:1.35rem;color:var(--text)">9,000+ free MCQs</b><br>Welcome. Practise everything. Pay nothing.</p><p class="d">3,580 Law 058 and 5,705 Paper 1 questions, organised topic-wise, each with a clear explanation.</p><ul class="ticks"><li>No need to sign in</li><li>Your progress is saved in this browser</li></ul>
<button class="btn" data-a="enter">Start Practising ${I.chevR}</button></div>`,flush:true})};
A.enter=()=>{ls.set('nl-m-seen',1);go('/')};

/* ---------- drawer ---------- */
A.drawer=()=>{const dk=document.documentElement.dataset.mode==='dark',cs=document.documentElement.dataset.scheme;
openSheet(`<div class="brand">${sv(P.scale,26)}<span>NET Law 058</span></div><div class="sh-b"><div class="dl">
<a href="#/">${I.home}Home</a><a href="#/plan">${I.cal}Study Plan</a><a href="#/mocks">${I.test}Mock Tests</a><a href="#/subjects">${I.scale}Law 058</a><a href="#/subjects/1">${I.cap}Paper 1</a><a href="#/syllabus/0">${I.book}Syllabus</a><a href="#/notes">${I.file}Notes</a><a href="#/pyq">${I.target}PYQs</a><a href="#/bookmarks">${I.bm}Bookmarks</a><a href="#/profile">${I.user}My progress</a><a href="faq.html">${I.help}FAQ & exam pattern</a>${window.NLPWA&&NLPWA.available()?`<button data-a="install">${sv('<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>')}Install app</button>`:''}<button data-a="desktop">${I.desk}Use desktop site</button></div>
<div class="fld" style="margin-top:12px"><b>Appearance</b><div class="sw">${SCHEMES.map(s=>`<button class="swb ${cs===s[0]?'on':''}" style="--c:${s[2]}" data-a="scheme" data-s="${s[0]}"><i></i>${s[1]}</button>`).join('')}</div><button class="btn sec sm" style="margin-top:10px" data-a="mode">${dk?I.sun+' Light mode':I.moon+' Dark mode'}</button></div></div>`,'left')};
A.scheme=t=>{setTheme(t.dataset.s);A.drawer()};
A.mode=()=>{setTheme(null,document.documentElement.dataset.mode==='dark'?'light':'dark');A.drawer()};
A.desktop=()=>{location.href='index.html?desktop=1'};
A.install=()=>{closeSheet();if(window.NLPWA)NLPWA.install()};
A.insno=()=>{if(window.NLPWA)NLPWA.dismiss();route()};
addEventListener('nlpwa:change',()=>{if((location.hash.slice(1)||'/')==='/'&&ls.get('nl-m-seen',0)&&sheet.hidden)R.home()});

/* ---------- home ---------- */
const greet=()=>{const h=new Date().getHours();return h<12?'Good Morning!':h<17?'Good Afternoon!':'Good Evening!'};
let EXAM=null;fetch('exam-dates.json').then(r=>r.json()).then(d=>{EXAM=d;const el=$('#cd');if(el)el.outerHTML=cdHTML()}).catch(()=>{});
function cdHTML(){if(!EXAM||!EXAM.date)return'<div id="cd"></div>';const m=/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(EXAM.date);if(!m)return'<div id="cd"></div>';
const [h,mi]=(EXAM.time||'00:00').split(':').map(Number),t=Date.UTC(+m[1],+m[2]-1,+m[3],h||0,mi||0)-19800000,d=Math.ceil((t-Date.now())/864e5);
const ds=new Date(t+19800000).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
return`<div class="cd" id="cd">${I.cal}<span style="flex:1">${esc(EXAM.name||'UGC NET')} · ${ds}</span>${d>0?`<span><b>${d}</b> day${d>1?'s':''} to go</span>`:'<b>Exam time</b>'}</div>`}
R.home=()=>{
  const last=ls.get('nl-m-last',null);let cont='';
  if(S.bank&&last&&keyList(last.key).length){const L=keyList(last.key),u=unitOf(last.key),s=ustats(last.key,L);
    cont=`<div class="card cont">${ico(u.u[3],COL[u.i])}<div class="ti"><h3>${esc(u.u[1])}</h3><p>${fnum(s.a)} of ${fnum(L.length)} attempted</p><div class="bar"><i style="width:${s.a/L.length*100}%"></i></div></div><a class="btn sm" href="#/practice/${last.key}">Resume</a></div>`}
  else cont=`<div class="card cont">${ico('scale',COL[0])}<div class="ti"><h3>Start with Jurisprudence</h3><p>Pick a subject and begin practising</p></div><a class="btn sm" href="#/practice/L0">Start</a></div>`;
  let all=0,att=0,ok=0,bad=0;if(S.bank){all=S.bank.length;const s=prog.stats(S.bank);att=s.a;ok=s.ok;bad=s.bad}
  const dg=prog.daily(),pc=all?att/all*100:0;
  const T=[['/subjects','scale','Law 058','var(--ac)'],['/subjects/1','cap','Paper 1','var(--c2)'],['/mocks','test','Mock Tests','var(--ac)'],['/plan','cal','Study Plan','var(--ac)'],['/syllabus/0','book','Syllabus','var(--c2)'],['/notes','file','Notes','var(--c2)']];
  screen({top:`<div class="tb"><button class="ib" data-a="drawer" aria-label="Menu">${I.menu}</button><h1>NET Law 058</h1><a class="ib" href="#/search" aria-label="Search questions">${I.search}</a></div>`,nav:'home',
  body:`<div class="hello"><b>UGC NET Law (058) &amp; Paper 1</b><span>Free MCQs, mock tests, notes and study plans.</span></div>${cdHTML()}${window.NLPWA&&NLPWA.available()&&!NLPWA.dismissed()?`<div class="card ins">${sv('<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>')}<div class="ti"><h3>Install this app</h3><p>Quick launch from your home screen, works offline</p></div><button class="btn sm" data-a="install">Install</button><button class="ib" data-a="insno" aria-label="Dismiss">${I.close}</button></div>`:''}<h2 class="h2">Continue practising</h2>${cont}
  <div class="tiles">${T.map(t=>`<a class="tile" href="#${t[0]}">${t[4]?'<span class="badge">SOON</span>':''}<span class="ico" style="--c:${t[3]}">${I[t[1]]}</span>${t[2]}</a>`).join('')}</div>
  <h2 class="h2">Your progress</h2><div class="card"><div class="prog-n"><b>${fnum(att)} <span>/ ${all?fnum(all):'…'}</span></b><em>${pc.toFixed(1)}%</em></div><div class="bar"><i style="width:${pc}%"></i></div>
  <div class="mini"><span style="--c:var(--ok)">${fnum(ok)} correct</span><span style="--c:var(--bad)">${fnum(bad)} incorrect</span></div>
  <div class="mini" style="margin-top:7px"><span style="--c:var(--ac)">Today ${dg.n}/${dg.goal}</span><span style="--c:var(--c2)">${dg.streak}-day streak</span></div></div>`});
  if(!S.bank)loadBank().then(()=>{if((location.hash.slice(1)||'/')==='/')R.home()}).catch(()=>{});
};

/* ---------- subjects ---------- */
R.subjects=([p])=>{const set=p==='1'?'P':'L',U=SETS[set];
  const rows=U.map((u,i)=>{const L=list(set,i),s=ustats(set+i,L);return`<a class="row" href="#/practice/${set}${i}">${ico(u[3],COL[i])}<div class="ti"><h3>${esc(u[1])}</h3><p>${fnum(L.length)} questions${s.a?` · ${s.a} done`:''}</p>${s.a?`<div class="bar"><i style="width:${s.a/Math.max(1,L.length)*100}%"></i></div>`:''}</div>${I.chevR}</a>`}).join('');
  screen({top:`<div class="tb"><button class="ib" data-a="drawer">${I.menu}</button><h1>Subjects</h1><a class="ib" href="#/search" aria-label="Search">${I.search}</a></div>`,nav:'sub',
  body:`<div class="seg tabs"><button class="${set==='L'?'on':''}" data-a="tab" data-p="0">Paper 2 · Law 058</button><button class="${set==='P'?'on':''}" data-a="tab" data-p="1">Paper 1 · General Aptitude</button></div><div class="rows">${rows}</div>`})};
A.tab=t=>{location.replace('#/subjects/'+(t.dataset.p==='1'?'1':''))};

/* ---------- practice ---------- */
const PR=()=>S.prac;
function openSession(key,title,listAll,pos0){
  const old=S.prac;S.prac={key,title,all:listAll,filter:'all',items:listAll,pos:0};
  const pr=S.prac;
  const saved=POS[key];
  if(pos0!=null)pr.pos=pos0;else if(typeof saved==='number'&&saved<listAll.length)pr.pos=saved;
  else{const f=listAll.findIndex(x=>prog.status(x)==='u');pr.pos=f<0?0:f}
}
function applyFilter(f){const pr=PR(),cur=pr.items[pr.pos];pr.filter=f;pr.items=f==='all'?pr.all:pr.all.filter(x=>f==='u'?prog.status(x)==='u':prog.status(x)==='bad');
  const i=cur?pr.items.indexOf(cur):-1;pr.pos=i>=0?i:0}
R.practice=([key])=>{
  let pr=PR();
  if(!pr||pr.key!==key||key==='BM'){
    if(key==='BM'){const l=S.bank.filter(x=>BM[qid(x)]);openSession('BM','Bookmarks',l,0)}
    else if(key==='S'&&pr&&pr.key==='S'){}
    else if(unitOf(key)){const u=unitOf(key);openSession(key,u.u[1],list(u.set,u.i))}
    else return go('/subjects');
    pr=PR();
  }
  if(!pr.all.length){screen({top:tbar(pr.title),body:'<div class="empty"><b>Nothing here yet</b>Bookmark questions while practising and they will appear here.</div>'});return}
  if(unitOf(key))ls.set('nl-m-last',{key});
  drawPrac();
};
const pageN=20;
function cardHTML(x,i,compact){
  const g=prog.get(x),id=qid(x),open=S.ex.has(id),peek=S.peek.has(id);
  const opts=x.o.map((t,k)=>{let c='opt',m='';if(g){if(k===x.a){c+=' ok';m=I.check}else if(k===g.k){c+=' bad';m=I.close}else c+=' dim'}else if(peek&&k===x.a){c+=' ok';m=I.check}
    return`<button class="${c}" data-a="opt" data-i="${i}" data-k="${k}"${g?' aria-disabled="true"':''}><span class="ol">${'ABCD'[k]}</span><span class="ot">${esc(strip(t))}</span><span class="om">${m}</span></button>`}).join('');
  const exp=`<div class="exp${open?' open':''}"><div class="exp-row"><button class="exp-b" data-a="exp" data-i="${i}" aria-expanded="${open}">${I.eye}<span>Explanation</span>${I.chevD}</button>${g?`<button class="rt" data-a="retry" data-i="${i}" aria-label="Try again">${I.retry}</button>`:''}</div><div class="exp-c"><div class="exp-ans">${I.check}Correct Answer: ${'ABCD'[x.a]}. ${esc(strip(x.o[x.a]))}</div><p>${esc(x.e||'No explanation added yet.')}</p></div></div>`;
  if(compact)return`<div class="lq" data-qi="${i}"><div class="lq-h"><span class="lq-n">${i+1}</span><p class="q">${esc(x.q)}</p><button class="bm${BM[id]?' on':''}" data-a="bmq" data-i="${i}" aria-label="Bookmark">${IBM(BM[id])}</button></div><div class="opts">${opts}</div>${exp}</div>`;
  return`<div data-qi="${i}"><p class="q">${esc(x.q)}</p><div class="opts">${opts}</div>${exp}</div>`}
function pracTop(){const pr=PR(),n=pr.items.length,x=pr.items[pr.pos],card=ST.view==='card';
  const sub=card?`${pr.pos+1}/${n}`:`${pr.pos+1}–${Math.min(n,pr.pos+pageN)} of ${n}`;
  return`<div class="tb"><button class="ib" data-a="back" aria-label="Back">${I.back}</button><h1>${esc(pr.title)}<small>${sub}${pr.filter!=='all'?' · '+(pr.filter==='u'?'unattempted':'mistakes'):''}</small></h1>
  ${card&&x?`<button class="ib${BM[qid(x)]?' on':''}" data-a="bmq" data-i="${pr.pos}" aria-label="Bookmark">${IBM(BM[qid(x)])}</button>`:''}
  <button class="ib" data-a="view" aria-label="Switch view">${card?I.list:I.grid}</button><button class="ib" data-a="pmenu" aria-label="Options">${I.more}</button></div>`}
function pracFoot(){const pr=PR(),n=pr.items.length,card=ST.view==='card',step=card?1:pageN;
  const lbl=card?`${pr.pos+1}/${n}<small>Palette</small>`:`${Math.floor(pr.pos/pageN)+1}/${Math.ceil(n/pageN)}<small>Page</small>`;
  return`<button class="fb" data-a="prev" ${pr.pos<=0?'disabled':''}>${I.back}${card?'Previous':'Prev 20'}</button><button class="fc" data-a="pal" aria-label="Question palette">${lbl}</button><button class="fb pri" data-a="next" ${pr.pos+step>=n?'disabled':''}>${card?'Next':'Next 20'}${sv(P.chevR)}</button>`}
function drawPrac(keep){const pr=PR();
  if(!pr.items.length){screen({top:pracTop(),body:`<div class="empty"><b>${pr.filter==='u'?'All questions attempted':'No mistakes to review'}</b>Nice work. Change the filter to see everything.<br><br><button class="btn sm" data-a="pmenu">Change filter</button></div>`,foot:pracFoot()});return}
  let body;
  if(ST.view==='card')body=cardHTML(pr.items[pr.pos],pr.pos,false);
  else{const s=Math.floor(pr.pos/pageN)*pageN;body=pr.items.slice(s,s+pageN).map((x,k)=>cardHTML(x,s+k,true)).join('')}
  screen({top:pracTop(),body,foot:pracFoot(),keep});
  POS[pr.key]=pr.pos;if(pr.key!=='S'&&pr.key!=='BM'||true)savePOS();
  if(ST.view==='card')bindSwipe();
}
let swX=0,swY=0;
function bindSwipe(){view.ontouchstart=e=>{swX=e.touches[0].clientX;swY=e.touches[0].clientY};view.ontouchend=e=>{const dx=e.changedTouches[0].clientX-swX,dy=e.changedTouches[0].clientY-swY;if(Math.abs(dx)>70&&Math.abs(dy)<45){dx<0?A.next():A.prev()}}}
cleanup=null;
const rerenderQ=i=>{const pr=PR(),x=pr.items[i];if(ST.view==='card'){drawPrac(true);return}
  const el=view.querySelector(`[data-qi="${i}"]`);if(el){const t=document.createElement('div');t.innerHTML=cardHTML(x,i,true);el.replaceWith(t.firstChild)}};
A.opt=t=>{const pr=PR(),i=+t.dataset.i,k=+t.dataset.k,x=pr.items[i];if(prog.get(x))return;prog.set(x,k);S.peek.delete(qid(x));if(ST.exp)S.ex.add(qid(x));rerenderQ(i)};
A.exp=t=>{const pr=PR(),i=+t.dataset.i,x=pr.items[i],id=qid(x);if(S.ex.has(id)){S.ex.delete(id)}else{S.ex.add(id);if(!prog.get(x))S.peek.add(id)}rerenderQ(i)};
A.retry=t=>{const pr=PR(),i=+t.dataset.i,x=pr.items[i],id=qid(x);prog.clear(x);S.ex.delete(id);S.peek.delete(id);rerenderQ(i)};
A.bmq=t=>{const pr=PR(),x=pr.items[+t.dataset.i],id=qid(x);if(BM[id]){delete BM[id];toast('Bookmark removed')}else{BM[id]=Date.now();toast('Bookmarked')}saveBM();
  if(ST.view==='card'){top.innerHTML=pracTop()}else rerenderQ(+t.dataset.i)};
const jump=i=>{const pr=PR();pr.pos=Math.max(0,Math.min(pr.items.length-1,i));if(ST.view==='list')pr.pos=Math.floor(pr.pos/pageN)*pageN;drawPrac()};
A.next=()=>{const pr=PR();if(pr&&pr.items.length&&pr.pos+(ST.view==='card'?1:pageN)<pr.items.length)jump(pr.pos+(ST.view==='card'?1:pageN))};
A.prev=()=>{const pr=PR();if(pr&&pr.pos>0)jump(pr.pos-(ST.view==='card'?1:pageN))};
A.view=()=>{ST.view=ST.view==='card'?'list':'card';saveST();const pr=PR();if(ST.view==='list')pr.pos=Math.floor(pr.pos/pageN)*pageN;drawPrac();toast(ST.view==='list'?'List view: 20 questions per screen':'Card view')};
A.pal=()=>{const pr=PR(),n=pr.items.length,rg=Math.ceil(n/50);let r=Math.floor(pr.pos/50);
  const s=prog.stats(pr.items);
  const draw=()=>{const a=r*50,b=Math.min(n,a+50);
    $('#pal-g').innerHTML=pr.items.slice(a,b).map((x,k)=>{const i=a+k,st=prog.status(x);return`<button class="pn ${st}${i===pr.pos?' cur':''}${BM[qid(x)]?' bk':''}" data-a="pgo" data-i="${i}">${i+1}</button>`}).join('');
    document.querySelectorAll('.chip[data-r]').forEach(c=>c.classList.toggle('on',+c.dataset.r===r))};
  openSheet(`<div class="sh-h"><h2>Question Palette</h2><button class="ib" data-a="close" aria-label="Close">${I.close}</button></div><div class="sh-b">${rg>1?`<div class="chips">${Array.from({length:rg},(_,k)=>`<button class="chip" data-a="prng" data-r="${k}">${k*50+1}–${Math.min(n,k*50+50)}</button>`).join('')}</div>`:''}<div class="pal" id="pal-g"></div>
  <ul class="leg"><li><i style="--c:var(--ok)"></i>Answered correctly<span>${s.ok}</span></li><li><i style="--c:var(--bad)"></i>Answered incorrectly<span>${s.bad}</span></li><li><i style="--c:var(--btn)"></i>Current question<span></span></li><li><i class="o"></i>Not attempted<span>${s.u}</span></li><li><i style="--c:var(--ac);border-radius:3px;width:9px;height:9px"></i>Bookmarked<span>${pr.items.filter(x=>BM[qid(x)]).length}</span></li></ul></div><div class="sh-f"><button class="btn" data-a="close">Back to Question</button></div>`,'full');
  window.__prng=k=>{r=k;draw()};draw()};
A.prng=t=>window.__prng(+t.dataset.r);
A.pgo=t=>{closeSheet();jump(+t.dataset.i)};
A.pmenu=()=>{const pr=PR(),sa=prog.stats(pr.all),bmn=0;
  openSheet(`<div class="sh-h"><h2>Options</h2><button class="ib" data-a="close">${I.close}</button></div><div class="sh-b">
  <div class="fld"><b>View</b><div class="seg"><button class="${ST.view==='card'?'on':''}" data-a="setv" data-v="card">One at a time<small>focus</small></button><button class="${ST.view==='list'?'on':''}" data-a="setv" data-v="list">List of 20<small>more per screen</small></button></div></div>
  <div class="fld"><b>Show</b><div class="seg"><button class="${pr.filter==='all'?'on':''}" data-a="setf" data-f="all">All<small>${pr.all.length}</small></button><button class="${pr.filter==='u'?'on':''}" data-a="setf" data-f="u">Unattempted<small>${sa.u}</small></button><button class="${pr.filter==='bad'?'on':''}" data-a="setf" data-f="bad">Mistakes<small>${sa.bad}</small></button></div></div>
  <div class="fld"><b>Explanation</b><div class="seg"><button class="${!ST.exp?'on':''}" data-a="sete" data-e="0">On demand</button><button class="${ST.exp?'on':''}" data-a="sete" data-e="1">Open after answer</button></div></div>
  <div class="fld"><b>Text size</b><div class="seg"><button class="${ST.fs<1?'on':''}" data-a="setfs" data-s="0.9">Small</button><button class="${ST.fs===1?'on':''}" data-a="setfs" data-s="1">Normal</button><button class="${ST.fs>1?'on':''}" data-a="setfs" data-s="1.15">Large</button></div></div>
  <button class="btn dng" data-a="resetset">${I.trash} Reset my answers in this set</button></div>`)};
A.setv=t=>{ST.view=t.dataset.v;saveST();const pr=PR();if(ST.view==='list')pr.pos=Math.floor(pr.pos/pageN)*pageN;closeSheet();drawPrac()};
A.setf=t=>{applyFilter(t.dataset.f);closeSheet();drawPrac()};
A.sete=t=>{ST.exp=+t.dataset.e;saveST();A.pmenu()};
A.setfs=t=>{ST.fs=+t.dataset.s;saveST();applyFs();A.pmenu()};
A.resetset=()=>{const pr=PR();if(!confirm('Clear your saved answers for these '+pr.all.length+' questions?'))return;pr.all.forEach(x=>{const g=pgs();delete g.a[ids(x).id]});pgSave();S.ex.clear();S.peek.clear();closeSheet();applyFilter('all');pr.pos=0;drawPrac();toast('Answers cleared')};
const applyFs=()=>appEl.style.setProperty('--fs',ST.fs);applyFs();

/* ---------- search ---------- */
R.search=()=>{
  screen({top:`<div class="tb"><button class="ib" data-a="back">${I.back}</button><label class="search">${I.search}<input id="sq" type="search" placeholder="Search questions, cases, topics" autocomplete="off" enterkeyhint="search"></label></div>`,
  body:`<div class="empty" id="sr"><b>Search all ${S.bank?fnum(S.bank.length):''} questions</b>Type a case name, section or topic.</div>`,nav:null});
  if(!S.bank){loadBank().then(()=>R.search());return}
  const inp=$('#sq');let tm=null;inp.value=S.lastQ||'';
  const run=()=>{const q=inp.value.trim().toLowerCase();S.lastQ=inp.value;const box=$('#sr');if(q.length<2){box.className='empty';box.innerHTML='<b>Search all '+fnum(S.bank.length)+' questions</b>Type a case name, section or topic.';return}
    const w=q.split(/\s+/);const hits=[];for(const x of S.bank){const t=(x.q+' '+x.o.join(' ')+' '+(x.e||'')).toLowerCase();if(w.every(z=>t.includes(z))){hits.push(x);if(hits.length>=300)break}}
    S.hits=hits;box.className='';box.innerHTML=hits.length?`<h2 class="h2">${hits.length>=300?'300+':hits.length} result${hits.length===1?'':'s'}</h2><div class="rows">${hits.slice(0,60).map((x,i)=>`<button class="row hit" data-a="hit" data-i="${i}"><div class="ti"><div class="t">${esc(x.q)}</div><p>${esc((x.u||'').slice(0,46))}</p></div>${I.chevR}</button>`).join('')}</div>${hits.length>60?'<p class="muted" style="text-align:center;font-size:.8125rem">Showing the first 60. Open one to browse all results.</p>':''}`:'<div class="empty"><b>No matches</b>Try fewer or different words.</div>'};
  inp.oninput=()=>{clearTimeout(tm);tm=setTimeout(run,180)};run();if(!S.lastQ)inp.focus()};
A.hit=t=>{openSession('S','Search: '+(S.lastQ||'').trim(),S.hits,+t.dataset.i);ls.rm('nl-m-pos-S');go('/practice/S')};

/* ---------- mock tests (same storage keys and result format as mock-test-engine.js) ---------- */
const MOCKS=[
{n:1,t:'Mock Test 1',s:'Full-length paper · Set 1',q:100,m:90,p:2},{n:2,t:'Mock Test 2',s:'Full-length paper · Set 2',q:100,m:90,p:2},{n:3,t:'Mock Test 3',s:'Full-length paper · Set 3',q:100,m:90,p:2},{n:4,t:'Mock Test 4',s:'Full-length paper · Set 4',q:100,m:90,p:2},{n:5,t:'Mock Test 5 · Revision Mix',s:'Revision mix · Sets 1–4',q:100,m:90,p:2},{n:13,t:'Mock Test 6 (Hard)',s:'All 10 units · Hard',q:100,m:120,p:2,h:'HARD'},
{n:14,t:'Paper 1 · Mock Test 1 · Part 1',s:'Set 1 · Part 1 of 2',q:50,m:60,p:1},{n:15,t:'Paper 1 · Mock Test 1 · Part 2',s:'Set 1 · Part 2 of 2',q:50,m:60,p:1},{n:16,t:'Paper 1 · Mock Test 2 · Part 1',s:'Set 2 · Part 1 of 2',q:50,m:60,p:1},{n:17,t:'Paper 1 · Mock Test 2 · Part 2',s:'Set 2 · Part 2 of 2',q:50,m:60,p:1},{n:18,t:'Paper 1 · Mock Test 3 · Part 1',s:'Set 3 · Part 1 of 2',q:50,m:60,p:1},{n:19,t:'Paper 1 · Mock Test 3 · Part 2',s:'Set 3 · Part 2 of 2',q:50,m:60,p:1},{n:20,t:'Paper 1 · Mock Test 4 · Part 1',s:'Set 4 · Part 1 of 2',q:50,m:60,p:1},{n:21,t:'Paper 1 · Mock Test 4 · Part 2',s:'Set 4 · Part 2 of 2',q:50,m:60,p:1},
{n:10,t:'Paper 1 · Exam Pattern Mock A',s:'Moderate to tough',q:50,m:60,p:1,h:'TOUGH'},{n:11,t:'Paper 1 · Exam Pattern Mock B',s:'Moderate to tough',q:50,m:60,p:1,h:'TOUGH'},{n:12,t:'Paper 1 · Exam Pattern Mock C',s:'Extremely tough',q:50,m:60,p:1,h:'EXTREME'}];
const AK=n=>`netlaw058-mock-${n}-attempt`,RK=n=>`netlaw058-mock-${n}-result`;
const mockMeta=n=>MOCKS.find(m=>m.n===n);
const MC={};
function loadMock(n){if(MC[n])return Promise.resolve(MC[n]);return new Promise((ok,no)=>{const s=document.createElement('script');s.src=`mock-test-data-${n}.js`;s.onload=()=>{const m=window.MOCK;delete window.MOCK;if(m&&m.questions){MC[n]=m;ok(m)}else no()};s.onerror=no;document.head.appendChild(s)})}
function mockStatus(n){const a=ls.get(AK(n)),r=ls.get(RK(n));
  if(a&&a.end)return a.end<=Date.now()?['Time up','go']:[`In progress · ${Object.keys(a.ans||{}).length} done`,'go'];
  if(r)return[`✓ ${r.marks} marks`,'ok'];return['Not started','']}
R.mocks=()=>{
  const row=m=>{const[s,c]=mockStatus(m.n);return`<a class="row" href="#/mock/${m.n}">${ico('test',m.p===2?'var(--ac)':'var(--c2)')}<div class="ti"><h3>${esc(m.t)}</h3><p>${m.q} questions · ${m.m>=60&&m.m%60===0?m.m/60+(m.m===60?' hour':' hours'):m.m+' minutes'}${m.h?` · <b style="color:var(--bad-text)">${m.h}</b>`:''}</p></div><span class="st ${c}">${s}</span></a>`};
  screen({top:`<div class="tb"><button class="ib" data-a="drawer">${I.menu}</button><h1>Mock Tests</h1></div>`,nav:'mock',
  body:`<h2 class="h2">Paper 2 · Law 058</h2><div class="rows">${MOCKS.filter(m=>m.p===2).map(row).join('')}</div><h2 class="h2">Paper 1 · General aptitude</h2><div class="rows">${MOCKS.filter(m=>m.p===1).map(row).join('')}</div><p class="muted" style="font-size:.75rem;text-align:center;margin:14px 6px 0">Free exam-style practice. 2 marks per question, no negative marking. Not affiliated with NTA or UGC.</p>`})};
let E=null;
R.mock=([ns])=>{const n=+ns,meta=mockMeta(n);if(!meta)return go('/mocks');
  screen({top:tbar(meta.t),body:'<div class="empty" style="padding-top:80px"><div class="spin"></div><b>Loading test…</b></div>'});
  loadMock(n).then(M=>{if((location.hash.slice(1)||'')!=='/mock/'+n)return;E={n,M,Q:M.questions,TOT:M.questions.length,DUR:(M.minutes||90)*6e4,A:null,cur:0};
    const a=ls.get(AK(n));if(a&&a.end){E.A=a;if(Date.now()>=a.end)return submit(true);return drawExam()}
    intro()}).catch(()=>screen({top:tbar(meta.t),body:'<div class="empty"><b>Could not load this test</b>Check your connection.<br><br><button class="btn" data-a="reload">Retry</button></div>'}))};
function intro(){const r=ls.get(RK(E.n)),M=E.M,mm=M.minutes||90;
  screen({top:tbar(M.title),body:`<div class="info"><div>${I.test}<span><small>Total Questions</small><b>${E.TOT}</b></span></div><div>${I.clock}<span><small>Time Duration</small><b>${mm>=60&&mm%60===0?mm/60+(mm===60?' Hour':' Hours'):mm+' Minutes'}</b></span></div><div>${I.target}<span><small>Marking</small><b>2 marks each · ${E.TOT*2} total</b></span></div><div>${I.check}<span><small>Negative marking</small><b>No</b></span></div></div>
  <ul class="rules"><li>The timer starts when you press Start and keeps running even if you leave this screen.</li><li>If you close the app, your answers and remaining time are restored when you return.</li><li>The test submits itself at zero. You'll be warned at 15, 5 and 1 minute.</li><li>Progress is stored only on this phone.</li></ul>`,
  foot:`${r?'<button class="fb" data-a="lastres">Last result</button>':''}<button class="fb pri" data-a="startx">Start Test</button>`})}
A.startx=()=>{const t=Date.now();E.A={start:t,end:t+E.DUR,ans:{},mk:{},vis:{0:1},cur:0,w:{}};ls.set(AK(E.n),E.A);drawExam()};
A.lastres=()=>result(ls.get(RK(E.n)));
const stx=i=>{const a=E.A.ans[i]!==undefined,m=!!E.A.mk[i];return a&&m?'amr':m?'mr':a?'an':E.A.vis[i]?'va':'n'};
const saveA=()=>ls.set(AK(E.n),E.A);
function drawExam(keep){const{A:a,Q,TOT}=E,i=a.cur,x=Q[i];a.vis[i]=1;
  const ans=Object.keys(a.ans).length;
  screen({top:`<div class="tb"><button class="ib" data-a="exleave" aria-label="Leave">${I.back}</button><h1>${esc(E.M.title)}<small>${ans} of ${TOT} answered</small></h1><span class="pill" id="tm">${fmt(a.end-Date.now())}</span></div><div class="qbar"><button class="pill" data-a="xpal">Q ${i+1} / ${TOT} ${sv(P.grid,15)}</button><span style="flex:1"></span><button class="pill" style="${a.mk[i]?'':'background:var(--chip);color:var(--text2)'}" data-a="xmark">${sv(P.flag,15)}${a.mk[i]?'Marked':'Mark'}</button><button class="pill" style="background:var(--chip);color:var(--text2)" data-a="xclear" ${a.ans[i]===undefined?'disabled':''}>Clear</button></div>`,
  body:`<div class="meta"><span class="badge">${esc(x.s)}</span>${x.d==='Difficult'?'<span class="badge" style="background:var(--bad-bg);color:var(--bad-text)">TOUGH</span>':''}</div><p class="q">${esc(x.q)}</p><div class="opts">${x.o.map((t,k)=>`<button class="opt${a.ans[i]===k?' picked':''}" data-a="xopt" data-k="${k}"><span class="ol">${'ABCD'[k]}</span><span class="ot">${esc(strip(t))}</span></button>`).join('')}</div>`,
  foot:`<button class="fb" data-a="xprev" ${i===0?'disabled':''}>${I.back}Previous</button><button class="fb pri" data-a="${i===TOT-1?'xsubmit':'xnext'}">${i===TOT-1?'Submit':'Next'}${i===TOT-1?'':sv(P.chevR)}</button>`,keep});
  saveA();clearInterval(E.tick);E.tick=setInterval(loop,500);cleanup=()=>{clearInterval(E&&E.tick)};
  view.ontouchstart=e=>{swX=e.touches[0].clientX;swY=e.touches[0].clientY};view.ontouchend=e=>{const dx=e.changedTouches[0].clientX-swX,dy=e.changedTouches[0].clientY-swY;if(Math.abs(dx)>70&&Math.abs(dy)<45){dx<0?A.xnext():A.xprev()}};
}
const TH=[1,5,15];
function loop(){if(!E||!E.A)return;const rem=E.A.end-Date.now();if(rem<=0){submit(true);return}
  const tm=$('#tm');if(tm){tm.textContent=fmt(rem);tm.classList.toggle('low',rem<=5*6e4)}
  const th=TH.find(t=>rem<=t*6e4);if(th&&!E.A.w[th]){TH.forEach(t=>{if(t>=th)E.A.w[t]=1});saveA();toast(`⏱ ${th} minute${th>1?'s':''} remaining`,true)}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)loop()});
const xgo=i=>{E.A.cur=Math.max(0,Math.min(E.TOT-1,i));drawExam()};
A.xopt=t=>{const i=E.A.cur,k=+t.dataset.k;if(E.A.ans[i]===k)delete E.A.ans[i];else E.A.ans[i]=k;drawExam(true)};
A.xnext=()=>{if(E&&E.A&&E.A.cur<E.TOT-1)xgo(E.A.cur+1)};A.xprev=()=>{if(E&&E.A&&E.A.cur>0)xgo(E.A.cur-1)};
A.xmark=()=>{const a=E.A,i=a.cur;if(a.mk[i])delete a.mk[i];else a.mk[i]=true;drawExam(true)};
A.xclear=()=>{delete E.A.ans[E.A.cur];drawExam(true)};
A.exleave=()=>{toast('Your timer keeps running. Resume from Mock Tests.');back()};
A.xpal=()=>{const a=E.A,n=E.TOT,rg=Math.ceil(n/50);let r=Math.floor(a.cur/50);
  const c={an:0,va:0,mr:0,n:0};for(let i=0;i<n;i++){const s=stx(i);if(s==='amr'||s==='an')c.an++;if(s==='mr'||s==='amr')c.mr++;if(s==='va'||s==='mr')c.va++;if(s==='n')c.n++}
  const draw=()=>{const s=r*50,b=Math.min(n,s+50);$('#pal-g').innerHTML=Array.from({length:b-s},(_,k)=>{const i=s+k;return`<button class="pn ${stx(i)}${i===a.cur?' cur':''}" data-a="xgo" data-i="${i}">${i+1}</button>`}).join('');document.querySelectorAll('.chip[data-r]').forEach(z=>z.classList.toggle('on',+z.dataset.r===r))};
  openSheet(`<div class="sh-h"><h2>Question Palette</h2><button class="ib" data-a="close">${I.close}</button></div><div class="sh-b">${rg>1?`<div class="chips">${Array.from({length:rg},(_,k)=>`<button class="chip" data-a="xrng" data-r="${k}">${k*50+1}–${Math.min(n,k*50+50)}</button>`).join('')}</div>`:''}<div class="pal" id="pal-g"></div>
  <ul class="leg"><li><i style="--c:var(--ok)"></i>Answered<span>${c.an}</span></li><li><i style="--c:var(--bad)"></i>Visited, not answered<span>${c.va}</span></li><li><i style="--c:#7c4dff"></i>Marked for review<span>${c.mr}</span></li><li><i class="o"></i>Not visited<span>${c.n}</span></li></ul></div><div class="sh-f"><button class="btn" data-a="close" style="margin-bottom:9px">Back to Question</button><button class="btn dng" data-a="xsubmit">Submit Test</button></div>`,'full');
  window.__xr=k=>{r=k;draw()};draw()};
A.xrng=t=>window.__xr(+t.dataset.r);A.xgo=t=>{closeSheet();xgo(+t.dataset.i)};
A.xsubmit=()=>{const a=E.A,n=Object.keys(a.ans).length,m=Object.keys(a.mk).length;
  openSheet(`<div class="sh-h"><h2>Submit test?</h2></div><div class="sh-b"><p style="margin:0;color:var(--text2);line-height:1.55">You have answered <b>${n}</b> of ${E.TOT}, left <b>${E.TOT-n}</b> unanswered and marked <b>${m}</b> for review. Time left: <b>${fmt(a.end-Date.now())}</b>. You can't change answers after submitting.</p></div><div class="sh-f"><button class="btn dng" data-a="xyes" style="margin-bottom:9px">Yes, submit</button><button class="btn" data-a="close">Continue test</button></div>`)};
A.xyes=()=>{closeSheet();submit(false)};
function score(ans){let c=0,w=0;E.Q.forEach((x,i)=>{if(ans[i]!==undefined)ans[i]===x.a?c++:w++});const att=c+w,mx=E.TOT*2;return{correct:c,wrong:w,unans:E.TOT-att,marks:c*2,pct:c*2/mx*100,acc:att?c/att*100:0}}
function submit(auto){clearInterval(E.tick);const a=E.A||ls.get(AK(E.n));const r=Object.assign({at:Date.now(),taken:Math.min(E.DUR,Date.now()-a.start),auto:!!auto,ans:a.ans},score(a.ans));ls.set(RK(E.n),r);ls.rm(AK(E.n));E.A=null;closeSheet();result(r);if(auto)toast('Time is up. Test submitted.',true)}
const band=p=>p>=85?'Excellent':p>=70?'Very Good':p>=55?'Good':p>=40?'Needs Improvement':'Requires Focused Revision';
function result(r){cleanup=null;const{Q,TOT}=E,mx=TOT*2,C=2*Math.PI*54,subs={};
  Q.forEach((x,i)=>{const s=subs[x.s]||(subs[x.s]={n:0,att:0,c:0});s.n++;if(r.ans[i]!==undefined){s.att++;if(r.ans[i]===x.a)s.c++}});
  const L=Object.entries(subs).map(([k,v])=>({k,...v,acc:v.att?v.c/v.att*100:0}));
  const weak=L.filter(v=>v.att>=3&&v.acc<50).sort((a,b)=>a.acc-b.acc),strong=L.filter(v=>v.att>=3&&v.acc>=70);
  screen({top:tbar('Test Result',{la:'tolist'}),body:`<div class="card res"><div class="ring"><svg viewBox="0 0 120 120"><circle class="bg" cx="60" cy="60" r="54"/><circle class="fg" cx="60" cy="60" r="54" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-r.pct/100)}"/></svg><b>${Math.round(r.pct)}%</b></div><div class="sc"><small>Score</small><div>${r.marks} <span>/ ${mx}</span></div><p>${band(r.pct)}</p></div></div>
  <div class="kp"><div class="g">${I.check}<b>${r.correct}</b>Correct</div><div class="r">${I.close}<b>${r.wrong}</b>Incorrect</div><div>${I.clock}<b>${r.unans}</b>Not Attempted</div></div>
  <p class="muted" style="font-size:.75rem;margin:0 2px 4px">Accuracy ${r.acc.toFixed(0)}% · Time taken ${dur(r.taken)}${r.auto?' · auto-submitted':''}</p>
  <h2 class="h2">Subject-wise</h2><div class="rows">${L.map(v=>`<div class="sub-r"><span class="n">${esc(v.k)}</span><div class="bar"><i style="width:${v.acc}%;background:${v.att?v.acc>=70?'var(--ok)':v.acc>=50?'var(--c2)':'var(--bad)':'var(--line2)'}"></i></div><span class="p">${v.att?Math.round(v.acc)+'%':'–'}</span></div>`).join('')}</div>
  ${weak.length||strong.length?`<div class="card" style="margin-top:10px;font-size:.8125rem;line-height:1.55">${weak.length?`<b style="color:var(--bad-text)">Revise first:</b> ${weak.map(v=>esc(v.k)+' ('+Math.round(v.acc)+'%)').join('; ')}.<br>`:''}${strong.length?`<b style="color:var(--ok-text)">Strong:</b> ${strong.map(v=>esc(v.k)).join('; ')}.`:''}</div>`:''}
  <h2 class="h2">Review answers</h2><div class="chips" id="rvf"><button class="chip on" data-a="rvf" data-f="all">All ${TOT}</button><button class="chip" data-a="rvf" data-f="ok">Correct ${r.correct}</button><button class="chip" data-a="rvf" data-f="bad">Incorrect ${r.wrong}</button><button class="chip" data-a="rvf" data-f="un">Skipped ${r.unans}</button></div><div id="rv" style="margin-top:8px">${Q.map((x,i)=>{const a=r.ans[i],k=a===undefined?'un':a===x.a?'ok':'bad';
  return`<div class="rv ${k}" data-k="${k}" style="--c:${k==='ok'?'var(--ok)':k==='bad'?'var(--bad)':'var(--line2)'}"><button data-a="rvt"><span class="qn">Q${i+1}</span><span class="qt">${esc(x.q)}</span></button><div class="det"><div class="opts">${x.o.map((t,j)=>`<div class="opt${j===x.a?' ok':j===a?' bad':''}"><span class="ol">${'ABCD'[j]}</span><span class="ot">${esc(strip(t))}</span></div>`).join('')}</div><p><b>${a===undefined?'Not answered.':'Your answer: '+'ABCD'[a]+'.'}</b> Correct: ${'ABCD'[x.a]}.</p>${x.e?`<p>${esc(x.e)}</p>`:''}</div></div>`}).join('')}</div>`,
  foot:`<button class="fb" data-a="tolist">All tests</button><button class="fb pri" data-a="retake">Retry Test</button>`})}
A.rvf=t=>{document.querySelectorAll('#rvf .chip').forEach(c=>c.classList.toggle('on',c===t));const f=t.dataset.f;document.querySelectorAll('#rv .rv').forEach(c=>c.hidden=f!=='all'&&c.dataset.k!==f)};
A.rvt=t=>t.parentElement.classList.toggle('open');
A.tolist=()=>go('/mocks');
A.retake=()=>{if(!confirm('Start a fresh attempt? Your last result is replaced when you submit.'))return;A.startx()};

/* ---------- plan, notes, syllabus, pyq ---------- */
const PLANS=[['6','MONTHS','Build your foundation','Learn each unit, test it the same day, and revise more than once.','ugc-net-law-6-month-preparation-plan.html'],['3','MONTHS','Accelerate your preparation','Cover everything, test as you study and begin PYQs early.','ugc-net-law-3-month-preparation-plan.html'],['1','MONTH','Consolidate and test','Stop widening. Revise, test, find weak units and close them.','ugc-net-law-1-month-preparation-plan.html'],['2','WEEKS','Retrieve, practise and refine','Revise what is most likely to matter and practise retrieving it.','ugc-net-law-2-week-preparation-plan.html']];
R.plan=()=>{let fit=-1;if(EXAM&&EXAM.date){const d=Math.round((Date.parse(EXAM.date+'T00:00:00')-new Date().setHours(0,0,0,0))/864e5);if(d>=1)fit=d>=135?0:d>=60?1:d>=22?2:3}
  screen({top:tbar('Study Plan'),body:`<p class="muted" style="margin:2px 2px 12px;font-size:.875rem">How much time do you have? Pick a pathway.${fit>=0?' The highlighted one is the closest fit for your exam date.':''}</p>${PLANS.map((p,i)=>`<a class="plan${i===fit?' fit':''}" href="${p[4]}"><span class="tm"><b>${p[0]}</b><i>${p[1]}</i></span><div style="flex:1"><h3>${p[2]}${i===fit?' <span class="badge" style="background:var(--tint);color:var(--ac-d)">CLOSEST FIT</span>':''}</h3><p>${p[3]}</p></div>${I.chevR}</a>`).join('')}<a class="btn ghost" href="ugc-net-law-preparation-plan.html" style="margin-top:4px">Compare all pathways</a>`})};
R.pyq=()=>screen({top:tbar('Past Year Questions'),nav:'home',body:`<div class="empty" style="padding-top:60px">${sv(P.target,56)}<b style="margin-top:12px">Coming next</b>Year-wise and topic-wise UGC NET Law PYQs, with answers and concise explanations.<br><br><a class="btn" href="#/subjects">Practise MCQs</a></div>`});
R.notes=()=>{const N=[['IPR','Idea–Expression Dichotomy','Meaning, rationale, historical development and leading Indian cases.'],['CONSTITUTION','Basic Structure Doctrine','Kesavananda Bharati, Minerva Mills and later developments.'],['JURISPRUDENCE','Schools of Jurisprudence','Natural law, analytical, historical, sociological and realist approaches.'],['CONTRACT','Indian Contract Act','Offer, acceptance, consideration, capacity and discharge.']];
  screen({top:`<div class="tb"><button class="ib" data-a="drawer">${I.menu}</button><h1>Notes</h1><a class="ib" href="#/search">${I.search}</a></div>`,nav:'notes',
  body:`<h2 class="h2">Notes built for revision</h2><div class="rows">${N.map(n=>`<div class="row" style="align-items:flex-start"><div class="ti"><span class="badge" style="background:var(--tint);color:var(--ac-d)">${n[0]}</span><h3 style="margin-top:5px">${n[1]}</h3><p>${n[2]}</p></div><span class="st">Soon</span></div>`).join('')}</div>
  <h2 class="h2">Resources</h2><div class="rows">
  <a class="row" href="#/syllabus/0">${ico('book','var(--ac)')}<div class="ti"><h3>Syllabus · Law 058</h3></div>${I.chevR}</a>
  <a class="row" href="#/syllabus/1">${ico('book','var(--c2)')}<div class="ti"><h3>Syllabus · Paper 1</h3></div>${I.chevR}</a>
  <a class="row" href="#/pyq">${ico('target','var(--c2)')}<div class="ti"><h3>Previous-Year Questions</h3></div>${I.chevR}</a>
  <a class="row" href="unit-2-constitutional-administrative-law.html">${ico('cols','var(--ac)')}<div class="ti"><h3>Unit II · Constitutional & Administrative Law</h3></div>${I.ext}</a>
  <a class="row" href="faq.html">${ico('help','var(--c2)')}<div class="ti"><h3>FAQ</h3></div>${I.ext}</a></div>`})};
R.syllabus=([p])=>{const set=p==='1'?1:0;let Y=null;try{Y=new Function(S.syl+';return syllabus')()}catch{}
  if(!Y&&!S.syl){fetch('syllabus-data.js').then(r=>r.text()).then(t=>{S.syl=t;R.syllabus([p])}).catch(()=>screen({top:tbar('Syllabus'),body:'<div class="empty"><b>Could not load syllabus</b></div>'}));screen({top:tbar('Syllabus'),body:'<div class="empty"><div class="spin"></div></div>'});return}
  const data=set?Y.paper1:Y.law,U=set?P1:LAW;
  screen({top:tbar(set?'Syllabus · Paper 1':'Syllabus · Law 058'),body:`<div class="rows syl">${data.map((u,i)=>`<div><button class="row" data-a="syt">${ico(U[i]?U[i][3]:'book',COL[i])}<div class="ti"><h3>${i+1}. ${esc(u[0])}</h3><p>${u[1].length} topics</p></div>${I.chevR}</button><div class="det" hidden style="padding:0 14px 12px;border-bottom:1px solid var(--line)"><ul>${u[1].map(t=>`<li>${esc(t)}</li>`).join('')}</ul><a class="btn sm" href="#/practice/${set?'P':'L'}${i}">Practise MCQs</a></div></div>`).join('')}</div>`})};
A.syt=t=>{t.classList.toggle('open');const d=t.nextElementSibling;d.hidden=!d.hidden};

/* ---------- bookmarks, history, profile ---------- */
R.bookmarks=()=>{const l=S.bank.filter(x=>BM[qid(x)]);
  screen({top:tbar('Bookmarks'),nav:null,body:l.length?`<button class="btn" data-a="bmgo" style="margin-bottom:12px">Practise all ${l.length} bookmarked</button><div class="rows">${l.slice(0,100).map((x,i)=>`<button class="row hit" data-a="bmopen" data-i="${i}"><div class="ti"><div class="t">${esc(x.q)}</div><p>${esc(x.u)}</p></div>${I.chevR}</button>`).join('')}</div>`:`<div class="empty" style="padding-top:60px">${sv(P.bm,54)}<b style="margin-top:10px">No bookmarks yet</b>Tap the bookmark icon on any question to save it here.</div>`})};
A.bmgo=()=>{S.prac=null;go('/practice/BM')};
A.bmopen=t=>{const l=S.bank.filter(x=>BM[qid(x)]);openSession('BM','Bookmarks',l,+t.dataset.i);go('/practice/BM')};
R.history=()=>{const items=MOCKS.map(m=>({m,r:ls.get(RK(m.n))})).filter(z=>z.r).sort((a,b)=>b.r.at-a.r.at);
  screen({top:tbar('Test History'),body:items.length?`<div class="rows">${items.map(({m,r})=>`<a class="row" href="#/mock/${m.n}">${ico('test','var(--c2)')}<div class="ti"><h3>${esc(m.t)}</h3><p>${new Date(r.at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} · ${r.correct} right, ${r.wrong} wrong</p></div><span class="st ok">${r.marks}/${m.q*2}</span></a>`).join('')}</div>`:'<div class="empty"><b>No tests taken yet</b>Your completed mock tests will be listed here.</div>'})};
R.profile=()=>{const all=S.bank.length,s=prog.stats(S.bank),res=MOCKS.map(m=>ls.get(RK(m.n))?{m,r:ls.get(RK(m.n))}:null).filter(Boolean),avg=res.length?Math.round(res.reduce((a,z)=>a+z.r.pct,0)/res.length):0,dg=prog.daily(),pc=s.a/all*100;
  screen({top:`<div class="tb"><button class="ib" data-a="drawer">${I.menu}</button><h1>My Progress</h1></div>`,nav:'prof',
  body:`<div class="card"><b style="font-size:.8125rem;color:var(--mut)">Overall progress</b><div class="prog-n"><b>${fnum(s.a)} <span>/ ${fnum(all)}</span></b><em>${pc.toFixed(1)}%</em></div><div class="bar"><i style="width:${pc}%"></i></div><div class="mini"><span style="--c:var(--ok)">${fnum(s.ok)} correct</span><span style="--c:var(--bad)">${fnum(s.bad)} incorrect</span><span style="--c:var(--line2)">${s.a?Math.round(s.ok/s.a*100):0}% accuracy</span></div></div>
  <div class="kp"><div><b>${res.length}</b>Mock Tests</div><div><b>${avg}%</b>Avg. Score</div><div><b>${Object.keys(BM).length}</b>Bookmarks</div></div>
  <div class="rows"><a class="row" href="#/bookmarks">${I.bm}<div class="ti"><h3>My Bookmarks</h3></div>${I.chevR}</a><a class="row" href="#/history">${I.clock}<div class="ti"><h3>My Test History</h3></div>${I.chevR}</a>
  <button class="row" data-a="goal">${I.target}<div class="ti"><h3>Daily goal</h3><p>Today ${dg.n}/${dg.goal} · ${dg.streak}-day streak</p></div>${I.chevR}</button>
  <button class="row" data-a="drawer">${I.gear}<div class="ti"><h3>Appearance</h3><p>Colour theme and dark mode</p></div>${I.chevR}</button>
  <button class="row" data-a="resetall">${I.trash}<div class="ti"><h3>Reset practice progress</h3></div>${I.chevR}</button>
  ${window.NLPWA&&NLPWA.available()?`<button class="row" data-a="install">${sv('<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>')}<div class="ti"><h3>Install app</h3><p>Add to your home screen, works offline</p></div>${I.chevR}</button>`:''}
  <button class="row" data-a="desktop">${I.desk}<div class="ti"><h3>Use desktop site</h3></div>${I.chevR}</button>
  <button class="row" data-a="about">${I.info}<div class="ti"><h3>About</h3></div>${I.chevR}</button></div>`})};
A.goal=()=>{const g=prog.daily().goal;openSheet(`<div class="sh-h"><h2>Daily goal</h2><button class="ib" data-a="close">${I.close}</button></div><div class="sh-b"><p class="muted" style="margin:0 0 12px">Questions to answer each day.</p><div class="seg">${[10,20,30,50,100].map(n=>`<button class="${n===g?'on':''}" data-a="setgoal" data-n="${n}">${n}</button>`).join('')}</div></div>`)};
A.setgoal=t=>{prog.setGoal(+t.dataset.n);closeSheet();route()};
A.resetall=()=>{if(!confirm('Erase ALL saved practice answers on this phone? Mock results and bookmarks are kept.'))return;ls.rm(PGK);PG=null;PGV++;stc.clear();S.ex.clear();S.peek.clear();S.prac=null;route();toast('Progress reset')};
A.about=()=>openSheet(`<div class="sh-h"><h2>About</h2><button class="ib" data-a="close">${I.close}</button></div><div class="sh-b"><p style="margin:0;color:var(--text2);line-height:1.6;font-size:.9rem">NET Law 058 is a free educational resource for UGC NET Law (Code 058) and Paper 1. It is not affiliated with NTA or UGC. Verify important points with official sources. Your progress, bookmarks and mock attempts are stored only in this browser.</p></div>`);

/* ---------- start ---------- */
setTheme();
if(!location.hash)history.replaceState(null,'',location.pathname+location.search);
loadBank().catch(()=>{});
route();
})();
