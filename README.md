# motion-anything

<p align="center"><sub>A project in the <a href="https://github.com/nexu-io/open-design"><b>nexu.io · Open Design</b></a> family — the same team's take on motion. If motion-anything clicks for you, <a href="https://github.com/nexu-io/open-design">Open Design</a> is where the full agent-era design studio lives.</sub></p>

> **Describe the feeling — your AI ships the animation.** The agentic motion layer: a local-first, chat-native motion engine. Generate animated pages and launch videos from one sentence, then edit motion **on the running page, component by component** — 4 triggers, 13 motion verbs, spring easing, a full keyframe editor. Driven by **8 coding-agent engines + BYOK** (Claude Code · Codex · Cursor · OpenCode · Grok Build · Hermes · Gemini · Open Design Cloud), armed with **403 curated motion recipes**, and exported to anything: JSON · CSS · React · Lottie · MP4 · GIF · portable skills. Zero npm dependencies. No watermark. No per-render fees.

<p align="center">
  <img src="docs/assets/hero.jpg" alt="motion-anything — Anything becomes motion, on your laptop. Editorial dark banner with floating motion-editor cards and purple silk light ribbons; 403 motion recipes, 8 coding agents, 0 API key." width="100%" />
</p>

<p align="center">
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=flat-square" /></a>
  <a href="#engines"><img alt="Engines" src="https://img.shields.io/badge/engines-8%20CLIs%20%2B%20BYOK-111?style=flat-square" /></a>
  <a href="#the-library"><img alt="Recipes" src="https://img.shields.io/badge/motion%20recipes-403-8b7cf6?style=flat-square" /></a>
  <a href="#export-anything"><img alt="Export" src="https://img.shields.io/badge/export-JSON%20%C2%B7%20CSS%20%C2%B7%20React%20%C2%B7%20Lottie%20%C2%B7%20MP4%20%C2%B7%20GIF-9b59b6?style=flat-square" /></a>
  <a href="#quickstart"><img alt="Quickstart" src="https://img.shields.io/badge/quickstart-1%20command-green?style=flat-square" /></a>
  <a href="#architecture"><img alt="Zero deps" src="https://img.shields.io/badge/npm%20dependencies-0-ff6b35?style=flat-square" /></a>
</p>

<p align="center">
  <a href="https://github.com/nexu-io/open-design"><img alt="Family" src="https://img.shields.io/badge/family-nexu--io%2Fopen--design-ff7043?style=flat-square&logo=github&logoColor=white" /></a>
  <a href="https://x.com/OpenDesignHQ"><img alt="Follow on X" src="https://img.shields.io/badge/follow-%40OpenDesignHQ-000000?style=flat-square&logo=x&logoColor=white" /></a>
</p>

<p align="center"><b>English</b> · <a href="README.zh-CN.md">简体中文</a></p>

---

## Showcase

Every tile below is a **live, dependency-free recipe** from the library — real GPU shaders, canvas engines and kinetic text, faithfully ported so they run with two `<script>` tags on any page (no React, no three.js, no build step). All tiles are animated GIFs recorded from the actual previews.

