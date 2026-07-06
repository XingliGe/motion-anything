---
name: kinetic-headline
description: |
  Stagger a headline's words (or letters) in on load, one after another. Use for a single hero
  headline or a title card in a launch video. Honors prefers-reduced-motion. One per screen;
  never use on body copy or must-read content.
triggers:
  - "kinetic text"
  - "animated headline"
  - "words stagger in"
  - "文字逐字入场"
  - "标题动效"
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
    Use kinetic-headline on the hero h1: stagger the words in on load (letters mode for the short
    eyebrow), short and restrained, with a prefers-reduced-motion fallback.
---

# kinetic-headline

Words or letters stagger in, one after another. Part of
[motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`.

## When to use it
- One hero headline or a single key line. Title cards in launch / release videos.

## When NOT to use it (restraint)
- Body copy or must-read content. Never more than one kinetic line per screen.

## How to apply
1. Copy `kinetic-headline.css` and `kinetic-headline.js` and link them.
2. Mark a heading: `<h1 data-kinetic>…</h1>` (or `data-kinetic="letters"` for short lines).

## Accessibility & performance
- `prefers-reduced-motion`: shown immediately. Transform/opacity only.
