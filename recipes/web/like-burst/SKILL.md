---
name: like-burst
description: |
  Add a celebratory particle burst to a like / favorite / reaction button. A delight
  micro-interaction that fires on user tap only (never on load), bursts on the "like"
  transition (not un-like), and ships a prefers-reduced-motion fallback. Use when a small,
  earned moment of positive feedback will feel good — and only one such moment per screen.
triggers:
  - "like animation"
  - "reaction effect"
  - "celebration burst"
  - "delightful like"
  - "点赞特效"
  - "惊喜感"
od:
  mode: prototype
  surface: web
  platform: desktop
  category: animation-motion
  upstream: null
  preview:
    type: html
  design_system:
    requires: false
  example_prompt: |
    Use the like-burst recipe on the heart button in this page: pop the icon on toggle and
    emit a short particle burst on like only, with a prefers-reduced-motion fallback. Keep it
    to one celebratory moment on screen.
---

# like-burst

A celebratory particle burst for like / favorite / reaction buttons. Part of
[motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`.

## When to use it
- Like / favorite / upvote / reaction buttons.
- A small, *earned* moment of positive feedback.

## When NOT to use it (restraint)
- Destructive or neutral actions (delete, dismiss, close).
- When more than one burst could fire at once — **one celebratory moment per screen**.
- On load / autoplay. This must be **user-triggered**.

## How to apply
1. Copy `like-burst.css` and `like-burst.js` into the project.
2. Link them, and mark the button:
   ```html
   <link rel="stylesheet" href="like-burst.css" />
   <button class="like-btn" data-like-burst aria-pressed="false" aria-label="Like">♥</button>
   <script src="like-burst.js"></script>
   ```
3. It auto-attaches to any `[data-like-burst]`, or call `attachLikeBurst(el)` manually.

## Tuning
- `PARTICLE_COUNT` / `COLORS` in `like-burst.js` (keep particle count modest — taste over spectacle).
- Pop feel: the `lb-pop` keyframe (currently `420ms`, ease-out). Burst spread: `dist` in `spawnParticles`.

## Accessibility & performance
- Honors `prefers-reduced-motion`: particles are suppressed, a quiet color/scale cue remains.
- Animates `transform`/`opacity` only; removes injected particle nodes after ~700ms.

## Framework notes
- React: call `attachLikeBurst(ref.current)` in `useEffect`; or port the click handler into your
  component and keep the CSS as-is.
