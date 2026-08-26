import { useEffect, useRef } from "react";
import mapData from "../data/map-dots.json";

/* B10 — the coverage map (island). Renders static on first paint: v3.5
   removed the client arcs, and with them the map's draw animation — the
   page's orchestrated motion budget is two moments, and this is neither.
   Dot field precomputed by scripts/generate-map.py from the ONS West
   Midlands boundary; DPR-aware; redraws static on resize. */

const INK = "#0B1F3A";
const GRAPHITE = "#5A6675";
const COBALT = "#1D4ED8";

const ARIA =
  "Map of the West Midlands region drawn as a field of dots, with Talon Insights' base " +
  "marked at Telford and dashed rings at thirty and sixty kilometres showing the areas " +
  "reached for visits. Shrewsbury, Wolverhampton, Birmingham, Stafford and Worcester " +
  "are labelled. Inside the outer ring, the first visit costs nothing.";

export default function CoverageMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const cssWidth = canvas.clientWidth;
      if (!cssWidth) return;
      const scale = cssWidth / mapData.w;
      const cssHeight = mapData.h * scale;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
      ctx.clearRect(0, 0, mapData.w, mapData.h);

      // The region, as a hex-offset dot field — graphite at 28%.
      ctx.fillStyle = GRAPHITE;
      ctx.globalAlpha = 0.28;
      for (const [x, y] of mapData.dots as [number, number][]) {
        ctx.beginPath();
        ctx.arc(x, y, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Dashed cobalt rings at 30 / 60 km from base.
      const { base } = mapData;
      ctx.strokeStyle = COBALT;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([6, 6]);
      for (const radius of mapData.ringsPx as number[]) {
        ctx.beginPath();
        ctx.arc(base.x, base.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // City labels, mono micro.
      ctx.font = "11px 'Martian Mono', ui-monospace, monospace";
      ctx.fillStyle = GRAPHITE;
      ctx.textBaseline = "middle";
      for (const city of mapData.cities as { name: string; x: number; y: number }[]) {
        ctx.beginPath();
        ctx.arc(city.x, city.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(city.name.toUpperCase(), city.x + 8, city.y);
      }

      // Base: cobalt 10px square + label.
      ctx.fillStyle = COBALT;
      ctx.fillRect(base.x - 5, base.y - 5, 10, 10);
      ctx.fillStyle = INK;
      ctx.fillText("TELFORD · BASE", base.x + 10, base.y);
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Sizing lives in Map.astro's stylesheet (the hashed CSP forbids style
  // attributes in server-rendered markup); the aspect ratio there reserves
  // this element's space before hydration, so layout never shifts.
  return <canvas ref={canvasRef} role="img" aria-label={ARIA} />;
}
