/* gooey-nav.js — hover-press · move the pill under the clicked item. */
(function(g){ 'use strict';
  function attach(el){ if(el.__gn) return; el.__gn=1; var pill=el.querySelector('.gn-pill'), btns=[].slice.call(el.querySelectorAll('button'));
    function move(b){ btns.forEach(function(x){ x.classList.toggle('on', x===b); }); pill.style.width=b.offsetWidth+'px'; pill.style.transform='translateX('+(b.offsetLeft-5)+'px)'; }
    btns.forEach(function(b){ b.addEventListener('click', function(){ move(b); }); }); var init=el.querySelector('button.on')||btns[0]; if(init) move(init); }
  function init(){ var els=document.querySelectorAll('.gnav'); for(var i=0;i<els.length;i++) attach(els[i]); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
