---
name: tilt-3d
description: |
  Add tactile depth to a hero card or cover image: it tilts in 3D toward the pointer with a soft
  glare. Keep the max angle small (~10°) and reserve it for one or a few hero cards, not a grid.
  Flat under prefers-reduced-motion and on touch.
triggers:
  - "3d tilt"
  - "tilt on hover"
  - "parallax card"
  - "tactile card"
  - "3D 倾斜"
  - "立体 hover"
od:
  mode: prototype
  surface: web
  platform: desktop
  category: animation-motion
  upstream: "https://micku7zu.github.io/vanilla-tilt.js/"
  preview:
    type: html
  design_system:
    requires: false
  example_prompt: |
    Use tilt-3d on the hero product card: a small 3D tilt toward the cursor with a soft glare. Just
    the hero card; flat under reduced-motion and on touch.
---

# tilt-3d

A card that tilts in 3D toward the pointer. Part of
[motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`. Technique
popularized by vanilla-tilt.js, reimplemented dependency-free.

## When to use it
- A hero product card, cover image, or a few portfolio thumbnails where depth adds delight.

## When NOT to use it (restraint)
- Dense grids — many tilting cards feel chaotic and can induce motion sickness. **A few hero cards.**
- Text-heavy cards (tilt hurts readability); touch-only contexts (it stays flat automatically).

## How to apply
1. Copy `tilt-3d.css` and `tilt-3d.js` into the project, and link them.
2. Mark the card:
   ```html
   <div class="tilt" data-tilt-max="10"> … </div>
   ```
3. Auto-attaches to `.tilt`. Keep `data-tilt-max` small (8–10). Resets flat on `pointerleave`.

## Accessibility & performance
- Flat under `prefers-reduced-motion` and on `(hover: none)` touch devices.
- `transform: rotateX/rotateY` + a masked glare only — GPU-safe.

## Framework notes
- React: call `attachTilt(ref.current)` in `useEffect`, guarded by the same checks.
