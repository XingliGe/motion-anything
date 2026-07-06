/* scroll-float.js — text-kinetic · split words, reveal on view once. Reduced-motion → visible. */
(function(g){ 'use strict';
  function red(){ return g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function split(el){ var parts=el.textContent.split(/(\s+)/); el.textContent=''; var i=0;
    parts.forEach(function(p){ if(p==='')return; if(/^\s+$/.test(p)){ var s=document.createElement('span'); s.className='sf-sp'; el.appendChild(s); return; }
      var w=document.createElement('span'); w.className='sf-w'; w.textContent=p; w.style.setProperty('--sf-d',(i*70)+'ms'); i++; el.appendChild(w); }); }
  function init(){ var els=document.querySelectorAll('[data-scroll-float]'); if(!els.length) return; els.forEach(split);
    if(red()||!('IntersectionObserver' in g)){ els.forEach(function(e){e.classList.add('in');}); return; }
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {threshold:.2});
    els.forEach(function(e){ io.observe(e); }); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
