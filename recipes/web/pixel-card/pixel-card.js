/* pixel-card.js — hover-press · build a light pixel overlay with staggered delays. */
(function(g){ 'use strict';
  function attach(el){ if(el.__pc) return; el.__pc=1; var grid=el.querySelector('.pxc-grid'); if(!grid) return; var n=+el.getAttribute('data-grid')||8;
    grid.style.gridTemplateColumns='repeat('+n+',1fr)'; grid.style.gridTemplateRows='repeat('+n+',1fr)';
    for(var i=0;i<n*n;i++){ var d=document.createElement('i'); d.style.setProperty('--d',(Math.random()*300|0)+'ms'); grid.appendChild(d); } }
  function init(){ var els=document.querySelectorAll('.pxc'); for(var i=0;i<els.length;i++) attach(els[i]); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
