# MOTION-SPEC.md — the motion standard

This is the "taste engine" of motion-anything. It encodes **how to use motion well**, so that
every recipe and the router skill produce restrained, accessible, product-grade animation instead
of decoration for its own sake.

> Inspiration: this spec is aligned with widely-respected motion guidance (Material motion,
> Apple HIG, and Emil Kowalski's animation principles). Recipes should cite their lineage in
> `recipe.motion.yaml > license.upstream` where applicable.

---

## 1. First principles

1. **Motion must mean something.** Every animation either (a) gives feedback, (b) shows a
   relationship/continuity, or (c) directs attention. If it does none of these, cut it.
2. **The best motion is felt, not noticed.** If users consciously notice the animation, it is
   usually too slow, too big, or too frequent.
3. **Restraint is the craft.** More motion is not better. A single, well-placed moment beats ten.
4. **Performance is part of taste.** Janky motion reads as cheap. Animate GPU-friendly properties.
5. **Accessibility is non-negotiable.** Always honor `prefers-reduced-motion`.

## 2. Timing scale (duration tokens)

Use these tokens; do not invent arbitrary durations.

| Token | ms | Use for |
|-------|----|---------|
| `instant` | 80–120 | Hover/press feedback, tiny state flips |
| `fast` | 140–220 | Micro-interactions, button/toggle states, small reveals |
| `base` | 220–320 | Standard transitions, card/element entrances |
| `slow` | 320–500 | Page/section transitions, larger reveals |
| `deliberate` | 500–800 | Hero moments, celebratory bursts, onboarding |
| `cinematic` | 800–2000 | Video transitions, launch-film moments only |

Rule of thumb: **the larger the moving element or distance, the longer the duration** — but stay
in band. UI micro-interactions should almost always be `fast`.

## 3. Easing tokens

| Token | curve | Use for |
|-------|-------|---------|
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | **Default** for things entering / responding to the user |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Things leaving the screen |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Moves that start and end on screen |
| `spring-soft` | spring(stiffness 170, damping 26) | Playful, organic; toggles, drags, delight |
| `spring-snappy` | spring(stiffness 300, damping 30) | Crisp, responsive controls |

Default to **`ease-out`** for UI. Linear easing is for continuous loops only (spinners, marquees).

## 4. Restraint budget

Per visible viewport ("view"):

- **≤ 1** celebratory / attention-grabbing moment (`feedback-delight`, `emphasis`).
- **≤ 3** simultaneous entrance animations; stagger the rest. Stagger step **40–80ms**, capped so
  the whole sequence finishes within `slow`.
- **No competing loops.** At most one ambient/looping animation on screen at a time.
- **Never auto-play celebratory motion.** Delight triggers on user intent (tap/submit), not on load.

Each recipe declares its own budget in `recipe.motion.yaml > restraint`. The router must respect the
sum across recipes it composes — if two recipes both want the "one celebratory moment", pick one.

## 5. Performance rules

- Animate **`transform` and `opacity`** only for anything that moves or fades. Avoid animating
  `width`, `height`, `top`, `left`, `margin` (they trigger layout). Use `transform: translate/scale`.
- Promote heavy animations with `will-change` sparingly; remove it after the animation ends.
- Target **60fps**. If a recipe can't hold 60fps on a mid-range laptop, simplify it.
- Clean up: cancel timers/RAF, remove injected DOM nodes (e.g. particles) after they finish.

## 6. Accessibility — `prefers-reduced-motion`

Every recipe MUST degrade gracefully. Acceptable reduced-motion fallbacks:

- `scale-only` — keep a tiny scale/opacity cue, drop travel and particles.
- `crossfade` — replace movement with a short opacity change.
- `none` — show the end state instantly (valid for purely decorative motion).

Reference pattern (every recipe's CSS should include something like this):

```css
@media (prefers-reduced-motion: reduce) {
  /* drop travel, particles, and long durations; keep a minimal cue or none */
}
```

## 7. Category taxonomy

Recipes are tagged with one primary `category`. This is what the router matches intent against.

| Category | What it is | Default duration | Default easing |
|----------|------------|------------------|----------------|
| `entrance` | Elements appearing (fade/slide/scale in) | `base` | `ease-out` |
| `exit` | Elements leaving | `fast` | `ease-in` |
| `scroll-reveal` | Reveal on scroll into view | `base` | `ease-out` |
| `hover-press` | Pointer feedback (magnetic, lift, press) | `fast` | `ease-out` / `spring-snappy` |
| `state-transition` | Toggle / tab / accordion / expand | `fast` | `ease-in-out` |
| `feedback-delight` | Celebratory micro-moments (like-burst, confetti) | `deliberate` | `ease-out` / `spring-soft` |
| `emphasis` | Draw attention (pulse, shake, count-up) | `fast`–`base` | `ease-out` |
| `loading` | Pending/progress states | loop | linear |
| `page-transition` | Between routes/sections | `slow` | `ease-in-out` |
| `text-kinetic` | Animated typography (for web & video) | `base`–`cinematic` | varies |
| `video-transition` | Shot-to-shot transitions for video | `cinematic` | `ease-in-out` |

## 8. Intent → motion mapping (for the router)

The router maps fuzzy human language to categories + recipes. Common cues:

| User says (incl. 中文) | Likely category |
|------------------------|-----------------|
| "snappy", "responsive", "丝滑", "干脆" | `hover-press`, `state-transition` (`fast`, `spring-snappy`) |
| "delightful", "surprise", "fun", "惊喜感", "好玩" | `feedback-delight` |
| "elegant", "smooth", "premium", "高级", "优雅" | `entrance`, `scroll-reveal` (`base`/`slow`, `ease-out`) |
| "draws attention", "pop", "强调", "突出" | `emphasis` |
| "cinematic", "launch video", "发布视频", "电影感" | `video-transition`, `text-kinetic` (`cinematic`) |
| "alive", "playful", "有生命力", "活泼" | `hover-press`, `feedback-delight` (`spring-soft`) |

When intent is ambiguous, prefer the **more restrained** option and ask one clarifying question.

## 9. Definition of done for any produced motion

- [ ] Serves feedback, continuity, or attention (§1).
- [ ] Duration + easing pulled from the tokens (§2–3), appropriate to element size.
- [ ] Within the restraint budget for the view (§4).
- [ ] Transforms/opacity only; cleans up after itself (§5).
- [ ] Has a working `prefers-reduced-motion` fallback (§6).
