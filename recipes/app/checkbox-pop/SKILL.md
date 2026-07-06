---
name: checkbox-pop
description: |
  A checkbox that pops and draws its check on toggle. An App-UI micro-interaction (mobile component feedback). Honors prefers-reduced-motion.
  Keep it short and snappy; only on controls that actually change state.
triggers:
  - "checkbox"
  - "勾选动效"
od:
  mode: prototype
  surface: web
  platform: mobile
  category: animation-motion
  upstream: null
  preview:
    type: html
  design_system:
    requires: false
  example_prompt: |
    Use checkbox-pop on the icon: a quick, native-feeling micro-interaction with a
    prefers-reduced-motion fallback.
---

# Checkbox Pop

A checkbox that pops and draws its check on toggle. An App-UI micro-interaction. Part of
[motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`.

## When to use it
- Native-feeling feedback on App components (buttons, tabs, sheets, toasts, form controls).

## When NOT to use it (restraint)
- Don't slow a frequent action. Don't decorate a control that doesn't change state.

## Accessibility & performance
- `prefers-reduced-motion`: shortened / disabled. Transform & opacity only (GPU-safe).
