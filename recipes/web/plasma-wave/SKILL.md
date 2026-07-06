---
name: plasma-wave
description: |
  A distinctive GPU shader background rendered in dependency-free WebGL — a marketing-grade hero
  backdrop. One per view; scrim behind text. Renders a static frame under prefers-reduced-motion.
triggers: ["plasma-wave","shader background","webgl background","着色器背景","动态背景"]
od: { mode: prototype, surface: web, platform: desktop, category: animation-motion, preview: { type: html }, design_system: { requires: false } }
---
# plasma-wave
A GPU fragment-shader background (dependency-free WebGL).
## How to apply
Copy `_fx/shaderbg.js` + `plasma-wave.js`; add `<div class="plasma-wave" style="position:absolute;inset:0"></div>` behind content.
