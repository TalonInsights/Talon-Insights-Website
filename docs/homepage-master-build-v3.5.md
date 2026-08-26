# Talon Insights — Homepage Master Build Document

**Version** 3.5 FINAL · **Date** 26 Aug 2026 · **Change log:** 3.1 swapped the interactive centrepiece to the Directions demo. 3.2 consolidates sourcing (imports + assets manifests), assigns both photographs, records the Wrekin Forge name check, and closes all defaulted decisions. Nothing in this document is left to the builder's discretion: every import has a search query, every asset has a path or a named owner, every open item has a status. 3.3 adds the Word Survey — a named stage of the website process — threaded through method, services, process, pricing and the case-study block, with the WulfTek vignette staged behind a consent gate. 3.4 sets the final hero (H1 “You're a specialist. Your website isn't.” + engaging standfirst) and removes trade-exclusive location language site-wide. 3.5 removes the map client arcs (both clients within 5km of base) — the map now shows coverage only, and the motion budget drops to two moments.
**Purpose:** hand this to Claude Code and get the envisioned page, exactly.
This document is self-contained: it supersedes and folds in the design spec, the v2
scope, and all vetted changes. Where an agent's instinct and this document disagree,
this document wins. Where this document is silent, the Never List decides.

---

## 0. What the page must communicate

One sentence, which every block serves:

> **You're a specialist. Your website isn't. I go and find what makes you different —
> repeatedly, in person — then you and I shape the site from what's actually there,
> and you own it outright.**

The buyer: a specialist with taste, sick of templates and AI-generated sameness, who
wants a real say without the labour. The page must feel *precise, documented, and made
by one particular person* — never generic, never decorated, never corporate.

---

## 1. Stack

- **Astro 5**, static output. React 19 islands for exactly three components:
  `DirectionsDemo`, `CoverageMap`, `BookingForm`. Everything else is `.astro` + CSS.
- **Tailwind v4**, tokens in `@theme`. **No arbitrary values** (`bg-[#...]`) anywhere;
  a needed value becomes a token first.
- **21st catalog — four imports only**, specified fully in §7 (Imports & Sourcing
  Manifest) with exact search queries and keep/strip lists. Import nothing else.
- **Fonts:** primary = ABC Diatype + ABC Diatype Mono, licensed webfonts from Dinamo
  (abcdinamo.com), self-hosted `woff2` in `/public/fonts/` — never a third-party font
  CDN for the licensed faces. Until the licence is purchased: Instrument Sans +
  Martian Mono from Google Fonts (`preconnect` + `display=swap`). The swap is two
  lines in `theme.css`; build against the fallbacks without waiting. Strip every icon, colour,
  font, shadow, radius and transition from each on arrival; re-apply from tokens.
- Deploy: GitHub → Vercel.

## 2. Tokens

```css
@theme {
  --color-ink:      #0B1F3A;  /* text, dark grounds */
  --color-sheet:    #F5F7F9;  /* page ground — cool, never warm */
  --color-white:    #FFFFFF;  /* panels */
  --color-graphite: #5A6675;  /* secondary text */
  --color-cobalt:   #1D4ED8;  /* links, bars, focus, base marker */
  --color-amber:    #E8A33D;  /* RESTRICTED: choice + ownership marks only */
  --color-breach:   #C2412D;  /* scheduler demo UI only */
  --font-sans: "ABC Diatype", "Instrument Sans", system-ui, sans-serif;
  --font-mono: "ABC Diatype Mono", "Martian Mono", ui-monospace, monospace;
  --radius: 4px;
  --shadow-card: 0 1px 2px rgb(11 31 58 / .05), 0 8px 24px rgb(11 31 58 / .06);
  --ease: cubic-bezier(.22,.61,.36,1);
}
```

Derived rules:
- Hairlines: `1px solid rgb(90 102 117 / .16)` on light; `rgb(245 247 249 / .14)` on ink.
- Amber may appear at most **five times** on the page: hero ◆ and ●, process chips ×2,
  directions-artefact ◆, fault-list payoff rule. Never as a large fill, never on a
  primary CTA, never decoratively.
- Nested radius: inner = outer − padding; an element inside a 4px card uses 2px.
- Shadows only on `.plan-panel` and `.direction-artefact`. Nothing else casts one.

