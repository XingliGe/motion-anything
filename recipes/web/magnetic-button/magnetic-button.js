/* magnetic-button.js — motion-anything recipe · category: hover-press
 *
 * Pulls a button toward the pointer as it nears, then springs back on leave.
 * - Subtle by design (a few px). Strength via data-magnet-strength (default 0.3).
 * - Disabled under prefers-reduced-motion and on touch (no cursor to attract).
 * - Uses transform only; resets cleanly on pointerleave.
 *
 * Usage:
 *   <button class="magnetic" data-magnet-strength="0.3">Get started</button>
 */
(function (global) {
  'use strict';

  function reduced() {
    return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function isTouch() {
    return global.matchMedia && global.matchMedia('(hover: none)').matches;
  }

  function attach(btn) {
    if (btn.__magnetBound) return;
    btn.__magnetBound = true;
    var strength = parseFloat(btn.getAttribute('data-magnet-strength')) || 0.3;

    btn.addEventListener('pointermove', function (e) {
      var r = btn.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = 'translate(' + dx * strength + 'px,' + dy * strength + 'px)';
    });
    btn.addEventListener('pointerleave', function () {
      btn.style.transform = '';
    });
  }

  function init() {
    if (reduced() || isTouch()) return; // leave buttons static
    var els = document.querySelectorAll('.magnetic');
    for (var i = 0; i < els.length; i++) attach(els[i]);
  }

  global.attachMagnetic = attach;
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})(window);
