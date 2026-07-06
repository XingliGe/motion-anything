/* bounce-cards.js — entrance · trigger the fan-out on view; stagger via --bc-d. Reduced-motion → shown. */
(function(g){ 'use strict';
  function red(){ return g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function init(){ var els=document.querySelectorAll('.bcards'); els.forEach(function(el){ [].slice.call(el.querySelectorAll('.bc')).forEach(function(c,i){ c.style.setProperty('--bc-d',(i*90)+'ms'); });
    if(red()){ el.classList.add('in'); return; } if(!('IntersectionObserver' in g)){ el.classList.add('in'); return; }
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {threshold:.3}); io.observe(el); }); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
