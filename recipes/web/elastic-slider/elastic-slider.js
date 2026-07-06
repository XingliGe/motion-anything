/* elastic-slider.js — feedback-delight · drag the track; springy fill + knob. */
(function(g){ 'use strict';
  function attach(el){ if(el.__es) return; el.__es=1; var track=el.querySelector('.es-track'), fill=el.querySelector('.es-fill'), knob=el.querySelector('.es-knob');
    function set(clientX){ var r=track.getBoundingClientRect(); var p=Math.max(0,Math.min(1,(clientX-r.left)/r.width)); fill.style.width=(p*100)+'%'; knob.style.left=(p*100)+'%'; }
    var drag=false; track.addEventListener('pointerdown', function(e){ drag=true; set(e.clientX); track.setPointerCapture(e.pointerId); });
    track.addEventListener('pointermove', function(e){ if(drag) set(e.clientX); }); track.addEventListener('pointerup', function(){ drag=false; });
    knob.style.left='40%'; }
  function init(){ var els=document.querySelectorAll('.es'); for(var i=0;i<els.length;i++) attach(els[i]); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
