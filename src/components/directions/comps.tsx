import "./directions.css";

/* The three Wrekin Forge comps — coded mini-layouts at roughly one-third
   scale, never screenshots (§6/B5). Spark positions are a fixed field, not
   randomised, so server and client render identically. */

const SPARKS: Array<[number, number, number, number]> = [
  // x%, y%, radius, opacity
  [18, 88, 1.6, 0.9], [30, 74, 1.1, 0.7], [42, 82, 1.9, 0.85],
  [55, 65, 1.2, 0.6], [64, 76, 1.5, 0.8], [72, 58, 1.0, 0.5],
  [78, 70, 2.0, 0.75], [84, 50, 1.2, 0.55], [88, 62, 1.4, 0.65],
  [50, 46, 0.9, 0.4], [68, 38, 1.0, 0.45], [82, 30, 0.8, 0.35],
  [92, 42, 1.1, 0.5], [38, 58, 1.0, 0.5], [26, 66, 0.8, 0.4],
];

export function DirectionFire() {
  // 27 Aug (owner's directive): the FIRE card carries the finished hero
  // page's own portrait — supplied by the owner — instead of the coded
  // mini-comp. The comp below is retired from the card but kept for git
  // archaeology via the export beneath it.
  return (
    <div className="comp comp-fire-shot" aria-hidden="true">
      <img src="/images/direction-fire-card.webp" alt="" loading="lazy" decoding="async" />
    </div>
  );
}

export function DirectionFireComp() {
  return (
    <div className="comp comp-fire" aria-hidden="true">
      <div className="glow" />
      <svg className="sparks" viewBox="0 0 100 100" preserveAspectRatio="none">
        {SPARKS.map(([x, y, r, o], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#E8702E" opacity={o} />
        ))}
        {/* rising ember streaks */}
        <path d="M22 92 L26 78" stroke="#E8702E" strokeWidth="0.6" opacity="0.5" />
        <path d="M58 84 L63 68" stroke="#E8702E" strokeWidth="0.6" opacity="0.45" />
        <path d="M80 74 L86 56" stroke="#E8702E" strokeWidth="0.6" opacity="0.4" />
      </svg>
      <div className="fire-inner">
        <div className="fire-nav">
          <span className="fire-word">Wrekin Forge</span>
          <span className="fire-links">Gates&ensp;·&ensp;Railings&ensp;·&ensp;Staircases</span>
        </div>
        <div className="fire-display">
          Metal,<br />worked<br /><em>by fire.</em>
        </div>
        <div className="fire-sub">Architectural metalwork, forged in Shropshire</div>
        <div className="fire-cta">Commission a piece</div>
      </div>
    </div>
  );
}

export function DirectionHeritage() {
  // owner-supplied portrait of the finished heritage page (27 Aug), like
  // the fire card; the coded comp survives below for history
  return (
    <div className="comp comp-fire-shot" aria-hidden="true">
      <img src="/images/direction-heritage-card.webp" alt="" loading="lazy" decoding="async" />
    </div>
  );
}

export function DirectionHeritageComp() {
  return (
    <div className="comp comp-heritage" aria-hidden="true">
      <div className="her-inner">
        <span className="her-rule" />
        <span className="her-est">Wrekin Forge · Shropshire</span>
        <div className="her-display">
          Ironwork for buildings <em>with history.</em>
        </div>
        {/* drawn gate scrollwork — mirrored volutes, spear finials, fine line */}
        <svg className="her-gate" viewBox="0 0 120 54" fill="none" stroke="currentColor" strokeWidth="1.1">
          <path d="M60 6 V50" />
          <path d="M60 6 l-3.5 6 h7 z" fill="currentColor" stroke="none" />
          <path d="M30 50 V16 c0 -7 6 -11 12 -9 c5 2 6 9 1 11 c-4 2 -7 -2 -5 -5" />
          <path d="M90 50 V16 c0 -7 -6 -11 -12 -9 c-5 2 -6 9 -1 11 c4 2 7 -2 5 -5" />
          <path d="M30 34 c10 -8 20 -8 30 0 c10 8 20 8 30 0" strokeWidth="0.9" />
          <path d="M12 50 V22 m96 28 V22" strokeWidth="0.9" />
          <path d="M12 22 l-2.5 4.5 h5 z M108 22 l-2.5 4.5 h5 z" fill="currentColor" stroke="none" />
          <path d="M4 50 H116" />
        </svg>
        <span className="her-services">Restoration · Conservation · Commissions</span>
      </div>
    </div>
  );
}

