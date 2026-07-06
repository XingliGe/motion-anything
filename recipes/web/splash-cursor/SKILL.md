---
name: splash-cursor
description: |
  A fluid-simulation cursor — pointer movement splats swirling, glowing dye (full multi-pass WebGL fluid sim). A marketing-grade hero backdrop. One per view; scrim behind text.
  Renders a static frame under prefers-reduced-motion.
triggers: ["splash-cursor","animated background","动态背景"]
od: { mode: prototype, surface: web, platform: desktop, category: animation-motion, preview: { type: html }, design_system: { requires: false } }
---
# splash-cursor
A fluid-simulation cursor — pointer movement splats swirling, glowing dye (full multi-pass WebGL fluid sim).
## How to apply
Copy `splash-cursor.js`; add `<div class="splash-cursor" style="position:absolute;inset:0"></div>` behind content.
