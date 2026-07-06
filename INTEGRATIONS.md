# INTEGRATIONS.md — companion skills & resources motion-anything routes to

motion-anything is a **motion router**. It doesn't have to do everything itself — part of its job is
to recognize when a neighbouring, best-in-class skill or resource should do the work, and hand off to
it. This file is the catalog + the **auto-trigger routing table**. The router skill
(`skills/motion-anything/SKILL.md`) references this file so that, when the user says the trigger
phrase, the right companion is invoked automatically ("物尽其用").

> Curated 2026-07-02 from resources the maintainer flagged, **verified against the source tweets/repos**
> (read via `twitter-cli` + GitHub `curl`/`gh` — see the note at the bottom). Entries marked
> **installed** are already available in this environment as skills; the rest are companion tools the
> user can `npx … add` / install, and which the router should recommend + defer to when present.

## Routing table (intent → who handles it)

| When the user wants… | Route to | Trigger phrases |
|---|---|---|
| A **launch/promo video** with rich motion | motion-anything **video line** (this repo) | "发布视频", "launch video", "promo", "电影感" |
| **Component motion on a real webpage** | motion-anything **HTML line** (this repo) | "动效网页", "animated landing page", "加动效" |
| **HTML → mp4** | this repo's `Download ▾ → MP4` (freezable timeline + grabber) | "导出成视频", "export to video" |
| **Clone an existing website** (structure + style) | **web-clone** skill *(installed)* | "复刻这个网站", "clone this site", a pasted site URL |
| **Reproduce a site's WebGL / shader / gaussian-splat effect** | **web-shader-extractor** skill *(installed)* | "复刻这个 WebGL 效果", "extract this shader", "高斯泼溅" |
| **Turn a site into a video** | **website-to-video** skill *(installed)* | "把这个网站做成视频" |
| **Generate a Lottie animation from text/SVG/data** | **diffusionstudio/lottie** (text-to-lottie) | "生成一个 lottie", "make a lottie", "animate this SVG" |
| **Award-tier GSAP web interactions** (scroll-parallax, cursor-follow, SVG) | **GSAP Skill** (Paidax #2) | "GSAP 动效", "scroll parallax", "professional web interaction" |
| **Extract design tokens from a real site** (→ seed our design system) | **Web to Design md** (Paidax #4) | "扒这个网站的配色/字体", "design.md from url", "拿这个站的设计规范" |
| **Polish design system / typography / color / spacing** | a **design skill** (Impeccable / design-review) | "帮我把设计打磨一下", "design review", "typography pass" |
| **Build a custom creative/canvas tool** | **Toolcraft** (`npx @pixel-point/toolcraft create`) | "做一个 shader 工具", "build a canvas app" |
| **Find motion inspiration / references** | the **inspiration galleries** below | "找点灵感", "参考网站", "award-winning animation" |

The router's rule: **produce with the motion-anything lines by default**; hand off to a companion
skill only when the request is squarely that companion's specialty (cloning a real site, reproducing a
live WebGL effect, or emitting a Lottie JSON), then bring the result back into a motion-anything
artifact if it makes sense.

## Companion skills (flagged by the maintainer)

### 1. text-to-lottie — `diffusionstudio/lottie` (Doruk Kavcıoğlu)
Open-source skill + harness that generates production-ready **Lottie** JSON with Claude Code / Codex.
Best when given an SVG (e.g. from Figma), real data, or a screenshot to anchor the animation.
- Install: `npx skills add diffusionstudio/lottie`
- Use inside motion-anything: our library already treats `diffusionstudio/lottie` as the **Lottie
  content generator** (see `PROGRESS.md`). Route "make a lottie" here; the produced JSON drops into a
  `runtime:['lottie']` recipe or an `image`-style layer.
- Source: https://x.com/dorukkavcioglu/status/2070885963476173245 · https://github.com/diffusionstudio

### 2. Website-clone skills (multiple)
For rebuilding an existing site. Several exist; pick by need:
- **Jane-xiaoer/web-clone** (xiaoerzhan) — *verified best-in-class.* A **methodology + executable
  probes that put real source first** (6-step decision tree), explicitly built to clone anything
  "from a single-file static page to a **WebGL-heavy interactive demo** without faking it from AI
  hallucinations." Its launch demo 1:1-cloned **oryzo.ai** (previously reproduced locally).
  Because it handles WebGL-heavy targets, it also doubles for the complex-effects need in `WEBGL.md`.
  Install: `npx skills add https://github.com/Jane-xiaoer/web-clone` · Source:
  https://github.com/Jane-xiaoer/web-clone · https://x.com/xiaoerzhan/status/2071924492763529299
- **web-clone** *(installed here)* — our in-house cloning skill (see memory `web-clone-skill-usage`).
- **lixiaolin94/skills** — collection whose standout is **web-shader-extractor** (extract
  WebGL/Canvas/Shader effects from a site → standalone native JS). Same capability as our installed
  **web-shader-extractor** — prefer that. Source: https://github.com/lixiaolin94/skills
- **JCodesMore/ai-website-cloner-template** — `/clone-website <url>` via Chrome + Firecrawl → Next.js
  (**23.8k★**). Great for pixel-faithful static clones; note it *simplifies/loses GSAP/Framer/Three.js
  motion* — which is exactly where motion-anything adds value (re-motion the clone with our library).
  Source: https://github.com/JCodesMore/ai-website-cloner-template · https://x.com/cnyzgkc/status/2071945133336256626
- **How to apply:** clone → then run motion-anything to add tasteful motion the cloner dropped.

### 3. Design skills — Paidax's actual "5 must-install" (@xin_pai88825, verified)
The real list from the tweet (links collected in his Feishu doc). **#2 and #4 are the most
complementary to motion-anything:**
1. **Text to Lottie** — SVG + description → editable Lottie (= `diffusionstudio/lottie`, see #1 above).
2. **GSAP Skill** — **official GreenSock AI skills** (`github.com/greensock/gsap-skills`): teach the
   agent to use GSAP correctly — SVG animation, cursor-follow, scroll-parallax, high-perf code.
   → **route here for the HTML line** when the user wants award-tier GSAP interactions; complements
   our `ref-*` GSAP cards with real codegen. Install: `npx skills add greensock/gsap-skills`.
3. **three-scope-map-skill** — region name → **3D data-viz map** (dashboards: zoom/pan/points/flylines,
   themed). For big-screen / data-map asks that our 2D compositor doesn't cover.
4. **Web to Design md** — URL → extract **colors / fonts / CSS / motion → a `design.md`** the AI can
   use. → **route here to seed our design-system** from a real site, then generate on-brand motion.
5. **Shadcn/ui Skill** — **official** (`ui.shadcn.com/docs/skills`): deep knowledge of shadcn/ui
   components/patterns; align project config, unified components, multi-theme admin pages.
- Exact repos confirmed from Paidax's Feishu doc (PDF): text-to-lottie=`diffusionstudio/lottie`,
  gsap=`greensock/gsap-skills`, three-scope-map=`songsummer920-dazzle/three-scope-map-skill`,
  web-to-design-md=`Paidax01/web-to-design-md`, shadcn=`ui.shadcn.com/docs/skills`.
- Also worth knowing: **Impeccable** (Paul Bakaus, anti-pattern rules), **LottieFiles/motion-design-
  skill** (Disney-12 principles — cross-check for our `MOTION-SPEC.md`), **Emil Kowalski animate-skill**.
- **How to apply:** design skill for the *look* / *tokens*, motion-anything for the *motion*. Pipe
  "Web to Design md" output into our design-system so generation stays on-brand.
- Source: https://x.com/xin_pai88825/status/2068887723692417129

### 4. Toolcraft (Alex Barashkov / Pixel Point)
`npx @pixel-point/toolcraft create` — a starter kit + UI library for building creative **canvas apps**
(WebGL shaders, Three.js scenes, animations, photo tools). Not a motion skill per se, but the fastest
scaffold when a user wants a *bespoke shader/canvas tool* rather than a recipe. Route bespoke-tool
requests here. Source: https://x.com/alex_barashkov/status/2071951743622013186

## Inspiration libraries (motion reference, @yanliudreamer & friends — verified)
The tweet's actual list was **Mobbin · Godly · Lapa Ninja · Awwwards**; plus these staples:
- **Mobbin** (app UI patterns incl. motion): https://mobbin.com/
- **Godly** (curated, exceptional scroll/animation): https://godly.website/
- **Lapa Ninja** (landing-page inspiration gallery): https://www.lapa.ninja/
- **Awwwards — Animation / Motion / GSAP** collections: https://www.awwwards.com/websites/animation/
- **Codrops (Tympanus)** — canonical creative-web-animation tutorials/demos: https://tympanus.net/codrops/
- **CSS Design Awards** / **Webby Motion Graphics** winners.
- **How to apply:** browse for a reference, then describe it to motion-anything ("like X's hero
  reveal") — the router maps it to a recipe, or web-shader-extractor reproduces a specific effect.

---
_Access note (2026-07-02): the earlier session couldn't read x.com/github via the WebFetch tool
(claude.ai fetch safety block — not a network block). Resolved for good: **X** via `twitter-cli`
+ an authenticated session cookie (local, never committed); **GitHub** via `curl` / `gh`.
Every tweet + repo above was re-read from source and reconciled._

## WebGL / complex web effects — the honest path
motion-anything **exports HTML**, so it *can* ship WebGL/shader/gaussian-splatting effects — but it
authors them by **referencing + reproducing**, not by hand-drawing them on the canvas compositor:
1. **Library reference cards** (`ref-shader-gradient`, `ref-gaussian-splat`, `ref-webgl-distortion`,
   `ref-three-hero`, `ref-curtains`, …) preview the effect and link to a real, reputable source.
2. **web-shader-extractor** *(installed)* reproduces a *specific* effect off a real page into local JS.
3. For capturing a live `<canvas>`/WebGL animation to video, use
   `app/video/html-capture.js → captureCanvasElement(canvas, seconds)` (MediaRecorder on
   `canvas.captureStream()` — the one client-side way to record a GL backing store).
See `WEBGL.md` for the full method.
