/* gen-support.mjs — emit the support files (preview.html / recipe.motion.yaml / SKILL.md) for a
 * HAND-WRITTEN recipe implementation under recipes/web/<id>/<id>.js (shader or canvas port).
 * Usage: node tools/gen-support.mjs <id> <Name> [shader|self] ["description"]
 *   shader → preview loads ../_fx/shaderbg.js + <id>.js ;  self → only <id>.js (canvas 2D / raw GL).
 * Keeps hand-ports consistent with generator output without overwriting the implementation. */
import { writeFileSync, existsSync } from 'node:fs';
const [id, Name, kind='self', desc='A distinctive animated background — faithful dependency-free port.'] = process.argv.slice(2);
if(!id || !Name){ console.error('usage: node tools/gen-support.mjs <id> <Name> [shader|self] [desc]'); process.exit(1); }
const o=`recipes/web/${id}`;
if(!existsSync(`${o}/${id}.js`)){ console.error(`write ${o}/${id}.js first`); process.exit(1); }
const scripts = kind==='shader' ? `<script src="../_fx/shaderbg.js"></script><script src="${id}.js"></script>` : `<script src="${id}.js"></script>`;
writeFileSync(`${o}/preview.html`, `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${id} · recipe</title>
<style>:root{color-scheme:dark}html,body{margin:0;height:100vh;overflow:hidden;background:#05060a}.${id}{position:absolute;inset:0}.cap{position:absolute;left:0;right:0;bottom:22px;text-align:center;font:12px ui-sans-serif,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.5);z-index:2}</style></head>
<body><div class="${id}"></div><div class="cap">motion-anything · ambient · ${id}</div>${scripts}</body></html>`);
const files = kind==='shader' ? `[../_fx/shaderbg.js, ${id}.js]` : `[${id}.js]`;
writeFileSync(`${o}/recipe.motion.yaml`, `spec_version: 1
id: ${id}
name: ${Name}
description: ${desc}
surfaces: [web, interaction]
canvas: [web]
target: [background, section]
intent: ambient
runtime: [js]
export: [skill, motion-json, html]
category: ambient
tech: [js]
dependencies: []
tags: [background, hero, ambient, ${id}]
intent_keywords: [${id}, animated background, 动态背景]
best_for: ["A full-bleed hero/section background"]
avoid_when: ["Behind dense text without a scrim", "Multiple animated backgrounds at once"]
restraint: { max_per_view: 1, notes: "One animated background per view; scrim behind text. Static frame under reduced-motion." }
motion: { duration_ms: 0, easing: linear, reduced_motion: static, gpu_safe: true }
entry: preview.html
implementations:
  - { tech: js, files: ${files}, usage: "Copy the file(s); add a full-bleed <div class=\\"${id}\\"></div>." }
license: { spdx: Apache-2.0, upstream: null, attribution_required: false }
author: { name: nexu.io, url: "https://github.com/nexu-io" }
version: 0.1.0
`);
writeFileSync(`${o}/SKILL.md`, `---
name: ${id}
description: |
  ${desc} A marketing-grade hero backdrop. One per view; scrim behind text.
  Renders a static frame under prefers-reduced-motion.
triggers: ["${id}","animated background","动态背景"]
od: { mode: prototype, surface: web, platform: desktop, category: animation-motion, preview: { type: html }, design_system: { requires: false } }
---
# ${id}
${desc}
## How to apply
Copy ${kind==='shader'?`\`_fx/shaderbg.js\` + \`${id}.js\``:`\`${id}.js\``}; add \`<div class="${id}" style="position:absolute;inset:0"></div>\` behind content.
`);
console.log('support files written for', id);
