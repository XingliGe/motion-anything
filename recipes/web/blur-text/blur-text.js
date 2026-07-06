/* blur-text.js — text-kinetic · split words + stagger a blur→focus. Reduced-motion → instant. */
(function(g){ 'use strict';
  function red(){ return g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function split(el){ var parts=el.textContent.split(/(\s+)/); el.textContent=''; var i=0;
    parts.forEach(function(p){ if(p===''){return;} if(/^\s+$/.test(p)){ var sp=document.createElement('span'); sp.className='bt-sp'; el.appendChild(sp); return; }
      var w=document.createElement('span'); w.className='bt-w'; w.textContent=p; w.style.setProperty('--bt-d',(i*90)+'ms'); i++; el.appendChild(w); }); }
  function init(){ var els=document.querySelectorAll('[data-blur-text]'); if(!els.length) return;
    els.forEach(split); if(red()){ els.forEach(function(e){ e.classList.add('in'); }); return; }
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ els.forEach(function(e){ e.classList.add('in'); }); }); }); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
