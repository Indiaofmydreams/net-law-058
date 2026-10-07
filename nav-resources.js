/* nav-resources.js: opens/closes the header "Resources" dropdown (click, hover on desktop, Esc, outside click). */
(function(){"use strict";
var dd=document.querySelector(".nav-dd");if(!dd)return;
var b=dd.querySelector(".nav-dd-btn");
function set(o){dd.classList.toggle("open",o);b.setAttribute("aria-expanded",o?"true":"false")}
b.addEventListener("click",function(e){e.stopPropagation();set(!dd.classList.contains("open"))});
document.addEventListener("click",function(e){if(!dd.contains(e.target))set(false)});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&dd.classList.contains("open")){set(false);b.focus()}});
dd.addEventListener("focusout",function(e){if(e.relatedTarget&&!dd.contains(e.relatedTarget))set(false)});
dd.querySelectorAll(".nav-dd-menu a").forEach(function(a){a.addEventListener("click",function(){set(false)})});
if(window.matchMedia&&matchMedia("(hover:hover)").matches)dd.addEventListener("mouseleave",function(){set(false)});
})();
