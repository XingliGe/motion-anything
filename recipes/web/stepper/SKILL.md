---
name: stepper
description: |
  An animated step indicator fills as you advance — clear progress for a multi-step flow (checkout, onboarding). One per flow. Under prefers-reduced-motion fills without easing.
triggers: ["stepper","progress steps","步骤条","分步指示"]
od: { mode: prototype, surface: web, platform: desktop, category: animation-motion, preview: { type: html }, design_system: { requires: false } }
---
# stepper
Stepper Dependency-free, reduced-motion safe.
## How to apply
Copy css+js; `<div class="stepper" data-step="2"><div class="st">1</div><div class="bar"></div><div class="st">2</div>…</div>`. Click to advance (demo).
