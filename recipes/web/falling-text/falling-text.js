/* falling-text.js — text-kinetic · split letters + stagger a drop-in. Reduced-motion → instant. */
(function(g){ 'use strict';
  function red(){ return g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function split(el){ var t=el.textContent; el.textContent=''; var k=0;
    t.split('').forEach(function(c){ if(c===' '){ el.appendChild(document.createTextNode(' ')); return; } var s=document.createElement('span'); s.className='fl-c'; s.textContent=c; s.style.setProperty('--fl-d',(k*55)+'ms'); k++; el.appendChild(s); }); }
  function init(){ var els=document.querySelectorAll('[data-falling]'); if(!els.length) return; els.forEach(split);
    if(red()){ els.forEach(function(e){ e.classList.add('in'); }); return; }
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ els.forEach(function(e){ e.classList.add('in'); }); }); }); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
