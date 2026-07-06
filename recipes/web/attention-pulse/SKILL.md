---
name: attention-pulse
description: |
  A soft expanding ring that draws the eye to ONE element — a primary CTA, an unread badge, a new
  dot. Honors prefers-reduced-motion. One per screen; never use more than one at once or as pure
  decoration (attention splits and nothing wins).
triggers:
  - "draw attention"
  - "pulse ring"
  - "notification dot"
  - "引导注意"
  - "脉冲提示"
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
    Use attention-pulse on the primary CTA only: a soft expanding ring on a gentle loop, with a
    prefers-reduced-motion fallback. Just one pulsing element on the screen.
---

# attention-pulse

A soft expanding ring to draw the eye to one element. Part of
[motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`.

## When to use it
- A single primary CTA, an unread/new badge, or a notification dot.

## When NOT to use it (restraint)
- More than one pulsing element at once. As decoration with no real call to act.

## How to apply
1. Copy `attention-pulse.css` and link it.
2. Add `data-pulse` to the element (set `--pulse-color` to match your accent).

## Accessibility & performance
- `prefers-reduced-motion`: no pulse. Transform/opacity only (GPU-safe).
