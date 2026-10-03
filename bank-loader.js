/* Loads questions.json plus any "packs" listed in packs.json, then hands one merged list to qbank.js / modules.js.
   To add a new question file: upload it to the repo, then add one line to packs.json. Nothing else to edit. */
(()=>{
const css=document.createElement('style');css.textContent='.qb-q{white-space:pre-line}';document.head.appendChild(css);
const norm=(it,unit)=>{
  if(Array.isArray(it.o)&&typeof it.a==='number'){return{...it,u:it.u||unit}}            // already in site format
  const o=it.options||{},keys=Array.isArray(o)?o.map((_,i)=>'ABCD'[i]):Object.keys(o).sort();
  const txt=keys.map(k=>String(Array.isArray(o)?o[keys.indexOf(k)]:o[k]).replace(/^[A-D][.)]\s+/,''));
  const a=typeof it.answer==='number'?it.answer:keys.indexOf(String(it.answer).trim().toUpperCase());
  return{u:it.u||it.unit||unit,t:it.t||it.category||it.topic||it.type||'',q:it.question||it.q,
         o:txt.map((t,i)=>'ABCD'[i]+'. '+t),a:a,e:it.explanation||it.e||''};
};
const getJSON=f=>fetch(f).then(r=>{if(!r.ok)throw 0;return r.json()});
let p=null;
window.loadBank=()=>p||(p=getJSON('questions.json').then(base=>
  getJSON('packs.json').catch(()=>[]).then(packs=>
    Promise.all(packs.map(k=>getJSON(k.file).then(d=>(Array.isArray(d)?d:d.questions||[]).map(x=>norm(x,k.unit))).catch(()=>[])))
  ).then(parts=>base.concat(...parts).filter(x=>x.q&&x.o&&x.o.length===4&&x.a>=0&&x.a<4))
));
})();
