---
name: rotating-text
description: |
  One word swaps for the next in place — a compact way to cycle a few phrases in a headline. One rotator per view; short words. Under prefers-reduced-motion it swaps text with no travel.
triggers: ["rotating words","cycling text","轮换文字","词语轮播"]
od: { mode: prototype, surface: web, platform: desktop, category: animation-motion, preview: { type: html }, design_system: { requires: false } }
---
# rotating-text
A word that cycles in place. Dependency-free, reduced-motion safe.
## How to apply
Copy css+js; `<span class="rot" data-words="a|b|c">a</span>`.
