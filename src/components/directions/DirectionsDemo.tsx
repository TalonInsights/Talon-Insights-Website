import { useCallback, useEffect, useRef, useState } from "react";
import { siteEase } from "../../lib/easing";
import { DirectionFire, DirectionHeritage, DirectionArchitectural } from "./comps";

/* B5 — the Directions stage (island, signature #2), restaged 26 Aug 2026
   per the owner's directive: a full-bleed ink band beneath the lead panel.
   The mechanics remain 21st import I4 (Ruixen coverflow, §7) — pointer drag
   with velocity flick, snap, and the ring fold that makes three comps an
   infinite carousel in both directions (positions rotate, never shuffle).
   Restyle on top: centre comp full-size, flanks at scale .88 / opacity .5 /
   ≤8° toward the centre, 420ms site-eased transitions, arrow buttons, and
   arrow keys on the focused stage. Motion is user-initiated only — outside
   the page's three-moment budget. All three comps stay mounted; switching
   is instant. Reduced motion: instant position change, no transition. */

const SLIDES = [
  {
    tab: "A",
    name: "THE FIRE",
    readout: "DIRECTION / THE FIRE · GROUND / DARK · REGISTER / BOLD",
    aria: "Direction A — The Fire. Dark ground, bold condensed display, the making as spectacle.",
    Comp: DirectionFire,
  },
  {
    tab: "B",
    name: "HERITAGE",
    readout: "DIRECTION / HERITAGE · GROUND / PAPER · REGISTER / QUIET",
    aria: "Direction B — Heritage. Warm paper ground, serif display, period ironwork register.",
    Comp: DirectionHeritage,
  },
  {
    tab: "C",
    name: "ARCHITECTURAL",
    readout: "DIRECTION / ARCHITECTURAL · GROUND / LIGHT · REGISTER / PRECISE",
    aria: "Direction C — Architectural. Light, systematic, grid-led, spec-sheet precision.",
    Comp: DirectionArchitectural,
  },
] as const;

const COUNT = SLIDES.length;
const MAX_TILT = 8; // degrees — never iTunes wings
const FLANK_SCALE = 0.88;
const FLANK_OPACITY = 0.5;
const PEEK = 0.17; // fraction of a flank's width visible at the stage edge
const DURATION = 420;

const mod = (n: number) => ((n % COUNT) + COUNT) % COUNT;

