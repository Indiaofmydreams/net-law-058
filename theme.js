(()=>{const K='netlaw058-theme',d=document.documentElement,OK=['green','orange','blue','aqua','purple'],NM={green:'Green',orange:'Orange',blue:'Blue',aqua:'Aqua',purple:'Purple'};
let t={};try{t=JSON.parse(localStorage.getItem(K)||'{}')}catch{}
const say=m=>window.announce&&window.announce(m),mode=()=>t.m||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
const btn=document.getElementById('pal-btn'),pop=document.getElementById('pal-pop'),mb=document.getElementById('mode-btn');
const apply=()=>{d.dataset.scheme=OK.includes(t.s)?t.s:'green';d.dataset.mode=mode();document.querySelectorAll('.sw-opt').forEach(b=>b.setAttribute('aria-pressed',b.dataset.s===d.dataset.scheme));if(mb){const dk=d.dataset.mode==='dark';mb.setAttribute('aria-label',dk?'Switch to light mode':'Switch to dark mode');mb.title=dk?'Light mode':'Dark mode'}};
const save=()=>{try{localStorage.setItem(K,JSON.stringify(t))}catch{}};
const close=back=>{if(!pop||pop.hidden)return;pop.hidden=true;btn.setAttribute('aria-expanded','false');if(back)btn.focus()};
if(btn&&pop){btn.onclick=()=>{const o=pop.hidden;pop.hidden=!o;btn.setAttribute('aria-expanded',String(o));if(o){const c=pop.querySelector('[aria-pressed=true]')||pop.querySelector('.sw-opt');c&&c.focus()}};
pop.querySelectorAll('.sw-opt').forEach(b=>b.onclick=()=>{t.s=b.dataset.s;save();apply();say(NM[t.s]+' theme selected');close(true)});
document.addEventListener('click',e=>{if(!pop.hidden&&!pop.contains(e.target)&&!btn.contains(e.target))close(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close(true)})}
if(mb)mb.onclick=()=>{t.m=d.dataset.mode==='dark'?'light':'dark';save();apply();say(t.m==='dark'?'Dark mode on':'Light mode on')};
apply();})();
