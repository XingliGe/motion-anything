---
name: dither
description: |
  A retro Bayer-dithered noise wave — pixelated, quantized, faithful GPU shader. A marketing-grade hero backdrop. One per view; scrim behind text.
  Renders a static frame under prefers-reduced-motion.
triggers: ["dither","animated background","动态背景"]
od: { mode: prototype, surface: web, platform: desktop, category: animation-motion, preview: { type: html }, design_system: { requires: false } }
---
# dither
A retro Bayer-dithered noise wave — pixelated, quantized, faithful GPU shader.
## How to apply
Copy `_fx/shaderbg.js` + `dither.js`; add `<div class="dither" style="position:absolute;inset:0"></div>` behind content.
