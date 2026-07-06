/* fade-in-up.js — motion-anything recipe · category: entrance
 *
 * Rises + fades [data-fade] elements in on load. Optional per-element stagger via
 * data-fade-delay="80" (ms), or auto-staggered by document order when omitted.
 * Honors prefers-reduced-motion (shows everything immediately).
 *
 * Usage:  <h1 data-fade>…</h1>  <p data-fade data-fade-delay="80">…</p>
 */
(function () {
  'use strict';
  function init() {
    var els = document.querySelectorAll('[data-fade]');
    if (!els.length) return;

    var reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    els.forEach(function (el, i) {
      var d = el.getAttribute('data-fade-delay');
      el.style.setProperty('--fade-delay', (d != null ? parseInt(d, 10) : i * 70) + 'ms');
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        els.forEach(function (el) { el.classList.add('is-in'); });
      });
    });
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
