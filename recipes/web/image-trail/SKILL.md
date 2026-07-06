---
name: image-trail
description: |
  Thumbnails trail behind the cursor and fade — a gallery/portfolio hero flourish. One trail area per page; heavy on content pages. Off on touch and under prefers-reduced-motion.
triggers: ["image trail","cursor images","拖尾图片","光标残影"]
od: { mode: prototype, surface: web, platform: desktop, category: animation-motion, preview: { type: html }, design_system: { requires: false } }
---
# image-trail
Image Trail Dependency-free, reduced-motion safe.
## How to apply
Copy `image-trail.js`; `<div class="trail" data-images="a.jpg,b.jpg">…</div>` (omit data-images for colored tiles).
