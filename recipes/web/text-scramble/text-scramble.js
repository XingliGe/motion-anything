/* text-scramble.js — motion-anything recipe · category: text-kinetic
 *
 * Resolves a line of text from random glyphs — a techy decode reveal. One short line.
 * - Under prefers-reduced-motion the final text appears instantly (no scramble).
 * - The resolved text is the real content; keep it short and readable.
 *
 * Usage:
 *   <span class="scramble" data-text="motion, anything"></span>
 *   // or programmatically: scrambleTo(el, "next phrase")
 */
(function (global) {
  'use strict';

  var CHARS = '!<>-_\\/[]{}—=+*^?#________';
  function reduced() { return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  function scrambleTo(el, newText) {
    newText = newText != null ? newText : (el.getAttribute('data-text') || el.textContent || '');
    if (reduced()) { el.textContent = newText; return Promise.resolve(); }
    var oldText = el.textContent || '';
    var len = Math.max(oldText.length, newText.length);
    var queue = [];
    for (var i = 0; i < len; i++) {
      var from = oldText[i] || '';
      var to = newText[i] || '';
      var start = Math.floor(Math.random() * 20);
      var end = start + Math.floor(Math.random() * 20) + 8;
      queue.push({ from: from, to: to, start: start, end: end, char: '' });
    }
    if (el.__scrambleRaf) cancelAnimationFrame(el.__scrambleRaf);
    return new Promise(function (resolve) {
      var frame = 0;
      function update() {
        var out = '', done = 0;
        for (var i = 0; i < queue.length; i++) {
          var q = queue[i];
          if (frame >= q.end) { done++; out += q.to; }
          else if (frame >= q.start) {
            if (!q.char || Math.random() < 0.28) q.char = CHARS[Math.floor(Math.random() * CHARS.length)];
            out += '<span style="opacity:.55">' + q.char + '</span>';
          } else { out += q.from; }
        }
        el.innerHTML = out;
        if (done === queue.length) { el.textContent = newText; resolve(); return; }
        frame++;
        el.__scrambleRaf = requestAnimationFrame(update);
      }
      update();
    });
  }

  function init() {
    var els = document.querySelectorAll('.scramble');
    for (var i = 0; i < els.length; i++) {
      var el = els[i], txt = el.getAttribute('data-text') || el.textContent || '';
      // start blank so it decodes in; but on a hidden tab (rAF paused) keep the real text visible
      el.textContent = document.hidden ? txt : '';
      scrambleTo(el, txt);
    }
  }

  global.scrambleTo = scrambleTo;
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})(window);
