/* click-spark.js — feedback-delight · sparks fly from the click point. transform/opacity only. Off under reduced-motion. */
(function(g){ 'use strict';
  function red(){ return g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function burst(el, x, y){ var n=8, host=document.createElement('div'); host.style.cssText='position:fixed;left:'+x+'px;top:'+y+'px;pointer-events:none;z-index:9999';
    for(var i=0;i<n;i++){ var s=document.createElement('span'); var a=(i/n)*Math.PI*2, d=18+Math.random()*10;
      s.style.cssText='position:absolute;width:4px;height:4px;border-radius:2px;background:'+(el.getAttribute('data-spark')||'#8b7cf6')+';transform:translate(-50%,-50%)';
      host.appendChild(s); (function(sp,dx,dy){ sp.animate([{transform:'translate(-50%,-50%) translate(0,0)',opacity:1},{transform:'translate(-50%,-50%) translate('+dx+'px,'+dy+'px)',opacity:0}],{duration:480,easing:'cubic-bezier(.2,.7,.3,1)'}); })(s, Math.cos(a)*d, Math.sin(a)*d);
    } document.body.appendChild(host); setTimeout(function(){ host.remove(); }, 520); }
  function attach(el){ if(el.__spark) return; el.__spark=1; el.addEventListener('click', function(e){ if(!red()) burst(el, e.clientX, e.clientY); }); }
  function init(){ var els=document.querySelectorAll('.click-spark'); for(var i=0;i<els.length;i++) attach(els[i]); }
  g.attachClickSpark=attach; if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
