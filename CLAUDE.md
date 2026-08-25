# CLAUDE.md — Talon Insights

Master design brief for all front-end work on this site. The full brief follows in
Part II, adopted 25 Aug 2026. **Part I records where this repo deliberately deviates
from it and corrects its factual errors — where they conflict, Part I wins.**

---

# Part I — Repo adaptations and corrections

## The stack is not the one the brief assumes

This is a **zero-dependency static site**: Python generator (`build.py`) stitches
`_src/pages/*.html` into `_src/layout.html`; generated HTML is committed and served
as-is by Vercel. One hand-written stylesheet (`assets/styles.css`), one vanilla JS
file (`assets/site.js`). No npm, no React, no build toolchain — deliberately: the
site sells performance and craft, and shipping nothing it doesn't need is part of
the proof.

So from the brief: §9's component libraries and §11's npm installs **do not apply as
written**. The techniques in §10 do apply, implemented dependency-free: SVG
`feTurbulence` grain, `skewY` pseudo-element dividers, real-DOM `perspective`
mockups, IntersectionObserver scroll choreography (see `/groundwork`), inline SVG
illustration. Anything needing WebGL/GSAP is a stack-pivot decision for Talon, not a
default. Verification is the Claude Code browser pane (screenshots both breakpoints)
plus PageSpeed Insights — same gate, different tools. Dev server:
`python .claude/serve.py` (port 4173, no-store). **Run `python build.py` after every
`_src/` edit.**

## Canonical tokens are the shipped ones

`assets/styles.css` `:root` is the source of truth, not §3. Live values that differ:

| §3 says | Shipped reality |
|---|---|
| `--amber-500: #F59E0B` | **`--amber: #F5A623`** (brand), `--amber-deep: #DE8F0D` |
| radii 6/10/16 | `--r-sm: 8px`, `--r-lg: 12px`, `--r-pill` |
| 8pt spacing (`--space-*`) | **4px ladder `--s1`–`--s9`** (4/8/16/24/32/48/64/96/128) — the whole site was snapped to it Aug 2026 |
| `--text-*` scale | `--fs-hero`…`--fs-sm` clamp() scale |
| Space Grotesk/Inter Variable self-hosted | Google Fonts today; self-hosting is an open item (files in `_fonts/`) |
| focus ring 2px | 3px + offset (exceeds the minimum — keep) |
| `::selection` amber-300 | cobalt/white (keep) |
| dark-mode role flip | **site is light-only by decision** (`color-scheme: light`) — dark tokens dormant |

§3's *structure* is adopted where the site needs it: when a new tone is required,
mint it as a ramp-consistent token (navy-800-equivalent etc.) rather than an ad-hoc
hex. §4's contrast table is correct and binding — with the live-value note that
amber-on-light text failures here involve `--amber` (2.0:1) and `--amber-deep`
(2.6:1); the accessible amber for text on light is `#B45309` (`--amber-text`).

## Corrections to the brief's facts

1. **§2 prices: SEO retainers are £300–£1,350/mo** (Local Foundation £300, Growth
   £750, Competitive £1,350 — set 21 Aug 2026). The £450–£1,500 range in Part II is
   outdated. Strategy day rate £450 unchanged.
2. **§12 "trailing empty `<img>`" is a false positive** — it is the lightbox shell
   in `layout.html`, populated by JS on open. Do not "fix" it.
3. §12's remaining items are genuine and open: domain email (decision pending),
   outcome metrics + testimonial (needs client conversation), the illustrative
   "5.0 · 41 reviews" widget labelling, case-study depth.

## House rules the brief doesn't know about

- **Never mention the defence sector / RBSL.** Removed 21 Aug 2026, permanently.
- Credential wording: "Level 4 Associate Project Manager" — no "APM" prefix, no
  "Distinction".
- Talon Insights is the full-time business — no "day job" framing.
- Stack wording in copy: "Supabase", never "Postgres"/"Neon".
- **No new demo examples built on David Jackson & Son or WulfTek** — both overused.
  (Their existing case-study material on `/work` stays.)
