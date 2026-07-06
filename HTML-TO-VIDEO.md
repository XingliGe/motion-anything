# HTML → video export — current state & the quality-upgrade path

The video line has two ways to produce an MP4 (see `PROGRESS.md` / `VIDEO-ROADMAP.md`):

1. **Canvas compositor → MP4** (the hero path): the video engine renders to `<canvas>` and exports
   in-browser via WebCodecs + vendored `mp4-muxer`. High quality, deterministic, no deps. This is
   what "generate a launch video" uses.
2. **HTML → MP4** (the "export an HTML artifact as video" side path): implemented today with a
   **freezable timeline** (`__maTimeline.seek(t)`) + a **foreignObject frame-grab** (`html-capture.js`)
   that draws each frozen frame to a canvas and feeds the same WebCodecs muxer.

## Known limits of the current HTML→MP4 (foreignObject) path
`<foreignObject>` rasterization is convenient (no deps, no headless browser) but:
- **Cannot capture a live `<canvas>` / WebGL / WebGPU** surface (the very effects in `WEBGL.md`).
  → the engine falls back to `captureCanvasElement` for a single GL canvas, but not composited pages.
- **Cross-origin images / fonts taint** the canvas unless CORS-clean; self-contained artifacts are fine.
- Layout-heavy pages can rasterize slowly (one SVG serialization per frame).
- No audio.

So it's good for **self-contained, DOM/CSS-driven** artifacts (which is most of what our HTML line
generates) and honest about the rest.

## The quality-upgrade path — HyperFrames (BUILT + verified 2026-07-02)
For award-tier fidelity (real fonts, heavy CSS motion, WebGL-capable capture), HTML→video can now
route through **HyperFrames** (`npx hyperframes`, the OD-family HTML-render-to-video engine).

**How it works (`/api/hf-render` in `cli/bin/motion.js`):**
1. Take the project's self-contained `index.html` artifact.
2. Wrap it as a minimal HyperFrames composition (`hfWrapperHtml`): the artifact runs in a
   **same-origin `srcdoc` iframe**; the composition exposes `window.__hf = { duration, seek }`, and
   `seek(t)` sets **every page animation** (`iframe.contentDocument.getAnimations()`) to time `t`.
3. `npx hyperframes render --quality high --resolution <landscape|portrait> --output launch.mp4` —
   HyperFrames drives `seek()` per frame and captures each frame in real Chrome (frame-accurate,
   WebGL-capable), then FFmpeg-muxes to MP4.
4. Return `projects/<slug>/launch.mp4`; the UI downloads it.

**UI:** Download ▾ → **`✦ MP4 · HyperFrames HD`** (next to the fast foreignObject `▶ MP4`).
**Requires:** `npx hyperframes` (Node ≥ 22 + FFmpeg; first run downloads its own Chromium). Override
the binary with `HYPERFRAMES_BIN`. Docker is optional (only for `--docker` deterministic renders).

**Verified end-to-end:** a CSS-animation artifact → `{ok:true}` → a real 1920×1080 MP4 whose frames
at different times differ (motion captured), via `POST /api/hf-render`.

**Honest limit:** this bridge seeks **CSS / Web-Animations** only. Motion driven by `requestAnimationFrame`
/ JS clocks / time-based WebGL is **not** seekable this way, so those pages render static or wrong —
keep such effects on the canvas video line, or make them expose a `seek(t)`. The fast in-browser
foreignObject `▶ MP4` remains the zero-dependency fallback when `hyperframes` isn't installed.

### Adjacent win already shipped
The **kinetic typography** half of task #24 ("反哺 HTML 线") **is** done: `recipes/web/kinetic-headline`
now mirrors the video engine's kinetic presets on the HTML line
(`data-kinetic-anim`: rise · fade · drop · pop · blur · flip · spin · slide · typewriter · wave),
so per-character/word motion is as rich in HTML as in video. Browser-verified.
