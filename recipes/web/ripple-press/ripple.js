/* ripple.js — motion-anything recipe · category: feedback-delight
 *
 * Spawns a ripple at the exact press point of any .ripple element, then removes it.
 * - Transform/opacity only. No ripple under prefers-reduced-motion (native :active remains).
 *
 * Usage:  <button class="ripple">Save</button>
 */
(function (global) {
  'use strict';

  function reduced() { return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  function spawn(el, e) {
    var r = el.getBoundingClientRect();
    var size = Math.max(r.width, r.height) * 2;
    var x = (e.clientX != null ? e.clientX : r.left + r.width / 2) - r.left;
    var y = (e.clientY != null ? e.clientY : r.top + r.height / 2) - r.top;
    var wave = document.createElement('span');
    wave.className = 'ripple-wave';
    wave.style.width = wave.style.height = size + 'px';
    wave.style.left = (x - size / 2) + 'px';
    wave.style.top = (y - size / 2) + 'px';
    el.appendChild(wave);
    wave.addEventListener('animationend', function () { wave.remove(); });
  }

  function attach(el) {
    if (el.__rippleBound) return;
    el.__rippleBound = true;
    el.addEventListener('pointerdown', function (e) { if (!reduced()) spawn(el, e); });
  }

  function init() {
    var els = document.querySelectorAll('.ripple');
    for (var i = 0; i < els.length; i++) attach(els[i]);
  }

  global.attachRipple = attach;
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})(window);