- Section heads centre over full-width content (`.sec-head--mid`); left-aligned
  heads only on `.split` sections with a sticky aside.
- Every service page performs its product — the signature moment is a working
  object, not an illustration. Established grammar (see `/groundwork`): one breath
  line, one signature moment, one seam-crossing object, falcon motif, density
  rhythm rich/sparse alternation.
- Photo set is over-compressed at source (0.03–0.13 bpp); re-encoding cannot fix
  it. Blocked on original photographs — don't burn time on CSS "fixes".

---

# Part II — The master brief (adopted 25 Aug 2026)

*§2 prices corrected as noted above; otherwise verbatim.*

# 0. How to use this file

Read sections 1–2 before writing any code. Pull the rest on demand:
- Building a **page** → §7 blueprints
- Building a **section** → §5 text elements, §6 graphics
- Building a **hero / visual effect** → §10 techniques, §9 repos
- **Finishing** anything → §11 verification gate

Three rules govern every task: **use only tokens from §3, name the technique before building it, and screenshot before claiming done.**

---

# 1. Non-negotiables

1. **Never invent a colour, spacing value, font size or radius.** Everything comes from §3. If a token doesn't exist, propose one and wait.
2. **Screenshot before claiming completion.** 1440×900 and 390×844. "It should look like X" is not acceptable; "here's what it looks like" is.
3. **Motion is opt-in.** Base styles static; animation added inside `@media (prefers-reduced-motion: no-preference)`, never removed by it.
4. **Visible keyboard focus everywhere.** 2px ring minimum, `outline-offset: 2px`. Never `outline: none` without a replacement.
5. **Zero layout shift.** Explicit `width`/`height` or `aspect-ratio` on every media element.
6. **The LCP element is the headline**, never a canvas or hero image. Effects render behind text and must not block it.
7. **No lorem ipsum, ever** — not even temporarily. Real copy or a `TODO:` that fails the build.
8. **No AI-generated imagery.** Real screenshots, real photos, vector diagrams only. (Evidence: 31% of consumers trust a brand *less* on seeing visible AI marketing content vs 7% more — Klaviyo/Datalily, 8,000 respondents.)

---

# 2. What this brand is

Solo web + software consultancy, Telford. Sells bespoke sites (£1,500–£6,000), custom software (£6,000–£25,000), SEO retainers (£300–£1,350/mo) to local SMEs. Primary CTA: **Book a free Groundwork Visit**.

The site is the portfolio. Every detail is being judged as a work sample. Craft failures cost real money here.

Voice: sentence case, active voice, plain verbs, no filler. Buttons name what happens ("Book a Groundwork Visit", not "Submit").

---

# 3. Token structure (reference — canonical values live in `assets/styles.css`)

Role model for ramps and semantic tokens. When the site needs a tone that doesn't
exist, mint it consistently with this structure and the shipped brand values
(navy `#0B1F3A`, cobalt `#2563EB`, amber `#F5A623`, paper `#F7F8FA`):

- **Navy ramp** for elevation on dark: base → card → popover get *lighter*.
- **Cobalt** = links, focus, interactive state. On navy grounds use a lightened
  cobalt (`#60A5FA`-class) for text.
- **Amber** = the single action accent. For *text on light*, use `--amber-text
  #B45309`; brand amber on light is fills/large display only.
- **Neutrals tinted toward navy** — never pure `#000`/`#FFF` for text/grounds.
- **Semantic states** (success/warning/error) visually distinct from brand amber —
  warning is olive-shifted.

---

# 4. Colour rules

**Role discipline.** Navy = base. Cobalt = links, focus, interactive state. Amber = the *single* action accent, CTAs only. If both accents are shouting in one viewport, one is wrong. Restraint is the mechanism behind "premium" — Linear runs near-black plus one accent; Vercel is two colours plus a grey ramp.

**Contrast traps — the two combinations the brand naturally pushes toward, and both fail:**

