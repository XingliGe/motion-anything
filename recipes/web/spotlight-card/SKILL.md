---
name: spotlight-card
description: |
  Give feature/pricing cards a premium feel: a soft radial spotlight follows the cursor across the
  card and lifts its border. Keep the glow subtle and low-contrast. Falls back to a plain static
  border under prefers-reduced-motion and on touch. Do not use on text-dense reading surfaces.
triggers:
  - "spotlight card"
  - "cursor glow card"
  - "premium hover card"
  - "card that lights up on hover"
  - "光斑跟随卡片"
  - "卡片高光"
od:
  mode: prototype
  surface: web
  platform: desktop
  category: animation-motion
  upstream: "https://ui.aceternity.com/components/card-spotlight"
  preview:
    type: html
  design_system:
    requires: false
  example_prompt: |
    Use spotlight-card on the feature grid: a soft spotlight follows the cursor and the border
    lifts. Keep it subtle; static under reduced-motion and on touch.
---

# spotlight-card

A radial spotlight that follows the cursor across a card. Part of
[motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`. Technique
popularized by Aceternity UI, reimplemented dependency-free.

## When to use it
- Feature cards, pricing tiles, or a card grid where one should light up under the pointer.

## When NOT to use it (restraint)
- Text-dense reading surfaces — the glow distracts. Keep it low-contrast and subtle.
- Touch-only contexts — there is no cursor; it falls back to a static border automatically.

## How to apply
1. Copy `spotlight-card.css` and `spotlight-card.js` into the project, and link them.
2. Mark the card:
   ```html
   <div class="spotlight"> … </div>
   ```
3. Auto-attaches to `.spotlight`. JS writes `--mx/--my`; the CSS paints the glow there.

## Accessibility & performance
- Disabled under `prefers-reduced-motion` and on `(hover: none)` touch devices (static border stays).
- Paints a radial-gradient only — no layout thrash.

## Framework notes
- React: call `attachSpotlight(ref.current)` in `useEffect`, guarded by the same checks.