<table>
<tr>
<td width="50%"><a href="recipes/slides/fx-typewriter-multi/"><img src="docs/assets/effects/typewriter-multi.gif" alt="Typewriter multi — terminal-style lines typing in sequence" /></a></td>
<td width="50%"><a href="recipes/web/shiny-text/"><img src="docs/assets/effects/shiny-text.gif" alt="Shiny text — a highlight band sweeps across the label" /></a></td>
</tr>
<tr>
<td><b><a href="recipes/slides/fx-typewriter-multi/">typewriter-multi</a></b> · kinetic text<br/><sub>Terminal-style multi-line typing with live cursors — agent-boot energy.</sub></td>
<td><b><a href="recipes/web/shiny-text/">shiny-text</a></b> · kinetic text<br/><sub>A sheen sweeps across text-clipped gradient type. One class to use.</sub></td>
</tr>
<tr>
<td width="50%"><a href="recipes/web/star-border/"><img src="docs/assets/effects/star-border.gif" alt="Star border — a slow light circles the button border" /></a></td>
<td width="50%"><a href="recipes/web/rotating-text/"><img src="docs/assets/effects/rotating-text.gif" alt="Rotating text — words cycle in place" /></a></td>
</tr>
<tr>
<td><b><a href="recipes/web/star-border/">star-border</a></b> · ambient CTA<br/><sub>A slow light orbits the border of your call-to-action. Pure CSS.</sub></td>
<td><b><a href="recipes/web/rotating-text/">rotating-text</a></b> · kinetic text<br/><sub>One line, many claims — words cycle in place with a soft travel.</sub></td>
</tr>
<tr>
<td width="50%"><a href="recipes/web/magnet-lines/"><img src="docs/assets/effects/magnet-lines.gif" alt="Magnet lines — a grid of lines tracks the pointer" /></a></td>
<td width="50%"><a href="recipes/web/elastic-slider/"><img src="docs/assets/effects/elastic-slider.gif" alt="Elastic slider — a springy gradient fill follows the drag" /></a></td>
</tr>
<tr>
<td><b><a href="recipes/web/magnet-lines/">magnet-lines</a></b> · interactive<br/><sub>A field of compass needles that swivel toward your pointer.</sub></td>
<td><b><a href="recipes/web/elastic-slider/">elastic-slider</a></b> · feedback<br/><sub>A slider whose fill overshoots with a spring — tactile, GPU-safe.</sub></td>
</tr>
<tr>
<td width="50%"><a href="recipes/web/bounce-cards/"><img src="docs/assets/effects/bounce-cards.gif" alt="Bounce cards — a stack fans out with a bounce" /></a></td>
<td width="50%"><a href="recipes/web/strands/"><img src="docs/assets/effects/strands.gif" alt="Strands — flowing luminous fibers" /></a></td>
</tr>
<tr>
<td><b><a href="recipes/web/bounce-cards/">bounce-cards</a></b> · entrance<br/><sub>A card stack fans out with a staggered bounce as it enters the view.</sub></td>
<td><b><a href="recipes/web/strands/">strands</a></b> · GPU shader<br/><sub>Luminous fibers drifting like hair in water — a quiet hero backdrop.</sub></td>
</tr>
<tr>
<td width="50%"><a href="recipes/web/silk/"><img src="docs/assets/effects/silk.gif" alt="Silk — flowing silky fabric waves" /></a></td>
<td width="50%"><a href="recipes/web/waves/"><img src="docs/assets/effects/waves.gif" alt="Waves — perlin-warped line field with a pointer wake" /></a></td>
</tr>
<tr>
<td><b><a href="recipes/web/silk/">silk</a></b> · GPU shader<br/><sub>Flowing fabric, ported from a three.js scene to a single fragment shader.</sub></td>
<td><b><a href="recipes/web/waves/">waves</a></b> · canvas 2D<br/><sub>A perlin-warped line field with a pointer wake — organic, editorial, calm.</sub></td>
</tr>
<tr>
<td width="50%"><a href="recipes/web/faulty-terminal/"><img src="docs/assets/effects/faulty-terminal.gif" alt="Faulty terminal — CRT glitch grid" /></a></td>
<td width="50%"><a href="recipes/web/pixel-blast/"><img src="docs/assets/effects/pixel-blast.gif" alt="Pixel blast — drifting pixel pattern with click ripples" /></a></td>
</tr>
<tr>
<td><b><a href="recipes/web/faulty-terminal/">faulty-terminal</a></b> · GPU shader<br/><sub>A glitching CRT grid for cyber / dev-tool moods.</sub></td>
<td><b><a href="recipes/web/pixel-blast/">pixel-blast</a></b> · GPU shader · interactive<br/><sub>A drifting pixel pattern that ripples outward from every click.</sub></td>
</tr>
</table>

### Kinetic text

Motion is not only backgrounds — text is a first-class citizen. These run on plain DOM, dependency-free:

<table>
<tr>
<td width="50%"><a href="recipes/web/decrypted-text/"><img src="docs/assets/effects/decrypted-text.gif" alt="Decrypted text — glyphs resolve into ACCESS GRANTED" /></a></td>
<td width="50%"><a href="recipes/web/text-scramble/"><img src="docs/assets/effects/text-scramble.gif" alt="Text scramble — a techy decode reveal between phrases" /></a></td>
</tr>
<tr>
<td><b><a href="recipes/web/decrypted-text/">decrypted-text</a></b> · kinetic text<br/><sub>Random glyphs resolve left-to-right into the real line — hacker-movie energy, one attribute to use.</sub></td>
<td><b><a href="recipes/web/text-scramble/">text-scramble</a></b> · kinetic text<br/><sub>Decode-reveal between any phrases, programmable via <code>scrambleTo(el, text)</code>.</sub></td>
</tr>
<tr>
<td width="50%"><a href="recipes/web/count-up/"><img src="docs/assets/effects/count-up.gif" alt="Count up — stats rolling from zero to their values" /></a></td>
<td width="50%"><a href="recipes/web/true-focus/"><img src="docs/assets/effects/true-focus.gif" alt="True focus — a focus frame hops word to word, blurring the rest" /></a></td>
</tr>
<tr>
<td><b><a href="recipes/web/count-up/">count-up</a></b> · kinetic text<br/><sub>Numbers roll up to their value on view — the stat-block moment, eased properly.</sub></td>
<td><b><a href="recipes/web/true-focus/">true-focus</a></b> · kinetic text<br/><sub>A focus frame hops word to word while the rest stays blurred — spotlight your claim.</sub></td>
</tr>
</table>

