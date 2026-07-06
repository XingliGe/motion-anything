/* counter.js — emphasis · roll digit strips to the number on view. Reduced-motion → set instantly. */
(function(g){ 'use strict';
  function red(){ return g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function build(el){ var n=String(el.getAttribute('data-to')||el.textContent||'0').replace(/[^0-9]/g,''); el.textContent='';
    var strips=[]; for(var i=0;i<n.length;i++){ var d=document.createElement('span'); d.className='dig'; var strip=document.createElement('span'); strip.className='strip';
      for(var k=0;k<=9;k++){ var s=document.createElement('span'); s.textContent=k; strip.appendChild(s); } d.appendChild(strip); el.appendChild(d); strips.push({strip:strip, target:+n[i]}); }
    return strips; }
  function run(strips){ strips.forEach(function(o){ o.strip.style.transform= red()?('translateY(-'+o.target+'em)'):'translateY(0)'; });
    if(red()) return; requestAnimationFrame(function(){ requestAnimationFrame(function(){ strips.forEach(function(o){ o.strip.style.transform='translateY(-'+o.target+'em)'; }); }); }); }
  function init(){ var els=document.querySelectorAll('.counter'); els.forEach(function(el){ var strips=build(el);
    if(!('IntersectionObserver' in g)){ run(strips); return; } var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ run(strips); io.unobserve(e.target); } }); }, {threshold:.4}); io.observe(el); }); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
