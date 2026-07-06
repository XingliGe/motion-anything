# CLAUDE.md

This project follows a single, tool-agnostic working agreement so it can be continued by any AI
agent in any session.

👉 **Read [`AGENTS.md`](AGENTS.md) first** — it is the source of truth for repo structure,
the recipe manifest schema, the golden path for adding recipes, and the hard rules.

👉 **Then read [`PROGRESS.md`](PROGRESS.md)** — current status and the task queue.

👉 **The motion standard is [`MOTION-SPEC.md`](MOTION-SPEC.md)** — every recipe and the router
skill must obey it.

## Claude-specific notes

- This repo is intentionally plain files (Markdown / YAML / HTML / CSS / JS) with no build step,
  so the user can switch tools or resume in a fresh session at any time without losing context.
  Keep it that way.
- When the user describes a motion in natural language, your job is the loop in
  `skills/motion-anything/SKILL.md`: classify intent → pick recipes from `recipes/` honoring
  `MOTION-SPEC.md` (especially the restraint budget) → produce the output.
- Prefer extending the library and the spec over one-off code. The reusable recipe is the asset.
