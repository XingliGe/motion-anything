/* like-burst.js — motion-anything recipe · category: feedback-delight
 *
 * A celebratory particle burst for like / favorite / reaction buttons.
 * - Fires on user tap only (never auto-plays).
 * - Bursts on the "like" transition only, not on un-like.
 * - Respects prefers-reduced-motion (scale-only fallback).
 * - Cleans up its DOM nodes after the animation (per MOTION-SPEC §5).
 *
 * Usage:
 *   <button class="like-btn" data-like-burst aria-pressed="false">♥</button>
 *   // auto-attaches to [data-like-burst], or:  attachLikeBurst(el)
 */
(function (global) {
  'use strict';

  var PARTICLE_COUNT = 14;
  var COLORS = ['#ff4d6d', '#ffd166', '#06d6a0', '#4d96ff', '#c77dff'];

  function prefersReducedMotion() {
    return (
      global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function spawnParticles(btn) {
    var rect = btn.getBoundingClientRect();
    var cx = rect.left + rect.width / 2 + global.scrollX;
    var cy = rect.top + rect.height / 2 + global.scrollY;

    var layer = document.createElement('div');
    layer.className = 'lb-particles';
    layer.style.left = cx + 'px';
    layer.style.top = cy + 'px';
    document.body.appendChild(layer);

    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var p = document.createElement('span');
      p.className = 'lb-particle';
      var angle = (Math.PI * 2 * i) / PARTICLE_COUNT + Math.random() * 0.4;
      var dist = 26 + Math.random() * 26;
      p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      p.style.background = COLORS[i % COLORS.length];
      p.style.animationDelay = Math.random() * 40 + 'ms';
      layer.appendChild(p);
    }
    // Clean up after the burst finishes (600ms anim + max 40ms delay + margin).
    setTimeout(function () {
      layer.remove();
    }, 700);
  }

  function attachLikeBurst(btn) {
    if (!btn || btn.__likeBurstBound) return;
    btn.__likeBurstBound = true;

    btn.addEventListener('click', function () {
      var liked = btn.classList.toggle('is-liked');
      btn.setAttribute('aria-pressed', String(liked));

      // Restart the pop animation from the top.
      btn.classList.remove('lb-pop');
      void btn.offsetWidth; // force reflow so the animation re-triggers
      btn.classList.add('lb-pop');

      if (liked && !prefersReducedMotion()) {
        spawnParticles(btn);
      }
    });
  }

  function autoAttach() {
    var els = document.querySelectorAll('[data-like-burst]');
    for (var i = 0; i < els.length; i++) attachLikeBurst(els[i]);
  }

  global.attachLikeBurst = attachLikeBurst;

  if (document.readyState !== 'loading') autoAttach();
  else document.addEventListener('DOMContentLoaded', autoAttach);
})(window);
