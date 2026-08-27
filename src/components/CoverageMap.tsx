import { useEffect, useRef } from "react";
import mapData from "../data/map-dots.json";

/* B10 — the coverage map (island), restyled 26 Aug 2026 per the owner's
   B10 directive: ink ground, lifted-cobalt dot field with a sharpened
   boundary edge, no rings, amber base + city markers, and one travel
   animation on first scroll-in — the page's third and final orchestrated
   motion moment. Canvas 2D + rAF only; no libraries.

   City positions are projection-true: verified against
   scripts/generate-map.py — every label plots from its real lon/lat
   through the same equirectangular projection as the dot field (≤0.2px
   round-trip error; Telford→Stafford is genuinely ~26km, so those two
   sit close by geography, not by mistake).

   The animation communicates coverage, not delivered work — these are
   towns reached for visits, never client locations. It runs once, then
   the canvas is static forever: no repeat on resize, re-entry or focus. */

const ARIA =
  "Map of the West Midlands region drawn as a field of small cobalt dots on a dark " +
  "ground, with Talon Insights' base marked as an amber square at Telford. Amber dots " +
  "mark Shrewsbury, Wolverhampton, Stafford, Worcester and Birmingham — towns within " +
  "about an hour of the base, shown to illustrate the area covered for visits. Visits " +
  "cost nothing within an hour of Telford.";

// Departure order fixed by the directive (nearest-first): stagger 90ms.
const ORDER = ["Shrewsbury", "Wolverhampton", "Stafford", "Worcester", "Birmingham"];
const STAGGER = 90;
const LABEL_FADE = 200;

import { siteEase as ease } from "../lib/easing";

type Journey = {
  name: string;
  x: number; y: number;       // destination (city marker)
  cpx: number; cpy: number;   // quadratic control point
  delay: number;
  duration: number;
};

