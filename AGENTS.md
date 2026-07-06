# AGENTS.md — working agreement for any AI agent on this repo

This file is the single source of truth for **any** coding agent (Claude Code, Cursor, Codex,
Aider, …) working on `motion-anything`. If you are an AI picking this project up cold, read this
file and `PROGRESS.md` first — they are designed so the project can be continued by any tool, in
any new session, without losing context.

## What this project is

`motion-anything` is an open-source, chat-native **motion engine**: a curated + standardized
library of motion recipes, a "taste engine" (`MOTION-SPEC.md`), and a router skill that turns one
sentence of intent into produced, tasteful animation. It is an independent product that **shares
resources with and interlocks with** [Open Design](https://github.com/nexu-io/open-design):
every recipe is authored as an **Open-Design-compatible `SKILL.md`** so it can drop straight into
OD's `skills/` and bind to OD design systems' `motion` section.

Read the product thesis in `README.md`. Read live status and the task queue in `PROGRESS.md`.

## Repository map

| Path | Role |
|------|------|
| `recipes/<surface>/<recipe-id>/` | One motion recipe. Surfaces: `web/`, `interaction/`, `video/`. |
| `recipes/<...>/recipe.motion.yaml` | Machine manifest (gallery + router read this). Schema below. |
| `recipes/<...>/SKILL.md` | The portable, Open-Design-compatible skill for this recipe. |
| `recipes/<...>/preview.html` | Self-contained, openable live demo. No build step, no external deps. |
| `recipes/<...>/*.css`, `*.js`, `*.jsx` | The reusable implementation(s). |
| `skills/motion-anything/SKILL.md` | The **router meta-skill**: intent → classify → pick → produce. |
| `MOTION-SPEC.md` | The motion standard. Every recipe and the router MUST obey it. |
| `gallery/index.html` | The possibility gallery (static; reads recipes). |
| `cli/` | Minimal Node CLI: `list`, `add <recipe>`, `gallery`. |

## The recipe manifest schema (`recipe.motion.yaml`)

Mirrors Open Design / html-video manifests, extended with the three fields that make this product
unique (`intent_keywords`, `avoid_when`, `restraint`).

```yaml
spec_version: 1
id: like-burst                 # kebab-case, unique, == folder name
name: Like Burst
description: A celebratory particle burst on tap, for likes / reactions.
surfaces: [web, interaction]   # legacy alias of `canvas`; kept for back-compat

# ── 分类五维（建库标准，取值见下方 §"分类标准") ─────────────────────────
canvas:  [web]                 # 场景：用到哪里  → web | slides | video | app
target:  [button, icon]        # 对象：给什么加  → text|button|card|list|image|icon|section|number|transition|background
intent:  feedback-delight      # 意图：表达什么  → = MOTION-SPEC category（沿用同一套）
runtime: [css, js]             # 技术：怎么实现  → css|js|framer-motion|gsap|motion-one|lottie|rive
export:  [skill, motion-json, html]  # 可导出：能产出什么 → skill|motion-json|lottie|html|video
# ───────────────────────────────────────────────────────────────────────

category: feedback-delight     # alias of `intent` (kept for back-compat / MOTION-SPEC)
tech: [css, js]                # alias of `runtime` (kept for back-compat)
dependencies: []               # npm packages required (empty = vanilla)
tags: [like, reaction, particles, celebration, micro-interaction]

# ── the three soul fields ──────────────────────────────────────────────
intent_keywords:               # how a human would *describe wanting* this, incl. 中文
  - delightful like
  - celebration burst
  - 点赞特效
  - 惊喜感
best_for:                      # when to reach for it
  - Like / favorite / reaction buttons
  - Small moments of positive feedback
avoid_when:                    # when NOT to use it (the restraint layer)
  - Destructive or neutral actions (delete, dismiss)
  - More than one celebratory burst visible at once
restraint:                     # usage budget, per MOTION-SPEC.md
  max_per_view: 1
  notes: One celebratory moment per screen. Never auto-play; trigger on user intent only.
# ───────────────────────────────────────────────────────────────────────

motion:
  duration_ms: 600             # within MOTION-SPEC bounds for this category
  easing: ease-out
  reduced_motion: scale-only   # graceful fallback when prefers-reduced-motion
  gpu_safe: true               # transforms/opacity only — no layout thrash

entry: preview.html
implementations:
  - { tech: css+js, files: [like-burst.css, like-burst.js] }

license:
  spdx: Apache-2.0
  upstream: null               # URL if adapted from an upstream library
  attribution_required: false
author: { name: nexu.io, url: "https://github.com/nexu-io" }
version: 0.1.0
```

## 分类标准（五维建库 + 一条品味红线）

每条 recipe 都按**五个维度**打标签（不是塞进单一目录树）。检索时由 agent 自由组合查询（"web 场景里给
按钮加一个有反馈感的动效"= canvas:web × target:button × intent:feedback-delight）。

| 维度 | 字段 | 取值 |
|------|------|------|
| **场景** 用到哪里 | `canvas` | `web`（网页）· `slides`（幻灯片）· `video`（launch/release 视频）· `app`（App UI） |
| **对象** 给什么加 | `target` | `text` · `button` · `card` · `list` · `image` · `icon` · `section`（整页/区块）· `number`（统计数字）· `transition`（转场）· `background` |
| **意图** 表达什么 | `intent` | 沿用 MOTION-SPEC category：`entrance` · `scroll-reveal` · `hover-press` · `feedback-delight` · `emphasis` · `attention` · `loading` · `text-kinetic` · `ambient`（背景氛围）· `exit`（退出）· `page-transition` · `video-transition` |
| **技术** 怎么实现 | `runtime` | `css` · `js` · `framer-motion` · `gsap` · `motion-one` · `lottie` · `rive` |
| **可导出** 能产出什么 | `export` | `skill`（SKILL.md 包）· `motion-json`（便携 JSON）· `lottie` · `html`（standalone）· `video` |

**外加一条不进五维、但绝不能省的品味红线：`restraint` + `avoid_when`** —— "什么时候**别**用"。
这是 motion-anything 区别于"又一个素材站"的护城河；没有 restraint 的 recipe 视为未完成。来源（GSAP/Lottie…）
只作元数据（`license` / `upstream`），**不作分类轴**。完整盘点与收录梯队见 `SOURCES.md`。

## How to add a new recipe (the golden path)

1. `mkdir recipes/<surface>/<recipe-id>/`.
2. Write `recipe.motion.yaml` using the schema above. Fill **all three soul fields** honestly —
   especially `avoid_when` and `restraint`. A recipe without restraint guidance is incomplete.
3. Write `preview.html`: self-contained, opens in any browser, no build, no CDN that can break
   offline. It must visibly demonstrate the motion and respect `prefers-reduced-motion`.
4. Write the implementation file(s) referenced by `implementations`.
5. Write `SKILL.md` (Open-Design-compatible frontmatter — copy an existing recipe's and adapt).
6. Confirm it shows up: `node cli/bin/motion.js list`.
7. Update `PROGRESS.md` (move it from "next" to "done").

## Hard rules (these are the product, not nitpicks)

- **Restraint is a feature.** Curate, don't dump. Every recipe must declare `avoid_when` +
  `restraint`. Quality and taste over quantity — that is the whole differentiator.
- **Animate transforms & opacity only.** Never animate layout properties (width/height/top/left)
  in a way that thrashes. Keep it GPU-safe.
- **Always provide a `prefers-reduced-motion` fallback.** No exceptions. Accessibility is non-negotiable.
- **Recipes are tool-agnostic, dependency-honest.** Vanilla where possible; declare every dep.
- **Stay Open-Design-compatible.** Recipe `SKILL.md` frontmatter must keep the `od:` block valid.
- **Plain files only.** No build-time magic that locks the repo to one agent or toolchain.

## Conventions

- Indent: 2 spaces. Line endings: LF. Filenames: kebab-case.
- Bilingual docs: keep `README.md` and `README.zh-CN.md` in sync when either changes.
- Commit messages: imperative, scoped, e.g. `recipe(web): add scroll-reveal`. End AI commits with the
  Co-Authored-By trailer.
- After any meaningful change, update `PROGRESS.md`. It is the handoff contract between sessions.
