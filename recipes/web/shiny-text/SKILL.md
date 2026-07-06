---
name: shiny-text
description: |
  A soft highlight sweeps across muted text — a quiet premium shimmer for one short label ("new",
  "pro", a CTA word). Keep the base text readable; one or two per view. Pure CSS; solid under reduced-motion.
triggers: ["shiny text","shimmer text","premium label","流光文字","高光文字"]
od: { mode: prototype, surface: web, platform: desktop, category: animation-motion, preview: { type: html }, design_system: { requires: false } }
---
# shiny-text
A highlight that sweeps across muted text. Dependency-free, reduced-motion safe.
## How to apply
Copy `shiny-text.css`; wrap the label: `<span class="shiny">Pro</span>`. Tune `--shiny-base` / `--shiny-hi`.
