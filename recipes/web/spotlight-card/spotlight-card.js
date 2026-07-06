/* spotlight-card.js — motion-anything recipe · category: hover-press
 *
 * Tracks the pointer over a .spotlight card and writes its position into CSS vars
 * (--mx/--my), which the CSS uses to paint a radial spotlight. Paint only; no layout.
 * - Static (plain border) under prefers-reduced-motion and on touch.
 *
 * Usage:  <div class="spotlight"> … </div>
 */
(function (global) {
  'use strict';

  function reduced() { return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function isTouch() { return global.matchMedia && global.matchMedia('(hover: none)').matches; }

  function attach(card) {
    if (card.__spotBound) return;
    card.__spotBound = true;
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }

  function init() {
    if (reduced() || isTouch()) return;      // leave cards static
    var els = document.querySelectorAll('.spotlight');
    for (var i = 0; i < els.length; i++) attach(els[i]);
  }

  global.attachSpotlight = attach;
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})(window);
