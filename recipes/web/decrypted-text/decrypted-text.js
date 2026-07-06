/* decrypted-text.js — text-kinetic · resolve scrambled glyphs into the real text on hover/view. Reduced-motion → final text. */
(function(g){ 'use strict';
  var CH='!<>-_\\/[]{}=+*^?#'; function red(){ return g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function run(el){ var target=el.getAttribute('data-text')||el.textContent; if(red()){ el.textContent=target; return; }
    var frame=0, id; clearInterval(el.__d); el.__d=setInterval(function(){ var out='';
      for(var i=0;i<target.length;i++){ if(i < frame/2){ out+=target[i]; } else if(target[i]===' '){ out+=' '; } else { out+=CH[Math.floor(Math.random()*CH.length)]; } }
      el.textContent=out; frame++; if(frame/2>=target.length){ clearInterval(el.__d); el.textContent=target; } }, 30); }
  function attach(el){ if(el.__dec) return; el.__dec=1; el.setAttribute('data-text', el.getAttribute('data-text')||el.textContent); el.addEventListener('mouseenter', function(){ run(el); }); run(el); }
  function init(){ var els=document.querySelectorAll('.decrypt'); for(var i=0;i<els.length;i++) attach(els[i]); }
  g.decryptEl=run; if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
