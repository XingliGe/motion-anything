/* stagger-list.js — motion-anything recipe · category: entrance · target: list
 *
 * Staggers the direct children of every [data-stagger] container in on load.
 * Optional step in ms via data-stagger-step="70". Honors prefers-reduced-motion.
 *
 * Usage:  <ul data-stagger> <li>…</li> <li>…</li> </ul>
 */
(function () {
  'use strict';
  function init() {
    var lists = document.querySelectorAll('[data-stagger]');
    if (!lists.length) return;
    var reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    lists.forEach(function (list) {
      var step = parseInt(list.getAttribute('data-stagger-step') || '70', 10);
      [].slice.call(list.children).forEach(function (child, i) {
        child.style.setProperty('--st-delay', (i * step) + 'ms');
      });
    });

    if (reduce) {
      lists.forEach(function (l) { l.classList.add('is-in'); });
      return;
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        lists.forEach(function (l) { l.classList.add('is-in'); });
      });
    });
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
