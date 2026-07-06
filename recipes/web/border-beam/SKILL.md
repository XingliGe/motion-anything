---
name: border-beam
description: |
  Give one card or CTA a lively accent: a small bright comet of light travels around its border.
  Brighter/livelier than shine-border — use for a single "new"/"featured" element, one per view.
  Pure CSS; fully static under prefers-reduced-motion.
triggers:
  - "border beam"
  - "traveling light border"
  - "comet border"
  - "animated outline accent"
  - "边框光点"
  - "环绕流光"
od:
  mode: prototype
  surface: web
  platform: desktop
  category: animation-motion
  upstream: "https://magicui.design/docs/components/border-beam"
  preview:
    type: html
  design_system:
    requires: false
  example_prompt: |
    Use border-beam on the "New" feature card: a small bright comet travels the border. Just that one
    card; static under reduced-motion.
---

# border-beam

A bright comet that travels an element's border. Part of
[motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`. Technique
popularized by Magic UI, reimplemented dependency-free (pure CSS).

## When to use it
- A single "new" / "featured" card or a hero CTA that should feel lively for a beat.

## When NOT to use it (restraint)
- Several at once (competing beams = noise). **One per view.**
- Calm/serious contexts — or when a quieter full-border glow fits: use **shine-border** instead.

## How to apply
1. Copy `border-beam.css` into the project and link it.
2. Mark the element:
   ```html
   <div class="beam"> … </div>
   ```
3. Tune `--beam-color`, `--beam-size`, and the animation duration (default 3s).

## Accessibility & performance
- Under `prefers-reduced-motion` the beam stops; a plain static border remains.
- Animates a masked conic-gradient (via `@property --beam-angle`) — compositor-friendly.

## Framework notes
- Pure CSS; works in any framework. Scope `--beam-*` per component.
