---
name: anim-slideinleft
description: |
  Slide In Left — a drop-in CSS keyframe animation from Animate.css (Hippocratic-2.1, © Daniel Eden).
  No JS required. Honors prefers-reduced-motion. Use restrained; attribute Animate.css.
triggers:
  - "slideinleft"
  - "css animation"
  - "入场动效"
od:
  mode: prototype
  surface: web
  platform: desktop
  category: animation-motion
  upstream: "https://github.com/animate-css/animate.css"
  preview:
    type: html
  design_system:
    requires: false
  example_prompt: |
    Apply slideInLeft (Animate.css) to the element as a entrance animation, restrained, with a
    prefers-reduced-motion fallback. Attribute Animate.css.
---

# Animate · Slide In Left

Slide In Left — CSS keyframe animation from [Animate.css](https://github.com/animate-css/animate.css)
(Hippocratic License 2.1, © Daniel Eden). Part of [motion-anything](https://github.com/nexu-io/motion-anything).

## When to use it
- A quick, drop-in CSS entrance animation (no JS).

## When NOT to use it (restraint)
- Many at once / must-read content. Keep it restrained.

## How to apply
1. Copy `slideInLeft.css`. 2. Add class `slideInLeft` to the element + set `animation-duration`.

## Accessibility & license
- `prefers-reduced-motion`: disabled. Attribute Animate.css (Hippocratic-2.1).
