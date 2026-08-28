"use client";
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { DirectionFire, DirectionHeritage, DirectionArchitectural } from "./comps";

// The Fire's interactable hero page carries three.js — loaded only when a
// design actually opens, never in the homepage bundle.
const FireHero = lazy(() => import("./FireHero"));
const HeritageHero = lazy(() => import("./HeritageHero"));
const ArchHero = lazy(() => import("./ArchHero"));
/* one interactable page per direction; index-aligned with DIRECTIONS */
const PORTAL_PAGES = [FireHero, HeritageHero, ArchHero] as const;

const DEEP_LINKS: Record<string, number> = {
  "#fire": 0,
  "#heritage": 1,
  "#arch": 2,
};

/* B5 — the Directions folder (island). Mechanics adapted from the 21st
   "Interactive Folder Gallery" (owner-supplied, §7 import #5): closed-stack
   folder, hover fan, click-to-open, drag-any-card-down-to-close.

   27 Aug addition (owner's instruction): with the folder open, selecting a
   design expands it to the centre of the screen at three-quarters of the
   viewport, animating out of its fan position and back into it on close
   (tap, scrim, the ✕, or Escape). While a design is expanded the page
   scroll locks, the other two dim beneath a flat ink scrim — no blur, no
   glassmorphism — and focus moves to the close control and back.

   Import chrome did not survive: surfaces are ink-ground tokens, and the
   "photos" are the three live Wrekin Forge comps, never screenshots.
   Motion is user-initiated only. MotionConfig honours reduced motion. SSR
   emits no style attributes (hashed CSP): the closed pose lives in
   nth-child CSS and framer drives the CSSOM only after mount. */

const DIRECTIONS = [
  {
    key: "fire",
    aria: "Direction A — The Fire. Dark ground, bold condensed display, the making as spectacle.",
    Comp: DirectionFire,
  },
  {
    key: "heritage",
    aria: "Direction B — Heritage. Warm paper ground, serif display, period ironwork register.",
    Comp: DirectionHeritage,
  },
  {
    key: "architectural",
    aria: "Direction C — Architectural. Light, systematic, grid-led, spec-sheet precision.",
    Comp: DirectionArchitectural,
  },
] as const;

const FOLDER_NAME = "WREKIN FORGE · THREE DIRECTIONS";
const DRAG_HINT = "SELECT A DESIGN TO ENLARGE IT · DRAG ONE DOWN TO CLOSE — OR PRESS ESCAPE";
const OPEN_SPREAD = 1.42; // fan offset per step, as a fraction of card width
const OPEN_SCALE = 1.32; // fanned cards grow a third (owner: too small to judge)
const EXPAND_FRACTION = 0.75; // the enlarged design fills 3/4 of the screen

// Closed pose — mirrored as nth-child CSS in directions.css.
const closedPose = (offset: number, hover: boolean, index: number) => ({
  x: hover ? offset * 40 : offset * 6,
  y: hover ? offset * -10 - 28 : offset * -6,
  rotate: hover ? offset * 5 : offset * 2.5,
  scale: 1 - Math.abs(offset) * 0.03,
  zIndex: 10 + index,
});

type ExpandTarget = { x: number; y: number; scale: number; pw: number; ph: number };

