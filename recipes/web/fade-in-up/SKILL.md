---
name: fade-in-up
description: |
  Rise + fade key elements in as the page loads, optionally staggered. Use for hero content and
  a small group of important elements. Honors prefers-reduced-motion. For long lists or off-screen
  content use scroll-reveal instead; never delay must-read content by more than a moment.
triggers:
  - "fade in"
  - "entrance animation"
  - "appear smoothly"
  - "入场动效"
  - "优雅出现"
od:
  mode: prototype
  surface: web
  platform: desktop
  category: animation-motion
  upstream: null
  preview:
    type: html
  design_system:
    requires: false
  example_prompt: |
    Use fade-in-up on the hero: rise + fade the eyebrow, headline, subhead and CTA in a short
    stagger, with a prefers-reduced-motion fallback.
---

# fade-in-up

A clean rise + fade entrance, on load. Part of
[motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`.

## When to use it
- Hero content and a few key elements appearing on first paint.

## When NOT to use it (restraint)
- Long lists / off-screen content — use `scroll-reveal`.
- Don't delay must-read content by more than ~300ms; keep to ≤3 staggered elements.

## How to apply
1. Copy `fade-in-up.css` and `fade-in-up.js` and link them.
2. Mark elements: `<h1 data-fade>…</h1>` (optional `data-fade-delay="80"`; auto-staggers otherwise).

## Accessibility & performance
- `prefers-reduced-motion`: shown immediately. Transform/opacity only.
