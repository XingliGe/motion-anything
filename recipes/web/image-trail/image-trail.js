/* image-trail.js — ambient · spawn fading thumbnails along the pointer path over a .trail area. transform/opacity only. */
(function(g){ 'use strict';
  function off(){ return g.matchMedia && (g.matchMedia('(prefers-reduced-motion: reduce)').matches || g.matchMedia('(hover: none)').matches); }
  function attach(el){ if(el.__it) return; el.__it=1; var imgs=(el.getAttribute('data-images')||'').split(',').filter(Boolean); var k=0, last=0;
    el.style.position=el.style.position||'relative'; el.style.overflow='hidden';
    if(off()) return;
    el.addEventListener('pointermove', function(e){ var now=Date.now(); if(now-last<80) return; last=now; var r=el.getBoundingClientRect();
      var n=document.createElement(imgs.length?'img':'div'); if(imgs.length){ n.src=imgs[k%imgs.length]; } else { n.style.background='linear-gradient(135deg,#8b7cf6,#39d98a)'; }
      n.style.cssText+=';position:absolute;left:'+(e.clientX-r.left)+'px;top:'+(e.clientY-r.top)+'px;width:80px;height:56px;border-radius:8px;object-fit:cover;pointer-events:none;transform:translate(-50%,-50%)';
      el.appendChild(n); k++; n.animate([{opacity:.9,transform:'translate(-50%,-50%) scale(1)'},{opacity:0,transform:'translate(-50%,-50%) scale(.8)'}],{duration:700,easing:'ease-out'}); setTimeout(function(){ n.remove(); },700); }); }
  function init(){ var els=document.querySelectorAll('.trail'); for(var i=0;i<els.length;i++) attach(els[i]); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
