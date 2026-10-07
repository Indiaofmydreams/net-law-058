/* plan.js: tiny enhancements for the study-plan section/pages. Everything works without it (cards are plain links). */
(function(){"use strict";
var KEY="netlaw058-plan-progress";
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return{}}}
function save(o){try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}}
/* 1. remember ticked checklist items on pathway pages (this browser only) */
var boxes=document.querySelectorAll(".phases input[type=checkbox][data-k]");
if(boxes.length){var st=load();boxes.forEach(function(b){b.checked=!!st[b.dataset.k];b.addEventListener("change",function(){var s=load();if(b.checked)s[b.dataset.k]=1;else delete s[b.dataset.k];save(s)})})}
/* 2. gently point to the closest pathway, using the exam date already set in exam-dates.json */
var fit=document.getElementById("plan-fit");
if(fit&&window.fetch){fetch("exam-dates.json",{cache:"no-cache"}).then(function(r){return r.json()}).then(function(d){
  var t=new Date((d.date||"")+"T00:00:00"),n=new Date();n.setHours(0,0,0,0);
  var days=Math.round((t-n)/864e5);if(isNaN(days)||days<1)return;
  var k=days>=135?"6":days>=60?"3":days>=22?"1":"2w";
  var card=document.querySelector('.plan-card[data-plan="'+k+'"]');if(!card)return;
  var w=Math.max(1,Math.round(days/7));
  fit.textContent="The exam date currently set on this site is "+t.toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})+", about "+(days<=21?days+" day"+(days>1?"s":""):w+" weeks")+" away. The highlighted pathway is the closest fit, but choose whichever feels honest for you.";
  fit.hidden=false;card.classList.add("is-fit");
  var f=document.createElement("span");f.className="pc-flag";f.textContent="CLOSEST FIT";card.appendChild(f);
}).catch(function(){})}
})();
