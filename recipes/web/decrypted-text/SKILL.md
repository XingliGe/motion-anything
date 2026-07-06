---
name: decrypted-text
description: |
  Scrambled characters resolve into the real text on hover or view — a techy decode for a short label.
  The resolved text is the real, accessible content; under prefers-reduced-motion it shows instantly.
triggers: ["decrypted text","decode on hover","解密文字","悬停解码"]
od: { mode: prototype, surface: web, platform: desktop, category: animation-motion, upstream: "https://reactbits.dev/text-animations/decrypted-text", preview: { type: html }, design_system: { requires: false } }
---
# decrypted-text
Text that decodes from scrambled glyphs. Dependency-free, reduced-motion safe.
## How to apply
Copy `decrypted-text.js`; `<span class="decrypt" data-text="ACCESS GRANTED">ACCESS GRANTED</span>`. Re-runs on hover.
