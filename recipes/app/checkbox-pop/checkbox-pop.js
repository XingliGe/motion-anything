/* checkbox-pop.js — motion-anything recipe · App UI micro-interaction (preview auto-loops) */
var c=document.querySelector('.ui-cbx');
c.addEventListener('click',function(){c.classList.toggle('on');});
setInterval(function(){c.classList.toggle('on');},1500);
