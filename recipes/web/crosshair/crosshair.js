/* crosshair.js — ambient · full-viewport crosshair tracks the pointer. transform only. Off on touch / reduced-motion. */
(function(g){ 'use strict';
  function off(){ return g.matchMedia && (g.matchMedia('(prefers-reduced-motion: reduce)').matches || g.matchMedia('(hover: none)').matches); }
  function line(v){ var d=document.createElement('div'); d.style.cssText='position:fixed;pointer-events:none;z-index:9998;background:'+ (g.__chColor||'rgba(139,124,246,.6)') + (v?';top:0;bottom:0;width:1px':';left:0;right:0;height:1px'); document.body.appendChild(d); return d; }
  function init(){ if(off()) return; var vx=line(true), hz=line(false);
    addEventListener('pointermove', function(e){ vx.style.left=e.clientX+'px'; hz.style.top=e.clientY+'px'; }); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
