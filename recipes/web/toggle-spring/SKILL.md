---
name: toggle-spring
description: |
  A switch whose knob springs across on toggle — a tactile, satisfying on/off state change. Use for
  settings/form switches. Honors prefers-reduced-motion (quick linear slide). Trigger on user intent
  only; keep the spring subtle — never to convey loading/progress.
triggers:
  - "toggle switch"
  - "springy switch"
  - "satisfying toggle"
  - "开关动效"
  - "弹簧切换"
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
    Use toggle-spring for the settings switches: the knob springs across on toggle with a gentle
    overshoot, aria-pressed reflects state, and a prefers-reduced-motion fallback shortens it.
---

# toggle-spring

A switch whose knob springs across on toggle. Part of
[motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`.

## When to use it
- On/off switches in settings and forms; any binary state the user flips themselves.

## When NOT to use it (restraint)
- To convey loading/progress (use a spinner/skeleton). Keep the overshoot subtle, not gimmicky.

## How to apply
1. Copy `toggle-spring.css` and `toggle-spring.js` and link them.
2. Markup: `<button class="ms-toggle" data-toggle aria-pressed="false"><span class="knob"></span></button>`.

## Accessibility & performance
- `prefers-reduced-motion`: quick linear slide, no overshoot. `aria-pressed` reflects state. Transform only.
