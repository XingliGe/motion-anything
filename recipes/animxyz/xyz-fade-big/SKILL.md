---
name: xyz-fade-big
description: |
  Fade Big — a composable AnimXYZ entrance via the xyz="fade big-50%" attribute. Declarative: mix
  fade + move + scale + rotate without writing keyframes. MIT. Honors prefers-reduced-motion.
triggers:
  - "fade big"
  - "animxyz"
  - "淡入放大"
od:
  mode: prototype
  surface: web
  platform: desktop
  category: animation-motion
  upstream: "https://animxyz.com"
  preview:
    type: html
  design_system:
    requires: false
  example_prompt: |
    Use AnimXYZ xyz="fade big-50%" on the element as a entrance; toggle xyz-in to play, with a
    prefers-reduced-motion fallback.
---

# XYZ · Fade Big

Fade Big — composable entrance from [AnimXYZ](https://animxyz.com) (MIT). Part of
[motion-anything](https://github.com/nexu-io/motion-anything).

## When to use it
- Declarative entrance mixing fade/move/scale/rotate via xyz="..." — no keyframes to write.

## When NOT to use it (restraint)
- Shipping ~100KB core CSS for a single effect; overusing on many elements.

## How to apply
1. Include @animxyz/core CSS. 2. Set xyz="fade big-50%" on the element. 3. Toggle class xyz-in / xyz-out.

## Accessibility & license
- prefers-reduced-motion: no autoplay. MIT.
