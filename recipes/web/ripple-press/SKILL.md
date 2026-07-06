---
name: ripple-press
description: |
  Acknowledge a tap/click with a ripple that blooms from the exact press point. Fast and low-opacity
  so it reads as feedback, not decoration. No ripple under prefers-reduced-motion (native :active
  covers it). Avoid on destructive actions and text links.
triggers:
  - "ripple"
  - "material ripple"
  - "tap feedback"
  - "press feedback"
  - "点按涟漪"
  - "水波反馈"
od:
  mode: prototype
  surface: web
  platform: desktop
  category: animation-motion
  upstream: "https://m3.material.io/foundations/interaction/states/state-layers"
  preview:
    type: html
  design_system:
    requires: false
  example_prompt: |
    Use ripple on the primary buttons: a fast, low-opacity ripple from the press point. Skip it on
    destructive actions; none under reduced-motion.
---

# ripple-press

A ripple that blooms from the press point. Part of
[motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`. Based on the
Material state-layer interaction, reimplemented dependency-free.

## When to use it
- Buttons / clickable tiles where a tap should feel acknowledged; touch-first, app-like UIs.

## When NOT to use it (restraint)
- Destructive actions (don't encourage repeat taps) and text links (feels heavy).
- Elements that already have a strong press state.

## How to apply
1. Copy `ripple.css` and `ripple.js` into the project, and link them.
2. Mark the button (it should be `position:relative; overflow:hidden` — the CSS sets this):
   ```html
   <button class="ripple">Save</button>
   ```
3. Auto-attaches to `.ripple`; a wave spawns at the pointer point and cleans itself up.

## Accessibility & performance
- No ripple under `prefers-reduced-motion`; the native `:active` state provides feedback.
- Transform/opacity only; each wave removes itself on `animationend`.

## Framework notes
- React: call `attachRipple(ref.current)` in `useEffect`. The tint comes from the element's
  `currentColor` — set text color to control it.