## 3. Typography

| Role | Spec |
|---|---|
| Display | `clamp(2.75rem, 6vw, 4.5rem)` · 500 · tracking −0.02em · leading 1.08 |
| H2 | `clamp(2rem, 4vw, 2.75rem)` · 500 · −0.015em |
| H3 | 1.375rem · 500 |
| Body | 1.0625rem · 400 · leading 1.65 · max measure 34em |
| Mono utility | 0.8125rem · 400 · +0.04em · UPPERCASE · `font-variant-numeric: tabular-nums` |
| Mono micro | 0.6875rem · same rules — panel labels, chips, captions |

Non-negotiables:
- All numerals in mono contexts are **tabular** — prices, dates, and plan labels must
  align vertically.
- On dark grounds (`--color-ink` sections) body weight drops to 350 (or nearest
  available) and text colours lift: body `rgb(245 247 249 / .65)`, headings `--color-sheet`.
- Headlines: `&nbsp;` between the final two words at every size. No orphans, ever.
- Space above any heading ≈ 2× the space below it.
- Mono set 1px larger than sans when inline beside it (optical size match).

## 4. Layout system

- Container: 1180px max, 24px side padding.
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128. Nothing off-scale.
- Section vertical padding **varies by design**: stated per block below. Do not equalise.
- Breakpoints: 360 (floor) / 640 / 768 / 900 / 1024 / 1180.
- Grounds alternate per the block list — this alternation is the page's pulse; keep it.

## 5. Motion

Global easing `--ease`. Three orchestrated moments, everything else is quiet:

1. **Hero plan bars** draw on load: `transform: scaleX(0→1)`, origin left, 450ms each,
   60ms stagger, markers fade in at +550ms. Total < 700ms. Runs once.
2. **Process bars** draw on first scroll-in (IntersectionObserver, threshold .3). Once.
*(A third moment — map arcs — was removed in v3.5; the coverage map renders static.)*

Reveals elsewhere: opacity + 14px translateY, 500ms, threshold .15, once. Hovers change
**exactly one property** (border-colour or text-colour), 180ms. Nothing loops, lifts,
scales, parallaxes or floats. `prefers-reduced-motion: reduce` renders every animated
state at its final frame with zero transitions.

Zero layout shift: `.plan-panel`, the map canvas and the demo reserve their space
before render.

---

## 6. The page, block by block

Order: Header · B1 Hero · B2 Proof · B3 Faults · B4 Method · B5 Services ·
B6 Case study + demo · B7 Process · B8 Pricing · B9 About · B10 Map · B11 Close · Footer.

All copy below is **verbatim final** unless marked [slot].

---

### Header — sticky

68px, `--color-sheet` at 85% + backdrop blur, bottom hairline. Left: falcon mark (26px)
+ wordmark **Talon*Insights*** (Insights italic). Centre-right nav: Work · Approach ·
Pricing · About. Right: primary button `Book a visit`. Nav hides <820px (button remains;
no hamburger on the homepage — every nav target is on this page).

### B1 — Hero

Ground: `--color-sheet` → `--color-white` vertical wash (the only gradient on the site).
Padding: 128px top / 80px bottom desktop, scaling down via clamp. Grid 5/7, 72px gutter,
vertically centred. Below 1024px: single column, panel below CTAs.

**Left column:**
- Eyebrow (mono micro, graphite): `BESPOKE WEBSITES & SOFTWARE · TELFORD`
  *(Defaulted decision D1: the eyebrow does the categorising so the headline can keep
  its positioning; simulation showed cold traffic needs 3-second category confirmation.
  Revert to `TELFORD · SHROPSHIRE · WEST MIDLANDS` only on explicit instruction.)*
- H1: `You're a specialist. Your website isn't.`
  Set on two lines, the break after "specialist." — the turn is the point, and the
  second sentence must land on its own line at every breakpoint. Apostrophes are
  typographic (’), never straight.
- Standfirst (lede, graphite, max 2 lines): `The reason people choose you already
  exists. It's just not on the page.`
  Apostrophes typographic (’). The two sentences may sit on one line or two; never
  break mid-sentence. This line engages rather than explains — the method is deliberately
  held back for B4, and B4's promise is set up here.
- CTAs: primary `See how I work` → #method · ghost `See the work` → #work

