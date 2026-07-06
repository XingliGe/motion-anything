/* toggle-spring.js — motion-anything recipe · category: feedback-delight
 *
 * Click any [data-toggle] to flip its .on state; the knob springs across (CSS handles the spring).
 * Reflects state via aria-pressed for accessibility.
 *
 * Usage:  <button class="ms-toggle" data-toggle aria-pressed="false"><span class="knob"></span></button>
 */
(function () {
  'use strict';
  function init() {
    document.querySelectorAll('[data-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var on = btn.classList.toggle('on');
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    });
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
