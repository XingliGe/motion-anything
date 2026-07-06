---
name: glare-hover
description: |
  A soft glare sweeps across a card following the cursor on hover — a premium, tactile sheen. Keep it
  subtle; a few hero cards, not a grid. Disabled on touch and under prefers-reduced-motion.
triggers: ["glare hover","sheen on hover","premium card hover","高光扫过","卡片光泽"]
od: { mode: prototype, surface: web, platform: desktop, category: animation-motion, upstream: "https://reactbits.dev/animations/glare-hover", preview: { type: html }, design_system: { requires: false } }
---
# glare-hover
A glare that follows the cursor across a card. Dependency-free, reduced-motion + touch safe.
## How to apply
Copy `glare-hover.css` + `glare-hover.js`; `<div class="glare"> … </div>`. Auto-attaches; JS writes `--gx/--gy`.