export default function CoverageMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Tokens — read from the stylesheet so theme.css stays the source.
    const rootStyle = getComputedStyle(document.documentElement);
    const token = (name: string, fallback: string) =>
      rootStyle.getPropertyValue(name).trim() || fallback;
    const COBALT_LIFT = token("--color-cobalt-lift", "#4D7CFF");
    const AMBER_LIFT = token("--color-amber-lift", "#F0B455");
    const SHEET = token("--color-sheet", "#F5F7F9");

    const dots = mapData.dots as [number, number][];
    const base = mapData.base;

    /* The edge/interior alpha split (70/45) retired 27 Aug: the dimmer
       interior read as a visible dark patch inside the silhouette (owner:
       "no visible square"). One field, one brightness. */

    /* Journeys — gentle quadratic curves, control point pushed
       perpendicular off the midpoint by 12% of path length, alternating
       side per destination so the fan reads evenly. Duration scales with
       distance across 600–1000ms. */
    const cities = ORDER.map(
      (name) => (mapData.cities as { name: string; x: number; y: number }[])
        .find((c) => c.name === name)!,
    );
    const lengths = cities.map((c) => Math.hypot(c.x - base.x, c.y - base.y));
    const minLen = Math.min(...lengths);
    const maxLen = Math.max(...lengths);
    const journeys: Journey[] = cities.map((c, i) => {
      const dx = c.x - base.x, dy = c.y - base.y;
      const len = lengths[i];
      const side = i % 2 === 0 ? 1 : -1;
      return {
        name: c.name,
        x: c.x, y: c.y,
        cpx: (base.x + c.x) / 2 + (-dy / len) * len * 0.12 * side,
        cpy: (base.y + c.y) / 2 + (dx / len) * len * 0.12 * side,
        delay: i * STAGGER,
        duration: 600 + (maxLen === minLen ? 0 : 400 * (len - minLen) / (maxLen - minLen)),
      };
    });
    const quadAt = (j: Journey, t: number) => {
      const u = 1 - t;
      return {
        x: u * u * base.x + 2 * u * t * j.cpx + t * t * j.x,
        y: u * u * base.y + 2 * u * t * j.cpy + t * t * j.y,
      };
    };

    /* phase: "resting" (field + base only) → "travel" → "final".
       Reduced motion starts at "final". Once "final", nothing ever moves. */
    let phase: "resting" | "travel" | "final" = reduce ? "final" : "resting";
    let raf: number | null = null;
    let travelStart = 0;
    let frames = 0;
    let fieldLayer: HTMLCanvasElement | null = null;
    let dpr = 1;
    let scale = 1;

    const buildFieldLayer = () => {
      const cssWidth = canvas.clientWidth;
      if (!cssWidth) return false;
      scale = cssWidth / mapData.w;
      dpr = window.devicePixelRatio || 1;
      const layer = document.createElement("canvas");
      layer.width = Math.round(cssWidth * dpr);
      layer.height = Math.round(mapData.h * scale * dpr);
      const lctx = layer.getContext("2d")!;
      lctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
      lctx.fillStyle = COBALT_LIFT;
      dots.forEach(([x, y]) => {
        lctx.globalAlpha = 0.7;
        lctx.beginPath();
        lctx.arc(x, y, 1.1, 0, Math.PI * 2);
        lctx.fill();
      });
      fieldLayer = layer;
      canvas.width = layer.width;
      canvas.height = layer.height;
      return true;
    };

    const drawLabel = (
      ctx: CanvasRenderingContext2D,
      text: string, x: number, y: number,
      color: string, alpha: number,
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = "11px 'Martian Mono', ui-monospace, monospace";
      try { (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0.06em"; } catch { /* pre-letterSpacing engines */ }
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(11, 31, 58, 0.9)";
      ctx.shadowBlur = 2;
      ctx.fillStyle = color;
      ctx.fillText(text.toUpperCase(), x, y);
      ctx.restore();
    };

    /* One frame. `now` drives the travel phase; resting/final states call
       this with no time and just draw their fixtures.

       The dot field draws in map-logical space (it IS the map), but every
       marker, trail and label draws in CSS-pixel space with only its
       position scaled — so the directive's 10px / 4px / 3px / 11px sizes
       hold at every canvas width instead of shrinking with the map. */
    const draw = (now?: number) => {
      const ctx = canvas.getContext("2d");
      if (!ctx || !fieldLayer) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(fieldLayer, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const sx = (v: number) => v * scale;

      // Base marker — visible from first paint: solid amber 10px square
      // with a 1px amber ring at 30%.
      ctx.fillStyle = AMBER_LIFT;
      ctx.fillRect(sx(base.x) - 5, sx(base.y) - 5, 10, 10);
      ctx.save();
      ctx.strokeStyle = AMBER_LIFT;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sx(base.x), sx(base.y), 9.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      drawLabel(ctx, "Telford", sx(base.x) + 12, sx(base.y), SHEET, 1); // marker shape alone says base (27 Aug, owner)

      let allSettled = true;
      for (const j of journeys) {
        let t = 1;
        let labelAlpha = 1;
        if (phase === "resting") { t = 0; labelAlpha = 0; }
        else if (phase === "travel" && now !== undefined) {
          const elapsed = now - travelStart - j.delay;
          t = ease(Math.max(0, Math.min(1, elapsed / j.duration)));
          labelAlpha = Math.max(0, Math.min(1, (elapsed - j.duration) / LABEL_FADE));
        }

        if (t >= 1) {
          // Settled: the 3px city marker, label faded in over 200ms.
          ctx.globalAlpha = 1;
          ctx.fillStyle = AMBER_LIFT;
          ctx.beginPath();
          ctx.arc(sx(j.x), sx(j.y), 1.5, 0, Math.PI * 2);
          ctx.fill();
          if (labelAlpha > 0)
            drawLabel(ctx, j.name, sx(j.x) + 8, sx(j.y), "rgba(245, 247, 249, 0.85)", labelAlpha);
          if (labelAlpha < 1) allSettled = false;
        } else {
          allSettled = false;
          if (t > 0) {
            // The travelling dot, 4px, with a short faded trail — three
            // ghost positions at decreasing opacity. No glow, no blur.
            ctx.fillStyle = AMBER_LIFT;
            const ghosts = [
              { back: 0.06, r: 1.6, alpha: 0.4 },
              { back: 0.12, r: 1.2, alpha: 0.24 },
              { back: 0.18, r: 0.9, alpha: 0.12 },
            ];
            for (const g of ghosts) {
              const gt = t - g.back;
              if (gt <= 0) continue;
              const p = quadAt(j, gt);
              ctx.globalAlpha = g.alpha;
              ctx.beginPath();
              ctx.arc(sx(p.x), sx(p.y), g.r, 0, Math.PI * 2);
              ctx.fill();
            }
            const p = quadAt(j, t);
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(sx(p.x), sx(p.y), 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
      return allSettled;
    };

    const finalize = () => {
      if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
      phase = "final";
      draw();
    };

    const startTravel = () => {
      if (phase !== "resting") return;
      phase = "travel";
      travelStart = performance.now();
      frames = 0;
      const step = (now: number) => {
        frames++;
        const settled = draw(now);
        if (settled) { finalize(); return; }
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      // rAF starves in non-compositing browsers; land the final state
      // rather than leaving a half-travelled map. Total sequence is
      // ≤1600ms, so 2s means frames aren't flowing.
      window.setTimeout(() => { if (phase === "travel" && frames < 3) finalize(); }, 2000);
    };

    // First paint + resize. Resize never replays the travel: it redraws
    // whichever resting/final state the map is in (mid-travel frames keep
    // coming from the rAF loop against the rebuilt layer).
    const rebuild = () => {
      if (!buildFieldLayer()) return;
      if (phase !== "travel") draw();
    };
    rebuild();
    const ro = new ResizeObserver(rebuild);
    ro.observe(canvas);

    // The one-time trigger: threshold .35, unobserved after firing.
    let io: IntersectionObserver | null = null;
    let watchdog: number | undefined;
    if (!reduce) {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            io?.disconnect();
            io = null;
            if (watchdog !== undefined) window.clearInterval(watchdog);
            startTravel();
            break;
          }
        },
        { threshold: 0.35 },
      );
      io.observe(canvas);
      // IO never fires where nothing composites; if the canvas is
      // measurably on screen and the observer stayed silent, skip the
      // travel and land the final state. Cleared the moment IO works.
      watchdog = window.setInterval(() => {
        if (phase !== "resting") { window.clearInterval(watchdog); return; }
        const rect = canvas.getBoundingClientRect();
        const visible =
          Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        if (rect.height > 0 && visible / rect.height >= 0.35) {
          window.clearInterval(watchdog);
          io?.disconnect();
          io = null;
          finalize();
        }
      }, 1200);
    }

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      if (watchdog !== undefined) window.clearInterval(watchdog);
    };
  }, []);

  // Sizing lives in Map.astro's stylesheet (the hashed CSP forbids style
  // attributes in server-rendered markup); the aspect ratio there reserves
  // this element's space before hydration. Labels draw on the canvas
  // itself, so their arrival can never shift layout.
  return <canvas ref={canvasRef} role="img" aria-label={ARIA} />;
}
