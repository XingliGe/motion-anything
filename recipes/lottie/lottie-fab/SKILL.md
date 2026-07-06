---
name: lottie-fab
description: |
  A floating action button that morphs open — Lottie JSON. A Lottie (JSON) animation — portable motion that plays identically on web and app via
  lottie-web. Honors prefers-reduced-motion (don't autoplay). Reserve Lottie for motion that earns
  its ~160KB runtime.
triggers:
  - "lottie"
  - "fab"
  - "悬浮按钮"
od:
  mode: prototype
  surface: web
  platform: desktop
  category: animation-motion
  upstream: "https://github.com/spemer/lottie-animations-json"
  preview:
    type: html
  design_system:
    requires: false
  example_prompt: |
    Use lottie-fab: load animation.json with lottie-web on the button, loop it, and guard
    prefers-reduced-motion (autoplay:false).
---

# Lottie · FAB

A floating action button that morphs open — Lottie JSON. Lottie JSON from [spemer/lottie-animations-json](https://github.com/spemer/lottie-animations-json)
(MIT). Part of [motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`.

## When to use it
- Portable JSON motion identical on web & app; icon/control micro-animations (incl. After Effects / Jitter exports).

## When NOT to use it (restraint)
- When a pure-CSS effect would do — don't ship the Lottie runtime for a simple fade.

## How to apply
1. Include `lottie.min.js` (runtime) and `animation.json`.
2. `lottie.loadAnimation({ container, renderer:'svg', loop:true, autoplay:false, path:'animation.json' })`; start on intent / guard reduced-motion.

## Accessibility & performance
- `prefers-reduced-motion`: don't autoplay. SVG renderer; motion-as-JSON (portable, AI-readable).
