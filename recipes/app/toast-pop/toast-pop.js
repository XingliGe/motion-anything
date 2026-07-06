/* toast-pop.js — motion-anything recipe · App UI micro-interaction (preview auto-loops) */
var t=document.querySelector('.ui-toast');
function cycle(){t.classList.add('show');setTimeout(function(){t.classList.remove('show');},1700);}
cycle();setInterval(cycle,2600);
