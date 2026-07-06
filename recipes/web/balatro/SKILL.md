---
name: balatro
description: |
  A distinctive GPU shader background rendered in dependency-free WebGL — a marketing-grade hero
  backdrop. One per view; scrim behind text. Renders a static frame under prefers-reduced-motion.
triggers: ["balatro","shader background","webgl background","着色器背景","动态背景"]
od: { mode: prototype, surface: web, platform: desktop, category: animation-motion, preview: { type: html }, design_system: { requires: false } }
---
# balatro
A GPU fragment-shader background (dependency-free WebGL).
## How to apply
Copy `_fx/shaderbg.js` + `balatro.js`; add `<div class="balatro" style="position:absolute;inset:0"></div>` behind content.
