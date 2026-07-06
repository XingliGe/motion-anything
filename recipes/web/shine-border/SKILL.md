---
name: shine-border
description: |
  Give one hero card or CTA quiet premium life: a soft band of light travels around its border.
  One shining element per view; keep it slow and low-contrast. Pure CSS. Fully static under
  prefers-reduced-motion. Do not put several on screen at once.
triggers:
  - "shine border"
  - "animated border"
  - "glowing outline"
  - "premium featured card"
  - "流光边框"
  - "扫光描边"
od:
  mode: prototype
  surface: web
  platform: desktop
  category: animation-motion
  upstream: "https://magicui.design/docs/components/shine-border"
  preview:
    type: html
  design_system:
    requires: false
  example_prompt: |
    Use shine-border on the "recommended" pricing tier: one slow light travels the border. Just
    that one card; static under reduced-motion.
---

# shine-border

A light that travels around an element's border. Part of
[motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`. Technique
popularized by Magic UI, reimplemented dependency-free (pure CSS).

## When to use it
- A single hero card / CTA / "recommended" tier you want to feel alive as it sits on screen.

## When NOT to use it (restraint)
- Multiple elements at once — competing lights become noise. **One per view.**
- Calm / serious content, or anything already animating strongly nearby.

## How to apply
1. Copy `shine-border.css` into the project and link it.
2. Mark the element:
   ```html
   <div class="shine"> … </div>
   ```
3. Tune with CSS vars: `--shine-color`, `--shine-width`, and the animation duration (default 4s).

## Accessibility & performance
- Under `prefers-reduced-motion` the light stops and a plain static border remains.
- Animates a masked conic-gradient (via `@property --shine-angle`) — compositor-friendly.

## Framework notes
- Works as-is in any framework; it is pure CSS. Scope `--shine-*` per component as needed.
