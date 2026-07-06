---
name: star-border
description: |
  A soft light rotates around a pill/button border — a gentle animated outline for a single CTA. One
  per view; keep it slow and low-contrast. Pure CSS; static border under prefers-reduced-motion.
triggers: ["star border","animated outline button","gradient border","星光边框","渐变描边按钮"]
od: { mode: prototype, surface: web, platform: desktop, category: animation-motion, upstream: "https://reactbits.dev/animations/star-border", preview: { type: html }, design_system: { requires: false } }
---
# star-border
A light that circles a button's border. Dependency-free, reduced-motion safe.
## How to apply
Copy `star-border.css`; `<button class="star">Get started</button>`. Tune `--star-color`, `--star-w`, duration.