<p align="center"><sub>35 of the library's distinctive effects are faithful dependency-free ports — see <a href="ATTRIBUTION.md">ATTRIBUTION.md</a> for sources and permissions. The full library holds <b>403 recipes</b>.</sub></p>

---

## Product tour

<table>
<tr>
<td valign="top">
<img src="docs/assets/home.png" alt="Home — describe the motion you want in one sentence" /><br/>
<sub><b>Home</b> — one sentence in, animated artifact out. Pick a design system (59 brand packs) and a motion profile (Subtle → Cinematic), or just type.</sub>
</td>
</tr>
</table>

<table>
<tr>
<td width="50%" valign="top">
<img src="docs/assets/workbench.png" alt="Workbench — component-level motion editing on the running page, with the agent's plan, a keyframes inspector and the timeline" /><br/>
<sub><b>Workbench</b> — the heart. The agent plans, generates and self-checks on the left; click any component on the <i>running</i> page and give it motion — triggers, presets or a 6-track keyframe editor with scrub + auto-keyframe. The timeline below warns when a view exceeds the restraint budget.</sub>
</td>
<td width="50%" valign="top">
<img src="docs/assets/video-editor.png" alt="Video editor — layers, five scenes with transitions, film background and reference upload" /><br/>
<sub><b>Video editor</b> — a canvas compositor for launch videos: text / shape / image / video layers, five scenes with real transitions, a shared film background, kinetic typography, and in-browser WebCodecs MP4 export. No watermark, nothing uploaded.</sub>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<img src="docs/assets/motion-path.png" alt="Motion path — draw a curve on the canvas and the selected text travels it" /><br/>
<sub><b>Motion paths</b> — draw a line on the canvas, and the selected layer travels it: as drawn, or snapped to a clean line / circle / ellipse, with eased speed and per-character text motion on top.</sub>
</td>
<td width="50%" valign="top">
<img src="docs/assets/motion-presets.png" alt="Motion presets — entrance, emphasis, attention and exit presets stack onto any layer" /><br/>
<sub><b>Motion presets</b> — entrance / emphasis / attention / exit presets stack onto any layer (text, image, video, shapes), plus the full 200+ recipe library one click away.</sub>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<img src="docs/assets/library.png" alt="Library — recipe cards with live animated previews" /><br/>
<sub><b>Library</b> — 403 curated recipes with live card previews, searchable by intent. Every recipe carries <code>avoid_when</code> and a restraint budget: taste is enforced, not hoped for.</sub>
</td>
<td width="50%" valign="top">
<img src="docs/assets/engines.png" alt="Engines — 8 coding-agent CLIs plus BYOK" /><br/>
<sub><b>Engines</b> — bring the agent you already pay for. 8 CLIs auto-detected on your PATH, plus BYOK for direct Anthropic / OpenAI / Google API calls. Keys never leave your machine.</sub>
</td>
</tr>
</table>

<table>
<tr>
<td valign="top">
<img src="docs/assets/dark-mode.png" alt="Dark mode" /><br/>
<sub><b>Dark mode</b> — the whole app, both ways. Follows your OS in system mode.</sub>
</td>
</tr>
</table>

---

## Why motion-anything

Motion is one of the highest-leverage, lowest-understood parts of digital craft. Four problems keep great motion out of reach:

1. **AI-generated pages are dead ends** — you can generate a landing page, but tweaking its motion means re-rolling the whole page or hand-writing CSS. There is a gap between generating and refining. *motion-anything edits motion on the running page, per component, and writes it back to the file.*
2. **AI has no taste** — default output is either everything-fades-in-at-once or a fireworks show. *Here, taste is a feature: every recipe declares <code>avoid_when</code> and a restraint budget; the editor warns when a view exceeds it; <code>prefers-reduced-motion</code> is always honored; GPU-safe properties only.*
3. **The ecosystem is scattered** — GSAP, Framer Motion, anime.js, Lottie… each a learning curve. *You express intent ("a liquid-metal background"), the router picks from curated recipes. You never need to know a library name.*
4. **Tools lock you in** — proprietary models, per-render fees, watermarks, handoff-only artifacts. *This is Apache-2.0, local-first, engine-agnostic, and everything exports.*

