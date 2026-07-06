/* pixel-transition.js — hover-press · build a pixel grid over the card; randomized reveal delays. */
(function(g){ 'use strict';
  function attach(el){ if(el.__px) return; el.__px=1; var back=el.querySelector('.pixt-back'); if(!back) return;
    var n=+el.getAttribute('data-grid')||10; back.style.gridTemplateColumns='repeat('+n+',1fr)'; back.style.gridTemplateRows='repeat('+n+',1fr)';
    for(var i=0;i<n*n;i++){ var d=document.createElement('div'); d.className='px'; d.style.setProperty('--d',(Math.random()*260|0)+'ms'); back.appendChild(d); } }
  function init(){ var els=document.querySelectorAll('.pixt'); for(var i=0;i<els.length;i++) attach(els[i]); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
