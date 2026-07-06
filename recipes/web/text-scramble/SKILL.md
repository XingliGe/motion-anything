---
name: text-scramble
description: |
  Resolve one short headline from random glyphs — a techy decode reveal. One short line only; keep
  it fast. The resolved text is the real, accessible content; under prefers-reduced-motion it appears
  instantly with no scramble. Avoid on body copy and calm/luxury tones.
triggers:
  - "text scramble"
  - "decode text"
  - "glitch text reveal"
  - "matrix text"
  - "解码文字"
  - "科技感标题"
od:
  mode: prototype
  surface: web
  platform: desktop
  category: animation-motion
  upstream: "https://tympanus.net/Development/TextScrambleEffect/"
  preview:
    type: html
  design_system:
    requires: false
  example_prompt: |
    Use text-scramble on the hero line for a technical product: it resolves from noise, fast. Just
    the one line; instant under reduced-motion.
---

# text-scramble

A line of text that resolves from random glyphs. Part of
[motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`. Technique
popularized by Codrops, reimplemented dependency-free.

## When to use it
- A hero word / short headline with a technical or futuristic tone; cycling a few phrases on one line.

## When NOT to use it (restraint)
- Long text or body copy — unreadable while scrambling. **One short line.**
- Calm / editorial / luxury tones (feels gimmicky).

## How to apply
1. Copy `text-scramble.js` into the project and link it.
2. Mark the element:
   ```html
   <span class="scramble" data-text="motion, anything"></span>
   ```
3. Auto-plays `data-text` on load. To change the phrase later: `scrambleTo(el, "next phrase")`.

## Accessibility & performance
- Under `prefers-reduced-motion` the final text appears instantly (no scramble). The resolved
  `data-text` is always the real content.
- Swaps text content on rAF; keep the line short so it stays cheap.

## Framework notes
- React: keep a ref and call `scrambleTo(ref.current, text)` on mount / when the phrase changes.
