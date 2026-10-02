(()=>{
const EMAIL='your-email@example.com',KEY='netlaw058-terms-v1';
const T=[
["Study aid, not advice","Notes, MCQs and PYQs are for education only.","Everything here is for general academic use. It is not legal advice, official exam guidance, or a substitute for textbooks, bare Acts, judgments or official notifications."],
["No official affiliation","Independent. Not linked to UGC, NTA or any authority.","NET Law 058 is not affiliated with, authorised by or endorsed by the UGC, the NTA or any government body. Names such as UGC NET, statutes and cases are used only to identify the subject matter."],
["Verify before you rely","Laws and syllabi change. Check official sources.","We take reasonable care, but give no warranty that content is complete, current or error-free. Always confirm the syllabus, provisions, amendments and judgments from official sources. Importance ratings and question patterns are indicative estimates."],
["No result guarantee","Resources do not promise a score or qualification.","Success depends on your own preparation and performance. We are not responsible for exam outcomes or decisions you make based on this site."],
["Limitation of liability","Limited liability, to the extent Indian law allows.","We are not liable for loss or disadvantage arising from errors or outdated content, reliance without verification, downtime, or technical issues. Nothing here excludes liability that cannot lawfully be excluded, such as fraud or wilful misconduct, or waives any right that cannot lawfully be waived."],
["Copyright","Do not copy or resell our original material.","Our original notes, question compilations, graphics and design are protected. Statutes, judgments and third-party material keep their own legal status. Do not republish or commercially exploit our content without permission. If you believe something infringes your rights, write to us and we will review it."],
["AI-assisted content","Some material may be AI-assisted and can contain errors.","Parts of this site may be drafted or assisted by AI tools. We review reasonably, but explanations or citations may be incomplete or outdated. Verify anything important."],
["External links","We do not control linked websites.","Links to official portals and other sites are for convenience, not endorsement. We are not responsible for their content or privacy practices."],
["Changes and governing law","Content may change. Indian law applies.","We may update, suspend or remove any part of the site at any time. These terms are governed by the laws of India, and disputes are subject to the jurisdiction of competent courts."]];
const back=document.createElement('div');back.className='tm-back';back.setAttribute('role','dialog');back.setAttribute('aria-modal','true');back.setAttribute('aria-labelledby','tm-t');
back.innerHTML=`<div class="tm"><div class="tm-top"><div class="tm-ttl"><span class="tm-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg></span><div><h2 id="tm-t">Before you continue</h2><p>Disclaimer and terms of use · Updated 1 October 2026</p></div></div><button class="tm-agree" id="tm-ok">✓ I agree</button><button class="tm-x" id="tm-x" aria-label="Close">✕</button></div>
<div class="tm-body"><p class="tm-lead">NET Law 058 is a free, independent study resource. The short version: use it to learn, and verify anything important. Tap a point for details.</p>${T.map(([a,b,c])=>`<div class="tm-i"><button class="tm-h" aria-expanded="false"><span><b>${a}</b><small>${b}</small></span><i></i></button><div class="tm-d"><div><p>${c}</p></div></div></div>`).join('')}</div>
<div class="tm-foot">Questions or corrections: <a href="mailto:${EMAIL}" style="color:var(--ac);font-weight:700">${EMAIL}</a></div></div>`;
document.body.appendChild(back);
const box=back.querySelector('.tm'),ok=back.querySelector('#tm-ok');
back.querySelectorAll('.tm-h').forEach(h=>h.onclick=()=>{const i=h.closest('.tm-i'),o=i.classList.toggle('open');h.setAttribute('aria-expanded',o)});
let agreed=false;try{agreed=localStorage.getItem(KEY)==='1'}catch{}
const open=again=>{box.classList.toggle('again',again);back.classList.add('show');document.body.style.overflow='hidden';ok.focus()},
close=()=>{back.classList.remove('show');document.body.style.overflow=''};
ok.onclick=()=>{try{localStorage.setItem(KEY,'1')}catch{}agreed=true;close()};
back.querySelector('#tm-x').onclick=close;
back.onclick=e=>{if(e.target===back&&agreed)close()};
addEventListener('keydown',e=>{if(e.key==='Escape'&&agreed&&back.classList.contains('show'))close()});
document.querySelectorAll('[data-terms]').forEach(a=>a.onclick=e=>{e.preventDefault();open(true)});
if(!agreed)setTimeout(()=>open(false),250);
})();
