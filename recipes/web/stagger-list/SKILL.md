---
name: stagger-list
description: |
  Rise + fade list items in one after another on load, staggered by order. Use for short,
  above-the-fold lists, menus, or nav. Honors prefers-reduced-motion. For long or off-screen lists
  use scroll-reveal instead; never gate must-scan content on the animation.
triggers:
  - "stagger list"
  - "items appear one by one"
  - "sequence in"
  - "列表逐项入场"
  - "依次出现"
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
    Use stagger-list on the feature list: rise + fade each item in on load, ~70ms apart, finishing
    quickly, with a prefers-reduced-motion fallback. Short list only.
---

# stagger-list

List items rise + fade in, one after another. Part of
[motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`.

## When to use it
- Short above-the-fold lists, menus, nav items, or a dropdown opening.

## When NOT to use it (restraint)
- Long / off-screen lists — use `scroll-reveal`. Keep the whole sequence under ~600ms.

## How to apply
1. Copy `stagger-list.css` and `stagger-list.js` and link them.
2. Wrap items: `<ul data-stagger>…</ul>` (optional `data-stagger-step="70"`).

## Accessibility & performance
- `prefers-reduced-motion`: shown immediately. Transform/opacity only.
