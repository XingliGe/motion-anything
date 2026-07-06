/* magnet-lines.js — ambient · build a grid; each line rotates to face the pointer. Off under reduced-motion. */
(function(g){ 'use strict';
  function red(){ return g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function attach(el){ if(el.__ml) return; el.__ml=1; var rows=+el.getAttribute('data-rows')||9, cols=+el.getAttribute('data-cols')||9;
    el.style.gridTemplateColumns='repeat('+cols+',1fr)'; var items=[]; for(var i=0;i<rows*cols;i++){ var d=document.createElement('div'); d.className='ml'; el.appendChild(d); items.push(d); }
    if(red()) return;
    el.addEventListener('pointermove', function(e){ items.forEach(function(d){ var r=d.getBoundingClientRect(); var a=Math.atan2(e.clientY-(r.top+r.height/2), e.clientX-(r.left+r.width/2)); d.style.transform='rotate('+(a+Math.PI/2)+'rad)'; }); }); }
  function init(){ var els=document.querySelectorAll('.mag-lines'); for(var i=0;i<els.length;i++) attach(els[i]); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
