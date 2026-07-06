---
name: count-up
description: |
  Animate a number counting up to its target as it scrolls into view, once. Use for stat/metric
  blocks to draw the eye to an impressive figure. Honors prefers-reduced-motion (final value shown
  instantly). Avoid for precise values the user must read while animating, or many counters at once.
triggers:
  - "count up"
  - "animated number"
  - "stat counter"
  - "数字滚动"
  - "数据强调"
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
    Use count-up on the stats row: animate each number up to its target when the section enters
    the viewport, with thousands separators and a prefers-reduced-motion fallback.
---

# count-up

A number that animates up to its target on enter. Part of
[motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`.

## When to use it
- Stat / metric blocks; drawing the eye to one impressive figure.

## When NOT to use it (restraint)
- Precise values the reader must read exactly mid-animation.
- Many counters firing at once — pick the one that matters.

## How to apply
1. Copy `count-up.css` and `count-up.js` and link them.
2. Mark numbers: `<span data-count="10000" data-count-suffix="+">0</span>`
   (optional `data-count-prefix="$"`, `data-count-duration="900"`).

## Accessibility & performance
- `prefers-reduced-motion`: final value shown immediately. Tabular figures keep width steady.
