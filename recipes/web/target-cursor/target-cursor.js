/* target-cursor.js — ambient · a ring follows the pointer and grows over .tc-target elements. transform only. */
(function(g){ 'use strict';
  function off(){ return g.matchMedia && (g.matchMedia('(prefers-reduced-motion: reduce)').matches || g.matchMedia('(hover: none)').matches); }
  function init(){ if(off()) return; var r=document.createElement('div');
    r.style.cssText='position:fixed;left:0;top:0;width:26px;height:26px;border:2px solid #8b7cf6;border-radius:50%;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:width .18s,height .18s,border-color .18s';
    document.body.appendChild(r);
    addEventListener('pointermove', function(e){ r.style.left=e.clientX+'px'; r.style.top=e.clientY+'px'; var t=e.target.closest && e.target.closest('.tc-target,a,button');
      if(t){ r.style.width='44px'; r.style.height='44px'; r.style.borderColor='#39d98a'; } else { r.style.width='26px'; r.style.height='26px'; r.style.borderColor='#8b7cf6'; } }); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
