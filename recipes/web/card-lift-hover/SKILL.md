---
name: card-lift-hover
description: |
  Lift a clickable card toward the viewer on hover with a deepening shadow — a tactile, responsive
  cue. Pure CSS, no JS. Only use on actually-clickable cards (motion implies clickability). Honors
  prefers-reduced-motion (static). Avoid on very dense grids where many lifts feel noisy.
triggers:
  - "hover lift"
  - "card hover effect"
  - "elevate on hover"
  - "悬停抬升"
  - "卡片悬浮"
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
    Use card-lift-hover on the clickable cards in this grid: a small lift + deeper shadow on hover,
    pure CSS, static under prefers-reduced-motion.
---

# card-lift-hover

A clickable card that lifts on hover. Pure CSS. Part of
[motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`.

## When to use it
- Clickable cards / tiles in a grid that should feel tactile.

## When NOT to use it (restraint)
- Non-interactive cards — the lift implies it is clickable.
- Very dense grids where many simultaneous lifts feel noisy.

## How to apply
1. Copy `card-lift-hover.css` and link it.
2. Add the class: `<a class="lift-card" href="…">…</a>`. No JavaScript needed.

## Accessibility & performance
- `prefers-reduced-motion`: no lift (a subtle shadow change remains). Transform + shadow only.
