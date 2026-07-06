/* gen-shader.mjs — port react-bits ogl fragment-shader backgrounds to dependency-free recipes.
 * Run from repo root:  node tools/gen-shader.mjs
 * Extend LIST below (id must match the kebab folder under recipes/imported/) then re-run.
 * Extracts each effect's real GLSL FRAG + heuristic uniform defaults → writes
 * recipes/web/<id>/{<id>.js, preview.html, recipe.motion.yaml, SKILL.md}, wired to _fx/shaderbg.js.
 * AFTER running: register each in app/data/recipes.js (kind:'fx', preview path) + delete the matching
 * rb-<id> entry (dedupe). Verify with a browser screenshot. Full plan: PROGRESS.md top block. */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
const SRC='recipes/imported', OUT='recipes/web';
// effect id -> [Name, target-ok]. Only ogl full-screen fragment-shader backgrounds (no three scene).
// Each entry: 'id': 'Name'  (legacy, heuristic defaults)  OR
//             'id': { name, uniforms:{...real defaults from the source jsx...}, allowThree:true, patches:[[from,to],...] }
// ⚠️ Lesson from batch 2: heuristic defaults rendered half the shaders black/mispositioned.
// ALWAYS extract the real prop defaults from the source component (destructuring defaults +
// `uX:{value:...}` mapping, hex→[r,g,b]/255) and put them in `uniforms`. `patches` are literal
// string replacements applied to the extracted FRAG (e.g. drop a varying the runner doesn't supply).
const hex=h=>{h=h.replace('#','');return [parseInt(h.slice(0,2),16)/255,parseInt(h.slice(2,4),16)/255,parseInt(h.slice(4,6),16)/255];};
const F=(v)=>({t:'1f',v}), I=(v)=>({t:'1i',v}), C3=(a)=>({t:'3f',v:a}), V2=(a)=>({t:'2f',v:a});
const LIST={
 // batch 3 (2026-07-02 深夜续): raw-GL + portable three-plane shaders, real defaults
 'lightning':{ name:'Lightning', uniforms:{ uHue:F(230), uXOffset:F(0), uSpeed:F(1), uIntensity:F(1), uSize:F(1) } },
 'silk':{ name:'Silk', allowThree:true,
   // source advances uTime by 0.1*delta (≈0.1×seconds); shaderbg feeds real seconds → uSpeed×0.1 compensates.
   uniforms:{ uColor:C3(hex('#7B7481')), uSpeed:F(0.5), uScale:F(1), uRotation:F(0), uNoiseIntensity:F(1.5) },
   patches:[['varying vec3 vPosition;\n','']] },
 'pixel-snow':{ name:'Pixel Snow', allowThree:true, glsl3:true,
   uniforms:{ uFlakeSize:F(0.01), uMinFlakeSize:F(1.25), uPixelResolution:F(200), uSpeed:F(1.25),
     uDepthFade:F(8), uFarPlane:F(20), uColor:C3([1,1,1]), uBrightness:F(1), uGamma:F(0.4545),
     uDensity:F(0.3), uVariant:F(0), uDirection:F(125*Math.PI/180) } },
 'pixel-blast':{ name:'Pixel Blast', allowThree:true, glsl3:true,
   // source: uTime = elapsed seconds × speed(0.5) → timeScale compensates. Click ripples wired via
   // `wire` (ShaderBG handle). Output premultiplied for shaderbg's (ONE, ONE_MINUS_SRC_ALPHA) blend.
   opts:{ timeScale:0.5 },
   patches:[['fragColor = vec4(srgbColor, M);','fragColor = vec4(srgbColor * M, M);']],
   uniforms:{ uColor:C3(hex('#B497CF')), uShapeType:I(0), uPixelSize:F(3), uScale:F(2), uDensity:F(1),
     uPixelJitter:F(0), uEnableRipples:I(1), uRippleSpeed:F(0.3), uRippleThickness:F(0.1),
     uRippleIntensity:F(1), uEdgeFade:F(0.5),
     uClickPos:{t:'2fv', v:Array(20).fill(-1)}, uClickTimes:{t:'1fv', v:Array(10).fill(0)} },
   wire:`if(h){ (function(){ var N=10, pos=new Array(2*N), times=new Array(N), ix=0, k;
  for(k=0;k<N;k++){ pos[2*k]=-1; pos[2*k+1]=-1; times[k]=0; }
  h.el.addEventListener('pointerdown', function(e){ var r=h.el.getBoundingClientRect();
    var sx=h.canvas.width/r.width, sy=h.canvas.height/r.height;
    pos[2*ix]=(e.clientX-r.left)*sx; pos[2*ix+1]=(r.height-(e.clientY-r.top))*sy;
    times[ix]=h.time(); ix=(ix+1)%N;
    h.set('uClickPos',{t:'2fv',v:pos}); h.set('uClickTimes',{t:'1fv',v:times}); }); })(); }` },
};
function findFrag(src){ const re=/`([^`]*)`/g; let m,lits=[]; while((m=re.exec(src))) lits.push(m[1]);
  let frag=lits.find(l=>/void\s+main/.test(l) && /(gl_FragColor|fragColor)/.test(l) && /(uniform|precision|#version)/.test(l));
  if(!frag) return frag;
  // GLSL is authored as a JS template literal — substitute any ${CONST} placeholders (e.g. ${MAX_STRANDS})
  // with their `const NAME = <number>` value from the source, else the raw `${...}` breaks compilation.
  frag=frag.replace(/\$\{(\w+)\}/g, (_,name)=>{ const cm=src.match(new RegExp('const\\s+'+name+'\\s*=\\s*([0-9]+)')); return cm?cm[1]:'0'; });
  return frag; }
function customs(frag){ const skip=new Set(['uTime','iTime','uResolution','iResolution','uMouse']); const out={};
  const re=/uniform\s+(float|vec2|vec3|vec4|int)\s+([a-zA-Z_]\w*)\s*(\[\d+\])?/g; let m;
  while((m=re.exec(frag))){ const type=m[1],name=m[2],arr=m[3]; if(skip.has(name)||arr) continue;
    let t,v;
    if(type==='float'){ t='1f'; v=/amp|amplitude/i.test(name)?0.3:/speed/i.test(name)?1.0:/freq/i.test(name)?2.0:/scale/i.test(name)?1.0:/opacity|alpha/i.test(name)?1.0:/blend/i.test(name)?0.5:/dist/i.test(name)?0.5:/hue/i.test(name)?0.0:/noise/i.test(name)?0.12:/scan/i.test(name)?0.2:/warp/i.test(name)?0.3:/direction/i.test(name)?1.0:1.0; }
    else if(type==='vec3'){ t='3f'; v=/base|color/i.test(name)?[0.55,0.5,1.0]:[1,1,1]; }
    else if(type==='vec2'){ t='2f'; v=[0.5,0.5]; }
    else if(type==='int'){ t='1i'; v=1; }
    else { t='3f'; v=[1,1,1]; }
    out[name]={t,v}; }
  return out; }
let done=[], skipped=[];
for(const [id,spec] of Object.entries(LIST)){
  const cfg = typeof spec==='string' ? {name:spec} : spec;
  const Name = cfg.name;
  const dir=`${SRC}/${id}`; if(!existsSync(dir)){ skipped.push(id+'(no dir)'); continue; }
  const jsx=readdirSync(dir).find(f=>f.endsWith('.jsx')); if(!jsx){ skipped.push(id+'(no jsx)'); continue; }
  const src=readFileSync(`${dir}/${jsx}`,'utf8');
  if(!cfg.allowThree && /from '@react-three|from 'three'/.test(src)){ skipped.push(id+'(three)'); continue; }
  let frag=findFrag(src); if(!frag){ skipped.push(id+'(no frag)'); continue; }
  for(const [from,to] of (cfg.patches||[])){ if(!frag.includes(from)){ console.warn(`[${id}] patch source not found:`, JSON.stringify(from.slice(0,60))); } frag=frag.split(from).join(to); }
  // glsl3: shader uses GLSL ES 3.0 features (uint, array constructors, texture()) but is written
  // GLSL1-style (three.js auto-upgrades; raw WebGL doesn't) → wrap as #version 300 es for WebGL2.
  if(cfg.glsl3 && !/#version\s+300/.test(frag)){
    const hasOut=/\bout\s+vec4\s+fragColor\b/.test(frag);
    frag='#version 300 es\nprecision highp float;\n'+(hasOut?'':'out vec4 fragColor;\n')+frag.trimStart().split('gl_FragColor').join('fragColor');
  }
  // three.js injects `precision` automatically — raw WebGL doesn't. Prepend if missing (WebGL1 only).
  if(!/precision\s+(lowp|mediump|highp)\s+float/.test(frag) && !/#version\s+300/.test(frag)) frag='precision highp float;\n'+frag;
  const uni = cfg.uniforms || customs(frag);
  const o=`${OUT}/${id}`; mkdirSync(o,{recursive:true});
  const fragEsc=frag.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n');
  const js=`/* ${id}.js — motion-anything recipe · ambient · faithful GPU shader (dependency-free WebGL via _fx/shaderbg.js). */
