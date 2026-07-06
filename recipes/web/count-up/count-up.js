/* count-up.js — motion-anything recipe · category: emphasis
 *
 * Animates [data-count] elements up to their target when they enter the viewport, once.
 * - data-count="10000"  (target)   data-count-suffix="+"   data-count-prefix="$"
 * - Honors prefers-reduced-motion (sets the final value immediately).
 * - Uses an ease-out curve; updates textContent (no layout thrash with tabular figures).
 *
 * Usage:  <span data-count="10000" data-count-suffix="+">0</span>
 */
(function () {
  'use strict';

  function format(n, prefix, suffix) {
    return (prefix || '') + Math.round(n).toLocaleString() + (suffix || '');
  }

  function run(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var prefix = el.getAttribute('data-count-prefix') || '';
    var suffix = el.getAttribute('data-count-suffix') || '';
    var dur = parseInt(el.getAttribute('data-count-duration'), 10) || 900;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = format(target * eased, prefix, suffix);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function init() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;

    var reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (el) {
        el.textContent = format(parseFloat(el.getAttribute('data-count')) || 0,
          el.getAttribute('data-count-prefix') || '', el.getAttribute('data-count-suffix') || '');
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
