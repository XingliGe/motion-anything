---
name: web-to-design-md
description: |
  Extract a real website's design tokens — colors, typography, spacing, CSS, and motion — into a
  structured `design.md` an AI can consume. Use to seed motion-anything's design system from an
  existing site so generated motion stays on-brand ("扒这个网站的配色/字体", "design.md from url").
triggers:
  - "extract design tokens from this site"
  - "web to design md"
  - "扒这个网站的配色和字体"
  - "拿这个站的设计规范"
  - "生成 design.md"
od:
  mode: prototype
  surface: web
  platform: desktop
  category: design-system
  upstream: "https://github.com/Paidax01/web-to-design-md"
  design_system:
    requires: false
---

# web-to-design-md (install-on-demand companion)

> **Thin wrapper.** Upstream has **no open license**, so we cannot redistribute its code — it is
> fetched on demand. Text below is motion-anything's own description.

## What it does
Given a URL, it scrapes the site's colors / fonts / CSS / motion and emits a `design.md`. That
output feeds directly into motion-anything's **design system** (`app/design-systems/`), so
generation (HTML and video lines) uses the site's real hex/typography and on-brand pacing.

## How to invoke
1. If not installed (one-time, needs network):
   ```bash
   npx skills add https://github.com/Paidax01/web-to-design-md
   ```
2. Run it against the target URL to produce `design.md`.
3. Import the result as a motion-anything design system; then generate on-brand motion.

## Pipeline note
This is the "look/tokens" front half; motion-anything is the "motion" back half. Pair them:
`web-to-design-md` → our design system → on-brand generation.

## Note for maintainers
If Paidax01/web-to-design-md adds a permissive license, vendor it properly so it ships offline.
Upstream: https://github.com/Paidax01/web-to-design-md
