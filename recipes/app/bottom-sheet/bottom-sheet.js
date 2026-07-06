/* bottom-sheet.js — motion-anything recipe · App UI micro-interaction (preview auto-loops) */
var p=document.querySelector('.ui-phone');
function cycle(){p.classList.add('open');setTimeout(function(){p.classList.remove('open');},1900);}
setTimeout(cycle,300);setInterval(cycle,3000);
