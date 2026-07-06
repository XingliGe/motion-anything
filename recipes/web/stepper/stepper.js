/* stepper.js — feedback-delight · setStep(el, n) fills up to step n. */
(function(g){ 'use strict';
  function set(el, n){ var sts=el.querySelectorAll('.st'), bars=el.querySelectorAll('.bar');
    sts.forEach(function(s,i){ s.classList.toggle('done', i<n); }); bars.forEach(function(b,i){ b.classList.toggle('fill', i<n-1); }); el.__n=n; }
  function attach(el){ if(el.__st) return; el.__st=1; set(el, +el.getAttribute('data-step')||1);
    el.addEventListener('click', function(){ var total=el.querySelectorAll('.st').length; set(el, (el.__n%total)+1); }); }
  function init(){ var els=document.querySelectorAll('.stepper'); for(var i=0;i<els.length;i++) attach(els[i]); }
  g.setStep=set; if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
