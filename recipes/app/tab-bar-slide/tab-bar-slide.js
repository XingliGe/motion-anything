/* tab-bar-slide.js — motion-anything recipe · App UI micro-interaction (preview auto-loops) */
var tabs=[].slice.call(document.querySelectorAll('.ui-tabs .tb'));var ind=document.querySelector('.ui-tabs .ind');var i=0;
function go(n){i=n;tabs.forEach(function(t,k){t.classList.toggle('on',k===n);});ind.style.transform='translateX('+(n*62)+'px)';}
tabs.forEach(function(t,k){t.addEventListener('click',function(){go(k);});});
setInterval(function(){go((i+1)%tabs.length);},1500);
