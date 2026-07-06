# Attribution — gsap (Official GSAP AI skills)

Vendored into motion-anything under its MIT license.

- **Upstream:** https://github.com/greensock/gsap-skills
- **Author:** GreenSock (GSAP)
- **License:** MIT (see `LICENSE` in this folder — retained unmodified)
- **Vendored:** 2026-07-02. Copied the `skills/` set (`gsap-core`, `gsap-timeline`,
  `gsap-scrolltrigger`, `gsap-plugins`, `gsap-performance`, `gsap-utils`, `gsap-frameworks`,
  `gsap-react`) + `llms.txt`; no source changes.

## Why it's here
These teach an agent to use GSAP correctly (timelines, ScrollTrigger, plugins, performance). On the
**HTML line**, when a user wants award-tier GSAP interactions (scroll-parallax, pinning, complex
sequencing) that go beyond our vanilla `recipes/`, the router delegates here for real, high-perf
GSAP codegen. GSAP itself is free (also MIT) as of 2025.

Upstream updates are not auto-synced; re-pull from the source if you need the latest.
