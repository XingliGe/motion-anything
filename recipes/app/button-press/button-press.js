/* button-press.js — motion-anything recipe · App UI micro-interaction (preview auto-loops) */
var b=document.querySelector('.ui-btn');
function press(on){b.classList.toggle('pressed',on);}
b.addEventListener('pointerdown',function(){press(true);});
b.addEventListener('pointerup',function(){press(false);});
b.addEventListener('pointerleave',function(){press(false);});
setInterval(function(){press(true);setTimeout(function(){press(false);},150);},1500);
