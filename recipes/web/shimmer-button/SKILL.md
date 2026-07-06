---
name: shimmer-button
description: |
  Make one primary CTA feel premium: a soft band of light sweeps across it (slowly at rest, faster on
  hover). Reserve for the single primary button; keep it subtle. Pure CSS; the sweep stops (solid
  button) under prefers-reduced-motion. Do not use on secondary/destructive buttons or many at once.
triggers:
  - "shimmer button"
  - "sheen sweep cta"
  - "premium button"
  - "shiny cta"
  - "扫光按钮"
  - "高光 cta"
od:
  mode: prototype
  surface: web
  platform: desktop
  category: animation-motion
  upstream: "https://magicui.design/docs/components/shimmer-button"
  preview:
    type: html
  design_system:
    requires: false
  example_prompt: |
    Use shimmer-button on the hero "Get started" CTA: a slow sheen that quickens on hover. Just the
    one primary button; solid under reduced-motion.
---

# shimmer-button

A highlight that sweeps across a CTA. Part of
[motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`. Technique
popularized by Magic UI, reimplemented dependency-free (pure CSS).

## When to use it
- One primary call-to-action you want to feel premium ("Get started" / "Upgrade").

## When NOT to use it (restraint)
- Secondary / destructive buttons; many buttons at once (the sweep becomes noise). **One per view.**

## How to apply
1. Copy `shimmer-button.css` into the project and link it.
2. Mark the button:
   ```html
   <button class="shimmer">Get started</button>
   ```
3. Tune the sweep duration (default 2.6s at rest, 1.1s on hover) and the button colors as needed.

## Accessibility & performance
- Under `prefers-reduced-motion` the sweep stops; a plain solid button remains.
- Animates the `transform` of a masked pseudo-element only — GPU-safe.

## Framework notes
- Pure CSS; works in any framework.
