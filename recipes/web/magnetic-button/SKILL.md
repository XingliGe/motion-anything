---
name: magnetic-button
description: |
  Make a primary button feel alive by gently pulling it toward the cursor as it approaches, then
  springing back. Keep it subtle and reserve it for one or two primary actions. Disabled on touch
  and under prefers-reduced-motion. Do not use it on dense UIs full of buttons.
triggers:
  - "magnetic button"
  - "playful hover"
  - "button that follows cursor"
  - "make this button alive"
  - "磁吸按钮"
  - "活泼"
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
    Use magnetic-button on the hero "Get started" CTA: a subtle pull toward the cursor with a
    snappy spring back. Only the primary button; disable on touch and reduced-motion.
---

# magnetic-button

A button that leans toward the cursor, then springs back. Part of
[motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`.

## When to use it
- A single primary call-to-action you want to feel alive (hero "Get started" / "Try it").

## When NOT to use it (restraint)
- Dense UIs with many buttons — it becomes chaotic. Reserve for 1–2 primary targets.
- Touch-only contexts (no cursor). The recipe disables itself there automatically.

## How to apply
1. Copy `magnetic-button.css` and `magnetic-button.js` into the project, and link them.
2. Mark the button:
   ```html
   <button class="magnetic" data-magnet-strength="0.3">Get started</button>
   ```
3. Auto-attaches to `.magnetic`. Keep `strength` small (~0.2–0.4) so the pull stays subtle.

## Accessibility & performance
- Disabled under `prefers-reduced-motion` and on `(hover: none)` touch devices.
- Transform only; resets on `pointerleave`.

## Framework notes
- React: call `attachMagnetic(ref.current)` in `useEffect`, guarded by the same reduced-motion/touch checks.
