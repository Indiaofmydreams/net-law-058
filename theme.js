(()=>{const K='netlaw058-theme',d=document.documentElement;let t={};try{t=JSON.parse(localStorage.getItem(K)||'{}')}catch{}
const mode=()=>t.m||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
const apply=()=>{d.dataset.scheme=t.s||'green';d.dataset.mode=mode();document.querySelectorAll('.sw').forEach(b=>b.setAttribute('aria-pressed',b.dataset.s===d.dataset.scheme));const m=document.getElementById('mode-btn');if(m){const dk=d.dataset.mode==='dark';m.setAttribute('aria-label',dk?'Switch to light mode':'Switch to dark mode');m.title=dk?'Light mode':'Dark mode'}};
const save=()=>{try{localStorage.setItem(K,JSON.stringify(t))}catch{}};
document.querySelectorAll('.sw').forEach(b=>b.onclick=()=>{t.s=b.dataset.s;save();apply()});
const m=document.getElementById('mode-btn');if(m)m.onclick=()=>{t.m=d.dataset.mode==='dark'?'light':'dark';save();apply()};
apply();
})();
