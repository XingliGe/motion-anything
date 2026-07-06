---
name: gradient-text
description: |
  Give one short headline quiet premium emphasis: a slow on-brand gradient drifts through the type.
  One phrase per view; never body copy (readability). Pure CSS; falls back to a solid brand color
  under prefers-reduced-motion.
triggers:
  - "gradient text"
  - "animated headline"
  - "shimmering title"
  - "premium heading color"
  - "渐变文字"
  - "流光标题"
od:
  mode: prototype
  surface: web
  platform: desktop
  category: animation-motion
  upstream: "https://magicui.design/docs/components/animated-gradient-text"
  preview:
    type: html
  design_system:
    requires: false
  example_prompt: |
    Use gradient-text on the hero word only: a slow on-brand gradient drifts through it. Keep the
    rest of the type solid; solid color under reduced-motion.
---

# gradient-text

A gradient that drifts through a headline. Part of
[motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`. Technique
popularized by Magic UI, reimplemented dependency-free (pure CSS).

## When to use it
- One hero word / short headline / brand name / key metric you want to feel premium.

## When NOT to use it (restraint)
- Body copy or long text — it hurts readability and contrast. **One short phrase per view.**
- When guaranteed color contrast is required for accessibility.

## How to apply
1. Copy `gradient-text.css` into the project and link it.
2. Wrap the phrase:
   ```html
   <h1><span class="gradient-text">motion, anything</span></h1>
   ```
3. Set brand colors via `--g1/--g2/--g3`; tune the duration (default 6s).

## Accessibility & performance
- Under `prefers-reduced-motion` the drift stops and the text renders in a solid `--g1` color.
- Animates `background-position` of a text-clipped gradient — GPU-safe.

## Framework notes
- Pure CSS; works in any framework. Keep the base `--g1` readable as the reduced-motion fallback.
