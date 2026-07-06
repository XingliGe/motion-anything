# WEBGL.md — how motion-anything supports complex web effects (WebGL / shaders / gaussian-splatting)

Users increasingly want award-tier web effects: WebGL shader gradients, image distortion, particle
fields, Three.js/R3F hero objects, and photoreal **gaussian-splatting** (radiance-field) scenes.
motion-anything **exports HTML**, so it *can* ship these — but it authors them by **referencing and
reproducing real implementations**, not by drawing them on the 2D canvas compositor (which is for the
video line and is deliberately 2D). This doc is the method.

## Why not "just draw it on the canvas compositor?"
The video line's engine is a **2D canvas** compositor (text/shape/image/video + keyframes). WebGL and
splatting are fundamentally GPU/3D and live on their own `<canvas>` with a GL context. Forcing them
into the 2D compositor would be a lie. Instead we keep them on the **HTML line**, where a real GL
canvas belongs, and give the agent three concrete tools.

## The three tools

### 1. Library reference cards (discover + link to a real source)
The Motion Library ships curated **reference** cards for these effects (the "老办法"): a live mini
preview + one click to the real, reputable source. Search the library for `webgl`, `shader`, `3d`,
`gaussian`, `particles`:
- `ref-shader-gradient` — ShaderGradient (living gradient mesh, the Stripe/Linear hero backdrop)
- `ref-webgl-distortion` — Codrops fragment-shader image distortion
- `ref-particles-bg` — tsParticles interactive field
- `ref-metaballs-blob` — OGL fluid metaballs
- `ref-three-hero` — Three.js / R3F floating hero object
- `ref-spline-3d` — Spline no-code interactive 3D
- `ref-gaussian-splat` — **GaussianSplats3D** (mkkellogg) — photoreal splats live in-browser
- `ref-curtains` — Curtains.js (DOM images → warpable WebGL planes)
- `ref-shader-transition` — gl-transitions (GLSL scene wipes)

Each card's "Get from {source}" opens the upstream so the user (or the agent) can pull the real code.

### 2. web-shader-extractor skill (reproduce a *specific* effect off a real page)
When the user points at a real site — "复刻这个网站的这个 WebGL 效果 / extract this shader" — the
router hands off to the installed **web-shader-extractor** skill. It locks onto the target rendering
surface, records shader/resource/render-graph/timing/input evidence, builds an evidence-matched local
baseline, and projectizes it into standalone JS you can drop into the exported HTML. This is the right
tool for gaussian-splatting or a bespoke shader you saw in the wild — far better than guessing GLSL.

### 3. captureCanvasElement — record a live GL canvas to video
The foreignObject frame-grabber used by HTML→mp4 export **cannot** see a WebGL/`<canvas>` backing
store (it rasterizes DOM only). The one client-side way to record GL output is
`HTMLCanvasElement.captureStream()` + `MediaRecorder`. It's shipped in
[`app/video/html-capture.js`](app/video/html-capture.js):

```js
import { captureCanvasElement } from './video/html-capture.js';
// record the page's live GL canvas for 6s → a webm Blob
const blob = await captureCanvasElement(document.querySelector('canvas'), 6);
```

Use this when the deliverable is a *video* of a shader/splat scene. (For a video that composites GL
*plus* 2D overlays, record the GL canvas here and drop the result in as a `video` layer on the video
line — the engine already supports video layers and shared video backgrounds.)

## Routing summary
- "Make a landing page with a shader-gradient / 3D hero" → HTML line + `ref-shader-gradient` /
  `ref-three-hero` (pull real code from the source, wire it into the export).
- "复刻这个网站的高斯泼溅效果" → **web-shader-extractor** → reproduced JS → HTML artifact.
- "Record this WebGL scene as a video" → `captureCanvasElement` → mp4/webm (optionally into a video
  layer).
- "Build me a custom shader tool" → **Toolcraft** (`npx @pixel-point/toolcraft create`).

## Honest limitations (say these plainly to the user)
- The 2D canvas compositor does **not** author GL effects; they live on the HTML line.
- HTML→mp4's DOM grabber skips GL/`<canvas>`/cross-origin media — use `captureCanvasElement` for GL.
- Reproducing a proprietary effect depends on the source being inspectable; splat scenes need the
  `.ply`/`.splat` asset. When an asset is gated, say so and offer the closest open reference.
