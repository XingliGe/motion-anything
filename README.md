# ✨ motion-anything

> **The agentic motion layer.** Describe the *feeling* — your AI ships the *animation*.
>
> An open-source, chat-native motion engine for the web, slides, and video.
> Browse a curated library of motion recipes, reuse them in one click, or export any
> recipe as a portable **skill** and hand it to your own AI agent.
>
> 🧩 Built to interlock with [Open Design](https://github.com/nexu-io/open-design) ·
> 🔑 BYOK / bring your own local CLI · 🛡️ Apache-2.0 · 🚫 no per-render fees

---

## Why motion-anything?

Motion is one of the highest-leverage, lowest-understood parts of digital craft. Four problems
keep great motion out of reach:

1. **People don't know what's possible** — most have no idea what AI can already animate.
2. **The ecosystem is scattered** — GSAP, Framer Motion, Motion One, anime.js, Lottie… each with its own learning curve.
3. **Motion is hard to describe in words** — "make it feel snappy / springy / delightful" rarely maps to code.
4. **Nobody teaches restraint** — more motion is not better motion, and there's no shared standard.

motion-anything is **not another animation library**. It's a curated, standardized motion
**library + a taste engine + a way to ship motion through your AI agent.**

## How it works

```
You (in your agent's chat):  "make me a good-looking animated landing page"
                                          │
                          skills/motion-anything (router)
                                          │
              ┌───────────────────────────┼───────────────────────────┐
        classify intent              pick recipes               apply MOTION-SPEC
       (web / video / app)        from recipes/ library         (timing · restraint
                                                                  · reduced-motion)
                                          │
                                  ✨ animated output
```

Everything is **plain files** (Markdown skills, YAML manifests, HTML/CSS/JS) in a git repo —
no lock-in. Works with Claude Code, Cursor, Codex, and 17+ other agents via the same skills.

## Quickstart

> v0 is CLI + skills + a static gallery. No installer, no desktop app required.

```bash
# Browse the possibility gallery (opens a local page)
npx motion-anything gallery

# List available motion recipes
npx motion-anything list

# Export a recipe as a portable skill for your AI agent
npx motion-anything add like-burst
```

Then, inside your coding agent (Claude Code / Cursor / …), just say what you want:

> *"add a delightful like animation to the heart button"*
> *"make a release video with silky transitions"*
> *"give this app showcase page rich, tasteful motion"*

## What's inside

| Path | What it is |
|------|-----------|
| [`recipes/`](recipes/) | The curated motion library. Each recipe = an Open-Design-compatible `SKILL.md` + live preview + implementations. |
| [`skills/motion-anything/`](skills/motion-anything/) | The **router meta-skill**: turns one sentence into matched, produced motion. |
| [`MOTION-SPEC.md`](MOTION-SPEC.md) | The motion standard — timing, easing, restraint budget, accessibility. The "taste engine". |
| [`gallery/`](gallery/) | The possibility gallery — see every recipe in motion. |
| [`cli/`](cli/) | Minimal CLI: `list`, `add`, `gallery`. |

## Roadmap

- **v0** — motion recipe library + router skill + gallery + "export as skill" ← *we are here*
- **v0.x** — Open-Design-style local web app shell (chat-native, BYOK, sandboxed preview)
- **v1** — auto-add motion to existing Open Design artifacts; silky launch/release videos; design-component → motion auto-assign

See [`PROGRESS.md`](PROGRESS.md) for live status.

## License & credits

[Apache-2.0](LICENSE). A project in the [nexu.io](https://github.com/nexu-io) / Open Design family.
Third-party sources and permissions are recorded in [`ATTRIBUTION.md`](ATTRIBUTION.md).

---

📖 中文文档见 [README.zh-CN.md](README.zh-CN.md)