| Pairing | Ratio | Verdict |
|---|---|---|
| White on navy `#0B1F3A` | ~16.5:1 | Excellent |
| Amber `#F5A623` on navy | ~8.2:1 | Passes AA all text |
| **Cobalt `#2563EB` on navy** | **~3.2:1** | **Fails AA body — use a `#60A5FA`-class light cobalt** |
| **Amber `#F5A623` on white** | **~2.0:1** | **Fails badly — use `#B45309` for text on light** |

Brand amber on light grounds is for large display, icons and fills only.

**Verify with APCA as well as WCAG.** WCAG 2.x overstates contrast on deep navy — 4.5:1 can be functionally unreadable near black. Target ~Lc 75 body, Lc 90 preferred.

**WCAG 2.2** adds 2.4.11 Focus Not Obscured and 2.4.13 Focus Appearance: ≥3:1 change-of-contrast, ≥2px perimeter.

**Elevation by lightness, not shadow.** Drop shadows disappear on navy. Higher surfaces get lighter, plus a light hairline border. Soft cobalt/amber radial glows work where shadows don't.

**Colour psychology is mostly folklore.** The one defensible finding (Labrecque & Milne 2012, *JAMS* 40:711–727) is that blue correlates with perceived competence — but indirectly, via brand personality, and saturation matters as much as hue. Navy earns trust through craft and proof, not hue. Don't lean on it.

---

# 5. Typography & text-as-graphic

**Pairing.** Space Grotesk display only (`letter-spacing: -0.02em`, tighter still at the largest sizes). Inter body. Space Grotesk has monospace DNA — excellent in headlines, tiring in long copy. Body measure 60–75ch, line-height 1.5.

**Go bigger than comfortable on hero headlines.** When the palette is restrained, type *is* the design.

Use `font-variant-numeric: tabular-nums` on any metrics.

**Formatted text elements are graphic objects.** Treat them as design components:

- **Eyebrow + headline + deck + CTA = one perceived unit** that balances against the graphic across a feature row.
- **Stat / big-number blocks** — huge numeral (Space Grotesk, 3–4rem) + small uppercase Inter label. These read as *graphics*, not text.
- **Pull quotes** — 1.5–2.5× body, ≤5 lines. On a case study with no image available, a client quote in large Space Grotesk on a navy band *is* the graphic.
- **Lists** — 3–7 items. Beyond that, or when each item has a heading + description, convert to cards or a table. Prefer the `.spec` `<dl>` sheet and prose over bare bullets.
- **Callouts** — low-opacity cobalt/amber wash + 3–4px accent left border. Never full-saturation fill; it competes with CTAs.
- **Inline links** — ~1 per 40–60 words in prose. Denser than that and the paragraph's grey value speckles.
- **Bold** — no more than ~30% of a passage (NN/G). Bold the phrase carrying the claim, not the sentence.
- **Dividers** — prefer whitespace and background-band changes. A hard rule signals "finished" and stops the scroll.
- **Drop caps** — craft on a long article, affectation on a service page.
- **Typographic colour** — squint at a text block; it's a shape. Break it with subheads, a pull quote and a stat block so it isn't one heavy grey rectangle.

---

# 6. Graphics

**Match graphic type to job:**
| Job | Graphic |
|---|---|
| Prove a result | Annotated UI screenshots + stat blocks |
| Explain a process | SVG step diagram / flowchart |
| Build trust | Founder photo, client logos, testimonials |
| Show craft | Zoomed detail crops, partial-bleed screenshots |

**Constraint: no photography budget.** Available real imagery = product/UI screenshots and founder photos. Work with that:

- Capture screenshots at **2×**; frame in clean browser/laptop chrome, **one device generation only** (mixed generations date a design instantly).
- **Partial-bleed** — let the screenshot run off the right or bottom edge to imply more.
- **Stack** two screenshots with offset + soft shadow.
- **Outer glow** on navy grounds to lift the image off the surface; 1px light border minimum.
- **Annotated callouts** — thin amber leader line to the claim.
- **Zoomed detail crops** show craft better than full-page shots.
- **SVG process diagrams** substitute for photography. Inline SVG: crisp, themeable, accessible, weightless. Include document-style marginalia where it fits the story (see the `/groundwork` specimen: sketched flow, marked-up bars, highlighter pass, milestone strip).

