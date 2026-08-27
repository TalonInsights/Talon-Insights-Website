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
  return (
    <div className="comp comp-arch" aria-hidden="true">
      <div className="arch-bar">
        <span className="arch-mark"><i />Wrekin Forge</span>
        <span className="arch-cert">EN 1090 / CE</span>
      </div>
      <div className="arch-body">
        <div>
          <div className="arch-h">Balustrades, engineered to the millimetre.</div>
          <dl className="arch-specs">
            <div className="arch-spec"><dt>Finish</dt><dd>RAL 7016 powder</dd></div>
            <div className="arch-spec"><dt>Span</dt><dd>3 200 mm</dd></div>
            <div className="arch-spec"><dt>Fixing</dt><dd>M12 resin anchor</dd></div>
            <div className="arch-spec"><dt>Lead</dt><dd>6 weeks</dd></div>
          </dl>
        </div>
        {/* staircase balustrade elevation with dimension ticks */}
        <svg className="arch-draw" viewBox="0 0 150 108" fill="none">
          <g stroke="#161B22" strokeWidth="1.1">
            {/* stringer and treads */}
            <path d="M10 96 H50 V82 H82 V68 H114 V54 H140" />
            {/* balusters */}
            <path d="M22 96 V64 M38 96 V56 M54 82 V48 M70 82 V40 M86 68 V33 M102 68 V25 M118 54 V17 M132 54 V11" strokeWidth="0.9" />
            {/* handrail */}
            <path d="M14 70 L140 5" strokeWidth="1.6" />
          </g>
          <g stroke="#29508F" strokeWidth="0.7">
            {/* dimension line + ticks */}
            <path d="M10 103 H140" />
            <path d="M10 100 V106 M140 100 V106" />
            {/* rise annotation */}
            <path d="M146 54 V96" />
            <path d="M143 54 H149 M143 96 H149" />
          </g>
          <g fill="#29508F" fontFamily="Martian Mono, ui-monospace, monospace" fontSize="5">
            <text x="66" y="101" textAnchor="middle">3200</text>
            <text x="148" y="78" textAnchor="middle" transform="rotate(90 148 78)">RISE 900</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
