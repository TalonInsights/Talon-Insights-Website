# Talon Insights — homepage rebuild

**The authority for everything on this page is
[docs/homepage-master-build-v3.5.md](docs/homepage-master-build-v3.5.md).**
Where an instinct and that document disagree, the document wins; where it is
silent, its §9 Never List decides. Read it before changing copy, colour,
motion, or layout. The old Python-generated site was wiped 26 Aug 2026 at the
owner's instruction (recover anything via git history, pre-wipe).

## Stack and commands

Astro 5 (static) + React 19 islands (exactly three: DirectionsDemo,
CoverageMap, BookingForm) + Tailwind v4 tokens in `src/styles/theme.css`.
Deploys GitHub → Vercel on push to main; `vercel.json` sets framework/build.

```bash
npm run dev        # dev server (PORT env respected)
npm run build      # production build to dist/
npm run map        # regenerate src/data/map-dots.json (network; result is committed)
```

## Rules that are easy to trip over

- **Amber budget:** exactly six at-rest appearances of `--color-amber` —
  hero ◆ + ●, the two process chips, the directions-artefact ◆ in the
  Directions band's eyebrow, the fault-list payoff rule. The form success line is a transient
  state, outside the count. The B10 map's markers use the separate
  `--color-amber-lift` token, exempted by the owner's 26-Aug B10 restyle
  directive (canvas + its legend swatches only).
- **"Bespoke" appears once** on the page (hero eyebrow) — the owner reworded
  the B5 header and B8 column to stay under the Never List's cap.
- **No `style=""` attributes in server-rendered markup.** The CSP is emitted
  by Astro (`experimental.csp` meta tag, per-build script hashes), and hashes
  neutralise `unsafe-inline` for styles. Static geometry lives in
  stylesheets (see the plan panel's nth-child rules); dynamic values go
  through the CSSOM (React style props / `el.style`), which CSP allows.
- **Motion budget: three orchestrated moments** — hero plan bars (load),
  process bars (scroll-in), and the B10 coverage-map travel (scroll-in,
  once, ≤1600ms; owner's 26-Aug directive supersedes v3.5's static map).
  Nothing loops or idles.
- **IO/rAF fallbacks are load-bearing.** Reveals arm only below the fold and
  a 2.5s failsafe shows everything; the coverflow settle has a 400ms
  jump-to-target backstop; the map has an IO watchdog and a travel-phase
  rAF backstop that land its final state. Browsers that don't composite
  (embedded panes, background tabs) never fire IO or rAF — don't remove
  these.
- **Gated content ships absent, never faked** (§8): the B4 workshop photo,
  Harry quote, WulfTek vignette (copy is final in the spec, gated on
  consent), B9 photo (needs consent + crop + barcode retouch), and the
  planner capture are all omitted until real. No placeholders, no stock, no
  AI imagery, no paraphrased quotes.
- The Wrekin Forge comps (`src/components/directions/comps.tsx`) are exempt
  from the token system by design — that exemption extends no further.

## Open slots (owner-held)

Formspree endpoint → `ENDPOINT` in `src/components/BookingForm.tsx` (until
then the form validates but reports itself unconnected). `hello@`
mailbox on the domain. Diatype licence (fallback fonts are live). P1/P2
photos, Q1 quote, W1 nod, V1 capture per §12. Other routes
(/work/david-jackson-son, /founding-projects, /privacy, /accessibility,
/terms) are linked but intentionally unbuilt.
