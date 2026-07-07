# PROGRESS.md — project status

> Live status for contributors and agents. For the working agreement (repo map, recipe schema,
> golden path, hard rules) read [`AGENTS.md`](AGENTS.md) first. Roadmaps live in
> [`ROADMAP.md`](ROADMAP.md) (HTML line) and [`VIDEO-ROADMAP.md`](VIDEO-ROADMAP.md) (video line).

## Where the product stands (v0.1)

**Two product lines, both closed-loop:**

- **HTML line** — generate an animated single-file page from one sentence, then edit motion
  per component on the *running* page: 4 triggers (load / scroll / hover / click), 13 motion
  verbs, spring easing, a keyframe editor (6 tracks, scrub + auto-keyframe, serializes back
  into the page), reusable motion styles, and export as JSON / CSS / React / Lottie / MP4 / GIF.
- **Video line** — a canvas compositor for launch videos: multi-scene + transitions,
  per-layer keyframe tracks, kinetic typography (13 char/word presets), motion templates,
  shared full-movie video backgrounds, in-browser WebCodecs MP4 export (no watermark,
  no native deps). Agentic generation with a streaming plan → execute → self-review loop.

**Engines (8):** Claude Code, Codex CLI, Cursor Agent, OpenCode, Grok Build, Hermes,
Gemini CLI (local CLIs), Open Design Cloud (ACP over stdio via `vela`), plus BYOK
(direct Anthropic / OpenAI / Google API calls with your own key). Each drives the same
generation/edit pipeline; see `KNOWN_CLIS` in `cli/bin/motion.js`.

**Library:** 400+ curated recipes across ambient / feedback-delight / interaction categories —
including 35 faithful dependency-free ports of distinctive GPU/canvas effects (see
[`ATTRIBUTION.md`](ATTRIBUTION.md)) — plus 58 design-system brand packs, 58 video templates,
112 HTML prototype templates, and an icon library. Every recipe is an Open-Design-compatible
`SKILL.md` and obeys the restraint budget in [`MOTION-SPEC.md`](MOTION-SPEC.md).

## How to run

```bash
node cli/bin/motion.js serve 4399
# open http://localhost:4399
```

Requirements: Node 18+. Pick an installed agent CLI (or configure BYOK) in
Settings → Execution mode. Changing `cli/bin/motion.js` requires a server restart;
`app/*` changes only need a browser refresh.

## Known limitations (honest list)

- HTML→MP4/GIF export rasterizes via SVG `foreignObject`: CSS/DOM/SVG and same-origin images
  capture fine; live `<canvas>`/WebGL/`<video>` backing stores do not (use the per-canvas
  recorder or the video line for those).
- Four react-bits effects (Beams, Ballpit, Hyperspeed, LiquidEther) remain reference cards —
  they need three.js-scale engines and a dependency-free port isn\'t worth the fidelity loss.
- BYOK is non-streaming (one reply per turn); local CLI engines stream.
- The preview iframe requires same-origin (served by the bundled server, not `file://`).

## Contributing

Add a recipe: follow the golden path in `AGENTS.md` (folder + `recipe.motion.yaml` +
self-contained `preview.html` + implementation + `SKILL.md`), register it in
`app/data/recipes.js`, and verify the preview renders before opening a PR.

## Recent fixes

- 2026-07-07: Fixed Windows local CLI detection/execution so npm shims like `codex.cmd`
  show as installed, launch cleanly, avoid unrelated user Codex MCP config during headless
  generation, and are killed as a process tree on timeout.
- 2026-07-07: Routed video requests typed in the HTML workbench chat to the video compositor,
  including the currently open HTML artifact as context instead of sending them to `/api/edit`.
