# Talon Insights — homepage rebuild

**The authority for everything on this page is
[docs/homepage-master-build-v3.5.md](docs/homepage-master-build-v3.5.md).**
Where an instinct and that document disagree, the document wins; where it is
silent, its §9 Never List decides. Read it before changing copy, colour,
motion, or layout — noting that the owner has since restyled B1 (27 Aug pm: left-aligned
Linear-style hero with the WulfTek homepage as an angled real-work
showcase shot; earlier that day: centred, no plan panel), B5 (folder
gallery) and B10 (travel map) by direct instruction, which supersedes
the document for those blocks. The old
Python-generated site was wiped 26 Aug 2026 at the owner's instruction
(recover anything via git history, pre-wipe).

## Stack and commands

Astro 5 (static) + React 19 islands (exactly three: FolderGallery,
CoverageMap, BookingForm) + Tailwind v4 tokens in `src/styles/theme.css`.
framer-motion powers only the FolderGallery (owner-approved 21st import #5)
and three.js only the FIRE hero page behind Direction A (import #6,
lazy-loaded chunk — never in the homepage bundle); everything else stays
library-free.
Deploys GitHub → Vercel on push to main; `vercel.json` sets framework/build.

```bash
npm run dev        # dev server (PORT env respected)
npm run build      # production build to dist/
npm run map        # regenerate src/data/map-dots.json (network; result is committed)
```

## Rules that are easy to trip over

- **Amber budget:** the at-rest appearances of `--color-amber` are now
  TWO — the process chips. The directions-artefact ◆ retired with the
  STEP 03 eyebrow (27 Aug night, owner's deletion). The hero's ◆ + ● retired with the delivery
  panel (27 Aug am) and the fault-list payoff rule went cobalt with the
  owner's infographic restage of B3 (27 Aug pm). The form success line is
  a transient state, outside the count. The B10 map's markers use the separate
  `--color-amber-lift` token, exempted by the owner's 26-Aug B10 restyle
  directive (canvas + its legend swatches only).
- **"Bespoke" appears once** on the page (hero eyebrow) — the owner reworded
  the B5 header and B8 column to stay under the Never List's cap.
- **No `style=""` attributes in server-rendered markup.** The CSP is emitted
  by Astro (`experimental.csp` meta tag, per-build script hashes), and hashes
  neutralise `unsafe-inline` for styles. Static geometry lives in
  stylesheets (see the plan panel's nth-child rules); dynamic values go
  through the CSSOM (React style props / `el.style`), which CSP allows.
- **B5's folder gallery** (26 Aug, owner-supplied 21st import) replaced the
  coverflow: the three Wrekin Forge comps live in a folder — click to open,
  drag a card down (or Escape / the hint button) to close; tapping an open
  design enlarges it to 3/4 of the screen over a flat ink scrim and back
  (Escape collapses first, closes second). Its chrome was
  stripped to tokens; the comps render live inside the cards, never as
  screenshots, and the Unsplash defaults were discarded (CSP allows only
  self-hosted images anyway).
- **The Wrekin Forge directions must survive a tradesman reading them**
  (27 Aug, owner's accuracy review). Every figure and standard on those
  pages is checkable and was corrected once already: handrail 1 100 mm for
  level guarding, BS 6180's 0.74/1.5 kN/m pair, `EN 1090-1 · EXC2 · UKCA`
  (not "EN 1090 / CE" — UKCA is the GB regime), a stated substrate and
  galvanising spec, ±1 mm on fabrication (a 0.5 mm claim loses to thermal
  movement across a 3.2 m run). On the heritage page: *jointing*, not
  joinery; MIG is what a smith avoids, not welding as such; listed-building
  consent is the owner's application, so the forge supplies the drawings for
  it. Never invent a number on these pages to make a layout feel precise.
- **The three directions must differ below the paint.** Direction B carries
  its own letterpress wordmark (no WF monogram — that mark is C's) and sets
  its micro-type as serif small caps where C uses spaced mono. A direction
  that shares an identity and a label treatment reads as one template
  repainted, which is the opposite of what the folder demonstrates.
  `#fire`, `#heritage` and `#arch` deep-link straight into each page.
- **Each direction page is a fixed-height flex column.** Adding content does
  not overflow it — it silently squashes the shrinkable children (the SVGs
  letterbox, block content clips under `overflow: hidden`). After any content
  change, set `flex-shrink: 0` on every stage child and check rendered
  heights still equal natural heights.
- **Motion budget: two orchestrated moments** — process bars (scroll-in)
  and the B10 coverage-map travel (scroll-in, once, ≤1600ms). The hero's
  plan-bar draw retired with the panel (27 Aug); the hero is fully static.
  Nothing loops or idles — EXCEPT the B3 fault board's icon micro-motion
  (27 Aug pm, owner's explicit directive: "the icons aren't moving"):
  slow CSS idles that quicken on card hover, all killed under
  prefers-reduced-motion. And the hero gained a one-time load overture
  (27 Aug pm, owner-supplied 21st import): a CSS 3D laptop tumbles once,
  lands open with the WulfTek page on its screen, and hands off to the
  showcase panel — ~6s, runs once per load, never loops; reduced motion
  and stacked layouts skip straight to the panel. Those carve-outs
  extend no further.
- **IO/rAF fallbacks are load-bearing.** Reveals arm only below the fold and
  a 2.5s failsafe shows everything; the map has an IO watchdog and a
  travel-phase rAF backstop that land its final state. (The folder gallery's
  springs are framer-driven and resume with tab visibility - no backstop
  needed, worst case is a mid-pose frame on return.) Browsers that don't composite
  (embedded panes, background tabs) never fire IO or rAF — don't remove
  these.
- **Gated content ships absent, never faked** (§8): the B4 workshop photo,
  Harry quote, WulfTek vignette (copy is final in the spec, gated on
  consent), and the planner capture are all omitted until real. No
  placeholders, no stock, no AI imagery, no paraphrased quotes. The B9
  photo gate closed 27 Aug: the owner supplied his own portrait
  (`talon-portrait.webp`, 640px native — replace under the same filename
  if a sharper export arrives).
- The Wrekin Forge comps (`src/components/directions/comps.tsx`) are exempt
  from the token system by design — that exemption extends no further.

## Open slots (owner-held)

Formspree endpoint → `ENDPOINT` in `src/components/BookingForm.tsx` (until
then the form validates but reports itself unconnected). `hello@`
mailbox on the domain. Diatype licence (fallback fonts are live). P1/P2
photos, Q1 quote, W1 nod, V1 capture per §12. Other routes
(/work/david-jackson-son, /founding-projects, /privacy, /accessibility,
/terms) are linked but intentionally unbuilt.
