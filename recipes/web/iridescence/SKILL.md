---
name: iridescence
description: |
  A living GPU shader background rendered in dependency-free WebGL — a distinctive, marketing-grade
  hero backdrop. One per view; put a scrim behind text. Renders a static frame under prefers-reduced-motion.
triggers: ["iridescence","shader background","webgl gradient","着色器背景","动态背景"]
od: { mode: prototype, surface: web, platform: desktop, category: animation-motion, preview: { type: html }, design_system: { requires: false } }
---
# iridescence
A GPU fragment-shader background (dependency-free WebGL).
## How to apply
Copy `_fx/shaderbg.js` + `iridescence.js`; add `<div class="iridescence" style="position:absolute;inset:0"></div>` behind your content.