(function(g){ 'use strict';
  var FRAG='${fragEsc}';
  function init(){ var els=document.querySelectorAll('.${id}'); for(var i=0;i<els.length;i++){ if(els[i].__sbg) continue;
    var h=g.ShaderBG(els[i], FRAG, ${JSON.stringify({...(cfg.opts||{}), uniforms:uni})});${cfg.wire?'\n    '+cfg.wire.trim().split('\n').join('\n    '):''} } }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
`;
  writeFileSync(`${o}/${id}.js`, js);
  writeFileSync(`${o}/preview.html`, `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${id} · recipe</title>
<style>:root{color-scheme:dark}html,body{margin:0;height:100vh;overflow:hidden;background:#05060a}.${id}{position:absolute;inset:0}.cap{position:absolute;left:0;right:0;bottom:22px;text-align:center;font:12px ui-sans-serif,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.5);z-index:2}</style></head>
<body><div class="${id}"></div><div class="cap">motion-anything · ambient · ${id}</div><script src="../_fx/shaderbg.js"></script><script src="${id}.js"></script></body></html>`);
  writeFileSync(`${o}/recipe.motion.yaml`, `spec_version: 1
id: ${id}
name: ${Name}
description: A distinctive GPU shader background — faithful fragment shader in dependency-free WebGL.
surfaces: [web, interaction]
canvas: [web]
target: [background, section]
intent: ambient
runtime: [js]
export: [skill, motion-json, html]
category: ambient
tech: [js]
dependencies: []
tags: [shader, webgl, background, hero, ambient, ${id}]
intent_keywords: [${id}, shader background, webgl background, 着色器背景, 动态背景]
best_for: ["A full-bleed hero/section background"]
avoid_when: ["Behind dense text without a scrim", "Multiple GPU backgrounds at once"]
restraint: { max_per_view: 1, notes: "One GPU background per view; scrim behind text. Static frame under reduced-motion." }
motion: { duration_ms: 0, easing: linear, reduced_motion: static, gpu_safe: true }
entry: preview.html
implementations:
  - { tech: js, files: [../_fx/shaderbg.js, ${id}.js], usage: "Copy _fx/shaderbg.js + ${id}.js; add a full-bleed <div class=\\"${id}\\"></div>." }
license: { spdx: Apache-2.0, upstream: null, attribution_required: false }
author: { name: nexu.io, url: "https://github.com/nexu-io" }
version: 0.1.0
`);
  writeFileSync(`${o}/SKILL.md`, `---
name: ${id}
description: |
  A distinctive GPU shader background rendered in dependency-free WebGL — a marketing-grade hero
  backdrop. One per view; scrim behind text. Renders a static frame under prefers-reduced-motion.
triggers: ["${id}","shader background","webgl background","着色器背景","动态背景"]
od: { mode: prototype, surface: web, platform: desktop, category: animation-motion, preview: { type: html }, design_system: { requires: false } }
---
# ${id}
A GPU fragment-shader background (dependency-free WebGL).
## How to apply
Copy \`_fx/shaderbg.js\` + \`${id}.js\`; add \`<div class="${id}" style="position:absolute;inset:0"></div>\` behind content.
`);
  done.push(id);
}
console.log('generated:', done.join(', '));
console.log('skipped:', skipped.join(', '));
