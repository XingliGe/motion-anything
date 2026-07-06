/* tilt-3d.js — motion-anything recipe · category: hover-press
 *
 * Maps the pointer position over a .tilt card to a small 3D rotation + glare position.
 * - Max angle via data-tilt-max (default 10°). Transform only. Flat under reduced-motion / touch.
 *
 * Usage:  <div class="tilt" data-tilt-max="10"> … </div>
 */
(function (global) {
  'use strict';

  function reduced() { return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function isTouch() { return global.matchMedia && global.matchMedia('(hover: none)').matches; }

  function attach(card) {
    if (card.__tiltBound) return;
    card.__tiltBound = true;
    var max = parseFloat(card.getAttribute('data-tilt-max')) || 10;

    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;      // 0..1
      var py = (e.clientY - r.top) / r.height;      // 0..1
      card.style.setProperty('--ry', ((px - 0.5) * 2 * max).toFixed(2) + 'deg');
      card.style.setProperty('--rx', ((0.5 - py) * 2 * max).toFixed(2) + 'deg');
      card.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    });
    card.addEventListener('pointerleave', function () {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  }

  function init() {
    if (reduced() || isTouch()) return;       // leave cards flat
    var els = document.querySelectorAll('.tilt');
    for (var i = 0; i < els.length; i++) attach(els[i]);
  }

  global.attachTilt = attach;
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})(window);
