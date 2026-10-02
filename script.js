document.querySelector(".menu-toggle").onclick=()=>document.getElementById("main-nav").classList.toggle("open");
window.announce=m=>{const l=document.getElementById("live");if(!l)return;l.textContent="";setTimeout(()=>{l.textContent=m},60)};
