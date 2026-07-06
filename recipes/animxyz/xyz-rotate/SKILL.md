---
name: xyz-rotate
description: |
  Rotate In — a composable AnimXYZ entrance via the xyz="fade rotate-right-45" attribute. Declarative: mix
  fade + move + scale + rotate without writing keyframes. MIT. Honors prefers-reduced-motion.
triggers:
  - "rotate in"
  - "animxyz"
  - "旋转入场"
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
    Use AnimXYZ xyz="fade rotate-right-45" on the element as a entrance; toggle xyz-in to play, with a
    prefers-reduced-motion fallback.
---

# XYZ · Rotate In

Rotate In — composable entrance from [AnimXYZ](https://animxyz.com) (MIT). Part of
[motion-anything](https://github.com/nexu-io/motion-anything).

## When to use it
- Declarative entrance mixing fade/move/scale/rotate via xyz="..." — no keyframes to write.

## When NOT to use it (restraint)
- Shipping ~100KB core CSS for a single effect; overusing on many elements.

## How to apply
1. Include @animxyz/core CSS. 2. Set xyz="fade rotate-right-45" on the element. 3. Toggle class xyz-in / xyz-out.

## Accessibility & license
- prefers-reduced-motion: no autoplay. MIT.
