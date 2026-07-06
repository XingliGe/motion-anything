/* kinetic-headline.js — motion-anything recipe · category: text-kinetic
 *
 * Splits [data-kinetic] text into words (default) or letters (data-kinetic="letters") and staggers
 * them in on load. The animation STYLE is chosen with data-kinetic-anim (mirrors the video engine's
 * kinetic presets): rise (default) · fade · drop · pop · blur · flip · spin · slide · typewriter ·
 * wave (continuous, ambient). Honors prefers-reduced-motion (shows everything at once).
 *
 * Usage:
 *   <h1 data-kinetic>Words that move</h1>
 *   <h1 data-kinetic="letters" data-kinetic-anim="pop">Short line</h1>
 *   <h1 data-kinetic="letters" data-kinetic-anim="wave">ambient wave</h1>
 */
(function () {
  'use strict';

  function split(el) {
    var mode = el.getAttribute('data-kinetic') || 'words';
    var text = el.textContent;
    el.textContent = '';
    var step = (mode === 'letters') ? 40 : 70;
    var units = (mode === 'letters') ? text.split('') : text.split(/(\s+)/);
    var i = 0;
    units.forEach(function (u) {
      if (u === '') return;
      if (/^\s+$/.test(u)) {
        var sp = document.createElement('span');
        sp.className = 'k-space';
        el.appendChild(sp);
        return;
      }
      var s = document.createElement('span');
      s.className = 'k-unit';
      s.textContent = u;
      s.style.setProperty('--k-delay', (i * step) + 'ms');
      i++;
      el.appendChild(s);
    });
  }

  function init() {
    var els = document.querySelectorAll('[data-kinetic]');
    if (!els.length) return;
    var reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    els.forEach(function (el) {
      el.classList.add('k-anim-' + (el.getAttribute('data-kinetic-anim') || 'rise'));
      split(el);
    });
    if (reduce) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        els.forEach(function (el) { el.classList.add('is-in'); });
      });
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
