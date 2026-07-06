---
name: pixel-transition
description: |
  A card reveals a second face through a burst of pixel tiles on hover — a retro reveal. A few cards, not a grid. Under prefers-reduced-motion the back face just appears.
triggers: ["pixel transition","pixelate reveal","像素转场","方块揭示"]
od: { mode: prototype, surface: web, platform: desktop, category: animation-motion, preview: { type: html }, design_system: { requires: false } }
---
# pixel-transition
Pixel Transition Dependency-free, reduced-motion safe.
## How to apply
Copy css+js; `<div class="pixt"><div class="front">…</div><div class="pixt-back"></div></div>` (data-grid sets density).
