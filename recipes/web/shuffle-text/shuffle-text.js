/* shuffle-text.js — text-kinetic · letters cycle through A-Z then settle into the word. Reduced-motion → final. */
(function(g){ 'use strict';
  var AZ='ABCDEFGHIJKLMNOPQRSTUVWXYZ'; function red(){ return g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function run(el){ var target=el.getAttribute('data-text')||el.textContent; if(red()){ el.textContent=target; return; }
    var f=0; clearInterval(el.__s); el.__s=setInterval(function(){ var out='';
      for(var i=0;i<target.length;i++){ if(f > i*3+6){ out+=target[i]; } else if(target[i]===' '){ out+=' '; } else { out+=AZ[Math.floor(Math.random()*26)]; } }
      el.textContent=out; f++; if(f > target.length*3+6){ clearInterval(el.__s); el.textContent=target; } }, 28); }
  function attach(el){ if(el.__sh) return; el.__sh=1; el.setAttribute('data-text', el.getAttribute('data-text')||el.textContent); run(el); el.addEventListener('mouseenter', function(){ run(el); }); }
  function init(){ var els=document.querySelectorAll('.shuffle'); for(var i=0;i<els.length;i++) attach(els[i]); }
  g.shuffleEl=run; if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