**Right column — the plan panel (hand-built, signature element #1):**
White panel, hairline border, 4px radius, `--shadow-card`, 28px padding.
- Header row, hairline beneath: mono micro `DELIVERY PLAN` left · `REV A` right (graphite).
- Five rows, `grid-template-columns: 150px 1fr`, 13px row gap. Labels mono micro,
  number bold-ink, text graphite:

| Label | Bar left | Bar width | Marker |
|---|---|---|---|
| `01 VISITS` | 0% | 12% | — |
| `02 WHAT I FOUND` | 12% | 14% | — |
| `03 DIRECTIONS` | 26% | 13% | ◆ `YOU CHOOSE` at 41%, amber |
| `04 BUILD` | 39% | 44% | — |
| `05 YOURS` | 83% | 12% | ● `YOU OWN IT` at 97%, amber |

Bars 10px tall, 2px radius, cobalt. Markers: 9px amber square rotated 45° (◆) / 9px
amber circle (●), mono 10px label beside; label text hides <520px, shape remains.
- Footer row, hairline above, mono micro graphite:
  `FIXED PRICE · WRITTEN SCOPE · YOU OWN EVERYTHING`

**Accept:** legible at 360px; draw completes <700ms; H1 never orphans; panel space
reserved pre-render.

### B2 — Proof strip

Ground `--color-white`, hairlines top+bottom, 26px padding. One wrapping row, baseline-aligned:
mono eyebrow `DELIVERED FOR` · **David Jackson & Son** · **WulfTek Tuning** ·
mono eyebrow `ONE PERSON, START TO FINISH`.
The PM credential does **not** appear here (vetted out — it lives in B9).

### B3 — The fault list

Ground `--color-ink`. Padding 120px. Dark-ground type rules apply.

- Eyebrow: `WHY PEOPLE CALL ME`
- H2: `You've probably been let down by one of these.`
- Lede: `Every one of them is avoidable. Most of them are why I work the way I do.`

**Fault 07 first, full width,** set apart (larger H3, more air, hairline beneath):
> `FAULT 07` — **Approval, not involvement.**
> You were shown one mockup near the end and asked to sign it off. That's not being
> involved — that's being consulted.

Then six in two columns (right column offset 56px down for the staggered rhythm;
single column <768px, offset removed):

> `FAULT 01` — **The bait and switch.** A senior person sells you the job, then a junior
> or offshore team builds it. You never speak to the seller again.
> `FAULT 02` — **Lock-in.** You don't own your domain, your code or your content.
> Leaving means starting from nothing — and everybody knows it.
> `FAULT 03` — **A pretty site that does nothing.** It looks smart and generates no
> enquiries, because nobody asked what the business needed first.
> `FAULT 04` — **No discovery.** Nobody came to see how you actually work. The quote was
> written from a ten-minute phone call and a guess.
> `FAULT 05` — **Vague quotes, moving numbers.** Everything you assumed was included
> turns out to be extra, and there's no written scope to point at.
> `FAULT 06` — **Support that vanishes.** It went live, then the emails stopped being
> answered.

Payoff, full width, hairline in `amber/40` above:
mono, amber, 500: `ALL SEVEN — DESIGNED OUT` · right-aligned link (sheet, hover amber):
`How every job runs →` #process

### B4 — The method *(centrepiece)*

Ground `--color-sheet`. Padding 120px. Grid 7/5: text left, photograph right
(**ASSET P2, pending** — Talon in David Jackson's workshop: at the bench, timber and
hands in frame, natural light, unposed, landscape. NOT a desk, NOT a meeting. Until P2
exists this block ships text-only at full width — never a stock or AI placeholder;
4px radius, hairline, no shadow when it lands). Photo stacks above text <900px.

- Eyebrow: `HOW THE DIFFERENCE GETS FOUND`
- H2: `A brief tells you what a business does. Not why anyone chooses them.`

Body, first person — the only first-person passage on the page:

> So before I design anything, I turn up. I've stood in David Jackson's workshop watching
> timber become something that ends up in listed buildings. I've been to events with
> WulfTek to hear what their customers actually say about them — not what the website says.
>
> That's where the difference lives, and it never comes out in a questionnaire. It comes
> out on the third visit, in something said offhand.
>
> Then we design from that. You see real directions before any code, you tell me what's
> wrong with them, and you can message me the moment you have a better idea — all the way
> through. It's just me, so there's nobody in between.

Beneath, three hairline-divided rows (`grid: 150px 1fr`, mono key + sans value):
`ON SITE` — Time where you work, at your events, with your customers
`THE WORD SURVEY` — The phrases your customers use that nobody's competing for
`DIRECTIONS FIRST` — Real options before any code — chosen by you
`OPEN LINE` — Message me during the build; ideas fold in as they come

Below the rows, the client's confirmation of the method — a pull quote, hairline above,
body-size sans in `--color-ink`, mono micro attribution:
> [slot: Harry's line about the visits — target register: "He came to the workshop
> before he showed me anything" / "He saw how we work before he wrote a word."]
> `HARRY JACKSON · DAVID JACKSON & SON`
Until the quote is obtained this element is omitted entirely — the block closes on the
three rows. **Never ship a paraphrase or a placeholder here**; an invented quote would
undo the page's whole claim to honesty.

### B5 — Services *(hierarchy, no grid, no import)*

Ground `--color-white`, top hairline. Padding 96px.
Eyebrow `WHAT I DO` · H2 `One thing above all. Three more, done properly.`

**Lead panel — full width.** White, hairline, 4px radius, no shadow. Internal 7/5.
Header row: mono `01 / BESPOKE WEBSITES` left · mono `FROM £3,000` right.
- H3: `Designed with you, not presented to you.`
- Body: `You see two or three real directions before a line of code is written — not one
  mockup to approve at the end. You tell me what's wrong with them. That's where the
  site starts to become yours. Then it gets built, and the line stays open the whole
  way: if you have a better idea in week three, I want to hear it.`
- Second short paragraph, hairline above, with its own mono micro label
  `INCLUDED — THE WORD SURVEY`: `Every site is built from the words your customers
  actually use — including the ones nobody in your area is competing for. Found on the
  visits, listed in your written scope, and built into the page from day one.`
- Footer row, hairline above: `Outcome` (mono micro) **A site nobody else could have**
  · link `See the work →` #work

Right side — **the Directions demo (island, signature #2, the page's interactive
centrepiece).** A small framed panel, 2px radius (nested-radius rule), containing three
live-rendered hero comps for one **demonstration business**: **Wrekin Forge** — a
fictional architectural metalworker (gates, railings, staircases, restoration ironwork).
Chosen because the trade flexes dramatically across registers while staying true to the
West Midlands craft world the real clients live in.

- `DIRECTION A — THE FIRE` dark ground, full-bleed forge imagery, bold condensed
  display, the making as spectacle
- `DIRECTION B — HERITAGE` warm paper ground, serif display, quiet — period ironwork
  and listed-building restoration register
- `DIRECTION C — ARCHITECTURAL` light, systematic, grid-led, spec-sheet precision —
  the product as engineered object

**The comps are exempt from the site's token system.** Each renders its own palette and
type — that is the demonstration. They remain bound by the Never List's honesty rules:
no fake people, no AI-generated photography; imagery is abstract/graphic treatment
(duotone texture, drawn ironwork motifs, type-led composition).

Mechanics — **21st import #4: the Ruixen coverflow carousel**, mechanics only. Keep
the drag/swipe physics, snap logic and 3D transforms; strip its shadows, radii, chrome
and styling on arrival. Configuration is strict:

- Flanking comps near-flat: rotation ≤ 8°, scale .92, opacity .55 — subtle depth,
  never iTunes wings. No direction may ever look like a lesser option at rest.
- Motion is user-initiated only: no auto-rotate, no idle drift. Swipe or tap → snap
  to centre → dead still. (User-initiated motion sits outside the page motion budget.)
- Three mono tabs (`A · B · C`) above the carousel do double duty as affordance and
  a11y: `role="tablist"`, arrow keys, tap-to-jump — all landing on the same state as
  a swipe. Reduced motion: crossfade instead of 3D travel.
- Beneath the active comp, a mono spec readout that updates on switch, e.g.
  `DIRECTION / THE FIRE · GROUND / DARK · REGISTER / BOLD`.

Comps are coded mini-layouts (HTML/CSS at ~⅓ scale inside the frame), **not
screenshots**. Preload all three; switching must be instant.

Beneath the frame, three mono micro lines (the third is a link):
`SAME FORGE. THREE DIFFERENT COMPANIES. NONE OF THEM WRONG.`
`THE ONE THAT FEELS RIGHT IS THE ONE THAT GETS BUILT.`
`WREKIN FORGE IS A DEMONSTRATION — DAVID JACKSON & SON GOT THE REAL THING ↓` → #work

One caption line now does three jobs: declares the fiction, names the real client, and
walks the reader forward to the evidence.

Framing rules: no direction is marked chosen, recommended or default — the absence of a
"correct answer" is the point, and it is what makes the choice feel like luxury rather
than a test. Equally, this is a window into step 03 of the process, never a style picker
for the visitor's own site. The three captions hold both lines — they ship with the
demo or it doesn't ship.

**Quality gate:** all three directions must be genuinely good — a visitor should
hesitate over which they prefer. A weak direction damages the claim more than no demo
at all. This is real design work, not filler.

**Subordinate strip** beneath, three across (stacking <768px), hairline dividers
between, no borders, no cards, ≈⅓ the lead's height:
`02 / CUSTOM SOFTWARE` Internal tools built round how you actually run the job. `From £6,000`
`03 / LOCAL SEO` Found by people nearby who are ready to buy. `From £450/mo`
`04 / RESEARCH & STRATEGY` Analysis you can act on — and defend. `Per engagement`

**Accept:** lead ≥ 2× strip height; strip never renders as cards.

### B6 — Case study + evidence *(id="work")*

Ground `--color-sheet`. Padding 120px.
Eyebrow `SELECTED WORK` · H2 `David Jackson & Son` · mono meta row:
`MANUFACTURING · WEBSITE + INTERNAL TOOL + STRATEGY`

Three headed movements, H3 + short paragraph each:

**What I found** — `Work of a standard that ends up in listed buildings — and a website
that said "joinery services". The gap between the two was the whole brief, and it only
became visible in the workshop.`
**What it changed** — `The site had to lead with the making, not the categories: the
work photographed in progress, and a configurator so a customer can see their own
windows before ordering. That was one of the real directions Harry saw before any code
existed — the same stage the demonstration above walks you through. He pulled it apart,
and the site got better for it.`
**What got built** — `A twelve-page site designed from scratch, the configurator, and —
because I was in there anyway — something else: production was planned on paper. So I
built the planner too.`

Link: `Read the full case study →` /work/david-jackson-son

**The WulfTek vignette** (ASSET W1 — ships only after WulfTek's explicit nod; until
then this element is omitted entirely). Compact, hairline above, mono micro heading
`THE WORD SURVEY, IN USE · WULFTEK TUNING`, then ~70 words:
`During a Groundwork Visit with WulfTek, a conversation surfaced something the old
website barely mentioned: he remaps tractors. Farmland on every side of Telford, and
almost nobody competing for the words. ECU and economy remapping stayed front and
centre — but agricultural remapping got its own ground and real prominence, because
that was territory he could actually own.`
No results claim of any kind until a number is independently verifiable; when one
exists, exactly one figure may be appended.

**The planner, as evidence** beneath — no longer an embedded island. A short captured
recording (8–12s, muted, plays once on scroll-in, replay control, `prefers-reduced-motion`
shows a still) of the real scheduler: a job dragged past its amber deadline diamond, the
breach flag firing, the counter flipping. Chrome: 1px graphite border, 4px radius. Mono
strip above: `THE PLANNER, IN USE · BUILT BECAUSE THE PLANNING WAS ON PAPER`. Link
beneath: `Try the full demo →` /work/david-jackson-son#demo — the interactive version
lives on the case study page for anyone who wants it, where the software buyer will
find it. Lazy-load; never blocks paint; identical behaviour on mobile and desktop.

### B7 — Process *(id="process", stepper mechanics from 21st)*

Ground `--color-white`, top hairline. Padding 96px.
H2: `Five steps — and you know the price before the build starts.`
Horizontal 5-across ≥1024px; vertical below (bars become 8px-wide vertical tracks).
Bars = signature #3, draw on scroll-in.

`01 A CALL` — Fifteen minutes to see whether it's worth going further. chip `FREE`
`02 TIME ON SITE` — I spend time where you work, at your events, with your customers — and write down how you work and the words they use. chip `FREE`
`03 DIRECTIONS` — Two or three real design directions. You pick, and you pull them apart. chip `YOU CHOOSE` amber
`04 BUILD` — Milestones against real dates, with the line open for ideas throughout. chip `OPEN LINE`
`05 YOURS` — Domain, code and content are yours on full payment, plus a warranty period. chip `YOU OWN IT` amber

### B8 — Pricing *(id="pricing", collapse mechanics from 21st)*

Ground `--color-white`. Padding 96px, top hairline.
Eyebrow `PRICING` · H2 `This is what the process costs.` · Lede: `Visits, directions,
iteration — and a site nobody else could have. Your exact number is fixed in writing.`

Four columns (→2 <1024, →1 <640), hairline borders, no shadow, **no featured column**.
Prices in mono at 1.5rem, tabular:

**Bespoke websites** `FROM` **£3,000** — Designed with you, from real visits ·
Directions before code · The Word Survey included · You own domain, code and content ·
~~Templates and page builders~~
**Custom software** `FROM` **£6,000** — Built round your actual workflow · Real
database, proper sign-in · Warranty after launch · ~~Licences you rent forever~~
**Local SEO** `FROM` **£450**/mo — Google Business Profile done right · Local citations
and content · Honest monthly reporting · ~~Lock-in contracts~~
**Research & strategy** `PRICED` **Per job** — Competitor and market analysis ·
Modelling with stated assumptions · Written up to act on · ~~Opinion dressed as data~~

(Struck items: line-through at 55% graphite.)

Notes beneath, hairline above:
`Starting points. Your number is fixed in writing after the first visits, and it doesn't
move without a written variation.`
`New ideas during the build are welcome — that's the point of the open line. Anything
that changes the shape of the job goes through a written variation, so the number never
moves quietly.`
`I'm taking a small number of projects at a founding rate — same scope, same standard,
in exchange for a written case study.` link `How founding projects work →`

### B9 — About *(id="about")*

Ground `--color-sheet`. Padding 120px. Grid 7/5, photo right — **ASSET P1**:
the client-meeting photograph (Talon in armchair, notebook open, client across the
table). Prep before use, in order: (1) client's consent confirmed by the owner;
(2) crop in from the left to lose the empty chair and tighten on the conversation;
(3) retouch the notebook barcode. Save as
`/public/images/talon-client-meeting.webp`, ≤180kb, 4px radius, hairline, no shadow.
Alt: "Talon Herring in conversation with a client, notebook open." The previous desk
photograph (`talon-herring-project-manager-telford.webp`) is retired from this page.
Eyebrow `WHO YOU'D BE HIRING` · H2 `The engineer who runs the job.`
Body: `Most developers can't run a project to time and budget. Most project managers
can't build. I do both — and it's just me, which is the point: the person you meet on
site is the person who designs, builds, and answers the phone.`

Credential rows (mono key 150px + value, hairlines):
`QUALIFICATION` Level 4 Associate Project Manager, with Distinction
`TRACK RECORD` Four years running projects where scope and deadlines are not negotiable
`DELIVERY` Full-stack — Supabase, Stripe, Three.js, shipped through GitHub and Vercel
`STRUCTURE` One person, start to finish — no handoffs, no account managers

### B10 — Coverage map

Ground `--color-white`, top hairline. Padding 96px. Grid 5/7: text left, canvas right.
Eyebrow `WHERE I WORK` · H2 `I come to you.`
Body: `Every job starts where you work, and it doesn't stop after one visit. Telford,
Shrewsbury, Bridgnorth, Wolverhampton, Birmingham — inside the outer ring, the first
visit costs nothing.`
Legend rows (hairlines, mono micro): cobalt square `BASE — TELFORD` · dashed ring
`30 / 60 MINUTE RINGS`.

Canvas (island, signature-adjacent): dot field precomputed from the ONS West Midlands
boundary (`scripts/generate-map.py` → `src/data/map-dots.json`, checked in), graphite
28%, hex-offset grid ≈58 cols. Dashed cobalt rings at 30/60km from Telford. City labels
mono micro: Shrewsbury, Wolverhampton, Birmingham, Stafford, Worcester. **No client arcs or project pins.** Both current clients sit within 5km of base
(David Jackson & Son, Tweedale: 52.6389, −2.4534; WulfTek, mobile, Telford centre),
which on a 156km-tall map renders as two overlapping specks — and reads as *only ever
worked in Telford* rather than as reach. The map's claim is coverage, not portfolio.
Reinstate arcs only when delivered work spans genuinely different towns.
Cobalt 10px square + `TELFORD · BASE` label. DPR-aware; redraw static on resize.

Motion consequence: with arcs removed the map has no draw animation. The page's
orchestrated motion budget drops from three moments to two (hero bars, process bars).
Update §5 accordingly — the map now renders static on first paint.
Caption row, hairline above: `WEST MIDLANDS REGION · ONS BOUNDARY DATA` ·
`VISITS · NO CHARGE INSIDE THE RINGS`

### B11 — Close *(id="book", form mechanics from 21st)*

Ground `--color-ink`. Padding 150px, centred. Falcon mark 44px.
H2: `Book a visit — I'll come to you.`
Lede: `No jargon, no pressure, and whatever we find is yours to keep — whether or not
we go ahead.`
Inline form: `Your name` · `Business name` · `Phone number` · `Email` · primary
`Request a visit`. Phone OR email must validate — never both required (*Defaulted
decision D2: simulation showed phone-only capture deters the considered, introvert-
leaning slice of the exact target niche*). Include a visually-hidden honeypot field
(`company_website`, `tabindex="-1"`, `autocomplete="off"`); any value in it drops the
submission silently (*Defaulted decision D3: spam is a certainty at any volume*).
Client validation; errors are specific and unapologetic
(`That phone number looks incomplete — check the digits.`); success replaces the form:
mono amber `REQUEST RECEIVED — I'LL CALL WITHIN ONE WORKING DAY.` Posts to
[slot: Formspree endpoint or Vercel function].
Beneath: `Or call` tel link `07742 082423` · mono micro `REPLY WITHIN ONE WORKING DAY`

### Footer

Ink ground, top hairline (dark variant), 28px. Left: `© 2026 Talon Insights · Telford,
Shropshire`. Right: Privacy · Accessibility · Terms. Contact email is `hello@taloninsights.co.uk` (or chosen domain address), **never**
`taloninsights@gmail.com`. Note: the gmail address is currently live in the site footer
and therefore visible in the Google search snippet — this is a launch blocker, not a
preference.

---

## 7. Imports & Sourcing Manifest — the only things imported, ever

Search 21st.dev with the query given; verify the keep-list exists in the source before
installing; if an import needs more than two new dependencies, hand-roll instead. Every
import is stripped on arrival (icons, colour literals, fonts, shadows, radii,
transitions) and restyled from §2 tokens. If it still resembles its catalog preview,
the restyle failed.

| # | Component | 21st search query | KEEP (mechanics) | STRIP → replace with |
|---|---|---|---|---|
| I1 | Process stepper | `horizontal process timeline stepper` | orientation switch ≥/<1024px, tablist/a11y wiring | all styling → §6/B7 spec |
| I2 | Pricing columns | `pricing table responsive columns` | 4→2→1 column collapse | featured/highlight logic, badges, toggle → §6/B8 spec (no featured column) |
| I3 | Form states | `contact form validation states` | validation, error, success state machine, focus management | all styling; error copy → §6/B11 verbatim |
| I4 | Coverflow carousel | `coverflow carousel` (Ruixen UI — the component the owner supplied) | drag/swipe physics, snap logic, 3D transforms | chrome, shadows, radii, autoplay; configure per §6/B5: ≤8° flank rotation, .92 scale, .55 opacity, no idle motion |

Explicitly NOT imported (hand-built, no exceptions): the plan panel, the fault list,
the services lead panel and strip, the three Wrekin Forge comps, the coverage map, the
proof strip, header, about, close, footer. These carry the identity; catalog structure
must never touch them.

## 8. Asset Manifest — every file, its source, its status

| ID | Asset | Source | Path | Status |
|---|---|---|---|---|
| A1 | Falcon mark | existing site `/assets/mark.webp` | `/public/images/mark.webp` | ✅ have |
| A2 | Lockup | existing site `/assets/lockup.webp` | `/public/images/lockup.webp` | ✅ have |
| P1 | About photo — client meeting | owner-supplied upload | `/public/images/talon-client-meeting.webp` | 🔶 have — needs consent + crop + barcode retouch per §6/B9 |
| P2 | Method photo — DJ workshop | owner to shoot on next visit | `/public/images/talon-workshop.webp` | ⬜ pending — block ships text-only until real |
| V1 | Planner capture, 8–12s | screen-record real tool, dummy data | `/public/media/planner-capture.mp4` + poster | ⬜ pending |
| C1–C3 | Wrekin Forge comps ×3 | designed at G3, coded mini-layouts | `src/components/directions/` | ⬜ pending — G3 quality gate applies |
| D1 | Map dot grid | `scripts/generate-map.py` (ONS EER boundary via martinjc/UK-GeoJSON) | `src/data/map-dots.json` | ✅ script proven — regenerate in repo |
| D2 | Demo… n/a | — | — | removed in 3.1 (scheduler no longer embedded on this page) |
| Q1 | Harry quote | owner to obtain | §6/B4 pull-quote slot | ⬜ pending — omit element entirely until real; never paraphrase |
| W1 | WulfTek vignette | copy final in §6/B6; consent from WulfTek | B6 vignette | ⬜ gated — omit entirely until the nod; one verifiable figure may be added later, never a projection |
| F1 | Fonts | Dinamo licence (or Google fallbacks) | `/public/fonts/` | ⬜ fallbacks now, licence when purchased |
| N1 | "Wrekin Forge" name | availability check | — | ✅ verified clear by owner, 26 Aug 2026 (no Companies House match). Recheck before any future rebrand of the demo. |

Rule: 🔶/⬜ assets never block the build — each has a defined absent-state above — but
no placeholder, stock, or AI-generated stand-in ever ships in their place.

## 9. Never list — build-failing violations

Icon libraries (lucide above all) · Inter / Space Grotesk · warm cream grounds ·
terracotta/clay accents · gradients (except the hero wash) · featured pricing columns ·
looping or floating motion · scroll hijacking · decorative numbering on non-sequences ·
stock or AI-generated photography of people · emoji in UI · glassmorphism · shadows
beyond the two named panels · arbitrary Tailwind values · "elevate / unlock / seamless /
empower / solutions / passionate" in copy · "bespoke" more than twice on the page ·
testimonials or statistics that aren't real.

## 10. Quality floor — unannounced, non-negotiable

Responsive to 360px · every interactive element keyboard-reachable with a visible
cobalt focus ring · reduced-motion fully static · descriptive alt text on both
photographs · canvas has a complete aria-label · tabular numerals verified in pricing
and plan panel · zero CLS · Lighthouse ≥95 on all four axes · zero console errors.

## 11. Build gates

G1 tokens + Base layout → G2 hero to shippable quality → G3 fault list + the three
direction comps designed and approved → G4 method + services (Directions demo island) +
case study with planner capture → G5 process + pricing + about → G6 map + close + form
endpoint → G7 full QA pass. No gate opens before the previous closes. G3's exit
criterion is explicit: you would ship each of the three directions as a real hero.

## 12. Slots & status board

Everything open, in one place. IDs reference §8.

| Item | Owner | Blocks | Status |
|---|---|---|---|
| P2 workshop photo | Talon (next DJ visit) | B4 image only | ⬜ |
| Q1 Harry quote | Talon | B4 pull quote only | ⬜ |
| V1 planner capture | Talon (10 min) | B6 media slot | ⬜ |
| C1–C3 Forge comps | design task at G3 | G4 onward | ⬜ |
| ~~Map pin coordinates~~ | — | — | ✅ resolved v3.5: arcs removed, no pins needed |
| Form endpoint (Formspree or Vercel fn) | build task at G6 | B11 submit | ⬜ |
| Diatype licence | Talon | nothing — fallbacks specified | ⬜ |
| P1 photo prep (consent, crop, retouch) | Talon | B9 image | 🔶 |
| W1 WulfTek nod on vignette | Talon | B6 vignette | ⬜ |

Defaulted decisions in force (revert only on explicit instruction): **D1** hero eyebrow
carries the category; **D2** email field added, phone-or-email validation; **D3**
honeypot anti-spam. All other decisions in this document were vetted and agreed in
conversation; none are open.
