# ATTRIBUTION.md — third-party sources & credits

motion-anything is Apache-2.0 (see [LICENSE](LICENSE)). Portions of the library and tooling
build on the work of others. This file records every external source, its license, and how
it is used. If you believe something is misattributed, please open an issue.

## Motion effects

- **react-bits** (<https://reactbits.dev>) — 35 recipes in `recipes/web/` are faithful,
  dependency-free ports of react-bits effects (original GLSL shaders and effect logic,
  re-hosted on our zero-dependency runners; the React wrappers are fully rewritten).
  The source components are vendored under `recipes/imported/` for reference and future ports.
  **Used and redistributed with the author's permission.** The remaining `rb-*` entries in the
  library are reference cards that link back to reactbits.dev.
- **Open Design** (<https://github.com/nexu-io/open-design>, Apache-2.0) — sibling project in
  the nexu.io family. Shared here: agent engine icons (`app/agent-icons/`), design-system
  brand packs, video/HTML template collections, and the ACP runtime integration patterns
  (`docs/new-agent-runtime-acp.md`, `apps/daemon/src/acp.ts`).

## Vendored libraries (in `app/video/vendor/`)

- **mp4-muxer** — MIT. In-browser MP4 muxing for the WebCodecs export pipeline.
- **gifenc** © Matt DesLauriers — MIT. GIF encoding for the animated-GIF export.

## Bundled skills (in `skills/`)

- **web-clone** — MIT, vendored with LICENSE + ATTRIBUTION in its folder.
- **gsap skill** — GreenSock, MIT-licensed skill content, vendored with LICENSE in its folder.
- Other companion skills (text-to-lottie, web-shader-extractor, Web-to-Design-md, Toolcraft)
  are **not** vendored — the router defers to them if the user installs them; see
  [INTEGRATIONS.md](INTEGRATIONS.md).

## Reference cards

Library entries marked `ref` (with a "Get from …" link) are pointers to upstream libraries and
demos (GSAP, Motion.dev, Anime.js, LottieFiles, Rive, ShaderGradient, three.js ecosystem, …).
They embed no upstream code — each card links to the original source and license.

## Icons & fonts

- **reicon** icon set — bundled per its upstream license (see `app/data/` provenance notes).
- System font stacks only; no bundled fonts.
