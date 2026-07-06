/* circular-text.js — ambient · lay characters of data-text around the ring. */
(function(g){ 'use strict';
  function attach(el){ if(el.__c) return; el.__c=1; var t=(el.getAttribute('data-text')||el.textContent).trim(); el.textContent='';
    for(var i=0;i<t.length;i++){ var s=document.createElement('span'); s.className='circ-c'; s.textContent=t[i];
      s.style.transform='rotate('+(i*(360/t.length))+'deg)'; el.appendChild(s); } }
  function init(){ var els=document.querySelectorAll('.circ'); for(var i=0;i<els.length;i++) attach(els[i]); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
