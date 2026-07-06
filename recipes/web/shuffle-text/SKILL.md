---
name: shuffle-text
description: |
  Letters shuffle through random neighbors then settle into the word — a quick playful reveal for a
  short label. Final text is the real content; instant under prefers-reduced-motion.
triggers: ["shuffle text","letters shuffle","洗牌文字","乱序归位"]
od: { mode: prototype, surface: web, platform: desktop, category: animation-motion, upstream: "https://reactbits.dev/text-animations/shuffle", preview: { type: html }, design_system: { requires: false } }
---
# shuffle-text
A label whose letters shuffle into place. Dependency-free, reduced-motion safe.
## How to apply
Copy `shuffle-text.js`; `<span class="shuffle" data-text="LAUNCH">LAUNCH</span>`. Re-runs on hover.
