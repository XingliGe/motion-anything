---
name: loading-shimmer
description: |
  Skeleton placeholders with a soft sweeping shimmer while content loads. Use to fill space for
  cards/lists/profiles that are still loading and make the wait feel shorter. Honors
  prefers-reduced-motion (static skeleton). Only show while real content is loading — never as decoration.
triggers:
  - "loading skeleton"
  - "shimmer placeholder"
  - "content loading state"
  - "骨架屏"
  - "加载占位"
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
    Use loading-shimmer for the card while it loads: an avatar circle, two text lines and a media
    block as skeletons with a soft sweep, plus a prefers-reduced-motion fallback (static skeleton).
---

# loading-shimmer

Skeleton placeholders with a soft sweeping highlight. Part of
[motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`.

## When to use it
- Placeholders for content still loading (cards, lists, profiles, media). Improves perceived performance.

## When NOT to use it (restraint)
- Loads under ~300ms (a skeleton flash is worse than nothing). Never as pure decoration.

## How to apply
1. Copy `loading-shimmer.css` and link it.
2. Add `data-skeleton` to placeholder blocks (give each a width/height).
3. Remove the placeholders (or the attribute) the moment real content arrives.

## Accessibility & performance
- `prefers-reduced-motion`: static skeleton, no sweep. The sweep uses `transform` only (GPU-safe).
