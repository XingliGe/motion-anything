/* blob-cursor.js — ambient · a springy blob follows the pointer. transform only. Hidden on touch / reduced-motion. */
(function(g){ 'use strict';
  function off(){ return g.matchMedia && (g.matchMedia('(prefers-reduced-motion: reduce)').matches || g.matchMedia('(hover: none)').matches); }
  function init(){ if(off()) return; var b=document.createElement('div');
    b.style.cssText='position:fixed;left:0;top:0;width:34px;height:34px;border-radius:50%;pointer-events:none;z-index:9998;background:radial-gradient(circle at 35% 35%,#a99bff,#6d54e6);filter:blur(2px);mix-blend-mode:screen;transform:translate(-50%,-50%)';
    document.body.appendChild(b); var tx=innerWidth/2, ty=innerHeight/2, x=tx, y=ty;
    addEventListener('pointermove', function(e){ tx=e.clientX; ty=e.clientY; });
    (function loop(){ x+=(tx-x)*.18; y+=(ty-y)*.18; b.style.left=x+'px'; b.style.top=y+'px'; requestAnimationFrame(loop); })(); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
