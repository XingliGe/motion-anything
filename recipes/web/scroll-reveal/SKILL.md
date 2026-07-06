---
name: scroll-reveal
description: |
  Reveal content as it scrolls into view — a gentle rise + fade, once per element. Use to give a
  long page calm rhythm. Honors prefers-reduced-motion and supports staggering. Do not delay
  above-the-fold content, and keep at most a few elements animating at once.
triggers:
  - "reveal on scroll"
  - "fade in on scroll"
  - "scroll animation"
  - "elegant entrance"
  - "滚动出现"
  - "高级感"
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
    Use scroll-reveal on the content sections of this page: a gentle rise+fade as each enters
    the viewport, staggered, with a prefers-reduced-motion fallback. Leave the hero visible instantly.
---

# scroll-reveal

A gentle rise + fade as elements scroll into view. Part of
[motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`.

## When to use it
- Long landing pages and stacked content sections.
- Giving a page a calm sense of pace.

## When NOT to use it (restraint)
- Above-the-fold hero content the reader must see instantly.
- Revealing many elements simultaneously — stagger them, max ~3 at once.

## How to apply
1. Copy `scroll-reveal.css` and `scroll-reveal.js` into the project, and link them.
2. Mark elements:
   ```html
   <section data-reveal>…</section>
   <li data-reveal data-reveal-delay="80">…</li>   <!-- optional stagger, ms -->
   ```
3. An IntersectionObserver adds `.is-in` once, when the element enters the viewport.

## Accessibility & performance
- `prefers-reduced-motion`: everything is shown immediately, no travel.
- Animates `transform`/`opacity` only; unobserves each element after it reveals.

## Framework notes
- React: render `data-reveal` attributes and run the init (or an equivalent `useEffect` +
  IntersectionObserver) after mount.