**Composition:**
- **One dominant graphic per viewport.** Multiple competing graphics = no hierarchy.
- **Proximity beats everything.** A caption must be visibly closer to its own graphic than to neighbours. 8px within a figure unit, 48–96px between units.
- **Alternate (zig-zag) feature rows**, then *break the pattern* for the single most important section.
- **Text beside screenshots, not over them.** Screenshots are visually busy. Overlay only on abstract/gradient grounds you control, and then with a scrim hitting 4.5:1 body / 3:1 large.
- **Gutter** between text column and graphic: 48–64px desktop.
- **Captions out-read body copy** (Ogilvy: ~2× readership; Poynter: ~16% more). Caption substantive images with a claim or metric, not a description. Not every graphic needs one.
- **Scanning:** Z-pattern for the hero; **layer-cake** for content below. The F-pattern is a failure state that emerges when content lacks structure — strong descriptive H2s prevent it.

---

# 7. Per-page blueprints

Ratio shifts down the funnel: **top-of-funnel = shorter and more visual; bottom-of-funnel = longer and more textual, punctuated by proof.** For high-ticket B2B (£1.5k–£25k, cold traffic), long-form beats short-form — but only if every scroll-length alternates a text idea with a visual anchor.

| Page | Words | Sections | Substantive visuals | Text:visual | Signature graphic |
|---|---|---|---|---|---|
| Homepage | 1,200–1,800 | 7–9 | 6–9 | ~55/45 | Hero anchor + stat band + screenshot |
| Service | 800–1,500 | 5–7 | 4–6 | ~65/35 | Process diagram + annotated crops |
| Case study | 800–1,400 | 6–9 | 6–10 | ~50/50 | Above-fold stat strip + screenshot arc |
| Work index | ≤150 intro | grid | 1/project | visual-led | Card thumbnails |
| About (solo) | 500–800 | 4–6 | 3–5 | ~60/40 | Founder photo + credential row |
| Contact | ≤300 | 1–2 | 0–1 | form-led | Optional map |
| Pricing | 600–1,200 | 3–5 | 1–2 | ~75/25 | Comparison table as hero object |
| Blog | 1,000+ | many | 1 per ~300 words | long-form | Diagrams, pull quotes, code |
| Local landing | 500–900 | 4–6 | 2–4 | ~60/40 | Local proof, bespoke device per place |

**Homepage sequence:** Hero (Z-pattern, one anchor graphic) → outcomes → problem cards → services → differentiator + founder photo → **stat band** → selected work + metrics → process diagram → about → final CTA.

**Case study structure** (the highest-ROI page type):
1. Client + context 2. Challenge in their words 3. Approach 4. **≥3 quantified outcomes** 5. Named client quote + role 6. Before/after visuals 7. CTA.

**About, solo operator:** use "I". Founder photo, credential/stat row (Level 4 Associate Project Manager, years, projects delivered), methodology diagram, timeline. 500–800 words.

**Pricing:** publish "from" figures. Removes sticker shock, pre-qualifies leads, reinforces the "the number never moves quietly" promise. "Final price fixed after the Groundwork Visit."

**CTA discipline:** single primary CTA per viewport; amber dominant, secondary as ghost button. Repeat the primary CTA roughly every scroll-length.

---

# 8. Rhythm, responsive, performance

**Pacing.** Alternate section backgrounds in deliberate passages (light passage → navy pause → light passage → navy close), not zebra stripes. Accent roughly 1 in 5 sections. Max two consecutive text-only sections. One idea per section. Vary column counts rather than repeating a grid. Avoid both wall-of-text and wall-of-cards. Grammar per page: one breath line, one signature moment, one seam-crossing object, density rhythm enforced (no three consecutive sections at the same density).

**Responsive.** Feature/hero pairs stack **image above text** (image gives instant context). Text-led explanatory blocks stack **text above image**. Control via `order`. Stat blocks → 2×2 or single column. Wide diagrams → horizontally scrollable or a simplified mobile SVG. Mobile scroll depth is shallower: front-load message and proof.

