import { useCallback, useEffect, useRef, useState } from "react";
import { DirectionFire, DirectionHeritage, DirectionArchitectural } from "./comps";

/* B5 — the Directions demo (island, signature #2).
   Mechanics adapted from 21st import I4 (Ruixen coverflow, §7): the pointer
   drag with velocity flick, the exponential snap-settle, and the 3D
   transform pipeline are its; chrome, shadows, radii, icons and autoplay
   were stripped on arrival. Configuration per spec: flank rotation ≤8°,
   scale .92, opacity .55, motion user-initiated only, reduced motion gets a
   crossfade instead of 3D travel. All three comps stay mounted — switching
   is instant. */

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
const FLANK_SCALE = 0.92;
const FADE_PER_STEP = 0.45; // 1 − .45 = .55 at the first flank

const clampIndex = (n: number) => Math.max(0, Math.min(COUNT - 1, n));

/* One card's presentation at a given fractional centre position. The
   at-rest pose (pos = 1) is duplicated as nth-child CSS in directions.css —
   the hashed CSP forbids style attributes in server-rendered markup, so the
   pre-hydration frame comes from the stylesheet and this function takes
   over through the CSSOM once interaction starts. */
function paintCard(card: HTMLElement, index: number, pos: number) {
  const offset = index - pos;
  const dist = Math.abs(offset);
  const tilt = MAX_TILT * Math.min(dist, 1) * Math.sign(offset);
  const scale = 1 - (1 - FLANK_SCALE) * Math.min(dist, 1);
  card.style.transform =
    `translateX(${offset * 13}cqw) translateZ(${-6 * Math.min(dist, 1.4)}cqw) ` +
    `rotateY(${-tilt}deg) scale(${scale})`;
  card.style.opacity = String(Math.max(1 - FADE_PER_STEP * dist, 0.12));
  card.style.zIndex = String(10 - Math.round(dist * 2));
}

export default function DirectionsDemo() {
  const [selected, setSelected] = useState(1); // HERITAGE centred at rest — no favourite
  const [reduce, setReduce] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const posRef = useRef(1);
  const targetRef = useRef(1);
  const rafRef = useRef<number | null>(null);
  const dragRef = useRef<{ id: number; x: number; pos: number; v: number; t: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Paint straight to the DOM while dragging/settling — React never needs
  // to see sixty positions a second. (Ruixen's pattern, kept.)
  const paint = useCallback(() => {
    const pos = posRef.current;
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      paintCard(card, index, pos);
    });
  }, []);

  const settle = useCallback(
    (target: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      setSelected(clampIndex(Math.round(target)));
      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
      // Backstop: rAF starves in browsers that aren't compositing (hidden
      // tabs, embedded panes). If the settle hasn't landed shortly after it
      // should have, jump straight to the final state — invisible when
      // frames are flowing, and the rack never sticks when they aren't.
      window.setTimeout(() => {
        if (targetRef.current !== target || posRef.current === target) return;
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        posRef.current = target;
        paint();
      }, 400);
    },
    [paint],
  );

  const goTo = useCallback(
    (index: number) => {
      const next = clampIndex(index);
      if (reduce) {
        // Crossfade instead of 3D travel: jump the model, let CSS fade.
        posRef.current = next;
        targetRef.current = next;
        setSelected(next);
        return;
      }
      settle(next);
    },
    [reduce, settle],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
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
    const stage = stageRef.current;
    if (!stage) return;
    const pitch = stage.clientWidth * 0.45; // px of drag per card
    const now = performance.now();
    const previous = posRef.current;
    const raw = drag.pos - (event.clientX - drag.x) / pitch;
    // Soft clamp at the ends — the rack resists, it doesn't wrap.
    posRef.current = Math.max(-0.25, Math.min(COUNT - 0.75, raw));
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;
    const index = clampIndex(Math.round(posRef.current));
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    const carried = Math.max(-1, Math.min(1, drag.v * 0.18));
    settle(clampIndex(Math.round(posRef.current + carried)));
  };

  // Tabs are the affordance AND the a11y surface (tablist, arrow keys,
  // tap-to-jump) — every route lands on the same state as a swipe.
  const onTabKeyDown = (event: React.KeyboardEvent) => {
    let next: number | null = null;
    if (event.key === "ArrowLeft") next = clampIndex(selected - 1);
    else if (event.key === "ArrowRight") next = clampIndex(selected + 1);
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

      <div className="ddemo-frame">
        <div className="ddemo-frame-head">
          <span className="ddemo-artefact">
            {/* amber: the directions-artefact ◆ — one of six on the page */}
            <i aria-hidden="true" />
            STEP 03 / DIRECTIONS
          </span>
          <span className="ddemo-frame-brand">WREKIN FORGE</span>
        </div>
        <div
          ref={stageRef}
          className={`ddemo-stage${reduce ? " is-fade" : ""}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
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
              className={`ddemo-card${reduce && i === selected ? " is-active" : ""}`}
            >
              <slide.Comp />
            </div>
          ))}
        </div>
        <p className="ddemo-readout" aria-live="polite">{active.readout}</p>
      </div>
    </div>
  );
}
