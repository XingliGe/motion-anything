/* true-focus.js — text-kinetic · cycles focus across words. Reduced-motion → all sharp, no cycling. */
(function(g){ 'use strict';
  function red(){ return g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function attach(el){ if(el.__tf) return; el.__tf=1; var words=(el.textContent).trim().split(/\s+/); el.textContent='';
    var spans=words.map(function(w){ var s=document.createElement('span'); s.className='tf-w'; s.textContent=w; el.appendChild(s); return s; });
    if(red()){ spans.forEach(function(s){ s.classList.add('on'); }); return; }
    var i=0; spans[0].classList.add('on'); setInterval(function(){ spans[i].classList.remove('on'); i=(i+1)%spans.length; spans[i].classList.add('on'); }, 1100); }
  function init(){ var els=document.querySelectorAll('.tf'); for(var i=0;i<els.length;i++) attach(els[i]); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
