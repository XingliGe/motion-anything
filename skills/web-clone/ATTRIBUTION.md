# Attribution — web-clone

Vendored into motion-anything with permission of its MIT license.

- **Upstream:** https://github.com/Jane-xiaoer/claude-skill-web-clone
- **Author:** Jane (@xiaoerzhan / 小耳)
- **License:** MIT (see `LICENSE` in this folder — retained unmodified)
- **Vendored:** 2026-07-02. Copied files: `SKILL.md`, `references/`, `scripts/` (the WeChat QR
  image and `.gitignore` were omitted; no source changes).

## Why it's here
motion-anything ships this so the shipped product can faithfully clone a site — from a single-file
static page to a **WebGL-heavy interactive demo** (real-source-first, not AI-hallucinated code) —
and then re-motion it with our recipe library. The router (`skills/motion-anything/SKILL.md`)
delegates "clone this site / 复刻这个网站" intents here.

Upstream updates are not auto-synced; re-pull from the source if you need the latest.
