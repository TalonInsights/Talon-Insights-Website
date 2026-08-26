"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { DirectionFire, DirectionHeritage, DirectionArchitectural } from "./comps";

/* B5 — the Directions folder (island), replacing the coverflow stage at the
   owner's instruction (26 Aug 2026). Mechanics adapted from the 21st
   "Interactive Folder Gallery" (owner-supplied, §7 import #5 — one
   dependency, framer-motion, inside the two-dependency rule): the
   closed-stack folder, the hover fan, click-to-open, and drag-any-card-down
   -to-close with snap-to-origin all keep its behaviour. Its chrome did not
   survive the import: gradients, glassmorphism, drop shadows, arbitrary
   hex values and Unsplash defaults are gone — surfaces are ink-ground
   overlays and hairlines from the token system, and the "photos" are the
   three live Wrekin Forge comps (coded mini-layouts, never screenshots),
   which stay exempt from the tokens as always.

   Motion is user-initiated only — outside the page's three-moment budget.
   MotionConfig honours prefers-reduced-motion. SSR emits no style
   attributes (the hashed CSP forbids them): the closed pose lives in
   nth-child CSS, and framer only starts driving the CSSOM after mount —
   keep the two poses in step. */

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
const DRAG_HINT = "DRAG A DESIGN DOWN TO CLOSE — OR PRESS ESCAPE";

// Closed pose — mirrored as nth-child CSS in directions.css.
const closedPose = (offset: number, hover: boolean, index: number) => ({
  y: hover ? offset * -10 - 28 : offset * -6,
  x: hover ? offset * 40 : offset * 6,
  rotate: hover ? offset * 5 : offset * 2.5,
  scale: 1 - Math.abs(offset) * 0.03,
  zIndex: 10 + index,
});

const openPose = (offset: number, mobile: boolean) => ({
  y: -60,
  x: `${offset * (mobile ? 70 : 106)}%`,
  rotate: 0,
  scale: 1.02,
  zIndex: 50,
});

export default function FolderGallery() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hoverFolder, setHoverFolder] = useState(false);
  const [mobile, setMobile] = useState(false);
  const folderButtonRef = useRef<HTMLButtonElement>(null);
  const hintButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(max-width: 767.98px)");
    setMobile(mq.matches);
    const onChange = () => setMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setHoverFolder(false);
    folderButtonRef.current?.focus({ preventScroll: true });
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    setHoverFolder(false);
  }, []);

  // Escape closes; focus moves to the hint (the only visible control while
  // open) and returns to the folder on close.
  useEffect(() => {
    if (!isOpen) return;
    hintButtonRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 350, damping: 30 }}>
      <div className="fgal">
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
            return (
              <motion.div
                key={direction.key}
                role="group"
                aria-label={direction.aria}
                aria-hidden={!isOpen && i !== 1}
                className={`fgal-card${isOpen ? " is-open" : ""}`}
                drag={isOpen}
                dragSnapToOrigin
                onDragEnd={(_event, info) => {
                  if (info.offset.y > 100 && isOpen) close();
                }}
                animate={
                  mounted
                    ? isOpen
                      ? openPose(offset, mobile)
                      : closedPose(offset, hoverFolder, i)
                    : undefined
                }
                whileHover={isOpen ? { scale: 1.06, zIndex: 100 } : undefined}
                whileDrag={isOpen ? { scale: 1.1, rotate: 3, zIndex: 150 } : undefined}
              >
                <direction.Comp />
              </motion.div>
            );
          })}
        </div>

        {/* the folder front — a real button, since it is the toggle */}
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
          onClick={open}
        >
          <span className="fgal-plate t-micro">{FOLDER_NAME}</span>
        </motion.button>

        {/* the closing affordance while open — hint and control in one */}
        <motion.button
          ref={hintButtonRef}
          type="button"
          className="fgal-hint t-micro"
          animate={mounted ? { opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 24 } : undefined}
          style={mounted ? { pointerEvents: isOpen ? "auto" : "none" } : undefined}
          tabIndex={isOpen ? 0 : -1}
          onClick={close}
        >
          {DRAG_HINT}
        </motion.button>
      </div>
    </MotionConfig>
  );
}