export function DirectionArchitectural() {
  // owner-supplied portrait of the finished architectural page (27 Aug)
  return (
    <div className="comp comp-fire-shot" aria-hidden="true">
      <img src="/images/direction-arch-card.webp" alt="" loading="lazy" decoding="async" />
    </div>
  );
}

export function DirectionArchitecturalComp() {
  // retired from the card, kept for history — but corrected with the live
  // page on 27 Aug so no wrong claim can come back with it if it is restored
  return (
    <div className="comp comp-arch" aria-hidden="true">
      <div className="arch-bar">
        <span className="arch-mark"><i />Wrekin Forge</span>
        <span className="arch-cert">EN 1090-1 · EXC2 · UKCA</span>
      </div>
      <div className="arch-body">
        <div>
          <div className="arch-h">Balustrades, engineered to the millimetre.</div>
          <dl className="arch-specs">
            <div className="arch-spec"><dt>Material</dt><dd>S275, galvanised</dd></div>
            <div className="arch-spec"><dt>Finish</dt><dd>RAL 7016 powder</dd></div>
            <div className="arch-spec"><dt>Overall run</dt><dd>3 200 mm</dd></div>
            <div className="arch-spec"><dt>Fixing</dt><dd>M12 resin anchor</dd></div>
            <div className="arch-spec"><dt>Lead</dt><dd>6 weeks</dd></div>
          </dl>
        </div>
        {/* level guarding run: posts at 1 200 centres, handrail at 1 100 */}
        <svg className="arch-draw" viewBox="0 0 156 88" fill="none">
          <g stroke="#161B22">
            {/* floor line and posts */}
            <path d="M4 65 H150 M10 65 V20 M58.75 65 V20 M107.5 65 V20 M140 65 V20" strokeWidth="1.1" />
            {/* handrail and kick rail */}
            <path d="M10 20 H140 M10 57 H140" strokeWidth="1.5" />
            {/* infill at 110 mm centres */}
            <path d="M14.47 57 V20 M18.94 57 V20 M23.41 57 V20 M27.88 57 V20 M32.34 57 V20 M36.81 57 V20 M41.28 57 V20 M45.75 57 V20 M50.22 57 V20 M54.69 57 V20 M63.63 57 V20 M68.09 57 V20 M72.56 57 V20 M77.03 57 V20 M81.5 57 V20 M85.97 57 V20 M90.44 57 V20 M94.91 57 V20 M99.38 57 V20 M103.84 57 V20 M112.78 57 V20 M117.25 57 V20 M121.72 57 V20 M126.19 57 V20 M130.66 57 V20 M135.13 57 V20" strokeWidth="0.7" />
          </g>
          <g stroke="#29508F" strokeWidth="0.7">
            {/* overall run */}
            <path d="M10 76 H140 M10 73 V79 M140 73 V79 M10 66 V78 M140 66 V78" />
            {/* handrail height, one bay at post centres */}
            <path d="M147 20 V65 M144 20 H150 M144 65 H150 M10 10 H58.75 M10 7 V13 M58.75 7 V13 M10 19 V9 M58.75 19 V9" />
          </g>
          <g fill="#29508F" fontFamily="Martian Mono, ui-monospace, monospace" fontSize="5">
            <text x="75" y="84" textAnchor="middle">3200</text>
            <text x="34.4" y="5.4" textAnchor="middle" fontSize="4">1200 C/C</text>
            <text x="153" y="42.5" textAnchor="middle" fontSize="4" transform="rotate(90 153 42.5)">HANDRAIL 1100</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
