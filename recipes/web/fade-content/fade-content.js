/* fade-content.js — scroll-reveal · IntersectionObserver adds .in once. Reduced-motion → visible instantly. */
(function(g){ 'use strict';
  function red(){ return g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function init(){ var els=document.querySelectorAll('.fade-content'); if(red()||!('IntersectionObserver' in g)){ for(var i=0;i<els.length;i++) els[i].classList.add('in'); return; }
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {threshold:.15});
    for(var j=0;j<els.length;j++) io.observe(els[j]); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
