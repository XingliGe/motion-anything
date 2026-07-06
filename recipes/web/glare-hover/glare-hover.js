/* glare-hover.js — category: hover-press · writes --gx/--gy from the pointer; CSS paints the glare. Off on touch/reduced-motion. */
(function (g) {
  'use strict';
  function off(){ return g.matchMedia && (g.matchMedia('(prefers-reduced-motion: reduce)').matches || g.matchMedia('(hover: none)').matches); }
  function attach(el){ if(el.__glare) return; el.__glare=1; el.addEventListener('pointermove', function(e){ var r=el.getBoundingClientRect(); el.style.setProperty('--gx',(e.clientX-r.left)+'px'); el.style.setProperty('--gy',(e.clientY-r.top)+'px'); }); }
  function init(){ if(off()) return; var els=document.querySelectorAll('.glare'); for(var i=0;i<els.length;i++) attach(els[i]); }
  g.attachGlare=attach; if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
