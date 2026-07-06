/* dock.js — hover-press · scale each icon by proximity to the pointer. */
(function(g){ 'use strict';
  function red(){ return g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function attach(el){ if(el.__dk) return; el.__dk=1; var items=[].slice.call(el.querySelectorAll('.dk')); if(red()) return;
    el.addEventListener('pointermove', function(e){ items.forEach(function(d){ var r=d.getBoundingClientRect(); var dist=Math.abs(e.clientX-(r.left+r.width/2)); var s=Math.max(1, 1.6 - dist/140); d.style.transform='scale('+s+')'; }); });
    el.addEventListener('pointerleave', function(){ items.forEach(function(d){ d.style.transform='scale(1)'; }); }); }
  function init(){ var els=document.querySelectorAll('.dock'); for(var i=0;i<els.length;i++) attach(els[i]); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
