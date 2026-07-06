---
name: fade-content
description: |
  Content fades and rises gently as it enters the viewport — the calm default reveal. Reveal a few key blocks, not everything; keep travel small. Instant under prefers-reduced-motion.
triggers: ["fade in on view","reveal on scroll","进入视口淡入","滚动淡入"]
od: { mode: prototype, surface: web, platform: desktop, category: animation-motion, preview: { type: html }, design_system: { requires: false } }
---
# fade-content
Fade + rise on view. Dependency-free, reduced-motion safe.
## How to apply
Copy the css+js; add class `fade-content` (optional `--fc-delay` for stagger). Auto-reveals once on view.
