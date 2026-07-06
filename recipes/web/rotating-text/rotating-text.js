/* rotating-text.js — text-kinetic · cycles data-words in place. Reduced-motion → swaps text without travel. */
(function(g){ 'use strict';
  function red(){ return g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function attach(el){ if(el.__rot) return; el.__rot=1; var words=(el.getAttribute('data-words')||el.textContent).split('|'); var i=0;
    el.textContent=''; var w=document.createElement('span'); w.className='rot-w'; w.textContent=words[0].trim(); el.appendChild(w);
    setInterval(function(){ i=(i+1)%words.length; if(red()){ w.textContent=words[i].trim(); return; } el.classList.add('swap');
      setTimeout(function(){ w.textContent=words[i].trim(); el.classList.remove('swap'); }, 460); }, 2200); }
  function init(){ var els=document.querySelectorAll('.rot'); for(var i=0;i<els.length;i++) attach(els[i]); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
