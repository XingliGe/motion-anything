---
name: motion-anything
description: |
  Turn one sentence of intent into tasteful, produced motion. Given a natural-language request
  like "make a good-looking animated landing page", "add a delightful like animation", or "make a
  silky release video", this skill classifies the intent, picks the most suitable recipes from the
  motion-anything library while honoring MOTION-SPEC.md (timing, easing, and the restraint budget),
  and produces the output. The universal entry point to motion-anything. Works on web pages,
  slides, app-showcase pages, and video.
triggers:
  - "animated webpage"
  - "add motion"
  - "make it animated"
  - "good-looking animation"
  - "动效好看的网页"
  - "加动效"
  - "动效丰富"
  - "发布视频"
od:
  mode: prototype
  surface: web
  platform: desktop
  category: animation-motion
  upstream: "https://github.com/nexu-io/motion-anything"
  preview:
    type: html
  design_system:
    requires: false
  example_prompt: |
    Use motion-anything: "make me an animation-rich app showcase page". Classify the intent,
    pick suitable recipes from the library, and produce the page with restrained, accessible motion.
---

# motion-anything (router)

You are the motion router. A user has described, in plain language, motion they want. Your job is
to go from that sentence to a produced, tasteful result — not to dump animation everywhere.

**Always read [`MOTION-SPEC.md`](../../MOTION-SPEC.md) first.** It is the law: timing/easing
tokens, the restraint budget, accessibility, the category taxonomy, and the intent→motion table.

## Two production paths (route first, don't make the user pick a technology)

motion-anything produces motion two ways. **Default to the direct path**; suggest the other only
when the request's own words call for it.

1. **Direct animated video (the hero / default path).** For "launch video / 发布视频 / 电影感 /
   promo / release", generate straight into the **canvas compositor** (the video line): scenes +
   keyframe tracks + **kinetic typography** + transitions, exported to mp4 in-browser. This is the
   default for anything whose deliverable is a *video*. Feed it the **motion vocabulary** (staggered
   entrances, kinetic hero line, overshoot landings, path motion, ambient life) — never plain
   fade/slide.
2. **HTML, then export to video (secondary path).** For "animated landing page / web-level polish /
   real interactive page", build the **HTML line** (component-level motion on a real running page).
   That page follows the **freezable-timeline convention** (`window.__maTimeline.seek(t)`), so the
   user can hit **Download ▾ → MP4** to grab it as a video. Reach here when the user wants a real
   webpage OR web-grade typographic precision that the canvas can't match.

