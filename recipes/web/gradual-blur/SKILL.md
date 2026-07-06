---
name: gradual-blur
description: |
  A soft progressive blur fades content out toward an edge — a premium "more below" affordance for a
  scrolling list/section. Keep the readable content above the blur. Degrades gracefully where
  backdrop-filter is unsupported.
triggers: ["gradual blur","edge blur","scroll hint","渐进模糊","边缘虚化"]
od: { mode: prototype, surface: web, platform: desktop, category: animation-motion, upstream: "https://reactbits.dev/animations/gradual-blur", preview: { type: html }, design_system: { requires: false } }
---
# gradual-blur
A progressive blur at a container edge. Dependency-free.
## How to apply
Copy `gradual-blur.css`; add class `grad-blur` to a scroll container.