export default function FolderGallery() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hoverFolder, setHoverFolder] = useState(false);
  const [cardW, setCardW] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [returning, setReturning] = useState<number | null>(null);
  const [portal, setPortal] = useState(false);
  const [target, setTarget] = useState<ExpandTarget>({ x: 0, y: 0, scale: 1, pw: 0, ph: 0 });
  /* Phones (28 Aug, owner: two of the three fanned designs sat off-screen):
     under 768px the open fan goes VERTICAL — a column centred in the
     viewport, scaled so all three fit. null = desktop's horizontal fan. */
  const [stack, setStack] = useState<{ y0: number; step: number; scale: number } | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const folderButtonRef = useRef<HTMLButtonElement>(null);
  const hintButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  /* Deep links: #fire, #heritage and #arch open the folder with that
     direction already enlarged. The owner's iteration loop lives on these
     pages, and driven browsers cannot always perform the tap gestures — a
     URL that lands there directly serves both. The expand pose is computed
     on the next frame, once the fan has real geometry to measure. */
  useEffect(() => {
    const target = DEEP_LINKS[window.location.hash];
    if (target === undefined) return;
    setIsOpen(true);
    const t = window.setTimeout(() => {
      rootRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
      computeStack(); // the scroll just moved the anchor the stack centres on
      expand(target);
    }, 120);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setMounted(true);
    const card = cardRefs.current[1];
    if (!card) return;
    const measure = () => setCardW(card.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(card);
    return () => ro.disconnect();
  }, []);

  /* The stack pose is measured, not styled: card height from the live
     card, the column centred on the viewport via the same bottom-56
     anchor arithmetic expand() uses, and the scale shrunk until three
     cards and their gaps fit the screen height. */
  const computeStack = useCallback(() => {
    const root = rootRef.current;
    const card = cardRefs.current[1];
    if (!root || !card || window.innerWidth >= 768) {
      setStack(null);
      return;
    }
    const rect = root.getBoundingClientRect();
    const cardH = card.offsetWidth * 0.625;
    const vh = window.innerHeight;
    const scale = Math.max(0.85, Math.min(OPEN_SCALE, ((vh - 170) / 3 - 14) / cardH));
    const baseCy = rect.bottom - 56 - cardH / 2;
    setStack({ y0: vh / 2 - baseCy, step: cardH * scale + 14, scale });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    computeStack();
    window.addEventListener("resize", computeStack);
    return () => window.removeEventListener("resize", computeStack);
  }, [isOpen, computeStack]);

  const closeFolder = useCallback(() => {
    setIsOpen(false);
    setHoverFolder(false);
    setExpanded(null);
    folderButtonRef.current?.focus({ preventScroll: true });
  }, []);

  const openFolder = useCallback(() => {
    setIsOpen(true);
    setHoverFolder(false);
  }, []);

  /* Expand: the enlarged pose is computed from the card slot's live
     viewport position, so the animation genuinely departs from — and
     returns to — where the design sits in the fan. Scroll is locked while
     expanded, so the measurement holds. */
  const expand = useCallback((index: number) => {
    const root = rootRef.current;
    const card = cardRefs.current[index];
    if (!root || !card) return;
    const rect = root.getBoundingClientRect();
    const width = card.offsetWidth;
    const baseCx = rect.left + rect.width / 2;
    const baseCy = rect.bottom - 56 - (width * 0.625) / 2;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    /* Phones (27 Aug, owner: mobile compatibility): the 16:10 desktop
       portal is a postage stamp in portrait — the portal instead takes
       nearly the whole screen as a PORTRAIT sheet, and the pages' own
       mobile styles reflow inside it. The card still springs to the
       width-matched scale; the portal fades in over it with its own
       dimensions. */
    const mobile = vw < 768;
    const targetW = mobile
      ? vw * 0.94
      : Math.min(vw * EXPAND_FRACTION, vh * EXPAND_FRACTION * 1.6);
    setTarget({
      x: vw / 2 - baseCx,
      y: vh / 2 - baseCy,
      scale: targetW / width,
      pw: targetW,
      ph: mobile ? Math.min(vh * 0.82, 720) : targetW * 0.625,
    });
    setReturning(null);
    setPortal(false);
    setExpanded(index);
    // the portal normally mounts when the spring settles; this backstop
    // covers environments where rAF starves and the spring never completes
    window.setTimeout(() => setPortal(true), 700);
  }, []);

  const collapse = useCallback(() => {
    setPortal(false);
    setReturning(expanded);
    computeStack(); // re-centre the column before the card springs home
    setExpanded(null);
    const card = expanded !== null ? cardRefs.current[expanded] : null;
    card?.focus({ preventScroll: true });
  }, [expanded, computeStack]);

  // Escape: an expanded design collapses first; a second press closes the
  // folder. Focus follows: close control while expanded, card on return,
  // folder button when shut.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (expanded !== null) collapse();
      else closeFolder();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, expanded, collapse, closeFolder]);

  // Focus the hint when the folder first opens — not on a collapse, where
  // collapse() has already handed focus back to the returning card.
  useEffect(() => {
    if (isOpen) hintButtonRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  useEffect(() => {
    if (expanded === null) return;
    closeButtonRef.current?.focus({ preventScroll: true });
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [expanded]);

  const openX = (offset: number) => offset * OPEN_SPREAD * cardW;

  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 350, damping: 30 }}>
      <div ref={rootRef} className={isOpen ? "fgal is-raised" : "fgal"}>
        {/* the dim: while the folder is open (and nothing is enlarged),
            everything around the three directions falls away. Click to
            close. */}
        <AnimatePresence>
          {isOpen && expanded === null && (
            <motion.div
              key="dim"
              className="fgal-dim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={closeFolder}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>
        {/* the folder's back panel and tab — a surface, not a gradient */}
        <motion.div
          className="fgal-back"
          aria-hidden="true"
          animate={mounted ? { opacity: isOpen ? 0 : 1, scale: isOpen ? 0.94 : 1 } : undefined}
        >
          <span className="fgal-tab" />
          <span className="fgal-cavity" />
        </motion.div>

        {/* the three directions */}
        <div className="fgal-cards">
          {DIRECTIONS.map((direction, i) => {
            const offset = i - 1;
            const isExpanded = expanded === i;
            const selectable = isOpen && expanded === null;
            return (
              <motion.div
                key={direction.key}
                ref={(node) => { cardRefs.current[i] = node; }}
                role={selectable || isExpanded ? "button" : "group"}
                aria-label={
                  isExpanded
                    ? `${direction.aria} Enlarged — select, press Escape, or use the close control to return it.`
                    : selectable
                      ? `${direction.aria} Select to enlarge.`
                      : direction.aria
                }
                aria-hidden={!isOpen && i !== 1}
                tabIndex={selectable || isExpanded ? 0 : -1}
                className={`fgal-card${selectable ? " is-open" : ""}${isExpanded ? " is-expanded" : ""}`}
                drag={selectable}
                dragSnapToOrigin
                onDragEnd={(_event, info) => {
                  if (info.offset.y > 100 && selectable) closeFolder();
                }}
                onTap={() => {
                  if (isExpanded) collapse();
                  else if (selectable) expand(i);
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  if (isExpanded) collapse();
                  else if (selectable) expand(i);
                }}
                onAnimationComplete={() => {
                  if (returning === i && expanded !== i) setReturning(null);
                  if (expanded === i) setPortal(true);
                }}
                animate={
                  mounted
                    ? isExpanded
                      ? { x: target.x, y: target.y, rotate: 0, scale: target.scale, zIndex: 300 }
                      : isOpen
                        ? stack
                          ? {
                              // phone: the vertical column, centred on screen
                              x: 0,
                              y: stack.y0 + offset * stack.step,
                              rotate: 0,
                              scale: stack.scale,
                              zIndex: returning === i ? 160 : 50,
                            }
                          : {
                              x: openX(offset),
                              y: -60,
                              rotate: 0,
                              scale: OPEN_SCALE,
                              // a returning card rides above the fading scrim
                              zIndex: returning === i ? 160 : 50,
                            }
                        : closedPose(offset, hoverFolder, i)
                    : undefined
                }
                whileHover={selectable ? { scale: (stack ? stack.scale : OPEN_SCALE) * 1.05, zIndex: 100 } : undefined}
                whileDrag={selectable ? { scale: (stack ? stack.scale : OPEN_SCALE) * 1.08, rotate: 3, zIndex: 150 } : undefined}
              >
                <direction.Comp />
              </motion.div>
            );
          })}
        </div>

        {/* the folder front — a real button, since it is the toggle.
           transformPerspective carries the hover tilt so no CSS perspective
           sits on an ancestor (it would trap the fixed scrim). */}
        <motion.button
          ref={folderButtonRef}
          type="button"
          className="fgal-front"
          aria-expanded={isOpen}
          aria-label={`Open the folder of three Wrekin Forge design directions (${FOLDER_NAME})`}
          animate={
            mounted
              ? {
                  opacity: isOpen ? 0 : 1,
                  rotateX: hoverFolder && !isOpen ? -14 : 0,
                  transformPerspective: 1000,
                  y: hoverFolder && !isOpen ? 8 : 0,
                }
              : undefined
          }
          style={mounted ? { pointerEvents: isOpen ? "none" : "auto" } : undefined}
          tabIndex={isOpen ? -1 : 0}
          onMouseEnter={() => setHoverFolder(true)}
          onMouseLeave={() => setHoverFolder(false)}
          onFocus={() => setHoverFolder(true)}
          onBlur={() => setHoverFolder(false)}
          onClick={openFolder}
        >
          <span className="fgal-plate t-micro">{FOLDER_NAME}</span>
        </motion.button>

        {/* the closing affordance while open — hint and control in one */}
        <motion.button
          ref={hintButtonRef}
          type="button"
          className="fgal-hint t-micro"
          animate={
            mounted
              ? { opacity: isOpen && expanded === null ? 1 : 0, y: isOpen ? 0 : 24 }
              : undefined
          }
          style={mounted ? { pointerEvents: isOpen && expanded === null ? "auto" : "none" } : undefined}
          tabIndex={isOpen && expanded === null ? 0 : -1}
          onClick={closeFolder}
        >
          {DRAG_HINT}
        </motion.button>

        {/* the expanded view's scrim and close control — flat ink, fixed to
           the viewport, above the header */}
        <AnimatePresence>
          {expanded !== null && (
            <>
              <motion.div
                key="scrim"
                className="fgal-scrim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={collapse}
                aria-hidden="true"
              />
              {expanded !== null && portal && (() => {
                const Page = PORTAL_PAGES[expanded];
                return (
                  <motion.div
                    key="portal"
                    className={`fgal-portal fgal-portal--${expanded}`}
                    style={{ width: target.pw, height: target.ph }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Suspense fallback={null}>
                      <Page />
                    </Suspense>
                  </motion.div>
                );
              })()}
              <motion.button
                key="close"
                ref={closeButtonRef}
                type="button"
                className="fgal-close"
                aria-label="Close the enlarged design"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={collapse}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