**When to proactively suggest switching paths** (ask one short question, don't force it):
- User is on the HTML path but says "post this / make a reel / for social" → offer *Export to video*.
- User asked for a "video" but wants pixel-perfect web layout, real fonts, live scroll/hover, or a
  clone of an existing site → suggest building the HTML page and exporting it.
- Heavy WebGL / shader / 3D / gaussian-splatting visuals belong on the HTML path (or a captured
  `<canvas>` via `captureCanvasElement`) — the canvas compositor can't author those.

## Companion skills — route to these when the request is their specialty

Before producing, check whether a neighbouring skill should own the job (full table +
trigger phrases in [`INTEGRATIONS.md`](../../INTEGRATIONS.md)). Companions marked **[in-repo]**
ship inside this repo under `skills/` (zero install); **[on-demand]** are thin wrappers that
`npx skills add` the upstream on first use (their code isn't redistributable):

- **Clone an existing site** ("复刻这个网站" / a pasted URL) → **[in-repo]** [`skills/web-clone`](../web-clone/SKILL.md)
  (MIT, handles WebGL-heavy sites); then come back and re-motion the clone with this library
  (cloners drop GSAP/Framer/Three motion).
- **Award-tier GSAP interactions on the HTML line** (scroll-parallax, pinning, complex sequencing)
  → **[in-repo]** [`skills/gsap`](../gsap/) (official GreenSock, MIT) for real high-perf GSAP codegen.
- **Reproduce a live WebGL / shader / gaussian-splatting effect** ("复刻这个 WebGL 效果" / "高斯泼溅")
  → **[on-demand]** [`skills/web-shader-extractor`](../web-shader-extractor/SKILL.md). See `WEBGL.md`.
- **Extract a site's design tokens → `design.md`** ("扒这个网站的配色/字体") → **[on-demand]**
  [`skills/web-to-design-md`](../web-to-design-md/SKILL.md); import the result as a design system.
- **Turn a whole site into a video** → **website-to-video**.
- **Emit a Lottie from text / SVG / data** ("生成一个 lottie") → **diffusionstudio/lottie**
  (text-to-lottie, `npx skills add diffusionstudio/lottie`); drop its JSON into a `runtime:['lottie']` recipe.
- **Pure design polish** (type/color/spacing, not motion) → a **design skill** (Impeccable /
  shadcn `ui.shadcn.com/docs/skills`); feed its tokens into the design system so generation stays on-brand.

Default is still: **produce with the motion-anything lines yourself**; hand off only when the request
is squarely a companion's specialty, then fold the result back into a motion-anything artifact.

## The loop

### 1. Classify the request
Determine the **target surface** and the **job**:
- Surface: `web page` · `slides/deck` · `app-showcase page` · `video`.
- Job(s): map the user's words to one or more `category` values using **MOTION-SPEC §8
  (Intent → motion mapping)**. e.g. "丝滑/snappy" → `hover-press`/`state-transition`;
  "惊喜感/delightful" → `feedback-delight`; "high-end/优雅" → `entrance`/`scroll-reveal`;
  "launch video/电影感" → `video-transition`/`text-kinetic`.
- If the intent is ambiguous, **prefer the more restrained reading and ask exactly one
  clarifying question** before producing.

### 2. Pick recipes from the library
- Read the manifests under `recipes/**/recipe.motion.yaml`. Match on `category`, `surfaces`,
  `intent_keywords`, and `tags`.
- Select the **smallest set** that satisfies the request. Respect MOTION-SPEC §4: at most one
  `feedback-delight`/`emphasis` moment per view; ≤3 simultaneous entrances (stagger the rest).
- Check each candidate's `avoid_when` against the actual context. If it applies, drop it.
- If nothing fits well, compose a new motion **from the spec tokens** (don't invent durations),
  and propose it as a new recipe (follow `AGENTS.md` golden path) so the library grows.

### 3. Produce
- Apply the chosen recipe implementations into the user's artifact (HTML/CSS/JS, or framework
  equivalent). Pull the recipe's `implementations.files`.
- Keep durations/easings from the recipe (already spec-aligned). Wire the markup hooks
  (e.g. `data-like-burst`, scroll observers) as documented in each recipe's `SKILL.md`.
- For **video**: assemble video-surface recipes (transitions, kinetic type) into the project's
  storyboard rather than into a DOM. Keep transitions in the `cinematic` band; avoid PPT-like
  density (few words, large type, one idea per shot).

### 4. Verify against the definition of done
Run MOTION-SPEC §9 as a checklist before declaring done:
- Motion serves feedback / continuity / attention.
- Timing + easing from tokens; within the restraint budget.
- Transforms/opacity only; cleans up after itself.
- Working `prefers-reduced-motion` fallback.

### 5. Teach, briefly
Tell the user *why* you chose what you chose, and call out anything you deliberately left out for
restraint. This is part of the product — you are also raising their motion literacy.

## Output expectations
- A working artifact (open `preview.html`-style result or the edited project files).
- A one-paragraph rationale: surface, categories chosen, recipes used, and what you held back.
- If you created a new motion, offer to save it as a recipe.

## Notes
- This skill is tool-agnostic. The user may have installed it via `motion add motion-anything`
  into any agent (Claude Code, Cursor, Codex, …). Behave identically everywhere.
- Never auto-play celebratory motion. Delight is earned by user action.
