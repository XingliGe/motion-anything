# Design systems — source & attribution

These design-system folders are **borrowed from [Open Design](https://github.com/nexu-io/open-design)**
(`design-systems/<brand>/`), used under the **Apache License 2.0**.

Each folder keeps the two files motion-anything needs:

- `DESIGN.md` — the brand-grade spec (palette, type, spacing, motion, voice, anti-patterns).
  motion-anything prepends this to the generation prompt so produced HTML is brand-grade by
  default, then layers motion on top — the value Open Design / Figma don't provide.
- `manifest.json` — id / name / category metadata.

We intentionally keep only those two files per brand (not the full Open Design bundle:
tokens.css, components.html, previews, multilingual specs, source evidence) to stay lean.

**Why this is allowed:** Open Design is Apache-2.0, which permits redistribution and modification
with attribution and license notice. This file is that notice. Upstream:
<https://github.com/nexu-io/open-design/tree/main/design-systems>.

To add more, copy another `design-systems/<id>/DESIGN.md` + `manifest.json` from Open Design and
append an entry to `app/data/design-systems.js` (or re-run `/tmp/build-ds-index.js`).