**Performance targets (75th percentile, real users):** LCP ≤2.5s, INP ≤200ms, CLS ≤0.1. Only ~48% of mobile origins pass all three — a real differentiator for a firm selling fast sites.

**Never `loading="lazy"` on the LCP image.** Use `fetchpriority="high"` and eager-load. Lazy-load everything below the fold. Explicit dimensions everywhere.

**Alt text.** Informative → concise description (≤125 chars). Decorative (the falcon, dividers) → `alt=""`. Functional (logo-as-link) → describe the destination. Complex (configurator, data viz) → short alt + nearby long description. Never text-in-images.

**SEO.** Descriptive filenames. `ProfessionalService`/`LocalBusiness` schema (shipped). Local landing pages must not be near-duplicates.

---

# 9. Reference material

`refs/` may hold screenshots to compare against (Stripe hero, Linear elevation,
Vercel spacing, current pages). Comparison prompts should be specific and
checkable: "the gutter in refs/vercel-spacing.png is roughly 3× ours — match that
proportion."

External component libraries and WebGL shader packages are **not** in play unless
Talon decides to pivot the stack — see Part I. Icons: if an icon set is ever
needed, one set, one stroke weight.

---

# 10. Technique recipes (dependency-free implementations)

Name the technique; never describe the vibe. "Make it look like Stripe" produces three `linear-gradient()`s.

| Effect | What it actually is here |
|---|---|
| Expensive non-banded colour | CSS radial washes + SVG `feTurbulence` grain at 3–6% opacity |
| Skewed section divider | `transform: skewY(-8deg)` on a `::before`; content unskewed |
| Crisp product mockup | Real DOM in `perspective` + `rotate3d`, not a PNG |
| Scroll choreography | IntersectionObserver + CSS transitions, liveness-guarded failsafe (see `/groundwork` in `site.js`) |
| Layered illustration | Inline SVG with masked/clipped reveals |
| Depth on navy | Lighter surface + hairline border + radial glow. **Not** drop shadow |
| Document artefact | Layered sheets (pseudo-elements), specimen stamp, SVG marginalia, highlighter gradient |

**Prompt shape that works:** name the technique, the tokens, the constraints
(static fallback, LCP, CLS), and the verification (screenshot both breakpoints).

---

# 11. Verification gate

Before calling any visual task complete:

1. `python build.py` — clean, and the committed HTML diff reviewed.
2. Browser-pane screenshots at desktop and mobile widths, actually looked at.
3. Console clean; no horizontal scrollbar; reveal/choreography exercised.
4. Contrast spot-check on any new colour pairing (WCAG + APCA sense-check).
5. `prefers-reduced-motion` path confirmed static and complete.
6. PageSpeed Insights on the affected template when structure changed materially.

---

# 12. Known outstanding issues

- **Footer/schema email is a gmail.com address** — switch to a domain address
  (IONOS Mail Basic already on the domain). Decision pending with Talon.
- **No real client outcome metrics anywhere.** The visible "5.0 · 41 reviews / 1st"
  is illustrative demo UI labelled "Your business" — label it unmistakably as a
  mock or replace with real results.
- **No testimonials or pull quotes.** Zero third-party voice. Needs the client
  conversation (David Jackson quote + outcome figures).
- **Case studies exist only as `/work` sections**, not standalone pages — held
  deliberately: no new DJ&S/WulfTek prominence; Founding Projects will supply the
  next case studies.
- **Amber-on-light small-text contrast failures** (`.field .req`, blog `.postmeta`)
  — fix with `--amber-text`.
- Local landing pages are near-duplicate skeletons — rebuild queued, bespoke
  device per place.
- Photo originals needed before any image-quality work (see Part I).

---

# 13. Division of labour

Claude Code is excellent at **implementation** — SVG, transforms, animation timing, token plumbing. It is mediocre at **art direction** — what belongs on the page, what the signature element is, when to stop.

Talon directs. Claude Code builds. Don't outsource the decisions.

And the ordering that matters: **a beautiful hero above an unquantified case study is a worse site than a plain hero above a proven one.** Metrics, screenshots and testimonials before shaders. Every time.