**vs. Figma Motion** — their artifact is a handoff; ours is the running page itself. Their timeline has no interaction triggers; hover and click are first-class here. Their motion lives in their app; ours exports to JSON / CSS / React / Lottie or a portable skill any agent can use.

---

## Quickstart

```bash
git clone https://github.com/XingliGe/motion-anything.git
cd motion-anything
node cli/bin/motion.js serve 4399
# open http://localhost:4399
```

That is the whole install. **No npm install — the project has zero dependencies.** You need Node 18+ and at least one agent engine: any supported CLI on your PATH (it will be auto-detected), or an API key for BYOK (Settings → Execution mode).

---

## Engines

Your prompt runs on **your** agent — the CLI session you already pay for, or your own API key. Nothing is proxied through anyone's server.

| Engine | Vendor | Transport |
|---|---|---|
| Claude Code | Anthropic | headless `-p` + stream-json |
| Codex CLI | OpenAI | `exec --json` event stream |
| Cursor Agent | Cursor | stream-json |
| OpenCode | OpenCode | `run --format json` event stream |
| Grok Build | xAI | plain text via prompt file |
| Hermes | xAI | ACP (JSON-RPC over stdio) |
| Gemini CLI | Google | plain text |
| Open Design Cloud | nexu.io | ACP via the `vela` CLI |
| BYOK | Anthropic / OpenAI / Google | direct API with your key |

---

## The library

- **403 motion recipes** — 77 real effects with live previews, plus curated reference cards. Categories: ambient backgrounds, feedback & delight, interaction, text, transitions.
- **Standardized manifests** — every recipe is a folder with `recipe.motion.yaml`, a self-contained `preview.html`, the implementation, and a `SKILL.md`. Three fields you will not find elsewhere: `intent_keywords`, `avoid_when`, `restraint`.
- **59 design-system brand packs** + **58 video templates** + **112 HTML prototype templates** + **2,680 icons** — generation starts brand-grade, not blank.
- **230 portable skills** — export any recipe as a `SKILL.md` and drop it into [Open Design](https://github.com/nexu-io/open-design) or any agent that reads skills.

The taste contract lives in [`MOTION-SPEC.md`](MOTION-SPEC.md). The library golden path (how to add a recipe) lives in [`AGENTS.md`](AGENTS.md).

---

## Export anything

| From | To |
|---|---|
| Any component's motion | JSON (portable) · CSS · React · Lottie |
| Any animated page | MP4 (freezable-timeline frame capture) · GIF · single-file HTML |
| Any launch video | MP4 via in-browser WebCodecs — no watermark, no upload, no fees |
| Any recipe | a portable `SKILL.md` for your agent |

---

## Architecture

Plain files, no build step, zero npm dependencies — the whole app is deliberately boring to run:

- `app/index.html` — the entire client (workbench, editors, library, i18n ×4) in one file.
- `cli/bin/motion.js` — server + CLI in one file: static serving, project store, and the engine dispatch (stream-json / JSONL events / plain / ACP / BYOK behind one interface).
- `app/video/` — the canvas compositor: engine, WebCodecs MP4 export, HTML frame capture, vendored `mp4-muxer` + `gifenc` (MIT).
- `recipes/` — the library. `recipes/web/_fx/shaderbg.js` (58 lines) is the dependency-free WebGL runner behind all shader recipes.
- `skills/` — the router skill + bundled companion skills.

Agents are first-class citizens of the codebase itself: [`AGENTS.md`](AGENTS.md) is a working agreement any coding agent can follow, and [`PROGRESS.md`](PROGRESS.md) keeps the state.

---

## Roadmap

- **v0.1** — recipe library + router skill + workbench + video line + 8 engines + BYOK ← *we are here*
- **v0.x** — richer video motion (recipe reuse inside video), deeper Figma import, streaming BYOK
- **v1** — auto-add motion to existing Open Design artifacts; design-component → motion auto-assign

---

## License & credits

[Apache-2.0](LICENSE). A project in the [nexu.io](https://github.com/nexu-io) / Open Design family.
Third-party sources and permissions are recorded in [`ATTRIBUTION.md`](ATTRIBUTION.md).

---

📖 中文文档见 [README.zh-CN.md](README.zh-CN.md)
