---
name: web-shader-extractor
description: |
  Extract a real WebGL / WebGPU / Canvas / shader effect from a live webpage (e.g. an animated
  gradient mesh, fluid/metaball, gaussian-splat scene, image distortion) and port it to a
  standalone, dependency-light JS project you can run locally or drop into an HTML artifact. Use
  when the user points at a site's visual effect and wants to reproduce/port/replay it, especially
  complex GPU effects our vanilla recipes don't cover.
triggers:
  - "extract this shader / webgl effect"
  - "port this webgl background"
  - "reproduce this canvas effect"
  - "把这个网站的 webgl/shader 效果扒下来"
  - "复刻高斯泼溅 / gaussian splatting"
  - "gpu 背景效果 港口"
od:
  mode: prototype
  surface: web
  platform: desktop
  category: animation-motion
  upstream: "https://github.com/lixiaolin94/skills"
  design_system:
    requires: false
---

# web-shader-extractor (install-on-demand companion)

> This is a **thin wrapper**. The upstream skill has **no open license**, so motion-anything cannot
> redistribute its code — it is fetched on demand instead. Everything below is motion-anything's own
> description; the implementation lives upstream.

## What it does
Locks onto a page's rendering surface (WebGL/WebGPU/Canvas), records shader / resource / render-graph
/ timing / input evidence, builds an evidence-matched local baseline, then projectizes it into a
standalone runnable. This is the right tool for the "复杂网页效果 (WebGL / 高斯泼溅)" need that our
2D compositor deliberately does not draw — see `WEBGL.md`.

## How to invoke
1. If not already installed, fetch it (one-time, needs network):
   ```bash
   npx skills add https://github.com/lixiaolin94/skills --skill web-shader-extractor
   ```
2. Then follow that skill's flow against the target URL / effect.
3. Bring the extracted effect back as a background layer in an HTML artifact; motion-anything adds
   the surrounding tasteful motion.

## Note for maintainers
If lixiaolin94/skills adds a permissive license, vendor it here properly (like `skills/web-clone`)
so it ships offline with the product. Until then, keep this wrapper.
Upstream: https://github.com/lixiaolin94/skills
