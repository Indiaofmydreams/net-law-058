(()=>{const root=document.getElementById('qb-root');if(!root)return;
const start=QBANK=>{
const KEY='netlaw058-qb-v1';let saved=[];try{saved=JSON.parse(localStorage.getItem(KEY)||'[]')}catch{}
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(saved))}catch{}};
const P=NLNav.prog;let unit='All',q='',onlySaved=false,allOn=false,rev=new Set(),snap=[];
const units=['All',...new Set(QBANK.map(x=>x.u).filter(Boolean))],L='ABCD';
const eye='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
root.innerHTML=`<div class="qb-top"><div><h2>Practice questions</h2><p>Try each question first. Tap the green eye to check the answer and explanation.</p></div></div>
<div class="qb-tools"><div class="qb-row"><input class="qb-search" type="search" placeholder="Search questions" aria-label="Search questions"><button class="qb-saved">★ Saved</button><button class="qb-all" aria-pressed="false"><span class="qb-sw"></span>Show all answers</button></div><div class="qb-units"></div></div>
<div class="qb-meta" aria-live="polite"></div><div class="nl-dg-h"></div><div class="nl-pp-h"></div><div class="nl-sf-h"></div><div class="nl-rg-h"></div><div class="nl-pg-t"></div><div class="qb-list"></div><div class="nl-pg-b"></div>`;
const $=s=>root.querySelector(s),list=$('.qb-list');
NLNav.daily($('.nl-dg-h'));
const pp=NLNav.practice($('.nl-pp-h')),sf=NLNav.statusFilter($('.nl-sf-h'),()=>draw()),pg=NLNav.pager({rangeHost:$('.nl-rg-h'),topHost:$('.nl-pg-t'),bottomHost:$('.nl-pg-b'),anchor:$('.nl-pp-h'),list:list,onChange:()=>draw(true,true)});NLNav.track(list);
const base=()=>QBANK.map((x,i)=>[x,i]).filter(([x,i])=>(unit==='All'||x.u===unit)&&(!onlySaved||saved.includes(i))&&(!q||(x.q+x.o.join(' ')).toLowerCase().includes(q)));
const vis=()=>{const f=sf.get(),b=base();return f==='all'?b:b.filter(([x])=>P.status(x)===f)};
const prac=()=>{const f=sf.get(),g=pg.get();if(f==='all'){const s=P.stats(snap.slice(g.rs,g.re).map(([x])=>x));pp.set(s.a,g.re-g.rs,`Questions ${g.rs+1}–${g.re}`)}else{const s=P.stats(base().map(([x])=>x));pp.set(s.a,s.n,`Current filter · ${s.bad} mistake${s.bad===1?'':'s'}`)}};
const isRev=i=>allOn||rev.has(i);
function meta(){const v=snap,n=v.filter(([,i])=>isRev(i)).length;$('.qb-meta').innerHTML=`${v.length} question${v.length===1?'':'s'} · <b>${n} answer${n===1?'':'s'} shown</b>`}
function units_(){$('.qb-units').innerHTML=units.map(u=>`<button class="qb-u${u===unit?' on':''}" data-u="${u}">${u==='All'?'All units':u}</button>`).join('')}
function setRev(card,i,on){card.classList.toggle('rev',on);card.querySelector('.qb-eye').setAttribute('aria-expanded',on);card.querySelector('.qb-eye').title=on?'Hide answer':'Show answer'}
function draw(keep,fromPager){if(!fromPager){snap=vis();pg.setTotal(snap.length,keep)}const v=snap,g=pg.get(),filt=unit!=='All'||q||onlySaved,flt=sf.get();sf.counts(P.stats(base().map(([x])=>x)));list.innerHTML='';v.slice(g.from,g.to).forEach(([x,i],n)=>{const c=document.createElement('div');const pk=P.get(x);c.className='qb-card'+(pk?' nl-ans':'');
c.innerHTML=`<div class="qb-h"><span class="qb-n">${g.from+n+1}</span><p class="qb-q"></p><div class="qb-acts"><button class="qb-ic qb-star${saved.includes(i)?' on':''}" aria-label="Save question" title="Save for revision">★</button><button class="qb-ic qb-eye" aria-label="Show answer" aria-expanded="false" title="Show answer">${eye}</button></div></div><span class="qb-u2"></span><div class="qb-o">${x.o.map((t,k)=>`<div class="qb-opt${pk&&pk.k===k?' sel':''}${k===x.a?' ok':''}" data-k="${k}" role="button" tabindex="0"><span></span><span class="mk"></span></div>`).join('')}</div><div class="qb-e"><div><p></p></div></div>`;
c.querySelector('.qb-q').textContent=x.q;c.querySelector('.qb-u2').textContent=[x.t,x.u,filt?'Bank Q'+(i+1):''].filter(Boolean).join(' · ');c.querySelectorAll('.qb-opt').forEach((o,k)=>o.firstChild.textContent=x.o[k]);c.querySelector('.qb-e p').textContent=x.e||'';
c.querySelector('.qb-eye').onclick=()=>{if(allOn){allOn=false;rev=new Set(QBANK.map((_,k)=>k));$('.qb-all').classList.remove('on');$('.qb-all').setAttribute('aria-pressed','false')}const on=!rev.has(i);on?rev.add(i):rev.delete(i);setRev(c,i,on);meta();window.announce&&window.announce(on?'Answer: '+x.o[x.a]+'. '+(x.e||''):'Answer hidden')};
c.querySelector('.qb-star').onclick=e=>{const s=saved.indexOf(i);s<0?saved.push(i):saved.splice(s,1);persist();e.currentTarget.classList.toggle('on',s<0);if(onlySaved){draw(true)}};
c.querySelectorAll('.qb-opt').forEach(o=>{const f=()=>{P.set(x,+o.dataset.k);c.classList.add('nl-ans');prac();c.querySelectorAll('.qb-opt').forEach(z=>z.classList.toggle('sel',z===o))};o.onclick=f;o.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f()}}});
if(isRev(i)||flt==='bad')setRev(c,i,true);list.appendChild(c)});
if(!v.length)list.innerHTML='<p class="qb-empty">'+(flt==='u'?'You have answered every question here.':flt==='bad'?'No mistakes to review here. Nice work.':'No questions found. Clear the search or choose another unit.')+'</p>';
prac();meta()}
$('.qb-all').onclick=e=>{const b=e.currentTarget;allOn=!allOn;if(!allOn)rev=new Set();b.classList.toggle('on',allOn);b.setAttribute('aria-pressed',allOn);list.querySelectorAll('.qb-card').forEach(c=>setRev(c,0,allOn));meta();window.announce&&window.announce(allOn?'All answers shown':'All answers hidden')};
$('.qb-units').onclick=e=>{const b=e.target.closest('button');if(!b)return;unit=b.dataset.u;units_();sf.reset();draw()};
$('.qb-search').oninput=e=>{q=e.target.value.trim().toLowerCase();draw()};
$('.qb-saved').onclick=e=>{onlySaved=!onlySaved;e.currentTarget.classList.toggle('on',onlySaved);draw()};
units_();draw();
document.addEventListener('nl-prog',()=>{sf.counts(P.stats(base().map(([x])=>x)));prac()});
};
if(window.QBANK_DATA)start(window.QBANK_DATA);else window.loadBank().then(start).catch(()=>{root.innerHTML='<p class="qb-empty">Could not load questions.json. Upload it next to index.html.</p>'});
})();
