---
name: fx-knowledge-graph
description: |
  Linked nodes drifting — a data / AI backdrop. A bold, canvas-based effect from Open Design's html-ppt fx pack — for slides and launch
  videos. Guards prefers-reduced-motion (does not start). One per screen; on web use sparingly.
triggers:
  - "graph"
  - "知识图谱"
od:
  mode: prototype
  surface: web
  platform: desktop
  category: animation-motion
  upstream: "https://github.com/nexu-io/open-design"
  preview:
    type: html
  design_system:
    requires: false
  example_prompt: |
    Use fx-knowledge-graph as a background effect on a slide or hero: call HPX['knowledge-graph'](el) on a positioned dark
    container; keep to one bold effect per screen, with a reduced-motion guard.
---

# Knowledge Graph

Linked nodes drifting — a data / AI backdrop. From [Open Design](https://github.com/nexu-io/open-design)'s html-ppt fx pack (Apache-2.0).
Part of [motion-anything](https://github.com/nexu-io/motion-anything); obeys `MOTION-SPEC.md`.

## When to use it
- Title cards, section breaks, or hero moments in slides / launch videos.

## When NOT to use it (restraint)
- Web body content or anything needing focused reading. Never more than one bold effect at once.

## How to apply
1. Copy `knowledge-graph.js` and `_util.js` and link them.
2. Add `data-fx="knowledge-graph"` to a positioned container; call `HPX['knowledge-graph'](el)` (guard prefers-reduced-motion).

## Accessibility & performance
- Guard with prefers-reduced-motion (don't start). Canvas-based; isolated compositing layer.