export default function DirectionsDemo() {
  const [selected, setSelected] = useState(1); // HERITAGE centred at rest — no favourite
  const [reduce, setReduce] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  /** Fractional position of the centre, unbounded — folded per card. */
  const posRef = useRef(1);
  const targetRef = useRef(1);
  const rafRef = useRef<number | null>(null);
  const pitchRef = useRef(0);
  const dragRef = useRef<{ id: number; x: number; pos: number; v: number; t: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  /* One card's pose. The offset folds into the shorter way round the ring
     (the Ruixen loop mechanism — no cloned nodes): with three comps it
     always lands in (-1.5, 1.5], and the teleport across ±1.5 happens far
     off-stage where opacity has already reached zero. The at-rest pose
     (pos = 1) is mirrored as nth-child CSS in directions.css for the
     pre-hydration frame — keep them in step. */
  const paintCard = useCallback((card: HTMLElement, index: number, pos: number) => {
    let offset = index - pos;
    offset = ((offset % COUNT) + COUNT) % COUNT;
    if (offset > COUNT / 2) offset -= COUNT;
    const dist = Math.abs(offset);
    const tilt = MAX_TILT * Math.min(dist, 1) * Math.sign(offset);
    const scale = 1 - (1 - FLANK_SCALE) * Math.min(dist, 1);
    const opacity = dist <= 1
      ? 1 - (1 - FLANK_OPACITY) * dist
      : Math.max(0, FLANK_OPACITY - (dist - 1) * 1.4);
    card.style.transform =
      `translateX(${offset * pitchRef.current}px) rotateY(${tilt}deg) scale(${scale})`;
    card.style.opacity = String(opacity);
    card.style.zIndex = String(10 - Math.round(dist * 2));
  }, []);

  const paint = useCallback(() => {
    const pos = posRef.current;
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      paintCard(card, index, pos);
    });
  }, [paintCard]);

  // Pitch: one step moves a card from centre to its edge-peek station.
  // Must agree with the CSS calc in directions.css.
  const measure = useCallback(() => {
    const stage = stageRef.current;
    const card = cardRefs.current[1];
    if (!stage || !card) return;
    const W = stage.clientWidth;
    const C = card.clientWidth;
    pitchRef.current = W / 2 + (FLANK_SCALE / 2 - PEEK * FLANK_SCALE) * C;
  }, []);

  useEffect(() => {
    measure();
    paint();
    const ro = new ResizeObserver(() => { measure(); paint(); });
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [measure, paint]);

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  /* 420ms tween along the site curve — position, scale, opacity and
     rotation all derive from `pos`, so they animate together. Reduced
     motion jumps straight to the target. */
  const settle = useCallback(
    (target: number) => {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      targetRef.current = target;
      setSelected(mod(Math.round(target)));
      const from = posRef.current;
      if (reduce || from === target) {
        posRef.current = target;
        paint();
        return;
      }
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - start) / DURATION, 1);
        posRef.current = from + (target - from) * siteEase(p);
        paint();
        rafRef.current = p < 1 ? requestAnimationFrame(step) : null;
      };
      rafRef.current = requestAnimationFrame(step);
      // rAF starves where nothing composites — land the state anyway.
      window.setTimeout(() => {
        if (targetRef.current !== target || posRef.current === target) return;
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        posRef.current = target;
        paint();
      }, DURATION + 200);
    },
    [paint, reduce],
  );

  /** Rotate by whole steps — right wraps to left and back, forever. */
  const nudge = useCallback(
    (by: number) => settle(Math.round(targetRef.current) + by),
    [settle],
  );

  /** Jump to a named direction the shorter way round the ring. */
  const goTo = useCallback(
    (index: number) => {
      const target = index + Math.round((targetRef.current - index) / COUNT) * COUNT;
      settle(target);
    },
    [settle],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const pitch = pitchRef.current;
    if (!pitch) return;
    const now = performance.now();
    const previous = posRef.current;
    posRef.current = drag.pos - (event.clientX - drag.x) / pitch;
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;
    const index = mod(Math.round(posRef.current));
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    const carried = Math.max(-1, Math.min(1, drag.v * 0.18));
    settle(Math.round(posRef.current + carried));
  };

  const onStageKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); nudge(-1); }
    else if (event.key === "ArrowRight") { event.preventDefault(); nudge(1); }
  };

  // The tabs stay the accessible spine: tablist, tap-to-jump, arrow keys —
  // every route lands on the same state as a swipe or an arrow button.
  const onTabKeyDown = (event: React.KeyboardEvent) => {
    let next: number | null = null;
    if (event.key === "ArrowLeft") next = mod(selected - 1);
    else if (event.key === "ArrowRight") next = mod(selected + 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = COUNT - 1;
    if (next === null) return;
    event.preventDefault();
    goTo(next);
    tabRefs.current[next]?.focus();
  };

  const active = SLIDES[selected];

  return (
    <div className="ddemo">
      <div className="ddemo-tabs" role="tablist" aria-label="Design directions" onKeyDown={onTabKeyDown}>
        {SLIDES.map((slide, i) => (
          <button
            key={slide.tab}
            ref={(node) => { tabRefs.current[i] = node; }}
            role="tab"
            id={`ddemo-tab-${slide.tab}`}
            aria-selected={i === selected}
            aria-controls={`ddemo-panel-${slide.tab}`}
            tabIndex={i === selected ? 0 : -1}
            className="ddemo-tab"
            onClick={() => goTo(i)}
          >
            {slide.tab}
          </button>
        ))}
      </div>

      <div
        ref={stageRef}
        className="dstage"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Three design directions for Wrekin Forge — drag, use the arrow buttons, or the tabs"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onStageKeyDown}
      >
        {SLIDES.map((slide, i) => (
          <div
            key={slide.tab}
            ref={(node) => { cardRefs.current[i] = node; }}
            role="tabpanel"
            id={`ddemo-panel-${slide.tab}`}
            aria-labelledby={`ddemo-tab-${slide.tab}`}
            aria-label={slide.aria}
            aria-hidden={i !== selected}
            className="ddemo-card"
          >
            <slide.Comp />
          </div>
        ))}
      </div>

      <div className="dstage-arrows">
        <button type="button" className="dstage-arrow" aria-label="Previous direction" onClick={() => nudge(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M14.5 6 9 12l5.5 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button type="button" className="dstage-arrow" aria-label="Next direction" onClick={() => nudge(1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M9.5 6 15 12l-5.5 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <p className="ddemo-readout" aria-live="polite">{active.readout}</p>
    </div>
  );
}
